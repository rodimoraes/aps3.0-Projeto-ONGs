# backend/usuario.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
import mysql.connector
from dotenv import load_dotenv
import os

from auth import (
    gerar_hash_senha,
    verificar_senha,
    criar_token_acesso,
    obter_usuario_atual,
)

load_dotenv()

router = APIRouter(prefix="/usuarios", tags=["Usuários"])


def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
    )


# ============================================================
# Schemas
# ============================================================
class UsuarioSchema(BaseModel):
    nome: str
    cpf: str
    endereco: str
    estado_civil: str
    email: EmailStr
    senha: str
    data_nascimento: str
    celular: str
    voluntario: bool = False


class UsuarioUpdateSchema(BaseModel):
    nome: str
    cpf: str
    endereco: str
    estado_civil: str
    email: EmailStr
    data_nascimento: str
    celular: str
    voluntario: bool = False


class LoginSchema(BaseModel):
    email: EmailStr
    senha: str


class SenhaUpdateSchema(BaseModel):
    senha_atual: str
    senha_nova: str


# ============================================================
# Helper: valida a força da senha no backend
# (mesmos critérios usados no frontend: 8+, maiúsc, minúsc, número, especial)
# ============================================================
CARACTERES_ESPECIAIS = set("!@#$%^&*(),.?\":{}|<>_-+=;'/\\[]~`")


def senha_forte(senha: str) -> bool:
    if not senha or len(senha) < 8:
        return False
    if not any(c.isupper() for c in senha):
        return False
    if not any(c.islower() for c in senha):
        return False
    if not any(c.isdigit() for c in senha):
        return False
    if not any(c in CARACTERES_ESPECIAIS for c in senha):
        return False
    return True


# ============================================================
# CREATE — representante_ong sempre começa como FALSE
# ============================================================
@router.post("")
def cadastrar_usuario(usuario: UsuarioSchema):
    try:
        conexao = get_db_connection()
        cursor = conexao.cursor()

        senha_hash = gerar_hash_senha(usuario.senha)

        sql = """
            INSERT INTO usuario (
                nome, cpf, endereco, estado_civil,
                email, senha, data_nascimento, celular, voluntario, representante_ong
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        valores = (
            usuario.nome,
            usuario.cpf,
            usuario.endereco,
            usuario.estado_civil,
            usuario.email,
            senha_hash,
            usuario.data_nascimento,
            usuario.celular,
            usuario.voluntario,
            False,
        )

        cursor.execute(sql, valores)
        conexao.commit()
        novo_id = cursor.lastrowid

        cursor.close()
        conexao.close()

        return {
            "status": "sucesso",
            "mensagem": "Usuário cadastrado com sucesso!",
            "id": novo_id,
        }

    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")


# ============================================================
# LOGIN
# ============================================================
@router.post("/login")
def login(dados: LoginSchema):
    try:
        conexao = get_db_connection()
        cursor = conexao.cursor(dictionary=True)

        cursor.execute("SELECT * FROM usuario WHERE email = %s", (dados.email,))
        usuario = cursor.fetchone()

        cursor.close()
        conexao.close()

        if not usuario or not verificar_senha(dados.senha, usuario["senha"]):
            raise HTTPException(status_code=400, detail="E-mail ou senha incorretos.")

        token = criar_token_acesso(
            data={
                "sub": usuario["email"],
                "id_usuario": usuario["id_usuario"],
            }
        )

        return {
            "status": "sucesso",
            "access_token": token,
            "token_type": "bearer",
            "usuario": {
                "id_usuario": usuario["id_usuario"],
                "nome": usuario["nome"],
                "email": usuario["email"],
                "voluntario": bool(usuario["voluntario"]),
                "representante_ong": bool(usuario["representante_ong"]),
            },
        }
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")


# ============================================================
# Rota protegida de teste
# ============================================================
@router.get("/me")
def perfil_usuario_logado(usuario_atual: dict = Depends(obter_usuario_atual)):
    return usuario_atual


# ============================================================
# READ ALL
# ============================================================
@router.get("")
def listar_usuarios():
    try:
        conexao = get_db_connection()
        cursor = conexao.cursor(dictionary=True)
        cursor.execute("""
            SELECT id_usuario, nome, cpf, endereco, estado_civil, email,
                   data_nascimento, celular, voluntario, representante_ong
            FROM usuario
        """)
        usuarios = cursor.fetchall()

        for u in usuarios:
            if u.get("data_nascimento"):
                u["data_nascimento"] = str(u["data_nascimento"])

        cursor.close()
        conexao.close()
        return usuarios
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")


# ============================================================
# READ ONE
# ============================================================
@router.get("/{id_usuario}")
def buscar_usuario(id_usuario: int):
    try:
        conexao = get_db_connection()
        cursor = conexao.cursor(dictionary=True)
        cursor.execute("""
            SELECT id_usuario, nome, cpf, endereco, estado_civil, email,
                   data_nascimento, celular, voluntario, representante_ong
            FROM usuario WHERE id_usuario = %s
        """, (id_usuario,))
        usuario = cursor.fetchone()

        cursor.close()
        conexao.close()

        if not usuario:
            raise HTTPException(status_code=404, detail="Usuário não encontrado.")

        if usuario.get("data_nascimento"):
            usuario["data_nascimento"] = str(usuario["data_nascimento"])

        return usuario
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")


# ============================================================
# UPDATE — dados cadastrais (representante_ong NÃO é alterável)
# ============================================================
@router.put("/{id_usuario}")
def atualizar_usuario(id_usuario: int, usuario: UsuarioUpdateSchema):
    try:
        conexao = get_db_connection()
        cursor = conexao.cursor(dictionary=True)

        # 1) Verifica se o usuário existe PRIMEIRO
        cursor.execute(
            "SELECT id_usuario FROM usuario WHERE id_usuario = %s",
            (id_usuario,),
        )
        if not cursor.fetchone():
            cursor.close()
            conexao.close()
            raise HTTPException(status_code=404, detail="Usuário não encontrado.")

        cursor.close()

        # 2) Executa o UPDATE
        cursor = conexao.cursor()
        sql = """
            UPDATE usuario SET
                nome=%s, cpf=%s, endereco=%s, estado_civil=%s,
                email=%s, data_nascimento=%s, celular=%s,
                voluntario=%s
            WHERE id_usuario=%s
        """
        valores = (
            usuario.nome,
            usuario.cpf,
            usuario.endereco,
            usuario.estado_civil,
            usuario.email,
            usuario.data_nascimento,
            usuario.celular,
            usuario.voluntario,
            id_usuario,
        )

        cursor.execute(sql, valores)
        conexao.commit()
        cursor.close()
        conexao.close()

        return {"status": "sucesso", "mensagem": "Usuário atualizado com sucesso!"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")


# ============================================================
# ALTERAR SENHA — exige login do próprio usuário e senha atual
# ============================================================
@router.put("/{id_usuario}/senha")
def alterar_senha(
    id_usuario: int,
    dados: SenhaUpdateSchema,
    usuario_atual: dict = Depends(obter_usuario_atual),
):
    # 1) Só pode trocar a própria senha
    if usuario_atual["id_usuario"] != id_usuario:
        raise HTTPException(
            status_code=403,
            detail="Você só pode alterar a sua própria senha.",
        )

    # 2) Valida força da senha nova
    if not senha_forte(dados.senha_nova):
        raise HTTPException(
            status_code=400,
            detail=(
                "A nova senha não atende aos requisitos mínimos: "
                "mínimo 8 caracteres, uma maiúscula, uma minúscula, "
                "um número e um caractere especial."
            ),
        )

    try:
        conexao = get_db_connection()
        cursor = conexao.cursor(dictionary=True)

        cursor.execute(
            "SELECT senha FROM usuario WHERE id_usuario = %s",
            (id_usuario,),
        )
        registro = cursor.fetchone()

        if not registro:
            cursor.close()
            conexao.close()
            raise HTTPException(status_code=404, detail="Usuário não encontrado.")

        # 3) Verifica a senha atual
        if not verificar_senha(dados.senha_atual, registro["senha"]):
            cursor.close()
            conexao.close()
            raise HTTPException(status_code=400, detail="Senha atual incorreta.")

        # 4) Gera o novo hash e salva
        novo_hash = gerar_hash_senha(dados.senha_nova)

        cursor.close()
        cursor = conexao.cursor()
        cursor.execute(
            "UPDATE usuario SET senha = %s WHERE id_usuario = %s",
            (novo_hash, id_usuario),
        )
        conexao.commit()
        cursor.close()
        conexao.close()

        return {
            "status": "sucesso",
            "mensagem": "Senha alterada com sucesso!",
        }

    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")


# ============================================================
# DELETE
# ============================================================
@router.delete("/{id_usuario}")
def deletar_usuario(id_usuario: int):
    try:
        conexao = get_db_connection()
        cursor = conexao.cursor()

        cursor.execute("DELETE FROM usuario WHERE id_usuario = %s", (id_usuario,))
        conexao.commit()
        afetadas = cursor.rowcount

        cursor.close()
        conexao.close()

        if afetadas == 0:
            raise HTTPException(status_code=404, detail="Usuário não encontrado.")

        return {"status": "sucesso", "mensagem": "Usuário removido com sucesso!"}
    except mysql.connector.Error as err:
        if err.errno == 1451:
            raise HTTPException(
                status_code=409,
                detail="Não é possível excluir: usuário está vinculado a uma ONG.",
            )
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")