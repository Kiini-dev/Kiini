#!/bin/sh
set -ex

echo "=== Starting Kiini CRM application ==="
echo "Current working directory: $(pwd)"
echo "User: $(whoami)"
echo "Environment:"
env | grep -E "NODE_ENV|DATABASE_URL|VITE_APP" || true

# Wait for MySQL to be ready
echo ""
echo "=== Waiting for database to be ready ==="
for attempt in 1 2 3 4 5 6 7 8 9 10; do
  echo "Attempt $attempt: Testing database connection..."
  if nc -z db 3306 2>/dev/null; then
    echo "✓ Database is ready!"
    break
  fi
  if [ $attempt -eq 10 ]; then
    echo "✗ Database failed to start after 10 attempts"
    exit 1
  fi
  echo "  Database not ready, waiting 3 seconds..."
  sleep 3
done

# Verify dist directory exists
echo ""
echo "=== Checking build artifacts ==="
if [ -f "/app/dist/index.js" ]; then
  echo "✓ Found dist/index.js"
  ls -lh /app/dist/
else
  echo "✗ ERROR: dist/index.js not found!"
  ls -la /app/ | head -20
  exit 1
fi

# Run migrations before starting the app
echo ""
echo "=== Running database migrations ==="
pnpm run db:migrate 2>&1 || {
  MIGRATE_EXIT=$?
  echo "⚠️  Warning: Migration step exited with code $MIGRATE_EXIT"
  if [ $MIGRATE_EXIT -ne 0 ]; then
    echo "Continuing anyway - app will try to initialize on startup..."
  fi
}

echo ""
echo "=== Seeding default user if needed ==="
pnpm run seed:default-user 2>&1 || {
  SEED_EXIT=$?
  echo "⚠️  Warning: Default user seed step exited with code $SEED_EXIT"
  echo "Continuing anyway - the app will still start and may create the default user at runtime..."
}

# Start the application
echo ""
echo "=== Starting Node.js server ==="
exec node /app/dist/index.js
