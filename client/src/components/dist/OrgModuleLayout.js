"use strict";
exports.__esModule = true;
exports.OrgModuleLayout = void 0;
var react_1 = require("react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
/**
 * OrgModuleLayout - Bridges org pages with ModuleLayout
 *
 * This component wraps the main app's ModuleLayout to provide consistent styling
 * and behavior for organization module pages. It handles access control, breadcrumbs,
 * and standard page layout.
 *
 * Usage:
 * const handleCreate = () => {};
 *
 * function MyPage() {
 *   return (
 *     <OrgModuleLayout
 *       title="Invoices"
 *       description="Manage organization invoices"
 *       icon={FileText}
 *       breadcrumbs={[{ label: "Invoices" }]}
 *       actions={<Button>New Invoice</Button>}
 *     >
 *       Content here
 *     </OrgModuleLayout>
 *   );
 * }
 */
function OrgModuleLayout(_a) {
    var title = _a.title, description = _a.description, icon = _a.icon, children = _a.children, _b = _a.breadcrumbs, breadcrumbs = _b === void 0 ? [] : _b, actions = _a.actions, backLink = _a.backLink, _c = _a.showOrgInfo, showOrgInfo = _c === void 0 ? false : _c, _d = _a.hasAccess, hasAccess = _d === void 0 ? true : _d, _e = _a.accessDeniedMessage, accessDeniedMessage = _e === void 0 ? "Access to this feature is not enabled for your organization." : _e, accessDeniedAction = _a.accessDeniedAction;
    // If access is denied, show alert
    if (!hasAccess) {
        return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: title, description: description, icon: icon, breadcrumbs: breadcrumbs, backLink: backLink },
            react_1["default"].createElement(alert_1.Alert, { variant: "destructive" },
                react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4" }),
                react_1["default"].createElement(alert_1.AlertDescription, null, accessDeniedMessage)),
            accessDeniedAction && react_1["default"].createElement("div", { className: "mt-4" }, accessDeniedAction)));
    }
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: title, description: description, icon: icon, breadcrumbs: breadcrumbs, backLink: backLink, actions: actions }, children));
}
exports.OrgModuleLayout = OrgModuleLayout;
exports["default"] = OrgModuleLayout;
