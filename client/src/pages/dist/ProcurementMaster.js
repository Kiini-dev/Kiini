"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var lucide_react_2 = require("lucide-react");
function ProcurementMaster() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = permissions_1.useRequireFeature("procurement:view"), allowed = _b.allowed, isLoading = _b.isLoading;
    if (isLoading) {
        return (react_1["default"].createElement("div", { className: "min-h-screen flex items-center justify-center" },
            react_1["default"].createElement(spinner_1.Spinner, null)));
    }
    if (!allowed) {
        return null;
    }
    var procurementModules = [
        {
            id: "suppliers",
            title: "Suppliers",
            description: "Manage supplier database, contacts, and ratings",
            icon: react_1["default"].createElement(lucide_react_2.Truck, { className: "w-8 h-8" }),
            href: "/suppliers",
            color: "text-amber-600",
            bgColor: "bg-amber-50 dark:bg-amber-950",
            action: "Manage Suppliers"
        },
        {
            id: "lpos",
            title: "Local Purchase Orders",
            description: "Create and track local purchase orders",
            icon: react_1["default"].createElement(lucide_react_2.FileText, { className: "w-8 h-8" }),
            href: "/lpos",
            color: "text-blue-600",
            bgColor: "bg-blue-50 dark:bg-blue-950",
            action: "View LPOs"
        },
        {
            id: "orders",
            title: "Purchase Orders",
            description: "Manage and track purchase orders",
            icon: react_1["default"].createElement(lucide_react_1.ShoppingCart, { className: "w-8 h-8" }),
            href: "/orders",
            color: "text-cyan-600",
            bgColor: "bg-cyan-50 dark:bg-cyan-950",
            action: "View Orders"
        },
        {
            id: "imprests",
            title: "Imprests",
            description: "Handle employee cash advances and imprest requests",
            icon: react_1["default"].createElement(lucide_react_2.Wallet, { className: "w-8 h-8" }),
            href: "/imprests",
            color: "text-emerald-600",
            bgColor: "bg-emerald-50 dark:bg-emerald-950",
            action: "Manage Imprests"
        },
        {
            id: "budgets",
            title: "Budgets",
            description: "Track and manage department budgets",
            icon: react_1["default"].createElement(lucide_react_2.DollarSign, { className: "w-8 h-8" }),
            href: "/budgets",
            color: "text-rose-600",
            bgColor: "bg-rose-50 dark:bg-rose-950",
            action: "View Budgets"
        },
        {
            id: "departments",
            title: "Departments",
            description: "Manage organizational departments",
            icon: react_1["default"].createElement(lucide_react_2.Users, { className: "w-8 h-8" }),
            href: "/departments",
            color: "text-purple-600",
            bgColor: "bg-purple-50 dark:bg-purple-950",
            action: "Manage Departments"
        },
    ];
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Procurement Management", description: "Complete procurement operations including suppliers, purchase orders, imprests, and budget tracking", icon: react_1["default"].createElement(lucide_react_1.ShoppingCart, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Procurement" },
        ] },
        react_1["default"].createElement("div", { className: "space-y-8" },
            react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-600" }, "Procurement Modules")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "text-3xl font-bold" }, procurementModules.length),
                        react_1["default"].createElement("p", { className: "text-xs text-gray-500 mt-1" }, "Core modules available"))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-600" }, "Quick Access")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "text-3xl font-bold" }, "6"),
                        react_1["default"].createElement("p", { className: "text-xs text-gray-500 mt-1" }, "Modules with full CRUD"))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-600" }, "Integration")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "text-3xl font-bold" }, "\u2713"),
                        react_1["default"].createElement("p", { className: "text-xs text-gray-500 mt-1" }, "Fully integrated")))),
            react_1["default"].createElement("div", { className: "space-y-4" },
                react_1["default"].createElement("div", { className: "mb-4" },
                    react_1["default"].createElement("h2", { className: "text-2xl font-bold" }, "Procurement Modules"),
                    react_1["default"].createElement("p", { className: "text-gray-600" }, "Access all procurement management tools and modules")),
                react_1["default"].createElement("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3" }, procurementModules.map(function (module) { return (react_1["default"].createElement(card_1.Card, { key: module.id, className: "cursor-pointer hover:shadow-lg hover:shadow-primary/10 transition-all group border-2 hover:border-primary/50", onClick: function () { return navigate(module.href); } },
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                            react_1["default"].createElement("div", { className: "p-3 rounded-lg " + module.bgColor },
                                react_1["default"].createElement("div", { className: module.color }, module.icon)),
                            react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" })),
                        react_1["default"].createElement(card_1.CardTitle, { className: "mt-4 text-base" }, module.title),
                        react_1["default"].createElement(card_1.CardDescription, null, module.description)),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement(button_1.Button, { variant: "ghost", className: "w-full group-hover:bg-accent" }, module.action)))); }))),
            react_1["default"].createElement(card_1.Card, { className: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-700" },
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, { className: "text-lg" }, "Procurement Management Overview")),
                react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement("h4", { className: "font-semibold text-sm" }, "Key Features:"),
                        react_1["default"].createElement("ul", { className: "space-y-1 text-sm text-gray-700 dark:text-gray-300" },
                            react_1["default"].createElement("li", { className: "flex items-start gap-2" },
                                react_1["default"].createElement("span", { className: "text-blue-600 dark:text-blue-400 font-bold" }, "\u2022"),
                                react_1["default"].createElement("span", null, "Supplier management with ratings and audit trails")),
                            react_1["default"].createElement("li", { className: "flex items-start gap-2" },
                                react_1["default"].createElement("span", { className: "text-blue-600 dark:text-blue-400 font-bold" }, "\u2022"),
                                react_1["default"].createElement("span", null, "Local and international purchase order creation and tracking")),
                            react_1["default"].createElement("li", { className: "flex items-start gap-2" },
                                react_1["default"].createElement("span", { className: "text-blue-600 dark:text-blue-400 font-bold" }, "\u2022"),
                                react_1["default"].createElement("span", null, "Employee imprest and cash advance management")),
                            react_1["default"].createElement("li", { className: "flex items-start gap-2" },
                                react_1["default"].createElement("span", { className: "text-blue-600 dark:text-blue-400 font-bold" }, "\u2022"),
                                react_1["default"].createElement("span", null, "Department budget allocation and tracking")),
                            react_1["default"].createElement("li", { className: "flex items-start gap-2" },
                                react_1["default"].createElement("span", { className: "text-blue-600 dark:text-blue-400 font-bold" }, "\u2022"),
                                react_1["default"].createElement("span", null, "Import/Export functionality for all modules")),
                            react_1["default"].createElement("li", { className: "flex items-start gap-2" },
                                react_1["default"].createElement("span", { className: "text-blue-600 dark:text-blue-400 font-bold" }, "\u2022"),
                                react_1["default"].createElement("span", null, "Advanced search and filtering capabilities")))))))));
}
exports["default"] = ProcurementMaster;
