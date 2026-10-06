/**
 * Convert Date or ISO string to MySQL DATETIME format (YYYY-MM-DD HH:MM:SS)
 * MySQL DATETIME and TIMESTAMP fields don't accept ISO 8601 format in string mode
 */
export function toMySQLDateTime(date?: Date | string | null): string {
  if (!date) {
    return new Date().toISOString().replace('T', ' ').substring(0, 19);
  }
  
  if (typeof date === 'string') {
    // If it's already ISO format, convert it
    const parsed = new Date(date);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().replace('T', ' ').substring(0, 19);
    }
    return new Date().toISOString().replace('T', ' ').substring(0, 19);
  }
  
  if (date instanceof Date) {
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString().replace('T', ' ').substring(0, 19);
    }
  }
  
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}
