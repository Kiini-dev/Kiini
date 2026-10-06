#!/bin/bash
set -e

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$APP_DIR/app_restart.log"
PID_FILE="$APP_DIR/app.pid"

echo "=== do_restart.sh ==="
echo "Started at: $(date)"
echo "Application directory: $APP_DIR"
cd "$APP_DIR"

if [ -f "$PID_FILE" ]; then
  OLD_PID=$(cat "$PID_FILE" 2>/dev/null || true)
  if [ -n "$OLD_PID" ] && ps -p "$OLD_PID" -o args= 2>/dev/null | grep -Fq "$APP_DIR/app.js"; then
    echo "Stopping Kiini process $OLD_PID"
    kill "$OLD_PID" 2>/dev/null || true
    for attempt in 1 2 3 4 5; do
      ps -p "$OLD_PID" >/dev/null 2>&1 || break
      sleep 1
    done
    if ps -p "$OLD_PID" >/dev/null 2>&1; then
      echo "ERROR: Existing Kiini process $OLD_PID did not stop."
      exit 1
    fi
  fi
fi

echo "Starting Node.js application..."
echo "PATH=$PATH"
export NODE_ENV=production
export PORT=${PORT:-3000}
echo "NODE_ENV=$NODE_ENV PORT=$PORT"

NODE_BIN=$(command -v node || command -v nodejs || true)
if [ -z "$NODE_BIN" ]; then
  for candidate in "$HOME"/nodevenv/*/*/bin/node /usr/local/bin/node /usr/bin/node /opt/cpanel/ea-nodejs*/bin/node; do
    if [ -x "$candidate" ]; then
      NODE_BIN="$candidate"
      break
    fi
  done
fi
if [ -z "$NODE_BIN" ]; then
  echo "ERROR: Node.js binary not found in PATH, the cPanel nodevenv, or standard locations."
  exit 1
fi

echo "Using Node binary: $NODE_BIN"
export PATH="$(dirname "$NODE_BIN"):$PATH"
"$NODE_BIN" --version || true
if [ ! -f "$APP_DIR/dist/index.js" ] || [ ! -f "$APP_DIR/scripts/migrate.mjs" ]; then
  echo "ERROR: Required application files are missing in $APP_DIR."
  exit 1
fi
if [ ! -f "$APP_DIR/app.js" ]; then
  echo "ERROR: app.js environment bootstrap is missing in $APP_DIR."
  exit 1
fi

nohup "$NODE_BIN" "$APP_DIR/app.js" > "$LOG_FILE" 2>&1 &
APP_PID=$!
echo "$APP_PID" > "$PID_FILE"

for attempt in 1 2 3 4 5 6 7 8 9 10; do
  if ! ps -p "$APP_PID" >/dev/null 2>&1; then
    echo "Application exited during startup. See log: $LOG_FILE"
    tail -40 "$LOG_FILE" || true
    exit 1
  fi
  if curl -fsS --max-time 3 "http://127.0.0.1:$PORT/api/health" 2>/dev/null | grep -Fq '"status":"ok"'; then
    echo "Application started and passed local health check. PID: $APP_PID"
    echo "Log file: $LOG_FILE"
    exit 0
  fi
  sleep 1
done

echo "Application process exists but health check failed on port $PORT."
tail -40 "$LOG_FILE" || true
kill "$APP_PID" 2>/dev/null || true
exit 1
