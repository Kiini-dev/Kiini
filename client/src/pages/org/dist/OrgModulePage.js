"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgBreadcrumb_1 = require("@/components/OrgBreadcrumb");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var MODULE_LABELS = {
    accounting: "Accounting",
    budgets: "Budgets",
    projects: "Projects",
    leave: "Leave Management",
    attendance: "Attendance",
    procurement: "Procurement",
    contracts: "Contracts",
    "work-orders": "Work Orders",
    communications: "Communications",
    tickets: "Support Tickets",
    ai: "AI Hub"
};
function OrgModulePage() {
    var _a, _b;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var module = params.module;
    var _c = wouter_1.useLocation(), setLocation = _c[1];
    var label = (_b = (_a = MODULE_LABELS[module]) !== null && _a !== void 0 ? _a : module === null || module === void 0 ? void 0 : module.replace(/-/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); })) !== null && _b !== void 0 ? _b : "Module";
    return (react_1["default"].createElement(OrgLayout_1["default"], { title: label, showOrgInfo: false },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [{ label: label }] }),
                react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-white/50 hover:text-white", onClick: function () { return setLocation("/org/" + slug + "/dashboard"); } },
                    react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-1" }),
                    " Back to Dashboard")),
            react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                react_1["default"].createElement(card_1.CardContent, { className: "py-16 text-center" },
                    react_1["default"].createElement(lucide_react_1.Construction, { className: "h-14 w-14 text-white/20 mx-auto mb-4" }),
                    react_1["default"].createElement(card_1.CardTitle, { className: "text-xl text-white mb-2" }, label),
                    react_1["default"].createElement(card_1.CardDescription, { className: "text-white/50 mb-6 max-w-md mx-auto" },
                        "This module is available in your plan. Full functionality for ",
                        react_1["default"].createElement("strong", null, label),
                        " is available in the main CRM experience. Use the shortcut below to open it now."),
                    react_1["default"].createElement("div", { className: "flex justify-center gap-3" },
                        react_1["default"].createElement(button_1.Button, { size: "sm", className: "bg-blue-600 hover:bg-blue-700 text-white", onClick: function () { return setLocation("/crm"); } }, "Go to Main CRM"),
                        react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "border-white/20 text-white/70 hover:text-white hover:bg-white/10", onClick: function () { return setLocation("/org/" + slug + "/dashboard"); } }, "Return to Dashboard")))))));
}
exports["default"] = OrgModulePage;
