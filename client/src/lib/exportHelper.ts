/**
 * Export Helper - Utilities for exporting data to various formats
 */

interface ExportOptions {
  filename?: string;
  sheetName?: string;
}

/**
 * Export data to CSV format
 */
export function exportToCSV(
  data: Record<string, any>[],
  options: ExportOptions = {}
) {
  const { filename = "export" } = options;

  if (data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma
          if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? "";
        })
        .join(",")
    ),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${filename}.csv`);
}

/**
 * Export data to Excel format (XLSX)
 * Note: This is a simplified version. For production, use a library like xlsx
 */
export function exportToExcel(
  data: Record<string, any>[],
  options: ExportOptions = {}
) {
  const { filename = "export", sheetName = "Sheet1" } = options;

  if (data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // For now, fall back to CSV with .xlsx extension
  // In production, use: npm install xlsx
  exportToCSV(data, { filename });
  console.info(
    "For full Excel support, install xlsx library: npm install xlsx"
  );
}

/**
 * Export data to PDF format
 * Note: This requires html2pdf library
 */
export function exportToPDF(
  data: Record<string, any>[],
  options: ExportOptions = {}
) {
  const { filename = "export" } = options;

  if (data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Create HTML table
  const headers = Object.keys(data[0]);
  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #4CAF50; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h2>${filename}</h2>
        <table>
          <thead>
            <tr>
              ${headers.map((h) => `<th>${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${data
              .map(
                (row) =>
                  `<tr>
                ${headers.map((h) => `<td>${row[h] ?? ""}</td>`).join("")}
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;

  // Create blob and download
  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
  downloadBlob(blob, `${filename}.html`);

  console.info(
    "For full PDF support, install html2pdf: npm install html2pdf.js"
  );
}

/**
 * Helper function to trigger download
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Export selected items from a table
 */
export function exportTableData(
  items: Record<string, any>[],
  format: "csv" | "excel" | "pdf",
  filename: string = "export"
) {
  switch (format) {
    case "csv":
      exportToCSV(items, { filename });
      break;
    case "excel":
      exportToExcel(items, { filename });
      break;
    case "pdf":
      exportToPDF(items, { filename });
      break;
    default:
      console.error(`Unknown export format: ${format}`);
  }
}
