@echo off
setlocal

set "APP_ENV=prod"
set "DATABASE_URL=postgresql+psycopg://PostGre:Password-Robusta@192.168.11.20:5432/family-smart"
echo === Alembic PROD (family-smart su NAS: 192.168.11.20) ===
echo APP_ENV=%APP_ENV%
echo DATABASE_URL=%DATABASE_URL%
echo.

if "%~1"=="" (
    echo Uso: alembic-prod.bat ^<command^>
    echo Esempi:
    echo   alembic-prod.bat current
    echo   alembic-prod.bat upgrade head
    echo   alembic-prod.bat revision --autogenerate -m "add tasks table"
    exit /b 1
)

if exist .venv\Scripts\alembic.exe (
    .venv\Scripts\alembic.exe %*
) else (
    uv run alembic %*
)
exit /b %ERRORLEVEL%
