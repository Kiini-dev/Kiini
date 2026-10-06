export function toMySqlDateTime(value: unknown, fallback = new Date()): string {
  const date = value instanceof Date ? value : new Date(String(value));
  const safeDate = Number.isNaN(date.getTime()) ? fallback : date;
  return safeDate.toISOString().replace("T", " ").substring(0, 19);
}

export function toDate(value: unknown): Date | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date;
}
