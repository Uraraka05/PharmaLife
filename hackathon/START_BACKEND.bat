@echo off
echo ========================================
echo Starting PharmaGuard Backend Server
echo ========================================
echo.

cd pharmaguard_backend

echo Checking virtual environment...
if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
)

echo Activating virtual environment...
call .venv\Scripts\activate

echo Checking dependencies...
if not exist ".venv\Scripts\uvicorn.exe" (
    echo Installing dependencies...
    pip install -r requirements.txt
)

echo.
echo Starting backend server on http://127.0.0.1:8000
echo Press CTRL+C to stop
echo.
uvicorn app.main:app --reload

pause
