# APS 3.0 Projeto ONGs Faculdade Vanguarda 2º Semestre 2026

> > Instruções para iniciar o EncontreONG

# Automatico:

$ start.bat #Vai instalar as dependencias e iniciar o backend e frontend

# Manual:

> > #Instalar bibliotecas e iniciar frontend

$ cd frontend # Entra na pasta do frontend
$ npm install # Instala as bibliotecas do frontend via package.json
$ npm run dev # Inicia a frontend via Vite

> > Instruções para preparar o servidor BackEnd:

$ cd backend # Entra na pasta do frontend
$ pip install -r requirements.txt # Instala as bibliotecas do backend
$ python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000 # Inicia o backend (BD)

> > Popular Banco de Dados

$ cd backend

$ python seed.py # Vai executar varios comando sql para popular com ongs e usuarios
