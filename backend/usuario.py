# backend/usuario.py
from datetime import date
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr, field_validator
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
# Helpers
# ============================================================
def calcular_idade(data_nasc: date) -> int:
    hoje = date.today()
    return hoje.year - data_nasc.year - (
        (hoje.month, hoje.day) < (data_nasc.month, data_nasc.day)
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
    data_nascimento: date
    celular: str
    voluntario: bool = False

    @field_validator("data_nascimento")
    @classmethod
    def validar_maioridade(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("Data de nascimento não pode ser no futuro.")
        if calcular_idade(v) < 18:
            raise ValueError("É necessário ter 18 anos ou mais para se cadastrar.")
        return v


class UsuarioUpdateSchema(BaseModel):
    nome: str
    cpf: str
    endereco: str
    estado_civil: str
    email: EmailStr
    data_nascimento: date
    celular: str
    voluntario: bool = False

    @field_validator("data_nascimento")
    @classmethod
    def validar_maioridade(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("Data de nascimento não pode ser no futuro.")
        if calcular_idade(v) < 18:
            raise ValueError("É necessário ter 18 anos ou mais.")
        return v


class LoginSchema(BaseModel):
    email: EmailStr
    senha: str


class SenhaUpdateSchema(BaseModel):
    senha_atual: str
    senha_nova: str


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
# CREATE — público (cadastro)
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
        if err.errno == 1062:
            raise HTTPException(
                status_code=400,
                detail="CPF, e-mail ou celular já cadastrado.",
            )
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
            data={"sub": usuario["email"], "id_usuario": usuario["id_usuario"]}
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
# /me
# ============================================================
@router.get("/me")
def perfil_usuario_logado(usuario_atual: dict = Depends(obter_usuario_atual)):
    return usuario_atual


# ============================================================
# READ ALL — RNF 02: só o próprio usuário
# ============================================================
@router.get("")
def listar_usuarios(usuario_atual: dict = Depends(obter_usuario_atual)):
    try:
        conexao = get_db_connection()
        cursor = conexao.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT id_usuario, nome, cpf, endereco, estado_civil, email,
                   data_nascimento, celular, voluntario, representante_ong
            FROM usuario WHERE id_usuario = %s
            """,
            (usuario_atual["id_usuario"],),
        )
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
# READ ONE — RNF 02: só o próprio usuário
# ============================================================
@router.get("/{id_usuario}")
def buscar_usuario(
    id_usuario: int,
    usuario_atual: dict = Depends(obter_usuario_atual),
):
    if usuario_atual["id_usuario"] != id_usuario:
        raise HTTPException(
            status_code=403,
            detail="Você só pode acessar os seus próprios dados.",
        )

    try:
        conexao = get_db_connection()
        cursor = conexao.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT id_usuario, nome, cpf, endereco, estado_civil, email,
                   data_nascimento, celular, voluntario, representante_ong
            FROM usuario WHERE id_usuario = %s
            """,
            (id_usuario,),
        )
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
# UPDATE — RNF 02: só o próprio usuário
# ============================================================
@router.put("/{id_usuario}")
def atualizar_usuario(
    id_usuario: int,
    usuario: UsuarioUpdateSchema,
    usuario_atual: dict = Depends(obter_usuario_atual),
):
    if usuario_atual["id_usuario"] != id_usuario:
        raise HTTPException(
            status_code=403,
            detail="Você só pode editar os seus próprios dados.",
        )

    try:
        conexao = get_db_connection()
        cursor = conexao.cursor(dictionary=True)

        cursor.execute(
            "SELECT id_usuario FROM usuario WHERE id_usuario = %s",
            (id_usuario,),
        )
        if not cursor.fetchone():
            cursor.close()
            conexao.close()
            raise HTTPException(status_code=404, detail="Usuário não encontrado.")

        cursor.close()

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
        if err.errno == 1062:
            raise HTTPException(
                status_code=400,
                detail="CPF, e-mail ou celular já cadastrado por outro usuário.",
            )
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")


# ============================================================
# ALTERAR SENHA
# ============================================================
@router.put("/{id_usuario}/senha")
def alterar_senha(
    id_usuario: int,
    dados: SenhaUpdateSchema,
    usuario_atual: dict = Depends(obter_usuario_atual),
):
    if usuario_atual["id_usuario"] != id_usuario:
        raise HTTPException(
            status_code=403,
            detail="Você só pode alterar a sua própria senha.",
        )

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
            "SELECT senha FROM usuario WHERE id_usuario = %s", (id_usuario,)
        )
        registro = cursor.fetchone()

        if not registro:
            cursor.close()
            conexao.close()
            raise HTTPException(status_code=404, detail="Usuário não encontrado.")

        if not verificar_senha(dados.senha_atual, registro["senha"]):
            cursor.close()
            conexao.close()
            raise HTTPException(status_code=400, detail="Senha atual incorreta.")

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

        return {"status": "sucesso", "mensagem": "Senha alterada com sucesso!"}

    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")


# ============================================================
# DELETE — RNF 02: só o próprio usuário
# ============================================================
@router.delete("/{id_usuario}")
def deletar_usuario(
    id_usuario: int,
    usuario_atual: dict = Depends(obter_usuario_atual),
):
    if usuario_atual["id_usuario"] != id_usuario:
        raise HTTPException(
            status_code=403,
            detail="Você só pode excluir a sua própria conta.",
        )

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