@echo off
echo Installing Redis for Windows...

:: Check if Redis is already installed
redis-server --version >nul 2>&1
if %errorlevel% == 0 (
    echo Redis is already installed!
    goto :start_redis
)

:: Download and install Redis using Chocolatey (if available)
choco --version >nul 2>&1
if %errorlevel% == 0 (
    echo Installing Redis via Chocolatey...
    choco install redis-64 -y
    goto :start_redis
)

:: Alternative: Download Redis manually
echo Chocolatey not found. Please install Redis manually:
echo 1. Download Redis from: https://github.com/microsoftarchive/redis/releases
echo 2. Extract and run redis-server.exe
echo 3. Or install via WSL: wsl --install then sudo apt install redis-server
pause
exit /b 1

:start_redis
echo Starting Redis server...
start "Redis Server" redis-server
timeout /t 3 >nul
echo Redis server started!
echo You can now run: start-dev.bat
pause