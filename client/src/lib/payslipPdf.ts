import jsPDF from "jspdf";

export function payslipSlug(payPeriod: string, firstName?: string, lastName?: string): string {
  const [year, month] = String(payPeriod || "").split("-");
  const monthName = year && month
    ? new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-US", { month: "long" }).toLowerCase()
    : "period";
  const employee = `${firstName || ""}-${lastName || ""}`.trim().replace(/\s+/g, "-").toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/^-|-$/g, "");
  return `payslip-${monthName}-${year || "unknown"}${employee ? `-${employee}` : ""}`;
}

export async function downloadPayslipPdf(html: string, fileName: string): Promise<void> {
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pdfHtml = html
    .replace(/oklch\([^)]*\)/gi, "#000000")
    .replace(/oklab\([^)]*\)/gi, "#000000");
  await pdf.html(pdfHtml, {
    x: 24,
    y: 24,
    width: 547,
    windowWidth: 850,
    autoPaging: "text",
    callback: (document) => document.save(fileName),
  });
}