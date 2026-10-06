# ============================================================================
# TERRAFORM VARIABLES - Kiini: One Hub. Total Control Docker Deployment
# ============================================================================

# ============================================================================
# GENERAL CONFIGURATION
# ============================================================================

variable "environment" {
  description = "Environment name (development, staging, production)"
  type        = string
  default     = "development"

  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be development, staging, or production."
  }
}

variable "docker_host" {
  description = "Docker daemon socket or host URL"
  type        = string
  default     = "unix:///var/run/docker.sock"
}

variable "pull_images" {
  description = "Whether to pull images from registry"
  type        = bool
  default     = true
}

# ============================================================================
# NETWORK CONFIGURATION
# ============================================================================

variable "network_driver" {
  description = "Docker network driver (bridge, host, overlay)"
  type        = string
  default     = "bridge"

  validation {
    condition     = contains(["bridge", "host", "overlay"], var.network_driver)
    error_message = "Network driver must be bridge, host, or overlay."
  }
}

variable "network_subnet" {
  description = "Docker network subnet in CIDR notation"
  type        = string
  default     = "172.20.0.0/16"
}

# ============================================================================
# MYSQL DATABASE CONFIGURATION
# ============================================================================

variable "mysql_version" {
  description = "MySQL version"
  type        = string
  default     = "8.0"
}

variable "mysql_image" {
  description = "MySQL Docker image name"
  type        = string
  default     = "mysql"
}

variable "mysql_port" {
  description = "MySQL port exposed to host"
  type        = number
  default     = 3306

  validation {
    condition     = var.mysql_port > 1024 && var.mysql_port < 65536
    error_message = "Port must be between 1025 and 65535."
  }
}

variable "mysql_ip_address" {
  description = "MySQL container IP address in the network"
  type        = string
  default     = "172.20.0.2"
}

variable "mysql_root_password" {
  description = "MySQL root user password"
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.mysql_root_password) >= 8
    error_message = "MySQL root password must be at least 8 characters long."
  }
}

variable "mysql_database" {
  description = "Default MySQL database name"
  type        = string
  default     = "Kiini: One Hub. Total Control"
}

variable "mysql_user" {
  description = "MySQL application user"
  type        = string
  default     = "Kiini: One Hub. Total Control"
}

variable "mysql_password" {
  description = "MySQL application user password"
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.mysql_password) >= 8
    error_message = "MySQL password must be at least 8 characters long."
  }
}

variable "mysql_memory_limit" {
  description = "MySQL container memory limit in MB"
  type        = number
  default     = 512

  validation {
    condition     = var.mysql_memory_limit >= 256
    error_message = "MySQL memory limit must be at least 256 MB."
  }
}

variable "mysql_cpu_shares" {
  description = "MySQL container CPU shares (default 1024)"
  type        = number
  default     = 1024
}

# ============================================================================
# APPLICATION CONFIGURATION
# ============================================================================

variable "app_version" {
  description = "Application version"
  type        = string
  default     = "4.0.0"
}

variable "node_version" {
  description = "Node.js version"
  type        = string
  default     = "20-alpine"
}

variable "app_port" {
  description = "Application port exposed to host"
  type        = number
  default     = 3000

  validation {
    condition     = var.app_port > 1024 && var.app_port < 65536
    error_message = "Port must be between 1025 and 65535."
  }
}

variable "app_ip_address" {
  description = "Application container IP address in the network"
  type        = string
  default     = "172.20.0.3"
}

variable "app_memory_limit" {
  description = "Application container memory limit in MB"
  type        = number
  default     = 1024

  validation {
    condition     = var.app_memory_limit >= 512
    error_message = "Application memory limit must be at least 512 MB."
  }
}

variable "app_cpu_shares" {
  description = "Application container CPU shares (default 1024)"
  type        = number
  default     = 2048
}

variable "log_level" {
  description = "Application log level"
  type        = string
  default     = "info"

  validation {
    condition     = contains(["debug", "info", "warn", "error"], var.log_level)
    error_message = "Log level must be debug, info, warn, or error."
  }
}

variable "api_base_url" {
  description = "API base URL"
  type        = string
  default     = "http://localhost:3000/api"
}

variable "frontend_url" {
  description = "Frontend URL"
  type        = string
  default     = "http://localhost:3000"
}

variable "enable_metrics" {
  description = "Enable application metrics collection"
  type        = bool
  default     = true
}

variable "additional_app_env_vars" {
  description = "Additional environment variables for the application"
  type        = list(string)
  default     = []
}

# ============================================================================
# HEALTH CHECK CONFIGURATION
# ============================================================================

variable "health_check_interval" {
  description = "Health check interval in milliseconds"
  type        = string
  default     = "30s"
}

variable "health_check_timeout" {
  description = "Health check timeout in milliseconds"
  type        = string
  default     = "10s"
}

variable "health_check_retries" {
  description = "Number of health check retries"
  type        = number
  default     = 3
}

variable "health_check_start_period" {
  description = "Health check start period in milliseconds"
  type        = string
  default     = "40s"
}
