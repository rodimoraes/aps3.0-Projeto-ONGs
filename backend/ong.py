# backend/ong.py

from fastapi import APIRouter, HTTPException 
from pydantic import BaseModel
from typing import Optional
import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

router = APIRouter(
    prefix='/ongs',
    tags=["ONGs"]
)

def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST','localhost'),
        user=os.getenv('DB_USER','root'),
        password=os.getenv('DB_PASSWORD','1234'),
        database=os.getenv('DB_NAME','bd_encontreong')
    )

class OngSchema(BaseModel):
    nome: str
    id_usuario_representante: int
    id_categoria: int
    telefonia: int
    endereco: str
    denominacao_social: str
    sigla: Optiona[str] = None
    objetivo_social_finalidade: str
    RCPJ: int
    CNAE: str
    inscricao_municipal: str
    como_ajudar: Optional[str] = None
    
@router.post("") #Define uma rota HTTP do tipo **POST** no caminho `/ongs`. É usada para **inserir** dados.

def cadastrar_ong(ong: OngSchema): # Cria a função que recebe os dados do formulário já validados no parâmetro `ong`.
    try: # Inicia um bloco de tratamento de exceções. Se houver falha de banco de dados, o código captura o erro.
        conexao = get_db_connection() # Abre a conexão com o banco de dados MySQL.
        cursor = conexao.cursor() # O "cursor" é o objeto encarregado de executar os comandos SQL no MySQL.
        # Prepara a instrução SQL de inserção. Usamos `%s` como marcadores de posição para evitar vulnerabilidades de *SQL Injection*.
        sql ="""
            INSERT INTO ong(
                nome,id_usuario_representante,id_categoria,telefone,endereco,denominacao_social,sigla,objetivo_social_finalidade,RCPJ,CNAE,inscricao_municpal,como_ajudar 
                )VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            )"""
        # Cria uma tupla contendo os valores na exata ordem dos marcadores `%s`.
        valores=(
                ong.nome,ong.id_usuario_representante,ong.id_categoria,ong.telefonia,ong.endereco,ong.denominacao_social,ong.sigla,ong.objetivo_social_finalidade,ong.RCPJ,ong.CNAE,ong.inscricao_municipal,ong.como_ajudar)
        # Envia o comando SQL com os dados com segurança para o banco.
        cursor.execute(sql,valores)
        # Confirma e grava a alteração definitivamente no banco de dados.
        conexao.commit()
        # Captura o ID numérico que o MySQL gerou automaticamente para esta nova ONG.
        novo_id = cursor.lastrowid
        # Fecha o cursor e a conexão para liberar memória e recursos do servidor.
        cursor.close()
        conexao.close()
        # Retorna uma resposta JSON ao cliente confirmando o cadastro.
        return{"status":"sucesso","mensagem":"ONG cadastrada com sucesso!","id":novo_id}
    # Se ocorrer algum erro do MySQL, captura o erro e dispara uma mensagem HTTP 500.
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500,detail=f"Erro no banco de dados:{err}")

@router.get("")
def listar_ongs():
    try:
        conexao = get_db_connection()
        cursor = conexao.cursor(dictionay=True) #O parâmetro `dictionary=True` faz o MySQL retornar cada registro como um dicionário Python (`{"nome": "ONG A", "telefone": 123}`), facilidade imediata para conversão em JSON.
        cursor.execute("SELECT * FROM ong")
        ongs = cursor.fetchall() #Coleta todas as linhas encontradas e as armazena na variável `ongs`.
        cursor.close()
        conexao.close()
        return ongs
    except mysql.connetor.Error as err:
            raise HTTPException(status_code=500,detail=f"Erro no banco de dados:{err}")
@router.get("/{id_ong}")
def buscar_ong(id_ong: int):
    try:
        conexao = get_db_connection()
        cursor = conexao.cursor(dictionary=True)
        cursor.execute("SELECT * FROM ong WHERE id_ong = %s",(id_ong,))
        ong = cursor.fetchone()
        cursor.close()
        conexao.close()
        if not ong:
            raise HTTPException(status_code=404,detail="ONG não encontrada")
        return ong
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500,detail=f"Erro no banco de dados:{err}")
    
@router.put("/{id_ong}")
def atualizar_ong(id_ong: int,ong: OngSchema):
    try:
        conexao=get_db_connection()
        cursor = conexao.cursor()
        sql = """
            UPDATE ong SET
                nome=%s,id_usuario_representante=%s,id_categoria=%s,
                telefone=%s,endereco=%s,denominacao_social=%s,sigla=%s,objetivo_social_finalidade
        """
    
    
    
    
    
    
    
    
    
    
    
    
    