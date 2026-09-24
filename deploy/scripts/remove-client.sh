#!/usr/bin/env bash
# =============================================================================
# remove-client.sh — tear down a client stack, volumes, and Caddy site.
#
# Usage:
#   remove-client.sh <slug>
# =============================================================================
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DEPLOY_DIR="$ROOT/deploy"
CLIENTS_DIR="$DEPLOY_DIR/clients"
SITES_DIR="$DEPLOY_DIR/caddy/sites"
COMPOSE_OP_FILE="$DEPLOY_DIR/docker-compose.yml"

SLUG="${1:-}"

[[ -n "$SLUG" ]] || { echo "ERROR: usage: remove-client.sh <slug>" >&2; exit 1; }
[[ "$SLUG" =~ ^[a-z0-9-]{3,32}$ ]] || { echo "ERROR: invalid slug: '$SLUG'" >&2; exit 1; }

CLIENT_DIR="$CLIENTS_DIR/$SLUG"
[[ -d "$CLIENT_DIR" ]] || { echo "ERROR: client '$SLUG' not found ($CLIENT_DIR)" >&2; exit 1; }

echo "⚠️ This will DELETE client '$SLUG' and its database volumes (PERMANENT DATA LOSS)."
read -r -p "Type the slug to confirm: " ans
[[ "$ans" == "$SLUG" ]] || { echo "aborted (confirmation mismatch)"; exit 1; }

echo "removing stack for '$SLUG' (containers, networks, volumes)..."
docker compose -f "$CLIENT_DIR/docker-compose.yml" down -v --remove-orphans || true

SITE_FILE="$SITES_DIR/$SLUG.caddy"
if [[ -f "$SITE_FILE" ]]; then
    rm -f "$SITE_FILE"
    echo "removed $SITE_FILE"
    if docker compose -f "$COMPOSE_OP_FILE" ps -q caddy >/dev/null 2>&1; then
        echo "reloading Caddy..."
        docker compose -f "$COMPOSE_OP_FILE" exec -T caddy caddy reload --config /etc/caddy/Caddyfile || true
    fi
fi

rm -rf "$CLIENT_DIR"
echo "✅ client '$SLUG' removed."
echo "note: database backups (deploy/backups/$SLUG) were kept intact."
