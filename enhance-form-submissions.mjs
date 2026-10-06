#!/usr/bin/env node
/**
 * Add Form Submission Permission Checks
 * Adds permission validation to form submit handlers on all create pages
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pagesDir = path.join(__dirname, "client/src/pages/org");

// Pages that need form submission checks
const CREATE_PAGES = fs.readdirSync(pagesDir).filter((file) => file.startsWith("OrgCreate") && file.endsWith(".tsx"));

console.log(`Found ${CREATE_PAGES.length} create pages to update`);

let updated = 0;
let skipped = 0;
let errors = 0;

for (const page of CREATE_PAGES) {
  const filePath = path.join(pagesDir, page);

  try {
    let content = fs.readFileSync(filePath, "utf-8");

    // Check if already has the enhanced submission check
    if (content.includes('if (!checkPermission("org:') && content.includes("return;")) {
      skipped++;
      continue;
    }

    // Find the handleSubmit function
    const handleSubmitMatch = content.match(/const handleSubmit = async \(e: React\.FormEvent\) => \{[\s\S]*?e\.preventDefault\(\);/);

    if (!handleSubmitMatch) {
      skipped++;
      continue;
    }

    // Extract the feature from the existing permission check
    const featureMatch = content.match(/const can\w+ = hasAccess\('org:([^']+)'\);/);
    if (!featureMatch) {
      skipped++;
      continue;
    }

    const feature = `org:${featureMatch[1]}`;
    const featureAction = featureMatch[1].split(":").slice(0, -1).join(":");

    // Find where to insert the permission check (after e.preventDefault();)
    const insertPosition = content.indexOf("e.preventDefault();");
    if (insertPosition === -1) {
      skipped++;
      continue;
    }

    const afterPreventDefault = content.indexOf("\n", insertPosition) + 1;

    // Create the permission check code
    const permissionCheckCode = `
    if (!checkPermission("${feature}", "${featureAction}")) {
      return;
    }
`;

    // Insert the permission check
    const newContent =
      content.slice(0, afterPreventDefault) + permissionCheckCode + content.slice(afterPreventDefault);

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
