# backend/usuario.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
import mysql.connector
from dotenv import load_dotenv
import os

from auth import gerar_hash_senha, verificar_senha, criar_token_acesso, obter_usuario_atual

load_dotenv()

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuários"]
)

def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', 'Mateus1412@'),
        database=os.getenv('DB_NAME', 'bd_encontreong')
    )


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
    representante_ong: bool = False


# Schema separado para UPDATE (não exige senha — evita 422 no editarUsuario.jsx)
class UsuarioUpdateSchema(BaseModel):
    nome: str
    cpf: str
    endereco: str
    estado_civil: str
    email: EmailStr
    data_nascimento: str
    celular: str
    voluntario: bool = False
    representante_ong: bool = False


class LoginSchema(BaseModel):
    email: EmailStr
    senha: str


# ============================================================
# 1. C - CREATE (com hash de senha)
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
            usuario.representante_ong
        )

        cursor.execute(sql, valores)
        conexao.commit()
        novo_id = cursor.lastrowid

        cursor.close()
        conexao.close()

        return {
            "status": "sucesso",
            "mensagem": "Usuário cadastrado com sucesso!",
            "id": novo_id
        }

    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")


# ============================================================
# Login (Autenticação)
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

        token = criar_token_acesso(data={"sub": usuario["email"], "id_usuario": usuario["id_usuario"]})

        return {
            "status": "sucesso",
            "access_token": token,
            "token_type": "bearer",
            "usuario": {
                "id_usuario": usuario["id_usuario"],
                "nome": usuario["nome"],
                "email": usuario["email"],
                "representante_ong": bool(usuario["representante_ong"])
            }
        }
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")


# ============================================================
# Rota protegida de teste (perfil logado)
# ============================================================
@router.get("/me")
def perfil_usuario_logado(usuario_atual: dict = Depends(obter_usuario_atual)):
    return usuario_atual


# ============================================================
# 2. R - READ ALL
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
# 3. R - READ ONE
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
# 4. U - UPDATE
# ============================================================
@router.put("/{id_usuario}")
def atualizar_usuario(id_usuario: int, usuario: UsuarioUpdateSchema):
    try:
        conexao = get_db_connection()
        cursor = conexao.cursor()

        sql = """
            UPDATE usuario SET
                nome=%s, cpf=%s, endereco=%s, estado_civil=%s,
                email=%s, data_nascimento=%s, celular=%s,
                voluntario=%s, representante_ong=%s
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
            usuario.representante_ong,
            id_usuario
        )

        cursor.execute(sql, valores)
        conexao.commit()
        afetadas = cursor.rowcount

        cursor.close()
        conexao.close()

        if afetadas == 0:
            raise HTTPException(status_code=404, detail="Usuário não encontrado.")

        return {"status": "sucesso", "mensagem": "Usuário atualizado com sucesso!"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")


# ============================================================
# 5. D - DELETE
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
                detail="Não é possível excluir: usuário está vinculado a uma ONG."
            )
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")