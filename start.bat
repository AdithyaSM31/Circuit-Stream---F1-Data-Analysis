@echo off
echo Starting F1 Data Analysis Application...
echo.

echo Starting Backend Server...
start cmd /k "cd /d %~dp0 && call venv\Scripts\activate && python app.py"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
