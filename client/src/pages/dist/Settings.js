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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var ThemeCustomizationContext_1 = require("@/contexts/ThemeCustomizationContext");
var ThemeContext_1 = require("@/contexts/ThemeContext");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var separator_1 = require("@/components/ui/separator");
var switch_1 = require("@/components/ui/switch");
var select_1 = require("@/components/ui/select");
var badge_1 = require("@/components/ui/badge");
var dialog_1 = require("@/components/ui/dialog");
var textarea_1 = require("@/components/ui/textarea");
var tabs_1 = require("@/components/ui/tabs");
var table_1 = require("@/components/ui/table");
var react_1 = require("react");
var wouter_1 = require("wouter");
var sonner_1 = require("sonner");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var trpc_1 = require("@/lib/trpc");
var mutationHelpers_1 = require("@/lib/mutationHelpers");
var BackupRestore_1 = require("@/components/BackupRestore");
var CSVImportExport_1 = require("@/components/CSVImportExport");
var LocationSelects_1 = require("@/components/LocationSelects");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
var S = function (id, label, sectionId) {
    return ({ id: id, label: label, type: "section", sectionId: sectionId });
};
var L = function (id, label, href, _description) {
    return ({ id: id, label: label, type: "link", href: href });
};
var E = function (id, label, sectionId, href) {
    return ({ id: id, label: label, type: "embed", sectionId: sectionId, href: href });
};
// ─── Full settings tree (matching Kiini: One Hub. Total Control + tools absorbed) ────────────────
var NAV_GROUPS = [
    {
        id: "main", label: "Main Settings",
        icon: React.createElement(lucide_react_1.Settings, { className: "h-4 w-4" }),
        children: [
            S("general", "General Settings", "general"),
            S("company", "Company Details", "company"),
            S("currency", "Currency", "currency"),
            S("theme", "Theme", "theme"),
            S("company-logo", "Company Logo", "company-logo"),
        ]
    },
    {
        id: "billing", label: "Billing",
        icon: React.createElement(lucide_react_1.CreditCard, { className: "h-4 w-4" }),
        children: [
            S("billing-account", "My Account", "billing-account"),
            S("billing-plans", "Plans", "billing-plans"),
            S("billing-payments", "Payments", "billing-payments"),
            S("billing-notices", "Notices", "billing-notices"),
        ]
    },
    {
        id: "email-group", label: "Email",
        icon: React.createElement(lucide_react_1.Mail, { className: "h-4 w-4" }),
        children: [
            S("email-settings", "Email Settings", "email"),
            S("email-templates", "Email Templates", "email-templates"),
            S("email-queue", "Email Queue", "email-queue"),
            S("email-log", "Email Log", "email-log"),
        ]
    },
    {
        id: "clients", label: "Clients",
        icon: React.createElement(lucide_react_1.Users, { className: "h-4 w-4" }),
        children: [
            S("clients-general", "General Settings", "clients-general"),
            S("clients-categories", "Categories", "clients-categories"),
            S("clients-customfields", "Custom Fields", "custom-fields-clients"),
            S("clients-email-templates", "Email Templates", "clients-email-templates"),
        ]
    },
    {
        id: "projects", label: "Projects",
        icon: React.createElement(lucide_react_1.FolderKanban, { className: "h-4 w-4" }),
        children: [
            S("projects-general", "General Settings", "projects-general"),
            S("projects-categories", "Categories", "projects-categories"),
            S("projects-team-perms", "Team Permissions", "projects-team-perms"),
            S("projects-client-perms", "Client Permissions", "projects-client-perms"),
            S("projects-customfields", "Custom Fields", "custom-fields-projects"),
            S("projects-automation", "Automation", "projects-automation"),
        ]
    },
    {
        id: "tasks", label: "Tasks",
        icon: React.createElement(lucide_react_1.CheckSquare, { className: "h-4 w-4" }),
        children: [
            S("tasks-general", "General Settings", "tasks-general"),
            S("tasks-statuses", "Statuses", "tasks-statuses"),
            S("tasks-priorities", "Priorities", "tasks-priorities"),
            S("tasks-customfields", "Custom Fields", "custom-fields-tasks"),
        ]
    },
    {
        id: "leads", label: "Leads",
        icon: React.createElement(lucide_react_1.TrendingUp, { className: "h-4 w-4" }),
        children: [
            S("leads-general", "General Settings", "leads-general"),
            S("leads-categories", "Categories", "leads-categories"),
            S("leads-stages", "Lead Stages", "leads-stages"),
            S("leads-sources", "Lead Sources", "leads-sources"),
            S("leads-customfields", "Custom Fields", "custom-fields-leads"),
            S("leads-webforms", "Web Forms", "leads-webforms"),
            S("leads-email-templates", "Email Templates", "leads-email-templates"),
        ]
    },
    {
        id: "milestones", label: "Milestones",
        icon: React.createElement(lucide_react_1.Flag, { className: "h-4 w-4" }),
        children: [
            S("milestones-general", "General Settings", "milestones-general"),
            S("milestones-defaults", "Default Milestones", "milestones-defaults"),
        ]
    },
    {
        id: "purchasing", label: "Purchasing",
        icon: React.createElement(lucide_react_1.Package, { className: "h-4 w-4" }),
        children: [
            S("purchasing-settings", "Settings", "purchasing-settings"),
            S("purchasing-email", "Email", "purchasing-email"),
        ]
    },
    {
        id: "invoices-group", label: "Invoices",
        icon: React.createElement(lucide_react_1.FileText, { className: "h-4 w-4" }),
        children: [
            S("invoices", "General Settings", "invoices"),
            S("invoices-categories", "Categories", "invoices-categories"),
            S("invoices-statuses", "Statuses", "invoices-statuses"),
        ]
    },
    {
        id: "estimates", label: "Estimates",
        icon: React.createElement(lucide_react_1.ClipboardList, { className: "h-4 w-4" }),
        children: [
            S("estimates-general", "General Settings", "estimates-general"),
            S("estimates-categories", "Categories", "estimates-categories"),
            S("estimates-automation", "Automation", "estimates-automation"),
        ]
    },
    {
        id: "timesheets", label: "Time Sheets",
        icon: React.createElement(lucide_react_1.Clock, { className: "h-4 w-4" }),
        children: [
            S("timesheets-general", "General Settings", "timesheets-general"),
        ]
    },
    {
        id: "proposals", label: "Proposals",
        icon: React.createElement(lucide_react_1.FileText, { className: "h-4 w-4" }),
        children: [
            S("proposals-general", "General Settings", "proposals-general"),
            S("proposals-categories", "Categories", "proposals-categories"),
            S("proposals-automation", "Automation", "proposals-automation"),
        ]
    },
    {
        id: "contracts", label: "Contracts",
        icon: React.createElement(lucide_react_1.FileText, { className: "h-4 w-4" }),
        children: [
            S("contracts-general", "General Settings", "contracts-general"),
            S("contracts-categories", "Categories", "contracts-categories"),
            S("contracts-automation", "Automation", "contracts-automation"),
        ]
    },
    {
        id: "products", label: "Products",
        icon: React.createElement(lucide_react_1.Package, { className: "h-4 w-4" }),
        children: [
            S("products-categories", "Categories", "products-categories"),
            S("products-units", "Units", "products-units"),
            S("products-customfields", "Custom Fields", "custom-fields-products"),
        ]
    },
    {
        id: "expenses", label: "Expenses",
        icon: React.createElement(lucide_react_1.Receipt, { className: "h-4 w-4" }),
        children: [
            S("expenses-general", "General Settings", "expenses-general"),
            S("expenses-categories", "Categories", "expenses-categories"),
        ]
    },
    {
        id: "subscriptions", label: "Subscriptions",
        icon: React.createElement(lucide_react_1.RefreshCcw, { className: "h-4 w-4" }),
        children: [
            S("subscriptions-general", "General Settings", "subscriptions-general"),
        ]
    },
    {
        id: "tax-group", label: "Tax",
        icon: React.createElement(lucide_react_1.Percent, { className: "h-4 w-4" }),
        children: [
            S("tax", "Tax Rates", "tax"),
        ]
    },
    {
        id: "tags-group", label: "Tags",
        icon: React.createElement(lucide_react_1.Tag, { className: "h-4 w-4" }),
        children: [
            S("tags-general", "General Settings", "tags-general"),
            S("tags", "View Tags", "tags"),
        ]
    },
    {
        id: "files", label: "Files",
        icon: React.createElement(lucide_react_1.FolderOpen, { className: "h-4 w-4" }),
        children: [
            S("files-general", "General Settings", "files-general"),
            S("files-folders", "Folders", "files-folders"),
            S("files-default-folders", "Default Folders", "files-default-folders"),
        ]
    },
    {
        id: "payment-methods", label: "Payment Methods",
        icon: React.createElement(lucide_react_1.CreditCard, { className: "h-4 w-4" }),
        children: [
            S("payments-bank", "Bank Transfer", "payments-bank"),
            S("payments-stripe", "Stripe", "payments-stripe"),
            S("payments-mpesa", "M-Pesa", "payments-mpesa"),
            S("payments-flutterwave", "Flutterwave", "payments-flutterwave"),
            S("payments-razorpay", "Razorpay", "payments-razorpay"),
            S("payments-paypal", "PayPal", "payments-paypal"),
            S("payments-paystack", "Paystack", "payments-paystack"),
            S("payments-pesapal", "Pesapal", "payments-pesapal"),
            S("payments-mollie", "Mollie Pay", "payments-mollie"),
            S("payments-tappay", "Tap Pay", "payments-tappay"),
            S("payments-airtel", "Airtel Money", "payments-airtel"),
            S("payments-mtnmomo", "MTN MoMo", "payments-mtnmomo"),
        ]
    },
    {
        id: "user-roles", label: "User Roles",
        icon: React.createElement(lucide_react_1.Shield, { className: "h-4 w-4" }),
        children: [
            S("roles", "Roles & Permissions", "roles"),
            S("permissions", "Advanced Permissions", "permissions-matrix"),
        ]
    },
    {
        id: "notifications-group", label: "Notifications",
        icon: React.createElement(lucide_react_1.Bell, { className: "h-4 w-4" }),
        children: [
            S("notifications", "Preferences", "notifications"),
        ]
    },
    {
        id: "tickets", label: "Tickets",
        icon: React.createElement(lucide_react_1.MessageSquare, { className: "h-4 w-4" }),
        children: [
            S("tickets-general", "General Settings", "tickets-general"),
            S("tickets-departments", "Departments", "tickets-departments"),
            S("tickets-statuses", "Statuses", "tickets-statuses"),
            S("tickets-canned", "Canned Categories", "tickets-canned"),
            S("tickets-customfields", "Custom Fields", "custom-fields-tickets"),
        ]
    },
    {
        id: "knowledgebase", label: "Knowledgebase",
        icon: React.createElement(lucide_react_1.BookOpen, { className: "h-4 w-4" }),
        children: [
            S("kb-general", "General Settings", "kb-general"),
            S("kb-categories", "Categories", "kb-categories"),
        ]
    },
    {
        id: "announcements", label: "Announcements",
        icon: React.createElement(lucide_react_1.Megaphone, { className: "h-4 w-4" }),
        children: [
            S("announcements-general", "General Settings", "announcements-general"),
            S("announcements-list", "Manage Announcements", "announcements-list"),
        ]
    },
    {
        id: "goals", label: "Goals",
        icon: React.createElement(lucide_react_1.Target, { className: "h-4 w-4" }),
        children: [
            S("goals-general", "General Settings", "goals-general"),
            S("goals-categories", "Categories", "goals-categories"),
        ]
    },
    {
        id: "reminders", label: "Reminders",
        icon: React.createElement(lucide_react_1.Timer, { className: "h-4 w-4" }),
        children: [
            S("reminders-general", "General Settings", "reminders-general"),
        ]
    },
    {
        id: "security", label: "Security",
        icon: React.createElement(lucide_react_1.Lock, { className: "h-4 w-4" }),
        children: [
            S("security-password", "Password Policy", "security-password"),
            S("security-2fa", "Two-Factor Auth", "security-2fa"),
            S("security-sessions", "Active Sessions", "security-sessions"),
            S("security-log", "Login History", "security-log"),
        ]
    },
    {
        id: "gdpr", label: "GDPR / Compliance",
        icon: React.createElement(lucide_react_1.Shield, { className: "h-4 w-4" }),
        children: [
            S("gdpr-general", "General Settings", "gdpr-general"),
            S("gdpr-cookies", "Cookie Consent", "gdpr-cookies"),
            S("gdpr-data-request", "Data Requests", "gdpr-data-requests"),
            S("gdpr-deletion", "Data Deletion", "gdpr-deletion"),
        ]
    },
    {
        id: "sms", label: "SMS",
        icon: React.createElement(lucide_react_1.Smartphone, { className: "h-4 w-4" }),
        children: [
            S("sms-settings", "SMS Settings", "sms-settings"),
            S("sms-templates", "SMS Templates", "sms-templates"),
            S("sms-log", "SMS Log", "sms-log"),
        ]
    },
    {
        id: "push-notifications", label: "Push Notifications",
        icon: React.createElement(lucide_react_1.Bell, { className: "h-4 w-4" }),
        children: [
            S("push-general", "General Settings", "push-general"),
            S("push-fcm", "FCM / Firebase", "push-fcm"),
        ]
    },
    {
        id: "webhooks", label: "Webhooks",
        icon: React.createElement(lucide_react_1.Link2, { className: "h-4 w-4" }),
        children: [
            S("webhooks-general", "General Settings", "webhooks-general"),
            S("webhooks-list", "Manage Webhooks", "webhooks-list"),
            S("webhooks-log", "Delivery Log", "webhooks-log"),
        ]
    },
    {
        id: "api", label: "API Access",
        icon: React.createElement(lucide_react_1.Code, { className: "h-4 w-4" }),
        children: [
            S("api-general", "General Settings", "api-general"),
            S("api-keys", "API Keys", "api-keys"),
            S("api-docs", "API Documentation", "api-docs"),
        ]
    },
    {
        id: "cron", label: "Cron Jobs",
        icon: React.createElement(lucide_react_1.Repeat, { className: "h-4 w-4" }),
        children: [
            S("cron-general", "General Settings", "cron-general"),
            S("cron-list", "Scheduled Jobs", "cron-list"),
            S("cron-log", "Cron Log", "cron-log"),
        ]
    },
    {
        id: "integrations-group", label: "Integrations",
        icon: React.createElement(lucide_react_1.Zap, { className: "h-4 w-4" }),
        children: [
            S("integrations-page", "All Integrations", "integrations-page"),
            S("workflow-auto", "Workflow Automation", "workflow-auto"),
            S("system-health", "System Health", "system-health"),
            S("import-data", "Import Data", "import-data"),
        ]
    },
    {
        id: "inventory", label: "Inventory",
        icon: React.createElement(lucide_react_1.Package, { className: "h-4 w-4" }),
        children: [
            S("inventory-general", "General Settings", "inventory-general"),
            S("inventory-categories", "Categories", "inventory-categories"),
            S("inventory-stock", "Stock Settings", "inventory-stock"),
        ]
    },
    {
        id: "services", label: "Services & Checkout",
        icon: React.createElement(lucide_react_1.Layout, { className: "h-4 w-4" }),
        children: [
            S("services-general", "General Settings", "services-general"),
            S("services-paypal", "PayPal (API)", "services-paypal"),
            S("services-email-tpl", "Email Templates", "services-email-templates"),
        ]
    },
    {
        id: "e-signatures", label: "E-Signatures",
        icon: React.createElement(lucide_react_1.FileText, { className: "h-4 w-4" }),
        children: [
            S("esign-general", "General Settings", "esign-general"),
            S("esign-providers", "Signature Providers", "esign-providers"),
            S("esign-templates", "Document Templates", "esign-templates"),
        ]
    },
    {
        id: "email-marketing", label: "Email Marketing",
        icon: React.createElement(lucide_react_1.Mail, { className: "h-4 w-4" }),
        children: [
            S("emarketing-general", "General Settings", "emarketing-general"),
            S("emarketing-campaigns", "Campaigns", "emarketing-campaigns"),
            S("emarketing-lists", "Mailing Lists", "emarketing-lists"),
            S("emarketing-templates", "Templates", "emarketing-templates"),
        ]
    },
    {
        id: "client-portal", label: "Client Portal",
        icon: React.createElement(lucide_react_1.Globe, { className: "h-4 w-4" }),
        children: [
            S("portal-general", "General Settings", "portal-general"),
            S("portal-branding", "Branding", "portal-branding"),
            S("portal-permissions", "Permissions", "portal-permissions"),
            S("portal-modules", "Module Access", "portal-modules"),
        ]
    },
    {
        id: "other", label: "Other",
        icon: React.createElement(lucide_react_1.MoreHorizontal, { className: "h-4 w-4" }),
        children: [
            S("integration-guides", "Integration Guides", "integration-guides"),
            S("recaptcha", "reCAPTCHA", "recaptcha"),
            S("tweak", "Tweak", "tweak"),
            S("backup", "Backup & Restore", "backup"),
            S("csvimport", "CSV Import/Export", "csvimport"),
        ]
    },
];
// ─── SaveButton ───────────────────────────────────────────────────────────────
function SaveButton(_a) {
    var saving = _a.saving, onClick = _a.onClick;
    return (React.createElement(button_1.Button, { onClick: onClick, disabled: saving, className: "mt-4" },
        saving ? React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : React.createElement(lucide_react_1.Save, { className: "mr-2 h-4 w-4" }),
        saving ? "Saving\u2026" : "Save Changes"));
}
function ResetButton(_a) {
    var onClick = _a.onClick, label = _a.label;
    return (React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: onClick, className: "mt-4 ml-2 text-muted-foreground" },
        React.createElement(lucide_react_1.RotateCcw, { className: "mr-2 h-3.5 w-3.5" }),
        label || "Reset to Default"));
}
// ─── Field row ────────────────────────────────────────────────────────────────
function Field(_a) {
    var label = _a.label, children = _a.children;
    return (React.createElement("div", { className: "space-y-1.5" },
        React.createElement(label_1.Label, { className: "text-sm font-medium" }, label),
        children));
}
// ─── Section card ─────────────────────────────────────────────────────────────
function Section(_a) {
    var title = _a.title, description = _a.description, children = _a.children;
    return (React.createElement(card_1.Card, null,
        React.createElement(card_1.CardHeader, { className: "pb-3" },
            React.createElement(card_1.CardTitle, { className: "text-base" }, title),
            description && React.createElement(card_1.CardDescription, null, description)),
        React.createElement(card_1.CardContent, { className: "space-y-4" }, children)));
}
// ─── Module-level constants (stable references to prevent re-render cascading) ─
var SETTINGS_ROLES = ["super_admin", "admin"];
var parseList = function (raw) { try {
    return JSON.parse(raw || "[]");
}
catch (_a) {
    return [];
} };
// ─── Main component ───────────────────────────────────────────────────────────
function Settings() {
    var _this = this;
    var _a = permissions_1.useRequireRole(SETTINGS_ROLES), allowed = _a.allowed, isLoadingPermission = _a.isLoading;
    var _b = wouter_1.useLocation(), navigate = _b[1];
    var _c = ThemeCustomizationContext_1.useThemeCustomization(), themeConfig = _c.config, updateThemeConfig = _c.updateThemeConfig, applyThemeToDOM = _c.applyThemeToDOM;
    var setTheme = ThemeContext_1.useTheme().setTheme;
    // ── Nav state (persisted via URL hash) ─────────────────────────────────────
    var _d = react_1.useState(function () {
        var hash = window.location.hash.replace("#", "");
        return hash || "general";
    }), activeSection = _d[0], setActiveSectionState = _d[1];
    var setActiveSection = function (section) {
        setActiveSectionState(section);
        window.history.replaceState(null, "", window.location.pathname + "#" + section);
    };
    var _e = react_1.useState(new Set(["main"])), expandedGroups = _e[0], setExpandedGroups = _e[1];
    var _f = react_1.useState(false), mobileNavOpen = _f[0], setMobileNavOpen = _f[1];
    var toggleGroup = function (groupId) {
        setExpandedGroups(function (prev) {
            var next = new Set(prev);
            if (next.has(groupId)) {
                next["delete"](groupId);
            }
            else {
                next.add(groupId);
            }
            return next;
        });
    };
    var renderSidebarNav = function () { return (React.createElement("nav", { className: "space-y-0.5" }, NAV_GROUPS.map(function (group) {
        var isOpen = expandedGroups.has(group.id);
        var hasActive = group.children.some(isChildActive);
        return (React.createElement("div", { key: group.id },
            React.createElement("button", { onClick: function () { return toggleGroup(group.id); }, className: utils_1.cn("w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm font-medium transition-colors text-left", hasActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted") },
                group.icon,
                React.createElement("span", { className: "flex-1 truncate" }, group.label),
                isOpen
                    ? React.createElement(lucide_react_1.ChevronDown, { className: "h-3.5 w-3.5 shrink-0 opacity-50" })
                    : React.createElement(lucide_react_1.ChevronRight, { className: "h-3.5 w-3.5 shrink-0 opacity-50" })),
            isOpen && (React.createElement("div", { className: "ml-3 pl-3 border-l space-y-0.5 my-0.5" }, group.children.map(function (child) { return (React.createElement("button", { key: child.id, onClick: function () { return handleChildClick(child); }, className: utils_1.cn("w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm transition-colors text-left", isChildActive(child)
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground") },
                React.createElement("span", { className: "flex-1 truncate" }, child.label),
                child.type === "link" && (React.createElement(lucide_react_1.ExternalLink, { className: "h-3 w-3 shrink-0 opacity-40" })))); })))));
    }))); };
    var handleChildClick = function (child) {
        if (child.type === "link") {
            navigate(child.href);
        }
        else {
            // "section" and "embed" both render inline
            setActiveSection(child.sectionId);
            var group_1 = NAV_GROUPS.find(function (g) { return g.children.some(function (c) { return c.id === child.id; }); });
            if (group_1)
                setExpandedGroups(function (prev) { var arr = Array.from(prev); arr.push(group_1.id); return new Set(arr); });
        }
    };
    var isChildActive = function (child) {
        if (child.type === "link")
            return false;
        return activeSection === child.sectionId;
    };
    // ── General ────────────────────────────────────────────────────────────────
    var _g = react_1.useState({
        timezone: "Africa/Nairobi",
        dateFormat: "d-m-Y",
        dateSelectorFormat: "dd-mm-yyyy",
        leftMenuPosition: "Collapsed",
        statsPanelPosition: "Collapsed",
        tablePageSize: "35",
        kanbanPageSize: "35",
        closeModalOnClick: "no",
        sessionTimeout: "enabled",
        language: "en",
        allowLanguageChange: "yes",
        exportStripHtml: "yes"
    }), general = _g[0], setGeneral = _g[1];
    // ── Company ────────────────────────────────────────────────────────────────
    var _h = react_1.useState({
        companyName: "",
        companyEmail: "",
        companyPhone: "",
        companyWebsite: "",
        companyAddress: "",
        companyCity: "",
        companyCountry: "Kenya",
        companyPostalCode: "",
        taxId: "",
        registrationNumber: "",
        companyLogo: ""
    }), companyInfo = _h[0], setCompanyInfo = _h[1];
    // ── Appearance ─────────────────────────────────────────────────────────────
    var _j = react_1.useState({
        theme: "light",
        primaryColor: "#3b82f6"
    }), appearance = _j[0], setAppearance = _j[1];
    // ── Theme (Kiini: One Hub. Total Control) ────────────────────────────────────────────────────
    var _k = react_1.useState({
        mainTheme: "Default",
        resetUsersTheme: false,
        primaryColor: "#3b82f6",
        sidebarColor: "#1e293b",
        headerColor: "#ffffff",
        fontFamily: "Inter",
        borderRadius: "8",
        sidebarStyle: "dark",
        compactMode: false,
        htmlHead: "",
        htmlBody: "",
        cssStyle: "",
        colorMode: "light"
    }), themeSettings = _k[0], setThemeSettings = _k[1];
    // ── Project Permissions & Automation ──────────────────────────────────────
    var _l = react_1.useState({ viewOtherTasks: false, editProject: false, deleteTasks: false, manageMilestones: false, viewBudget: false, createSubtasks: false }), projTeamPerms = _l[0], setProjTeamPerms = _l[1];
    var _m = react_1.useState({ viewProgress: false, viewTasks: false, createTasks: false, commentTasks: false, viewTeam: false, uploadFiles: false, viewInvoices: false }), projClientPerms = _m[0], setProjClientPerms = _m[1];
    var _o = react_1.useState({ autoComplete: false, emailOnStatusChange: false, defaultTaskList: false, autoAssignPM: false }), projAutomation = _o[0], setProjAutomation = _o[1];
    var _p = react_1.useState({ autoConvertToInvoice: false, emailOnExpiry: false, notifyOnApproval: false, autoAddTax: false }), estAutomation = _p[0], setEstAutomation = _p[1];
    var _q = react_1.useState({ autoConvertToProject: false, remindBeforeExpiry: false, notifyOnSignature: false, autoGenerateInvoice: false }), propAutomation = _q[0], setPropAutomation = _q[1];
    var _r = react_1.useState({ emailBeforeExpiry: false, autoRenew: false, notifyOnSignature: false, archiveExpired: false }), contAutomation = _r[0], setContAutomation = _r[1];
    var _s = react_1.useState({ showPoweredBy: false, forceHttps: false, debugMode: false, maintenanceMode: false, customCss: "", customJs: "" }), tweakSettings = _s[0], setTweakSettings = _s[1];
    // ── Company Logo ──────────────────────────────────────────────────────────
    var _t = react_1.useState({
        largeLogo: "",
        smallLogo: ""
    }), companyLogos = _t[0], setCompanyLogos = _t[1];
    // ── Purchasing ────────────────────────────────────────────────────────────
    var _u = react_1.useState({
        enabled: true,
        defaultTaxRate: "",
        approvalRequired: true,
        defaultPaymentTerms: "30"
    }), purchasingSettings = _u[0], setPurchasingSettings = _u[1];
    // ── Email Template Editor ─────────────────────────────────────────────────
    var _v = react_1.useState(""), selectedTemplate = _v[0], setSelectedTemplate = _v[1];
    var _w = react_1.useState(""), templateSubject = _w[0], setTemplateSubject = _w[1];
    var _x = react_1.useState(""), templateBody = _x[0], setTemplateBody = _x[1];
    // ── Client Email Templates ────────────────────────────────────────────────
    var _y = react_1.useState(""), selectedClientTpl = _y[0], setSelectedClientTpl = _y[1];
    var _z = react_1.useState(""), clientTplSubject = _z[0], setClientTplSubject = _z[1];
    var _0 = react_1.useState(""), clientTplBody = _0[0], setClientTplBody = _0[1];
    // ── Lead Email Templates ──────────────────────────────────────────────────
    var _1 = react_1.useState(""), selectedLeadTpl = _1[0], setSelectedLeadTpl = _1[1];
    var _2 = react_1.useState(""), leadTplSubject = _2[0], setLeadTplSubject = _2[1];
    var _3 = react_1.useState(""), leadTplBody = _3[0], setLeadTplBody = _3[1];
    // ── Services Email Templates ──────────────────────────────────────────────
    var _4 = react_1.useState(""), selectedServiceTpl = _4[0], setSelectedServiceTpl = _4[1];
    var _5 = react_1.useState(""), serviceTplSubject = _5[0], setServiceTplSubject = _5[1];
    var _6 = react_1.useState(""), serviceTplBody = _6[0], setServiceTplBody = _6[1];
    // ── Email ──────────────────────────────────────────────────────────────────
    var _7 = react_1.useState({
        mailDriver: "smtp",
        smtpHost: "",
        smtpPort: "587",
        smtpUser: "",
        smtpPass: "",
        fromName: "",
        fromEmail: "",
        replyTo: ""
    }), emailSettings = _7[0], setEmailSettings = _7[1];
    // ── Invoices ───────────────────────────────────────────────────────────────
    var _8 = react_1.useState({
        invoicePrefix: "INV",
        defaultDueDays: "7",
        overdueDays1: "1",
        overdueDays2: "7",
        overdueDays3: "14",
        taxMode: "summary",
        termsAndConditions: "",
        showProjectTitle: false,
        showViewedIndicator: true
    }), invoiceSettings = _8[0], setInvoiceSettings = _8[1];
    // ── Payment Methods ────────────────────────────────────────────────────────
    var _9 = react_1.useState({
        enabled: false,
        displayName: "Bank Transfer",
        details: ""
    }), bankPayment = _9[0], setBankPayment = _9[1];
    var _10 = react_1.useState({
        enabled: false,
        publishableKey: "",
        secretKey: ""
    }), stripeSettings = _10[0], setStripeSettings = _10[1];
    var _11 = react_1.useState({
        enabled: false,
        consumerKey: "",
        consumerSecret: "",
        paybillNumber: "",
        passkey: "",
        callbackUrl: ""
    }), mpesaSettings = _11[0], setMpesaSettings = _11[1];
    // ── Tax ────────────────────────────────────────────────────────────────────
    var _12 = react_1.useState([]), taxRates = _12[0], setTaxRates = _12[1];
    var _13 = react_1.useState({ name: "", rate: "", description: "" }), newTax = _13[0], setNewTax = _13[1];
    // ── Tags ───────────────────────────────────────────────────────────────────
    var _14 = react_1.useState([]), tags = _14[0], setTags = _14[1];
    var _15 = react_1.useState({ name: "", color: "#3b82f6" }), newTag = _15[0], setNewTag = _15[1];
    // ── Document Numbering ─────────────────────────────────────────────────────
    var _16 = react_1.useState({
        invoicePrefix: "INV",
        estimatePrefix: "EST",
        receiptPrefix: "REC",
        proposalPrefix: "PROP",
        expensePrefix: "EXP"
    }), documentNumbers = _16[0], setDocumentNumbers = _16[1];
    // ── Notifications ──────────────────────────────────────────────────────────
    var _17 = react_1.useState({
        invoiceDue: true,
        paymentReceived: true,
        newClient: false,
        companyAnnouncement: false,
        projectDeadline: false,
        taskAssigned: true
    }), notifyPrefs = _17[0], setNotifyPrefs = _17[1];
    // ── Saving flags ───────────────────────────────────────────────────────────
    var _18 = react_1.useState({}), saving = _18[0], setSaving = _18[1];
    var setSavingKey = function (key, val) { return setSaving(function (p) {
        var _a;
        return (__assign(__assign({}, p), (_a = {}, _a[key] = val, _a)));
    }); };
    // ── Currency ───────────────────────────────────────────────────────────────
    var _19 = react_1.useState({ defaultCurrency: "KES", symbolPosition: "before", thousandsSep: ",", decimalSep: ".", decimalPlaces: "2" }), currency = _19[0], setCurrency = _19[1];
    // ── Billing ────────────────────────────────────────────────────────────────
    var billing = react_1.useState({ planName: "Professional", planExpiry: "—", emailQuota: "Unlimited", userLimit: "Unlimited" })[0];
    // ── Payment gateways ───────────────────────────────────────────────────────
    var _20 = react_1.useState({ enabled: false, publicKey: "", secretKey: "" }), flutterwave = _20[0], setFlutterwave = _20[1];
    var _21 = react_1.useState({ enabled: false, keyId: "", keySecret: "" }), razorpay = _21[0], setRazorpay = _21[1];
    var _22 = react_1.useState({ enabled: false, clientId: "", clientSecret: "", mode: "sandbox" }), paypal = _22[0], setPaypal = _22[1];
    var _23 = react_1.useState({ enabled: false, publicKey: "", secretKey: "" }), paystack = _23[0], setPaystack = _23[1];
    var _24 = react_1.useState({ enabled: false, consumerKey: "", consumerSecret: "", environment: "sandbox" }), pesapal = _24[0], setPesapal = _24[1];
    var _25 = react_1.useState({ enabled: false, apiKey: "", testMode: true }), mollie = _25[0], setMollie = _25[1];
    var _26 = react_1.useState({ enabled: false, merchantId: "", apiKey: "", environment: "sandbox" }), tapPay = _26[0], setTapPay = _26[1];
    var _27 = react_1.useState({ enabled: false, clientId: "", clientSecret: "", environment: "sandbox" }), airtelMoney = _27[0], setAirtelMoney = _27[1];
    var _28 = react_1.useState({ enabled: false, subscriptionKey: "", apiUser: "", apiKey: "", environment: "sandbox" }), mtnMomo = _28[0], setMtnMomo = _28[1];
    // ── Inventory ──────────────────────────────────────────────────────────────
    var _29 = react_1.useState({ trackStock: true, lowStockThreshold: "10", autoReorder: false, defaultWarehouse: "" }), inventoryGeneral = _29[0], setInventoryGeneral = _29[1];
    var _30 = react_1.useState([]), inventoryCategories = _30[0], setInventoryCategories = _30[1];
    var _31 = react_1.useState({ name: "" }), newInventoryCat = _31[0], setNewInventoryCat = _31[1];
    var _32 = react_1.useState({ method: "fifo", allowNegative: false, barcodeEnabled: false }), inventoryStock = _32[0], setInventoryStock = _32[1];
    // ── Services & Checkout ────────────────────────────────────────────────────
    var _33 = react_1.useState({ enabled: true, showPricing: true, allowOnlineBooking: false, bookingUrl: "" }), servicesGeneral = _33[0], setServicesGeneral = _33[1];
    var _34 = react_1.useState({ mode: "sandbox", clientId: "", clientSecret: "" }), servicesPaypal = _34[0], setServicesPaypal = _34[1];
    var _35 = react_1.useState([]), servicesCategories = _35[0], setServicesCategories = _35[1];
    var _36 = react_1.useState({ name: "" }), newServiceCat = _36[0], setNewServiceCat = _36[1];
    var _37 = react_1.useState({ enabled: false, requireLogin: true, allowGuestCheckout: false, termsUrl: "" }), servicesCheckout = _37[0], setServicesCheckout = _37[1];
    // ── E-Signatures ──────────────────────────────────────────────────────────
    var _38 = react_1.useState({ enabled: false, provider: "built-in", requireAuth: true, expiryDays: "30" }), esignGeneral = _38[0], setEsignGeneral = _38[1];
    var _39 = react_1.useState({ docusign: false, docusignApiKey: "", hellosign: false, hellosignApiKey: "" }), esignProviders = _39[0], setEsignProviders = _39[1];
    var _40 = react_1.useState([]), esignTemplates = _40[0], setEsignTemplates = _40[1];
    var _41 = react_1.useState({ name: "" }), newEsignTemplate = _41[0], setNewEsignTemplate = _41[1];
    // ── Document Templates ────────────────────────────────────────────────────
    var _42 = react_1.useState("invoice"), docTemplateType = _42[0], setDocTemplateType = _42[1];
    var _43 = react_1.useState({ invoice: "", receipt: "", estimate: "" }), docTemplates = _43[0], setDocTemplates = _43[1];
    var _44 = react_1.useState(false), docTemplatePreview = _44[0], setDocTemplatePreview = _44[1];
    // ── Email Marketing ───────────────────────────────────────────────────────
    var _45 = react_1.useState({ enabled: false, provider: "built-in", unsubscribeUrl: "", fromName: "", fromEmail: "" }), emarketingGeneral = _45[0], setEmarketingGeneral = _45[1];
    var _46 = react_1.useState([]), emarketingLists = _46[0], setEmarketingLists = _46[1];
    var _47 = react_1.useState({ name: "" }), newEmarketingList = _47[0], setNewEmarketingList = _47[1];
    // ── Campaign & Template editors ───────────────────────────────────────────
    var _48 = react_1.useState(null), editingCampaign = _48[0], setEditingCampaign = _48[1];
    var _49 = react_1.useState(null), editingTemplate = _49[0], setEditingTemplate = _49[1];
    var _50 = react_1.useState(null), editingPurchasingTemplate = _50[0], setEditingPurchasingTemplate = _50[1];
    // ── Client Portal ─────────────────────────────────────────────────────────
    var _51 = react_1.useState({ enabled: true, requireApproval: true, showInvoices: true, showProjects: true, showTickets: true, customDomain: "" }), portalGeneral = _51[0], setPortalGeneral = _51[1];
    var _52 = react_1.useState({ logoUrl: "", primaryColor: "#3b82f6", welcomeMessage: "", portalTitle: "" }), portalBranding = _52[0], setPortalBranding = _52[1];
    var _53 = react_1.useState({ viewInvoices: true, payOnline: true, createTickets: true, viewProjects: true, downloadFiles: true, viewEstimates: true }), portalPermissions = _53[0], setPortalPermissions = _53[1];
    var _54 = react_1.useState({ invoices: true, estimates: true, projects: true, tickets: true, contracts: true, knowledgebase: true, announcements: true }), portalModules = _54[0], setPortalModules = _54[1];
    // ── Clients ────────────────────────────────────────────────────────────────
    var _55 = react_1.useState({ allowRegistration: false, requireApproval: true, showPortalLogin: true, portalUrl: "" }), clientsGeneral = _55[0], setClientsGeneral = _55[1];
    var _56 = react_1.useState([]), clientsCategories = _56[0], setClientsCategories = _56[1];
    var _57 = react_1.useState({ name: "", color: "#3b82f6" }), newClientsCat = _57[0], setNewClientsCat = _57[1];
    // ── Projects ───────────────────────────────────────────────────────────────
    var _58 = react_1.useState({ allowClientComments: true, allowClientBilling: false, notifyOnTaskCreate: true, defaultBillingType: "fixed" }), projectsGeneral = _58[0], setProjectsGeneral = _58[1];
    var _59 = react_1.useState([]), projectsCategories = _59[0], setProjectsCategories = _59[1];
    var _60 = react_1.useState({ name: "", color: "#3b82f6" }), newProjectsCat = _60[0], setNewProjectsCat = _60[1];
    // ── Tasks ──────────────────────────────────────────────────────────────────
    var _61 = react_1.useState({ enableMultipleCheckboxes: false, notifyAssigneeByEmail: true, defaultStatus: "not_started" }), tasksGeneral = _61[0], setTasksGeneral = _61[1];
    var _62 = react_1.useState([]), taskStatuses = _62[0], setTaskStatuses = _62[1];
    var _63 = react_1.useState({ name: "", color: "#3b82f6" }), newTaskStatus = _63[0], setNewTaskStatus = _63[1];
    var _64 = react_1.useState([]), taskPriorities = _64[0], setTaskPriorities = _64[1];
    var _65 = react_1.useState({ name: "", color: "#ef4444" }), newTaskPriority = _65[0], setNewTaskPriority = _65[1];
    // ── Leads ──────────────────────────────────────────────────────────────────
    var _66 = react_1.useState({ requireSource: false, requireCategory: false, defaultStage: "new" }), leadsGeneral = _66[0], setLeadsGeneral = _66[1];
    var _67 = react_1.useState([]), leadsCategories = _67[0], setLeadsCategories = _67[1];
    var _68 = react_1.useState({ name: "", color: "#3b82f6" }), newLeadsCat = _68[0], setNewLeadsCat = _68[1];
    var _69 = react_1.useState([]), leadStages = _69[0], setLeadStages = _69[1];
    var _70 = react_1.useState({ name: "", color: "#3b82f6", probability: "50" }), newLeadStage = _70[0], setNewLeadStage = _70[1];
    var _71 = react_1.useState([]), leadSources = _71[0], setLeadSources = _71[1];
    var _72 = react_1.useState({ name: "" }), newLeadSource = _72[0], setNewLeadSource = _72[1];
    // ── Milestones ─────────────────────────────────────────────────────────────
    var _73 = react_1.useState({ notifyOnCreate: true, clientVisible: false }), milestonesGeneral = _73[0], setMilestonesGeneral = _73[1];
    var _74 = react_1.useState([]), defaultMilestones = _74[0], setDefaultMilestones = _74[1];
    var _75 = react_1.useState({ name: "" }), newDefaultMilestone = _75[0], setNewDefaultMilestone = _75[1];
    // ── Invoice extras ─────────────────────────────────────────────────────────
    var _76 = react_1.useState([]), invoicesCategories = _76[0], setInvoicesCategories = _76[1];
    var _77 = react_1.useState({ name: "" }), newInvoiceCat = _77[0], setNewInvoiceCat = _77[1];
    var _78 = react_1.useState([]), invoicesStatuses = _78[0], setInvoicesStatuses = _78[1];
    var _79 = react_1.useState({ name: "", color: "#3b82f6" }), newInvoiceStatus = _79[0], setNewInvoiceStatus = _79[1];
    // ── Estimates ──────────────────────────────────────────────────────────────
    var _80 = react_1.useState({ allowClientApproval: true, expiryDays: "30" }), estimatesGeneral = _80[0], setEstimatesGeneral = _80[1];
    var _81 = react_1.useState([]), estimateCategories = _81[0], setEstimateCategories = _81[1];
    var _82 = react_1.useState({ name: "" }), newEstimateCat = _82[0], setNewEstimateCat = _82[1];
    // ── Timesheets ─────────────────────────────────────────────────────────────
    var _83 = react_1.useState({ requireNotes: false, notifyPM: true, roundingMinutes: "0" }), timesheetsGeneral = _83[0], setTimesheetsGeneral = _83[1];
    // ── Proposals ──────────────────────────────────────────────────────────────
    var _84 = react_1.useState({ allowEsign: true, expiryDays: "30" }), proposalsGeneral = _84[0], setProposalsGeneral = _84[1];
    var _85 = react_1.useState([]), proposalCategories = _85[0], setProposalCategories = _85[1];
    var _86 = react_1.useState({ name: "" }), newProposalCat = _86[0], setNewProposalCat = _86[1];
    // ── Contracts ──────────────────────────────────────────────────────────────
    var _87 = react_1.useState({ allowEsign: true, expiryReminderDays: "7" }), contractsGeneral = _87[0], setContractsGeneral = _87[1];
    var _88 = react_1.useState([]), contractCategories = _88[0], setContractCategories = _88[1];
    var _89 = react_1.useState({ name: "" }), newContractCat = _89[0], setNewContractCat = _89[1];
    // ── Products ───────────────────────────────────────────────────────────────
    var _90 = react_1.useState([]), productsCategories = _90[0], setProductsCategories = _90[1];
    var _91 = react_1.useState({ name: "" }), newProductsCat = _91[0], setNewProductsCat = _91[1];
    var _92 = react_1.useState([]), productUnits = _92[0], setProductUnits = _92[1];
    var _93 = react_1.useState({ name: "" }), newProductUnit = _93[0], setNewProductUnit = _93[1];
    // ── Expenses ───────────────────────────────────────────────────────────────
    var _94 = react_1.useState({ requireReceipt: false, autoApproveBelow: "0" }), expensesGeneral = _94[0], setExpensesGeneral = _94[1];
    var _95 = react_1.useState([]), expenseCategories = _95[0], setExpenseCategories = _95[1];
    var _96 = react_1.useState({ name: "" }), newExpenseCat = _96[0], setNewExpenseCat = _96[1];
    // ── Subscriptions ──────────────────────────────────────────────────────────
    var _97 = react_1.useState({ taxInclusive: false, roundAmounts: true }), subsGeneral = _97[0], setSubsGeneral = _97[1];
    // ── Tags general ───────────────────────────────────────────────────────────
    var _98 = react_1.useState({ allowUserCreate: true, autoLowercase: true }), tagsGeneral = _98[0], setTagsGeneral = _98[1];
    // ── Files ──────────────────────────────────────────────────────────────────
    var _99 = react_1.useState({ maxSizeMb: "10", allowedTypes: "pdf,doc,docx,xls,xlsx,png,jpg,jpeg", maxFilesPerUpload: "10" }), filesGeneral = _99[0], setFilesGeneral = _99[1];
    var _100 = react_1.useState([]), fileFolders = _100[0], setFileFolders = _100[1];
    var _101 = react_1.useState({ name: "" }), newFileFolder = _101[0], setNewFileFolder = _101[1];
    var _102 = react_1.useState([]), defaultFolders = _102[0], setDefaultFolders = _102[1];
    var _103 = react_1.useState({ name: "" }), newDefaultFolder = _103[0], setNewDefaultFolder = _103[1];
    // ── Tickets ────────────────────────────────────────────────────────────────
    var _104 = react_1.useState({ allowClientTickets: true, autoAssign: false, notifyAgents: true, closeAfterDays: "7" }), ticketsGeneral = _104[0], setTicketsGeneral = _104[1];
    var _105 = react_1.useState([]), ticketDepts = _105[0], setTicketDepts = _105[1];
    var _106 = react_1.useState({ name: "" }), newTicketDept = _106[0], setNewTicketDept = _106[1];
    var _107 = react_1.useState([]), ticketStatuses = _107[0], setTicketStatuses = _107[1];
    var _108 = react_1.useState({ name: "", color: "#3b82f6" }), newTicketStatus = _108[0], setNewTicketStatus = _108[1];
    var _109 = react_1.useState([]), ticketCanned = _109[0], setTicketCanned = _109[1];
    var _110 = react_1.useState({ name: "", body: "" }), newCanned = _110[0], setNewCanned = _110[1];
    // ── Knowledgebase ──────────────────────────────────────────────────────────
    var _111 = react_1.useState({ guestAccess: true, enableComments: true, articlesPerPage: "10" }), kbGeneral = _111[0], setKbGeneral = _111[1];
    var _112 = react_1.useState([]), kbCategories = _112[0], setKbCategories = _112[1];
    var _113 = react_1.useState({ name: "" }), newKbCat = _113[0], setNewKbCat = _113[1];
    // ── Announcements ──────────────────────────────────────────────────────────
    var _114 = react_1.useState({ enabled: true, defaultAudienceAll: true }), announcementsGeneral = _114[0], setAnnouncementsGeneral = _114[1];
    var _115 = react_1.useState([]), announcementsList = _115[0], setAnnouncementsList = _115[1];
    var _116 = react_1.useState({ title: "", message: "", audience: "all", date: "" }), newAnnouncement = _116[0], setNewAnnouncement = _116[1];
    // ── Goals ──────────────────────────────────────────────────────────────────
    var _117 = react_1.useState({ enableModule: true, allowTeamGoals: true }), goalsGeneral = _117[0], setGoalsGeneral = _117[1];
    var _118 = react_1.useState([]), goalsCategories = _118[0], setGoalsCategories = _118[1];
    var _119 = react_1.useState({ name: "" }), newGoalsCat = _119[0], setNewGoalsCat = _119[1];
    // ── Reminders ──────────────────────────────────────────────────────────────
    var _120 = react_1.useState({ defaultMinutesBefore: "15", emailChannel: true, pushChannel: false, smsChannel: false }), remindersGeneral = _120[0], setRemindersGeneral = _120[1];
    // ── Security ───────────────────────────────────────────────────────────────
    var _121 = react_1.useState({ minLength: "8", requireUppercase: true, requireNumbers: true, requireSpecial: false, expiryDays: "0" }), securityPassword = _121[0], setSecurityPassword = _121[1];
    var _122 = react_1.useState({ enabled: false, requireForAdmins: false, method: "totp" }), twofa = _122[0], setTwofa = _122[1];
    // ── GDPR ───────────────────────────────────────────────────────────────────
    var _123 = react_1.useState({ enabled: false, retentionDays: "365" }), gdprGeneral = _123[0], setGdprGeneral = _123[1];
    var _124 = react_1.useState({ bannerEnabled: true, analyticsEnabled: true, marketingEnabled: false }), gdprCookies = _124[0], setGdprCookies = _124[1];
    // ── SMS ────────────────────────────────────────────────────────────────────
    var _125 = react_1.useState({ provider: "twilio", accountSid: "", authToken: "", fromNumber: "", atApiKey: "", atUsername: "" }), smsSettings = _125[0], setSmsSettings = _125[1];
    var _126 = react_1.useState([]), smsTemplates = _126[0], setSmsTemplates = _126[1];
    var _127 = react_1.useState({ name: "", body: "" }), newSmsTemplate = _127[0], setNewSmsTemplate = _127[1];
    // ── Push ───────────────────────────────────────────────────────────────────
    var _128 = react_1.useState({ enabled: false }), pushGeneral = _128[0], setPushGeneral = _128[1];
    var _129 = react_1.useState({ serverKey: "", senderId: "", vapidKey: "" }), fcmSettings = _129[0], setFcmSettings = _129[1];
    // ── Webhooks ───────────────────────────────────────────────────────────────
    var _130 = react_1.useState({ enabled: false, maxRetries: "3" }), webhooksGeneral = _130[0], setWebhooksGeneral = _130[1];
    var _131 = react_1.useState([]), webhooksList = _131[0], setWebhooksList = _131[1];
    var _132 = react_1.useState({ url: "", event: "invoice.created" }), newWebhook = _132[0], setNewWebhook = _132[1];
    // ── API ────────────────────────────────────────────────────────────────────
    var _133 = react_1.useState({ enabled: true, rateLimit: "100", rateLimitPer: "minute" }), apiGeneral = _133[0], setApiGeneral = _133[1];
    var _134 = react_1.useState([]), apiKeys = _134[0], setApiKeys = _134[1];
    var _135 = react_1.useState(""), newApiKeyName = _135[0], setNewApiKeyName = _135[1];
    // ── Cron ───────────────────────────────────────────────────────────────────
    var _136 = react_1.useState({ enabled: true, defaultSchedule: "0 * * * *" }), cronGeneral = _136[0], setCronGeneral = _136[1];
    var _137 = react_1.useState([]), cronJobs = _137[0], setCronJobs = _137[1];
    // ── reCAPTCHA ──────────────────────────────────────────────────────────────
    var _138 = react_1.useState({ version: "v2", siteKey: "", secretKey: "" }), recaptcha = _138[0], setRecaptcha = _138[1];
    var _139 = react_1.useState([
        { id: "1", name: "Company Size", type: "Dropdown", entity: "Client", required: false, active: true },
        { id: "2", name: "Industry", type: "Dropdown", entity: "Client", required: true, active: true },
        { id: "3", name: "Preferred Contact Method", type: "Dropdown", entity: "Client", required: false, active: true },
        { id: "4", name: "Internal Priority", type: "Dropdown", entity: "Project", required: false, active: true },
        { id: "5", name: "Story Points", type: "Number", entity: "Task", required: false, active: true },
        { id: "6", name: "Budget Range", type: "Currency", entity: "Lead", required: false, active: true },
        { id: "7", name: "Severity Level", type: "Dropdown", entity: "Ticket", required: true, active: true },
        { id: "8", name: "SKU Code", type: "Text", entity: "Product", required: true, active: true },
    ]), customFields = _139[0], setCustomFields = _139[1];
    var _140 = react_1.useState(false), cfDialogOpen = _140[0], setCfDialogOpen = _140[1];
    var _141 = react_1.useState({ name: "", type: "Text", entity: "Client", required: false }), cfForm = _141[0], setCfForm = _141[1];
    var _142 = react_1.useState(""), cfSearch = _142[0], setCfSearch = _142[1];
    // ── Permissions state ─────────────────────────────────────────────────────
    var _143 = react_1.useState({}), permState = _143[0], setPermState = _143[1];
    // ── Integrations (inline) ─────────────────────────────────────────────────
    var _144 = react_1.useState(false), intAddOpen = _144[0], setIntAddOpen = _144[1];
    var _145 = react_1.useState({ provider: "", type: "api_key", apiKey: "", webhookUrl: "", clientId: "", clientSecret: "" }), intForm = _145[0], setIntForm = _145[1];
    // ── Workflow Automation (inline) ──────────────────────────────────────────
    var _146 = react_1.useState(false), wfCreateOpen = _146[0], setWfCreateOpen = _146[1];
    var _147 = react_1.useState({ name: "", description: "", triggerType: "invoice_created", isRecurring: false }), wfForm = _147[0], setWfForm = _147[1];
    // ── Integration Guides (inline) ──────────────────────────────────────────
    var _148 = react_1.useState(null), selectedGuide = _148[0], setSelectedGuide = _148[1];
    var _149 = react_1.useState(""), guideSearch = _149[0], setGuideSearch = _149[1];
    var _150 = react_1.useState(null), copiedCode = _150[0], setCopiedCode = _150[1];
    // ── Queries ────────────────────────────────────────────────────────────────
    var _151 = trpc_1.trpc.settings.getCompanyInfo.useQuery(), companyData = _151.data, refetchCompany = _151.refetch;
    var _152 = trpc_1.trpc.settings.getDocumentNumberingSettings.useQuery(), docData = _152.data, refetchDocs = _152.refetch;
    var notifyData = trpc_1.trpc.settings.getNotificationPreferences.useQuery().data;
    var generalData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "general" }).data;
    var appearanceData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "appearance" }).data;
    var emailData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "email" }).data;
    var invoiceData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "invoice_settings" }).data;
    var bankPayData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "payment_bank" }).data;
    var stripeData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "payment_stripe" }).data;
    var mpesaData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "payment_mpesa" }).data;
    var taxData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "tax_rates" }).data;
    var tagsData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "global_tags" }).data;
    // New category queries
    var currencyData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "currency" }).data;
    var flutterwaveData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "payment_flutterwave" }).data;
    var razorpayData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "payment_razorpay" }).data;
    var paypalData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "payment_paypal" }).data;
    var paystackData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "payment_paystack" }).data;
    var clientsGenData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "clients_general" }).data;
    var clientsCatData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "clients_categories" }).data;
    var projGenData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "projects_general" }).data;
    var projCatData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "projects_categories" }).data;
    var tasksGenData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "tasks_general" }).data;
    var taskStatusData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "task_statuses" }).data;
    var taskPriorityData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "task_priorities" }).data;
    var leadsGenData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "leads_general" }).data;
    var leadsCatData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "leads_categories" }).data;
    var leadStageData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "lead_stages" }).data;
    var leadSourceData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "lead_sources" }).data;
    var milestonesGenData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "milestones_general" }).data;
    var defaultMilData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "default_milestones" }).data;
    var invCatData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "invoice_categories" }).data;
    var invStatusData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "invoice_statuses" }).data;
    var estGenData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "estimates_general" }).data;
    var estCatData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "estimate_categories" }).data;
    var tsGenData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "timesheets_general" }).data;
    var propGenData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "proposals_general" }).data;
    var propCatData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "proposal_categories" }).data;
    var contGenData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "contracts_general" }).data;
    var contCatData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "contract_categories" }).data;
    var prodCatData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "products_categories" }).data;
    var prodUnitData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "product_units" }).data;
    var expGenData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "expenses_general" }).data;
    var expCatData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "expense_categories" }).data;
    var subsGenData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "subscriptions_general" }).data;
    var tagsGenData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "tags_general" }).data;
    var filesGenData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "files_general" }).data;
    var fileFolderData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "file_folders" }).data;
    var defaultFolderData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "default_folders" }).data;
    var ticketsGenData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "tickets_general" }).data;
    var ticketDeptData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "ticket_departments" }).data;
    var ticketStatusData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "ticket_statuses" }).data;
    var ticketCannedData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "ticket_canned" }).data;
    var kbGenData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "kb_general" }).data;
    var kbCatData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "kb_categories" }).data;
    var announGenData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "announcements_general" }).data;
    var announListData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "announcements_list" }).data;
    var goalsGenData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "goals_general" }).data;
    var goalsCatData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "goals_categories" }).data;
    var remindersGenData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "reminders_general" }).data;
    var secPassData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "security_password" }).data;
    var twofaData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "security_2fa" }).data;
    var gdprGenData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "gdpr_general" }).data;
    var gdprCookieData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "gdpr_cookies" }).data;
    var smsSettingsData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "sms_settings" }).data;
    var smsTplData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "sms_templates" }).data;
    var pushGenData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "push_general" }).data;
    var fcmData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "push_fcm" }).data;
    var webhooksGenData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "webhooks_general" }).data;
    var webhooksListData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "webhooks_list" }).data;
    var apiGenData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "api_general" }).data;
    var apiKeysData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "api_keys" }).data;
    var cronGenData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "cron_general" }).data;
    var cronJobsData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "cron_jobs" }).data;
    var recaptchaData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "recaptcha" }).data;
    // New Kiini: One Hub. Total Control queries
    var pesapalData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "payment_pesapal" }).data;
    var mollieData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "payment_mollie" }).data;
    var tapPayData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "payment_tappay" }).data;
    var airtelData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "payment_airtel" }).data;
    var mtnMomoData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "payment_mtnmomo" }).data;
    var inventoryGenData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "inventory_general" }).data;
    var inventoryCatData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "inventory_categories" }).data;
    var inventoryStockData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "inventory_stock" }).data;
    var servicesGenData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "services_general" }).data;
    var servicesCatData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "services_categories" }).data;
    var servicesCheckoutData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "services_checkout" }).data;
    var esignGenData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "esign_general" }).data;
    var esignProvidersData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "esign_providers" }).data;
    var esignTemplatesData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "esign_templates" }).data;
    var docTemplatesData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "document_templates" }).data;
    var emarketingGenData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "emarketing_general" }).data;
    var emarketingListsData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "emarketing_lists" }).data;
    var portalGenData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "portal_general" }).data;
    var portalBrandData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "portal_branding" }).data;
    var portalPermsData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "portal_permissions" }).data;
    var portalModulesData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "portal_modules" }).data;
    var themeData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "theme_settings" }).data;
    var companyLogosData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "company_logos" }).data;
    var purchasingData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "purchasing_settings" }).data;
    var servicesPaypalData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "services_paypal" }).data;
    var projTeamPermsData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "projects_team_perms" }).data;
    var projClientPermsData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "projects_client_perms" }).data;
    var projAutoData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "projects_automation" }).data;
    var estAutoData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "estimates_automation" }).data;
    var propAutoData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "proposals_automation" }).data;
    var contAutoData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "contracts_automation" }).data;
    var tweakData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "tweak_settings" }).data;
    var permissionsData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "permissions" }).data;
    var planPriceData = trpc_1.trpc.multiTenancy.getPlanPrices.useQuery(undefined, { staleTime: 60000 }).data;
    // ── Inline page queries ──────────────────────────────────────────────────
    var currentUser = trpc_1.trpc.auth.me.useQuery().data;
    var _153 = trpc_1.trpc.enterpriseTenants.getPricingTiers.useQuery(undefined, {
        enabled: (currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) === 'super_admin',
        staleTime: 60000
    }), _154 = _153.data, pricingTiers = _154 === void 0 ? [] : _154, tiersLoading = _153.isLoading;
    var _155 = trpc_1.trpc.thirdPartyIntegrations.listIntegrations.useQuery(), integrationsData = _155.data, refetchIntegrations = _155.refetch;
    var configureIntegration = trpc_1.trpc.thirdPartyIntegrations.configureIntegration.useMutation({ onSuccess: function () { sonner_1.toast.success("Integration configured"); refetchIntegrations(); setIntAddOpen(false); }, onError: function (e) { return sonner_1.toast.error(e.message); } });
    var deleteIntegration = trpc_1.trpc.thirdPartyIntegrations.deleteIntegration.useMutation({ onSuccess: function () { sonner_1.toast.success("Integration removed"); refetchIntegrations(); }, onError: function (e) { return sonner_1.toast.error(e.message); } });
    var testIntegration = trpc_1.trpc.thirdPartyIntegrations.testIntegration.useMutation({ onSuccess: function () { return sonner_1.toast.success("Integration test passed"); }, onError: function (e) { return sonner_1.toast.error(e.message); } });
    var _156 = trpc_1.trpc.workflows.list.useQuery(), workflowsData = _156.data, refetchWorkflows = _156.refetch;
    var wfTemplatesData = trpc_1.trpc.workflows.getTemplates.useQuery().data;
    var createWorkflow = trpc_1.trpc.workflows.create.useMutation({ onSuccess: function () { sonner_1.toast.success("Workflow created"); refetchWorkflows(); setWfCreateOpen(false); }, onError: function (e) { return sonner_1.toast.error(e.message); } });
    var healthStatus = trpc_1.trpc.systemHealth.getStatus.useQuery(undefined, { refetchInterval: 30000, enabled: activeSection === "system-health" }).data;
    var healthComponents = trpc_1.trpc.systemHealth.getComponents.useQuery(undefined, { refetchInterval: 30000, enabled: activeSection === "system-health" }).data;
    var healthMetrics = trpc_1.trpc.systemHealth.getMetrics.useQuery(undefined, { refetchInterval: 15000, enabled: activeSection === "system-health" }).data;
    // ── Mutations ──────────────────────────────────────────────────────────────
    var updateCompanyMutation = trpc_1.trpc.settings.updateCompanyInfo.useMutation({
        onSuccess: function () { sonner_1.toast.success("Company info saved"); refetchCompany(); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var updateDocPrefixMutation = trpc_1.trpc.settings.updateDocumentPrefix.useMutation({
        onSuccess: function () { sonner_1.toast.success("Prefix updated"); refetchDocs(); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var updateNotifyMutation = trpc_1.trpc.settings.updateNotificationPreferences.useMutation({
        onSuccess: function () { return sonner_1.toast.success("Notification preferences saved"); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var updateByCategory = trpc_1.trpc.settings.updateByCategory.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Settings saved");
            utils.settings.getPublicSettings.invalidate();
        },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var saveThemeMutation = trpc_1.trpc.themeCustomization.saveConfig.useMutation({
        onSuccess: function () { return sonner_1.toast.success("Theme settings saved successfully"); },
        onError: function () { return sonner_1.toast.error("Failed to save theme settings"); }
    });
    var resetThemeMutation = trpc_1.trpc.themeCustomization.resetToDefault.useMutation({
        onSuccess: function (data) {
            updateThemeConfig(data.config);
            if (data.config.colorMode === "dark" || data.config.colorMode === "light") {
                setTheme(data.config.colorMode);
            }
            applyThemeToDOM();
            utils.themeCustomization.getConfig.invalidate();
            sonner_1.toast.success(data.message || "Theme settings reset to defaults");
        },
        onError: function (error) { return sonner_1.toast.error((error === null || error === void 0 ? void 0 : error.message) || "Failed to reset theme settings"); }
    });
    var utils = trpc_1.trpc.useUtils();
    // ── Populate state from queries ────────────────────────────────────────────
    react_1.useEffect(function () {
        if (companyData) {
            setCompanyInfo({
                companyName: companyData.companyName || "",
                companyEmail: companyData.companyEmail || "",
                companyPhone: companyData.companyPhone || "",
                companyWebsite: companyData.companyWebsite || "",
                companyAddress: companyData.companyAddress || "",
                companyCity: companyData.companyCity || "",
                companyCountry: companyData.companyCountry || "Kenya",
                companyPostalCode: companyData.companyPostalCode || "",
                taxId: companyData.taxId || "",
                registrationNumber: companyData.registrationNumber || "",
                companyLogo: companyData.companyLogo || ""
            });
        }
    }, [companyData]);
    react_1.useEffect(function () {
        if (docData) {
            setDocumentNumbers({
                invoicePrefix: docData.invoice_prefix || "INV",
                estimatePrefix: docData.estimate_prefix || "EST",
                receiptPrefix: docData.receipt_prefix || "REC",
                proposalPrefix: docData.proposal_prefix || "PROP",
                expensePrefix: docData.expense_prefix || "EXP"
            });
        }
    }, [docData]);
    react_1.useEffect(function () {
        if (notifyData)
            setNotifyPrefs(function (p) { return (__assign(__assign({}, p), notifyData)); });
    }, [notifyData]);
    react_1.useEffect(function () {
        if (generalData) {
            setGeneral({
                timezone: generalData.timezone || "Africa/Nairobi",
                dateFormat: generalData.dateFormat || "d-m-Y",
                dateSelectorFormat: generalData.dateSelectorFormat || "dd-mm-yyyy",
                leftMenuPosition: generalData.leftMenuPosition || "Collapsed",
                statsPanelPosition: generalData.statsPanelPosition || "Collapsed",
                tablePageSize: generalData.tablePageSize || "35",
                kanbanPageSize: generalData.kanbanPageSize || "35",
                closeModalOnClick: generalData.closeModalOnClick || "no",
                sessionTimeout: generalData.sessionTimeout || "enabled",
                language: generalData.language || "en",
                allowLanguageChange: generalData.allowLanguageChange || "yes",
                exportStripHtml: generalData.exportStripHtml || "yes"
            });
        }
    }, [generalData]);
    react_1.useEffect(function () {
        if (appearanceData) {
            setAppearance({
                theme: appearanceData.theme || "light",
                primaryColor: appearanceData.primaryColor || "#3b82f6"
            });
        }
    }, [appearanceData]);
    react_1.useEffect(function () {
        if (emailData) {
            setEmailSettings({
                mailDriver: emailData.mailDriver || "smtp",
                smtpHost: emailData.smtpHost || "",
                smtpPort: emailData.smtpPort || "587",
                smtpUser: emailData.smtpUser || "",
                smtpPass: emailData.smtpPass || "",
                fromName: emailData.fromName || "",
                fromEmail: emailData.fromEmail || "",
                replyTo: emailData.replyTo || ""
            });
        }
    }, [emailData]);
    react_1.useEffect(function () {
        if (invoiceData) {
            setInvoiceSettings({
                invoicePrefix: invoiceData.invoicePrefix || "INV",
                defaultDueDays: invoiceData.defaultDueDays || "7",
                overdueDays1: invoiceData.overdueDays1 || "1",
                overdueDays2: invoiceData.overdueDays2 || "7",
                overdueDays3: invoiceData.overdueDays3 || "14",
                taxMode: invoiceData.taxMode || "summary",
                termsAndConditions: invoiceData.termsAndConditions || "",
                showProjectTitle: invoiceData.showProjectTitle === "true",
                showViewedIndicator: invoiceData.showViewedIndicator !== "false"
            });
        }
    }, [invoiceData]);
    react_1.useEffect(function () {
        if (bankPayData) {
            setBankPayment({
                enabled: bankPayData.enabled === "true",
                displayName: bankPayData.displayName || "Bank Transfer",
                details: bankPayData.details || ""
            });
        }
    }, [bankPayData]);
    react_1.useEffect(function () {
        if (stripeData) {
            setStripeSettings({
                enabled: stripeData.enabled === "true",
                publishableKey: stripeData.publishableKey || "",
                secretKey: stripeData.secretKey || ""
            });
        }
    }, [stripeData]);
    react_1.useEffect(function () {
        if (mpesaData) {
            setMpesaSettings({
                enabled: mpesaData.enabled === "true",
                consumerKey: mpesaData.consumerKey || "",
                consumerSecret: mpesaData.consumerSecret || "",
                paybillNumber: mpesaData.paybillNumber || "",
                passkey: mpesaData.passkey || "",
                callbackUrl: mpesaData.callbackUrl || ""
            });
        }
    }, [mpesaData]);
    react_1.useEffect(function () {
        if (taxData) {
            try {
                setTaxRates(JSON.parse(taxData.rates || "[]"));
            }
            catch (_a) {
                setTaxRates([]);
            }
        }
    }, [taxData]);
    react_1.useEffect(function () {
        if (tagsData) {
            try {
                setTags(JSON.parse(tagsData.list || "[]"));
            }
            catch (_a) {
                setTags([]);
            }
        }
    }, [tagsData]);
    // ── New category effects ────────────────────────────────────────────────────
    react_1.useEffect(function () { if (currencyData)
        setCurrency({ defaultCurrency: currencyData.defaultCurrency || "KES", symbolPosition: currencyData.symbolPosition || "before", thousandsSep: currencyData.thousandsSep || ",", decimalSep: currencyData.decimalSep || ".", decimalPlaces: currencyData.decimalPlaces || "2" }); }, [currencyData]);
    react_1.useEffect(function () { if (flutterwaveData)
        setFlutterwave({ enabled: flutterwaveData.enabled === "true", publicKey: flutterwaveData.publicKey || "", secretKey: flutterwaveData.secretKey || "" }); }, [flutterwaveData]);
    react_1.useEffect(function () { if (razorpayData)
        setRazorpay({ enabled: razorpayData.enabled === "true", keyId: razorpayData.keyId || "", keySecret: razorpayData.keySecret || "" }); }, [razorpayData]);
    react_1.useEffect(function () { if (paypalData)
        setPaypal({ enabled: paypalData.enabled === "true", clientId: paypalData.clientId || "", clientSecret: paypalData.clientSecret || "", mode: paypalData.mode || "sandbox" }); }, [paypalData]);
    react_1.useEffect(function () { if (paystackData)
        setPaystack({ enabled: paystackData.enabled === "true", publicKey: paystackData.publicKey || "", secretKey: paystackData.secretKey || "" }); }, [paystackData]);
    react_1.useEffect(function () { if (clientsGenData)
        setClientsGeneral({ allowRegistration: clientsGenData.allowRegistration === "true", requireApproval: clientsGenData.requireApproval !== "false", showPortalLogin: clientsGenData.showPortalLogin !== "false", portalUrl: clientsGenData.portalUrl || "" }); }, [clientsGenData]);
    react_1.useEffect(function () { if (clientsCatData)
        setClientsCategories(parseList(clientsCatData.list)); }, [clientsCatData]);
    react_1.useEffect(function () { if (projGenData)
        setProjectsGeneral({ allowClientComments: projGenData.allowClientComments !== "false", allowClientBilling: projGenData.allowClientBilling === "true", notifyOnTaskCreate: projGenData.notifyOnTaskCreate !== "false", defaultBillingType: projGenData.defaultBillingType || "fixed" }); }, [projGenData]);
    react_1.useEffect(function () { if (projCatData)
        setProjectsCategories(parseList(projCatData.list)); }, [projCatData]);
    react_1.useEffect(function () { if (tasksGenData)
        setTasksGeneral({ enableMultipleCheckboxes: tasksGenData.enableMultipleCheckboxes === "true", notifyAssigneeByEmail: tasksGenData.notifyAssigneeByEmail !== "false", defaultStatus: tasksGenData.defaultStatus || "not_started" }); }, [tasksGenData]);
    react_1.useEffect(function () { if (taskStatusData)
        setTaskStatuses(parseList(taskStatusData.list)); }, [taskStatusData]);
    react_1.useEffect(function () { if (taskPriorityData)
        setTaskPriorities(parseList(taskPriorityData.list)); }, [taskPriorityData]);
    react_1.useEffect(function () { if (leadsGenData)
        setLeadsGeneral({ requireSource: leadsGenData.requireSource === "true", requireCategory: leadsGenData.requireCategory === "true", defaultStage: leadsGenData.defaultStage || "new" }); }, [leadsGenData]);
    react_1.useEffect(function () { if (leadsCatData)
        setLeadsCategories(parseList(leadsCatData.list)); }, [leadsCatData]);
    react_1.useEffect(function () { if (leadStageData)
        setLeadStages(parseList(leadStageData.list)); }, [leadStageData]);
    react_1.useEffect(function () { if (leadSourceData)
        setLeadSources(parseList(leadSourceData.list)); }, [leadSourceData]);
    react_1.useEffect(function () { if (milestonesGenData)
        setMilestonesGeneral({ notifyOnCreate: milestonesGenData.notifyOnCreate !== "false", clientVisible: milestonesGenData.clientVisible === "true" }); }, [milestonesGenData]);
    react_1.useEffect(function () { if (defaultMilData)
        setDefaultMilestones(parseList(defaultMilData.list)); }, [defaultMilData]);
    react_1.useEffect(function () { if (invCatData)
        setInvoicesCategories(parseList(invCatData.list)); }, [invCatData]);
    react_1.useEffect(function () { if (invStatusData)
        setInvoicesStatuses(parseList(invStatusData.list)); }, [invStatusData]);
    react_1.useEffect(function () { if (estGenData)
        setEstimatesGeneral({ allowClientApproval: estGenData.allowClientApproval !== "false", expiryDays: estGenData.expiryDays || "30" }); }, [estGenData]);
    react_1.useEffect(function () { if (estCatData)
        setEstimateCategories(parseList(estCatData.list)); }, [estCatData]);
    react_1.useEffect(function () { if (tsGenData)
        setTimesheetsGeneral({ requireNotes: tsGenData.requireNotes === "true", notifyPM: tsGenData.notifyPM !== "false", roundingMinutes: tsGenData.roundingMinutes || "0" }); }, [tsGenData]);
    react_1.useEffect(function () { if (propGenData)
        setProposalsGeneral({ allowEsign: propGenData.allowEsign !== "false", expiryDays: propGenData.expiryDays || "30" }); }, [propGenData]);
    react_1.useEffect(function () { if (propCatData)
        setProposalCategories(parseList(propCatData.list)); }, [propCatData]);
    react_1.useEffect(function () { if (contGenData)
        setContractsGeneral({ allowEsign: contGenData.allowEsign !== "false", expiryReminderDays: contGenData.expiryReminderDays || "7" }); }, [contGenData]);
    react_1.useEffect(function () { if (contCatData)
        setContractCategories(parseList(contCatData.list)); }, [contCatData]);
    react_1.useEffect(function () { if (prodCatData)
        setProductsCategories(parseList(prodCatData.list)); }, [prodCatData]);
    react_1.useEffect(function () { if (prodUnitData)
        setProductUnits(parseList(prodUnitData.list)); }, [prodUnitData]);
    react_1.useEffect(function () { if (expGenData)
        setExpensesGeneral({ requireReceipt: expGenData.requireReceipt === "true", autoApproveBelow: expGenData.autoApproveBelow || "0" }); }, [expGenData]);
    react_1.useEffect(function () { if (expCatData)
        setExpenseCategories(parseList(expCatData.list)); }, [expCatData]);
    react_1.useEffect(function () { if (subsGenData)
        setSubsGeneral({ taxInclusive: subsGenData.taxInclusive === "true", roundAmounts: subsGenData.roundAmounts !== "false" }); }, [subsGenData]);
    react_1.useEffect(function () { if (tagsGenData)
        setTagsGeneral({ allowUserCreate: tagsGenData.allowUserCreate !== "false", autoLowercase: tagsGenData.autoLowercase !== "false" }); }, [tagsGenData]);
    react_1.useEffect(function () { if (filesGenData)
        setFilesGeneral({ maxSizeMb: filesGenData.maxSizeMb || "10", allowedTypes: filesGenData.allowedTypes || "pdf,doc,docx,xls,xlsx,png,jpg,jpeg", maxFilesPerUpload: filesGenData.maxFilesPerUpload || "10" }); }, [filesGenData]);
    react_1.useEffect(function () { if (fileFolderData)
        setFileFolders(parseList(fileFolderData.list)); }, [fileFolderData]);
    react_1.useEffect(function () { if (defaultFolderData)
        setDefaultFolders(parseList(defaultFolderData.list)); }, [defaultFolderData]);
    react_1.useEffect(function () { if (ticketsGenData)
        setTicketsGeneral({ allowClientTickets: ticketsGenData.allowClientTickets !== "false", autoAssign: ticketsGenData.autoAssign === "true", notifyAgents: ticketsGenData.notifyAgents !== "false", closeAfterDays: ticketsGenData.closeAfterDays || "7" }); }, [ticketsGenData]);
    react_1.useEffect(function () { if (ticketDeptData)
        setTicketDepts(parseList(ticketDeptData.list)); }, [ticketDeptData]);
    react_1.useEffect(function () { if (ticketStatusData)
        setTicketStatuses(parseList(ticketStatusData.list)); }, [ticketStatusData]);
    react_1.useEffect(function () { if (ticketCannedData)
        setTicketCanned(parseList(ticketCannedData.list)); }, [ticketCannedData]);
    react_1.useEffect(function () { if (kbGenData)
        setKbGeneral({ guestAccess: kbGenData.guestAccess !== "false", enableComments: kbGenData.enableComments !== "false", articlesPerPage: kbGenData.articlesPerPage || "10" }); }, [kbGenData]);
    react_1.useEffect(function () { if (kbCatData)
        setKbCategories(parseList(kbCatData.list)); }, [kbCatData]);
    react_1.useEffect(function () { if (announGenData)
        setAnnouncementsGeneral({ enabled: announGenData.enabled !== "false", defaultAudienceAll: announGenData.defaultAudienceAll !== "false" }); }, [announGenData]);
    react_1.useEffect(function () { if (announListData)
        setAnnouncementsList(parseList(announListData.list)); }, [announListData]);
    react_1.useEffect(function () { if (goalsGenData)
        setGoalsGeneral({ enableModule: goalsGenData.enableModule !== "false", allowTeamGoals: goalsGenData.allowTeamGoals !== "false" }); }, [goalsGenData]);
    react_1.useEffect(function () { if (goalsCatData)
        setGoalsCategories(parseList(goalsCatData.list)); }, [goalsCatData]);
    react_1.useEffect(function () { if (remindersGenData)
        setRemindersGeneral({ defaultMinutesBefore: remindersGenData.defaultMinutesBefore || "15", emailChannel: remindersGenData.emailChannel !== "false", pushChannel: remindersGenData.pushChannel === "true", smsChannel: remindersGenData.smsChannel === "true" }); }, [remindersGenData]);
    react_1.useEffect(function () { if (secPassData)
        setSecurityPassword({ minLength: secPassData.minLength || "8", requireUppercase: secPassData.requireUppercase !== "false", requireNumbers: secPassData.requireNumbers !== "false", requireSpecial: secPassData.requireSpecial === "true", expiryDays: secPassData.expiryDays || "0" }); }, [secPassData]);
    react_1.useEffect(function () { if (twofaData)
        setTwofa({ enabled: twofaData.enabled === "true", requireForAdmins: twofaData.requireForAdmins === "true", method: twofaData.method || "totp" }); }, [twofaData]);
    react_1.useEffect(function () { if (gdprGenData)
        setGdprGeneral({ enabled: gdprGenData.enabled === "true", retentionDays: gdprGenData.retentionDays || "365" }); }, [gdprGenData]);
    react_1.useEffect(function () { if (gdprCookieData)
        setGdprCookies({ bannerEnabled: gdprCookieData.bannerEnabled !== "false", analyticsEnabled: gdprCookieData.analyticsEnabled !== "false", marketingEnabled: gdprCookieData.marketingEnabled === "true" }); }, [gdprCookieData]);
    react_1.useEffect(function () { if (smsSettingsData)
        setSmsSettings({ provider: smsSettingsData.provider || "twilio", accountSid: smsSettingsData.accountSid || "", authToken: smsSettingsData.authToken || "", fromNumber: smsSettingsData.fromNumber || "", atApiKey: smsSettingsData.atApiKey || "", atUsername: smsSettingsData.atUsername || "" }); }, [smsSettingsData]);
    react_1.useEffect(function () { if (smsTplData)
        setSmsTemplates(parseList(smsTplData.list)); }, [smsTplData]);
    react_1.useEffect(function () { if (pushGenData)
        setPushGeneral({ enabled: pushGenData.enabled === "true" }); }, [pushGenData]);
    react_1.useEffect(function () { if (fcmData)
        setFcmSettings({ serverKey: fcmData.serverKey || "", senderId: fcmData.senderId || "", vapidKey: fcmData.vapidKey || "" }); }, [fcmData]);
    react_1.useEffect(function () { if (webhooksGenData)
        setWebhooksGeneral({ enabled: webhooksGenData.enabled === "true", maxRetries: webhooksGenData.maxRetries || "3" }); }, [webhooksGenData]);
    react_1.useEffect(function () { if (webhooksListData)
        setWebhooksList(parseList(webhooksListData.list)); }, [webhooksListData]);
    react_1.useEffect(function () { if (apiGenData)
        setApiGeneral({ enabled: apiGenData.enabled !== "false", rateLimit: apiGenData.rateLimit || "100", rateLimitPer: apiGenData.rateLimitPer || "minute" }); }, [apiGenData]);
    react_1.useEffect(function () { if (apiKeysData)
        setApiKeys(parseList(apiKeysData.list)); }, [apiKeysData]);
    react_1.useEffect(function () { if (cronGenData)
        setCronGeneral({ enabled: cronGenData.enabled !== "false", defaultSchedule: cronGenData.defaultSchedule || "0 * * * *" }); }, [cronGenData]);
    react_1.useEffect(function () { if (cronJobsData)
        setCronJobs(parseList(cronJobsData.list)); }, [cronJobsData]);
    react_1.useEffect(function () { if (recaptchaData)
        setRecaptcha({ version: recaptchaData.version || "v2", siteKey: recaptchaData.siteKey || "", secretKey: recaptchaData.secretKey || "" }); }, [recaptchaData]);
    // ── Kiini: One Hub. Total Control effects ──
    react_1.useEffect(function () { if (pesapalData)
        setPesapal({ enabled: pesapalData.enabled === "true", consumerKey: pesapalData.consumerKey || "", consumerSecret: pesapalData.consumerSecret || "", environment: pesapalData.environment || "sandbox" }); }, [pesapalData]);
    react_1.useEffect(function () { if (mollieData)
        setMollie({ enabled: mollieData.enabled === "true", apiKey: mollieData.apiKey || "", testMode: mollieData.testMode !== "false" }); }, [mollieData]);
    react_1.useEffect(function () { if (tapPayData)
        setTapPay({ enabled: tapPayData.enabled === "true", merchantId: tapPayData.merchantId || "", apiKey: tapPayData.apiKey || "", environment: tapPayData.environment || "sandbox" }); }, [tapPayData]);
    react_1.useEffect(function () { if (airtelData)
        setAirtelMoney({ enabled: airtelData.enabled === "true", clientId: airtelData.clientId || "", clientSecret: airtelData.clientSecret || "", environment: airtelData.environment || "sandbox" }); }, [airtelData]);
    react_1.useEffect(function () { if (mtnMomoData)
        setMtnMomo({ enabled: mtnMomoData.enabled === "true", subscriptionKey: mtnMomoData.subscriptionKey || "", apiUser: mtnMomoData.apiUser || "", apiKey: mtnMomoData.apiKey || "", environment: mtnMomoData.environment || "sandbox" }); }, [mtnMomoData]);
    react_1.useEffect(function () { if (inventoryGenData)
        setInventoryGeneral({ trackStock: inventoryGenData.trackStock !== "false", lowStockThreshold: inventoryGenData.lowStockThreshold || "10", autoReorder: inventoryGenData.autoReorder === "true", defaultWarehouse: inventoryGenData.defaultWarehouse || "" }); }, [inventoryGenData]);
    react_1.useEffect(function () { if (inventoryCatData)
        setInventoryCategories(parseList(inventoryCatData.list)); }, [inventoryCatData]);
    react_1.useEffect(function () { if (inventoryStockData)
        setInventoryStock({ method: inventoryStockData.method || "fifo", allowNegative: inventoryStockData.allowNegative === "true", barcodeEnabled: inventoryStockData.barcodeEnabled === "true" }); }, [inventoryStockData]);
    react_1.useEffect(function () { if (servicesGenData)
        setServicesGeneral({ enabled: servicesGenData.enabled !== "false", showPricing: servicesGenData.showPricing !== "false", allowOnlineBooking: servicesGenData.allowOnlineBooking === "true", bookingUrl: servicesGenData.bookingUrl || "" }); }, [servicesGenData]);
    react_1.useEffect(function () { if (servicesCatData)
        setServicesCategories(parseList(servicesCatData.list)); }, [servicesCatData]);
    react_1.useEffect(function () { if (servicesCheckoutData)
        setServicesCheckout({ enabled: servicesCheckoutData.enabled === "true", requireLogin: servicesCheckoutData.requireLogin !== "false", allowGuestCheckout: servicesCheckoutData.allowGuestCheckout === "true", termsUrl: servicesCheckoutData.termsUrl || "" }); }, [servicesCheckoutData]);
    react_1.useEffect(function () { if (esignGenData)
        setEsignGeneral({ enabled: esignGenData.enabled === "true", provider: esignGenData.provider || "built-in", requireAuth: esignGenData.requireAuth !== "false", expiryDays: esignGenData.expiryDays || "30" }); }, [esignGenData]);
    react_1.useEffect(function () { if (esignProvidersData)
        setEsignProviders({ docusign: esignProvidersData.docusign === "true", docusignApiKey: esignProvidersData.docusignApiKey || "", hellosign: esignProvidersData.hellosign === "true", hellosignApiKey: esignProvidersData.hellosignApiKey || "" }); }, [esignProvidersData]);
    react_1.useEffect(function () { if (esignTemplatesData)
        setEsignTemplates(parseList(esignTemplatesData.list)); }, [esignTemplatesData]);
    react_1.useEffect(function () { if (docTemplatesData)
        setDocTemplates({ invoice: docTemplatesData.invoice || "", receipt: docTemplatesData.receipt || "", estimate: docTemplatesData.estimate || "" }); }, [docTemplatesData]);
    react_1.useEffect(function () { if (emarketingGenData)
        setEmarketingGeneral({ enabled: emarketingGenData.enabled === "true", provider: emarketingGenData.provider || "built-in", unsubscribeUrl: emarketingGenData.unsubscribeUrl || "", fromName: emarketingGenData.fromName || "", fromEmail: emarketingGenData.fromEmail || "" }); }, [emarketingGenData]);
    react_1.useEffect(function () { if (emarketingListsData)
        setEmarketingLists(parseList(emarketingListsData.list)); }, [emarketingListsData]);
    react_1.useEffect(function () { if (portalGenData)
        setPortalGeneral({ enabled: portalGenData.enabled !== "false", requireApproval: portalGenData.requireApproval !== "false", showInvoices: portalGenData.showInvoices !== "false", showProjects: portalGenData.showProjects !== "false", showTickets: portalGenData.showTickets !== "false", customDomain: portalGenData.customDomain || "" }); }, [portalGenData]);
    react_1.useEffect(function () { if (portalBrandData)
        setPortalBranding({ logoUrl: portalBrandData.logoUrl || "", primaryColor: portalBrandData.primaryColor || "#3b82f6", welcomeMessage: portalBrandData.welcomeMessage || "", portalTitle: portalBrandData.portalTitle || "" }); }, [portalBrandData]);
    react_1.useEffect(function () { if (portalPermsData)
        setPortalPermissions({ viewInvoices: portalPermsData.viewInvoices !== "false", payOnline: portalPermsData.payOnline !== "false", createTickets: portalPermsData.createTickets !== "false", viewProjects: portalPermsData.viewProjects !== "false", downloadFiles: portalPermsData.downloadFiles !== "false", viewEstimates: portalPermsData.viewEstimates !== "false" }); }, [portalPermsData]);
    react_1.useEffect(function () { if (portalModulesData)
        setPortalModules({ invoices: portalModulesData.invoices !== "false", estimates: portalModulesData.estimates !== "false", projects: portalModulesData.projects !== "false", tickets: portalModulesData.tickets !== "false", contracts: portalModulesData.contracts !== "false", knowledgebase: portalModulesData.knowledgebase !== "false", announcements: portalModulesData.announcements !== "false" }); }, [portalModulesData]);
    react_1.useEffect(function () {
        if (themeData) {
            var savedColorMode = (themeData.colorMode === "dark" ? "dark" : "light");
            setThemeSettings({ mainTheme: themeData.mainTheme || "Default", resetUsersTheme: themeData.resetUsersTheme === "true", primaryColor: themeData.primaryColor || "#3b82f6", sidebarColor: themeData.sidebarColor || "#1e293b", headerColor: themeData.headerColor || "#ffffff", fontFamily: themeData.fontFamily || "Inter", borderRadius: themeData.borderRadius || "8", sidebarStyle: themeData.sidebarStyle || "dark", compactMode: themeData.compactMode === "true", htmlHead: themeData.htmlHead || "", htmlBody: themeData.htmlBody || "", cssStyle: themeData.cssStyle || "", colorMode: savedColorMode });
            setTheme(savedColorMode);
        }
    }, [themeData]);
    react_1.useEffect(function () {
        if (companyLogosData)
            setCompanyLogos({ largeLogo: companyLogosData.largeLogo || "", smallLogo: companyLogosData.smallLogo || "" });
    }, [companyLogosData]);
    react_1.useEffect(function () {
        if (purchasingData)
            setPurchasingSettings({ enabled: purchasingData.enabled !== "false", defaultTaxRate: purchasingData.defaultTaxRate || "", approvalRequired: purchasingData.approvalRequired !== "false", defaultPaymentTerms: purchasingData.defaultPaymentTerms || "30" });
    }, [purchasingData]);
    react_1.useEffect(function () { if (projTeamPermsData)
        setProjTeamPerms({ viewOtherTasks: projTeamPermsData.viewOtherTasks === "true", editProject: projTeamPermsData.editProject === "true", deleteTasks: projTeamPermsData.deleteTasks === "true", manageMilestones: projTeamPermsData.manageMilestones === "true", viewBudget: projTeamPermsData.viewBudget === "true", createSubtasks: projTeamPermsData.createSubtasks === "true" }); }, [projTeamPermsData]);
    react_1.useEffect(function () { if (projClientPermsData)
        setProjClientPerms({ viewProgress: projClientPermsData.viewProgress === "true", viewTasks: projClientPermsData.viewTasks === "true", createTasks: projClientPermsData.createTasks === "true", commentTasks: projClientPermsData.commentTasks === "true", viewTeam: projClientPermsData.viewTeam === "true", uploadFiles: projClientPermsData.uploadFiles === "true", viewInvoices: projClientPermsData.viewInvoices === "true" }); }, [projClientPermsData]);
    react_1.useEffect(function () { if (projAutoData)
        setProjAutomation({ autoComplete: projAutoData.autoComplete === "true", emailOnStatusChange: projAutoData.emailOnStatusChange === "true", defaultTaskList: projAutoData.defaultTaskList === "true", autoAssignPM: projAutoData.autoAssignPM === "true" }); }, [projAutoData]);
    react_1.useEffect(function () { if (estAutoData)
        setEstAutomation({ autoConvertToInvoice: estAutoData.autoConvertToInvoice === "true", emailOnExpiry: estAutoData.emailOnExpiry === "true", notifyOnApproval: estAutoData.notifyOnApproval === "true", autoAddTax: estAutoData.autoAddTax === "true" }); }, [estAutoData]);
    react_1.useEffect(function () { if (propAutoData)
        setPropAutomation({ autoConvertToProject: propAutoData.autoConvertToProject === "true", remindBeforeExpiry: propAutoData.remindBeforeExpiry === "true", notifyOnSignature: propAutoData.notifyOnSignature === "true", autoGenerateInvoice: propAutoData.autoGenerateInvoice === "true" }); }, [propAutoData]);
    react_1.useEffect(function () { if (contAutoData)
        setContAutomation({ emailBeforeExpiry: contAutoData.emailBeforeExpiry === "true", autoRenew: contAutoData.autoRenew === "true", notifyOnSignature: contAutoData.notifyOnSignature === "true", archiveExpired: contAutoData.archiveExpired === "true" }); }, [contAutoData]);
    react_1.useEffect(function () { if (tweakData)
        setTweakSettings({ showPoweredBy: tweakData.showPoweredBy === "true", forceHttps: tweakData.forceHttps === "true", debugMode: tweakData.debugMode === "true", maintenanceMode: tweakData.maintenanceMode === "true", customCss: tweakData.customCss || "", customJs: tweakData.customJs || "" }); }, [tweakData]);
    react_1.useEffect(function () {
        if (!permissionsData)
            return;
        var cats = [
            { key: "clients", perms: ["View", "Create", "Edit", "Delete", "Export"] },
            { key: "invoices", perms: ["View", "Create", "Edit", "Delete", "Send"] },
            { key: "projects", perms: ["View", "Create", "Edit", "Delete", "Manage Members"] },
            { key: "tasks", perms: ["View", "Create", "Edit", "Delete", "Assign"] },
            { key: "leads", perms: ["View", "Create", "Edit", "Delete", "Convert"] },
            { key: "estimates", perms: ["View", "Create", "Edit", "Delete", "Send"] },
            { key: "proposals", perms: ["View", "Create", "Edit", "Delete", "Send"] },
            { key: "contracts", perms: ["View", "Create", "Edit", "Delete", "Sign"] },
            { key: "expenses", perms: ["View", "Create", "Edit", "Delete", "Approve"] },
            { key: "tickets", perms: ["View", "Create", "Edit", "Delete", "Assign"] },
            { key: "reports", perms: ["View", "Export", "Schedule"] },
            { key: "settings", perms: ["View", "Modify"] },
        ];
        var init = {};
        cats.forEach(function (cat) { return cat.perms.forEach(function (p) {
            var k = cat.key + "_" + p.toLowerCase().replace(/\s+/g, "_");
            init[k] = permissionsData[k] !== "false";
        }); });
        setPermState(init);
    }, [permissionsData]);
    // ── Guard ──────────────────────────────────────────────────────────────────
    if (isLoadingPermission) {
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" }));
    }
    if (!allowed)
        return null;
    // ── Save helpers ───────────────────────────────────────────────────────────
    // ── Default values for Reset to Default ──────────────────────────────────
    var DEFAULTS = {
        general: { timezone: "Africa/Nairobi", dateFormat: "d-m-Y", dateSelectorFormat: "dd-mm-yyyy", leftMenuPosition: "Collapsed", statsPanelPosition: "Collapsed", tablePageSize: "35", kanbanPageSize: "35", closeModalOnClick: "no", sessionTimeout: "enabled", language: "en", allowLanguageChange: "yes", exportStripHtml: "yes" },
        theme: { mainTheme: "Default", resetUsersTheme: false, primaryColor: "#3b82f6", sidebarColor: "#1e293b", headerColor: "#ffffff", fontFamily: "Inter", borderRadius: "8", sidebarStyle: "dark", compactMode: false, htmlHead: "", htmlBody: "", cssStyle: "", colorMode: "light" }
    };
    var resetSection = function (section) {
        switch (section) {
            case "general":
                setGeneral(DEFAULTS.general);
                sonner_1.toast.success("General settings reset to defaults");
                break;
            case "theme":
                setThemeSettings(DEFAULTS.theme);
                updateThemeConfig({
                    accentColor: DEFAULTS.theme.primaryColor,
                    customLightPrimary: DEFAULTS.theme.primaryColor,
                    customDarkPrimary: DEFAULTS.theme.primaryColor,
                    customDarkBackground: DEFAULTS.theme.sidebarColor,
                    customLightSurface: DEFAULTS.theme.headerColor,
                    fontFamily: DEFAULTS.theme.fontFamily,
                    borderRadius: DEFAULTS.theme.borderRadius
                });
                setTheme("light");
                sonner_1.toast.success("Theme settings reset to defaults");
                break;
            default:
                sonner_1.toast.info("No defaults defined for this section");
        }
    };
    var resetAllSettings = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            setGeneral(DEFAULTS.general);
            setThemeSettings(DEFAULTS.theme);
            updateThemeConfig({
                accentColor: DEFAULTS.theme.primaryColor,
                customLightPrimary: DEFAULTS.theme.primaryColor,
                customDarkPrimary: DEFAULTS.theme.primaryColor,
                customDarkBackground: DEFAULTS.theme.sidebarColor,
                customLightSurface: DEFAULTS.theme.headerColor,
                fontFamily: DEFAULTS.theme.fontFamily,
                borderRadius: DEFAULTS.theme.borderRadius
            });
            setTheme("light");
            sonner_1.toast.success("All settings have been reset to defaults");
            return [2 /*return*/];
        });
    }); };
    var save = function (key, fn) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setSavingKey(key, true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, fn()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    setSavingKey(key, false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleLogoUpload = function (e) {
        var _a;
        var file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        if (file.size > 2 * 1024 * 1024) {
            sonner_1.toast.error("Logo must be under 2 MB");
            return;
        }
        var reader = new FileReader();
        reader.onloadend = function () { return setCompanyInfo(function (p) { return (__assign(__assign({}, p), { companyLogo: reader.result })); }); };
        reader.readAsDataURL(file);
    };
    var addTaxRate = function () {
        if (!newTax.name || !newTax.rate) {
            sonner_1.toast.error("Name and rate are required");
            return;
        }
        var updated = __spreadArrays(taxRates, [__assign({ id: crypto.randomUUID() }, newTax)]);
        setTaxRates(updated);
        setNewTax({ name: "", rate: "", description: "" });
        updateByCategory.mutate({ category: "tax_rates", values: { rates: JSON.stringify(updated) } });
    };
    var removeTaxRate = function (id) {
        var updated = taxRates.filter(function (t) { return t.id !== id; });
        setTaxRates(updated);
        updateByCategory.mutate({ category: "tax_rates", values: { rates: JSON.stringify(updated) } });
    };
    var addTag = function () {
        if (!newTag.name) {
            sonner_1.toast.error("Tag name is required");
            return;
        }
        var updated = __spreadArrays(tags, [__assign({ id: crypto.randomUUID() }, newTag)]);
        setTags(updated);
        setNewTag({ name: "", color: "#3b82f6" });
        updateByCategory.mutate({ category: "global_tags", values: { list: JSON.stringify(updated) } });
    };
    var removeTag = function (id) {
        var updated = tags.filter(function (t) { return t.id !== id; });
        setTags(updated);
        updateByCategory.mutate({ category: "global_tags", values: { list: JSON.stringify(updated) } });
    };
    // ── Right-panel content ────────────────────────────────────────────────────
    function renderContent() {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1;
        switch (activeSection) {
            // ── GENERAL ──────────────────────────────────────────────────────────
            case "general":
                return (React.createElement(Section, { title: "General Settings", description: "Configure system-wide defaults" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement(Field, { label: "Time Zone" },
                            React.createElement(select_1.Select, { value: general.timezone, onValueChange: function (v) { return setGeneral(function (p) { return (__assign(__assign({}, p), { timezone: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null, ["Africa/Nairobi", "Africa/Lagos", "Africa/Cairo", "Africa/Johannesburg", "Africa/Casablanca", "Europe/London", "Europe/Paris", "Europe/Berlin", "America/New_York", "America/Chicago", "America/Los_Angeles", "America/Sao_Paulo", "Asia/Dubai", "Asia/Kolkata", "Asia/Shanghai", "Asia/Tokyo", "Australia/Sydney", "Pacific/Auckland", "UTC"].map(function (tz) { return (React.createElement(select_1.SelectItem, { key: tz, value: tz }, tz)); })))),
                        React.createElement(Field, { label: "Date Format" },
                            React.createElement(select_1.Select, { value: general.dateFormat, onValueChange: function (v) { return setGeneral(function (p) { return (__assign(__assign({}, p), { dateFormat: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "d-m-Y" }, "d-m-Y"),
                                    React.createElement(select_1.SelectItem, { value: "m-d-Y" }, "m-d-Y"),
                                    React.createElement(select_1.SelectItem, { value: "Y-m-d" }, "Y-m-d"),
                                    React.createElement(select_1.SelectItem, { value: "d/m/Y" }, "d/m/Y"),
                                    React.createElement(select_1.SelectItem, { value: "m/d/Y" }, "m/d/Y"),
                                    React.createElement(select_1.SelectItem, { value: "d.m.Y" }, "d.m.Y"),
                                    React.createElement(select_1.SelectItem, { value: "D M d, Y" }, "D M d, Y")))),
                        React.createElement(Field, { label: "Date Selector Format" },
                            React.createElement(select_1.Select, { value: general.dateSelectorFormat, onValueChange: function (v) { return setGeneral(function (p) { return (__assign(__assign({}, p), { dateSelectorFormat: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "dd-mm-yyyy" }, "dd-mm-yyyy"),
                                    React.createElement(select_1.SelectItem, { value: "mm-dd-yyyy" }, "mm-dd-yyyy"),
                                    React.createElement(select_1.SelectItem, { value: "yyyy-mm-dd" }, "yyyy-mm-dd"),
                                    React.createElement(select_1.SelectItem, { value: "dd/mm/yyyy" }, "dd/mm/yyyy"),
                                    React.createElement(select_1.SelectItem, { value: "mm/dd/yyyy" }, "mm/dd/yyyy")))),
                        React.createElement(Field, { label: "Left Menu Position - Default Position" },
                            React.createElement(select_1.Select, { value: general.leftMenuPosition, onValueChange: function (v) { return setGeneral(function (p) { return (__assign(__assign({}, p), { leftMenuPosition: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "Collapsed" }, "Collapsed"),
                                    React.createElement(select_1.SelectItem, { value: "Expanded" }, "Expanded")))),
                        React.createElement(Field, { label: "Stats Panel - Default Position" },
                            React.createElement(select_1.Select, { value: general.statsPanelPosition, onValueChange: function (v) { return setGeneral(function (p) { return (__assign(__assign({}, p), { statsPanelPosition: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "Collapsed" }, "Collapsed"),
                                    React.createElement(select_1.SelectItem, { value: "Expanded" }, "Expanded")))),
                        React.createElement(Field, { label: "Table Pagination Limits" },
                            React.createElement(input_1.Input, { type: "number", min: "5", max: "200", value: general.tablePageSize, onChange: function (e) { return setGeneral(function (p) { return (__assign(__assign({}, p), { tablePageSize: e.target.value })); }); } })),
                        React.createElement(Field, { label: "Kanban Pagination Limits" },
                            React.createElement(input_1.Input, { type: "number", min: "5", max: "200", value: general.kanbanPageSize, onChange: function (e) { return setGeneral(function (p) { return (__assign(__assign({}, p), { kanbanPageSize: e.target.value })); }); } })),
                        React.createElement(Field, { label: "Close Modal Window On Page Click" },
                            React.createElement(select_1.Select, { value: general.closeModalOnClick, onValueChange: function (v) { return setGeneral(function (p) { return (__assign(__assign({}, p), { closeModalOnClick: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "yes" }, "Yes"),
                                    React.createElement(select_1.SelectItem, { value: "no" }, "No")))),
                        React.createElement(Field, { label: "Show session timeout popup" },
                            React.createElement(select_1.Select, { value: general.sessionTimeout, onValueChange: function (v) { return setGeneral(function (p) { return (__assign(__assign({}, p), { sessionTimeout: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "enabled" }, "Enabled"),
                                    React.createElement(select_1.SelectItem, { value: "disabled" }, "Disabled")))),
                        React.createElement(Field, { label: "Default Language" },
                            React.createElement(select_1.Select, { value: general.language, onValueChange: function (v) { return setGeneral(function (p) { return (__assign(__assign({}, p), { language: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "en" }, "English"),
                                    React.createElement(select_1.SelectItem, { value: "sw" }, "Swahili"),
                                    React.createElement(select_1.SelectItem, { value: "fr" }, "French"),
                                    React.createElement(select_1.SelectItem, { value: "ar" }, "Arabic"),
                                    React.createElement(select_1.SelectItem, { value: "es" }, "Spanish"),
                                    React.createElement(select_1.SelectItem, { value: "pt" }, "Portuguese"),
                                    React.createElement(select_1.SelectItem, { value: "de" }, "German")))),
                        React.createElement(Field, { label: "Allow Users To Change Language" },
                            React.createElement(select_1.Select, { value: general.allowLanguageChange, onValueChange: function (v) { return setGeneral(function (p) { return (__assign(__assign({}, p), { allowLanguageChange: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "yes" }, "Yes"),
                                    React.createElement(select_1.SelectItem, { value: "no" }, "No")))),
                        React.createElement(Field, { label: "Exporting Content - (Strip HTML)" },
                            React.createElement(select_1.Select, { value: general.exportStripHtml, onValueChange: function (v) { return setGeneral(function (p) { return (__assign(__assign({}, p), { exportStripHtml: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "yes" }, "Yes"),
                                    React.createElement(select_1.SelectItem, { value: "no" }, "No"))))),
                    React.createElement("div", { className: "flex items-center" },
                        React.createElement(SaveButton, { saving: !!saving.general, onClick: function () { return save("general", function () { return updateByCategory.mutateAsync({ category: "general", values: general }); }); } }),
                        React.createElement(ResetButton, { onClick: function () { return resetSection("general"); } }))));
            // ── COMPANY ──────────────────────────────────────────────────────────
            case "company":
                return (React.createElement(Section, { title: "Company Details", description: "Information shown on invoices and documents" },
                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                        React.createElement(Field, { label: "Company Name" },
                            React.createElement("input", { className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm", value: companyInfo.companyName, onChange: function (e) { return setCompanyInfo(function (p) { return (__assign(__assign({}, p), { companyName: e.target.value })); }); }, placeholder: "Kiini Solutions" })),
                        React.createElement(Field, { label: "Registration Number" },
                            React.createElement("input", { className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm", value: companyInfo.registrationNumber, onChange: function (e) { return setCompanyInfo(function (p) { return (__assign(__assign({}, p), { registrationNumber: e.target.value })); }); }, placeholder: "C123456" })),
                        React.createElement(Field, { label: "Email" },
                            React.createElement("input", { className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm", type: "email", value: companyInfo.companyEmail, onChange: function (e) { return setCompanyInfo(function (p) { return (__assign(__assign({}, p), { companyEmail: e.target.value })); }); }, placeholder: "info@company.com" })),
                        React.createElement(Field, { label: "Phone" },
                            React.createElement("input", { className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm", value: companyInfo.companyPhone, onChange: function (e) { return setCompanyInfo(function (p) { return (__assign(__assign({}, p), { companyPhone: e.target.value })); }); }, placeholder: "+254 700 000 000" })),
                        React.createElement(Field, { label: "Website" },
                            React.createElement("input", { className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm", value: companyInfo.companyWebsite, onChange: function (e) { return setCompanyInfo(function (p) { return (__assign(__assign({}, p), { companyWebsite: e.target.value })); }); }, placeholder: "www.company.com" })),
                        React.createElement(Field, { label: "Tax ID / KRA PIN" },
                            React.createElement("input", { className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm", value: companyInfo.taxId, onChange: function (e) { return setCompanyInfo(function (p) { return (__assign(__assign({}, p), { taxId: e.target.value })); }); }, placeholder: "A123456789X" }))),
                    React.createElement(Field, { label: "Physical Address" },
                        React.createElement("textarea", { className: "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm", rows: 2, value: companyInfo.companyAddress, onChange: function (e) { return setCompanyInfo(function (p) { return (__assign(__assign({}, p), { companyAddress: e.target.value })); }); }, placeholder: "Street address" })),
                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" },
                        React.createElement(Field, { label: "City" },
                            React.createElement(LocationSelects_1.CitySelect, { value: companyInfo.companyCity, onChange: function (v) { return setCompanyInfo(function (p) { return (__assign(__assign({}, p), { companyCity: v })); }); }, label: "" })),
                        React.createElement(Field, { label: "Country" },
                            React.createElement(LocationSelects_1.CountrySelect, { value: companyInfo.companyCountry, onChange: function (v) { return setCompanyInfo(function (p) { return (__assign(__assign({}, p), { companyCountry: v })); }); }, label: "" })),
                        React.createElement(Field, { label: "Postal Code" },
                            React.createElement("input", { className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm", value: companyInfo.companyPostalCode, onChange: function (e) { return setCompanyInfo(function (p) { return (__assign(__assign({}, p), { companyPostalCode: e.target.value })); }); }, placeholder: "00100" }))),
                    React.createElement(separator_1.Separator, null),
                    React.createElement(Field, { label: "Company Logo" },
                        React.createElement("div", { className: "flex items-center gap-4" },
                            React.createElement("div", { className: "h-20 w-20 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden bg-muted" }, companyInfo.companyLogo
                                ? React.createElement("img", { src: companyInfo.companyLogo, alt: "Logo", className: "h-full w-full object-contain" })
                                : React.createElement(lucide_react_1.Building2, { className: "h-7 w-7 text-muted-foreground" })),
                            React.createElement("div", { className: "space-y-1" },
                                React.createElement("input", { type: "file", accept: "image/*", onChange: handleLogoUpload, title: "Upload company logo", "aria-label": "Upload company logo", className: "text-sm" }),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Square or horizontal. Max 2 MB.")))),
                    React.createElement(SaveButton, { saving: !!saving.company, onClick: function () { return save("company", function () { return mutationHelpers_1["default"](updateCompanyMutation, companyInfo); }); } })));
            // ── THEME (Kiini: One Hub. Total Control) ─────────────────────────────────────────────
            case "theme": {
                var config_1 = themeConfig;
                var handleThemeChange_1 = function (key, value) {
                    var _a;
                    updateThemeConfig((_a = {}, _a[key] = value, _a));
                };
                var handleSaveTheme = function () { return __awaiter(_this, void 0, void 0, function () {
                    var error_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 3, , 4]);
                                return [4 /*yield*/, saveThemeMutation.mutateAsync(config_1)];
                            case 1:
                                _a.sent();
                                if (config_1.colorMode === "dark" || config_1.colorMode === "light") {
                                    setTheme(config_1.colorMode);
                                }
                                applyThemeToDOM();
                                return [4 /*yield*/, utils.themeCustomization.getConfig.invalidate()];
                            case 2:
                                _a.sent();
                                sonner_1.toast.success("Theme saved successfully");
                                return [3 /*break*/, 4];
                            case 3:
                                error_1 = _a.sent();
                                sonner_1.toast.error((error_1 === null || error_1 === void 0 ? void 0 : error_1.message) || "Failed to save theme");
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); };
                var handleResetTheme = function () { return __awaiter(_this, void 0, void 0, function () {
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                _b.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, resetThemeMutation.mutateAsync()];
                            case 1:
                                _b.sent();
                                return [3 /*break*/, 3];
                            case 2:
                                _a = _b.sent();
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); };
                var normalizeHexColor_1 = function (value) {
                    var normalized = (value === null || value === void 0 ? void 0 : value.startsWith("#")) ? value : "#" + (value !== null && value !== void 0 ? value : "");
                    return /^#[0-9A-Fa-f]{6}$/.test(normalized) ? normalized : "#000000";
                };
                var sanitizeHexInput_1 = function (input) {
                    var raw = input.startsWith("#") ? input.slice(1) : input;
                    var cleaned = raw.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
                    return "#" + cleaned;
                };
                var ColorPicker = function (_a) {
                    var label = _a.label, value = _a.value, onChange = _a.onChange;
                    return (React.createElement(Field, { label: label },
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("input", { type: "color", value: normalizeHexColor_1(value), onChange: function (e) { return onChange(e.target.value); }, className: "w-10 h-10 rounded border cursor-pointer" }),
                            React.createElement(input_1.Input, { value: value || "", onChange: function (e) {
                                    var input = sanitizeHexInput_1(e.target.value);
                                    onChange(input);
                                }, placeholder: "#000000", maxLength: 7, className: "flex-1 font-mono" }))));
                };
                var themePresets_1 = {
                    Default: { primaryColor: "#3b82f6", sidebarColor: "#1e293b", headerColor: "#ffffff", fontFamily: "Inter", borderRadius: "8", sidebarStyle: "dark", description: "Clean modern look with blue accents and a dark sidebar" },
                    Prestige: { primaryColor: "#8b5cf6", sidebarColor: "#1e1b4b", headerColor: "#faf5ff", fontFamily: "Poppins", borderRadius: "12", sidebarStyle: "dark", description: "Premium corporate look with violet tones and refined typography" },
                    Midnight: { primaryColor: "#38bdf8", sidebarColor: "#020617", headerColor: "#0f172a", fontFamily: "Inter", borderRadius: "8", sidebarStyle: "dark", description: "Full dark mode with sky-blue accents for low-light environments" },
                    "Dark Mode": { primaryColor: "#6366f1", sidebarColor: "#111827", headerColor: "#1f2937", fontFamily: "Inter", borderRadius: "8", sidebarStyle: "dark", description: "Full dark mode with indigo accents" },
                    "Light Mode": { primaryColor: "#0066cc", sidebarColor: "#f3f4f6", headerColor: "#ffffff", fontFamily: "Inter", borderRadius: "8", sidebarStyle: "light", description: "Bright professional theme with light sidebar and blue accents" },
                    "Ocean Blue": { primaryColor: "#0369a1", sidebarColor: "#0c4a6e", headerColor: "#e0f2fe", fontFamily: "System-ui", borderRadius: "6", sidebarStyle: "dark", description: "Oceanic blue tones with calm professional aesthetic" }
                };
                var applyPreset_1 = function (name) { return __awaiter(_this, void 0, void 0, function () {
                    var p, isDarkMode, updatedConfig, error_2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                p = themePresets_1[name];
                                if (!p) return [3 /*break*/, 4];
                                isDarkMode = name === "Dark Mode";
                                updatedConfig = __assign(__assign({}, config_1), { customLightPrimary: p.primaryColor, customDarkPrimary: p.primaryColor, sidebarBackgroundLight: p.sidebarColor, sidebarBackgroundDark: p.sidebarColor, navBackgroundLight: p.headerColor, navBackgroundDark: p.headerColor, fontFamily: p.fontFamily, borderRadius: p.borderRadius, sidebarStyle: p.sidebarStyle, colorMode: isDarkMode ? "dark" : name === "Light Mode" ? "light" : config_1.colorMode });
                                updateThemeConfig(updatedConfig);
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, saveThemeMutation.mutateAsync(updatedConfig)];
                            case 2:
                                _a.sent();
                                if (updatedConfig.colorMode === "dark" || updatedConfig.colorMode === "light") {
                                    setTheme(updatedConfig.colorMode);
                                }
                                applyThemeToDOM();
                                utils.themeCustomization.getConfig.invalidate();
                                sonner_1.toast.success("Applied " + name + " theme preset");
                                return [3 /*break*/, 4];
                            case 3:
                                error_2 = _a.sent();
                                sonner_1.toast.error("Failed to save theme preset");
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); };
                return (React.createElement(Section, { title: "Theme Customization", description: "Comprehensive theme customization for your CRM application" },
                    React.createElement("div", { className: "space-y-8" },
                        React.createElement("div", { className: "space-y-4" },
                            React.createElement("h4", { className: "text-sm font-semibold text-muted-foreground uppercase tracking-wider" }, "Theme Presets"),
                            React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" }, Object.entries(themePresets_1).map(function (_a) {
                                var name = _a[0], preset = _a[1];
                                return (React.createElement("button", { key: name, type: "button", onClick: function () { return applyPreset_1(name); }, className: "rounded-lg border-2 p-3 text-left transition-all " + (config_1.customLightPrimary === preset.primaryColor
                                        ? "border-primary ring-2 ring-primary/20"
                                        : "border-border hover:border-primary/50") },
                                    React.createElement("div", { className: "flex gap-1.5 mb-2 h-8 rounded overflow-hidden" },
                                        React.createElement("div", { className: "w-6 rounded-sm", style: { backgroundColor: preset.sidebarColor } }),
                                        React.createElement("div", { className: "flex-1 rounded-sm flex flex-col" },
                                            React.createElement("div", { className: "h-2 rounded-t-sm", style: {
                                                    backgroundColor: preset.headerColor,
                                                    border: preset.headerColor === "#ffffff" ? "1px solid #e2e8f0" : "none"
                                                } }),
                                            React.createElement("div", { className: "flex-1 rounded-b-sm", style: {
                                                    backgroundColor: preset.headerColor === "#ffffff"
                                                        ? "#f8fafc"
                                                        : preset.headerColor === "#faf5ff"
                                                            ? "#f5f3ff"
                                                            : "#1e293b"
                                                } }))),
                                    React.createElement("div", { className: "flex items-center gap-2 mb-1" },
                                        React.createElement("div", { className: "w-3 h-3 rounded-full", style: { backgroundColor: preset.primaryColor } }),
                                        React.createElement("span", { className: "text-sm font-semibold" }, name)),
                                    React.createElement("p", { className: "text-xs text-muted-foreground leading-tight" }, preset.description)));
                            })))),
                    React.createElement(tabs_1.Tabs, { defaultValue: "colors", className: "space-y-6 mt-6" },
                        React.createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-6" },
                            React.createElement(tabs_1.TabsTrigger, { value: "colors" }, "Colors"),
                            React.createElement(tabs_1.TabsTrigger, { value: "cards" }, "Cards"),
                            React.createElement(tabs_1.TabsTrigger, { value: "navigation" }, "Navigation"),
                            React.createElement(tabs_1.TabsTrigger, { value: "buttons" }, "Buttons"),
                            React.createElement(tabs_1.TabsTrigger, { value: "backgrounds" }, "Backgrounds"),
                            React.createElement(tabs_1.TabsTrigger, { value: "components" }, "Components")),
                        React.createElement(tabs_1.TabsContent, { value: "colors", className: "space-y-6" },
                            React.createElement("div", { className: "space-y-4" },
                                React.createElement("h4", { className: "text-sm font-semibold text-muted-foreground uppercase tracking-wider" }, "Light Mode Colors"),
                                React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" },
                                    React.createElement(ColorPicker, { label: "Primary", value: config_1.customLightPrimary, onChange: function (v) { return handleThemeChange_1('customLightPrimary', v); } }),
                                    React.createElement(ColorPicker, { label: "Secondary", value: config_1.customLightSecondary, onChange: function (v) { return handleThemeChange_1('customLightSecondary', v); } }),
                                    React.createElement(ColorPicker, { label: "Accent", value: config_1.customLightAccent, onChange: function (v) { return handleThemeChange_1('customLightAccent', v); } }),
                                    React.createElement(ColorPicker, { label: "Background", value: config_1.customLightBackground, onChange: function (v) { return handleThemeChange_1('customLightBackground', v); } }),
                                    React.createElement(ColorPicker, { label: "Surface", value: config_1.customLightSurface, onChange: function (v) { return handleThemeChange_1('customLightSurface', v); } }),
                                    React.createElement(ColorPicker, { label: "Text", value: config_1.customLightText, onChange: function (v) { return handleThemeChange_1('customLightText', v); } }))),
                            React.createElement("div", { className: "space-y-4" },
                                React.createElement("h4", { className: "text-sm font-semibold text-muted-foreground uppercase tracking-wider" }, "Dark Mode Colors"),
                                React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" },
                                    React.createElement(ColorPicker, { label: "Primary", value: config_1.customDarkPrimary, onChange: function (v) { return handleThemeChange_1('customDarkPrimary', v); } }),
                                    React.createElement(ColorPicker, { label: "Secondary", value: config_1.customDarkSecondary, onChange: function (v) { return handleThemeChange_1('customDarkSecondary', v); } }),
                                    React.createElement(ColorPicker, { label: "Accent", value: config_1.customDarkAccent, onChange: function (v) { return handleThemeChange_1('customDarkAccent', v); } }),
                                    React.createElement(ColorPicker, { label: "Background", value: config_1.customDarkBackground, onChange: function (v) { return handleThemeChange_1('customDarkBackground', v); } }),
                                    React.createElement(ColorPicker, { label: "Surface", value: config_1.customDarkSurface, onChange: function (v) { return handleThemeChange_1('customDarkSurface', v); } }),
                                    React.createElement(ColorPicker, { label: "Text", value: config_1.customDarkText, onChange: function (v) { return handleThemeChange_1('customDarkText', v); } }))),
                            React.createElement("div", { className: "space-y-4" },
                                React.createElement("h4", { className: "text-sm font-semibold text-muted-foreground uppercase tracking-wider" }, "Typography Colors"),
                                React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement("h5", { className: "text-xs font-medium text-muted-foreground" }, "Light Mode"),
                                        React.createElement("div", { className: "grid grid-cols-2 gap-2" },
                                            React.createElement(ColorPicker, { label: "H1-H6", value: config_1.h1ColorLight, onChange: function (v) { return handleThemeChange_1('h1ColorLight', v); } }),
                                            React.createElement(ColorPicker, { label: "Body", value: config_1.bodyColorLight, onChange: function (v) { return handleThemeChange_1('bodyColorLight', v); } }),
                                            React.createElement(ColorPicker, { label: "Muted", value: config_1.mutedColorLight, onChange: function (v) { return handleThemeChange_1('mutedColorLight', v); } }))),
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement("h5", { className: "text-xs font-medium text-muted-foreground" }, "Dark Mode"),
                                        React.createElement("div", { className: "grid grid-cols-2 gap-2" },
                                            React.createElement(ColorPicker, { label: "H1-H6", value: config_1.h1ColorDark, onChange: function (v) { return handleThemeChange_1('h1ColorDark', v); } }),
                                            React.createElement(ColorPicker, { label: "Body", value: config_1.bodyColorDark, onChange: function (v) { return handleThemeChange_1('bodyColorDark', v); } }),
                                            React.createElement(ColorPicker, { label: "Muted", value: config_1.mutedColorDark, onChange: function (v) { return handleThemeChange_1('mutedColorDark', v); } })))))),
                        React.createElement(tabs_1.TabsContent, { value: "cards", className: "space-y-6" },
                            React.createElement("div", { className: "space-y-4" },
                                React.createElement("h4", { className: "text-sm font-semibold text-muted-foreground uppercase tracking-wider" }, "Card Styling"),
                                React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                                    React.createElement(Field, { label: "Background Style" },
                                        React.createElement(select_1.Select, { value: config_1.cardBackgroundStyle || "solid", onValueChange: function (v) { return handleThemeChange_1('cardBackgroundStyle', v); } },
                                            React.createElement(select_1.SelectTrigger, null,
                                                React.createElement(select_1.SelectValue, null)),
                                            React.createElement(select_1.SelectContent, null,
                                                React.createElement(select_1.SelectItem, { value: "solid" }, "Solid"),
                                                React.createElement(select_1.SelectItem, { value: "gradient" }, "Gradient"),
                                                React.createElement(select_1.SelectItem, { value: "pattern" }, "Pattern"),
                                                React.createElement(select_1.SelectItem, { value: "transparent" }, "Transparent")))),
                                    React.createElement(ColorPicker, { label: "Border Color", value: config_1.cardBorderColor, onChange: function (v) { return handleThemeChange_1('cardBorderColor', v); } })),
                                React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                                    React.createElement(ColorPicker, { label: "Custom Background", value: config_1.customCardBackground, onChange: function (v) { return handleThemeChange_1('customCardBackground', v); } }),
                                    React.createElement(ColorPicker, { label: "Custom Foreground", value: config_1.customCardForeground, onChange: function (v) { return handleThemeChange_1('customCardForeground', v); } })),
                                React.createElement(Field, { label: "Shadow Style" },
                                    React.createElement(select_1.Select, { value: config_1.cardShadowStyle || "none", onValueChange: function (v) { return handleThemeChange_1('cardShadowStyle', v); } },
                                        React.createElement(select_1.SelectTrigger, null,
                                            React.createElement(select_1.SelectValue, null)),
                                        React.createElement(select_1.SelectContent, null,
                                            React.createElement(select_1.SelectItem, { value: "none" }, "None"),
                                            React.createElement(select_1.SelectItem, { value: "sm" }, "Small"),
                                            React.createElement(select_1.SelectItem, { value: "md" }, "Medium"),
                                            React.createElement(select_1.SelectItem, { value: "lg" }, "Large"),
                                            React.createElement(select_1.SelectItem, { value: "xl" }, "Extra Large")))))),
                        React.createElement(tabs_1.TabsContent, { value: "navigation", className: "space-y-6" },
                            React.createElement("div", { className: "space-y-4" },
                                React.createElement("h4", { className: "text-sm font-semibold text-muted-foreground uppercase tracking-wider" }, "Navigation Menu"),
                                React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                                    React.createElement(ColorPicker, { label: "Light Background", value: config_1.navBackgroundLight, onChange: function (v) { return handleThemeChange_1('navBackgroundLight', v); } }),
                                    React.createElement(ColorPicker, { label: "Dark Background", value: config_1.navBackgroundDark, onChange: function (v) { return handleThemeChange_1('navBackgroundDark', v); } }),
                                    React.createElement(ColorPicker, { label: "Light Text", value: config_1.navTextColorLight, onChange: function (v) { return handleThemeChange_1('navTextColorLight', v); } }),
                                    React.createElement(ColorPicker, { label: "Dark Text", value: config_1.navTextColorDark, onChange: function (v) { return handleThemeChange_1('navTextColorDark', v); } }),
                                    React.createElement(ColorPicker, { label: "Border Color", value: config_1.navBorderColor, onChange: function (v) { return handleThemeChange_1('navBorderColor', v); } }),
                                    React.createElement(ColorPicker, { label: "Hover Background", value: config_1.navHoverBg, onChange: function (v) { return handleThemeChange_1('navHoverBg', v); } }),
                                    React.createElement(ColorPicker, { label: "Active Background", value: config_1.navActiveBg, onChange: function (v) { return handleThemeChange_1('navActiveBg', v); } }),
                                    React.createElement(ColorPicker, { label: "Hover Text", value: config_1.navHoverText, onChange: function (v) { return handleThemeChange_1('navHoverText', v); } }),
                                    React.createElement(ColorPicker, { label: "Active Text", value: config_1.navActiveText, onChange: function (v) { return handleThemeChange_1('navActiveText', v); } })))),
                        React.createElement(tabs_1.TabsContent, { value: "buttons", className: "space-y-6" },
                            React.createElement("div", { className: "space-y-4" },
                                React.createElement("h4", { className: "text-sm font-semibold text-muted-foreground uppercase tracking-wider" }, "Button Styling"),
                                React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                                    React.createElement(ColorPicker, { label: "Light Background", value: config_1.buttonBgColorLight, onChange: function (v) { return handleThemeChange_1('buttonBgColorLight', v); } }),
                                    React.createElement(ColorPicker, { label: "Dark Background", value: config_1.buttonBgColorDark, onChange: function (v) { return handleThemeChange_1('buttonBgColorDark', v); } }),
                                    React.createElement(ColorPicker, { label: "Border Color", value: config_1.buttonBorderColor, onChange: function (v) { return handleThemeChange_1('buttonBorderColor', v); } }),
                                    React.createElement(ColorPicker, { label: "Hover Background", value: config_1.buttonHoverBg, onChange: function (v) { return handleThemeChange_1('buttonHoverBg', v); } }),
                                    React.createElement(ColorPicker, { label: "Active Background", value: config_1.buttonActiveBg, onChange: function (v) { return handleThemeChange_1('buttonActiveBg', v); } }),
                                    React.createElement(ColorPicker, { label: "Disabled Background", value: config_1.buttonDisabledBg, onChange: function (v) { return handleThemeChange_1('buttonDisabledBg', v); } }),
                                    React.createElement(ColorPicker, { label: "Disabled Text", value: config_1.buttonDisabledText, onChange: function (v) { return handleThemeChange_1('buttonDisabledText', v); } }),
                                    React.createElement(ColorPicker, { label: "Active Text", value: config_1.buttonActiveText, onChange: function (v) { return handleThemeChange_1('buttonActiveText', v); } })),
                                React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4" },
                                    React.createElement(Field, { label: "Border Radius" },
                                        React.createElement(input_1.Input, { value: config_1.buttonBorderRadius || "", onChange: function (e) { return handleThemeChange_1('buttonBorderRadius', e.target.value); }, placeholder: "6px" })),
                                    React.createElement(Field, { label: "Padding" },
                                        React.createElement(input_1.Input, { value: config_1.buttonPadding || "", onChange: function (e) { return handleThemeChange_1('buttonPadding', e.target.value); }, placeholder: "8px 16px" })),
                                    React.createElement(Field, { label: "Font Size" },
                                        React.createElement(input_1.Input, { value: config_1.buttonFontSize || "", onChange: function (e) { return handleThemeChange_1('buttonFontSize', e.target.value); }, placeholder: "14px" }))))),
                        React.createElement(tabs_1.TabsContent, { value: "backgrounds", className: "space-y-6" },
                            React.createElement("div", { className: "space-y-4" },
                                React.createElement("h4", { className: "text-sm font-semibold text-muted-foreground uppercase tracking-wider" }, "Background Themes"),
                                React.createElement(Field, { label: "Gradient Background" },
                                    React.createElement(input_1.Input, { value: config_1.backgroundGradient || "", onChange: function (e) { return handleThemeChange_1('backgroundGradient', e.target.value); }, placeholder: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" })),
                                React.createElement(Field, { label: "Pattern Background" },
                                    React.createElement(input_1.Input, { value: config_1.backgroundPattern || "", onChange: function (e) { return handleThemeChange_1('backgroundPattern', e.target.value); }, placeholder: "url('data:image/svg+xml,...')" })),
                                React.createElement(Field, { label: "Custom Background Image" },
                                    React.createElement(input_1.Input, { value: config_1.backgroundImage || "", onChange: function (e) { return handleThemeChange_1('backgroundImage', e.target.value); }, placeholder: "url('/path/to/image.jpg')" })))),
                        React.createElement(tabs_1.TabsContent, { value: "components", className: "space-y-6" },
                            React.createElement("div", { className: "space-y-4" },
                                React.createElement("h4", { className: "text-sm font-semibold text-muted-foreground uppercase tracking-wider" }, "Form Inputs"),
                                React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4" },
                                    React.createElement(ColorPicker, { label: "Background", value: config_1.formInputBg, onChange: function (v) { return handleThemeChange_1('formInputBg', v); } }),
                                    React.createElement(ColorPicker, { label: "Border", value: config_1.formInputBorder, onChange: function (v) { return handleThemeChange_1('formInputBorder', v); } }),
                                    React.createElement(ColorPicker, { label: "Text", value: config_1.formInputText, onChange: function (v) { return handleThemeChange_1('formInputText', v); } }))),
                            React.createElement("div", { className: "space-y-4" },
                                React.createElement("h4", { className: "text-sm font-semibold text-muted-foreground uppercase tracking-wider" }, "Tables"),
                                React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4" },
                                    React.createElement(ColorPicker, { label: "Background", value: config_1.tableBg, onChange: function (v) { return handleThemeChange_1('tableBg', v); } }),
                                    React.createElement(ColorPicker, { label: "Border", value: config_1.tableBorder, onChange: function (v) { return handleThemeChange_1('tableBorder', v); } }),
                                    React.createElement(ColorPicker, { label: "Text", value: config_1.tableText, onChange: function (v) { return handleThemeChange_1('tableText', v); } }))),
                            React.createElement("div", { className: "space-y-4" },
                                React.createElement("h4", { className: "text-sm font-semibold text-muted-foreground uppercase tracking-wider" }, "Modals"),
                                React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4" },
                                    React.createElement(ColorPicker, { label: "Background", value: config_1.modalBg, onChange: function (v) { return handleThemeChange_1('modalBg', v); } }),
                                    React.createElement(ColorPicker, { label: "Border", value: config_1.modalBorder, onChange: function (v) { return handleThemeChange_1('modalBorder', v); } }),
                                    React.createElement(ColorPicker, { label: "Text", value: config_1.modalText, onChange: function (v) { return handleThemeChange_1('modalText', v); } }))),
                            React.createElement("div", { className: "space-y-4" },
                                React.createElement("h4", { className: "text-sm font-semibold text-muted-foreground uppercase tracking-wider" }, "Tooltips"),
                                React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                                    React.createElement(ColorPicker, { label: "Background", value: config_1.tooltipBg, onChange: function (v) { return handleThemeChange_1('tooltipBg', v); } }),
                                    React.createElement(ColorPicker, { label: "Text", value: config_1.tooltipText, onChange: function (v) { return handleThemeChange_1('tooltipText', v); } }))),
                            React.createElement("div", { className: "space-y-4" },
                                React.createElement("h4", { className: "text-sm font-semibold text-muted-foreground uppercase tracking-wider" }, "Dropdowns"),
                                React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4" },
                                    React.createElement(ColorPicker, { label: "Background", value: config_1.dropdownBg, onChange: function (v) { return handleThemeChange_1('dropdownBg', v); } }),
                                    React.createElement(ColorPicker, { label: "Border", value: config_1.dropdownBorder, onChange: function (v) { return handleThemeChange_1('dropdownBorder', v); } }),
                                    React.createElement(ColorPicker, { label: "Text", value: config_1.dropdownText, onChange: function (v) { return handleThemeChange_1('dropdownText', v); } }))),
                            React.createElement("div", { className: "space-y-4" },
                                React.createElement("h4", { className: "text-sm font-semibold text-muted-foreground uppercase tracking-wider" }, "General"),
                                React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                                    React.createElement(Field, { label: "Border Radius" },
                                        React.createElement(input_1.Input, { value: config_1.borderRadius || "", onChange: function (e) { return handleThemeChange_1('borderRadius', e.target.value); }, placeholder: "8px" })),
                                    React.createElement(Field, { label: "Font Family" },
                                        React.createElement(select_1.Select, { value: config_1.fontFamily || "Inter", onValueChange: function (v) { return handleThemeChange_1('fontFamily', v); } },
                                            React.createElement(select_1.SelectTrigger, null,
                                                React.createElement(select_1.SelectValue, null)),
                                            React.createElement(select_1.SelectContent, null,
                                                React.createElement(select_1.SelectItem, { value: "Inter" }, "Inter"),
                                                React.createElement(select_1.SelectItem, { value: "Roboto" }, "Roboto"),
                                                React.createElement(select_1.SelectItem, { value: "Open Sans" }, "Open Sans"),
                                                React.createElement(select_1.SelectItem, { value: "Lato" }, "Lato"),
                                                React.createElement(select_1.SelectItem, { value: "Poppins" }, "Poppins"),
                                                React.createElement(select_1.SelectItem, { value: "Nunito" }, "Nunito"),
                                                React.createElement(select_1.SelectItem, { value: "Source Sans Pro" }, "Source Sans Pro"),
                                                React.createElement(select_1.SelectItem, { value: "system-ui" }, "System Default")))))),
                            React.createElement("div", { className: "space-y-4" },
                                React.createElement("h4", { className: "text-sm font-semibold text-muted-foreground uppercase tracking-wider" }, "Theme Options"),
                                React.createElement("div", { className: "space-y-4" },
                                    React.createElement("div", { className: "flex items-center justify-between p-3 rounded-lg border" },
                                        React.createElement("div", { className: "space-y-0.5" },
                                            React.createElement("label", { className: "text-sm font-medium" }, "Compact Mode"),
                                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Reduce spacing and element sizes for a more compact layout")),
                                        React.createElement(switch_1.Switch, { checked: config_1.compactMode || false, onCheckedChange: function (v) { return handleThemeChange_1('compactMode', v); } })),
                                    React.createElement("div", { className: "flex items-center justify-between p-3 rounded-lg border" },
                                        React.createElement("div", { className: "space-y-0.5" },
                                            React.createElement("label", { className: "text-sm font-medium" }, "Apply to All Users"),
                                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Apply this theme to all users in your organization")),
                                        React.createElement(switch_1.Switch, { checked: config_1.applyToAllUsers || false, onCheckedChange: function (v) { return handleThemeChange_1('applyToAllUsers', v); } })))),
                            React.createElement("div", { className: "space-y-4" },
                                React.createElement("h4", { className: "text-sm font-semibold text-muted-foreground uppercase tracking-wider" }, "Custom CSS"),
                                React.createElement(Field, { label: "Custom Styles" },
                                    React.createElement(textarea_1.Textarea, { value: config_1.customCSS || "", onChange: function (e) { return handleThemeChange_1('customCSS', e.target.value); }, placeholder: "/* Add custom CSS rules here */\n.custom-class {\n  color: #000;\n}", className: "font-mono text-xs", rows: 8 })),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Add custom CSS rules to override theme styles. These rules will be injected into the application stylesheet.")))),
                    React.createElement("div", { className: "flex items-center gap-4 pt-6 border-t" },
                        React.createElement(button_1.Button, { onClick: handleResetTheme, variant: "outline", className: "text-destructive hover:text-destructive" }, "Reset to Defaults"),
                        React.createElement("div", { className: "flex-1" }),
                        React.createElement(button_1.Button, { onClick: handleSaveTheme, disabled: saveThemeMutation.isPending },
                            saveThemeMutation.isPending ? React.createElement(lucide_react_1.Loader2, { className: "w-4 h-4 animate-spin mr-2" }) : React.createElement(lucide_react_1.Save, { className: "w-4 h-4 mr-2" }),
                            "Save Theme"))));
            }
            // ── COMPANY LOGO ──────────────────────────────────────────────────────
            case "company-logo":
                return (React.createElement(Section, { title: "Company Logo", description: "Upload your company logos" },
                    React.createElement("div", { className: "grid md:grid-cols-2 gap-6" },
                        React.createElement("div", { className: "space-y-3" },
                            React.createElement("h4", { className: "font-semibold" }, "Large Logo"),
                            React.createElement("div", { className: "border-2 border-dashed rounded-lg p-6 flex flex-col items-center gap-3" },
                                companyLogos.largeLogo
                                    ? React.createElement("img", { src: companyLogos.largeLogo, alt: "Large Logo", className: "max-h-12 object-contain" })
                                    : React.createElement(lucide_react_1.Building2, { className: "h-12 w-12 text-muted-foreground" }),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Used when the main menu is expanded"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Also used on invoices, estimates, etc."),
                                React.createElement("p", { className: "text-xs text-muted-foreground font-medium" }, "Best image dimensions: (185px X 45px)"),
                                React.createElement("label", { className: "text-sm text-primary cursor-pointer hover:underline" },
                                    "Change Logo",
                                    React.createElement("input", { type: "file", accept: "image/*", className: "hidden", onChange: function (e) {
                                            var _a;
                                            var file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
                                            if (!file)
                                                return;
                                            var reader = new FileReader();
                                            reader.onloadend = function () { return setCompanyLogos(function (p) { return (__assign(__assign({}, p), { largeLogo: reader.result })); }); };
                                            reader.readAsDataURL(file);
                                        } })))),
                        React.createElement("div", { className: "space-y-3" },
                            React.createElement("h4", { className: "font-semibold" }, "Small Logo"),
                            React.createElement("div", { className: "border-2 border-dashed rounded-lg p-6 flex flex-col items-center gap-3" },
                                companyLogos.smallLogo
                                    ? React.createElement("img", { src: companyLogos.smallLogo, alt: "Small Logo", className: "max-h-12 w-12 object-contain" })
                                    : React.createElement(lucide_react_1.Building2, { className: "h-12 w-12 text-muted-foreground" }),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Used when the main menu is collapsed"),
                                React.createElement("p", { className: "text-xs text-muted-foreground font-medium" }, "Best image dimensions: (45px X 45px)"),
                                React.createElement("label", { className: "text-sm text-primary cursor-pointer hover:underline" },
                                    "Change Logo",
                                    React.createElement("input", { type: "file", accept: "image/*", className: "hidden", onChange: function (e) {
                                            var _a;
                                            var file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
                                            if (!file)
                                                return;
                                            var reader = new FileReader();
                                            reader.onloadend = function () { return setCompanyLogos(function (p) { return (__assign(__assign({}, p), { smallLogo: reader.result })); }); };
                                            reader.readAsDataURL(file);
                                        } }))))),
                    React.createElement(SaveButton, { saving: !!saving["company-logo"], onClick: function () { return save("company-logo", function () { return updateByCategory.mutateAsync({ category: "company_logos", values: companyLogos }); }); } })));
            // ── EMAIL ─────────────────────────────────────────────────────────────
            case "email":
                return (React.createElement(Section, { title: "Email Settings", description: "Configure how outgoing emails are sent" },
                    React.createElement(Field, { label: "Mail Driver" },
                        React.createElement(select_1.Select, { value: emailSettings.mailDriver, onValueChange: function (v) { return setEmailSettings(function (p) { return (__assign(__assign({}, p), { mailDriver: v })); }); } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "smtp" }, "SMTP (Custom)"),
                                React.createElement(select_1.SelectItem, { value: "sendgrid" }, "SendGrid"),
                                React.createElement(select_1.SelectItem, { value: "mailgun" }, "Mailgun")))),
                    emailSettings.mailDriver === "smtp" && (React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                        React.createElement(Field, { label: "SMTP Host" },
                            React.createElement(input_1.Input, { value: emailSettings.smtpHost, onChange: function (e) { return setEmailSettings(function (p) { return (__assign(__assign({}, p), { smtpHost: e.target.value })); }); }, placeholder: "smtp.gmail.com" })),
                        React.createElement(Field, { label: "SMTP Port" },
                            React.createElement(input_1.Input, { value: emailSettings.smtpPort, onChange: function (e) { return setEmailSettings(function (p) { return (__assign(__assign({}, p), { smtpPort: e.target.value })); }); }, placeholder: "587" })),
                        React.createElement(Field, { label: "SMTP Username" },
                            React.createElement(input_1.Input, { value: emailSettings.smtpUser, onChange: function (e) { return setEmailSettings(function (p) { return (__assign(__assign({}, p), { smtpUser: e.target.value })); }); }, placeholder: "user@gmail.com" })),
                        React.createElement(Field, { label: "SMTP Password" },
                            React.createElement(input_1.Input, { type: "password", value: emailSettings.smtpPass, onChange: function (e) { return setEmailSettings(function (p) { return (__assign(__assign({}, p), { smtpPass: e.target.value })); }); }, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" })))),
                    React.createElement(separator_1.Separator, null),
                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                        React.createElement(Field, { label: "From Name" },
                            React.createElement(input_1.Input, { value: emailSettings.fromName, onChange: function (e) { return setEmailSettings(function (p) { return (__assign(__assign({}, p), { fromName: e.target.value })); }); }, placeholder: "Kiini Solutions" })),
                        React.createElement(Field, { label: "From Email" },
                            React.createElement(input_1.Input, { type: "email", value: emailSettings.fromEmail, onChange: function (e) { return setEmailSettings(function (p) { return (__assign(__assign({}, p), { fromEmail: e.target.value })); }); }, placeholder: "no-reply@company.com" })),
                        React.createElement(Field, { label: "Reply-To Email" },
                            React.createElement(input_1.Input, { type: "email", value: emailSettings.replyTo, onChange: function (e) { return setEmailSettings(function (p) { return (__assign(__assign({}, p), { replyTo: e.target.value })); }); }, placeholder: "support@company.com" }))),
                    React.createElement(SaveButton, { saving: !!saving.email, onClick: function () { return save("email", function () { return updateByCategory.mutateAsync({ category: "email", values: __assign({}, emailSettings) }); }); } })));
            // ── INVOICES ──────────────────────────────────────────────────────────
            case "invoices":
                return (React.createElement(Section, { title: "Invoice Settings", description: "Defaults applied to new invoices" },
                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                        React.createElement(Field, { label: "Invoice Prefix" },
                            React.createElement(input_1.Input, { value: invoiceSettings.invoicePrefix, onChange: function (e) { return setInvoiceSettings(function (p) { return (__assign(__assign({}, p), { invoicePrefix: e.target.value })); }); }, placeholder: "INV" })),
                        React.createElement(Field, { label: "Default Due Days" },
                            React.createElement(input_1.Input, { type: "number", min: "1", value: invoiceSettings.defaultDueDays, onChange: function (e) { return setInvoiceSettings(function (p) { return (__assign(__assign({}, p), { defaultDueDays: e.target.value })); }); }, placeholder: "7" })),
                        React.createElement(Field, { label: "Default Tax Mode" },
                            React.createElement(select_1.Select, { value: invoiceSettings.taxMode, onValueChange: function (v) { return setInvoiceSettings(function (p) { return (__assign(__assign({}, p), { taxMode: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "summary" }, "Summary Tax"),
                                    React.createElement(select_1.SelectItem, { value: "item" }, "Per-Item Tax"),
                                    React.createElement(select_1.SelectItem, { value: "none" }, "No Tax"))))),
                    React.createElement(separator_1.Separator, null),
                    React.createElement("p", { className: "text-sm font-medium" }, "Overdue Reminders"),
                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4" },
                        React.createElement(Field, { label: "1st reminder (days overdue)" },
                            React.createElement(input_1.Input, { type: "number", min: "0", value: invoiceSettings.overdueDays1, onChange: function (e) { return setInvoiceSettings(function (p) { return (__assign(__assign({}, p), { overdueDays1: e.target.value })); }); } })),
                        React.createElement(Field, { label: "2nd reminder" },
                            React.createElement(input_1.Input, { type: "number", min: "0", value: invoiceSettings.overdueDays2, onChange: function (e) { return setInvoiceSettings(function (p) { return (__assign(__assign({}, p), { overdueDays2: e.target.value })); }); } })),
                        React.createElement(Field, { label: "3rd reminder" },
                            React.createElement(input_1.Input, { type: "number", min: "0", value: invoiceSettings.overdueDays3, onChange: function (e) { return setInvoiceSettings(function (p) { return (__assign(__assign({}, p), { overdueDays3: e.target.value })); }); } }))),
                    React.createElement(separator_1.Separator, null),
                    React.createElement("div", { className: "flex flex-col gap-3" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("p", { className: "text-sm font-medium" }, "Show project title on invoice"),
                            React.createElement(switch_1.Switch, { checked: invoiceSettings.showProjectTitle, onCheckedChange: function (c) { return setInvoiceSettings(function (p) { return (__assign(__assign({}, p), { showProjectTitle: c })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("p", { className: "text-sm font-medium" }, "Show \"viewed by client\" indicator"),
                            React.createElement(switch_1.Switch, { checked: invoiceSettings.showViewedIndicator, onCheckedChange: function (c) { return setInvoiceSettings(function (p) { return (__assign(__assign({}, p), { showViewedIndicator: c })); }); } }))),
                    React.createElement(separator_1.Separator, null),
                    React.createElement(Field, { label: "Terms & Conditions" },
                        React.createElement(RichTextEditor_1.RichTextEditor, { value: invoiceSettings.termsAndConditions, onChange: function (v) { return setInvoiceSettings(function (p) { return (__assign(__assign({}, p), { termsAndConditions: v })); }); }, placeholder: "Enter default terms and conditions for invoices\u2026", minHeight: "160px" })),
                    React.createElement(SaveButton, { saving: !!saving.invoices, onClick: function () { return save("invoices", function () { return updateByCategory.mutateAsync({
                            category: "invoice_settings",
                            values: __assign(__assign({}, invoiceSettings), { showProjectTitle: String(invoiceSettings.showProjectTitle), showViewedIndicator: String(invoiceSettings.showViewedIndicator) })
                        }); }); } })));
            // ── DOCUMENT NUMBERS ──────────────────────────────────────────────────
            case "numbering":
                return (React.createElement(Section, { title: "Document Number Prefixes", description: "Prefix used when generating document IDs" },
                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" }, ["invoice", "estimate", "receipt", "proposal", "expense"].map(function (type) {
                        var key = (type + "Prefix");
                        return (React.createElement(Field, { key: type, label: type.charAt(0).toUpperCase() + type.slice(1) + " Prefix" },
                            React.createElement("div", { className: "flex gap-2" },
                                React.createElement(input_1.Input, { value: documentNumbers[key], onChange: function (e) { return setDocumentNumbers(function (p) {
                                        var _a;
                                        return (__assign(__assign({}, p), (_a = {}, _a[key] = e.target.value, _a)));
                                    }); }, placeholder: type.toUpperCase().slice(0, 3) }),
                                React.createElement(button_1.Button, { variant: "outline", size: "sm", disabled: !!saving["doc_" + type], onClick: function () { return save("doc_" + type, function () { return mutationHelpers_1["default"](updateDocPrefixMutation, { documentType: type, prefix: documentNumbers[key] }); }); } }, saving["doc_" + type] ? React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin" }) : React.createElement(lucide_react_1.Save, { className: "h-4 w-4" })))));
                    }))));
            // ── PAYMENTS – BANK TRANSFER ──────────────────────────────────────────
            case "payments-bank":
                return (React.createElement(Section, { title: "Bank Transfer", description: "Display banking details on invoices for manual payments" },
                    React.createElement("div", { className: "flex items-center justify-between mb-2" },
                        React.createElement("p", { className: "text-sm font-medium" }, "Enable Bank Transfer payment method"),
                        React.createElement(switch_1.Switch, { checked: bankPayment.enabled, onCheckedChange: function (c) { return setBankPayment(function (p) { return (__assign(__assign({}, p), { enabled: c })); }); } })),
                    React.createElement(Field, { label: "Display Name" },
                        React.createElement(input_1.Input, { value: bankPayment.displayName, onChange: function (e) { return setBankPayment(function (p) { return (__assign(__assign({}, p), { displayName: e.target.value })); }); }, placeholder: "Bank Transfer" })),
                    React.createElement(Field, { label: "Banking Details" },
                        React.createElement("p", { className: "text-xs text-muted-foreground mb-1" },
                            "Variables:",
                            " ",
                            React.createElement("code", { className: "bg-muted px-1 rounded" }, "{invoice_id}"),
                            ",",
                            " ",
                            React.createElement("code", { className: "bg-muted px-1 rounded" }, "{invoice_total}"),
                            ",",
                            " ",
                            React.createElement("code", { className: "bg-muted px-1 rounded" }, "{balance_due}"),
                            ",",
                            " ",
                            React.createElement("code", { className: "bg-muted px-1 rounded" }, "{client_company_name}"),
                            ",",
                            " ",
                            React.createElement("code", { className: "bg-muted px-1 rounded" }, "{due_date}"),
                            ",",
                            " ",
                            React.createElement("code", { className: "bg-muted px-1 rounded" }, "{company_name}")),
                        React.createElement(RichTextEditor_1.RichTextEditor, { value: bankPayment.details, onChange: function (v) { return setBankPayment(function (p) { return (__assign(__assign({}, p), { details: v })); }); }, placeholder: "Enter banking details shown to clients on invoices\u2026", minHeight: "140px" })),
                    React.createElement(SaveButton, { saving: !!saving.bankpay, onClick: function () { return save("bankpay", function () { return updateByCategory.mutateAsync({
                            category: "payment_bank",
                            values: __assign(__assign({}, bankPayment), { enabled: String(bankPayment.enabled) })
                        }); }); } })));
            // ── PAYMENTS – STRIPE ─────────────────────────────────────────────────
            case "payments-stripe":
                return (React.createElement(Section, { title: "Stripe", description: "Accept card payments via Stripe" },
                    React.createElement("div", { className: "flex items-center justify-between mb-2" },
                        React.createElement("p", { className: "text-sm font-medium" }, "Enable Stripe"),
                        React.createElement(switch_1.Switch, { checked: stripeSettings.enabled, onCheckedChange: function (c) { return setStripeSettings(function (p) { return (__assign(__assign({}, p), { enabled: c })); }); } })),
                    React.createElement("div", { className: "grid grid-cols-1 gap-4" },
                        React.createElement(Field, { label: "Publishable Key" },
                            React.createElement(input_1.Input, { value: stripeSettings.publishableKey, onChange: function (e) { return setStripeSettings(function (p) { return (__assign(__assign({}, p), { publishableKey: e.target.value })); }); }, placeholder: "pk_live_\u2026" })),
                        React.createElement(Field, { label: "Secret Key" },
                            React.createElement(input_1.Input, { type: "password", value: stripeSettings.secretKey, onChange: function (e) { return setStripeSettings(function (p) { return (__assign(__assign({}, p), { secretKey: e.target.value })); }); }, placeholder: "sk_live_\u2026" }))),
                    React.createElement(SaveButton, { saving: !!saving.stripe, onClick: function () { return save("stripe", function () { return updateByCategory.mutateAsync({
                            category: "payment_stripe",
                            values: __assign(__assign({}, stripeSettings), { enabled: String(stripeSettings.enabled) })
                        }); }); } })));
            // ── PAYMENTS – M-PESA ─────────────────────────────────────────────────
            case "payments-mpesa":
                return (React.createElement(Section, { title: "M-Pesa (Safaricom)", description: "Accept M-Pesa STK Push payments" },
                    React.createElement("div", { className: "flex items-center justify-between mb-2" },
                        React.createElement("p", { className: "text-sm font-medium" }, "Enable M-Pesa"),
                        React.createElement(switch_1.Switch, { checked: mpesaSettings.enabled, onCheckedChange: function (c) { return setMpesaSettings(function (p) { return (__assign(__assign({}, p), { enabled: c })); }); } })),
                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                        React.createElement(Field, { label: "Consumer Key" },
                            React.createElement(input_1.Input, { value: mpesaSettings.consumerKey, onChange: function (e) { return setMpesaSettings(function (p) { return (__assign(__assign({}, p), { consumerKey: e.target.value })); }); }, placeholder: "Consumer Key" })),
                        React.createElement(Field, { label: "Consumer Secret" },
                            React.createElement(input_1.Input, { type: "password", value: mpesaSettings.consumerSecret, onChange: function (e) { return setMpesaSettings(function (p) { return (__assign(__assign({}, p), { consumerSecret: e.target.value })); }); }, placeholder: "Consumer Secret" })),
                        React.createElement(Field, { label: "Paybill / Till Number" },
                            React.createElement(input_1.Input, { value: mpesaSettings.paybillNumber, onChange: function (e) { return setMpesaSettings(function (p) { return (__assign(__assign({}, p), { paybillNumber: e.target.value })); }); }, placeholder: "174379" })),
                        React.createElement(Field, { label: "Passkey" },
                            React.createElement(input_1.Input, { type: "password", value: mpesaSettings.passkey, onChange: function (e) { return setMpesaSettings(function (p) { return (__assign(__assign({}, p), { passkey: e.target.value })); }); }, placeholder: "Passkey" })),
                        React.createElement(Field, { label: "Callback URL" },
                            React.createElement(input_1.Input, { value: mpesaSettings.callbackUrl, onChange: function (e) { return setMpesaSettings(function (p) { return (__assign(__assign({}, p), { callbackUrl: e.target.value })); }); }, placeholder: "https://your-domain.com/api/mpesa/callback" }))),
                    React.createElement(SaveButton, { saving: !!saving.mpesa, onClick: function () { return save("mpesa", function () { return updateByCategory.mutateAsync({
                            category: "payment_mpesa",
                            values: __assign(__assign({}, mpesaSettings), { enabled: String(mpesaSettings.enabled) })
                        }); }); } })));
            // ── TAX ───────────────────────────────────────────────────────────────
            case "tax":
                return (React.createElement(Section, { title: "Tax Rates", description: "Define reusable tax rates for invoices" },
                    React.createElement("div", { className: "space-y-2" },
                        taxRates.length === 0 && (React.createElement("p", { className: "text-sm text-muted-foreground" }, "No tax rates defined. Add one below.")),
                        taxRates.map(function (t) { return (React.createElement("div", { key: t.id, className: "flex items-center gap-3 p-3 border rounded-md bg-muted/40" },
                            React.createElement("div", { className: "flex-1" },
                                React.createElement("p", { className: "text-sm font-medium" }, t.name),
                                t.description && React.createElement("p", { className: "text-xs text-muted-foreground" }, t.description)),
                            React.createElement(badge_1.Badge, { variant: "secondary" },
                                t.rate,
                                "%"),
                            React.createElement("button", { onClick: function () { return removeTaxRate(t.id); }, "aria-label": "Remove tax rate", title: "Remove", className: "text-destructive hover:text-destructive/80" },
                                React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); })),
                    React.createElement(separator_1.Separator, null),
                    React.createElement("p", { className: "text-sm font-semibold" }, "Add Tax Rate"),
                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3" },
                        React.createElement(Field, { label: "Name" },
                            React.createElement(input_1.Input, { value: newTax.name, onChange: function (e) { return setNewTax(function (p) { return (__assign(__assign({}, p), { name: e.target.value })); }); }, placeholder: "VAT" })),
                        React.createElement(Field, { label: "Rate (%)" },
                            React.createElement(input_1.Input, { type: "number", min: "0", max: "100", step: "0.01", value: newTax.rate, onChange: function (e) { return setNewTax(function (p) { return (__assign(__assign({}, p), { rate: e.target.value })); }); }, placeholder: "16" })),
                        React.createElement(Field, { label: "Description (optional)" },
                            React.createElement(input_1.Input, { value: newTax.description, onChange: function (e) { return setNewTax(function (p) { return (__assign(__assign({}, p), { description: e.target.value })); }); }, placeholder: "Value Added Tax" }))),
                    React.createElement(button_1.Button, { onClick: addTaxRate, size: "sm" },
                        React.createElement(lucide_react_1.Plus, { className: "mr-1 h-4 w-4" }),
                        " Add Tax Rate")));
            // ── TAGS ──────────────────────────────────────────────────────────────
            case "tags":
                return (React.createElement(Section, { title: "Global Tags", description: "Tags available across clients, projects, and tasks" },
                    React.createElement("div", { className: "flex flex-wrap gap-2" },
                        tags.length === 0 && React.createElement("p", { className: "text-sm text-muted-foreground" }, "No tags yet."),
                        tags.map(function (t) { return (React.createElement(badge_1.Badge, { key: t.id, style: { backgroundColor: t.color, color: "#fff" }, className: "flex items-center gap-1 pr-1 cursor-default" },
                            t.name,
                            React.createElement("button", { onClick: function () { return removeTag(t.id); }, "aria-label": "Remove tag", title: "Remove", className: "ml-1 hover:opacity-70" },
                                React.createElement(lucide_react_1.Trash2, { className: "h-3 w-3" })))); })),
                    React.createElement(separator_1.Separator, null),
                    React.createElement("p", { className: "text-sm font-semibold" }, "Add Tag"),
                    React.createElement("div", { className: "flex gap-3 items-end" },
                        React.createElement(Field, { label: "Tag Name" },
                            React.createElement(input_1.Input, { value: newTag.name, onChange: function (e) { return setNewTag(function (p) { return (__assign(__assign({}, p), { name: e.target.value })); }); }, placeholder: "Important" })),
                        React.createElement(Field, { label: "Color" },
                            React.createElement("input", { type: "color", value: newTag.color, onChange: function (e) { return setNewTag(function (p) { return (__assign(__assign({}, p), { color: e.target.value })); }); }, title: "Tag color picker", "aria-label": "Tag color", className: "h-9 w-14 cursor-pointer rounded border border-input p-1" })),
                        React.createElement(button_1.Button, { onClick: addTag, size: "sm" },
                            React.createElement(lucide_react_1.Plus, { className: "mr-1 h-4 w-4" }),
                            " Add Tag"))));
            // ── NOTIFICATIONS ─────────────────────────────────────────────────────
            case "notifications":
                return (React.createElement(Section, { title: "Notification Preferences", description: "Choose which events trigger in-app notifications" },
                    React.createElement("div", { className: "space-y-3" }, [
                        { key: "invoiceDue", label: "Invoice due reminders" },
                        { key: "paymentReceived", label: "Payment received alerts" },
                        { key: "newClient", label: "New client added" },
                        { key: "companyAnnouncement", label: "Company announcements" },
                        { key: "projectDeadline", label: "Project deadline reminders" },
                        { key: "taskAssigned", label: "Task assigned to me" },
                    ].map(function (_a) {
                        var _b;
                        var key = _a.key, label = _a.label;
                        return (React.createElement("div", { key: key, className: "flex items-center justify-between" },
                            React.createElement(label_1.Label, { className: "font-normal" }, label),
                            React.createElement(switch_1.Switch, { checked: (_b = notifyPrefs[key]) !== null && _b !== void 0 ? _b : false, onCheckedChange: function (c) { return setNotifyPrefs(function (p) {
                                    var _a;
                                    return (__assign(__assign({}, p), (_a = {}, _a[key] = c, _a)));
                                }); } })));
                    })),
                    React.createElement(SaveButton, { saving: !!saving.notify, onClick: function () { return save("notify", function () { return mutationHelpers_1["default"](updateNotifyMutation, {
                            invoiceDue: notifyPrefs.invoiceDue,
                            paymentReceived: notifyPrefs.paymentReceived,
                            newClient: notifyPrefs.newClient,
                            companyAnnouncement: notifyPrefs.companyAnnouncement
                        }); }); } })));
            // ── ROLES ─────────────────────────────────────────────────────────────
            case "roles":
                return (React.createElement(Section, { title: "User Roles & Permissions", description: "Manage roles and what each role can access" },
                    React.createElement("p", { className: "text-sm text-muted-foreground" },
                        "Role management is available in ",
                        React.createElement("strong", null, "Admin \u2192 Roles & Permissions"),
                        ". Changes take effect on the user's next login."),
                    React.createElement("div", { className: "flex gap-3 flex-wrap" },
                        React.createElement(button_1.Button, { variant: "outline", onClick: function () { return navigate("/admin/roles"); } },
                            React.createElement(lucide_react_1.ArrowUpRight, { className: "mr-2 h-4 w-4" }),
                            " Open Roles & Permissions"),
                        React.createElement(button_1.Button, { variant: "outline", onClick: function () { return navigate("/tools/permissions"); } },
                            React.createElement(lucide_react_1.Shield, { className: "mr-2 h-4 w-4" }),
                            " Advanced Permissions Matrix"))));
            // ── BACKUP ────────────────────────────────────────────────────────────
            case "backup":
                return (React.createElement(Section, { title: "Backup & Restore", description: "Download or restore a system backup" },
                    React.createElement(BackupRestore_1["default"], null)));
            // ── CSV IMPORT/EXPORT ─────────────────────────────────────────────────
            case "csvimport":
                return (React.createElement(Section, { title: "CSV Import / Export", description: "Bulk import records or export data as CSV" },
                    React.createElement(CSVImportExport_1["default"], null)));
            // ── CURRENCY ──────────────────────────────────────────────────────────
            case "currency":
                return (React.createElement(Section, { title: "Currency Settings", description: "Configure default currency and number formatting" },
                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                        React.createElement(Field, { label: "Default Currency" },
                            React.createElement(select_1.Select, { value: currency.defaultCurrency, onValueChange: function (v) { return setCurrency(function (p) { return (__assign(__assign({}, p), { defaultCurrency: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "KES" }, "KES \u2013 Kenyan Shilling"),
                                    React.createElement(select_1.SelectItem, { value: "USD" }, "USD \u2013 US Dollar"),
                                    React.createElement(select_1.SelectItem, { value: "EUR" }, "EUR \u2013 Euro"),
                                    React.createElement(select_1.SelectItem, { value: "GBP" }, "GBP \u2013 British Pound"),
                                    React.createElement(select_1.SelectItem, { value: "NGN" }, "NGN \u2013 Nigerian Naira"),
                                    React.createElement(select_1.SelectItem, { value: "ZAR" }, "ZAR \u2013 South African Rand"),
                                    React.createElement(select_1.SelectItem, { value: "TZS" }, "TZS \u2013 Tanzanian Shilling"),
                                    React.createElement(select_1.SelectItem, { value: "UGX" }, "UGX \u2013 Ugandan Shilling"),
                                    React.createElement(select_1.SelectItem, { value: "GHS" }, "GHS \u2013 Ghanaian Cedi"),
                                    React.createElement(select_1.SelectItem, { value: "INR" }, "INR \u2013 Indian Rupee")))),
                        React.createElement(Field, { label: "Symbol Position" },
                            React.createElement(select_1.Select, { value: currency.symbolPosition, onValueChange: function (v) { return setCurrency(function (p) { return (__assign(__assign({}, p), { symbolPosition: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "before" }, "Before amount ($ 100)"),
                                    React.createElement(select_1.SelectItem, { value: "after" }, "After amount (100 $)")))),
                        React.createElement(Field, { label: "Thousands Separator" },
                            React.createElement(select_1.Select, { value: currency.thousandsSep, onValueChange: function (v) { return setCurrency(function (p) { return (__assign(__assign({}, p), { thousandsSep: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "," }, "Comma (1,000)"),
                                    React.createElement(select_1.SelectItem, { value: "." }, "Period (1.000)"),
                                    React.createElement(select_1.SelectItem, { value: " " }, "Space (1 000)")))),
                        React.createElement(Field, { label: "Decimal Separator" },
                            React.createElement(select_1.Select, { value: currency.decimalSep, onValueChange: function (v) { return setCurrency(function (p) { return (__assign(__assign({}, p), { decimalSep: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "." }, "Period (.)"),
                                    React.createElement(select_1.SelectItem, { value: "," }, "Comma (,)")))),
                        React.createElement(Field, { label: "Decimal Places" },
                            React.createElement(select_1.Select, { value: currency.decimalPlaces, onValueChange: function (v) { return setCurrency(function (p) { return (__assign(__assign({}, p), { decimalPlaces: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "0" }, "0"),
                                    React.createElement(select_1.SelectItem, { value: "2" }, "2"),
                                    React.createElement(select_1.SelectItem, { value: "3" }, "3"))))),
                    React.createElement(SaveButton, { saving: !!saving["currency"], onClick: function () { return save("currency", function () { return updateByCategory.mutateAsync({ category: "currency", values: currency }); }); } })));
            // ── BILLING ───────────────────────────────────────────────────────────
            case "billing-account":
                return (React.createElement(Section, { title: "Billing Account", description: "Your current plan and account information" },
                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                        React.createElement(Field, { label: "Current Plan" },
                            React.createElement(input_1.Input, { value: billing.planName, readOnly: true, className: "bg-muted" })),
                        React.createElement(Field, { label: "Plan Expiry" },
                            React.createElement(input_1.Input, { value: billing.planExpiry, readOnly: true, className: "bg-muted" })),
                        React.createElement(Field, { label: "Email Quota" },
                            React.createElement(input_1.Input, { value: billing.emailQuota, readOnly: true, className: "bg-muted" })),
                        React.createElement(Field, { label: "User Limit" },
                            React.createElement(input_1.Input, { value: billing.userLimit, readOnly: true, className: "bg-muted" })))));
            case "billing-plans": {
                // Fallback to API prices or hardcoded defaults
                var apiPrices_1 = (planPriceData === null || planPriceData === void 0 ? void 0 : planPriceData.prices) || {};
                var planKeys = Object.keys(apiPrices_1);
                // Build plan cards from database tiers or API data
                var planCards = pricingTiers.length > 0
                    ? pricingTiers.map(function (tier) { return ({
                        id: tier.id,
                        name: tier.planName,
                        tier: tier.tier,
                        price: tier.monthlyPrice ? "KES " + (Number(tier.monthlyPrice) || 0).toLocaleString() + "/mo" : "Free",
                        annualPrice: tier.annualPrice ? "KES " + (Number(tier.annualPrice) || 0).toLocaleString() + "/yr" : undefined,
                        features: tier.features || [],
                        maxUsers: tier.maxUsers,
                        key: tier.planSlug
                    }); })
                    : planKeys.length > 0
                        ? planKeys.map(function (key) {
                            var p = apiPrices_1[key];
                            return {
                                name: p.label || key.charAt(0).toUpperCase() + key.slice(1),
                                price: p.monthlyKes ? "KES " + (p.monthlyKes / 100).toLocaleString() + "/mo" : "Free",
                                annualPrice: p.annualKes ? "KES " + (p.annualKes / 100).toLocaleString() + "/yr" : undefined,
                                features: __spreadArrays([
                                    (p.maxUsers || "Unlimited") + " Users"
                                ], (p.description ? [p.description] : [])),
                                key: key
                            };
                        })
                        : [
                            { name: "Trial", price: "Free", features: ["5 Users", "14-day evaluation"], key: "trial", maxUsers: 5 },
                            { name: "Starter", price: "KES 5,999/mo", features: ["10 Users", "Core business tools"], key: "starter", maxUsers: 10 },
                            { name: "Gold", price: "KES 9,999/mo", features: ["50 Users", "Extended features"], key: "gold", maxUsers: 50 },
                            { name: "Professional", price: "KES 18,999/mo", features: ["100 Users", "Full operations suite"], key: "professional", maxUsers: 100 },
                            { name: "Enterprise", price: "KES 49,999/mo", features: ["500 Users", "All modules + priority support"], key: "enterprise", maxUsers: 500 },
                        ];
                return (React.createElement(Section, { title: "Available Plans", description: "Plans are managed by your platform administrator. Upgrade or change your subscription plan." }, tiersLoading ? (React.createElement("div", { className: "flex items-center justify-center p-8" },
                    React.createElement(spinner_1.Spinner, { className: "mr-2" }),
                    React.createElement("span", null, "Loading pricing plans..."))) : (React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" }, planCards.map(function (plan) { return (React.createElement(card_1.Card, { key: plan.key, className: plan.name.toLowerCase() === billing.planName.toLowerCase() ? "border-primary ring-2 ring-primary/20" : "" },
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "text-lg" }, plan.name),
                        React.createElement(card_1.CardDescription, { className: "text-xl font-bold" }, plan.price),
                        plan.annualPrice && (React.createElement("p", { className: "text-xs text-muted-foreground" }, plan.annualPrice)),
                        plan.maxUsers && (React.createElement("p", { className: "text-xs text-slate-600 dark:text-slate-400 mt-2" },
                            plan.maxUsers === -1 ? "Unlimited" : plan.maxUsers,
                            " users"))),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("ul", { className: "space-y-1 text-sm" }, (Array.isArray(plan.features) ? plan.features : __spreadArrays([
                            (plan.maxUsers || "Unlimited") + " Users"
                        ], (plan.features ? [plan.features] : []))).map(function (f) { return (React.createElement("li", { key: f, className: "flex items-center gap-2" },
                            React.createElement(lucide_react_1.CheckSquare, { className: "h-3 w-3 text-green-500" }),
                            typeof f === 'object' ? f.name || JSON.stringify(f) : f)); })),
                        React.createElement(button_1.Button, { variant: plan.name.toLowerCase() === billing.planName.toLowerCase() ? "secondary" : "default", className: "w-full mt-4", disabled: plan.name.toLowerCase() === billing.planName.toLowerCase(), onClick: function () { return sonner_1.toast.info("Plan upgrade to " + plan.name + " \u2014 contact your administrator"); } }, plan.name.toLowerCase() === billing.planName.toLowerCase() ? "Current Plan" : "Upgrade")))); })))));
            }
            case "billing-payments":
                return (React.createElement(Section, { title: "Payment History", description: "View past invoices and payments" },
                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "No payment history available.")));
            case "billing-notices":
                return (React.createElement(Section, { title: "Billing Notices", description: "Notifications about your billing and subscription" },
                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "No billing notices at this time.")));
            // ── EMAIL EXTENDED ────────────────────────────────────────────────────
            case "email-templates": {
                var EMAIL_TEMPLATE_GROUPS = {
                    contracts: { label: "Contracts", templates: [
                            { id: "contract-new-client", name: "New Contract - (Client)", subject: "New Contract - #{contract_id}", body: "<h2>New Contract</h2><p>Hi {first_name},</p><p>A new contract has been created for you.</p>", vars: ["first_name", "last_name", "contract_id", "contract_subject", "contract_value", "contract_start_date", "contract_end_date", "client_name", "client_id"] },
                            { id: "contract-signed-team", name: "Contract Signed - (Team)", subject: "Contract Signed - #{contract_id}", body: "<h2>Contract Signed</h2><p>Hi {first_name},</p><p>A contract has been signed by the client.</p>", vars: ["first_name", "last_name", "contract_id", "contract_subject", "client_name"] },
                        ] },
                    estimates: { label: "Estimates", templates: [
                            { id: "estimate-new-client", name: "New Estimate - (Client)", subject: "New Estimate - #{estimate_id}", body: "<h2>New Estimate</h2><p>Hi {first_name},</p><p>A new estimate has been prepared for you.</p>", vars: ["first_name", "last_name", "estimate_id", "estimate_amount", "estimate_date", "client_name", "client_id"] },
                            { id: "estimate-accepted-team", name: "Estimate Accepted - (Team)", subject: "Estimate Accepted - #{estimate_id}", body: "<h2>Estimate Accepted</h2><p>Hi {first_name},</p><p>An estimate has been accepted.</p>", vars: ["first_name", "last_name", "estimate_id", "estimate_amount", "client_name"] },
                            { id: "estimate-declined-team", name: "Estimate Declined - (Team)", subject: "Estimate Declined - #{estimate_id}", body: "<h2>Estimate Declined</h2><p>Hi {first_name},</p><p>An estimate has been declined.</p>", vars: ["first_name", "last_name", "estimate_id", "client_name"] },
                            { id: "estimate-revised-client", name: "Estimate Revised - (Client)", subject: "Estimate Revised - #{estimate_id}", body: "<h2>Estimate Revised</h2><p>Hi {first_name},</p><p>Your estimate has been revised.</p>", vars: ["first_name", "last_name", "estimate_id", "estimate_amount", "client_name"] },
                        ] },
                    financial: { label: "Financial", templates: [
                            { id: "invoice-new-client", name: "New Invoice - (Client)", subject: "New Invoice - #{invoice_id}", body: "<h2>New Invoice</h2><p>Hi {first_name},</p><p>Please find attached your invoice.</p>", vars: ["first_name", "last_name", "invoice_id", "invoice_amount", "invoice_amount_due", "invoice_date_created", "invoice_date_due", "project_title", "project_id", "client_name", "client_id", "invoice_status", "invoice_url"] },
                            { id: "invoice-reminder-client", name: "Invoice Reminder - (Client)", subject: "Invoice Reminder - #{invoice_id}", body: "<h2>Invoice Reminder</h2><p>Hi {first_name},</p><p>This is a reminder about your outstanding invoice.</p>", vars: ["first_name", "last_name", "invoice_id", "invoice_amount", "invoice_amount_due", "invoice_date_due", "client_name", "invoice_url"] },
                            { id: "payment-thankyou-client", name: "Thank You For Payment - (Client)", subject: "Payment Received - Thank You", body: "<h2>Thank You</h2><p>Hi {first_name},</p><p>Thank you for your payment.</p>", vars: ["first_name", "last_name", "invoice_id", "payment_amount", "client_name"] },
                            { id: "payment-new-team", name: "New Payment - (Team)", subject: "New Payment Received - #{invoice_id}", body: "<h2>New Payment</h2><p>Hi {first_name},</p><p>A new payment has been received.</p>", vars: ["first_name", "last_name", "invoice_id", "payment_amount", "client_name"] },
                        ] },
                    leads: { label: "Leads", templates: [
                            { id: "lead-status-team", name: "Lead Status Change - (Team)", subject: "Lead Status Changed", body: "<p>Hi {first_name},</p><p>A lead status has been updated.</p>", vars: ["first_name", "last_name", "lead_name", "lead_status", "lead_value"] },
                            { id: "lead-comment-team", name: "Lead Comment - (Team)", subject: "New Lead Comment", body: "<p>Hi {first_name},</p><p>A new comment was added to a lead.</p>", vars: ["first_name", "last_name", "lead_name", "comment"] },
                            { id: "lead-assignment-team", name: "Lead Assignment - (Team)", subject: "Lead Assigned To You", body: "<p>Hi {first_name},</p><p>A lead has been assigned to you.</p>", vars: ["first_name", "last_name", "lead_name", "lead_value"] },
                            { id: "lead-file-team", name: "Lead File Uploaded - (Team)", subject: "File Uploaded To Lead", body: "<p>Hi {first_name},</p><p>A file was uploaded to a lead.</p>", vars: ["first_name", "last_name", "lead_name", "file_name"] },
                            { id: "lead-webform-team", name: "New Web Form Submitted - (Team)", subject: "New Web Form Submission", body: "<p>Hi {first_name},</p><p>A new web form has been submitted.</p>", vars: ["first_name", "last_name", "lead_name", "lead_email"] },
                        ] },
                    projects: { label: "Projects", templates: [
                            { id: "project-new-client", name: "New Project Created - (Client)", subject: "New Project - {project_title}", body: "<h2>New Project</h2><p>Hi {first_name},</p><p>A new project has been created for you.</p>", vars: ["first_name", "last_name", "project_title", "project_id", "client_name"] },
                            { id: "project-status-client", name: "Project Status Change - (Client)", subject: "Project Status Updated", body: "<p>Hi {first_name},</p><p>Your project status has been updated.</p>", vars: ["first_name", "last_name", "project_title", "project_status"] },
                            { id: "project-file-all", name: "Project File Uploaded - (All)", subject: "File Uploaded To Project", body: "<p>Hi {first_name},</p><p>A file was uploaded to a project.</p>", vars: ["first_name", "last_name", "project_title", "file_name"] },
                            { id: "project-comment-all", name: "Project Comment - (All)", subject: "New Project Comment", body: "<p>Hi {first_name},</p><p>A new comment was added to a project.</p>", vars: ["first_name", "last_name", "project_title", "comment"] },
                            { id: "project-assignment-team", name: "Project Assignment - (Team)", subject: "Project Assigned To You", body: "<p>Hi {first_name},</p><p>You have been assigned to a project.</p>", vars: ["first_name", "last_name", "project_title", "project_id"] },
                        ] },
                    proposals: { label: "Proposals", templates: [
                            { id: "proposal-new-client", name: "New Proposal - (Client)", subject: "New Proposal - #{proposal_id}", body: "<h2>New Proposal</h2><p>Hi {first_name},</p><p>A new proposal has been created for you.</p>", vars: ["first_name", "last_name", "proposal_id", "proposal_subject", "proposal_total", "client_name"] },
                            { id: "proposal-accepted-team", name: "Proposal Accepted - (Team)", subject: "Proposal Accepted", body: "<p>Hi {first_name},</p><p>A proposal has been accepted.</p>", vars: ["first_name", "last_name", "proposal_id", "client_name"] },
                            { id: "proposal-declined-team", name: "Proposal Decline - (Team)", subject: "Proposal Declined", body: "<p>Hi {first_name},</p><p>A proposal has been declined.</p>", vars: ["first_name", "last_name", "proposal_id", "client_name"] },
                            { id: "proposal-revised-client", name: "Proposal Revised - (Client)", subject: "Proposal Revised - #{proposal_id}", body: "<p>Hi {first_name},</p><p>Your proposal has been revised.</p>", vars: ["first_name", "last_name", "proposal_id", "proposal_total", "client_name"] },
                        ] },
                    subscriptions: { label: "Subscriptions", templates: [
                            { id: "sub-new-client", name: "New Subscription Created - (Client)", subject: "New Subscription Created", body: "<p>Hi {first_name},</p><p>A new subscription has been created.</p>", vars: ["first_name", "last_name", "subscription_name", "subscription_amount"] },
                            { id: "sub-renewal-failed-client", name: "Subscription Renewal Failed - (Client)", subject: "Subscription Renewal Failed", body: "<p>Hi {first_name},</p><p>Your subscription renewal failed.</p>", vars: ["first_name", "last_name", "subscription_name"] },
                            { id: "sub-renewed-client", name: "Subscription Renewed - (Client)", subject: "Subscription Renewed", body: "<p>Hi {first_name},</p><p>Your subscription has been renewed.</p>", vars: ["first_name", "last_name", "subscription_name", "subscription_amount"] },
                            { id: "sub-started-client", name: "Subscription Started - (Client)", subject: "Subscription Started", body: "<p>Hi {first_name},</p><p>Your subscription has started.</p>", vars: ["first_name", "last_name", "subscription_name"] },
                        ] },
                    system: { label: "System", templates: [
                            { id: "system-notification", name: "System Notification", subject: "System Notification", body: "<p>Hi {first_name},</p><p>{message}</p>", vars: ["first_name", "last_name", "message"] },
                        ] },
                    tasks: { label: "Tasks", templates: [
                            { id: "task-status-all", name: "Task Status Change - (All)", subject: "Task Status Changed", body: "<p>Hi {first_name},</p><p>A task status has been updated.</p>", vars: ["first_name", "last_name", "task_name", "task_status", "project_title"] },
                            { id: "task-assignment-all", name: "Task Assignment - (All)", subject: "Task Assigned To You", body: "<p>Hi {first_name},</p><p>A task has been assigned to you.</p>", vars: ["first_name", "last_name", "task_name", "project_title", "task_due_date"] },
                            { id: "task-file-all", name: "Task File Uploaded - (All)", subject: "File Uploaded To Task", body: "<p>Hi {first_name},</p><p>A file was uploaded to a task.</p>", vars: ["first_name", "last_name", "task_name", "file_name"] },
                            { id: "task-comment-all", name: "Task Comment - (All)", subject: "New Task Comment", body: "<p>Hi {first_name},</p><p>A new comment was added to a task.</p>", vars: ["first_name", "last_name", "task_name", "comment"] },
                            { id: "task-overdue-team", name: "Task Overdue - (Team)", subject: "Task Overdue", body: "<p>Hi {first_name},</p><p>A task is overdue.</p>", vars: ["first_name", "last_name", "task_name", "task_due_date", "project_title"] },
                        ] },
                    tickets: { label: "Tickets", templates: [
                            { id: "ticket-new-all", name: "New Ticket - (All)", subject: "New Ticket - #{ticket_id}", body: "<p>Hi {first_name},</p><p>A new ticket has been created.</p>", vars: ["first_name", "last_name", "ticket_id", "ticket_subject", "ticket_department"] },
                            { id: "ticket-reply-all", name: "New Ticket Reply - (All)", subject: "New Ticket Reply - #{ticket_id}", body: "<p>Hi {first_name},</p><p>A new reply was added to a ticket.</p>", vars: ["first_name", "last_name", "ticket_id", "ticket_subject", "reply_message"] },
                            { id: "ticket-closed-client", name: "Ticket Closed - (Client)", subject: "Ticket Closed - #{ticket_id}", body: "<p>Hi {first_name},</p><p>Your ticket has been closed.</p>", vars: ["first_name", "last_name", "ticket_id", "ticket_subject"] },
                        ] },
                    users: { label: "Users", templates: [
                            { id: "user-welcome-all", name: "New User Welcome - (All)", subject: "Welcome to {our_company_name}", body: "<h2>Welcome!</h2><p>Hi {first_name},</p><p>Your account has been created.</p>", vars: ["first_name", "last_name", "email", "dashboard_url"] },
                            { id: "user-reset-all", name: "Reset Password Request - (All)", subject: "Password Reset Request", body: "<p>Hi {first_name},</p><p>A password reset was requested for your account.</p>", vars: ["first_name", "last_name", "reset_url"] },
                        ] },
                    other: { label: "Other", templates: [
                            { id: "email-signature-all", name: "Email Signature - (All)", subject: "", body: "<p>Best regards,<br/>{our_company_name}</p>", vars: ["our_company_name", "dashboard_url"] },
                            { id: "email-footer-all", name: "Email Footer - (All)", subject: "", body: "<p style='font-size:12px;color:#666;'>© {our_company_name}. All rights reserved.</p>", vars: ["our_company_name", "todays_date"] },
                            { id: "reminder-all", name: "Reminder - (All)", subject: "Reminder: {reminder_title}", body: "<p>Hi {first_name},</p><p>This is a reminder: {reminder_description}.</p>", vars: ["first_name", "last_name", "reminder_title", "reminder_description"] },
                            { id: "calendar-reminder-team", name: "Calendar Reminder - (Team)", subject: "Calendar Reminder", body: "<p>Hi {first_name},</p><p>Reminder for your calendar event.</p>", vars: ["first_name", "last_name", "event_title", "event_date", "event_time"] },
                        ] }
                };
                var GENERAL_VARS = ["{our_company_name}", "{todays_date}", "{email_signature}", "{email_footer}", "{dashboard_url}"];
                var allTemplates_1 = Object.values(EMAIL_TEMPLATE_GROUPS).flatMap(function (g) { return g.templates; });
                var currentTpl = allTemplates_1.find(function (t) { return t.id === selectedTemplate; });
                return (React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("div", null,
                            React.createElement("h3", { className: "text-lg font-semibold" }, "Email Templates"),
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "APP > SETTINGS > EMAIL > EMAIL TEMPLATES")),
                        React.createElement(select_1.Select, { value: selectedTemplate, onValueChange: function (v) { return __awaiter(_this, void 0, void 0, function () {
                                var tpl, saved, _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            setSelectedTemplate(v);
                                            tpl = allTemplates_1.find(function (t) { return t.id === v; });
                                            _b.label = 1;
                                        case 1:
                                            _b.trys.push([1, 3, , 4]);
                                            return [4 /*yield*/, utils.settings.getByCategory.fetch({ category: "email_template:" + v })];
                                        case 2:
                                            saved = _b.sent();
                                            if (saved && (saved.subject || saved.body)) {
                                                setTemplateSubject(saved.subject || (tpl === null || tpl === void 0 ? void 0 : tpl.subject) || "");
                                                setTemplateBody(saved.body || (tpl === null || tpl === void 0 ? void 0 : tpl.body) || "");
                                                return [2 /*return*/];
                                            }
                                            return [3 /*break*/, 4];
                                        case 3:
                                            _a = _b.sent();
                                            return [3 /*break*/, 4];
                                        case 4:
                                            if (tpl) {
                                                setTemplateSubject(tpl.subject);
                                                setTemplateBody(tpl.body);
                                            }
                                            return [2 /*return*/];
                                    }
                                });
                            }); } },
                            React.createElement(select_1.SelectTrigger, { className: "w-[300px]" },
                                React.createElement(select_1.SelectValue, { placeholder: "Select A Template" })),
                            React.createElement(select_1.SelectContent, null, Object.entries(EMAIL_TEMPLATE_GROUPS).map(function (_a) {
                                var key = _a[0], group = _a[1];
                                return (React.createElement("div", { key: key },
                                    React.createElement("div", { className: "px-2 py-1.5 text-xs font-bold text-muted-foreground" },
                                        "[ ",
                                        group.label,
                                        " ]"),
                                    group.templates.map(function (tpl) { return (React.createElement(select_1.SelectItem, { key: tpl.id, value: tpl.id }, tpl.name)); })));
                            })))),
                    !currentTpl ? (React.createElement(card_1.Card, { className: "py-16" },
                        React.createElement(card_1.CardContent, { className: "flex flex-col items-center justify-center text-center" },
                            React.createElement(lucide_react_1.Mail, { className: "h-16 w-16 text-muted-foreground mb-4" }),
                            React.createElement("h4", { className: "text-lg font-medium" }, "Select an email template from the dropdown menu")))) : (React.createElement("div", { className: "grid grid-cols-[1fr_280px] gap-4" },
                        React.createElement("div", { className: "space-y-4" },
                            React.createElement(Field, { label: "Subject" },
                                React.createElement(input_1.Input, { value: templateSubject, onChange: function (e) { return setTemplateSubject(e.target.value); }, placeholder: "Email subject line" })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement("label", { className: "text-sm font-medium" }, "Email Body"),
                                React.createElement(tabs_1.Tabs, { defaultValue: "visual", className: "w-full" },
                                    React.createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-3" },
                                        React.createElement(tabs_1.TabsTrigger, { value: "visual" }, "Visual Editor"),
                                        React.createElement(tabs_1.TabsTrigger, { value: "html" }, "HTML Editor"),
                                        React.createElement(tabs_1.TabsTrigger, { value: "preview" }, "Preview")),
                                    React.createElement(tabs_1.TabsContent, { value: "visual", className: "space-y-2" },
                                        React.createElement(RichTextEditor_1.RichTextEditor, { value: templateBody, onChange: setTemplateBody, minHeight: "300px" })),
                                    React.createElement(tabs_1.TabsContent, { value: "html", className: "space-y-2" },
                                        React.createElement(textarea_1.Textarea, { value: templateBody, onChange: function (e) { return setTemplateBody(e.target.value); }, placeholder: "<p>Enter HTML content here</p>", className: "font-mono text-xs", rows: 12 })),
                                    React.createElement(tabs_1.TabsContent, { value: "preview", className: "space-y-2" },
                                        React.createElement("div", { className: "border rounded-lg p-4 bg-white text-black min-h-[300px] overflow-auto prose prose-sm max-w-none", dangerouslySetInnerHTML: { __html: templateBody } })))),
                            React.createElement(SaveButton, { saving: !!saving["email-templates"], onClick: function () { return save("email-templates", function () { return updateByCategory.mutateAsync({ category: "email_template:" + selectedTemplate, values: { subject: templateSubject, body: templateBody } }); }); } })),
                        React.createElement("div", { className: "space-y-4" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, { className: "pb-2" },
                                    React.createElement(card_1.CardTitle, { className: "text-sm" }, "Template Variables")),
                                React.createElement(card_1.CardContent, { className: "space-y-1" }, currentTpl.vars.map(function (v) { return React.createElement("div", { key: v, className: "text-xs font-mono text-muted-foreground cursor-pointer hover:text-primary", onClick: function () { setTemplateBody(function (prev) { return prev + ("{" + v + "}"); }); } }, "{" + v + "}"); }))),
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, { className: "pb-2" },
                                    React.createElement(card_1.CardTitle, { className: "text-sm" }, "General Variables")),
                                React.createElement(card_1.CardContent, { className: "space-y-1" }, GENERAL_VARS.map(function (v) { return React.createElement("div", { key: v, className: "text-xs font-mono text-muted-foreground cursor-pointer hover:text-primary", onClick: function () { setTemplateBody(function (prev) { return prev + v; }); } }, v); }))))))));
            }
            case "email-queue":
                return (React.createElement(Section, { title: "Email Queue", description: "Emails pending delivery" },
                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "No emails currently in queue.")));
            case "email-log":
                return (React.createElement(Section, { title: "Email Log", description: "History of sent emails" },
                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "Email log is empty. Sent emails will appear here.")));
            // ── CLIENTS ───────────────────────────────────────────────────────────
            case "clients-general":
                return (React.createElement(Section, { title: "Client Settings", description: "Configure client portal and registration options" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Allow Self-Registration"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Clients can create their own portal accounts")),
                            React.createElement(switch_1.Switch, { checked: clientsGeneral.allowRegistration, onCheckedChange: function (v) { return setClientsGeneral(function (p) { return (__assign(__assign({}, p), { allowRegistration: v })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Require Admin Approval"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "New registrations must be approved before access")),
                            React.createElement(switch_1.Switch, { checked: clientsGeneral.requireApproval, onCheckedChange: function (v) { return setClientsGeneral(function (p) { return (__assign(__assign({}, p), { requireApproval: v })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Show Portal Login"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Display login link on public-facing pages")),
                            React.createElement(switch_1.Switch, { checked: clientsGeneral.showPortalLogin, onCheckedChange: function (v) { return setClientsGeneral(function (p) { return (__assign(__assign({}, p), { showPortalLogin: v })); }); } })),
                        React.createElement(Field, { label: "Client Portal URL" },
                            React.createElement(input_1.Input, { value: clientsGeneral.portalUrl, onChange: function (e) { return setClientsGeneral(function (p) { return (__assign(__assign({}, p), { portalUrl: e.target.value })); }); }, placeholder: "https://portal.company.com" }))),
                    React.createElement(SaveButton, { saving: !!saving["clients-general"], onClick: function () { return save("clients-general", function () { return updateByCategory.mutateAsync({ category: "clients_general", values: __assign(__assign({}, clientsGeneral), { allowRegistration: String(clientsGeneral.allowRegistration), requireApproval: String(clientsGeneral.requireApproval), showPortalLogin: String(clientsGeneral.showPortalLogin) }) }); }); } })));
            case "clients-categories":
                return (React.createElement(Section, { title: "Client Categories", description: "Organize clients into categories" },
                    React.createElement("div", { className: "space-y-2" }, clientsCategories.map(function (cat) { return (React.createElement("div", { key: cat.id, className: "flex items-center justify-between p-2 border rounded" },
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("div", { className: "h-3 w-3 rounded-full", style: { backgroundColor: cat.color } }),
                            React.createElement("span", { className: "text-sm" }, cat.name)),
                        React.createElement("button", { onClick: function () { var u = clientsCategories.filter(function (c) { return c.id !== cat.id; }); setClientsCategories(u); updateByCategory.mutate({ category: "clients_categories", values: { list: JSON.stringify(u) } }); }, className: "text-destructive hover:text-destructive/80" },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); })),
                    React.createElement("div", { className: "flex gap-2 items-end mt-3" },
                        React.createElement(Field, { label: "Name" },
                            React.createElement(input_1.Input, { value: newClientsCat.name, onChange: function (e) { return setNewClientsCat(function (p) { return (__assign(__assign({}, p), { name: e.target.value })); }); }, placeholder: "Category name" })),
                        React.createElement(Field, { label: "Color" },
                            React.createElement("input", { type: "color", value: newClientsCat.color, onChange: function (e) { return setNewClientsCat(function (p) { return (__assign(__assign({}, p), { color: e.target.value })); }); }, className: "h-9 w-14 cursor-pointer rounded border border-input p-1" })),
                        React.createElement(button_1.Button, { size: "sm", onClick: function () { if (!newClientsCat.name) {
                                sonner_1.toast.error("Name required");
                                return;
                            } var u = __spreadArrays(clientsCategories, [__assign({ id: crypto.randomUUID() }, newClientsCat)]); setClientsCategories(u); setNewClientsCat({ name: "", color: "#3b82f6" }); updateByCategory.mutate({ category: "clients_categories", values: { list: JSON.stringify(u) } }); } },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                            "Add"))));
            case "clients-email-templates": {
                var CLIENT_EMAIL_TEMPLATES = {
                    onboarding: { label: "Onboarding", templates: [
                            { id: "client-welcome", name: "Client Welcome - (Client)", subject: "Welcome to {our_company_name}", body: "<h2>Welcome!</h2><p>Hi {first_name},</p><p>Thank you for choosing {our_company_name}. We're excited to have you on board.</p><p>You can access your client portal at any time using the link below.</p><p><a href=\"{dashboard_url}\">Go to Client Portal</a></p>", vars: ["first_name", "last_name", "client_name", "client_id", "dashboard_url"] },
                            { id: "client-portal-access", name: "Client Portal Access - (Client)", subject: "Your Portal Access Credentials", body: "<h2>Portal Access</h2><p>Hi {first_name},</p><p>Your client portal account has been set up. Here are your login details:</p><p><strong>Email:</strong> {email}<br/><strong>Portal URL:</strong> <a href=\"{dashboard_url}\">{dashboard_url}</a></p><p>Please change your password upon first login.</p>", vars: ["first_name", "last_name", "email", "client_name", "dashboard_url"] },
                        ] },
                    billing: { label: "Billing", templates: [
                            { id: "client-invoice", name: "Client Invoice - (Client)", subject: "Invoice #{invoice_id} from {our_company_name}", body: "<h2>Invoice</h2><p>Hi {first_name},</p><p>Please find your invoice details below:</p><table><tr><th>Invoice #</th><th>Amount</th><th>Due Date</th><th>Status</th></tr><tr><td>{invoice_id}</td><td>{invoice_amount}</td><td>{invoice_date_due}</td><td>{invoice_status}</td></tr></table><p>Please make payment before the due date.</p><p><a href=\"{invoice_url}\">View & Pay Invoice</a></p>", vars: ["first_name", "last_name", "client_name", "invoice_id", "invoice_amount", "invoice_amount_due", "invoice_date_due", "invoice_status", "invoice_url"] },
                            { id: "client-statement", name: "Client Statement - (Client)", subject: "Account Statement from {our_company_name}", body: "<h2>Account Statement</h2><p>Hi {first_name},</p><p>Please find your account statement for the period <strong>{statement_from}</strong> to <strong>{statement_to}</strong>.</p><p><strong>Total Invoiced:</strong> {total_invoiced}<br/><strong>Total Paid:</strong> {total_paid}<br/><strong>Balance Due:</strong> {balance_due}</p><p>If you have any questions, please don't hesitate to reach out.</p>", vars: ["first_name", "last_name", "client_name", "statement_from", "statement_to", "total_invoiced", "total_paid", "balance_due"] },
                            { id: "client-payment-receipt", name: "Payment Receipt - (Client)", subject: "Payment Receipt - {our_company_name}", body: "<h2>Payment Receipt</h2><p>Hi {first_name},</p><p>We have received your payment. Thank you!</p><table><tr><th>Invoice #</th><th>Amount Paid</th><th>Payment Date</th><th>Method</th></tr><tr><td>{invoice_id}</td><td>{payment_amount}</td><td>{payment_date}</td><td>{payment_method}</td></tr></table>", vars: ["first_name", "last_name", "client_name", "invoice_id", "payment_amount", "payment_date", "payment_method"] },
                            { id: "client-overdue-notice", name: "Overdue Notice - (Client)", subject: "Overdue Invoice #{invoice_id}", body: "<h2>Overdue Notice</h2><p>Hi {first_name},</p><p>This is a reminder that invoice <strong>#{invoice_id}</strong> for <strong>{invoice_amount}</strong> was due on <strong>{invoice_date_due}</strong> and is now overdue.</p><p>Please arrange payment at your earliest convenience.</p><p><a href=\"{invoice_url}\">Pay Now</a></p>", vars: ["first_name", "last_name", "client_name", "invoice_id", "invoice_amount", "invoice_date_due", "invoice_url"] },
                        ] },
                    updates: { label: "Updates", templates: [
                            { id: "client-project-update", name: "Project Update - (Client)", subject: "Project Update: {project_title}", body: "<p>Hi {first_name},</p><p>Here is an update on your project <strong>{project_title}</strong>:</p><p><strong>Status:</strong> {project_status}<br/><strong>Progress:</strong> {project_progress}%</p><p>{update_message}</p>", vars: ["first_name", "last_name", "client_name", "project_title", "project_status", "project_progress", "update_message"] },
                            { id: "client-contract-renewal", name: "Contract Renewal - (Client)", subject: "Contract Renewal Reminder", body: "<p>Hi {first_name},</p><p>Your contract <strong>#{contract_id}</strong> is due for renewal on <strong>{contract_end_date}</strong>.</p><p>Please review the terms and let us know if you'd like to renew.</p>", vars: ["first_name", "last_name", "client_name", "contract_id", "contract_end_date", "contract_value"] },
                        ] }
                };
                var CLIENT_GENERAL_VARS = ["{our_company_name}", "{todays_date}", "{email_signature}", "{email_footer}", "{dashboard_url}"];
                var allClientTpls_1 = Object.values(CLIENT_EMAIL_TEMPLATES).flatMap(function (g) { return g.templates; });
                var currentClientTpl = allClientTpls_1.find(function (t) { return t.id === selectedClientTpl; });
                return (React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("div", null,
                            React.createElement("h3", { className: "text-lg font-semibold" }, "Client Email Templates"),
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "APP > SETTINGS > CLIENTS > EMAIL TEMPLATES")),
                        React.createElement(select_1.Select, { value: selectedClientTpl, onValueChange: function (v) { return __awaiter(_this, void 0, void 0, function () {
                                var tpl, saved, _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            setSelectedClientTpl(v);
                                            tpl = allClientTpls_1.find(function (t) { return t.id === v; });
                                            _b.label = 1;
                                        case 1:
                                            _b.trys.push([1, 3, , 4]);
                                            return [4 /*yield*/, utils.settings.getByCategory.fetch({ category: "email_template:" + v })];
                                        case 2:
                                            saved = _b.sent();
                                            if (saved && (saved.subject || saved.body)) {
                                                setClientTplSubject(saved.subject || (tpl === null || tpl === void 0 ? void 0 : tpl.subject) || "");
                                                setClientTplBody(saved.body || (tpl === null || tpl === void 0 ? void 0 : tpl.body) || "");
                                                return [2 /*return*/];
                                            }
                                            return [3 /*break*/, 4];
                                        case 3:
                                            _a = _b.sent();
                                            return [3 /*break*/, 4];
                                        case 4:
                                            if (tpl) {
                                                setClientTplSubject(tpl.subject);
                                                setClientTplBody(tpl.body);
                                            }
                                            return [2 /*return*/];
                                    }
                                });
                            }); } },
                            React.createElement(select_1.SelectTrigger, { className: "w-[300px]" },
                                React.createElement(select_1.SelectValue, { placeholder: "Select A Template" })),
                            React.createElement(select_1.SelectContent, null, Object.entries(CLIENT_EMAIL_TEMPLATES).map(function (_a) {
                                var key = _a[0], group = _a[1];
                                return (React.createElement("div", { key: key },
                                    React.createElement("div", { className: "px-2 py-1.5 text-xs font-bold text-muted-foreground" },
                                        "[ ",
                                        group.label,
                                        " ]"),
                                    group.templates.map(function (tpl) { return (React.createElement(select_1.SelectItem, { key: tpl.id, value: tpl.id }, tpl.name)); })));
                            })))),
                    !currentClientTpl ? (React.createElement(card_1.Card, { className: "py-16" },
                        React.createElement(card_1.CardContent, { className: "flex flex-col items-center justify-center text-center" },
                            React.createElement(lucide_react_1.Mail, { className: "h-16 w-16 text-muted-foreground mb-4" }),
                            React.createElement("h4", { className: "text-lg font-medium" }, "Select a client email template from the dropdown")))) : (React.createElement("div", { className: "grid grid-cols-[1fr_280px] gap-4" },
                        React.createElement("div", { className: "space-y-4" },
                            React.createElement(Field, { label: "Subject" },
                                React.createElement(input_1.Input, { value: clientTplSubject, onChange: function (e) { return setClientTplSubject(e.target.value); }, placeholder: "Email subject line" })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement("label", { className: "text-sm font-medium" }, "Email Body"),
                                React.createElement(tabs_1.Tabs, { defaultValue: "visual", className: "w-full" },
                                    React.createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-3" },
                                        React.createElement(tabs_1.TabsTrigger, { value: "visual" }, "Visual Editor"),
                                        React.createElement(tabs_1.TabsTrigger, { value: "html" }, "HTML Editor"),
                                        React.createElement(tabs_1.TabsTrigger, { value: "preview" }, "Preview")),
                                    React.createElement(tabs_1.TabsContent, { value: "visual", className: "space-y-2" },
                                        React.createElement(RichTextEditor_1.RichTextEditor, { value: clientTplBody, onChange: setClientTplBody, minHeight: "300px" })),
                                    React.createElement(tabs_1.TabsContent, { value: "html", className: "space-y-2" },
                                        React.createElement(textarea_1.Textarea, { value: clientTplBody, onChange: function (e) { return setClientTplBody(e.target.value); }, placeholder: "<p>Enter HTML content here</p>", className: "font-mono text-xs", rows: 12 })),
                                    React.createElement(tabs_1.TabsContent, { value: "preview", className: "space-y-2" },
                                        React.createElement("div", { className: "border rounded-lg p-4 bg-white text-black min-h-[300px] overflow-auto prose prose-sm max-w-none", dangerouslySetInnerHTML: { __html: clientTplBody } })))),
                            React.createElement(SaveButton, { saving: !!saving["clients-email-templates"], onClick: function () { return save("clients-email-templates", function () { return updateByCategory.mutateAsync({ category: "email_template:" + selectedClientTpl, values: { subject: clientTplSubject, body: clientTplBody } }); }); } })),
                        React.createElement("div", { className: "space-y-4" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, { className: "pb-2" },
                                    React.createElement(card_1.CardTitle, { className: "text-sm" }, "Template Variables")),
                                React.createElement(card_1.CardContent, { className: "space-y-1" }, currentClientTpl.vars.map(function (v) { return React.createElement("div", { key: v, className: "text-xs font-mono text-muted-foreground cursor-pointer hover:text-primary", onClick: function () { setClientTplBody(function (prev) { return prev + ("{" + v + "}"); }); } }, "{" + v + "}"); }))),
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, { className: "pb-2" },
                                    React.createElement(card_1.CardTitle, { className: "text-sm" }, "General Variables")),
                                React.createElement(card_1.CardContent, { className: "space-y-1" }, CLIENT_GENERAL_VARS.map(function (v) { return React.createElement("div", { key: v, className: "text-xs font-mono text-muted-foreground cursor-pointer hover:text-primary", onClick: function () { setClientTplBody(function (prev) { return prev + v; }); } }, v); }))))))));
            }
            // ── PROJECTS ──────────────────────────────────────────────────────────
            case "projects-general":
                return (React.createElement(Section, { title: "Project Settings", description: "Configure default project behavior" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Allow Client Comments"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Clients can comment on project updates")),
                            React.createElement(switch_1.Switch, { checked: projectsGeneral.allowClientComments, onCheckedChange: function (v) { return setProjectsGeneral(function (p) { return (__assign(__assign({}, p), { allowClientComments: v })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Allow Client Billing Access"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Clients can view billing info for their projects")),
                            React.createElement(switch_1.Switch, { checked: projectsGeneral.allowClientBilling, onCheckedChange: function (v) { return setProjectsGeneral(function (p) { return (__assign(__assign({}, p), { allowClientBilling: v })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Notify on Task Create"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Send notification when tasks are created")),
                            React.createElement(switch_1.Switch, { checked: projectsGeneral.notifyOnTaskCreate, onCheckedChange: function (v) { return setProjectsGeneral(function (p) { return (__assign(__assign({}, p), { notifyOnTaskCreate: v })); }); } })),
                        React.createElement(Field, { label: "Default Billing Type" },
                            React.createElement(select_1.Select, { value: projectsGeneral.defaultBillingType, onValueChange: function (v) { return setProjectsGeneral(function (p) { return (__assign(__assign({}, p), { defaultBillingType: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "fixed" }, "Fixed Price"),
                                    React.createElement(select_1.SelectItem, { value: "hourly" }, "Hourly Rate"),
                                    React.createElement(select_1.SelectItem, { value: "milestone" }, "Milestone-Based"))))),
                    React.createElement(SaveButton, { saving: !!saving["projects-general"], onClick: function () { return save("projects-general", function () { return updateByCategory.mutateAsync({ category: "projects_general", values: __assign(__assign({}, projectsGeneral), { allowClientComments: String(projectsGeneral.allowClientComments), allowClientBilling: String(projectsGeneral.allowClientBilling), notifyOnTaskCreate: String(projectsGeneral.notifyOnTaskCreate) }) }); }); } })));
            case "projects-categories":
                return (React.createElement(Section, { title: "Project Categories", description: "Organize projects into categories" },
                    React.createElement("div", { className: "space-y-2" }, projectsCategories.map(function (cat) { return (React.createElement("div", { key: cat.id, className: "flex items-center justify-between p-2 border rounded" },
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("div", { className: "h-3 w-3 rounded-full", style: { backgroundColor: cat.color } }),
                            React.createElement("span", { className: "text-sm" }, cat.name)),
                        React.createElement("button", { onClick: function () { var u = projectsCategories.filter(function (c) { return c.id !== cat.id; }); setProjectsCategories(u); updateByCategory.mutate({ category: "projects_categories", values: { list: JSON.stringify(u) } }); }, className: "text-destructive hover:text-destructive/80" },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); })),
                    React.createElement("div", { className: "flex gap-2 items-end mt-3" },
                        React.createElement(Field, { label: "Name" },
                            React.createElement(input_1.Input, { value: newProjectsCat.name, onChange: function (e) { return setNewProjectsCat(function (p) { return (__assign(__assign({}, p), { name: e.target.value })); }); }, placeholder: "Category name" })),
                        React.createElement(Field, { label: "Color" },
                            React.createElement("input", { type: "color", value: newProjectsCat.color, onChange: function (e) { return setNewProjectsCat(function (p) { return (__assign(__assign({}, p), { color: e.target.value })); }); }, className: "h-9 w-14 cursor-pointer rounded border border-input p-1" })),
                        React.createElement(button_1.Button, { size: "sm", onClick: function () { if (!newProjectsCat.name) {
                                sonner_1.toast.error("Name required");
                                return;
                            } var u = __spreadArrays(projectsCategories, [__assign({ id: crypto.randomUUID() }, newProjectsCat)]); setProjectsCategories(u); setNewProjectsCat({ name: "", color: "#3b82f6" }); updateByCategory.mutate({ category: "projects_categories", values: { list: JSON.stringify(u) } }); } },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                            "Add"))));
            case "projects-team-perms": {
                var teamPermKeys = [["viewOtherTasks", "View tasks assigned to others"], ["editProject", "Edit project details"], ["deleteTasks", "Delete tasks"], ["manageMilestones", "Manage milestones"], ["viewBudget", "View budget info"], ["createSubtasks", "Create sub-tasks"]];
                return (React.createElement(Section, { title: "Team Permissions", description: "Control what team members can do within projects" },
                    React.createElement("div", { className: "space-y-3" }, teamPermKeys.map(function (_a) {
                        var key = _a[0], label = _a[1];
                        return (React.createElement("div", { key: key, className: "flex items-center justify-between" },
                            React.createElement("p", { className: "text-sm" }, label),
                            React.createElement(switch_1.Switch, { checked: !!projTeamPerms[key], onCheckedChange: function (v) { return setProjTeamPerms(function (p) {
                                    var _a;
                                    return (__assign(__assign({}, p), (_a = {}, _a[key] = v, _a)));
                                }); } })));
                    })),
                    React.createElement(SaveButton, { saving: !!saving["proj-team-perms"], onClick: function () { return save("proj-team-perms", function () { return updateByCategory.mutateAsync({ category: "projects_team_perms", values: Object.fromEntries(Object.entries(projTeamPerms).map(function (_a) {
                                var k = _a[0], v = _a[1];
                                return [k, String(v)];
                            })) }); }); } })));
            }
            case "projects-client-perms": {
                var clientPermKeys = [["viewProgress", "View project progress"], ["viewTasks", "View tasks"], ["createTasks", "Create tasks"], ["commentTasks", "Comment on tasks"], ["viewTeam", "View team members"], ["uploadFiles", "Upload files"], ["viewInvoices", "View invoices"]];
                return (React.createElement(Section, { title: "Client Permissions", description: "Control what clients can see and do in their portal" },
                    React.createElement("div", { className: "space-y-3" }, clientPermKeys.map(function (_a) {
                        var key = _a[0], label = _a[1];
                        return (React.createElement("div", { key: key, className: "flex items-center justify-between" },
                            React.createElement("p", { className: "text-sm" }, label),
                            React.createElement(switch_1.Switch, { checked: !!projClientPerms[key], onCheckedChange: function (v) { return setProjClientPerms(function (p) {
                                    var _a;
                                    return (__assign(__assign({}, p), (_a = {}, _a[key] = v, _a)));
                                }); } })));
                    })),
                    React.createElement(SaveButton, { saving: !!saving["proj-client-perms"], onClick: function () { return save("proj-client-perms", function () { return updateByCategory.mutateAsync({ category: "projects_client_perms", values: Object.fromEntries(Object.entries(projClientPerms).map(function (_a) {
                                var k = _a[0], v = _a[1];
                                return [k, String(v)];
                            })) }); }); } })));
            }
            case "projects-automation": {
                var projAutoKeys = [["autoComplete", "Auto-mark complete when all tasks done"], ["emailOnStatusChange", "Email client on status change"], ["defaultTaskList", "Create default task list on new project"], ["autoAssignPM", "Auto-assign project manager"]];
                return (React.createElement(Section, { title: "Project Automation", description: "Automatic actions when project events occur" },
                    React.createElement("div", { className: "space-y-3" }, projAutoKeys.map(function (_a) {
                        var key = _a[0], label = _a[1];
                        return (React.createElement("div", { key: key, className: "flex items-center justify-between" },
                            React.createElement("p", { className: "text-sm" }, label),
                            React.createElement(switch_1.Switch, { checked: !!projAutomation[key], onCheckedChange: function (v) { return setProjAutomation(function (p) {
                                    var _a;
                                    return (__assign(__assign({}, p), (_a = {}, _a[key] = v, _a)));
                                }); } })));
                    })),
                    React.createElement(SaveButton, { saving: !!saving["proj-auto"], onClick: function () { return save("proj-auto", function () { return updateByCategory.mutateAsync({ category: "projects_automation", values: Object.fromEntries(Object.entries(projAutomation).map(function (_a) {
                                var k = _a[0], v = _a[1];
                                return [k, String(v)];
                            })) }); }); } })));
            }
            // ── TASKS ─────────────────────────────────────────────────────────────
            case "tasks-general":
                return (React.createElement(Section, { title: "Task Settings", description: "Configure default task behavior" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Multiple Checkbox Items"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Allow multiple checklist items per task")),
                            React.createElement(switch_1.Switch, { checked: tasksGeneral.enableMultipleCheckboxes, onCheckedChange: function (v) { return setTasksGeneral(function (p) { return (__assign(__assign({}, p), { enableMultipleCheckboxes: v })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Email Assignee"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Send email notification to assigned team member")),
                            React.createElement(switch_1.Switch, { checked: tasksGeneral.notifyAssigneeByEmail, onCheckedChange: function (v) { return setTasksGeneral(function (p) { return (__assign(__assign({}, p), { notifyAssigneeByEmail: v })); }); } })),
                        React.createElement(Field, { label: "Default Status" },
                            React.createElement(select_1.Select, { value: tasksGeneral.defaultStatus, onValueChange: function (v) { return setTasksGeneral(function (p) { return (__assign(__assign({}, p), { defaultStatus: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "not_started" }, "Not Started"),
                                    React.createElement(select_1.SelectItem, { value: "in_progress" }, "In Progress"),
                                    React.createElement(select_1.SelectItem, { value: "pending" }, "Pending"))))),
                    React.createElement(SaveButton, { saving: !!saving["tasks-general"], onClick: function () { return save("tasks-general", function () { return updateByCategory.mutateAsync({ category: "tasks_general", values: __assign(__assign({}, tasksGeneral), { enableMultipleCheckboxes: String(tasksGeneral.enableMultipleCheckboxes), notifyAssigneeByEmail: String(tasksGeneral.notifyAssigneeByEmail) }) }); }); } })));
            case "tasks-statuses":
                return (React.createElement(Section, { title: "Task Statuses", description: "Define the statuses tasks can have" },
                    React.createElement("div", { className: "space-y-2" }, taskStatuses.map(function (s) { return (React.createElement("div", { key: s.id, className: "flex items-center justify-between p-2 border rounded" },
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("div", { className: "h-3 w-3 rounded-full", style: { backgroundColor: s.color } }),
                            React.createElement("span", { className: "text-sm" }, s.name)),
                        React.createElement("button", { onClick: function () { var u = taskStatuses.filter(function (x) { return x.id !== s.id; }); setTaskStatuses(u); updateByCategory.mutate({ category: "task_statuses", values: { list: JSON.stringify(u) } }); }, className: "text-destructive hover:text-destructive/80" },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); })),
                    React.createElement("div", { className: "flex gap-2 items-end mt-3" },
                        React.createElement(Field, { label: "Name" },
                            React.createElement(input_1.Input, { value: newTaskStatus.name, onChange: function (e) { return setNewTaskStatus(function (p) { return (__assign(__assign({}, p), { name: e.target.value })); }); }, placeholder: "Status name" })),
                        React.createElement(Field, { label: "Color" },
                            React.createElement("input", { type: "color", value: newTaskStatus.color, onChange: function (e) { return setNewTaskStatus(function (p) { return (__assign(__assign({}, p), { color: e.target.value })); }); }, className: "h-9 w-14 cursor-pointer rounded border border-input p-1" })),
                        React.createElement(button_1.Button, { size: "sm", onClick: function () { if (!newTaskStatus.name) {
                                sonner_1.toast.error("Name required");
                                return;
                            } var u = __spreadArrays(taskStatuses, [__assign({ id: crypto.randomUUID() }, newTaskStatus)]); setTaskStatuses(u); setNewTaskStatus({ name: "", color: "#3b82f6" }); updateByCategory.mutate({ category: "task_statuses", values: { list: JSON.stringify(u) } }); } },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                            "Add"))));
            case "tasks-priorities":
                return (React.createElement(Section, { title: "Task Priorities", description: "Define priority levels for tasks" },
                    React.createElement("div", { className: "space-y-2" }, taskPriorities.map(function (p) { return (React.createElement("div", { key: p.id, className: "flex items-center justify-between p-2 border rounded" },
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("div", { className: "h-3 w-3 rounded-full", style: { backgroundColor: p.color } }),
                            React.createElement("span", { className: "text-sm" }, p.name)),
                        React.createElement("button", { onClick: function () { var u = taskPriorities.filter(function (x) { return x.id !== p.id; }); setTaskPriorities(u); updateByCategory.mutate({ category: "task_priorities", values: { list: JSON.stringify(u) } }); }, className: "text-destructive hover:text-destructive/80" },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); })),
                    React.createElement("div", { className: "flex gap-2 items-end mt-3" },
                        React.createElement(Field, { label: "Name" },
                            React.createElement(input_1.Input, { value: newTaskPriority.name, onChange: function (e) { return setNewTaskPriority(function (p) { return (__assign(__assign({}, p), { name: e.target.value })); }); }, placeholder: "Priority name" })),
                        React.createElement(Field, { label: "Color" },
                            React.createElement("input", { type: "color", value: newTaskPriority.color, onChange: function (e) { return setNewTaskPriority(function (p) { return (__assign(__assign({}, p), { color: e.target.value })); }); }, className: "h-9 w-14 cursor-pointer rounded border border-input p-1" })),
                        React.createElement(button_1.Button, { size: "sm", onClick: function () { if (!newTaskPriority.name) {
                                sonner_1.toast.error("Name required");
                                return;
                            } var u = __spreadArrays(taskPriorities, [__assign({ id: crypto.randomUUID() }, newTaskPriority)]); setTaskPriorities(u); setNewTaskPriority({ name: "", color: "#ef4444" }); updateByCategory.mutate({ category: "task_priorities", values: { list: JSON.stringify(u) } }); } },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                            "Add"))));
            // ── LEADS ─────────────────────────────────────────────────────────────
            case "leads-general":
                return (React.createElement(Section, { title: "Lead Settings", description: "Configure lead management defaults" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Require Source"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Leads must have a source assigned")),
                            React.createElement(switch_1.Switch, { checked: leadsGeneral.requireSource, onCheckedChange: function (v) { return setLeadsGeneral(function (p) { return (__assign(__assign({}, p), { requireSource: v })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Require Category"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Leads must be categorized")),
                            React.createElement(switch_1.Switch, { checked: leadsGeneral.requireCategory, onCheckedChange: function (v) { return setLeadsGeneral(function (p) { return (__assign(__assign({}, p), { requireCategory: v })); }); } })),
                        React.createElement(Field, { label: "Default Stage" },
                            React.createElement(select_1.Select, { value: leadsGeneral.defaultStage, onValueChange: function (v) { return setLeadsGeneral(function (p) { return (__assign(__assign({}, p), { defaultStage: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "new" }, "New"),
                                    React.createElement(select_1.SelectItem, { value: "contacted" }, "Contacted"),
                                    React.createElement(select_1.SelectItem, { value: "qualified" }, "Qualified"))))),
                    React.createElement(SaveButton, { saving: !!saving["leads-general"], onClick: function () { return save("leads-general", function () { return updateByCategory.mutateAsync({ category: "leads_general", values: __assign(__assign({}, leadsGeneral), { requireSource: String(leadsGeneral.requireSource), requireCategory: String(leadsGeneral.requireCategory) }) }); }); } })));
            case "leads-categories":
                return (React.createElement(Section, { title: "Lead Categories", description: "Organize leads by category" },
                    React.createElement("div", { className: "space-y-2" }, leadsCategories.map(function (cat) { return (React.createElement("div", { key: cat.id, className: "flex items-center justify-between p-2 border rounded" },
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("div", { className: "h-3 w-3 rounded-full", style: { backgroundColor: cat.color } }),
                            React.createElement("span", { className: "text-sm" }, cat.name)),
                        React.createElement("button", { onClick: function () { var u = leadsCategories.filter(function (c) { return c.id !== cat.id; }); setLeadsCategories(u); updateByCategory.mutate({ category: "leads_categories", values: { list: JSON.stringify(u) } }); }, className: "text-destructive hover:text-destructive/80" },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); })),
                    React.createElement("div", { className: "flex gap-2 items-end mt-3" },
                        React.createElement(Field, { label: "Name" },
                            React.createElement(input_1.Input, { value: newLeadsCat.name, onChange: function (e) { return setNewLeadsCat(function (p) { return (__assign(__assign({}, p), { name: e.target.value })); }); }, placeholder: "Category name" })),
                        React.createElement(Field, { label: "Color" },
                            React.createElement("input", { type: "color", value: newLeadsCat.color, onChange: function (e) { return setNewLeadsCat(function (p) { return (__assign(__assign({}, p), { color: e.target.value })); }); }, className: "h-9 w-14 cursor-pointer rounded border border-input p-1" })),
                        React.createElement(button_1.Button, { size: "sm", onClick: function () { if (!newLeadsCat.name) {
                                sonner_1.toast.error("Name required");
                                return;
                            } var u = __spreadArrays(leadsCategories, [__assign({ id: crypto.randomUUID() }, newLeadsCat)]); setLeadsCategories(u); setNewLeadsCat({ name: "", color: "#3b82f6" }); updateByCategory.mutate({ category: "leads_categories", values: { list: JSON.stringify(u) } }); } },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                            "Add"))));
            case "leads-stages":
                return (React.createElement(Section, { title: "Lead Stages", description: "Define the pipeline stages for leads" },
                    React.createElement("div", { className: "space-y-2" }, leadStages.map(function (s) { return (React.createElement("div", { key: s.id, className: "flex items-center justify-between p-2 border rounded" },
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("div", { className: "h-3 w-3 rounded-full", style: { backgroundColor: s.color } }),
                            React.createElement("span", { className: "text-sm" }, s.name),
                            React.createElement(badge_1.Badge, { variant: "secondary", className: "text-xs" },
                                s.probability,
                                "%")),
                        React.createElement("button", { onClick: function () { var u = leadStages.filter(function (x) { return x.id !== s.id; }); setLeadStages(u); updateByCategory.mutate({ category: "lead_stages", values: { list: JSON.stringify(u) } }); }, className: "text-destructive hover:text-destructive/80" },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); })),
                    React.createElement("div", { className: "flex gap-2 items-end mt-3" },
                        React.createElement(Field, { label: "Name" },
                            React.createElement(input_1.Input, { value: newLeadStage.name, onChange: function (e) { return setNewLeadStage(function (p) { return (__assign(__assign({}, p), { name: e.target.value })); }); }, placeholder: "Stage name" })),
                        React.createElement(Field, { label: "Color" },
                            React.createElement("input", { type: "color", value: newLeadStage.color, onChange: function (e) { return setNewLeadStage(function (p) { return (__assign(__assign({}, p), { color: e.target.value })); }); }, className: "h-9 w-14 cursor-pointer rounded border border-input p-1" })),
                        React.createElement(Field, { label: "Probability %" },
                            React.createElement(input_1.Input, { type: "number", min: "0", max: "100", value: newLeadStage.probability, onChange: function (e) { return setNewLeadStage(function (p) { return (__assign(__assign({}, p), { probability: e.target.value })); }); } })),
                        React.createElement(button_1.Button, { size: "sm", onClick: function () { if (!newLeadStage.name) {
                                sonner_1.toast.error("Name required");
                                return;
                            } var u = __spreadArrays(leadStages, [__assign({ id: crypto.randomUUID() }, newLeadStage)]); setLeadStages(u); setNewLeadStage({ name: "", color: "#3b82f6", probability: "50" }); updateByCategory.mutate({ category: "lead_stages", values: { list: JSON.stringify(u) } }); } },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                            "Add"))));
            case "leads-sources":
                return (React.createElement(Section, { title: "Lead Sources", description: "Track where leads come from" },
                    React.createElement("div", { className: "space-y-2" }, leadSources.map(function (s) { return (React.createElement("div", { key: s.id, className: "flex items-center justify-between p-2 border rounded" },
                        React.createElement("span", { className: "text-sm" }, s.name),
                        React.createElement("button", { onClick: function () { var u = leadSources.filter(function (x) { return x.id !== s.id; }); setLeadSources(u); updateByCategory.mutate({ category: "lead_sources", values: { list: JSON.stringify(u) } }); }, className: "text-destructive hover:text-destructive/80" },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); })),
                    React.createElement("div", { className: "flex gap-2 items-end mt-3" },
                        React.createElement(Field, { label: "Source Name" },
                            React.createElement(input_1.Input, { value: newLeadSource.name, onChange: function (e) { return setNewLeadSource({ name: e.target.value }); }, placeholder: "e.g. Google, Referral" })),
                        React.createElement(button_1.Button, { size: "sm", onClick: function () { if (!newLeadSource.name) {
                                sonner_1.toast.error("Name required");
                                return;
                            } var u = __spreadArrays(leadSources, [__assign({ id: crypto.randomUUID() }, newLeadSource)]); setLeadSources(u); setNewLeadSource({ name: "" }); updateByCategory.mutate({ category: "lead_sources", values: { list: JSON.stringify(u) } }); } },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                            "Add"))));
            case "leads-webforms":
                return (React.createElement(Section, { title: "Web-to-Lead Forms", description: "Embed forms on your website to capture leads automatically" },
                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "Generate HTML embed code for your lead capture forms."),
                    React.createElement(card_1.Card, { className: "bg-muted/40" },
                        React.createElement(card_1.CardContent, { className: "pt-4" },
                            React.createElement("pre", { className: "text-xs overflow-x-auto whitespace-pre-wrap" }, '<form action="/api/leads/web-form" method="POST">\n  <input name="name" placeholder="Full Name" required />\n  <input name="email" type="email" placeholder="Email" required />\n  <input name="phone" placeholder="Phone" />\n  <input name="company" placeholder="Company" />\n  <textarea name="message" placeholder="Message"></textarea>\n  <button type="submit">Submit</button>\n</form>'))),
                    React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { navigator.clipboard.writeText('<form action="/api/leads/web-form" method="POST">...</form>'); sonner_1.toast.success("Copied to clipboard"); } }, "Copy Embed Code")));
            case "leads-email-templates": {
                var LEAD_EMAIL_TEMPLATES = {
                    followup: { label: "Follow-up", templates: [
                            { id: "lead-followup-initial", name: "Initial Follow-up - (Lead)", subject: "Following Up - {our_company_name}", body: "<p>Hi {lead_name},</p><p>Thank you for your interest in {our_company_name}. I wanted to follow up and see if you have any questions about our services.</p><p>I'd love to schedule a brief call to discuss how we can help. Would any of the following times work for you?</p><p>Looking forward to hearing from you.</p>", vars: ["lead_name", "lead_email", "lead_phone", "lead_company", "lead_source", "assigned_to"] },
                            { id: "lead-followup-second", name: "Second Follow-up - (Lead)", subject: "Just Checking In - {our_company_name}", body: "<p>Hi {lead_name},</p><p>I wanted to check in again. I understand you're busy, but I'd love a chance to show you how we can add value to your business.</p><p>If now isn't the right time, just let me know and I can follow up later.</p>", vars: ["lead_name", "lead_email", "lead_company", "assigned_to"] },
                            { id: "lead-followup-final", name: "Final Follow-up - (Lead)", subject: "Last Chance to Connect", body: "<p>Hi {lead_name},</p><p>I've reached out a couple of times and haven't heard back. I don't want to be a bother, so this will be my last follow-up for now.</p><p>If your needs change in the future, don't hesitate to reach out. We're always here to help.</p>", vars: ["lead_name", "lead_email", "lead_company", "assigned_to"] },
                        ] },
                    qualification: { label: "Qualification", templates: [
                            { id: "lead-qualified", name: "Lead Qualified - (Team)", subject: "Lead Qualified: {lead_name}", body: "<p>Hi {first_name},</p><p>A lead has been qualified and is ready for the next stage.</p><table><tr><th>Field</th><th>Details</th></tr><tr><td>Name</td><td>{lead_name}</td></tr><tr><td>Company</td><td>{lead_company}</td></tr><tr><td>Value</td><td>{lead_value}</td></tr><tr><td>Source</td><td>{lead_source}</td></tr></table>", vars: ["first_name", "last_name", "lead_name", "lead_email", "lead_company", "lead_value", "lead_source", "lead_status"] },
                            { id: "lead-disqualified", name: "Lead Disqualified - (Team)", subject: "Lead Disqualified: {lead_name}", body: "<p>Hi {first_name},</p><p>A lead has been marked as disqualified.</p><p><strong>Lead:</strong> {lead_name}<br/><strong>Reason:</strong> {disqualify_reason}</p>", vars: ["first_name", "last_name", "lead_name", "lead_company", "disqualify_reason"] },
                        ] },
                    assignment: { label: "Assignment", templates: [
                            { id: "lead-assigned-rep", name: "Lead Assigned - (Rep)", subject: "New Lead Assigned: {lead_name}", body: "<p>Hi {first_name},</p><p>A new lead has been assigned to you.</p><table><tr><th>Field</th><th>Details</th></tr><tr><td>Name</td><td>{lead_name}</td></tr><tr><td>Company</td><td>{lead_company}</td></tr><tr><td>Phone</td><td>{lead_phone}</td></tr><tr><td>Email</td><td>{lead_email}</td></tr><tr><td>Value</td><td>{lead_value}</td></tr></table><p>Please reach out within 24 hours.</p>", vars: ["first_name", "last_name", "lead_name", "lead_email", "lead_phone", "lead_company", "lead_value", "lead_source"] },
                            { id: "lead-reassigned", name: "Lead Reassigned - (Team)", subject: "Lead Reassigned: {lead_name}", body: "<p>Hi {first_name},</p><p>Lead <strong>{lead_name}</strong> has been reassigned from {previous_owner} to {new_owner}.</p>", vars: ["first_name", "last_name", "lead_name", "previous_owner", "new_owner"] },
                        ] },
                    nurture: { label: "Nurture", templates: [
                            { id: "lead-nurture-intro", name: "Nurture: Introduction - (Lead)", subject: "Getting to Know {our_company_name}", body: "<p>Hi {lead_name},</p><p>I wanted to share a bit more about what we do at {our_company_name} and how we've been helping businesses like yours.</p><p>We specialise in delivering solutions that drive real results. I'd love to show you how.</p>", vars: ["lead_name", "lead_email", "lead_company"] },
                            { id: "lead-nurture-value", name: "Nurture: Value Proposition - (Lead)", subject: "How We Can Help {lead_company}", body: "<p>Hi {lead_name},</p><p>Companies like {lead_company} have seen significant improvements after partnering with us. Here's what we can offer:</p><ul><li>Streamlined operations</li><li>Increased revenue</li><li>Better customer engagement</li></ul><p>Interested in learning more?</p>", vars: ["lead_name", "lead_email", "lead_company"] },
                            { id: "lead-nurture-cta", name: "Nurture: Call to Action - (Lead)", subject: "Let's Schedule a Call", body: "<p>Hi {lead_name},</p><p>I hope the information I've shared has been helpful. I'd love to discuss your specific needs in more detail.</p><p>Would you be available for a quick 15-minute call this week? You can book a time directly here: {booking_url}</p>", vars: ["lead_name", "lead_email", "lead_company", "booking_url"] },
                        ] }
                };
                var LEAD_GENERAL_VARS = ["{our_company_name}", "{todays_date}", "{email_signature}", "{email_footer}", "{dashboard_url}"];
                var allLeadTpls_1 = Object.values(LEAD_EMAIL_TEMPLATES).flatMap(function (g) { return g.templates; });
                var currentLeadTpl = allLeadTpls_1.find(function (t) { return t.id === selectedLeadTpl; });
                return (React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("div", null,
                            React.createElement("h3", { className: "text-lg font-semibold" }, "Lead Email Templates"),
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "APP > SETTINGS > LEADS > EMAIL TEMPLATES")),
                        React.createElement(select_1.Select, { value: selectedLeadTpl, onValueChange: function (v) { return __awaiter(_this, void 0, void 0, function () {
                                var tpl, saved, _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            setSelectedLeadTpl(v);
                                            tpl = allLeadTpls_1.find(function (t) { return t.id === v; });
                                            _b.label = 1;
                                        case 1:
                                            _b.trys.push([1, 3, , 4]);
                                            return [4 /*yield*/, utils.settings.getByCategory.fetch({ category: "email_template:" + v })];
                                        case 2:
                                            saved = _b.sent();
                                            if (saved && (saved.subject || saved.body)) {
                                                setLeadTplSubject(saved.subject || (tpl === null || tpl === void 0 ? void 0 : tpl.subject) || "");
                                                setLeadTplBody(saved.body || (tpl === null || tpl === void 0 ? void 0 : tpl.body) || "");
                                                return [2 /*return*/];
                                            }
                                            return [3 /*break*/, 4];
                                        case 3:
                                            _a = _b.sent();
                                            return [3 /*break*/, 4];
                                        case 4:
                                            if (tpl) {
                                                setLeadTplSubject(tpl.subject);
                                                setLeadTplBody(tpl.body);
                                            }
                                            return [2 /*return*/];
                                    }
                                });
                            }); } },
                            React.createElement(select_1.SelectTrigger, { className: "w-[300px]" },
                                React.createElement(select_1.SelectValue, { placeholder: "Select A Template" })),
                            React.createElement(select_1.SelectContent, null, Object.entries(LEAD_EMAIL_TEMPLATES).map(function (_a) {
                                var key = _a[0], group = _a[1];
                                return (React.createElement("div", { key: key },
                                    React.createElement("div", { className: "px-2 py-1.5 text-xs font-bold text-muted-foreground" },
                                        "[ ",
                                        group.label,
                                        " ]"),
                                    group.templates.map(function (tpl) { return (React.createElement(select_1.SelectItem, { key: tpl.id, value: tpl.id }, tpl.name)); })));
                            })))),
                    !currentLeadTpl ? (React.createElement(card_1.Card, { className: "py-16" },
                        React.createElement(card_1.CardContent, { className: "flex flex-col items-center justify-center text-center" },
                            React.createElement(lucide_react_1.Mail, { className: "h-16 w-16 text-muted-foreground mb-4" }),
                            React.createElement("h4", { className: "text-lg font-medium" }, "Select a lead email template from the dropdown")))) : (React.createElement("div", { className: "grid grid-cols-[1fr_280px] gap-4" },
                        React.createElement("div", { className: "space-y-4" },
                            React.createElement(Field, { label: "Subject" },
                                React.createElement(input_1.Input, { value: leadTplSubject, onChange: function (e) { return setLeadTplSubject(e.target.value); }, placeholder: "Email subject line" })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement("label", { className: "text-sm font-medium" }, "Email Body"),
                                React.createElement(tabs_1.Tabs, { defaultValue: "visual", className: "w-full" },
                                    React.createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-3" },
                                        React.createElement(tabs_1.TabsTrigger, { value: "visual" }, "Visual Editor"),
                                        React.createElement(tabs_1.TabsTrigger, { value: "html" }, "HTML Editor"),
                                        React.createElement(tabs_1.TabsTrigger, { value: "preview" }, "Preview")),
                                    React.createElement(tabs_1.TabsContent, { value: "visual", className: "space-y-2" },
                                        React.createElement(RichTextEditor_1.RichTextEditor, { value: leadTplBody, onChange: setLeadTplBody, minHeight: "300px" })),
                                    React.createElement(tabs_1.TabsContent, { value: "html", className: "space-y-2" },
                                        React.createElement(textarea_1.Textarea, { value: leadTplBody, onChange: function (e) { return setLeadTplBody(e.target.value); }, placeholder: "<p>Enter HTML content here</p>", className: "font-mono text-xs", rows: 12 })),
                                    React.createElement(tabs_1.TabsContent, { value: "preview", className: "space-y-2" },
                                        React.createElement("div", { className: "border rounded-lg p-4 bg-white text-black min-h-[300px] overflow-auto prose prose-sm max-w-none", dangerouslySetInnerHTML: { __html: leadTplBody } })))),
                            React.createElement(SaveButton, { saving: !!saving["leads-email-templates"], onClick: function () { return save("leads-email-templates", function () { return updateByCategory.mutateAsync({ category: "email_template:" + selectedLeadTpl, values: { subject: leadTplSubject, body: leadTplBody } }); }); } })),
                        React.createElement("div", { className: "space-y-4" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, { className: "pb-2" },
                                    React.createElement(card_1.CardTitle, { className: "text-sm" }, "Template Variables")),
                                React.createElement(card_1.CardContent, { className: "space-y-1" }, currentLeadTpl.vars.map(function (v) { return React.createElement("div", { key: v, className: "text-xs font-mono text-muted-foreground cursor-pointer hover:text-primary", onClick: function () { setLeadTplBody(function (prev) { return prev + ("{" + v + "}"); }); } }, "{" + v + "}"); }))),
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, { className: "pb-2" },
                                    React.createElement(card_1.CardTitle, { className: "text-sm" }, "General Variables")),
                                React.createElement(card_1.CardContent, { className: "space-y-1" }, LEAD_GENERAL_VARS.map(function (v) { return React.createElement("div", { key: v, className: "text-xs font-mono text-muted-foreground cursor-pointer hover:text-primary", onClick: function () { setLeadTplBody(function (prev) { return prev + v; }); } }, v); }))))))));
            }
            // ── MILESTONES ────────────────────────────────────────────────────────
            case "milestones-general":
                return (React.createElement(Section, { title: "Milestone Settings", description: "Configure milestone behavior" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Notify on Create"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Send notification when milestone is created")),
                            React.createElement(switch_1.Switch, { checked: milestonesGeneral.notifyOnCreate, onCheckedChange: function (v) { return setMilestonesGeneral(function (p) { return (__assign(__assign({}, p), { notifyOnCreate: v })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Visible to Clients"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Clients can see milestones in their portal")),
                            React.createElement(switch_1.Switch, { checked: milestonesGeneral.clientVisible, onCheckedChange: function (v) { return setMilestonesGeneral(function (p) { return (__assign(__assign({}, p), { clientVisible: v })); }); } }))),
                    React.createElement(SaveButton, { saving: !!saving["milestones-general"], onClick: function () { return save("milestones-general", function () { return updateByCategory.mutateAsync({ category: "milestones_general", values: { notifyOnCreate: String(milestonesGeneral.notifyOnCreate), clientVisible: String(milestonesGeneral.clientVisible) } }); }); } })));
            case "milestones-defaults":
                return (React.createElement(Section, { title: "Default Milestones", description: "Milestones automatically added to new projects" },
                    React.createElement("div", { className: "space-y-2" }, defaultMilestones.map(function (m) { return (React.createElement("div", { key: m.id, className: "flex items-center justify-between p-2 border rounded" },
                        React.createElement("span", { className: "text-sm" }, m.name),
                        React.createElement("button", { onClick: function () { var u = defaultMilestones.filter(function (x) { return x.id !== m.id; }); setDefaultMilestones(u); updateByCategory.mutate({ category: "default_milestones", values: { list: JSON.stringify(u) } }); }, className: "text-destructive hover:text-destructive/80" },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); })),
                    React.createElement("div", { className: "flex gap-2 items-end mt-3" },
                        React.createElement(Field, { label: "Milestone Name" },
                            React.createElement(input_1.Input, { value: newDefaultMilestone.name, onChange: function (e) { return setNewDefaultMilestone({ name: e.target.value }); }, placeholder: "e.g. Design Phase" })),
                        React.createElement(button_1.Button, { size: "sm", onClick: function () { if (!newDefaultMilestone.name) {
                                sonner_1.toast.error("Name required");
                                return;
                            } var u = __spreadArrays(defaultMilestones, [__assign({ id: crypto.randomUUID() }, newDefaultMilestone)]); setDefaultMilestones(u); setNewDefaultMilestone({ name: "" }); updateByCategory.mutate({ category: "default_milestones", values: { list: JSON.stringify(u) } }); } },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                            "Add"))));
            // ── INVOICES EXTENDED ─────────────────────────────────────────────────
            case "invoices-categories":
                return (React.createElement(Section, { title: "Invoice Categories", description: "Organize invoices by category" },
                    React.createElement("div", { className: "space-y-2" }, invoicesCategories.map(function (c) { return (React.createElement("div", { key: c.id, className: "flex items-center justify-between p-2 border rounded" },
                        React.createElement("span", { className: "text-sm" }, c.name),
                        React.createElement("button", { onClick: function () { var u = invoicesCategories.filter(function (x) { return x.id !== c.id; }); setInvoicesCategories(u); updateByCategory.mutate({ category: "invoices_categories", values: { list: JSON.stringify(u) } }); }, className: "text-destructive hover:text-destructive/80" },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); })),
                    React.createElement("div", { className: "flex gap-2 items-end mt-3" },
                        React.createElement(Field, { label: "Category Name" },
                            React.createElement(input_1.Input, { value: newInvoiceCat.name, onChange: function (e) { return setNewInvoiceCat({ name: e.target.value }); }, placeholder: "Category name" })),
                        React.createElement(button_1.Button, { size: "sm", onClick: function () { if (!newInvoiceCat.name) {
                                sonner_1.toast.error("Name required");
                                return;
                            } var u = __spreadArrays(invoicesCategories, [__assign({ id: crypto.randomUUID() }, newInvoiceCat)]); setInvoicesCategories(u); setNewInvoiceCat({ name: "" }); updateByCategory.mutate({ category: "invoices_categories", values: { list: JSON.stringify(u) } }); } },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                            "Add"))));
            case "invoices-statuses":
                return (React.createElement(Section, { title: "Invoice Statuses", description: "Define custom statuses for invoices" },
                    React.createElement("div", { className: "space-y-2" }, invoicesStatuses.map(function (s) { return (React.createElement("div", { key: s.id, className: "flex items-center justify-between p-2 border rounded" },
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("div", { className: "h-3 w-3 rounded-full", style: { backgroundColor: s.color } }),
                            React.createElement("span", { className: "text-sm" }, s.name)),
                        React.createElement("button", { onClick: function () { var u = invoicesStatuses.filter(function (x) { return x.id !== s.id; }); setInvoicesStatuses(u); updateByCategory.mutate({ category: "invoices_statuses", values: { list: JSON.stringify(u) } }); }, className: "text-destructive hover:text-destructive/80" },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); })),
                    React.createElement("div", { className: "flex gap-2 items-end mt-3" },
                        React.createElement(Field, { label: "Name" },
                            React.createElement(input_1.Input, { value: newInvoiceStatus.name, onChange: function (e) { return setNewInvoiceStatus(function (p) { return (__assign(__assign({}, p), { name: e.target.value })); }); }, placeholder: "Status name" })),
                        React.createElement(Field, { label: "Color" },
                            React.createElement("input", { type: "color", value: newInvoiceStatus.color, onChange: function (e) { return setNewInvoiceStatus(function (p) { return (__assign(__assign({}, p), { color: e.target.value })); }); }, className: "h-9 w-14 cursor-pointer rounded border border-input p-1" })),
                        React.createElement(button_1.Button, { size: "sm", onClick: function () { if (!newInvoiceStatus.name) {
                                sonner_1.toast.error("Name required");
                                return;
                            } var u = __spreadArrays(invoicesStatuses, [__assign({ id: crypto.randomUUID() }, newInvoiceStatus)]); setInvoicesStatuses(u); setNewInvoiceStatus({ name: "", color: "#3b82f6" }); updateByCategory.mutate({ category: "invoices_statuses", values: { list: JSON.stringify(u) } }); } },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                            "Add"))));
            // ── ESTIMATES ─────────────────────────────────────────────────────────
            case "estimates-general":
                return (React.createElement(Section, { title: "Estimate Settings", description: "Configure estimate defaults" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Allow Client Approval"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Clients can approve or decline estimates")),
                            React.createElement(switch_1.Switch, { checked: estimatesGeneral.allowClientApproval, onCheckedChange: function (v) { return setEstimatesGeneral(function (p) { return (__assign(__assign({}, p), { allowClientApproval: v })); }); } })),
                        React.createElement(Field, { label: "Default Expiry (days)" },
                            React.createElement(input_1.Input, { type: "number", min: "1", value: estimatesGeneral.expiryDays, onChange: function (e) { return setEstimatesGeneral(function (p) { return (__assign(__assign({}, p), { expiryDays: e.target.value })); }); } }))),
                    React.createElement(SaveButton, { saving: !!saving["estimates-general"], onClick: function () { return save("estimates-general", function () { return updateByCategory.mutateAsync({ category: "estimates_general", values: __assign(__assign({}, estimatesGeneral), { allowClientApproval: String(estimatesGeneral.allowClientApproval) }) }); }); } })));
            case "estimates-categories":
                return (React.createElement(Section, { title: "Estimate Categories", description: "Organize estimates by category" },
                    React.createElement("div", { className: "space-y-2" }, estimateCategories.map(function (c) { return (React.createElement("div", { key: c.id, className: "flex items-center justify-between p-2 border rounded" },
                        React.createElement("span", { className: "text-sm" }, c.name),
                        React.createElement("button", { onClick: function () { var u = estimateCategories.filter(function (x) { return x.id !== c.id; }); setEstimateCategories(u); updateByCategory.mutate({ category: "estimate_categories", values: { list: JSON.stringify(u) } }); }, className: "text-destructive hover:text-destructive/80" },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); })),
                    React.createElement("div", { className: "flex gap-2 items-end mt-3" },
                        React.createElement(Field, { label: "Category Name" },
                            React.createElement(input_1.Input, { value: newEstimateCat.name, onChange: function (e) { return setNewEstimateCat({ name: e.target.value }); }, placeholder: "Category name" })),
                        React.createElement(button_1.Button, { size: "sm", onClick: function () { if (!newEstimateCat.name) {
                                sonner_1.toast.error("Name required");
                                return;
                            } var u = __spreadArrays(estimateCategories, [__assign({ id: crypto.randomUUID() }, newEstimateCat)]); setEstimateCategories(u); setNewEstimateCat({ name: "" }); updateByCategory.mutate({ category: "estimate_categories", values: { list: JSON.stringify(u) } }); } },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                            "Add"))));
            case "estimates-automation": {
                var estAutoKeys = [["autoConvertToInvoice", "Auto-convert approved estimate to invoice"], ["emailOnExpiry", "Email client when estimate expires"], ["notifyOnApproval", "Notify admin on estimate approval"], ["autoAddTax", "Auto-add tax from client's region"]];
                return (React.createElement(Section, { title: "Estimate Automation", description: "Automatic actions for estimates" },
                    React.createElement("div", { className: "space-y-3" }, estAutoKeys.map(function (_a) {
                        var key = _a[0], label = _a[1];
                        return (React.createElement("div", { key: key, className: "flex items-center justify-between" },
                            React.createElement("p", { className: "text-sm" }, label),
                            React.createElement(switch_1.Switch, { checked: !!estAutomation[key], onCheckedChange: function (v) { return setEstAutomation(function (p) {
                                    var _a;
                                    return (__assign(__assign({}, p), (_a = {}, _a[key] = v, _a)));
                                }); } })));
                    })),
                    React.createElement(SaveButton, { saving: !!saving["est-auto"], onClick: function () { return save("est-auto", function () { return updateByCategory.mutateAsync({ category: "estimates_automation", values: Object.fromEntries(Object.entries(estAutomation).map(function (_a) {
                                var k = _a[0], v = _a[1];
                                return [k, String(v)];
                            })) }); }); } })));
            }
            // ── TIMESHEETS ────────────────────────────────────────────────────────
            case "timesheets-general":
                return (React.createElement(Section, { title: "Timesheet Settings", description: "Configure timesheet tracking" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Require Notes"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Entries must include a description")),
                            React.createElement(switch_1.Switch, { checked: timesheetsGeneral.requireNotes, onCheckedChange: function (v) { return setTimesheetsGeneral(function (p) { return (__assign(__assign({}, p), { requireNotes: v })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Notify Project Manager"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "PM gets notified on new timesheet entries")),
                            React.createElement(switch_1.Switch, { checked: timesheetsGeneral.notifyPM, onCheckedChange: function (v) { return setTimesheetsGeneral(function (p) { return (__assign(__assign({}, p), { notifyPM: v })); }); } })),
                        React.createElement(Field, { label: "Rounding (minutes)" },
                            React.createElement(input_1.Input, { type: "number", min: "0", step: "5", value: timesheetsGeneral.roundingMinutes, onChange: function (e) { return setTimesheetsGeneral(function (p) { return (__assign(__assign({}, p), { roundingMinutes: e.target.value })); }); }, placeholder: "0 = no rounding" }))),
                    React.createElement(SaveButton, { saving: !!saving["timesheets-general"], onClick: function () { return save("timesheets-general", function () { return updateByCategory.mutateAsync({ category: "timesheets_general", values: __assign(__assign({}, timesheetsGeneral), { requireNotes: String(timesheetsGeneral.requireNotes), notifyPM: String(timesheetsGeneral.notifyPM) }) }); }); } })));
            // ── PROPOSALS ─────────────────────────────────────────────────────────
            case "proposals-general":
                return (React.createElement(Section, { title: "Proposal Settings", description: "Configure proposal defaults" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Allow E-Signature"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Clients can sign proposals electronically")),
                            React.createElement(switch_1.Switch, { checked: proposalsGeneral.allowEsign, onCheckedChange: function (v) { return setProposalsGeneral(function (p) { return (__assign(__assign({}, p), { allowEsign: v })); }); } })),
                        React.createElement(Field, { label: "Default Expiry (days)" },
                            React.createElement(input_1.Input, { type: "number", min: "1", value: proposalsGeneral.expiryDays, onChange: function (e) { return setProposalsGeneral(function (p) { return (__assign(__assign({}, p), { expiryDays: e.target.value })); }); } }))),
                    React.createElement(SaveButton, { saving: !!saving["proposals-general"], onClick: function () { return save("proposals-general", function () { return updateByCategory.mutateAsync({ category: "proposals_general", values: __assign(__assign({}, proposalsGeneral), { allowEsign: String(proposalsGeneral.allowEsign) }) }); }); } })));
            case "proposals-categories":
                return (React.createElement(Section, { title: "Proposal Categories", description: "Organize proposals by category" },
                    React.createElement("div", { className: "space-y-2" }, proposalCategories.map(function (c) { return (React.createElement("div", { key: c.id, className: "flex items-center justify-between p-2 border rounded" },
                        React.createElement("span", { className: "text-sm" }, c.name),
                        React.createElement("button", { onClick: function () { var u = proposalCategories.filter(function (x) { return x.id !== c.id; }); setProposalCategories(u); updateByCategory.mutate({ category: "proposal_categories", values: { list: JSON.stringify(u) } }); }, className: "text-destructive hover:text-destructive/80" },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); })),
                    React.createElement("div", { className: "flex gap-2 items-end mt-3" },
                        React.createElement(Field, { label: "Category Name" },
                            React.createElement(input_1.Input, { value: newProposalCat.name, onChange: function (e) { return setNewProposalCat({ name: e.target.value }); }, placeholder: "Category name" })),
                        React.createElement(button_1.Button, { size: "sm", onClick: function () { if (!newProposalCat.name) {
                                sonner_1.toast.error("Name required");
                                return;
                            } var u = __spreadArrays(proposalCategories, [__assign({ id: crypto.randomUUID() }, newProposalCat)]); setProposalCategories(u); setNewProposalCat({ name: "" }); updateByCategory.mutate({ category: "proposal_categories", values: { list: JSON.stringify(u) } }); } },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                            "Add"))));
            case "proposals-automation": {
                var propAutoKeys = [["autoConvertToProject", "Auto-convert signed proposal to project"], ["remindBeforeExpiry", "Remind client before expiry"], ["notifyOnSignature", "Notify admin on signature"], ["autoGenerateInvoice", "Auto-generate invoice on acceptance"]];
                return (React.createElement(Section, { title: "Proposal Automation", description: "Automatic actions for proposals" },
                    React.createElement("div", { className: "space-y-3" }, propAutoKeys.map(function (_a) {
                        var key = _a[0], label = _a[1];
                        return (React.createElement("div", { key: key, className: "flex items-center justify-between" },
                            React.createElement("p", { className: "text-sm" }, label),
                            React.createElement(switch_1.Switch, { checked: !!propAutomation[key], onCheckedChange: function (v) { return setPropAutomation(function (p) {
                                    var _a;
                                    return (__assign(__assign({}, p), (_a = {}, _a[key] = v, _a)));
                                }); } })));
                    })),
                    React.createElement(SaveButton, { saving: !!saving["prop-auto"], onClick: function () { return save("prop-auto", function () { return updateByCategory.mutateAsync({ category: "proposals_automation", values: Object.fromEntries(Object.entries(propAutomation).map(function (_a) {
                                var k = _a[0], v = _a[1];
                                return [k, String(v)];
                            })) }); }); } })));
            }
            // ── CONTRACTS ─────────────────────────────────────────────────────────
            case "contracts-general":
                return (React.createElement(Section, { title: "Contract Settings", description: "Configure contract defaults" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Allow E-Signature"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Clients can sign contracts electronically")),
                            React.createElement(switch_1.Switch, { checked: contractsGeneral.allowEsign, onCheckedChange: function (v) { return setContractsGeneral(function (p) { return (__assign(__assign({}, p), { allowEsign: v })); }); } })),
                        React.createElement(Field, { label: "Expiry Reminder (days before)" },
                            React.createElement(input_1.Input, { type: "number", min: "1", value: contractsGeneral.expiryReminderDays, onChange: function (e) { return setContractsGeneral(function (p) { return (__assign(__assign({}, p), { expiryReminderDays: e.target.value })); }); } }))),
                    React.createElement(SaveButton, { saving: !!saving["contracts-general"], onClick: function () { return save("contracts-general", function () { return updateByCategory.mutateAsync({ category: "contracts_general", values: __assign(__assign({}, contractsGeneral), { allowEsign: String(contractsGeneral.allowEsign) }) }); }); } })));
            case "contracts-categories":
                return (React.createElement(Section, { title: "Contract Categories", description: "Organize contracts by category" },
                    React.createElement("div", { className: "space-y-2" }, contractCategories.map(function (c) { return (React.createElement("div", { key: c.id, className: "flex items-center justify-between p-2 border rounded" },
                        React.createElement("span", { className: "text-sm" }, c.name),
                        React.createElement("button", { onClick: function () { var u = contractCategories.filter(function (x) { return x.id !== c.id; }); setContractCategories(u); updateByCategory.mutate({ category: "contract_categories", values: { list: JSON.stringify(u) } }); }, className: "text-destructive hover:text-destructive/80" },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); })),
                    React.createElement("div", { className: "flex gap-2 items-end mt-3" },
                        React.createElement(Field, { label: "Category Name" },
                            React.createElement(input_1.Input, { value: newContractCat.name, onChange: function (e) { return setNewContractCat({ name: e.target.value }); }, placeholder: "Category name" })),
                        React.createElement(button_1.Button, { size: "sm", onClick: function () { if (!newContractCat.name) {
                                sonner_1.toast.error("Name required");
                                return;
                            } var u = __spreadArrays(contractCategories, [__assign({ id: crypto.randomUUID() }, newContractCat)]); setContractCategories(u); setNewContractCat({ name: "" }); updateByCategory.mutate({ category: "contract_categories", values: { list: JSON.stringify(u) } }); } },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                            "Add"))));
            case "contracts-automation": {
                var contAutoKeys = [["emailBeforeExpiry", "Email reminder before expiry"], ["autoRenew", "Auto-renew recurring contracts"], ["notifyOnSignature", "Notify admin on signature"], ["archiveExpired", "Archive expired contracts"]];
                return (React.createElement(Section, { title: "Contract Automation", description: "Automatic actions for contracts" },
                    React.createElement("div", { className: "space-y-3" }, contAutoKeys.map(function (_a) {
                        var key = _a[0], label = _a[1];
                        return (React.createElement("div", { key: key, className: "flex items-center justify-between" },
                            React.createElement("p", { className: "text-sm" }, label),
                            React.createElement(switch_1.Switch, { checked: !!contAutomation[key], onCheckedChange: function (v) { return setContAutomation(function (p) {
                                    var _a;
                                    return (__assign(__assign({}, p), (_a = {}, _a[key] = v, _a)));
                                }); } })));
                    })),
                    React.createElement(SaveButton, { saving: !!saving["cont-auto"], onClick: function () { return save("cont-auto", function () { return updateByCategory.mutateAsync({ category: "contracts_automation", values: Object.fromEntries(Object.entries(contAutomation).map(function (_a) {
                                var k = _a[0], v = _a[1];
                                return [k, String(v)];
                            })) }); }); } })));
            }
            // ── PRODUCTS ──────────────────────────────────────────────────────────
            case "products-categories":
                return (React.createElement(Section, { title: "Product Categories", description: "Organize products by category" },
                    React.createElement("div", { className: "space-y-2" }, productsCategories.map(function (c) { return (React.createElement("div", { key: c.id, className: "flex items-center justify-between p-2 border rounded" },
                        React.createElement("span", { className: "text-sm" }, c.name),
                        React.createElement("button", { onClick: function () { var u = productsCategories.filter(function (x) { return x.id !== c.id; }); setProductsCategories(u); updateByCategory.mutate({ category: "products_categories", values: { list: JSON.stringify(u) } }); }, className: "text-destructive hover:text-destructive/80" },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); })),
                    React.createElement("div", { className: "flex gap-2 items-end mt-3" },
                        React.createElement(Field, { label: "Category Name" },
                            React.createElement(input_1.Input, { value: newProductsCat.name, onChange: function (e) { return setNewProductsCat({ name: e.target.value }); }, placeholder: "Category name" })),
                        React.createElement(button_1.Button, { size: "sm", onClick: function () { if (!newProductsCat.name) {
                                sonner_1.toast.error("Name required");
                                return;
                            } var u = __spreadArrays(productsCategories, [__assign({ id: crypto.randomUUID() }, newProductsCat)]); setProductsCategories(u); setNewProductsCat({ name: "" }); updateByCategory.mutate({ category: "products_categories", values: { list: JSON.stringify(u) } }); } },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                            "Add"))));
            case "products-units":
                return (React.createElement(Section, { title: "Product Units", description: "Measurement units for products and services" },
                    React.createElement("div", { className: "space-y-2" }, productUnits.map(function (u) { return (React.createElement("div", { key: u.id, className: "flex items-center justify-between p-2 border rounded" },
                        React.createElement("span", { className: "text-sm" }, u.name),
                        React.createElement("button", { onClick: function () { var n = productUnits.filter(function (x) { return x.id !== u.id; }); setProductUnits(n); updateByCategory.mutate({ category: "product_units", values: { list: JSON.stringify(n) } }); }, className: "text-destructive hover:text-destructive/80" },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); })),
                    React.createElement("div", { className: "flex gap-2 items-end mt-3" },
                        React.createElement(Field, { label: "Unit Name" },
                            React.createElement(input_1.Input, { value: newProductUnit.name, onChange: function (e) { return setNewProductUnit({ name: e.target.value }); }, placeholder: "e.g. Hours, Pieces, Kg" })),
                        React.createElement(button_1.Button, { size: "sm", onClick: function () { if (!newProductUnit.name) {
                                sonner_1.toast.error("Name required");
                                return;
                            } var u = __spreadArrays(productUnits, [__assign({ id: crypto.randomUUID() }, newProductUnit)]); setProductUnits(u); setNewProductUnit({ name: "" }); updateByCategory.mutate({ category: "product_units", values: { list: JSON.stringify(u) } }); } },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                            "Add"))));
            // ── EXPENSES ──────────────────────────────────────────────────────────
            case "expenses-general":
                return (React.createElement(Section, { title: "Expense Settings", description: "Configure expense tracking" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Require Receipt"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Expenses must have an attached receipt")),
                            React.createElement(switch_1.Switch, { checked: expensesGeneral.requireReceipt, onCheckedChange: function (v) { return setExpensesGeneral(function (p) { return (__assign(__assign({}, p), { requireReceipt: v })); }); } })),
                        React.createElement(Field, { label: "Auto-Approve Below Amount" },
                            React.createElement(input_1.Input, { type: "number", min: "0", value: expensesGeneral.autoApproveBelow, onChange: function (e) { return setExpensesGeneral(function (p) { return (__assign(__assign({}, p), { autoApproveBelow: e.target.value })); }); }, placeholder: "0 = all require approval" }))),
                    React.createElement(SaveButton, { saving: !!saving["expenses-general"], onClick: function () { return save("expenses-general", function () { return updateByCategory.mutateAsync({ category: "expenses_general", values: __assign(__assign({}, expensesGeneral), { requireReceipt: String(expensesGeneral.requireReceipt) }) }); }); } })));
            case "expenses-categories":
                return (React.createElement(Section, { title: "Expense Categories", description: "Organize expenses by category" },
                    React.createElement("div", { className: "space-y-2" }, expenseCategories.map(function (c) { return (React.createElement("div", { key: c.id, className: "flex items-center justify-between p-2 border rounded" },
                        React.createElement("span", { className: "text-sm" }, c.name),
                        React.createElement("button", { onClick: function () { var u = expenseCategories.filter(function (x) { return x.id !== c.id; }); setExpenseCategories(u); updateByCategory.mutate({ category: "expense_categories", values: { list: JSON.stringify(u) } }); }, className: "text-destructive hover:text-destructive/80" },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); })),
                    React.createElement("div", { className: "flex gap-2 items-end mt-3" },
                        React.createElement(Field, { label: "Category Name" },
                            React.createElement(input_1.Input, { value: newExpenseCat.name, onChange: function (e) { return setNewExpenseCat({ name: e.target.value }); }, placeholder: "Category name" })),
                        React.createElement(button_1.Button, { size: "sm", onClick: function () { if (!newExpenseCat.name) {
                                sonner_1.toast.error("Name required");
                                return;
                            } var u = __spreadArrays(expenseCategories, [__assign({ id: crypto.randomUUID() }, newExpenseCat)]); setExpenseCategories(u); setNewExpenseCat({ name: "" }); updateByCategory.mutate({ category: "expense_categories", values: { list: JSON.stringify(u) } }); } },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                            "Add"))));
            // ── SUBSCRIPTIONS ─────────────────────────────────────────────────────
            case "subscriptions-general":
                return (React.createElement(Section, { title: "Subscription Settings", description: "Configure recurring subscription defaults" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Tax Inclusive"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Subscription prices include tax")),
                            React.createElement(switch_1.Switch, { checked: subsGeneral.taxInclusive, onCheckedChange: function (v) { return setSubsGeneral(function (p) { return (__assign(__assign({}, p), { taxInclusive: v })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Round Amounts"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Round subscription amounts to nearest whole number")),
                            React.createElement(switch_1.Switch, { checked: subsGeneral.roundAmounts, onCheckedChange: function (v) { return setSubsGeneral(function (p) { return (__assign(__assign({}, p), { roundAmounts: v })); }); } }))),
                    React.createElement(SaveButton, { saving: !!saving["subs-general"], onClick: function () { return save("subs-general", function () { return updateByCategory.mutateAsync({ category: "subscriptions_general", values: { taxInclusive: String(subsGeneral.taxInclusive), roundAmounts: String(subsGeneral.roundAmounts) } }); }); } })));
            // ── TAGS GENERAL ──────────────────────────────────────────────────────
            case "tags-general":
                return (React.createElement(Section, { title: "Tag Settings", description: "Configure tag behavior" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Allow User-Created Tags"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Any user can create new tags")),
                            React.createElement(switch_1.Switch, { checked: tagsGeneral.allowUserCreate, onCheckedChange: function (v) { return setTagsGeneral(function (p) { return (__assign(__assign({}, p), { allowUserCreate: v })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Auto Lowercase"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Convert tag names to lowercase automatically")),
                            React.createElement(switch_1.Switch, { checked: tagsGeneral.autoLowercase, onCheckedChange: function (v) { return setTagsGeneral(function (p) { return (__assign(__assign({}, p), { autoLowercase: v })); }); } }))),
                    React.createElement(SaveButton, { saving: !!saving["tags-general"], onClick: function () { return save("tags-general", function () { return updateByCategory.mutateAsync({ category: "tags_general", values: { allowUserCreate: String(tagsGeneral.allowUserCreate), autoLowercase: String(tagsGeneral.autoLowercase) } }); }); } })));
            // ── FILES ─────────────────────────────────────────────────────────────
            case "files-general":
                return (React.createElement(Section, { title: "File Settings", description: "Configure file upload limits and types" },
                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                        React.createElement(Field, { label: "Max File Size (MB)" },
                            React.createElement(input_1.Input, { type: "number", min: "1", value: filesGeneral.maxSizeMb, onChange: function (e) { return setFilesGeneral(function (p) { return (__assign(__assign({}, p), { maxSizeMb: e.target.value })); }); } })),
                        React.createElement(Field, { label: "Max Files Per Upload" },
                            React.createElement(input_1.Input, { type: "number", min: "1", value: filesGeneral.maxFilesPerUpload, onChange: function (e) { return setFilesGeneral(function (p) { return (__assign(__assign({}, p), { maxFilesPerUpload: e.target.value })); }); } }))),
                    React.createElement(Field, { label: "Allowed File Types" },
                        React.createElement(input_1.Input, { value: filesGeneral.allowedTypes, onChange: function (e) { return setFilesGeneral(function (p) { return (__assign(__assign({}, p), { allowedTypes: e.target.value })); }); }, placeholder: "pdf,doc,docx,xls,xlsx,png,jpg" })),
                    React.createElement(SaveButton, { saving: !!saving["files-general"], onClick: function () { return save("files-general", function () { return updateByCategory.mutateAsync({ category: "files_general", values: filesGeneral }); }); } })));
            case "files-folders":
                return (React.createElement(Section, { title: "File Folders", description: "Manage organizational folders for file storage" },
                    React.createElement("div", { className: "space-y-2" }, fileFolders.map(function (f) { return (React.createElement("div", { key: f.id, className: "flex items-center justify-between p-2 border rounded" },
                        React.createElement("span", { className: "text-sm" }, f.name),
                        React.createElement("button", { onClick: function () { var u = fileFolders.filter(function (x) { return x.id !== f.id; }); setFileFolders(u); updateByCategory.mutate({ category: "file_folders", values: { list: JSON.stringify(u) } }); }, className: "text-destructive hover:text-destructive/80" },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); })),
                    React.createElement("div", { className: "flex gap-2 items-end mt-3" },
                        React.createElement(Field, { label: "Folder Name" },
                            React.createElement(input_1.Input, { value: newFileFolder.name, onChange: function (e) { return setNewFileFolder({ name: e.target.value }); }, placeholder: "e.g. Contracts, Reports" })),
                        React.createElement(button_1.Button, { size: "sm", onClick: function () { if (!newFileFolder.name) {
                                sonner_1.toast.error("Name required");
                                return;
                            } var u = __spreadArrays(fileFolders, [__assign({ id: crypto.randomUUID() }, newFileFolder)]); setFileFolders(u); setNewFileFolder({ name: "" }); updateByCategory.mutate({ category: "file_folders", values: { list: JSON.stringify(u) } }); } },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                            "Add"))));
            case "files-default-folders":
                return (React.createElement(Section, { title: "Default Folders", description: "Folders automatically created for new projects/clients" },
                    React.createElement("div", { className: "space-y-2" }, defaultFolders.map(function (f) { return (React.createElement("div", { key: f.id, className: "flex items-center justify-between p-2 border rounded" },
                        React.createElement("span", { className: "text-sm" }, f.name),
                        React.createElement("button", { onClick: function () { var u = defaultFolders.filter(function (x) { return x.id !== f.id; }); setDefaultFolders(u); updateByCategory.mutate({ category: "default_folders", values: { list: JSON.stringify(u) } }); }, className: "text-destructive hover:text-destructive/80" },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); })),
                    React.createElement("div", { className: "flex gap-2 items-end mt-3" },
                        React.createElement(Field, { label: "Folder Name" },
                            React.createElement(input_1.Input, { value: newDefaultFolder.name, onChange: function (e) { return setNewDefaultFolder({ name: e.target.value }); }, placeholder: "e.g. Documents, Invoices" })),
                        React.createElement(button_1.Button, { size: "sm", onClick: function () { if (!newDefaultFolder.name) {
                                sonner_1.toast.error("Name required");
                                return;
                            } var u = __spreadArrays(defaultFolders, [__assign({ id: crypto.randomUUID() }, newDefaultFolder)]); setDefaultFolders(u); setNewDefaultFolder({ name: "" }); updateByCategory.mutate({ category: "default_folders", values: { list: JSON.stringify(u) } }); } },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                            "Add"))));
            // ── PAYMENT GATEWAYS ──────────────────────────────────────────────────
            case "payments-flutterwave":
                return (React.createElement(Section, { title: "Flutterwave", description: "Accept payments via Flutterwave" },
                    React.createElement("div", { className: "flex items-center justify-between mb-2" },
                        React.createElement("p", { className: "text-sm font-medium" }, "Enable Flutterwave"),
                        React.createElement(switch_1.Switch, { checked: flutterwave.enabled, onCheckedChange: function (c) { return setFlutterwave(function (p) { return (__assign(__assign({}, p), { enabled: c })); }); } })),
                    React.createElement("div", { className: "grid grid-cols-1 gap-4" },
                        React.createElement(Field, { label: "Public Key" },
                            React.createElement(input_1.Input, { value: flutterwave.publicKey, onChange: function (e) { return setFlutterwave(function (p) { return (__assign(__assign({}, p), { publicKey: e.target.value })); }); }, placeholder: "FLWPUBK-\u2026" })),
                        React.createElement(Field, { label: "Secret Key" },
                            React.createElement(input_1.Input, { type: "password", value: flutterwave.secretKey, onChange: function (e) { return setFlutterwave(function (p) { return (__assign(__assign({}, p), { secretKey: e.target.value })); }); }, placeholder: "FLWSECK-\u2026" }))),
                    React.createElement(SaveButton, { saving: !!saving["flutterwave"], onClick: function () { return save("flutterwave", function () { return updateByCategory.mutateAsync({ category: "payment_flutterwave", values: __assign(__assign({}, flutterwave), { enabled: String(flutterwave.enabled) }) }); }); } })));
            case "payments-razorpay":
                return (React.createElement(Section, { title: "Razorpay", description: "Accept payments via Razorpay" },
                    React.createElement("div", { className: "flex items-center justify-between mb-2" },
                        React.createElement("p", { className: "text-sm font-medium" }, "Enable Razorpay"),
                        React.createElement(switch_1.Switch, { checked: razorpay.enabled, onCheckedChange: function (c) { return setRazorpay(function (p) { return (__assign(__assign({}, p), { enabled: c })); }); } })),
                    React.createElement("div", { className: "grid grid-cols-1 gap-4" },
                        React.createElement(Field, { label: "Key ID" },
                            React.createElement(input_1.Input, { value: razorpay.keyId, onChange: function (e) { return setRazorpay(function (p) { return (__assign(__assign({}, p), { keyId: e.target.value })); }); }, placeholder: "rzp_live_\u2026" })),
                        React.createElement(Field, { label: "Key Secret" },
                            React.createElement(input_1.Input, { type: "password", value: razorpay.keySecret, onChange: function (e) { return setRazorpay(function (p) { return (__assign(__assign({}, p), { keySecret: e.target.value })); }); }, placeholder: "Key Secret" }))),
                    React.createElement(SaveButton, { saving: !!saving["razorpay"], onClick: function () { return save("razorpay", function () { return updateByCategory.mutateAsync({ category: "payment_razorpay", values: __assign(__assign({}, razorpay), { enabled: String(razorpay.enabled) }) }); }); } })));
            case "payments-paypal":
                return (React.createElement(Section, { title: "PayPal", description: "Accept payments via PayPal" },
                    React.createElement("div", { className: "flex items-center justify-between mb-2" },
                        React.createElement("p", { className: "text-sm font-medium" }, "Enable PayPal"),
                        React.createElement(switch_1.Switch, { checked: paypal.enabled, onCheckedChange: function (c) { return setPaypal(function (p) { return (__assign(__assign({}, p), { enabled: c })); }); } })),
                    React.createElement("div", { className: "grid grid-cols-1 gap-4" },
                        React.createElement(Field, { label: "Client ID" },
                            React.createElement(input_1.Input, { value: paypal.clientId, onChange: function (e) { return setPaypal(function (p) { return (__assign(__assign({}, p), { clientId: e.target.value })); }); }, placeholder: "Client ID" })),
                        React.createElement(Field, { label: "Client Secret" },
                            React.createElement(input_1.Input, { type: "password", value: paypal.clientSecret, onChange: function (e) { return setPaypal(function (p) { return (__assign(__assign({}, p), { clientSecret: e.target.value })); }); }, placeholder: "Client Secret" })),
                        React.createElement(Field, { label: "Mode" },
                            React.createElement(select_1.Select, { value: paypal.mode, onValueChange: function (v) { return setPaypal(function (p) { return (__assign(__assign({}, p), { mode: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "sandbox" }, "Sandbox"),
                                    React.createElement(select_1.SelectItem, { value: "live" }, "Live"))))),
                    React.createElement(SaveButton, { saving: !!saving["paypal"], onClick: function () { return save("paypal", function () { return updateByCategory.mutateAsync({ category: "payment_paypal", values: __assign(__assign({}, paypal), { enabled: String(paypal.enabled) }) }); }); } })));
            case "payments-paystack":
                return (React.createElement(Section, { title: "Paystack", description: "Accept payments via Paystack" },
                    React.createElement("div", { className: "flex items-center justify-between mb-2" },
                        React.createElement("p", { className: "text-sm font-medium" }, "Enable Paystack"),
                        React.createElement(switch_1.Switch, { checked: paystack.enabled, onCheckedChange: function (c) { return setPaystack(function (p) { return (__assign(__assign({}, p), { enabled: c })); }); } })),
                    React.createElement("div", { className: "grid grid-cols-1 gap-4" },
                        React.createElement(Field, { label: "Public Key" },
                            React.createElement(input_1.Input, { value: paystack.publicKey, onChange: function (e) { return setPaystack(function (p) { return (__assign(__assign({}, p), { publicKey: e.target.value })); }); }, placeholder: "pk_live_\u2026" })),
                        React.createElement(Field, { label: "Secret Key" },
                            React.createElement(input_1.Input, { type: "password", value: paystack.secretKey, onChange: function (e) { return setPaystack(function (p) { return (__assign(__assign({}, p), { secretKey: e.target.value })); }); }, placeholder: "sk_live_\u2026" }))),
                    React.createElement(SaveButton, { saving: !!saving["paystack"], onClick: function () { return save("paystack", function () { return updateByCategory.mutateAsync({ category: "payment_paystack", values: __assign(__assign({}, paystack), { enabled: String(paystack.enabled) }) }); }); } })));
            // ── TICKETS ───────────────────────────────────────────────────────────
            case "tickets-general":
                return (React.createElement(Section, { title: "Ticket Settings", description: "Configure support ticket system" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Allow Client Tickets"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Clients can create tickets from portal")),
                            React.createElement(switch_1.Switch, { checked: ticketsGeneral.allowClientTickets, onCheckedChange: function (v) { return setTicketsGeneral(function (p) { return (__assign(__assign({}, p), { allowClientTickets: v })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Auto-Assign"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Automatically assign tickets to available agents")),
                            React.createElement(switch_1.Switch, { checked: ticketsGeneral.autoAssign, onCheckedChange: function (v) { return setTicketsGeneral(function (p) { return (__assign(__assign({}, p), { autoAssign: v })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Notify Agents"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Email agents when new ticket is created")),
                            React.createElement(switch_1.Switch, { checked: ticketsGeneral.notifyAgents, onCheckedChange: function (v) { return setTicketsGeneral(function (p) { return (__assign(__assign({}, p), { notifyAgents: v })); }); } })),
                        React.createElement(Field, { label: "Auto-close after (days)" },
                            React.createElement(input_1.Input, { type: "number", min: "1", value: ticketsGeneral.closeAfterDays, onChange: function (e) { return setTicketsGeneral(function (p) { return (__assign(__assign({}, p), { closeAfterDays: e.target.value })); }); } }))),
                    React.createElement(SaveButton, { saving: !!saving["tickets-general"], onClick: function () { return save("tickets-general", function () { return updateByCategory.mutateAsync({ category: "tickets_general", values: __assign(__assign({}, ticketsGeneral), { allowClientTickets: String(ticketsGeneral.allowClientTickets), autoAssign: String(ticketsGeneral.autoAssign), notifyAgents: String(ticketsGeneral.notifyAgents) }) }); }); } })));
            case "tickets-departments":
                return (React.createElement(Section, { title: "Ticket Departments", description: "Organize tickets by department" },
                    React.createElement("div", { className: "space-y-2" }, ticketDepts.map(function (d) { return (React.createElement("div", { key: d.id, className: "flex items-center justify-between p-2 border rounded" },
                        React.createElement("span", { className: "text-sm" }, d.name),
                        React.createElement("button", { onClick: function () { var u = ticketDepts.filter(function (x) { return x.id !== d.id; }); setTicketDepts(u); updateByCategory.mutate({ category: "ticket_departments", values: { list: JSON.stringify(u) } }); }, className: "text-destructive hover:text-destructive/80" },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); })),
                    React.createElement("div", { className: "flex gap-2 items-end mt-3" },
                        React.createElement(Field, { label: "Department Name" },
                            React.createElement(input_1.Input, { value: newTicketDept.name, onChange: function (e) { return setNewTicketDept({ name: e.target.value }); }, placeholder: "e.g. Technical Support" })),
                        React.createElement(button_1.Button, { size: "sm", onClick: function () { if (!newTicketDept.name) {
                                sonner_1.toast.error("Name required");
                                return;
                            } var u = __spreadArrays(ticketDepts, [__assign({ id: crypto.randomUUID() }, newTicketDept)]); setTicketDepts(u); setNewTicketDept({ name: "" }); updateByCategory.mutate({ category: "ticket_departments", values: { list: JSON.stringify(u) } }); } },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                            "Add"))));
            case "tickets-statuses":
                return (React.createElement(Section, { title: "Ticket Statuses", description: "Define statuses for support tickets" },
                    React.createElement("div", { className: "space-y-2" }, ticketStatuses.map(function (s) { return (React.createElement("div", { key: s.id, className: "flex items-center justify-between p-2 border rounded" },
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("div", { className: "h-3 w-3 rounded-full", style: { backgroundColor: s.color } }),
                            React.createElement("span", { className: "text-sm" }, s.name)),
                        React.createElement("button", { onClick: function () { var u = ticketStatuses.filter(function (x) { return x.id !== s.id; }); setTicketStatuses(u); updateByCategory.mutate({ category: "ticket_statuses", values: { list: JSON.stringify(u) } }); }, className: "text-destructive hover:text-destructive/80" },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); })),
                    React.createElement("div", { className: "flex gap-2 items-end mt-3" },
                        React.createElement(Field, { label: "Name" },
                            React.createElement(input_1.Input, { value: newTicketStatus.name, onChange: function (e) { return setNewTicketStatus(function (p) { return (__assign(__assign({}, p), { name: e.target.value })); }); }, placeholder: "Status name" })),
                        React.createElement(Field, { label: "Color" },
                            React.createElement("input", { type: "color", value: newTicketStatus.color, onChange: function (e) { return setNewTicketStatus(function (p) { return (__assign(__assign({}, p), { color: e.target.value })); }); }, className: "h-9 w-14 cursor-pointer rounded border border-input p-1" })),
                        React.createElement(button_1.Button, { size: "sm", onClick: function () { if (!newTicketStatus.name) {
                                sonner_1.toast.error("Name required");
                                return;
                            } var u = __spreadArrays(ticketStatuses, [__assign({ id: crypto.randomUUID() }, newTicketStatus)]); setTicketStatuses(u); setNewTicketStatus({ name: "", color: "#3b82f6" }); updateByCategory.mutate({ category: "ticket_statuses", values: { list: JSON.stringify(u) } }); } },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                            "Add"))));
            case "tickets-canned":
                return (React.createElement(Section, { title: "Canned Responses", description: "Pre-written responses for common ticket replies" },
                    React.createElement("div", { className: "space-y-2" }, ticketCanned.map(function (c) { return (React.createElement("div", { key: c.id, className: "flex items-center justify-between p-3 border rounded" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm font-medium" }, c.name),
                            React.createElement("p", { className: "text-xs text-muted-foreground line-clamp-1" }, c.body)),
                        React.createElement("button", { onClick: function () { var u = ticketCanned.filter(function (x) { return x.id !== c.id; }); setTicketCanned(u); updateByCategory.mutate({ category: "ticket_canned", values: { list: JSON.stringify(u) } }); }, className: "text-destructive hover:text-destructive/80" },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); })),
                    React.createElement(separator_1.Separator, null),
                    React.createElement("div", { className: "space-y-3" },
                        React.createElement(Field, { label: "Response Name" },
                            React.createElement(input_1.Input, { value: newCanned.name, onChange: function (e) { return setNewCanned(function (p) { return (__assign(__assign({}, p), { name: e.target.value })); }); }, placeholder: "e.g. Greeting" })),
                        React.createElement(Field, { label: "Response Body" },
                            React.createElement(RichTextEditor_1.RichTextEditor, { value: newCanned.body, onChange: function (html) { return setNewCanned(function (p) { return (__assign(__assign({}, p), { body: html })); }); }, placeholder: "Type the canned response text...", minHeight: "100px" })),
                        React.createElement(button_1.Button, { size: "sm", onClick: function () { if (!newCanned.name || !newCanned.body) {
                                sonner_1.toast.error("Name and body required");
                                return;
                            } var u = __spreadArrays(ticketCanned, [__assign({ id: crypto.randomUUID() }, newCanned)]); setTicketCanned(u); setNewCanned({ name: "", body: "" }); updateByCategory.mutate({ category: "ticket_canned", values: { list: JSON.stringify(u) } }); } },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                            "Add"))));
            // ── KNOWLEDGEBASE ─────────────────────────────────────────────────────
            case "kb-general":
                return (React.createElement(Section, { title: "Knowledgebase Settings", description: "Configure the self-service knowledgebase" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Guest Access"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Non-logged-in users can view articles")),
                            React.createElement(switch_1.Switch, { checked: kbGeneral.guestAccess, onCheckedChange: function (v) { return setKbGeneral(function (p) { return (__assign(__assign({}, p), { guestAccess: v })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Enable Comments"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Users can comment on articles")),
                            React.createElement(switch_1.Switch, { checked: kbGeneral.enableComments, onCheckedChange: function (v) { return setKbGeneral(function (p) { return (__assign(__assign({}, p), { enableComments: v })); }); } })),
                        React.createElement(Field, { label: "Articles Per Page" },
                            React.createElement(input_1.Input, { type: "number", min: "5", value: kbGeneral.articlesPerPage, onChange: function (e) { return setKbGeneral(function (p) { return (__assign(__assign({}, p), { articlesPerPage: e.target.value })); }); } }))),
                    React.createElement(SaveButton, { saving: !!saving["kb-general"], onClick: function () { return save("kb-general", function () { return updateByCategory.mutateAsync({ category: "kb_general", values: { guestAccess: String(kbGeneral.guestAccess), enableComments: String(kbGeneral.enableComments), articlesPerPage: kbGeneral.articlesPerPage } }); }); } })));
            case "kb-categories":
                return (React.createElement(Section, { title: "KB Categories", description: "Organize knowledgebase articles by category" },
                    React.createElement("div", { className: "space-y-2" }, kbCategories.map(function (c) { return (React.createElement("div", { key: c.id, className: "flex items-center justify-between p-2 border rounded" },
                        React.createElement("span", { className: "text-sm" }, c.name),
                        React.createElement("button", { onClick: function () { var u = kbCategories.filter(function (x) { return x.id !== c.id; }); setKbCategories(u); updateByCategory.mutate({ category: "kb_categories", values: { list: JSON.stringify(u) } }); }, className: "text-destructive hover:text-destructive/80" },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); })),
                    React.createElement("div", { className: "flex gap-2 items-end mt-3" },
                        React.createElement(Field, { label: "Category Name" },
                            React.createElement(input_1.Input, { value: newKbCat.name, onChange: function (e) { return setNewKbCat({ name: e.target.value }); }, placeholder: "Category name" })),
                        React.createElement(button_1.Button, { size: "sm", onClick: function () { if (!newKbCat.name) {
                                sonner_1.toast.error("Name required");
                                return;
                            } var u = __spreadArrays(kbCategories, [__assign({ id: crypto.randomUUID() }, newKbCat)]); setKbCategories(u); setNewKbCat({ name: "" }); updateByCategory.mutate({ category: "kb_categories", values: { list: JSON.stringify(u) } }); } },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                            "Add"))));
            // ── ANNOUNCEMENTS ─────────────────────────────────────────────────────
            case "announcements-general":
                return (React.createElement(Section, { title: "Announcement Settings", description: "Configure system announcements" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Enable Announcements"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Show announcements to users")),
                            React.createElement(switch_1.Switch, { checked: announcementsGeneral.enabled, onCheckedChange: function (v) { return setAnnouncementsGeneral(function (p) { return (__assign(__assign({}, p), { enabled: v })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Default Audience: All"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "New announcements visible to everyone by default")),
                            React.createElement(switch_1.Switch, { checked: announcementsGeneral.defaultAudienceAll, onCheckedChange: function (v) { return setAnnouncementsGeneral(function (p) { return (__assign(__assign({}, p), { defaultAudienceAll: v })); }); } }))),
                    React.createElement(SaveButton, { saving: !!saving["announcements-general"], onClick: function () { return save("announcements-general", function () { return updateByCategory.mutateAsync({ category: "announcements_general", values: { enabled: String(announcementsGeneral.enabled), defaultAudienceAll: String(announcementsGeneral.defaultAudienceAll) } }); }); } })));
            case "announcements-list":
                return (React.createElement(Section, { title: "Manage Announcements", description: "Create and manage system announcements" },
                    React.createElement("div", { className: "space-y-2" }, announcementsList.map(function (a) { return (React.createElement("div", { key: a.id, className: "flex items-center justify-between p-3 border rounded" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm font-medium" }, a.title),
                            React.createElement("p", { className: "text-xs text-muted-foreground" },
                                a.audience,
                                " \u00B7 ",
                                a.date || "No date")),
                        React.createElement("button", { onClick: function () { var u = announcementsList.filter(function (x) { return x.id !== a.id; }); setAnnouncementsList(u); updateByCategory.mutate({ category: "announcements_list", values: { list: JSON.stringify(u) } }); }, className: "text-destructive hover:text-destructive/80" },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); })),
                    React.createElement(separator_1.Separator, null),
                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" },
                        React.createElement(Field, { label: "Title" },
                            React.createElement(input_1.Input, { value: newAnnouncement.title, onChange: function (e) { return setNewAnnouncement(function (p) { return (__assign(__assign({}, p), { title: e.target.value })); }); }, placeholder: "Announcement title" })),
                        React.createElement(Field, { label: "Audience" },
                            React.createElement(select_1.Select, { value: newAnnouncement.audience, onValueChange: function (v) { return setNewAnnouncement(function (p) { return (__assign(__assign({}, p), { audience: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "all" }, "All Users"),
                                    React.createElement(select_1.SelectItem, { value: "staff" }, "Staff Only"),
                                    React.createElement(select_1.SelectItem, { value: "clients" }, "Clients Only"))))),
                    React.createElement(Field, { label: "Message" },
                        React.createElement(RichTextEditor_1.RichTextEditor, { value: newAnnouncement.message, onChange: function (html) { return setNewAnnouncement(function (p) { return (__assign(__assign({}, p), { message: html })); }); }, placeholder: "Announcement message", minHeight: "80px" })),
                    React.createElement(button_1.Button, { size: "sm", onClick: function () { if (!newAnnouncement.title) {
                            sonner_1.toast.error("Title required");
                            return;
                        } var u = __spreadArrays(announcementsList, [__assign(__assign({ id: crypto.randomUUID() }, newAnnouncement), { date: new Date().toISOString().slice(0, 10) })]); setAnnouncementsList(u); setNewAnnouncement({ title: "", message: "", audience: "all", date: "" }); updateByCategory.mutate({ category: "announcements_list", values: { list: JSON.stringify(u) } }); } },
                        React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                        "Add Announcement")));
            // ── GOALS ─────────────────────────────────────────────────────────────
            case "goals-general":
                return (React.createElement(Section, { title: "Goal Settings", description: "Configure goal tracking" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Enable Goals Module"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Allow teams to set and track goals")),
                            React.createElement(switch_1.Switch, { checked: goalsGeneral.enableModule, onCheckedChange: function (v) { return setGoalsGeneral(function (p) { return (__assign(__assign({}, p), { enableModule: v })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Allow Team Goals"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Teams can collaborate on shared goals")),
                            React.createElement(switch_1.Switch, { checked: goalsGeneral.allowTeamGoals, onCheckedChange: function (v) { return setGoalsGeneral(function (p) { return (__assign(__assign({}, p), { allowTeamGoals: v })); }); } }))),
                    React.createElement(SaveButton, { saving: !!saving["goals-general"], onClick: function () { return save("goals-general", function () { return updateByCategory.mutateAsync({ category: "goals_general", values: { enableModule: String(goalsGeneral.enableModule), allowTeamGoals: String(goalsGeneral.allowTeamGoals) } }); }); } })));
            case "goals-categories":
                return (React.createElement(Section, { title: "Goal Categories", description: "Organize goals by category" },
                    React.createElement("div", { className: "space-y-2" }, goalsCategories.map(function (c) { return (React.createElement("div", { key: c.id, className: "flex items-center justify-between p-2 border rounded" },
                        React.createElement("span", { className: "text-sm" }, c.name),
                        React.createElement("button", { onClick: function () { var u = goalsCategories.filter(function (x) { return x.id !== c.id; }); setGoalsCategories(u); updateByCategory.mutate({ category: "goals_categories", values: { list: JSON.stringify(u) } }); }, className: "text-destructive hover:text-destructive/80" },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); })),
                    React.createElement("div", { className: "flex gap-2 items-end mt-3" },
                        React.createElement(Field, { label: "Category Name" },
                            React.createElement(input_1.Input, { value: newGoalsCat.name, onChange: function (e) { return setNewGoalsCat({ name: e.target.value }); }, placeholder: "Category name" })),
                        React.createElement(button_1.Button, { size: "sm", onClick: function () { if (!newGoalsCat.name) {
                                sonner_1.toast.error("Name required");
                                return;
                            } var u = __spreadArrays(goalsCategories, [__assign({ id: crypto.randomUUID() }, newGoalsCat)]); setGoalsCategories(u); setNewGoalsCat({ name: "" }); updateByCategory.mutate({ category: "goals_categories", values: { list: JSON.stringify(u) } }); } },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                            "Add"))));
            // ── REMINDERS ─────────────────────────────────────────────────────────
            case "reminders-general":
                return (React.createElement(Section, { title: "Reminder Settings", description: "Configure default reminder channels and timing" },
                    React.createElement(Field, { label: "Default Reminder (minutes before)" },
                        React.createElement(input_1.Input, { type: "number", min: "1", value: remindersGeneral.defaultMinutesBefore, onChange: function (e) { return setRemindersGeneral(function (p) { return (__assign(__assign({}, p), { defaultMinutesBefore: e.target.value })); }); } })),
                    React.createElement("div", { className: "space-y-3 mt-4" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("p", { className: "text-sm" }, "Email Channel"),
                            React.createElement(switch_1.Switch, { checked: remindersGeneral.emailChannel, onCheckedChange: function (v) { return setRemindersGeneral(function (p) { return (__assign(__assign({}, p), { emailChannel: v })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("p", { className: "text-sm" }, "Push Notification Channel"),
                            React.createElement(switch_1.Switch, { checked: remindersGeneral.pushChannel, onCheckedChange: function (v) { return setRemindersGeneral(function (p) { return (__assign(__assign({}, p), { pushChannel: v })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("p", { className: "text-sm" }, "SMS Channel"),
                            React.createElement(switch_1.Switch, { checked: remindersGeneral.smsChannel, onCheckedChange: function (v) { return setRemindersGeneral(function (p) { return (__assign(__assign({}, p), { smsChannel: v })); }); } }))),
                    React.createElement(SaveButton, { saving: !!saving["reminders-general"], onClick: function () { return save("reminders-general", function () { return updateByCategory.mutateAsync({ category: "reminders_general", values: { defaultMinutesBefore: remindersGeneral.defaultMinutesBefore, emailChannel: String(remindersGeneral.emailChannel), pushChannel: String(remindersGeneral.pushChannel), smsChannel: String(remindersGeneral.smsChannel) } }); }); } })));
            // ── SECURITY ──────────────────────────────────────────────────────────
            case "security-password":
                return (React.createElement(Section, { title: "Password Policy", description: "Configure password requirements for all users" },
                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                        React.createElement(Field, { label: "Minimum Length" },
                            React.createElement(input_1.Input, { type: "number", min: "6", value: securityPassword.minLength, onChange: function (e) { return setSecurityPassword(function (p) { return (__assign(__assign({}, p), { minLength: e.target.value })); }); } })),
                        React.createElement(Field, { label: "Password Expiry (days)" },
                            React.createElement(input_1.Input, { type: "number", min: "0", value: securityPassword.expiryDays, onChange: function (e) { return setSecurityPassword(function (p) { return (__assign(__assign({}, p), { expiryDays: e.target.value })); }); }, placeholder: "0 = never" }))),
                    React.createElement("div", { className: "space-y-3 mt-4" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("p", { className: "text-sm" }, "Require Uppercase Letter"),
                            React.createElement(switch_1.Switch, { checked: securityPassword.requireUppercase, onCheckedChange: function (v) { return setSecurityPassword(function (p) { return (__assign(__assign({}, p), { requireUppercase: v })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("p", { className: "text-sm" }, "Require Number"),
                            React.createElement(switch_1.Switch, { checked: securityPassword.requireNumbers, onCheckedChange: function (v) { return setSecurityPassword(function (p) { return (__assign(__assign({}, p), { requireNumbers: v })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("p", { className: "text-sm" }, "Require Special Character"),
                            React.createElement(switch_1.Switch, { checked: securityPassword.requireSpecial, onCheckedChange: function (v) { return setSecurityPassword(function (p) { return (__assign(__assign({}, p), { requireSpecial: v })); }); } }))),
                    React.createElement(SaveButton, { saving: !!saving["security-password"], onClick: function () { return save("security-password", function () { return updateByCategory.mutateAsync({ category: "security_password", values: __assign(__assign({}, securityPassword), { requireUppercase: String(securityPassword.requireUppercase), requireNumbers: String(securityPassword.requireNumbers), requireSpecial: String(securityPassword.requireSpecial) }) }); }); } })));
            case "security-2fa":
                return (React.createElement(Section, { title: "Two-Factor Authentication", description: "Configure 2FA settings for the organization" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Enable 2FA"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Allow users to enable two-factor authentication")),
                            React.createElement(switch_1.Switch, { checked: twofa.enabled, onCheckedChange: function (v) { return setTwofa(function (p) { return (__assign(__assign({}, p), { enabled: v })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Require for Admins"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Force 2FA for admin-level users")),
                            React.createElement(switch_1.Switch, { checked: twofa.requireForAdmins, onCheckedChange: function (v) { return setTwofa(function (p) { return (__assign(__assign({}, p), { requireForAdmins: v })); }); } })),
                        React.createElement(Field, { label: "Authentication Method" },
                            React.createElement(select_1.Select, { value: twofa.method, onValueChange: function (v) { return setTwofa(function (p) { return (__assign(__assign({}, p), { method: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "totp" }, "TOTP (Authenticator App)"),
                                    React.createElement(select_1.SelectItem, { value: "sms" }, "SMS Code"),
                                    React.createElement(select_1.SelectItem, { value: "email" }, "Email Code"))))),
                    React.createElement(SaveButton, { saving: !!saving["security-2fa"], onClick: function () { return save("security-2fa", function () { return updateByCategory.mutateAsync({ category: "security_2fa", values: __assign(__assign({}, twofa), { enabled: String(twofa.enabled), requireForAdmins: String(twofa.requireForAdmins) }) }); }); } })));
            case "security-sessions":
                return (React.createElement(Section, { title: "Active Sessions", description: "View and manage active user sessions" },
                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "Active session management will show currently logged-in users and allow terminating sessions."),
                    React.createElement("div", { className: "border rounded-md p-4 bg-muted/40" },
                        React.createElement("div", { className: "flex items-center gap-3" },
                            React.createElement(lucide_react_1.Activity, { className: "h-5 w-5 text-green-500" }),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Current Session"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Browser \u00B7 Active now"))))));
            case "security-log":
                return (React.createElement(Section, { title: "Login History", description: "View recent login attempts" },
                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "Login history will be displayed here showing successful and failed login attempts with IP addresses and timestamps.")));
            // ── GDPR ──────────────────────────────────────────────────────────────
            case "gdpr-general":
                return (React.createElement(Section, { title: "GDPR Settings", description: "Configure data protection compliance" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Enable GDPR Module"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Activate GDPR compliance features")),
                            React.createElement(switch_1.Switch, { checked: gdprGeneral.enabled, onCheckedChange: function (v) { return setGdprGeneral(function (p) { return (__assign(__assign({}, p), { enabled: v })); }); } })),
                        React.createElement(Field, { label: "Data Retention (days)" },
                            React.createElement(input_1.Input, { type: "number", min: "30", value: gdprGeneral.retentionDays, onChange: function (e) { return setGdprGeneral(function (p) { return (__assign(__assign({}, p), { retentionDays: e.target.value })); }); } }))),
                    React.createElement(SaveButton, { saving: !!saving["gdpr-general"], onClick: function () { return save("gdpr-general", function () { return updateByCategory.mutateAsync({ category: "gdpr_general", values: { enabled: String(gdprGeneral.enabled), retentionDays: gdprGeneral.retentionDays } }); }); } })));
            case "gdpr-cookies":
                return (React.createElement(Section, { title: "Cookie Consent", description: "Configure cookie consent banner" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Show Cookie Banner"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Display cookie consent to visitors")),
                            React.createElement(switch_1.Switch, { checked: gdprCookies.bannerEnabled, onCheckedChange: function (v) { return setGdprCookies(function (p) { return (__assign(__assign({}, p), { bannerEnabled: v })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Analytics Cookies"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Allow analytics tracking cookies")),
                            React.createElement(switch_1.Switch, { checked: gdprCookies.analyticsEnabled, onCheckedChange: function (v) { return setGdprCookies(function (p) { return (__assign(__assign({}, p), { analyticsEnabled: v })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Marketing Cookies"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Allow marketing and advertising cookies")),
                            React.createElement(switch_1.Switch, { checked: gdprCookies.marketingEnabled, onCheckedChange: function (v) { return setGdprCookies(function (p) { return (__assign(__assign({}, p), { marketingEnabled: v })); }); } }))),
                    React.createElement(SaveButton, { saving: !!saving["gdpr-cookies"], onClick: function () { return save("gdpr-cookies", function () { return updateByCategory.mutateAsync({ category: "gdpr_cookies", values: { bannerEnabled: String(gdprCookies.bannerEnabled), analyticsEnabled: String(gdprCookies.analyticsEnabled), marketingEnabled: String(gdprCookies.marketingEnabled) } }); }); } })));
            case "gdpr-data-requests":
                return (React.createElement(Section, { title: "Data Requests", description: "Manage user data access and export requests" },
                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "No pending data requests. When users request their data under GDPR, requests will appear here.")));
            case "gdpr-deletion":
                return (React.createElement(Section, { title: "Data Deletion", description: "Manage data deletion requests" },
                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "No pending deletion requests. When users request data deletion under their right to be forgotten, requests will appear here.")));
            // ── SMS ───────────────────────────────────────────────────────────────
            case "sms-settings":
                return (React.createElement(Section, { title: "SMS Settings", description: "Configure SMS provider and credentials" },
                    React.createElement(Field, { label: "SMS Provider" },
                        React.createElement(select_1.Select, { value: smsSettings.provider, onValueChange: function (v) { return setSmsSettings(function (p) { return (__assign(__assign({}, p), { provider: v })); }); } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "twilio" }, "Twilio"),
                                React.createElement(select_1.SelectItem, { value: "africastalking" }, "Africa's Talking")))),
                    smsSettings.provider === "twilio" ? (React.createElement("div", { className: "grid grid-cols-1 gap-4" },
                        React.createElement(Field, { label: "Account SID" },
                            React.createElement(input_1.Input, { value: smsSettings.accountSid, onChange: function (e) { return setSmsSettings(function (p) { return (__assign(__assign({}, p), { accountSid: e.target.value })); }); }, placeholder: "AC\u2026" })),
                        React.createElement(Field, { label: "Auth Token" },
                            React.createElement(input_1.Input, { type: "password", value: smsSettings.authToken, onChange: function (e) { return setSmsSettings(function (p) { return (__assign(__assign({}, p), { authToken: e.target.value })); }); } })),
                        React.createElement(Field, { label: "From Number" },
                            React.createElement(input_1.Input, { value: smsSettings.fromNumber, onChange: function (e) { return setSmsSettings(function (p) { return (__assign(__assign({}, p), { fromNumber: e.target.value })); }); }, placeholder: "+1234567890" })))) : (React.createElement("div", { className: "grid grid-cols-1 gap-4" },
                        React.createElement(Field, { label: "API Key" },
                            React.createElement(input_1.Input, { value: smsSettings.atApiKey, onChange: function (e) { return setSmsSettings(function (p) { return (__assign(__assign({}, p), { atApiKey: e.target.value })); }); } })),
                        React.createElement(Field, { label: "Username" },
                            React.createElement(input_1.Input, { value: smsSettings.atUsername, onChange: function (e) { return setSmsSettings(function (p) { return (__assign(__assign({}, p), { atUsername: e.target.value })); }); } })))),
                    React.createElement(SaveButton, { saving: !!saving["sms-settings"], onClick: function () { return save("sms-settings", function () { return updateByCategory.mutateAsync({ category: "sms_settings", values: smsSettings }); }); } })));
            case "sms-templates":
                return (React.createElement(Section, { title: "SMS Templates", description: "Manage SMS message templates" },
                    React.createElement("div", { className: "space-y-2" }, smsTemplates.map(function (t) { return (React.createElement("div", { key: t.id, className: "flex items-center justify-between p-3 border rounded" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm font-medium" }, t.name),
                            React.createElement("p", { className: "text-xs text-muted-foreground line-clamp-1" }, t.body)),
                        React.createElement("button", { onClick: function () { var u = smsTemplates.filter(function (x) { return x.id !== t.id; }); setSmsTemplates(u); updateByCategory.mutate({ category: "sms_templates", values: { list: JSON.stringify(u) } }); }, className: "text-destructive hover:text-destructive/80" },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); })),
                    React.createElement(separator_1.Separator, null),
                    React.createElement("div", { className: "space-y-3" },
                        React.createElement(Field, { label: "Template Name" },
                            React.createElement(input_1.Input, { value: newSmsTemplate.name, onChange: function (e) { return setNewSmsTemplate(function (p) { return (__assign(__assign({}, p), { name: e.target.value })); }); }, placeholder: "e.g. Payment Reminder" })),
                        React.createElement(Field, { label: "Message Body" },
                            React.createElement("textarea", { className: "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm", value: newSmsTemplate.body, onChange: function (e) { return setNewSmsTemplate(function (p) { return (__assign(__assign({}, p), { body: e.target.value })); }); }, placeholder: "Hi {name}, your payment of {amount} is due..." })),
                        React.createElement(button_1.Button, { size: "sm", onClick: function () { if (!newSmsTemplate.name) {
                                sonner_1.toast.error("Name required");
                                return;
                            } var u = __spreadArrays(smsTemplates, [__assign({ id: crypto.randomUUID() }, newSmsTemplate)]); setSmsTemplates(u); setNewSmsTemplate({ name: "", body: "" }); updateByCategory.mutate({ category: "sms_templates", values: { list: JSON.stringify(u) } }); } },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                            "Add"))));
            case "sms-log":
                return (React.createElement(Section, { title: "SMS Log", description: "History of sent SMS messages" },
                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "SMS log is empty. Sent messages will appear here with delivery status.")));
            // ── PUSH NOTIFICATIONS ────────────────────────────────────────────────
            case "push-general":
                return (React.createElement(Section, { title: "Push Notification Settings", description: "Configure browser and mobile push notifications" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm font-medium" }, "Enable Push Notifications"),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Send push notifications to users")),
                        React.createElement(switch_1.Switch, { checked: pushGeneral.enabled, onCheckedChange: function (v) { return setPushGeneral({ enabled: v }); } })),
                    React.createElement(SaveButton, { saving: !!saving["push-general"], onClick: function () { return save("push-general", function () { return updateByCategory.mutateAsync({ category: "push_general", values: { enabled: String(pushGeneral.enabled) } }); }); } })));
            case "push-fcm":
                return (React.createElement(Section, { title: "Firebase Cloud Messaging", description: "Configure FCM for push notifications" },
                    React.createElement("div", { className: "grid grid-cols-1 gap-4" },
                        React.createElement(Field, { label: "Server Key" },
                            React.createElement(input_1.Input, { type: "password", value: fcmSettings.serverKey, onChange: function (e) { return setFcmSettings(function (p) { return (__assign(__assign({}, p), { serverKey: e.target.value })); }); }, placeholder: "FCM Server Key" })),
                        React.createElement(Field, { label: "Sender ID" },
                            React.createElement(input_1.Input, { value: fcmSettings.senderId, onChange: function (e) { return setFcmSettings(function (p) { return (__assign(__assign({}, p), { senderId: e.target.value })); }); }, placeholder: "123456789" })),
                        React.createElement(Field, { label: "VAPID Key" },
                            React.createElement(input_1.Input, { value: fcmSettings.vapidKey, onChange: function (e) { return setFcmSettings(function (p) { return (__assign(__assign({}, p), { vapidKey: e.target.value })); }); }, placeholder: "VAPID public key" }))),
                    React.createElement(SaveButton, { saving: !!saving["push-fcm"], onClick: function () { return save("push-fcm", function () { return updateByCategory.mutateAsync({ category: "push_fcm", values: fcmSettings }); }); } })));
            // ── WEBHOOKS ──────────────────────────────────────────────────────────
            case "webhooks-general":
                return (React.createElement(Section, { title: "Webhook Settings", description: "Configure webhook delivery settings" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Enable Webhooks"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Allow sending event data to external URLs")),
                            React.createElement(switch_1.Switch, { checked: webhooksGeneral.enabled, onCheckedChange: function (v) { return setWebhooksGeneral(function (p) { return (__assign(__assign({}, p), { enabled: v })); }); } })),
                        React.createElement(Field, { label: "Max Retries" },
                            React.createElement(input_1.Input, { type: "number", min: "0", max: "10", value: webhooksGeneral.maxRetries, onChange: function (e) { return setWebhooksGeneral(function (p) { return (__assign(__assign({}, p), { maxRetries: e.target.value })); }); } }))),
                    React.createElement(SaveButton, { saving: !!saving["webhooks-general"], onClick: function () { return save("webhooks-general", function () { return updateByCategory.mutateAsync({ category: "webhooks_general", values: { enabled: String(webhooksGeneral.enabled), maxRetries: webhooksGeneral.maxRetries } }); }); } })));
            case "webhooks-list":
                return (React.createElement(Section, { title: "Manage Webhooks", description: "Create and manage webhook endpoints" },
                    React.createElement("div", { className: "space-y-2" }, webhooksList.map(function (w) { return (React.createElement("div", { key: w.id, className: "flex items-center justify-between p-3 border rounded" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm font-medium" }, w.url),
                            React.createElement("p", { className: "text-xs text-muted-foreground" },
                                w.event,
                                " \u00B7 ",
                                w.enabled ? "Active" : "Disabled")),
                        React.createElement("button", { onClick: function () { var u = webhooksList.filter(function (x) { return x.id !== w.id; }); setWebhooksList(u); updateByCategory.mutate({ category: "webhooks_list", values: { list: JSON.stringify(u) } }); }, className: "text-destructive hover:text-destructive/80" },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); })),
                    React.createElement(separator_1.Separator, null),
                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" },
                        React.createElement(Field, { label: "Endpoint URL" },
                            React.createElement(input_1.Input, { value: newWebhook.url, onChange: function (e) { return setNewWebhook(function (p) { return (__assign(__assign({}, p), { url: e.target.value })); }); }, placeholder: "https://example.com/webhook" })),
                        React.createElement(Field, { label: "Event" },
                            React.createElement(select_1.Select, { value: newWebhook.event, onValueChange: function (v) { return setNewWebhook(function (p) { return (__assign(__assign({}, p), { event: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "invoice.created" }, "Invoice Created"),
                                    React.createElement(select_1.SelectItem, { value: "invoice.paid" }, "Invoice Paid"),
                                    React.createElement(select_1.SelectItem, { value: "client.created" }, "Client Created"),
                                    React.createElement(select_1.SelectItem, { value: "project.created" }, "Project Created"),
                                    React.createElement(select_1.SelectItem, { value: "task.completed" }, "Task Completed"),
                                    React.createElement(select_1.SelectItem, { value: "lead.created" }, "Lead Created"))))),
                    React.createElement(button_1.Button, { size: "sm", onClick: function () { if (!newWebhook.url) {
                            sonner_1.toast.error("URL required");
                            return;
                        } var u = __spreadArrays(webhooksList, [__assign(__assign({ id: crypto.randomUUID() }, newWebhook), { enabled: true })]); setWebhooksList(u); setNewWebhook({ url: "", event: "invoice.created" }); updateByCategory.mutate({ category: "webhooks_list", values: { list: JSON.stringify(u) } }); } },
                        React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                        "Add Webhook")));
            case "webhooks-log":
                return (React.createElement(Section, { title: "Webhook Delivery Log", description: "View webhook delivery attempts and responses" },
                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "No webhook deliveries recorded yet. Delivery attempts will appear here with status codes and response times.")));
            // ── API ACCESS ────────────────────────────────────────────────────────
            case "api-general":
                return (React.createElement(Section, { title: "API Settings", description: "Configure REST API access" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Enable API"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Allow external applications to access your CRM data")),
                            React.createElement(switch_1.Switch, { checked: apiGeneral.enabled, onCheckedChange: function (v) { return setApiGeneral(function (p) { return (__assign(__assign({}, p), { enabled: v })); }); } })),
                        React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                            React.createElement(Field, { label: "Rate Limit" },
                                React.createElement(input_1.Input, { type: "number", min: "1", value: apiGeneral.rateLimit, onChange: function (e) { return setApiGeneral(function (p) { return (__assign(__assign({}, p), { rateLimit: e.target.value })); }); } })),
                            React.createElement(Field, { label: "Per" },
                                React.createElement(select_1.Select, { value: apiGeneral.rateLimitPer, onValueChange: function (v) { return setApiGeneral(function (p) { return (__assign(__assign({}, p), { rateLimitPer: v })); }); } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "minute" }, "Minute"),
                                        React.createElement(select_1.SelectItem, { value: "hour" }, "Hour")))))),
                    React.createElement(SaveButton, { saving: !!saving["api-general"], onClick: function () { return save("api-general", function () { return updateByCategory.mutateAsync({ category: "api_general", values: __assign(__assign({}, apiGeneral), { enabled: String(apiGeneral.enabled) }) }); }); } })));
            case "api-keys":
                return (React.createElement(Section, { title: "API Keys", description: "Manage API keys for external integrations" },
                    React.createElement("div", { className: "space-y-2" }, apiKeys.map(function (k) { return (React.createElement("div", { key: k.id, className: "flex items-center justify-between p-3 border rounded" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm font-medium" }, k.name),
                            React.createElement("p", { className: "text-xs text-muted-foreground font-mono" },
                                k.key.slice(0, 12),
                                "\u2026 \u00B7 ",
                                k.permissions)),
                        React.createElement("button", { onClick: function () { var u = apiKeys.filter(function (x) { return x.id !== k.id; }); setApiKeys(u); updateByCategory.mutate({ category: "api_keys", values: { list: JSON.stringify(u) } }); }, className: "text-destructive hover:text-destructive/80" },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); })),
                    React.createElement(separator_1.Separator, null),
                    React.createElement("div", { className: "flex gap-2 items-end" },
                        React.createElement(Field, { label: "Key Name" },
                            React.createElement(input_1.Input, { value: newApiKeyName, onChange: function (e) { return setNewApiKeyName(e.target.value); }, placeholder: "My Integration" })),
                        React.createElement(button_1.Button, { size: "sm", onClick: function () { if (!newApiKeyName) {
                                sonner_1.toast.error("Name required");
                                return;
                            } var key = "mk_" + crypto.randomUUID().replace(/-/g, ""); var u = __spreadArrays(apiKeys, [{ id: crypto.randomUUID(), name: newApiKeyName, key: key, permissions: "read-write", createdAt: new Date().toISOString().slice(0, 10) }]); setApiKeys(u); setNewApiKeyName(""); updateByCategory.mutate({ category: "api_keys", values: { list: JSON.stringify(u) } }); sonner_1.toast.success("API key created: " + key); } },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                            "Generate Key"))));
            // ── CRON JOBS ─────────────────────────────────────────────────────────
            case "cron-general":
                return (React.createElement(Section, { title: "Cron Settings", description: "Configure scheduled task settings" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Enable Cron Jobs"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Allow automatic scheduled tasks")),
                            React.createElement(switch_1.Switch, { checked: cronGeneral.enabled, onCheckedChange: function (v) { return setCronGeneral(function (p) { return (__assign(__assign({}, p), { enabled: v })); }); } })),
                        React.createElement(Field, { label: "Default Schedule (cron expression)" },
                            React.createElement(input_1.Input, { value: cronGeneral.defaultSchedule, onChange: function (e) { return setCronGeneral(function (p) { return (__assign(__assign({}, p), { defaultSchedule: e.target.value })); }); }, placeholder: "0 * * * *" }))),
                    React.createElement(SaveButton, { saving: !!saving["cron-general"], onClick: function () { return save("cron-general", function () { return updateByCategory.mutateAsync({ category: "cron_general", values: { enabled: String(cronGeneral.enabled), defaultSchedule: cronGeneral.defaultSchedule } }); }); } })));
            case "cron-list":
                return (React.createElement(Section, { title: "Scheduled Jobs", description: "View and manage cron jobs" },
                    React.createElement("div", { className: "space-y-2" }, cronJobs.map(function (j) { return (React.createElement("div", { key: j.id, className: "flex items-center justify-between p-3 border rounded" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm font-medium" }, j.name),
                            React.createElement("p", { className: "text-xs text-muted-foreground" },
                                j.schedule,
                                " \u00B7 ",
                                j.enabled ? "Active" : "Disabled",
                                " ",
                                j.lastRun ? "&middot; Last: " + j.lastRun : "")),
                        React.createElement("button", { onClick: function () { var u = cronJobs.filter(function (x) { return x.id !== j.id; }); setCronJobs(u); updateByCategory.mutate({ category: "cron_jobs", values: { list: JSON.stringify(u) } }); }, className: "text-destructive hover:text-destructive/80" },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); })),
                    cronJobs.length === 0 && React.createElement("p", { className: "text-sm text-muted-foreground" }, "No cron jobs configured.")));
            case "cron-log":
                return (React.createElement(Section, { title: "Cron Log", description: "View cron job execution history" },
                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "No cron job executions recorded. Job runs will appear here with timestamps and status.")));
            // ── reCAPTCHA ─────────────────────────────────────────────────────────
            case "recaptcha":
                return (React.createElement(Section, { title: "reCAPTCHA Settings", description: "Configure Google reCAPTCHA for form protection" },
                    React.createElement(Field, { label: "Version" },
                        React.createElement(select_1.Select, { value: recaptcha.version, onValueChange: function (v) { return setRecaptcha(function (p) { return (__assign(__assign({}, p), { version: v })); }); } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "v2" }, "reCAPTCHA v2"),
                                React.createElement(select_1.SelectItem, { value: "v3" }, "reCAPTCHA v3")))),
                    React.createElement("div", { className: "grid grid-cols-1 gap-4" },
                        React.createElement(Field, { label: "Site Key" },
                            React.createElement(input_1.Input, { value: recaptcha.siteKey, onChange: function (e) { return setRecaptcha(function (p) { return (__assign(__assign({}, p), { siteKey: e.target.value })); }); }, placeholder: "6Ld\u2026" })),
                        React.createElement(Field, { label: "Secret Key" },
                            React.createElement(input_1.Input, { type: "password", value: recaptcha.secretKey, onChange: function (e) { return setRecaptcha(function (p) { return (__assign(__assign({}, p), { secretKey: e.target.value })); }); }, placeholder: "Secret Key" }))),
                    React.createElement(SaveButton, { saving: !!saving["recaptcha"], onClick: function () { return save("recaptcha", function () { return updateByCategory.mutateAsync({ category: "recaptcha", values: recaptcha }); }); } })));
            // ── CUSTOM FIELDS (inline per entity) ───────────────────────────────
            case "custom-fields-clients":
            case "custom-fields-projects":
            case "custom-fields-tasks":
            case "custom-fields-leads":
            case "custom-fields-tickets":
            case "custom-fields-products": {
                var entityMap = { "custom-fields-clients": "Client", "custom-fields-projects": "Project", "custom-fields-tasks": "Task", "custom-fields-leads": "Lead", "custom-fields-tickets": "Ticket", "custom-fields-products": "Product" };
                var entity_1 = entityMap[activeSection] || "Client";
                var filtered = customFields.filter(function (f) { return f.entity === entity_1 && (cfSearch ? f.name.toLowerCase().includes(cfSearch.toLowerCase()) : true); });
                return (React.createElement(Section, { title: "Custom Fields \u2013 " + entity_1 + "s", description: "Add custom data fields to " + entity_1.toLowerCase() + " records" },
                    React.createElement("div", { className: "flex items-center justify-between mb-4" },
                        React.createElement("div", { className: "relative w-64" },
                            React.createElement(lucide_react_1.Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }),
                            React.createElement(input_1.Input, { className: "pl-8", placeholder: "Search fields\u2026", value: cfSearch, onChange: function (e) { return setCfSearch(e.target.value); } })),
                        React.createElement(dialog_1.Dialog, { open: cfDialogOpen, onOpenChange: setCfDialogOpen },
                            React.createElement(dialog_1.DialogTrigger, { asChild: true },
                                React.createElement(button_1.Button, { size: "sm" },
                                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                                    "Add Field")),
                            React.createElement(dialog_1.DialogContent, null,
                                React.createElement(dialog_1.DialogHeader, null,
                                    React.createElement(dialog_1.DialogTitle, null, "Add Custom Field"),
                                    React.createElement(dialog_1.DialogDescription, null,
                                        "Create a new custom field for ",
                                        entity_1.toLowerCase(),
                                        " records.")),
                                React.createElement("div", { className: "space-y-4" },
                                    React.createElement(Field, { label: "Field Name" },
                                        React.createElement(input_1.Input, { value: cfForm.name, onChange: function (e) { return setCfForm(function (p) { return (__assign(__assign({}, p), { name: e.target.value })); }); }, placeholder: "e.g. Company Size" })),
                                    React.createElement(Field, { label: "Field Type" },
                                        React.createElement(select_1.Select, { value: cfForm.type, onValueChange: function (v) { return setCfForm(function (p) { return (__assign(__assign({}, p), { type: v })); }); } },
                                            React.createElement(select_1.SelectTrigger, null,
                                                React.createElement(select_1.SelectValue, null)),
                                            React.createElement(select_1.SelectContent, null, ["Text", "Number", "Date", "Dropdown", "Checkbox", "Multi-Select", "Email", "Phone", "URL", "Currency", "Percentage", "Long Text", "File Upload", "Rating"].map(function (t) { return React.createElement(select_1.SelectItem, { key: t, value: t }, t); })))),
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        React.createElement(switch_1.Switch, { checked: cfForm.required, onCheckedChange: function (v) { return setCfForm(function (p) { return (__assign(__assign({}, p), { required: v })); }); } }),
                                        React.createElement(label_1.Label, null, "Required"))),
                                React.createElement(dialog_1.DialogFooter, null,
                                    React.createElement(button_1.Button, { onClick: function () { if (!cfForm.name) {
                                            sonner_1.toast.error("Field name required");
                                            return;
                                        } setCustomFields(function (prev) { return __spreadArrays(prev, [__assign(__assign({ id: crypto.randomUUID() }, cfForm), { entity: entity_1, active: true })]); }); setCfForm({ name: "", type: "Text", entity: "Client", required: false }); setCfDialogOpen(false); sonner_1.toast.success("Custom field added"); } }, "Add Field"))))),
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Field Name"),
                                React.createElement(table_1.TableHead, null, "Type"),
                                React.createElement(table_1.TableHead, null, "Required"),
                                React.createElement(table_1.TableHead, null, "Status"),
                                React.createElement(table_1.TableHead, { className: "w-20" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, filtered.length === 0 ? (React.createElement(table_1.TableRow, null,
                            React.createElement(table_1.TableCell, { colSpan: 5, className: "text-center text-muted-foreground py-8" },
                                "No custom fields for ",
                                entity_1.toLowerCase(),
                                "s yet."))) : filtered.map(function (f) { return (React.createElement(table_1.TableRow, { key: f.id },
                            React.createElement(table_1.TableCell, { className: "font-medium" }, f.name),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { variant: "outline" }, f.type)),
                            React.createElement(table_1.TableCell, null, f.required ? React.createElement(badge_1.Badge, { className: "bg-red-100 text-red-700" }, "Required") : React.createElement(badge_1.Badge, { variant: "secondary" }, "Optional")),
                            React.createElement(table_1.TableCell, null, f.active ? React.createElement(badge_1.Badge, { className: "bg-green-100 text-green-700" }, "Active") : React.createElement(badge_1.Badge, { variant: "secondary" }, "Inactive")),
                            React.createElement(table_1.TableCell, null,
                                React.createElement("button", { onClick: function () { setCustomFields(function (prev) { return prev.filter(function (x) { return x.id !== f.id; }); }); sonner_1.toast.success("Field removed"); }, className: "text-destructive hover:text-destructive/80" },
                                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))))); })))));
            }
            // ── PERMISSIONS (inline) ───────────────────────────────────────────────
            case "permissions-matrix": {
                var permCategories_1 = [
                    { name: "Clients", key: "clients", perms: ["View", "Create", "Edit", "Delete", "Export"] },
                    { name: "Invoices", key: "invoices", perms: ["View", "Create", "Edit", "Delete", "Send"] },
                    { name: "Projects", key: "projects", perms: ["View", "Create", "Edit", "Delete", "Manage Members"] },
                    { name: "Tasks", key: "tasks", perms: ["View", "Create", "Edit", "Delete", "Assign"] },
                    { name: "Leads", key: "leads", perms: ["View", "Create", "Edit", "Delete", "Convert"] },
                    { name: "Estimates", key: "estimates", perms: ["View", "Create", "Edit", "Delete", "Send"] },
                    { name: "Proposals", key: "proposals", perms: ["View", "Create", "Edit", "Delete", "Send"] },
                    { name: "Contracts", key: "contracts", perms: ["View", "Create", "Edit", "Delete", "Sign"] },
                    { name: "Expenses", key: "expenses", perms: ["View", "Create", "Edit", "Delete", "Approve"] },
                    { name: "Tickets", key: "tickets", perms: ["View", "Create", "Edit", "Delete", "Assign"] },
                    { name: "Reports", key: "reports", perms: ["View", "Export", "Schedule"] },
                    { name: "Settings", key: "settings", perms: ["View", "Modify"] },
                ];
                return (React.createElement(Section, { title: "Advanced Permissions", description: "Fine-grained permission control by role and module" },
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" }, permCategories_1.map(function (cat) { return (React.createElement(card_1.Card, { key: cat.key, className: "hover:shadow-md transition-shadow" },
                        React.createElement(card_1.CardHeader, { className: "pb-2" },
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement(card_1.CardTitle, { className: "text-sm" }, cat.name),
                                React.createElement(badge_1.Badge, { variant: "outline" },
                                    cat.perms.length,
                                    " perms"))),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("div", { className: "space-y-2" }, cat.perms.map(function (p) {
                                var _a;
                                var permKey = cat.key + "_" + p.toLowerCase().replace(/\s+/g, "_");
                                return (React.createElement("div", { key: p, className: "flex items-center justify-between" },
                                    React.createElement("span", { className: "text-xs text-muted-foreground" }, p),
                                    React.createElement(switch_1.Switch, { checked: (_a = permState[permKey]) !== null && _a !== void 0 ? _a : true, onCheckedChange: function (v) { return setPermState(function (prev) {
                                            var _a;
                                            return (__assign(__assign({}, prev), (_a = {}, _a[permKey] = v, _a)));
                                        }); } })));
                            }))))); })),
                    React.createElement(SaveButton, { saving: !!saving["permissions"], onClick: function () { return save("permissions", function () { return __awaiter(_this, void 0, void 0, function () {
                            var permValues;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        permValues = {};
                                        permCategories_1.forEach(function (cat) {
                                            cat.perms.forEach(function (p) {
                                                var k = cat.key + "_" + p.toLowerCase().replace(/\s+/g, "_");
                                                permValues[k] = permState[k] ? "true" : "false";
                                            });
                                        });
                                        return [4 /*yield*/, updateByCategory.mutateAsync({ category: "permissions", values: permValues })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); }); } })));
            }
            // ── INTEGRATIONS (inline) ──────────────────────────────────────────────
            case "integrations-page": {
                var integrations = (integrationsData === null || integrationsData === void 0 ? void 0 : integrationsData.integrations) || [];
                var activeInts = integrations.filter(function (i) { return i.isActive; });
                var providers = [
                    { name: "SMTP", desc: "Email delivery", icon: React.createElement(lucide_react_1.Mail, { className: "h-5 w-5" }) },
                    { name: "Slack", desc: "Team notifications", icon: React.createElement(lucide_react_1.MessageSquare, { className: "h-5 w-5" }) },
                    { name: "Stripe", desc: "Payment processing", icon: React.createElement(lucide_react_1.CreditCard, { className: "h-5 w-5" }) },
                    { name: "M-Pesa", desc: "Mobile money", icon: React.createElement(lucide_react_1.Smartphone, { className: "h-5 w-5" }) },
                    { name: "SendGrid", desc: "Email API", icon: React.createElement(lucide_react_1.Mail, { className: "h-5 w-5" }) },
                    { name: "Twilio", desc: "SMS & Voice", icon: React.createElement(lucide_react_1.Smartphone, { className: "h-5 w-5" }) },
                ];
                return (React.createElement(Section, { title: "All Integrations", description: "Connect third-party services to your CRM" },
                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4" },
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardContent, { className: "pt-4 text-center" },
                                React.createElement("p", { className: "text-2xl font-bold" }, integrations.length),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Total"))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardContent, { className: "pt-4 text-center" },
                                React.createElement("p", { className: "text-2xl font-bold text-green-600" }, activeInts.length),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Active"))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardContent, { className: "pt-4 text-center" },
                                React.createElement("p", { className: "text-2xl font-bold text-gray-400" }, integrations.length - activeInts.length),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Inactive")))),
                    React.createElement(tabs_1.Tabs, { defaultValue: "configured" },
                        React.createElement(tabs_1.TabsList, { className: "mb-3" },
                            React.createElement(tabs_1.TabsTrigger, { value: "configured" }, "Configured"),
                            React.createElement(tabs_1.TabsTrigger, { value: "available" }, "Available")),
                        React.createElement(tabs_1.TabsContent, { value: "configured" }, integrations.length === 0 ? (React.createElement(card_1.Card, { className: "border-dashed" },
                            React.createElement(card_1.CardContent, { className: "pt-6 text-center text-muted-foreground" },
                                React.createElement(lucide_react_1.Zap, { className: "h-8 w-8 mx-auto mb-2 opacity-50" }),
                                React.createElement("p", null, "No integrations configured yet")))) : (React.createElement("div", { className: "space-y-2" }, integrations.map(function (int) { return (React.createElement("div", { key: int.id, className: "flex items-center justify-between p-3 border rounded-md" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, int.provider),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, int.integrationType)),
                            React.createElement("div", { className: "flex gap-1" },
                                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return testIntegration.mutate({ id: int.id }); } }, "Test"),
                                React.createElement(button_1.Button, { variant: "destructive", size: "sm", onClick: function () { return deleteIntegration.mutate({ id: int.id }); } },
                                    React.createElement(lucide_react_1.Trash2, { className: "h-3 w-3" }))))); })))),
                        React.createElement(tabs_1.TabsContent, { value: "available" },
                            React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-3" }, providers.map(function (p) { return (React.createElement(card_1.Card, { key: p.name, className: "hover:shadow-md transition-shadow cursor-pointer", onClick: function () { setIntForm(function (prev) { return (__assign(__assign({}, prev), { provider: p.name })); }); setIntAddOpen(true); } },
                                React.createElement(card_1.CardContent, { className: "pt-4 text-center" },
                                    React.createElement("div", { className: "mx-auto mb-2 text-muted-foreground" }, p.icon),
                                    React.createElement("p", { className: "text-sm font-medium" }, p.name),
                                    React.createElement("p", { className: "text-xs text-muted-foreground" }, p.desc)))); })))),
                    React.createElement(dialog_1.Dialog, { open: intAddOpen, onOpenChange: setIntAddOpen },
                        React.createElement(dialog_1.DialogContent, null,
                            React.createElement(dialog_1.DialogHeader, null,
                                React.createElement(dialog_1.DialogTitle, null, "Add Integration"),
                                React.createElement(dialog_1.DialogDescription, null, "Connect a new third-party service.")),
                            React.createElement("div", { className: "space-y-4" },
                                React.createElement(Field, { label: "Provider" },
                                    React.createElement(input_1.Input, { value: intForm.provider, onChange: function (e) { return setIntForm(function (p) { return (__assign(__assign({}, p), { provider: e.target.value })); }); }, placeholder: "Provider name" })),
                                React.createElement(Field, { label: "Integration Type" },
                                    React.createElement(select_1.Select, { value: intForm.type, onValueChange: function (v) { return setIntForm(function (p) { return (__assign(__assign({}, p), { type: v })); }); } },
                                        React.createElement(select_1.SelectTrigger, null,
                                            React.createElement(select_1.SelectValue, null)),
                                        React.createElement(select_1.SelectContent, null,
                                            React.createElement(select_1.SelectItem, { value: "api_key" }, "API Key"),
                                            React.createElement(select_1.SelectItem, { value: "webhook" }, "Webhook"),
                                            React.createElement(select_1.SelectItem, { value: "oauth" }, "OAuth"),
                                            React.createElement(select_1.SelectItem, { value: "smtp" }, "SMTP")))),
                                (intForm.type === "api_key" || intForm.type === "oauth") && React.createElement(Field, { label: "API Key" },
                                    React.createElement(input_1.Input, { type: "password", value: intForm.apiKey, onChange: function (e) { return setIntForm(function (p) { return (__assign(__assign({}, p), { apiKey: e.target.value })); }); } })),
                                intForm.type === "webhook" && React.createElement(Field, { label: "Webhook URL" },
                                    React.createElement(input_1.Input, { value: intForm.webhookUrl, onChange: function (e) { return setIntForm(function (p) { return (__assign(__assign({}, p), { webhookUrl: e.target.value })); }); }, placeholder: "https://..." })),
                                intForm.type === "oauth" && (React.createElement(React.Fragment, null,
                                    React.createElement(Field, { label: "Client ID" },
                                        React.createElement(input_1.Input, { value: intForm.clientId, onChange: function (e) { return setIntForm(function (p) { return (__assign(__assign({}, p), { clientId: e.target.value })); }); } })),
                                    React.createElement(Field, { label: "Client Secret" },
                                        React.createElement(input_1.Input, { type: "password", value: intForm.clientSecret, onChange: function (e) { return setIntForm(function (p) { return (__assign(__assign({}, p), { clientSecret: e.target.value })); }); } }))))),
                            React.createElement(dialog_1.DialogFooter, null,
                                React.createElement(button_1.Button, { onClick: function () { return configureIntegration.mutate({ provider: intForm.provider, integrationType: intForm.type, config: { apiKey: intForm.apiKey, webhookUrl: intForm.webhookUrl, clientId: intForm.clientId, clientSecret: intForm.clientSecret } }); } }, "Configure"))))));
            }
            // ── WORKFLOW AUTOMATION (inline) ───────────────────────────────────────
            case "workflow-auto": {
                var workflows = (workflowsData === null || workflowsData === void 0 ? void 0 : workflowsData.workflows) || [];
                var templates = (wfTemplatesData === null || wfTemplatesData === void 0 ? void 0 : wfTemplatesData.templates) || [];
                return (React.createElement(Section, { title: "Workflow Automation", description: "Automate repetitive tasks and processes" },
                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4" },
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardContent, { className: "pt-4 text-center" },
                                React.createElement("p", { className: "text-2xl font-bold" }, workflows.filter(function (w) { return w.status === "active"; }).length),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Active Workflows"))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardContent, { className: "pt-4 text-center" },
                                React.createElement("p", { className: "text-2xl font-bold" }, templates.length),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Templates"))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardContent, { className: "pt-4 text-center" },
                                React.createElement("div", { className: "flex items-center justify-center gap-1" },
                                    React.createElement(lucide_react_1.CheckCircle, { className: "h-4 w-4 text-green-500" }),
                                    React.createElement("p", { className: "text-sm font-medium text-green-600" }, "Online")),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "System Status")))),
                    templates.length > 0 && (React.createElement("div", { className: "mb-4" },
                        React.createElement("h4", { className: "text-sm font-medium mb-2" }, "Templates"),
                        React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2" }, templates.map(function (t) { return (React.createElement(card_1.Card, { key: t.id, className: "hover:shadow-md transition-shadow cursor-pointer", onClick: function () { setWfForm({ name: t.name, description: t.description || "", triggerType: t.triggerType || "invoice_created", isRecurring: false }); setWfCreateOpen(true); } },
                            React.createElement(card_1.CardContent, { className: "pt-3" },
                                React.createElement("p", { className: "text-sm font-medium" }, t.name),
                                React.createElement("p", { className: "text-xs text-muted-foreground line-clamp-2" }, t.description)))); })))),
                    React.createElement("div", { className: "flex items-center justify-between mb-3" },
                        React.createElement("h4", { className: "text-sm font-medium" }, "Workflows"),
                        React.createElement(dialog_1.Dialog, { open: wfCreateOpen, onOpenChange: setWfCreateOpen },
                            React.createElement(dialog_1.DialogTrigger, { asChild: true },
                                React.createElement(button_1.Button, { size: "sm" },
                                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                                    "Create Workflow")),
                            React.createElement(dialog_1.DialogContent, null,
                                React.createElement(dialog_1.DialogHeader, null,
                                    React.createElement(dialog_1.DialogTitle, null, "Create Workflow"),
                                    React.createElement(dialog_1.DialogDescription, null, "Define an automated workflow.")),
                                React.createElement("div", { className: "space-y-4" },
                                    React.createElement(Field, { label: "Name" },
                                        React.createElement(input_1.Input, { value: wfForm.name, onChange: function (e) { return setWfForm(function (p) { return (__assign(__assign({}, p), { name: e.target.value })); }); }, placeholder: "Workflow name" })),
                                    React.createElement(Field, { label: "Description" },
                                        React.createElement(input_1.Input, { value: wfForm.description, onChange: function (e) { return setWfForm(function (p) { return (__assign(__assign({}, p), { description: e.target.value })); }); }, placeholder: "What does this workflow do?" })),
                                    React.createElement(Field, { label: "Trigger" },
                                        React.createElement(select_1.Select, { value: wfForm.triggerType, onValueChange: function (v) { return setWfForm(function (p) { return (__assign(__assign({}, p), { triggerType: v })); }); } },
                                            React.createElement(select_1.SelectTrigger, null,
                                                React.createElement(select_1.SelectValue, null)),
                                            React.createElement(select_1.SelectContent, null,
                                                React.createElement(select_1.SelectItem, { value: "invoice_created" }, "Invoice Created"),
                                                React.createElement(select_1.SelectItem, { value: "invoice_paid" }, "Invoice Paid"),
                                                React.createElement(select_1.SelectItem, { value: "invoice_overdue" }, "Invoice Overdue"),
                                                React.createElement(select_1.SelectItem, { value: "payment_received" }, "Payment Received"),
                                                React.createElement(select_1.SelectItem, { value: "opportunity_moved" }, "Opportunity Moved"),
                                                React.createElement(select_1.SelectItem, { value: "task_completed" }, "Task Completed"),
                                                React.createElement(select_1.SelectItem, { value: "project_milestone_reached" }, "Project Milestone Reached"),
                                                React.createElement(select_1.SelectItem, { value: "reminder_time" }, "Reminder Time")))),
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        React.createElement(switch_1.Switch, { checked: wfForm.isRecurring, onCheckedChange: function (v) { return setWfForm(function (p) { return (__assign(__assign({}, p), { isRecurring: v })); }); } }),
                                        React.createElement(label_1.Label, null, "Recurring"))),
                                React.createElement(dialog_1.DialogFooter, null,
                                    React.createElement(button_1.Button, { onClick: function () { return createWorkflow.mutate({ name: wfForm.name, description: wfForm.description, triggerType: wfForm.triggerType, actions: [], isRecurring: wfForm.isRecurring }); } }, "Create"))))),
                    workflows.length === 0 ? (React.createElement(card_1.Card, { className: "border-dashed" },
                        React.createElement(card_1.CardContent, { className: "pt-6 text-center text-muted-foreground" },
                            React.createElement(lucide_react_1.Zap, { className: "h-8 w-8 mx-auto mb-2 opacity-50" }),
                            React.createElement("p", null, "No workflows created yet")))) : (React.createElement("div", { className: "space-y-2" }, workflows.map(function (w) { return (React.createElement("div", { key: w.id, className: "flex items-center justify-between p-3 border rounded-md hover:bg-muted/50" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm font-medium" }, w.name),
                            React.createElement("div", { className: "flex gap-2 mt-1" },
                                React.createElement(badge_1.Badge, { variant: w.status === "active" ? "default" : "secondary" }, w.status),
                                React.createElement(badge_1.Badge, { variant: "outline" }, w.triggerType))))); })))));
            }
            // ── SYSTEM HEALTH (inline) ────────────────────────────────────────────
            case "system-health": {
                var status = healthStatus;
                var components = healthComponents || [];
                var metrics = healthMetrics;
                return (React.createElement(Section, { title: "System Health", description: "Real-time system monitoring and diagnostics" },
                    React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-4" },
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardContent, { className: "pt-4 text-center" },
                                React.createElement("div", { className: "flex items-center justify-center gap-1 mb-1" }, (status === null || status === void 0 ? void 0 : status.status) === "operational" ? React.createElement(lucide_react_1.CheckCircle, { className: "h-4 w-4 text-green-500" }) : React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-yellow-500" })),
                                React.createElement("p", { className: "text-sm font-medium" }, (status === null || status === void 0 ? void 0 : status.status) || "Checking…"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Overall Status"))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardContent, { className: "pt-4 text-center" },
                                React.createElement("p", { className: "text-2xl font-bold" }, (status === null || status === void 0 ? void 0 : status.uptime) ? (status.uptime / 3600).toFixed(1) + "h" : "—"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Uptime"))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardContent, { className: "pt-4 text-center" },
                                React.createElement("p", { className: "text-2xl font-bold" }, (metrics === null || metrics === void 0 ? void 0 : metrics.memoryUsagePercent) ? metrics.memoryUsagePercent + "%" : "—"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Memory"))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardContent, { className: "pt-4 text-center" },
                                React.createElement("p", { className: "text-2xl font-bold" }, (status === null || status === void 0 ? void 0 : status.cpuCores) || "—"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "CPU Cores")))),
                    (status === null || status === void 0 ? void 0 : status.processMemory) && (React.createElement(card_1.Card, { className: "mb-4" },
                        React.createElement(card_1.CardHeader, { className: "pb-2" },
                            React.createElement(card_1.CardTitle, { className: "text-sm" }, "Process Memory")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("div", { className: "grid grid-cols-4 gap-3 text-center" },
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-lg font-bold" },
                                        (status.processMemory.heapUsed / 1048576).toFixed(0),
                                        " MB"),
                                    React.createElement("p", { className: "text-xs text-muted-foreground" }, "Heap Used")),
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-lg font-bold" },
                                        (status.processMemory.heapTotal / 1048576).toFixed(0),
                                        " MB"),
                                    React.createElement("p", { className: "text-xs text-muted-foreground" }, "Heap Total")),
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-lg font-bold" },
                                        (status.processMemory.rss / 1048576).toFixed(0),
                                        " MB"),
                                    React.createElement("p", { className: "text-xs text-muted-foreground" }, "RSS")),
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-lg font-bold" },
                                        (status.processMemory.external / 1048576).toFixed(0),
                                        " MB"),
                                    React.createElement("p", { className: "text-xs text-muted-foreground" }, "External")))))),
                    components.length > 0 && (React.createElement(card_1.Card, { className: "mb-4" },
                        React.createElement(card_1.CardHeader, { className: "pb-2" },
                            React.createElement(card_1.CardTitle, { className: "text-sm" }, "Components")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("div", { className: "space-y-2" }, components.map(function (c, i) { return (React.createElement("div", { key: i, className: "flex items-center justify-between p-2 border rounded" },
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    c.status === "operational" ? React.createElement(lucide_react_1.CheckCircle, { className: "h-4 w-4 text-green-500" }) : c.status === "degraded" ? React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-yellow-500" }) : React.createElement(lucide_react_1.XCircle, { className: "h-4 w-4 text-red-500" }),
                                    React.createElement("span", { className: "text-sm" }, c.name)),
                                React.createElement("div", { className: "flex gap-3 text-xs text-muted-foreground" },
                                    React.createElement("span", null,
                                        c.uptime,
                                        "% uptime"),
                                    React.createElement("span", null,
                                        c.responseTime,
                                        "ms")))); }))))),
                    metrics && (React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, { className: "pb-2" },
                            React.createElement(card_1.CardTitle, { className: "text-sm" }, "Live Metrics")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("div", { className: "grid grid-cols-3 md:grid-cols-6 gap-3 text-center" },
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-lg font-bold" }, (_a = metrics.requestsPerMinute) !== null && _a !== void 0 ? _a : "—"),
                                    React.createElement("p", { className: "text-xs text-muted-foreground" }, "Req/min")),
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-lg font-bold" }, (_b = metrics.avgResponseTime) !== null && _b !== void 0 ? _b : "—",
                                        "ms"),
                                    React.createElement("p", { className: "text-xs text-muted-foreground" }, "Avg Response")),
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-lg font-bold" }, (_c = metrics.errorRate) !== null && _c !== void 0 ? _c : "—",
                                        "%"),
                                    React.createElement("p", { className: "text-xs text-muted-foreground" }, "Error Rate")),
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-lg font-bold" }, (_d = metrics.activeConnections) !== null && _d !== void 0 ? _d : "—"),
                                    React.createElement("p", { className: "text-xs text-muted-foreground" }, "Connections")),
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-lg font-bold" }, (_e = metrics.dbQueries) !== null && _e !== void 0 ? _e : "—"),
                                    React.createElement("p", { className: "text-xs text-muted-foreground" }, "DB Queries")),
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-lg font-bold" }, (_f = metrics.cacheHitRate) !== null && _f !== void 0 ? _f : "—",
                                        "%"),
                                    React.createElement("p", { className: "text-xs text-muted-foreground" }, "Cache Hit"))))))));
            }
            // ── IMPORT DATA (inline) ──────────────────────────────────────────────
            case "import-data":
                return (React.createElement(Section, { title: "Import Data", description: "Import records from CSV and Excel files" },
                    React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-4" }, [{ label: "Employees", icon: React.createElement(lucide_react_1.Users, { className: "h-5 w-5" }) }, { label: "Clients", icon: React.createElement(lucide_react_1.Users, { className: "h-5 w-5" }) }, { label: "Products", icon: React.createElement(lucide_react_1.Package, { className: "h-5 w-5" }) }, { label: "Invoices", icon: React.createElement(lucide_react_1.FileText, { className: "h-5 w-5" }) }].map(function (mod) { return (React.createElement(card_1.Card, { key: mod.label, className: "hover:shadow-md transition-shadow cursor-pointer hover:border-primary", onClick: function () { return navigate("/import-excel"); } },
                        React.createElement(card_1.CardContent, { className: "pt-4 text-center" },
                            React.createElement("div", { className: "mx-auto mb-2 text-muted-foreground" }, mod.icon),
                            React.createElement("p", { className: "text-sm font-medium" }, mod.label),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Click to import")))); })),
                    React.createElement(card_1.Card, { className: "border-dashed" },
                        React.createElement(card_1.CardContent, { className: "pt-6" },
                            React.createElement("div", { className: "text-center space-y-3" },
                                React.createElement(lucide_react_1.Upload, { className: "h-10 w-10 mx-auto text-muted-foreground" }),
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-sm font-medium" }, "Drag & drop a CSV or Excel file here"),
                                    React.createElement("p", { className: "text-xs text-muted-foreground" }, "Or click a module above to start the guided import wizard")),
                                React.createElement(button_1.Button, { variant: "outline", onClick: function () { return navigate("/import-excel"); } },
                                    React.createElement(lucide_react_1.FileUp, { className: "mr-2 h-4 w-4" }),
                                    "Open Import Wizard")))),
                    React.createElement("div", { className: "mt-4 space-y-2" },
                        React.createElement("h4", { className: "text-sm font-medium" }, "Supported Modules"),
                        ["Job Groups", "Employees", "Clients", "Products", "Departments", "Payroll", "Services", "Invoices"].map(function (m) { return (React.createElement("div", { key: m, className: "flex items-center justify-between p-2 border rounded-md hover:bg-muted/50" },
                            React.createElement("span", { className: "text-sm" }, m),
                            React.createElement(badge_1.Badge, { variant: "outline" }, "CSV / Excel"))); }))));
            // ── INTEGRATION GUIDES (inline) ────────────────────────────────────────
            case "integration-guides": {
                var guides = [
                    { id: "theme", title: "Theme Integration", difficulty: "Beginner", desc: "Customize the look and feel of your CRM with custom themes, colors, and branding.", steps: ["Navigate to Settings > Theme", "Choose a base theme or create custom", "Adjust primary/secondary colors", "Upload custom logo and favicon", "Save and preview changes"] },
                    { id: "brand", title: "Brand Integration", difficulty: "Beginner", desc: "Configure your company branding across all documents, emails, and client-facing pages.", steps: ["Go to Settings > Company Details", "Upload company logo in multiple sizes", "Set brand colors in Theme settings", "Configure email header/footer templates", "Preview branded invoice/estimate"] },
                    { id: "api", title: "API Integration", difficulty: "Advanced", desc: "Integrate with external systems using our REST API. Full CRUD operations on all resources.", steps: ["Generate API key in Settings > API Keys", "Review API documentation for endpoints", "Set up authentication headers (Bearer token)", "Make test request to /api/health", "Implement webhooks for real-time events"] },
                    { id: "widgets", title: "Homepage Widgets", difficulty: "Intermediate", desc: "Add custom dashboard widgets to display key metrics, charts, and quick actions.", steps: ["Go to Dashboard > Customize", "Browse available widget library", "Drag widgets to desired positions", "Configure data sources and filters", "Set refresh intervals for live data"] },
                ];
                var currentGuide = guides.find(function (g) { return g.id === selectedGuide; });
                return (React.createElement(Section, { title: "Integration Guides", description: "Step-by-step guides for integrating with your CRM" },
                    React.createElement("div", { className: "relative mb-4" },
                        React.createElement(lucide_react_1.Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }),
                        React.createElement(input_1.Input, { className: "pl-8", placeholder: "Search guides\u2026", value: guideSearch, onChange: function (e) { return setGuideSearch(e.target.value); } })),
                    React.createElement("div", { className: "grid grid-cols-[1fr_2fr] gap-4 min-h-[300px]" },
                        React.createElement("div", { className: "space-y-2" }, guides.filter(function (g) { return !guideSearch || g.title.toLowerCase().includes(guideSearch.toLowerCase()); }).map(function (g) { return (React.createElement(card_1.Card, { key: g.id, className: utils_1.cn("cursor-pointer hover:shadow-md transition-shadow", selectedGuide === g.id && "ring-2 ring-primary"), onClick: function () { return setSelectedGuide(g.id); } },
                            React.createElement(card_1.CardContent, { className: "pt-3" },
                                React.createElement("div", { className: "flex items-center justify-between mb-1" },
                                    React.createElement("p", { className: "text-sm font-medium" }, g.title),
                                    React.createElement(badge_1.Badge, { variant: "outline", className: "text-xs" }, g.difficulty)),
                                React.createElement("p", { className: "text-xs text-muted-foreground line-clamp-2" }, g.desc)))); })),
                        React.createElement("div", null, !currentGuide ? (React.createElement(card_1.Card, { className: "border-dashed h-full" },
                            React.createElement(card_1.CardContent, { className: "pt-6 flex flex-col items-center justify-center h-full text-center" },
                                React.createElement(lucide_react_1.BookOpen, { className: "h-10 w-10 text-muted-foreground mb-3" }),
                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Select a guide from the list")))) : (React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, null,
                                React.createElement("div", { className: "flex items-center justify-between" },
                                    React.createElement(card_1.CardTitle, null, currentGuide.title),
                                    React.createElement(badge_1.Badge, null, currentGuide.difficulty)),
                                React.createElement(card_1.CardDescription, null, currentGuide.desc)),
                            React.createElement(card_1.CardContent, null,
                                React.createElement("h4", { className: "text-sm font-medium mb-3" }, "Steps"),
                                React.createElement("div", { className: "space-y-3" }, currentGuide.steps.map(function (step, i) { return (React.createElement("div", { key: i, className: "flex gap-3" },
                                    React.createElement("div", { className: "flex-shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium" }, i + 1),
                                    React.createElement("p", { className: "text-sm pt-0.5" }, step))); })))))))));
            }
            // ── API DOCUMENTATION (inline) ─────────────────────────────────────────
            case "api-docs":
                return (React.createElement(Section, { title: "API Documentation", description: "REST API reference for your CRM system" },
                    React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-4" },
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardContent, { className: "pt-4 text-center" },
                                React.createElement("p", { className: "text-2xl font-bold" }, "245"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Endpoints"))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardContent, { className: "pt-4 text-center" },
                                React.createElement("p", { className: "text-2xl font-bold" }, "892"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Operations"))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardContent, { className: "pt-4 text-center" },
                                React.createElement("p", { className: "text-2xl font-bold text-green-600" }, "100%"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Documented"))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardContent, { className: "pt-4 text-center" },
                                React.createElement("p", { className: "text-2xl font-bold" }, "~145ms"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Avg Response")))),
                    React.createElement(card_1.Card, { className: "mb-4" },
                        React.createElement(card_1.CardHeader, { className: "pb-2" },
                            React.createElement(card_1.CardTitle, { className: "text-sm" }, "Popular Endpoints")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement(table_1.Table, null,
                                React.createElement(table_1.TableHeader, null,
                                    React.createElement(table_1.TableRow, null,
                                        React.createElement(table_1.TableHead, null, "Method"),
                                        React.createElement(table_1.TableHead, null, "Path"),
                                        React.createElement(table_1.TableHead, null, "Description"),
                                        React.createElement(table_1.TableHead, null, "Status"))),
                                React.createElement(table_1.TableBody, null, [
                                    { method: "GET", path: "/api/clients", desc: "List all clients", code: 200 },
                                    { method: "POST", path: "/api/invoices", desc: "Create invoice", code: 201 },
                                    { method: "PUT", path: "/api/projects/:id", desc: "Update project", code: 200 },
                                    { method: "DELETE", path: "/api/tasks/:id", desc: "Delete task", code: 204 },
                                    { method: "GET", path: "/api/leads", desc: "List all leads", code: 200 },
                                    { method: "POST", path: "/api/estimates", desc: "Create estimate", code: 201 },
                                ].map(function (ep, i) { return (React.createElement(table_1.TableRow, { key: i },
                                    React.createElement(table_1.TableCell, null,
                                        React.createElement(badge_1.Badge, { variant: ep.method === "GET" ? "default" : ep.method === "POST" ? "default" : ep.method === "PUT" ? "secondary" : "destructive", className: ep.method === "GET" ? "bg-green-100 text-green-700" : ep.method === "POST" ? "bg-blue-100 text-blue-700" : ep.method === "PUT" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700" }, ep.method)),
                                    React.createElement(table_1.TableCell, { className: "font-mono text-xs" }, ep.path),
                                    React.createElement(table_1.TableCell, { className: "text-sm" }, ep.desc),
                                    React.createElement(table_1.TableCell, null,
                                        React.createElement(badge_1.Badge, { variant: "outline" }, ep.code)))); }))))),
                    React.createElement(card_1.Card, { className: "mb-4" },
                        React.createElement(card_1.CardHeader, { className: "pb-2" },
                            React.createElement(card_1.CardTitle, { className: "text-sm" }, "Example Request")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("pre", { className: "bg-gray-900 text-green-400 p-4 rounded-md text-xs overflow-x-auto" }, "curl -X GET https://your-crm.com/api/clients \\\n  -H \"Authorization: Bearer YOUR_API_KEY\" \\\n  -H \"Content-Type: application/json\""))),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, { className: "pb-2" },
                            React.createElement(card_1.CardTitle, { className: "text-sm" }, "Response Schema")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("pre", { className: "bg-gray-900 text-green-400 p-4 rounded-md text-xs overflow-x-auto" }, "{\n  \"success\": true,\n  \"data\": [\n    {\n      \"id\": 1,\n      \"name\": \"Acme Corp\",\n      \"email\": \"info@acme.com\",\n      \"phone\": \"+254700000000\",\n      \"status\": \"active\",\n      \"created_at\": \"2026-01-15T10:30:00Z\"\n    }\n  ],\n  \"pagination\": { \"page\": 1, \"limit\": 25, \"total\": 142 }\n}")))));
            // ── NEW PAYMENT GATEWAYS (Kiini: One Hub. Total Control) ───────────────────────────────
            case "payments-pesapal":
                return (React.createElement(Section, { title: "Pesapal", description: "Accept payments via Pesapal (East Africa: M-Pesa, Airtel, MTN, Visa/Mastercard)" },
                    React.createElement("div", { className: "flex items-center justify-between mb-2" },
                        React.createElement("p", { className: "text-sm font-medium" }, "Enable Pesapal"),
                        React.createElement(switch_1.Switch, { checked: pesapal.enabled, onCheckedChange: function (c) { return setPesapal(function (p) { return (__assign(__assign({}, p), { enabled: c })); }); } })),
                    React.createElement("div", { className: "grid grid-cols-1 gap-4" },
                        React.createElement(Field, { label: "Consumer Key" },
                            React.createElement(input_1.Input, { value: pesapal.consumerKey, onChange: function (e) { return setPesapal(function (p) { return (__assign(__assign({}, p), { consumerKey: e.target.value })); }); }, placeholder: "Consumer Key" })),
                        React.createElement(Field, { label: "Consumer Secret" },
                            React.createElement(input_1.Input, { type: "password", value: pesapal.consumerSecret, onChange: function (e) { return setPesapal(function (p) { return (__assign(__assign({}, p), { consumerSecret: e.target.value })); }); }, placeholder: "Consumer Secret" })),
                        React.createElement(Field, { label: "Environment" },
                            React.createElement(select_1.Select, { value: pesapal.environment, onValueChange: function (v) { return setPesapal(function (p) { return (__assign(__assign({}, p), { environment: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "sandbox" }, "Sandbox"),
                                    React.createElement(select_1.SelectItem, { value: "live" }, "Live"))))),
                    React.createElement(SaveButton, { saving: !!saving["pesapal"], onClick: function () { return save("pesapal", function () { return updateByCategory.mutateAsync({ category: "payment_pesapal", values: __assign(__assign({}, pesapal), { enabled: String(pesapal.enabled) }) }); }); } })));
            case "payments-mollie":
                return (React.createElement(Section, { title: "Mollie Pay", description: "Accept payments via Mollie (iDEAL, Bancontact, SEPA, Credit Cards)" },
                    React.createElement("div", { className: "flex items-center justify-between mb-2" },
                        React.createElement("p", { className: "text-sm font-medium" }, "Enable Mollie"),
                        React.createElement(switch_1.Switch, { checked: mollie.enabled, onCheckedChange: function (c) { return setMollie(function (p) { return (__assign(__assign({}, p), { enabled: c })); }); } })),
                    React.createElement("div", { className: "grid grid-cols-1 gap-4" },
                        React.createElement(Field, { label: "API Key" },
                            React.createElement(input_1.Input, { type: "password", value: mollie.apiKey, onChange: function (e) { return setMollie(function (p) { return (__assign(__assign({}, p), { apiKey: e.target.value })); }); }, placeholder: "live_\u2026 or test_\u2026" })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Test Mode"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Use test API key for sandbox payments")),
                            React.createElement(switch_1.Switch, { checked: mollie.testMode, onCheckedChange: function (c) { return setMollie(function (p) { return (__assign(__assign({}, p), { testMode: c })); }); } }))),
                    React.createElement(SaveButton, { saving: !!saving["mollie"], onClick: function () { return save("mollie", function () { return updateByCategory.mutateAsync({ category: "payment_mollie", values: __assign(__assign({}, mollie), { enabled: String(mollie.enabled), testMode: String(mollie.testMode) }) }); }); } })));
            case "payments-tappay":
                return (React.createElement(Section, { title: "Tap Pay", description: "Accept payments via Tap (Middle East & North Africa)" },
                    React.createElement("div", { className: "flex items-center justify-between mb-2" },
                        React.createElement("p", { className: "text-sm font-medium" }, "Enable Tap Pay"),
                        React.createElement(switch_1.Switch, { checked: tapPay.enabled, onCheckedChange: function (c) { return setTapPay(function (p) { return (__assign(__assign({}, p), { enabled: c })); }); } })),
                    React.createElement("div", { className: "grid grid-cols-1 gap-4" },
                        React.createElement(Field, { label: "Merchant ID" },
                            React.createElement(input_1.Input, { value: tapPay.merchantId, onChange: function (e) { return setTapPay(function (p) { return (__assign(__assign({}, p), { merchantId: e.target.value })); }); }, placeholder: "Merchant ID" })),
                        React.createElement(Field, { label: "API Key" },
                            React.createElement(input_1.Input, { type: "password", value: tapPay.apiKey, onChange: function (e) { return setTapPay(function (p) { return (__assign(__assign({}, p), { apiKey: e.target.value })); }); }, placeholder: "sk_live_\u2026" })),
                        React.createElement(Field, { label: "Environment" },
                            React.createElement(select_1.Select, { value: tapPay.environment, onValueChange: function (v) { return setTapPay(function (p) { return (__assign(__assign({}, p), { environment: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "sandbox" }, "Sandbox"),
                                    React.createElement(select_1.SelectItem, { value: "live" }, "Live"))))),
                    React.createElement(SaveButton, { saving: !!saving["tappay"], onClick: function () { return save("tappay", function () { return updateByCategory.mutateAsync({ category: "payment_tappay", values: __assign(__assign({}, tapPay), { enabled: String(tapPay.enabled) }) }); }); } })));
            case "payments-airtel":
                return (React.createElement(Section, { title: "Airtel Money", description: "Accept mobile money payments via Airtel (East & Central Africa)" },
                    React.createElement("div", { className: "flex items-center justify-between mb-2" },
                        React.createElement("p", { className: "text-sm font-medium" }, "Enable Airtel Money"),
                        React.createElement(switch_1.Switch, { checked: airtelMoney.enabled, onCheckedChange: function (c) { return setAirtelMoney(function (p) { return (__assign(__assign({}, p), { enabled: c })); }); } })),
                    React.createElement("div", { className: "grid grid-cols-1 gap-4" },
                        React.createElement(Field, { label: "Client ID" },
                            React.createElement(input_1.Input, { value: airtelMoney.clientId, onChange: function (e) { return setAirtelMoney(function (p) { return (__assign(__assign({}, p), { clientId: e.target.value })); }); }, placeholder: "Client ID" })),
                        React.createElement(Field, { label: "Client Secret" },
                            React.createElement(input_1.Input, { type: "password", value: airtelMoney.clientSecret, onChange: function (e) { return setAirtelMoney(function (p) { return (__assign(__assign({}, p), { clientSecret: e.target.value })); }); }, placeholder: "Client Secret" })),
                        React.createElement(Field, { label: "Environment" },
                            React.createElement(select_1.Select, { value: airtelMoney.environment, onValueChange: function (v) { return setAirtelMoney(function (p) { return (__assign(__assign({}, p), { environment: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "sandbox" }, "Sandbox"),
                                    React.createElement(select_1.SelectItem, { value: "live" }, "Live"))))),
                    React.createElement(SaveButton, { saving: !!saving["airtel"], onClick: function () { return save("airtel", function () { return updateByCategory.mutateAsync({ category: "payment_airtel", values: __assign(__assign({}, airtelMoney), { enabled: String(airtelMoney.enabled) }) }); }); } })));
            case "payments-mtnmomo":
                return (React.createElement(Section, { title: "MTN Mobile Money", description: "Accept mobile money via MTN MoMo (West, Central & East Africa)" },
                    React.createElement("div", { className: "flex items-center justify-between mb-2" },
                        React.createElement("p", { className: "text-sm font-medium" }, "Enable MTN MoMo"),
                        React.createElement(switch_1.Switch, { checked: mtnMomo.enabled, onCheckedChange: function (c) { return setMtnMomo(function (p) { return (__assign(__assign({}, p), { enabled: c })); }); } })),
                    React.createElement("div", { className: "grid grid-cols-1 gap-4" },
                        React.createElement(Field, { label: "Subscription Key" },
                            React.createElement(input_1.Input, { value: mtnMomo.subscriptionKey, onChange: function (e) { return setMtnMomo(function (p) { return (__assign(__assign({}, p), { subscriptionKey: e.target.value })); }); }, placeholder: "Ocp-Apim-Subscription-Key" })),
                        React.createElement(Field, { label: "API User" },
                            React.createElement(input_1.Input, { value: mtnMomo.apiUser, onChange: function (e) { return setMtnMomo(function (p) { return (__assign(__assign({}, p), { apiUser: e.target.value })); }); }, placeholder: "API User UUID" })),
                        React.createElement(Field, { label: "API Key" },
                            React.createElement(input_1.Input, { type: "password", value: mtnMomo.apiKey, onChange: function (e) { return setMtnMomo(function (p) { return (__assign(__assign({}, p), { apiKey: e.target.value })); }); }, placeholder: "API Key" })),
                        React.createElement(Field, { label: "Environment" },
                            React.createElement(select_1.Select, { value: mtnMomo.environment, onValueChange: function (v) { return setMtnMomo(function (p) { return (__assign(__assign({}, p), { environment: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "sandbox" }, "Sandbox"),
                                    React.createElement(select_1.SelectItem, { value: "live" }, "Live"))))),
                    React.createElement(SaveButton, { saving: !!saving["mtnmomo"], onClick: function () { return save("mtnmomo", function () { return updateByCategory.mutateAsync({ category: "payment_mtnmomo", values: __assign(__assign({}, mtnMomo), { enabled: String(mtnMomo.enabled) }) }); }); } })));
            // ── INVENTORY ───────────────────────────────────────────────────────
            case "inventory-general":
                return (React.createElement(Section, { title: "Inventory Settings", description: "Configure inventory management for your business" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Track Stock Levels"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Automatically track product stock quantities")),
                            React.createElement(switch_1.Switch, { checked: inventoryGeneral.trackStock, onCheckedChange: function (v) { return setInventoryGeneral(function (p) { return (__assign(__assign({}, p), { trackStock: v })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Auto-Reorder"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Automatically create purchase orders when stock is low")),
                            React.createElement(switch_1.Switch, { checked: inventoryGeneral.autoReorder, onCheckedChange: function (v) { return setInventoryGeneral(function (p) { return (__assign(__assign({}, p), { autoReorder: v })); }); } })),
                        React.createElement(Field, { label: "Low Stock Threshold" },
                            React.createElement(input_1.Input, { type: "number", min: "1", value: inventoryGeneral.lowStockThreshold, onChange: function (e) { return setInventoryGeneral(function (p) { return (__assign(__assign({}, p), { lowStockThreshold: e.target.value })); }); } })),
                        React.createElement(Field, { label: "Default Warehouse" },
                            React.createElement(input_1.Input, { value: inventoryGeneral.defaultWarehouse, onChange: function (e) { return setInventoryGeneral(function (p) { return (__assign(__assign({}, p), { defaultWarehouse: e.target.value })); }); }, placeholder: "Main Warehouse" }))),
                    React.createElement(SaveButton, { saving: !!saving["inventory-general"], onClick: function () { return save("inventory-general", function () { return updateByCategory.mutateAsync({ category: "inventory_general", values: __assign(__assign({}, inventoryGeneral), { trackStock: String(inventoryGeneral.trackStock), autoReorder: String(inventoryGeneral.autoReorder) }) }); }); } })));
            case "inventory-categories":
                return (React.createElement(Section, { title: "Inventory Categories", description: "Organize inventory items by category" },
                    React.createElement("div", { className: "space-y-2" }, inventoryCategories.map(function (c) { return (React.createElement("div", { key: c.id, className: "flex items-center justify-between p-2 border rounded" },
                        React.createElement("span", { className: "text-sm" }, c.name),
                        React.createElement("button", { onClick: function () { var u = inventoryCategories.filter(function (x) { return x.id !== c.id; }); setInventoryCategories(u); updateByCategory.mutate({ category: "inventory_categories", values: { list: JSON.stringify(u) } }); }, className: "text-destructive hover:text-destructive/80" },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); })),
                    React.createElement("div", { className: "flex gap-2 items-end mt-3" },
                        React.createElement(Field, { label: "Category Name" },
                            React.createElement(input_1.Input, { value: newInventoryCat.name, onChange: function (e) { return setNewInventoryCat({ name: e.target.value }); }, placeholder: "e.g. Electronics, Furniture" })),
                        React.createElement(button_1.Button, { size: "sm", onClick: function () { if (!newInventoryCat.name) {
                                sonner_1.toast.error("Name required");
                                return;
                            } var u = __spreadArrays(inventoryCategories, [__assign({ id: crypto.randomUUID() }, newInventoryCat)]); setInventoryCategories(u); setNewInventoryCat({ name: "" }); updateByCategory.mutate({ category: "inventory_categories", values: { list: JSON.stringify(u) } }); } },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                            "Add"))));
            case "inventory-stock":
                return (React.createElement(Section, { title: "Stock Settings", description: "Configure stock valuation and tracking methods" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement(Field, { label: "Valuation Method" },
                            React.createElement(select_1.Select, { value: inventoryStock.method, onValueChange: function (v) { return setInventoryStock(function (p) { return (__assign(__assign({}, p), { method: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "fifo" }, "FIFO (First In, First Out)"),
                                    React.createElement(select_1.SelectItem, { value: "lifo" }, "LIFO (Last In, First Out)"),
                                    React.createElement(select_1.SelectItem, { value: "average" }, "Weighted Average")))),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Allow Negative Stock"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Allow selling items when stock is zero")),
                            React.createElement(switch_1.Switch, { checked: inventoryStock.allowNegative, onCheckedChange: function (v) { return setInventoryStock(function (p) { return (__assign(__assign({}, p), { allowNegative: v })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Barcode Scanning"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Enable barcode-based stock management")),
                            React.createElement(switch_1.Switch, { checked: inventoryStock.barcodeEnabled, onCheckedChange: function (v) { return setInventoryStock(function (p) { return (__assign(__assign({}, p), { barcodeEnabled: v })); }); } }))),
                    React.createElement(SaveButton, { saving: !!saving["inventory-stock"], onClick: function () { return save("inventory-stock", function () { return updateByCategory.mutateAsync({ category: "inventory_stock", values: __assign(__assign({}, inventoryStock), { allowNegative: String(inventoryStock.allowNegative), barcodeEnabled: String(inventoryStock.barcodeEnabled) }) }); }); } })));
            // ── SERVICES & CHECKOUT ─────────────────────────────────────────────
            case "services-general":
                return (React.createElement(Section, { title: "Services Settings", description: "Configure service offerings and management" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Enable Services Module"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Allow creating and selling services")),
                            React.createElement(switch_1.Switch, { checked: servicesGeneral.enabled, onCheckedChange: function (v) { return setServicesGeneral(function (p) { return (__assign(__assign({}, p), { enabled: v })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Show Pricing"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Display service prices to clients")),
                            React.createElement(switch_1.Switch, { checked: servicesGeneral.showPricing, onCheckedChange: function (v) { return setServicesGeneral(function (p) { return (__assign(__assign({}, p), { showPricing: v })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Online Booking"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Allow clients to book services online")),
                            React.createElement(switch_1.Switch, { checked: servicesGeneral.allowOnlineBooking, onCheckedChange: function (v) { return setServicesGeneral(function (p) { return (__assign(__assign({}, p), { allowOnlineBooking: v })); }); } })),
                        React.createElement(Field, { label: "Booking URL" },
                            React.createElement(input_1.Input, { value: servicesGeneral.bookingUrl, onChange: function (e) { return setServicesGeneral(function (p) { return (__assign(__assign({}, p), { bookingUrl: e.target.value })); }); }, placeholder: "https://yourdomain.com/book" }))),
                    React.createElement(SaveButton, { saving: !!saving["services-general"], onClick: function () { return save("services-general", function () { return updateByCategory.mutateAsync({ category: "services_general", values: __assign(__assign({}, servicesGeneral), { enabled: String(servicesGeneral.enabled), showPricing: String(servicesGeneral.showPricing), allowOnlineBooking: String(servicesGeneral.allowOnlineBooking) }) }); }); } })));
            case "services-paypal":
                return (React.createElement(Section, { title: "PayPal (API)", description: "Configure PayPal payment integration" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement(Field, { label: "PayPal Mode" },
                            React.createElement(select_1.Select, { value: (_g = servicesPaypal === null || servicesPaypal === void 0 ? void 0 : servicesPaypal.mode) !== null && _g !== void 0 ? _g : "sandbox", onValueChange: function (v) { return setServicesPaypal(function (p) { return (__assign(__assign({}, p), { mode: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "sandbox" }, "Sandbox (Testing)"),
                                    React.createElement(select_1.SelectItem, { value: "live" }, "Live (Production)")))),
                        React.createElement(Field, { label: "Client ID" },
                            React.createElement(input_1.Input, { value: (_h = servicesPaypal === null || servicesPaypal === void 0 ? void 0 : servicesPaypal.clientId) !== null && _h !== void 0 ? _h : "", onChange: function (e) { return setServicesPaypal(function (p) { return (__assign(__assign({}, p), { clientId: e.target.value })); }); }, placeholder: "PayPal Client ID" })),
                        React.createElement(Field, { label: "Client Secret" },
                            React.createElement(input_1.Input, { type: "password", value: (_j = servicesPaypal === null || servicesPaypal === void 0 ? void 0 : servicesPaypal.clientSecret) !== null && _j !== void 0 ? _j : "", onChange: function (e) { return setServicesPaypal(function (p) { return (__assign(__assign({}, p), { clientSecret: e.target.value })); }); }, placeholder: "PayPal Client Secret" }))),
                    React.createElement(SaveButton, { saving: !!saving["services-paypal"], onClick: function () { return save("services-paypal", function () { return updateByCategory.mutateAsync({ category: "services_paypal", values: servicesPaypal }); }); } })));
            case "services-email-templates": {
                var SERVICE_EMAIL_TEMPLATES = {
                    bookings: { label: "Bookings", templates: [
                            { id: "service-booked-client", name: "Service Booked - (Client)", subject: "Booking Confirmed: {service_name}", body: "<h2>Booking Confirmed</h2><p>Hi {first_name},</p><p>Your service booking has been confirmed. Here are the details:</p><table><tr><th>Service</th><th>Date</th><th>Time</th><th>Location</th></tr><tr><td>{service_name}</td><td>{booking_date}</td><td>{booking_time}</td><td>{service_location}</td></tr></table><p><strong>Booking Reference:</strong> {booking_ref}</p><p>If you need to make any changes, please contact us at least 24 hours before your appointment.</p>", vars: ["first_name", "last_name", "client_name", "service_name", "booking_date", "booking_time", "booking_ref", "service_location", "service_price"] },
                            { id: "service-booked-team", name: "Service Booked - (Team)", subject: "New Booking: {service_name} - {client_name}", body: "<p>Hi {first_name},</p><p>A new service booking has been made.</p><table><tr><th>Field</th><th>Details</th></tr><tr><td>Client</td><td>{client_name}</td></tr><tr><td>Service</td><td>{service_name}</td></tr><tr><td>Date</td><td>{booking_date}</td></tr><tr><td>Time</td><td>{booking_time}</td></tr><tr><td>Reference</td><td>{booking_ref}</td></tr></table>", vars: ["first_name", "last_name", "client_name", "service_name", "booking_date", "booking_time", "booking_ref", "assigned_to"] },
                            { id: "service-rescheduled-client", name: "Service Rescheduled - (Client)", subject: "Booking Rescheduled: {service_name}", body: "<p>Hi {first_name},</p><p>Your service booking has been rescheduled.</p><p><strong>New Date:</strong> {booking_date}<br/><strong>New Time:</strong> {booking_time}</p><p><strong>Booking Reference:</strong> {booking_ref}</p><p>If this doesn't work for you, please let us know.</p>", vars: ["first_name", "last_name", "client_name", "service_name", "booking_date", "booking_time", "booking_ref"] },
                        ] },
                    lifecycle: { label: "Lifecycle", templates: [
                            { id: "service-cancelled-client", name: "Service Cancelled - (Client)", subject: "Booking Cancelled: {service_name}", body: "<p>Hi {first_name},</p><p>Your booking for <strong>{service_name}</strong> on <strong>{booking_date}</strong> has been cancelled.</p><p><strong>Booking Reference:</strong> {booking_ref}</p><p>If this was a mistake or you'd like to rebook, please contact us.</p>", vars: ["first_name", "last_name", "client_name", "service_name", "booking_date", "booking_ref", "cancellation_reason"] },
                            { id: "service-completed-client", name: "Service Completed - (Client)", subject: "Service Completed: {service_name}", body: "<h2>Service Completed</h2><p>Hi {first_name},</p><p>Your service <strong>{service_name}</strong> has been completed successfully.</p><p>We hope you are satisfied with the service. If you have any feedback, we'd love to hear from you.</p><p><a href=\"{feedback_url}\">Leave Feedback</a></p>", vars: ["first_name", "last_name", "client_name", "service_name", "booking_date", "completion_date", "feedback_url", "technician_name"] },
                            { id: "service-in-progress-client", name: "Service In Progress - (Client)", subject: "Service Update: {service_name}", body: "<p>Hi {first_name},</p><p>Your service <strong>{service_name}</strong> is now in progress.</p><p><strong>Assigned Technician:</strong> {technician_name}<br/><strong>Estimated Completion:</strong> {estimated_completion}</p>", vars: ["first_name", "last_name", "client_name", "service_name", "technician_name", "estimated_completion"] },
                        ] },
                    reminders: { label: "Reminders", templates: [
                            { id: "service-reminder-client", name: "Service Reminder - (Client)", subject: "Reminder: Upcoming Service - {service_name}", body: "<p>Hi {first_name},</p><p>This is a friendly reminder about your upcoming service appointment:</p><table><tr><th>Service</th><th>Date</th><th>Time</th><th>Location</th></tr><tr><td>{service_name}</td><td>{booking_date}</td><td>{booking_time}</td><td>{service_location}</td></tr></table><p><strong>Booking Reference:</strong> {booking_ref}</p><p>If you need to reschedule, please contact us.</p>", vars: ["first_name", "last_name", "client_name", "service_name", "booking_date", "booking_time", "booking_ref", "service_location"] },
                            { id: "service-followup-client", name: "Service Follow-up - (Client)", subject: "How Was Your Experience?", body: "<p>Hi {first_name},</p><p>We hope you enjoyed your recent service (<strong>{service_name}</strong>) with us.</p><p>Your feedback helps us improve. Please take a moment to share your experience:</p><p><a href=\"{feedback_url}\">Rate Your Experience</a></p><p>Thank you for choosing {our_company_name}!</p>", vars: ["first_name", "last_name", "client_name", "service_name", "completion_date", "feedback_url"] },
                        ] },
                    billing: { label: "Billing", templates: [
                            { id: "service-invoice-client", name: "Service Invoice - (Client)", subject: "Invoice for {service_name} - #{invoice_id}", body: "<h2>Service Invoice</h2><p>Hi {first_name},</p><p>Here is the invoice for your recent service:</p><table><tr><th>Service</th><th>Date</th><th>Amount</th><th>Invoice #</th></tr><tr><td>{service_name}</td><td>{booking_date}</td><td>{service_price}</td><td>{invoice_id}</td></tr></table><p><a href=\"{invoice_url}\">View & Pay Invoice</a></p>", vars: ["first_name", "last_name", "client_name", "service_name", "booking_date", "service_price", "invoice_id", "invoice_url"] },
                            { id: "service-payment-received", name: "Service Payment Received - (Client)", subject: "Payment Received - Thank You", body: "<p>Hi {first_name},</p><p>We've received your payment of <strong>{payment_amount}</strong> for <strong>{service_name}</strong>.</p><p>Thank you for your prompt payment!</p>", vars: ["first_name", "last_name", "client_name", "service_name", "payment_amount", "payment_date"] },
                        ] }
                };
                var SERVICE_GENERAL_VARS = ["{our_company_name}", "{todays_date}", "{email_signature}", "{email_footer}", "{dashboard_url}"];
                var allServiceTpls_1 = Object.values(SERVICE_EMAIL_TEMPLATES).flatMap(function (g) { return g.templates; });
                var currentServiceTpl = allServiceTpls_1.find(function (t) { return t.id === selectedServiceTpl; });
                return (React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("div", null,
                            React.createElement("h3", { className: "text-lg font-semibold" }, "Services Email Templates"),
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "APP > SETTINGS > SERVICES > EMAIL TEMPLATES")),
                        React.createElement(select_1.Select, { value: selectedServiceTpl, onValueChange: function (v) { return __awaiter(_this, void 0, void 0, function () {
                                var tpl, saved, _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            setSelectedServiceTpl(v);
                                            tpl = allServiceTpls_1.find(function (t) { return t.id === v; });
                                            _b.label = 1;
                                        case 1:
                                            _b.trys.push([1, 3, , 4]);
                                            return [4 /*yield*/, utils.settings.getByCategory.fetch({ category: "email_template:" + v })];
                                        case 2:
                                            saved = _b.sent();
                                            if (saved && (saved.subject || saved.body)) {
                                                setServiceTplSubject(saved.subject || (tpl === null || tpl === void 0 ? void 0 : tpl.subject) || "");
                                                setServiceTplBody(saved.body || (tpl === null || tpl === void 0 ? void 0 : tpl.body) || "");
                                                return [2 /*return*/];
                                            }
                                            return [3 /*break*/, 4];
                                        case 3:
                                            _a = _b.sent();
                                            return [3 /*break*/, 4];
                                        case 4:
                                            if (tpl) {
                                                setServiceTplSubject(tpl.subject);
                                                setServiceTplBody(tpl.body);
                                            }
                                            return [2 /*return*/];
                                    }
                                });
                            }); } },
                            React.createElement(select_1.SelectTrigger, { className: "w-[300px]" },
                                React.createElement(select_1.SelectValue, { placeholder: "Select A Template" })),
                            React.createElement(select_1.SelectContent, null, Object.entries(SERVICE_EMAIL_TEMPLATES).map(function (_a) {
                                var key = _a[0], group = _a[1];
                                return (React.createElement("div", { key: key },
                                    React.createElement("div", { className: "px-2 py-1.5 text-xs font-bold text-muted-foreground" },
                                        "[ ",
                                        group.label,
                                        " ]"),
                                    group.templates.map(function (tpl) { return (React.createElement(select_1.SelectItem, { key: tpl.id, value: tpl.id }, tpl.name)); })));
                            })))),
                    !currentServiceTpl ? (React.createElement(card_1.Card, { className: "py-16" },
                        React.createElement(card_1.CardContent, { className: "flex flex-col items-center justify-center text-center" },
                            React.createElement(lucide_react_1.Mail, { className: "h-16 w-16 text-muted-foreground mb-4" }),
                            React.createElement("h4", { className: "text-lg font-medium" }, "Select a service email template from the dropdown")))) : (React.createElement("div", { className: "grid grid-cols-[1fr_280px] gap-4" },
                        React.createElement("div", { className: "space-y-4" },
                            React.createElement(Field, { label: "Subject" },
                                React.createElement(input_1.Input, { value: serviceTplSubject, onChange: function (e) { return setServiceTplSubject(e.target.value); }, placeholder: "Email subject line" })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement("label", { className: "text-sm font-medium" }, "Email Body"),
                                React.createElement(tabs_1.Tabs, { defaultValue: "visual", className: "w-full" },
                                    React.createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-3" },
                                        React.createElement(tabs_1.TabsTrigger, { value: "visual" }, "Visual Editor"),
                                        React.createElement(tabs_1.TabsTrigger, { value: "html" }, "HTML Editor"),
                                        React.createElement(tabs_1.TabsTrigger, { value: "preview" }, "Preview")),
                                    React.createElement(tabs_1.TabsContent, { value: "visual", className: "space-y-2" },
                                        React.createElement(RichTextEditor_1.RichTextEditor, { value: serviceTplBody, onChange: setServiceTplBody, minHeight: "300px" })),
                                    React.createElement(tabs_1.TabsContent, { value: "html", className: "space-y-2" },
                                        React.createElement(textarea_1.Textarea, { value: serviceTplBody, onChange: function (e) { return setServiceTplBody(e.target.value); }, placeholder: "<p>Enter HTML content here</p>", className: "font-mono text-xs", rows: 12 })),
                                    React.createElement(tabs_1.TabsContent, { value: "preview", className: "space-y-2" },
                                        React.createElement("div", { className: "border rounded-lg p-4 bg-white text-black min-h-[300px] overflow-auto prose prose-sm max-w-none", dangerouslySetInnerHTML: { __html: serviceTplBody } })))),
                            React.createElement(SaveButton, { saving: !!saving["services-email-templates"], onClick: function () { return save("services-email-templates", function () { return updateByCategory.mutateAsync({ category: "email_template:" + selectedServiceTpl, values: { subject: serviceTplSubject, body: serviceTplBody } }); }); } })),
                        React.createElement("div", { className: "space-y-4" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, { className: "pb-2" },
                                    React.createElement(card_1.CardTitle, { className: "text-sm" }, "Template Variables")),
                                React.createElement(card_1.CardContent, { className: "space-y-1" }, currentServiceTpl.vars.map(function (v) { return React.createElement("div", { key: v, className: "text-xs font-mono text-muted-foreground cursor-pointer hover:text-primary", onClick: function () { setServiceTplBody(function (prev) { return prev + ("{" + v + "}"); }); } }, "{" + v + "}"); }))),
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, { className: "pb-2" },
                                    React.createElement(card_1.CardTitle, { className: "text-sm" }, "General Variables")),
                                React.createElement(card_1.CardContent, { className: "space-y-1" }, SERVICE_GENERAL_VARS.map(function (v) { return React.createElement("div", { key: v, className: "text-xs font-mono text-muted-foreground cursor-pointer hover:text-primary", onClick: function () { setServiceTplBody(function (prev) { return prev + v; }); } }, v); }))))))));
            }
            // ── E-SIGNATURES ───────────────────────────────────────────────────
            case "esign-general":
                return (React.createElement(Section, { title: "E-Signature Settings", description: "Configure electronic signature capabilities for contracts and proposals" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Enable E-Signatures"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Allow electronic document signing")),
                            React.createElement(switch_1.Switch, { checked: esignGeneral.enabled, onCheckedChange: function (v) { return setEsignGeneral(function (p) { return (__assign(__assign({}, p), { enabled: v })); }); } })),
                        React.createElement(Field, { label: "Provider" },
                            React.createElement(select_1.Select, { value: esignGeneral.provider, onValueChange: function (v) { return setEsignGeneral(function (p) { return (__assign(__assign({}, p), { provider: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "built-in" }, "Built-in"),
                                    React.createElement(select_1.SelectItem, { value: "docusign" }, "DocuSign"),
                                    React.createElement(select_1.SelectItem, { value: "hellosign" }, "HelloSign")))),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Require Authentication"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Signers must verify identity before signing")),
                            React.createElement(switch_1.Switch, { checked: esignGeneral.requireAuth, onCheckedChange: function (v) { return setEsignGeneral(function (p) { return (__assign(__assign({}, p), { requireAuth: v })); }); } })),
                        React.createElement(Field, { label: "Signature Expiry (days)" },
                            React.createElement(input_1.Input, { type: "number", min: "1", value: esignGeneral.expiryDays, onChange: function (e) { return setEsignGeneral(function (p) { return (__assign(__assign({}, p), { expiryDays: e.target.value })); }); } }))),
                    React.createElement(SaveButton, { saving: !!saving["esign-general"], onClick: function () { return save("esign-general", function () { return updateByCategory.mutateAsync({ category: "esign_general", values: __assign(__assign({}, esignGeneral), { enabled: String(esignGeneral.enabled), requireAuth: String(esignGeneral.requireAuth) }) }); }); } })));
            case "esign-providers":
                return (React.createElement(Section, { title: "Signature Providers", description: "Configure third-party e-signature integrations" },
                    React.createElement("div", { className: "space-y-6" },
                        React.createElement("div", { className: "border rounded-lg p-4 space-y-3" },
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("p", { className: "font-medium" }, "DocuSign"),
                                React.createElement(switch_1.Switch, { checked: esignProviders.docusign, onCheckedChange: function (v) { return setEsignProviders(function (p) { return (__assign(__assign({}, p), { docusign: v })); }); } })),
                            esignProviders.docusign && React.createElement(Field, { label: "Integration Key" },
                                React.createElement(input_1.Input, { type: "password", value: esignProviders.docusignApiKey, onChange: function (e) { return setEsignProviders(function (p) { return (__assign(__assign({}, p), { docusignApiKey: e.target.value })); }); }, placeholder: "DocuSign Integration Key" }))),
                        React.createElement("div", { className: "border rounded-lg p-4 space-y-3" },
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("p", { className: "font-medium" }, "HelloSign"),
                                React.createElement(switch_1.Switch, { checked: esignProviders.hellosign, onCheckedChange: function (v) { return setEsignProviders(function (p) { return (__assign(__assign({}, p), { hellosign: v })); }); } })),
                            esignProviders.hellosign && React.createElement(Field, { label: "API Key" },
                                React.createElement(input_1.Input, { type: "password", value: esignProviders.hellosignApiKey, onChange: function (e) { return setEsignProviders(function (p) { return (__assign(__assign({}, p), { hellosignApiKey: e.target.value })); }); }, placeholder: "HelloSign API Key" })))),
                    React.createElement(SaveButton, { saving: !!saving["esign-providers"], onClick: function () { return save("esign-providers", function () { return updateByCategory.mutateAsync({ category: "esign_providers", values: __assign(__assign({}, esignProviders), { docusign: String(esignProviders.docusign), hellosign: String(esignProviders.hellosign) }) }); }); } })));
            case "esign-templates":
                return (React.createElement(Section, { title: "Document Templates", description: "Design and preview document templates for invoices, receipts, and quotations. Use the rich editor to customize body content \u2013 insert tables, images, and formatted text. Leave blank to use the default system template." },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement(Field, { label: "Document Type" },
                            React.createElement(select_1.Select, { value: docTemplateType, onValueChange: function (v) { return setDocTemplateType(v); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "invoice" }, "Invoice Template"),
                                    React.createElement(select_1.SelectItem, { value: "receipt" }, "Receipt Template"),
                                    React.createElement(select_1.SelectItem, { value: "estimate" }, "Quotation / Estimate Template")))),
                        React.createElement("div", { className: "p-3 bg-muted/50 rounded-lg border" },
                            React.createElement("p", { className: "text-sm font-medium mb-2" }, "Available Placeholders"),
                            React.createElement("div", { className: "flex flex-wrap gap-2" }, [
                                "{{company_name}}", "{{company_email}}", "{{company_phone}}", "{{company_address}}",
                                "{{client_name}}", "{{client_email}}", "{{document_number}}", "{{document_date}}",
                                "{{due_date}}", "{{subtotal}}", "{{tax}}", "{{total}}", "{{currency}}", "{{items_table}}",
                            ].map(function (p) { return (React.createElement(badge_1.Badge, { key: p, variant: "secondary", className: "text-xs font-mono cursor-pointer hover:bg-primary/20", onClick: function () {
                                    setDocTemplates(function (prev) {
                                        var _a;
                                        return (__assign(__assign({}, prev), (_a = {}, _a[docTemplateType] = (prev[docTemplateType] || "") + p, _a)));
                                    });
                                } }, p)); })),
                            React.createElement("p", { className: "text-xs text-muted-foreground mt-2" }, "Click a placeholder to append it to the current template body. Use the table button (grid icon) in the toolbar to insert item tables.")),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { className: "text-sm font-medium block" },
                                docTemplateType === "invoice" ? "Invoice" : docTemplateType === "receipt" ? "Receipt" : "Quotation",
                                " Template Body"),
                            React.createElement(tabs_1.Tabs, { defaultValue: "visual", className: "w-full" },
                                React.createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-3" },
                                    React.createElement(tabs_1.TabsTrigger, { value: "visual" }, "Visual Editor"),
                                    React.createElement(tabs_1.TabsTrigger, { value: "html" }, "HTML Editor"),
                                    React.createElement(tabs_1.TabsTrigger, { value: "preview" }, "Preview")),
                                React.createElement(tabs_1.TabsContent, { value: "visual", className: "space-y-2" },
                                    React.createElement(RichTextEditor_1.RichTextEditor, { value: docTemplates[docTemplateType] || "", onChange: function (v) { return setDocTemplates(function (prev) {
                                            var _a;
                                            return (__assign(__assign({}, prev), (_a = {}, _a[docTemplateType] = v, _a)));
                                        }); }, placeholder: "Design your " + docTemplateType + " template here. Use the toolbar to insert tables, format text, add images, etc. Leave empty to use the default system template.", minHeight: "300px" })),
                                React.createElement(tabs_1.TabsContent, { value: "html", className: "space-y-2" },
                                    React.createElement(textarea_1.Textarea, { value: docTemplates[docTemplateType] || "", onChange: function (e) { return setDocTemplates(function (prev) {
                                            var _a;
                                            return (__assign(__assign({}, prev), (_a = {}, _a[docTemplateType] = e.target.value, _a)));
                                        }); }, placeholder: "Enter HTML content here", className: "font-mono text-xs", rows: 12 })),
                                React.createElement(tabs_1.TabsContent, { value: "preview", className: "space-y-2" },
                                    React.createElement("div", { className: "border rounded-lg p-4 bg-white text-black min-h-[300px] overflow-auto prose prose-sm max-w-none", dangerouslySetInnerHTML: { __html: docTemplates[docTemplateType] || "<p>No content yet.</p>" } })))),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("p", { className: "text-sm font-medium" }, "Live Preview"),
                            React.createElement(switch_1.Switch, { checked: docTemplatePreview, onCheckedChange: setDocTemplatePreview })),
                        docTemplatePreview && (React.createElement("div", { className: "border rounded-lg overflow-hidden bg-white" },
                            React.createElement("div", { className: "p-2 bg-muted/30 border-b flex items-center gap-2" },
                                React.createElement(lucide_react_1.FileText, { className: "h-4 w-4 text-muted-foreground" }),
                                React.createElement("span", { className: "text-sm font-medium" },
                                    "Preview: ",
                                    docTemplateType.charAt(0).toUpperCase() + docTemplateType.slice(1))),
                            React.createElement("div", { className: "p-6" }, docTemplates[docTemplateType] ? (React.createElement("div", { className: "prose prose-sm max-w-none [&_table]:border-collapse [&_table]:w-full [&_th]:border [&_th]:border-gray-300 [&_th]:bg-gray-100 [&_th]:p-2 [&_th]:text-left [&_td]:border [&_td]:border-gray-300 [&_td]:p-2", dangerouslySetInnerHTML: { __html: docTemplates[docTemplateType]
                                        .replace(/\{\{company_name\}\}/g, companyInfo.companyName || "Your Company")
                                        .replace(/\{\{company_email\}\}/g, companyInfo.companyEmail || "email@company.com")
                                        .replace(/\{\{company_phone\}\}/g, companyInfo.companyPhone || "+254 XXX XXX XXX")
                                        .replace(/\{\{company_address\}\}/g, companyInfo.companyAddress || "Address")
                                        .replace(/\{\{client_name\}\}/g, "Sample Client Ltd")
                                        .replace(/\{\{client_email\}\}/g, "client@example.com")
                                        .replace(/\{\{document_number\}\}/g, docTemplateType === "invoice" ? "INV-0001" : docTemplateType === "receipt" ? "RCP-0001" : "EST-0001")
                                        .replace(/\{\{document_date\}\}/g, new Date().toLocaleDateString())
                                        .replace(/\{\{due_date\}\}/g, new Date(Date.now() + 7 * 86400000).toLocaleDateString())
                                        .replace(/\{\{subtotal\}\}/g, "10,000.00")
                                        .replace(/\{\{tax\}\}/g, "1,600.00")
                                        .replace(/\{\{total\}\}/g, "11,600.00")
                                        .replace(/\{\{currency\}\}/g, "KES")
                                } })) : (React.createElement("p", { className: "text-sm text-muted-foreground italic" },
                                "No custom template defined. The system default template will be used for ",
                                docTemplateType,
                                "s.")))))),
                    React.createElement(separator_1.Separator, { className: "my-4" }),
                    React.createElement("div", { className: "space-y-3" },
                        React.createElement("p", { className: "text-sm font-medium" }, "E-Signature Document Types"),
                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "Create named template types for e-signature workflows (NDA, Service Agreement, etc.)"),
                        React.createElement("div", { className: "space-y-2" }, esignTemplates.map(function (t) { return (React.createElement("div", { key: t.id, className: "flex items-center justify-between p-2 border rounded" },
                            React.createElement("span", { className: "text-sm" }, t.name),
                            React.createElement("button", { onClick: function () { var u = esignTemplates.filter(function (x) { return x.id !== t.id; }); setEsignTemplates(u); updateByCategory.mutate({ category: "esign_templates", values: { list: JSON.stringify(u) } }); }, className: "text-destructive hover:text-destructive/80" },
                                React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); })),
                        React.createElement("div", { className: "flex gap-2 items-end" },
                            React.createElement(Field, { label: "Template Name" },
                                React.createElement(input_1.Input, { value: newEsignTemplate.name, onChange: function (e) { return setNewEsignTemplate({ name: e.target.value }); }, placeholder: "e.g. NDA, Service Agreement" })),
                            React.createElement(button_1.Button, { size: "sm", onClick: function () { if (!newEsignTemplate.name) {
                                    sonner_1.toast.error("Name required");
                                    return;
                                } var u = __spreadArrays(esignTemplates, [__assign({ id: crypto.randomUUID() }, newEsignTemplate)]); setEsignTemplates(u); setNewEsignTemplate({ name: "" }); updateByCategory.mutate({ category: "esign_templates", values: { list: JSON.stringify(u) } }); } },
                                React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                                "Add"))),
                    React.createElement(SaveButton, { saving: !!saving["esign-templates"], onClick: function () { return save("esign-templates", function () { return updateByCategory.mutateAsync({ category: "document_templates", values: docTemplates }); }); } })));
            // ── EMAIL MARKETING ────────────────────────────────────────────────
            case "emarketing-general":
                return (React.createElement(Section, { title: "Email Marketing Settings", description: "Configure email marketing campaigns and automation" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Enable Email Marketing"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Send newsletters and marketing campaigns")),
                            React.createElement(switch_1.Switch, { checked: emarketingGeneral.enabled, onCheckedChange: function (v) { return setEmarketingGeneral(function (p) { return (__assign(__assign({}, p), { enabled: v })); }); } })),
                        React.createElement(Field, { label: "Provider" },
                            React.createElement(select_1.Select, { value: emarketingGeneral.provider, onValueChange: function (v) { return setEmarketingGeneral(function (p) { return (__assign(__assign({}, p), { provider: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "built-in" }, "Built-in"),
                                    React.createElement(select_1.SelectItem, { value: "mailchimp" }, "Mailchimp"),
                                    React.createElement(select_1.SelectItem, { value: "sendinblue" }, "Sendinblue"),
                                    React.createElement(select_1.SelectItem, { value: "sendgrid" }, "SendGrid")))),
                        React.createElement(Field, { label: "From Name" },
                            React.createElement(input_1.Input, { value: emarketingGeneral.fromName, onChange: function (e) { return setEmarketingGeneral(function (p) { return (__assign(__assign({}, p), { fromName: e.target.value })); }); }, placeholder: "Your Company" })),
                        React.createElement(Field, { label: "From Email" },
                            React.createElement(input_1.Input, { type: "email", value: emarketingGeneral.fromEmail, onChange: function (e) { return setEmarketingGeneral(function (p) { return (__assign(__assign({}, p), { fromEmail: e.target.value })); }); }, placeholder: "marketing@yourdomain.com" })),
                        React.createElement(Field, { label: "Unsubscribe URL" },
                            React.createElement(input_1.Input, { value: emarketingGeneral.unsubscribeUrl, onChange: function (e) { return setEmarketingGeneral(function (p) { return (__assign(__assign({}, p), { unsubscribeUrl: e.target.value })); }); }, placeholder: "https://yourdomain.com/unsubscribe" }))),
                    React.createElement(SaveButton, { saving: !!saving["emarketing-general"], onClick: function () { return save("emarketing-general", function () { return updateByCategory.mutateAsync({ category: "emarketing_general", values: __assign(__assign({}, emarketingGeneral), { enabled: String(emarketingGeneral.enabled) }) }); }); } })));
            case "emarketing-campaigns": {
                var CAMPAIGN_TEMPLATE_VARS = ["{first_name}", "{last_name}", "{company_name}", "{campaign_name}", "{unsubscribe_url}", "{dashboard_url}"];
                var MARKETING_GENERAL_VARS = ["{our_company_name}", "{todays_date}", "{email_signature}", "{email_footer}", "{dashboard_url}"];
                return (React.createElement(Section, { title: "Campaigns", description: "Create and manage email marketing campaigns" },
                    React.createElement("p", { className: "text-sm text-muted-foreground mb-3" }, "Build targeted email campaigns for your clients and leads."),
                    React.createElement("div", { className: "space-y-2" }, ["Welcome Series", "Monthly Newsletter", "Product Announcements", "Re-engagement"].map(function (name) { return (React.createElement("div", { key: name, className: "flex items-center justify-between p-3 border rounded-md hover:bg-muted/50" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm font-medium" }, name),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Template campaign")),
                        React.createElement("div", { className: "flex gap-2" },
                            React.createElement(badge_1.Badge, { variant: "secondary" }, "Draft"),
                            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setEditingCampaign({ name: name, subject: name + " \u2014 Campaign", audience: "All Contacts", schedule: "Manual", body: "" }); } }, "Edit")))); })),
                    React.createElement(button_1.Button, { className: "mt-4", onClick: function () { return setEditingCampaign({ name: "", subject: "", audience: "All Contacts", schedule: "Manual", body: "" }); } },
                        React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                        "Create Campaign"),
                    React.createElement(dialog_1.Dialog, { open: !!editingCampaign, onOpenChange: function (o) { if (!o)
                            setEditingCampaign(null); } },
                        React.createElement(dialog_1.DialogContent, { className: "max-w-lg" },
                            React.createElement(dialog_1.DialogHeader, null,
                                React.createElement(dialog_1.DialogTitle, null, (editingCampaign === null || editingCampaign === void 0 ? void 0 : editingCampaign.name) ? "Edit: " + editingCampaign.name : "New Campaign"),
                                React.createElement(dialog_1.DialogDescription, null, "Configure campaign details, targeting, schedule, and content.")),
                            React.createElement("div", { className: "space-y-4 py-2" },
                                React.createElement("div", null,
                                    React.createElement(label_1.Label, null, "Campaign Name"),
                                    React.createElement(input_1.Input, { value: (_k = editingCampaign === null || editingCampaign === void 0 ? void 0 : editingCampaign.name) !== null && _k !== void 0 ? _k : "", onChange: function (e) { return setEditingCampaign(function (p) { return p ? __assign(__assign({}, p), { name: e.target.value }) : p; }); }, placeholder: "e.g. Spring Promotion" })),
                                React.createElement("div", null,
                                    React.createElement(label_1.Label, null, "Subject Line"),
                                    React.createElement(input_1.Input, { value: (_l = editingCampaign === null || editingCampaign === void 0 ? void 0 : editingCampaign.subject) !== null && _l !== void 0 ? _l : "", onChange: function (e) { return setEditingCampaign(function (p) { return p ? __assign(__assign({}, p), { subject: e.target.value }) : p; }); }, placeholder: "Email subject" })),
                                React.createElement("div", null,
                                    React.createElement(label_1.Label, null, "Target Audience"),
                                    React.createElement(select_1.Select, { value: (_m = editingCampaign === null || editingCampaign === void 0 ? void 0 : editingCampaign.audience) !== null && _m !== void 0 ? _m : "All Contacts", onValueChange: function (v) { return setEditingCampaign(function (p) { return p ? __assign(__assign({}, p), { audience: v }) : p; }); } },
                                        React.createElement(select_1.SelectTrigger, null,
                                            React.createElement(select_1.SelectValue, null)),
                                        React.createElement(select_1.SelectContent, null,
                                            React.createElement(select_1.SelectItem, { value: "All Contacts" }, "All Contacts"),
                                            React.createElement(select_1.SelectItem, { value: "Clients Only" }, "Clients Only"),
                                            React.createElement(select_1.SelectItem, { value: "Leads Only" }, "Leads Only"),
                                            React.createElement(select_1.SelectItem, { value: "Newsletter Subscribers" }, "Newsletter Subscribers")))),
                                React.createElement("div", null,
                                    React.createElement(label_1.Label, null, "Schedule"),
                                    React.createElement(select_1.Select, { value: (_o = editingCampaign === null || editingCampaign === void 0 ? void 0 : editingCampaign.schedule) !== null && _o !== void 0 ? _o : "Manual", onValueChange: function (v) { return setEditingCampaign(function (p) { return p ? __assign(__assign({}, p), { schedule: v }) : p; }); } },
                                        React.createElement(select_1.SelectTrigger, null,
                                            React.createElement(select_1.SelectValue, null)),
                                        React.createElement(select_1.SelectContent, null,
                                            React.createElement(select_1.SelectItem, { value: "Manual" }, "Send Manually"),
                                            React.createElement(select_1.SelectItem, { value: "Scheduled" }, "Schedule for Later"),
                                            React.createElement(select_1.SelectItem, { value: "Recurring" }, "Recurring")))),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, null, "Body Content"),
                                    React.createElement(tabs_1.Tabs, { defaultValue: "visual", className: "w-full" },
                                        React.createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-3" },
                                            React.createElement(tabs_1.TabsTrigger, { value: "visual" }, "Visual Editor"),
                                            React.createElement(tabs_1.TabsTrigger, { value: "html" }, "HTML Editor"),
                                            React.createElement(tabs_1.TabsTrigger, { value: "preview" }, "Preview")),
                                        React.createElement(tabs_1.TabsContent, { value: "visual", className: "space-y-2" },
                                            React.createElement(RichTextEditor_1.RichTextEditor, { value: (_p = editingCampaign === null || editingCampaign === void 0 ? void 0 : editingCampaign.body) !== null && _p !== void 0 ? _p : "", onChange: function (html) { return setEditingCampaign(function (p) { return p ? __assign(__assign({}, p), { body: html }) : p; }); }, minHeight: "220px" })),
                                        React.createElement(tabs_1.TabsContent, { value: "html", className: "space-y-2" },
                                            React.createElement(textarea_1.Textarea, { rows: 8, value: (_q = editingCampaign === null || editingCampaign === void 0 ? void 0 : editingCampaign.body) !== null && _q !== void 0 ? _q : "", onChange: function (e) { return setEditingCampaign(function (p) { return p ? __assign(__assign({}, p), { body: e.target.value }) : p; }); }, placeholder: "Enter HTML content here", className: "font-mono text-xs" })),
                                        React.createElement(tabs_1.TabsContent, { value: "preview", className: "space-y-2" },
                                            React.createElement("div", { className: "border rounded-lg p-4 bg-white text-black min-h-[220px] overflow-auto prose prose-sm max-w-none", dangerouslySetInnerHTML: { __html: (_r = editingCampaign === null || editingCampaign === void 0 ? void 0 : editingCampaign.body) !== null && _r !== void 0 ? _r : "<p>Preview will appear here</p>" } })))),
                                React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                                    React.createElement(card_1.Card, null,
                                        React.createElement(card_1.CardHeader, { className: "pb-2" },
                                            React.createElement(card_1.CardTitle, { className: "text-sm" }, "Campaign Variables")),
                                        React.createElement(card_1.CardContent, { className: "space-y-1" }, CAMPAIGN_TEMPLATE_VARS.map(function (v) { return (React.createElement("div", { key: v, className: "text-xs font-mono text-muted-foreground cursor-pointer hover:text-primary", onClick: function () { return setEditingCampaign(function (p) { return p ? __assign(__assign({}, p), { body: (p.body || "") + v }) : p; }); } }, v)); }))),
                                    React.createElement(card_1.Card, null,
                                        React.createElement(card_1.CardHeader, { className: "pb-2" },
                                            React.createElement(card_1.CardTitle, { className: "text-sm" }, "General Variables")),
                                        React.createElement(card_1.CardContent, { className: "space-y-1" }, MARKETING_GENERAL_VARS.map(function (v) { return (React.createElement("div", { key: v, className: "text-xs font-mono text-muted-foreground cursor-pointer hover:text-primary", onClick: function () { return setEditingCampaign(function (p) { return p ? __assign(__assign({}, p), { body: (p.body || "") + v }) : p; }); } }, v)); }))))),
                            React.createElement(dialog_1.DialogFooter, null,
                                React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setEditingCampaign(null); } }, "Cancel"),
                                React.createElement(button_1.Button, { onClick: function () { sonner_1.toast.success("Campaign \"" + (editingCampaign === null || editingCampaign === void 0 ? void 0 : editingCampaign.name) + "\" saved"); setEditingCampaign(null); } }, "Save Campaign"))))));
            }
            case "emarketing-lists":
                return (React.createElement(Section, { title: "Mailing Lists", description: "Manage subscriber lists for email campaigns" },
                    React.createElement("div", { className: "space-y-2" }, emarketingLists.map(function (l) { return (React.createElement("div", { key: l.id, className: "flex items-center justify-between p-2 border rounded" },
                        React.createElement("span", { className: "text-sm" }, l.name),
                        React.createElement("button", { onClick: function () { var u = emarketingLists.filter(function (x) { return x.id !== l.id; }); setEmarketingLists(u); updateByCategory.mutate({ category: "emarketing_lists", values: { list: JSON.stringify(u) } }); }, className: "text-destructive hover:text-destructive/80" },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); })),
                    React.createElement("div", { className: "flex gap-2 items-end mt-3" },
                        React.createElement(Field, { label: "List Name" },
                            React.createElement(input_1.Input, { value: newEmarketingList.name, onChange: function (e) { return setNewEmarketingList({ name: e.target.value }); }, placeholder: "e.g. Newsletter, Product Updates" })),
                        React.createElement(button_1.Button, { size: "sm", onClick: function () { if (!newEmarketingList.name) {
                                sonner_1.toast.error("Name required");
                                return;
                            } var u = __spreadArrays(emarketingLists, [__assign({ id: crypto.randomUUID() }, newEmarketingList)]); setEmarketingLists(u); setNewEmarketingList({ name: "" }); updateByCategory.mutate({ category: "emarketing_lists", values: { list: JSON.stringify(u) } }); } },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                            "Add"))));
            case "emarketing-templates": {
                var MARKETING_TEMPLATE_VARS = ["{first_name}", "{last_name}", "{company_name}", "{product_name}", "{event_date}", "{promo_code}", "{unsubscribe_url}"];
                var MARKETING_GENERAL_VARS = ["{our_company_name}", "{todays_date}", "{email_signature}", "{email_footer}", "{dashboard_url}"];
                return (React.createElement(Section, { title: "Marketing Templates", description: "Design reusable email templates for campaigns" },
                    React.createElement("div", { className: "space-y-2" }, ["Welcome Email", "Product Launch", "Event Invitation", "Monthly Digest", "Special Offer"].map(function (name) { return (React.createElement("div", { key: name, className: "flex items-center justify-between p-3 border rounded-md hover:bg-muted/50" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm font-medium" }, name),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "HTML Email Template")),
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setEditingTemplate({ name: name, subject: "" + name, body: "" }); } }, "Customize"))); })),
                    React.createElement(button_1.Button, { className: "mt-4", onClick: function () { return setEditingTemplate({ name: "", subject: "", body: "" }); } },
                        React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                        "Create Template"),
                    React.createElement(dialog_1.Dialog, { open: !!editingTemplate, onOpenChange: function (o) { if (!o)
                            setEditingTemplate(null); } },
                        React.createElement(dialog_1.DialogContent, { className: "max-w-lg" },
                            React.createElement(dialog_1.DialogHeader, null,
                                React.createElement(dialog_1.DialogTitle, null, (editingTemplate === null || editingTemplate === void 0 ? void 0 : editingTemplate.name) ? "Customize: " + editingTemplate.name : "New Template"),
                                React.createElement(dialog_1.DialogDescription, null, "Edit template subject, body content, and branding.")),
                            React.createElement("div", { className: "space-y-4 py-2" },
                                React.createElement("div", null,
                                    React.createElement(label_1.Label, null, "Template Name"),
                                    React.createElement(input_1.Input, { value: (_s = editingTemplate === null || editingTemplate === void 0 ? void 0 : editingTemplate.name) !== null && _s !== void 0 ? _s : "", onChange: function (e) { return setEditingTemplate(function (p) { return p ? __assign(__assign({}, p), { name: e.target.value }) : p; }); }, placeholder: "Template name" })),
                                React.createElement("div", null,
                                    React.createElement(label_1.Label, null, "Subject Line"),
                                    React.createElement(input_1.Input, { value: (_t = editingTemplate === null || editingTemplate === void 0 ? void 0 : editingTemplate.subject) !== null && _t !== void 0 ? _t : "", onChange: function (e) { return setEditingTemplate(function (p) { return p ? __assign(__assign({}, p), { subject: e.target.value }) : p; }); }, placeholder: "Email subject" })),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, null, "Body (HTML)"),
                                    React.createElement(tabs_1.Tabs, { defaultValue: "visual", className: "w-full" },
                                        React.createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-3" },
                                            React.createElement(tabs_1.TabsTrigger, { value: "visual" }, "Visual Editor"),
                                            React.createElement(tabs_1.TabsTrigger, { value: "html" }, "HTML Editor"),
                                            React.createElement(tabs_1.TabsTrigger, { value: "preview" }, "Preview")),
                                        React.createElement(tabs_1.TabsContent, { value: "visual", className: "space-y-2" },
                                            React.createElement(RichTextEditor_1.RichTextEditor, { value: (_u = editingTemplate === null || editingTemplate === void 0 ? void 0 : editingTemplate.body) !== null && _u !== void 0 ? _u : "", onChange: function (html) { return setEditingTemplate(function (p) { return p ? __assign(__assign({}, p), { body: html }) : p; }); }, minHeight: "220px" })),
                                        React.createElement(tabs_1.TabsContent, { value: "html", className: "space-y-2" },
                                            React.createElement(textarea_1.Textarea, { rows: 8, value: (_v = editingTemplate === null || editingTemplate === void 0 ? void 0 : editingTemplate.body) !== null && _v !== void 0 ? _v : "", onChange: function (e) { return setEditingTemplate(function (p) { return p ? __assign(__assign({}, p), { body: e.target.value }) : p; }); }, placeholder: "<html>\n  <body>\n    <h1>Hello {{name}}</h1>\n    <p>Your content here...</p>\n  </body>\n</html>", className: "font-mono text-sm" })),
                                        React.createElement(tabs_1.TabsContent, { value: "preview", className: "space-y-2" },
                                            React.createElement("div", { className: "border rounded-lg p-4 bg-white text-black min-h-[220px] overflow-auto prose prose-sm max-w-none", dangerouslySetInnerHTML: { __html: (_w = editingTemplate === null || editingTemplate === void 0 ? void 0 : editingTemplate.body) !== null && _w !== void 0 ? _w : "<p>Preview will appear here</p>" } })))),
                                React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                                    React.createElement(card_1.Card, null,
                                        React.createElement(card_1.CardHeader, { className: "pb-2" },
                                            React.createElement(card_1.CardTitle, { className: "text-sm" }, "Template Variables")),
                                        React.createElement(card_1.CardContent, { className: "space-y-1" }, MARKETING_TEMPLATE_VARS.map(function (v) { return (React.createElement("div", { key: v, className: "text-xs font-mono text-muted-foreground cursor-pointer hover:text-primary", onClick: function () { return setEditingTemplate(function (p) { return p ? __assign(__assign({}, p), { body: (p.body || "") + v }) : p; }); } }, v)); }))),
                                    React.createElement(card_1.Card, null,
                                        React.createElement(card_1.CardHeader, { className: "pb-2" },
                                            React.createElement(card_1.CardTitle, { className: "text-sm" }, "General Variables")),
                                        React.createElement(card_1.CardContent, { className: "space-y-1" }, MARKETING_GENERAL_VARS.map(function (v) { return (React.createElement("div", { key: v, className: "text-xs font-mono text-muted-foreground cursor-pointer hover:text-primary", onClick: function () { return setEditingTemplate(function (p) { return p ? __assign(__assign({}, p), { body: (p.body || "") + v }) : p; }); } }, v)); }))))),
                            React.createElement(dialog_1.DialogFooter, null,
                                React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setEditingTemplate(null); } }, "Cancel"),
                                React.createElement(button_1.Button, { onClick: function () { sonner_1.toast.success("Template \"" + (editingTemplate === null || editingTemplate === void 0 ? void 0 : editingTemplate.name) + "\" saved"); setEditingTemplate(null); } }, "Save Template"))))));
            }
            // ── CLIENT PORTAL ──────────────────────────────────────────────────
            case "portal-general":
                return (React.createElement(Section, { title: "Client Portal Settings", description: "Configure the client-facing portal experience" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Enable Client Portal"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Allow clients to access their portal")),
                            React.createElement(switch_1.Switch, { checked: portalGeneral.enabled, onCheckedChange: function (v) { return setPortalGeneral(function (p) { return (__assign(__assign({}, p), { enabled: v })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Require Approval"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Admin must approve client portal registrations")),
                            React.createElement(switch_1.Switch, { checked: portalGeneral.requireApproval, onCheckedChange: function (v) { return setPortalGeneral(function (p) { return (__assign(__assign({}, p), { requireApproval: v })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Show Invoices"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Clients can view their invoices")),
                            React.createElement(switch_1.Switch, { checked: portalGeneral.showInvoices, onCheckedChange: function (v) { return setPortalGeneral(function (p) { return (__assign(__assign({}, p), { showInvoices: v })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Show Projects"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Clients can view their project status")),
                            React.createElement(switch_1.Switch, { checked: portalGeneral.showProjects, onCheckedChange: function (v) { return setPortalGeneral(function (p) { return (__assign(__assign({}, p), { showProjects: v })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Show Tickets"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Clients can view and create support tickets")),
                            React.createElement(switch_1.Switch, { checked: portalGeneral.showTickets, onCheckedChange: function (v) { return setPortalGeneral(function (p) { return (__assign(__assign({}, p), { showTickets: v })); }); } })),
                        React.createElement(Field, { label: "Custom Domain" },
                            React.createElement(input_1.Input, { value: portalGeneral.customDomain, onChange: function (e) { return setPortalGeneral(function (p) { return (__assign(__assign({}, p), { customDomain: e.target.value })); }); }, placeholder: "portal.yourdomain.com" }))),
                    React.createElement(SaveButton, { saving: !!saving["portal-general"], onClick: function () { return save("portal-general", function () { return updateByCategory.mutateAsync({ category: "portal_general", values: __assign(__assign({}, portalGeneral), { enabled: String(portalGeneral.enabled), requireApproval: String(portalGeneral.requireApproval), showInvoices: String(portalGeneral.showInvoices), showProjects: String(portalGeneral.showProjects), showTickets: String(portalGeneral.showTickets) }) }); }); } })));
            case "portal-branding":
                return (React.createElement(Section, { title: "Portal Branding", description: "Customize the look and feel of your client portal" },
                    React.createElement("div", { className: "grid grid-cols-1 gap-4" },
                        React.createElement(Field, { label: "Portal Title" },
                            React.createElement(input_1.Input, { value: portalBranding.portalTitle, onChange: function (e) { return setPortalBranding(function (p) { return (__assign(__assign({}, p), { portalTitle: e.target.value })); }); }, placeholder: "Client Portal" })),
                        React.createElement(Field, { label: "Logo URL" },
                            React.createElement(input_1.Input, { value: portalBranding.logoUrl, onChange: function (e) { return setPortalBranding(function (p) { return (__assign(__assign({}, p), { logoUrl: e.target.value })); }); }, placeholder: "https://yourdomain.com/logo.png" })),
                        React.createElement(Field, { label: "Primary Color" },
                            React.createElement("div", { className: "flex gap-2" },
                                React.createElement(input_1.Input, { value: portalBranding.primaryColor, onChange: function (e) { return setPortalBranding(function (p) { return (__assign(__assign({}, p), { primaryColor: e.target.value })); }); } }),
                                React.createElement("input", { type: "color", value: portalBranding.primaryColor, onChange: function (e) { return setPortalBranding(function (p) { return (__assign(__assign({}, p), { primaryColor: e.target.value })); }); }, className: "w-10 h-10 rounded border cursor-pointer" }))),
                        React.createElement(Field, { label: "Welcome Message" },
                            React.createElement(input_1.Input, { value: portalBranding.welcomeMessage, onChange: function (e) { return setPortalBranding(function (p) { return (__assign(__assign({}, p), { welcomeMessage: e.target.value })); }); }, placeholder: "Welcome to your client portal" }))),
                    React.createElement(SaveButton, { saving: !!saving["portal-branding"], onClick: function () { return save("portal-branding", function () { return updateByCategory.mutateAsync({ category: "portal_branding", values: portalBranding }); }); } })));
            case "portal-permissions":
                return (React.createElement(Section, { title: "Portal Permissions", description: "Control what clients can do in the portal" },
                    React.createElement("div", { className: "space-y-4" }, Object.entries({ viewInvoices: "View Invoices", payOnline: "Pay Online", createTickets: "Create Support Tickets", viewProjects: "View Projects", downloadFiles: "Download Files", viewEstimates: "View Estimates" }).map(function (_a) {
                        var key = _a[0], label = _a[1];
                        return (React.createElement("div", { key: key, className: "flex items-center justify-between" },
                            React.createElement("p", { className: "text-sm font-medium" }, label),
                            React.createElement(switch_1.Switch, { checked: portalPermissions[key], onCheckedChange: function (v) { return setPortalPermissions(function (p) {
                                    var _a;
                                    return (__assign(__assign({}, p), (_a = {}, _a[key] = v, _a)));
                                }); } })));
                    })),
                    React.createElement(SaveButton, { saving: !!saving["portal-permissions"], onClick: function () { return save("portal-permissions", function () { return updateByCategory.mutateAsync({ category: "portal_permissions", values: Object.fromEntries(Object.entries(portalPermissions).map(function (_a) {
                                var k = _a[0], v = _a[1];
                                return [k, String(v)];
                            })) }); }); } })));
            case "portal-modules":
                return (React.createElement(Section, { title: "Module Access", description: "Control which modules are visible in the client portal" },
                    React.createElement("div", { className: "space-y-4" }, Object.entries({ invoices: "Invoices", estimates: "Estimates", projects: "Projects", tickets: "Support Tickets", contracts: "Contracts", knowledgebase: "Knowledge Base", announcements: "Announcements" }).map(function (_a) {
                        var key = _a[0], label = _a[1];
                        return (React.createElement("div", { key: key, className: "flex items-center justify-between" },
                            React.createElement("p", { className: "text-sm font-medium" }, label),
                            React.createElement(switch_1.Switch, { checked: portalModules[key], onCheckedChange: function (v) { return setPortalModules(function (p) {
                                    var _a;
                                    return (__assign(__assign({}, p), (_a = {}, _a[key] = v, _a)));
                                }); } })));
                    })),
                    React.createElement(SaveButton, { saving: !!saving["portal-modules"], onClick: function () { return save("portal-modules", function () { return updateByCategory.mutateAsync({ category: "portal_modules", values: Object.fromEntries(Object.entries(portalModules).map(function (_a) {
                                var k = _a[0], v = _a[1];
                                return [k, String(v)];
                            })) }); }); } })));
            // ── PURCHASING ─────────────────────────────────────────────────────
            case "purchasing-settings":
                return (React.createElement(Section, { title: "Purchasing Settings", description: "Configure purchasing module options" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Enable Purchasing"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Track purchase orders and vendor management")),
                            React.createElement(switch_1.Switch, { checked: purchasingSettings.enabled, onCheckedChange: function (v) { return setPurchasingSettings(function (p) { return (__assign(__assign({}, p), { enabled: v })); }); } })),
                        React.createElement(Field, { label: "Default Tax Rate (%)" },
                            React.createElement(input_1.Input, { type: "number", min: "0", max: "100", value: purchasingSettings.defaultTaxRate, onChange: function (e) { return setPurchasingSettings(function (p) { return (__assign(__assign({}, p), { defaultTaxRate: e.target.value })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Require Approval"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Purchase orders need approval before processing")),
                            React.createElement(switch_1.Switch, { checked: purchasingSettings.approvalRequired, onCheckedChange: function (v) { return setPurchasingSettings(function (p) { return (__assign(__assign({}, p), { approvalRequired: v })); }); } })),
                        React.createElement(Field, { label: "Default Payment Terms" },
                            React.createElement(select_1.Select, { value: purchasingSettings.defaultPaymentTerms, onValueChange: function (v) { return setPurchasingSettings(function (p) { return (__assign(__assign({}, p), { defaultPaymentTerms: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "net15" }, "Net 15"),
                                    React.createElement(select_1.SelectItem, { value: "net30" }, "Net 30"),
                                    React.createElement(select_1.SelectItem, { value: "net45" }, "Net 45"),
                                    React.createElement(select_1.SelectItem, { value: "net60" }, "Net 60"),
                                    React.createElement(select_1.SelectItem, { value: "due-on-receipt" }, "Due on Receipt"))))),
                    React.createElement(SaveButton, { saving: !!saving["purchasing-settings"], onClick: function () { return save("purchasing-settings", function () { return updateByCategory.mutateAsync({ category: "purchasing_settings", values: __assign(__assign({}, purchasingSettings), { enabled: String(purchasingSettings.enabled), approvalRequired: String(purchasingSettings.approvalRequired) }) }); }); } })));
            case "purchasing-email": {
                var PURCHASING_EMAIL_TEMPLATES = [
                    { id: "purchase-order-created-team", name: "Purchase Order Created - Team", subject: "Purchase Order Created", vars: ["recipient_name", "po_number", "vendor_name", "po_total", "due_date", "company_name", "approval_status"] },
                    { id: "purchase-order-approved-team", name: "Purchase Order Approved - Team", subject: "Purchase Order Approved", vars: ["recipient_name", "po_number", "vendor_name", "po_total", "approved_by", "company_name"] },
                    { id: "purchase-order-received-team", name: "Purchase Order Received - Team", subject: "Purchase Order Received", vars: ["recipient_name", "po_number", "vendor_name", "received_date", "po_total", "company_name"] },
                    { id: "purchase-order-rejected-team", name: "Purchase Order Rejected - Team", subject: "Purchase Order Rejected", vars: ["recipient_name", "po_number", "vendor_name", "rejection_reason", "company_name"] },
                ];
                var PURCHASING_GENERAL_VARS = ["{company_name}", "{company_email}", "{company_phone}", "{company_address}", "{dashboard_url}"];
                var currentPurchasingTpl = PURCHASING_EMAIL_TEMPLATES.find(function (tpl) { return tpl.id === (editingPurchasingTemplate === null || editingPurchasingTemplate === void 0 ? void 0 : editingPurchasingTemplate.id); });
                return (React.createElement(Section, { title: "Purchasing Email", description: "Configure email notifications for purchasing" },
                    React.createElement("div", { className: "space-y-2" }, PURCHASING_EMAIL_TEMPLATES.map(function (tpl) { return (React.createElement("div", { key: tpl.id, className: "flex items-center justify-between p-3 border rounded-md hover:bg-muted/50" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm font-medium" }, tpl.name),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "System template")),
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setEditingPurchasingTemplate({ id: tpl.id, name: tpl.name, subject: tpl.subject, body: "" }); } }, "Edit"))); })),
                    React.createElement(dialog_1.Dialog, { open: !!editingPurchasingTemplate, onOpenChange: function (o) { if (!o)
                            setEditingPurchasingTemplate(null); } },
                        React.createElement(dialog_1.DialogContent, { className: "max-w-lg" },
                            React.createElement(dialog_1.DialogHeader, null,
                                React.createElement(dialog_1.DialogTitle, null,
                                    "Edit: ", editingPurchasingTemplate === null || editingPurchasingTemplate === void 0 ? void 0 :
                                    editingPurchasingTemplate.name),
                                React.createElement(dialog_1.DialogDescription, null, "Customize the email notification template content.")),
                            React.createElement("div", { className: "space-y-4 py-2" },
                                React.createElement("div", null,
                                    React.createElement(label_1.Label, null, "Subject"),
                                    React.createElement(input_1.Input, { value: (_x = editingPurchasingTemplate === null || editingPurchasingTemplate === void 0 ? void 0 : editingPurchasingTemplate.subject) !== null && _x !== void 0 ? _x : "", onChange: function (e) { return setEditingPurchasingTemplate(function (p) { return p ? __assign(__assign({}, p), { subject: e.target.value }) : p; }); }, placeholder: "Email subject line" })),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, null, "Body"),
                                    React.createElement(tabs_1.Tabs, { defaultValue: "visual", className: "w-full" },
                                        React.createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-3" },
                                            React.createElement(tabs_1.TabsTrigger, { value: "visual" }, "Visual Editor"),
                                            React.createElement(tabs_1.TabsTrigger, { value: "html" }, "HTML Editor"),
                                            React.createElement(tabs_1.TabsTrigger, { value: "preview" }, "Preview")),
                                        React.createElement(tabs_1.TabsContent, { value: "visual", className: "space-y-2" },
                                            React.createElement(RichTextEditor_1.RichTextEditor, { value: (_y = editingPurchasingTemplate === null || editingPurchasingTemplate === void 0 ? void 0 : editingPurchasingTemplate.body) !== null && _y !== void 0 ? _y : "", onChange: function (html) { return setEditingPurchasingTemplate(function (p) { return p ? __assign(__assign({}, p), { body: html }) : p; }); }, minHeight: "220px" })),
                                        React.createElement(tabs_1.TabsContent, { value: "html", className: "space-y-2" },
                                            React.createElement(textarea_1.Textarea, { rows: 8, value: (_z = editingPurchasingTemplate === null || editingPurchasingTemplate === void 0 ? void 0 : editingPurchasingTemplate.body) !== null && _z !== void 0 ? _z : "", onChange: function (e) { return setEditingPurchasingTemplate(function (p) { return p ? __assign(__assign({}, p), { body: e.target.value }) : p; }); }, placeholder: "Hello {{recipient_name}},\n\nA purchase order has been {{action}}.\n\nPO Number: {{po_number}}\nAmount: {{amount}}\n\nRegards,\n{{company_name}}", className: "font-mono text-sm" })),
                                        React.createElement(tabs_1.TabsContent, { value: "preview", className: "space-y-2" },
                                            React.createElement("div", { className: "border rounded-lg p-4 bg-white text-black min-h-[220px] overflow-auto prose prose-sm max-w-none", dangerouslySetInnerHTML: { __html: (_0 = editingPurchasingTemplate === null || editingPurchasingTemplate === void 0 ? void 0 : editingPurchasingTemplate.body) !== null && _0 !== void 0 ? _0 : "<p>Preview will appear here</p>" } })))),
                                React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                                    React.createElement(card_1.Card, null,
                                        React.createElement(card_1.CardHeader, { className: "pb-2" },
                                            React.createElement(card_1.CardTitle, { className: "text-sm" }, "Template Variables")),
                                        React.createElement(card_1.CardContent, { className: "space-y-1" }, ((_1 = currentPurchasingTpl === null || currentPurchasingTpl === void 0 ? void 0 : currentPurchasingTpl.vars) !== null && _1 !== void 0 ? _1 : []).map(function (v) { return (React.createElement("div", { key: v, className: "text-xs font-mono text-muted-foreground cursor-pointer hover:text-primary", onClick: function () { return setEditingPurchasingTemplate(function (p) { return p ? __assign(__assign({}, p), { body: (p.body || "") + "{" + v + "}" }) : p; }); } }, "{" + v + "}")); }))),
                                    React.createElement(card_1.Card, null,
                                        React.createElement(card_1.CardHeader, { className: "pb-2" },
                                            React.createElement(card_1.CardTitle, { className: "text-sm" }, "General Variables")),
                                        React.createElement(card_1.CardContent, { className: "space-y-1" }, PURCHASING_GENERAL_VARS.map(function (v) { return (React.createElement("div", { key: v, className: "text-xs font-mono text-muted-foreground cursor-pointer hover:text-primary", onClick: function () { return setEditingPurchasingTemplate(function (p) { return p ? __assign(__assign({}, p), { body: (p.body || "") + v }) : p; }); } }, v)); }))))),
                            React.createElement(dialog_1.DialogFooter, null,
                                React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setEditingPurchasingTemplate(null); } }, "Cancel"),
                                React.createElement(button_1.Button, { onClick: function () { sonner_1.toast.success("Template \"" + (editingPurchasingTemplate === null || editingPurchasingTemplate === void 0 ? void 0 : editingPurchasingTemplate.name) + "\" saved"); setEditingPurchasingTemplate(null); } }, "Save Template"))))));
            }
            // ── TWEAK ──────────────────────────────────────────────────────────
            case "tweak":
                return (React.createElement(Section, { title: "Tweak", description: "Advanced system configuration" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Show Powered By"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Display platform branding in footer")),
                            React.createElement(switch_1.Switch, { checked: tweakSettings.showPoweredBy, onCheckedChange: function (v) { return setTweakSettings(function (p) { return (__assign(__assign({}, p), { showPoweredBy: v })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Force HTTPS"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Redirect all requests to HTTPS")),
                            React.createElement(switch_1.Switch, { checked: tweakSettings.forceHttps, onCheckedChange: function (v) { return setTweakSettings(function (p) { return (__assign(__assign({}, p), { forceHttps: v })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Enable Debug Mode"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Show detailed error messages (development only)")),
                            React.createElement(switch_1.Switch, { checked: tweakSettings.debugMode, onCheckedChange: function (v) { return setTweakSettings(function (p) { return (__assign(__assign({}, p), { debugMode: v })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Maintenance Mode"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Show maintenance page to all non-admin users")),
                            React.createElement(switch_1.Switch, { checked: tweakSettings.maintenanceMode, onCheckedChange: function (v) { return setTweakSettings(function (p) { return (__assign(__assign({}, p), { maintenanceMode: v })); }); } })),
                        React.createElement(Field, { label: "Custom CSS" },
                            React.createElement("textarea", { className: "w-full min-h-[100px] p-2 text-sm font-mono border rounded-md", placeholder: "/* Custom CSS overrides */", value: tweakSettings.customCss, onChange: function (e) { return setTweakSettings(function (p) { return (__assign(__assign({}, p), { customCss: e.target.value })); }); } })),
                        React.createElement(Field, { label: "Custom JavaScript" },
                            React.createElement("textarea", { className: "w-full min-h-[100px] p-2 text-sm font-mono border rounded-md", placeholder: "// Custom JavaScript", value: tweakSettings.customJs, onChange: function (e) { return setTweakSettings(function (p) { return (__assign(__assign({}, p), { customJs: e.target.value })); }); } }))),
                    React.createElement(SaveButton, { saving: !!saving.tweak, onClick: function () { return save("tweak", function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, updateByCategory.mutateAsync({ category: "tweak_settings", values: __assign(__assign({}, tweakSettings), { showPoweredBy: String(tweakSettings.showPoweredBy), forceHttps: String(tweakSettings.forceHttps), debugMode: String(tweakSettings.debugMode), maintenanceMode: String(tweakSettings.maintenanceMode) }) })];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, updateByCategory.mutateAsync({ category: "maintenance", values: { maintenance_mode: String(tweakSettings.maintenanceMode) } })];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        }); }); }); } })));
            default:
                return null;
        }
    }
    // ── Render ─────────────────────────────────────────────────────────────────
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Settings", description: "Configure every aspect of your CRM system", icon: React.createElement(lucide_react_1.Settings, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Settings" }], actions: (React.createElement(button_1.Button, { variant: "outline", size: "sm", className: "md:hidden", onClick: function () { return setMobileNavOpen(true); } },
            React.createElement(lucide_react_1.Menu, { className: "mr-2 h-4 w-4" }),
            "Menu")) },
        mobileNavOpen && (React.createElement("div", { className: "fixed inset-0 z-50 md:hidden" },
            React.createElement("div", { className: "absolute inset-0 bg-black/40", onClick: function () { return setMobileNavOpen(false); } }),
            React.createElement("div", { className: "relative h-full w-80 bg-background border-r shadow-xl" },
                React.createElement("div", { className: "flex items-center justify-between border-b px-4 py-3" },
                    React.createElement("div", { className: "text-sm font-semibold" }, "Settings Menu"),
                    React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return setMobileNavOpen(false); } },
                        React.createElement(X, { className: "h-4 w-4" }))),
                React.createElement("div", { className: "p-4 overflow-y-auto h-[calc(100vh-60px)]" },
                    React.createElement("div", { className: "space-y-4" },
                        renderSidebarNav(),
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", className: "w-full", onClick: resetAllSettings },
                            React.createElement(lucide_react_1.RotateCcw, { className: "mr-2 h-3.5 w-3.5" }),
                            "Reset All Settings")))))),
        React.createElement("div", { className: "flex gap-6 min-h-[600px]" },
            React.createElement("aside", { className: "hidden w-64 shrink-0 md:block" },
                React.createElement("div", { className: "sticky top-4" },
                    React.createElement("div", { className: "max-h-[calc(100vh-140px)] overflow-y-auto pr-1" },
                        renderSidebarNav(),
                        React.createElement("div", { className: "mt-4 pt-4 border-t" },
                            React.createElement(button_1.Button, { variant: "outline", size: "sm", className: "w-full text-muted-foreground", onClick: resetAllSettings },
                                React.createElement(lucide_react_1.RotateCcw, { className: "mr-2 h-3.5 w-3.5" }),
                                "Reset All Settings"))))),
            React.createElement("main", { className: "flex-1 space-y-6 min-w-0" }, renderContent()))));
}
exports["default"] = Settings;
