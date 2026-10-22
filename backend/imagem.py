import os
from datetime import date
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/imagens", tags=["Imagens"])


# Conexão direta com o banco de dados
def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", "123456"),
        database=os.getenv("DB_NAME", "bd_encontreong"),
    )


# Schema de validação com Pydantic adaptado à nova tabela
class ImagemSchema(BaseModel):
    id_ong: Optional[int] = None
    id_campanha: Optional[int] = None
    descricao: str
    url: str


# 1. CREATE - Cadastrar link de imagem (pode ser atrelado a ONG e/ou Campanha)
@router.post("")
def cadastrar_imagem(imagem: ImagemSchema):
    try:
        conexao = get_db_connection()
        cursor = conexao.cursor()
        sql = """
        INSERT INTO imagem (id_ong, id_campanha, descricao, url)
        VALUES (%s, %s, %s, %s)
        """
        valores = (imagem.id_ong, imagem.id_campanha, imagem.descricao, imagem.url)
        cursor.execute(sql, valores)
        conexao.commit()
        novo_id = cursor.lastrowid
        cursor.close()
        conexao.close()
        return {
            "status": "sucesso",
            "mensagem": "Imagem vinculada com sucesso!",
            "id": novo_id,
        }
    except mysql.connector.Error as err:
        # Trata o erro de URL duplicada (UNIQUE key)
        if err.errno == 1062:
            raise HTTPException(
                status_code=400,
                detail="Esta URL de imagem já está cadastrada.",
            )
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")


# 2. READ - Listar todas as imagens de UMA ONG ESPECÍFICA
@router.get("/ong/{id_ong}")
def listar_imagens_por_ong(id_ong: int):
    try:
        conexao = get_db_connection()
        cursor = conexao.cursor(dictionary=True)
        sql = "SELECT * FROM imagem WHERE id_ong = %s ORDER BY id_img DESC"
        cursor.execute(sql, (id_ong,))
        imagens = cursor.fetchall()
        cursor.close()
        conexao.close()
        return imagens
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")


# 3. READ - Listar todas as imagens de UMA CAMPANHA ESPECÍFICA
@router.get("/campanha/{id_campanha}")
def listar_imagens_por_campanha(id_campanha: int):
    try:
        conexao = get_db_connection()
        cursor = conexao.cursor(dictionary=True)
        sql = "SELECT * FROM imagem WHERE id_campanha = %s ORDER BY id_img DESC"
        cursor.execute(sql, (id_campanha,))
        imagens = cursor.fetchall()
        cursor.close()
        conexao.close()
        return imagens
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")


# 4. DELETE - Excluir uma imagem pelo id_img
@router.delete("/{id_img}")
def deletar_imagem(id_img: int):
    try:
        conexao = get_db_connection()
        cursor = conexao.cursor()
        sql = "DELETE FROM imagem WHERE id_img = %s"
        cursor.execute(sql, (id_img,))
        conexao.commit()
        linhas_afetadas = cursor.rowcount
        cursor.close()
        conexao.close()
        if linhas_afetadas == 0:
            raise HTTPException(status_code=404, detail="Imagem não encontrada")
        return {"status": "sucesso", "mensagem": "Imagem removida com sucesso!"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")