import fs from "fs";
import path from "path";

const pagesConfig = [
  { file: "OrgAccounting.tsx", feature: "accounting" },
  { file: "OrgAI.tsx", feature: "ai_hub" },
  { file: "OrgAttendance.tsx", feature: "attendance" },
  { file: "OrgBudgets.tsx", feature: "budgets" },
  { file: "OrgCommunications.tsx", feature: "communications" },
  { file: "OrgContracts.tsx", feature: "contracts" },
  { file: "OrgHR.tsx", feature: "hr" },
  { file: "OrgLeave.tsx", feature: "leave" },
  { file: "OrgProcurement.tsx", feature: "procurement" },
  { file: "OrgProjects.tsx", feature: "projects" },
  { file: "OrgReports.tsx", feature: "reports" },
  { file: "OrgSalesPipeline.tsx", feature: "crm" },
  { file: "OrgTickets.tsx", feature: "tickets" },
  { file: "OrgWorkOrders.tsx", feature: "work_orders" },
];

const baseDir = "d:\\Websites & Stuff\\Kiini\\client\\src\\pages\\org";

for (const { file, feature } of pagesConfig) {
  const filePath = path.join(baseDir, file);
  let content = fs.readFileSync(filePath, "utf-8");
  
  // 1. Add import if not present
  if (!content.includes('import { useOrgAccess }')) {
    content = content.replace(
      /import { trpc } from "@\/lib\/trpc";/,
      'import { trpc } from "@/lib/trpc";\nimport { useOrgAccess } from "@/hooks/useOrgAccess";'
    );
  }
  
  // 2. Replace featureMap pattern with useOrgAccess
  content = content.replace(
    /const { data: myOrgData } = trpc\.multiTenancy\.getMyOrg\.useQuery.*?\n\s*const featureMap = myOrgData\?\.featureMap \?\? \{\};/s,
    `const { hasAccess } = useOrgAccess();
  const canView${feature.charAt(0).toUpperCase() + feature.slice(1).replace(/_/g, '')} = hasAccess("org:${feature}:view");`
  );
  
  // Also handle alternative patterns
  content = content.replace(
    /const { data: orgData } = trpc\.multiTenancy\.getMyOrg\.useQuery.*?\n\s*const featureMap = orgData\?\.featureMap \?\? \{\};/s,
    `const { hasAccess } = useOrgAccess();
  const canView${feature.charAt(0).toUpperCase() + feature.slice(1).replace(/_/g, '')} = hasAccess("org:${feature}:view");`
  );
  
  // 3. Replace query enabled condition
  const featureCamelCase = feature.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
  content = content.replace(
    /enabled: !myOrgData \|\| !!\s*featureMap\./g,
    `enabled: !!canView${feature.charAt(0).toUpperCase() + featureCamelCase.slice(1)}`
  );
  content = content.replace(
    /enabled: !\s*orgData \|\| !!\s*featureMap\./g,
    `enabled: !!canView${feature.charAt(0).toUpperCase() + featureCamelCase.slice(1)}`
  );
  
  // 4. Replace !accessGranted/!hasAccess with permission check
  content = content.replace(
    /!accessGranted/g,
    `!canView${feature.charAt(0).toUpperCase() + featureCamelCase.slice(1)}`
  );
  content = content.replace(
    /!hasAccess/g,
    `!canView${feature.charAt(0).toUpperCase() + featureCamelCase.slice(1)}`
  );
  
  // 5. Remove old accessGranted/hasAccess variable declarations
  content = content.replace(
    /const accessGranted = !myOrgData \|\| featureMap\..*?;\n/,
    ""
  );
  content = content.replace(
    /const hasAccess = !orgData \|\| featureMap\..*?;\n/,
    ""
  );
  
  // 6. Update error messages
  content = content.replace(
    /is not enabled for your organization plan\./g,
    "is not enabled for your organization. Please contact your administrator."
  );
  
  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`✓ Updated ${file}`);
}

console.log("\n✓ All org pages updated!");
