"use strict";
/**
 * PayslipDocument — Standard international payslip viewer
 *
 * Design follows ISO/international payslip standards:
 *   - Company header with branding
 *   - Employee information grid
 *   - Earnings breakdown
 *   - Deductions breakdown
 *   - Net pay summary (prominent)
 *   - Bank / payment details
 *   - Footer with certification
 */
exports.__esModule = true;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
function fmt(val) {
    return Math.round(val !== null && val !== void 0 ? val : 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function periodLabel(payPeriod) {
    if (!payPeriod)
        return "";
    var _a = payPeriod.split("-").map(Number), y = _a[0], m = _a[1];
    return new Date(y, m - 1, 1).toLocaleString("en-KE", { month: "long", year: "numeric" });
}
var STATUS_COLORS = {
    generated: "bg-blue-100 text-blue-700",
    sent: "bg-green-100 text-green-700",
    viewed: "bg-purple-100 text-purple-700",
    draft: "bg-gray-100 text-gray-600"
};
function PayslipDocument(_a) {
    var _b, _c;
    var payslip = _a.payslip, onClose = _a.onClose;
    var printRef = react_1.useRef(null);
    if (!payslip)
        return null;
    var allowances = (function () { try {
        return JSON.parse(payslip.allowancesBreakdown || "[]");
    }
    catch (_a) {
        return [];
    } })();
    var deductions = (function () { try {
        return JSON.parse(payslip.deductionsBreakdown || "[]");
    }
    catch (_a) {
        return [];
    } })();
    var period = periodLabel(payslip.payPeriod);
    var statusCls = (_b = STATUS_COLORS[payslip.status]) !== null && _b !== void 0 ? _b : STATUS_COLORS.draft;
    function handlePrint() {
        var el = printRef.current;
        if (!el)
            return;
        var printWindow = window.open("", "_blank", "width=800,height=900");
        if (!printWindow)
            return;
        printWindow.document.write("\n      <!DOCTYPE html><html><head>\n        <meta charset=\"UTF-8\">\n        <title>Payslip \u2013 " + period + "</title>\n        <style>\n          * { box-sizing: border-box; margin: 0; padding: 0; }\n          body { font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #111; background: #fff; }\n          @media print { @page { size: A4; margin: 15mm; } }\n          .header { background: linear-gradient(135deg,#1d4ed8,#7c3aed); color: #fff; padding: 24px 32px; }\n          .header h1 { font-size: 22px; letter-spacing: 2px; margin-bottom: 4px; }\n          .header p { opacity: .85; font-size: 13px; }\n          .section { padding: 16px 32px; }\n          .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 8px; font-weight: 600; }\n          table { width: 100%; border-collapse: collapse; }\n          th { text-align: left; padding: 8px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: .5px; }\n          td { padding: 7px 12px; border-bottom: 1px solid #f3f4f6; }\n          td.amt { text-align: right; }\n          .earnings-head { background: #eff6ff; color: #3b82f6; }\n          .deductions-head { background: #fef2f2; color: #dc2626; }\n          .total-row { font-weight: 700; }\n          .net-pay { background: linear-gradient(135deg,#1d4ed8,#7c3aed); color: #fff; padding: 18px 32px; display: flex; justify-content: space-between; align-items: center; }\n          .net-pay .label { font-size: 15px; font-weight: 600; }\n          .net-pay .amount { font-size: 26px; font-weight: 800; }\n          .footer { background: #f8fafc; padding: 12px 32px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; }\n          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 16px; }\n          .info-item label { font-size: 10px; text-transform: uppercase; color: #9ca3af; display: block; }\n          .info-item span { font-size: 13px; color: #111; font-weight: 500; }\n          .divider { border: none; border-top: 1px solid #e5e7eb; margin: 0; }\n        </style>\n      </head><body>" + el.innerHTML + "</body></html>\n    ");
        printWindow.document.close();
        printWindow.focus();
        setTimeout(function () { printWindow.print(); printWindow.close(); }, 300);
    }
    function handleDownload() {
        // Browser print-to-PDF fallback
        handlePrint();
    }
    return (React.createElement("div", { className: "flex flex-col max-h-[90vh]" },
        React.createElement("div", { className: "flex items-center justify-between px-4 py-3 border-b bg-gray-50 rounded-t-lg" },
            React.createElement("div", { className: "flex items-center gap-3" },
                React.createElement("span", { className: "font-semibold text-gray-800" },
                    "Payslip \u2014 ",
                    period),
                React.createElement("span", { className: "px-2 py-0.5 rounded-full text-xs font-medium " + statusCls }, payslip.status)),
            React.createElement("div", { className: "flex items-center gap-2" },
                React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: handlePrint, className: "gap-1.5 text-xs" },
                    React.createElement(lucide_react_1.Printer, { className: "h-3.5 w-3.5" }),
                    " Print"),
                React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: handleDownload, className: "gap-1.5 text-xs" },
                    React.createElement(lucide_react_1.Download, { className: "h-3.5 w-3.5" }),
                    " Save PDF"),
                onClose && (React.createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: onClose },
                    React.createElement(lucide_react_1.X, { className: "h-4 w-4" }))))),
        React.createElement("div", { className: "overflow-y-auto flex-1 bg-white" },
            React.createElement("div", { ref: printRef, className: "max-w-2xl mx-auto shadow-sm border border-gray-100 rounded-b-lg overflow-hidden" },
                React.createElement("div", { className: "bg-gradient-to-r from-blue-700 to-purple-700 text-white px-8 py-6" },
                    React.createElement("div", { className: "flex items-start justify-between" },
                        React.createElement("div", null,
                            React.createElement("h1", { className: "text-xl font-bold tracking-widest uppercase" }, "Payslip"),
                            React.createElement("p", { className: "text-blue-100 text-sm mt-1" }, period)),
                        React.createElement("div", { className: "text-right text-sm text-blue-100" },
                            React.createElement("div", null,
                                "Employee #: ",
                                payslip.employeeNumber || ((_c = payslip.employeeId) === null || _c === void 0 ? void 0 : _c.slice(0, 8))),
                            React.createElement("div", null,
                                "Pay Date: ",
                                payslip.payDate || "—"),
                            React.createElement("div", null,
                                "Period: ",
                                payslip.payPeriod)))),
                React.createElement("div", { className: "px-8 py-5 bg-slate-50 border-b" },
                    React.createElement("p", { className: "text-[10px] uppercase tracking-widest text-gray-400 mb-3" }, "Employee Information"),
                    React.createElement("div", { className: "grid grid-cols-2 gap-x-6 gap-y-2" },
                        React.createElement(InfoCell, { label: "Full Name", value: ((payslip.firstName || "") + " " + (payslip.lastName || "")).trim() || "—" }),
                        React.createElement(InfoCell, { label: "Employee Number", value: payslip.employeeNumber || "—" }),
                        React.createElement(InfoCell, { label: "Department", value: payslip.department || "—" }),
                        React.createElement(InfoCell, { label: "Position / Grade", value: payslip.position || "—" }),
                        React.createElement(InfoCell, { label: "KRA Tax PIN", value: payslip.taxId || "—" }),
                        React.createElement(InfoCell, { label: "NSSF Number", value: payslip.nssfNumber || "—" }),
                        React.createElement(InfoCell, { label: "NHIF / SHIF No.", value: payslip.nhifNumber || "—" }),
                        React.createElement(InfoCell, { label: "Pay Date", value: payslip.payDate || "—" }))),
                React.createElement("div", { className: "px-8 pt-5 pb-2" },
                    React.createElement("table", { className: "w-full text-sm" },
                        React.createElement("thead", null,
                            React.createElement("tr", { className: "bg-blue-50 text-blue-600 text-[10px] uppercase tracking-wider" },
                                React.createElement("th", { className: "text-left px-3 py-2 font-semibold rounded-tl" }, "Earnings"),
                                React.createElement("th", { className: "text-right px-3 py-2 font-semibold rounded-tr" }, "KES"))),
                        React.createElement("tbody", null,
                            React.createElement("tr", { className: "border-b border-gray-100" },
                                React.createElement("td", { className: "px-3 py-2 text-gray-700" }, "Basic Salary"),
                                React.createElement("td", { className: "px-3 py-2 text-right font-medium" }, fmt(payslip.basicSalary))),
                            allowances.map(function (a, i) { return (React.createElement("tr", { key: i, className: "border-b border-gray-100" },
                                React.createElement("td", { className: "px-3 py-2 text-emerald-700" }, a.name),
                                React.createElement("td", { className: "px-3 py-2 text-right text-emerald-700" },
                                    "+ ",
                                    fmt(a.amount)))); }),
                            React.createElement("tr", { className: "bg-emerald-50 font-semibold text-emerald-800" },
                                React.createElement("td", { className: "px-3 py-2.5" }, "Gross Pay"),
                                React.createElement("td", { className: "px-3 py-2.5 text-right" }, fmt(payslip.grossPay)))))),
                React.createElement("div", { className: "px-8 pt-3 pb-2" },
                    React.createElement("table", { className: "w-full text-sm" },
                        React.createElement("thead", null,
                            React.createElement("tr", { className: "bg-red-50 text-red-500 text-[10px] uppercase tracking-wider" },
                                React.createElement("th", { className: "text-left px-3 py-2 font-semibold rounded-tl" }, "Deductions"),
                                React.createElement("th", { className: "text-right px-3 py-2 font-semibold rounded-tr" }, "KES"))),
                        React.createElement("tbody", null,
                            deductions.map(function (d, i) { return (React.createElement("tr", { key: i, className: "border-b border-gray-100" },
                                React.createElement("td", { className: "px-3 py-2 text-red-600" }, d.name),
                                React.createElement("td", { className: "px-3 py-2 text-right text-red-600" },
                                    "- ",
                                    fmt(d.amount)))); }),
                            React.createElement("tr", { className: "bg-red-50 font-semibold text-red-700" },
                                React.createElement("td", { className: "px-3 py-2.5" }, "Total Deductions"),
                                React.createElement("td", { className: "px-3 py-2.5 text-right" }, fmt(payslip.totalDeductions)))))),
                React.createElement("div", { className: "mx-8 my-4 bg-gradient-to-r from-blue-700 to-purple-700 rounded-lg px-6 py-4 flex items-center justify-between text-white" },
                    React.createElement("div", null,
                        React.createElement("p", { className: "text-blue-200 text-xs uppercase tracking-widest mb-1" }, "Net Pay"),
                        React.createElement("p", { className: "text-2xl font-extrabold" },
                            "KES ",
                            fmt(payslip.netPay))),
                    React.createElement("div", { className: "text-right text-sm text-blue-200 space-y-1" },
                        React.createElement("div", null,
                            "Gross: KES ",
                            fmt(payslip.grossPay)),
                        React.createElement("div", null,
                            "Deductions: KES ",
                            fmt(payslip.totalDeductions)))),
                React.createElement("div", { className: "px-8 pb-4" },
                    React.createElement("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-4" },
                        React.createElement(StatBadge, { label: "PAYE", value: fmt(payslip.paye) }),
                        React.createElement(StatBadge, { label: "NSSF", value: fmt(payslip.nssf) }),
                        React.createElement(StatBadge, { label: "NHIF/SHIF", value: fmt(payslip.nhif) }),
                        React.createElement(StatBadge, { label: "Housing Levy", value: fmt(payslip.housingLevy) }))),
                React.createElement("div", { className: "px-8 pb-5 border-t border-gray-100 pt-4" },
                    React.createElement("p", { className: "text-[10px] uppercase tracking-widest text-gray-400 mb-2" }, "Payment Details"),
                    React.createElement("div", { className: "grid grid-cols-3 gap-x-4 gap-y-2 text-sm" },
                        React.createElement(InfoCell, { label: "Bank", value: payslip.bankName || "—" }),
                        React.createElement(InfoCell, { label: "Branch", value: payslip.bankBranch || "—" }),
                        React.createElement(InfoCell, { label: "Account No", value: payslip.bankAccountNumber || "—" }))),
                React.createElement("div", { className: "bg-slate-50 px-8 py-3 border-t border-gray-100 text-center" },
                    React.createElement("p", { className: "text-[11px] text-gray-400" }, "This is a computer-generated payslip and does not require a physical signature."),
                    React.createElement("p", { className: "text-[11px] text-gray-400" },
                        period,
                        " | Generated by Kiini HR System"))))));
}
exports["default"] = PayslipDocument;
// ── Sub-components ─────────────────────────────────────────────────────────
function InfoCell(_a) {
    var label = _a.label, value = _a.value;
    return (React.createElement("div", null,
        React.createElement("p", { className: "text-[10px] uppercase tracking-wide text-gray-400" }, label),
        React.createElement("p", { className: "text-sm font-medium text-gray-800" }, value)));
}
function StatBadge(_a) {
    var label = _a.label, value = _a.value;
    return (React.createElement("div", { className: "bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-center" },
        React.createElement("p", { className: "text-[10px] uppercase tracking-wide text-gray-400" }, label),
        React.createElement("p", { className: "text-sm font-semibold text-gray-700" }, value)));
}
