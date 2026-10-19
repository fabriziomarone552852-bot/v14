@echo off
setlocal

set "APP_ENV=dev"
echo === Alembic DEV ===
echo APP_ENV=%APP_ENV%
echo.

if "%~1"=="" (
    echo Uso: alembic-dev.bat ^<command^>
    echo Esempi:
    echo   alembic-dev.bat current
    echo   alembic-dev.bat upgrade head
    echo   alembic-dev.bat revision --autogenerate -m "initial schema"
    exit /b 1
)

if exist .venv\Scripts\alembic.exe (
    .venv\Scripts\alembic.exe %*
) else (
    uv run alembic %*
)
exit /b %ERRORLEVEL%
