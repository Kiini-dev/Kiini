import fs from "fs";
import path from "path";

// Files with redundant hasAccess declarations
const filesToFix = [
  "OrgHR.tsx",
  "OrgReports.tsx",
  "OrgSalesPipeline.tsx"
];

const baseDir = "d:\\Websites & Stuff\\Kiini\\client\\src\\pages\\org";

for (const file of filesToFix) {
  const filePath = path.join(baseDir, file);
  let content = fs.readFileSync(filePath, "utf-8");
  
  // Remove redundant const hasAccess/accessGranted declarations
  // Pattern: const hasAccess = !orgData || canView...;
  // OR: const accessGranted = !myOrgData || canView...;
  content = content.replace(
    /\s*const (hasAccess|accessGranted) = ![a-zA-Z0-9]+ \|\| canView\w+;?\n/g,
    ""
  );
  
  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`✓ Cleaned ${file}`);
}

console.log("\n✓ Fixed duplicate variable declarations!");
