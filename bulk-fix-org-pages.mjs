import fs from "fs";
import path from "path";

function toPascalCase(str) {
  return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

const pagesConfig = [
  { file: "OrgAccounting.tsx", feature: "accounting", varName: "Accounting" },
  { file: "OrgAI.tsx", feature: "ai_hub", varName: "AiHub" },
  { file: "OrgAttendance.tsx", feature: "attendance", varName: "Attendance" },
  { file: "OrgBudgets.tsx", feature: "budgets", varName: "Budgets" },
  { file: "OrgCommunications.tsx", feature: "communications", varName: "Communications" },
  { file: "OrgContracts.tsx", feature: "contracts", varName: "Contracts" },
  { file: "OrgHR.tsx", feature: "hr", varName: "Hr" },
  { file: "OrgLeave.tsx", feature: "leave", varName: "Leave" },
  { file: "OrgProcurement.tsx", feature: "procurement", varName: "Procurement" },
  { file: "OrgProjects.tsx", feature: "projects", varName: "Projects" },
  { file: "OrgReports.tsx", feature: "reports", varName: "Reports" },
  { file: "OrgSalesPipeline.tsx", feature: "crm", varName: "Crm" },
  { file: "OrgTickets.tsx", feature: "tickets", varName: "Tickets" },
  { file: "OrgWorkOrders.tsx", feature: "work_orders", varName: "WorkOrders" },
];

const baseDir = "d:\\Websites & Stuff\\Kiini\\client\\src\\pages\\org";

for (const { file, feature, varName } of pagesConfig) {
  const filePath = path.join(baseDir, file);
  let content = fs.readFileSync(filePath, "utf-8");
  
  // 1. Add import if not present
  if (!content.includes('import { useOrgAccess }')) {
    content = content.replace(
      /import { trpc } from "@\/lib\/trpc";/,
      'import { trpc } from "@/lib/trpc";\nimport { useOrgAccess } from "@/hooks/useOrgAccess";'
    );
  }
  
  // 2. Fix malformed variable names (e.g., canViewBudgetsbudgets → canViewBudgets)
  content = content.replace(
    new RegExp(`canView${varName}${varName}`, 'g'),
    `canView${varName}`
  );
  
  // 3. Remove old featureMap and accessGranted declarations if still present
  content = content.replace(
    /const featureMap = myOrgData\?\.featureMap \?\? \{\};\n\s*/,
    ''
  );
  content = content.replace(
    /const featureMap = orgData\?\.featureMap \?\? \{\};\n\s*/,
    ''
  );
  content = content.replace(
    /const (hasAccess|accessGranted) = !(myOrgData|orgData) \|\| (featureMap|myOrgData)\..+?;\n\s*/,
    ''
  );
  
  // 4. Replace remaining featureMap references with proper variable
  content = content.replace(
    new RegExp(`featureMap\\.${feature}`, 'g'),
    `canView${varName}`
  );
  
  // 5. Replace enabled condition patterns
  content = content.replace(
    /enabled: !!(canView[A-Za-z]+)[A-Za-z]*/g,
    `enabled: !!canView${varName}`
  );
  content = content.replace(
    /enabled: !\s*(myOrgData|orgData) \|\| !!(canView[A-Za-z]+)/g,
    `enabled: !!canView${varName}`
  );
  
  // 6. Update error messages if they still say "organization plan"
  content = content.replace(
    /is not enabled for your organization plan\./g,
    "is not enabled for your organization. Please contact your administrator."
  );
  
  // 7. Replace !accessGranted with !canView pattern
  content = content.replace(
    new RegExp(`!(accessGranted|hasAccess)(?!Access)`, 'g'),
    `!canView${varName}`
  );
  content = content.replace(
    new RegExp(`{!(accessGranted|hasAccess)`, 'g'),
    `{!canView${varName}`
  );
  
  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`✓ Fixed ${file}`);
}

console.log("\n✓ All org pages fixed!");
