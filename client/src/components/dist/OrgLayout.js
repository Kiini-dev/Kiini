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
exports.OrgLayout = void 0;
var react_1 = require("react");
var wouter_1 = require("wouter");
var button_1 = require("@/components/ui/button");
var avatar_1 = require("@/components/ui/avatar");
var badge_1 = require("@/components/ui/badge");
var scroll_area_1 = require("@/components/ui/scroll-area");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var sheet_1 = require("@/components/ui/sheet");
var tooltip_1 = require("@/components/ui/tooltip");
var utils_1 = require("@/lib/utils");
var useAuthWithPersistence_1 = require("@/_core/hooks/useAuthWithPersistence");
var ThemeContext_1 = require("@/contexts/ThemeContext");
var useSettingsSync_1 = require("@/hooks/useSettingsSync");
var useMaintenanceModeEnforcement_1 = require("@/hooks/useMaintenanceModeEnforcement");
var MaintenancePage_1 = require("@/pages/MaintenancePage");
var NotificationBell_1 = require("./NotificationBell");
var FloatingAIChat_1 = require("./FloatingAIChat");
var FloatingChatNotifications_1 = require("./FloatingChatNotifications");
var AccessibilityWidget_1 = require("./AccessibilityWidget");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
function buildOrgNav(slug) {
    return [
        { id: 'dashboard', label: 'Dashboard', href: "/org/" + slug + "/dashboard", icon: lucide_react_1.LayoutDashboard },
        { id: 'crm_group', label: 'CRM', href: '', icon: lucide_react_1.Users, children: [
                { id: 'crm', label: 'Clients', href: "/org/" + slug + "/crm", icon: lucide_react_1.Users, featureKey: 'crm' },
                { id: 'contacts', label: 'Contacts', href: "/org/" + slug + "/contacts", icon: lucide_react_1.Phone, featureKey: 'crm' },
                { id: 'pipeline', label: 'Sales Pipeline', href: "/org/" + slug + "/pipeline", icon: lucide_react_1.KanbanSquare, featureKey: 'crm' },
                { id: 'leads', label: 'Leads', href: "/org/" + slug + "/leads", icon: lucide_react_1.Phone, featureKey: 'crm' },
                { id: 'calendar', label: 'Calendar', href: "/org/" + slug + "/calendar", icon: lucide_react_1.CalendarDays, featureKey: 'crm' },
                { id: 'activity', label: 'Activity', href: "/org/" + slug + "/activity", icon: lucide_react_1.Activity },
                { id: 'approvals', label: 'Approvals', href: "/org/" + slug + "/approvals", icon: lucide_react_1.Shield },
            ] },
        { id: 'finance_group', label: 'Finance', href: '', icon: lucide_react_1.DollarSign, children: [
                { id: 'invoicing', label: 'Invoices', href: "/org/" + slug + "/invoices", icon: lucide_react_1.FileText, featureKey: 'invoicing' },
                { id: 'payments', label: 'Payments', href: "/org/" + slug + "/payments", icon: lucide_react_1.DollarSign, featureKey: 'payments' },
                { id: 'estimates', label: 'Estimates', href: "/org/" + slug + "/estimates", icon: lucide_react_1.FileSpreadsheet, featureKey: 'invoicing' },
                { id: 'receipts', label: 'Receipts', href: "/org/" + slug + "/receipts", icon: lucide_react_1.Receipt, featureKey: 'payments' },
                { id: 'expenses', label: 'Expenses', href: "/org/" + slug + "/expenses", icon: lucide_react_1.Receipt, featureKey: 'expenses' },
                { id: 'credit_notes', label: 'Credit Notes', href: "/org/" + slug + "/credit-notes", icon: lucide_react_1.FileText, featureKey: 'invoicing' },
                { id: 'debit_notes', label: 'Debit Notes', href: "/org/" + slug + "/debit-notes", icon: lucide_react_1.FileText, featureKey: 'invoicing' },
                { id: 'subscriptions', label: 'Subscriptions', href: "/org/" + slug + "/subscriptions", icon: lucide_react_1.Layers, featureKey: 'invoicing' },
                { id: 'accounting', label: 'Accounting', href: "/org/" + slug + "/accounting", icon: lucide_react_1.BookOpen, featureKey: 'accounting' },
                { id: 'budgets', label: 'Budgets', href: "/org/" + slug + "/budgets", icon: lucide_react_1.Target, featureKey: 'budgets' },
            ] },
        { id: 'accounting_group', label: 'Accounting', href: '', icon: lucide_react_1.BookOpen, children: [
                { id: 'chart_of_accounts', label: 'Chart of Accounts', href: "/org/" + slug + "/chart-of-accounts", icon: lucide_react_1.BookOpen, featureKey: 'accounting' },
                { id: 'bank_reconciliation', label: 'Bank Reconciliation', href: "/org/" + slug + "/bank-reconciliation", icon: lucide_react_1.Landmark, featureKey: 'accounting' },
                { id: 'financial_dashboard', label: 'Financial Dashboard', href: "/org/" + slug + "/financial-dashboard", icon: lucide_react_1.PieChart, featureKey: 'accounting' },
                { id: 'forecasting', label: 'Forecasting', href: "/org/" + slug + "/forecasting", icon: lucide_react_1.TrendingUp, featureKey: 'accounting' },
                { id: 'tax_compliance', label: 'Tax Compliance', href: "/org/" + slug + "/tax-compliance", icon: lucide_react_1.Scale, featureKey: 'accounting' },
            ] },
        { id: 'purchasing_group', label: 'Purchasing', href: '', icon: lucide_react_1.ShoppingCart, children: [
                { id: 'suppliers', label: 'Suppliers', href: "/org/" + slug + "/suppliers", icon: lucide_react_1.Users2, featureKey: 'procurement' },
                { id: 'lpos', label: 'Purchase Orders', href: "/org/" + slug + "/lpos", icon: lucide_react_1.ShoppingCart, featureKey: 'procurement' },
                { id: 'orders', label: 'Orders', href: "/org/" + slug + "/orders", icon: lucide_react_1.ClipboardList, featureKey: 'procurement' },
                { id: 'imprests', label: 'Imprests', href: "/org/" + slug + "/imprests", icon: lucide_react_1.Banknote, featureKey: 'procurement' },
            ] },
        { id: 'inventory_group', label: 'Inventory', href: '', icon: lucide_react_1.Package, children: [
                { id: 'products', label: 'Products', href: "/org/" + slug + "/products", icon: lucide_react_1.Package, featureKey: 'procurement' },
                { id: 'stock', label: 'Stock', href: "/org/" + slug + "/inventory", icon: lucide_react_1.Package, featureKey: 'procurement' },
                { id: 'delivery_notes', label: 'Delivery Notes', href: "/org/" + slug + "/delivery-notes", icon: lucide_react_1.Truck, featureKey: 'procurement' },
                { id: 'grn', label: 'GRNs', href: "/org/" + slug + "/grn", icon: lucide_react_1.ClipboardList, featureKey: 'procurement' },
            ] },
        { id: 'services_group', label: 'Services', href: '', icon: lucide_react_1.Wrench, children: [
                { id: 'services', label: 'Services', href: "/org/" + slug + "/services", icon: lucide_react_1.Wrench, featureKey: 'invoicing' },
                { id: 'service_templates', label: 'Service Templates', href: "/org/" + slug + "/service-templates", icon: lucide_react_1.FileText, featureKey: 'invoicing' },
                { id: 'service_invoices', label: 'Service Invoices', href: "/org/" + slug + "/service-invoices", icon: lucide_react_1.FileText, featureKey: 'invoicing' },
            ] },
        { id: 'proposals_group', label: 'Proposals', href: '', icon: lucide_react_1.Pencil, children: [
                { id: 'proposals', label: 'Proposals', href: "/org/" + slug + "/proposals", icon: lucide_react_1.Pencil, featureKey: 'invoicing' },
                { id: 'proposal_templates', label: 'Templates', href: "/org/" + slug + "/proposals/templates", icon: lucide_react_1.FileText, featureKey: 'invoicing' },
                { id: 'quotations', label: 'Quotations', href: "/org/" + slug + "/quotations", icon: lucide_react_1.FileSpreadsheet, featureKey: 'invoicing' },
            ] },
        { id: 'ops_group', label: 'Operations', href: '', icon: lucide_react_1.Briefcase, children: [
                { id: 'projects', label: 'Projects', href: "/org/" + slug + "/projects", icon: lucide_react_1.Briefcase, featureKey: 'projects' },
                { id: 'tasks', label: 'Tasks', href: "/org/" + slug + "/tasks", icon: lucide_react_1.CheckSquare, featureKey: 'projects' },
                { id: 'contracts', label: 'Contracts', href: "/org/" + slug + "/contracts", icon: lucide_react_1.FileCheck, featureKey: 'contracts' },
                { id: 'contract_templates', label: 'Contract Templates', href: "/org/" + slug + "/contracts/templates", icon: lucide_react_1.FileText, featureKey: 'contracts' },
                { id: 'assets', label: 'Assets', href: "/org/" + slug + "/assets", icon: lucide_react_1.Package, featureKey: 'contracts' },
                { id: 'warranty', label: 'Warranty', href: "/org/" + slug + "/warranty", icon: lucide_react_1.Shield, featureKey: 'contracts' },
                { id: 'work_orders', label: 'Work Orders', href: "/org/" + slug + "/work-orders", icon: lucide_react_1.Wrench, featureKey: 'work_orders' },
            ] },
        { id: 'hr_group', label: 'HR & Payroll', href: '', icon: lucide_react_1.UserCog, children: [
                { id: 'employees', label: 'Employees', href: "/org/" + slug + "/employees", icon: lucide_react_1.Users, featureKey: 'hr' },
                { id: 'departments', label: 'Departments', href: "/org/" + slug + "/departments", icon: lucide_react_1.Building2, featureKey: 'hr' },
                { id: 'attendance', label: 'Attendance', href: "/org/" + slug + "/attendance", icon: lucide_react_1.Clock, featureKey: 'attendance' },
                { id: 'payroll', label: 'Payroll', href: "/org/" + slug + "/payroll", icon: lucide_react_1.Banknote, featureKey: 'hr' },
                { id: 'leave', label: 'Leave Management', href: "/org/" + slug + "/leave", icon: lucide_react_1.Calendar, featureKey: 'leave' },
                { id: 'job_groups', label: 'Job Groups', href: "/org/" + slug + "/job-groups", icon: lucide_react_1.GraduationCap, featureKey: 'hr' },
                { id: 'performance', label: 'Performance Reviews', href: "/org/" + slug + "/performance-reviews", icon: lucide_react_1.TrendingUp, featureKey: 'hr' },
            ] },
        { id: 'support_group', label: 'Support', href: '', icon: lucide_react_1.Headphones, children: [
                { id: 'tickets', label: 'Tickets', href: "/org/" + slug + "/tickets", icon: lucide_react_1.HelpCircle, featureKey: 'tickets' },
                { id: 'canned_responses', label: 'Canned Responses', href: "/org/" + slug + "/canned-responses", icon: lucide_react_1.MessageSquare, featureKey: 'tickets' },
                { id: 'knowledge_base', label: 'Knowledgebase', href: "/org/" + slug + "/knowledge-base", icon: lucide_react_1.Book, featureKey: 'tickets' },
            ] },
        { id: 'tools_group', label: 'Tools', href: '', icon: lucide_react_1.BarChart3, children: [
                { id: 'reports', label: 'Reports', href: "/org/" + slug + "/reports", icon: lucide_react_1.BarChart3, featureKey: 'reports' },
                { id: 'communications', label: 'Communications', href: "/org/" + slug + "/communications", icon: lucide_react_1.MessageSquare, featureKey: 'communications' },
                { id: 'staff_chat', label: 'Staff Chat', href: "/org/" + slug + "/staff-chat", icon: lucide_react_1.MessagesSquare, featureKey: 'communications' },
                { id: 'documents', label: 'Documents', href: "/org/" + slug + "/documents", icon: lucide_react_1.FileText },
                { id: 'timesheets', label: 'Time Sheets', href: "/org/" + slug + "/timesheets", icon: lucide_react_1.Clock },
                { id: 'ai_hub', label: 'AI Hub', href: "/org/" + slug + "/ai", icon: lucide_react_1.Sparkles, featureKey: 'ai_hub' },
            ] },
        { id: 'admin_group', label: 'Admin', href: '', icon: lucide_react_1.Shield, adminOnly: true, children: [
                { id: 'team_users', label: 'Team Users', href: "/org/users", icon: lucide_react_1.Users2, adminOnly: true },
                { id: 'staff', label: 'Staff Management', href: "/org/" + slug + "/staff", icon: lucide_react_1.Users2, adminOnly: true },
                { id: 'billing', label: 'Billing & Payments', href: "/org/" + slug + "/billing", icon: lucide_react_1.CreditCard, adminOnly: true },
                { id: 'settings', label: 'Org Settings', href: "/org/" + slug + "/settings", icon: lucide_react_1.Settings, adminOnly: true },
            ] },
    ];
}
// ── Critical Broadcast Messages Banner ──────────────────────
function CriticalMessagesBanner() {
    var criticalMessages = trpc_1.trpc.tenantCommunications.getCriticalMessages.useQuery(undefined, { retry: false, refetchInterval: 60000 }).data;
    var markAsRead = trpc_1.trpc.tenantCommunications.markAsRead.useMutation();
    var _a = react_1["default"].useState(new Set()), dismissed = _a[0], setDismissed = _a[1];
    var utils = trpc_1.trpc.useUtils();
    if (!(criticalMessages === null || criticalMessages === void 0 ? void 0 : criticalMessages.length))
        return null;
    var visible = criticalMessages.filter(function (m) { return !dismissed.has(m.id); });
    if (!visible.length)
        return null;
    return (react_1["default"].createElement("div", { className: "space-y-1 px-3 sm:px-4 md:px-6 pt-2" }, visible.map(function (msg) { return (react_1["default"].createElement("div", { key: msg.id, className: utils_1.cn("flex items-start gap-3 p-3 rounded-lg border text-sm", msg.priority === 'urgent'
            ? "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800"
            : "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800") },
        react_1["default"].createElement(lucide_react_1.Bell, { className: utils_1.cn("h-4 w-4 mt-0.5 shrink-0", msg.priority === 'urgent' ? "text-red-600" : "text-amber-600") }),
        react_1["default"].createElement("div", { className: "flex-1 min-w-0" },
            react_1["default"].createElement("p", { className: utils_1.cn("font-medium", msg.priority === 'urgent' ? "text-red-800 dark:text-red-200" : "text-amber-800 dark:text-amber-200") }, msg.subject),
            react_1["default"].createElement("p", { className: "text-xs text-muted-foreground mt-0.5 line-clamp-2" }, msg.message)),
        react_1["default"].createElement("button", { className: "text-muted-foreground hover:text-foreground shrink-0", onClick: function () {
                setDismissed(function (prev) { return new Set(prev).add(msg.id); });
                markAsRead.mutate(msg.id, { onSuccess: function () { return utils.tenantCommunications.getUnreadCount.invalidate(); } });
            } },
            react_1["default"].createElement(lucide_react_1.X, { className: "h-4 w-4" })))); })));
}
function OrgLayout(_a) {
    var _b, _c, _d;
    var title = _a.title, description = _a.description, children = _a.children, className = _a.className;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _e = wouter_1.useLocation(), location = _e[0], navigate = _e[1];
    var _f = useAuthWithPersistence_1.useAuthWithPersistence(), user = _f.user, logout = _f.logout;
    var _g = ThemeContext_1.useTheme(), theme = _g.theme, toggleTheme = _g.toggleTheme;
    var _h = react_1.useState(false), mobileSidebarOpen = _h[0], setMobileSidebarOpen = _h[1];
    var _j = react_1.useState(function () {
        try {
            var v = localStorage.getItem('orgSidebarPinned');
            return v !== null ? JSON.parse(v) : true;
        }
        catch (_a) {
            return true;
        }
    }), sidebarPinned = _j[0], setSidebarPinned = _j[1];
    var _k = react_1.useState([]), expandedItems = _k[0], setExpandedItems = _k[1];
    var _l = react_1.useState(""), headerSearchQuery = _l[0], setHeaderSearchQuery = _l[1];
    var _m = react_1.useState(false), cmdOpen = _m[0], setCmdOpen = _m[1];
    // Timer state
    var TIMER_STORAGE_KEY = 'org_timer_state';
    var _o = react_1.useState(false), timerRunning = _o[0], setTimerRunning = _o[1];
    var _p = react_1.useState(0), timerSeconds = _p[0], setTimerSeconds = _p[1];
    var _q = react_1.useState(''), timerProject = _q[0], setTimerProject = _q[1];
    var _r = react_1.useState(null), timerStartedAt = _r[0], setTimerStartedAt = _r[1];
    // Favorites & Reminders
    var _s = react_1.useState('All'), favFilter = _s[0], setFavFilter = _s[1];
    var _t = react_1.useState('due'), reminderTab = _t[0], setReminderTab = _t[1];
    var _u = react_1.useState(function () { return localStorage.getItem('app_language') || 'English'; }), selectedLanguage = _u[0], setSelectedLanguage = _u[1];
    var favoritesData = trpc_1.trpc.favorites.list.useQuery(undefined, { staleTime: 30000 }).data;
    var remindersDueData = trpc_1.trpc.reminders.list.useQuery({ status: 'due' }, { staleTime: 30000 }).data;
    var remindersPendingData = trpc_1.trpc.reminders.list.useQuery({ status: 'pending' }, { staleTime: 30000 }).data;
    // Popout submenu state for collapsed sidebar
    var sidebarRef = react_1.useRef(null);
    var popoutTimeout = react_1.useRef(null);
    var _v = react_1.useState(null), popoutItem = _v[0], setPopoutItem = _v[1];
    var _w = react_1.useState(0), popoutY = _w[0], setPopoutY = _w[1];
    var openPopout = react_1.useCallback(function (id, y) {
        if (popoutTimeout.current) {
            clearTimeout(popoutTimeout.current);
            popoutTimeout.current = null;
        }
        setPopoutY(y);
        setPopoutItem(id);
    }, []);
    var scheduleClosePopout = react_1.useCallback(function () {
        if (popoutTimeout.current)
            clearTimeout(popoutTimeout.current);
        popoutTimeout.current = setTimeout(function () { return setPopoutItem(null); }, 200);
    }, []);
    var cancelClosePopout = react_1.useCallback(function () {
        if (popoutTimeout.current) {
            clearTimeout(popoutTimeout.current);
            popoutTimeout.current = null;
        }
    }, []);
    var sidebarExpanded = sidebarPinned;
    var myOrgData = trpc_1.trpc.multiTenancy.getMyOrg.useQuery(undefined, {
        enabled: !!(user === null || user === void 0 ? void 0 : user.organizationId)
    }).data;
    var org = myOrgData === null || myOrgData === void 0 ? void 0 : myOrgData.organization;
    var featureMap = (_b = myOrgData === null || myOrgData === void 0 ? void 0 : myOrgData.featureMap) !== null && _b !== void 0 ? _b : {};
    var isAdmin = (user === null || user === void 0 ? void 0 : user.role) === 'super_admin';
    react_1.useEffect(function () {
        if (myOrgData && org && slug && org.slug !== slug && (user === null || user === void 0 ? void 0 : user.role) !== 'super_admin') {
            navigate("/org/" + org.slug + "/dashboard");
        }
    }, [myOrgData, org, slug, user === null || user === void 0 ? void 0 : user.role]);
    useSettingsSync_1.useSettingsSync();
    // Maintenance mode enforcement
    var _x = useMaintenanceModeEnforcement_1.useMaintenanceModeEnforcement(), maintenanceMode = _x.maintenanceMode, isRestrictedByMaintenance = _x.isRestrictedByMaintenance;
    // Cmd+K / Ctrl+K
    react_1.useEffect(function () {
        var handler = function (e) {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setCmdOpen(function (prev) { return !prev; });
            }
            if (e.key === "Escape")
                setCmdOpen(false);
        };
        window.addEventListener("keydown", handler);
        return function () { return window.removeEventListener("keydown", handler); };
    }, []);
    // Persist sidebar pinned state
    react_1.useEffect(function () { localStorage.setItem('orgSidebarPinned', JSON.stringify(sidebarPinned)); }, [sidebarPinned]);
    // Timer: load from localStorage
    react_1.useEffect(function () {
        try {
            var saved = localStorage.getItem(TIMER_STORAGE_KEY);
            if (saved) {
                var s = JSON.parse(saved);
                setTimerSeconds(s.seconds || 0);
                setTimerProject(s.project || '');
                if (s.running && s.startedAt) {
                    var elapsed = Math.floor((Date.now() - s.startedAt) / 1000);
                    setTimerSeconds((s.seconds || 0) + elapsed);
                    setTimerRunning(true);
                    setTimerStartedAt(s.startedAt);
                }
            }
        }
        catch (_a) { }
    }, []);
    // Timer: save to localStorage
    react_1.useEffect(function () {
        localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify({
            seconds: timerSeconds, project: timerProject, running: timerRunning, startedAt: timerStartedAt
        }));
    }, [timerSeconds, timerProject, timerRunning, timerStartedAt]);
    // Timer: tick interval
    react_1.useEffect(function () {
        if (!timerRunning)
            return;
        var iv = setInterval(function () { return setTimerSeconds(function (s) { return s + 1; }); }, 1000);
        return function () { return clearInterval(iv); };
    }, [timerRunning]);
    var formatTimer = function (s) {
        var h = Math.floor(s / 3600);
        var m = Math.floor((s % 3600) / 60);
        var sec = s % 60;
        return h.toString().padStart(2, '0') + ":" + m.toString().padStart(2, '0') + ":" + sec.toString().padStart(2, '0');
    };
    var handleLanguageChange = function (lang) {
        setSelectedLanguage(lang);
        localStorage.setItem('app_language', lang);
    };
    var languages = ['English', 'French', 'Spanish', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Russian', 'Swahili'];
    // Close popout when sidebar expands
    react_1.useEffect(function () { if (sidebarExpanded)
        setPopoutItem(null); }, [sidebarExpanded]);
    // Close popout on outside click
    react_1.useEffect(function () {
        if (!popoutItem)
            return;
        var handler = function (e) {
            var target = e.target;
            var popoutEl = document.getElementById('org-sidebar-popout');
            if (sidebarRef.current && !sidebarRef.current.contains(target) && (!popoutEl || !popoutEl.contains(target))) {
                setPopoutItem(null);
            }
        };
        document.addEventListener('mousedown', handler);
        return function () { return document.removeEventListener('mousedown', handler); };
    }, [popoutItem]);
    var navItems = buildOrgNav(slug || '');
    var toggleExpanded = function (id) {
        setExpandedItems(function (prev) { return prev.includes(id) ? prev.filter(function (i) { return i !== id; }) : __spreadArrays(prev, [id]); });
    };
    var isActiveHref = function (href) {
        if (!href)
            return false;
        return location === href || location.startsWith(href + '/');
    };
    var isItemLocked = function (item) { return !!(item.featureKey && featureMap[item.featureKey] === false); };
    var getInitials = function (name) {
        if (!name)
            return "U";
        return name.split(" ").map(function (n) { return n[0]; }).join("").toUpperCase().slice(0, 2);
    };
    // Filter nav items based on admin status
    var getVisibleNav = function (items) {
        return items.filter(function (item) { return !(item.adminOnly && !isAdmin); }).map(function (item) {
            if (item.children)
                return __assign(__assign({}, item), { children: getVisibleNav(item.children) });
            return item;
        });
    };
    var visibleNav = getVisibleNav(navItems);
    // ── renderNavItem ────────────────────────────────────────────────────
    var renderNavItem = function (item, level) {
        var _a, _b;
        if (level === void 0) { level = 0; }
        var Icon = item.icon;
        var hasChildren = item.children && item.children.length > 0;
        var isExpanded = expandedItems.includes(item.id);
        var isItemActive = isActiveHref(item.href) || ((_b = (_a = item.children) === null || _a === void 0 ? void 0 : _a.some(function (c) { return isActiveHref(c.href); })) !== null && _b !== void 0 ? _b : false);
        var locked = isItemLocked(item);
        var isCollapsed = !sidebarExpanded && !mobileSidebarOpen;
        // Collapsed: icon-only with popout
        if (isCollapsed && level === 0) {
            var isPopoutOpen = popoutItem === item.id;
            var iconBtn = (react_1["default"].createElement("button", { onMouseEnter: function (e) {
                    if (hasChildren) {
                        var rect = e.currentTarget.getBoundingClientRect();
                        openPopout(item.id, rect.top);
                    }
                    else {
                        setPopoutItem(null);
                        cancelClosePopout();
                    }
                }, onMouseLeave: function () { if (hasChildren)
                    scheduleClosePopout(); }, onClick: function () { if (!hasChildren && item.href && !locked) {
                    navigate(item.href);
                    setPopoutItem(null);
                } }, className: utils_1.cn("w-full flex items-center justify-center p-2.5 rounded-lg transition-colors", "hover:bg-slate-100 dark:hover:bg-slate-700", (isItemActive || isPopoutOpen) && "bg-blue-600 text-white dark:bg-blue-600 dark:text-white", locked && "opacity-50 cursor-not-allowed", "text-slate-600 dark:text-slate-300") }, Icon && react_1["default"].createElement(Icon, { className: "h-5 w-5" })));
            if (popoutItem)
                return react_1["default"].createElement("div", { key: item.id }, iconBtn);
            return (react_1["default"].createElement(tooltip_1.TooltipProvider, { key: item.id, delayDuration: 0 },
                react_1["default"].createElement(tooltip_1.Tooltip, null,
                    react_1["default"].createElement(tooltip_1.TooltipTrigger, { asChild: true }, iconBtn),
                    react_1["default"].createElement(tooltip_1.TooltipContent, { side: "right", sideOffset: 10 },
                        react_1["default"].createElement("p", null,
                            item.label,
                            locked ? ' (Upgrade)' : '')))));
        }
        // Expanded: group with expandable children
        if (hasChildren) {
            return (react_1["default"].createElement("div", { key: item.id },
                react_1["default"].createElement("button", { onClick: function () { return toggleExpanded(item.id); }, className: utils_1.cn("w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors", "hover:bg-slate-100 dark:hover:bg-slate-700", isItemActive && "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-medium", level > 0 && "pl-8", "text-slate-700 dark:text-slate-300") },
                    react_1["default"].createElement("div", { className: "flex items-center gap-3" },
                        Icon && react_1["default"].createElement(Icon, { className: "h-4 w-4" }),
                        react_1["default"].createElement("span", { className: "whitespace-nowrap" }, item.label)),
                    isExpanded ? react_1["default"].createElement(lucide_react_1.ChevronDown, { className: "h-4 w-4 flex-shrink-0" }) : react_1["default"].createElement(lucide_react_1.ChevronRight, { className: "h-4 w-4 flex-shrink-0" })),
                isExpanded && item.children.length > 0 && (react_1["default"].createElement("div", { className: "mt-1 space-y-0.5" }, item.children.map(function (child) { return renderNavItem(child, level + 1); })))));
        }
        // Leaf item – locked
        if (locked) {
            return (react_1["default"].createElement("div", { key: item.id, title: item.label + " \u2014 upgrade your plan to unlock", className: utils_1.cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm mb-0.5 cursor-not-allowed opacity-60', level > 0 && "pl-8", 'text-muted-foreground') },
                react_1["default"].createElement(Icon, { className: "h-4 w-4 shrink-0" }),
                item.label,
                react_1["default"].createElement(lucide_react_1.Crown, { className: "ml-auto h-3 w-3 text-amber-400" })));
        }
        // Leaf item – active
        return (react_1["default"].createElement("button", { key: item.id, onClick: function () { if (item.href)
                navigate(item.href); setMobileSidebarOpen(false); }, className: utils_1.cn("w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors", "hover:bg-slate-100 dark:hover:bg-slate-700", isActiveHref(item.href) && "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-medium", level > 0 && "pl-8", "text-slate-700 dark:text-slate-300") },
            react_1["default"].createElement(Icon, { className: "h-4 w-4" }),
            react_1["default"].createElement("span", { className: "whitespace-nowrap" }, item.label),
            item.adminOnly && react_1["default"].createElement(lucide_react_1.Shield, { className: "ml-auto h-3 w-3 text-blue-400/60" })));
    };
    // ── Sidebar content (shared between mobile & desktop when expanded) ──
    var OrgHeader = function (_a) {
        var expanded = _a.expanded;
        return (react_1["default"].createElement("div", { className: utils_1.cn("flex h-14 items-center border-b px-3 flex-shrink-0", !expanded && "justify-center") },
            react_1["default"].createElement("button", { onClick: function () { return navigate("/org/" + slug + "/dashboard"); }, className: utils_1.cn("flex items-center gap-2 hover:opacity-80 transition-opacity min-w-0", !expanded && "justify-center w-full"), title: (org === null || org === void 0 ? void 0 : org.name) || 'Dashboard' },
                react_1["default"].createElement("div", { className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600" }, (org === null || org === void 0 ? void 0 : org.logoUrl) ? react_1["default"].createElement("img", { src: org.logoUrl, alt: org.name, className: "h-8 w-8 rounded-lg object-cover" }) : react_1["default"].createElement(lucide_react_1.Building2, { className: "h-4 w-4 text-white" })),
                expanded && (react_1["default"].createElement("div", { className: "min-w-0 flex-1" },
                    react_1["default"].createElement("p", { className: "truncate text-sm font-semibold leading-tight" }, (org === null || org === void 0 ? void 0 : org.name) || 'My Organization'),
                    react_1["default"].createElement(badge_1.Badge, { variant: "outline", className: "border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] px-1 py-0" }, (org === null || org === void 0 ? void 0 : org.plan) || 'starter')))),
            expanded && (react_1["default"].createElement("button", { onClick: function () { return setSidebarPinned(!sidebarPinned); }, className: "ml-auto p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex-shrink-0 hidden lg:flex", title: sidebarPinned ? "Collapse sidebar" : "Pin sidebar" }, sidebarPinned ? react_1["default"].createElement(lucide_react_1.X, { className: "h-4 w-4 text-muted-foreground" }) : react_1["default"].createElement(lucide_react_1.Menu, { className: "h-4 w-4 text-muted-foreground" })))));
    };
    var UserFooter = function (_a) {
        var _b, _c;
        var expanded = _a.expanded;
        return (react_1["default"].createElement("div", { className: "border-t p-2 flex-shrink-0" }, expanded ? (react_1["default"].createElement(dropdown_menu_1.DropdownMenu, null,
            react_1["default"].createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                react_1["default"].createElement("button", { className: "w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors min-w-0" },
                    react_1["default"].createElement(avatar_1.Avatar, { className: "h-7 w-7 flex-shrink-0" },
                        react_1["default"].createElement(avatar_1.AvatarImage, { src: ((_b = user) === null || _b === void 0 ? void 0 : _b.photoUrl) || undefined }),
                        react_1["default"].createElement(avatar_1.AvatarFallback, { className: "text-xs" }, getInitials((user === null || user === void 0 ? void 0 : user.name) || undefined))),
                    react_1["default"].createElement("div", { className: "flex-1 text-left min-w-0" },
                        react_1["default"].createElement("p", { className: "text-xs font-medium truncate" }, (user === null || user === void 0 ? void 0 : user.name) || "User"),
                        react_1["default"].createElement("p", { className: "text-xs text-muted-foreground truncate" }, (user === null || user === void 0 ? void 0 : user.email) || "")),
                    react_1["default"].createElement(lucide_react_1.ChevronDown, { className: "h-3 w-3 text-muted-foreground flex-shrink-0" }))),
            react_1["default"].createElement(dropdown_menu_1.DropdownMenuContent, { align: "end", className: "w-52" },
                react_1["default"].createElement(dropdown_menu_1.DropdownMenuLabel, { className: "text-sm" }, "My Account"),
                react_1["default"].createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/profile"); }, className: "text-sm" },
                    react_1["default"].createElement(lucide_react_1.User, { className: "mr-2 h-4 w-4" }),
                    react_1["default"].createElement("span", null, "Profile Settings")),
                react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/security"); }, className: "text-sm" },
                    react_1["default"].createElement(lucide_react_1.Lock, { className: "mr-2 h-4 w-4" }),
                    react_1["default"].createElement("span", null, "Password & Security")),
                react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/settings"); }, className: "text-sm" },
                    react_1["default"].createElement(lucide_react_1.Settings, { className: "mr-2 h-4 w-4" }),
                    react_1["default"].createElement("span", null, "Account Settings")),
                react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/security"); }, className: "text-sm" },
                    react_1["default"].createElement(lucide_react_1.KeyRound, { className: "mr-2 h-4 w-4" }),
                    react_1["default"].createElement("span", null, "Two-Factor Auth")),
                react_1["default"].createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: toggleTheme, className: "text-sm" }, theme === "dark" ? react_1["default"].createElement(react_1["default"].Fragment, null,
                    react_1["default"].createElement(lucide_react_1.Sun, { className: "mr-2 h-4 w-4" }),
                    react_1["default"].createElement("span", null, "Light Mode")) : react_1["default"].createElement(react_1["default"].Fragment, null,
                    react_1["default"].createElement(lucide_react_1.Moon, { className: "mr-2 h-4 w-4" }),
                    react_1["default"].createElement("span", null, "Dark Mode"))),
                react_1["default"].createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return logout(); }, className: "text-red-600 text-sm" },
                    react_1["default"].createElement(lucide_react_1.LogOut, { className: "mr-2 h-4 w-4" }),
                    react_1["default"].createElement("span", null, "Sign Out"))))) : (react_1["default"].createElement(tooltip_1.TooltipProvider, { delayDuration: 0 },
            react_1["default"].createElement(tooltip_1.Tooltip, null,
                react_1["default"].createElement(tooltip_1.TooltipTrigger, { asChild: true },
                    react_1["default"].createElement("button", { onClick: function () { return navigate("/profile"); }, className: "w-full flex items-center justify-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" },
                        react_1["default"].createElement(avatar_1.Avatar, { className: "h-7 w-7" },
                            react_1["default"].createElement(avatar_1.AvatarImage, { src: ((_c = user) === null || _c === void 0 ? void 0 : _c.photoUrl) || undefined }),
                            react_1["default"].createElement(avatar_1.AvatarFallback, { className: "text-xs" }, getInitials((user === null || user === void 0 ? void 0 : user.name) || undefined))))),
                react_1["default"].createElement(tooltip_1.TooltipContent, { side: "right", sideOffset: 10 },
                    react_1["default"].createElement("p", null, (user === null || user === void 0 ? void 0 : user.name) || "User")))))));
    };
    // ── Maintenance Mode: block non-super_admin/ict_manager users ────────
    if (isRestrictedByMaintenance) {
        return react_1["default"].createElement(MaintenancePage_1["default"], null);
    }
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement("div", { className: "min-h-screen bg-background" },
            react_1["default"].createElement(button_1.Button, { variant: "outline", size: "icon", onClick: function () { return setMobileSidebarOpen(!mobileSidebarOpen); }, className: utils_1.cn("fixed top-3 z-[60] transition-all duration-300 shadow-lg h-9 w-9 sm:h-10 sm:w-10 p-1.5 sm:p-2 lg:hidden", "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700", mobileSidebarOpen ? "left-[calc(16rem+0.75rem)]" : "left-3 sm:left-4"), "aria-label": mobileSidebarOpen ? "Close sidebar" : "Open sidebar" }, mobileSidebarOpen ? react_1["default"].createElement(lucide_react_1.X, { className: "h-4 w-4 sm:h-5 sm:w-5" }) : react_1["default"].createElement(lucide_react_1.Menu, { className: "h-4 w-4 sm:h-5 sm:w-5" })),
            mobileSidebarOpen && react_1["default"].createElement("div", { className: "fixed inset-0 z-40 bg-black/50 lg:hidden", onClick: function () { return setMobileSidebarOpen(false); } }),
            react_1["default"].createElement("aside", { className: utils_1.cn("fixed left-0 top-0 z-50 h-screen transition-all duration-300 border-r overflow-hidden lg:hidden w-64", mobileSidebarOpen ? "translate-x-0 shadow-lg" : "-translate-x-full", "bg-white dark:bg-gradient-to-b dark:from-blue-900 dark:to-blue-950 dark:border-blue-800") },
                react_1["default"].createElement("div", { className: "flex h-full flex-col" },
                    react_1["default"].createElement(OrgHeader, { expanded: true }),
                    react_1["default"].createElement(scroll_area_1.ScrollArea, { className: "flex-1 px-2 py-3" },
                        react_1["default"].createElement("nav", { className: "space-y-0.5" }, visibleNav.map(function (item) { return react_1["default"].createElement("div", { key: item.id }, renderNavItem(item)); }))),
                    react_1["default"].createElement(UserFooter, { expanded: true }))),
            react_1["default"].createElement("aside", { ref: sidebarRef, className: utils_1.cn("fixed left-0 top-0 z-50 h-screen transition-all duration-300 border-r overflow-hidden hidden lg:block", sidebarExpanded ? "w-[250px] shadow-lg" : "w-[70px]", "bg-white dark:bg-gradient-to-b dark:from-blue-900 dark:to-blue-950 dark:border-blue-800") },
                react_1["default"].createElement("div", { className: "flex h-full flex-col" },
                    react_1["default"].createElement(OrgHeader, { expanded: sidebarExpanded }),
                    react_1["default"].createElement(scroll_area_1.ScrollArea, { className: utils_1.cn("flex-1 py-3", sidebarExpanded ? "px-2" : "px-1.5") },
                        react_1["default"].createElement("nav", { className: utils_1.cn("space-y-0.5", !sidebarExpanded && "flex flex-col items-center") }, visibleNav.map(function (item) { return react_1["default"].createElement("div", { key: item.id, className: "w-full" }, renderNavItem(item)); }))),
                    react_1["default"].createElement(UserFooter, { expanded: sidebarExpanded }))),
            !sidebarExpanded && popoutItem && (function () {
                var activeItem = visibleNav.find(function (i) { return i.id === popoutItem; });
                if (!(activeItem === null || activeItem === void 0 ? void 0 : activeItem.children))
                    return null;
                var ch = activeItem.children;
                var maxTop = typeof window !== 'undefined' ? window.innerHeight - (ch.length * 40 + 60) : 400;
                return (react_1["default"].createElement("div", { id: "org-sidebar-popout", className: "fixed left-[70px] z-[200] bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-r-lg shadow-xl py-1 min-w-[200px] hidden lg:block", style: { top: Math.max(56, Math.min(popoutY, maxTop)) }, onMouseEnter: cancelClosePopout, onMouseLeave: scheduleClosePopout },
                    react_1["default"].createElement("div", { className: "flex items-center gap-2 px-4 py-2.5 border-b dark:border-slate-700" },
                        activeItem.icon && react_1["default"].createElement(activeItem.icon, { className: "h-4 w-4 text-teal-600 dark:text-teal-400" }),
                        react_1["default"].createElement("span", { className: "text-sm font-semibold text-teal-600 dark:text-teal-400" }, activeItem.label)),
                    react_1["default"].createElement("div", { className: "py-1" }, ch.map(function (child) {
                        var ChildIcon = child.icon;
                        var isChildActive = isActiveHref(child.href);
                        var locked = isItemLocked(child);
                        return (react_1["default"].createElement("button", { key: child.id, onClick: function () { if (!locked && child.href) {
                                navigate(child.href);
                                setPopoutItem(null);
                            } }, className: utils_1.cn("w-full text-left px-4 py-2 text-sm flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors", isChildActive && "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-medium", locked && "opacity-50 cursor-not-allowed") },
                            ChildIcon && react_1["default"].createElement(ChildIcon, { className: "h-3.5 w-3.5 text-muted-foreground" }),
                            child.label,
                            locked && react_1["default"].createElement(lucide_react_1.Crown, { className: "ml-auto h-3 w-3 text-amber-400" })));
                    }))));
            })(),
            react_1["default"].createElement("div", { className: utils_1.cn("transition-all duration-300 flex flex-col min-h-screen", "ml-0 lg:ml-[70px]", sidebarExpanded && "lg:ml-[250px]") },
                react_1["default"].createElement("header", { className: "sticky top-0 z-30 flex h-12 sm:h-14 items-center gap-1 sm:gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-2 sm:px-4 md:px-6 flex-shrink-0" },
                    react_1["default"].createElement("div", { className: "w-9 sm:w-10 lg:hidden" }),
                    react_1["default"].createElement(tooltip_1.TooltipProvider, { delayDuration: 300 },
                        react_1["default"].createElement(tooltip_1.Tooltip, null,
                            react_1["default"].createElement(tooltip_1.TooltipTrigger, { asChild: true },
                                react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 sm:h-9 sm:w-9 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hidden lg:inline-flex", onClick: function () { return setSidebarPinned(function (prev) { return !prev; }); } },
                                    react_1["default"].createElement(lucide_react_1.Menu, { className: "h-4 w-4 sm:h-5 sm:w-5" }))),
                            react_1["default"].createElement(tooltip_1.TooltipContent, null,
                                react_1["default"].createElement("p", null, sidebarPinned ? 'Collapse sidebar' : 'Expand sidebar')))),
                    react_1["default"].createElement(tooltip_1.TooltipProvider, { delayDuration: 300 },
                        react_1["default"].createElement(tooltip_1.Tooltip, null,
                            react_1["default"].createElement(tooltip_1.TooltipTrigger, { asChild: true },
                                react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 sm:h-9 sm:w-9 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100", onClick: function () { return navigate("/org/" + slug + "/dashboard"); } },
                                    react_1["default"].createElement(lucide_react_1.Home, { className: "h-4 w-4 sm:h-5 sm:w-5" }))),
                            react_1["default"].createElement(tooltip_1.TooltipContent, null,
                                react_1["default"].createElement("p", null, "Dashboard")))),
                    react_1["default"].createElement("form", { className: "relative hidden sm:flex items-center ml-1", onSubmit: function (e) { e.preventDefault(); if (headerSearchQuery.trim()) {
                            setCmdOpen(true);
                            setHeaderSearchQuery("");
                        } } },
                        react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-2.5 h-4 w-4 text-muted-foreground pointer-events-none" }),
                        react_1["default"].createElement("input", { type: "text", placeholder: "Search", value: headerSearchQuery, onChange: function (e) { return setHeaderSearchQuery(e.target.value); }, onFocus: function () { return setCmdOpen(true); }, className: "h-8 w-40 md:w-52 rounded-md border border-input bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" })),
                    react_1["default"].createElement("div", { className: "flex-1" }),
                    react_1["default"].createElement(tooltip_1.TooltipProvider, { delayDuration: 300 },
                        react_1["default"].createElement("div", { className: "flex items-center gap-0.5 sm:gap-1" },
                            react_1["default"].createElement(sheet_1.Sheet, null,
                                react_1["default"].createElement(tooltip_1.Tooltip, null,
                                    react_1["default"].createElement(tooltip_1.TooltipTrigger, { asChild: true },
                                        react_1["default"].createElement(sheet_1.SheetTrigger, { asChild: true },
                                            react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 sm:h-9 sm:w-9 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100" },
                                                react_1["default"].createElement(lucide_react_1.Star, { className: "h-4 w-4 sm:h-5 sm:w-5" })))),
                                    react_1["default"].createElement(tooltip_1.TooltipContent, null,
                                        react_1["default"].createElement("p", null, "Favorites"))),
                                react_1["default"].createElement(sheet_1.SheetContent, { side: "right", className: "w-80 sm:w-96" },
                                    react_1["default"].createElement(sheet_1.SheetHeader, null,
                                        react_1["default"].createElement(sheet_1.SheetTitle, null, "Favorites")),
                                    react_1["default"].createElement("div", { className: "flex flex-wrap gap-1 mt-4 mb-3" }, ['All', 'Clients', 'Projects', 'Invoices', 'Estimates', 'Employees', 'Suppliers'].map(function (f) { return (react_1["default"].createElement(button_1.Button, { key: f, size: "sm", variant: favFilter === f ? 'default' : 'outline', className: "h-7 text-xs", onClick: function () { return setFavFilter(f); } }, f)); })),
                                    react_1["default"].createElement(scroll_area_1.ScrollArea, { className: "h-[calc(100vh-200px)]" },
                                        react_1["default"].createElement("div", { className: "space-y-1" },
                                            (Array.isArray(favoritesData) ? favoritesData : [])
                                                .filter(function (fav) { var _a; return favFilter === 'All' || ((_a = fav.entityType) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === favFilter.toLowerCase().replace(/s$/, ''); })
                                                .map(function (fav) { return (react_1["default"].createElement("button", { key: fav.id, onClick: function () { return fav.entityUrl && navigate(fav.entityUrl); }, className: "w-full text-left px-3 py-2 rounded-lg hover:bg-accent text-sm flex items-center gap-2" },
                                                react_1["default"].createElement(lucide_react_1.Star, { className: "h-3.5 w-3.5 text-amber-400 fill-amber-400" }),
                                                react_1["default"].createElement("span", { className: "truncate" }, fav.entityName || fav.entityType),
                                                react_1["default"].createElement(badge_1.Badge, { variant: "outline", className: "ml-auto text-[10px]" }, fav.entityType))); }),
                                            (!favoritesData || (Array.isArray(favoritesData) && favoritesData.length === 0)) && (react_1["default"].createElement("p", { className: "text-sm text-muted-foreground text-center py-8" }, "No favorites yet")))))),
                            react_1["default"].createElement(dropdown_menu_1.DropdownMenu, null,
                                react_1["default"].createElement(tooltip_1.Tooltip, null,
                                    react_1["default"].createElement(tooltip_1.TooltipTrigger, { asChild: true },
                                        react_1["default"].createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                                            react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "icon", className: utils_1.cn("h-8 w-8 sm:h-9 sm:w-9", timerRunning ? "text-green-500" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100") },
                                                react_1["default"].createElement(lucide_react_1.Timer, { className: "h-4 w-4 sm:h-5 sm:w-5" })))),
                                    react_1["default"].createElement(tooltip_1.TooltipContent, null,
                                        react_1["default"].createElement("p", null,
                                            "Timer ",
                                            timerRunning ? formatTimer(timerSeconds) : ''))),
                                react_1["default"].createElement(dropdown_menu_1.DropdownMenuContent, { align: "end", className: "w-64 p-3" },
                                    react_1["default"].createElement("div", { className: "text-center mb-3" },
                                        react_1["default"].createElement("p", { className: "text-3xl font-mono font-bold" }, formatTimer(timerSeconds)),
                                        timerProject && react_1["default"].createElement("p", { className: "text-xs text-muted-foreground mt-1" }, timerProject)),
                                    react_1["default"].createElement("input", { type: "text", placeholder: "Project / Task name", value: timerProject, onChange: function (e) { return setTimerProject(e.target.value); }, className: "w-full h-8 rounded-md border border-input bg-background px-3 text-sm mb-3 focus:outline-none focus:ring-1 focus:ring-ring" }),
                                    react_1["default"].createElement("div", { className: "flex gap-2" },
                                        react_1["default"].createElement(button_1.Button, { size: "sm", className: "flex-1", variant: timerRunning ? 'destructive' : 'default', onClick: function () { if (!timerRunning) {
                                                setTimerRunning(true);
                                                setTimerStartedAt(Date.now());
                                            }
                                            else {
                                                setTimerRunning(false);
                                                setTimerStartedAt(null);
                                            } } }, timerRunning ? react_1["default"].createElement(react_1["default"].Fragment, null,
                                            react_1["default"].createElement(lucide_react_1.Square, { className: "h-3 w-3 mr-1" }),
                                            "Stop") : react_1["default"].createElement(react_1["default"].Fragment, null,
                                            react_1["default"].createElement(lucide_react_1.Play, { className: "h-3 w-3 mr-1" }),
                                            "Start")),
                                        react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { setTimerRunning(false); setTimerSeconds(0); setTimerStartedAt(null); setTimerProject(''); } }, "Reset")))),
                            react_1["default"].createElement(sheet_1.Sheet, null,
                                react_1["default"].createElement(tooltip_1.Tooltip, null,
                                    react_1["default"].createElement(tooltip_1.TooltipTrigger, { asChild: true },
                                        react_1["default"].createElement(sheet_1.SheetTrigger, { asChild: true },
                                            react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 sm:h-9 sm:w-9 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 relative" },
                                                react_1["default"].createElement(lucide_react_1.AlarmClock, { className: "h-4 w-4 sm:h-5 sm:w-5" }),
                                                (Array.isArray(remindersDueData) && remindersDueData.length > 0) && (react_1["default"].createElement("span", { className: "absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center" }, remindersDueData.length))))),
                                    react_1["default"].createElement(tooltip_1.TooltipContent, null,
                                        react_1["default"].createElement("p", null, "Reminders"))),
                                react_1["default"].createElement(sheet_1.SheetContent, { side: "right", className: "w-80 sm:w-96" },
                                    react_1["default"].createElement(sheet_1.SheetHeader, null,
                                        react_1["default"].createElement(sheet_1.SheetTitle, null, "Reminders")),
                                    react_1["default"].createElement("div", { className: "flex gap-2 mt-4 mb-3" },
                                        react_1["default"].createElement(button_1.Button, { size: "sm", variant: reminderTab === 'due' ? 'default' : 'outline', onClick: function () { return setReminderTab('due'); } },
                                            "Due ",
                                            Array.isArray(remindersDueData) && remindersDueData.length > 0 && "(" + remindersDueData.length + ")"),
                                        react_1["default"].createElement(button_1.Button, { size: "sm", variant: reminderTab === 'pending' ? 'default' : 'outline', onClick: function () { return setReminderTab('pending'); } },
                                            "Pending ",
                                            Array.isArray(remindersPendingData) && remindersPendingData.length > 0 && "(" + remindersPendingData.length + ")")),
                                    react_1["default"].createElement(scroll_area_1.ScrollArea, { className: "h-[calc(100vh-200px)]" },
                                        react_1["default"].createElement("div", { className: "space-y-1" },
                                            (reminderTab === 'due' ? (Array.isArray(remindersDueData) ? remindersDueData : []) : (Array.isArray(remindersPendingData) ? remindersPendingData : [])).map(function (r) { return (react_1["default"].createElement("button", { key: r.id, onClick: function () { return r.entityUrl && navigate(r.entityUrl); }, className: "w-full text-left px-3 py-2 rounded-lg hover:bg-accent text-sm" },
                                                react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                                                    react_1["default"].createElement(lucide_react_1.AlarmClock, { className: "h-3.5 w-3.5 text-orange-500 shrink-0" }),
                                                    react_1["default"].createElement("span", { className: "truncate font-medium" }, r.title || r.description || 'Reminder')),
                                                r.dueDate && react_1["default"].createElement("p", { className: "text-xs text-muted-foreground ml-5 mt-0.5" }, new Date(r.dueDate).toLocaleDateString()))); }),
                                            (reminderTab === 'due' ? !remindersDueData || (Array.isArray(remindersDueData) && remindersDueData.length === 0) : !remindersPendingData || (Array.isArray(remindersPendingData) && remindersPendingData.length === 0)) && (react_1["default"].createElement("p", { className: "text-sm text-muted-foreground text-center py-8" },
                                                "No ",
                                                reminderTab,
                                                " reminders")))))),
                            react_1["default"].createElement(NotificationBell_1.NotificationBell, null),
                            react_1["default"].createElement(tooltip_1.Tooltip, null,
                                react_1["default"].createElement(tooltip_1.TooltipTrigger, { asChild: true },
                                    react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 sm:h-9 sm:w-9 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100", onClick: function () { return navigate("/org/" + slug + "/calendar"); } },
                                        react_1["default"].createElement(lucide_react_1.CalendarDays, { className: "h-4 w-4 sm:h-5 sm:w-5" }))),
                                react_1["default"].createElement(tooltip_1.TooltipContent, null,
                                    react_1["default"].createElement("p", null, "Calendar"))),
                            react_1["default"].createElement(tooltip_1.Tooltip, null,
                                react_1["default"].createElement(tooltip_1.TooltipTrigger, { asChild: true },
                                    react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 sm:h-9 sm:w-9 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100", onClick: function () { return navigate("/org/" + slug + "/communications"); } },
                                        react_1["default"].createElement(lucide_react_1.MessageSquare, { className: "h-4 w-4 sm:h-5 sm:w-5" }))),
                                react_1["default"].createElement(tooltip_1.TooltipContent, null,
                                    react_1["default"].createElement("p", null, "Communications"))),
                            isAdmin && (react_1["default"].createElement(tooltip_1.Tooltip, null,
                                react_1["default"].createElement(tooltip_1.TooltipTrigger, { asChild: true },
                                    react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 sm:h-9 sm:w-9 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100", onClick: function () { return navigate("/org/" + slug + "/settings"); } },
                                        react_1["default"].createElement(lucide_react_1.Settings, { className: "h-4 w-4 sm:h-5 sm:w-5" }))),
                                react_1["default"].createElement(tooltip_1.TooltipContent, null,
                                    react_1["default"].createElement("p", null, "Organization Settings")))),
                            react_1["default"].createElement(dropdown_menu_1.DropdownMenu, null,
                                react_1["default"].createElement(tooltip_1.Tooltip, null,
                                    react_1["default"].createElement(tooltip_1.TooltipTrigger, { asChild: true },
                                        react_1["default"].createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                                            react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 sm:h-9 sm:w-9 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100" },
                                                react_1["default"].createElement(lucide_react_1.Globe, { className: "h-4 w-4 sm:h-5 sm:w-5" })))),
                                    react_1["default"].createElement(tooltip_1.TooltipContent, null,
                                        react_1["default"].createElement("p", null, "Language"))),
                                react_1["default"].createElement(dropdown_menu_1.DropdownMenuContent, { align: "end", className: "w-44 max-h-80 overflow-y-auto" },
                                    react_1["default"].createElement(dropdown_menu_1.DropdownMenuLabel, { className: "text-xs font-semibold text-muted-foreground uppercase" }, "Language"),
                                    react_1["default"].createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                                    languages.map(function (lang) { return (react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { key: lang, onClick: function () { return handleLanguageChange(lang); }, className: "text-sm flex items-center justify-between" },
                                        react_1["default"].createElement("span", null, lang),
                                        selectedLanguage === lang && react_1["default"].createElement(lucide_react_1.Check, { className: "h-4 w-4 text-primary" }))); }))),
                            react_1["default"].createElement(dropdown_menu_1.DropdownMenu, null,
                                react_1["default"].createElement(tooltip_1.Tooltip, null,
                                    react_1["default"].createElement(tooltip_1.TooltipTrigger, { asChild: true },
                                        react_1["default"].createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                                            react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 sm:h-9 sm:w-9 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300" },
                                                react_1["default"].createElement(lucide_react_1.Plus, { className: "h-5 w-5 sm:h-6 sm:w-6" })))),
                                    react_1["default"].createElement(tooltip_1.TooltipContent, null,
                                        react_1["default"].createElement("p", null, "Quick Create"))),
                                react_1["default"].createElement(dropdown_menu_1.DropdownMenuContent, { align: "end", className: "w-52" },
                                    react_1["default"].createElement(dropdown_menu_1.DropdownMenuLabel, { className: "text-xs font-semibold text-muted-foreground uppercase" }, "Create New"),
                                    react_1["default"].createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                                    featureMap.crm !== false && react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/org/" + slug + "/crm"); }, className: "text-sm" },
                                        react_1["default"].createElement(lucide_react_1.Users, { className: "mr-2 h-4 w-4" }),
                                        react_1["default"].createElement("span", null, "Client")),
                                    featureMap.projects !== false && react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/org/" + slug + "/projects"); }, className: "text-sm" },
                                        react_1["default"].createElement(lucide_react_1.Briefcase, { className: "mr-2 h-4 w-4" }),
                                        react_1["default"].createElement("span", null, "Project")),
                                    featureMap.projects !== false && react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/org/" + slug + "/tasks"); }, className: "text-sm" },
                                        react_1["default"].createElement(lucide_react_1.CheckSquare, { className: "mr-2 h-4 w-4" }),
                                        react_1["default"].createElement("span", null, "Task")),
                                    featureMap.crm !== false && react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/org/" + slug + "/leads"); }, className: "text-sm" },
                                        react_1["default"].createElement(lucide_react_1.Phone, { className: "mr-2 h-4 w-4" }),
                                        react_1["default"].createElement("span", null, "Lead")),
                                    react_1["default"].createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                                    featureMap.invoicing !== false && react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/org/" + slug + "/invoices"); }, className: "text-sm" },
                                        react_1["default"].createElement(lucide_react_1.FileText, { className: "mr-2 h-4 w-4" }),
                                        react_1["default"].createElement("span", null, "Invoice")),
                                    featureMap.invoicing !== false && react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/org/" + slug + "/estimates"); }, className: "text-sm" },
                                        react_1["default"].createElement(lucide_react_1.FileSpreadsheet, { className: "mr-2 h-4 w-4" }),
                                        react_1["default"].createElement("span", null, "Estimate")),
                                    featureMap.invoicing !== false && react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/org/" + slug + "/proposals"); }, className: "text-sm" },
                                        react_1["default"].createElement(lucide_react_1.Pencil, { className: "mr-2 h-4 w-4" }),
                                        react_1["default"].createElement("span", null, "Proposal")),
                                    featureMap.payments !== false && react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/org/" + slug + "/payments"); }, className: "text-sm" },
                                        react_1["default"].createElement(lucide_react_1.CreditCard, { className: "mr-2 h-4 w-4" }),
                                        react_1["default"].createElement("span", null, "Payment")),
                                    featureMap.invoicing !== false && react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/org/" + slug + "/subscriptions"); }, className: "text-sm" },
                                        react_1["default"].createElement(lucide_react_1.Layers, { className: "mr-2 h-4 w-4" }),
                                        react_1["default"].createElement("span", null, "Subscription")),
                                    featureMap.expenses !== false && react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/org/" + slug + "/expenses"); }, className: "text-sm" },
                                        react_1["default"].createElement(lucide_react_1.Receipt, { className: "mr-2 h-4 w-4" }),
                                        react_1["default"].createElement("span", null, "Expense")),
                                    react_1["default"].createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                                    featureMap.contracts !== false && react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/org/" + slug + "/contracts"); }, className: "text-sm" },
                                        react_1["default"].createElement(lucide_react_1.FileCheck, { className: "mr-2 h-4 w-4" }),
                                        react_1["default"].createElement("span", null, "Contract")),
                                    featureMap.tickets !== false && react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/org/" + slug + "/tickets"); }, className: "text-sm" },
                                        react_1["default"].createElement(lucide_react_1.Ticket, { className: "mr-2 h-4 w-4" }),
                                        react_1["default"].createElement("span", null, "Ticket")),
                                    featureMap.tickets !== false && react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/org/" + slug + "/knowledge-base"); }, className: "text-sm" },
                                        react_1["default"].createElement(lucide_react_1.Book, { className: "mr-2 h-4 w-4" }),
                                        react_1["default"].createElement("span", null, "Article")))))),
                    react_1["default"].createElement(dropdown_menu_1.DropdownMenu, null,
                        react_1["default"].createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                            react_1["default"].createElement(button_1.Button, { variant: "ghost", className: "relative h-8 sm:h-9 rounded-full p-0 pl-1 pr-2 gap-2 hover:bg-accent" },
                                react_1["default"].createElement(avatar_1.Avatar, { className: "h-7 w-7 sm:h-8 sm:w-8" },
                                    react_1["default"].createElement(avatar_1.AvatarImage, { src: ((_c = user) === null || _c === void 0 ? void 0 : _c.photoUrl) || undefined }),
                                    react_1["default"].createElement(avatar_1.AvatarFallback, { className: "text-xs" }, getInitials((user === null || user === void 0 ? void 0 : user.name) || undefined))),
                                react_1["default"].createElement("span", { className: "hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-200" }, ((_d = user === null || user === void 0 ? void 0 : user.name) === null || _d === void 0 ? void 0 : _d.split(" ")[0]) || "User"))),
                        react_1["default"].createElement(dropdown_menu_1.DropdownMenuContent, { align: "end", className: "w-52" },
                            react_1["default"].createElement(dropdown_menu_1.DropdownMenuLabel, null,
                                react_1["default"].createElement("div", { className: "flex flex-col space-y-0.5" },
                                    react_1["default"].createElement("p", { className: "text-sm font-medium truncate" }, (user === null || user === void 0 ? void 0 : user.name) || "User"),
                                    react_1["default"].createElement("p", { className: "text-xs text-muted-foreground truncate" }, (user === null || user === void 0 ? void 0 : user.email) || ""))),
                            react_1["default"].createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                            react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/profile"); }, className: "text-sm" },
                                react_1["default"].createElement(lucide_react_1.ImageIcon, { className: "mr-2 h-4 w-4" }),
                                react_1["default"].createElement("span", null, "Update Avatar")),
                            react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/profile"); }, className: "text-sm" },
                                react_1["default"].createElement(lucide_react_1.User, { className: "mr-2 h-4 w-4" }),
                                react_1["default"].createElement("span", null, "Update Profile")),
                            react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/org/" + slug + "/timesheets"); }, className: "text-sm" },
                                react_1["default"].createElement(lucide_react_1.Clock, { className: "mr-2 h-4 w-4" }),
                                react_1["default"].createElement("span", null, "Time Sheets")),
                            react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/org/" + slug + "/notes"); }, className: "text-sm" },
                                react_1["default"].createElement(lucide_react_1.StickyNote, { className: "mr-2 h-4 w-4" }),
                                react_1["default"].createElement("span", null, "Notes")),
                            react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/settings"); }, className: "text-sm" },
                                react_1["default"].createElement(lucide_react_1.Bell, { className: "mr-2 h-4 w-4" }),
                                react_1["default"].createElement("span", null, "Notification Settings")),
                            react_1["default"].createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                            react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: toggleTheme, className: "text-sm" }, theme === "dark" ? react_1["default"].createElement(react_1["default"].Fragment, null,
                                react_1["default"].createElement(lucide_react_1.Sun, { className: "mr-2 h-4 w-4" }),
                                react_1["default"].createElement("span", null, "Light Mode")) : react_1["default"].createElement(react_1["default"].Fragment, null,
                                react_1["default"].createElement(lucide_react_1.Moon, { className: "mr-2 h-4 w-4" }),
                                react_1["default"].createElement("span", null, "Dark Mode"))),
                            react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/security"); }, className: "text-sm" },
                                react_1["default"].createElement(lucide_react_1.KeyRound, { className: "mr-2 h-4 w-4" }),
                                react_1["default"].createElement("span", null, "Update Password")),
                            react_1["default"].createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                            react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return logout(); }, className: "text-red-600 dark:text-red-400 text-sm" },
                                react_1["default"].createElement(lucide_react_1.LogOut, { className: "mr-2 h-4 w-4" }),
                                react_1["default"].createElement("span", null, "Sign Out"))))),
                react_1["default"].createElement(CriticalMessagesBanner, null),
                react_1["default"].createElement("main", { className: utils_1.cn("flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto", className) }, children),
                react_1["default"].createElement("footer", { className: "border-t bg-muted/30 py-3 px-4 text-center flex-shrink-0" },
                    react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" },
                        "\u00A9 ",
                        new Date().getFullYear(),
                        " Kiini. All rights reserved.")))),
        cmdOpen && (react_1["default"].createElement("div", { className: "fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" },
            react_1["default"].createElement("div", { className: "absolute inset-0 bg-black/50 backdrop-blur-sm", onClick: function () { return setCmdOpen(false); } }),
            react_1["default"].createElement("div", { className: "relative w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl overflow-hidden" },
                react_1["default"].createElement("div", { className: "flex items-center gap-3 border-b border-border px-4 py-3" },
                    react_1["default"].createElement(lucide_react_1.Search, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
                    react_1["default"].createElement("input", { autoFocus: true, type: "text", placeholder: "Search pages, clients, actions...", className: "flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" }),
                    react_1["default"].createElement("kbd", { className: "rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground" }, "ESC")),
                react_1["default"].createElement("div", { className: "max-h-80 overflow-y-auto p-2" },
                    react_1["default"].createElement("p", { className: "px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground" }, "Quick Navigation"),
                    visibleNav.map(function (item) {
                        if (item.children) {
                            return item.children.map(function (child) {
                                var Icon = child.icon;
                                var locked = isItemLocked(child);
                                return (react_1["default"].createElement("button", { key: child.id, className: utils_1.cn("w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors cursor-pointer text-left", locked && "opacity-50 cursor-not-allowed"), onClick: function () { if (!locked && child.href) {
                                        navigate(child.href);
                                        setCmdOpen(false);
                                    } } },
                                    react_1["default"].createElement(Icon, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
                                    react_1["default"].createElement("span", null, child.label),
                                    locked && react_1["default"].createElement(lucide_react_1.Crown, { className: "ml-auto h-3 w-3 text-amber-400" })));
                            });
                        }
                        var Icon = item.icon;
                        return (react_1["default"].createElement("button", { key: item.id, className: "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors cursor-pointer text-left", onClick: function () { if (item.href) {
                                navigate(item.href);
                                setCmdOpen(false);
                            } } },
                            react_1["default"].createElement(Icon, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
                            react_1["default"].createElement("span", null, item.label)));
                    }))))),
        react_1["default"].createElement(FloatingAIChat_1.FloatingAIChat, null),
        react_1["default"].createElement(FloatingChatNotifications_1["default"], null),
        react_1["default"].createElement(AccessibilityWidget_1["default"], null)));
}
exports.OrgLayout = OrgLayout;
exports["default"] = OrgLayout;
