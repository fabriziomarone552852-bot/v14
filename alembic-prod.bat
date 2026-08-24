@echo off
setlocal

set "APP_ENV=prod"
echo === Alembic PROD ===
echo APP_ENV=%APP_ENV%
echo.

if "%~1"=="" (
    echo Uso: alembic-prod.bat ^<command^>
    echo Esempi:
    echo   alembic-prod.bat current
    echo   alembic-prod.bat upgrade head
    echo   alembic-prod.bat revision --autogenerate -m "add tasks table"
    exit /b 1
)

alembic %*
exit /b %ERRORLEVEL%
