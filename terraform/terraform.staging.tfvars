# ============================================================================
# TERRAFORM VARIABLES - Staging Environment
# ============================================================================
# This file contains variable values for the staging environment.
# Use with: terraform apply -var-file="terraform.staging.tfvars"
# ============================================================================

environment = "staging"

# Docker Configuration
docker_host = "unix:///var/run/docker.sock"
pull_images = true

# Network - Staging uses different subnet
network_driver = "bridge"
network_subnet = "172.21.0.0/16"

# MySQL Configuration - Staging specs
mysql_version        = "8.0"
mysql_image          = "mysql"
mysql_port           = 3307
mysql_ip_address     = "172.21.0.2"
mysql_root_password  = "staging-root-pwd-123456"  # CHANGE BEFORE DEPLOYMENT
mysql_database       = "kiini_crm_staging"
mysql_user           = "kiini_staging"
mysql_password       = "staging-app-pwd-123456"   # CHANGE BEFORE DEPLOYMENT
mysql_memory_limit   = 768
mysql_cpu_shares     = 1024

# Application Configuration - Staging specs
app_version = "4.0.0-staging"
node_version = "20-alpine"
app_port = 3001
app_ip_address = "172.21.0.3"
app_memory_limit = 1536
app_cpu_shares = 1536
log_level = "debug"
api_base_url = "https://staging-api.kiini.africa/api"
frontend_url = "https://staging.kiini.africa"
enable_metrics = true

# Health Checks - Staging
health_check_interval    = "30s"
health_check_timeout     = "15s"
health_check_retries     = 3
health_check_start_period = "60s"

# Additional Environment Variables - Staging
additional_app_env_vars = [
  "ENVIRONMENT=staging",
  "DEBUG=true",
  "LOG_REQUESTS=true",
]
