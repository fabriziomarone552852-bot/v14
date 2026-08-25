@echo off
setlocal

set "APP_ENV=test"
echo === Alembic TEST (test-smart su NAS) ===
echo APP_ENV=%APP_ENV%
echo.

if "%~1"=="" (
    echo Uso: alembic-test.bat ^<command^>
    echo Esempi:
    echo   alembic-test.bat current
    echo   alembic-test.bat upgrade head
    echo   alembic-test.bat revision --autogenerate -m "descrizione"
    exit /b 1
)

alembic %*
exit /b %ERRORLEVEL%
