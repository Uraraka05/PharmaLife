@echo off
echo ========================================
echo Starting PharmaGuard Frontend Server
echo ========================================
echo.

cd pharmaguard_frontend

echo Checking node_modules...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

echo Checking .env file...
if not exist ".env" (
    echo Creating .env file...
    echo VITE_API_BASE_URL=http://localhost:8000 > .env
)

echo.
echo Starting frontend server on http://localhost:5173
echo Press CTRL+C to stop
echo.
call npm run dev

pause
