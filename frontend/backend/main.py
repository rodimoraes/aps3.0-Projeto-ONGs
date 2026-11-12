import sys
import os
# Adiciona a pasta atual (backend) ao caminho de modulos do Python
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# Importa os roteadores dos modulos
from usuario import router as usuario_router
from ong import router as ong_router
from campanha import router as campanha_router
from imagem import router as imagem_router


app = FastAPI(title="EncontreONG API")
app.add_middleware(
 CORSMiddleware,
 allow_origins=["*"],
 allow_credentials=True,
 allow_methods=["*"],
 allow_headers=["*"],
)
app.include_router(usuario_router)
app.include_router(ong_router)
app.include_router(campanha_router)
app.include_router(imagem_router)

@app.get("/")
def root():
    return {"mensagem": "API EncontreONG rodando com sucesso!"}