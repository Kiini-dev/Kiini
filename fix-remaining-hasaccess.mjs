#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const basePath = path.join(__dirname, "client/src/pages/org");

// Pages needing hasAccess destructuring
const pagesNeedingFix = [
  "OrgAssets.tsx", "OrgAttendanceDetail.tsx", "OrgBankReconciliation.tsx", "OrgBudgetDetail.tsx",
  "OrgCannedResponses.tsx", "OrgClientDetail.tsx", "OrgContactDetail.tsx", "OrgContractDetail.tsx",
  "OrgContractTemplates.tsx", "OrgCreateAttendance.tsx", "OrgCreateClient.tsx", "OrgCreateContract.tsx",
  "OrgCreateCreditNote.tsx", "OrgCreateDebitNote.tsx", "OrgCreateExpense.tsx", "OrgCreateInvoice.tsx",
  "OrgCreateLeave.tsx", "OrgCreateLPO.tsx", "OrgCreateOrder.tsx", "OrgCreateProcurement.tsx",
  "OrgCreateProduct.tsx", "OrgCreateProject.tsx", "OrgCreateProposal.tsx", "OrgCreatePurchaseOrder.tsx",
  "OrgCreateQuotation.tsx", "OrgCreateReceipt.tsx", "OrgCreateService.tsx", "OrgCreateSupplier.tsx",
  "OrgCreateTicket.tsx", "OrgCreateWorkOrder.tsx", "OrgCreditNoteDetail.tsx", "OrgDebitNoteDetail.tsx",
  "OrgDeliveryNotes.tsx", "OrgDocuments.tsx", "OrgEditApproval.tsx", "OrgEditAttendance.tsx",
  "OrgEditBudget.tsx", "OrgEditContact.tsx", "OrgEditContract.tsx", "OrgEditCreditNote.tsx",
  "OrgEditDebitNote.tsx", "OrgEditEstimate.tsx", "OrgEditExpense.tsx", "OrgEditInvoice.tsx",
  "OrgEditLead.tsx", "OrgEditLeave.tsx", "OrgEditLPO.tsx", "OrgEditOrder.tsx", "OrgEditPayment.tsx",
  "OrgEditProcurement.tsx", "OrgEditProduct.tsx", "OrgEditProject.tsx", "OrgEditProposal.tsx",
  "OrgEditPurchaseOrder.tsx", "OrgEditQuotation.tsx", "OrgEditReceipt.tsx", "OrgEditService.tsx",
  "OrgEditSupplier.tsx", "OrgEditTicket.tsx", "OrgEditWorkOrder.tsx", "OrgEstimateDetail.tsx",
  "OrgExpenseDetail.tsx", "OrgForecasting.tsx", "OrgImprests.tsx", "OrgInvoiceDetail.tsx",
  "OrgKnowledgebase.tsx", "OrgLeadDetail.tsx", "OrgLeaveDetail.tsx", "OrgLPODetail.tsx",
  "OrgOrderDetail.tsx", "OrgPaymentDetail.tsx", "OrgPerformanceReviews.tsx", "OrgProcurementDetail.tsx",
  "OrgProductDetail.tsx", "OrgProjectDetail.tsx", "OrgProposalDetail.tsx", "OrgPurchaseOrderDetail.tsx",
  "OrgPurchaseOrders.tsx", "OrgQuotationDetail.tsx", "OrgReceiptDetail.tsx", "OrgServiceDetail.tsx",
  "OrgStaffChat.tsx", "OrgSubscriptions.tsx", "OrgSupplierDetail.tsx", "OrgTaxCompliance.tsx",
  "OrgTicketDetail.tsx", "OrgTimesheets.tsx", "OrgWorkOrderDetail.tsx"
];

async function fixAllPages() {
  let fixed = 0;
  let skipped = 0;
  let errors = [];

  for (const fileName of pagesNeedingFix) {
    const filePath = path.join(basePath, fileName);

    try {
      if (!fs.existsSync(filePath)) {
        skipped++;
        continue;
      }

      let content = fs.readFileSync(filePath, "utf-8");

      // Check if already has proper destructuring
      if (content.match(/const\s*{\s*hasAccess\s*}\s*=\s*useOrgAccess\s*\(/)) {
        skipped++;
        continue;
      }

      // Check if it imports useOrgAccess
      if (!content.includes('useOrgAccess')) {
        skipped++;
        continue;
      }

      // Find the export default function line
      const exportMatch = content.match(/export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{/);
      if (!exportMatch) {
        errors.push({ file: fileName, error: "No export default function found" });
        continue;
      }

      // Get position after the opening brace
      const exportPos = content.indexOf(exportMatch[0]) + exportMatch[0].length;
      
      // Insert the hasAccess destructuring right after function declaration
      const destructuring = "\n  const { hasAccess } = useOrgAccess();";
      
      content = content.slice(0, exportPos) + destructuring + content.slice(exportPos);

      fs.writeFileSync(filePath, content, "utf-8");
      console.log(`✅ FIXED: ${fileName}`);
      fixed++;
    } catch (error) {
      errors.push({ file: fileName, error: error.message });
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Summary: ${fixed} fixed, ${skipped} skipped, ${errors.length} errors`);
  
  if (errors.length > 0) {
    console.log("\nErrors:");
    errors.forEach(e => console.log(`  ❌ ${e.file}: ${e.error}`));
  }
}

fixAllPages().catch(console.error);
