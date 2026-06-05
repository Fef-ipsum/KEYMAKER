@echo off
chcp 65001 >nul
title Keymaker
cd /d "%~dp0"
echo.
echo    Keymaker demarre sur  http://localhost:4321
echo    Garde cette fenetre OUVERTE pendant que tu utilises l'app.
echo    Pour arreter : ferme cette fenetre.
echo.
start "" powershell -NoProfile -Command "Start-Sleep -Seconds 2; Start-Process 'http://localhost:4321'"
node server.mjs
echo.
echo    Le serveur s'est arrete.
pause
