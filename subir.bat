@echo off
cd /d "%~dp0"

echo Guardando cambios en GitHub...

git add -A
git commit -m "Actualizar pagina web"
git push origin main

echo.
echo ¡Listo! Los cambios ya están en GitHub.
pause
