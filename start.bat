@echo off
setlocal enabledelayedexpansion
title EncontreONG - Iniciando...
echo ====================================================
echo   INICIANDO O PROJETO ENCONTREONG
echo ====================================================
echo.

:: ============================================================
:: Sanidade: precisa rodar da raiz do projeto
:: ============================================================
if not exist "backend\requirements.txt" (
    echo [ERRO] Execute este script a partir da RAIZ do projeto
    echo        (a pasta que contem as pastas "backend" e "frontend"^).
    echo.
    pause
    exit /b 1
)
if not exist "frontend\package.json" (
    echo [ERRO] frontend\package.json nao encontrado.
    pause
    exit /b 1
)
if not exist "bd_encontreong.sql" (
    echo [AVISO] bd_encontreong.sql nao encontrado na raiz do projeto.
    echo         O banco nao podera ser criado automaticamente.
    echo.
)

:: ============================================================
:: [0/4] BANCO DE DADOS - verificar / criar a partir do .sql
:: ============================================================
echo [0/4] Verificando banco de dados MySQL...
echo.

:: ---- Credenciais (le do .env na raiz) ----
set DB_HOST=localhost
set DB_USER=root
set DB_PASSWORD=123456
set DB_NAME=bd_encontreong

if exist ".env" (
    for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
        set "KEY=%%A"
        set "VAL=%%B"
        set "VAL=!VAL:"=!"
        if /i "!KEY!"=="DB_HOST"     set "DB_HOST=!VAL!"
        if /i "!KEY!"=="DB_USER"     set "DB_USER=!VAL!"
        if /i "!KEY!"=="DB_PASSWORD" set "DB_PASSWORD=!VAL!"
        if /i "!KEY!"=="DB_NAME"     set "DB_NAME=!VAL!"
    )
    echo Credenciais carregadas de .env (raiz^).
) else (
    echo [AVISO] .env nao encontrado na raiz - usando credenciais padrao.
    echo         Crie um arquivo .env com JWT_SECRET_KEY!
)
echo   Host: %DB_HOST%  ^|  User: %DB_USER%  ^|  DB: %DB_NAME%
echo.

:: ============================================================
:: Localizar mysql.exe
::   1) Cache em mysql_path.txt
::   2) PATH do Windows
::   3) Locais comuns (Program Files, XAMPP, WAMP, Laragon)
::   4) Janela de selecao / digitacao manual / pular
:: ============================================================
set "MYSQL="
set "MYSQL_CONFIG=%~dp0mysql_path.txt"

:: (1) Cache de execucao anterior
if exist "%MYSQL_CONFIG%" (
    set /p MYSQL=<"%MYSQL_CONFIG%"
    if defined MYSQL (
        if not exist "!MYSQL!" set "MYSQL="
        if defined MYSQL (
            "!MYSQL!" --version >nul 2>&1
            if errorlevel 1 set "MYSQL="
        )
        if defined MYSQL (
            echo [OK] mysql.exe em cache: !MYSQL!
            goto :mysql_found
        )
    )
    del "%MYSQL_CONFIG%" >nul 2>&1
)

:: (2) PATH do Windows
where mysql >nul 2>&1
if not errorlevel 1 (
    for /f "delims=" %%M in ('where mysql') do (
        set "MYSQL=%%M"
        goto :mysql_found
    )
)

:: (3) Locais comuns
for %%P in (
    "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
    "C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe"
    "C:\xampp\mysql\bin\mysql.exe"
) do (
    if not defined MYSQL if exist "%%~P" set "MYSQL=%%~P"
)
if not defined MYSQL for /d %%D in ("C:\wamp64\bin\mysql\*") do (
    if not defined MYSQL if exist "%%~D\bin\mysql.exe" set "MYSQL=%%~D\bin\mysql.exe"
)
if not defined MYSQL for /d %%D in ("C:\laragon\bin\mysql\*") do (
    if not defined MYSQL if exist "%%~D\bin\mysql.exe" set "MYSQL=%%~D\bin\mysql.exe"
)
if defined MYSQL goto :mysql_found

:: (4) Interativo
echo.
echo [ATENCAO] mysql.exe nao foi encontrado automaticamente.
echo           Se o MySQL ainda nao estiver instalado, baixe em:
echo           https://dev.mysql.com/downloads/installer/
echo.
echo Como deseja informar o local?
echo   [1] Abrir janela para selecionar o arquivo (recomendado)
echo   [2] Digitar o caminho completo manualmente
echo   [3] Pular (o banco nao sera criado agora)
echo.
set /p OPCAO="Escolha [1/2/3]: "

if "!OPCAO!"=="1" goto :escolher_arquivo
if "!OPCAO!"=="2" goto :digitar_caminho
goto :sem_mysql

:escolher_arquivo
echo Abrindo janela de selecao...
for /f "usebackq delims=" %%P in (`powershell -NoProfile -Command "Add-Type -AssemblyName System.Windows.Forms; $d = New-Object System.Windows.Forms.OpenFileDialog; $d.Filter = 'mysql.exe^|mysql.exe^|Executaveis (*.exe)^|*.exe'; $d.Title = 'Selecione o arquivo mysql.exe'; if ($d.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { $d.FileName }"`) do set "MYSQL=%%P"
if not defined MYSQL (
    echo Nenhum arquivo selecionado.
    goto :sem_mysql
)
goto :validar_mysql

:digitar_caminho
set /p "MYSQL=Digite o caminho completo do mysql.exe: "
if not defined MYSQL goto :sem_mysql
goto :validar_mysql

:validar_mysql
if not exist "!MYSQL!" (
    echo [ERRO] Arquivo nao encontrado: !MYSQL!
    goto :sem_mysql
)
"!MYSQL!" --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] O arquivo informado nao parece ser um mysql.exe valido.
    goto :sem_mysql
)
goto :mysql_found

:: ============================================================
:: MySQL localizado -> salvar cache e validar servidor
:: ============================================================
:mysql_found
echo !MYSQL!>"%MYSQL_CONFIG%"
echo MySQL: !MYSQL!
echo (Caminho salvo em mysql_path.txt - nao sera perguntado novamente)
echo.

:: Testa conexao
"!MYSQL!" -h %DB_HOST% -u %DB_USER% -p%DB_PASSWORD% -e "SELECT 1;" >nul 2>&1
if errorlevel 1 (
    echo [AVISO] mysql.exe encontrado, mas o servidor nao respondeu.
    echo         Verifique:
    echo           - O servico do MySQL esta rodando? (services.msc^)
    echo           - Usuario/senha no arquivo .env estao corretos?
    echo           - O servidor esta em %DB_HOST%?
    echo.
    goto :skip_db
)

:: ---- Testar se o banco ja existe ----
set DB_EXISTS=0
"!MYSQL!" -h %DB_HOST% -u %DB_USER% -p%DB_PASSWORD% -e "USE %DB_NAME%;" >nul 2>&1
if not errorlevel 1 set DB_EXISTS=1

set RUN_SQL=N
if "%DB_EXISTS%"=="0" (
    echo Banco '%DB_NAME%' NAO existe - sera criado agora.
    set RUN_SQL=S
) else (
    echo Banco '%DB_NAME%' JA existe.
    echo [ATENCAO] O bd_encontreong.sql comeca com "DROP DATABASE" - APAGA tudo!
    set /p RECRIAR="Recriar o banco do zero? (S/N): "
    if /i "!RECRIAR!"=="S" set RUN_SQL=S
)

if /i "!RUN_SQL!"=="S" call :importar_sql
goto :skip_db

:: ============================================================
:: Sub-rotina: importar o .sql e (opcional) rodar seed.py
:: ============================================================
:importar_sql
if not exist "bd_encontreong.sql" (
    echo [ERRO] Arquivo bd_encontreong.sql nao encontrado.
    goto :eof
)
echo.
echo Importando bd_encontreong.sql...
"!MYSQL!" -h %DB_HOST% -u %DB_USER% -p%DB_PASSWORD% --default-character-set=utf8mb4 < bd_encontreong.sql
if errorlevel 1 (
    echo.
    echo [ERRO] Falha ao importar o banco. Verifique:
    echo        - Servidor MySQL esta rodando?
    echo        - Usuario/senha estao corretos no .env?
    echo        - O arquivo bd_encontreong.sql esta na raiz do projeto?
    echo.
    pause
    goto :eof
)
echo Banco de dados criado com sucesso!
echo.

set /p SEMEAR="Popular o banco com dados de teste (seed.py)? (S/N): "
if /i "!SEMEAR!"=="S" (
    echo Executando seed.py...
    pushd backend
    python seed.py
    popd
)
goto :eof

:: ============================================================
:: Usuario optou por pular / falhou
:: ============================================================
:sem_mysql
echo.
echo [INFO] Banco de dados nao sera criado por este script.
echo        Se precisar, rode manualmente:
echo          mysql -u %DB_USER% -p ^< bd_encontreong.sql
echo.
goto :skip_db

:: ============================================================
:: [1/4] Dependencias do backend
:: ============================================================
:skip_db
echo.
echo [1/4] Verificando dependencias do Python (Backend)...
cd backend
pip install -r requirements.txt
cd ..
echo.

:: ============================================================
:: [2/4] Dependencias do frontend
:: ============================================================
echo [2/4] Verificando dependencias do Node.js (Frontend)...
cd frontend
call npm install
cd ..
echo.

:: ============================================================
:: [3/4] Backend
:: ============================================================
echo [3/4] Iniciando os servidores...
start "Backend - FastAPI" cmd /k "cd backend && python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"

:: ============================================================
:: [4/4] Frontend
:: ============================================================
start "Frontend - Vite" cmd /k "cd frontend && npm run dev"

echo.
echo ====================================================
echo  TUDO PRONTO! As duas janelas foram abertas.
echo  O Frontend vai rodar em: http://localhost:5173
echo ====================================================
pause