"use strict";
/**
 * Utility for auto-labeling recurring items with month/year
 * Provides consistent formatting for recurring invoices and expenses
 */
exports.__esModule = true;
exports.applyRecurringLabel = exports.generateRecurringAuditSuffix = exports.generateRecurringLabel = void 0;
/**
 * Generate auto-label for recurring item with month and year
 * @param baseDescription - Original description/title
 * @param date - Date to extract month/year from (defaults to now)
 * @returns Formatted description with month/year appended
 * @example
 * generateRecurringLabel("Internet Subscription", new Date(2026, 3))
 * // Returns: "Internet Subscription - April 2026"
 */
function generateRecurringLabel(baseDescription, date) {
    if (date === void 0) { date = new Date(); }
    var monthFormatter = new Intl.DateTimeFormat("en-US", { month: "long" });
    var month = monthFormatter.format(date);
    var year = date.getFullYear();
    // Add label only if not already present
    if (baseDescription.includes("- " + month + " " + year)) {
        return baseDescription;
    }
    return baseDescription + " - " + month + " " + year;
}
exports.generateRecurringLabel = generateRecurringLabel;
/**
 * Generate audit suffix for recurring items showing auto-generation info
 * @param recurringDescription - Description of the recurring setup
 * @param notes - Additional notes from recurring setup
 * @returns Formatted audit suffix
 */
function generateRecurringAuditSuffix(recurringDescription, notes) {
    var suffix = "\n\n--- Auto-generated from recurring ---";
    if (recurringDescription) {
        suffix += "\nPlan: " + recurringDescription;
    }
    if (notes) {
        suffix += "\n" + notes;
    }
    return suffix;
}
exports.generateRecurringAuditSuffix = generateRecurringAuditSuffix;
/**
 * Apply month/year label to recurring invoice notes and title
 * @param title - Invoice title
 * @param notes - Invoice notes
 * @param baseRecurringNotes - Notes from recurring setup
 * @param date - Date for the recurring item
 * @returns Object with updated title and notes
 */
function applyRecurringLabel(title, notes, baseRecurringNotes, date) {
    if (date === void 0) { date = new Date(); }
    var labeledTitle = generateRecurringLabel(title, date);
    var auditSuffix = generateRecurringAuditSuffix(title, baseRecurringNotes);
    var updatedNotes = (notes || "") + auditSuffix;
    return { title: labeledTitle, notes: updatedNotes };
}
exports.applyRecurringLabel = applyRecurringLabel;
