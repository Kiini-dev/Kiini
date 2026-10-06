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
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var checkbox_1 = require("@/components/ui/checkbox");
var label_1 = require("@/components/ui/label");
var tabs_1 = require("@/components/ui/tabs");
var scroll_area_1 = require("@/components/ui/scroll-area");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var utils_1 = require("@/lib/utils");
var trpc_1 = require("@/lib/trpc");
var AVAILABLE_WIDGETS = {
    // Finance Widgets
    revenueMetrics: {
        id: "revenue",
        title: "Revenue Metrics",
        description: "Monthly revenue and income summary",
        icon: React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4" }),
        category: "finance",
        enabled: true,
        size: "medium",
        order: 1
    },
    expenseTracker: {
        id: "expenses",
        title: "Expense Tracker",
        description: "Track business expenses and budgets",
        icon: React.createElement(lucide_react_1.Wallet, { className: "h-4 w-4" }),
        category: "finance",
        enabled: false,
        size: "medium",
        order: 2
    },
    invoiceStatus: {
        id: "invoices",
        title: "Invoice Status",
        description: "Pending and overdue invoices",
        icon: React.createElement(lucide_react_1.FileText, { className: "h-4 w-4" }),
        category: "finance",
        enabled: false,
        size: "small",
        order: 3
    },
    paymentMethods: {
        id: "payments",
        title: "Payment Methods",
        description: "Manage payment processing",
        icon: React.createElement(lucide_react_1.CreditCard, { className: "h-4 w-4" }),
        category: "finance",
        enabled: false,
        size: "small",
        order: 4
    },
    financialSummary: {
        id: "financialSummary",
        title: "Financial Summary",
        description: "Complete financial overview",
        icon: React.createElement(lucide_react_1.BarChart3, { className: "h-4 w-4" }),
        category: "finance",
        enabled: false,
        size: "large",
        order: 5
    },
    budgetAllocation: {
        id: "budget",
        title: "Budget Allocation",
        description: "Department budget tracking",
        icon: React.createElement(lucide_react_1.PieChart, { className: "h-4 w-4" }),
        category: "finance",
        enabled: false,
        size: "large",
        order: 6
    },
    // HR Widgets
    employeeOverview: {
        id: "employees",
        title: "Employee Overview",
        description: "Total employees and department breakdown",
        icon: React.createElement(lucide_react_1.Users, { className: "h-4 w-4" }),
        category: "hr",
        enabled: true,
        size: "medium",
        order: 7
    },
    attendanceTracker: {
        id: "attendance",
        title: "Attendance Tracker",
        description: "Employee attendance and absences",
        icon: React.createElement(lucide_react_1.Calendar, { className: "h-4 w-4" }),
        category: "hr",
        enabled: false,
        size: "medium",
        order: 8
    },
    leaveRequests: {
        id: "leaves",
        title: "Leave Requests",
        description: "Pending and approved leave requests",
        icon: React.createElement(lucide_react_1.Heart, { className: "h-4 w-4" }),
        category: "hr",
        enabled: false,
        size: "small",
        order: 9
    },
    payrollSummary: {
        id: "payroll",
        title: "Payroll Summary",
        description: "Payroll processing and status",
        icon: React.createElement(lucide_react_1.Wallet, { className: "h-4 w-4" }),
        category: "hr",
        enabled: false,
        size: "medium",
        order: 10
    },
    performanceReviews: {
        id: "reviews",
        title: "Performance Reviews",
        description: "Employee reviews and ratings",
        icon: React.createElement(lucide_react_1.Award, { className: "h-4 w-4" }),
        category: "hr",
        enabled: false,
        size: "medium",
        order: 11
    },
    departmentStats: {
        id: "departments",
        title: "Department Statistics",
        description: "Department headcount and metrics",
        icon: React.createElement(lucide_react_1.BarChart3, { className: "h-4 w-4" }),
        category: "hr",
        enabled: false,
        size: "medium",
        order: 12
    },
    // Sales Widgets
    activeProjects: {
        id: "projects",
        title: "Active Projects",
        description: "Current projects and milestones",
        icon: React.createElement(lucide_react_1.FolderKanban, { className: "h-4 w-4" }),
        category: "sales",
        enabled: true,
        size: "medium",
        order: 13
    },
    salesTrend: {
        id: "salesTrend",
        title: "Sales Trend",
        description: "Sales performance over time",
        icon: React.createElement(lucide_react_1.TrendingUp, { className: "h-4 w-4" }),
        category: "sales",
        enabled: false,
        size: "large",
        order: 14
    },
    salesPipeline: {
        id: "pipeline",
        title: "Sales Pipeline",
        description: "Deal stages and conversion rates",
        icon: React.createElement(lucide_react_1.LineChart, { className: "h-4 w-4" }),
        category: "sales",
        enabled: false,
        size: "large",
        order: 15
    },
    clientMetrics: {
        id: "clients",
        title: "Client Metrics",
        description: "Customer acquisition and retention",
        icon: React.createElement(lucide_react_1.Users, { className: "h-4 w-4" }),
        category: "sales",
        enabled: false,
        size: "medium",
        order: 16
    },
    quoteTracker: {
        id: "quotes",
        title: "Quote Tracker",
        description: "Pending and accepted quotes",
        icon: React.createElement(lucide_react_1.FileText, { className: "h-4 w-4" }),
        category: "sales",
        enabled: false,
        size: "small",
        order: 17
    },
    // Operations Widgets
    recentActivities: {
        id: "activities",
        title: "Recent Activities",
        description: "Latest system activities and events",
        icon: React.createElement(lucide_react_1.Clock, { className: "h-4 w-4" }),
        category: "operations",
        enabled: true,
        size: "medium",
        order: 18
    },
    pendingApprovals: {
        id: "approvals",
        title: "Pending Approvals",
        description: "Documents awaiting approval",
        icon: React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4" }),
        category: "operations",
        enabled: false,
        size: "small",
        order: 19
    },
    completedTasks: {
        id: "tasks",
        title: "Completed Tasks",
        description: "Task completion summary",
        icon: React.createElement(lucide_react_1.CheckCircle2, { className: "h-4 w-4" }),
        category: "operations",
        enabled: false,
        size: "small",
        order: 20
    },
    inventorySummary: {
        id: "inventory",
        title: "Inventory Summary",
        description: "Stock levels and movements",
        icon: React.createElement(lucide_react_1.Database, { className: "h-4 w-4" }),
        category: "operations",
        enabled: false,
        size: "medium",
        order: 21
    },
    notifications: {
        id: "notifications",
        title: "Notifications",
        description: "System alerts and notifications",
        icon: React.createElement(lucide_react_1.Bell, { className: "h-4 w-4" }),
        category: "operations",
        enabled: false,
        size: "small",
        order: 22
    },
    communications: {
        id: "communications",
        title: "Communications",
        description: "Messages and bulk communications",
        icon: React.createElement(lucide_react_1.Mail, { className: "h-4 w-4" }),
        category: "operations",
        enabled: false,
        size: "medium",
        order: 23
    },
    // Analytics Widgets
    performanceMetrics: {
        id: "performance",
        title: "Performance Metrics",
        description: "KPIs and performance indicators",
        icon: React.createElement(lucide_react_1.TrendingUp, { className: "h-4 w-4" }),
        category: "analytics",
        enabled: false,
        size: "large",
        order: 24
    },
    analyticsOverview: {
        id: "analytics",
        title: "Analytics Overview",
        description: "System usage and analytics",
        icon: React.createElement(lucide_react_1.BarChart3, { className: "h-4 w-4" }),
        category: "analytics",
        enabled: false,
        size: "large",
        order: 25
    },
    reportScheduler: {
        id: "reports",
        title: "Report Scheduler",
        description: "Scheduled reports and exports",
        icon: React.createElement(lucide_react_1.FileText, { className: "h-4 w-4" }),
        category: "analytics",
        enabled: false,
        size: "medium",
        order: 26
    },
    dataInsights: {
        id: "insights",
        title: "Data Insights",
        description: "Key insights from data analysis",
        icon: React.createElement(lucide_react_1.ZoomIn, { className: "h-4 w-4" }),
        category: "analytics",
        enabled: false,
        size: "medium",
        order: 27
    },
    customDashboard: {
        id: "custom",
        title: "Custom Widgets",
        description: "Create and manage custom widgets",
        icon: React.createElement(lucide_react_1.Settings, { className: "h-4 w-4" }),
        category: "analytics",
        enabled: false,
        size: "medium",
        order: 28
    },
    // New Finance Widgets
    cashFlowAnalysis: {
        id: "cashflow",
        title: "Cash Flow Analysis",
        description: "Cash inflows and outflows tracking",
        icon: React.createElement(lucide_react_1.ArrowUpRight, { className: "h-4 w-4" }),
        category: "finance",
        enabled: false,
        size: "large",
        order: 29
    },
    profitLossStatement: {
        id: "profitloss",
        title: "Profit & Loss Statement",
        description: "P&L overview and trends",
        icon: React.createElement(lucide_react_1.TrendingUp, { className: "h-4 w-4" }),
        category: "finance",
        enabled: false,
        size: "large",
        order: 30
    },
    accountsReceivable: {
        id: "receivables",
        title: "Accounts Receivable",
        description: "Outstanding invoices aging",
        icon: React.createElement(lucide_react_1.Clock, { className: "h-4 w-4" }),
        category: "finance",
        enabled: false,
        size: "medium",
        order: 31
    },
    vendorPayments: {
        id: "vendors",
        title: "Vendor Payments",
        description: "Supplier payment tracking",
        icon: React.createElement(lucide_react_1.CreditCard, { className: "h-4 w-4" }),
        category: "finance",
        enabled: false,
        size: "medium",
        order: 32
    },
    taxCompliance: {
        id: "taxes",
        title: "Tax Compliance",
        description: "Tax status and filings",
        icon: React.createElement(lucide_react_1.FileText, { className: "h-4 w-4" }),
        category: "finance",
        enabled: false,
        size: "small",
        order: 33
    },
    // New HR Widgets
    trainingDevelopment: {
        id: "training",
        title: "Training & Development",
        description: "Employee training programs",
        icon: React.createElement(lucide_react_1.GraduationCap, { className: "h-4 w-4" }),
        category: "hr",
        enabled: false,
        size: "medium",
        order: 34
    },
    employeeBenefits: {
        id: "benefits",
        title: "Employee Benefits",
        description: "Benefits enrollment and claims",
        icon: React.createElement(lucide_react_1.Heart, { className: "h-4 w-4" }),
        category: "hr",
        enabled: false,
        size: "medium",
        order: 35
    },
    recruitmentPipeline: {
        id: "recruitment",
        title: "Recruitment Pipeline",
        description: "Open positions and candidates",
        icon: React.createElement(lucide_react_1.Briefcase, { className: "h-4 w-4" }),
        category: "hr",
        enabled: false,
        size: "large",
        order: 36
    },
    teamUtilization: {
        id: "utilization",
        title: "Team Utilization Rate",
        description: "Resource allocation and capacity",
        icon: React.createElement(lucide_react_1.Gauge, { className: "h-4 w-4" }),
        category: "hr",
        enabled: false,
        size: "medium",
        order: 37
    },
    skillsGapAnalysis: {
        id: "skills",
        title: "Skills Gap Analysis",
        description: "Identify training needs",
        icon: React.createElement(lucide_react_1.Target, { className: "h-4 w-4" }),
        category: "hr",
        enabled: false,
        size: "medium",
        order: 38
    },
    // New Sales Widgets
    customerLifetimeValue: {
        id: "ltv",
        title: "Customer Lifetime Value",
        description: "Customer profitability analysis",
        icon: React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4" }),
        category: "sales",
        enabled: false,
        size: "medium",
        order: 39
    },
    conversionFunnel: {
        id: "funnel",
        title: "Conversion Funnel",
        description: "Sales funnel analysis",
        icon: React.createElement(lucide_react_1.Layers, { className: "h-4 w-4" }),
        category: "sales",
        enabled: false,
        size: "large",
        order: 40
    },
    salesRepLeaderboard: {
        id: "leaderboard",
        title: "Sales Rep Leaderboard",
        description: "Top performing sales representatives",
        icon: React.createElement(lucide_react_1.Award, { className: "h-4 w-4" }),
        category: "sales",
        enabled: false,
        size: "medium",
        order: 41
    },
    lostDealAnalysis: {
        id: "lost-deals",
        title: "Lost Deal Analysis",
        description: "Reasons and patterns for lost sales",
        icon: React.createElement(lucide_react_1.TrendingDown, { className: "h-4 w-4" }),
        category: "sales",
        enabled: false,
        size: "medium",
        order: 42
    },
    territoryPerformance: {
        id: "territory",
        title: "Territory Performance",
        description: "Regional sales metrics",
        icon: React.createElement(lucide_react_1.Target, { className: "h-4 w-4" }),
        category: "sales",
        enabled: false,
        size: "medium",
        order: 43
    },
    // New Operations Widgets
    systemHealthMonitor: {
        id: "health",
        title: "System Health Monitor",
        description: "Server and application health",
        icon: React.createElement(lucide_react_1.Zap, { className: "h-4 w-4" }),
        category: "operations",
        enabled: false,
        size: "small",
        order: 44
    },
    documentWorkflow: {
        id: "workflow",
        title: "Document Workflow Status",
        description: "Document routing and status tracking",
        icon: React.createElement(lucide_react_1.FileText, { className: "h-4 w-4" }),
        category: "operations",
        enabled: false,
        size: "medium",
        order: 45
    },
    userActivityLog: {
        id: "activity-log",
        title: "User Activity Log",
        description: "User actions and audit trail",
        icon: React.createElement(lucide_react_1.Activity, { className: "h-4 w-4" }),
        category: "operations",
        enabled: false,
        size: "small",
        order: 46
    },
    backupRecovery: {
        id: "backup",
        title: "Backup & Recovery Status",
        description: "Data backup and restoration monitoring",
        icon: React.createElement(lucide_react_1.HardDrive, { className: "h-4 w-4" }),
        category: "operations",
        enabled: false,
        size: "small",
        order: 47
    },
    integrationHealth: {
        id: "integrations",
        title: "Integration Health Check",
        description: "Third-party integrations status",
        icon: React.createElement(lucide_react_1.Network, { className: "h-4 w-4" }),
        category: "operations",
        enabled: false,
        size: "small",
        order: 48
    },
    // New Analytics Widgets
    customReportBuilder: {
        id: "report-builder",
        title: "Custom Report Builder",
        description: "Build and schedule custom reports",
        icon: React.createElement(lucide_react_1.FileText, { className: "h-4 w-4" }),
        category: "analytics",
        enabled: false,
        size: "large",
        order: 49
    },
    predictiveAnalytics: {
        id: "predictive",
        title: "Predictive Analytics",
        description: "Forecasting and trend predictions",
        icon: React.createElement(lucide_react_1.Sparkles, { className: "h-4 w-4" }),
        category: "analytics",
        enabled: false,
        size: "large",
        order: 50
    },
    dataQualityScore: {
        id: "quality",
        title: "Data Quality Score",
        description: "Data integrity and quality metrics",
        icon: React.createElement(lucide_react_1.Microscope, { className: "h-4 w-4" }),
        category: "analytics",
        enabled: false,
        size: "medium",
        order: 51
    },
    exportScheduling: {
        id: "export",
        title: "Export & Scheduling",
        description: "Automated exports and scheduling",
        icon: React.createElement(lucide_react_1.RefreshCw, { className: "h-4 w-4" }),
        category: "analytics",
        enabled: false,
        size: "small",
        order: 52
    },
    realtimeDashboards: {
        id: "realtime",
        title: "Real-time Dashboards",
        description: "Live data updates and visualizations",
        icon: React.createElement(lucide_react_1.Gauge, { className: "h-4 w-4" }),
        category: "analytics",
        enabled: false,
        size: "large",
        order: 53
    }
};
var CATEGORIES = [
    { id: "finance", label: "Finance", icon: lucide_react_1.DollarSign },
    { id: "hr", label: "HR & Team", icon: lucide_react_1.Users },
    { id: "sales", label: "Sales", icon: lucide_react_1.TrendingUp },
    { id: "operations", label: "Operations", icon: lucide_react_1.AlertCircle },
    { id: "analytics", label: "Analytics", icon: lucide_react_1.BarChart3 },
];
function CustomHomepageBuilder() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = react_1.useState(AVAILABLE_WIDGETS), widgets = _b[0], setWidgets = _b[1];
    var _c = react_1.useState("finance"), selectedCategory = _c[0], setSelectedCategory = _c[1];
    var _d = react_1.useState(false), hasChanges = _d[0], setHasChanges = _d[1];
    var _e = react_1.useState(true), isLoading = _e[0], setIsLoading = _e[1];
    // Load config from API
    var _f = trpc_1.trpc.customHomepage.getConfig.useQuery(), configData = _f.data, isLoadingConfig = _f.isLoading;
    var saveMutation = trpc_1.trpc.customHomepage.saveConfig.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Dashboard layout saved successfully!");
            setHasChanges(false);
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to save: " + error.message);
        }
    });
    var resetMutation = trpc_1.trpc.customHomepage.resetToDefault.useMutation({
        onSuccess: function (data) {
            // Transform API response to widget record format
            var widgetRecord = {};
            data.config.widgets.forEach(function (w) {
                widgetRecord[w.id] = {
                    id: w.id,
                    title: w.title,
                    description: w.description,
                    icon: getIconForCategory(w.category),
                    category: w.category,
                    enabled: w.enabled,
                    size: w.size,
                    order: w.order
                };
            });
            setWidgets(widgetRecord);
            setHasChanges(false);
            sonner_1.toast.success(data.message);
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to reset: " + error.message);
        }
    });
    react_1.useEffect(function () {
        if (configData) {
            // Transform API response to widget record format
            var widgetRecord_1 = {};
            configData.widgets.forEach(function (w) {
                widgetRecord_1[w.id] = {
                    id: w.id,
                    title: w.title,
                    description: w.description,
                    icon: getIconForCategory(w.category),
                    category: w.category,
                    enabled: w.enabled,
                    size: w.size,
                    order: w.order
                };
            });
            setWidgets(widgetRecord_1);
        }
        setIsLoading(false);
    }, [configData]);
    var getIconForCategory = function (category) {
        switch (category) {
            case "finance":
                return React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4" });
            case "hr":
                return React.createElement(lucide_react_1.Users, { className: "h-4 w-4" });
            case "sales":
                return React.createElement(lucide_react_1.TrendingUp, { className: "h-4 w-4" });
            case "operations":
                return React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4" });
            case "analytics":
                return React.createElement(lucide_react_1.BarChart3, { className: "h-4 w-4" });
            default:
                return React.createElement(lucide_react_1.BarChart3, { className: "h-4 w-4" });
        }
    };
    var handleToggleWidget = function (widgetId) {
        setWidgets(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[widgetId] = __assign(__assign({}, prev[widgetId]), { enabled: !prev[widgetId].enabled }), _a)));
        });
        setHasChanges(true);
    };
    var handleSave = function () {
        var widgetsArray = Object.values(widgets).map(function (w) { return ({
            id: w.id,
            title: w.title,
            description: w.description,
            category: w.category,
            enabled: w.enabled,
            size: w.size,
            order: w.order
        }); });
        saveMutation.mutate({ widgets: widgetsArray });
    };
    var handleReset = function () {
        if (confirm("Reset to default dashboard layout?")) {
            resetMutation.mutate();
        }
    };
    if (isLoading || isLoadingConfig) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Homepage Builder", description: "Customize your dashboard homepage with widgets and cards", icon: React.createElement(lucide_react_1.Layout, { className: "w-6 h-6" }), breadcrumbs: [
                { label: "Dashboard", href: "/" },
                { label: "Settings", href: "/settings" },
                { label: "Homepage Builder" },
            ] },
            React.createElement("div", { className: "flex items-center justify-center p-8" },
                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))));
    }
    var enabledCount = Object.values(widgets).filter(function (w) { return w.enabled; }).length;
    var categoryWidgets = Object.values(widgets).filter(function (w) { return w.category === selectedCategory; });
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Homepage Builder", description: "Customize your dashboard homepage with widgets and cards", icon: React.createElement(lucide_react_1.Layout, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Settings", href: "/settings" },
            { label: "Homepage Builder" },
        ] },
        React.createElement("div", { className: "space-y-6 max-w-5xl" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", null,
                    React.createElement("h2", { className: "text-2xl font-bold" }, "Customize Your Dashboard"),
                    React.createElement("p", { className: "text-sm text-muted-foreground mt-1" }, "Select which widgets you want to see on your homepage. You can preview changes and reorder them.")),
                React.createElement("div", { className: "flex gap-2" },
                    React.createElement(button_1.Button, { variant: "outline", onClick: handleReset, disabled: resetMutation.isPending },
                        React.createElement(lucide_react_1.RotateCcw, { className: "h-4 w-4 mr-2" }),
                        "Reset"),
                    React.createElement(button_1.Button, { onClick: handleSave, disabled: !hasChanges || saveMutation.isPending }, saveMutation.isPending ? (React.createElement(React.Fragment, null,
                        React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
                        "Saving...")) : (React.createElement(React.Fragment, null,
                        React.createElement(lucide_react_1.Save, { className: "h-4 w-4 mr-2" }),
                        "Save Changes"))))),
            React.createElement(card_1.Card, { className: "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800" },
                React.createElement(card_1.CardContent, { className: "pt-6" },
                    React.createElement("div", { className: "grid grid-cols-3 gap-4" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Enabled Widgets"),
                            React.createElement("p", { className: "text-3xl font-bold text-blue-600 dark:text-blue-400" }, enabledCount)),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Total Available"),
                            React.createElement("p", { className: "text-3xl font-bold text-indigo-600 dark:text-indigo-400" }, Object.keys(widgets).length)),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Unsaved Changes"),
                            React.createElement("p", { className: "text-3xl font-bold " + (hasChanges
                                    ? "text-orange-600 dark:text-orange-400"
                                    : "text-green-600 dark:text-green-400") }, hasChanges ? "Yes" : "No"))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" }),
                        "Widget Selection"),
                    React.createElement(card_1.CardDescription, null, "Choose which widgets to display on your homepage")),
                React.createElement(card_1.CardContent, null,
                    React.createElement(tabs_1.Tabs, { value: selectedCategory, onValueChange: setSelectedCategory },
                        React.createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-5" }, CATEGORIES.map(function (cat) {
                            var Icon = cat.icon;
                            var catWidgets = Object.values(widgets).filter(function (w) { return w.category === cat.id; });
                            var enabledInCat = catWidgets.filter(function (w) { return w.enabled; }).length;
                            return (React.createElement(tabs_1.TabsTrigger, { key: cat.id, value: cat.id, className: "relative" },
                                React.createElement("div", { className: "flex items-center gap-1" },
                                    React.createElement(Icon, { className: "h-4 w-4" }),
                                    React.createElement("span", { className: "text-xs" }, cat.label)),
                                enabledInCat > 0 && (React.createElement("span", { className: "absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" }, enabledInCat))));
                        })),
                        CATEGORIES.map(function (cat) { return (React.createElement(tabs_1.TabsContent, { key: cat.id, value: cat.id, className: "space-y-3" },
                            categoryWidgets.map(function (widget) { return (React.createElement("div", { key: widget.id, className: utils_1.cn("flex items-start gap-4 p-4 border rounded-lg transition-all", widget.enabled
                                    ? "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                                    : "bg-muted/50 border-muted") },
                                React.createElement(checkbox_1.Checkbox, { id: widget.id, checked: widget.enabled, onCheckedChange: function () { return handleToggleWidget(widget.id); }, className: "mt-1" }),
                                React.createElement("div", { className: "flex-1" },
                                    React.createElement(label_1.Label, { htmlFor: widget.id, className: "cursor-pointer flex items-center gap-2" },
                                        widget.icon,
                                        React.createElement("span", { className: "font-medium" }, widget.title)),
                                    React.createElement("p", { className: "text-sm text-muted-foreground mt-1" }, widget.description),
                                    React.createElement("div", { className: "flex gap-2 mt-2" },
                                        React.createElement("span", { className: "text-xs bg-primary/10 text-primary px-2 py-1 rounded" },
                                            widget.size.charAt(0).toUpperCase() + widget.size.slice(1),
                                            " ",
                                            "widget"),
                                        widget.enabled && (React.createElement("span", { className: "text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 px-2 py-1 rounded" }, "\u2713 Enabled")))))); }),
                            categoryWidgets.length === 0 && (React.createElement("div", { className: "text-center py-8 text-muted-foreground" },
                                React.createElement("p", null, "No widgets in this category"))))); })))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" }),
                        "Preview"),
                    React.createElement(card_1.CardDescription, null, "Here's how your dashboard will look with the selected widgets")),
                React.createElement(card_1.CardContent, null,
                    React.createElement(scroll_area_1.ScrollArea, { className: "h-96 w-full pr-4" },
                        React.createElement("div", { className: "space-y-3" },
                            Object.values(widgets)
                                .filter(function (w) { return w.enabled; })
                                .sort(function (a, b) { return a.order - b.order; })
                                .map(function (widget) { return (React.createElement("div", { key: widget.id, className: utils_1.cn("p-4 border rounded-lg bg-card", widget.size === "large"
                                    ? "col-span-2"
                                    : widget.size === "medium"
                                        ? "col-span-1"
                                        : "col-span-1") },
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    widget.icon,
                                    React.createElement("h3", { className: "font-medium" }, widget.title)),
                                React.createElement("p", { className: "text-xs text-muted-foreground mt-1" }, widget.description))); }),
                            enabledCount === 0 && (React.createElement("div", { className: "text-center py-12 text-muted-foreground" },
                                React.createElement(lucide_react_1.AlertCircle, { className: "h-8 w-8 mx-auto mb-2 opacity-50" }),
                                React.createElement("p", null, "No widgets selected. Select widgets above to preview."))))))),
            hasChanges && (React.createElement(card_1.Card, { className: "border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950" },
                React.createElement(card_1.CardContent, { className: "pt-6 flex items-center justify-between" },
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.AlertCircle, { className: "h-5 w-5 text-orange-600" }),
                        React.createElement("p", { className: "text-sm text-orange-900 dark:text-orange-100" }, "You have unsaved changes. Click \"Save Changes\" to apply your customizations.")),
                    React.createElement(button_1.Button, { onClick: handleSave, className: "gap-2" },
                        React.createElement(lucide_react_1.Save, { className: "h-4 w-4" }),
                        "Save Now")))))));
}
exports["default"] = CustomHomepageBuilder;
