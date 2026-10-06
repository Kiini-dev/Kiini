"use strict";
exports.__esModule = true;
var DashboardLayout_1 = require("@/components/DashboardLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var select_1 = require("@/components/ui/select");
var wouter_1 = require("wouter");
var trpc_1 = require("@/lib/trpc");
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var currency_1 = require("@/lib/currency");
var recharts_1 = require("recharts");
function Dashboard() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = react_1.useState(new Date().getFullYear()), chartYear = _b[0], setChartYear = _b[1];
    console.log('[Dashboard] Component mounted/updated');
    var _c = trpc_1.trpc.dashboard.stats.useQuery(undefined, { retry: 1, staleTime: 30000 }), statsData = _c.data, isStatsLoading = _c.isLoading, statsError = _c.error;
    var _d = trpc_1.trpc.dashboard.metrics.useQuery(undefined, { retry: 1, staleTime: 30000 }), metricsData = _d.data, isMetricsLoading = _d.isLoading, metricsError = _d.error;
    var _e = trpc_1.trpc.projects.list.useQuery({ limit: 3 }, { retry: 1, staleTime: 30000 }), _f = _e.data, recentProjects = _f === void 0 ? [] : _f, isProjectsLoading = _e.isLoading, projectsError = _e.error;
    var _g = trpc_1.trpc.dashboard.recentActivity.useQuery({ limit: 5 }, { retry: 1, staleTime: 30000 }), _h = _g.data, recentActivity = _h === void 0 ? [] : _h, isActivityLoading = _g.isLoading, activityError = _g.error;
    var _j = trpc_1.trpc.dashboard.monthlyChart.useQuery({ year: chartYear }, { retry: 1, staleTime: 60000 }), chartData = _j.data, chartError = _j.error;
    var _k = trpc_1.trpc.dashboard.financialSummary.useQuery(undefined, { retry: 1, staleTime: 30000 }), financialSummary = _k.data, financialError = _k.error;
    var _l = trpc_1.trpc.opportunities.list.useQuery({}, { retry: 1, staleTime: 30000 }), _m = _l.data, leadsData = _m === void 0 ? [] : _m, leadsError = _l.error;
    // Log query statuses
    react_1["default"].useEffect(function () {
        console.log('[Dashboard] Query status:', {
            stats: { loading: isStatsLoading, error: !!statsError, errorMsg: statsError === null || statsError === void 0 ? void 0 : statsError.message },
            metrics: { loading: isMetricsLoading, error: !!metricsError, errorMsg: metricsError === null || metricsError === void 0 ? void 0 : metricsError.message },
            projects: { loading: isProjectsLoading, error: !!projectsError, errorMsg: projectsError === null || projectsError === void 0 ? void 0 : projectsError.message },
            activity: { loading: isActivityLoading, error: !!activityError, errorMsg: activityError === null || activityError === void 0 ? void 0 : activityError.message },
            chart: { error: !!chartError, errorMsg: chartError === null || chartError === void 0 ? void 0 : chartError.message },
            financial: { error: !!financialError, errorMsg: financialError === null || financialError === void 0 ? void 0 : financialError.message },
            leads: { error: !!leadsError, errorMsg: leadsError === null || leadsError === void 0 ? void 0 : leadsError.message }
        });
    }, [isStatsLoading, isMetricsLoading, isProjectsLoading, isActivityLoading, statsError, metricsError, projectsError, activityError, chartError, financialError, leadsError]);
    // Log any errors for debugging
    react_1["default"].useEffect(function () {
        var errors = [statsError, metricsError, projectsError, activityError, chartError, financialError, leadsError].filter(Boolean);
        if (errors.length > 0) {
            console.warn('[Dashboard] Query errors:', errors.map(function (e) { return e === null || e === void 0 ? void 0 : e.message; }));
        }
    }, [statsError, metricsError, projectsError, activityError, chartError, financialError, leadsError]);
    var statsDataPlain = statsData ? JSON.parse(JSON.stringify(statsData)) : null;
    var metricsDataPlain = metricsData ? JSON.parse(JSON.stringify(metricsData)) : null;
    var recentProjectsPlain = recentProjects ? JSON.parse(JSON.stringify(recentProjects)) : [];
    var recentActivityPlain = recentActivity ? JSON.parse(JSON.stringify(recentActivity)) : [];
    // Also unwrap remaining queries to prevent React error #306 from frozen/proxy objects
    var chartDataPlain = chartData ? JSON.parse(JSON.stringify(chartData)) : null;
    var financialSummaryPlain = financialSummary ? JSON.parse(JSON.stringify(financialSummary)) : null;
    var leadsDataPlain = leadsData ? JSON.parse(JSON.stringify(leadsData)) : [];
    var currencyCode = currency_1.useCurrencySettings().code;
    var formatCurrency = function (amount) {
        return new Intl.NumberFormat("en-KE", { style: "currency", currency: currencyCode }).format(amount / 100);
    };
    var formatCurrencyShort = function (amount) {
        var val = amount / 100;
        if (val >= 1000000)
            return currencyCode + " " + (val / 1000000).toFixed(1) + "M";
        if (val >= 1000)
            return currencyCode + " " + (val / 1000).toFixed(0) + "K";
        return currencyCode + " " + val.toFixed(0);
    };
    // Financial summary cards (Kiini: One Hub. Total Control style)
    var financialCards = [
        {
            label: "Payments - Today",
            value: formatCurrencyShort((financialSummaryPlain === null || financialSummaryPlain === void 0 ? void 0 : financialSummaryPlain.paymentsToday) || 0),
            icon: lucide_react_1.CreditCard,
            color: "border-b-4 border-cyan-500",
            href: "/payments"
        },
        {
            label: "Payments - Month",
            value: formatCurrencyShort((financialSummaryPlain === null || financialSummaryPlain === void 0 ? void 0 : financialSummaryPlain.paymentsMonth) || 0),
            icon: lucide_react_1.DollarSign,
            color: "border-b-4 border-blue-500",
            href: "/payments"
        },
        {
            label: "Invoices - Due",
            value: formatCurrencyShort((financialSummaryPlain === null || financialSummaryPlain === void 0 ? void 0 : financialSummaryPlain.invoicesDue) || 0),
            icon: lucide_react_1.FileText,
            color: "border-b-4 border-orange-400",
            href: "/invoices"
        },
        {
            label: "Invoices - Overdue",
            value: formatCurrencyShort((financialSummaryPlain === null || financialSummaryPlain === void 0 ? void 0 : financialSummaryPlain.invoicesOverdue) || 0),
            icon: lucide_react_1.AlertCircle,
            color: "border-b-4 border-red-500",
            href: "/invoices"
        },
    ];
    // Chart data: scale down from cents
    var monthlyChartData = react_1.useMemo(function () {
        var _a;
        if (!((_a = chartDataPlain === null || chartDataPlain === void 0 ? void 0 : chartDataPlain.months) === null || _a === void 0 ? void 0 : _a.length))
            return [];
        return chartDataPlain.months.map(function (m) { return ({
            name: m.name,
            Income: Math.round((m.income || 0) / 100),
            Expense: Math.round((m.expense || 0) / 100)
        }); });
    }, [chartDataPlain]);
    // Leads pipeline pie chart
    var LEAD_STAGES = {
        lead: { label: "New", color: "#94a3b8" },
        qualified: { label: "Qualified", color: "#3b82f6" },
        proposal: { label: "Proposal", color: "#8b5cf6" },
        negotiation: { label: "Negotiation", color: "#f59e0b" },
        closed_won: { label: "Won", color: "#22c55e" },
        closed_lost: { label: "Lost", color: "#ef4444" }
    };
    var leadsPipelineData = react_1.useMemo(function () {
        var _a;
        var counts = {};
        var leadsArr = Array.isArray(leadsDataPlain) ? leadsDataPlain : ((_a = leadsDataPlain) === null || _a === void 0 ? void 0 : _a.items) || [];
        leadsArr.forEach(function (lead) {
            var stage = lead.stage || "lead";
            counts[stage] = (counts[stage] || 0) + 1;
        });
        return Object.entries(LEAD_STAGES)
            .map(function (_a) {
            var key = _a[0], cfg = _a[1];
            return ({ name: cfg.label, value: counts[key] || 0, color: cfg.color });
        })
            .filter(function (d) { return d.value > 0; });
    }, [leadsDataPlain]);
    var totalLeads = leadsPipelineData.reduce(function (s, d) { return s + d.value; }, 0);
    var stats = react_1.useMemo(function () {
        var _a, _b, _c;
        return [
            {
                title: "Total Revenue",
                value: statsDataPlain ? formatCurrency(statsDataPlain.totalRevenue || 0) : "KES 0",
                change: (statsDataPlain === null || statsDataPlain === void 0 ? void 0 : statsDataPlain.revenueGrowth) ? "" + (statsDataPlain.revenueGrowth > 0 ? "+" : "") + statsDataPlain.revenueGrowth + "%" : "0%",
                trend: ((statsDataPlain === null || statsDataPlain === void 0 ? void 0 : statsDataPlain.revenueGrowth) || 0) >= 0 ? "up" : "down",
                icon: lucide_react_1.DollarSign,
                description: "This month",
                href: "/accounting"
            },
            {
                title: "Active Projects",
                value: ((_a = statsDataPlain === null || statsDataPlain === void 0 ? void 0 : statsDataPlain.activeProjects) === null || _a === void 0 ? void 0 : _a.toString()) || "0",
                change: (statsDataPlain === null || statsDataPlain === void 0 ? void 0 : statsDataPlain.newProjects) ? "+" + statsDataPlain.newProjects : "0",
                trend: "up",
                icon: lucide_react_1.FolderKanban,
                description: "In progress",
                href: "/projects"
            },
            {
                title: "Total Clients",
                value: ((_b = statsDataPlain === null || statsDataPlain === void 0 ? void 0 : statsDataPlain.totalClients) === null || _b === void 0 ? void 0 : _b.toString()) || "0",
                change: (statsDataPlain === null || statsDataPlain === void 0 ? void 0 : statsDataPlain.newClients) ? "+" + statsDataPlain.newClients : "0",
                trend: "up",
                icon: lucide_react_1.Users,
                description: "Active clients",
                href: "/clients"
            },
            {
                title: "Pending Invoices",
                value: ((_c = metricsDataPlain === null || metricsDataPlain === void 0 ? void 0 : metricsDataPlain.pendingInvoices) === null || _c === void 0 ? void 0 : _c.toString()) || "0",
                change: "0",
                trend: "neutral",
                icon: lucide_react_1.FileText,
                description: "Awaiting payment",
                href: "/invoices"
            },
        ];
    }, [statsDataPlain, metricsDataPlain]);
    var getActivityIcon = function (entityType) {
        switch (entityType) {
            case "project": return lucide_react_1.FolderKanban;
            case "client": return lucide_react_1.Users;
            case "invoice": return lucide_react_1.FileText;
            case "payment": return lucide_react_1.DollarSign;
            default: return lucide_react_1.Clock;
        }
    };
    var currentYear = new Date().getFullYear();
    var yearOptions = [currentYear, currentYear - 1, currentYear - 2];
    return (react_1["default"].createElement(DashboardLayout_1["default"], null,
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("h1", { className: "text-3xl font-bold tracking-tight" }, "Dashboard"),
                    react_1["default"].createElement("p", { className: "text-muted-foreground" }, "Welcome back! Here's what's happening with your business.")),
                react_1["default"].createElement(button_1.Button, { onClick: function () { return navigate("/projects/create"); } },
                    react_1["default"].createElement(lucide_react_1.FolderKanban, { className: "mr-2 h-4 w-4" }),
                    "New Project")),
            react_1["default"].createElement("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4" }, financialCards.map(function (card) {
                var Icon = card.icon;
                return (react_1["default"].createElement(card_1.Card, { key: card.label, className: card.color + " cursor-pointer hover:shadow-lg transition-shadow", onClick: function () { return navigate(card.href); } },
                    react_1["default"].createElement(card_1.CardContent, { className: "pt-6" },
                        react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, card.label),
                                react_1["default"].createElement("p", { className: "text-2xl font-bold mt-1" }, card.value)),
                            react_1["default"].createElement(Icon, { className: "h-8 w-8 text-muted-foreground opacity-40" })))));
            })),
            react_1["default"].createElement("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4" }, stats.map(function (stat) {
                var Icon = stat.icon;
                return (react_1["default"].createElement(card_1.Card, { key: stat.title, className: "cursor-pointer hover:shadow-lg transition-shadow", onClick: function () { return navigate(stat.href); } },
                    react_1["default"].createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium" }, stat.title),
                        react_1["default"].createElement(Icon, { className: "h-4 w-4 text-muted-foreground" })),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "text-2xl font-bold" }, stat.value),
                        react_1["default"].createElement("div", { className: "flex items-center gap-2 text-xs text-muted-foreground" },
                            react_1["default"].createElement("span", { className: "flex items-center " + (stat.trend === "up" ? "text-green-500" :
                                    stat.trend === "down" ? "text-red-500" :
                                        "") },
                                stat.trend === "up" && react_1["default"].createElement(lucide_react_1.TrendingUp, { className: "mr-1 h-3 w-3" }),
                                stat.trend === "down" && react_1["default"].createElement(lucide_react_1.TrendingDown, { className: "mr-1 h-3 w-3" }),
                                stat.change),
                            react_1["default"].createElement("span", null, stat.description)))));
            })),
            react_1["default"].createElement("div", { className: "grid gap-6 md:grid-cols-3" },
                react_1["default"].createElement(card_1.Card, { className: "md:col-span-2 cursor-pointer hover:shadow-lg transition-shadow", onClick: function () { return navigate("/accounting"); } },
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement(card_1.CardTitle, null, "Income vs Expenses"),
                                react_1["default"].createElement(card_1.CardDescription, null, "Monthly financial performance")),
                            react_1["default"].createElement(select_1.Select, { value: String(chartYear), onValueChange: function (v) { return setChartYear(Number(v)); } },
                                react_1["default"].createElement(select_1.SelectTrigger, { className: "w-24" },
                                    react_1["default"].createElement(select_1.SelectValue, null)),
                                react_1["default"].createElement(select_1.SelectContent, null, yearOptions.map(function (y) { return (react_1["default"].createElement(select_1.SelectItem, { key: y, value: String(y) }, y)); }))))),
                    react_1["default"].createElement(card_1.CardContent, null, monthlyChartData.length === 0 ? (react_1["default"].createElement("div", { className: "flex items-center justify-center h-[260px] text-muted-foreground text-sm" },
                        "No financial data for ",
                        chartYear)) : (react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 260 },
                        react_1["default"].createElement(recharts_1.BarChart, { data: monthlyChartData, margin: { top: 5, right: 10, left: 10, bottom: 5 } },
                            react_1["default"].createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3", className: "stroke-muted" }),
                            react_1["default"].createElement(recharts_1.XAxis, { dataKey: "name", tick: { fontSize: 11 } }),
                            react_1["default"].createElement(recharts_1.YAxis, { tick: { fontSize: 11 }, tickFormatter: function (v) { return v >= 1000 ? (v / 1000).toFixed(0) + "K" : String(v); } }),
                            react_1["default"].createElement(recharts_1.Tooltip, { formatter: function (value, name) { return [
                                    currencyCode + " " + value.toLocaleString(),
                                    name,
                                ]; } }),
                            react_1["default"].createElement(recharts_1.Legend, null),
                            react_1["default"].createElement(recharts_1.Bar, { dataKey: "Income", fill: "#3b82f6", radius: [4, 4, 0, 0] }),
                            react_1["default"].createElement(recharts_1.Bar, { dataKey: "Expense", fill: "#ef4444", radius: [4, 4, 0, 0] })))))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                            react_1["default"].createElement(card_1.CardTitle, null, "Leads Pipeline"),
                            react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return navigate("/leads"); } },
                                "View All",
                                react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "ml-1 h-3 w-3" }))),
                        react_1["default"].createElement(card_1.CardDescription, null,
                            totalLeads,
                            " lead",
                            totalLeads !== 1 ? "s" : "",
                            " by stage")),
                    react_1["default"].createElement(card_1.CardContent, null, leadsPipelineData.length === 0 ? (react_1["default"].createElement("div", { className: "flex flex-col items-center justify-center h-[240px] text-muted-foreground" },
                        react_1["default"].createElement(lucide_react_1.Target, { className: "h-10 w-10 mb-2 opacity-25" }),
                        react_1["default"].createElement("p", { className: "text-sm" }, "No leads yet"),
                        react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "mt-2", onClick: function () { return navigate("/leads"); } }, "Add your first lead"))) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                        react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 180 },
                            react_1["default"].createElement(recharts_1.PieChart, null,
                                react_1["default"].createElement(recharts_1.Pie, { data: leadsPipelineData, cx: "50%", cy: "50%", innerRadius: 50, outerRadius: 75, paddingAngle: 3, dataKey: "value" }, leadsPipelineData.map(function (entry, i) { return (react_1["default"].createElement(recharts_1.Cell, { key: i, fill: entry.color })); })),
                                react_1["default"].createElement(recharts_1.Tooltip, { formatter: function (v, n) { return [v, n]; } }))),
                        react_1["default"].createElement("div", { className: "space-y-1.5 mt-2" }, leadsPipelineData.map(function (d) { return (react_1["default"].createElement("div", { key: d.name, className: "flex items-center justify-between text-xs" },
                            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                                react_1["default"].createElement("div", { className: "w-2.5 h-2.5 rounded-full shrink-0", style: { backgroundColor: d.color } }),
                                react_1["default"].createElement("span", null, d.name)),
                            react_1["default"].createElement("span", { className: "font-medium" }, d.value))); }))))))),
            react_1["default"].createElement("div", { className: "grid gap-6 md:grid-cols-2" },
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement(card_1.CardTitle, null, "Recent Projects"),
                                react_1["default"].createElement(card_1.CardDescription, null, "Your active and upcoming projects")),
                            react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return navigate("/projects"); } },
                                "View All",
                                react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "ml-2 h-4 w-4" })))),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "space-y-4" }, recentProjectsPlain.length === 0 ? (react_1["default"].createElement("p", { className: "text-sm text-muted-foreground text-center py-4" }, "No projects found")) : (recentProjectsPlain.map(function (project) { return (react_1["default"].createElement("div", { key: project.id, className: "space-y-2 cursor-pointer hover:bg-accent/50 p-2 rounded-md transition-colors", onClick: function () { return navigate("/projects/" + project.id); } },
                            react_1["default"].createElement("div", { className: "flex items-start justify-between" },
                                react_1["default"].createElement("div", { className: "space-y-1" },
                                    react_1["default"].createElement("p", { className: "font-medium" }, project.name),
                                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, project.projectNumber)),
                                react_1["default"].createElement("div", { className: "flex items-center gap-2 text-sm text-muted-foreground" },
                                    react_1["default"].createElement(lucide_react_1.Calendar, { className: "h-3 w-3" }),
                                    project.endDate ? new Date(project.endDate).toLocaleDateString() : "No date")),
                            react_1["default"].createElement("div", { className: "space-y-1" },
                                react_1["default"].createElement("div", { className: "flex items-center justify-between text-xs" },
                                    react_1["default"].createElement("span", { className: "text-muted-foreground" }, "Progress"),
                                    react_1["default"].createElement("span", { className: "font-medium" },
                                        project.progress || 0,
                                        "%")),
                                react_1["default"].createElement("div", { className: "h-2 bg-muted rounded-full overflow-hidden" },
                                    react_1["default"].createElement("div", { className: "h-full bg-primary transition-all", style: { width: (project.progress || 0) + "%" } }))))); }))))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Recent Activity"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Latest updates and changes")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "space-y-4" }, recentActivityPlain.length === 0 ? (react_1["default"].createElement("p", { className: "text-sm text-muted-foreground text-center py-4" }, "No recent activity")) : (recentActivityPlain.map(function (activity, index) {
                            var Icon = getActivityIcon(activity.entityType || "");
                            return (react_1["default"].createElement("div", { key: activity.id || index, className: "flex gap-3" },
                                react_1["default"].createElement("div", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-muted" },
                                    react_1["default"].createElement(Icon, { className: "h-4 w-4" })),
                                react_1["default"].createElement("div", { className: "flex-1 space-y-1" },
                                    react_1["default"].createElement("p", { className: "text-sm font-medium" }, (activity.action || '').replace(/_/g, ' ')),
                                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, (activity.description || '')),
                                    react_1["default"].createElement("div", { className: "flex items-center gap-1 text-xs text-muted-foreground" },
                                        react_1["default"].createElement(lucide_react_1.Clock, { className: "h-3 w-3" }),
                                        activity.createdAt ? date_fns_1.formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true }) : "recently"))));
                        })))))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, null, "Quick Actions"),
                    react_1["default"].createElement(card_1.CardDescription, null, "Common tasks and shortcuts")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("div", { className: "grid gap-4 md:grid-cols-6" },
                        react_1["default"].createElement(button_1.Button, { variant: "outline", className: "h-auto flex-col gap-2 py-4", onClick: function () { return navigate("/clients/create"); } },
                            react_1["default"].createElement(lucide_react_1.Users, { className: "h-6 w-6" }),
                            react_1["default"].createElement("span", { className: "text-xs text-center" }, "Add Client")),
                        react_1["default"].createElement(button_1.Button, { variant: "outline", className: "h-auto flex-col gap-2 py-4", onClick: function () { return navigate("/projects/create"); } },
                            react_1["default"].createElement(lucide_react_1.FolderKanban, { className: "h-6 w-6" }),
                            react_1["default"].createElement("span", { className: "text-xs text-center" }, "New Project")),
                        react_1["default"].createElement(button_1.Button, { variant: "outline", className: "h-auto flex-col gap-2 py-4", onClick: function () { return navigate("/invoices/create"); } },
                            react_1["default"].createElement(lucide_react_1.FileText, { className: "h-6 w-6" }),
                            react_1["default"].createElement("span", { className: "text-xs text-center" }, "Create Invoice")),
                        react_1["default"].createElement(button_1.Button, { variant: "outline", className: "h-auto flex-col gap-2 py-4", onClick: function () { return navigate("/estimates/create"); } },
                            react_1["default"].createElement(lucide_react_1.FileSpreadsheet, { className: "h-6 w-6" }),
                            react_1["default"].createElement("span", { className: "text-xs text-center" }, "New Estimate")),
                        react_1["default"].createElement(button_1.Button, { variant: "outline", className: "h-auto flex-col gap-2 py-4", onClick: function () { return navigate("/receipts/create"); } },
                            react_1["default"].createElement(lucide_react_1.Receipt, { className: "h-6 w-6" }),
                            react_1["default"].createElement("span", { className: "text-xs text-center" }, "New Receipt")),
                        react_1["default"].createElement(button_1.Button, { variant: "outline", className: "h-auto flex-col gap-2 py-4", onClick: function () { return navigate("/leads"); } },
                            react_1["default"].createElement(lucide_react_1.Target, { className: "h-6 w-6" }),
                            react_1["default"].createElement("span", { className: "text-xs text-center" }, "Add Lead"))))))));
}
exports["default"] = Dashboard;
