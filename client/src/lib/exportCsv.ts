/**
 * Utility helpers for exporting data to CSV.
 */

/** Escape a single CSV cell value */
function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // Quote if contains comma, quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Convert an array of objects to a CSV string.
 * @param rows   Array of plain objects
 * @param headers  Optional `{ key, label }` pairs; omit to use all object keys
 */
export function toCsv<T extends Record<string, unknown>>(
  rows: T[],
  headers?: { key: keyof T; label: string }[],
): string {
  if (rows.length === 0) return "";

  const cols: { key: keyof T; label: string }[] =
    headers ?? (Object.keys(rows[0]) as (keyof T)[]).map((k) => ({ key: k, label: String(k) }));

  const headerRow = cols.map((c) => csvCell(c.label)).join(",");
  const bodyRows = rows.map((row) => cols.map((c) => csvCell(row[c.key])).join(","));
  return [headerRow, ...bodyRows].join("\n");
}

/**
 * Trigger a browser download for a CSV string.
 * @param csv       CSV content string
 * @param filename  Suggested filename (without extension)
 */
export function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * One-call helper: build CSV from rows and download it.
 */
export function exportToCsv<T extends Record<string, unknown>>(
  rows: T[],
  filename: string,
  headers?: { key: keyof T; label: string }[],
): void {
  const csv = toCsv(rows, headers);
  if (csv) downloadCsv(csv, filename);
}
