#!/bin/bash
# Comprehensive restart script for Kiini Node.js application
echo "=== Kiini Application Restart Script ==="
echo "Started at: $(date)"

DEFAULT_APP_DIR="/home/melitec1/Kiini"
LEGACY_APP_DIR="/home3/kiiniafr/public_html/Kiini"
if [ -d "$DEFAULT_APP_DIR" ]; then
  APP_DIR="$DEFAULT_APP_DIR"
elif [ -d "$LEGACY_APP_DIR" ]; then
  APP_DIR="$LEGACY_APP_DIR"
else
  echo "ERROR: Application directory not found. Checked: $DEFAULT_APP_DIR, $LEGACY_APP_DIR"
  exit 1
fi
cd "$APP_DIR" || exit 1

NODE_BIN=$(command -v node || command -v nodejs || true)
if [ -z "$NODE_BIN" ]; then
  NODE_CANDIDATES=(
    /home/melitec1/nodevenv/Kiini/22/bin/node
    /home/melitec1/nodevenv/Kiini/22/bin/nodejs
    /usr/local/bin/node
    /usr/bin/node
    /bin/node
    /opt/node/bin/node
    /opt/alt/nodejs*/bin/node
    /opt/cpanel/ea-nodejs*/bin/node
    /opt/cpanel/ea-nodejs*/bin/nodejs
    /home/melitec1/.nvm/versions/node/*/bin/node
    /home/melitec1/.nvm/versions/node/*/bin/nodejs
  )
  for candidate in "${NODE_CANDIDATES[@]}"; do
    if [ -x "$candidate" ]; then
      NODE_BIN="$candidate"
      break
    fi
  done
fi
if [ -z "$NODE_BIN" ]; then
  NODE_BIN=$(find /home/melitec1 /usr /opt -maxdepth 4 \( -name node -o -name nodejs \) -type f -perm -111 2>/dev/null | head -n 1 || true)
fi
if [ -n "$NODE_BIN" ]; then
  echo "Using Node binary: $NODE_BIN"
  export PATH="$(dirname "$NODE_BIN"):$PATH"
else
  echo "WARNING: Node.js binary not found on PATH. Some start methods may fail."
fi
echo "Working directory: $(pwd)"

echo "Checking for existing Node.js processes..."
NODE_PROCESSES=$(ps aux | grep -E "node.*server|node.*app|node.*dist/index.js" | grep -v grep | awk '{print $2}')
if [ -n "$NODE_PROCESSES" ]; then
    echo "Found Node.js processes: $NODE_PROCESSES"
    echo "Terminating existing processes..."
    kill -9 $NODE_PROCESSES 2>/dev/null
    sleep 3
    echo "Processes terminated."
else
    echo "No existing Node.js processes found."
fi

# Check if PM2 is available and try to restart via PM2
if command -v pm2 &> /dev/null; then
    echo "PM2 found. Checking for PM2 processes..."
    PM2_PROCESSES=$(pm2 list | grep -E "Kiini|app" | wc -l)
    if [ "$PM2_PROCESSES" -gt 0 ]; then
        echo "Restarting via PM2..."
        pm2 restart all
        pm2 save
        echo "PM2 restart completed."
        exit 0
    fi
fi

# Check if the application has a start script
if [ -f "package.json" ]; then
    echo "Found package.json. Checking for start script..."
    START_SCRIPT=$(grep -o '"start": "[^"]*"' package.json | cut -d'"' -f4)
    if [ -n "$START_SCRIPT" ]; then
        export NODE_ENV=production
        export PORT=${PORT:-3000}
        echo "Starting application with: NODE_ENV=$NODE_ENV PORT=$PORT npm start"
        nohup env NODE_ENV=$NODE_ENV PORT=$PORT npm start > app_restart.log 2>&1 &
        echo $! > app.pid
        sleep 3
        if ps -p $(cat app.pid) > /dev/null; then
            echo "Application started successfully. PID: $(cat app.pid)"
        else
            echo "Failed to start application. Check app_restart.log for details."
        fi
    else
        echo "No start script found in package.json"
    fi
else
    echo "No package.json found"
fi

# Alternative: Try to start with node directly
if [ -f "server/index.js" ] || [ -f "server/index.ts" ]; then
    echo "Attempting to start server directly..."
    if [ -f "server/index.js" ]; then
        nohup node server/index.js > server_restart.log 2>&1 &
    elif [ -f "server/index.ts" ]; then
        # Check if ts-node is available
        if command -v ts-node &> /dev/null; then
            nohup ts-node server/index.ts > server_restart.log 2>&1 &
        else
            echo "ts-node not available for TypeScript files"
        fi
    fi
    echo $! > server.pid
    sleep 3
    if ps -p $(cat server.pid) > /dev/null; then
        echo "Server started successfully. PID: $(cat server.pid)"
    else
        echo "Failed to start server. Check server_restart.log for details."
    fi
fi

echo "Restart script completed at: $(date)"
echo "=== End of Restart Script ==="