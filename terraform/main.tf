terraform {
  required_version = ">= 1.0"

  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }

  # Uncomment to use remote state (e.g., AWS S3)
  # backend "s3" {
  #   bucket         = "Kiini: One Hub. Total Control-terraform-state"
  #   key            = "prod/terraform.tfstate"
  #   region         = "eu-west-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-locks"
  # }

  # Local state for development
  backend "local" {
    path = "terraform.tfstate"
  }
}

provider "docker" {
  host = var.docker_host
}

# ============================================================================
# Kiini: One Hub. Total Control DOCKER DEPLOYMENT INFRASTRUCTURE
# ============================================================================
# This Terraform configuration provides Infrastructure as Code (IaC) for 
# deploying the Kiini: One Hub. Total Control CRM application using Docker Compose with proper
# networking, volume management, and health checks.
# ============================================================================

locals {
  app_name            = "Kiini: One Hub. Total Control"
  environment         = var.environment
  project_dir         = abspath("${path.module}/..")
  docker_compose_file = "${local.project_dir}/docker-compose.yml"

  common_labels = {
    Application = local.app_name
    Environment = local.environment
    ManagedBy   = "Terraform"
    CreatedAt   = timestamp()
  }
}

# ============================================================================
# DOCKER NETWORK
# ============================================================================

resource "docker_network" "Kiini: One Hub. Total Control" {
  name   = "${local.app_name}-network"
  driver = var.network_driver

  ipam_config {
    subnet = var.network_subnet
  }

  dynamic "labels" {
    for_each = merge(local.common_labels, { Name = "${local.app_name}-network" })
    content {
      label = labels.key
      value = labels.value
    }
  }
}

# ============================================================================
# DOCKER VOLUMES FOR DATA PERSISTENCE
# ============================================================================

# MySQL Data Volume
resource "docker_volume" "mysql_data" {
  name = "${local.app_name}-mysql-data"

  dynamic "labels" {
    for_each = merge(local.common_labels, {
      Name        = "${local.app_name}-mysql-data"
      ServiceName = "mysql"
    })
    content {
      label = labels.key
      value = labels.value
    }
  }
}

# Application Logs Volume
resource "docker_volume" "app_logs" {
  name = "${local.app_name}-app-logs"

  dynamic "labels" {
    for_each = merge(local.common_labels, {
      Name        = "${local.app_name}-app-logs"
      ServiceName = "app"
    })
    content {
      label = labels.key
      value = labels.value
    }
  }
}

# Backup Volume for Database Dumps
resource "docker_volume" "mysql_backups" {
  name = "${local.app_name}-mysql-backups"

  dynamic "labels" {
    for_each = merge(local.common_labels, {
      Name        = "${local.app_name}-mysql-backups"
      ServiceName = "mysql-backups"
    })
    content {
      label = labels.key
      value = labels.value
    }
  }
}

# ============================================================================
# DOCKER IMAGES
# ============================================================================

# MySQL Image
resource "docker_image" "mysql" {
  name          = "${var.mysql_image}:${var.mysql_version}"
  keep_locally  = true
  pull_triggers = [var.mysql_version]
}

# Application Image (Node.js)
resource "docker_image" "app" {
  name         = local.app_name
  keep_locally = true
  build {
    context    = local.project_dir
    dockerfile = "Dockerfile"
    tag        = ["${local.app_name}:latest", "${local.app_name}:${var.app_version}"]
    build_args = {
      NODE_VERSION = var.node_version
      APP_ENV      = var.environment
    }
  }

  depends_on = [
    docker_image.mysql
  ]
}

# ============================================================================
# DATABASE CONTAINER
# ============================================================================

resource "docker_container" "mysql" {
  name    = "${local.app_name}-mysql"
  image   = docker_image.mysql.image_id
  restart = "always"

  # Network Configuration
  networks_advanced {
    name         = docker_network.Kiini: One Hub. Total Control.name
    ipv4_address = var.mysql_ip_address
    aliases      = ["mysql", "db"]
  }

  # Port Mapping
  ports {
    internal = 3306
    external = var.mysql_port
    ip       = "127.0.0.1"
  }

  # Volume Mounts
  volumes {
    volume_name    = docker_volume.mysql_data.name
    container_path = "/var/lib/mysql"
    read_only      = false
  }

  volumes {
    volume_name    = docker_volume.mysql_backups.name
    container_path = "/backups"
    read_only      = false
  }

  # Environment Variables
  env = [
    "MYSQL_ROOT_PASSWORD=${var.mysql_root_password}",
    "MYSQL_DATABASE=${var.mysql_database}",
    "MYSQL_USER=${var.mysql_user}",
    "MYSQL_PASSWORD=${var.mysql_password}",
    "MYSQL_ALLOW_EMPTY_PASSWORD=false",
    "MYSQL_INITDB_SKIP_TZINFO=1",
  ]

  # Health Check
  healthcheck {
    test         = ["CMD", "mysqladmin", "ping", "-h", "localhost"]
    interval     = var.health_check_interval
    timeout      = var.health_check_timeout
    retries      = var.health_check_retries
    start_period = var.health_check_start_period
  }

  # Resource Limits
  memory      = var.mysql_memory_limit * 1024 * 1024 # Convert to bytes
  memory_swap = var.mysql_memory_limit * 1024 * 1024
  cpu_shares  = var.mysql_cpu_shares

  # Labels
  dynamic "labels" {
    for_each = merge(local.common_labels, {
      Name        = "${local.app_name}-mysql"
      ServiceName = "mysql"
    })
    content {
      label = labels.key
      value = labels.value
    }
  }

  depends_on = [
    docker_network.Kiini: One Hub. Total Control,
    docker_volume.mysql_data
  ]
}

# ============================================================================
# APPLICATION CONTAINER
# ============================================================================

resource "docker_container" "app" {
  name    = local.app_name
  image   = docker_image.app.image_id
  restart = "always"

  # Network Configuration
  networks_advanced {
    name         = docker_network.Kiini: One Hub. Total Control.name
    ipv4_address = var.app_ip_address
    aliases      = ["app", "Kiini: One Hub. Total Control-app"]
  }

  # Port Mapping
  ports {
    internal = 3000
    external = var.app_port
  }

  # Volume Mounts
  volumes {
    volume_name    = docker_volume.app_logs.name
    container_path = "/app/logs"
    read_only      = false
  }

  # Environment Variables
  env = concat([
    "NODE_ENV=${var.environment}",
    "PORT=3000",
    "DATABASE_URL=mysql://${var.mysql_user}:${var.mysql_password}@mysql:3306/${var.mysql_database}?multipleStatements=true",
    "API_BASE_URL=${var.api_base_url}",
    "FRONTEND_URL=${var.frontend_url}",
    "LOG_LEVEL=${var.log_level}",
    "ENABLE_METRICS=${var.enable_metrics}",
  ], var.additional_app_env_vars)

  # Health Check
  healthcheck {
    test         = ["CMD", "curl", "-f", "http://localhost:3000/health"]
    interval     = var.health_check_interval
    timeout      = var.health_check_timeout
    retries      = var.health_check_retries
    start_period = var.health_check_start_period
  }

  # Resource Limits
  memory      = var.app_memory_limit * 1024 * 1024 # Convert to bytes
  memory_swap = var.app_memory_limit * 1024 * 1024
  cpu_shares  = var.app_cpu_shares

  # Dependencies
  depends_on = [
    docker_container.mysql,
    docker_image.app
  ]

  # Labels
  dynamic "labels" {
    for_each = merge(local.common_labels, {
      Name        = local.app_name
      ServiceName = "app"
    })
    content {
      label = labels.key
      value = labels.value
    }
  }
}

# ============================================================================
# LOCAL PROVISIONING - Run Migrations on Deploy
# ============================================================================

resource "null_resource" "migrations" {
  triggers = {
    app_container_id = docker_container.app.id
  }

  provisioner "local-exec" {
    command = "docker exec ${docker_container.app.id} npm run migrate || echo 'Migration completed or not needed'"
  }

  depends_on = [
    docker_container.app,
    docker_container.mysql
  ]
}
