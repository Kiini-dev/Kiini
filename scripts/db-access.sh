#!/bin/bash

# Database Access Utility Script
# Provides easy access to the Kiini database in Docker
# Usage: ./scripts/db-access.sh [command]

set -e

# Configuration
DB_CONTAINER="kiini-mysql"
DB_USER="${MYSQL_USER:-kiini}"
DB_PASSWORD="${MYSQL_PASSWORD:-kiini_password_123}"
DB_NAME="${MYSQL_DATABASE:-kiini-one-hub-total-control}"
DB_HOST="localhost"
DB_PORT="3306"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
  echo -e "${BLUE}================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}================================${NC}"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_info() {
  echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Check if Docker container is running
check_container() {
  if ! docker ps | grep -q $DB_CONTAINER; then
    print_error "Database container '$DB_CONTAINER' is not running"
    print_info "Start containers with: docker-compose up -d"
    exit 1
  fi
  print_success "Database container is running"
}

# Connect to database shell
connect_shell() {
  print_header "Connecting to MySQL Shell"
  print_info "Database: $DB_NAME"
  print_info "User: $DB_USER"
  print_info "Type 'exit' to quit"
  echo ""
  
  docker exec -it $DB_CONTAINER mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME
}

# Show all tables
show_tables() {
  print_header "Database Tables"
  docker exec $DB_CONTAINER mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SHOW TABLES;"
}

# Show users table
show_users() {
  print_header "Users Table"
  docker exec $DB_CONTAINER mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SELECT id, email, name, role, createdAt FROM users LIMIT 10;"
}

# Show clients table
show_clients() {
  print_header "Clients Table"
  docker exec $DB_CONTAINER mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SELECT id, companyName, email, phone, status FROM clients LIMIT 10;"
}

# Show invoices table
show_invoices() {
  print_header "Invoices Table"
  docker exec $DB_CONTAINER mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SELECT id, invoiceNumber, clientId, totalAmount, status, createdAt FROM invoices LIMIT 10;"
}

# Backup database
backup_database() {
  print_header "Backing Up Database"
  BACKUP_FILE="backups/kiini-one-hub-total-control_$(date +%Y%m%d_%H%M%S).sql"
  mkdir -p backups
  
  print_info "Creating backup: $BACKUP_FILE"
  docker exec $DB_CONTAINER mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME > $BACKUP_FILE
  print_success "Database backed up to $BACKUP_FILE"
}

# Restore database from backup
restore_database() {
  if [ -z "$1" ]; then
    print_error "Please provide backup file path"
    echo "Usage: $0 restore <backup_file>"
    exit 1
  fi
  
  if [ ! -f "$1" ]; then
    print_error "Backup file not found: $1"
    exit 1
  fi
  
  print_header "Restoring Database"
  print_info "Restoring from: $1"
  
  cat "$1" | docker exec -i $DB_CONTAINER mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME
  print_success "Database restored"
}

# Get database statistics
show_stats() {
  print_header "Database Statistics"
  docker exec $DB_CONTAINER mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "
    SELECT 
      'Users' as 'Table',
      COUNT(*) as 'Count'
    FROM users
    UNION ALL
    SELECT 'Clients', COUNT(*) FROM clients
    UNION ALL
    SELECT 'Invoices', COUNT(*) FROM invoices
    UNION ALL
    SELECT 'Payments', COUNT(*) FROM payments
    UNION ALL
    SELECT 'Clients', COUNT(*) FROM clients
    UNION ALL
    SELECT 'Projects', COUNT(*) FROM projects
    UNION ALL
    SELECT 'Employees', COUNT(*) FROM employees
    UNION ALL
    SELECT 'Estimates', COUNT(*) FROM estimates;
  "
}

# Run custom SQL query
run_query() {
  if [ -z "$1" ]; then
    print_error "Please provide SQL query"
    echo "Usage: $0 query \"SELECT * FROM users;\""
    exit 1
  fi
  
  print_header "Executing Query"
  print_info "Query: $1"
  echo ""
  
  docker exec $DB_CONTAINER mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "$1"
}

# Show help
show_help() {
  cat << EOF
${BLUE}Kiini - Database Access Utility${NC}

${YELLOW}Usage:${NC}
  ./scripts/db-access.sh [command] [options]

${YELLOW}Commands:${NC}
  shell              Connect to MySQL interactive shell
  tables             Show all database tables
  users              Show users table (first 10 rows)
  clients            Show clients table (first 10 rows)
  invoices           Show invoices table (first 10 rows)
  stats              Show database statistics
  backup             Create database backup
  restore <file>     Restore database from backup file
  query <sql>        Execute custom SQL query
  help               Show this help message

${YELLOW}Examples:${NC}
  ./scripts/db-access.sh shell
  ./scripts/db-access.sh tables
  ./scripts/db-access.sh users
  ./scripts/db-access.sh backup
  ./scripts/db-access.sh restore backups/kiini-one-hub-total-control_20231209_120000.sql
  ./scripts/db-access.sh query "SELECT COUNT(*) FROM users;"
  ./scripts/db-access.sh stats

${YELLOW}Database Connection Info:${NC}
  Host: $DB_HOST
  Port: $DB_PORT
  User: $DB_USER
  Database: $DB_NAME

${YELLOW}Notes:${NC}
  - Make sure Docker containers are running: docker-compose up -d
  - Backups are stored in the 'backups' directory
  - All commands require the database container to be running

EOF
}

# Main command handler
main() {
  local command="${1:-help}"
  
  case $command in
    shell)
      check_container
      connect_shell
      ;;
    tables)
      check_container
      show_tables
      ;;
    users)
      check_container
      show_users
      ;;
    clients)
      check_container
      show_clients
      ;;
    invoices)
      check_container
      show_invoices
      ;;
    stats)
      check_container
      show_stats
      ;;
    backup)
      check_container
      backup_database
      ;;
    restore)
      check_container
      restore_database "$2"
      ;;
    query)
      check_container
      run_query "$2"
      ;;
    help)
      show_help
      ;;
    *)
      print_error "Unknown command: $command"
      show_help
      exit 1
      ;;
  esac
}

# Run main function
main "$@"
