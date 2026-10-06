"use strict";
exports.__esModule = true;
var react_1 = require("react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var OverduePaymentDashboard_1 = require("@/components/OverduePaymentDashboard");
var lucide_react_1 = require("lucide-react");
/**
 * OverduePayments Page
 *
 * Dedicated page for managing overdue invoice payments
 * - Display all overdue invoices
 * - Send payment reminders (1st, 2nd, final)
 * - Track reminder history
 * - Bulk operations for reminders
 */
function OverduePaymentsPage() {
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Overdue Payments Management", description: "Track and manage overdue invoices. Send reminders to encourage timely payment and improve cash flow.", icon: react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Accounting", href: "/accounting" },
            { label: "Overdue Payments" },
        ] },
        react_1["default"].createElement("div", { className: "space-y-6 p-4 sm:p-6" },
            react_1["default"].createElement(OverduePaymentDashboard_1["default"], null))));
}
exports["default"] = OverduePaymentsPage;
