import os
from datetime import date
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/campanhas", tags=["Campanhas"])


# Conexão com o banco de dados MySQL
def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
    )


# Schema de validação dos dados da Campanha com Pydantic
class CampanhaSchema(BaseModel):
    id_ong: int
    titulo: str
    descricao: str
    data_inicio: date
    data_fim: Optional[date] = None
    meta_arrecadacao: Optional[float] = 0.0
    valor_arrecadado: Optional[float] = 0.0
    status: Optional[str] = "ativa"


# 1. CREATE - Cadastrar nova campanha atrelada a uma ONG
@router.post("")
def cadastrar_campanha(campanha: CampanhaSchema):
    try:
        conexao = get_db_connection()
        cursor = conexao.cursor()
        sql = """
        INSERT INTO campanha (
            id_ong, titulo, descricao, data_inicio,
            data_fim, meta_arrecadacao, valor_arrecadado, status
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        valores = (
            campanha.id_ong,
            campanha.titulo,
            campanha.descricao,
            campanha.data_inicio,
            campanha.data_fim,
            campanha.meta_arrecadacao,
            campanha.valor_arrecadado,
            campanha.status,
        )
        cursor.execute(sql, valores)
        conexao.commit()
        novo_id = cursor.lastrowid
        cursor.close()
        conexao.close()
        return {
            "status": "sucesso",
            "mensagem": "Campanha cadastrada com sucesso!",
            "id": novo_id,
        }
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")


# 2. READ - Listar todas as campanhas de UMA ONG ESPECÍFICA
@router.get("/ong/{id_ong}")
def listar_campanhas_por_ong(id_ong: int):
    try:
        conexao = get_db_connection()
        cursor = conexao.cursor(dictionary=True)
        sql = "SELECT * FROM campanha WHERE id_ong = %s ORDER BY id_campanha DESC"
        cursor.execute(sql, (id_ong,))
        campanhas = cursor.fetchall()
        cursor.close()
        conexao.close()
        return campanhas
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")


# 3. READ - Buscar detalhes de uma campanha específica
@router.get("/{id_campanha}")
def buscar_campanha(id_campanha: int):
    try:
        conexao = get_db_connection()
        cursor = conexao.cursor(dictionary=True)
        sql = "SELECT * FROM campanha WHERE id_campanha = %s"
        cursor.execute(sql, (id_campanha,))
        campanha = cursor.fetchone()
        cursor.close()
        conexao.close()
        if not campanha:
            raise HTTPException(status_code=404, detail="Campanha não encontrada")
        return campanha
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")


# 4. UPDATE - Atualizar dados da campanha
@router.put("/{id_campanha}")
def atualizar_campanha(id_campanha: int, campanha: CampanhaSchema):
    try:
        conexao = get_db_connection()
        cursor = conexao.cursor()
        sql = """
        UPDATE campanha SET
            titulo = %s,
            descricao = %s,
            data_inicio = %s,
            data_fim = %s,
            meta_arrecadacao = %s,
            valor_arrecadado = %s,
            status = %s
        WHERE id_campanha = %s
        """
        valores = (
            campanha.titulo,
            campanha.descricao,
            campanha.data_inicio,
            campanha.data_fim,
            campanha.meta_arrecadacao,
            campanha.valor_arrecadado,
            campanha.status,
            id_campanha,
        )
        cursor.execute(sql, valores)
        conexao.commit()
        if cursor.rowcount == 0:
            cursor.close()
            conexao.close()
            raise HTTPException(status_code=404, detail="Campanha não encontrada")
        cursor.close()
        conexao.close()
        return {"status": "sucesso", "mensagem": "Campanha atualizada com sucesso!"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")


# 5. DELETE - Excluir uma campanha
@router.delete("/{id_campanha}")
def deletar_campanha(id_campanha: int):
    try:
        conexao = get_db_connection()
        cursor = conexao.cursor()
        sql = "DELETE FROM campanha WHERE id_campanha = %s"
        cursor.execute(sql, (id_campanha,))
        conexao.commit()
        linhas_afetadas = cursor.rowcount
        cursor.close()
        conexao.close()
        if linhas_afetadas == 0:
            raise HTTPException(status_code=404, detail="Campanha não encontrada")
        return {"status": "sucesso", "mensagem": "Campanha removida com sucesso!"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")