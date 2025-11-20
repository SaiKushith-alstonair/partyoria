@echo off
echo Starting PartyOria Full Stack Development Environment...

echo.
echo Starting Redis Server...
start "Redis" redis-server
timeout /t 2 /nobreak > nul

echo.
echo Starting Backend Server...
start "Backend" cmd /k "cd backend && python manage.py runserver 8000"

echo.
echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo Starting Frontend Development Server...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo Vendor Portal: http://localhost:3000/vendor
echo.
echo Press any key to exit...
pause > nul