@echo off
echo ================================
echo F1 Data Analysis - Quick Start
echo ================================
echo.

echo [1/4] Setting up Python virtual environment...
python -m venv venv
call venv\Scripts\activate

echo.
echo [2/4] Installing Python dependencies...
pip install -r requirements.txt

echo.
echo [3/4] Installing Node.js dependencies...
cd frontend
call npm install
cd ..

echo.
echo ================================
echo Setup Complete!
echo ================================
echo.
echo To start the application:
echo   1. Backend:  python app.py
echo   2. Frontend: cd frontend && npm start
echo.
echo The backend will run on: http://localhost:5000
echo The frontend will run on: http://localhost:3000
echo.
pause
