@echo off
cd /d "C:\Users\Felix\Projects\Strudel CC"

echo.
echo === KEYMAKER - Cloture de session ===
echo.

rem -- Auto-reparation : retire les verrous git perimes (un mont a pu bloquer leur suppression cote sandbox)
if exist ".git\index.lock" (
  echo Verrou git perime detecte -^> suppression.
  del /f /q ".git\index.lock"
)
if exist ".git\HEAD.lock" (
  echo Verrou git perime detecte HEAD.lock -^> suppression.
  del /f /q ".git\HEAD.lock"
)

git status --short
echo.

set /p MSG="Message de commit (ex: Module X - ajout exercice Y): "

git add .
git commit -m "%MSG%"
git push

echo.
echo Chantier clos. Repo mis a jour sur GitHub.
pause
