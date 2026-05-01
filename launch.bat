@echo off
REM 🚀 Script de lancement complet OpenSpace
REM Usage: launch.bat

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║    🚀 OpenSpace - Plateforme Cloud Africaine 🌍             ║
echo ║                                                            ║
echo ║    Initialisation du projet backend + frontend             ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM ============================================
REM 1. VÉRIFICATION DES PRÉREQUIS
REM ============================================

echo 📋 Vérification des prérequis...

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js n'est pas installé
    exit /b 1
)
echo ✅ Node.js installé

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm n'est pas installé
    exit /b 1
)
echo ✅ npm installé

where go >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Go n'est pas installé
    exit /b 1
)
echo ✅ Go installé

echo.

REM ============================================
REM 2. SETUP BACKEND
REM ============================================

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📦 Setup Backend (Go)
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

cd backend

if not exist .env (
    echo 🔑 Création du fichier .env backend...
    (
        echo # Database
        echo DB_HOST=localhost
        echo DB_PORT=5432
        echo DB_USER=postgres
        echo DB_PASSWORD=postgres
        echo DB_NAME=openspace
        echo.
        echo # Redis
        echo REDIS_HOST=localhost
        echo REDIS_PORT=6379
        echo REDIS_PASSWORD=
        echo.
        echo # Server
        echo SERVER_PORT=8080
        echo SERVER_HOST=0.0.0.0
        echo.
        echo # JWT
        echo JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
        echo JWT_EXPIRATION=24h
        echo.
        echo # Payments
        echo CINETPAY_API_KEY=test_key
        echo CINETPAY_SECRET=test_secret
        echo NOTCHPAY_PUBLIC_KEY=test_key
        echo NOTCHPAY_PRIVATE_KEY=test_secret
        echo.
        echo # Domains
        echo OPENPROVIDER_API_KEY=test_key
        echo OPENPROVIDER_API_USER=test_user
        echo.
        echo # Docker
        echo DOCKER_HOST=unix:///var/run/docker.sock
    ) > .env
    echo ✅ Fichier .env créé
) else (
    echo ✅ .env existe déjà
)

echo 📥 Téléchargement des dépendances Go...
call go mod download
call go mod tidy
echo ✅ Dépendances Go téléchargées

cd ..
echo.

REM ============================================
REM 3. SETUP FRONTEND
REM ============================================

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ⚛️  Setup Frontend (Next.js 14)
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

cd frontend

if not exist node_modules (
    echo 📥 Installation des dépendances npm...
    call npm install --legacy-peer-deps
    echo ✅ Dépendances npm installées
) else (
    echo ✅ node_modules existe déjà
)

if not exist .env.local (
    echo 🔑 Création du fichier .env.local frontend...
    (
        echo NEXT_PUBLIC_API_URL=http://localhost:8080/api
    ) > .env.local
    echo ✅ Fichier .env.local créé
) else (
    echo ✅ .env.local existe déjà
)

cd ..
echo.

REM ============================================
REM 4. RÉSUMÉ ET INSTRUCTIONS
REM ============================================

echo ╔════════════════════════════════════════════════════════════╗
echo ║            ✅ SETUP TERMINÉ AVEC SUCCÈS!                  ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 🚀 Prochaines étapes:
echo.
echo    1️⃣  Lancer le Backend:
echo       cd backend
echo       go run cmd/main.go
echo       Accessible sur: http://localhost:8080
echo.
echo    2️⃣  Lancer le Frontend:
echo       cd frontend
echo       npm run dev
echo       Accessible sur: http://localhost:3000
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📚 Documentation:
echo    - ARCHITECTURE.md - Vue technique complète
echo    - frontend/GETTING_STARTED.md - Guide frontend
echo    - backend/README.md - Guide backend
echo.
echo ✨ Bonne chance! 🎉
echo.
pause
