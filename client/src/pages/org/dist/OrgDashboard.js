"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var OrgLayout_1 = require("@/components/OrgLayout");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
var useAuthWithPersistence_1 = require("@/_core/hooks/useAuthWithPersistence");
var OrgAdminDashboard_1 = require("./dashboards/OrgAdminDashboard");
var OrgManagerDashboard_1 = require("./dashboards/OrgManagerDashboard");
var OrgFinanceDashboard_1 = require("./dashboards/OrgFinanceDashboard");
var OrgHRDashboard_1 = require("./dashboards/OrgHRDashboard");
var OrgEmployeeDashboard_1 = require("./dashboards/OrgEmployeeDashboard");
/**
 * Main OrgDashboard - Routes to role-based dashboards
 *
 * Org Dashboard that automatically routes users to their role-specific dashboard:
 * - Admin: Full organization overview and management
 * - Finance (Accountant): Financial metrics and reports
 * - HR: Human resources and talent management
 * - Manager/Staff: Team management and project oversight
 * - Employee/User: Personal tasks and assignments
 */
function OrgDashboard() {
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _a = useAuthWithPersistence_1.useAuthWithPersistence(), user = _a.user, loading = _a.loading, isAuthenticated = _a.isAuthenticated;
    if (loading) {
        return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Loading...", showOrgInfo: false },
            react_1["default"].createElement("div", { className: "flex items-center justify-center p-8" },
                react_1["default"].createElement("p", { className: "text-muted-foreground" }, "Loading..."))));
    }
    if (!user)
        return null;
    if (!(user === null || user === void 0 ? void 0 : user.organizationId)) {
        return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Access Denied", showOrgInfo: false },
            react_1["default"].createElement(alert_1.Alert, { variant: "destructive" },
                react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4" }),
                react_1["default"].createElement(alert_1.AlertDescription, null, "You don't have access to an organization. Please contact your administrator."))));
    }
    // Detect user role and render appropriate dashboard
    // Global roles: super_admin | admin | staff | accountant | hr | user | client
    var userRole = (user === null || user === void 0 ? void 0 : user.role) || "user";
    // Route to role-based dashboard
    if (userRole === "super_admin" || userRole === "admin") {
        return react_1["default"].createElement(OrgAdminDashboard_1["default"], null);
    }
    if (userRole === "accountant") {
        return react_1["default"].createElement(OrgFinanceDashboard_1["default"], null);
    }
    if (userRole === "hr") {
        return react_1["default"].createElement(OrgHRDashboard_1["default"], null);
    }
    if (userRole === "staff") {
        return react_1["default"].createElement(OrgManagerDashboard_1["default"], null);
    }
    // Default to employee dashboard for regular users and clients
    return react_1["default"].createElement(OrgEmployeeDashboard_1["default"], null);
}
exports["default"] = OrgDashboard;
