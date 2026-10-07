/**
 * Groq AI Router
 *
 * Features:
 * - Document Summarization & Intelligence
 * - Email Generation Assistant
 * - Financial Analytics & Insights
 * - Conversational Chat Interface
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, createFeatureRestrictedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  aiDocuments,
  emailGenerationHistory,
  financialAnalytics,
  aiChatSessions,
  aiChatMessages,
  clients,
  expenses,
  invoices,
  payments,
  customReports,
  projects,
  employees,
  products,
  services,
  opportunities,
  estimates,
  proposals,
  receipts,
  departments,
  timeEntries,
} from "../../drizzle/schema";
import { suppliers } from "../../drizzle/schema-extended";
import { eq, desc, and, asc, gte, lte, or, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import * as db from "../db";
import { addPdfBarChart, addPdfKpiCards, generateFinancialReportPDF } from "../utils/report-pdf-generator";
import { addCompanyLetterhead, getCompanyInfo } from "../utils/company-info";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toMajorCurrencyAmount } from "../../shared/currency";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_GROQ_MODEL = "openai/gpt-oss-20b";
const INVALID_GROQ_MODEL = "groq/compound-mini";

function getGroqModel() {
  const configuredModel = process.env.GROQ_MODEL?.trim();
  return !configuredModel || configuredModel === INVALID_GROQ_MODEL
    ? DEFAULT_GROQ_MODEL
    : configuredModel;
}

async function ensureCustomReportsTable(database: any) {
  await database.execute(sql`CREATE TABLE IF NOT EXISTS custom_reports (
    id varchar(64) NOT NULL,
    name varchar(200) NOT NULL,
    description text,
    category varchar(100) NOT NULL,
    dataSources text,
    layout text,
    format enum('PDF','Excel','CSV','HTML') NOT NULL DEFAULT 'PDF',
    isTemplate tinyint NOT NULL DEFAULT 0,
    status enum('draft','active','archived') NOT NULL DEFAULT 'draft',
    owner varchar(200),
    createdBy varchar(64) NOT NULL,
    createdAt timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_custom_reports_category (category),
    KEY idx_custom_reports_status (status)
  )`);
}

function getGroqConfig() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "AI features are not configured. Please set GROQ_API_KEY in your environment.",
    });
  }
  return { apiKey, model: getGroqModel() };
}

export function isMissingOptionalSchemaError(error: unknown): boolean {
  let current: any = error;
  const messages: string[] = [];
  for (let depth = 0; current && depth < 4; depth++, current = current.cause) {
    if (current.code === "ER_NO_SUCH_TABLE" || current.code === "ER_BAD_FIELD_ERROR") return true;
    if (typeof current.message === "string") messages.push(current.message);
  }
  return messages.some((message) => /doesn't exist|does not exist|unknown column/i.test(message));
}

export async function queryOptionalPaymentData<T>(
  query: () => Promise<T>,
  purpose: string,
): Promise<T | null> {
  try {
    return await query();
  } catch (error) {
    if (!isMissingOptionalSchemaError(error)) throw error;
    console.warn(`[AI] Payment data unavailable for ${purpose}; the production payments schema needs repair`);
    return null;
  }
}

const isAllTimeRequest = (message: string) => /\b(all[- ]?time|ever|lifetime|since inception|from the beginning)\b/i.test(message);

async function getChatDataContext(organizationId?: string | null, periodMonths = 1, allTime = false) {
  const database = await getDb();
  if (!database) return "CRM data is currently unavailable.";

  const now = new Date();
  const startDate = new Date(now);
  if (!allTime) startDate.setMonth(startDate.getMonth() - periodMonths);
  const start = startDate.toISOString().replace("T", " ").substring(0, 19);
  const end = now.toISOString().replace("T", " ").substring(0, 19);
  const orgCondition = organizationId ? eq(invoices.organizationId, organizationId) : undefined;
  const paymentConditions = [
    eq(payments.status, "completed"),
    ...(allTime ? [] : [gte(payments.paymentDate, start), lte(payments.paymentDate, end)]),
    ...(organizationId ? [eq(payments.organizationId, organizationId)] : []),
  ];
  const expenseConditions = [
    ...(allTime ? [] : [gte(expenses.expenseDate, start), lte(expenses.expenseDate, end)]),
    ...(organizationId ? [eq(expenses.organizationId, organizationId)] : []),
  ];
  const unpaidConditions = [
    or(eq(invoices.status, "sent"), eq(invoices.status, "partial"), eq(invoices.status, "overdue")),
    ...(orgCondition ? [orgCondition] : []),
  ];

  const countTable = async (table: any) => {
    const conditions = organizationId && table.organizationId ? [eq(table.organizationId, organizationId)] : [];
    const [row] = await database.select({ count: sql<number>`COUNT(*)` }).from(table).where(conditions.length ? and(...conditions) : undefined);
    return Number(row?.count || 0);
  };

  const [paymentRowsResult, expenseRows, unpaidRows, moduleCounts] = await Promise.all([
    queryOptionalPaymentData(
      () => database.select({ amount: payments.amount }).from(payments).where(and(...paymentConditions)),
      "chat context",
    ),
    database.select({ amount: expenses.amount }).from(expenses).where(and(...expenseConditions)),
    database
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        dueDate: invoices.dueDate,
        total: invoices.total,
        paidAmount: invoices.paidAmount,
        clientName: clients.companyName,
      })
      .from(invoices)
      .leftJoin(clients, eq(clients.id, invoices.clientId))
      .where(and(...unpaidConditions))
      .orderBy(asc(invoices.dueDate))
      .limit(50),
    Promise.all([
      ["clients", clients], ["invoices", invoices], ["payments", payments], ["expenses", expenses],
      ["projects", projects], ["employees", employees], ["products", products], ["services", services],
      ["opportunities", opportunities], ["estimates", estimates], ["proposals", proposals], ["receipts", receipts],
      ["departments", departments], ["timeEntries", timeEntries],
    ].map(async ([name, table]) => [
      name,
      name === "payments"
        ? await queryOptionalPaymentData(() => countTable(table), "chat module counts")
        : await countTable(table),
    ] as const)),
  ]);

  const paymentRows = paymentRowsResult || [];
  const inflow = paymentRows.reduce((sum, row) => sum + (row.amount || 0), 0);
  const outflow = expenseRows.reduce((sum, row) => sum + (row.amount || 0), 0);
  const unpaidTotal = unpaidRows.reduce((sum, row) => sum + ((row.total || 0) - (row.paidAmount || 0)), 0);
  const formatMajorAmount = (amount: number) =>
    toMajorCurrencyAmount(amount, "minor").toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const formatDate = (value: string) => new Date(value).toLocaleDateString("en-GB");
  const invoiceLines = unpaidRows.length
    ? unpaidRows.map((invoice) => {
        const balance = (invoice.total || 0) - (invoice.paidAmount || 0);
        return `- [${invoice.invoiceNumber}](/invoices/${invoice.id}) | Client: ${invoice.clientName || "Unknown"} | Balance: ${formatMajorAmount(balance)} | Due: ${formatDate(invoice.dueDate)}`;
      }).join("\n")
    : "No unpaid invoices found.";

  return [
    "AUTHORITATIVE CRM DATA (organization-scoped; monetary amounts are in major units of the organization's configured currency, not minor units):",
    `Cash flow, ${allTime ? "all time" : `last ${periodMonths} month(s) (${formatDate(start)} to ${formatDate(end)}`}${allTime ? "" : ")"}: inflows=${paymentRowsResult ? formatMajorAmount(inflow) : "unavailable (payments schema needs repair)"}, outflows=${formatMajorAmount(outflow)}, net=${paymentRowsResult ? formatMajorAmount(inflow - outflow) : "unavailable"}.`,
    `Unpaid invoices: count=${unpaidRows.length}, outstanding=${formatMajorAmount(unpaidTotal)}. Open list: [View all invoices](/invoices)`,
    "Unpaid invoice records:",
    invoiceLines,
    `Module record counts (organization-scoped): ${JSON.stringify(Object.fromEntries(moduleCounts))}`,
  ].join("\n");
}

type ReportAttachment = {
  format: string;
  filename: string;
  mimeType: string;
  data: string;
};

function extractReportDates(message: string) {
  const dates = message.match(/\b\d{4}-\d{2}-\d{2}\b/g) || [];
  const allTime = isAllTimeRequest(message);
  const endDate = dates[1] ? new Date(`${dates[1]}T23:59:59`) : new Date();
  const startDate = dates[0]
    ? new Date(`${dates[0]}T00:00:00`)
    : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { startDate, endDate, allTime };
}

async function generateSalesReport(message: string, userId: string, organizationId?: string | null) {
  if (!/\b(sales|revenue)\b.*\breport\b|\breport\b.*\b(sales|revenue)\b/i.test(message)) return null;

  const database = await getDb();
  if (!database) throw new Error("Database connection not available");
  await ensureCustomReportsTable(database);
  let { startDate, endDate, allTime } = extractReportDates(message);
  const conditions = [
    ...(allTime ? [] : [
      gte(invoices.issueDate, startDate.toISOString().replace("T", " ").substring(0, 19)),
      lte(invoices.issueDate, endDate.toISOString().replace("T", " ").substring(0, 19)),
    ]),
    ...(organizationId ? [eq(invoices.organizationId, organizationId)] : []),
  ];
  const rows = await database.select({
    id: invoices.id,
    invoiceNumber: invoices.invoiceNumber,
    issueDate: invoices.issueDate,
    total: invoices.total,
    paidAmount: invoices.paidAmount,
    status: invoices.status,
    clientName: clients.companyName,
  }).from(invoices).leftJoin(clients, eq(clients.id, invoices.clientId)).where(and(...conditions)).orderBy(asc(invoices.issueDate));

  if (allTime && rows[0]?.issueDate) startDate = new Date(rows[0].issueDate);

  const reportRows = rows.map((row) => ({
    ...row,
    total: toMajorCurrencyAmount(row.total || 0, "minor"),
    paidAmount: toMajorCurrencyAmount(row.paidAmount || 0, "minor"),
  }));
  const totalInvoiced = reportRows.reduce((sum, row) => sum + row.total, 0);
  const totalPaid = reportRows.reduce((sum, row) => sum + row.paidAmount, 0);
  const outstanding = totalInvoiced - totalPaid;
  const title = allTime ? "Sales Report: All Time" : `Sales Report: ${startDate.toISOString().slice(0, 10)} to ${endDate.toISOString().slice(0, 10)}`;
  const csvCell = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const companyInfo = await getCompanyInfo();
  const csv = [
    ["Company", companyInfo.name].map(csvCell).join(","),
    ["Phone", companyInfo.phone].map(csvCell).join(","),
    ["Email", companyInfo.email].map(csvCell).join(","),
    ["Website", companyInfo.website].map(csvCell).join(","),
    ["Address", companyInfo.address].map(csvCell).join(","),
    ["Report", title].map(csvCell).join(","),
    ["Invoice Number", "Client", "Issue Date", "Total", "Paid", "Outstanding", "Status"].map(csvCell).join(","),
    ...reportRows.map((row) => [row.invoiceNumber, row.clientName || "Unknown", row.issueDate, row.total, row.paidAmount, row.total - row.paidAmount, row.status].map(csvCell).join(",")),
    ["Summary", "Total Invoiced", totalInvoiced].map(csvCell).join(","),
    ["Summary", "Total Paid", totalPaid].map(csvCell).join(","),
    ["Summary", "Outstanding", outstanding].map(csvCell).join(","),
  ].join("\n");
  const markdown = [`# ${title}`, `\nPeriod: ${startDate.toISOString().slice(0, 10)} to ${endDate.toISOString().slice(0, 10)}`, `\n- Total invoiced: ${totalInvoiced}`, `- Total paid: ${totalPaid}`, `- Outstanding: ${outstanding}`, "\n| Invoice | Client | Date | Total | Paid | Status |", "|---|---|---|---:|---:|---|", ...reportRows.map((row) => `| [${row.invoiceNumber}](/invoices/${row.id}) | ${row.clientName || "Unknown"} | ${row.issueDate} | ${row.total} | ${row.paidAmount} | ${row.status} |`)].join("\n");
  const text = markdown.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[#|]/g, "");
  const json = JSON.stringify({ title, startDate, endDate, summary: { totalInvoiced, totalPaid, outstanding, invoiceCount: rows.length }, rows: reportRows }, null, 2);
  const pdf = new jsPDF();
  const reportStartY = addCompanyLetterhead(pdf, companyInfo, "Sales Report");
  pdf.setFontSize(16);
  pdf.text("Sales Report", 14, reportStartY);
  pdf.setFontSize(10);
  pdf.text(`${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, 14, reportStartY + 7);
  const monthlySales = new Map<string, { invoiced: number; paid: number }>();
  reportRows.forEach((row) => {
    const month = new Date(row.issueDate).toLocaleString("en", { month: "short", year: "2-digit" });
    const totals = monthlySales.get(month) || { invoiced: 0, paid: 0 };
    totals.invoiced += Number(row.total || 0);
    totals.paid += Number(row.paidAmount || 0);
    monthlySales.set(month, totals);
  });
  const monthEntries = Array.from(monthlySales.entries());
  let pdfY = addPdfKpiCards(pdf, [
    { label: "Total invoiced", value: `KES ${totalInvoiced.toLocaleString("en-KE", { maximumFractionDigits: 0 })}` },
    { label: "Collected", value: `KES ${totalPaid.toLocaleString("en-KE", { maximumFractionDigits: 0 })}` },
    { label: "Outstanding", value: `KES ${outstanding.toLocaleString("en-KE", { maximumFractionDigits: 0 })}` },
    { label: "Invoices", value: String(rows.length) },
  ], reportStartY + 14);
  pdfY = addPdfBarChart(pdf, "Monthly invoiced and collected", monthEntries.map(([month]) => month), [
    { label: "Invoiced", values: monthEntries.map(([, totals]) => totals.invoiced), color: [15, 118, 110] },
    { label: "Collected", values: monthEntries.map(([, totals]) => totals.paid), color: [37, 99, 235] },
  ], pdfY + 4);
  autoTable(pdf, { startY: pdfY + 4, head: [["Invoice", "Client", "Date", "Total", "Paid", "Outstanding", "Status"]], body: reportRows.map((row) => [row.invoiceNumber, row.clientName || "Unknown", row.issueDate, row.total, row.paidAmount, row.total - row.paidAmount, row.status]) });
  const docx = await Packer.toBuffer(new Document({ sections: [{ children: [new Paragraph({ children: [new TextRun({ text: title, bold: true })] }), new Paragraph(`Total invoiced: ${totalInvoiced}`), new Paragraph(`Total paid: ${totalPaid}`), new Paragraph(`Outstanding: ${outstanding}`), ...reportRows.map((row) => new Paragraph(`${row.invoiceNumber} | ${row.clientName || "Unknown"} | ${row.total} | ${row.status}`))] }] }));
  const dateStamp = new Date().toISOString().slice(0, 10);
  const files: Array<[string, string, string, Buffer]> = [
    ["csv", `Sales_Report_${dateStamp}.csv`, "text/csv", Buffer.from(csv)],
    ["pdf", `Sales_Report_${dateStamp}.pdf`, "application/pdf", Buffer.from(pdf.output("arraybuffer"))],
    ["docx", `Sales_Report_${dateStamp}.docx`, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", docx],
    ["md", `Sales_Report_${dateStamp}.md`, "text/markdown", Buffer.from(markdown)],
    ["txt", `Sales_Report_${dateStamp}.txt`, "text/plain", Buffer.from(text)],
    ["json", `Sales_Report_${dateStamp}.json`, "application/json", Buffer.from(json)],
  ];
  const reportId = uuidv4();
  await database.insert(customReports).values({
    id: reportId,
    name: title,
    description: `AI-generated sales report from ${startDate.toISOString().slice(0, 10)} to ${endDate.toISOString().slice(0, 10)}`,
    category: "Sales",
    dataSources: JSON.stringify(["invoices", "clients"]),
    layout: JSON.stringify({ generatedBy: "ai", formats: files.map(([format]) => format), startDate, endDate }),
    format: "PDF",
    status: "active",
    createdBy: userId,
  });
  return {
    reportId,
    title,
    reportUrl: `/reports/${reportId}`,
    attachments: files.map(([format, filename, mimeType, buffer]): ReportAttachment => ({ format, filename, mimeType, data: buffer.toString("base64") })),
  };
}

async function generateCashFlowReport(message: string, userId: string, organizationId?: string | null) {
  if (!/\b(cash\s*flow|cashflow)\b.*\breport\b|\breport\b.*\b(cash\s*flow|cashflow)\b/i.test(message)) return null;

  const database = await getDb();
  if (!database) throw new Error("Database connection not available");
  await ensureCustomReportsTable(database);
  const allTime = isAllTimeRequest(message);
  const periodMonths = /\b(6|six)\s*months?\b/i.test(message) ? 6 : 1;
  const endDate = new Date();
  let startDate = new Date(endDate);
  startDate.setMonth(startDate.getMonth() - periodMonths);
  const start = startDate.toISOString().replace("T", " ").substring(0, 19);
  const end = endDate.toISOString().replace("T", " ").substring(0, 19);
  const paymentConditions = [
    eq(payments.status, "completed"),
    ...(allTime ? [] : [gte(payments.paymentDate, start), lte(payments.paymentDate, end)]),
    ...(organizationId ? [eq(payments.organizationId, organizationId)] : []),
  ];
  const expenseConditions = [
    ...(allTime ? [] : [gte(expenses.expenseDate, start), lte(expenses.expenseDate, end)]),
    ...(organizationId ? [eq(expenses.organizationId, organizationId)] : []),
  ];
  const [paymentRowsResult, expenseRows] = await Promise.all([
    queryOptionalPaymentData(
      () => database.select({ amount: payments.amount, paymentDate: payments.paymentDate, paymentMethod: payments.paymentMethod }).from(payments).where(and(...paymentConditions)),
      "cash-flow report",
    ),
    database.select({ amount: expenses.amount, expenseDate: expenses.expenseDate, category: expenses.category, description: expenses.description }).from(expenses).where(and(...expenseConditions)),
  ]);
  if (!paymentRowsResult) return null;
  const paymentRows = paymentRowsResult;
  if (allTime) {
    const dates = [...paymentRows.map((row) => row.paymentDate), ...expenseRows.map((row) => row.expenseDate)].sort();
    if (dates[0]) startDate = new Date(dates[0]);
  }
  const reportMonthCount = allTime
    ? Math.max(1, (endDate.getFullYear() - startDate.getFullYear()) * 12 + endDate.getMonth() - startDate.getMonth() + 1)
    : periodMonths;
  const monthKey = (value: string) => value.substring(0, 7);
  const months = new Map<string, { income: number; expenses: number }>();
  for (let index = 0; index < reportMonthCount; index++) {
    const month = new Date(endDate.getFullYear(), endDate.getMonth() - index, 1).toISOString().slice(0, 7);
    months.set(month, { income: 0, expenses: 0 });
  }
  paymentRows.forEach((row) => { const month = months.get(monthKey(row.paymentDate)); if (month) month.income += toMajorCurrencyAmount(row.amount || 0, "minor"); });
  expenseRows.forEach((row) => { const month = months.get(monthKey(row.expenseDate)); if (month) month.expenses += toMajorCurrencyAmount(row.amount || 0, "minor"); });
  const totalIncome = paymentRows.reduce((sum, row) => sum + toMajorCurrencyAmount(row.amount || 0, "minor"), 0);
  const totalExpenses = expenseRows.reduce((sum, row) => sum + toMajorCurrencyAmount(row.amount || 0, "minor"), 0);
  const netCashFlow = totalIncome - totalExpenses;
  const title = allTime ? "Cash Flow Report: All Time" : `Cash Flow Report: ${startDate.toISOString().slice(0, 10)} to ${endDate.toISOString().slice(0, 10)}`;
  const companyInfo = await getCompanyInfo();
  const pdf = new jsPDF();
  const reportStartY = addCompanyLetterhead(pdf, companyInfo, "Cash Flow Report");
  pdf.setFontSize(16);
  pdf.text("Cash Flow Report", 14, reportStartY);
  pdf.setFontSize(10);
  pdf.text(`${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, 14, reportStartY + 7);
  pdf.text(`Total income: ${totalIncome}`, 14, reportStartY + 16);
  pdf.text(`Total expenses: ${totalExpenses}`, 14, reportStartY + 23);
  pdf.text(`Net cash flow: ${netCashFlow}`, 14, reportStartY + 30);
  autoTable(pdf, { startY: reportStartY + 38, head: [["Month", "Income", "Expenses", "Net"]], body: [...months.entries()].reverse().map(([month, values]) => [month, values.income, values.expenses, values.income - values.expenses]) });
  const reportId = uuidv4();
  await database.insert(customReports).values({
    id: reportId,
    name: title,
    description: allTime ? "AI-generated all-time cash flow report" : `AI-generated cash flow report from ${startDate.toISOString().slice(0, 10)} to ${endDate.toISOString().slice(0, 10)}`,
    category: "Cash Flow",
    dataSources: JSON.stringify(["payments", "expenses"]),
    layout: JSON.stringify({ generatedBy: "ai", periodMonths: allTime ? "all" : periodMonths, startDate, endDate, totalIncome, totalExpenses, netCashFlow }),
    format: "PDF",
    status: "active",
    createdBy: userId,
  });
  return {
    reportId,
    title,
    reportUrl: `/reports/${reportId}`,
    attachments: [{ format: "pdf", filename: `Cash_Flow_Report_${endDate.toISOString().slice(0, 10)}.pdf`, mimeType: "application/pdf", data: Buffer.from(pdf.output("arraybuffer")).toString("base64") }],
    summary: `Cash flow report totals for ${allTime ? "all time" : `${periodMonths} months`}: income=${totalIncome}, expenses=${totalExpenses}, net=${netCashFlow}.`,
  };
}

async function groqChat(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  maxTokens = 1024
): Promise<{ text: string; tokensUsed: number }> {
  const { apiKey, model } = getGroqConfig();
  const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }
  const data = await response.json() as any;
  return {
    text: data.choices?.[0]?.message?.content ?? "",
    tokensUsed: data.usage?.completion_tokens ?? 0,
  };
}

export const aiRouter = router({
  // ============================================
  // Document Summarization
  // ============================================
  
  summarizeDocument: createFeatureRestrictedProcedure("ai:summarize")
    .input(
      z.object({
        text: z.string().min(50).max(50000),
        focus: z.enum(['key_points', 'action_items', 'financial', 'general']).optional().default('general'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const prompt = `Summarize the following document focusing on ${input.focus}. Be concise and actionable:\n\n${input.text}`;
        
        const { text: summary, tokensUsed } = await groqChat(
          [{ role: "user", content: prompt }],
          1024
        );

        // Log activity
        await db.logActivity({
          userId: ctx.user.id,
          action: "ai_document_summarized",
          entityType: "ai_request",
          entityId: `summary_${Date.now()}`,
          description: `Summarized document (${input.focus})`,
        });

        return { summary, tokensUsed };
      } catch (error: any) {
        console.error("Groq summarization error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to summarize document: ${error.message}`,
        });
      }
    }),

  // ============================================
  // Email Generation
  // ============================================

  generateEmail: createFeatureRestrictedProcedure("ai:generateEmail")
    .input(
      z.object({
        context: z.string().min(20).max(5000),
        tone: z.enum(['professional', 'friendly', 'formal', 'casual']).default('professional'),
        type: z.enum(['invoice', 'proposal', 'follow_up', 'general']).default('general'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const systemPrompt = `You are a professional business email writer. Generate a concise, ${input.tone} email. Return only the email content without subject line.`;
        const userPrompt = `Generate a ${input.tone} ${input.type} email based on this context:\n\n${input.context}`;
        
        const { text: emailContent, tokensUsed } = await groqChat(
          [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          800
        );

        await db.logActivity({
          userId: ctx.user.id,
          action: "ai_email_generated",
          entityType: "ai_request",
          entityId: `email_${Date.now()}`,
          description: `Generated ${input.type} email (${input.tone})`,
        });

        return { emailContent, tokensUsed };
      } catch (error: any) {
        console.error("Groq email generation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to generate email: ${error.message}`,
        });
      }
    }),

  // ============================================
  // Financial Analytics
  // ============================================

  analyzeFinancials: createFeatureRestrictedProcedure("ai:financial")
    .input(
      z.object({
        dataDescription: z.string().min(20),
        metricType: z.enum(['expense_trends', 'revenue_analysis', 'cash_flow', 'profitability']).default('revenue_analysis'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const prompt = `As a financial analyst, provide insights on the following financial data. All monetary values supplied by the user are in major currency units, not minor units; preserve the stated values and do not multiply or divide amounts by 100. Focus on ${input.metricType}:\n\n${input.dataDescription}\n\nProvide 3-5 actionable insights.`;
        
        const { text: insights, tokensUsed } = await groqChat(
          [{ role: "user", content: prompt }],
          1024
        );

        await db.logActivity({
          userId: ctx.user.id,
          action: "ai_financial_analysis",
          entityType: "ai_request",
          entityId: `financial_${Date.now()}`,
          description: `Analyzed ${input.metricType}`,
        });

        return { insights, tokensUsed };
      } catch (error: any) {
        console.error("Groq financial analysis error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to analyze financials: ${error.message}`,
        });
      }
    }),

  generateCustomAnalyticsReport: createFeatureRestrictedProcedure("ai:financial")
    .input(
      z.object({
        prompt: z.string().min(10).max(4000),
        year: z.number().optional(),
        allTime: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const allTime = input.allTime === true;
        const targetYear = input.year ?? new Date().getFullYear();
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        const yearStart = new Date(targetYear, 0, 1, 0, 0, 0, 0).toISOString();
        const yearEnd = new Date(targetYear, 11, 31, 23, 59, 59, 999).toISOString();
        const organizationId = ctx.user.organizationId;
        const organizationFilter = (organizationColumn: any) =>
          organizationId ? eq(organizationColumn, organizationId) : undefined;
        const dateFilter = (column: any) => allTime
          ? undefined
          : and(
              gte(sql`CAST(${column} AS DATE)`, yearStart.slice(0, 10)),
              lte(sql`CAST(${column} AS DATE)`, yearEnd.slice(0, 10)),
            );
        const combineFilters = (...filters: any[]) => {
          const activeFilters = filters.filter(Boolean);
          return activeFilters.length ? and(...activeFilters) : undefined;
        };

        const [invoiceRows, paymentRows, expenseRows, projectRows, employeeRows, clientRows] = await Promise.all([
          database.select({ total: invoices.total, invoiceDate: invoices.issueDate, status: invoices.status, clientId: invoices.clientId }).from(invoices).where(combineFilters(dateFilter(invoices.issueDate), organizationFilter(invoices.organizationId))),
          database.select({ amount: payments.amount, paymentDate: payments.paymentDate, status: payments.status }).from(payments).where(combineFilters(dateFilter(payments.paymentDate), organizationFilter(payments.organizationId))),
          database.select({ amount: expenses.amount, expenseDate: expenses.expenseDate, category: expenses.category }).from(expenses).where(combineFilters(dateFilter(expenses.expenseDate), organizationFilter(expenses.organizationId))),
          database.select({ status: projects.status, budget: projects.budget }).from(projects).where(organizationFilter(projects.organizationId)),
          database.select({ status: employees.status, isActive: (employees as any).isActive ?? 1 }).from(employees).where(organizationFilter((employees as any).organizationId)),
          database.select({ id: clients.id, companyName: clients.companyName, status: clients.status }).from(clients).where(organizationFilter(clients.organizationId)),
        ]);

        let supplierRows: Array<{ id: string }> = [];
        let supplierCountAvailable = true;
        try {
          supplierRows = await database
            .select({ id: suppliers.id })
            .from(suppliers)
            .where(organizationFilter(suppliers.organizationId));
        } catch (error) {
          if (!isMissingOptionalSchemaError(error)) throw error;
          supplierCountAvailable = false;
          console.warn("[AI Analytics] Supplier count unavailable because its table or organization column is missing");
        }

        const invoiced = invoiceRows.filter((row) => row.status !== "cancelled").reduce((sum, row) => sum + toMajorCurrencyAmount(row.total || 0, "minor"), 0);
        const completedPayments = paymentRows.filter((row) => row.status === "completed");
        const revenue = completedPayments.reduce((sum, row) => sum + toMajorCurrencyAmount(row.amount || 0, "minor"), 0);
        const collected = revenue;
        const expenseTotal = expenseRows.reduce((sum, row) => sum + toMajorCurrencyAmount(row.amount || 0, "minor"), 0);
        const net = revenue - expenseTotal;
        const activeProjects = projectRows.filter((row) => !["completed", "cancelled", "closed"].includes(String(row.status || "").toLowerCase())).length;
        const activeEmployees = employeeRows.filter((row) => row.isActive !== 0 && String(row.status || "").toLowerCase() !== "inactive").length;
        const collectionRate = invoiced > 0 ? ((collected / invoiced) * 100) : 0;

        const structuredData = {
          year: targetYear,
          revenue,
          invoiced,
          expenses: expenseTotal,
          net,
          collected,
          collectionRate,
          activeProjects,
          activeEmployees,
          clientCount: clientRows.length,
          supplierCount: supplierRows.length,
          supplierCountAvailable,
          invoiceCount: invoiceRows.length,
          paymentCount: completedPayments.length,
        };

        const fallbackSummary = [
          `Performance summary for ${targetYear}:`,
          `- Cash revenue: ${revenue.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} from ${completedPayments.length} completed payments; ${invoiced.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} invoiced.`,
          `- Expenses: ${expenseTotal.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} with a net result of ${net.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`,
          `- Cash collection: ${collected.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${collectionRate.toFixed(1)}% collection rate).`,
          `- Operations: ${activeProjects} active projects and ${activeEmployees} active employees.`,
          ...(supplierCountAvailable ? [] : ["- Supplier count unavailable because supplier schema is incomplete." ]),
          `- Recommendation: focus on collections, project delivery, and spend discipline to improve margin.`
        ].join("\n");

        if (!process.env.GROQ_API_KEY) {
          await db.logActivity({
            userId: ctx.user.id,
            action: "ai_analytics_report_generated",
            entityType: "ai_request",
            entityId: `analytics_${Date.now()}`,
            description: `Generated local analytics report for ${targetYear}`,
          });

          return {
            title: `AI Analytics Report ${allTime ? "All Time" : targetYear}`,
            summary: fallbackSummary,
            insights: fallbackSummary.split("\n").filter(Boolean),
            metrics: structuredData,
            generatedAt: new Date().toISOString(),
            provider: "local-fallback",
          };
        }

        const aiPrompt = `You are a senior business analyst. Review the following operating data and answer the user's request. Monetary values are already normalized to major units of the organization's configured currency; do not scale them. Be specific, practical, and concise.\n\nUser request: ${input.prompt}\n\nBusiness data:\n${JSON.stringify(structuredData, null, 2)}\n\nReturn a board-ready report using the following format:\n1. Executive summary\n2. Key findings\n3. Risks or gaps\n4. Recommended actions\n5. KPI snapshot\nKeep the tone highly professional and actionable.`;

        const { text: aiSummary, tokensUsed } = await groqChat(
          [{ role: "user", content: aiPrompt }],
          1200
        );

        await db.logActivity({
          userId: ctx.user.id,
          action: "ai_analytics_report_generated",
          entityType: "ai_request",
          entityId: `analytics_${Date.now()}`,
          description: `Generated AI analytics report for ${targetYear}`,
        });

        return {
          title: `AI Analytics Report ${allTime ? "All Time" : targetYear}`,
          summary: aiSummary,
          insights: aiSummary.split(/\n+/).filter((line) => line.trim().length > 0).slice(0, 10),
          metrics: structuredData,
          generatedAt: new Date().toISOString(),
          provider: "groq",
          tokensUsed,
        };
      } catch (error: any) {
        console.error("AI analytics report generation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to generate custom analytics report: ${error.message}`,
        });
      }
    }),

  // ============================================
  // Conversational AI Chat
  // ============================================

  createChatSession: createFeatureRestrictedProcedure("ai:chat")
    .input(
      z.object({
        title: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        const id = uuidv4();

        await database.insert(aiChatSessions).values({
          id,
          userId: ctx.user.id,
          title: input.title || `Chat ${new Date().toLocaleDateString()}`,
        });

        return { id };
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to create chat session: ${error.message}`,
        });
      }
    }),

  chat: createFeatureRestrictedProcedure("ai:chat")
    .input(
      z.object({
        message: z.string().min(1).max(5000),
        context: z.string().optional(),
        sessionId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        let systemPrompt = 'You are a helpful CRM assistant providing concise, actionable answers about this organization\'s business data. Use the authoritative CRM data below for numbers and records. Never claim you lack access to the data, never invent values, and do not give generic instructions when the requested records are available. For records, preserve the supplied Markdown links exactly so users can open them in the CRM. For cash flow, report the period, inflows, outflows, net result, and a brief positive/negative status. For unpaid invoices, show count, total outstanding, and a compact linked list. If data is unavailable, say so clearly.';

        const allTime = isAllTimeRequest(input.message);
        const requestedMonths = /\b(6|six)\s*months?\b/i.test(input.message) ? 6 : 1;
        const crmDataContext = await getChatDataContext(ctx.user.organizationId, requestedMonths, allTime);
        systemPrompt += `\n\n${crmDataContext}`;
        const generatedReport = await generateCashFlowReport(input.message, ctx.user.id, ctx.user.organizationId)
          || await generateSalesReport(input.message, ctx.user.id, ctx.user.organizationId);
        if (generatedReport) {
          systemPrompt += `\n\nA report was generated and attached. Tell the user it is ready and include this report link exactly: [View report](${generatedReport.reportUrl}). The available attachments are: ${generatedReport.attachments.map((attachment) => attachment.filename).join(", ")}.`;
          if ("summary" in generatedReport) systemPrompt += `\nUse this generated report summary as authoritative: ${generatedReport.summary}`;
        }

        if (input.context) {
          systemPrompt += `\n\nUser Context: ${input.context}`;
        }

        const { text: assistantMessage, tokensUsed } = await groqChat(
          [
            { role: "system", content: systemPrompt },
            { role: "user", content: input.message },
          ],
          1024
        );

        await db.logActivity({
          userId: ctx.user.id,
          action: "ai_chat_interaction",
          entityType: "ai_request",
          entityId: input.sessionId || `chat_${Date.now()}`,
          description: `Chat message: ${input.message.substring(0, 100)}`,
        });

        return {
          message: assistantMessage,
          tokensUsed,
          sessionId: input.sessionId,
          attachments: generatedReport?.attachments || [],
          report: generatedReport ? { id: generatedReport.reportId, title: generatedReport.title, url: generatedReport.reportUrl } : null,
        };
      } catch (error: any) {
        console.error("Groq chat error:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to process chat message: ${error.message}`,
        });
      }
    }),

  /**
   * Check if Claude AI is available
   */
  checkAvailability: createFeatureRestrictedProcedure("ai:access").query(async () => {
    const isAvailable = !!process.env.GROQ_API_KEY;
    return {
      available: isAvailable,
      model: getGroqModel(),
      provider: "groq",
      features: ["summarization", "email_generation", "chat", "financial_analysis"],
    };
  }),
});
