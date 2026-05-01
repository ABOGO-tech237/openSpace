#!/bin/bash

# Installation complet du projet OpenSpace
# Usage: chmod +x ./setup.sh && ./setup.sh

echo "🚀 Installation OpenSpace - Frontend"
echo "======================================="
echo ""

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Installation des dépendances
echo "📦 Installation des dépendances..."
npm install

# Création du fichier .env.local
if [ ! -f .env.local ]; then
    echo "🔑 Création du fichier .env.local..."
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8080/api
EOF
    echo "✅ Fichier .env.local créé"
else
    echo "✅ Fichier .env.local existe déjà"
fi

echo ""
echo "✅ Installation terminée!"
echo ""
echo "📝 Prochaines étapes:"
echo "   1. npm run dev       - Lancer le serveur de développement"
echo "   2. Accédez à http://localhost:3000"
echo ""
