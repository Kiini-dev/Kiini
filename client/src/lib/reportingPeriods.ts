export function matchesReportingYear(dateValue: unknown, year: string): boolean {
  const date = new Date(String(dateValue ?? ""));
  if (Number.isNaN(date.getTime())) return false;
  return year === "all" || date.getFullYear() === Number(year);
}

export function reportingPeriodLabel(year: string): string {
  return year === "all" ? "All time" : year;
}
