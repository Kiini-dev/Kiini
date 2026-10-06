"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgDashboardShell_1 = require("@/components/OrgDashboardShell");
var useAuthWithPersistence_1 = require("@/_core/hooks/useAuthWithPersistence");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
function OrgEmployeeDashboard() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _m = wouter_1.useLocation(), setLocation = _m[1];
    var user = useAuthWithPersistence_1.useAuthWithPersistence().user;
    var analytics = trpc_1.trpc.multiTenancy.getOrgAnalytics.useQuery(undefined, {
        staleTime: 60000
    }).data;
    var orgData = trpc_1.trpc.multiTenancy.getMyOrg.useQuery(undefined, {
        staleTime: 300000
    }).data;
    var _o = trpc_1.trpc.dashboard.recentActivity.useQuery({ limit: 5 }).data, recentActivities = _o === void 0 ? [] : _o;
    var org = orgData === null || orgData === void 0 ? void 0 : orgData.organization;
    var kpis = analytics === null || analytics === void 0 ? void 0 : analytics.kpis;
    var monthlyChartData = ((_a = analytics === null || analytics === void 0 ? void 0 : analytics.monthlyTrend) !== null && _a !== void 0 ? _a : []).map(function (item) {
        var _a, _b, _c, _d, _e, _f;
        return ({
            name: (_b = (_a = item.name) !== null && _a !== void 0 ? _a : item.month) !== null && _b !== void 0 ? _b : "",
            income: Number((_d = (_c = item.income) !== null && _c !== void 0 ? _c : item.revenue) !== null && _d !== void 0 ? _d : 0),
            expense: Number((_f = (_e = item.expense) !== null && _e !== void 0 ? _e : item.cost) !== null && _f !== void 0 ? _f : 0)
        });
    });
    var actionCards = [
        {
            id: "tasks",
            title: "My Tasks",
            description: "View tasks assigned to you",
            icon: react_1["default"].createElement(lucide_react_1.ClipboardList, { className: "w-8 h-8" }),
            href: "/org/" + slug + "/tasks",
            color: "from-blue-500 to-blue-600",
            stats: { label: "Open Tasks", value: (_b = kpis === null || kpis === void 0 ? void 0 : kpis.myPendingTasks) !== null && _b !== void 0 ? _b : 0 }
        },
        {
            id: "leave",
            title: "Leave Requests",
            description: "Check your leave balance and approvals",
            icon: react_1["default"].createElement(lucide_react_1.Calendar, { className: "w-8 h-8" }),
            href: "/org/" + slug + "/leave",
            color: "from-emerald-500 to-emerald-600",
            stats: { label: "Days Remaining", value: (_c = kpis === null || kpis === void 0 ? void 0 : kpis.leaveBalance) !== null && _c !== void 0 ? _c : 0 }
        },
        {
            id: "messages",
            title: "Messages",
            description: "Read your latest team communications",
            icon: react_1["default"].createElement(lucide_react_1.MessageSquare, { className: "w-8 h-8" }),
            href: "/org/" + slug + "/communications",
            color: "from-violet-500 to-violet-600",
            stats: { label: "Unread", value: (_d = kpis === null || kpis === void 0 ? void 0 : kpis.unreadMessages) !== null && _d !== void 0 ? _d : 0 }
        },
        {
            id: "profile",
            title: "My Profile",
            description: "Review and update your profile details",
            icon: react_1["default"].createElement(lucide_react_1.User, { className: "w-8 h-8" }),
            href: "/org/" + slug + "/profile",
            color: "from-teal-500 to-teal-600",
            stats: { label: "Status", value: (_e = user === null || user === void 0 ? void 0 : user.name) !== null && _e !== void 0 ? _e : "You" }
        },
        {
            id: "benefits",
            title: "Benefits",
            description: "See what benefits are available to you",
            icon: react_1["default"].createElement(lucide_react_1.Gift, { className: "w-8 h-8" }),
            href: "/org/" + slug + "/benefits",
            color: "from-amber-500 to-amber-600",
            stats: { label: "Available", value: "Yes" }
        },
    ];
    var overviewMetrics = [
        {
            title: "Open Tasks",
            value: String((_f = kpis === null || kpis === void 0 ? void 0 : kpis.myPendingTasks) !== null && _f !== void 0 ? _f : 0),
            description: "Tasks waiting for your action",
            icon: react_1["default"].createElement(lucide_react_1.ClipboardList, { className: "w-5 h-5" }),
            color: "border-l-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-l-blue-400",
            href: "/org/" + slug + "/tasks"
        },
        {
            title: "Leave Balance",
            value: String((_g = kpis === null || kpis === void 0 ? void 0 : kpis.leaveBalance) !== null && _g !== void 0 ? _g : 0),
            description: "Days remaining",
            icon: react_1["default"].createElement(lucide_react_1.Calendar, { className: "w-5 h-5" }),
            color: "border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 dark:border-l-emerald-400",
            href: "/org/" + slug + "/leave"
        },
        {
            title: "Unread Messages",
            value: String((_h = kpis === null || kpis === void 0 ? void 0 : kpis.unreadMessages) !== null && _h !== void 0 ? _h : 0),
            description: "Latest updates and alerts",
            icon: react_1["default"].createElement(lucide_react_1.MessageSquare, { className: "w-5 h-5" }),
            color: "border-l-violet-500 bg-violet-50 dark:bg-violet-900/20 dark:border-l-violet-400",
            href: "/org/" + slug + "/communications"
        },
        {
            title: "Assigned Projects",
            value: String((_j = kpis === null || kpis === void 0 ? void 0 : kpis.assignedProjects) !== null && _j !== void 0 ? _j : 0),
            description: "Your active work streams",
            icon: react_1["default"].createElement(Briefcase, { className: "w-5 h-5" }),
            color: "border-l-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 dark:border-l-cyan-400",
            href: "/org/" + slug + "/projects"
        },
        {
            title: "Training Hours",
            value: String((_k = kpis === null || kpis === void 0 ? void 0 : kpis.completedTraining) !== null && _k !== void 0 ? _k : 0),
            description: "Learning completed",
            icon: react_1["default"].createElement(lucide_react_1.BookOpen, { className: "w-5 h-5" }),
            color: "border-l-amber-500 bg-amber-50 dark:bg-amber-900/20 dark:border-l-amber-400",
            href: "/org/" + slug + "/training"
        },
    ];
    var gettingStarted = [
        {
            title: "Check Your Tasks",
            description: "Review what needs to be completed today.",
            href: "/org/" + slug + "/tasks",
            buttonText: "View Tasks"
        },
        {
            title: "Submit Leave",
            description: "Request time off with a few clicks.",
            href: "/org/" + slug + "/leave",
            buttonText: "Request Leave"
        },
        {
            title: "Update Profile",
            description: "Keep your personal details current.",
            href: "/org/" + slug + "/profile",
            buttonText: "Edit Profile"
        },
    ];
    return (react_1["default"].createElement(OrgLayout_1["default"], { title: org ? org.name + " \u2014 My Dashboard" : "My Dashboard", showOrgInfo: true },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement(OrgDashboardShell_1["default"], { title: "Welcome back", subtitle: "Hello " + (((_l = user === null || user === void 0 ? void 0 : user.name) === null || _l === void 0 ? void 0 : _l.split(" ")[0]) || "there") + ", here's your personal overview", actionCards: actionCards, overviewMetrics: overviewMetrics, monthlyChartData: monthlyChartData, financialBreakdown: [], recentActivities: recentActivities, recentActivityHref: "/org/" + slug + "/activity", gettingStarted: gettingStarted }))));
}
exports["default"] = OrgEmployeeDashboard;
