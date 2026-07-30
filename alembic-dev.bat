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

alembic %*
exit /b %ERRORLEVEL%
