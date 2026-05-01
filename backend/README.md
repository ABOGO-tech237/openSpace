# OpenSpace Backend - Go API

Backend API pour la plateforme OpenSpace - gestionnaire de cloud et domaines.

## 📁 Structure

```
backend/
├── cmd/
│   └── main.go                 # Entrypoint de l'application
├── internal/
│   ├── auth/                   # Authentification (login, register)
│   ├── provisioning/           # Gestion des containers Docker
│   ├── payment/                # Paiements (CinetPay, NotchPay)
│   ├── subscription/           # Abonnements utilisateurs
│   ├── domain/                 # Gestion des domaines (OpenProvider)
│   └── user/                   # Gestion des utilisateurs
├── pkg/
│   ├── config/                 # Configuration app
│   ├── database/               # Connexion PostgreSQL
│   └── cache/                  # Redis cache
├── migrations/                 # Schemas SQL
├── go.mod                      # Dépendances Go
├── .env                        # Variables d'environnement
├── .env.example                # Template .env
└── README.md                   # Documentation
```

## 🚀 Installation & Démarrage

### Prérequis

- Go 1.21+
- PostgreSQL 14+
- Redis 7+
- Docker (optionnel, pour containers)

### Installation

```bash
cd backend

# Télécharger les dépendances
go mod download

# Copier le fichier .env
cp .env.example .env

# Configurer les variables d'environnement dans .env
```

### Démarrage database

```bash
# Avec Docker Compose
docker-compose up -d postgres redis

# Ou manuellement
createdb openspace
psql openspace < migrations/001_init.sql
psql openspace < migrations/002_payment_subscription.sql
psql openspace < migrations/003_domains.sql
```

### Lancer le serveur

```bash
go run cmd/main.go
```

Le serveur démarre sur `http://localhost:8080`

## 📊 Migrations

Les migrations SQL sont dans le dossier `migrations/`:

1. **001_init.sql** - Création des tables users et containers
2. **002_payment_subscription.sql** - Tables payments et subscriptions
3. **003_domains.sql** - Table domains

À appliquer manuellement ou via une tool de migration.

## 🔑 Plans & Prix (FCFA)

| Plan | RAM | CPU | Stockage | Prix |
|------|-----|-----|----------|------|
| **Starter** | 512m | 0.5 | 5 Go | 2 000 |
| **Dev** | 512m | 1.0 | 10 Go | 3 500 |
| **Pro** | 1g | 2.0 | 20 Go | 6 000 |
| **Business** | 2g | 4.0 | 40 Go | 12 000 |

## 📡 Endpoints API

### Auth
- `POST /api/v1/auth/register` - Créer un compte
- `POST /api/v1/auth/login` - Se connecter
- `GET /api/v1/auth/me` - Récupérer profil (JWT requis)

### Spaces (Containers)
- `POST /api/v1/spaces/` - Créer un espace cloud
- `GET /api/v1/spaces/me` - Récupérer mon espace
- `DELETE /api/v1/spaces/me` - Supprimer mon espace

### Paiements
- `POST /api/v1/payments/initiate` - Initier un paiement
- `GET /api/v1/payments/me` - Récupérer historique paiements
- `POST /api/v1/webhooks/cinetpay` - Webhook CinetPay
- `POST /api/v1/webhooks/notchpay` - Webhook NotchPay

### Subscriptions
- `GET /api/v1/subscriptions/me` - Récupérer mon abonnement
- `POST /api/v1/subscriptions/cancel` - Annuler l'abonnement
- `GET /api/v1/subscriptions/me/status` - Statut de l'abonnement

### Domaines
- `POST /api/v1/domains/search` - Rechercher disponibilité
- `POST /api/v1/domains/purchase` - Acheter un domaine
- `GET /api/v1/domains/me` - Mes domaines
- `PUT /api/v1/domains/:id/configure` - Configurer DNS
- `POST /api/v1/domains/:id/renew` - Renouveler domaine

## ⚙️ Configuration

Configurez le fichier `.env` avec:

- **DB_** — Identifiants PostgreSQL
- **REDIS_** — Identifiants Redis
- **JWT_** — Clés secrètes JWT
- **CINETPAY_** — Clés API CinetPay
- **NOTCHPAY_** — Clés API NotchPay
- **OPENPROVIDER_** — Identifiants OpenProvider

## 🔒 Sécurité

- ✅ JWT pour authentification
- ✅ CORS configuré pour `localhost:3000` et `openspace.com`
- ✅ Helmet pour headers sécurité
- ✅ Rate limiting: 100 req/min
- ✅ Password hashing avec bcrypt

## 📦 Dépendances principales

- **gofiber/fiber** - Framework web
- **jackc/pgx** - Driver PostgreSQL
- **redis/go-redis** - Redis client
- **golang-jwt/jwt** - JWT tokens
- **docker** - Docker API client

## 🛠️ Build Production

```bash
go build -o openspace cmd/main.go

# Ou avec Docker
docker build -t openspace-api:latest .
docker run -p 8080:8080 openspace-api:latest
```

## 📝 Notes

- Les routes payment, subscription, domain ont des handlers placeholders
- À implémenter: logique métier complète, validations, error handling
- À connecter: Docker, providers de  paiement, OpenProvider API
- Database fixtures/seeders à créer

---

**Créé**: 2026-04-01  
**Dernière mise à jour**: Restauration complète des fichiers Go  
**Statut**: ✅ Structure complète, implémentation en cours
