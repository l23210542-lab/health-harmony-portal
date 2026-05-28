@echo off
chcp 65001 >nul
title Care Sync — Iniciar aplicación
cd /d "%~dp0"

echo.
echo  ========================================
echo   Care Sync - Portal medico
echo  ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js no esta instalado.
  echo.
  echo Descarga e instala Node.js LTS desde:
  echo   https://nodejs.org/
  echo.
  echo Luego vuelve a ejecutar INICIAR.bat
  pause
  exit /b 1
)

if not exist ".env" (
  echo [AVISO] No existe archivo .env
  if exist ".env.example" (
    echo Copiando .env.example a .env ...
    copy /Y ".env.example" ".env" >nul
    echo Edita .env con tus credenciales de Supabase antes de continuar.
    pause
  ) else (
    echo Crea un archivo .env con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
    pause
    exit /b 1
  )
)

if not exist "node_modules" (
  echo Instalando dependencias ^(primera vez, puede tardar^)...
  call npm install
  if errorlevel 1 (
    echo [ERROR] npm install fallo.
    pause
    exit /b 1
  )
)

echo.
echo Iniciando servidor en http://localhost:8080
echo Cierra esta ventana o presiona Ctrl+C para detener.
echo.
echo Abriendo navegador...
timeout /t 3 /nobreak >nul
start "" "http://localhost:8080"

call npm run dev

pause
