# Stratégie de tests — OpenSpace

## Tests unitaires backend

```bash
cd backend
go test ./internal/databases/... -v
go test ./... -v
```

Couverture : validation noms DB, moteurs, quotas, chiffrement credentials.

## Tests manuels (parcours utilisateur)

### Débutant WordPress (Amina)
1. S'inscrire sur `/register`
2. Créer un espace (plan starter)
3. Aller sur `/dashboard/databases`
4. Créer MySQL `blog-db`
5. Copier les identifiants → tester connexion

### Développeur full-stack (Ibrahim)
1. Plan dev ou pro
2. Créer MongoDB `api-data`
3. Créer Redis `cache`
4. Vérifier connection strings

### Admin
1. `go run cmd/createsuperuser/main.go`
2. `/admin` — lister containers, restart, delete

## Tests E2E (Playwright)

```bash
cd tests/e2e
npm install
npx playwright install
npx playwright test
```

Scénarios dans `tests/e2e/databases/` :
- `create-mysql.spec.ts`
- `create-mongodb.spec.ts`
- `quota-exceeded.spec.ts`

## Prérequis environnement de test

- Docker daemon actif
- PostgreSQL + Redis (`docker compose up -d postgres redis`)
- Image `openspace-base:latest` (`docker build -t openspace-base:latest docker-base/`)
