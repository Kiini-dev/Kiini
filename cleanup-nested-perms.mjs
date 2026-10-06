#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const basePath = path.join(__dirname, "client/src/pages/org");

// All pages that need checking
const pagesToCheck = fs.readdirSync(basePath)
  .filter(f => f.startsWith('Org') && f.endsWith('.tsx'));

async function cleanupPages() {
  let fixed = 0;
  let errors = [];

  for (const file of pagesToCheck) {
    const filePath = path.join(basePath, file);

    try {
      let content = fs.readFileSync(filePath, "utf-8");

      // Check if there are canView/canCreate/canEdit/canDelete variables inside nested functions
      // Pattern: const can[A-Z] inside a function that's not export default
      const hasNestedPermVars = content.match(/\n\s{2}const can[A-Z]\w+ = hasAccess\(/m);
      
      // Check if there's an export default function
      const hasExportDefault = content.includes("export default function");

      if (hasNestedPermVars && hasExportDefault) {
        // Likely has the issue
        const lines = content.split('\n');
        let changes = [];
        let inExportDefault = false;
        let bracketDepth = 0;
        
        // First pass: identify export default function
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes("export default function")) {
            inExportDefault = true;
            bracketDepth = 1;
            
            // Look ahead to find the first line after the opening brace
            for (let j = i + 1; j < lines.length; j++) {
              if (lines[j].includes("{")) bracketDepth++;
              if (lines[j].includes("}")) bracketDepth--;
              
              // First const statement after export default
              if (lines[j].trim().startsWith("const ") && bracketDepth > 0) {
                // Remove any can* = hasAccess lines that appear before this
                for (let k = i + 1; k < j; k++) {
                  if (lines[k].match(/const can[A-Z]\w+ = hasAccess\(/)) {
                    lines[k] = null; // Mark for removal
                    changes.push(`Removed misplaced permission variable from line ${k + 1}`);
                  }
                }
                break;
              }
            }
            break;
          }
        }

        if (changes.length > 0) {
          content = lines.filter(l => l !== null).join('\n');
          fs.writeFileSync(filePath, content, "utf-8");
          console.log(`✅ CLEANED: ${file} - ${changes.length} issues fixed`);
          fixed++;
        }
      }
    } catch (error) {
      errors.push({ file, error: error.message });
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Summary: ${fixed} cleaned, ${errors.length} errors`);
}

cleanupPages().catch(console.error);
