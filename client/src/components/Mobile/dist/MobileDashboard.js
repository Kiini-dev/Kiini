"use strict";
/**
 * Mobile Dashboard - Home screen for mobile app
 * Optimized for touch, responsive, and efficient data loading
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.MobileDashboard = void 0;
var react_1 = require("react");
var wouter_1 = require("wouter");
var lucide_react_1 = require("lucide-react");
var ResponsiveLayout_1 = require("../Mobile/ResponsiveLayout");
var useMobileHooks_1 = require("../../hooks/useMobileHooks");
exports.MobileDashboard = function () {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var deviceInfo = useMobileHooks_1.useDeviceInfo();
    var isOnline = useMobileHooks_1.useNetworkStatus().isOnline;
    var scrollInfo = useMobileHooks_1.useScroll();
    var _b = react_1.useState(false), isRefreshing = _b[0], setIsRefreshing = _b[1];
    var _c = react_1.useState("all"), activeFilter = _c[0], setActiveFilter = _c[1];
    var _d = react_1.useState(false), showFilterSheet = _d[0], setShowFilterSheet = _d[1];
    // Mock data
    var metrics = [
        {
            label: "Total Revenue",
            value: "$45,230",
            change: 12.5,
            trend: "up",
            icon: react_1["default"].createElement(lucide_react_1.CreditCard, { className: "w-6 h-6" })
        },
        {
            label: "Pending Payments",
            value: "$8,450",
            change: -5.2,
            trend: "down",
            icon: react_1["default"].createElement(lucide_react_1.TrendingUp, { className: "w-6 h-6" })
        },
        {
            label: "Active Clients",
            value: "124",
            change: 8.3,
            trend: "up",
            icon: react_1["default"].createElement(lucide_react_1.Users, { className: "w-6 h-6" })
        },
    ];
    var recentTransactions = [
        {
            id: "1",
            title: "Invoice #INV-2024-001",
            amount: 2500,
            type: "invoice",
            date: "2024-01-15",
            status: "pending"
        },
        {
            id: "2",
            title: "Client Payment Received",
            amount: 3200,
            type: "payment",
            date: "2024-01-14",
            status: "completed"
        },
        {
            id: "3",
            title: "Office Supplies",
            amount: 450,
            type: "expense",
            date: "2024-01-13",
            status: "completed"
        },
        {
            id: "4",
            title: "Invoice #INV-2024-002",
            amount: 1800,
            type: "invoice",
            date: "2024-01-12",
            status: "overdue"
        },
    ];
    var handleRefresh = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsRefreshing(true);
                    // Simulate API call
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 1:
                    // Simulate API call
                    _a.sent();
                    setIsRefreshing(false);
                    return [2 /*return*/];
            }
        });
    }); };
    var filteredTransactions = recentTransactions.filter(function (t) { return activeFilter === "all" || t.type === activeFilter; });
    var getStatusColor = function (status) {
        switch (status) {
            case "completed":
                return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
            case "pending":
                return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
            case "overdue":
                return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
            default:
                return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
        }
    };
    var getTransactionIcon = function (type) {
        switch (type) {
            case "invoice":
                return react_1["default"].createElement(lucide_react_1.CreditCard, { className: "w-4 h-4" });
            case "payment":
                return react_1["default"].createElement(lucide_react_1.TrendingUp, { className: "w-4 h-4" });
            case "expense":
                return react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "w-4 h-4" });
            default:
                return null;
        }
    };
    return (react_1["default"].createElement(ResponsiveLayout_1["default"], { header: react_1["default"].createElement("header", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 md:px-6" },
            react_1["default"].createElement("div", { className: "max-w-7xl mx-auto flex items-center justify-between" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white" }, "Dashboard"),
                    react_1["default"].createElement("p", { className: "text-sm text-gray-500 dark:text-gray-400 mt-1" }, "Welcome back, John Doe")),
                react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                    !isOnline && (react_1["default"].createElement("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200" }, "Offline")),
                    react_1["default"].createElement("button", { onClick: handleRefresh, disabled: isRefreshing, className: "p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50" },
                        react_1["default"].createElement(lucide_react_1.RefreshCw, { className: "w-5 h-5 " + (isRefreshing ? "animate-spin" : "") }))))), sidebar: react_1["default"].createElement("nav", { className: "p-4 space-y-2" },
            react_1["default"].createElement(NavLink, { label: "Dashboard", icon: "\uD83D\uDCCA", active: true }),
            react_1["default"].createElement(NavLink, { label: "Invoices", icon: "\uD83D\uDCC4" }),
            react_1["default"].createElement(NavLink, { label: "Clients", icon: "\uD83D\uDC65" }),
            react_1["default"].createElement(NavLink, { label: "Reports", icon: "\uD83D\uDCC8" }),
            react_1["default"].createElement(NavLink, { label: "Settings", icon: "\u2699\uFE0F" })) },
        react_1["default"].createElement("div", { className: "space-y-4 " + (deviceInfo.isDesktop ? "grid grid-cols-3 gap-4" : "") },
            deviceInfo.isMobile && (react_1["default"].createElement("div", { className: "sticky top-0 z-10 bg-gradient-to-b from-gray-50 to-transparent dark:from-gray-900 pb-2 -mx-4 px-4 pt-4" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600 dark:text-gray-400" }, scrollInfo.isScrolling ? "Scrolling..." : ""))),
            metrics.map(function (metric, index) { return (react_1["default"].createElement(ResponsiveLayout_1.MobileCard, { key: index, title: metric.label, subtitle: "" + (metric.change > 0 ? "+" : "") + metric.change + "% this month" },
                react_1["default"].createElement("div", { className: "flex items-end gap-3" },
                    react_1["default"].createElement("div", { className: "flex-1" },
                        react_1["default"].createElement("p", { className: "text-2xl md:text-3xl font-bold text-gray-900 dark:text-white" }, metric.value)),
                    react_1["default"].createElement("div", { className: "p-3 rounded-lg " + (metric.trend === "up" ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400" : "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400") }, metric.icon)))); }),
            react_1["default"].createElement(ResponsiveLayout_1.MobileCard, { title: "Recent Alerts", actionLabel: "View All", onTap: function () { return navigate("/notifications"); } },
                react_1["default"].createElement("div", { className: "space-y-2" },
                    react_1["default"].createElement("div", { className: "flex items-start gap-2" },
                        react_1["default"].createElement("div", { className: "flex-shrink-0 mt-1" },
                            react_1["default"].createElement(lucide_react_1.Bell, { className: "w-4 h-4 text-orange-500" })),
                        react_1["default"].createElement("div", { className: "flex-1 min-w-0" },
                            react_1["default"].createElement("p", { className: "text-sm font-medium text-gray-900 dark:text-white" }, "Invoice Overdue"),
                            react_1["default"].createElement("p", { className: "text-xs text-gray-500 dark:text-gray-400" }, "INV-2024-002 is overdue"))),
                    react_1["default"].createElement("div", { className: "flex items-start gap-2" },
                        react_1["default"].createElement("div", { className: "flex-shrink-0 mt-1" },
                            react_1["default"].createElement(lucide_react_1.Bell, { className: "w-4 h-4 text-blue-500" })),
                        react_1["default"].createElement("div", { className: "flex-1 min-w-0" },
                            react_1["default"].createElement("p", { className: "text-sm font-medium text-gray-900 dark:text-white" }, "New Client"),
                            react_1["default"].createElement("p", { className: "text-xs text-gray-500 dark:text-gray-400" }, "Tech Corp signed up today"))))),
            deviceInfo.isMobile && (react_1["default"].createElement("div", { className: "flex gap-2 overflow-x-auto pb-2 -mx-4 px-4" }, ["all", "invoices", "payments"].map(function (filter) { return (react_1["default"].createElement("button", { key: filter, onClick: function () { return setActiveFilter(filter); }, className: "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors " + (activeFilter === filter
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white") }, filter.charAt(0).toUpperCase() + filter.slice(1))); }))),
            react_1["default"].createElement("div", { className: deviceInfo.isDesktop ? "col-span-3" : "" },
                react_1["default"].createElement("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4" },
                    react_1["default"].createElement("div", { className: "flex items-center justify-between mb-4" },
                        react_1["default"].createElement("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white" }, "Recent Transactions"),
                        react_1["default"].createElement("button", { onClick: function () { return setShowFilterSheet(true); }, className: "text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium" }, "Filter")),
                    react_1["default"].createElement("div", { className: "divide-y divide-gray-200 dark:divide-gray-700" }, filteredTransactions.length > 0 ? (filteredTransactions.map(function (transaction) { return (react_1["default"].createElement("div", { key: transaction.id, className: "flex items-center justify-between py-4 first:pt-0 last:pb-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 -mx-2 rounded transition-colors" },
                        react_1["default"].createElement("div", { className: "flex items-center gap-3 flex-1 min-w-0" },
                            react_1["default"].createElement("div", { className: "flex-shrink-0 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400" }, getTransactionIcon(transaction.type)),
                            react_1["default"].createElement("div", { className: "flex-1 min-w-0" },
                                react_1["default"].createElement("p", { className: "text-sm font-medium text-gray-900 dark:text-white truncate" }, transaction.title),
                                react_1["default"].createElement("p", { className: "text-xs text-gray-500 dark:text-gray-400" }, transaction.date))),
                        react_1["default"].createElement("div", { className: "flex items-center gap-3 flex-shrink-0 ml-2" },
                            react_1["default"].createElement("p", { className: "text-sm font-semibold text-gray-900 dark:text-white" },
                                "$",
                                transaction.amount.toLocaleString()),
                            react_1["default"].createElement("span", { className: "px-2 py-1 rounded text-xs font-medium " + getStatusColor(transaction.status) }, transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1))))); })) : (react_1["default"].createElement("div", { className: "py-8 text-center" },
                        react_1["default"].createElement("p", { className: "text-sm text-gray-500 dark:text-gray-400" }, "No transactions found")))),
                    react_1["default"].createElement(ResponsiveLayout_1.MobileButton, { variant: "outline", size: "sm", fullWidth: true, className: "mt-4", onClick: function () { return navigate("/payments"); } }, "View All Transactions")))),
        react_1["default"].createElement(ResponsiveLayout_1.MobileSheet, { isOpen: showFilterSheet, onClose: function () { return setShowFilterSheet(false); }, title: "Filter Transactions" },
            react_1["default"].createElement("div", { className: "space-y-4" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("h4", { className: "text-sm font-semibold text-gray-900 dark:text-white mb-3" }, "Transaction Type"),
                    react_1["default"].createElement("div", { className: "space-y-2" }, ["all", "invoices", "payments", "expenses"].map(function (filter) { return (react_1["default"].createElement("label", { key: filter, className: "flex items-center gap-3 cursor-pointer" },
                        react_1["default"].createElement("input", { type: "radio", name: "filter", value: filter, checked: activeFilter === filter || (activeFilter === "all" && filter === "all"), onChange: function () { return setActiveFilter(filter === "expenses" ? "all" : filter); }, className: "w-4 h-4 rounded-full" }),
                        react_1["default"].createElement("span", { className: "text-sm text-gray-700 dark:text-gray-300" }, filter.charAt(0).toUpperCase() + filter.slice(1)))); }))),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("h4", { className: "text-sm font-semibold text-gray-900 dark:text-white mb-3" }, "Status"),
                    react_1["default"].createElement("div", { className: "space-y-2" }, ["completed", "pending", "overdue"].map(function (status) { return (react_1["default"].createElement("label", { key: status, className: "flex items-center gap-3 cursor-pointer" },
                        react_1["default"].createElement("input", { type: "checkbox", className: "w-4 h-4 rounded" }),
                        react_1["default"].createElement("span", { className: "text-sm text-gray-700 dark:text-gray-300" }, status.charAt(0).toUpperCase() + status.slice(1)))); }))),
                react_1["default"].createElement(ResponsiveLayout_1.MobileButton, { onClick: function () { return setShowFilterSheet(false); } }, "Apply Filters")))));
};
var NavLink = function (_a) {
    var label = _a.label, icon = _a.icon, active = _a.active;
    return (react_1["default"].createElement("button", { className: "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors " + (active
            ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-medium"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700") },
        react_1["default"].createElement("span", { className: "text-lg" }, icon),
        react_1["default"].createElement("span", null, label)));
};
exports["default"] = exports.MobileDashboard;
