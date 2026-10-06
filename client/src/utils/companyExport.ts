export interface CompanyExportInfo {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  tagline?: string;
}

function csvCell(value: unknown): string {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export function exportCsvWithCompanyHeader(
  filename: string,
  rows: Record<string, unknown>[],
  company: CompanyExportInfo,
): void {
  if (!rows.length) return;
  const columns = Object.keys(rows[0]);
  const metadata = [
    ["Company", company.name],
    ["Phone", company.phone],
    ["Email", company.email],
    ["Website", company.website],
    ["Address", company.address],
    ["Tagline", company.tagline],
    [],
  ];
  const csv = [
    ...metadata.map((row) => row.map(csvCell).join(",")),
    columns.map(csvCell).join(","),
    ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}