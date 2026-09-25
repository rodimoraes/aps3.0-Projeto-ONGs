#Tentando conectar o backend com o formulario do frontend


from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import mysql.connector
from dotenv import load_dotenv
import os

# Carrega as variáveis de ambiente no env
load_dotenv()

# Inicializa a aplicação FastAPI
app = FastAPI()

#Permite que o localhost possa fazer qualquer ação sem problemas ou bloqueio
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True, 
    allow_methods=["*"],   
    allow_headers=["*"],  
)

# Função auxiliar para criar e retornar uma nova conexão com o banco de dados MySQL
def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', '1234'),
        database=os.getenv('DB_NAME', 'encontreong')
    )

# Cria a classe que vai receber as informações do formulario
# O Pydantic valida automaticamente se os campos enviados correspondem aos tipos declarados, ou seja, se chegar um int no str, ele bloqueia
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

# Criação da rota HTTP POST no endereço 'http://localhost:8000/usuarios'
@app.post("/usuarios")
def cadastrar_usuario(usuario: CriarUsuario):
    """
    Recebe o retorno do CriarUsuario, contendo os dados do usuário enviados pelo formulario,
    então inserido no banco
    """
    try:
        conexao = get_db_connection()
        cursor = conexao.cursor()

        # Instrução SQL parametrizada utilizando '%s' para evitar ataques de SQL Injection
        sql = """
            INSERT INTO usuario (
                nome, cpf, endereco, estado_civil, rg, 
                email, data_nascimento, voluntario, celular, representante_ong
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        # Mapeia os dados validados na ordem que está no banco
        valores = (
            usuario.nome, 
            usuario.cpf, 
            usuario.endereco, 
            usuario.estado_civil,
            usuario.rg, 
            usuario.email, 
            usuario.data_nascimento,
            usuario.voluntario, 
            usuario.celular, 
            usuario.representante_ong
        )

        cursor.execute(sql, valores)
        conexao.commit()
        
        # Pega o ID gerado para o usuário
        novo_id = cursor.lastrowid

        cursor.close()
        conexao.close()

        # Retorna uma resposta para o Frontend confirmando o cadastro
        return {
            "status": "sucesso", 
            "mensagem": "Usuário cadastrado com sucesso!", 
            "id": novo_id
        }

    except mysql.connector.Error as err:
        # Em caso de falha no banco de dados, lança uma exceção HTTP com status 500 
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {err}")