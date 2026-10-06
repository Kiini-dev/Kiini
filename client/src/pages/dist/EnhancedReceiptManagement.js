"use strict";
/**
 * Enhanced Receipt Management Component
 * Comprehensive receipt tracking, filtering, payment reconciliation, and bulk operations
 *
 * Features:
 * - Advanced filtering (date range, payment method, status)
 * - Bulk actions (download, email, void)
 * - Payment reconciliation view
 * - Receipt templates
 * - Email distribution
 * - Export to PDF/CSV
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var checkbox_1 = require("@/components/ui/checkbox");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var date_fns_1 = require("date-fns");
var stats_card_1 = require("@/components/ui/stats-card");
var currency_1 = require("@/lib/currency");
function EnhancedReceiptManagement() {
    var _this = this;
    var _a = permissions_1.useRequireFeature("accounting:receipts:view"), allowed = _a.allowed, permissionsLoading = _a.isLoading;
    var _b = wouter_1.useLocation(), navigate = _b[1];
    var _c = react_1.useState({}), filters = _c[0], setFilters = _c[1];
    var _d = react_1.useState(new Set()), selectedReceipts = _d[0], setSelectedReceipts = _d[1];
    var _e = react_1.useState(false), isExporting = _e[0], setIsExporting = _e[1];
    var _f = react_1.useState(false), isEmailing = _f[0], setIsEmailing = _f[1];
    // Fetch data
    var _g = trpc_1.trpc.receipts.list.useQuery(), _h = _g.data, receiptsData = _h === void 0 ? [] : _h, receiptsLoading = _g.isLoading;
    var _j = trpc_1.trpc.clients.list.useQuery().data, clientsData = _j === void 0 ? [] : _j;
    var utils = trpc_1.trpc.useUtils();
    var formatCurrency = currency_1.useCurrency().format;
    // Email mutation
    var emailReceiptsMutation = trpc_1.trpc.emailQueue.queueEmail.useMutation({
        onSuccess: function (result) {
            sonner_1.toast.success("Email queued for " + selectedReceipts.size + " receipts");
            setSelectedReceipts(new Set());
            setIsEmailing(false);
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to queue emails");
            setIsEmailing(false);
        }
    });
    // Transform and filter receipts
    var filteredReceipts = react_1.useMemo(function () {
        var result = Array.isArray(receiptsData) ? receiptsData : [];
        // Apply filters
        if (filters.search) {
            var search_1 = filters.search.toLowerCase();
            result = result.filter(function (r) {
                var _a, _b;
                var client = clientsData.find(function (c) { return c.id === r.clientId; });
                return (((_a = r.receiptNumber) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(search_1)) || ((_b = client === null || client === void 0 ? void 0 : client.companyName) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(search_1)));
            });
        }
        if (filters.dateFrom) {
            result = result.filter(function (r) { return new Date(r.date) >= filters.dateFrom; });
        }
        if (filters.dateTo) {
            result = result.filter(function (r) { return new Date(r.date) <= filters.dateTo; });
        }
        if (filters.paymentMethod && filters.paymentMethod !== "all") {
            result = result.filter(function (r) { return r.paymentMethod === filters.paymentMethod; });
        }
        if (filters.status && filters.status !== "all") {
            result = result.filter(function (r) { return r.status === filters.status; });
        }
        return result.sort(function (a, b) { return new Date(b.date).getTime() - new Date(a.date).getTime(); });
    }, [receiptsData, filters, clientsData]);
    // Calculate statistics
    var stats = react_1.useMemo(function () {
        var receipts = filteredReceipts;
        return {
            total: receipts.length,
            totalAmount: receipts.reduce(function (sum, r) { return sum + (r.amount || 0); }, 0),
            issued: receipts.filter(function (r) { return r.status === "issued"; }).length,
            voided: receipts.filter(function (r) { return r.status === "void"; }).length
        };
    }, [filteredReceipts]);
    if (permissionsLoading)
        return React.createElement(spinner_1.Spinner, { className: "w-8 h-8 mx-auto my-8" });
    if (!allowed)
        return null;
    // Format currency
    // Handlers
    var handleToggleSelect = function (id) {
        var newSelected = new Set(selectedReceipts);
        newSelected.has(id) ? newSelected["delete"](id) : newSelected.add(id);
        setSelectedReceipts(newSelected);
    };
    var handleSelectAll = function () {
        if (selectedReceipts.size === filteredReceipts.length) {
            setSelectedReceipts(new Set());
        }
        else {
            setSelectedReceipts(new Set(filteredReceipts.map(function (r) { return r.id; })));
        }
    };
    var handleEmailReceipts = function () { return __awaiter(_this, void 0, void 0, function () {
        var receiptsToEmail, _loop_1, _i, receiptsToEmail_1, receipt, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (selectedReceipts.size === 0) {
                        sonner_1.toast.error("Please select at least one receipt");
                        return [2 /*return*/];
                    }
                    setIsEmailing(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    receiptsToEmail = filteredReceipts.filter(function (r) { return selectedReceipts.has(r.id); });
                    _loop_1 = function (receipt) {
                        var client;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    client = clientsData.find(function (c) { return c.id === receipt.clientId; });
                                    if (!(client === null || client === void 0 ? void 0 : client.email)) return [3 /*break*/, 2];
                                    return [4 /*yield*/, emailReceiptsMutation.mutateAsync({
                                            toEmail: client.email,
                                            subject: "Receipt " + receipt.receiptNumber + " from Kiini",
                                            htmlContent: "<p>Please find attached your receipt " + receipt.receiptNumber + " for " + formatCurrency(receipt.amount) + "</p>",
                                            sendImmediately: false
                                        })];
                                case 1:
                                    _a.sent();
                                    _a.label = 2;
                                case 2: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, receiptsToEmail_1 = receiptsToEmail;
                    _a.label = 2;
                case 2:
                    if (!(_i < receiptsToEmail_1.length)) return [3 /*break*/, 5];
                    receipt = receiptsToEmail_1[_i];
                    return [5 /*yield**/, _loop_1(receipt)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error("Email error:", error_1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleExportCSV = function () {
        setIsExporting(true);
        try {
            var headers = ["Receipt #", "Client", "Amount", "Date", "Payment Method", "Status"];
            var rows = filteredReceipts.map(function (r) {
                var _a;
                return [
                    r.receiptNumber,
                    ((_a = clientsData.find(function (c) { return c.id === r.clientId; })) === null || _a === void 0 ? void 0 : _a.companyName) || "Unknown",
                    formatCurrency(r.amount),
                    date_fns_1.format(new Date(r.date), "yyyy-MM-dd"),
                    r.paymentMethod,
                    r.status,
                ];
            });
            var csv = __spreadArrays([headers], rows).map(function (row) { return row.join(","); }).join("\n");
            var blob = new Blob([csv], { type: "text/csv" });
            var url = URL.createObjectURL(blob);
            var link = document.createElement("a");
            link.href = url;
            link.download = "receipts_" + date_fns_1.format(new Date(), "yyyy-MM-dd") + ".csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            sonner_1.toast.success("Receipts exported successfully");
        }
        catch (error) {
            sonner_1.toast.error("Export failed");
        }
        finally {
            setIsExporting(false);
        }
    };
    var handleQuickDateFilter = function (days) {
        var to = new Date();
        var from = date_fns_1.subDays(to, days);
        setFilters(function (prev) { return (__assign(__assign({}, prev), { dateFrom: date_fns_1.startOfDay(from), dateTo: date_fns_1.endOfDay(to) })); });
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Receipts", href: "/receipts" },
        ], title: "Receipt Management", description: "Track and manage all receipt transactions", icon: React.createElement(lucide_react_1.Receipt, { className: "w-6 h-6" }) },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "flex items-center justify-between gap-4" },
                React.createElement("div", { className: "flex gap-2" },
                    React.createElement(button_1.Button, { onClick: function () { return navigate("/receipts/create"); }, size: "sm" },
                        React.createElement(lucide_react_1.Plus, { className: "w-4 h-4 mr-2" }),
                        "New Receipt")),
                React.createElement("div", { className: "flex gap-2" },
                    selectedReceipts.size > 0 && (React.createElement(React.Fragment, null,
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleEmailReceipts, disabled: isEmailing }, isEmailing ? (React.createElement(React.Fragment, null,
                            React.createElement(lucide_react_1.Loader2, { className: "w-4 h-4 mr-2 animate-spin" }),
                            "Emailing...")) : (React.createElement(React.Fragment, null,
                            React.createElement(lucide_react_1.Mail, { className: "w-4 h-4 mr-2" }),
                            "Email (",
                            selectedReceipts.size,
                            ")"))),
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleExportCSV, disabled: isExporting }, isExporting ? (React.createElement(React.Fragment, null,
                            React.createElement(lucide_react_1.Loader2, { className: "w-4 h-4 mr-2 animate-spin" }),
                            "Exporting...")) : (React.createElement(React.Fragment, null,
                            React.createElement(lucide_react_1.Download, { className: "w-4 h-4 mr-2" }),
                            "Export (",
                            selectedReceipts.size,
                            ")"))))),
                    React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleExportCSV, disabled: isExporting || filteredReceipts.length === 0 },
                        React.createElement(lucide_react_1.Download, { className: "w-4 h-4 mr-2" }),
                        "Export All"))),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Receipts", value: stats.total, description: React.createElement(React.Fragment, null,
                        stats.issued,
                        " issued"), color: "border-l-orange-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Amount", value: formatCurrency(stats.totalAmount), description: "Combined value", color: "border-l-purple-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Issued", value: stats.issued, description: "Active receipts", color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Voided", value: stats.voided, description: "Cancelled receipts", color: "border-l-blue-500" })),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Filter, { className: "w-4 h-4" }),
                        "Filters")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                            React.createElement(input_1.Input, { placeholder: "Search receipt number or client...", value: filters.search || "", onChange: function (e) {
                                    return setFilters(function (prev) { return (__assign(__assign({}, prev), { search: e.target.value })); });
                                } }),
                            React.createElement(select_1.Select, { value: filters.paymentMethod || "all", onValueChange: function (value) {
                                    return setFilters(function (prev) { return (__assign(__assign({}, prev), { paymentMethod: value })); });
                                } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "all" }, "All Methods"),
                                    React.createElement(select_1.SelectItem, { value: "cash" }, "Cash"),
                                    React.createElement(select_1.SelectItem, { value: "bank-transfer" }, "Bank Transfer"),
                                    React.createElement(select_1.SelectItem, { value: "mpesa" }, "M-Pesa"),
                                    React.createElement(select_1.SelectItem, { value: "cheque" }, "Cheque"),
                                    React.createElement(select_1.SelectItem, { value: "card" }, "Card"))),
                            React.createElement(select_1.Select, { value: filters.status || "all", onValueChange: function (value) {
                                    return setFilters(function (prev) { return (__assign(__assign({}, prev), { status: value })); });
                                } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "all" }, "All Status"),
                                    React.createElement(select_1.SelectItem, { value: "issued" }, "Issued"),
                                    React.createElement(select_1.SelectItem, { value: "void" }, "Voided"))),
                            React.createElement("div", { className: "flex gap-2" },
                                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return handleQuickDateFilter(7); } }, "Last 7 days"),
                                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return handleQuickDateFilter(30); } }, "Last 30 days")))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Receipts"),
                    React.createElement(card_1.CardDescription, null,
                        filteredReceipts.length,
                        " receipts found")),
                React.createElement(card_1.CardContent, null, receiptsLoading ? (React.createElement("div", { className: "flex justify-center py-8" },
                    React.createElement(spinner_1.Spinner, { className: "w-6 h-6" }))) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, { className: "w-12" },
                                    React.createElement(checkbox_1.Checkbox, { checked: selectedReceipts.size === filteredReceipts.length, onCheckedChange: handleSelectAll })),
                                React.createElement(table_1.TableHead, null, "Receipt #"),
                                React.createElement(table_1.TableHead, null, "Client"),
                                React.createElement(table_1.TableHead, null, "Amount"),
                                React.createElement(table_1.TableHead, null, "Date"),
                                React.createElement(table_1.TableHead, null, "Payment Method"),
                                React.createElement(table_1.TableHead, null, "Status"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, filteredReceipts.length === 0 ? (React.createElement(table_1.TableRow, null,
                            React.createElement(table_1.TableCell, { colSpan: 8, className: "text-center py-8 text-muted-foreground" }, "No receipts found"))) : (filteredReceipts.map(function (receipt) {
                            var client = clientsData.find(function (c) { return c.id === receipt.clientId; });
                            return (React.createElement(table_1.TableRow, { key: receipt.id },
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(checkbox_1.Checkbox, { checked: selectedReceipts.has(receipt.id), onCheckedChange: function () { return handleToggleSelect(receipt.id); } })),
                                React.createElement(table_1.TableCell, { className: "font-medium" }, receipt.receiptNumber),
                                React.createElement(table_1.TableCell, null, (client === null || client === void 0 ? void 0 : client.companyName) || "Unknown"),
                                React.createElement(table_1.TableCell, { className: "font-semibold" }, formatCurrency(receipt.amount)),
                                React.createElement(table_1.TableCell, null, date_fns_1.format(new Date(receipt.date), "yyyy-MM-dd")),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(badge_1.Badge, { variant: "outline" }, receipt.paymentMethod)),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(badge_1.Badge, { variant: receipt.status === "issued" ? "default" : "destructive" }, receipt.status === "issued" ? (React.createElement(React.Fragment, null,
                                        React.createElement(lucide_react_1.CheckCircle2, { className: "w-3 h-3 mr-1" }),
                                        "Issued")) : (React.createElement(React.Fragment, null,
                                        React.createElement(lucide_react_1.AlertCircle, { className: "w-3 h-3 mr-1" }),
                                        "Voided")))),
                                React.createElement(table_1.TableCell, { className: "text-right" },
                                    React.createElement(dropdown_menu_1.DropdownMenu, null,
                                        React.createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                                            React.createElement(button_1.Button, { variant: "ghost", size: "sm" },
                                                React.createElement(lucide_react_1.MoreVertical, { className: "w-4 h-4" }))),
                                        React.createElement(dropdown_menu_1.DropdownMenuContent, { align: "end" },
                                            React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/receipts/" + receipt.id); } },
                                                React.createElement(lucide_react_1.Eye, { className: "w-4 h-4 mr-2" }),
                                                "View"),
                                            React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/receipts/" + receipt.id + "/edit"); } },
                                                React.createElement(lucide_react_1.Printer, { className: "w-4 h-4 mr-2" }),
                                                "Print"),
                                            React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return __awaiter(_this, void 0, void 0, function () {
                                                    var error_2;
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0:
                                                                _a.trys.push([0, 2, , 3]);
                                                                return [4 /*yield*/, emailReceiptsMutation.mutateAsync({
                                                                        toEmail: (client === null || client === void 0 ? void 0 : client.email) || "",
                                                                        subject: "Receipt " + receipt.receiptNumber,
                                                                        htmlContent: "<p>Receipt for " + formatCurrency(receipt.amount) + "</p>",
                                                                        sendImmediately: true
                                                                    })];
                                                            case 1:
                                                                _a.sent();
                                                                sonner_1.toast.success("Receipt email sent");
                                                                return [3 /*break*/, 3];
                                                            case 2:
                                                                error_2 = _a.sent();
                                                                sonner_1.toast.error("Failed to send email");
                                                                return [3 /*break*/, 3];
                                                            case 3: return [2 /*return*/];
                                                        }
                                                    });
                                                }); } },
                                                React.createElement(lucide_react_1.Mail, { className: "w-4 h-4 mr-2" }),
                                                "Email"))))));
                        })))))))))));
}
exports["default"] = EnhancedReceiptManagement;
