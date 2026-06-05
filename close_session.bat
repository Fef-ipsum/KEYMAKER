@echo off
cd /d "C:\Users\Felix\Projects\Strudel CC"

echo.
echo === KEYMAKER — Cloture de session ===
echo.

git status --short
echo.

set /p MSG="Message de commit (ex: 'Module X — ajout exercice Y'): "

git add .
git commit -m "%MSG%"
git push

echo.
echo Chantier clos. Repo mis a jour sur GitHub.
pause
