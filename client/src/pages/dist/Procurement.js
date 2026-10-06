"use strict";
exports.__esModule = true;
var react_1 = require("react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var wouter_1 = require("wouter");
var trpc_1 = require("@/lib/trpc");
var stats_card_1 = require("@/components/ui/stats-card");
var utils_1 = require("@/lib/utils");
function Procurement() {
    var _a, _b, _c;
    var _d = wouter_1.useLocation(), navigate = _d[1];
    var _e = react_1.useState({
        totalRequests: 0,
        totalOrders: 0,
        totalSpend: 0,
        activeVendors: 0
    }), procurementData = _e[0], setProcurementData = _e[1];
    // Fetch procurement data from backend
    var _f = trpc_1.trpc.procurement.list.useQuery().data, requests = _f === void 0 ? [] : _f;
    var _g = trpc_1.trpc.lpo.list.useQuery().data, purchaseOrders = _g === void 0 ? [] : _g;
    var _h = (((_c = (_b = (_a = trpc_1.trpc.suppliers) === null || _a === void 0 ? void 0 : _a.list) === null || _b === void 0 ? void 0 : _b.useQuery) === null || _c === void 0 ? void 0 : _c.call(_b)) || { data: [] }).data, vendors = _h === void 0 ? [] : _h;
    // Calculate procurement metrics
    react_1.useEffect(function () {
        // Defensive check to ensure all data is available and is an array before proceeding
        if (!Array.isArray(requests) || !Array.isArray(purchaseOrders)) {
            return;
        }
        var totalSpend = purchaseOrders.reduce(function (sum, po) { return sum + (po.amount || 0); }, 0) / 100;
        var vendorSet = new Set(purchaseOrders.map(function (po) { return po.vendorId; }).filter(Boolean));
        setProcurementData({
            totalRequests: requests.length,
            totalOrders: purchaseOrders.length,
            totalSpend: totalSpend,
            activeVendors: vendorSet.size
        });
    }, [requests, purchaseOrders, vendors]);
    var procurementModules = [
        {
            title: "Purchase Requests",
            description: "Create and manage procurement requisitions",
            icon: lucide_react_1.ShoppingCart,
            href: "/procurement/requests",
            stats: { label: "Total Requests", value: procurementData.totalRequests.toString() },
            borderColor: "border-l-orange-500",
            iconBg: "bg-orange-50 dark:bg-orange-950",
            iconColor: "text-orange-500"
        },
        {
            title: "Purchase Orders",
            description: "Track and manage purchase orders",
            icon: lucide_react_1.FileText,
            href: "/procurement/orders",
            stats: { label: "Active Orders", value: procurementData.totalOrders.toString() },
            borderColor: "border-l-blue-500",
            iconBg: "bg-blue-50 dark:bg-blue-950",
            iconColor: "text-blue-500"
        },
        {
            title: "Suppliers",
            description: "Manage vendor and supplier information",
            icon: lucide_react_1.Truck,
            href: "/suppliers",
            stats: { label: "Active Vendors", value: procurementData.activeVendors.toString() },
            borderColor: "border-l-green-500",
            iconBg: "bg-green-50 dark:bg-green-950",
            iconColor: "text-green-500"
        },
        {
            title: "Inventory",
            description: "Track stock levels and warehouse management",
            icon: lucide_react_1.Package,
            href: "/inventory",
            stats: { label: "SKUs", value: "0" },
            borderColor: "border-l-purple-500",
            iconBg: "bg-purple-50 dark:bg-purple-950",
            iconColor: "text-purple-500"
        },
    ];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Procurement", href: "/procurement" },
        ], title: "Procurement", description: "Manage purchase requests, orders, and supplier relationships", icon: React.createElement(lucide_react_1.ShoppingCart, { className: "w-6 h-6" }) },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "flex gap-3 flex-wrap" },
                React.createElement(button_1.Button, { onClick: function () { return navigate("/lpos/create"); }, className: "gap-2" },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                    "New Request"),
                React.createElement(button_1.Button, { onClick: function () { return navigate("/orders/create"); }, variant: "outline", className: "gap-2" },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                    "New Purchase Order"),
                React.createElement(button_1.Button, { onClick: function () { return navigate("/suppliers/create"); }, variant: "outline", className: "gap-2" },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                    "New Supplier")),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Requests", value: procurementData.totalRequests, description: "Active requisitions", color: "border-l-orange-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Active Orders", value: procurementData.totalOrders, description: "Purchase orders", color: "border-l-purple-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Spend", value: React.createElement(React.Fragment, null,
                        "KES ",
                        (procurementData.totalSpend).toLocaleString('en-US', { maximumFractionDigits: 0 })), description: "YTD procurement spend", color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Active Suppliers", value: procurementData.activeVendors, description: "Vendor relationships", color: "border-l-blue-500" })),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" }, procurementModules.map(function (module) {
                var IconComponent = module.icon;
                return (React.createElement("button", { key: module.href, onClick: function () { return navigate(module.href); }, className: utils_1.cn("group relative overflow-hidden rounded-xl border-l-4 p-4 sm:p-5 text-left transition-all duration-300", "bg-white dark:bg-slate-800/60 border-t border-r border-b border-slate-200 dark:border-slate-700", "hover:shadow-xl hover:-translate-y-1 cursor-pointer", module.borderColor) },
                    React.createElement("div", { className: "absolute inset-0 opacity-0 group-hover:opacity-[0.07] transition-opacity duration-300 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 pointer-events-none" }),
                    React.createElement("div", { className: "relative" },
                        React.createElement("div", { className: "flex items-center justify-between mb-3" },
                            React.createElement("div", { className: "p-2.5 rounded-lg " + module.iconBg },
                                React.createElement(IconComponent, { className: "h-5 w-5 " + module.iconColor })),
                            React.createElement(lucide_react_1.ArrowRight, { className: "h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" })),
                        React.createElement("h3", { className: "font-bold text-sm text-slate-900 dark:text-slate-50" }, module.title),
                        React.createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400 mt-1" }, module.description),
                        React.createElement("div", { className: "mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50" },
                            React.createElement("p", { className: "text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400" }, module.stats.label),
                            React.createElement("p", { className: "text-xl font-bold text-slate-900 dark:text-slate-50 mt-0.5" }, module.stats.value))),
                    React.createElement("div", { className: "absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-gradient-to-r from-transparent via-current to-transparent" })));
            })))));
}
exports["default"] = Procurement;
