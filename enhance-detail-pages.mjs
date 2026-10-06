#!/usr/bin/env node
/**
 * Add Access Denial Screens to Detail Pages
 * Adds PermissionGuard wrapper to all detail pages
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pagesDir = path.join(__dirname, "client/src/pages/org");

// Pages that need access denial screens
const DETAIL_PAGES = fs.readdirSync(pagesDir).filter((file) => file.endsWith("Detail.tsx") && file.startsWith("Org"));

console.log(`Found ${DETAIL_PAGES.length} detail pages to update`);

let updated = 0;
let skipped = 0;
let errors = 0;

for (const page of DETAIL_PAGES) {
  const filePath = path.join(pagesDir, page);

  try {
    let content = fs.readFileSync(filePath, "utf-8");

    // Check if already has PermissionGuard import
    if (content.includes('import { PermissionGuard }')) {
      skipped++;
      continue;
    }

    // Add PermissionGuard import after all existing imports
    if (!content.includes("import { PermissionGuard }")) {
      // Find all import statements and add after the last one
      const importLines = content.split("\n");
      let lastImportLineIdx = -1;
      
      for (let i = 0; i < importLines.length; i++) {
        const line = importLines[i].trim();
        if (line.startsWith("import ") && (line.includes("from") || line.endsWith(";"))) {
          // Check if this line ends the import or continues on next line
          if (line.endsWith(";") || line.endsWith("};")) {
            lastImportLineIdx = i;
          }
        }
        // Stop looking after we hit a non-import line that's not empty
        if (lastImportLineIdx !== -1 && line !== "" && !line.startsWith("import")) {
          break;
        }
      }
      
      if (lastImportLineIdx !== -1) {
        importLines.splice(lastImportLineIdx + 1, 0, 'import { PermissionGuard } from "@/components/PermissionGuard";');
        content = importLines.join("\n");
      }
    }

    // Find the main return statement and wrap content with PermissionGuard
    const returnMatch = content.match(/return\s*\(\s*<([A-Za-z]+Layout)[^>]*>/);
    if (!returnMatch) {
      skipped++;
      continue;
    }

    // Extract the permission variable name
    const permVarMatch = content.match(/const (can\w+) = hasAccess\('org:([^']+)'\);/);
    if (!permVarMatch) {
      skipped++;
      continue;
    }

    const permVar = permVarMatch[1];
    const feature = `org:${permVarMatch[2]}`;

    // Find the OrgLayout JSX and add PermissionGuard inside it
    const layoutStartMatch = content.match(/<OrgLayout[^>]*>/);
    if (!layoutStartMatch) {
      skipped++;
      continue;
    }

    // Check if already has PermissionGuard wrapping
    if (content.includes(`<PermissionGuard allowed={${permVar}}`)) {
      skipped++;
      continue;
    }

    // Find the position after the first <OrgLayout...> opening tag
    const layoutStartPos = content.indexOf(layoutStartMatch[0]);
    const layoutEndPos = layoutStartPos + layoutStartMatch[0].length;

    // Insert PermissionGuard after OrgLayout opening
    const guardStart = `\n      <PermissionGuard allowed={${permVar}} feature="${feature}" slug={slug}>\n`;
    const guardEnd = `\n      </PermissionGuard>`;

    // Find the closing OrgLayout tag
    const closingLayoutMatch = /<\/OrgLayout>/.exec(content.slice(layoutEndPos));
    if (!closingLayoutMatch) {
      skipped++;
      continue;
    }

    const closingPos = layoutEndPos + closingLayoutMatch.index;

    const newContent =
      content.slice(0, layoutEndPos) +
      guardStart +
      content.slice(layoutEndPos, closingPos) +
      guardEnd +
      content.slice(closingPos);

    fs.writeFileSync(filePath, newContent, "utf-8");
    updated++;
    console.log(`✓ Updated ${page}`);
  } catch (error) {
    errors++;
    console.error(`✗ Error processing ${page}:`, error instanceof Error ? error.message : error);
  }
}

console.log(`\n=== Summary ===`);
console.log(`✓ Updated: ${updated}`);
console.log(`⊘ Skipped: ${skipped}`);
console.log(`✗ Errors: ${errors}`);
