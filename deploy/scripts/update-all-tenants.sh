#!/usr/bin/env bash
# =============================================================================
# update-all-tenants.sh — Reconstruye la imagen y actualiza todos los tenants.
# =============================================================================
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CLIENTS_DIR="$ROOT/deploy/clients"

echo "═══════════════════════════════════════════════════════════"
echo "  Actualizando todos los tenants de ERP-Repair"
echo "═══════════════════════════════════════════════════════════"

cd "$ROOT"
echo "▶ Actualizando código con git pull..."
git pull origin main || git pull origin master || true

echo "▶ Reconstruyendo imagen base..."
docker build -t erp-repair:latest -f backend/Dockerfile .

COUNT=0
for CLIENT_DIR in "$CLIENTS_DIR"/*/; do
    [[ -d "$CLIENT_DIR" ]] || continue
    SLUG="$(basename "$CLIENT_DIR")"
    [[ -f "$CLIENT_DIR/docker-compose.yml" ]] || continue

    echo "▶ Actualizando tenant: $SLUG"
    docker compose -f "$CLIENT_DIR/docker-compose.yml" up -d --build api 2>&1 | sed 's/^/  /'
    COUNT=$((COUNT + 1))
done

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  ✅ $COUNT tenants actualizados correctamente"
echo "═══════════════════════════════════════════════════════════"
