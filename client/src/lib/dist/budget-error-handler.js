"use strict";
exports.__esModule = true;
exports.handleBudgetError = void 0;
var sonner_1 = require("sonner");
/**
 * Call this in any mutation's onError to surface budget depletion as a
 * user-friendly toast notification.
 *
 * Returns `true` when the error was a BUDGET_DEPLETED error (so you can
 * skip generic error handling), `false` otherwise.
 *
 * Usage:
 *   const mutation = trpc.expense.create.useMutation({
 *     onError(err) {
 *       if (handleBudgetError(err)) return;
 *       toast.error(err.message);
 *     },
 *   });
 */
function handleBudgetError(error) {
    if (!(error === null || error === void 0 ? void 0 : error.message))
        return false;
    try {
        var parsed = JSON.parse(error.message);
        if ((parsed === null || parsed === void 0 ? void 0 : parsed.code) === "BUDGET_DEPLETED") {
            var requestedStr = (parsed.requested / 100).toLocaleString("en-KE", {
                style: "currency",
                currency: "KES",
                minimumFractionDigits: 2
            });
            var remainingStr = (parsed.remaining / 100).toLocaleString("en-KE", {
                style: "currency",
                currency: "KES",
                minimumFractionDigits: 2
            });
            sonner_1.toast.error("Budget Depleted: " + parsed.budgetName, {
                description: "Requested " + requestedStr + " but only " + remainingStr + " remains.",
                duration: 7000
            });
            return true;
        }
    }
    catch (_a) {
        // Not a JSON error — fall through
    }
    return false;
}
exports.handleBudgetError = handleBudgetError;
