# OpenSpace — SaaS Cloud Hosting (niveau Hostinger)

Plateforme cloud pour développeurs et PME africaines. Chaque client obtient un container Docker isolé, un dashboard hPanel-like, et des **bases de données managées SQL/NoSQL**.

## Stack

| Couche | Technologie |
|--------|-------------|
| Backend | Go 1.25 + Fiber |
| Frontend | Next.js 14 + TypeScript + Tailwind |
| Control DB | PostgreSQL 16 |
| Cache | Redis 7 |
| Orchestration | Docker + Traefik |

## Démarrage rapide

```bash
chmod +x launch.sh
./launch.sh

# Terminal 1 — API
cd backend && go run cmd/main.go

# Terminal 2 — Frontend
cd frontend && npm run dev
```

- Dashboard : http://localhost:3000
- API : http://localhost:8080/health

## Fonctionnalités

- Authentification JWT + admin CLI
- Provisioning containers Docker (`openspace-base`)
- **Bases de données** : MySQL, PostgreSQL, MongoDB, Redis
- Paiements CinetPay / NotchPay
- Domaines OpenProvider
- Panel admin + terminal web

## API Bases de données

```
GET    /api/v1/databases
POST   /api/v1/databases          { "name": "mydb", "engine": "mysql" }
GET    /api/v1/databases/:id
DELETE /api/v1/databases/:id
POST   /api/v1/databases/:id/export
```

## Documentation

- `docs/DATABASE-SERVICE.md` — Service DB SQL/NoSQL
- `docs/TESTING.md` — Stratégie de tests
- `STARTUP.md` — Guide complet
- `openspace-specs.md` — Spécifications produit

## Tests

```bash
cd backend && go test ./...
cd tests/e2e && npm install && npx playwright test
```

## Plans (FCFA/mois)

| Plan | SQL | NoSQL | RAM |
|------|-----|-------|-----|
| Starter | 1 | 0 | 512 MB |
| Dev | 2 | 1 | 512 MB |
| Pro | 5 | 2 | 1 GB |
| Business | 100 | 100 | 2 GB |
