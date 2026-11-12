import os
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import mysql.connector
from dotenv import load_dotenv

from auth import obter_usuario_atual

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


# ============================================================
# CREATE — requer login. Agora permite MULTIPLAS ONGs por usuário.
# ============================================================
@router.post("")
def cadastrar_ong(ong: OngSchema, usuario_atual: dict = Depends(obter_usuario_atual)):
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
            usuario_atual["id_usuario"],
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
        novo_id = cursor.lastrowid

        # Marca o usuário como representante (possui pelo menos uma ONG)
        cursor.execute(
            "UPDATE usuario SET representante_ong = TRUE WHERE id_usuario = %s",
            (usuario_atual["id_usuario"],)
        )

        conexao.commit()
        cursor.close()
        conexao.close()
        return {
            "status": "sucesso",
            "mensagem": "ONG cadastrada com sucesso!",
            "id": novo_id,
        }
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")


# ============================================================
# READ — público (qualquer pessoa pode listar/ver)
# ============================================================
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


# ============================================================
# UPDATE — só o representante da própria ONG pode editar
# ============================================================
@router.put("/{id_ong}")
def atualizar_ong(id_ong: int, ong: OngSchema, usuario_atual: dict = Depends(obter_usuario_atual)):
    try:
        conexao = get_db_connection()
        cursor = conexao.cursor(dictionary=True)

        cursor.execute(
            "SELECT id_usuario_representante FROM ong WHERE id_ong = %s",
            (id_ong,)
        )
        ong_data = cursor.fetchone()

        if not ong_data:
            cursor.close()
            conexao.close()
            raise HTTPException(status_code=404, detail="ONG não encontrada")

        if ong_data["id_usuario_representante"] != usuario_atual["id_usuario"]:
            cursor.close()
            conexao.close()
            raise HTTPException(
                status_code=403,
                detail="Você não tem permissão para editar esta ONG."
            )

        cursor.close()
        cursor = conexao.cursor()

        sql = """
        UPDATE ong SET
            nome = %s,
            logo_url = %s,
            banner_url = %s,
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
        cursor.close()
        conexao.close()
        return {"status": "sucesso", "mensagem": "ONG atualizada com sucesso!"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")


# ============================================================
# DELETE — só o representante da própria ONG pode excluir
# ============================================================
@router.delete("/{id_ong}")
def deletar_ong(id_ong: int, usuario_atual: dict = Depends(obter_usuario_atual)):
    try:
        conexao = get_db_connection()
        cursor = conexao.cursor(dictionary=True)

        cursor.execute(
            "SELECT id_usuario_representante FROM ong WHERE id_ong = %s",
            (id_ong,)
        )
        ong_data = cursor.fetchone()

        if not ong_data:
            cursor.close()
            conexao.close()
            raise HTTPException(status_code=404, detail="ONG não encontrada")

        if ong_data["id_usuario_representante"] != usuario_atual["id_usuario"]:
            cursor.close()
            conexao.close()
            raise HTTPException(
                status_code=403,
                detail="Você não tem permissão para excluir esta ONG."
            )

        cursor.close()
        cursor = conexao.cursor()

        cursor.execute("DELETE FROM ong WHERE id_ong = %s", (id_ong,))

        # Verifica se o usuário ainda tem outras ONGs. Se não tiver, desmarca.
        cursor.execute(
            "SELECT COUNT(*) as total FROM ong WHERE id_usuario_representante = %s",
            (usuario_atual["id_usuario"],)
        )
        restantes = cursor.fetchone()[0]
        if restantes == 0:
            cursor.execute(
                "UPDATE usuario SET representante_ong = FALSE WHERE id_usuario = %s",
                (usuario_atual["id_usuario"],)
            )

        conexao.commit()
        cursor.close()
        conexao.close()
        return {"status": "sucesso", "mensagem": "ONG removida com sucesso!"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")