#!/bin/bash
# Deployment extraction and restart script for Kiini
set -e

DEFAULT_DEPLOY_DIR="/home/melitec1/Kiini"
LEGACY_DEPLOY_DIR="/home3/kiiniafr/public_html/Kiini"
if [ -d "$DEFAULT_DEPLOY_DIR" ]; then
  DEPLOY_DIR="$DEFAULT_DEPLOY_DIR"
elif [ -d "$LEGACY_DEPLOY_DIR" ]; then
  DEPLOY_DIR="$LEGACY_DEPLOY_DIR"
else
  DEPLOY_DIR="$DEFAULT_DEPLOY_DIR"
fi
BACKUP_DIR="$DEPLOY_DIR/backup-$(date +%Y%m%d_%H%M%S)"

echo "=========================================="
echo "Kiini Deployment Script"
echo "Started: $(date)"
echo "Target deploy directory: $DEPLOY_DIR"
echo "=========================================="

# Create backup
echo "Creating backup of current deployment..."
if [ -d "$DEPLOY_DIR/dist" ]; then
    mkdir -p "$BACKUP_DIR"
    cp -r "$DEPLOY_DIR/dist" "$BACKUP_DIR/" || true
    cp "$DEPLOY_DIR/package.json" "$BACKUP_DIR/" 2>/dev/null || true
    echo "✓ Backup created at: $BACKUP_DIR"
fi

# Kill existing Node.js processes
echo "Stopping existing application processes..."
pkill -f "node.*index.js" 2>/dev/null || true
pkill -f "node.*app.js" 2>/dev/null || true
pkill -f "npm.*start" 2>/dev/null || true
sleep 2

# Extract deployment package if it exists
if [ -f "$DEPLOY_DIR/deploy.zip" ]; then
    echo "Extracting deployment package..."
    cd "$DEPLOY_DIR"
    unzip -o deploy.zip -d . > /dev/null 2>&1
    echo "✓ Deployment package extracted"
    rm -f deploy.zip
fi

# Verify critical files
echo "Verifying deployment files..."
if [ ! -f "$DEPLOY_DIR/dist/index.js" ]; then
    echo "✗ ERROR: dist/index.js not found!"
    exit 1
fi
if [ ! -f "$DEPLOY_DIR/app.js" ]; then
  echo "✗ ERROR: app.js environment bootstrap not found!"
  exit 1
fi
if [ ! -f "$DEPLOY_DIR/package.json" ]; then
    echo "✗ ERROR: package.json not found!"
    exit 1
fi
echo "✓ All critical files present"

# Install dependencies
echo "Installing dependencies..."
cd "$DEPLOY_DIR"
npm install --production 2>&1 | tail -10

# Start application
echo "Starting Node.js application..."
echo "PATH=$PATH"
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
if [ -z "$NODE_BIN" ]; then
  echo "ERROR: Node.js binary not found. PATH=$PATH"
  echo "Checked: command -v node, command -v nodejs, ${NODE_CANDIDATES[*]}"
  exit 1
fi

echo "Using Node binary: $NODE_BIN"
export PATH="$(dirname "$NODE_BIN"):$PATH"
export NODE_ENV=production
export PORT=${PORT:-3000}
echo "NODE_ENV=$NODE_ENV PORT=$PORT"
nohup "$NODE_BIN" "$DEPLOY_DIR/app.js" > "$DEPLOY_DIR/app.log" 2>&1 &
APP_PID=$!
echo $APP_PID > "$DEPLOY_DIR/app.pid"

sleep 3

# Verify application started
if ps -p $APP_PID > /dev/null; then
    echo "✓ Application started successfully (PID: $APP_PID)"
else
    echo "✗ Application failed to start"
    echo "Last 50 lines of app.log:"
    tail -50 "$DEPLOY_DIR/app.log"
    exit 1
fi

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "Application is running at: https://kiini.kiini.africa"
echo "Check logs: $DEPLOY_DIR/app.log"
echo "Started: $(date)"
echo "=========================================="
