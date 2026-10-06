#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const basePath = path.join(__dirname, "client/src/pages/org");

// Mapping of page patterns to feature keys and permission types
const pageConfigs = [
  // List pages
  { file: "OrgActivity.tsx", feature: "activity", perms: ["view"] },
  { file: "OrgAI.tsx", feature: "ai_hub", perms: ["view"] },
  { file: "OrgApprovals.tsx", feature: "approvals", perms: ["view"] },
  { file: "OrgAssets.tsx", feature: "assets", perms: ["view"] },
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
  { file: "OrgDebitNotes.tsx", feature: "invoicing", perms: ["view"] },
  { file: "OrgDeliveryNotes.tsx", feature: "procurement", perms: ["view"] },
  { file: "OrgDepartments.tsx", feature: "hr", perms: ["view"] },
  { file: "OrgDocuments.tsx", feature: "documents", perms: ["view", "create"] },
  { file: "OrgEmployees.tsx", feature: "employees", perms: ["view"] },
  { file: "OrgEstimates.tsx", feature: "invoicing", perms: ["view", "create"] },
  { file: "OrgFinancialDashboard.tsx", feature: "accounting", perms: ["view"] },
  { file: "OrgForecasting.tsx", feature: "accounting", perms: ["view"] },
  { file: "OrgGRN.tsx", feature: "procurement", perms: ["view"] },
  { file: "OrgHR.tsx", feature: "hr", perms: ["view"] },
  { file: "OrgImprests.tsx", feature: "procurement", perms: ["view"] },
  { file: "OrgInventory.tsx", feature: "procurement", perms: ["view"] },
  { file: "OrgJobGroups.tsx", feature: "hr", perms: ["view"] },
  { file: "OrgKnowledgebase.tsx", feature: "knowledgebase", perms: ["view"] },
  { file: "OrgLeads.tsx", feature: "crm", perms: ["view", "create"] },
  { file: "OrgLPOs.tsx", feature: "procurement", perms: ["view", "create"] },
  { file: "OrgOrders.tsx", feature: "procurement", perms: ["view", "create"] },
  { file: "OrgPayroll.tsx", feature: "payroll", perms: ["view"] },
  { file: "OrgPerformanceReviews.tsx", feature: "performance_reviews", perms: ["view"] },
  { file: "OrgProducts.tsx", feature: "procurement", perms: ["view", "create"] },
  { file: "OrgProposals.tsx", feature: "invoicing", perms: ["view", "create"] },
  { file: "OrgPurchaseOrders.tsx", feature: "procurement", perms: ["view", "create"] },
  { file: "OrgQuotations.tsx", feature: "invoicing", perms: ["view", "create"] },
  { file: "OrgReceipts.tsx", feature: "invoicing", perms: ["view", "create"] },
  { file: "OrgReports.tsx", feature: "reports", perms: ["view"] },
  { file: "OrgSalesPipeline.tsx", feature: "crm", perms: ["view"] },
  { file: "OrgServices.tsx", feature: "invoicing", perms: ["view", "create"] },
  { file: "OrgServiceInvoices.tsx", feature: "invoicing", perms: ["view"] },
  { file: "OrgServiceTemplates.tsx", feature: "invoicing", perms: ["view"] },
  { file: "OrgStaffChat.tsx", feature: "communications", perms: ["view"] },
  { file: "OrgSubscriptions.tsx", feature: "invoicing", perms: ["view"] },
  { file: "OrgSuppliers.tsx", feature: "procurement", perms: ["view", "create"] },
  { file: "OrgTasks.tsx", feature: "projects", perms: ["view", "create"] },
  { file: "OrgTaxCompliance.tsx", feature: "accounting", perms: ["view"] },
  { file: "OrgTickets.tsx", feature: "tickets", perms: ["view", "create"] },
  { file: "OrgTimesheets.tsx", feature: "projects", perms: ["view"] },
  { file: "OrgWarranty.tsx", feature: "assets", perms: ["view"] },
  { file: "OrgWorkOrders.tsx", feature: "work_orders", perms: ["view", "create"] },
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
  "OrgLeave.tsx",
  "OrgProcurement.tsx",
  "OrgProjects.tsx",
  "OrgDashboard.tsx",
  "_OrgPageTemplate.tsx"
]);

function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

function generatePermissionVariables(feature, perms) {
  const camelFeature = toCamelCase(feature);
  const lines = [];
  
  for (const perm of perms) {
    const camelPerm = perm.charAt(0).toUpperCase() + perm.slice(1);
    const camelFeat = camelFeature.charAt(0).toUpperCase() + camelFeature.slice(1);
    const varName = `can${camelPerm}${camelFeat}`;
    lines.push(`  const ${varName} = hasAccess('org:${feature}:${perm}');`);
  }
  
  return lines.join('\n');
}

async function processPages() {
  let fixed = 0;
  let skipped = 0;
  let errors = [];

  for (const config of pageConfigs) {
    // Skip already implemented pages
    if (skipPages.has(config.file)) {
      continue;
    }

    const filePath = path.join(basePath, config.file);
    
    try {
      if (!fs.existsSync(filePath)) {
        continue;
      }

      let content = fs.readFileSync(filePath, "utf-8");

      // Check if hasAccess is properly destructured from useOrgAccess
      const hasUseOrgAccessHook = content.includes("useOrgAccess()");
      const hasHasAccessDestructure = content.includes("hasAccess");
      const hasProperDestructure = content.match(/const \{[^}]*hasAccess[^}]*\} = useOrgAccess\(\);/);

      if (!hasProperDestructure && hasUseOrgAccessHook && hasHasAccessDestructure) {
        // Need to add hasAccess to the destructuring
        content = content.replace(
          /const \{ ([^}]*) \} = useOrgAccess\(\);/,
          (match, vars) => {
            if (vars.includes("hasAccess")) {
              return match;
            }
            return `const { ${vars.trim()}, hasAccess } = useOrgAccess();`;
          }
        );

        fs.writeFileSync(filePath, content, "utf-8");
        console.log(`✅ FIXED: ${config.file}`);
        fixed++;
      }
    } catch (error) {
      errors.push({ file: config.file, error: error.message });
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Summary: ${fixed} fixed, ${errors.length} errors`);
}

processPages().catch(console.error);
