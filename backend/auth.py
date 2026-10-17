# backend/auth.py
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt 
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "sua_chave_secreta_super_segura_aqui_123")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="usuarios/login")

def gerar_hash_senha(senha_plana: str) -> str:
    """Gera o hash da senha usando bcrypt nativo."""
    salt = bcrypt.gensalt()
    senha_hash_bytes = bcrypt.hashpw(senha_plana.encode('utf-8'), salt)
    
    return senha_hash_bytes.decode('utf-8')

def verificar_senha(senha_plana: str, senha_hash: str) -> bool:
    """Compara a senha em texto plano com o hash salvo."""
    return bcrypt.checkpw(senha_plana.encode('utf-8'), senha_hash.encode('utf-8'))

def criar_token_acesso(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def obter_usuario_atual(token: str = Depends(oauth2_scheme)):
    exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas ou token expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        id_usuario: int = payload.get("id_usuario")
        if email is None or id_usuario is None:
            raise exception
        return {"id_usuario": id_usuario, "email": email}
    except JWTError:
        raise exception