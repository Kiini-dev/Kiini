# ============================================================================
# TERRAFORM VARIABLES - Default Values (Development)
# ============================================================================
# This file contains default variable values for local development.
# For production, create environment-specific files:
#   - terraform.development.tfvars
#   - terraform.staging.tfvars
#   - terraform.production.tfvars
# 
# Usage: terraform apply -var-file="terraform.production.tfvars"
# ============================================================================

environment = "development"

# Docker Configuration
docker_host = "unix:///var/run/docker.sock"
pull_images = true

# Network
network_driver = "bridge"
network_subnet = "172.20.0.0/16"

# MySQL Configuration
mysql_version        = "8.0"
mysql_image          = "mysql"
mysql_port           = 3306
mysql_ip_address     = "172.20.0.2"
mysql_root_password  = "rootpassword123"    # CHANGE IN PRODUCTION!
mysql_database       = "kiini_crm"
mysql_user           = "kiini"
mysql_password       = "apppassword123"     # CHANGE IN PRODUCTION!
mysql_memory_limit   = 512
mysql_cpu_shares     = 1024

# Application Configuration
app_version = "4.0.0"
node_version = "20-alpine"
app_port = 3000
app_ip_address = "172.20.0.3"
app_memory_limit = 1024
app_cpu_shares = 2048
log_level = "info"
api_base_url = "http://localhost:3000/api"
frontend_url = "http://localhost:3000"
enable_metrics = true

# Health Checks
health_check_interval    = "30s"
health_check_timeout     = "10s"
health_check_retries     = 3
health_check_start_period = "40s"

# Additional Environment Variables
additional_app_env_vars = []

# ============================================================================
# PRODUCTION CONFIGURATION EXAMPLE
# ============================================================================
# For production, copy this file to terraform.production.tfvars and modify:
#
# environment = "production"
# mysql_root_password = "your-secure-root-password-here"
# mysql_password = "your-secure-app-password-here"
# app_port = 443  # Use HTTPS port
# api_base_url = "https://kiini.example/api"
# frontend_url = "https://kiini.example"
# log_level = "warn"
# mysql_memory_limit = 2048
# app_memory_limit = 2048
# 
# Then run: terraform apply -var-file="terraform.production.tfvars"
# ============================================================================
