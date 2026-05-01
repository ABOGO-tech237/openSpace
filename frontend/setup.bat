@echo off
REM Installation complet du projet OpenSpace
REM Usage: setup.bat

echo.
echo ========================================
echo 🚀 Installation OpenSpace - Frontend
echo ========================================
echo.

REM Vérifier Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js n'est pas installé
    exit /b 1
)

echo ✅ Node.js version: & node --version
echo ✅ npm version: & npm --version
echo.

REM Installation des dépendances
echo 📦 Installation des dépendances...
call npm install

REM Création du fichier .env.local
if not exist .env.local (
    echo 🔑 Création du fichier .env.local...
    (
        echo NEXT_PUBLIC_API_URL=http://localhost:8080/api
    ) > .env.local
    echo ✅ Fichier .env.local créé
) else (
    echo ✅ Fichier .env.local existe déjà
)

echo.
echo ✅ Installation terminée!
echo.
echo 📝 Prochaines étapes:
echo    1. npm run dev       - Lancer le serveur de développement
echo    2. Accédez à http://localhost:3000
echo.
