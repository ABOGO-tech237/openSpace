#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "==> OpenSpace — Setup & lancement"
echo ""

# Copier les fichiers d'environnement si absents
[ -f .env ] || cp env.example .env
[ -f backend/.env ] || cp backend/.env.example backend/.env
[ -f frontend/.env.local ] || cp frontend/.env.example frontend/.env.local

echo "==> Construction image Docker de base (openspace-base)"
if [ -d docker-base ]; then
  docker build -t openspace-base:latest docker-base/ 2>/dev/null || echo "⚠️  Image base non construite (Docker requis)"
fi

echo "==> Démarrage PostgreSQL + Redis"
docker compose up -d postgres redis 2>/dev/null || docker-compose up -d postgres redis 2>/dev/null || true

echo "==> Installation dépendances frontend"
cd frontend && npm install --silent
cd "$ROOT"

echo ""
echo "✅ Setup terminé. Lancez dans 3 terminaux :"
echo ""
echo "  Terminal 1 — Backend:"
echo "    cd backend && go run cmd/main.go"
echo ""
echo "  Terminal 2 — Frontend:"
echo "    cd frontend && npm run dev"
echo ""
echo "  Terminal 3 — Admin (optionnel):"
echo "    cd backend && go run cmd/createsuperuser/main.go"
echo ""
echo "  Dashboard: http://localhost:3000"
echo "  API:       http://localhost:8080/health"
echo ""
