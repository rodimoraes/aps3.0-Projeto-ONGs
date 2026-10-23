import os
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/ongs", tags=["ONGs"])


def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
    )


class OngSchema(BaseModel):
    nome: str
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    id_usuario_representante: int
    id_categoria: int
    telefone: str
    endereco: str
    denominacao_social: str
    sigla: Optional[str] = None
    objetivo_social_finalidade: str
    RCPJ: str
    CNAE: str
    inscricao_municipal: str
    como_ajudar: Optional[str] = None


@router.post("")
def cadastrar_ong(ong: OngSchema):
    try:
        conexao = get_db_connection()
        cursor = conexao.cursor()
        sql = """
        INSERT INTO ong (
            nome, logo_url, banner_url, id_usuario_representante, id_categoria,
            telefone, endereco, denominacao_social, sigla,
            objetivo_social_finalidade, RCPJ, CNAE, inscricao_municipal, como_ajudar
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        valores = (
            ong.nome,
            ong.logo_url,
            ong.banner_url,
            ong.id_usuario_representante,
            ong.id_categoria,
            ong.telefone,
            ong.endereco,
            ong.denominacao_social,
            ong.sigla,
            ong.objetivo_social_finalidade,
            ong.RCPJ,
            ong.CNAE,
            ong.inscricao_municipal,
            ong.como_ajudar,
        )
        cursor.execute(sql, valores)
        conexao.commit()
        novo_id = cursor.lastrowid
        cursor.close()
        conexao.close()
        return {
            "status": "sucesso",
            "mensagem": "ONG cadastrada com sucesso!",
            "id": novo_id,
        }
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")


@router.get("")
def listar_ongs():
    try:
        conexao = get_db_connection()
        cursor = conexao.cursor(dictionary=True)
        cursor.execute("SELECT * FROM ong ORDER BY id_ong DESC")
        ongs = cursor.fetchall()
        cursor.close()
        conexao.close()
        return ongs
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")


@router.get("/{id_ong}")
def buscar_ong(id_ong: int):
    try:
        conexao = get_db_connection()
        cursor = conexao.cursor(dictionary=True)
        cursor.execute("SELECT * FROM ong WHERE id_ong = %s", (id_ong,))
        ong = cursor.fetchone()
        cursor.close()
        conexao.close()
        if not ong:
            raise HTTPException(status_code=404, detail="ONG não encontrada")
        return ong
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")


@router.put("/{id_ong}")
def atualizar_ong(id_ong: int, ong: OngSchema):
    try:
        conexao = get_db_connection()
        cursor = conexao.cursor()
        sql = """
        UPDATE ong SET
            nome = %s,
            logo_url = %s,
            banner_url = %s,
            id_usuario_representante = %s,
            id_categoria = %s,
            telefone = %s,
            endereco = %s,
            denominacao_social = %s,
            sigla = %s,
            objetivo_social_finalidade = %s,
            RCPJ = %s,
            CNAE = %s,
            inscricao_municipal = %s,
            como_ajudar = %s
        WHERE id_ong = %s
        """
        valores = (
            ong.nome,
            ong.logo_url,
            ong.banner_url,
            ong.id_usuario_representante,
            ong.id_categoria,
            ong.telefone,
            ong.endereco,
            ong.denominacao_social,
            ong.sigla,
            ong.objetivo_social_finalidade,
            ong.RCPJ,
            ong.CNAE,
            ong.inscricao_municipal,
            ong.como_ajudar,
            id_ong,
        )
        cursor.execute(sql, valores)
        conexao.commit()
        linhas_afetadas = cursor.rowcount
        cursor.close()
        conexao.close()
        if linhas_afetadas == 0:
            raise HTTPException(status_code=404, detail="ONG não encontrada")
        return {"status": "sucesso", "mensagem": "ONG atualizada com sucesso!"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")


@router.delete("/{id_ong}")
def deletar_ong(id_ong: int):
    try:
        conexao = get_db_connection()
        cursor = conexao.cursor()
        sql = "DELETE FROM ong WHERE id_ong = %s"
        cursor.execute(sql, (id_ong,))
        conexao.commit()
        linhas_afetadas = cursor.rowcount
        cursor.close()
        conexao.close()
        if linhas_afetadas == 0:
            raise HTTPException(status_code=404, detail="ONG não encontrada")
        return {"status": "sucesso", "mensagem": "ONG removida com sucesso!"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")

