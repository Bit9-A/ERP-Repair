@echo off
echo ==============================================
echo INSTALACION Y LEVANTAMIENTO DEL BACKEND
echo ==============================================
cd %~dp0\backend

echo 1. Instalando dependencias de NodeJS con pnpm...
call pnpm install

echo.
echo 2. Descargando Cliente de Prisma...
call pnpm prisma generate

echo.
echo 3. Sincronizando Base de Datos...
call pnpm prisma db push

echo.
echo 4. Compilando codigo TypeScript...
call pnpm run build

echo.
echo 5. Iniciando PM2 con ecosystem.config.cjs...
call pnpm dlx pm2 start ecosystem.config.cjs

echo.
echo 6. Guardando estado de PM2 para re-inicio automatico...
call pnpm dlx pm2 save

echo.
echo ==============================================
echo ¡BACKEND INSTALADO Y CORRIENDO!
echo ==============================================
pause
