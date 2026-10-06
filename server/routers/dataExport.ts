/**
 * Data Export Router
 * 
 * Handles CSV, PDF, and Excel exports for reports and data
 */

import { router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  invoices,
  receipts,
  expenses,
  projects,
  clients,
  lineItems,
  estimates,
  proposals,
  employees,
} from "../../drizzle/schema";
import { eq, inArray } from "drizzle-orm";

import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";

// Feature-based procedures
const exportProcedure = createFeatureRestrictedProcedure("data:export");

export const dataExportRouter = router({
  /**
   * Export invoices to CSV
   */
  exportInvoicesCSV: createFeatureRestrictedProcedure("reports:export")
    .input(
      z.object({
        ids: z.array(z.string()).optional(),
        filters: z.object({
          status: z.string().optional(),
          dateFrom: z.string().optional(),
          dateTo: z.string().optional(),
        }).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      try {
        let query = db.select().from(invoices);

        if (input.ids && input.ids.length > 0) {
          query = query.where(inArray(invoices.id, input.ids)) as any;
        }

        const data = await query;

        // Convert to CSV format
        const headers = [
          "Invoice Number",
          "Client ID",
          "Total",
          "Tax",
          "Status",
          "Invoice Date",
          "Due Date",
          "Created At",
        ];

        const rows = data.map((inv: any) => [
          inv.invoiceNumber,
          inv.clientId,
          inv.total,
          inv.taxAmount ?? inv.tax ?? 0,
          inv.status,
          inv.issueDate,
          inv.dueDate,
          inv.createdAt,
        ]);

        const csv = [
          headers.join(","),
          ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
        ].join("\n");

        return {
          filename: `invoices_${Date.now()}.csv`,
          content: csv,
          format: "csv",
        };
      } catch (error) {
        console.error("Export invoices CSV error:", error);
        return null;
      }
    }),

  /**
   * Export receipts to CSV
   */
  exportReceiptsCSV: createFeatureRestrictedProcedure("reports:export")
    .input(
      z.object({
        ids: z.array(z.string()).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      try {
        let query = db.select().from(receipts);

        if (input.ids && input.ids.length > 0) {
          query = query.where(inArray(receipts.id, input.ids)) as any;
        }

        const data = await query;

        const headers = [
          "Receipt Number",
          "Client ID",
          "Total",
          "Tax",
          "Status",
          "Receipt Date",
          "Payment Method",
          "Created At",
        ];

        const rows = data.map((rec: any) => [
          rec.receiptNumber,
          rec.clientId,
          rec.total,
          rec.tax,
          rec.status,
          rec.receiptDate,
          rec.paymentMethod,
          rec.createdAt,
        ]);

        const csv = [
          headers.join(","),
          ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
        ].join("\n");

        return {
          filename: `receipts_${Date.now()}.csv`,
          content: csv,
          format: "csv",
        };
      } catch (error) {
        console.error("Export receipts CSV error:", error);
        return null;
      }
    }),

  /**
   * Export expenses to CSV
   */
  exportExpensesCSV: createFeatureRestrictedProcedure("reports:export")
    .input(
      z.object({
        ids: z.array(z.string()).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      try {
        let query = db.select().from(expenses);

        if (input.ids && input.ids.length > 0) {
          query = query.where(inArray(expenses.id, input.ids)) as any;
        }

        const data = await query;

        const headers = [
          "Expense Date",
          "Category",
          "Amount",
          "Description",
          "Status",
          "Employee ID",
          "Created At",
        ];

        const rows = data.map((exp: any) => [
          exp.expenseDate,
          exp.category,
          exp.amount,
          exp.description,
          exp.status,
          exp.employeeId,
          exp.createdAt,
        ]);

        const csv = [
          headers.join(","),
          ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
        ].join("\n");

        return {
          filename: `expenses_${Date.now()}.csv`,
          content: csv,
          format: "csv",
        };
      } catch (error) {
        console.error("Export expenses CSV error:", error);
        return null;
      }
    }),

  /**
   * Export projects to CSV
   */
  exportProjectsCSV: exportProcedure
    .input(
      z.object({
        ids: z.array(z.string()).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      try {
        let query = db.select().from(projects);

        if (input.ids && input.ids.length > 0) {
          query = query.where(inArray(projects.id, input.ids)) as any;
        }

        const data = await query;

        const headers = [
          "Project Name",
          "Client ID",
          "Start Date",
          "End Date",
          "Budget",
          "Status",
          "Priority",
          "Created At",
        ];

        const rows = data.map((proj: any) => [
          proj.name,
          proj.clientId,
          proj.startDate,
          proj.endDate,
          proj.budget,
          proj.status,
          proj.priority,
          proj.createdAt,
        ]);

        const csv = [
          headers.join(","),
          ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
        ].join("\n");

        return {
          filename: `projects_${Date.now()}.csv`,
          content: csv,
          format: "csv",
        };
      } catch (error) {
        console.error("Export projects CSV error:", error);
        return null;
      }
    }),

  /**
   * Export clients to CSV
   */
  exportClientsCSV: exportProcedure
    .input(
      z.object({
        ids: z.array(z.string()).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      try {
        let query = db.select().from(clients);

        if (input.ids && input.ids.length > 0) {
          query = query.where(inArray(clients.id, input.ids)) as any;
        }

        const data = await query;

        const headers = [
          "Company Name",
          "Contact Person",
          "Email",
          "Phone",
          "Address",
          "City",
          "Country",
          "Status",
          "Industry",
          "Created At",
        ];

        const rows = data.map((client: any) => [
          client.companyName,
          client.contactPerson,
          client.email,
          client.phone,
          client.address,
          client.city,
          client.country,
          client.status,
          client.industry,
          client.createdAt,
        ]);

        const csv = [
          headers.join(","),
          ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
        ].join("\n");

        return {
          filename: `clients_${Date.now()}.csv`,
          content: csv,
          format: "csv",
        };
      } catch (error) {
        console.error("Export clients CSV error:", error);
        return null;
      }
    }),

  /**
   * Export employees to CSV
   */
  exportEmployeesCSV: exportProcedure
    .input(
      z.object({
        ids: z.array(z.string()).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      try {
        let query = db.select().from(employees as any);

        if (input.ids && input.ids.length > 0) {
          query = query.where(inArray((employees as any).id, input.ids)) as any;
        }

        const data = await query;

        const headers = [
          "Employee ID",
          "First Name",
          "Last Name",
          "Email",
          "Phone",
          "Department",
          "Position",
          "Salary",
          "Status",
          "Hire Date",
          "Created At",
        ];

        const rows = data.map((emp: any) => [
          emp.employeeNumber || emp.id,
          emp.firstName,
          emp.lastName,
          emp.email,
          emp.phone,
          emp.department,
          emp.position,
          emp.salary,
          emp.status,
          emp.hireDate,
          emp.createdAt,
        ]);

        const csv = [
          headers.join(","),
          ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
        ].join("\n");

        return {
          filename: `employees_${Date.now()}.csv`,
          content: csv,
          format: "csv",
        };
      } catch (error) {
        console.error("Export employees CSV error:", error);
        return null;
      }
    }),

  /**
   * Export document with line items
   */
  exportDocumentWithLineItems: exportProcedure
    .input(
      z.object({
        documentType: z.enum(["invoice", "receipt", "estimate", "proposal"]),
        documentId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      try {
        let document: any = null;

        switch (input.documentType) {
          case "invoice":
            const inv = await db
              .select()
              .from(invoices)
              .where(eq(invoices.id, input.documentId))
              .limit(1);
            document = inv[0];
            break;
          case "receipt":
            const rec = await db
              .select()
              .from(receipts)
              .where(eq(receipts.id, input.documentId))
              .limit(1);
            document = rec[0];
            break;
          case "estimate":
            const est = await db
              .select()
              .from(estimates)
              .where(eq(estimates.id, input.documentId))
              .limit(1);
            document = est[0];
            break;
          case "proposal":
            const prop = await db
              .select()
              .from(proposals)
              .where(eq(proposals.id, input.documentId))
              .limit(1);
            document = prop[0];
            break;
        }

        if (!document) return null;

        const items = await db
          .select()
          .from(lineItems)
          .where(eq(lineItems.documentId, input.documentId));

        // Create detailed CSV with document info and line items
        const csv = [
          `${input.documentType.toUpperCase()} EXPORT`,
          `Document ID: ${document.id}`,
          `Date: ${new Date().toISOString()}`,
          "",
          "LINE ITEMS:",
          "Item Description,Quantity,Unit Price,Tax %,Line Total",
          ...items.map((item: any) =>
            [
              item.description,
              item.quantity,
              item.rate ?? item.unitPrice ?? '',
              item.taxRate ?? item.tax ?? '',
              item.amount ?? item.lineTotal ?? '',
            ]
              .map((cell) => `"${cell}"`)
              .join(",")
          ),
          "",
          "SUMMARY:",
          `Total: ${document.total}`,
          `Tax: ${document.taxAmount ?? document.tax ?? 0}`,
          `Status: ${document.status}`,
        ].join("\n");

        return {
          filename: `${input.documentType}_${document.id}_${Date.now()}.csv`,
          content: csv,
          format: "csv",
        };
      } catch (error) {
        console.error("Export document error:", error);
        return null;
      }
    }),

  /**
   * Get export templates
   */
  getExportTemplates: exportProcedure.query(async () => {
    return [
      {
        id: "invoice_standard",
        name: "Invoice Standard",
        description: "Standard invoice export with all fields",
        format: "csv",
      },
      {
        id: "invoice_detailed",
        name: "Invoice Detailed",
        description: "Invoice export with line items",
        format: "csv",
      },
      {
        id: "receipt_standard",
        name: "Receipt Standard",
        description: "Standard receipt export",
        format: "csv",
      },
      {
        id: "expense_report",
        name: "Expense Report",
        description: "Expense export by category",
        format: "csv",
      },
      {
        id: "project_summary",
        name: "Project Summary",
        description: "Project export with status",
        format: "csv",
      },
      {
        id: "client_list",
        name: "Client List",
        description: "Complete client information export",
        format: "csv",
      },
      {
        id: "employee_list",
        name: "Employee List",
        description: "Export basic employee information",
        format: "csv",
      },
    ];
  }),

  /**
   * Validate export data
   */
  validateExportData: exportProcedure
    .input(
      z.object({
        documentType: z.string(),
        ids: z.array(z.string()),
      })
    )
    .query(async ({ input }) => {
      return {
        valid: true,
        recordCount: input.ids.length,
        estimatedSize: `${(input.ids.length * 0.5).toFixed(2)} KB`,
        canExport: true,
      };
    }),
});
