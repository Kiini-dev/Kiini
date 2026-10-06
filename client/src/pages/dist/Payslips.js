"use strict";
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var sonner_1 = require("sonner");
var date_fns_1 = require("date-fns");
var stats_card_1 = require("@/components/ui/stats-card");
var currency_1 = require("@/lib/currency");
function Payslips() {
    var _a, _b, _c;
    permissions_1.useRequireFeature("hr:payroll:view");
    var formatAmount = currency_1.useCurrencySettings().formatAmount;
    var _d = react_1.useState(""), search = _d[0], setSearch = _d[1];
    var _e = react_1.useState("all"), statusFilter = _e[0], setStatusFilter = _e[1];
    var _f = react_1.useState(""), periodFilter = _f[0], setPeriodFilter = _f[1];
    var _g = react_1.useState(false), showGenerate = _g[0], setShowGenerate = _g[1];
    var _h = react_1.useState({ payPeriod: "", payDate: "" }), generateForm = _h[0], setGenerateForm = _h[1];
    var _j = react_1.useState(null), selectedPayslip = _j[0], setSelectedPayslip = _j[1];
    var _k = react_1.useState(null), deleteId = _k[0], setDeleteId = _k[1];
    var _l = react_1.useState([]), selectedIds = _l[0], setSelectedIds = _l[1];
    var payslips = trpc_1.trpc.payslips.list.useQuery({
        status: statusFilter !== "all" ? statusFilter : undefined,
        payPeriod: periodFilter || undefined
    });
    var payslipDetail = trpc_1.trpc.payslips.getById.useQuery({ id: selectedPayslip }, { enabled: !!selectedPayslip });
    var utils = trpc_1.trpc.useUtils();
    var generate = trpc_1.trpc.payslips.generate.useMutation({
        onSuccess: function (data) {
            sonner_1.toast.success("Generated " + data.generated + " payslips");
            if (data.errors.length)
                data.errors.forEach(function (e) { return sonner_1.toast.error(e); });
            setShowGenerate(false);
            setGenerateForm({ payPeriod: "", payDate: "" });
            utils.payslips.list.invalidate();
        },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var sendPayslips = trpc_1.trpc.payslips.sendPayslips.useMutation({
        onSuccess: function (data) {
            sonner_1.toast.success("Sent " + data.sent + "/" + data.total + " payslips");
            if (data.errors.length)
                data.errors.forEach(function (e) { return sonner_1.toast.error(e); });
            setSelectedIds([]);
            utils.payslips.list.invalidate();
        },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var deletePayslip = trpc_1.trpc.payslips["delete"].useMutation({
        onSuccess: function () { sonner_1.toast.success("Deleted"); setDeleteId(null); utils.payslips.list.invalidate(); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var data = (payslips.data || []);
    var filtered = data.filter(function (p) {
        return !search || (p.firstName + " " + p.lastName).toLowerCase().includes(search.toLowerCase());
    });
    var stats = {
        total: data.length,
        draft: data.filter(function (p) { return p.status === "draft"; }).length,
        generated: data.filter(function (p) { return p.status === "generated"; }).length,
        sent: data.filter(function (p) { return p.status === "sent"; }).length
    };
    var toggleSelect = function (id) {
        setSelectedIds(function (prev) { return prev.includes(id) ? prev.filter(function (i) { return i !== id; }) : __spreadArrays(prev, [id]); });
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Payslips", description: "Generate and send employee payslips", icon: lucide_react_1.FileText, breadcrumbs: [{ label: "HR", href: "/employees" }, { label: "Payroll", href: "/payroll" }, { label: "Payslips" }] },
        React.createElement("div", { className: "grid gap-4 md:grid-cols-4 mb-6" },
            React.createElement(stats_card_1.StatsCard, { label: "Total Payslips", value: stats.total, icon: React.createElement(lucide_react_1.FileText, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
            React.createElement(stats_card_1.StatsCard, { label: "Generated", value: stats.generated, icon: React.createElement(lucide_react_1.FileCheck, { className: "h-5 w-5" }), color: "border-l-green-500" }),
            React.createElement(stats_card_1.StatsCard, { label: "Sent", value: stats.sent, icon: React.createElement(lucide_react_1.Send, { className: "h-5 w-5" }), color: "border-l-purple-500" }),
            React.createElement(stats_card_1.StatsCard, { label: "Draft", value: stats.draft, icon: React.createElement(lucide_react_1.Clock, { className: "h-5 w-5" }), color: "border-l-orange-500" })),
        React.createElement("div", { className: "flex items-center gap-3 mb-4 flex-wrap" },
            React.createElement("div", { className: "relative flex-1 max-w-sm" },
                React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                React.createElement(input_1.Input, { placeholder: "Search employees...", value: search, onChange: function (e) { return setSearch(e.target.value); }, className: "pl-9" })),
            React.createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                React.createElement(select_1.SelectTrigger, { className: "w-[140px]" },
                    React.createElement(select_1.SelectValue, { placeholder: "Status" })),
                React.createElement(select_1.SelectContent, null,
                    React.createElement(select_1.SelectItem, { value: "all" }, "All Status"),
                    React.createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                    React.createElement(select_1.SelectItem, { value: "generated" }, "Generated"),
                    React.createElement(select_1.SelectItem, { value: "sent" }, "Sent"),
                    React.createElement(select_1.SelectItem, { value: "viewed" }, "Viewed"))),
            React.createElement(input_1.Input, { type: "month", value: periodFilter, onChange: function (e) { return setPeriodFilter(e.target.value); }, className: "w-[180px]", placeholder: "Pay Period" }),
            selectedIds.length > 0 && (React.createElement(button_1.Button, { variant: "secondary", onClick: function () { return sendPayslips.mutate({ payslipIds: selectedIds }); }, disabled: sendPayslips.isPending },
                React.createElement(lucide_react_1.Send, { className: "h-4 w-4 mr-2" }),
                " Send Selected (",
                selectedIds.length,
                ")")),
            React.createElement(button_1.Button, { onClick: function () { return setShowGenerate(true); } },
                React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4 mr-2" }),
                " Generate Payslips")),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardContent, { className: "p-0" }, payslips.isLoading ? (React.createElement("div", { className: "flex justify-center p-8" },
                React.createElement(spinner_1.Spinner, null))) : (React.createElement(table_1.Table, null,
                React.createElement(table_1.TableHeader, null,
                    React.createElement(table_1.TableRow, null,
                        React.createElement(table_1.TableHead, { className: "w-8" },
                            React.createElement("input", { type: "checkbox", onChange: function (e) { return setSelectedIds(e.target.checked ? filtered.map(function (p) { return p.id; }) : []); }, checked: selectedIds.length === filtered.length && filtered.length > 0 })),
                        React.createElement(table_1.TableHead, null, "Employee"),
                        React.createElement(table_1.TableHead, null, "Period"),
                        React.createElement(table_1.TableHead, null, "Pay Date"),
                        React.createElement(table_1.TableHead, { className: "text-right" }, "Gross Pay"),
                        React.createElement(table_1.TableHead, { className: "text-right" }, "Deductions"),
                        React.createElement(table_1.TableHead, { className: "text-right" }, "Net Pay"),
                        React.createElement(table_1.TableHead, null, "Status"),
                        React.createElement(table_1.TableHead, null, "Actions"))),
                React.createElement(table_1.TableBody, null, filtered.length === 0 ? (React.createElement(table_1.TableRow, null,
                    React.createElement(table_1.TableCell, { colSpan: 9, className: "text-center py-8 text-muted-foreground" }, "No payslips found. Generate payslips for a pay period."))) : filtered.map(function (p) { return (React.createElement(table_1.TableRow, { key: p.id },
                    React.createElement(table_1.TableCell, null,
                        React.createElement("input", { type: "checkbox", checked: selectedIds.includes(p.id), onChange: function () { return toggleSelect(p.id); } })),
                    React.createElement(table_1.TableCell, { className: "font-medium" },
                        p.firstName,
                        " ",
                        p.lastName,
                        React.createElement("br", null),
                        React.createElement("span", { className: "text-xs text-muted-foreground" }, p.employeeNumber)),
                    React.createElement(table_1.TableCell, null, p.payPeriod),
                    React.createElement(table_1.TableCell, null, p.payDate ? date_fns_1.format(new Date(p.payDate), "MMM d, yyyy") : "-"),
                    React.createElement(table_1.TableCell, { className: "text-right text-green-600" }, formatAmount(p.grossPay || 0)),
                    React.createElement(table_1.TableCell, { className: "text-right text-red-600" }, formatAmount(p.totalDeductions || 0)),
                    React.createElement(table_1.TableCell, { className: "text-right font-semibold" }, formatAmount(p.netPay || 0)),
                    React.createElement(table_1.TableCell, null,
                        React.createElement(badge_1.Badge, { variant: p.status === "sent" ? "default" : p.status === "generated" ? "secondary" : "outline" }, p.status)),
                    React.createElement(table_1.TableCell, { className: "flex gap-1" },
                        React.createElement(button_1.Button, { size: "icon", variant: "ghost", onClick: function () { return setSelectedPayslip(p.id); }, title: "View" },
                            React.createElement(lucide_react_1.FileText, { className: "h-4 w-4" })),
                        React.createElement(button_1.Button, { size: "icon", variant: "ghost", onClick: function () { return sendPayslips.mutate({ payslipIds: [p.id] }); }, title: "Send" },
                            React.createElement(lucide_react_1.Send, { className: "h-4 w-4" })),
                        React.createElement(button_1.Button, { size: "icon", variant: "ghost", className: "text-destructive", onClick: function () { return setDeleteId(p.id); }, title: "Delete" },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))))); })))))),
        React.createElement(dialog_1.Dialog, { open: !!selectedPayslip, onOpenChange: function () { return setSelectedPayslip(null); } },
            React.createElement(dialog_1.DialogContent, { className: "max-w-lg" },
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "Payslip Details"),
                    React.createElement(dialog_1.DialogDescription, null, (_a = payslipDetail.data) === null || _a === void 0 ? void 0 :
                        _a.firstName,
                        " ", (_b = payslipDetail.data) === null || _b === void 0 ? void 0 :
                        _b.lastName,
                        " - ", (_c = payslipDetail.data) === null || _c === void 0 ? void 0 :
                        _c.payPeriod)),
                payslipDetail.isLoading ? React.createElement(spinner_1.Spinner, null) : payslipDetail.data && (React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", { className: "grid grid-cols-2 gap-2 text-sm" },
                        React.createElement("div", null, "Employee #"),
                        React.createElement("div", { className: "font-medium" }, payslipDetail.data.employeeNumber),
                        React.createElement("div", null, "Department"),
                        React.createElement("div", { className: "font-medium" }, payslipDetail.data.department),
                        React.createElement("div", null, "Position"),
                        React.createElement("div", { className: "font-medium" }, payslipDetail.data.position),
                        React.createElement("div", null, "Tax ID"),
                        React.createElement("div", { className: "font-medium" }, payslipDetail.data.taxId || "-"),
                        React.createElement("div", null, "NHIF #"),
                        React.createElement("div", { className: "font-medium" }, payslipDetail.data.nhifNumber || "-"),
                        React.createElement("div", null, "NSSF #"),
                        React.createElement("div", { className: "font-medium" }, payslipDetail.data.nssfNumber || "-")),
                    React.createElement("hr", null),
                    React.createElement("div", { className: "space-y-1" },
                        React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", null, "Basic Salary"),
                            React.createElement("span", { className: "font-medium" }, formatAmount(payslipDetail.data.basicSalary || 0))),
                        (function () {
                            try {
                                var data_1 = JSON.parse(payslipDetail.data.allowancesBreakdown || "[]");
                                return Array.isArray(data_1) ? data_1 : [];
                            }
                            catch (_a) {
                                return [];
                            }
                        })().map(function (a, i) { return (React.createElement("div", { key: i, className: "flex justify-between text-green-600" },
                            React.createElement("span", null, a.name),
                            React.createElement("span", null,
                                "+ ",
                                formatAmount(a.amount)))); }),
                        React.createElement("div", { className: "flex justify-between font-semibold border-t pt-1" },
                            React.createElement("span", null, "Gross Pay"),
                            React.createElement("span", null, formatAmount(payslipDetail.data.grossPay || 0)))),
                    React.createElement("div", { className: "space-y-1" },
                        (function () {
                            try {
                                var data_2 = JSON.parse(payslipDetail.data.deductionsBreakdown || "[]");
                                return Array.isArray(data_2) ? data_2 : [];
                            }
                            catch (_a) {
                                return [];
                            }
                        })().map(function (d, i) { return (React.createElement("div", { key: i, className: "flex justify-between text-red-600" },
                            React.createElement("span", null, d.name),
                            React.createElement("span", null,
                                "- ",
                                formatAmount(d.amount)))); }),
                        React.createElement("div", { className: "flex justify-between font-semibold border-t pt-1" },
                            React.createElement("span", null, "Total Deductions"),
                            React.createElement("span", { className: "text-red-600" }, formatAmount(payslipDetail.data.totalDeductions || 0)))),
                    React.createElement("div", { className: "flex justify-between text-lg font-bold bg-muted p-3 rounded-lg" },
                        React.createElement("span", null, "Net Pay"),
                        React.createElement("span", null, formatAmount(payslipDetail.data.netPay || 0))))))),
        React.createElement(dialog_1.Dialog, { open: showGenerate, onOpenChange: setShowGenerate },
            React.createElement(dialog_1.DialogContent, null,
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "Generate Payslips"),
                    React.createElement(dialog_1.DialogDescription, null, "Generate payslips for all active employees for a pay period")),
                React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", null,
                        React.createElement("label", { className: "text-sm font-medium" }, "Pay Period"),
                        React.createElement(input_1.Input, { type: "month", value: generateForm.payPeriod, onChange: function (e) { return setGenerateForm(function (p) { return (__assign(__assign({}, p), { payPeriod: e.target.value })); }); } })),
                    React.createElement("div", null,
                        React.createElement("label", { className: "text-sm font-medium" }, "Pay Date"),
                        React.createElement(input_1.Input, { type: "date", value: generateForm.payDate, onChange: function (e) { return setGenerateForm(function (p) { return (__assign(__assign({}, p), { payDate: e.target.value })); }); } })),
                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "This will calculate PAYE, NHIF/SHIF, NSSF, and Housing Levy for all active employees using Kenyan tax bands."),
                    React.createElement(button_1.Button, { className: "w-full", disabled: !generateForm.payPeriod || !generateForm.payDate || generate.isPending, onClick: function () { return generate.mutate(generateForm); } },
                        generate.isPending ? React.createElement(spinner_1.Spinner, { className: "mr-2" }) : null,
                        " Generate Payslips")))),
        React.createElement(alert_dialog_1.AlertDialog, { open: !!deleteId, onOpenChange: function () { return setDeleteId(null); } },
            React.createElement(alert_dialog_1.AlertDialogContent, null,
                React.createElement(alert_dialog_1.AlertDialogTitle, null, "Delete Payslip?"),
                React.createElement(alert_dialog_1.AlertDialogDescription, null, "This action cannot be undone."),
                React.createElement("div", { className: "flex justify-end gap-2" },
                    React.createElement(alert_dialog_1.AlertDialogCancel, null, "Cancel"),
                    React.createElement(alert_dialog_1.AlertDialogAction, { onClick: function () { return deleteId && deletePayslip.mutate({ id: deleteId }); } }, "Delete"))))));
}
exports["default"] = Payslips;
