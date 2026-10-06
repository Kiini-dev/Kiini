#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const basePath = path.join(__dirname, "client/src/pages/org");

// Sample pages to verify
const samplePages = [
  "OrgInvoices.tsx",
  "OrgCreateInvoice.tsx",
  "OrgInvoiceDetail.tsx",
  "OrgExpenses.tsx",
  "OrgCreateExpense.tsx",
  "OrgPayments.tsx",
  "OrgAccounting.tsx",
  "OrgEmployees.tsx",
  "OrgApprovals.tsx",
];

async function verifyPermissionEnforcement() {
  console.log("Verifying Permission Enforcement Across Sample Pages\n");
  console.log("=".repeat(70));

  let passCount = 0;
  let issueCount = 0;

  for (const fileName of samplePages) {
    const filePath = path.join(basePath, fileName);
    
    if (!fs.existsSync(filePath)) {
      console.log(`\n⚠️  ${fileName} - FILE NOT FOUND`);
      issueCount++;
      continue;
    }

    const content = fs.readFileSync(filePath, "utf-8");
    
    // Check 1: Has useOrgAccess import
    const hasImport = content.includes("import { useOrgAccess } from");
    
    // Check 2: Has hasAccess destructuring
    const hasDestructuring = content.match(/const\s*{\s*hasAccess\s*}\s*=\s*useOrgAccess/);
    
    // Check 3: Has permission variables (can*)
    const canVarMatches = content.match(/const can[A-Z][a-zA-Z]* = hasAccess\(/g);
    const canVarCount = canVarMatches ? canVarMatches.length : 0;
    
    // Check 4: Uses permission variables in enabled conditions
    const enabledMatches = content.match(/enabled:\s*!!\s*can[A-Z]/g);
    const enabledCount = enabledMatches ? enabledMatches.length : 0;
    
    // Check 5: Uses permission variables in conditional rendering
    const conditionalMatches = content.match(/\{can[A-Z][a-zA-Z]* && </g);
    const conditionalCount = conditionalMatches ? conditionalMatches.length : 0;
    
    const totalUsage = enabledCount + conditionalCount;
    
    // Validation
    const isValid = hasImport && hasDestructuring && canVarCount > 0 && totalUsage > 0;
    
    if (isValid) {
      console.log(`\n✅ ${fileName}`);
      console.log(`   ├─ Import: ✓`);
      console.log(`   ├─ Destructuring: ✓`);
      console.log(`   ├─ Permission vars: ${canVarCount} defined`);
      console.log(`   └─ Usage: ${enabledCount} queries, ${conditionalCount} UI guards`);
      passCount++;
    } else {
      console.log(`\n❌ ${fileName}`);
      console.log(`   ├─ Import: ${hasImport ? "✓" : "✗"}`);
      console.log(`   ├─ Destructuring: ${hasDestructuring ? "✓" : "✗"}`);
      console.log(`   ├─ Permission vars: ${canVarCount === 0 ? "✗" : "✓"}`);
      console.log(`   └─ Usage: ${totalUsage === 0 ? "✗" : "✓"}`);
      issueCount++;
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log(`Summary: ${passCount}/${samplePages.length} pages verified successfully`);
  
  if (issueCount > 0) {
    console.log(`⚠️  ${issueCount} pages need review`);
  }
}

verifyPermissionEnforcement().catch(console.error);
