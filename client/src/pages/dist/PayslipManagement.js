"use strict";
exports.__esModule = true;
var react_1 = require("react");
var react_to_print_1 = require("react-to-print");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var table_1 = require("@/components/ui/table");
var select_1 = require("@/components/ui/select");
var dialog_1 = require("@/components/ui/dialog");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var PayslipTemplate_1 = require("@/components/PayslipTemplate");
var trpc_1 = require("@/lib/trpc");
var currency_1 = require("@/lib/currency");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
function PayslipManagement() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    var _l = currency_1.useCurrencySettings(), symbol = _l.symbol, position = _l.position;
    var _m = react_1.useState(""), searchQuery = _m[0], setSearchQuery = _m[1];
    var _o = react_1.useState(new Date().toISOString().slice(0, 7)), monthFilter = _o[0], setMonthFilter = _o[1];
    var _p = react_1.useState(null), selectedPayslip = _p[0], setSelectedPayslip = _p[1];
    var _q = react_1.useState(false), viewDialog = _q[0], setViewDialog = _q[1];
    var _r = react_1.useState(false), resendDialog = _r[0], setResendDialog = _r[1];
    var _s = react_1.useState(""), resendEmail = _s[0], setResendEmail = _s[1];
    var _t = react_1.useState(""), resendMessage = _t[0], setResendMessage = _t[1];
    var printRef = react_1.useRef(null);
    // Fetch payslips
    var _u = trpc_1.trpc.payroll.payslips.list.useQuery({}), _v = _u.data, payslips = _v === void 0 ? [] : _v, isLoading = _u.isLoading, refetch = _u.refetch;
    // TRPC mutations
    var resendMutation = trpc_1.trpc.payroll.payslips.resend.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Payslip sent successfully");
            setResendDialog(false);
            setResendEmail("");
            setResendMessage("");
        },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var archiveMutation = trpc_1.trpc.payroll.payslips.archive.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Payslip archived successfully");
            refetch();
        },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var handlePrint = react_to_print_1.useReactToPrint({
        content: function () { return printRef.current; },
        documentTitle: "Payslip-" + (selectedPayslip === null || selectedPayslip === void 0 ? void 0 : selectedPayslip.employeeId) + "-" + monthFilter
    });
    var handleDownload = function () {
        handlePrint();
    };
    var fmt = function (amount) {
        var value = amount / 100;
        if (position === "prefix")
            return "" + symbol + value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return "" + value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + symbol;
    };
    // Filter payslips
    var filteredPayslips = react_1.useMemo(function () {
        return payslips.filter(function (p) {
            var _a, _b, _c, _d, _e;
            var matchesSearch = ((_b = (_a = p.employee) === null || _a === void 0 ? void 0 : _a.firstName) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(searchQuery.toLowerCase())) || ((_d = (_c = p.employee) === null || _c === void 0 ? void 0 : _c.lastName) === null || _d === void 0 ? void 0 : _d.toLowerCase().includes(searchQuery.toLowerCase())) || ((_e = p.employeeId) === null || _e === void 0 ? void 0 : _e.toLowerCase().includes(searchQuery.toLowerCase()));
            var payslipMonth = new Date(p.payDate).toISOString().slice(0, 7);
            var matchesMonth = monthFilter === "all" || payslipMonth === monthFilter;
            return matchesSearch && matchesMonth;
        });
    }, [payslips, searchQuery, monthFilter]);
    // Transform payslip data for template
    var payslipData = selectedPayslip ? {
        id: selectedPayslip.id,
        employeeName: ((_a = selectedPayslip.employee) === null || _a === void 0 ? void 0 : _a.firstName) + " " + ((_b = selectedPayslip.employee) === null || _b === void 0 ? void 0 : _b.lastName),
        employeeId: ((_c = selectedPayslip.employee) === null || _c === void 0 ? void 0 : _c.id) || "",
        department: ((_d = selectedPayslip.employee) === null || _d === void 0 ? void 0 : _d.department) || "N/A",
        position: ((_e = selectedPayslip.employee) === null || _e === void 0 ? void 0 : _e.position) || "N/A",
        payPeriod: {
            start: new Date(selectedPayslip.startDate),
            end: new Date(selectedPayslip.endDate)
        },
        basicSalary: selectedPayslip.basicSalary || 0,
        allowances: (selectedPayslip.allowances || []).map(function (a) { return ({
            name: a.name,
            amount: a.amount
        }); }),
        deductions: (selectedPayslip.deductions || []).map(function (d) { return ({
            name: d.name,
            amount: d.amount
        }); }),
        netSalary: selectedPayslip.netSalary || 0,
        bankAccount: (_f = selectedPayslip.employee) === null || _f === void 0 ? void 0 : _f.bankAccountNumber,
        companyName: "Kiini",
        companyAddress: "Global Operations",
        payDate: new Date(selectedPayslip.payDate),
        totalEarnings: selectedPayslip.totalEarnings || selectedPayslip.basicSalary,
        totalDeductions: selectedPayslip.totalDeductions || 0
    } : null;
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Payslip Management" },
        React.createElement("div", { className: "max-w-7xl mx-auto space-y-6" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Find Payslips"),
                    React.createElement(card_1.CardDescription, null, "View, download, or resend employee payslips")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "flex flex-col sm:flex-row gap-4" },
                        React.createElement("div", { className: "flex-1 relative" },
                            React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                            React.createElement(input_1.Input, { placeholder: "Search employee name or ID...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-9" })),
                        React.createElement(select_1.Select, { value: monthFilter, onValueChange: setMonthFilter },
                            React.createElement(select_1.SelectTrigger, { className: "w-48" },
                                React.createElement(lucide_react_1.Calendar, { className: "h-4 w-4 mr-2" }),
                                React.createElement(select_1.SelectValue, { placeholder: "Select month" })),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "all" }, "All Months"),
                                Array.from({ length: 12 }, function (_, i) {
                                    var d = new Date();
                                    d.setMonth(d.getMonth() - i);
                                    var value = d.toISOString().slice(0, 7);
                                    return (React.createElement(select_1.SelectItem, { key: value, value: value }, d.toLocaleDateString("en-GB", { year: "numeric", month: "long" })));
                                })))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null,
                        "Payslips (",
                        filteredPayslips.length,
                        ")")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "overflow-x-auto" },
                        React.createElement(table_1.Table, null,
                            React.createElement(table_1.TableHeader, null,
                                React.createElement(table_1.TableRow, null,
                                    React.createElement(table_1.TableHead, null, "Employee"),
                                    React.createElement(table_1.TableHead, null, "Period"),
                                    React.createElement(table_1.TableHead, null, "Basic Salary"),
                                    React.createElement(table_1.TableHead, null, "Deductions"),
                                    React.createElement(table_1.TableHead, null, "Net Salary"),
                                    React.createElement(table_1.TableHead, null, "Status"),
                                    React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                            React.createElement(table_1.TableBody, null, isLoading ? (React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableCell, { colSpan: 7, className: "text-center py-8" },
                                    React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin mx-auto" })))) : filteredPayslips.length === 0 ? (React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableCell, { colSpan: 7, className: "text-center py-8 text-muted-foreground" }, "No payslips found"))) : (filteredPayslips.map(function (payslip) {
                                var _a, _b;
                                return (React.createElement(table_1.TableRow, { key: payslip.id },
                                    React.createElement(table_1.TableCell, { className: "font-medium" }, (_a = payslip.employee) === null || _a === void 0 ? void 0 :
                                        _a.firstName,
                                        " ", (_b = payslip.employee) === null || _b === void 0 ? void 0 :
                                        _b.lastName),
                                    React.createElement(table_1.TableCell, null,
                                        new Date(payslip.startDate).toLocaleDateString("en-GB", { month: "short", day: "2-digit" }),
                                        " -",
                                        " ",
                                        new Date(payslip.endDate).toLocaleDateString("en-GB", { month: "short", day: "2-digit", year: "numeric" })),
                                    React.createElement(table_1.TableCell, null, fmt(payslip.basicSalary || 0)),
                                    React.createElement(table_1.TableCell, null, fmt(payslip.totalDeductions || 0)),
                                    React.createElement(table_1.TableCell, { className: "font-semibold text-green-700 dark:text-green-400" }, fmt(payslip.netSalary || 0)),
                                    React.createElement(table_1.TableCell, null,
                                        React.createElement(badge_1.Badge, { variant: "outline", className: payslip.archived ? "bg-gray-100" : "bg-green-50 text-green-700" }, payslip.archived ? "Archived" : "Active")),
                                    React.createElement(table_1.TableCell, { className: "text-right space-x-2" },
                                        React.createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function () {
                                                setSelectedPayslip(payslip);
                                                setViewDialog(true);
                                            }, title: "View payslip" },
                                            React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                        React.createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function () {
                                                var _a;
                                                setSelectedPayslip(payslip);
                                                setResendEmail(((_a = payslip.employee) === null || _a === void 0 ? void 0 : _a.email) || "");
                                                setResendDialog(true);
                                            }, title: "Resend payslip" },
                                            React.createElement(lucide_react_1.Mail, { className: "h-4 w-4" })),
                                        !payslip.archived && (React.createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function () { return archiveMutation.mutate({ id: payslip.id }); }, title: "Archive payslip" },
                                            React.createElement(lucide_react_1.Archive, { className: "h-4 w-4" }))))));
                            }))))))),
            React.createElement(dialog_1.Dialog, { open: viewDialog, onOpenChange: setViewDialog },
                React.createElement(dialog_1.DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-y-auto" },
                    React.createElement(dialog_1.DialogHeader, null,
                        React.createElement(dialog_1.DialogTitle, null, "Payslip Preview"),
                        React.createElement(dialog_1.DialogDescription, null, (_g = selectedPayslip === null || selectedPayslip === void 0 ? void 0 : selectedPayslip.employee) === null || _g === void 0 ? void 0 :
                            _g.firstName,
                            " ", (_h = selectedPayslip === null || selectedPayslip === void 0 ? void 0 : selectedPayslip.employee) === null || _h === void 0 ? void 0 :
                            _h.lastName,
                            " - ",
                            monthFilter)),
                    payslipData && (React.createElement("div", null,
                        React.createElement("div", { className: "mb-4" },
                            React.createElement(PayslipTemplate_1.PayslipTemplate, { ref: printRef, data: payslipData })),
                        React.createElement("div", { className: "flex gap-2 justify-end" },
                            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setViewDialog(false); } }, "Close"),
                            React.createElement(button_1.Button, { onClick: handleDownload, className: "gap-2" },
                                React.createElement(lucide_react_1.Download, { className: "h-4 w-4" }),
                                "Download PDF")))))),
            React.createElement(dialog_1.Dialog, { open: resendDialog, onOpenChange: setResendDialog },
                React.createElement(dialog_1.DialogContent, null,
                    React.createElement(dialog_1.DialogHeader, null,
                        React.createElement(dialog_1.DialogTitle, null, "Resend Payslip"),
                        React.createElement(dialog_1.DialogDescription, null,
                            "Send payslip to ", (_j = selectedPayslip === null || selectedPayslip === void 0 ? void 0 : selectedPayslip.employee) === null || _j === void 0 ? void 0 :
                            _j.firstName,
                            " ", (_k = selectedPayslip === null || selectedPayslip === void 0 ? void 0 : selectedPayslip.employee) === null || _k === void 0 ? void 0 :
                            _k.lastName)),
                    React.createElement("div", { className: "space-y-4 py-4" },
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "email" }, "Email Address *"),
                            React.createElement(input_1.Input, { id: "email", type: "email", value: resendEmail, onChange: function (e) { return setResendEmail(e.target.value); }, className: "mt-1" })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "message" }, "Message (Optional)"),
                            React.createElement(textarea_1.Textarea, { id: "message", placeholder: "Add a custom message...", value: resendMessage, onChange: function (e) { return setResendMessage(e.target.value); }, rows: 3, className: "mt-1" }))),
                    React.createElement(dialog_1.DialogFooter, null,
                        React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setResendDialog(false); } }, "Cancel"),
                        React.createElement(button_1.Button, { onClick: function () {
                                if (!resendEmail.trim()) {
                                    sonner_1.toast.error("Please enter an email address");
                                    return;
                                }
                                resendMutation.mutate({
                                    id: selectedPayslip === null || selectedPayslip === void 0 ? void 0 : selectedPayslip.id,
                                    email: resendEmail,
                                    message: resendMessage
                                });
                            }, disabled: resendMutation.isPending }, resendMutation.isPending ? "Sending..." : "Send Payslip")))))));
}
exports["default"] = PayslipManagement;
