"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var checkbox_1 = require("@/components/ui/checkbox");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var stats_card_1 = require("@/components/ui/stats-card");
function Payroll() {
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var _b = react_1.useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = react_1.useState("all"), statusFilter = _c[0], setStatusFilter = _c[1];
    var _d = react_1.useState("2024-10"), monthFilter = _d[0], setMonthFilter = _d[1];
    var _e = react_1.useState(new Set()), selectedPayrollIds = _e[0], setSelectedPayrollIds = _e[1];
    var _f = react_1.useState("xlsx"), exportFormat = _f[0], setExportFormat = _f[1];
    var _g = react_1.useState(false), isExporting = _g[0], setIsExporting = _g[1];
    var _h = react_1.useState(""), bulkStatusUpdate = _h[0], setBulkStatusUpdate = _h[1];
    var _j = react_1.useState(false), isBulkUpdating = _j[0], setIsBulkUpdating = _j[1];
    var _k = react_1.useState(false), isBulkDeleting = _k[0], setIsBulkDeleting = _k[1];
    // Manual trigger state
    var _l = react_1.useState(false), isProcessingPayroll = _l[0], setIsProcessingPayroll = _l[1];
    var _m = react_1.useState(false), isDispatchingPayslips = _m[0], setIsDispatchingPayslips = _m[1];
    var _o = react_1.useState(new Date().getFullYear()), selectedYear = _o[0], setSelectedYear = _o[1];
    var _p = react_1.useState(new Date().getMonth() + 1), selectedMonth = _p[0], setSelectedMonth = _p[1];
    // Fetch real data from backend
    var _q = trpc_1.trpc.payroll.list.useQuery({}), _r = _q.data, data = _r === void 0 ? [] : _r, isLoading = _q.isLoading;
    var deleteMut = trpc_1.trpc.payroll["delete"].useMutation();
    var updateMut = trpc_1.trpc.payroll.update.useMutation();
    var downloadP9 = trpc_1.trpc.payroll.downloadP9.useMutation();
    var exportMut = trpc_1.trpc.payroll.bulkExport.useMutation();
    var bulkUpdateStatusMut = trpc_1.trpc.payroll.bulkUpdateStatus.useMutation();
    var bulkDeleteMut = trpc_1.trpc.payroll.bulkDelete.useMutation();
    var listQ = trpc_1.trpc.payroll.list;
    var utils = trpc_1.trpc.useUtils();
    // Manual payroll automation triggers
    var processMonthlyMut = trpc_1.trpc.payroll.processMonthly.useMutation();
    var dispatchPayslipsMut = trpc_1.trpc.payroll.dispatchPayslips.useMutation();
    var _s = react_1.useState([]), records = _s[0], setRecords = _s[1];
    react_1.useEffect(function () {
        if (data && Array.isArray(data)) {
            setRecords(data.map(function (r) { return ({
                id: r.id,
                employeeId: r.employeeId,
                employeeName: r.employeeName || '',
                department: r.department || '',
                basicSalary: r.basicSalary,
                allowances: r.allowances || 0,
                deductions: r.deductions || 0,
                netSalary: r.netSalary,
                status: r.status,
                paymentDate: r.paymentDate || '',
                month: r.month || ''
            }); }));
        }
    }, [data]);
    var filteredRecords = records.filter(function (record) {
        var matchesSearch = record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.department.toLowerCase().includes(searchQuery.toLowerCase());
        var matchesStatus = statusFilter === "all" || record.status === statusFilter;
        var matchesMonth = record.month === monthFilter;
        return matchesSearch && matchesStatus && matchesMonth;
    });
    var getStatusVariant = function (status) {
        switch (status) {
            case "paid":
                return "default";
            case "processed":
                return "secondary";
            case "draft":
                return "outline";
            default:
                return "default";
        }
    };
    var getStatusIcon = function (status) {
        switch (status) {
            case "paid":
                return React.createElement(lucide_react_1.CheckCircle2, { className: "h-3 w-3" });
            case "processed":
                return React.createElement(lucide_react_1.Clock, { className: "h-3 w-3" });
            case "draft":
                return React.createElement(lucide_react_1.AlertCircle, { className: "h-3 w-3" });
            default:
                return null;
        }
    };
    var handleMarkPaid = function (id) {
        updateMut.mutate({ id: id, status: "paid" }, {
            onSuccess: function () {
                sonner_1.toast.success("Marked as paid");
                utils.payroll.list.refetch();
            }
        });
    };
    var handleDelete = function (id) {
        if (confirm("Delete this payroll record?")) {
            deleteMut.mutate(id, {
                onSuccess: function () {
                    sonner_1.toast.success("Deleted");
                    utils.payroll.list.refetch();
                }
            });
        }
    };
    var handleDownloadP9 = function (employeeId) {
        downloadP9.mutate({ employeeId: employeeId }, {
            onSuccess: function () {
                sonner_1.toast.success("P9 downloaded");
            }
        });
    };
    var handleExport = function () {
        if (selectedPayrollIds.size === 0) {
            sonner_1.toast.error("Select at least one record to export");
            return;
        }
        setIsExporting(true);
        exportMut.mutate({
            payrollIds: Array.from(selectedPayrollIds),
            format: exportFormat
        }, {
            onSuccess: function (response) {
                // Convert base64 to blob and download
                var binaryString = atob(response.data);
                var bytes = new Uint8Array(binaryString.length);
                for (var i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                var blob = new Blob([bytes], {
                    type: exportFormat === "xlsx"
                        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        : "text/csv"
                });
                // Create download link
                var url = window.URL.createObjectURL(blob);
                var link = document.createElement("a");
                link.href = url;
                link.download = "payroll-export-" + new Date().toISOString().split("T")[0] + "." + exportFormat;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                setSelectedPayrollIds(new Set());
                setIsExporting(false);
                sonner_1.toast.success("Exported " + selectedPayrollIds.size + " records");
            },
            onError: function (error) {
                setIsExporting(false);
                sonner_1.toast.error("Export failed: " + error.message);
            }
        });
    };
    var handleBulkUpdateStatus = function () {
        if (selectedPayrollIds.size === 0 || !bulkStatusUpdate) {
            sonner_1.toast.error("Select records and a status to update");
            return;
        }
        setIsBulkUpdating(true);
        bulkUpdateStatusMut.mutate({
            payrollIds: Array.from(selectedPayrollIds),
            status: bulkStatusUpdate
        }, {
            onSuccess: function () {
                setSelectedPayrollIds(new Set());
                setBulkStatusUpdate("");
                setIsBulkUpdating(false);
                utils.payroll.list.refetch();
                sonner_1.toast.success("Updated status for " + selectedPayrollIds.size + " records");
            },
            onError: function (error) {
                setIsBulkUpdating(false);
                sonner_1.toast.error("Update failed: " + error.message);
            }
        });
    };
    var handleBulkDelete = function () {
        if (selectedPayrollIds.size === 0) {
            sonner_1.toast.error("Select records to delete");
            return;
        }
        if (!confirm("Delete " + selectedPayrollIds.size + " payroll record(s)? This cannot be undone.")) {
            return;
        }
        setIsBulkDeleting(true);
        bulkDeleteMut.mutate({
            payrollIds: Array.from(selectedPayrollIds)
        }, {
            onSuccess: function () {
                setSelectedPayrollIds(new Set());
                setIsBulkDeleting(false);
                utils.payroll.list.refetch();
                sonner_1.toast.success("Deleted " + selectedPayrollIds.size + " records");
            },
            onError: function (error) {
                setIsBulkDeleting(false);
                sonner_1.toast.error("Delete failed: " + error.message);
            }
        });
    };
    var totalGrossPay = filteredRecords.reduce(function (sum, r) { return sum + r.basicSalary + r.allowances; }, 0);
    var totalDeductions = filteredRecords.reduce(function (sum, r) { return sum + r.deductions; }, 0);
    var totalNetPay = filteredRecords.reduce(function (sum, r) { return sum + r.netSalary; }, 0);
    var paidCount = filteredRecords.filter(function (r) { return r.status === "paid"; }).length;
    var handleProcessPayroll = function () {
        setIsProcessingPayroll(true);
        processMonthlyMut.mutate({
            targetYear: selectedYear,
            targetMonth: selectedMonth
        }, {
            onSuccess: function () {
                setIsProcessingPayroll(false);
                utils.payroll.list.refetch();
                sonner_1.toast.success("Payroll processed successfully!");
            },
            onError: function (error) {
                setIsProcessingPayroll(false);
                sonner_1.toast.error("Payroll processing failed: " + error.message);
            }
        });
    };
    var handleDispatchPayslips = function () {
        setIsDispatchingPayslips(true);
        dispatchPayslipsMut.mutate({
            targetYear: selectedYear,
            targetMonth: selectedMonth
        }, {
            onSuccess: function () {
                setIsDispatchingPayslips(false);
                utils.payroll.list.refetch();
                sonner_1.toast.success("Payslips dispatched successfully!");
            },
            onError: function (error) {
                setIsDispatchingPayslips(false);
                sonner_1.toast.error("Payslip dispatch failed: " + error.message);
            }
        });
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Payroll Management", description: "Process and manage employee salaries", icon: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "HR", href: "/hr" },
            { label: "Payroll" },
        ], actions: React.createElement(button_1.Button, { onClick: function () { return setLocation("/payroll/tax-compliance"); }, className: "gap-2", variant: "outline" },
            React.createElement(lucide_react_1.FileText, { className: "h-4 w-4" }),
            "Tax Compliance Reports") },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Gross Pay", value: React.createElement(React.Fragment, null,
                        "Ksh ",
                        (totalGrossPay / 100).toLocaleString()), icon: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Deductions", value: React.createElement(React.Fragment, null,
                        "Ksh ",
                        (totalDeductions / 100).toLocaleString()), icon: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }), color: "border-l-red-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Net Pay", value: React.createElement(React.Fragment, null,
                        "Ksh ",
                        (totalNetPay / 100).toLocaleString()), icon: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }), color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Paid", value: paidCount, icon: React.createElement(lucide_react_1.CheckCircle2, { className: "h-5 w-5" }), color: "border-l-purple-500" })),
            React.createElement(card_1.Card, { className: "border-green-200 dark:border-green-900 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Zap, { className: "h-5 w-5 text-green-600" }),
                        "Payroll Automation"),
                    React.createElement(card_1.CardDescription, null, "Automated payroll processing on the 20th of each month at 08:00 AM EAT \u2022 Automated payslip dispatch on the last day of the month at 23:59 PM EAT")),
                React.createElement(card_1.CardContent, { className: "space-y-4" },
                    React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                        React.createElement("div", { className: "space-y-3 p-3 border rounded-lg bg-white dark:bg-slate-900" },
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement(lucide_react_1.Calendar, { className: "h-4 w-4 text-blue-600" }),
                                React.createElement("h3", { className: "font-semibold text-sm" }, "Process Monthly Payroll")),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Manually trigger payroll processing for a specific month. All active employees will be included and budget costs will be automatically deducted."),
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement(select_1.Select, { value: selectedMonth.toString(), onValueChange: function (val) { return setSelectedMonth(parseInt(val)); } },
                                    React.createElement(select_1.SelectTrigger, { className: "w-24 h-8 text-xs" },
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null, Array.from({ length: 12 }, function (_, i) { return i + 1; }).map(function (month) { return (React.createElement(select_1.SelectItem, { key: month, value: month.toString() }, new Date(2024, month - 1).toLocaleString("en-US", { month: "short" }))); }))),
                                React.createElement(select_1.Select, { value: selectedYear.toString(), onValueChange: function (val) { return setSelectedYear(parseInt(val)); } },
                                    React.createElement(select_1.SelectTrigger, { className: "w-20 h-8 text-xs" },
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null, [2024, 2025, 2026].map(function (year) { return (React.createElement(select_1.SelectItem, { key: year, value: year.toString() }, year)); }))),
                                React.createElement(button_1.Button, { onClick: handleProcessPayroll, disabled: isProcessingPayroll, size: "sm", className: "gap-2 bg-blue-600 hover:bg-blue-700" }, isProcessingPayroll ? (React.createElement(React.Fragment, null,
                                    React.createElement(lucide_react_1.Loader2, { className: "h-3 w-3 animate-spin" }),
                                    "Processing...")) : (React.createElement(React.Fragment, null,
                                    React.createElement(lucide_react_1.Zap, { className: "h-3 w-3" }),
                                    "Process Now"))))),
                        React.createElement("div", { className: "space-y-3 p-3 border rounded-lg bg-white dark:bg-slate-900" },
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement(lucide_react_1.Send, { className: "h-4 w-4 text-emerald-600" }),
                                React.createElement("h3", { className: "font-semibold text-sm" }, "Dispatch Payslips")),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Manually trigger payslip generation and email dispatch to all employees. HTML payslips will be created and sent via email."),
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement(select_1.Select, { value: selectedMonth.toString(), onValueChange: function (val) { return setSelectedMonth(parseInt(val)); } },
                                    React.createElement(select_1.SelectTrigger, { className: "w-24 h-8 text-xs" },
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null, Array.from({ length: 12 }, function (_, i) { return i + 1; }).map(function (month) { return (React.createElement(select_1.SelectItem, { key: month, value: month.toString() }, new Date(2024, month - 1).toLocaleString("en-US", { month: "short" }))); }))),
                                React.createElement(select_1.Select, { value: selectedYear.toString(), onValueChange: function (val) { return setSelectedYear(parseInt(val)); } },
                                    React.createElement(select_1.SelectTrigger, { className: "w-20 h-8 text-xs" },
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null, [2024, 2025, 2026].map(function (year) { return (React.createElement(select_1.SelectItem, { key: year, value: year.toString() }, year)); }))),
                                React.createElement(button_1.Button, { onClick: handleDispatchPayslips, disabled: isDispatchingPayslips, size: "sm", className: "gap-2 bg-emerald-600 hover:bg-emerald-700" }, isDispatchingPayslips ? (React.createElement(React.Fragment, null,
                                    React.createElement(lucide_react_1.Loader2, { className: "h-3 w-3 animate-spin" }),
                                    "Dispatching...")) : (React.createElement(React.Fragment, null,
                                    React.createElement(lucide_react_1.Send, { className: "h-3 w-3" }),
                                    "Send Now")))))),
                    React.createElement("div", { className: "flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded text-xs text-muted-foreground" },
                        React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" }),
                        React.createElement("div", null,
                            React.createElement("strong", null, "Note:"),
                            " The payroll system automatically processes payroll on the 20th of each month at 08:00 AM EAT and dispatches payslips on the last day of the month at 23:59 PM EAT in the Africa/Nairobi timezone. Use the buttons above to manually trigger these processes for a specific month if needed.")))),
            filteredRecords.length > 0 && (React.createElement(card_1.Card, { className: "border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950" },
                React.createElement(card_1.CardContent, { className: "py-4 space-y-4" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("div", { className: "flex items-center gap-3" },
                            React.createElement(checkbox_1.Checkbox, { checked: selectedPayrollIds.size === filteredRecords.length && filteredRecords.length > 0, onCheckedChange: function (checked) {
                                    if (checked) {
                                        setSelectedPayrollIds(new Set(filteredRecords.map(function (r) { return r.id; })));
                                    }
                                    else {
                                        setSelectedPayrollIds(new Set());
                                    }
                                } }),
                            React.createElement("span", { className: "text-sm font-medium" }, selectedPayrollIds.size > 0
                                ? selectedPayrollIds.size + " selected"
                                : "Select records to manage"))),
                    selectedPayrollIds.size > 0 && (React.createElement("div", { className: "space-y-3" },
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement(select_1.Select, { value: bulkStatusUpdate, onValueChange: function (value) {
                                    return setBulkStatusUpdate(value);
                                } },
                                React.createElement(select_1.SelectTrigger, { className: "w-40 bg-white dark:bg-slate-950" },
                                    React.createElement(select_1.SelectValue, { placeholder: "Change status" })),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "draft" }, "Mark as Draft"),
                                    React.createElement(select_1.SelectItem, { value: "processed" }, "Mark as Processed"),
                                    React.createElement(select_1.SelectItem, { value: "paid" }, "Mark as Paid"))),
                            React.createElement(button_1.Button, { onClick: handleBulkUpdateStatus, disabled: isBulkUpdating || !bulkStatusUpdate, variant: "outline", size: "sm", className: "gap-2" }, isBulkUpdating ? (React.createElement(React.Fragment, null,
                                React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin" }),
                                "Updating...")) : ("Update Status"))),
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement(select_1.Select, { value: exportFormat, onValueChange: function (value) { return setExportFormat(value); } },
                                React.createElement(select_1.SelectTrigger, { className: "w-32 bg-white dark:bg-slate-950" },
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "xlsx" }, "Excel (.xlsx)"),
                                    React.createElement(select_1.SelectItem, { value: "csv" }, "CSV (.csv)"))),
                            React.createElement(button_1.Button, { onClick: handleExport, disabled: isExporting, className: "gap-2", size: "sm" }, isExporting ? (React.createElement(React.Fragment, null,
                                React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin" }),
                                "Exporting...")) : (React.createElement(React.Fragment, null,
                                React.createElement(lucide_react_1.FileDown, { className: "h-4 w-4" }),
                                "Export"))),
                            React.createElement(button_1.Button, { onClick: handleBulkDelete, disabled: isBulkDeleting, variant: "destructive", size: "sm", className: "gap-2" }, isBulkDeleting ? (React.createElement(React.Fragment, null,
                                React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin" }),
                                "Deleting...")) : (React.createElement(React.Fragment, null,
                                React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }),
                                "Delete"))))))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Filter Records")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "flex gap-4" },
                        React.createElement(select_1.Select, { value: monthFilter, onValueChange: setMonthFilter },
                            React.createElement(select_1.SelectTrigger, { className: "w-40" },
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "2024-10" }, "October 2024"),
                                React.createElement(select_1.SelectItem, { value: "2024-09" }, "September 2024"),
                                React.createElement(select_1.SelectItem, { value: "2024-08" }, "August 2024"),
                                React.createElement(select_1.SelectItem, { value: "2024-07" }, "July 2024"))),
                        React.createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                            React.createElement(select_1.SelectTrigger, { className: "w-40" },
                                React.createElement(select_1.SelectValue, { placeholder: "All Status" })),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "all" }, "All Status"),
                                React.createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                                React.createElement(select_1.SelectItem, { value: "processed" }, "Processed"),
                                React.createElement(select_1.SelectItem, { value: "paid" }, "Paid"))),
                        React.createElement("div", { className: "relative flex-1 max-w-xs" },
                            React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }),
                            React.createElement(input_1.Input, { placeholder: "Search employees...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-9" }))))),
            React.createElement("div", { className: "grid gap-4" }, isLoading ? (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "py-8 text-center text-muted-foreground" }, "Loading payroll records..."))) : filteredRecords.length === 0 ? (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "py-8 text-center text-muted-foreground" }, "No payroll records found."))) : (filteredRecords.map(function (record) { return (React.createElement(card_1.Card, { key: record.id },
                React.createElement(card_1.CardContent, { className: "py-4" },
                    React.createElement("div", { className: "flex justify-between items-start gap-4" },
                        React.createElement(checkbox_1.Checkbox, { checked: selectedPayrollIds.has(record.id), onCheckedChange: function (checked) {
                                var newSet = new Set(selectedPayrollIds);
                                if (checked) {
                                    newSet.add(record.id);
                                }
                                else {
                                    newSet["delete"](record.id);
                                }
                                setSelectedPayrollIds(newSet);
                            } }),
                        React.createElement("div", { className: "flex-1" },
                            React.createElement("div", { className: "font-medium text-lg mb-2" },
                                record.employeeName,
                                React.createElement("span", { className: "text-sm text-muted-foreground ml-2" },
                                    "(",
                                    record.employeeId,
                                    ")")),
                            React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-3" },
                                React.createElement("div", null,
                                    React.createElement("span", { className: "text-muted-foreground" }, "Department:"),
                                    React.createElement("div", { className: "font-medium" }, record.department)),
                                React.createElement("div", null,
                                    React.createElement("span", { className: "text-muted-foreground" }, "Month:"),
                                    React.createElement("div", { className: "font-medium" }, record.month)),
                                React.createElement("div", null,
                                    React.createElement("span", { className: "text-muted-foreground" }, "Basic Salary:"),
                                    React.createElement("div", { className: "font-medium" },
                                        "Ksh ",
                                        (record.basicSalary / 100).toLocaleString())),
                                React.createElement("div", null,
                                    React.createElement("span", { className: "text-muted-foreground" }, "Allowances:"),
                                    React.createElement("div", { className: "font-medium text-green-600" },
                                        "+Ksh ",
                                        (record.allowances / 100).toLocaleString())),
                                React.createElement("div", null,
                                    React.createElement("span", { className: "text-muted-foreground" }, "Deductions:"),
                                    React.createElement("div", { className: "font-medium text-red-600" },
                                        "-Ksh ",
                                        (record.deductions / 100).toLocaleString())),
                                React.createElement("div", null,
                                    React.createElement("span", { className: "text-muted-foreground" }, "Net Salary:"),
                                    React.createElement("div", { className: "font-bold text-lg" },
                                        "Ksh ",
                                        (record.netSalary / 100).toLocaleString()))),
                            React.createElement(badge_1.Badge, { variant: getStatusVariant(record.status), className: "gap-1" },
                                getStatusIcon(record.status),
                                record.status)),
                        React.createElement("div", { className: "flex flex-col gap-2" },
                            React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { return setLocation("/payroll/" + record.id); } },
                                React.createElement(lucide_react_1.Eye, { className: "h-4 w-4 mr-2" }),
                                "View"),
                            record.status !== "paid" && (React.createElement(button_1.Button, { size: "sm", onClick: function () { return handleMarkPaid(record.id); } }, "Mark Paid")),
                            React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { return handleDownloadP9(record.employeeId); } },
                                React.createElement(lucide_react_1.Download, { className: "h-4 w-4 mr-2" }),
                                "P9"),
                            React.createElement(button_1.Button, { size: "sm", variant: "destructive", onClick: function () { return handleDelete(record.id); } },
                                React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))))))); }))))));
}
exports["default"] = Payroll;
