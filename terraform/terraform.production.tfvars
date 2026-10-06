# ============================================================================
# TERRAFORM VARIABLES - Production Environment
# ============================================================================
# This file contains variable values for the production environment.
# Use with: terraform apply -var-file="terraform.production.tfvars"
# 
# SECURITY NOTICE:
# - Do NOT commit passwords to version control
# - Use environment variables or external secret management
# - Example: export TF_VAR_mysql_root_password="your-secret-password"
# ============================================================================

environment = "production"

# Docker Configuration - Production
docker_host = "unix:///var/run/docker.sock"
pull_images = true

# Network - Production uses dedicated subnet
network_driver = "bridge"
network_subnet = "172.22.0.0/16"

# MySQL Configuration - Production specs
mysql_version        = "8.0"
mysql_image          = "mysql"
mysql_port           = 3306
mysql_ip_address     = "172.22.0.2"
# IMPORTANT: Set via environment variable for security
# export TF_VAR_mysql_root_password="your-secure-root-password"
mysql_root_password  = "CHANGE_ME_PRODUCTION_ROOT_PASSWORD"
mysql_database       = "kiiniafr_kiinidev"
mysql_user           = "kiiniafr_kiinidev"
# IMPORTANT: Set via environment variable for security
# export TF_VAR_mysql_password="your-secure-app-password"
mysql_password       = "CHANGE_ME_PRODUCTION_APP_PASSWORD"
mysql_memory_limit   = 2048  # 2GB for production
mysql_cpu_shares     = 2048  # Higher CPU shares for production

# Application Configuration - Production specs
app_version = "4.0.0"
node_version = "20-alpine"
app_port = 3000
app_ip_address = "172.22.0.3"
app_memory_limit = 2048  # 2GB for production
app_cpu_shares = 4096    # Higher CPU shares for production
log_level = "warn"       # Minimal logging in production
api_base_url = "https://kiini.africa/api"
frontend_url = "https://kiini.africa"
enable_metrics = true

# Health Checks - Production (more aggressive)
health_check_interval    = "30s"
health_check_timeout     = "10s"
health_check_retries     = 5       # More retries for stability
health_check_start_period = "60s"

# Additional Environment Variables - Production
additional_app_env_vars = [
  "ENVIRONMENT=production",
  "DEBUG=false",
  "LOG_REQUESTS=false",
  "PERFORMANCE_MONITORING=true",
  "SENTRY_ENABLED=true",
  "SENTRY_DSN=${SENTRY_DSN}",
  "SLACK_ENABLED=true",
  "SLACK_WEBHOOK=${SLACK_WEBHOOK}",
]

# ============================================================================
# DEPLOYMENT INSTRUCTIONS FOR PRODUCTION
# ============================================================================
#
# 1. Set environment variables for secrets:
#    export TF_VAR_mysql_root_password=$(openssl rand -base64 32)
#    export TF_VAR_mysql_password=$(openssl rand -base64 32)
#
# 2. Initialize Terraform (if not already done):
#    cd terraform
#    terraform init
#
# 3. Review changes:
#    terraform plan -var-file="terraform.production.tfvars"
#
# 4. Deploy to production:
#    terraform apply -var-file="terraform.production.tfvars" -auto-approve
#
# 5. Verify deployment:
#    terraform output deployment_info
#    curl https://kiini.africa/api/health
#
# 6. Backup state file (VERY IMPORTANT):
#    cp terraform.tfstate terraform.tfstate.backup
#    # Store backup in secure location
#
# 7. Document deployment:
#    - Date deployed
#    - Version deployed
#    - Any custom configuration
#    - Contact person for rollback
#
# ============================================================================
# ONGOING MAINTENANCE
# ============================================================================
#
# Daily:
#   - Monitor application logs: docker logs kiini-app
#   - Monitor database logs: docker logs kiini-mysql
#   - Check health status: curl https://kiini.africa/api/health
#
# Weekly:
#   - Review error logs and metrics
#   - Check disk space: docker system df
#   - Verify backups are running
#
# Monthly:
#   - Update Docker images: docker pull mysql:8.0
#   - Review resource utilization
#   - Test disaster recovery procedure
#   - Update documentation
#
# Quarterly:
#   - Security audit and vulnerability scans
#   - Performance optimization review
#   - Capacity planning assessment
#
# Annually:
#   - Full security penetration test
#   - Disaster recovery drill
#   - Update infrastructure documentation
#
# ============================================================================
