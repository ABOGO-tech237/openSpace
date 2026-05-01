# 📊 OpenSpace - Architecture & Status Summary

**Date**: 2026-04-09
**Système**: SaaS Cloud Hosting pour développeurs africains
**Stack**: Go 1.22 + Fiber, PostgreSQL 16, Redis 7, Docker, Next.js 14

---

## 🏗️ Architecture Globale

```
┌─────────────────────────────────────────────────────────────────┐
│                      OPENSPACE PLATFORM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐          ┌──────────────────────────┐    │
│  │  FRONTEND (Next) │          │   BACKEND (Go + Fiber)   │    │
│  │  - Dashboard     │◄────────►│  - API REST              │    │
│  │  - Auth Pages    │  HTTP    │  - Provisioning         │    │
│  │  - Payment UI    │  (8000)  │  - Docker Management    │    │
│  └──────────────────┘          │  - Payment Webhooks     │    │
│                                 │  - Domain Management    │    │
│                                 └──────────────────────────┘    │
│                                          │                      │
│                                 ┌────────┼────────────┐        │
│                                 │        │            │        │
│                        ┌────────▼─┐  ┌──▼──────┐  ┌──▼──────┐ │
│                        │PostgreSQL│  │  Redis  │  │ Docker  │ │
│                        │    DB    │  │  Cache  │  │ Engine  │ │
│                        │  (5432)  │  │ (6379)  │  │ (CLI)   │ │
│                        └──────────┘  └─────────┘  └─────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Backend - Structure des Dossiers

```
backend/
├── cmd/
│   ├── main.go                    ← Point d'entrée serveur API
│   └── createsuperuser/main.go    ← CLI pour créer admin (nouveau ✨)
│
├── internal/
│   ├── auth/                      ← Authentification JWT (IMPLÉMENTÉE ✅)
│   │   ├── handler.go             ← /auth/register, /auth/login, /auth/me
│   │   ├── middleware.go          ← Protection JWT des routes
│   │   ├── jwt.go                 ← GenerateTokenPair()
│   │   ├── model.go               ← UserResponse struct
│   │   └── service.go             ← Logique Register, Login, GetByID
│   │
│   ├── user/                      ← Gestion utilisateurs
│   │   ├── model.go               ← User struct (avec is_admin ✨)
│   │   ├── repository.go          ← CRUD + EmailExists
│   │   └── service.go
│   │
│   ├── provisioning/              ← ⚠️ CONTENEURS - BUGS DÉTECTÉS
│   │   ├── model.go               ← Container, Plan structs
│   │   ├── handler.go             ← Create, GetMine, Delete
│   │   ├── service.go             ← ❌ UpdateStatus bugs
│   │   ├── docker.go              ← CreateContainer, StopContainer
│   │   └── repository.go          ← ❌ UpdateStatus cherche par docker_id
│   │
│   ├── payment/                   ← Paiements (CinetPay, NotchPay)
│   ├── subscription/              ← Abonnements
│   ├── domain/                    ← Domaines (OpenProvider)
│   └── ... autres modules
│
├── pkg/
│   ├── config/config.go           ← Configuration centralisée
│   ├── database/postgres.go       ← Pool connexion pgxpool
│   └── cache/redis.go             ← Connexion Redis
│
├── migrations/
│   ├── 001_init.sql               ← Schéma initial (✅ exécutée)
│   └── 002_add_is_admin.sql       ← Colonne is_admin (✅ exécutée)
│
├── .env                           ← Variables d'environnement
├── docker-compose.yml             ← Services locaux
├── Dockerfile                     ← Build image Docker
└── go.mod/go.sum                  ← Dépendances Go
```

---

## 🗄️ Base de Données - État Actuel

### Tables Créées (5)
| Table | Colonnes | Trigger | État |
|-------|----------|---------|------|
| `users` | 8 + is_admin | ✅ update_users_updated_at | ✅ OK |
| `containers` | 12 | ✅ update_containers_updated_at | ⚠️ Bugs détectés |
| `subscriptions` | 8 | ✅ update_subscriptions_updated_at | OK |
| `payments` | 10 | ✅ update_payments_updated_at | OK |
| `domains` | 12 | ✅ update_domains_updated_at | OK |

### État des Containers
```sql
-- Résultat actuel:
SELECT COUNT(*) FROM containers;
-- Résultat: 1 (un seul container)

-- Détails:
id          | 9194a65f-3f64-4fe1-8eeb-950a7cb9e71e
hostname    | otakrew
plan        | starter
status      | provisioning  ← ⚠️ Bloqué en "provisioning"!
docker_id   | pending       ← ⚠️ Jamais mis à jour!
internal_ip | (vide)        ← ⚠️ Non rempli!
created_at  | 2026-04-07 03:13:30
```

---

## 🚨 Problèmes Détectés

### Niveau 1: BUGS CRITIQUES 🔴

#### Bug #1: UpdateStatus cherche par wrong field
**Fichier**: `internal/provisioning/repository.go:76-80`
```go
// ❌ ACTUELLEMENT
func (r *Repository) UpdateStatus(ctx context.Context, dockerID, status string) error {
	query := `UPDATE containers SET status = $1, updated_at = NOW() WHERE docker_id = $2`
	_, err := r.db.Exec(ctx, query, status, dockerID)
	return err
}

// ✅ DEVRAIT ÊTRE
func (r *Repository) UpdateStatus(ctx context.Context, id, status string) error {
	query := `UPDATE containers SET status = $1, updated_at = NOW() WHERE id = $2`
	_, err := r.db.Exec(ctx, query, status, id)
	return err
}
```

**Impact**:
- À la ligne 62 de `service.go`, on appelle `UpdateStatus(bgCtx, record.ID, "error")`
- Mais UpdateStatus cherche par `docker_id` au lieu de `id`
- Le container n'est jamais marqué comme "error" en cas de problème → reste en "provisioning"
- **Ceci explique pourquoi le container reste en "provisioning"!**

#### Bug #2: Deprovision utilise mauvais paramètre
**Fichier**: `internal/provisioning/service.go:102`
```go
// ❌ ACTUELLEMENT
s.repo.UpdateStatus(ctx, container.DockerID, "removed")

// ✅ DEVRAIT ÊTRE
s.repo.UpdateStatus(ctx, container.ID, "removed")
```

### Niveau 2: DESIGN ISSUES 🟡

#### Issue #3: Pas de vérification si Docker daemon est actif
**Fichier**: `cmd/main.go:44-48`

Actuellement le code ne vérifie pas si Docker est accessible. Si Docker n'est pas running, le `NewDockerClient()` va échouer silencieusement parce que la goroutine en arrière-plan fera juste un log et retournera.

```go
// Solution: Tester la connexion Docker
dockerClient, err := provisioning.NewDockerClient()
if err != nil {
	log.Fatalf("❌ Impossible de se connecter à Docker: %v", err)
}
```

#### Issue #4: Image Docker "openspace-base:latest" n'existe pas
**Fichier**: `internal/provisioning/docker.go:43`

```go
Image: "openspace-base:latest", // ← Cette image n'existe pas!
```

Pour que les containers se créent, il faut d'abord construire cette image:
- Elle doit contenir: Nginx, PHP, Node.js, SFTP
- Actuellement elle n'existe pas → `ContainerCreate` va échouer

#### Issue #5: Pas de retry logic
Si la création Docker échoue (timeout, image manquante, etc.), il n'y a pas de retry. Le container reste bloqué en "provisioning".

---

## ✅ Ce qui Fonctionne

### Authentification (100% IMPLÉMENTÉE)
- ✅ POST `/api/v1/auth/register` → Crée utilisateur
- ✅ POST `/api/v1/auth/login` → Retourne access_token + refresh_token
- ✅ GET `/api/v1/auth/me` → Profil utilisateur (protégé JWT)
- ✅ Support `is_admin` (nouveau)
- ✅ Compression bcrypt des mots de passe
- ✅ Messages d'erreur génériques (sécurité)

### Dashboard Frontend
- ✅ Layout avec sidebar + app bar (nouvelle)
- ✅ Affichage état container
- ✅ Page d'accueil avec métriques
- ✅ Responsive design (mobile/desktop)
- ✅ Badge "Admin" pour utilisateurs admin

### Admin CLI (NOUVELLE)
- ✅ Commande `go run cmd/createsuperuser/main.go`
- ✅ Crée utilisateur avec `is_admin=true`
- ✅ Demande password masquée (term.ReadPassword)
- ✅ Confirmation avant création

### Migrations PostgreSQL
- ✅ Version 001: Schéma complet créé
- ✅ Version 002: Colonne `is_admin` ajoutée
- ✅ Tous les triggers actifs
- ✅ Index de performance créés

---

## 🔧 Prochaines Étapes (PRIORITAIRES)

### URGENT (Blocker)
1. **Créer image Docker `openspace-base:latest`**
   - Dockerfile avec Nginx, PHP, Node.js
   - Push vers registry local ou Docker Hub
   - Tester avec `docker pull openspace-base:latest`

2. **Fixer le bug UpdateStatus**
   - Replacer `dockerID` par `id` dans la méthode
   - Corriger les appels dans `service.go:62, 102, 164`
   - Tester que le status passe à "running"

3. **Vérifier Docker daemon**
   - S'assurer que `docker ps` fonctionne
   - Corriger les permission si nécessaire

### IMPORTANT
4. **Tester le flow complet**
   - Créer utilisateur admin
   - Login → récupérer token
   - POST `/api/v1/spaces/` avec plan "starter"
   - Vérifier que container se crée en 5-10 secondes
   - Vérifier status passe de "provisioning" → "running"

5. **Ajouter retry logic**
   - Si CreateContainer échoue, retry 3x avec backoff
   - Ne pas blocker indéfiniment en "provisioning"

6. **API pour lister tous les containers (admin)**
   - GET `/api/v1/admin/containers` (admin only)
   - Pour inspectionner l'état

---

## 🎯 État Résumé par Module

| Module | Statut | Notes |
|--------|--------|-------|
| **Auth** | ✅ 100% | Register, Login, Me fonctionnels |
| **User** | ✅ 95% | Avec nouveau champ `is_admin` |
| **Provisioning** | 🔴 30% | Bugs critiques à fixer |
| **Subscriptions** | ⏳ 0% | Pas implémenté |
| **Payments** | ⏳ 0% | Pas implémenté |
| **Domains** | ⏳ 0% | Pas implémenté |
| **Frontend Dashboard** | ✅ 80% | Layout OK, API à connecter |

---

## 🚀 Démarrage de l'Application

### Terminal 1: Backend
```bash
cd backend
go run cmd/main.go
# Serveur démarrera sur http://localhost:8000
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
# Interface sur http://localhost:3000
```

### Terminal 3: Créer Admin
```bash
cd backend
go run cmd/createsuperuser/main.go
# Suivre les prompts
```

### Base de Données
PostgreSQL doit tourner avec postgres:
- Host: localhost
- Port: 5432
- User: otaku_krew_user_db
- Password: otaku_krew_passwords_db
- Database: openspace

---

## 📋 Fichiers à Modifier (CORRIGER LES BUGS)

1. **internal/provisioning/repository.go** - UpdateStatus method
2. **internal/provisioning/service.go** - Appels à UpdateStatus
3. **Créer Dockerfile pour openspace-base**
4. **Tester avec container réel**

---

## 🔐 Sécurité - Checklist

- ✅ JWT access/refresh tokens
- ✅ CORS configuré (openspace.com + localhost:3000)
- ✅ Rate limiting (100 req/min)
- ✅ Helmet headers sécurité
- ✅ Passwords hashés (bcrypt, coût 12)
- ✅ Erreurs génériques (no info leak)
- ✅ SQL injection protection (pgx prepared statements)
- ⏳ HTTPS en production
- ⏳ CSRF protection
- ⏳ 2FA (TODO)

---

**Généré**: 2026-04-09
**Système**: Inspection complète des sources

---

## 🔧 CORRECTIONS APPLIQUÉES (2026-04-09)

### ✅ Bug #1 FIXÉ: UpdateStatus cherche par wrong field
**Fichier**: `internal/provisioning/repository.go:76-80`

```diff
- func (r *Repository) UpdateStatus(ctx context.Context, dockerID, status string) error {
-     query := `UPDATE containers SET status = $1, updated_at = NOW() WHERE docker_id = $2`
-     _, err := r.db.Exec(ctx, query, status, dockerID)

+ func (r *Repository) UpdateStatus(ctx context.Context, id, status string) error {
+     query := `UPDATE containers SET status = $1, updated_at = NOW() WHERE id = $2`
+     _, err := r.db.Exec(ctx, query, status, id)
```

### ✅ Bug #2 FIXÉ: Deprovision utilise mauvais paramètre
**Fichier**: `internal/provisioning/service.go:102`

```diff
- s.repo.UpdateStatus(ctx, container.DockerID, "removed")
+ s.repo.UpdateStatus(ctx, container.ID, "removed")
```

### ⏳ Reste à corriger
1. **Créer image Docker `openspace-base:latest`** - BLOQUANT
2. **Tester le flux complet** - Pour confirmer que les corrections fonctionnent 
3. **Ajouter retry logic** - Pour éviter les blocages en"provisioning"

---

## 📈 Test: Créer un Container

Après avoir créé l'image Docker et lancé le backend:

```bash
# 1. Créer un utilisateur admin
go run cmd/createsuperuser/main.go
# Email: test@openspace.cm
# Mot de passe: TestPass123

# 2. Créer un token (depuis frontend ou curl)
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@openspace.cm","password":"TestPass123"}'

# Copier le access_token retourné

# 3. Créer un container
curl -X POST http://localhost:8000/api/v1/spaces/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"hostname":"myspace","plan":"starter"}'

# Réponse attendue:
# {
#   "success": true,
#   "message": "Votre espace est en cours de création — prêt dans quelques secondes",
#   "data": {
#     "container": {
#       "id": "...",
#       "hostname": "myspace",
#       "status": "provisioning",  ← Initially
#       "docker_id": "pending"
#     },
#     "url": "myspace.openspace.cm"
#   }
# }

# 4. Poll le status
sleep 5
curl -X GET http://localhost:8000/api/v1/spaces/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

# Status devrait être "running" après 5-10 secondes
```

