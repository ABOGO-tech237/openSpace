# Architecture OpenSpace - Backend & Frontend

## 🏗️ Vue d'ensemble de l'architecture

```
┌─────────────────────────────────────┐
│      Frontend (Next.js 14)           │
│      http://localhost:3000           │
│  - React 18, Tailwind, Framer Motion │
│  - Client API avec Axios             │
└──────────────┬──────────────────────┘
               │ HTTP/REST
               │ Bearer Token (JWT)
               ▼
┌─────────────────────────────────────┐
│       Backend (Go + Fiber)           │
│      http://localhost:8080           │
│  - API RESTful                       │
│  - PostgreSQL                        │
│  - Redis Cache                       │
│  - JWT Authentication                │
└──────────────┬──────────────────────┘
               │
               ▼
        ┌──────────────┐
        │ PostgreSQL   │
        │ Containers   │
        │ Users        │
        │ Domains      │
        └──────────────┘
        
        ┌──────────────┐
        │    Redis     │
        │    Cache     │
        └──────────────┘
        
        ┌──────────────┐
        │   External   │
        │   APIs       │
        └──────────────┘
        - Docker API
        - OpenProvider
        - CinetPay
        - NotchPay
```

## 🔌 Configuration du Backend

### Prérequis

- Go 1.21+
- PostgreSQL 13+
- Redis 6+
- Docker (optionnel, pour les conteneurs)

### Setup

```bash
cd backend

# Installation des dépendances
go mod download
go mod tidy

# Configuration de la base de données
createdb openspace
psql openspace < migrations/001_init.sql
psql openspace < migrations/002_payment_subscription.sql
psql openspace < migrations/003_domains.sql

# Lancer le serveur
go run cmd/main.go
```

## 📋 Variables d'environnement Backend

Créez un fichier `.env` dans le dossier `backend`:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=openspace

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Server
SERVER_PORT=8080
SERVER_HOST=0.0.0.0

# JWT
JWT_SECRET=your_secret_key_here_min_32_chars
JWT_EXPIRATION=24h

# Payments
CINETPAY_API_KEY=your_cinetpay_key
CINETPAY_SECRET=your_cinetpay_secret
NOTCHPAY_PUBLIC_KEY=your_notchpay_key
NOTCHPAY_PRIVATE_KEY=your_notchpay_secret

# Domains
OPENPROVIDER_API_KEY=your_openprovider_key
OPENPROVIDER_API_USER=your_openprovider_user

# Docker
DOCKER_HOST=unix:///var/run/docker.sock

# Email (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

## 🔌 Configuration du Frontend

### Prérequis

- Node.js 18+
- npm ou yarn

### Setup

```bash
cd frontend

# Installation
npm install

# Création du fichier .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8080/api
EOF

# Lancer le serveur
npm run dev
```

## 🔐 Flux d'authentification

### 1. Inscription

**Frontend**: `POST /register` → Input: email, password, name

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword",
    "name": "Jean Dupont"
  }'
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "Jean Dupont",
    "createdAt": "2024-02-01T12:00:00Z"
  }
}
```

### 2. Connexion

**Frontend**: `POST /login` → Input: email, password

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'
```

### 3. Utilisation du token

**Frontend**: Stocke le token dans localStorage et l'inclut dans tous les appels suivants

```javascript
// Automatique via axios interceptor
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## 📡 Endpoints API

### Auth
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion
- `GET /auth/me` - Informations utilisateur (requiert token)

### Provisioning (Générer des conteneurs)
- `POST /provisioning/containers` - Créer un conteneur
- `GET /provisioning/containers` - Lister les conteneurs
- `GET /provisioning/containers/:id` - Détails d'un conteneur
- `DELETE /provisioning/containers/:id` - Supprimer un conteneur

### Payment
- `POST /payments/initiate` - Initier un paiement
- `POST /payments/verify/:id` - Vérifier un paiement
- `GET /payments` - Historique des paiements

### Subscriptions
- `GET /subscriptions` - Liste des abonnements
- `GET /subscriptions/current` - Abonnement actuel
- `POST /subscriptions` - Créer un abonnement

### Domains
- `GET /domains/search?domain=example.cm` - Rechercher un domaine
- `POST /domains/purchase` - Acheter un domaine
- `GET /domains` - Mes domaines
- `DELETE /domains/:id` - Supprimer un domaine

## 🚀 Deployment

### Docker Compose (Recommandé)

Créez un fichier `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: openspace
      POSTGRES_PASSWORD: secure_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      DB_HOST: postgres
      REDIS_HOST: redis
      DB_PASSWORD: secure_password
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8080/api

volumes:
  postgres_data:
```

Lancer avec:
```bash
docker-compose up
```

## 🧪 Tests

### Backend

```bash
cd backend
go test ./...
go test -v -cover ./...
```

### Frontend

```bash
cd frontend
npm test
npm run test:coverage
```

## 📊 Monitoring

### Backend
- Logs: `stdout` (à configurer vers ELK/Datadog)
- Metrics: Prometheus (à configurer)
- Tracing: Jaeger (optionnel)

### Frontend
- Erreurs: Sentry intégration recommandée
- Analytics: Plausible ou Mixpanel
- Performance: Vercel Analytics (si déployé sur Vercel)

## 🔗 Intégration Paiements

### CinetPay (Cameroun)

1. Configuration dans le backend:
   - `CINETPAY_API_KEY`
   - `CINETPAY_SECRET`

2. Flow:
   - Frontend → Backend `/payments/initiate`
   - Backend → CinetPay API
   - Redirection utilisateur vers CinetPay
   - Webhook notification
   - Frontend validation

### NotchPay (Pan-africain)

1. Configuration similaire
2. Supporte MTN MoMo, Orange Money, etc.

## 🛡️ Sécurité

- [x] JWT authentification
- [x] HTTPS en production
- [x] CORS configuré
- [x] Validation des entrées (Zod/Validator)
- [ ] Rate limiting (à ajouter)
- [ ] 2FA (optionnel)
- [ ] WAF (optionnel)

## 📞 Support & Documentation

- API Docs: Swagger (`/docs` sur le backend)
- Postman Collection: `./postman/OpenSpace.postman_collection.json`
- Frontend Storybook: `npm run storybook`

## ✅ Checklist de déploiement

- [ ] Variables d'environnement configurées
- [ ] Base de données migrée
- [ ] JWT secret fort (32 chars min)
- [ ] HTTPS activé
- [ ] CORS configuré correctement
- [ ] Logs centralisés
- [ ] Monitoring en place
- [ ] Backups automatisés
- [ ] Tests passent
- [ ] Documentation à jour
