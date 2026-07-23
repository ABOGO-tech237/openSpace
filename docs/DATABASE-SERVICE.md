# Service Bases de Données — OpenSpace

## Vue d'ensemble

Le module `backend/internal/databases` provisionne des instances isolées pour chaque utilisateur :

| Moteur | Type | Image Docker | Port |
|--------|------|--------------|------|
| MySQL 8 | SQL | `mysql:8` | 3306 |
| PostgreSQL 16 | SQL | `postgres:16-alpine` | 5432 |
| MongoDB 7 | NoSQL | `mongo:7` | 27017 |
| Redis 7 | NoSQL | `redis:7-alpine` | 6379 |

## API

```
GET    /api/v1/databases           Liste des instances
POST   /api/v1/databases           Créer { name, engine }
GET    /api/v1/databases/:id       Détail + credentials
DELETE /api/v1/databases/:id       Supprimer
GET    /api/v1/databases/:id/users Utilisateurs DB
POST   /api/v1/databases/:id/export Planifier export
```

## Quotas par plan

| Plan | SQL max | NoSQL max | Stockage/DB |
|------|---------|-----------|-------------|
| starter | 1 | 0 | 500 MB |
| dev | 2 | 1 | 1 GB |
| pro | 5 | 2 | 2 GB |
| business | 100 | 100 | 5 GB |

## Sécurité

- Mots de passe chiffrés AES-256-GCM (clé = `JWT_ACCESS_SECRET`)
- Isolation réseau Docker (`openspace_network`)
- Vérification `user_id` sur chaque requête

## Migration

```bash
psql -d openspace -f backend/migrations/009_database_instances.sql
```

## Frontend

Page `/dashboard/databases` — création, liste, credentials, export, suppression.
