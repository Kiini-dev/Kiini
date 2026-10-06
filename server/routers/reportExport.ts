import { router, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { generateFinancialReportPDF, generateExpenseReportPDF } from "../utils/report-pdf-generator";
import { 
  generateFinancialReportCSV, 
  generateFinancialReportTXT,
  generateFinancialReportJSON,
  fetchFinancialData
} from "../utils/report-export-utils";

const reportCreateProcedure = createFeatureRestrictedProcedure("reports:create");
const reportExportProcedure = createFeatureRestrictedProcedure("reports:export");

export const reportExportRouter = router({
  // Generate financial report in multiple formats
  generateFinancialReport: reportCreateProcedure
    .input(
      z.object({
        title: z.string().default("Financial Report"),
        format: z.enum(["pdf", "csv", "txt", "json"]).default("pdf"),
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
        includeDetails: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const config = {
          title: input.title,
          startDate: input.startDate,
          endDate: input.endDate,
          includeDetails: input.includeDetails,
        };

        let buffer: Buffer;
        let mimeType: string;
        let filename: string;
        const dateStr = new Date().toISOString().split("T")[0];

        switch (input.format) {
          case "csv":
            buffer = await generateFinancialReportCSV(config);
            mimeType = "text/csv";
            filename = `Financial_Report_${dateStr}.csv`;
            break;
          case "txt":
            buffer = await generateFinancialReportTXT(config);
            mimeType = "text/plain";
            filename = `Financial_Report_${dateStr}.txt`;
            break;
          case "json":
            buffer = await generateFinancialReportJSON(config);
            mimeType = "application/json";
            filename = `Financial_Report_${dateStr}.json`;
            break;
          case "pdf":
          default:
            buffer = await generateFinancialReportPDF(config);
            mimeType = "application/pdf";
            filename = `Financial_Report_${dateStr}.pdf`;
            break;
        }

        // Return base64 encoded data
        const base64 = buffer.toString("base64");
        return {
          success: true,
          data: base64,
          filename,
          mimeType,
        };
      } catch (error) {
        console.error("Error generating financial report:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to generate report",
        };
      }
    }),

  // Generate expense report PDF
  generateExpenseReport: reportExportProcedure
    .input(
      z.object({
        title: z.string().default("Expense Report"),
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
        includeDetails: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const pdfBuffer = await generateExpenseReportPDF({
          title: input.title,
          startDate: input.startDate,
          endDate: input.endDate,
          includeDetails: input.includeDetails,
        });

        // Return base64 encoded PDF
        const base64 = pdfBuffer.toString("base64");
        return {
          success: true,
          data: base64,
          filename: `Expense_Report_${new Date().toISOString().split("T")[0]}.pdf`,
        };
      } catch (error) {
        console.error("Error generating expense report:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to generate report",
        };
      }
    }),
});
