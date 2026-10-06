# ============================================================================
# TERRAFORM OUTPUTS - Kiini: One Hub. Total Control Docker Deployment
# ============================================================================

output "app_url" {
  description = "Application URL"
  value       = "http://localhost:${docker_container.app.ports[0].external}"
}

output "mysql_connection_string" {
  description = "MySQL connection string"
  value       = "mysql://${var.mysql_user}:${var.mysql_password}@localhost:${docker_container.mysql.ports[0].external}/${var.mysql_database}"
  sensitive   = true
}

output "mysql_root_connection_string" {
  description = "MySQL root connection string"
  value       = "mysql://root:${var.mysql_root_password}@localhost:${docker_container.mysql.ports[0].external}/"
  sensitive   = true
}

output "docker_network_id" {
  description = "Docker network ID"
  value       = docker_network.Kiini: One Hub. Total Control.id
}

output "docker_network_name" {
  description = "Docker network name"
  value       = docker_network.Kiini: One Hub. Total Control.name
}

output "app_container_id" {
  description = "Application container ID"
  value       = docker_container.app.id
}

output "mysql_container_id" {
  description = "MySQL container ID"
  value       = docker_container.mysql.id
}

output "mysql_data_volume_id" {
  description = "MySQL data volume ID"
  value       = docker_volume.mysql_data.id
}

output "app_logs_volume_id" {
  description = "Application logs volume ID"
  value       = docker_volume.app_logs.id
}

output "deployment_info" {
  description = "Complete deployment information"
  value = {
    environment    = var.environment
    app_version    = var.app_version
    node_version   = var.node_version
    mysql_version  = var.mysql_version
    app_url        = "http://localhost:${docker_container.app.ports[0].external}"
    mysql_port     = docker_container.mysql.ports[0].external
    database_name  = var.mysql_database
    network_subnet = var.network_subnet
  }
}

output "health_check_urls" {
  description = "URLs for health checks"
  value = {
    app_health   = "http://localhost:${docker_container.app.ports[0].external}/health"
    app_metrics  = "http://localhost:${docker_container.app.ports[0].external}/metrics"
    mysql_status = "mysql://${var.mysql_user}@localhost:${docker_container.mysql.ports[0].external}/${var.mysql_database}"
  }
}

output "docker_compose_help" {
  description = "Information about Docker Compose alternative"
  value       = "To use docker-compose instead, run: docker-compose -f docker-compose.yml up -d"
}

output "management_commands" {
  description = "Useful management commands"
  value = {
    view_app_logs    = "docker logs -f ${docker_container.app.id}"
    view_mysql_logs  = "docker logs -f ${docker_container.mysql.id}"
    mysql_cli        = "mysql -h localhost -P ${docker_container.mysql.ports[0].external} -u ${var.mysql_user} -p ${var.mysql_database}"
    backup_database  = "docker exec ${docker_container.mysql.id} mysqldump -u ${var.mysql_user} -p ${var.mysql_database} > backup.sql"
    restore_database = "docker exec -i ${docker_container.mysql.id} mysql -u ${var.mysql_user} -p ${var.mysql_database} < backup.sql"
  }
}
