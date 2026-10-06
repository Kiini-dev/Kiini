#!/bin/bash

# Execute Drizzle migrations for approval workflows
set -e

echo "🚀 Starting Approval Workflow Migration..."
echo "=========================================="

cd "$(dirname "$0")"

# Get DATABASE_URL from environment or use default
DB_URL="${DATABASE_URL:-mysql://user:password@localhost:3306/kiini-one-hub-total-control}"

# Parse the DATABASE_URL to extract connection details
# Format: mysql://user:password@host:port/database
if [[ $DB_URL =~ ^mysql://([^:]+):([^@]+)@([^:/]+):([0-9]+)/(.+)$ ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASS="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]}"
    DB_NAME="${BASH_REMATCH[5]}"
    
    echo "📍 Database: $DB_NAME @ $DB_HOST:$DB_PORT"
    echo "👤 User: $DB_USER"
    
    # Execute the migration SQL
    echo "⏳ Executing migration..."
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < ./0018_add_approval_workflows.sql
    
    echo "✅ Migration completed successfully!"
else
    echo "❌ Invalid DATABASE_URL format"
    echo "Expected: mysql://user:password@host:port/database"
    exit 1
fi
