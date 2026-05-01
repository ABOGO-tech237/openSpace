# CLAUDE.md — OpenSpace API

## Vue d'ensemble

OpenSpace est une plateforme SaaS d'hébergement cloud ciblant les développeurs et étudiants africains. Chaque client obtient un container Docker isolé avec un sous-domaine `hostname.openspace.cm`, un espace de stockage et des ressources CPU/RAM selon son plan.

**Fondateur** : Emmanuel Atangana Abogo — AURORA IT Corporation  
**Stack** : Go 1.22 + Fiber, PostgreSQL 16, Redis 7, Docker, Traefik  
**Monnaie** : FCFA (Franc CFA)

---

## Architecture

```
openspace/
├── cmd/main.go                    # Point d'entrée — Fiber + middlewares
├── internal/
│   ├── auth/                      # Authentification JWT
│   │   ├── handler.go             # Routes HTTP : register, login, me
│   │   ├── jwt.go                 # Génération access + refresh tokens
│   │   ├── middleware.go          # Middleware JWT pour routes protégées
│   │   └── service.go             # Logique métier : bcrypt, tokens
│   ├── user/                      # Utilisateurs
│   │   ├── model.go               # Structs : User, RegisterRequest, LoginRequest
│   │   └── repository.go          # CRUD PostgreSQL
│   └── provisioning/              # Gestion containers clients
│       ├── model.go               # Plans, struct Container, ProvisionRequest
│       ├── repository.go          # CRUD PostgreSQL containers
│       ├── docker.go              # Docker SDK — create/stop/remove containers
│       ├── service.go             # Orchestration provisioning en goroutine
│       └── handler.go             # Routes HTTP : create, get, delete
├── pkg/
│   ├── config/config.go           # Config centralisée depuis .env
│   ├── database/postgres.go       # Connexion pgxpool PostgreSQL
│   └── cache/redis.go             # Connexion Redis
├── migrations/
│   └── 001_init.sql               # Schéma complet avec triggers
├── Dockerfile                     # Multi-stage build Go → Alpine
├── docker-compose.yml             # API + PostgreSQL + Redis + Traefik
├── go.mod                         # Dépendances Go
└── .env.example                   # Template variables d'environnement
```

---

## Plans et tarification

Définis dans `internal/provisioning/model.go` — variable `Plans` :

| Plan     | RAM   | CPU | Stockage | Prix FCFA/mois |
|----------|-------|-----|----------|----------------|
| starter  | 512m  | 0.5 | 5 Go     | 2 000          |
| dev      | 512m  | 1.0 | 10 Go    | 3 500          |
| pro      | 1g    | 2.0 | 20 Go    | 6 000          |
| business | 2g    | 4.0 | 40 Go    | 12 000         |

Pour modifier les plans, éditer uniquement `Plans` dans `model.go`.

---

## Routes API existantes

### Publiques
```
GET  /                          Health check basique
GET  /health                    Status API + DB + Redis
POST /api/v1/auth/register      Créer un compte
POST /api/v1/auth/login         Se connecter → retourne TokenPair
```

### Protégées (JWT Bearer requis)
```
GET    /api/v1/auth/me          Profil utilisateur courant
POST   /api/v1/spaces/          Créer un container (provisioning)
GET    /api/v1/spaces/me        Récupérer son container
DELETE /api/v1/spaces/me        Supprimer son container
```

### Format de réponse standard
```json
{
  "success": true | false,
  "message": "...",
  "data": { ... },
  "error": "..." 
}
```

---

## Middlewares globaux (main.go)

Dans l'ordre d'application :
1. `recover` — capture les panics sans crash serveur
2. `helmet` — headers de sécurité HTTP
3. `logger` — logs format `[time] status method path latency`
4. `cors` — origines autorisées : `openspace.cm` + `localhost:3000`
5. `limiter` — 100 requêtes/minute par IP

---

## Auth — Fonctionnement JWT

**Access token** : 15 minutes, signé avec `JWT_ACCESS_SECRET`  
**Refresh token** : 7 jours, signé avec `JWT_REFRESH_SECRET`

Le middleware `auth.Middleware(cfg)` :
1. Lit le header `Authorization: Bearer <token>`
2. Valide la signature et l'expiration
3. Injecte `user_id` et `email` dans `c.Locals()`

Dans un handler protégé, récupérer l'utilisateur :
```go
userID := c.Locals("user_id").(string)
email  := c.Locals("email").(string)
```

**Sécurité login** : message d'erreur générique "email ou mot de passe incorrect" — ne jamais révéler si l'email existe.

---

## Provisioning Docker — Fonctionnement

Flux quand un client crée un espace :

```
POST /api/v1/spaces/
    ↓
Handler.Create()
    ↓
Service.Provision()
    ├── Validation hostname (regex: ^[a-z0-9][a-z0-9-]*[a-z0-9]$, 3-30 chars)
    ├── Vérifier hostname disponible en BDD
    ├── Créer enregistrement container status="provisioning"
    └── Goroutine en arrière-plan →
            DockerClient.CreateContainer()
            ├── Image: openspace-base:latest
            ├── RAM limit via Memory (bytes)
            ├── CPU limit via NanoCPUs
            ├── Volume: /var/openspace/data/{hostname} → /var/www
            ├── Network: openspace_network
            └── Labels Traefik pour HTTPS automatique
            ↓
            GetContainerIP()
            ↓
            UpdateDockerID() → status="running"
```

Le client reçoit une réponse immédiate avec `status: "provisioning"`. Il doit poller `GET /api/v1/spaces/me` pour voir quand `status` passe à `"running"`.

**Isolation** : chaque container a ses propres cgroups (RAM + CPU) — un client ne peut pas monopoliser les ressources du VPS.

---

## Base de données

### Connexion
Pool `pgxpool` configuré dans `pkg/database/postgres.go`. La variable globale `database.DB` est accessible partout mais préférer l'injection de dépendances via les repositories.

### Schéma
Voir `migrations/001_init.sql` — deux tables principales :

**users** : `id (uuid)`, `email`, `password (bcrypt)`, `first_name`, `last_name`, `is_verified`, `created_at`, `updated_at`

**containers** : `id (uuid)`, `user_id (fk)`, `docker_id`, `hostname (unique)`, `plan`, `ram_limit`, `cpu_limit`, `storage_gb`, `status`, `internal_ip`, `created_at`, `updated_at`

Triggers automatiques `updated_at` sur les deux tables.

---

## Variables d'environnement

Toutes définies dans `.env.example`. Copier en `.env` avant de démarrer.

| Variable | Description | Défaut |
|----------|-------------|--------|
| APP_PORT | Port du serveur | 8080 |
| APP_ENV | development / production | development |
| DB_HOST | Hôte PostgreSQL | localhost |
| DB_PORT | Port PostgreSQL | 5432 |
| DB_USER | Utilisateur PostgreSQL | postgres |
| DB_PASSWORD | Mot de passe PostgreSQL | — |
| DB_NAME | Nom de la base | openspace |
| REDIS_HOST | Hôte Redis | localhost |
| REDIS_PASSWORD | Mot de passe Redis | — |
| JWT_ACCESS_SECRET | Secret access token | **CHANGER EN PROD** |
| JWT_REFRESH_SECRET | Secret refresh token | **CHANGER EN PROD** |
| JWT_ACCESS_EXPIRY | Durée access token (minutes) | 15 |
| JWT_REFRESH_EXPIRY | Durée refresh token (heures) | 168 |

---

## Démarrage

```bash
# Développement
cp .env.example .env
docker-compose up -d
go run cmd/main.go

# Production
docker-compose up -d --build

# Vérifier
curl http://localhost:8080/health
```

---

## Ce qui reste à implémenter

### Étape 4 — Paiement
- Intégration **CinetPay** et **NotchPay** (Mobile Money camerounais)
- Table `payments` et table `subscriptions`
- Webhook de confirmation de paiement → déclenche provisioning
- Gestion expiration abonnement → arrêt container

### Étape 5 — Domaines
- Intégration **OpenProvider API**
- Routes : rechercher domaine, acheter, renouveler, lister
- Table `domains` liée à `users`
- DNS automatique via OpenProvider

### Étape 6 — Frontend Next.js
- Dashboard client : état container, usage, abonnement
- Page d'achat de domaine
- Page de gestion des plans
- Interface de déploiement

### Étape 7 — Image de base client
- Construire `openspace-base:latest` — image Docker custom
- Nginx + PHP + Node.js + accès SFTP
- Script d'initialisation par hostname

---

## Conventions de code

- Nommage Go standard : `CamelCase` pour exporté, `camelCase` pour privé
- Handlers retournent toujours `fiber.Map{"success": bool, ...}`
- Erreurs utilisateur en **français**, logs serveur en **anglais**
- Jamais exposer les détails d'erreur système au client
- Toujours valider les inputs avant traitement
- Goroutines pour les opérations longues (provisioning, emails)

---

## Dépendances principales

```
github.com/gofiber/fiber/v2          — Framework HTTP
github.com/golang-jwt/jwt/v5         — JWT
github.com/jackc/pgx/v5              — PostgreSQL driver
github.com/redis/go-redis/v9         — Redis client
github.com/docker/docker/client      — Docker SDK
github.com/go-playground/validator   — Validation structs
github.com/joho/godotenv             — Chargement .env
golang.org/x/crypto                  — bcrypt
```
