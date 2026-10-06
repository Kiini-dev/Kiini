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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.ExpenseManagementPage = void 0;
var react_1 = require("react");
var trpc_1 = require("@/utils/trpc");
var lucide_react_1 = require("lucide-react");
function ExpenseManagementPage() {
    var _this = this;
    var _a = react_1.useState(false), showReportForm = _a[0], setShowReportForm = _a[1];
    var _b = react_1.useState(false), showExpenseForm = _b[0], setShowExpenseForm = _b[1];
    var _c = react_1.useState(null), selectedReport = _c[0], setSelectedReport = _c[1];
    var _d = react_1.useState({
        expenses: [{ description: '', amount: '', category: '', vendor: '' }]
    }), formData = _d[0], setFormData = _d[1];
    var reportsQuery = trpc_1.trpc.expenses.getReports.useQuery();
    var submitReportMutation = trpc_1.trpc.expenses.submitExpenseReport.useMutation();
    var approveReportMutation = trpc_1.trpc.expenses.approveReport.useMutation();
    var processReimburseMutation = trpc_1.trpc.expenses.processReimbursement.useMutation();
    var reports = reportsQuery.data || [];
    // Summary stats
    var stats = {
        pending: reports.filter(function (r) { return r.status === 'submitted'; }).length,
        approved: reports.filter(function (r) { return r.status === 'approved'; }).length,
        reimbursed: reports.filter(function (r) { return r.status === 'reimbursed'; }).length,
        totalPending: reports
            .filter(function (r) { return r.status !== 'reimbursed'; })
            .reduce(function (sum, r) { return sum + (r.totalAmount || 0); }, 0) / 100
    };
    var handleSubmitReport = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, submitReportMutation.mutateAsync({
                            expenses: formData.expenses
                                .filter(function (exp) { return exp.description && exp.amount; })
                                .map(function (exp) { return ({
                                description: exp.description,
                                amount: Math.round(Number(exp.amount) * 100),
                                categoryId: exp.category,
                                vendor: exp.vendor
                            }); })
                        })];
                case 2:
                    _a.sent();
                    setShowReportForm(false);
                    setFormData({ expenses: [{ description: '', amount: '', category: '', vendor: '' }] });
                    reportsQuery.refetch();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Failed to submit report:', error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleApprove = function (reportId) { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, approveReportMutation.mutateAsync({ reportId: reportId })];
                case 1:
                    _a.sent();
                    reportsQuery.refetch();
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Failed to approve:', error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleProcess = function (reportId) { return __awaiter(_this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, processReimburseMutation.mutateAsync({
                            reportId: reportId,
                            paymentMethod: 'bank_transfer'
                        })];
                case 1:
                    _a.sent();
                    reportsQuery.refetch();
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error('Failed to process:', error_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return (react_1["default"].createElement("div", { className: "space-y-6 p-6" },
        react_1["default"].createElement("div", { className: "flex justify-between items-start" },
            react_1["default"].createElement("div", null,
                react_1["default"].createElement("h1", { className: "text-3xl font-bold text-gray-900" }, "Expense Management"),
                react_1["default"].createElement("p", { className: "text-gray-600" }, "Submit, approve, and track expense reports")),
            react_1["default"].createElement("button", { onClick: function () { return setShowReportForm(true); }, className: "flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition" },
                react_1["default"].createElement(lucide_react_1.Plus, { size: 20 }),
                " New Report")),
        react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
            react_1["default"].createElement(StatBox, { label: "Pending Approval", value: stats.pending, color: "yellow" }),
            react_1["default"].createElement(StatBox, { label: "Approved", value: stats.approved, color: "blue" }),
            react_1["default"].createElement(StatBox, { label: "Reimbursed", value: stats.reimbursed, color: "green" }),
            react_1["default"].createElement(StatBox, { label: "Total Pending", value: "Ksh " + stats.totalPending.toLocaleString('en-KE', { maximumFractionDigits: 0 }), color: "purple" })),
        showReportForm && (react_1["default"].createElement("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" },
            react_1["default"].createElement("div", { className: "bg-white rounded-lg shadow-lg max-w-3xl w-full m-4 max-h-96 overflow-y-auto" },
                react_1["default"].createElement("div", { className: "p-6" },
                    react_1["default"].createElement("h2", { className: "text-2xl font-semibold mb-4" }, "Submit Expense Report"),
                    react_1["default"].createElement("form", { onSubmit: handleSubmitReport, className: "space-y-4" },
                        react_1["default"].createElement("div", { className: "space-y-3" }, formData.expenses.map(function (expense, idx) { return (react_1["default"].createElement("div", { key: expense.id || "exp-" + idx, className: "grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border rounded bg-gray-50" },
                            react_1["default"].createElement("input", { type: "text", placeholder: "Description", value: expense.description, onChange: function (e) {
                                    var newExpenses = __spreadArrays(formData.expenses);
                                    newExpenses[idx].description = e.target.value;
                                    setFormData({ expenses: newExpenses });
                                }, className: "px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" }),
                            react_1["default"].createElement("input", { type: "number", placeholder: "Amount (Ksh)", step: "0.01", value: expense.amount, onChange: function (e) {
                                    var newExpenses = __spreadArrays(formData.expenses);
                                    newExpenses[idx].amount = e.target.value;
                                    setFormData({ expenses: newExpenses });
                                }, className: "px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" }),
                            react_1["default"].createElement("select", { value: expense.category, onChange: function (e) {
                                    var newExpenses = __spreadArrays(formData.expenses);
                                    newExpenses[idx].category = e.target.value;
                                    setFormData({ expenses: newExpenses });
                                }, className: "px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" },
                                react_1["default"].createElement("option", { value: "" }, "Category"),
                                react_1["default"].createElement("option", { value: "travel" }, "Travel"),
                                react_1["default"].createElement("option", { value: "meals" }, "Meals"),
                                react_1["default"].createElement("option", { value: "office" }, "Office Supplies"),
                                react_1["default"].createElement("option", { value: "software" }, "Software"),
                                react_1["default"].createElement("option", { value: "other" }, "Other")),
                            react_1["default"].createElement("input", { type: "text", placeholder: "Vendor (optional)", value: expense.vendor, onChange: function (e) {
                                    var newExpenses = __spreadArrays(formData.expenses);
                                    newExpenses[idx].vendor = e.target.value;
                                    setFormData({ expenses: newExpenses });
                                }, className: "px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" }))); })),
                        react_1["default"].createElement("div", { className: "flex gap-2 pt-4" },
                            react_1["default"].createElement("button", { type: "button", onClick: function () {
                                    setFormData({
                                        expenses: __spreadArrays(formData.expenses, [{ description: '', amount: '', category: '', vendor: '' }])
                                    });
                                }, className: "flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition" },
                                react_1["default"].createElement(lucide_react_1.Plus, { size: 16 }),
                                " Add Item"),
                            react_1["default"].createElement("button", { type: "submit", disabled: submitReportMutation.isPending, className: "flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition" }, submitReportMutation.isPending ? 'Submitting...' : 'Submit Report'),
                            react_1["default"].createElement("button", { type: "button", onClick: function () { return setShowReportForm(false); }, className: "px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition" }, "Cancel"))))))),
        react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            react_1["default"].createElement("h2", { className: "text-lg font-semibold mb-4" }, "Expense Reports"),
            react_1["default"].createElement("div", { className: "overflow-x-auto" },
                react_1["default"].createElement("table", { className: "w-full text-sm" },
                    react_1["default"].createElement("thead", null,
                        react_1["default"].createElement("tr", { className: "border-b bg-gray-50" },
                            react_1["default"].createElement("th", { className: "px-4 py-3 text-left" }, "Report #"),
                            react_1["default"].createElement("th", { className: "px-4 py-3 text-center" }, "Amount"),
                            react_1["default"].createElement("th", { className: "px-4 py-3 text-center" }, "Items"),
                            react_1["default"].createElement("th", { className: "px-4 py-3 text-center" }, "Submitted"),
                            react_1["default"].createElement("th", { className: "px-4 py-3 text-center" }, "Status"),
                            react_1["default"].createElement("th", { className: "px-4 py-3 text-center" }, "Actions"))),
                    react_1["default"].createElement("tbody", null, reports.map(function (report) { return (react_1["default"].createElement("tr", { key: report.id, className: "border-b hover:bg-gray-50" },
                        react_1["default"].createElement("td", { className: "px-4 py-3 font-medium" }, report.reportNumber),
                        react_1["default"].createElement("td", { className: "px-4 py-3 text-center font-semibold" },
                            "Ksh ",
                            (report.totalAmount / 100).toLocaleString('en-KE')),
                        react_1["default"].createElement("td", { className: "px-4 py-3 text-center" }, report.itemCount || 0),
                        react_1["default"].createElement("td", { className: "px-4 py-3 text-center text-sm" }, new Date(report.createdAt).toLocaleDateString('en-KE')),
                        react_1["default"].createElement("td", { className: "px-4 py-3 text-center" },
                            react_1["default"].createElement(StatusBadge, { status: report.status })),
                        react_1["default"].createElement("td", { className: "px-4 py-3 text-center" },
                            react_1["default"].createElement("div", { className: "flex justify-center gap-2" },
                                react_1["default"].createElement("button", { className: "p-1 hover:bg-blue-100 rounded transition", title: "View" },
                                    react_1["default"].createElement(lucide_react_1.Eye, { size: 16, className: "text-blue-600" })),
                                report.status === 'submitted' && (react_1["default"].createElement("button", { onClick: function () { return handleApprove(report.id); }, disabled: approveReportMutation.isPending, className: "p-1 hover:bg-green-100 rounded transition", title: "Approve" },
                                    react_1["default"].createElement(lucide_react_1.Check, { size: 16, className: "text-green-600" }))),
                                report.status === 'approved' && (react_1["default"].createElement("button", { onClick: function () { return handleProcess(report.id); }, disabled: processReimburseMutation.isPending, className: "p-1 hover:bg-purple-100 rounded transition", title: "Process Reimbursement" },
                                    react_1["default"].createElement(lucide_react_1.Download, { size: 16, className: "text-purple-600" }))))))); }))),
                reports.length === 0 && (react_1["default"].createElement("div", { className: "text-center py-8 text-gray-500" }, "No reports found"))))));
}
exports.ExpenseManagementPage = ExpenseManagementPage;
function StatBox(_a) {
    var label = _a.label, value = _a.value, color = _a.color;
    var colors = {
        yellow: 'bg-yellow-100 border-yellow-300',
        blue: 'bg-blue-100 border-blue-300',
        green: 'bg-green-100 border-green-300',
        purple: 'bg-purple-100 border-purple-300'
    };
    return (react_1["default"].createElement("div", { className: "p-4 border rounded-lg " + colors[color] },
        react_1["default"].createElement("p", { className: "text-gray-600 text-sm mb-1" }, label),
        react_1["default"].createElement("p", { className: "text-2xl font-bold" }, value)));
}
function StatusBadge(_a) {
    var status = _a.status;
    var colors = {
        draft: 'bg-gray-100 text-gray-700',
        submitted: 'bg-yellow-100 text-yellow-700',
        approved: 'bg-blue-100 text-blue-700',
        reimbursed: 'bg-green-100 text-green-700'
    };
    return (react_1["default"].createElement("span", { className: "px-2 py-1 rounded-full text-xs font-semibold " + colors[status] }, status.charAt(0).toUpperCase() + status.slice(1)));
}
