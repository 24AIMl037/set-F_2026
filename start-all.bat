@echo off
echo ============================================================
echo   Starting EventHub - AWDF Set F Exam System
echo ============================================================
echo.

start "EventHub Backend (Port 5000)" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul
start "EventHub Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

echo Backend running on http://localhost:5000
echo Frontend running on http://localhost:5173
echo.
echo Opening browser...
start http://localhost:5173
pause
