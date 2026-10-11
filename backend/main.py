from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importa os roteadores de cada módulo
from usuario import router as usuario_router
from ong import router as ong_router

app = FastAPI(title="EncontreONG API")

# Configuração de CORS centralizada
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Conecta os roteadores à aplicação principal
app.include_router(usuario_router) #usuario.py
app.include_router(ong_router) #ong.py

@app.get("/")
def root():
    return {"mensagem": "API EncontreONG rodando com sucesso!"}