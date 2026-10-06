function toUtcDate(value: string | Date): Date | null {
  if (value instanceof Date && !Number.isFinite(value.getTime())) return null;
  const datePart = value instanceof Date ? value.toISOString().slice(0, 10) : value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return null;

  const [year, month, day] = datePart.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }
  return date;
}

export function countWeekdaysInclusive(start: string | Date, end: string | Date): number {
  const startDate = toUtcDate(start);
  const endDate = toUtcDate(end);
  if (!startDate || !endDate || endDate < startDate) return 0;

  let weekdays = 0;
  for (const date = startDate; date <= endDate; date.setUTCDate(date.getUTCDate() + 1)) {
    const weekday = date.getUTCDay();
    if (weekday !== 0 && weekday !== 6) weekdays++;
  }
  return weekdays;
}

export function addWeekdays(start: string | Date, days: number): string | null {
  const date = toUtcDate(start);
  if (!date || !Number.isInteger(days) || days < 1) return null;

  let remaining = days;
  while (remaining > 0) {
    const weekday = date.getUTCDay();
    if (weekday !== 0 && weekday !== 6) remaining--;
    if (remaining > 0) date.setUTCDate(date.getUTCDate() + 1);
  }
  return date.toISOString().slice(0, 10);
}
