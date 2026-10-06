"use strict";
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
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var currency_1 = require("@/lib/currency");
var wouter_1 = require("wouter");
function OverduePaymentDashboard() {
    var _this = this;
    var formatCurrency = currency_1.useCurrency().format;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var _b = react_1.useState(new Set()), selectedReminders = _b[0], setSelectedReminders = _b[1];
    var _c = react_1.useState(null), sendingReminder = _c[0], setSendingReminder = _c[1];
    // Fetch overdue invoices
    var _d = trpc_1.trpc.invoices.payments.getOverdue.useQuery(), _e = _d.data, overdueInvoices = _e === void 0 ? [] : _e, isLoadingOverdue = _d.isLoading;
    // Fetch reminders needed
    var _f = trpc_1.trpc.invoices.payments.getRemindersNeeded.useQuery(), _g = _f.data, remindersNeeded = _g === void 0 ? [] : _g, isLoadingReminders = _f.isLoading;
    // Send reminder mutation
    var sendReminderMutation = trpc_1.trpc.invoices.payments.sendReminder.useMutation({
        onSuccess: function () {
            setSendingReminder(null);
        },
        onError: function (error) {
            console.error("Failed to send reminder:", error);
            setSendingReminder(null);
        }
    });
    var handleSendReminder = function (invoiceId, reminderType) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setSendingReminder(invoiceId);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, sendReminderMutation.mutateAsync({
                            invoiceId: invoiceId,
                            reminderType: reminderType
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("Error sending reminder:", error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleSelectReminder = function (invoiceId) {
        var newSelected = new Set(selectedReminders);
        if (newSelected.has(invoiceId)) {
            newSelected["delete"](invoiceId);
        }
        else {
            newSelected.add(invoiceId);
        }
        setSelectedReminders(newSelected);
    };
    var handleSelectAllReminders = function () {
        if (selectedReminders.size === remindersNeeded.length) {
            setSelectedReminders(new Set());
        }
        else {
            setSelectedReminders(new Set(remindersNeeded.map(function (r) { return r.invoiceId; })));
        }
    };
    var handleBulkSendReminders = function () { return __awaiter(_this, void 0, void 0, function () {
        var _loop_1, _i, selectedReminders_1, invoiceId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _loop_1 = function (invoiceId) {
                        var reminder;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    reminder = remindersNeeded.find(function (r) { return r.invoiceId === invoiceId; });
                                    if (!reminder) return [3 /*break*/, 2];
                                    return [4 /*yield*/, handleSendReminder(invoiceId, reminder.reminderType)];
                                case 1:
                                    _a.sent();
                                    _a.label = 2;
                                case 2: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, selectedReminders_1 = selectedReminders;
                    _a.label = 1;
                case 1:
                    if (!(_i < selectedReminders_1.length)) return [3 /*break*/, 4];
                    invoiceId = selectedReminders_1[_i];
                    return [5 /*yield**/, _loop_1(invoiceId)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    setSelectedReminders(new Set());
                    return [2 /*return*/];
            }
        });
    }); };
    var isLoading = isLoadingOverdue || isLoadingReminders;
    if (isLoading) {
        return (react_1["default"].createElement("div", { className: "flex items-center justify-center h-40" },
            react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin text-blue-500" })));
    }
    // Summary calculations
    var totalOverdue = overdueInvoices.length;
    var totalOverdueAmount = overdueInvoices.reduce(function (sum, inv) { return sum + inv.remainingAmount; }, 0);
    var averageDaysOverdue = totalOverdue > 0
        ? Math.round(overdueInvoices.reduce(function (sum, inv) { return sum + inv.daysOverdue; }, 0) / totalOverdue)
        : 0;
    var getMostOverdueReminder = function (invoiceId) {
        var overdue = overdueInvoices.find(function (inv) { return inv.id === invoiceId; });
        if (!overdue)
            return "first";
        if (overdue.daysOverdue >= 30)
            return "final";
        if (overdue.daysOverdue >= 14)
            return "second";
        return "first";
    };
    var getSeverity = function (daysOverdue) {
        if (daysOverdue >= 30)
            return "critical";
        if (daysOverdue >= 14)
            return "serious";
        if (daysOverdue >= 7)
            return "warning";
        return "mild";
    };
    var getSeverityColor = function (severity) {
        switch (severity) {
            case "critical":
                return "bg-red-100 text-red-800 border-red-300";
            case "serious":
                return "bg-orange-100 text-orange-800 border-orange-300";
            case "warning":
                return "bg-yellow-100 text-yellow-800 border-yellow-300";
            default:
                return "bg-blue-100 text-blue-800 border-blue-300";
        }
    };
    var formatDate = function (date) {
        return new Date(date).toLocaleDateString("en-KE", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };
    return (react_1["default"].createElement("div", { className: "w-full space-y-6" },
        react_1["default"].createElement("div", { className: "flex items-center justify-between" },
            react_1["default"].createElement("div", { className: "flex items-center gap-3" },
                react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-6 w-6 text-red-500" }),
                react_1["default"].createElement("h2", { className: "text-2xl font-bold text-gray-900 dark:text-white" }, "Overdue Payments")),
            totalOverdue > 0 && (react_1["default"].createElement("span", { className: "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800" },
                totalOverdue,
                " invoice",
                totalOverdue !== 1 ? "s" : "",
                " overdue"))),
        totalOverdue === 0 ? (react_1["default"].createElement("div", { className: "bg-green-50 border border-green-200 rounded-lg p-6 text-center" },
            react_1["default"].createElement(lucide_react_1.CheckCircle, { className: "h-12 w-12 text-green-600 mx-auto mb-3" }),
            react_1["default"].createElement("p", { className: "text-green-800 font-medium" }, "All invoices are up to date!"),
            react_1["default"].createElement("p", { className: "text-green-700 text-sm mt-1" }, "No overdue payments at this time."))) : (react_1["default"].createElement(react_1["default"].Fragment, null,
            react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                react_1["default"].createElement("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4" },
                    react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("p", { className: "text-sm text-gray-600 dark:text-gray-400 font-medium" }, "Total Overdue"),
                            react_1["default"].createElement("p", { className: "text-2xl font-bold text-red-600 mt-2" }, formatCurrency(totalOverdueAmount))),
                        react_1["default"].createElement(lucide_react_1.DollarSign, { className: "h-10 w-10 text-red-500 opacity-20" }))),
                react_1["default"].createElement("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4" },
                    react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("p", { className: "text-sm text-gray-600 dark:text-gray-400 font-medium" }, "Invoices Overdue"),
                            react_1["default"].createElement("p", { className: "text-2xl font-bold text-orange-600 mt-2" }, totalOverdue)),
                        react_1["default"].createElement(lucide_react_1.TrendingDown, { className: "h-10 w-10 text-orange-500 opacity-20" }))),
                react_1["default"].createElement("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4" },
                    react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("p", { className: "text-sm text-gray-600 dark:text-gray-400 font-medium" }, "Avg Days Overdue"),
                            react_1["default"].createElement("p", { className: "text-2xl font-bold text-yellow-600 mt-2" }, averageDaysOverdue)),
                        react_1["default"].createElement(lucide_react_1.Clock, { className: "h-10 w-10 text-yellow-500 opacity-20" })))),
            remindersNeeded.length > 0 && (react_1["default"].createElement("div", { className: "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between mb-4" },
                    react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.Mail, { className: "h-5 w-5 text-blue-600" }),
                        react_1["default"].createElement("h3", { className: "font-semibold text-blue-900 dark:text-blue-200" },
                            remindersNeeded.length,
                            " Reminder",
                            remindersNeeded.length !== 1 ? "s" : "",
                            " Needed")),
                    selectedReminders.size > 0 && (react_1["default"].createElement("button", { onClick: handleBulkSendReminders, disabled: sendingReminder !== null, className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.Send, { className: "h-4 w-4" }),
                        "Send Selected (",
                        selectedReminders.size,
                        ")"))),
                react_1["default"].createElement("div", { className: "space-y-2" },
                    react_1["default"].createElement("label", { className: "flex items-center gap-3 p-2 hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded cursor-pointer" },
                        react_1["default"].createElement("input", { type: "checkbox", checked: selectedReminders.size === remindersNeeded.length && remindersNeeded.length > 0, onChange: handleSelectAllReminders, className: "rounded border-gray-300" }),
                        react_1["default"].createElement("span", { className: "text-sm font-medium text-blue-900 dark:text-blue-200" }, "Select All Reminders")),
                    remindersNeeded.map(function (reminder) { return (react_1["default"].createElement("div", { key: reminder.invoiceId, className: "flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-700" },
                        react_1["default"].createElement("label", { className: "flex items-center gap-3 flex-1 cursor-pointer" },
                            react_1["default"].createElement("input", { type: "checkbox", checked: selectedReminders.has(reminder.invoiceId), onChange: function () { return handleSelectReminder(reminder.invoiceId); }, className: "rounded border-gray-300" }),
                            react_1["default"].createElement("div", { className: "flex-1" },
                                react_1["default"].createElement("p", { className: "font-medium text-gray-900 dark:text-white" },
                                    "Invoice ",
                                    reminder.invoiceNumber),
                                react_1["default"].createElement("p", { className: "text-xs text-gray-500 dark:text-gray-400" },
                                    reminder.daysOverdue,
                                    " days overdue \u2022 ",
                                    reminder.reminderType.charAt(0).toUpperCase() + reminder.reminderType.slice(1),
                                    " reminder"))),
                        react_1["default"].createElement("button", { onClick: function () { return handleSendReminder(reminder.invoiceId, reminder.reminderType); }, disabled: sendingReminder === reminder.invoiceId, className: "px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2" }, sendingReminder === reminder.invoiceId ? (react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin" })) : (react_1["default"].createElement(lucide_react_1.Mail, { className: "h-4 w-4" }))))); })))),
            react_1["default"].createElement("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden" },
                react_1["default"].createElement("div", { className: "overflow-x-auto" },
                    react_1["default"].createElement("table", { className: "w-full" },
                        react_1["default"].createElement("thead", { className: "bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700" },
                            react_1["default"].createElement("tr", null,
                                react_1["default"].createElement("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider" }, "Invoice"),
                                react_1["default"].createElement("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider" }, "Client"),
                                react_1["default"].createElement("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider" }, "Due Date"),
                                react_1["default"].createElement("th", { className: "px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider" }, "Total"),
                                react_1["default"].createElement("th", { className: "px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider" }, "Remaining"),
                                react_1["default"].createElement("th", { className: "px-6 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider" }, "Days Overdue"),
                                react_1["default"].createElement("th", { className: "px-6 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider" }, "Action"))),
                        react_1["default"].createElement("tbody", { className: "divide-y divide-gray-200 dark:divide-gray-700" }, overdueInvoices.map(function (invoice) {
                            var severity = getSeverity(invoice.daysOverdue);
                            var reminderType = getMostOverdueReminder(invoice.id);
                            return (react_1["default"].createElement("tr", { key: invoice.id, className: "hover:bg-gray-50 dark:hover:bg-gray-700" },
                                react_1["default"].createElement("td", { className: "px-6 py-4" },
                                    react_1["default"].createElement("span", { className: "font-medium text-gray-900 dark:text-white" }, invoice.invoiceNumber)),
                                react_1["default"].createElement("td", { className: "px-6 py-4 text-gray-700 dark:text-gray-300" }, invoice.clientName),
                                react_1["default"].createElement("td", { className: "px-6 py-4 text-gray-700 dark:text-gray-300" },
                                    react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                                        react_1["default"].createElement(lucide_react_1.Calendar, { className: "h-4 w-4 text-gray-400" }),
                                        formatDate(invoice.dueDate))),
                                react_1["default"].createElement("td", { className: "px-6 py-4 text-right font-medium text-gray-900 dark:text-white" }, formatCurrency(invoice.total)),
                                react_1["default"].createElement("td", { className: "px-6 py-4 text-right font-semibold text-red-600" }, formatCurrency(invoice.remainingAmount)),
                                react_1["default"].createElement("td", { className: "px-6 py-4 text-center" },
                                    react_1["default"].createElement("span", { className: "inline-block px-3 py-1 rounded-full text-xs font-semibold border " + getSeverityColor(severity) },
                                        invoice.daysOverdue,
                                        " days")),
                                react_1["default"].createElement("td", { className: "px-6 py-4 text-center" },
                                    react_1["default"].createElement("div", { className: "flex items-center justify-center gap-2" },
                                        react_1["default"].createElement("button", { onClick: function () { return setLocation("/invoices/" + invoice.id); }, className: "p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md", title: "View Invoice" },
                                            react_1["default"].createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                        react_1["default"].createElement("button", { onClick: function () { return handleSendReminder(invoice.id, reminderType); }, disabled: sendingReminder === invoice.id, className: "p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md disabled:opacity-50", title: "Send " + reminderType + " reminder" }, sendingReminder === invoice.id ? (react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin" })) : (react_1["default"].createElement(lucide_react_1.Mail, { className: "h-4 w-4" })))))));
                        })))))))));
}
exports["default"] = OverduePaymentDashboard;
