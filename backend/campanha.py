import os
from datetime import date
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, model_validator
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/campanhas", tags=["Campanhas"])


def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", "123456"),
        database=os.getenv("DB_NAME", "bd_encontreong"),
    )


# Schema Pydantic atualizado com id_tipo_campanha + validação de datas
class CampanhaSchema(BaseModel):
    id_ong: int
    id_tipo_campanha: int
    titulo: str
    descricao: str
    data_inicio: date
    data_fim: Optional[date] = None
    meta_arrecadacao: Optional[float] = 0.0
    valor_arrecadado: Optional[float] = 0.0
    status: Optional[str] = "ativa"

    @model_validator(mode="after")
    def _validar_datas(self):
        if self.data_fim is not None and self.data_fim < self.data_inicio:
            raise ValueError(
                "A data de fim não pode ser anterior à data de início."
            )
        return self


class InscricaoVoluntarioSchema(BaseModel):
    id_usuario: int


# 1. CREATE - Cadastrar nova campanha
@router.post("")
def cadastrar_campanha(campanha: CampanhaSchema):
    try:
        conexao = get_db_connection()
        cursor = conexao.cursor()
        sql = """
        INSERT INTO campanha (
            id_ong, id_tipo_campanha, titulo, descricao, data_inicio,
            data_fim, meta_arrecadacao, valor_arrecadado, status
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        valores = (
            campanha.id_ong,
            campanha.id_tipo_campanha,
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
        sql = """
        SELECT c.*, t.nome as tipo_nome,
               (SELECT COUNT(*) FROM voluntario_campanha v WHERE v.id_campanha = c.id_campanha) AS total_voluntarios
        FROM campanha c
        LEFT JOIN tipo_campanha t ON c.id_tipo_campanha = t.id_tipo_campanha
        WHERE c.id_ong = %s
        ORDER BY c.id_campanha DESC
        """
        cursor.execute(sql, (id_ong,))
        campanhas = cursor.fetchall()
        cursor.close()
        conexao.close()
        return campanhas
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")


# 3. READ - Buscar detalhes de UMA campanha específica
@router.get("/{id_campanha}")
def buscar_campanha(id_campanha: int):
    try:
        conexao = get_db_connection()
        cursor = conexao.cursor(dictionary=True)
        sql = """
        SELECT c.*, t.nome as tipo_nome
        FROM campanha c
        LEFT JOIN tipo_campanha t ON c.id_tipo_campanha = t.id_tipo_campanha
        WHERE c.id_campanha = %s
        """
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
            id_tipo_campanha = %s,
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
            campanha.id_tipo_campanha,
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


# 6. INSCRIÇÃO - Inscrever voluntário na campanha
@router.post("/{id_campanha}/inscrever")
def inscrever_voluntario(id_campanha: int, dados: InscricaoVoluntarioSchema):
    try:
        conexao = get_db_connection()
        cursor = conexao.cursor()
        sql = """
        INSERT INTO voluntario_campanha (id_usuario, id_campanha, status)
        VALUES (%s, %s, 'inscrito')
        """
        cursor.execute(sql, (dados.id_usuario, id_campanha))
        conexao.commit()
        cursor.close()
        conexao.close()
        return {"status": "sucesso", "mensagem": "Inscrição realizada com sucesso!"}
    except mysql.connector.Error as err:
        if err.errno == 1062:
            raise HTTPException(
                status_code=400,
                detail="Você já está inscrito nesta campanha."
            )
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")


# 7. VERIFICAR INSCRIÇÃO
@router.get("/{id_campanha}/inscricao/{id_usuario}")
def verificar_inscricao(id_campanha: int, id_usuario: int):
    try:
        conexao = get_db_connection()
        cursor = conexao.cursor(dictionary=True)
        sql = "SELECT * FROM voluntario_campanha WHERE id_campanha = %s AND id_usuario = %s"
        cursor.execute(sql, (id_campanha, id_usuario))
        inscricao = cursor.fetchone()
        cursor.close()
        conexao.close()
        return {"inscrito": bool(inscricao), "dados": inscricao}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")


# 8. LISTAR VOLUNTÁRIOS DA CAMPANHA
@router.get("/{id_campanha}/voluntarios")
def listar_voluntarios_campanha(id_campanha: int):
    try:
        conexao = get_db_connection()
        cursor = conexao.cursor(dictionary=True)
        sql = """
        SELECT
            v.id_voluntario_campanha,
            v.data_inscricao,
            v.status,
            u.id_usuario,
            u.nome,
            u.email,
            u.celular
        FROM voluntario_campanha v
        INNER JOIN usuario u ON v.id_usuario = u.id_usuario
        WHERE v.id_campanha = %s
        ORDER BY v.data_inscricao DESC
        """
        cursor.execute(sql, (id_campanha,))
        voluntarios = cursor.fetchall()
        cursor.close()
        conexao.close()
        return voluntarios
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")


# 9. DASHBOARD DA ONG
@router.get("/ong/{id_ong}/dashboard")
def buscar_dashboard_ong(id_ong: int):
    try:
        conexao = get_db_connection()
        cursor = conexao.cursor(dictionary=True)

        sql = """
        SELECT
            c.id_campanha,
            c.titulo,
            c.id_tipo_campanha,
            t.nome AS tipo_nome,
            c.meta_arrecadacao,
            c.valor_arrecadado,
            c.status,
            c.data_inicio,
            c.data_fim,
            (SELECT COUNT(*) FROM voluntario_campanha v WHERE v.id_campanha = c.id_campanha) AS total_voluntarios
        FROM campanha c
        LEFT JOIN tipo_campanha t ON c.id_tipo_campanha = t.id_tipo_campanha
        WHERE c.id_ong = %s
        ORDER BY c.id_campanha DESC
        """
        cursor.execute(sql, (id_ong,))
        campanhas = cursor.fetchall()
        cursor.close()
        conexao.close()

        total_campanhas = len(campanhas)
        ativas = sum(1 for c in campanhas if c["status"] == "ativa")
        encerradas = sum(1 for c in campanhas if c["status"] in ["concluida", "cancelada"])

        arrecadacao = [c for c in campanhas if c["id_tipo_campanha"] == 1]
        voluntariado = [c for c in campanhas if c["id_tipo_campanha"] == 2]

        meta_financeira_total = sum(float(c["meta_arrecadacao"] or 0) for c in arrecadacao)
        total_arrecadado = sum(float(c["valor_arrecadado"] or 0) for c in arrecadacao)
        meta_voluntarios_total = sum(int(c["meta_arrecadacao"] or 0) for c in voluntariado)
        total_voluntarios_inscritos = sum(int(c["total_voluntarios"] or 0) for c in voluntariado)

        return {
            "resumo": {
                "total_campanhas": total_campanhas,
                "ativas": ativas,
                "encerradas": encerradas,
                "total_arrecadacao": len(arrecadacao),
                "total_voluntariado": len(voluntariado),
                "meta_financeira_total": meta_financeira_total,
                "total_arrecadado": total_arrecadado,
                "meta_voluntarios_total": meta_voluntarios_total,
                "total_voluntarios_inscritos": total_voluntarios_inscritos,
            },
            "campanhas": campanhas,
        }
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")