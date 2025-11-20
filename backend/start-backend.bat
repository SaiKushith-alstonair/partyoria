@echo off
echo Starting Redis Server...
start "Redis" redis-server
timeout /t 2 /nobreak > nul

echo Installing/Updating Backend Dependencies...
pip install -r requirements.txt

echo.
echo Running Database Migrations...
python manage.py makemigrations
python manage.py makemigrations vendor_app
python manage.py migrate

echo.
echo Starting Django Development Server...
python manage.py runserver 8000