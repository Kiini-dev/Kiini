#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const basePath = path.join(__dirname, "client/src/pages/org");

// Pages that were modified by previous automation
const pagesToFix = [
  "OrgActivity.tsx",
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
  let errors = [];

  for (const file of pagesToFix) {
    const filePath = path.join(basePath, file);

    try {
      if (!fs.existsSync(filePath)) {
        continue;
      }

      let content = fs.readFileSync(filePath, "utf-8");

      // Check if the file has hasAccess usage without destructuring
      if (content.includes("hasAccess('org:") && !content.includes("const { hasAccess }")) {
        // Find the useOrgAccess import and check if hasAccess is destructured
        const hookCallMatch = content.match(/useOrgAccess\(\)/);
        if (hookCallMatch) {
          // Check if there's already a destructuring
          const destructureMatch = content.match(/const \{([^}]*)\} = useOrgAccess\(\);/);
          
          if (destructureMatch) {
            // hasAccess might already be there or need to be added
            const destructuredVars = destructureMatch[1];
            if (!destructuredVars.includes("hasAccess")) {
              // Add hasAccess to existing destructuring
              content = content.replace(
                destructureMatch[0],
                `const { ${destructuredVars}, hasAccess } = useOrgAccess();`
              );
              fs.writeFileSync(filePath, content, "utf-8");
              console.log(`✅ FIXED: ${file}`);
              fixed++;
            }
          } else {
            // Need to add the destructuring line before the hasAccess usage
            // Find the first line after imports that has hasAccess
            const lines = content.split('\n');
            let insertLine = -1;
            
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].includes('useOrgAccess()')) {
                insertLine = i;
                break;
              }
            }

            if (insertLine === -1) {
              // Try to find the export default
              for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes('export default function')) {
                  // Look for the first line inside the function with state
                  for (let j = i + 1; j < lines.length; j++) {
                    if (lines[j].match(/const\s+\{.*\}\s*=\s*(useParams|useState|trpc|useMutation|useQuery)/)) {
                      // Insert before this line
                      lines.splice(j, 0, '  const { hasAccess } = useOrgAccess();');
                      content = lines.join('\n');
                      fs.writeFileSync(filePath, content, "utf-8");
                      console.log(`✅ FIXED: ${file}`);
                      fixed++;
                      break;
                    }
                  }
                  break;
                }
              }
            } else {
              // Add destructuring right after useOrgAccess usage
              lines.splice(insertLine + 1, 0, '  const { hasAccess } = useOrgAccess();');
              content = lines.join('\n');
              fs.writeFileSync(filePath, content, "utf-8");
              console.log(`✅ FIXED: ${file}`);
              fixed++;
            }
          }
        }
      }
    } catch (error) {
      errors.push({ file, error: error.message });
      console.log(`❌ ERROR: ${file} - ${error.message}`);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Summary: ${fixed} fixed, ${errors.length} errors`);
}

fixPages().catch(console.error);
