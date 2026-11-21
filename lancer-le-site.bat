@echo off
title IMOVEX - Lancement du site
cd /d "%~dp0"
echo ===================================================
echo           IMOVEX DAKAR - DEMARRAGE DU SITE
echo ===================================================
echo.
echo Verification des fichiers...
if not exist "dist\server.js" (
  echo [ERREUR] Le dossier dist n'est pas present. Lancez d'abord le build.
  pause
  exit /b 1
)

echo Demarrage du serveur de production sur http://localhost:3000 ...
start "" http://localhost:3000
agy-node dist\server.js 2>nul || node dist\server.js
pause
