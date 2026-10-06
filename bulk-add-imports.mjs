import fs from "fs";
import path from "path";
import { readdirSync } from "fs";

const orgDir = "d:\\Websites & Stuff\\Kiini\\client\\src\\pages\\org";

// Map page patterns to feature keys and descriptions
const pagePatterns = [
  // Detail pages
  { pattern: /OrgBudgetDetail/, features: ["budgets"], type: "detail" },
  { pattern: /OrgAttendanceDetail/, features: ["attendance"], type: "detail" },
  { pattern: /OrgContactDetail/, features: ["contacts"], type: "detail" },
  { pattern: /OrgClientDetail/, features: ["clients"], type: "detail" },
  { pattern: /OrgContractDetail/, features: ["contracts"], type: "detail" },
  { pattern: /OrgInvoiceDetail/, features: ["invoicing"], type: "detail" },
  { pattern: /OrgExpenseDetail/, features: ["expenses"], type: "detail" },
  { pattern: /OrgEstimateDetail/, features: ["estimates"], type: "detail" },
  { pattern: /OrgLPODetail/, features: ["lpos"], type: "detail" },
  { pattern: /OrgOrderDetail/, features: ["orders"], type: "detail" },
  { pattern: /OrgPaymentDetail/, features: ["payments"], type: "detail" },
  { pattern: /OrgProductDetail/, features: ["products"], type: "detail" },
  { pattern: /OrgProjectDetail/, features: ["projects"], type: "detail" },
  { pattern: /OrgProposalDetail/, features: ["proposals"], type: "detail" },
  { pattern: /OrgQuotationDetail/, features: ["quotations"], type: "detail" },
  { pattern: /OrgReceiptDetail/, features: ["receipts"], type: "detail" },
  { pattern: /OrgServiceDetail/, features: ["services"], type: "detail" },
  { pattern: /OrgSupplierDetail/, features: ["suppliers"], type: "detail" },
  { pattern: /OrgTicketDetail/, features: ["tickets"], type: "detail" },
  { pattern: /OrgWorkOrderDetail/, features: ["work_orders"], type: "detail" },
  { pattern: /OrgLeadDetail/, features: ["leads"], type: "detail" },
  { pattern: /OrgLeaveDetail/, features: ["leave"], type: "detail" },
  { pattern: /OrgDebitNoteDetail/, features: ["debit_notes"], type: "detail" },
  { pattern: /OrgCreditNoteDetail/, features: ["credit_notes"], type: "detail" },
  { pattern: /OrgProcurementDetail/, features: ["procurement"], type: "detail" },
  { pattern: /OrgPurchaseOrderDetail/, features: ["purchase_orders"], type: "detail" },

  // Create pages
  { pattern: /OrgCreateReceipt/, features: ["receipts"], type: "create" },
  { pattern: /OrgCreateQuotation/, features: ["quotations"], type: "create" },
  { pattern: /OrgCreatePurchaseOrder/, features: ["purchase_orders"], type: "create" },
  { pattern: /OrgCreateProposal/, features: ["proposals"], type: "create" },
  { pattern: /OrgCreateProject/, features: ["projects"], type: "create" },
  { pattern: /OrgCreateProduct/, features: ["products"], type: "create" },
  { pattern: /OrgCreateProcurement/, features: ["procurement"], type: "create" },
  { pattern: /OrgCreateOrder/, features: ["orders"], type: "create" },
  { pattern: /OrgCreateLPO/, features: ["lpos"], type: "create" },
  { pattern: /OrgCreateLeave/, features: ["leave"], type: "create" },
  { pattern: /OrgCreateInvoice/, features: ["invoicing"], type: "create" },
  { pattern: /OrgCreateExpense/, features: ["expenses"], type: "create" },
  { pattern: /OrgCreateDebitNote/, features: ["debit_notes"], type: "create" },
  { pattern: /OrgCreateCreditNote/, features: ["credit_notes"], type: "create" },
  { pattern: /OrgCreateContract/, features: ["contracts"], type: "create" },
  { pattern: /OrgCreateClient/, features: ["clients"], type: "create" },
  { pattern: /OrgCreateAttendance/, features: ["attendance"], type: "create" },
  { pattern: /OrgCreateWorkOrder/, features: ["work_orders"], type: "create" },
  { pattern: /OrgCreateTicket/, features: ["tickets"], type: "create" },
  { pattern: /OrgCreateSupplier/, features: ["suppliers"], type: "create" },
  { pattern: /OrgCreateService/, features: ["services"], type: "create" },

  // Edit pages
  { pattern: /OrgEdit/, features: [], type: "edit" }, // Generic edit - will handle in code

  // Specific feature pages
  { pattern: /OrgActivity/, features: ["activity"], type: "feature" },
  { pattern: /OrgAssets/, features: ["assets"], type: "feature" },
  { pattern: /OrgApprovals/, features: ["approvals"], type: "feature" },
  { pattern: /OrgBankReconciliation/, features: ["bank_reconciliation"], type: "feature" },
  { pattern: /OrgCalendar/, features: ["calendar"], type: "feature" },
  { pattern: /OrgCannedResponses/, features: ["communications"], type: "feature" },
  { pattern: /OrgChartOfAccounts/, features: ["chart_of_accounts"], type: "feature" },
  { pattern: /OrgContractTemplates/, features: ["contracts"], type: "feature" },
  { pattern: /OrgDeliveryNotes/, features: ["delivery_notes"], type: "feature" },
  { pattern: /OrgDepartments/, features: ["departments"], type: "feature" },
  { pattern: /OrgDocuments/, features: ["documents"], type: "feature" },
  { pattern: /OrgEmployees/, features: ["employees"], type: "feature" },
  { pattern: /OrgForecasting/, features: ["forecasting"], type: "feature" },
  { pattern: /OrgFinancialDashboard/, features: ["financial_dashboard"], type: "feature" },
  { pattern: /OrgGRN/, features: ["grn"], type: "feature" },
  { pattern: /OrgImprests/, features: ["imprests"], type: "feature" },
  { pattern: /OrgInventory/, features: ["inventory"], type: "feature" },
  { pattern: /OrgJobGroups/, features: ["job_groups"], type: "feature" },
  { pattern: /OrgKnowledgebase/, features: ["knowledgebase"], type: "feature" },
  { pattern: /OrgLeads/, features: ["leads"], type: "feature" },
  { pattern: /OrgLPOs/, features: ["lpos"], type: "feature" },
  { pattern: /OrgOrders/, features: ["orders"], type: "feature" },
  { pattern: /OrgPayroll/, features: ["payroll"], type: "feature" },
  { pattern: /OrgPerformanceReviews/, features: ["performance_reviews"], type: "feature" },
  { pattern: /OrgProducts/, features: ["products"], type: "feature" },
  { pattern: /OrgProposals/, features: ["proposals"], type: "feature" },
  { pattern: /OrgPurchaseOrders/, features: ["purchase_orders"], type: "feature" },
  { pattern: /OrgQuotations/, features: ["quotations"], type: "feature" },
  { pattern: /OrgReceipts/, features: ["receipts"], type: "feature" },
  { pattern: /OrgServices/, features: ["services"], type: "feature" },
  { pattern: /OrgServiceInvoices/, features: ["service_invoices"], type: "feature" },
  { pattern: /OrgServiceTemplates/, features: ["service_templates"], type: "feature" },
  { pattern: /OrgStaffChat/, features: ["staff_chat"], type: "feature" },
  { pattern: /OrgSubscriptions/, features: ["subscriptions"], type: "feature" },
  { pattern: /OrgTasks/, features: ["tasks"], type: "feature" },
  { pattern: /OrgTaxCompliance/, features: ["tax_compliance"], type: "feature" },
  { pattern: /OrgTimesheets/, features: ["timesheets"], type: "feature" },
  { pattern: /OrgWarranty/, features: ["warranty"], type: "feature" },
  { pattern: /OrgContacts(?!Detail)/, features: ["contacts"], type: "feature" },
];

// Already updated pages
const alreadyUpdated = new Set([
  "OrgAccounting", "OrgAI", "OrgAttendance", "OrgBudgets", "OrgCommunications",
  "OrgContracts", "OrgCRM", "OrgExpenses", "OrgHR", "OrgInvoices", "OrgLeave",
  "OrgPayments", "OrgProcurement", "OrgProjects", "OrgReports", "OrgSalesPipeline",
  "OrgStaff", "OrgTickets", "OrgWorkOrders", "OrgBilling", "OrgSettings"
]);

let updatedCount = 0;
let skippedCount = 0;

const files = readdirSync(orgDir).filter(f => f.startsWith("Org") && f.endsWith(".tsx"));

for (const file of files) {
  const baseName = file.replace(".tsx", "");
  
  // Skip already updated pages
  if (alreadyUpdated.has(baseName)) {
    skippedCount++;
    continue;
  }
  
  const filePath = path.join(orgDir, file);
  let content = fs.readFileSync(filePath, "utf-8");
  
  // Skip if already has useOrgAccess
  if (content.includes("useOrgAccess")) {
    skippedCount++;
    continue;
  }
  
  // Find matching pattern
  let matchedFeature = null;
  for (const { pattern, features } of pagePatterns) {
    if (pattern.test(baseName)) {
      if (features.length > 0) {
        matchedFeature = features[0];
      } else {
        // For Edit pages, try to infer from the file name
        const featureName = baseName.replace("OrgEdit", "");
        matchedFeature = featureName.replace(/([A-Z])/g, "_$1").toLowerCase().substring(1);
      }
      break;
    }
  }
  
  if (!matchedFeature) {
    skippedCount++;
    continue;
  }
  
  // Add import
  if (!content.includes("import { useOrgAccess }")) {
    content = content.replace(
      /import { trpc } from "@\/lib\/trpc";/,
      'import { trpc } from "@/lib/trpc";\nimport { useOrgAccess } from "@/hooks/useOrgAccess";'
    );
    
    // If no trpc import, add after other imports
    if (!content.includes('import { useOrgAccess }')) {
      const lastImportIndex = content.lastIndexOf("\nimport ");
      if (lastImportIndex !== -1) {
        const endOfLine = content.indexOf("\n", lastImportIndex + 1);
        content = content.slice(0, endOfLine + 1) + `import { useOrgAccess } from "@/hooks/useOrgAccess";\n` + content.slice(endOfLine + 1);
      }
    }
  }
  
  fs.writeFileSync(filePath, content, "utf-8");
  updatedCount++;
}

console.log(`✓ Added useOrgAccess import to ${updatedCount} files`);
console.log(`✓ Skipped ${skippedCount} files (already updated or no match)`);
