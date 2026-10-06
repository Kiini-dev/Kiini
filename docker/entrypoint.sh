#!/bin/sh
set -eu

echo "[docker-entrypoint] Running database initialization"
pnpm exec tsx init-db.ts

echo "[docker-entrypoint] Starting Kiini on port ${PORT:-3005}"
exec node app.js
