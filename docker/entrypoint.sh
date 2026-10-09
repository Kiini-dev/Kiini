#!/bin/sh
set -eu

if [ -z "${DATABASE_URL:-}" ] && [ -n "${MYSQL_URL:-}" ]; then
  export DATABASE_URL="$MYSQL_URL"
  echo "[docker-entrypoint] Using MYSQL_URL for database initialization"
fi

echo "[docker-entrypoint] Starting Kiini on port ${PORT:-3005}"
exec node app.js
