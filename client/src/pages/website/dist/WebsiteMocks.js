"use strict";
exports.__esModule = true;
exports.MockCRMScreenshot = exports.MockHRScreenshot = exports.MockFinanceScreenshot = exports.MockDashboardScreenshot = void 0;
/**
 * WebsiteMocks.tsx
 * Pure CSS/Tailwind mock screenshot components that simulate the Kiini UI.
 * Used on the marketing website to show the product without real screenshots.
 */
var react_1 = require("react");
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
// ── Shared pieces ──────────────────────────────────────────────────────────
function MockBrowser(_a) {
    var children = _a.children, className = _a.className;
    return (react_1["default"].createElement("div", { className: utils_1.cn("rounded-xl border border-white/15 bg-[#0d0d1a] overflow-hidden shadow-2xl shadow-black/60", className) },
        react_1["default"].createElement("div", { className: "flex items-center gap-2 px-3 py-2 bg-black/40 border-b border-white/8" },
            react_1["default"].createElement("div", { className: "flex gap-1.5" },
                react_1["default"].createElement("div", { className: "h-2.5 w-2.5 rounded-full bg-red-500/70" }),
                react_1["default"].createElement("div", { className: "h-2.5 w-2.5 rounded-full bg-amber-400/70" }),
                react_1["default"].createElement("div", { className: "h-2.5 w-2.5 rounded-full bg-emerald-500/70" })),
            react_1["default"].createElement("div", { className: "flex-1 mx-2 rounded bg-white/8 h-4 flex items-center px-2" },
                react_1["default"].createElement("span", { className: "text-[9px] text-white/30 font-mono" }, "https://app.kiini.africa")),
            react_1["default"].createElement("div", { className: "flex gap-1" },
                react_1["default"].createElement("div", { className: "h-3 w-3 rounded-sm bg-white/10" }),
                react_1["default"].createElement("div", { className: "h-3 w-3 rounded-sm bg-white/10" }))),
        children));
}
function AppTopbar() {
    return (react_1["default"].createElement("div", { className: "flex items-center justify-between px-4 py-2 bg-[#07070f] border-b border-white/8" },
        react_1["default"].createElement("div", { className: "flex items-center gap-2" },
            react_1["default"].createElement("div", { className: "flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600" },
                react_1["default"].createElement(lucide_react_1.Zap, { className: "h-3.5 w-3.5 text-white" })),
            react_1["default"].createElement("span", { className: "text-sm font-bold text-white" },
                "Kiini",
                react_1["default"].createElement("span", { className: "text-indigo-400" }, "360"))),
        react_1["default"].createElement("div", { className: "flex items-center gap-2" },
            react_1["default"].createElement("div", { className: "flex items-center gap-1.5 rounded-md bg-white/8 px-2.5 py-1" },
                react_1["default"].createElement(lucide_react_1.Search, { className: "h-2.5 w-2.5 text-white/40" }),
                react_1["default"].createElement("span", { className: "text-[9px] text-white/30" }, "Search\u2026")),
            react_1["default"].createElement(lucide_react_1.Bell, { className: "h-3.5 w-3.5 text-white/40" }),
            react_1["default"].createElement("div", { className: "h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center" },
                react_1["default"].createElement("span", { className: "text-[8px] font-bold text-white" }, "JM")))));
}
function AppSidebar(_a) {
    var _b = _a.active, active = _b === void 0 ? 0 : _b;
    var items = [
        { icon: lucide_react_1.Home, label: "Dashboard" },
        { icon: lucide_react_1.Users, label: "CRM" },
        { icon: lucide_react_1.DollarSign, label: "Finance" },
        { icon: lucide_react_1.UserCog, label: "HR" },
        { icon: lucide_react_1.Briefcase, label: "Projects" },
        { icon: lucide_react_1.BarChart3, label: "Reports" },
        { icon: lucide_react_1.Settings, label: "Settings" },
    ];
    return (react_1["default"].createElement("div", { className: "w-28 shrink-0 bg-[#07070f] border-r border-white/8 py-2 flex flex-col gap-0.5" }, items.map(function (item, i) {
        var Icon = item.icon;
        return (react_1["default"].createElement("div", { key: item.label, className: utils_1.cn("flex items-center gap-1.5 mx-1.5 px-2 py-1.5 rounded-md text-[9px] font-medium", i === active
                ? "bg-indigo-600/25 text-indigo-300"
                : "text-white/35 hover:text-white/60") },
            react_1["default"].createElement(Icon, { className: "h-2.5 w-2.5 shrink-0" }),
            react_1["default"].createElement("span", null, item.label)));
    })));
}
// ── MOCK 1: Dashboard Overview ─────────────────────────────────────────────
function MockDashboardScreenshot(_a) {
    var className = _a.className;
    var bars = [55, 72, 48, 88, 63, 91, 74];
    var areaPoints = "0,70 16,55 32,60 48,35 64,45 80,20 96,30 100,28 100,100 0,100";
    return (react_1["default"].createElement(MockBrowser, { className: className },
        react_1["default"].createElement(AppTopbar, null),
        react_1["default"].createElement("div", { className: "flex", style: { height: 320 } },
            react_1["default"].createElement(AppSidebar, { active: 0 }),
            react_1["default"].createElement("div", { className: "flex-1 p-3 overflow-hidden" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between mb-3" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("h3", { className: "text-[11px] font-bold text-white" }, "Executive Dashboard"),
                        react_1["default"].createElement("p", { className: "text-[9px] text-white/40" }, "March 2026 \u00B7 Acme Group")),
                    react_1["default"].createElement("div", { className: "flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5" },
                        react_1["default"].createElement("div", { className: "h-1.5 w-1.5 rounded-full bg-emerald-400" }),
                        react_1["default"].createElement("span", { className: "text-[9px] text-emerald-400 font-medium" }, "Live"))),
                react_1["default"].createElement("div", { className: "grid grid-cols-4 gap-2 mb-3" }, [
                    { label: "Revenue", value: "KSh 8.2M", change: "+14.2%", up: true, color: "text-emerald-400" },
                    { label: "Clients", value: "2,847", change: "+5.1%", up: true, color: "text-blue-400" },
                    { label: "Payroll", value: "KSh 3.1M", change: "-2.3%", up: false, color: "text-violet-400" },
                    { label: "Projects", value: "38 active", change: "+8", up: true, color: "text-amber-400" },
                ].map(function (kpi) { return (react_1["default"].createElement("div", { key: kpi.label, className: "rounded-lg border border-white/8 bg-white/3 p-2" },
                    react_1["default"].createElement("p", { className: "text-[8px] text-white/40 mb-0.5" }, kpi.label),
                    react_1["default"].createElement("p", { className: utils_1.cn("text-[10px] font-bold", kpi.color) }, kpi.value),
                    react_1["default"].createElement("div", { className: utils_1.cn("flex items-center gap-0.5 mt-0.5", kpi.up ? "text-emerald-400" : "text-red-400") },
                        kpi.up ? react_1["default"].createElement(lucide_react_1.ArrowUpRight, { className: "h-2 w-2" }) : react_1["default"].createElement(lucide_react_1.ArrowDownRight, { className: "h-2 w-2" }),
                        react_1["default"].createElement("span", { className: "text-[8px]" }, kpi.change)))); })),
                react_1["default"].createElement("div", { className: "grid grid-cols-3 gap-2" },
                    react_1["default"].createElement("div", { className: "col-span-2 rounded-lg border border-white/8 bg-white/3 p-3" },
                        react_1["default"].createElement("p", { className: "text-[9px] font-medium text-white/60 mb-2" }, "Monthly Revenue (KSh)"),
                        react_1["default"].createElement("div", { className: "flex items-end gap-1 h-14" }, bars.map(function (h, i) { return (react_1["default"].createElement("div", { key: i, className: "flex-1 flex flex-col items-center gap-0.5" },
                            react_1["default"].createElement("div", { className: "w-full rounded-t-sm", style: { height: h + "%", background: i === 6 ? "linear-gradient(to top, #6366f1, #8b5cf6)" : "rgba(99,102,241,0.3)" } }),
                            react_1["default"].createElement("span", { className: "text-[7px] text-white/25" }, ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"][i]))); }))),
                    react_1["default"].createElement("div", { className: "rounded-lg border border-white/8 bg-white/3 p-3" },
                        react_1["default"].createElement("p", { className: "text-[9px] font-medium text-white/60 mb-2" }, "By Module"),
                        react_1["default"].createElement("div", { className: "flex justify-center mb-1" },
                            react_1["default"].createElement("svg", { width: "56", height: "56", viewBox: "0 0 36 36" },
                                react_1["default"].createElement("circle", { cx: "18", cy: "18", r: "14", fill: "none", stroke: "rgba(255,255,255,0.06)", strokeWidth: "6" }),
                                react_1["default"].createElement("circle", { cx: "18", cy: "18", r: "14", fill: "none", stroke: "#6366f1", strokeWidth: "6", strokeDasharray: "44 44", strokeDashoffset: "0" }),
                                react_1["default"].createElement("circle", { cx: "18", cy: "18", r: "14", fill: "none", stroke: "#10b981", strokeWidth: "6", strokeDasharray: "22 66", strokeDashoffset: "-44" }),
                                react_1["default"].createElement("circle", { cx: "18", cy: "18", r: "14", fill: "none", stroke: "#f59e0b", strokeWidth: "6", strokeDasharray: "16 72", strokeDashoffset: "-66" }),
                                react_1["default"].createElement("circle", { cx: "18", cy: "18", r: "14", fill: "none", stroke: "#8b5cf6", strokeWidth: "6", strokeDasharray: "6 82", strokeDashoffset: "-82" }))),
                        [
                            { label: "Finance", color: "bg-indigo-500", pct: "50%" },
                            { label: "CRM", color: "bg-emerald-500", pct: "25%" },
                            { label: "HR", color: "bg-amber-500", pct: "18%" },
                            { label: "Other", color: "bg-violet-500", pct: "7%" },
                        ].map(function (item) { return (react_1["default"].createElement("div", { key: item.label, className: "flex items-center justify-between" },
                            react_1["default"].createElement("div", { className: "flex items-center gap-1" },
                                react_1["default"].createElement("div", { className: utils_1.cn("h-1.5 w-1.5 rounded-full", item.color) }),
                                react_1["default"].createElement("span", { className: "text-[8px] text-white/40" }, item.label)),
                            react_1["default"].createElement("span", { className: "text-[8px] text-white/50 font-medium" }, item.pct))); })))))));
}
exports.MockDashboardScreenshot = MockDashboardScreenshot;
// ── MOCK 2: Invoice / Finance ─────────────────────────────────────────────
function MockFinanceScreenshot(_a) {
    var className = _a.className;
    var invoices = [
        { id: "INV-2024", client: "Acme Corp", amount: "Ksh 184,000", status: "Paid", statusColor: "text-emerald-400 bg-emerald-500/15" },
        { id: "INV-2025", client: "Zenith Ltd", amount: "Ksh 92,500", status: "Pending", statusColor: "text-amber-400 bg-amber-500/15" },
        { id: "INV-2026", client: "BlueStar Inc", amount: "Ksh 340,000", status: "Paid", statusColor: "text-emerald-400 bg-emerald-500/15" },
        { id: "INV-2027", client: "Nova Group", amount: "Ksh 56,800", status: "Overdue", statusColor: "text-red-400 bg-red-500/15" },
        { id: "INV-2028", client: "Meridian Co", amount: "Ksh 210,000", status: "Draft", statusColor: "text-white/50 bg-white/8" },
    ];
    return (react_1["default"].createElement(MockBrowser, { className: className },
        react_1["default"].createElement(AppTopbar, null),
        react_1["default"].createElement("div", { className: "flex", style: { height: 300 } },
            react_1["default"].createElement(AppSidebar, { active: 2 }),
            react_1["default"].createElement("div", { className: "flex-1 p-3 overflow-hidden" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between mb-3" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("h3", { className: "text-[11px] font-bold text-white" }, "Invoices"),
                        react_1["default"].createElement("p", { className: "text-[9px] text-white/40" }, "Finance module")),
                    react_1["default"].createElement("div", { className: "flex gap-1.5" },
                        react_1["default"].createElement("div", { className: "rounded-md bg-white/8 px-2 py-1 text-[8px] text-white/50" }, "Export"),
                        react_1["default"].createElement("div", { className: "rounded-md bg-indigo-600 px-2 py-1 text-[8px] text-white font-medium" }, "+ New Invoice"))),
                react_1["default"].createElement("div", { className: "grid grid-cols-3 gap-2 mb-3" }, [
                    { label: "Total Outstanding", value: "KSh 149,300", color: "text-amber-400" },
                    { label: "Collected (Mar)", value: "KSh 524,000", color: "text-emerald-400" },
                    { label: "Overdue", value: "KSh 56,800", color: "text-red-400" },
                ].map(function (s) { return (react_1["default"].createElement("div", { key: s.label, className: "rounded-lg border border-white/8 bg-white/3 p-2" },
                    react_1["default"].createElement("p", { className: "text-[8px] text-white/40" }, s.label),
                    react_1["default"].createElement("p", { className: utils_1.cn("text-[11px] font-bold mt-0.5", s.color) }, s.value))); })),
                react_1["default"].createElement("div", { className: "rounded-lg border border-white/8 overflow-hidden" },
                    react_1["default"].createElement("div", { className: "grid grid-cols-4 px-3 py-1.5 bg-white/3 border-b border-white/8" }, ["Invoice", "Client", "Amount", "Status"].map(function (h) { return (react_1["default"].createElement("span", { key: h, className: "text-[8px] font-semibold text-white/30 uppercase tracking-wide" }, h)); })),
                    invoices.map(function (inv) { return (react_1["default"].createElement("div", { key: inv.id, className: "grid grid-cols-4 px-3 py-1.5 border-b border-white/5 hover:bg-white/2" },
                        react_1["default"].createElement("span", { className: "text-[9px] text-indigo-400 font-mono" }, inv.id),
                        react_1["default"].createElement("span", { className: "text-[9px] text-white/70" }, inv.client),
                        react_1["default"].createElement("span", { className: "text-[9px] text-white/80 font-medium" }, inv.amount),
                        react_1["default"].createElement("span", { className: utils_1.cn("text-[8px] font-medium px-1.5 rounded-full w-fit", inv.statusColor) }, inv.status))); }))))));
}
exports.MockFinanceScreenshot = MockFinanceScreenshot;
// ── MOCK 3: HR / Payroll ──────────────────────────────────────────────────
function MockHRScreenshot(_a) {
    var className = _a.className;
    var employees = [
        { name: "James Kariuki", dept: "Engineering", gross: "KSh 145,000", net: "KSh 112,300", status: "Processed" },
        { name: "Wanjiru Maina", dept: "Finance", gross: "KSh 98,000", net: "KSh 79,500", status: "Processed" },
        { name: "David Omondi", dept: "HR", gross: "KSh 72,000", net: "KSh 60,200", status: "Pending" },
        { name: "Amina Hassan", dept: "Sales", gross: "KSh 88,000", net: "KSh 71,800", status: "Processed" },
    ];
    return (react_1["default"].createElement(MockBrowser, { className: className },
        react_1["default"].createElement(AppTopbar, null),
        react_1["default"].createElement("div", { className: "flex", style: { height: 280 } },
            react_1["default"].createElement(AppSidebar, { active: 3 }),
            react_1["default"].createElement("div", { className: "flex-1 p-3 overflow-hidden" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between mb-3" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("h3", { className: "text-[11px] font-bold text-white" }, "Payroll Run \u2014 March 2026"),
                        react_1["default"].createElement("p", { className: "text-[9px] text-white/40" }, "HR & Payroll module \u00B7 92 employees")),
                    react_1["default"].createElement("div", { className: "rounded-md bg-emerald-600 px-2 py-1 text-[8px] text-white font-medium flex items-center gap-1" },
                        react_1["default"].createElement(lucide_react_1.CheckCircle2, { className: "h-2 w-2" }),
                        " Approved")),
                react_1["default"].createElement("div", { className: "grid grid-cols-4 gap-2 mb-3" }, [
                    { label: "Gross Payroll", value: "KSh 9.2M", color: "text-white" },
                    { label: "PAYE Tax", value: "KSh 1.4M", color: "text-amber-400" },
                    { label: "NHIF/NSSF", value: "KSh 312K", color: "text-blue-400" },
                    { label: "Net Payroll", value: "KSh 7.5M", color: "text-emerald-400" },
                ].map(function (s) { return (react_1["default"].createElement("div", { key: s.label, className: "rounded-lg border border-white/8 bg-white/3 p-2" },
                    react_1["default"].createElement("p", { className: "text-[8px] text-white/40" }, s.label),
                    react_1["default"].createElement("p", { className: utils_1.cn("text-[10px] font-bold mt-0.5", s.color) }, s.value))); })),
                react_1["default"].createElement("div", { className: "rounded-lg border border-white/8 overflow-hidden" },
                    react_1["default"].createElement("div", { className: "grid grid-cols-5 px-3 py-1.5 bg-white/3 border-b border-white/8" }, ["Employee", "Department", "Gross", "Net Pay", "Status"].map(function (h) { return (react_1["default"].createElement("span", { key: h, className: "text-[8px] font-semibold text-white/30 uppercase tracking-wide" }, h)); })),
                    employees.map(function (emp) { return (react_1["default"].createElement("div", { key: emp.name, className: "grid grid-cols-5 px-3 py-1.5 border-b border-white/5" },
                        react_1["default"].createElement("span", { className: "text-[9px] text-white/80 font-medium" }, emp.name),
                        react_1["default"].createElement("span", { className: "text-[9px] text-white/50" }, emp.dept),
                        react_1["default"].createElement("span", { className: "text-[9px] text-white/70" }, emp.gross),
                        react_1["default"].createElement("span", { className: "text-[9px] text-emerald-400 font-medium" }, emp.net),
                        react_1["default"].createElement("span", { className: utils_1.cn("text-[8px] rounded-full px-1.5 w-fit font-medium", emp.status === "Processed" ? "text-emerald-400 bg-emerald-500/15" : "text-amber-400 bg-amber-500/15") }, emp.status))); }))))));
}
exports.MockHRScreenshot = MockHRScreenshot;
// ── MOCK 4: CRM Pipeline ──────────────────────────────────────────────────
function MockCRMScreenshot(_a) {
    var className = _a.className;
    var stages = [
        { label: "Lead", count: 14, total: "KSh 2.1M", color: "border-blue-500/40 bg-blue-500/5", deals: ["Tech Corp", "BrightPath", "Summit Inc"] },
        { label: "Proposal", count: 8, total: "KSh 5.4M", color: "border-violet-500/40 bg-violet-500/5", deals: ["Meridian", "Apex Group"] },
        { label: "Negotiation", count: 5, total: "KSh 8.2M", color: "border-amber-500/40 bg-amber-500/5", deals: ["ZenCorp", "BlueStar"] },
        { label: "Won", count: 22, total: "KSh 14.8M", color: "border-emerald-500/40 bg-emerald-500/5", deals: ["Acme Ltd", "Nova Co"] },
    ];
    return (react_1["default"].createElement(MockBrowser, { className: className },
        react_1["default"].createElement(AppTopbar, null),
        react_1["default"].createElement("div", { className: "flex", style: { height: 300 } },
            react_1["default"].createElement(AppSidebar, { active: 1 }),
            react_1["default"].createElement("div", { className: "flex-1 p-3 overflow-hidden" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between mb-3" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("h3", { className: "text-[11px] font-bold text-white" }, "Sales Pipeline"),
                        react_1["default"].createElement("p", { className: "text-[9px] text-white/40" }, "CRM module \u00B7 Q1 2026")),
                    react_1["default"].createElement("div", { className: "flex gap-1.5" },
                        react_1["default"].createElement("div", { className: "rounded-md bg-white/8 px-2 py-1 text-[8px] text-white/50" }, "Filter"),
                        react_1["default"].createElement("div", { className: "rounded-md bg-indigo-600 px-2 py-1 text-[8px] text-white font-medium" }, "+ Add Deal"))),
                react_1["default"].createElement("div", { className: "grid grid-cols-4 gap-2 h-48" }, stages.map(function (stage) { return (react_1["default"].createElement("div", { key: stage.label, className: utils_1.cn("rounded-lg border p-2 flex flex-col gap-1.5", stage.color) },
                    react_1["default"].createElement("div", { className: "flex items-center justify-between mb-0.5" },
                        react_1["default"].createElement("span", { className: "text-[9px] font-semibold text-white/70" }, stage.label),
                        react_1["default"].createElement("span", { className: "text-[8px] text-white/40" }, stage.count)),
                    react_1["default"].createElement("div", { className: "text-[8px] text-white/40 font-medium mb-1" }, stage.total),
                    stage.deals.map(function (deal) { return (react_1["default"].createElement("div", { key: deal, className: "rounded bg-white/8 px-2 py-1" },
                        react_1["default"].createElement("span", { className: "text-[8px] text-white/70" }, deal))); }))); }))))));
}
exports.MockCRMScreenshot = MockCRMScreenshot;
