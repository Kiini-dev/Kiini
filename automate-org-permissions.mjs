#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const basePath = path.join(__dirname, "client/src/pages/org");

// Mapping of page patterns to feature keys and permission types
const pageConfigs = [
  // List pages - need canView and canCreate
  { file: "OrgAccounting.tsx", feature: "accounting", perms: ["view"] },
  { file: "OrgActivity.tsx", feature: "activity", perms: ["view"] },
  { file: "OrgAI.tsx", feature: "ai_hub", perms: ["view"] },
  { file: "OrgApprovals.tsx", feature: "approvals", perms: ["view"] },
  { file: "OrgAssets.tsx", feature: "assets", perms: ["view"] },
  { file: "OrgAttendance.tsx", feature: "attendance", perms: ["view", "create"] },
  { file: "OrgBilling.tsx", feature: "billing", perms: ["view"] },
  { file: "OrgBudgets.tsx", feature: "budgets", perms: ["view", "create"] },
  { file: "OrgCalendar.tsx", feature: "calendar", perms: ["view"] },
  { file: "OrgCannedResponses.tsx", feature: "canned_responses", perms: ["view"] },
  { file: "OrgChartOfAccounts.tsx", feature: "accounting", perms: ["view"] },
  { file: "OrgCommunications.tsx", feature: "communications", perms: ["view"] },
  { file: "OrgContacts.tsx", feature: "crm", perms: ["view", "create"] },
  { file: "OrgContracts.tsx", feature: "contracts", perms: ["view", "create"] },
  { file: "OrgContractTemplates.tsx", feature: "contracts", perms: ["view"] },
  { file: "OrgCreditNotes.tsx", feature: "invoicing", perms: ["view"] },
  { file: "OrgCRM.tsx", feature: "crm", perms: ["view", "manage"] },
  { file: "OrgDebitNotes.tsx", feature: "invoicing", perms: ["view"] },
  { file: "OrgDeliveryNotes.tsx", feature: "procurement", perms: ["view"] },
  { file: "OrgDepartments.tsx", feature: "hr", perms: ["view"] },
  { file: "OrgDocuments.tsx", feature: "documents", perms: ["view", "create"] },
  { file: "OrgEmployees.tsx", feature: "employees", perms: ["view"] },
  { file: "OrgEstimates.tsx", feature: "invoicing", perms: ["view", "create"] },
  { file: "OrgExpenses.tsx", feature: "expenses", perms: ["view", "create"] },
  { file: "OrgFinancialDashboard.tsx", feature: "accounting", perms: ["view"] },
  { file: "OrgForecasting.tsx", feature: "accounting", perms: ["view"] },
  { file: "OrgGRN.tsx", feature: "procurement", perms: ["view"] },
  { file: "OrgHR.tsx", feature: "hr", perms: ["view"] },
  { file: "OrgImprests.tsx", feature: "procurement", perms: ["view"] },
  { file: "OrgInventory.tsx", feature: "procurement", perms: ["view"] },
  { file: "OrgInvoices.tsx", feature: "invoicing", perms: ["view", "create"] },
  { file: "OrgJobGroups.tsx", feature: "hr", perms: ["view"] },
  { file: "OrgKnowledgebase.tsx", feature: "knowledgebase", perms: ["view"] },
  { file: "OrgLeads.tsx", feature: "crm", perms: ["view", "create"] },
  { file: "OrgLeave.tsx", feature: "leave", perms: ["view", "create"] },
  { file: "OrgLPOs.tsx", feature: "procurement", perms: ["view", "create"] },
  { file: "OrgOrders.tsx", feature: "procurement", perms: ["view", "create"] },
  { file: "OrgPayments.tsx", feature: "payments", perms: ["view", "create"] },
  { file: "OrgPayroll.tsx", feature: "payroll", perms: ["view"] },
  { file: "OrgPerformanceReviews.tsx", feature: "performance_reviews", perms: ["view"] },
  { file: "OrgProcurement.tsx", feature: "procurement", perms: ["view", "create"] },
  { file: "OrgProducts.tsx", feature: "procurement", perms: ["view", "create"] },
  { file: "OrgProjects.tsx", feature: "projects", perms: ["view", "create"] },
  { file: "OrgProposals.tsx", feature: "invoicing", perms: ["view", "create"] },
  { file: "OrgPurchaseOrders.tsx", feature: "procurement", perms: ["view", "create"] },
  { file: "OrgQuotations.tsx", feature: "invoicing", perms: ["view", "create"] },
  { file: "OrgReceipts.tsx", feature: "invoicing", perms: ["view", "create"] },
  { file: "OrgReports.tsx", feature: "reports", perms: ["view"] },
  { file: "OrgSalesPipeline.tsx", feature: "crm", perms: ["view"] },
  { file: "OrgServices.tsx", feature: "invoicing", perms: ["view", "create"] },
  { file: "OrgServiceInvoices.tsx", feature: "invoicing", perms: ["view"] },
  { file: "OrgServiceTemplates.tsx", feature: "invoicing", perms: ["view"] },
  { file: "OrgStaff.tsx", feature: "employees", perms: ["view"] },
  { file: "OrgStaffChat.tsx", feature: "communications", perms: ["view"] },
  { file: "OrgSubscriptions.tsx", feature: "invoicing", perms: ["view"] },
  { file: "OrgSuppliers.tsx", feature: "procurement", perms: ["view", "create"] },
  { file: "OrgTasks.tsx", feature: "projects", perms: ["view", "create"] },
  { file: "OrgTaxCompliance.tsx", feature: "accounting", perms: ["view"] },
  { file: "OrgTickets.tsx", feature: "tickets", perms: ["view", "create"] },
  { file: "OrgTimesheets.tsx", feature: "projects", perms: ["view"] },
  { file: "OrgWarranty.tsx", feature: "assets", perms: ["view"] },
  { file: "OrgWorkOrders.tsx", feature: "work_orders", perms: ["view", "create"] },

  // Detail pages - need canView, canEdit, canDelete
  { file: "OrgApprovalDetail.tsx", feature: "approvals", perms: ["view", "edit", "delete"], type: "detail" },
  { file: "OrgAttendanceDetail.tsx", feature: "attendance", perms: ["view", "edit", "delete"], type: "detail" },
  { file: "OrgBudgetDetail.tsx", feature: "budgets", perms: ["view", "edit", "delete"], type: "detail" },
  { file: "OrgClientDetail.tsx", feature: "crm", perms: ["view", "edit", "delete"], type: "detail" },
  { file: "OrgContactDetail.tsx", feature: "crm", perms: ["view", "edit", "delete"], type: "detail" },
  { file: "OrgContractDetail.tsx", feature: "contracts", perms: ["view", "edit", "delete"], type: "detail" },
  { file: "OrgCreditNoteDetail.tsx", feature: "invoicing", perms: ["view", "edit", "delete"], type: "detail" },
  { file: "OrgDebitNoteDetail.tsx", feature: "invoicing", perms: ["view", "edit", "delete"], type: "detail" },
  { file: "OrgEstimateDetail.tsx", feature: "invoicing", perms: ["view", "edit", "delete"], type: "detail" },
  { file: "OrgExpenseDetail.tsx", feature: "expenses", perms: ["view", "edit", "delete"], type: "detail" },
  { file: "OrgInvoiceDetail.tsx", feature: "invoicing", perms: ["view", "edit", "delete"], type: "detail" },
  { file: "OrgLeadDetail.tsx", feature: "crm", perms: ["view", "edit", "delete"], type: "detail" },
  { file: "OrgLeaveDetail.tsx", feature: "leave", perms: ["view", "edit", "delete"], type: "detail" },
  { file: "OrgLPODetail.tsx", feature: "procurement", perms: ["view", "edit", "delete"], type: "detail" },
  { file: "OrgOrderDetail.tsx", feature: "procurement", perms: ["view", "edit", "delete"], type: "detail" },
  { file: "OrgPaymentDetail.tsx", feature: "payments", perms: ["view", "edit", "delete"], type: "detail" },
  { file: "OrgProductDetail.tsx", feature: "procurement", perms: ["view", "edit", "delete"], type: "detail" },
  { file: "OrgProjectDetail.tsx", feature: "projects", perms: ["view", "edit", "delete"], type: "detail" },
  { file: "OrgProposalDetail.tsx", feature: "invoicing", perms: ["view", "edit", "delete"], type: "detail" },
  { file: "OrgProcurementDetail.tsx", feature: "procurement", perms: ["view", "edit", "delete"], type: "detail" },
  { file: "OrgPurchaseOrderDetail.tsx", feature: "procurement", perms: ["view", "edit", "delete"], type: "detail" },
  { file: "OrgQuotationDetail.tsx", feature: "invoicing", perms: ["view", "edit", "delete"], type: "detail" },
  { file: "OrgReceiptDetail.tsx", feature: "invoicing", perms: ["view", "edit", "delete"], type: "detail" },
  { file: "OrgServiceDetail.tsx", feature: "invoicing", perms: ["view", "edit", "delete"], type: "detail" },
  { file: "OrgSupplierDetail.tsx", feature: "procurement", perms: ["view", "edit", "delete"], type: "detail" },
  { file: "OrgTicketDetail.tsx", feature: "tickets", perms: ["view", "edit", "delete"], type: "detail" },
  { file: "OrgWorkOrderDetail.tsx", feature: "work_orders", perms: ["view", "edit", "delete"], type: "detail" },

  // Create pages - need canCreate
  { file: "OrgCreateAttendance.tsx", feature: "attendance", perms: ["create"], type: "create" },
  { file: "OrgCreateClient.tsx", feature: "crm", perms: ["create"], type: "create" },
  { file: "OrgCreateContract.tsx", feature: "contracts", perms: ["create"], type: "create" },
  { file: "OrgCreateCreditNote.tsx", feature: "invoicing", perms: ["create"], type: "create" },
  { file: "OrgCreateDebitNote.tsx", feature: "invoicing", perms: ["create"], type: "create" },
  { file: "OrgCreateExpense.tsx", feature: "expenses", perms: ["create"], type: "create" },
  { file: "OrgCreateInvoice.tsx", feature: "invoicing", perms: ["create"], type: "create" },
  { file: "OrgCreateLeave.tsx", feature: "leave", perms: ["create"], type: "create" },
  { file: "OrgCreateLPO.tsx", feature: "procurement", perms: ["create"], type: "create" },
  { file: "OrgCreateOrder.tsx", feature: "procurement", perms: ["create"], type: "create" },
  { file: "OrgCreateProcurement.tsx", feature: "procurement", perms: ["create"], type: "create" },
  { file: "OrgCreateProduct.tsx", feature: "procurement", perms: ["create"], type: "create" },
  { file: "OrgCreateProject.tsx", feature: "projects", perms: ["create"], type: "create" },
  { file: "OrgCreateProposal.tsx", feature: "invoicing", perms: ["create"], type: "create" },
  { file: "OrgCreatePurchaseOrder.tsx", feature: "procurement", perms: ["create"], type: "create" },
  { file: "OrgCreateQuotation.tsx", feature: "invoicing", perms: ["create"], type: "create" },
  { file: "OrgCreateReceipt.tsx", feature: "invoicing", perms: ["create"], type: "create" },
  { file: "OrgCreateService.tsx", feature: "invoicing", perms: ["create"], type: "create" },
  { file: "OrgCreateSupplier.tsx", feature: "procurement", perms: ["create"], type: "create" },
  { file: "OrgCreateTicket.tsx", feature: "tickets", perms: ["create"], type: "create" },
  { file: "OrgCreateWorkOrder.tsx", feature: "work_orders", perms: ["create"], type: "create" },

  // Edit pages - need canEdit and canDelete
  { file: "OrgEditApproval.tsx", feature: "approvals", perms: ["edit", "delete"], type: "edit" },
  { file: "OrgEditAttendance.tsx", feature: "attendance", perms: ["edit", "delete"], type: "edit" },
  { file: "OrgEditBudget.tsx", feature: "budgets", perms: ["edit", "delete"], type: "edit" },
  { file: "OrgEditContact.tsx", feature: "crm", perms: ["edit", "delete"], type: "edit" },
  { file: "OrgEditContract.tsx", feature: "contracts", perms: ["edit", "delete"], type: "edit" },
  { file: "OrgEditCreditNote.tsx", feature: "invoicing", perms: ["edit", "delete"], type: "edit" },
  { file: "OrgEditDebitNote.tsx", feature: "invoicing", perms: ["edit", "delete"], type: "edit" },
  { file: "OrgEditEstimate.tsx", feature: "invoicing", perms: ["edit", "delete"], type: "edit" },
  { file: "OrgEditExpense.tsx", feature: "expenses", perms: ["edit", "delete"], type: "edit" },
  { file: "OrgEditInvoice.tsx", feature: "invoicing", perms: ["edit", "delete"], type: "edit" },
  { file: "OrgEditLead.tsx", feature: "crm", perms: ["edit", "delete"], type: "edit" },
  { file: "OrgEditLeave.tsx", feature: "leave", perms: ["edit", "delete"], type: "edit" },
  { file: "OrgEditLPO.tsx", feature: "procurement", perms: ["edit", "delete"], type: "edit" },
  { file: "OrgEditOrder.tsx", feature: "procurement", perms: ["edit", "delete"], type: "edit" },
  { file: "OrgEditPayment.tsx", feature: "payments", perms: ["edit", "delete"], type: "edit" },
  { file: "OrgEditProcurement.tsx", feature: "procurement", perms: ["edit", "delete"], type: "edit" },
  { file: "OrgEditProduct.tsx", feature: "procurement", perms: ["edit", "delete"], type: "edit" },
  { file: "OrgEditProject.tsx", feature: "projects", perms: ["edit", "delete"], type: "edit" },
  { file: "OrgEditProposal.tsx", feature: "invoicing", perms: ["edit", "delete"], type: "edit" },
  { file: "OrgEditPurchaseOrder.tsx", feature: "procurement", perms: ["edit", "delete"], type: "edit" },
  { file: "OrgEditQuotation.tsx", feature: "invoicing", perms: ["edit", "delete"], type: "edit" },
  { file: "OrgEditReceipt.tsx", feature: "invoicing", perms: ["edit", "delete"], type: "edit" },
  { file: "OrgEditService.tsx", feature: "invoicing", perms: ["edit", "delete"], type: "edit" },
  { file: "OrgEditSupplier.tsx", feature: "procurement", perms: ["edit", "delete"], type: "edit" },
  { file: "OrgEditTicket.tsx", feature: "tickets", perms: ["edit", "delete"], type: "edit" },
  { file: "OrgEditWorkOrder.tsx", feature: "work_orders", perms: ["edit", "delete"], type: "edit" },
];

// Already implemented pages to skip
const skipPages = new Set([
  "OrgAccounting.tsx",
  "OrgAttendance.tsx",
  "OrgCRM.tsx",
  "OrgExpenses.tsx",
  "OrgInvoices.tsx",
  "OrgPayments.tsx",
  "OrgStaff.tsx",
  "_OrgPageTemplate.tsx"
]);

function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

function generatePermissionVariables(feature, perms) {
  const camelFeature = toCamelCase(feature);
  const lines = [];
  
  for (const perm of perms) {
    const varName = `can${perm.charAt(0).toUpperCase() + perm.slice(1)}${camelFeature.charAt(0).toUpperCase() + camelFeature.slice(1)}`;
    lines.push(`  const ${varName} = hasAccess('org:${feature}:${perm}');`);
  }
  
  return lines.join('\n');
}

async function processPages() {
  let updated = 0;
  let skipped = 0;
  let errors = [];

  for (const config of pageConfigs) {
    // Skip already implemented pages
    if (skipPages.has(config.file)) {
      console.log(`⏭️  SKIPPED: ${config.file} (already implemented)`);
      skipped++;
      continue;
    }

    const filePath = path.join(basePath, config.file);
    
    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  MISSING: ${config.file}`);
        continue;
      }

      let content = fs.readFileSync(filePath, "utf-8");

      // Check if already has permission variables
      if (content.includes(`hasAccess('org:${config.feature}`)) {
        console.log(`✓ ALREADY DONE: ${config.file}`);
        skipped++;
        continue;
      }

      // Generate permission variables
      const permVars = generatePermissionVariables(config.feature, config.perms);

      // Check if hasAccess is already destructured
      if (!content.includes("const { hasAccess")) {
        // Find the existing useOrgAccess hook and update it
        const hookMatch = content.match(/const \{ (.+?) \} = useOrgAccess\(\);/);
        if (hookMatch) {
          const existing = hookMatch[1];
          if (!existing.includes("hasAccess")) {
            content = content.replace(
              `const { ${existing} } = useOrgAccess();`,
              `const { ${existing}, hasAccess } = useOrgAccess();`
            );
          }
        } else {
          // Add the full hook if not present
          content = content.replace(
            /const \{ (.+?) \} = useOrgAccess\(\);/,
            `const { $1, hasAccess } = useOrgAccess();`
          );
        }
      }

      // Find insertion point (after useOrgAccess hook and before first query or state)
      const insertPoint = content.search(/\n\s*(const \{.*?\} = trpc\.|const \[|const .* = useState|const .* = useMemo)/);
      if (insertPoint > 0) {
        content = content.slice(0, insertPoint) + "\n\n" + permVars + "\n" + content.slice(insertPoint);
      }

      fs.writeFileSync(filePath, content, "utf-8");
      console.log(`✅ UPDATED: ${config.file}`);
      updated++;
    } catch (error) {
      errors.push({ file: config.file, error: error.message });
      console.log(`❌ ERROR: ${config.file} - ${error.message}`);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Summary: ${updated} updated, ${skipped} skipped, ${errors.length} errors`);
  if (errors.length > 0) {
    console.log("\nErrors:");
    errors.forEach(e => console.log(`  - ${e.file}: ${e.error}`));
  }
}

// Run the automation
processPages().catch(console.error);
