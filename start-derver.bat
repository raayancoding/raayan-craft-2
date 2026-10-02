@echo off
cd /d "%~dp0"

echo Starting Raayan Craft 2 local server...
python -m http.server 8000
if errorlevel 1 (
    echo.
    echo Python was not found. Please install Python and make sure it is added to PATH.
    echo Then run this file again.
    pause
)
