const DEFAULT_DB_CONNECTION_LIMIT = 6;
const MAX_DB_CONNECTION_LIMIT = 10;

export function resolveDbConnectionLimit(value?: string): number {
  if (value === undefined || value.trim() === "") return DEFAULT_DB_CONNECTION_LIMIT;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return DEFAULT_DB_CONNECTION_LIMIT;
  return Math.min(Math.max(parsed, 1), MAX_DB_CONNECTION_LIMIT);
}