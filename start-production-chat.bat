@echo off
echo Starting PartyOria Production Chat System...
echo.

echo [1/3] Starting Django Backend...
start "Django Backend" cmd /k "cd backend && python manage.py runserver 8000"
timeout /t 3 /nobreak > nul

echo [2/3] Starting Chat Server...
start "Chat Server" cmd /k "cd backend && python chat_server.py"
timeout /t 3 /nobreak > nul

echo [3/3] Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ All services started!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:8000
echo 💬 Chat Server: http://localhost:8001
echo.
echo Press any key to exit...
pause > nul