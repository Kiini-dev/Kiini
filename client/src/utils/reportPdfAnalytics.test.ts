import { describe, expect, it } from "vitest";
import { createReportAnalyticsPdf } from "./reportPdfAnalytics";

describe("report PDF analytics", () => {
  it("includes KPI values, chart labels, and detail rows in a valid PDF", () => {
    const pdf = createReportAnalyticsPdf({
      title: "Quarterly sales",
      subtitle: "Selected reporting period",
      metrics: [{ label: "Revenue", value: "KES 120,000" }],
      chartTitle: "Revenue by month",
      categories: ["Jan", "Feb"],
      series: [{ label: "Sales", values: [50, 70], color: [15, 118, 110] }],
      tableHeaders: ["Month", "Sales"],
      tableRows: [["Jan", "KES 50"], ["Feb", "KES 70"]],
    });

    const output = pdf.output();
    expect(output.startsWith("%PDF-")).toBe(true);
    expect(output).toContain("KES 120,000");
    expect(output).toContain("Revenue by month");
    expect(output).toContain("Sales");
  });
});