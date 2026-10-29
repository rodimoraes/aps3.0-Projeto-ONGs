@echo off
title EncontreONG - Iniciando...
echo ====================================================
echo   INICIANDO O PROJETO ENCONTREONG
echo ====================================================
echo.

:: Instala dependências do Backend
echo [1/3] Verificando dependencias do Python (Backend)...
cd backend
pip install -r requirements.txt
cd ..
echo.

:: Instala dependências do Frontend
echo [2/3] Verificando dependencias do Node.js (Frontend)...
cd frontend
call npm install
cd ..
echo.

:: Abre o Backend em uma nova janela
echo [3/3] Iniciando os servidores...
start "Backend - FastAPI" cmd /k "cd backend && python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"

:: Abre o Frontend em outra nova janela
start "Frontend - Vite" cmd /k "cd frontend && npm run dev"

echo.
echo ====================================================
echo  TUDO PRONTO! As duas janelas foram abertas.
echo  O Frontend vai rodar em: http://localhost:5173
echo ====================================================
pause