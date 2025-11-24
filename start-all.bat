@echo off
echo Starting PartyOria Full Stack...

echo [1/3] Starting Redis Server...
start "Redis Server" cmd /k "cd /d "C:\Program Files\Redis" && .\redis-server.exe --port 6380"

timeout /t 3 /nobreak > nul

echo [2/3] Starting Chat Server...
start "Chat Server" cmd /k "cd /d "%~dp0backend" && python chat_server.py"

timeout /t 3 /nobreak > nul

echo [3/3] Starting Development Servers...
start "Development" cmd /k "%~dp0start-dev.bat"

echo All servers started!
echo - Redis: Port 6380
echo - Chat: Port 8001  
echo - Backend: Port 8000
echo - Frontend: Port 3000
pause