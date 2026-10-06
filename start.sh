#!/bin/bash
set -e

APP_ROOT="$(cd "$(dirname "$0")" && pwd)"

NODE_CANDIDATES=(
  /home2/tahanil1/nodevenv/Kiini/22/bin/node
  /home2/tahanil1/nodevenv/Kiini/22/bin/nodejs
  /usr/local/bin/node
  /usr/bin/node
  /bin/node
  /opt/node/bin/node
  /opt/cpanel/ea-nodejs*/bin/node
  /home2/tahanil1/.nvm/versions/node/*/bin/node
)

NODE_BIN=""
for candidate in "${NODE_CANDIDATES[@]}"; do
  if [ -x "$candidate" ]; then
    NODE_BIN="$candidate"
    break
  fi
done

if [ -z "$NODE_BIN" ]; then
  if command -v node >/dev/null 2>&1; then
    NODE_BIN="$(command -v node)"
  fi
fi

if [ -z "$NODE_BIN" ]; then
  echo "ERROR: No Node binary found." >&2
  echo "Checked: ${NODE_CANDIDATES[*]}" >&2
  exit 1
fi

cd "$APP_ROOT"
export NODE_ENV=production

if [ -f "$APP_ROOT/app.pid" ]; then
  OLD_PID="$(cat "$APP_ROOT/app.pid" 2>/dev/null || true)"
  if [ -n "$OLD_PID" ] && ps -p "$OLD_PID" -o args= 2>/dev/null | grep -Fq "$APP_ROOT/app.js"; then
    kill "$OLD_PID" 2>/dev/null || true
    sleep 2
  fi
fi

if command -v pkill >/dev/null 2>&1; then
  pkill -f "$APP_ROOT/app.js" 2>/dev/null || true
  sleep 2
fi

echo "Using Node: $NODE_BIN"

echo "Working directory: $APP_ROOT"

if [ ! -f "$APP_ROOT/dist/index.js" ]; then
  echo "ERROR: dist/index.js not found in $APP_ROOT" >&2
  exit 1
fi

if [ ! -f "$APP_ROOT/scripts/migrate.mjs" ]; then
  echo "ERROR: scripts/migrate.mjs not found in $APP_ROOT" >&2
  exit 1
fi

if [ ! -f "$APP_ROOT/app.js" ]; then
  echo "ERROR: app.js environment bootstrap not found in $APP_ROOT" >&2
  exit 1
fi

chmod +x "$APP_ROOT/start.sh"

nohup "$NODE_BIN" "$APP_ROOT/app.js" > "$APP_ROOT/app.log" 2>&1 &
APP_PID=$!

echo $APP_PID > "$APP_ROOT/app.pid"
echo "Started app with PID $APP_PID"
