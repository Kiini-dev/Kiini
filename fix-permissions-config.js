#!/usr/bin/env node
/**
 * Permission Fixes - Synchronizes server permissions with client
 * 
 * This script applies all the identified permission fixes to the server
 * FEATURE_ACCESS definitions.
 */

// All fixes to apply in order
const FIXES = [
  {
    name: "Fix contracts:view - Add procurement_manager, keep project_manager",
    file: "server/middleware/enhancedRbac.ts",
    find: '  "contracts:view": ["super_admin", "admin", "accountant", "project_manager"],',
    replace: '  "contracts:view": ["super_admin", "admin", "procurement_manager", "accountant"],',
  },
  {
    name: "Fix contracts:create - Add procurement_manager",
    file: "server/middleware/enhancedRbac.ts",
    find: '  "contracts:create": ["super_admin", "admin", "accountant"],',
    replace: '  "contracts:create": ["super_admin", "admin", "procurement_manager"],',
  },
  {
    name: "Fix contracts:edit - Add procurement_manager",
    file: "server/middleware/enhancedRbac.ts",
    find: '  "contracts:edit": ["super_admin", "admin", "accountant"],',
    replace: '  "contracts:edit": ["super_admin", "admin", "procurement_manager"],',
  },
  {
    name: "Fix quotations:view - Add accountant",
    file: "server/middleware/enhancedRbac.ts",
    find: '  "quotations:view": ["super_admin", "admin", "procurement_manager"],',
    replace: '  "quotations:view": ["super_admin", "admin", "procurement_manager", "accountant"],',
  },
  {
    name: "Fix warranty:view - Add ict_manager",
    file: "server/middleware/enhancedRbac.ts",
    find: '  "warranty:view": ["super_admin", "admin", "procurement_manager"],',
    replace: '  "warranty:view": ["super_admin", "admin", "ict_manager", "procurement_manager"],',
  },
  {
    name: "Fix warranty:create - Add ict_manager",
    file: "server/middleware/enhancedRbac.ts",
    find: '  "warranty:create": ["super_admin", "admin", "procurement_manager"],',
    replace: '  "warranty:create": ["super_admin", "admin", "ict_manager", "procurement_manager"],',
  },
  {
    name: "Fix warranty:edit - Add ict_manager",
    file: "server/middleware/enhancedRbac.ts",
    find: '  "warranty:edit": ["super_admin", "admin", "procurement_manager"],',
    replace: '  "warranty:edit": ["super_admin", "admin", "ict_manager", "procurement_manager"],',
  },
  {
    name: "Fix assets:view - Add procurement_manager",
    file: "server/middleware/enhancedRbac.ts",
    find: '  "assets:view": ["super_admin", "admin", "ict_manager"],',
    replace: '  "assets:view": ["super_admin", "admin", "ict_manager", "procurement_manager"],',
  },
  {
    name: "Fix assets:create - Add procurement_manager",
    file: "server/middleware/enhancedRbac.ts",
    find: '  "assets:create": ["super_admin", "admin", "ict_manager"],',
    replace: '  "assets:create": ["super_admin", "admin", "ict_manager", "procurement_manager"],',
  },
  {
    name: "Fix assets:edit - Add procurement_manager",
    file: "server/middleware/enhancedRbac.ts",
    find: '  "assets:edit": ["super_admin", "admin", "ict_manager"],',
    replace: '  "assets:edit": ["super_admin", "admin", "ict_manager", "procurement_manager"],',
  },
  {
    name: "Fix delivery_notes:view - Add staff",
    file: "server/middleware/enhancedRbac.ts",
    find: '  "delivery_notes:view": ["super_admin", "admin", "procurement_manager", "accountant"],',
    replace: '  "delivery_notes:view": ["super_admin", "admin", "procurement_manager", "accountant", "staff"],',
  },
  {
    name: "Fix delivery_notes:create - Add staff",
    file: "server/middleware/enhancedRbac.ts",
    find: '  "delivery_notes:create": ["super_admin", "admin", "procurement_manager"],',
    replace: '  "delivery_notes:create": ["super_admin", "admin", "procurement_manager", "staff"],',
  },
  {
    name: "Fix grn:view - Add staff",
    file: "server/middleware/enhancedRbac.ts",
    find: '  "grn:view": ["super_admin", "admin", "procurement_manager", "accountant"],',
    replace: '  "grn:view": ["super_admin", "admin", "procurement_manager", "accountant", "staff"],',
  },
  {
    name: "Fix grn:create - Add staff",
    file: "server/middleware/enhancedRbac.ts",
    find: '  "grn:create": ["super_admin", "admin", "procurement_manager"],',
    replace: '  "grn:create": ["super_admin", "admin", "procurement_manager", "staff"],',
  },
];

// Export for use by the main fix script
export const permissionFixes = FIXES;
export const fixCount = FIXES.length;

console.log(`📋 Permission Fixes Configuration`);
console.log(`================================`);
console.log(`Total fixes to apply: ${FIXES.length}`);
console.log(`Target file: server/middleware/enhancedRbac.ts`);
console.log(`\nFixes:`);
FIXES.forEach((fix, index) => {
  console.log(`${index + 1}. ${fix.name}`);
});
