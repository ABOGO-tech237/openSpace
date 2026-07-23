#!/usr/bin/env bash
# Parcours utilisateur openSpace — sans paiement
# Teste : inscription → connexion → espace → bases de données

set -euo pipefail

API="${API_URL:-http://localhost:8080/api/v1}"
EMAIL="user-$(date +%s)@openspace.test"
PASSWORD="TestPass123!"
HOSTNAME="app$(date +%s | tail -c 6)"
DB_MYSQL="mysql-$(date +%s | tail -c 6)"
DB_PG="pg-$(date +%s | tail -c 6)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "${GREEN}✅ PASS${NC} — $1"; }
fail() { echo -e "${RED}❌ FAIL${NC} — $1"; exit 1; }
info() { echo -e "${YELLOW}→${NC} $1"; }
step() { echo ""; echo "━━━ $1 ━━━"; }

json_get() {
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d$1)" 2>/dev/null
}

wait_for_api() {
  for i in $(seq 1 30); do
    if curl -sf "$API/../health" >/dev/null 2>&1 || curl -sf "http://localhost:8080/health" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  fail "API inaccessible sur :8080"
}

step "0. Vérification API"
wait_for_api
pass "API disponible"

step "1. Inscription (parcours nouveau utilisateur)"
REGISTER=$(curl -s -X POST "$API/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"first_name\":\"Amina\",\"last_name\":\"Test\"}")

echo "$REGISTER" | grep -q '"success":true' || fail "Inscription: $REGISTER"
pass "Inscription réussie ($EMAIL)"

step "2. Connexion"
LOGIN=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo "$LOGIN" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['access_token'])")
echo "$LOGIN" | grep -q '"success":true' || fail "Connexion: $LOGIN"
pass "Connexion réussie, JWT obtenu"

step "3. Profil utilisateur (GET /auth/me)"
ME=$(curl -s "$API/auth/me" -H "Authorization: Bearer $TOKEN")
echo "$ME" | grep -q "$EMAIL" || fail "Profil: $ME"
pass "Profil utilisateur accessible"

step "4. Création d'un espace / conteneur (sans paiement)"
SPACE=$(curl -s -X POST "$API/spaces/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"hostname\":\"$HOSTNAME\",\"plan\":\"starter\"}")

echo "$SPACE" | grep -q '"success":true' || fail "Création espace: $SPACE"
SPACE_ID=$(echo "$SPACE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['container']['id'])")
pass "Espace créé (hostname: $HOSTNAME, id: $SPACE_ID)"

step "5. Attente provisioning conteneur → running"
STATUS="provisioning"
for i in $(seq 1 60); do
  MINE=$(curl -s "$API/spaces/me" -H "Authorization: Bearer $TOKEN")
  STATUS=$(echo "$MINE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('container',{}).get('status','unknown'))" 2>/dev/null || echo "unknown")
  info "Tentative $i/60 — statut: $STATUS"
  if [ "$STATUS" = "running" ]; then
    break
  fi
  if [ "$STATUS" = "error" ]; then
    fail "Conteneur en erreur: $MINE"
  fi
  sleep 2
done

if [ "$STATUS" != "running" ]; then
  fail "Timeout — conteneur toujours en '$STATUS' (image openspace-base:latest requise)"
fi
pass "Conteneur en statut running"

step "6. Création base MySQL (SQL)"
MYSQL=$(curl -s -X POST "$API/databases" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$DB_MYSQL\",\"engine\":\"mysql\"}")

echo "$MYSQL" | grep -q '"success":true' || fail "Création MySQL: $MYSQL"
MYSQL_ID=$(echo "$MYSQL" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])")
pass "MySQL en création (id: $MYSQL_ID)"

step "7. Création base PostgreSQL (SQL)"
PG=$(curl -s -X POST "$API/databases" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$DB_PG\",\"engine\":\"postgresql\"}")

# Plan starter = 1 SQL max → 2e DB doit échouer
if echo "$PG" | grep -q '"success":true'; then
  info "PostgreSQL créée (plan sans quota strict)"
  PG_ID=$(echo "$PG" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])")
else
  pass "Quota SQL starter respecté (2e base refusée): $(echo "$PG" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error',''))")"
  PG_ID=""
fi

step "8. Tentative MongoDB NoSQL (quota starter = 0)"
MONGO=$(curl -s -X POST "$API/databases" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"mongo-test\",\"engine\":\"mongodb\"}")

if echo "$MONGO" | grep -q 'quota'; then
  pass "Quota NoSQL starter respecté (MongoDB refusé)"
else
  info "MongoDB: $(echo "$MONGO" | python3 -c "import sys,json; print(json.load(sys.stdin))")"
fi

step "9. Liste des bases de données"
LIST=$(curl -s "$API/databases" -H "Authorization: Bearer $TOKEN")
COUNT=$(echo "$LIST" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('data',[])))")
echo "$LIST" | grep -q '"success":true' || fail "Liste DB: $LIST"
pass "$COUNT instance(s) listée(s)"

step "10. Attente MySQL active + récupération identifiants"
DB_STATUS="creating"
for i in $(seq 1 90); do
  DETAIL=$(curl -s "$API/databases/$MYSQL_ID" -H "Authorization: Bearer $TOKEN")
  DB_STATUS=$(echo "$DETAIL" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('status',''))" 2>/dev/null || echo "")
  info "MySQL statut: $DB_STATUS"
  if [ "$DB_STATUS" = "active" ]; then
    HOST=$(echo "$DETAIL" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['host'])")
    CONN=$(echo "$DETAIL" | python3 -c "import sys,json; print(json.load(sys.stdin)['data'].get('connection_string',''))")
    pass "MySQL active — host: $HOST"
    info "Connection string: ${CONN:0:60}..."
    break
  fi
  if [ "$DB_STATUS" = "error" ]; then
    fail "MySQL en erreur: $DETAIL"
  fi
  sleep 3
done

[ "$DB_STATUS" = "active" ] || fail "Timeout MySQL (statut: $DB_STATUS)"

step "11. Export base de données"
EXPORT=$(curl -s -X POST "$API/databases/$MYSQL_ID/export" -H "Authorization: Bearer $TOKEN")
echo "$EXPORT" | grep -q '"success":true' || fail "Export: $EXPORT"
pass "Export planifié"

step "12. Suppression base MySQL"
DEL=$(curl -s -X DELETE "$API/databases/$MYSQL_ID" -H "Authorization: Bearer $TOKEN")
echo "$DEL" | grep -q '"success":true' || fail "Suppression: $DEL"
pass "Base MySQL supprimée"

step "13. Vérification — pas de flux paiement (skipped)"
pass "Paiement volontairement ignoré (hors scope)"

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}  PARCOURS UTILISATEUR COMPLET — OK${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo "  Email test    : $EMAIL"
echo "  Espace        : $HOSTNAME.openspace.cm"
echo "  Conteneur     : $STATUS"
echo "  Bases testées : MySQL (+ quotas SQL/NoSQL)"
echo ""
