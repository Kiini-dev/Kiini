#!/usr/bin/env node

/**
 * Budget API Fix - Migration Helper
 * 
 * This script applies the budget schema fixes:
 * 1. Generates new Drizzle migration
 * 2. Applies the migration to the database
 * 3. Verifies the fixes worked
 * 
 * Usage: node scripts/fix-budget-api.js
 */
"use strict";

var _require = require('child_process'),
    execSync = _require.execSync;

var path = require('path');

var fs = require('fs');

var colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message) {
  var color = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'reset';
  console.log("".concat(colors[color]).concat(message).concat(colors.reset));
}

function runCommand(cmd, description) {
  log("\n\u25B6 ".concat(description, "..."), 'cyan');

  try {
    var output = execSync(cmd, {
      encoding: 'utf-8',
      stdio: 'inherit'
    });
    log("\u2705 ".concat(description, " - Success"), 'green');
    return true;
  } catch (error) {
    log("\u274C ".concat(description, " - Failed"), 'red');
    console.error(error.message);
    return false;
  }
}

function main() {
  var generateSuccess, migrateSuccess, healthSuccess;
  return regeneratorRuntime.async(function main$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          log('\n=====================================', 'blue');
          log('  Budget API Fix - Migration Helper  ', 'blue');
          log('=====================================\n', 'blue');

          try {
            // Step 1: Generate migration
            log('Step 1: Generating Drizzle migration...', 'cyan');
            generateSuccess = runCommand('npm run db:generate', 'Generating schema migration');

            if (!generateSuccess) {
              log('\n❌ Migration generation failed. Aborting.', 'red');
              process.exit(1);
            } // Step 2: Apply migration


            log('\nStep 2: Applying migration to database...', 'cyan');
            migrateSuccess = runCommand('npm run migrate', 'Applying database migration');

            if (!migrateSuccess) {
              log('\n❌ Migration failed. Database may be in inconsistent state.', 'red');
              process.exit(1);
            } // Step 3: Health check


            log('\nStep 3: Verifying database health...', 'cyan');
            healthSuccess = runCommand('npm run db:health', 'Database health check');

            if (!healthSuccess) {
              log('\n⚠️  Database health check failed.', 'yellow');
            } // Step 4: Summary


            log('\n=====================================', 'blue');
            log('  Migration Complete! ✅', 'green');
            log('=====================================', 'blue');
            log('\nChanges Applied:', 'cyan');
            log('  • budgets.budgetName → default empty string', 'green');
            log('  • budgets.budgetDescription → default empty string', 'green');
            log('  • budgets.startDate → default 2026-01-01', 'green');
            log('  • budgets.endDate → default 2026-12-31', 'green');
            log('  • budgets.approvedBy → default empty string', 'green');
            log('  • budgets.approvedAt → default 2026-01-01', 'green');
            log('  • budgets.createdBy → default empty string', 'green');
            log('  • budgets.createdAt → .defaultNow()', 'green');
            log('  • budgets.updatedAt → .defaultNow()', 'green');
            log('\nNext Steps:', 'cyan');
            log('  1. Test budget creation via UI or API');
            log('  2. Verify no "parameter mismatch" errors');
            log('  3. Check database for new records with proper timestamps');
            log('  4. Monitor application logs for any issues\n');
          } catch (error) {
            log("\n\u274C Unexpected error: ".concat(error.message), 'red');
            process.exit(1);
          }

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
} // Run the migration


main()["catch"](function (error) {
  log("\n\u274C Fatal error: ".concat(error.message), 'red');
  process.exit(1);
});