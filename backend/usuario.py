# backend/usuario.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

# Em vez de app = FastAPI(), usamos APIRouter:
router = APIRouter(
    prefix="/usuarios",
    tags=["Usuários"]
)

def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', '1234'),
        database=os.getenv('DB_NAME', 'bd_encontreong')
    )

class CriarUsuario(BaseModel):
    nome: str
    cpf: str
    endereco: str
    estado_civil: str
    rg: str
    email: str
    data_nascimento: str
    voluntario: str
    celular: str
    representante_ong: str


@router.post("")
def cadastrar_usuario(usuario: CriarUsuario):
    try:
        conexao = get_db_connection()
        cursor = conexao.cursor()

        sql = """
            INSERT INTO usuario (
                nome, cpf, endereco, estado_civil, rg, 
                email, data_nascimento, voluntario, celular, representante_ong
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        valores = (
            usuario.nome, usuario.cpf, usuario.endereco, usuario.estado_civil,
            usuario.rg, usuario.email, usuario.data_nascimento,
            usuario.voluntario, usuario.celular, usuario.representante_ong
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