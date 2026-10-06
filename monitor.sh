#!/bin/bash
set -u

APP_ROOT="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="$APP_ROOT/monitor.log"
APP_LOG="$APP_ROOT/app.log"
PID_FILE="$APP_ROOT/app.pid"
LOCK_DIR="$APP_ROOT/.monitor.lock"
START_STAMP="$APP_ROOT/.monitor.last-start"

if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  exit 0
fi
trap 'rmdir "$LOCK_DIR" 2>/dev/null || true' EXIT

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$1" >> "$LOG_FILE"
}

if [ ! -f "$APP_ROOT/dist/index.js" ]; then
  log "ERROR: dist/index.js not found"
  exit 1
fi
if [ ! -f "$APP_ROOT/app.js" ]; then
  log "ERROR: app.js environment bootstrap not found"
  exit 1
fi

if [ -f "$PID_FILE" ]; then
  APP_PID="$(cat "$PID_FILE" 2>/dev/null || true)"
  if [ -n "$APP_PID" ] && kill -0 "$APP_PID" 2>/dev/null; then
    if [ -r "/proc/$APP_PID/cmdline" ] && tr '\0' ' ' < "/proc/$APP_PID/cmdline" | grep -Fq "$APP_ROOT/app.js"; then
      exit 0
    fi
  fi
fi

# Avoid a restart loop when the app exits immediately due to configuration or database errors.
if [ -f "$START_STAMP" ]; then
  LAST_START="$(cat "$START_STAMP" 2>/dev/null || echo 0)"
  NOW="$(date +%s)"
  if [ "$LAST_START" -gt 0 ] && [ $((NOW - LAST_START)) -lt 60 ]; then
    exit 0
  fi
fi

NODE_BIN=""
for candidate in \
  "$APP_ROOT/nodevenv/Kiini/22/bin/node" \
  "/home/melitec1/nodevenv/Kiini/22/bin/node" \
  "/usr/local/bin/node" \
  "/usr/bin/node" \
  "/opt/cpanel/ea-nodejs*/bin/node" \
  "/home/melitec1/.nvm/versions/node/*/bin/node"; do
  if [ -x "$candidate" ]; then
    NODE_BIN="$candidate"
    break
  fi
done

if [ -z "$NODE_BIN" ] && command -v node >/dev/null 2>&1; then
  NODE_BIN="$(command -v node)"
fi

if [ -z "$NODE_BIN" ]; then
  log "ERROR: Node.js binary not found"
  exit 1
fi

cd "$APP_ROOT" || exit 1
export NODE_ENV=production
date +%s > "$START_STAMP"
nohup "$NODE_BIN" "$APP_ROOT/app.js" >> "$APP_LOG" 2>&1 &
echo $! > "$PID_FILE"
log "Started Kiini with PID $(cat "$PID_FILE") using $NODE_BIN"
