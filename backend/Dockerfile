# =============================================================================
# Multi-stage Dockerfile for ERP-Repair (Multi-tenant)
#
# Context: repo root (c:\...\ERP-Repair)
# =============================================================================

# ── Stage 1: web frontend build ──────────────────────────────────────────────
FROM node:20-bookworm-slim AS web-build

WORKDIR /repo

RUN corepack enable \
    && corepack prepare pnpm@10 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY frontend/package.json ./frontend/

RUN pnpm install --frozen-lockfile --filter './frontend'

COPY frontend/ ./frontend/
RUN pnpm --filter './frontend' build

# ── Stage 2: backend build ───────────────────────────────────────────────────
FROM node:20-bookworm-slim AS build

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/package.json backend/prisma.config.ts ./
COPY backend/ ./

RUN npm install --ignore-scripts
RUN npx prisma generate
RUN npm run build

# ── Stage 3: runtime ─────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY --from=build --chown=node:node /app/package.json /app/prisma.config.ts ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/prisma ./prisma
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=web-build --chown=node:node /repo/frontend/dist ./public

RUN mkdir -p /app && chown node:node /app

# Boot entrypoint:
#   1. wait for Postgres (TCP, up to 60s)
#   2. `prisma db push` on the schema (idempotent, retried 3x)
#   3. exec node dist/server.js
RUN cat > /usr/local/bin/docker-entrypoint.sh <<'SH'
#!/bin/bash
set -Eeuo pipefail

DB_HOST="${DB_HOST:-db}"
echo "[entrypoint] Waiting for PostgreSQL (${DB_HOST}:5432, up to 60s)..."
ready=0
for i in $(seq 1 30); do
    if (exec 3<>/dev/tcp/${DB_HOST}/5432) 2>/dev/null; then
        exec 3>&- 3<&-
        ready=1
        break
    fi
    sleep 2
done
if [ "$ready" != "1" ]; then
    echo "[entrypoint] FATAL: PostgreSQL not reachable after 60s" >&2
    exit 1
fi

echo "[entrypoint] Applying database schema (prisma db push)..."
pushed=0
for attempt in 1 2 3; do
    if ./node_modules/.bin/prisma db push --skip-generate; then
        pushed=1
        break
    fi
    echo "[entrypoint] db push attempt $attempt/3 failed, retrying in 5s..."
    sleep 5
done
if [ "$pushed" != "1" ]; then
    echo "[entrypoint] FATAL: Schema sync failed after 3 attempts" >&2
    exit 1
fi

echo "[entrypoint] Starting ERP-Repair API: node dist/server.js"
exec node dist/server.js
SH
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER node
EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
