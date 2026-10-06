"use strict";
/**
 * Mobile Invoices Page - Optimized for mobile viewing and management
 * Includes filtering, searching, and quick actions
 */
exports.__esModule = true;
exports.MobileInvoicesPage = void 0;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var ResponsiveLayout_1 = require("../Mobile/ResponsiveLayout");
var useMobileHooks_1 = require("../../hooks/useMobileHooks");
exports.MobileInvoicesPage = function (_a) {
    var onCreateInvoice = _a.onCreateInvoice, onEditInvoice = _a.onEditInvoice, onDeleteInvoice = _a.onDeleteInvoice;
    var deviceInfo = useMobileHooks_1.useDeviceInfo();
    var _b = react_1.useState(""), searchText = _b[0], setSearchText = _b[1];
    var _c = react_1.useState("all"), filterStatus = _c[0], setFilterStatus = _c[1];
    var _d = react_1.useState(false), showFilterSheet = _d[0], setShowFilterSheet = _d[1];
    var _e = react_1.useState(null), selectedInvoice = _e[0], setSelectedInvoice = _e[1];
    var _f = react_1.useState(null), showActionMenu = _f[0], setShowActionMenu = _f[1];
    // Mock data
    var invoices = [
        {
            id: "1",
            number: "INV-2024-001",
            clientName: "Acme Corp",
            amount: 2500,
            date: "2024-01-15",
            dueDate: "2024-02-15",
            status: "paid",
            currency: "USD"
        },
        {
            id: "2",
            number: "INV-2024-002",
            clientName: "Tech Solutions",
            amount: 3200,
            date: "2024-01-10",
            dueDate: "2024-02-10",
            status: "sent",
            currency: "USD"
        },
        {
            id: "3",
            number: "INV-2024-003",
            clientName: "Global Industries",
            amount: 1800,
            date: "2024-01-01",
            dueDate: "2024-02-01",
            status: "overdue",
            currency: "USD"
        },
        {
            id: "4",
            number: "INV-2024-004",
            clientName: "Local Startup",
            amount: 950,
            date: "2024-01-20",
            dueDate: "2024-02-20",
            status: "draft",
            currency: "USD"
        },
    ];
    // Filter and search
    var filteredInvoices = react_1.useMemo(function () {
        return invoices.filter(function (invoice) {
            var matchesSearch = invoice.number.toLowerCase().includes(searchText.toLowerCase()) ||
                invoice.clientName.toLowerCase().includes(searchText.toLowerCase());
            var matchesFilter = filterStatus === "all" || invoice.status === filterStatus;
            return matchesSearch && matchesFilter;
        });
    }, [searchText, filterStatus]);
    var getStatusColor = function (status) {
        switch (status) {
            case "paid":
                return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
            case "sent":
                return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
            case "overdue":
                return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
            case "draft":
                return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
            default:
                return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
        }
    };
    var formatInvoiceAmount = function (amount) {
        return (amount / 100).toLocaleString("en-KE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };
    var handleQuickAction = function (action, invoiceId) {
        switch (action) {
            case "view":
                setSelectedInvoice(invoices.find(function (i) { return i.id === invoiceId; }) || null);
                break;
            case "edit":
                onEditInvoice === null || onEditInvoice === void 0 ? void 0 : onEditInvoice(invoiceId);
                break;
            case "delete":
                if (window.confirm("Are you sure you want to delete this invoice?")) {
                    onDeleteInvoice === null || onDeleteInvoice === void 0 ? void 0 : onDeleteInvoice(invoiceId);
                }
                break;
        }
        setShowActionMenu(null);
    };
    var getStatusStats = function () {
        return {
            total: invoices.length,
            paid: invoices.filter(function (i) { return i.status === "paid"; }).length,
            pending: invoices.filter(function (i) { return i.status === "sent"; }).length,
            overdue: invoices.filter(function (i) { return i.status === "overdue"; }).length
        };
    };
    var stats = getStatusStats();
    return (react_1["default"].createElement(ResponsiveLayout_1["default"], { header: react_1["default"].createElement("header", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 md:px-6 sticky top-0 z-30" },
            react_1["default"].createElement("div", { className: "max-w-7xl mx-auto" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between mb-4" },
                    react_1["default"].createElement("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white" }, "Invoices"),
                    react_1["default"].createElement(ResponsiveLayout_1.MobileButton, { size: "sm", onClick: onCreateInvoice, className: "flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.Plus, { className: "w-4 h-4" }),
                        react_1["default"].createElement("span", { className: deviceInfo.isMobile ? "" : "flex" }, "New"))),
                react_1["default"].createElement("div", { className: "relative" },
                    react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" }),
                    react_1["default"].createElement("input", { type: "search", placeholder: "Search by invoice # or client...", value: searchText, onChange: function (e) { return setSearchText(e.target.value); }, className: "w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" })))), sidebar: react_1["default"].createElement("nav", { className: "p-4 space-y-2" },
            react_1["default"].createElement(NavLink, { label: "Dashboard", icon: "\uD83D\uDCCA" }),
            react_1["default"].createElement(NavLink, { label: "Invoices", icon: "\uD83D\uDCC4", active: true }),
            react_1["default"].createElement(NavLink, { label: "Clients", icon: "\uD83D\uDC65" }),
            react_1["default"].createElement(NavLink, { label: "Reports", icon: "\uD83D\uDCC8" })) },
        react_1["default"].createElement("div", { className: "space-y-4" },
            react_1["default"].createElement("div", { className: "grid gap-3 " + (deviceInfo.isMobile ? "grid-cols-2" : "grid-cols-4") },
                react_1["default"].createElement(StatCard, { label: "Total", value: stats.total, color: "blue" }),
                react_1["default"].createElement(StatCard, { label: "Paid", value: stats.paid, color: "green" }),
                react_1["default"].createElement(StatCard, { label: "Pending", value: stats.pending, color: "yellow" }),
                react_1["default"].createElement(StatCard, { label: "Overdue", value: stats.overdue, color: "red" })),
            react_1["default"].createElement("div", { className: "flex gap-2 overflow-x-auto pb-2 -mx-4 px-4" }, ["all", "draft", "sent", "paid", "overdue"].map(function (status) { return (react_1["default"].createElement("button", { key: status, onClick: function () { return setFilterStatus(status); }, className: "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors " + (filterStatus === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white") }, status.charAt(0).toUpperCase() + status.slice(1))); })),
            filteredInvoices.length > 0 ? (react_1["default"].createElement("div", { className: "space-y-2" }, filteredInvoices.map(function (invoice) { return (react_1["default"].createElement(ResponsiveLayout_1.MobileCard, { key: invoice.id, title: invoice.number, subtitle: invoice.clientName, onTap: function () { return handleQuickAction("view", invoice.id); } },
                react_1["default"].createElement("div", { className: "space-y-3" },
                    react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                        react_1["default"].createElement("p", { className: "text-2xl font-bold text-gray-900 dark:text-white" },
                            invoice.currency,
                            " ",
                            formatInvoiceAmount(invoice.amount)),
                        react_1["default"].createElement("span", { className: "px-2.5 py-0.5 rounded-full text-xs font-medium " + getStatusColor(invoice.status) }, invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1))),
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("p", { className: "font-medium text-gray-600 dark:text-gray-300" }, "Issued"),
                            react_1["default"].createElement("p", null, new Date(invoice.date).toLocaleDateString())),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("p", { className: "font-medium text-gray-600 dark:text-gray-300" }, "Due"),
                            react_1["default"].createElement("p", null, new Date(invoice.dueDate).toLocaleDateString()))),
                    react_1["default"].createElement("div", { className: "flex gap-2 pt-2" },
                        react_1["default"].createElement("button", { onClick: function () { return handleQuickAction("view", invoice.id); }, className: "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors min-h-[40px]" },
                            react_1["default"].createElement(lucide_react_1.Eye, { className: "w-4 h-4" }),
                            react_1["default"].createElement("span", null, "View")),
                        invoice.status !== "paid" && invoice.status !== "overdue" ? (react_1["default"].createElement("button", { onClick: function () { return handleQuickAction("edit", invoice.id); }, className: "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 text-sm font-medium hover:bg-green-200 dark:hover:bg-green-800 transition-colors min-h-[40px]" },
                            react_1["default"].createElement(lucide_react_1.Send, { className: "w-4 h-4" }),
                            react_1["default"].createElement("span", null, "Send"))) : (react_1["default"].createElement("button", { onClick: function () { handleQuickAction("view", invoice.id); setTimeout(function () { return window.print(); }, 300); }, className: "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors min-h-[40px]" },
                            react_1["default"].createElement(lucide_react_1.Download, { className: "w-4 h-4" }),
                            react_1["default"].createElement("span", null, "Download"))),
                        react_1["default"].createElement("button", { onClick: function () { return setShowActionMenu(showActionMenu === invoice.id ? null : invoice.id); }, className: "p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors relative" },
                            react_1["default"].createElement(lucide_react_1.MoreVertical, { className: "w-4 h-4" }),
                            showActionMenu === invoice.id && (react_1["default"].createElement("div", { className: "absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50" },
                                react_1["default"].createElement("button", { onClick: function () { return handleQuickAction("edit", invoice.id); }, className: "w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-left" }, "Edit"),
                                react_1["default"].createElement("button", { onClick: function () { return handleQuickAction("delete", invoice.id); }, className: "w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 text-left" }, "Delete")))))))); }))) : (react_1["default"].createElement("div", { className: "text-center py-12" },
                react_1["default"].createElement("p", { className: "text-gray-500 dark:text-gray-400 mb-4" }, "No invoices found"),
                react_1["default"].createElement(ResponsiveLayout_1.MobileButton, { onClick: onCreateInvoice, size: "sm", className: "inline-block" }, "Create First Invoice")))),
        selectedInvoice && (react_1["default"].createElement(ResponsiveLayout_1.MobileSheet, { isOpen: true, onClose: function () { return setSelectedInvoice(null); }, title: "Invoice Details" },
            react_1["default"].createElement("div", { className: "space-y-4" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("p", { className: "text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold" }, "Invoice Number"),
                    react_1["default"].createElement("p", { className: "text-lg font-semibold text-gray-900 dark:text-white mt-1" }, selectedInvoice.number)),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("p", { className: "text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold" }, "Client"),
                    react_1["default"].createElement("p", { className: "text-lg font-semibold text-gray-900 dark:text-white mt-1" }, selectedInvoice.clientName)),
                react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold" }, "Amount"),
                        react_1["default"].createElement("p", { className: "text-2xl font-bold text-gray-900 dark:text-white mt-1" },
                            selectedInvoice.currency,
                            " ",
                            formatInvoiceAmount(selectedInvoice.amount))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold" }, "Status"),
                        react_1["default"].createElement("span", { className: "inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium " + getStatusColor(selectedInvoice.status) }, selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)))),
                react_1["default"].createElement("div", { className: "border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3" },
                    react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                        react_1["default"].createElement("p", { className: "text-sm text-gray-600 dark:text-gray-400" }, "Issued Date"),
                        react_1["default"].createElement("p", { className: "text-sm font-medium text-gray-900 dark:text-white" }, new Date(selectedInvoice.date).toLocaleDateString())),
                    react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                        react_1["default"].createElement("p", { className: "text-sm text-gray-600 dark:text-gray-400" }, "Due Date"),
                        react_1["default"].createElement("p", { className: "text-sm font-medium text-gray-900 dark:text-white" }, new Date(selectedInvoice.dueDate).toLocaleDateString()))),
                react_1["default"].createElement("div", { className: "border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2" },
                    react_1["default"].createElement(ResponsiveLayout_1.MobileButton, { onClick: function () {
                            handleQuickAction("edit", selectedInvoice.id);
                            setSelectedInvoice(null);
                        }, className: "flex items-center justify-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.Send, { className: "w-4 h-4" }),
                        "Send Invoice"),
                    react_1["default"].createElement(ResponsiveLayout_1.MobileButton, { variant: "secondary", onClick: function () {
                            window.print();
                            setSelectedInvoice(null);
                        }, className: "flex items-center justify-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.Download, { className: "w-4 h-4" }),
                        "Download PDF")))))));
};
var StatCard = function (_a) {
    var label = _a.label, value = _a.value, color = _a.color;
    var colorClasses = {
        blue: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200",
        green: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200",
        yellow: "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200",
        red: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200"
    };
    return (react_1["default"].createElement("div", { className: "p-3 rounded-lg " + colorClasses[color] },
        react_1["default"].createElement("p", { className: "text-xs font-medium opacity-75" }, label),
        react_1["default"].createElement("p", { className: "text-2xl font-bold mt-1" }, value)));
};
var NavLink = function (_a) {
    var label = _a.label, icon = _a.icon, active = _a.active;
    return (react_1["default"].createElement("button", { className: "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors " + (active
            ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-medium"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700") },
        react_1["default"].createElement("span", { className: "text-lg" }, icon),
        react_1["default"].createElement("span", null, label)));
};
exports["default"] = exports.MobileInvoicesPage;
