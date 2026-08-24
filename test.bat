@echo off
setlocal

echo === Smart Agenda - TEST (DB persistente NAS: test-smart) ===
set "APP_ENV=test"
set "VITE_API_BASE_URL=http://localhost:8000"

echo Backend: APP_ENV=%APP_ENV%
echo Frontend: VITE_API_BASE_URL=%VITE_API_BASE_URL%
echo.

start "Backend (test)" cmd /c "set APP_ENV=test && uv run uvicorn backend.main:app --reload"

pushd frontend
call npm run dev
set "FRONTEND_EXIT=%ERRORLEVEL%"
popd

exit /b %FRONTEND_EXIT%