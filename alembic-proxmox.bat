@echo off
setlocal

rem ==================================================
rem  Alembic - Nuovo server Proxmox (PostGreSqlFG LXC)
rem  Host PostgreSQL: 192.168.11.15
rem  Database:        family-smart
rem ==================================================

set "APP_ENV=prod"
set "DATABASE_URL=postgresql+psycopg://PostGre:Password-Robusta@192.168.11.15:5432/family-smart?client_encoding=utf8"
echo === Alembic PROXMOX-PROD (family-smart su 192.168.11.15) ===
echo APP_ENV=%APP_ENV%
echo DATABASE_URL=%DATABASE_URL%
echo.

if "%~1"=="" (
    echo Uso: alembic-proxmox.bat ^<command^>
    echo Esempi:
    echo   alembic-proxmox.bat current
    echo   alembic-proxmox.bat upgrade head
    echo   alembic-proxmox.bat history
    echo   alembic-proxmox.bat revision --autogenerate -m "descrizione"
    exit /b 1
)

if exist .venv\Scripts\alembic.exe (
    .venv\Scripts\alembic.exe %*
) else (
    uv run alembic %*
)
exit /b %ERRORLEVEL%
