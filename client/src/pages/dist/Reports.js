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
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var tabs_1 = require("@/components/ui/tabs");
var button_1 = require("@/components/ui/button");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var table_1 = require("@/components/ui/table");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var stats_card_1 = require("@/components/ui/stats-card");
var currency_1 = require("@/lib/currency");
var recharts_1 = require("recharts");
function Reports(_a) {
    var _b;
    var initialTab = (_a === void 0 ? {} : _a).initialTab;
    var _c = permissions_1.useRequireFeature("reports:view"), allowed = _c.allowed, isLoading = _c.isLoading;
    var _d = react_1.useState(initialTab || "invoices"), mainTab = _d[0], setMainTab = _d[1];
    var _e = react_1.useState("overview"), subTab = _e[0], setSubTab = _e[1];
    var _f = react_1.useState("all"), statusFilter = _f[0], setStatusFilter = _f[1];
    var _g = react_1.useState(String(new Date().getFullYear())), yearFilter = _g[0], setYearFilter = _g[1];
    var currencyCode = currency_1.useCurrencySettings().code;
    // Fetch real data
    var _h = trpc_1.trpc.invoices.list.useQuery().data, invoices = _h === void 0 ? [] : _h;
    var _j = trpc_1.trpc.clients.list.useQuery().data, clients = _j === void 0 ? [] : _j;
    var _k = trpc_1.trpc.payments.list.useQuery().data, payments = _k === void 0 ? [] : _k;
    var _l = trpc_1.trpc.expenses.list.useQuery().data, expenses = _l === void 0 ? [] : _l;
    var _m = trpc_1.trpc.estimates.list.useQuery().data, estimates = _m === void 0 ? [] : _m;
    var _o = trpc_1.trpc.projects.list.useQuery({}).data, projectsRaw = _o === void 0 ? [] : _o;
    var _p = trpc_1.trpc.timeEntries.list.useQuery().data, timeEntriesRaw = _p === void 0 ? [] : _p;
    var _q = trpc_1.trpc.employees.list.useQuery().data, employeesRaw = _q === void 0 ? [] : _q;
    // Unwrap to prevent React #306
    var inv = react_1.useMemo(function () { return JSON.parse(JSON.stringify(invoices)); }, [invoices]);
    var est = react_1.useMemo(function () { return JSON.parse(JSON.stringify(estimates)); }, [estimates]);
    var cli = react_1.useMemo(function () { return JSON.parse(JSON.stringify(clients)); }, [clients]);
    var pay = react_1.useMemo(function () { return JSON.parse(JSON.stringify(payments)); }, [payments]);
    var exp = react_1.useMemo(function () { return JSON.parse(JSON.stringify(expenses)); }, [expenses]);
    var proj = react_1.useMemo(function () { return JSON.parse(JSON.stringify(projectsRaw)); }, [projectsRaw]);
    var te = react_1.useMemo(function () { return JSON.parse(JSON.stringify(timeEntriesRaw)); }, [timeEntriesRaw]);
    var emps = react_1.useMemo(function () { return JSON.parse(JSON.stringify(employeesRaw)); }, [employeesRaw]);
    var fmt = react_1.useCallback(function (amount) { return new Intl.NumberFormat("en-KE", { style: "currency", currency: currencyCode }).format(amount / 100); }, [currencyCode]);
    var currentYear = new Date().getFullYear();
    var yearOptions = [currentYear, currentYear - 1, currentYear - 2].map(String);
    var handleMainTabChange = function (val) {
        setMainTab(val);
        setSubTab(val === "timesheets" ? "team" : val === "financial" ? "income-expenses" : "overview");
        setStatusFilter("all");
    };
    // ───────────── INVOICES ─────────────
    var filteredInv = react_1.useMemo(function () {
        var items = inv;
        if (yearFilter !== "all")
            items = items.filter(function (i) { return new Date(i.invoiceDate || i.issueDate || i.createdAt).getFullYear() === Number(yearFilter); });
        if (statusFilter !== "all")
            items = items.filter(function (i) { return i.status === statusFilter; });
        return items;
    }, [inv, yearFilter, statusFilter]);
    var invTotalAmount = react_1.useMemo(function () { return filteredInv.reduce(function (s, i) { return s + (i.total || 0); }, 0); }, [filteredInv]);
    var invPaid = react_1.useMemo(function () { return filteredInv.filter(function (i) { return i.status === "paid"; }).reduce(function (s, i) { return s + (i.total || 0); }, 0); }, [filteredInv]);
    var invDue = react_1.useMemo(function () { return filteredInv.filter(function (i) { return i.status === "sent" || i.status === "due"; }).reduce(function (s, i) { return s + (i.total || 0); }, 0); }, [filteredInv]);
    var invOverdue = react_1.useMemo(function () { return filteredInv.filter(function (i) { return i.status === "overdue"; }).reduce(function (s, i) { return s + (i.total || 0); }, 0); }, [filteredInv]);
    var invMonthly = react_1.useMemo(function () {
        var map = {};
        filteredInv.forEach(function (i) {
            var key = new Date(i.invoiceDate || i.issueDate || i.createdAt).toLocaleString("en-US", { month: "short", year: "2-digit" });
            if (!map[key])
                map[key] = { total: 0, count: 0, paid: 0 };
            map[key].total += i.total || 0;
            map[key].count += 1;
            if (i.status === "paid")
                map[key].paid += i.total || 0;
        });
        return Object.entries(map).map(function (_a) {
            var month = _a[0], d = _a[1];
            return (__assign({ month: month }, d));
        });
    }, [filteredInv]);
    var invByClient = react_1.useMemo(function () {
        var map = {};
        filteredInv.forEach(function (i) {
            var cid = i.clientId || "unknown";
            if (!map[cid]) {
                var c = cli.find(function (c) { return c.id === cid; });
                map[cid] = { name: (c === null || c === void 0 ? void 0 : c.companyName) || i.clientName || "Unknown", total: 0, count: 0, paid: 0 };
            }
            map[cid].total += i.total || 0;
            map[cid].count += 1;
            if (i.status === "paid")
                map[cid].paid += i.total || 0;
        });
        return Object.values(map).sort(function (a, b) { return b.total - a.total; });
    }, [filteredInv, cli]);
    var invByCategory = react_1.useMemo(function () {
        var map = {};
        filteredInv.forEach(function (i) {
            var cat = i.category || "General";
            if (!map[cat])
                map[cat] = { total: 0, count: 0 };
            map[cat].total += i.total || 0;
            map[cat].count += 1;
        });
        return Object.entries(map).map(function (_a) {
            var name = _a[0], d = _a[1];
            return (__assign({ name: name }, d));
        }).sort(function (a, b) { return b.total - a.total; });
    }, [filteredInv]);
    // ───────────── ESTIMATES ─────────────
    var filteredEst = react_1.useMemo(function () {
        var items = est;
        if (yearFilter !== "all")
            items = items.filter(function (e) { return new Date(e.date || e.createdAt).getFullYear() === Number(yearFilter); });
        if (statusFilter !== "all")
            items = items.filter(function (e) { return e.status === statusFilter; });
        return items;
    }, [est, yearFilter, statusFilter]);
    var estTotal = react_1.useMemo(function () { return filteredEst.reduce(function (s, e) { return s + (e.total || 0); }, 0); }, [filteredEst]);
    var estMonthly = react_1.useMemo(function () {
        var map = {};
        filteredEst.forEach(function (e) {
            var key = new Date(e.date || e.createdAt).toLocaleString("en-US", { month: "short", year: "2-digit" });
            if (!map[key])
                map[key] = { total: 0, count: 0 };
            map[key].total += e.total || 0;
            map[key].count += 1;
        });
        return Object.entries(map).map(function (_a) {
            var month = _a[0], d = _a[1];
            return (__assign({ month: month }, d));
        });
    }, [filteredEst]);
    var estByClient = react_1.useMemo(function () {
        var map = {};
        filteredEst.forEach(function (e) {
            var cid = e.clientId || "unknown";
            if (!map[cid]) {
                var c = cli.find(function (c) { return c.id === cid; });
                map[cid] = { name: (c === null || c === void 0 ? void 0 : c.companyName) || e.clientName || "Unknown", total: 0, count: 0 };
            }
            map[cid].total += e.total || 0;
            map[cid].count += 1;
        });
        return Object.values(map).sort(function (a, b) { return b.total - a.total; });
    }, [filteredEst, cli]);
    var estByCategory = react_1.useMemo(function () {
        var map = {};
        filteredEst.forEach(function (e) {
            var cat = e.category || "General";
            if (!map[cat])
                map[cat] = { total: 0, count: 0 };
            map[cat].total += e.total || 0;
            map[cat].count += 1;
        });
        return Object.entries(map).map(function (_a) {
            var name = _a[0], d = _a[1];
            return (__assign({ name: name }, d));
        }).sort(function (a, b) { return b.total - a.total; });
    }, [filteredEst]);
    // ───────────── PROJECTS ─────────────
    var filteredProj = react_1.useMemo(function () {
        var items = proj;
        if (yearFilter !== "all")
            items = items.filter(function (p) { return new Date(p.startDate || p.createdAt).getFullYear() === Number(yearFilter); });
        if (statusFilter !== "all")
            items = items.filter(function (p) { return p.status === statusFilter; });
        return items;
    }, [proj, yearFilter, statusFilter]);
    var projByStatus = react_1.useMemo(function () {
        var map = {};
        filteredProj.forEach(function (p) { var s = p.status || "not_started"; map[s] = (map[s] || 0) + 1; });
        return Object.entries(map).map(function (_a) {
            var status = _a[0], count = _a[1];
            return ({ status: status, count: count });
        });
    }, [filteredProj]);
    var projByClient = react_1.useMemo(function () {
        var map = {};
        filteredProj.forEach(function (p) {
            var cid = p.clientId || "unknown";
            if (!map[cid]) {
                var c = cli.find(function (c) { return c.id === cid; });
                map[cid] = { name: (c === null || c === void 0 ? void 0 : c.companyName) || "Unknown", count: 0, budget: 0 };
            }
            map[cid].count += 1;
            map[cid].budget += p.budget || 0;
        });
        return Object.values(map).sort(function (a, b) { return b.count - a.count; });
    }, [filteredProj, cli]);
    var projByCategory = react_1.useMemo(function () {
        var map = {};
        filteredProj.forEach(function (p) { var cat = p.category || "General"; map[cat] = (map[cat] || 0) + 1; });
        return Object.entries(map).map(function (_a) {
            var name = _a[0], count = _a[1];
            return ({ name: name, count: count });
        }).sort(function (a, b) { return b.count - a.count; });
    }, [filteredProj]);
    // ───────────── CLIENTS ─────────────
    var clientOverview = react_1.useMemo(function () {
        return cli.map(function (c) {
            var cInv = inv.filter(function (i) { return i.clientId === c.id; });
            var cPay = pay.filter(function (p) { return p.clientId === c.id; });
            var cProj = proj.filter(function (p) { return p.clientId === c.id; });
            return {
                id: c.id,
                name: c.companyName || c.name || "Unknown",
                invoices: cInv.length,
                invoiceTotal: cInv.reduce(function (s, i) { return s + (i.total || 0); }, 0),
                payments: cPay.reduce(function (s, p) { return s + (p.amount || 0); }, 0),
                projects: cProj.length,
                status: c.status || "active"
            };
        }).sort(function (a, b) { return b.invoiceTotal - a.invoiceTotal; });
    }, [cli, inv, pay, proj]);
    // ───────────── TIME SHEETS ─────────────
    var tsByTeamMember = react_1.useMemo(function () {
        var map = {};
        te.forEach(function (t) {
            var uid = t.userId || t.employeeId || "unknown";
            if (!map[uid]) {
                var emp = emps.find(function (e) { return e.userId === uid || e.id === uid; });
                map[uid] = { name: emp ? ((emp.firstName || "") + " " + (emp.lastName || "")).trim() : t.userName || "Unknown", totalMinutes: 0, entries: 0 };
            }
            map[uid].totalMinutes += t.durationMinutes || 0;
            map[uid].entries += 1;
        });
        return Object.values(map).sort(function (a, b) { return b.totalMinutes - a.totalMinutes; });
    }, [te, emps]);
    var tsByClient = react_1.useMemo(function () {
        var map = {};
        te.forEach(function (t) {
            var cid = t.clientId || "unknown";
            if (!map[cid]) {
                var c = cli.find(function (c) { return c.id === cid; });
                map[cid] = { name: (c === null || c === void 0 ? void 0 : c.companyName) || "Unassigned", totalMinutes: 0, entries: 0 };
            }
            map[cid].totalMinutes += t.durationMinutes || 0;
            map[cid].entries += 1;
        });
        return Object.values(map).sort(function (a, b) { return b.totalMinutes - a.totalMinutes; });
    }, [te, cli]);
    var tsByProject = react_1.useMemo(function () {
        var map = {};
        te.forEach(function (t) {
            var pid = t.projectId || "unknown";
            if (!map[pid]) {
                var p = proj.find(function (p) { return p.id === pid; });
                map[pid] = { name: (p === null || p === void 0 ? void 0 : p.name) || "Unassigned", totalMinutes: 0, entries: 0 };
            }
            map[pid].totalMinutes += t.durationMinutes || 0;
            map[pid].entries += 1;
        });
        return Object.values(map).sort(function (a, b) { return b.totalMinutes - a.totalMinutes; });
    }, [te, proj]);
    // ───────────── FINANCIAL ─────────────
    var monthlyFinancial = react_1.useMemo(function () {
        var yr = yearFilter !== "all" ? Number(yearFilter) : currentYear;
        var map = {};
        for (var m = 0; m < 12; m++) {
            var key = new Date(yr, m).toLocaleString("en-US", { month: "short" });
            map[key] = { income: 0, expense: 0, invoiceCount: 0, expenseCount: 0 };
        }
        inv.forEach(function (i) {
            var d = new Date(i.invoiceDate || i.issueDate || i.createdAt);
            if (d.getFullYear() === yr) {
                var key = d.toLocaleString("en-US", { month: "short" });
                if (map[key]) {
                    map[key].income += (i.total || 0) / 100;
                    map[key].invoiceCount += 1;
                }
            }
        });
        exp.forEach(function (e) {
            var d = new Date(e.date || e.createdAt);
            if (d.getFullYear() === yr) {
                var key = d.toLocaleString("en-US", { month: "short" });
                if (map[key]) {
                    map[key].expense += (e.amount || 0) / 100;
                    map[key].expenseCount += 1;
                }
            }
        });
        return Object.entries(map).map(function (_a) {
            var month = _a[0], d = _a[1];
            return (__assign({ month: month }, d));
        });
    }, [inv, exp, yearFilter, currentYear]);
    var totalIncome = react_1.useMemo(function () { return monthlyFinancial.reduce(function (s, d) { return s + d.income; }, 0); }, [monthlyFinancial]);
    var totalExpense = react_1.useMemo(function () { return monthlyFinancial.reduce(function (s, d) { return s + d.expense; }, 0); }, [monthlyFinancial]);
    // ───────────── EXPORT ─────────────
    var exportCSV = react_1.useCallback(function () {
        try {
            var rows = [];
            if (mainTab === "invoices") {
                rows = __spreadArrays([["Invoice #", "Client", "Amount", "Status", "Date"]], filteredInv.map(function (i) { return [i.invoiceNumber || "", i.clientName || "", String((i.total || 0) / 100), i.status || "", i.invoiceDate || ""]; }));
            }
            else if (mainTab === "estimates") {
                rows = __spreadArrays([["Estimate #", "Client", "Amount", "Status", "Date"]], filteredEst.map(function (e) { return [e.estimateNumber || "", e.clientName || "", String((e.total || 0) / 100), e.status || "", e.date || ""]; }));
            }
            else if (mainTab === "projects") {
                rows = __spreadArrays([["Project", "Status", "Budget", "Progress"]], filteredProj.map(function (p) { return [p.name || "", p.status || "", String((p.budget || 0) / 100), (p.progress || 0) + "%"]; }));
            }
            else if (mainTab === "clients") {
                rows = __spreadArrays([["Client", "Invoices", "Total", "Payments", "Projects"]], clientOverview.map(function (c) { return [c.name, String(c.invoices), String(c.invoiceTotal / 100), String(c.payments / 100), String(c.projects)]; }));
            }
            else if (mainTab === "timesheets") {
                rows = __spreadArrays([["Name", "Hours", "Entries"]], tsByTeamMember.map(function (t) { return [t.name, String((t.totalMinutes / 60).toFixed(1)), String(t.entries)]; }));
            }
            else if (mainTab === "financial") {
                rows = __spreadArrays([["Month", "Income", "Expenses"]], monthlyFinancial.map(function (d) { return [d.month, d.income.toFixed(2), d.expense.toFixed(2)]; }));
            }
            var csv = rows.map(function (r) { return r.map(function (c) { return "\"" + c + "\""; }).join(","); }).join("\n");
            var el = document.createElement("a");
            el.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csv));
            el.setAttribute("download", "report-" + mainTab + "-" + new Date().toISOString().split("T")[0] + ".csv");
            el.style.display = "none";
            document.body.appendChild(el);
            el.click();
            document.body.removeChild(el);
            sonner_1.toast.success("Exported as CSV");
        }
        catch (_a) {
            sonner_1.toast.error("Export failed");
        }
    }, [mainTab, filteredInv, filteredEst, filteredProj, clientOverview, tsByTeamMember, monthlyFinancial]);
    var printReport = react_1.useCallback(function () { window.print(); }, []);
    // ───────────── SUB TAB DEFINITIONS ─────────────
    var subTabDefs = {
        invoices: [
            { label: "Overview", value: "overview" },
            { label: "Monthly", value: "monthly" },
            { label: "Client Invoices", value: "client" },
            { label: "Invoice Category", value: "category" },
        ],
        estimates: [
            { label: "Overview", value: "overview" },
            { label: "Monthly", value: "monthly" },
            { label: "Client Estimates", value: "client" },
            { label: "Estimate Category", value: "category" },
        ],
        projects: [
            { label: "Overview", value: "overview" },
            { label: "Client Projects", value: "client" },
            { label: "Project Category", value: "category" },
        ],
        clients: [
            { label: "Overview", value: "overview" },
        ],
        timesheets: [
            { label: "Team Member", value: "team" },
            { label: "Client", value: "client" },
            { label: "Project", value: "project" },
        ],
        financial: [
            { label: "Income vs Expenses", value: "income-expenses" },
            { label: "Invoices - Expenses - Orders", value: "summary" },
        ]
    };
    if (isLoading)
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" }));
    if (!allowed)
        return null;
    var renderTable = function (headers, rows) { return (React.createElement("div", { className: "overflow-x-auto" },
        React.createElement(table_1.Table, null,
            React.createElement(table_1.TableHeader, null,
                React.createElement(table_1.TableRow, null, headers.map(function (h) { return React.createElement(table_1.TableHead, { key: h, className: h !== headers[0] ? "text-right" : "" }, h); }))),
            React.createElement(table_1.TableBody, null, rows.length === 0 ? (React.createElement(table_1.TableRow, null,
                React.createElement(table_1.TableCell, { colSpan: headers.length, className: "text-center text-muted-foreground py-8" }, "No records found"))) : rows.map(function (row, i) { return (React.createElement(table_1.TableRow, { key: i }, row.map(function (cell, j) { return React.createElement(table_1.TableCell, { key: j, className: j > 0 ? "text-right" : "font-medium" }, cell); }))); }))))); };
    var renderSubContent = function () {
        // ═══════ INVOICES ═══════
        if (mainTab === "invoices") {
            if (subTab === "overview")
                return (React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Invoices Overview"),
                        React.createElement(card_1.CardDescription, null, "Summary of all invoices for the selected period")),
                    React.createElement(card_1.CardContent, { className: "space-y-6" },
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                            React.createElement(stats_card_1.StatsCard, { label: "Total Invoiced", value: fmt(invTotalAmount), description: filteredInv.length + " invoices", icon: React.createElement(lucide_react_1.FileText, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
                            React.createElement(stats_card_1.StatsCard, { label: "Paid", value: fmt(invPaid), description: "Collected", icon: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }), color: "border-l-green-500" }),
                            React.createElement(stats_card_1.StatsCard, { label: "Due", value: fmt(invDue), description: "Awaiting payment", icon: React.createElement(lucide_react_1.Clock, { className: "h-5 w-5" }), color: "border-l-orange-500" }),
                            React.createElement(stats_card_1.StatsCard, { label: "Overdue", value: fmt(invOverdue), description: "Past due date", icon: React.createElement(lucide_react_1.FileText, { className: "h-5 w-5" }), color: "border-l-red-500" })),
                        renderTable(["Invoice #", "Client", "Amount", "Paid", "Status", "Date"], filteredInv.slice(0, 50).map(function (i) { return [
                            i.invoiceNumber || "INV-" + i.id,
                            i.clientName || "—", fmt(i.total || 0), fmt(i.amountPaid || 0), i.status || "draft",
                            i.invoiceDate ? new Date(i.invoiceDate).toLocaleDateString() : "—",
                        ]; })))));
            if (subTab === "monthly")
                return (React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Monthly Invoice Report")),
                    React.createElement(card_1.CardContent, null, renderTable(["Month", "Invoices", "Total Amount", "Paid Amount"], invMonthly.map(function (m) { return [m.month, m.count, fmt(m.total), fmt(m.paid)]; })))));
            if (subTab === "client")
                return (React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Client Invoices"),
                        React.createElement(card_1.CardDescription, null, "Invoice totals by client")),
                    React.createElement(card_1.CardContent, null, renderTable(["Client", "# Invoices", "Total Amount", "Paid"], invByClient.map(function (c) { return [c.name, c.count, fmt(c.total), fmt(c.paid)]; })))));
            if (subTab === "category")
                return (React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Invoice Category")),
                    React.createElement(card_1.CardContent, null, renderTable(["Category", "# Invoices", "Total Amount"], invByCategory.map(function (c) { return [c.name, c.count, fmt(c.total)]; })))));
        }
        // ═══════ ESTIMATES ═══════
        if (mainTab === "estimates") {
            if (subTab === "overview")
                return (React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Estimates Overview")),
                    React.createElement(card_1.CardContent, { className: "space-y-6" },
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-3" },
                            React.createElement(stats_card_1.StatsCard, { label: "Total Estimates", value: filteredEst.length, description: "All estimates", icon: React.createElement(lucide_react_1.FileSpreadsheet, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
                            React.createElement(stats_card_1.StatsCard, { label: "Total Value", value: fmt(estTotal), description: "Combined value", icon: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }), color: "border-l-green-500" }),
                            React.createElement(stats_card_1.StatsCard, { label: "Avg Value", value: fmt(filteredEst.length > 0 ? Math.round(estTotal / filteredEst.length) : 0), description: "Per estimate", icon: React.createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5" }), color: "border-l-purple-500" })),
                        renderTable(["Estimate #", "Client", "Amount", "Status", "Date"], filteredEst.slice(0, 50).map(function (e) { return [
                            e.estimateNumber || "EST-" + e.id,
                            e.clientName || "—", fmt(e.total || 0), e.status || "draft",
                            e.date ? new Date(e.date).toLocaleDateString() : "—",
                        ]; })))));
            if (subTab === "monthly")
                return (React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Monthly Estimates")),
                    React.createElement(card_1.CardContent, null, renderTable(["Month", "# Estimates", "Total Value"], estMonthly.map(function (m) { return [m.month, m.count, fmt(m.total)]; })))));
            if (subTab === "client")
                return (React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Client Estimates")),
                    React.createElement(card_1.CardContent, null, renderTable(["Client", "# Estimates", "Total Value"], estByClient.map(function (c) { return [c.name, c.count, fmt(c.total)]; })))));
            if (subTab === "category")
                return (React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Estimate Category")),
                    React.createElement(card_1.CardContent, null, renderTable(["Category", "# Estimates", "Total Value"], estByCategory.map(function (c) { return [c.name, c.count, fmt(c.total)]; })))));
        }
        // ═══════ PROJECTS ═══════
        if (mainTab === "projects") {
            if (subTab === "overview")
                return (React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Projects Overview")),
                    React.createElement(card_1.CardContent, { className: "space-y-6" },
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                            React.createElement(stats_card_1.StatsCard, { label: "Total Projects", value: filteredProj.length, description: "All projects", icon: React.createElement(lucide_react_1.FolderKanban, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
                            projByStatus.slice(0, 3).map(function (ps) { return (React.createElement(stats_card_1.StatsCard, { key: ps.status, label: ps.status.replace(/_/g, " ").replace(/\b\w/g, function (l) { return l.toUpperCase(); }), value: ps.count, description: "Projects", icon: React.createElement(lucide_react_1.FolderKanban, { className: "h-5 w-5" }), color: "border-l-cyan-500" })); })),
                        renderTable(["Project", "Status", "Budget", "Progress", "Start Date"], filteredProj.slice(0, 50).map(function (p) { return [
                            p.name || "—", (p.status || "not_started").replace(/_/g, " "), fmt(p.budget || 0),
                            (p.progress || 0) + "%",
                            p.startDate ? new Date(p.startDate).toLocaleDateString() : "—",
                        ]; })))));
            if (subTab === "client")
                return (React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Client Projects")),
                    React.createElement(card_1.CardContent, null, renderTable(["Client", "# Projects", "Total Budget"], projByClient.map(function (c) { return [c.name, c.count, fmt(c.budget)]; })))));
            if (subTab === "category")
                return (React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Project Category")),
                    React.createElement(card_1.CardContent, null, renderTable(["Category", "# Projects"], projByCategory.map(function (c) { return [c.name, c.count]; })))));
        }
        // ═══════ CLIENTS ═══════
        if (mainTab === "clients") {
            return (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Clients Overview"),
                    React.createElement(card_1.CardDescription, null, "Revenue and project summary per client")),
                React.createElement(card_1.CardContent, null, renderTable(["Client", "# Invoices", "Invoice Total", "Payments", "# Projects", "Status"], clientOverview.map(function (c) { return [c.name, c.invoices, fmt(c.invoiceTotal), fmt(c.payments), c.projects, c.status]; })))));
        }
        // ═══════ TIME SHEETS ═══════
        if (mainTab === "timesheets") {
            var fmtHrs_1 = function (mins) { return (mins / 60).toFixed(1) + " hrs"; };
            if (subTab === "team")
                return (React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Time Sheets by Team Member")),
                    React.createElement(card_1.CardContent, null, renderTable(["Team Member", "Total Hours", "# Entries"], tsByTeamMember.map(function (t) { return [t.name, fmtHrs_1(t.totalMinutes), t.entries]; })))));
            if (subTab === "client")
                return (React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Time Sheets by Client")),
                    React.createElement(card_1.CardContent, null, renderTable(["Client", "Total Hours", "# Entries"], tsByClient.map(function (t) { return [t.name, fmtHrs_1(t.totalMinutes), t.entries]; })))));
            if (subTab === "project")
                return (React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Time Sheets by Project")),
                    React.createElement(card_1.CardContent, null, renderTable(["Project", "Total Hours", "# Entries"], tsByProject.map(function (t) { return [t.name, fmtHrs_1(t.totalMinutes), t.entries]; })))));
        }
        // ═══════ FINANCIAL ═══════
        if (mainTab === "financial") {
            if (subTab === "income-expenses")
                return (React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement(card_1.CardTitle, null, "Income vs Expenses"),
                                React.createElement(card_1.CardDescription, null, "Monthly comparison")),
                            React.createElement(select_1.Select, { value: yearFilter, onValueChange: setYearFilter },
                                React.createElement(select_1.SelectTrigger, { className: "w-24" },
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null, yearOptions.map(function (y) { return React.createElement(select_1.SelectItem, { key: y, value: y }, y); }))))),
                    React.createElement(card_1.CardContent, { className: "space-y-6" },
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-3" },
                            React.createElement(stats_card_1.StatsCard, { label: "Total Income", value: currencyCode + " " + totalIncome.toLocaleString("en-KE", { maximumFractionDigits: 0 }), description: "Revenue", icon: React.createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5" }), color: "border-l-green-500" }),
                            React.createElement(stats_card_1.StatsCard, { label: "Total Expenses", value: currencyCode + " " + totalExpense.toLocaleString("en-KE", { maximumFractionDigits: 0 }), description: "Costs", icon: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }), color: "border-l-red-500" }),
                            React.createElement(stats_card_1.StatsCard, { label: "Net Profit", value: currencyCode + " " + (totalIncome - totalExpense).toLocaleString("en-KE", { maximumFractionDigits: 0 }), description: "Income - Expenses", icon: React.createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5" }), color: "border-l-blue-500" })),
                        React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                            React.createElement(recharts_1.BarChart, { data: monthlyFinancial, margin: { top: 5, right: 10, left: 10, bottom: 5 } },
                                React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3", className: "stroke-muted" }),
                                React.createElement(recharts_1.XAxis, { dataKey: "month", tick: { fontSize: 11 } }),
                                React.createElement(recharts_1.YAxis, { tick: { fontSize: 11 }, tickFormatter: function (v) { return v >= 1000 ? (v / 1000).toFixed(0) + "K" : String(v); } }),
                                React.createElement(recharts_1.Tooltip, { formatter: function (value, name) { return [currencyCode + " " + value.toLocaleString(), name]; } }),
                                React.createElement(recharts_1.Legend, null),
                                React.createElement(recharts_1.Bar, { dataKey: "income", name: "Income", fill: "#22c55e", radius: [4, 4, 0, 0] }),
                                React.createElement(recharts_1.Bar, { dataKey: "expense", name: "Expenses", fill: "#ef4444", radius: [4, 4, 0, 0] }))))));
            if (subTab === "summary")
                return (React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Invoices - Expenses - Orders Summary")),
                    React.createElement(card_1.CardContent, null, renderTable(["Month", "Invoices", "Invoice Total", "Expenses", "Expense Total", "Net"], monthlyFinancial.map(function (d) { return [
                        d.month, d.invoiceCount,
                        currencyCode + " " + d.income.toLocaleString("en-KE", { maximumFractionDigits: 0 }),
                        d.expenseCount,
                        currencyCode + " " + d.expense.toLocaleString("en-KE", { maximumFractionDigits: 0 }),
                        currencyCode + " " + (d.income - d.expense).toLocaleString("en-KE", { maximumFractionDigits: 0 }),
                    ]; })))));
        }
        return React.createElement("div", { className: "flex items-center justify-center py-12 text-muted-foreground" }, "Select a section above to get started");
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Reports", description: "Comprehensive business reports and analytics", icon: React.createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5" }), breadcrumbs: __spreadArrays([
            { label: "Dashboard", href: "/crm-home" },
            { label: "Reports" }
        ], (mainTab ? [{ label: mainTab.charAt(0).toUpperCase() + mainTab.slice(1) }] : []), (subTab && ((_b = subTabDefs[mainTab]) === null || _b === void 0 ? void 0 : _b.find(function (s) { return s.value === subTab; })) ? [{ label: subTabDefs[mainTab].find(function (s) { return s.value === subTab; }).label }] : [])), actions: React.createElement("div", { className: "flex gap-2" },
            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: exportCSV },
                React.createElement(lucide_react_1.FileSpreadsheet, { className: "h-4 w-4 mr-1" }),
                "Excel"),
            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: exportCSV },
                React.createElement(lucide_react_1.Download, { className: "h-4 w-4 mr-1" }),
                "CSV"),
            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: printReport },
                React.createElement(lucide_react_1.Printer, { className: "h-4 w-4 mr-1" }),
                "Print")) },
        React.createElement("div", { className: "space-y-4" },
            React.createElement(tabs_1.Tabs, { value: mainTab, onValueChange: handleMainTabChange },
                React.createElement(tabs_1.TabsList, { className: "w-full justify-start" },
                    React.createElement(tabs_1.TabsTrigger, { value: "invoices" }, "Invoices"),
                    React.createElement(tabs_1.TabsTrigger, { value: "estimates" }, "Estimates"),
                    React.createElement(tabs_1.TabsTrigger, { value: "projects" }, "Projects"),
                    React.createElement(tabs_1.TabsTrigger, { value: "clients" }, "Clients"),
                    React.createElement(tabs_1.TabsTrigger, { value: "timesheets" }, "Time Sheets"),
                    React.createElement(tabs_1.TabsTrigger, { value: "financial" }, "Financial"))),
            subTabDefs[mainTab] && subTabDefs[mainTab].length > 1 && (React.createElement(tabs_1.Tabs, { value: subTab, onValueChange: setSubTab },
                React.createElement(tabs_1.TabsList, null, subTabDefs[mainTab].map(function (st) { return (React.createElement(tabs_1.TabsTrigger, { key: st.value, value: st.value }, st.label)); })))),
            mainTab !== "financial" && (React.createElement("div", { className: "flex gap-3 items-center" },
                React.createElement(select_1.Select, { value: yearFilter, onValueChange: setYearFilter },
                    React.createElement(select_1.SelectTrigger, { className: "w-28" },
                        React.createElement(select_1.SelectValue, { placeholder: "Year" })),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "all" }, "All Years"),
                        yearOptions.map(function (y) { return React.createElement(select_1.SelectItem, { key: y, value: y }, y); }))),
                (mainTab === "invoices" || mainTab === "estimates" || mainTab === "projects") && (React.createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                    React.createElement(select_1.SelectTrigger, { className: "w-32" },
                        React.createElement(select_1.SelectValue, { placeholder: "Status" })),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "all" }, "All Statuses"),
                        mainTab === "invoices" && React.createElement(React.Fragment, null,
                            React.createElement(select_1.SelectItem, { value: "paid" }, "Paid"),
                            React.createElement(select_1.SelectItem, { value: "sent" }, "Due"),
                            React.createElement(select_1.SelectItem, { value: "overdue" }, "Overdue"),
                            React.createElement(select_1.SelectItem, { value: "draft" }, "Draft")),
                        mainTab === "estimates" && React.createElement(React.Fragment, null,
                            React.createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                            React.createElement(select_1.SelectItem, { value: "sent" }, "Sent"),
                            React.createElement(select_1.SelectItem, { value: "accepted" }, "Accepted"),
                            React.createElement(select_1.SelectItem, { value: "declined" }, "Declined"),
                            React.createElement(select_1.SelectItem, { value: "expired" }, "Expired")),
                        mainTab === "projects" && React.createElement(React.Fragment, null,
                            React.createElement(select_1.SelectItem, { value: "not_started" }, "Not Started"),
                            React.createElement(select_1.SelectItem, { value: "in_progress" }, "In Progress"),
                            React.createElement(select_1.SelectItem, { value: "on_hold" }, "On Hold"),
                            React.createElement(select_1.SelectItem, { value: "completed" }, "Completed"),
                            React.createElement(select_1.SelectItem, { value: "cancelled" }, "Cancelled"))))),
                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { setStatusFilter("all"); setYearFilter(String(currentYear)); } }, "Reset"))),
            renderSubContent())));
}
exports["default"] = Reports;
