# Structure OpenSpace - Monorepo

La structure du projet a été réorganisée en monorepo avec backend et frontend séparés.

## 📁 Structure

```
c:\Users\user\GolandProjects\openspace\
├── backend/                    # Code Go (API backend)
│   ├── cmd/                    # Entrypoint de l'application
│   ├── internal/               # Code interne (auth, payment, provisioning, etc.)
│   ├── pkg/                    # Packages réutilisables (cache, config, database)
│   ├── migrations/             # Migrations SQL
│   ├── go.mod                  # Module Go
│   ├── Dockerfile              # Docker pour backend
│   ├── docker-compose.yml      # Orchestration services
│   └── .env                    # Variables d'environnement
│
└── frontend/                   # Code React/Vite (UI client)
    ├── src/
    │   ├── pages/              # Pages (Auth, Dashboard)
    │   ├── components/         # Composants réutilisables
    │   ├── App.jsx             # App principal
    │   ├── index.css           # Styles globaux (rouge + blanc)
    │   └── main.jsx            # Entrée React
    ├── public/                 # Assets statiques
    ├── index.html              # HTML de base
    ├── vite.config.js          # Config Vite
    ├── package.json            # Dépendances npm
    └── node_modules/           # Dépendances installées
```

## 🚀 Installation

### Backend (Go)

```bash
cd backend
go mod download
docker-compose up -d  # PostgreSQL + Redis
go run cmd/main.go
```

L'API démarre sur `http://localhost:8080`

### Frontend (React/Vite)

```bash
cd frontend
npm install
npm run dev
```

Le frontend démarre sur `http://localhost:3000`

## 🎨 Design Frontend

- **Couleurs**: Rouge (#E63946) + Blanc
- **Framework**: React 18 + Vite
- **Styles**: CSS vanillaavec variables CSS
- **Responsive**: Mobile-first design

## 📡 Communication

Le frontend proxifie `/api/*` vers `http://localhost:8080` (voir `vite.config.js`)

## 🔑 Endpoints API

- **Auth**: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`
- **Payments**: `POST /api/v1/payments/initiate`, `GET /api/v1/payments/me`
- **Subscriptions**: `GET /api/v1/subscriptions/me`, `POST /api/v1/subscriptions/cancel`
- **Spaces**: `POST /api/v1/spaces/`, `GET /api/v1/spaces/me`, `DELETE /api/v1/spaces/me`
- **Domains**: `POST /api/v1/domains/search`, `POST /api/v1/domains/purchase`, etc.

## ⚙️ Construction

### Backend

```bash
cd backend
go build -o openspace cmd/main.go
```

### Frontend

```bash
cd frontend
npm run build
# Fichiers générés dans dist/
```

## 📝 Notes

- **Backend vide**: À remplir avec les fichiers Go (cmd/, internal/, pkg/, migrations/, go.mod, etc.)
- **Frontend prêt**: Complètement fonctionnel avec couleurs rouge/blanc et intégration API
- **Variable env**: Configurer `.env` avec clés API (CinetPay, NotchPay, OpenProvider, etc.)

---

**Créé le**: 2026-04-01  
**Statut**: ✅ Structure prête, Backend à remplir
