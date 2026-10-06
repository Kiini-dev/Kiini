# Kiini Terraform Deployment Guide

## Overview

This directory contains Terraform Infrastructure as Code (IaC) for deploying the Kiini CRM application using Docker containers. The configuration provides:

- **Docker Network** - Isolated network for service communication
- **MySQL Database** - MySQL 8.0 database container with persistent storage
- **Node.js Application** - Kiini application container with proper networking
- **Persistent Volumes** - Data persistence for database and logs
- **Health Checks** - Built-in health monitoring for containers
- **Resource Management** - CPU and memory limits for containers

## Prerequisites

1. **Terraform** >= 1.0

   ```bash
   # Download from https://www.terraform.io/downloads.html
   terraform version
   ```

2. **Docker & Docker Daemon**

   ```bash
   docker version
   docker-compose version
   ```

3. **Terraform Docker Provider**
   - Automatically installed by `terraform init`

## Quick Start

Set both database passwords through a secret manager or environment variables before planning or applying. The password variables have no insecure defaults:

```bash
export TF_VAR_mysql_root_password="<secret>"
export TF_VAR_mysql_password="<secret>"
```

Do not commit `*.tfvars`, Terraform state, or plan files. Terraform state can contain credentials even when variables are marked sensitive.

### 1. Initialize Terraform

```bash
cd terraform
terraform init
```

### 2. Review Configuration

```bash
terraform plan
```

### 3. Deploy Infrastructure

```bash
terraform apply
```

### 4. Verify Deployment

```bash
docker ps
curl http://localhost:3000/health
```

## Environment-Specific Deployments

### Development (Default)

```bash
terraform apply
# Uses terraform.tfvars
```

### Staging

```bash
terraform apply -var-file="terraform.staging.tfvars"
```

### Production

```bash
terraform apply -var-file="terraform.production.tfvars" -auto-approve
```

## Configuration Files

### `main.tf`

- Primary Terraform configuration
- Docker network, volumes, containers
- Health check and resource limits

### `variables.tf`

- Input variable definitions
- Validation rules
- Default values

### `outputs.tf`

- Output values after deployment
- Connection strings
- Management commands

### `terraform.tfvars`

- Development default values (CHANGE for your environment)

### `terraform.staging.tfvars`

- Staging environment configuration
- Run: `terraform apply -var-file="terraform.staging.tfvars"`

### `terraform.production.tfvars`

- Production environment configuration
- Run: `terraform apply -var-file="terraform.production.tfvars"`

## Common Tasks

### View Deployment Status

```bash
terraform show
```

### View Outputs

```bash
terraform output
terraform output app_url
terraform output deployment_info
```

### Modify Configuration

Edit `terraform.tfvars` or use `-var` flag:

```bash
terraform apply -var="mysql_memory_limit=2048"
```

### View Container Logs

```bash
# From terraform output
terraform output -raw management_commands | grep logs

# Or manually
docker logs -f kiini
docker logs -f kiini-mysql
```

### Run Database Backup

```bash
# Get command from terraform output
terraform output -raw management_commands | grep backup

# Or manually
docker exec kiini-mysql mysqldump -u kiini -p apppassword123 kiini-one-hub-total-control > backup.sql
```

### Restore Database

```bash
docker exec -i kiini-mysql mysql -u kiini -p apppassword123 kiini-one-hub-total-control < backup.sql
```

### Scale Resources

```bash
terraform apply -var="app_memory_limit=2048" -var="mysql_memory_limit=1024"
```

## Security Best Practices

1. **Use Environment Variables for Secrets**

   ```bash
   export TF_VAR_mysql_root_password="your-secure-password"
   export TF_VAR_mysql_password="your-secure-password"
   terraform apply
   ```

2. **Use `-var` Flag Instead of Storing in Files**

   ```bash
   terraform apply \
     -var="mysql_root_password=$(openssl rand -base64 32)" \
     -var="mysql_password=$(openssl rand -base64 32)"
   ```

3. **Enable Remote State with Encryption**
   Uncomment the `backend "s3"` block in `main.tf` and configure:

   ```bash
   terraform init -backend-config="bucket=your-bucket" -backend-config="key=prod/terraform.tfstate"
   ```

4. **Use `.tfvars` Files in `.gitignore`**

   ```bash
   echo "*.tfvars" >> .gitignore
   echo "!terraform.example.tfvars" >> .gitignore
   ```

5. **Rotate Passwords Regularly**
   ```bash
   terraform apply -var="mysql_password=$(openssl rand -base64 32)"
   ```

## Health Checks

Terraform configures health checks for both containers:

### Application Health

```bash
curl http://localhost:3000/health
curl http://localhost:3000/metrics
```

### MySQL Health

```bash
docker exec kiini-mysql mysqladmin ping -h localhost
```

### View Health Status

```bash
docker ps --format "{{.Names}}\t{{.Status}}"
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs kiini
docker logs kiini-mysql

# Check port conflicts
netstat -tulpn | grep 3000
netstat -tulpn | grep 3306

# Increase health check timeout
terraform apply -var="health_check_timeout=30s"
```

### Database Connection Issues

```bash
# Test connection
docker exec kiini-mysql mysql -h localhost -u kiini -p apppassword123 kiini-one-hub-total-control -e "SELECT 1;"

# Check network
docker network inspect kiini-network
```

### Terraform State Issues

```bash
# Refresh state
terraform refresh

# Force update
terraform apply -refresh-only

# Clean up if needed
terraform destroy
rm terraform.tfstate*
terraform init
```

## Advanced Features

### Auto-Scaling (Future Enhancement)

Uncomment and modify the `docker-compose.override.yml` for additional replicas.

### Backup Strategy

Use the provided backup commands in `management_commands` output:

```bash
# Automated daily backup
0 2 * * * docker exec kiini-mysql mysqldump -u kiini -p apppassword123 kiini-one-hub-total-control | gzip > /backups/kiini-$(date +\%Y\%m\%d).sql.gz
```

### Monitoring Integration

Configure CloudWatch, Prometheus, or Datadog:

```bash
terraform apply -var="additional_app_env_vars=[\"DATADOG_ENABLED=true\",\"DATADOG_API_KEY=xxx\"]"
```

## Cleanup

### Destroy All Infrastructure

```bash
terraform destroy
```

### Destroy Specific Resources

```bash
terraform destroy -target=docker_container.app
terraform destroy -target=docker_volume.mysql_data
```

## File Structure

```
terraform/
├── main.tf                  # Main Terraform configuration
├── variables.tf            # Variable definitions
├── outputs.tf              # Output definitions
├── terraform.tfvars        # Development defaults
├── terraform.staging.tfvars # Staging configuration
├── terraform.production.tfvars # Production configuration
├── README.md              # This file
└── terraform.tfstate*     # State files (gitignore)
```

## Support

For issues or questions:

1. Check Terraform docs: https://www.terraform.io/docs
2. Check Docker provider docs: https://registry.terraform.io/providers/kreuzwerker/docker
3. Review logs: `terraform show` and `docker logs`
4. Check state: `terraform state show`
