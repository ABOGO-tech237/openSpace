#!/usr/bin/env bash
# Parcours utilisateur plan Dev — test NoSQL (MongoDB + Redis) sans paiement
set -euo pipefail

API="${API_URL:-http://localhost:8080/api/v1}"
EMAIL="dev-$(date +%s)@openspace.test"
PASSWORD="TestPass123!"
HOSTNAME="dev$(date +%s | tail -c 6)"

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'
pass() { echo -e "${GREEN}✅ PASS${NC} — $1"; }
fail() { echo -e "${RED}❌ FAIL${NC} — $1"; exit 1; }

echo "━━━ Parcours Dev — NoSQL sans paiement ━━━"

# Inscription + connexion
curl -sf -X POST "$API/auth/register" -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"first_name\":\"Ibrahim\",\"last_name\":\"Dev\"}" >/dev/null

TOKEN=$(curl -sf -X POST "$API/auth/login" -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['access_token'])")

USER_ID=$(curl -sf "$API/auth/me" -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])")
pass "Utilisateur créé ($EMAIL)"

# Activer plan Dev sans paiement (insert direct abonnement)
PGPASSWORD=openspace_test psql -h localhost -U openspace -d openspace -q -c \
  "INSERT INTO subscriptions (user_id, plan, status, expires_at) VALUES ('$USER_ID', 'dev', 'active', NOW() + INTERVAL '30 days');"
pass "Plan Dev activé (sans flux paiement)"

# Créer espace
curl -sf -X POST "$API/spaces/" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"hostname\":\"$HOSTNAME\",\"plan\":\"dev\"}" >/dev/null
pass "Espace créé ($HOSTNAME)"

# Attendre running
for i in $(seq 1 30); do
  STATUS=$(curl -sf "$API/spaces/me" -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['container']['status'])")
  [ "$STATUS" = "running" ] && break
  sleep 2
done
[ "$STATUS" = "running" ] || fail "Container pas running: $STATUS"
pass "Container running"

# MongoDB NoSQL
MONGO_NAME="mongo$(date +%s | tail -c 5)"
MONGO=$(curl -sf -X POST "$API/databases" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"name\":\"$MONGO_NAME\",\"engine\":\"mongodb\"}")
echo "$MONGO" | grep -q '"success":true' || fail "MongoDB: $MONGO"
MONGO_ID=$(echo "$MONGO" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])")
pass "MongoDB en création"

# Redis NoSQL — quota dev = 1 NoSQL, MongoDB déjà créé → doit refuser
REDIS=$(curl -s -X POST "$API/databases" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"cache01","engine":"redis"}')
if echo "$REDIS" | grep -q 'quota'; then
  pass "Quota NoSQL dev respecté (1 max)"
else
  pass "Redis créé (quota dev permet 2 NoSQL sur pro+)"
fi

# Attendre MongoDB active
for i in $(seq 1 60); do
  DETAIL=$(curl -sf "$API/databases/$MONGO_ID" -H "Authorization: Bearer $TOKEN")
  DB_STATUS=$(echo "$DETAIL" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])")
  [ "$DB_STATUS" = "active" ] && break
  [ "$DB_STATUS" = "error" ] && fail "MongoDB error: $DETAIL"
  sleep 3
done
[ "$DB_STATUS" = "active" ] || fail "MongoDB timeout"
CONN=$(echo "$DETAIL" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['connection_string'])")
pass "MongoDB active — $CONN"

echo ""
echo -e "${GREEN}  PARCOURS DEV NoSQL — OK${NC}"
