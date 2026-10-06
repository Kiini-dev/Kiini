#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const basePath = path.join(__dirname, "client/src/pages/org");

// All pages that need fixing (excluding already-fixed ones)
const pagesToFix = [
  "OrgAI.tsx",
  "OrgApprovals.tsx",
  "OrgAssets.tsx",
  "OrgBilling.tsx",
  "OrgBudgets.tsx",
  "OrgCalendar.tsx",
  "OrgCannedResponses.tsx",
  "OrgChartOfAccounts.tsx",
  "OrgCommunications.tsx",
  "OrgContacts.tsx",
  "OrgContracts.tsx",
  "OrgContractTemplates.tsx",
  "OrgCreditNotes.tsx",
  "OrgDebitNotes.tsx",
  "OrgDeliveryNotes.tsx",
  "OrgDepartments.tsx",
  "OrgDocuments.tsx",
  "OrgEmployees.tsx",
  "OrgEstimates.tsx",
  "OrgFinancialDashboard.tsx",
  "OrgForecasting.tsx",
  "OrgGRN.tsx",
  "OrgHR.tsx",
  "OrgImprests.tsx",
  "OrgInventory.tsx",
  "OrgJobGroups.tsx",
  "OrgKnowledgebase.tsx",
  "OrgLeads.tsx",
  "OrgLPOs.tsx",
  "OrgOrders.tsx",
  "OrgPayroll.tsx",
  "OrgPerformanceReviews.tsx",
  "OrgProducts.tsx",
  "OrgProposals.tsx",
  "OrgPurchaseOrders.tsx",
  "OrgQuotations.tsx",
  "OrgReceipts.tsx",
  "OrgReports.tsx",
  "OrgSalesPipeline.tsx",
  "OrgServices.tsx",
  "OrgServiceInvoices.tsx",
  "OrgServiceTemplates.tsx",
  "OrgStaffChat.tsx",
  "OrgSubscriptions.tsx",
  "OrgSuppliers.tsx",
  "OrgTasks.tsx",
  "OrgTaxCompliance.tsx",
  "OrgTickets.tsx",
  "OrgTimesheets.tsx",
  "OrgWarranty.tsx",
  "OrgWorkOrders.tsx",
];

async function fixPages() {
  let fixed = 0;
  let skipped = 0;
  let errors = [];

  for (const file of pagesToFix) {
    const filePath = path.join(basePath, file);

    try {
      if (!fs.existsSync(filePath)) {
        skipped++;
        continue;
      }

      let content = fs.readFileSync(filePath, "utf-8");

      // Only process if it has hasAccess usage AND doesn't have the destructuring
      if (content.includes("hasAccess('org:") && !content.match(/const \{[^}]*hasAccess[^}]*\} = useOrgAccess/)) {
        // Find the export default line
        const exportMatch = content.match(/export default function \w+\(\) \{/);
        if (exportMatch) {
          // Find the first destructuring or hook call after export
          const lines = content.split('\n');
          let insertLineNum = -1;
          
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(exportMatch[0])) {
              // Look for the first line with a destructuring or const statement
              for (let j = i + 1; j < Math.min(i + 15, lines.length); j++) {
                if (lines[j].trim().startsWith('const')) {
                  insertLineNum = j;
                  break;
                }
              }
              break;
            }
          }

          if (insertLineNum > -1) {
            // Insert the hasAccess destructuring
            lines.splice(insertLineNum, 0, '  const { hasAccess } = useOrgAccess();');
            content = lines.join('\n');
            
            fs.writeFileSync(filePath, content, "utf-8");
            console.log(`✅ FIXED: ${file}`);
            fixed++;
          }
        }
      }
    } catch (error) {
      errors.push({ file, error: error.message });
      console.log(`❌ ERROR in ${file}: ${error.message}`);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Summary: ${fixed} fixed, ${skipped} skipped, ${errors.length} errors`);
}

fixPages().catch(console.error);
