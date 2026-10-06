/**
 * Activity Logging System
 * Tracks user actions like create, update, delete across all modules
 */

export interface ActivityLog {
  id: string;
  userId: string;
  action: "create" | "update" | "delete" | "view" | "download" | "email";
  module: string;
  itemId: string;
  itemName: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Log an activity to local storage (for now)
 * In production, this would be sent to the backend
 */
export function logActivity(activity: Omit<ActivityLog, "id" | "timestamp">) {
  const logs = getActivityLogs();
  
  const newLog: ActivityLog = {
    ...activity,
    id: `log_${Date.now()}`,
    timestamp: new Date(),
  };
  
  logs.push(newLog);
  
  // Keep only last 1000 logs in local storage
  if (logs.length > 1000) {
    logs.shift();
  }
  
  localStorage.setItem("activityLogs", JSON.stringify(logs));
  return newLog;
}

/**
 * Get all activity logs
 */
export function getActivityLogs(): ActivityLog[] {
  try {
    const logs = localStorage.getItem("activityLogs");
    return logs ? JSON.parse(logs) : [];
  } catch {
    return [];
  }
}

/**
 * Get activity logs for a specific module
 */
export function getModuleActivityLogs(module: string): ActivityLog[] {
  return getActivityLogs().filter((log) => log.module === module);
}

/**
 * Get activity logs for a specific item
 */
export function getItemActivityLogs(itemId: string): ActivityLog[] {
  return getActivityLogs().filter((log) => log.itemId === itemId);
}

/**
 * Get activity logs for a specific user
 */
export function getUserActivityLogs(userId: string): ActivityLog[] {
  return getActivityLogs().filter((log) => log.userId === userId);
}

/**
 * Clear all activity logs
 */
export function clearActivityLogs() {
  localStorage.removeItem("activityLogs");
}

/**
 * Log a delete action
 */
export function logDelete(
  module: string,
  itemId: string,
  itemName: string,
  userId: string = "current-user"
) {
  return logActivity({
    userId,
    action: "delete",
    module,
    itemId,
    itemName,
    description: `Deleted ${module} item: ${itemName}`,
  });
}

/**
 * Log a create action
 */
export function logCreate(
  module: string,
  itemId: string,
  itemName: string,
  userId: string = "current-user"
) {
  return logActivity({
    userId,
    action: "create",
    module,
    itemId,
    itemName,
    description: `Created ${module} item: ${itemName}`,
  });
}

/**
 * Log an update action
 */
export function logUpdate(
  module: string,
  itemId: string,
  itemName: string,
  userId: string = "current-user",
  changes?: Record<string, any>
) {
  return logActivity({
    userId,
    action: "update",
    module,
    itemId,
    itemName,
    description: `Updated ${module} item: ${itemName}`,
    metadata: { changes },
  });
}

/**
 * Export activity logs as CSV
 */
export function exportActivityLogsAsCSV(): string {
  const logs = getActivityLogs();
  
  const headers = ["ID", "User ID", "Action", "Module", "Item ID", "Item Name", "Description", "Timestamp"];
  const rows = logs.map((log) => [
    log.id,
    log.userId,
    log.action,
    log.module,
    log.itemId,
    log.itemName,
    log.description,
    new Date(log.timestamp).toISOString(),
  ]);
  
  const csv = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");
  
  return csv;
}

/**
 * Download activity logs as CSV file
 */
export function downloadActivityLogs() {
  const csv = exportActivityLogsAsCSV();
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `activity-logs-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

