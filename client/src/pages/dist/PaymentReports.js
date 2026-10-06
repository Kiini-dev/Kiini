"use strict";
exports.__esModule = true;
var useAuthWithPersistence_1 = require("@/_core/hooks/useAuthWithPersistence");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var PaymentReports_1 = require("@/components/PaymentReports");
var lucide_react_1 = require("lucide-react");
var spinner_1 = require("@/components/ui/spinner");
/**
 * PaymentReportsPage
 *
 * Full-screen page for viewing payment reports with filters and exports
 */
function PaymentReportsPage() {
    var _a = useAuthWithPersistence_1.useAuthWithPersistence({
        redirectOnUnauthenticated: true
    }), loading = _a.loading, isAuthenticated = _a.isAuthenticated;
    if (loading) {
        return (React.createElement("div", { className: "min-h-screen flex items-center justify-center" },
            React.createElement(spinner_1.Spinner, null)));
    }
    if (!isAuthenticated) {
        return null;
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Payment Reports", description: "Analyze payment trends and generate detailed reports", icon: React.createElement(lucide_react_1.BarChart3, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Accounting", href: "/accounting" },
            { label: "Payment Reports" },
        ] },
        React.createElement("div", { className: "space-y-6 p-4 sm:p-6" },
            React.createElement(PaymentReports_1["default"], null))));
}
exports["default"] = PaymentReportsPage;
