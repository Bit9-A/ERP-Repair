@echo off
echo ==============================================
echo COMPILACION DEL FRONTEND SPA (REACT/VITE)
echo ==============================================
cd %~dp0\frontend

echo 1. Instalando dependencias de interfaz con pnpm...
call pnpm install

echo.
echo 2. Compilando codigo fuente para produccion...
call pnpm run build

echo.
echo ==============================================
echo ¡FRONTEND COMPILADO CON EXITO!
echo ==============================================
echo Instruccion: Copia todo el contenido de la carpeta 
echo "C:\TuRuta\ERP-Repair\frontend\dist"
echo ...y pegalo en el "root" de tu servidor NGINX.
echo (Generalmente C:\nginx\html o la carpeta que configuraste en nginx.conf)
pause
