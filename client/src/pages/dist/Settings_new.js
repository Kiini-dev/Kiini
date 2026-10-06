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
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var separator_1 = require("@/components/ui/separator");
var switch_1 = require("@/components/ui/switch");
var select_1 = require("@/components/ui/select");
var badge_1 = require("@/components/ui/badge");
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
var L = function (id, label, href, description) {
    return ({ id: id, label: label, type: "link", href: href, description: description });
};
var CS = function (id, label) {
    return ({ id: id, label: label, type: "coming-soon" });
};
// ─── Full settings tree (matching Kiini: One Hub. Total Control + tools absorbed) ────────────────
var NAV_GROUPS = [
    {
        id: "main", label: "Main Settings",
        icon: React.createElement(lucide_react_1.Settings, { className: "h-4 w-4" }),
        children: [
            S("general", "General Settings", "general"),
            S("company", "Company Details", "company"),
            CS("currency", "Currency"),
            S("appearance", "Appearance", "appearance"),
            L("theme", "Theme Customization", "/tools/theme-customization", "Customize colors, dark mode, and UI presets"),
            L("brand", "Brand & Appearance", "/tools/brand-customization", "Brand colors, fonts, and visual identity"),
            L("homepage-builder", "Homepage Builder", "/tools/homepage-builder", "Configure your dashboard home layout"),
            L("system-settings-tool", "System Settings", "/tools/system-settings", "Maintenance, security, and app-level config"),
        ]
    },
    {
        id: "billing", label: "Billing",
        icon: React.createElement(lucide_react_1.CreditCard, { className: "h-4 w-4" }),
        children: [
            CS("billing-account", "My Account"),
            CS("billing-plans", "Plans"),
            CS("billing-payments", "Payments"),
            CS("billing-notices", "Notices"),
        ]
    },
    {
        id: "email-group", label: "Email",
        icon: React.createElement(lucide_react_1.Mail, { className: "h-4 w-4" }),
        children: [
            S("email-settings", "Email Settings", "email"),
            CS("email-templates", "Email Templates"),
            CS("email-queue", "Email Queue"),
            CS("email-log", "Email Log"),
        ]
    },
    {
        id: "clients", label: "Clients",
        icon: React.createElement(lucide_react_1.Users, { className: "h-4 w-4" }),
        children: [
            CS("clients-general", "General Settings"),
            CS("clients-categories", "Categories"),
            L("clients-customfields", "Custom Fields", "/tools/custom-fields", "Define custom fields for client records"),
            CS("clients-email-templates", "Email Templates"),
        ]
    },
    {
        id: "projects", label: "Projects",
        icon: React.createElement(lucide_react_1.FolderKanban, { className: "h-4 w-4" }),
        children: [
            CS("projects-general", "General Settings"),
            CS("projects-categories", "Categories"),
            CS("projects-team-perms", "Team Permissions"),
            CS("projects-client-perms", "Client Permissions"),
            L("projects-customfields", "Custom Fields", "/tools/custom-fields"),
            CS("projects-automation", "Automation"),
        ]
    },
    {
        id: "tasks", label: "Tasks",
        icon: React.createElement(lucide_react_1.CheckSquare, { className: "h-4 w-4" }),
        children: [
            CS("tasks-general", "General Settings"),
            CS("tasks-statuses", "Statuses"),
            CS("tasks-priorities", "Priorities"),
            L("tasks-customfields", "Custom Fields", "/tools/custom-fields"),
        ]
    },
    {
        id: "leads", label: "Leads",
        icon: React.createElement(lucide_react_1.TrendingUp, { className: "h-4 w-4" }),
        children: [
            CS("leads-general", "General Settings"),
            CS("leads-categories", "Categories"),
            CS("leads-stages", "Lead Stages"),
            CS("leads-sources", "Lead Sources"),
            L("leads-customfields", "Custom Fields", "/tools/custom-fields"),
            CS("leads-webforms", "Web Forms"),
            CS("leads-email-templates", "Email Templates"),
        ]
    },
    {
        id: "milestones", label: "Milestones",
        icon: React.createElement(lucide_react_1.Flag, { className: "h-4 w-4" }),
        children: [
            CS("milestones-general", "General Settings"),
            CS("milestones-defaults", "Default Milestones"),
        ]
    },
    {
        id: "invoices-group", label: "Invoices",
        icon: React.createElement(lucide_react_1.FileText, { className: "h-4 w-4" }),
        children: [
            S("invoices", "Invoice Settings", "invoices"),
            S("numbering", "Document Numbers", "numbering"),
            CS("invoices-categories", "Categories"),
            CS("invoices-statuses", "Statuses"),
        ]
    },
    {
        id: "estimates", label: "Estimates",
        icon: React.createElement(lucide_react_1.ClipboardList, { className: "h-4 w-4" }),
        children: [
            CS("estimates-general", "General Settings"),
            CS("estimates-categories", "Categories"),
            CS("estimates-automation", "Automation"),
        ]
    },
    {
        id: "timesheets", label: "Time Sheets",
        icon: React.createElement(lucide_react_1.Clock, { className: "h-4 w-4" }),
        children: [
            CS("timesheets-general", "General Settings"),
        ]
    },
    {
        id: "proposals", label: "Proposals",
        icon: React.createElement(lucide_react_1.FileText, { className: "h-4 w-4" }),
        children: [
            CS("proposals-general", "General Settings"),
            CS("proposals-categories", "Categories"),
            CS("proposals-automation", "Automation"),
        ]
    },
    {
        id: "contracts", label: "Contracts",
        icon: React.createElement(lucide_react_1.FileText, { className: "h-4 w-4" }),
        children: [
            CS("contracts-general", "General Settings"),
            CS("contracts-categories", "Categories"),
            CS("contracts-automation", "Automation"),
        ]
    },
    {
        id: "products", label: "Products",
        icon: React.createElement(lucide_react_1.Package, { className: "h-4 w-4" }),
        children: [
            CS("products-categories", "Categories"),
            CS("products-units", "Units"),
            L("products-customfields", "Custom Fields", "/tools/custom-fields"),
        ]
    },
    {
        id: "expenses", label: "Expenses",
        icon: React.createElement(lucide_react_1.Receipt, { className: "h-4 w-4" }),
        children: [
            CS("expenses-general", "General Settings"),
            CS("expenses-categories", "Categories"),
        ]
    },
    {
        id: "subscriptions", label: "Subscriptions",
        icon: React.createElement(lucide_react_1.RefreshCcw, { className: "h-4 w-4" }),
        children: [
            CS("subscriptions-general", "General Settings"),
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
            CS("tags-general", "General Settings"),
            S("tags", "View Tags", "tags"),
        ]
    },
    {
        id: "files", label: "Files",
        icon: React.createElement(lucide_react_1.FolderOpen, { className: "h-4 w-4" }),
        children: [
            CS("files-general", "General Settings"),
            CS("files-folders", "Folders"),
            CS("files-default-folders", "Default Folders"),
        ]
    },
    {
        id: "payment-methods", label: "Payment Methods",
        icon: React.createElement(lucide_react_1.CreditCard, { className: "h-4 w-4" }),
        children: [
            S("payments-bank", "Bank Transfer", "payments-bank"),
            S("payments-stripe", "Stripe", "payments-stripe"),
            S("payments-mpesa", "M-Pesa", "payments-mpesa"),
            CS("payments-flutterwave", "Flutterwave"),
            CS("payments-razorpay", "Razorpay"),
            CS("payments-paypal", "PayPal"),
            CS("payments-paystack", "Paystack"),
        ]
    },
    {
        id: "user-roles", label: "User Roles",
        icon: React.createElement(lucide_react_1.Shield, { className: "h-4 w-4" }),
        children: [
            S("roles", "Roles & Permissions", "roles"),
            L("permissions", "Advanced Permissions", "/tools/permissions", "Granular permission matrix"),
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
            CS("tickets-general", "General Settings"),
            CS("tickets-departments", "Departments"),
            CS("tickets-statuses", "Statuses"),
            CS("tickets-canned", "Canned Categories"),
            L("tickets-customfields", "Custom Fields", "/tools/custom-fields"),
        ]
    },
    {
        id: "knowledgebase", label: "Knowledgebase",
        icon: React.createElement(lucide_react_1.BookOpen, { className: "h-4 w-4" }),
        children: [
            CS("kb-general", "General Settings"),
            CS("kb-categories", "Categories"),
        ]
    },
    {
        id: "other", label: "Other",
        icon: React.createElement(lucide_react_1.MoreHorizontal, { className: "h-4 w-4" }),
        children: [
            L("integration-guides", "Integration Guides", "/tools/integration-guides", "API and SDK integration documentation"),
            CS("recaptcha", "reCAPTCHA"),
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
// ─── Coming-soon stub ─────────────────────────────────────────────────────────
function ComingSoon(_a) {
    var label = _a.label;
    return (React.createElement(card_1.Card, null,
        React.createElement(card_1.CardHeader, null,
            React.createElement(card_1.CardTitle, { className: "text-base" }, label),
            React.createElement(card_1.CardDescription, null, "This section is under active development.")),
        React.createElement(card_1.CardContent, null,
            React.createElement("div", { className: "flex items-center gap-3 rounded-lg border border-dashed p-6 text-muted-foreground" },
                React.createElement(lucide_react_1.Clock, { className: "h-5 w-5 shrink-0" }),
                React.createElement("p", { className: "text-sm" },
                    React.createElement("strong", null, label),
                    " configuration will be available in an upcoming update.")))));
}
// ─── Main component ───────────────────────────────────────────────────────────
function Settings() {
    var _this = this;
    var _a = permissions_1.useRequireRole(["super_admin", "admin"]), allowed = _a.allowed, isLoadingPermission = _a.isLoading;
    var _b = wouter_1.useLocation(), navigate = _b[1];
    // ── Nav state ──────────────────────────────────────────────────────────────
    var _c = react_1.useState("general"), activeSection = _c[0], setActiveSection = _c[1];
    var _d = react_1.useState(new Set(["main"])), expandedGroups = _d[0], setExpandedGroups = _d[1];
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
    var handleChildClick = function (child) {
        if (child.type === "link") {
            navigate(child.href);
        }
        else if (child.type === "section") {
            setActiveSection(child.sectionId);
            var group_1 = NAV_GROUPS.find(function (g) { return g.children.some(function (c) { return c.id === child.id; }); });
            if (group_1)
                setExpandedGroups(function (prev) { return new Set(__spreadArrays(prev, [group_1.id])); });
        }
        else {
            setActiveSection("__cs__" + child.label);
        }
    };
    var isChildActive = function (child) {
        if (child.type === "link")
            return false;
        if (child.type === "section")
            return activeSection === child.sectionId;
        return activeSection === "__cs__" + child.label;
    };
    // ── General ────────────────────────────────────────────────────────────────
    var _e = react_1.useState({
        timezone: "Africa/Nairobi",
        dateFormat: "DD/MM/YYYY",
        language: "en",
        tablePageSize: "15",
        sessionTimeout: "enabled",
        closeModalOnClick: "yes"
    }), general = _e[0], setGeneral = _e[1];
    // ── Company ────────────────────────────────────────────────────────────────
    var _f = react_1.useState({
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
    }), companyInfo = _f[0], setCompanyInfo = _f[1];
    // ── Appearance ─────────────────────────────────────────────────────────────
    var _g = react_1.useState({
        theme: "light",
        primaryColor: "#3b82f6"
    }), appearance = _g[0], setAppearance = _g[1];
    // ── Email ──────────────────────────────────────────────────────────────────
    var _h = react_1.useState({
        mailDriver: "smtp",
        smtpHost: "",
        smtpPort: "587",
        smtpUser: "",
        smtpPass: "",
        fromName: "",
        fromEmail: "",
        replyTo: ""
    }), emailSettings = _h[0], setEmailSettings = _h[1];
    // ── Invoices ───────────────────────────────────────────────────────────────
    var _j = react_1.useState({
        invoicePrefix: "INV",
        defaultDueDays: "7",
        overdueDays1: "1",
        overdueDays2: "7",
        overdueDays3: "14",
        taxMode: "summary",
        termsAndConditions: "",
        showProjectTitle: false,
        showViewedIndicator: true
    }), invoiceSettings = _j[0], setInvoiceSettings = _j[1];
    // ── Payment Methods ────────────────────────────────────────────────────────
    var _k = react_1.useState({
        enabled: false,
        displayName: "Bank Transfer",
        details: ""
    }), bankPayment = _k[0], setBankPayment = _k[1];
    var _l = react_1.useState({
        enabled: false,
        publishableKey: "",
        secretKey: ""
    }), stripeSettings = _l[0], setStripeSettings = _l[1];
    var _m = react_1.useState({
        enabled: false,
        consumerKey: "",
        consumerSecret: "",
        paybillNumber: "",
        passkey: "",
        callbackUrl: ""
    }), mpesaSettings = _m[0], setMpesaSettings = _m[1];
    // ── Tax ────────────────────────────────────────────────────────────────────
    var _o = react_1.useState([]), taxRates = _o[0], setTaxRates = _o[1];
    var _p = react_1.useState({ name: "", rate: "", description: "" }), newTax = _p[0], setNewTax = _p[1];
    // ── Tags ───────────────────────────────────────────────────────────────────
    var _q = react_1.useState([]), tags = _q[0], setTags = _q[1];
    var _r = react_1.useState({ name: "", color: "#3b82f6" }), newTag = _r[0], setNewTag = _r[1];
    // ── Document Numbering ─────────────────────────────────────────────────────
    var _s = react_1.useState({
        invoicePrefix: "INV",
        estimatePrefix: "EST",
        receiptPrefix: "REC",
        proposalPrefix: "PROP",
        expensePrefix: "EXP"
    }), documentNumbers = _s[0], setDocumentNumbers = _s[1];
    // ── Notifications ──────────────────────────────────────────────────────────
    var _t = react_1.useState({
        invoiceDue: true,
        paymentReceived: true,
        newClient: false,
        companyAnnouncement: false,
        projectDeadline: false,
        taskAssigned: true
    }), notifyPrefs = _t[0], setNotifyPrefs = _t[1];
    // ── Saving flags ───────────────────────────────────────────────────────────
    var _u = react_1.useState({}), saving = _u[0], setSaving = _u[1];
    var setSavingKey = function (key, val) { return setSaving(function (p) {
        var _a;
        return (__assign(__assign({}, p), (_a = {}, _a[key] = val, _a)));
    }); };
    // ── Queries ────────────────────────────────────────────────────────────────
    var _v = trpc_1.trpc.settings.getCompanyInfo.useQuery(), companyData = _v.data, refetchCompany = _v.refetch;
    var _w = trpc_1.trpc.settings.getDocumentNumberingSettings.useQuery(), docData = _w.data, refetchDocs = _w.refetch;
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
        onSuccess: function () { return sonner_1.toast.success("Settings saved"); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
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
                dateFormat: generalData.dateFormat || "DD/MM/YYYY",
                language: generalData.language || "en",
                tablePageSize: generalData.tablePageSize || "15",
                sessionTimeout: generalData.sessionTimeout || "enabled",
                closeModalOnClick: generalData.closeModalOnClick || "yes"
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
    // ── Guard ──────────────────────────────────────────────────────────────────
    if (isLoadingPermission) {
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" }));
    }
    if (!allowed)
        return null;
    // ── Save helpers ───────────────────────────────────────────────────────────
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
        // Coming-soon sections
        if (activeSection.startsWith("__cs__")) {
            return React.createElement(ComingSoon, { label: activeSection.substring(6) });
        }
        switch (activeSection) {
            // ── GENERAL ──────────────────────────────────────────────────────────
            case "general":
                return (React.createElement(Section, { title: "General Settings", description: "Configure system-wide defaults" },
                    React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                        React.createElement(Field, { label: "Timezone" },
                            React.createElement(select_1.Select, { value: general.timezone, onValueChange: function (v) { return setGeneral(function (p) { return (__assign(__assign({}, p), { timezone: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "Africa/Nairobi" }, "Africa/Nairobi (EAT)"),
                                    React.createElement(select_1.SelectItem, { value: "Africa/Lagos" }, "Africa/Lagos (WAT)"),
                                    React.createElement(select_1.SelectItem, { value: "Africa/Cairo" }, "Africa/Cairo (EET)"),
                                    React.createElement(select_1.SelectItem, { value: "Europe/London" }, "Europe/London (GMT)"),
                                    React.createElement(select_1.SelectItem, { value: "America/New_York" }, "America/New_York (EST)"),
                                    React.createElement(select_1.SelectItem, { value: "Asia/Dubai" }, "Asia/Dubai (GST)"),
                                    React.createElement(select_1.SelectItem, { value: "UTC" }, "UTC")))),
                        React.createElement(Field, { label: "Date Format" },
                            React.createElement(select_1.Select, { value: general.dateFormat, onValueChange: function (v) { return setGeneral(function (p) { return (__assign(__assign({}, p), { dateFormat: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "DD/MM/YYYY" }, "DD/MM/YYYY"),
                                    React.createElement(select_1.SelectItem, { value: "MM/DD/YYYY" }, "MM/DD/YYYY"),
                                    React.createElement(select_1.SelectItem, { value: "YYYY-MM-DD" }, "YYYY-MM-DD"),
                                    React.createElement(select_1.SelectItem, { value: "D MMM YYYY" }, "D MMM YYYY")))),
                        React.createElement(Field, { label: "Default Language" },
                            React.createElement(select_1.Select, { value: general.language, onValueChange: function (v) { return setGeneral(function (p) { return (__assign(__assign({}, p), { language: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "en" }, "English"),
                                    React.createElement(select_1.SelectItem, { value: "sw" }, "Swahili"),
                                    React.createElement(select_1.SelectItem, { value: "fr" }, "French"),
                                    React.createElement(select_1.SelectItem, { value: "ar" }, "Arabic")))),
                        React.createElement(Field, { label: "Table Page Size" },
                            React.createElement(select_1.Select, { value: general.tablePageSize, onValueChange: function (v) { return setGeneral(function (p) { return (__assign(__assign({}, p), { tablePageSize: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null, ["10", "15", "25", "50", "100"].map(function (n) { return (React.createElement(select_1.SelectItem, { key: n, value: n },
                                    n,
                                    " rows")); }))))),
                    React.createElement("div", { className: "flex flex-col gap-3 pt-2" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Session timeout popup"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Warn users before session expires")),
                            React.createElement(switch_1.Switch, { checked: general.sessionTimeout === "enabled", onCheckedChange: function (c) { return setGeneral(function (p) { return (__assign(__assign({}, p), { sessionTimeout: c ? "enabled" : "disabled" })); }); } })),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, "Close modal on background click"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Close dialogs when clicking outside")),
                            React.createElement(switch_1.Switch, { checked: general.closeModalOnClick === "yes", onCheckedChange: function (c) { return setGeneral(function (p) { return (__assign(__assign({}, p), { closeModalOnClick: c ? "yes" : "no" })); }); } }))),
                    React.createElement(SaveButton, { saving: !!saving.general, onClick: function () { return save("general", function () { return updateByCategory.mutateAsync({ category: "general", values: general }); }); } })));
            // ── COMPANY ──────────────────────────────────────────────────────────
            case "company":
                return (React.createElement(Section, { title: "Company Details", description: "Information shown on invoices and documents" },
                    React.createElement("div", { className: "grid grid-cols-2 gap-4" },
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
                    React.createElement("div", { className: "grid grid-cols-3 gap-4" },
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
            // ── APPEARANCE ────────────────────────────────────────────────────────
            case "appearance":
                return (React.createElement("div", { className: "space-y-4" },
                    React.createElement(Section, { title: "Appearance", description: "Basic theme and color settings" },
                        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                            React.createElement(Field, { label: "Theme" },
                                React.createElement(select_1.Select, { value: appearance.theme, onValueChange: function (v) { return setAppearance(function (p) { return (__assign(__assign({}, p), { theme: v })); }); } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "light" }, "Light"),
                                        React.createElement(select_1.SelectItem, { value: "dark" }, "Dark"),
                                        React.createElement(select_1.SelectItem, { value: "system" }, "System")))),
                            React.createElement(Field, { label: "Primary Color" },
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement("input", { type: "color", value: appearance.primaryColor, onChange: function (e) { return setAppearance(function (p) { return (__assign(__assign({}, p), { primaryColor: e.target.value })); }); }, title: "Primary color picker", "aria-label": "Primary color", className: "h-9 w-14 cursor-pointer rounded border border-input p-1" }),
                                    React.createElement("input", { className: "flex h-9 flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm", value: appearance.primaryColor, onChange: function (e) { return setAppearance(function (p) { return (__assign(__assign({}, p), { primaryColor: e.target.value })); }); }, placeholder: "#3b82f6" })))),
                        React.createElement(SaveButton, { saving: !!saving.appearance, onClick: function () { return save("appearance", function () { return updateByCategory.mutateAsync({ category: "appearance", values: appearance }); }); } })),
                    React.createElement(card_1.Card, { className: "border-dashed" },
                        React.createElement(card_1.CardHeader, { className: "pb-2" },
                            React.createElement(card_1.CardTitle, { className: "text-sm font-medium flex items-center gap-2" },
                                React.createElement(lucide_react_1.Palette, { className: "h-4 w-4" }),
                                " Advanced Customization"),
                            React.createElement(card_1.CardDescription, null, "Full theme and brand editors with presets, dark mode, and font controls.")),
                        React.createElement(card_1.CardContent, { className: "flex gap-3" },
                            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return navigate("/tools/theme-customization"); } },
                                React.createElement(lucide_react_1.ArrowUpRight, { className: "mr-2 h-3.5 w-3.5" }),
                                " Theme Customization"),
                            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return navigate("/tools/brand-customization"); } },
                                React.createElement(lucide_react_1.ArrowUpRight, { className: "mr-2 h-3.5 w-3.5" }),
                                " Brand & Appearance")))));
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
                    emailSettings.mailDriver === "smtp" && (React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                        React.createElement(Field, { label: "SMTP Host" },
                            React.createElement(input_1.Input, { value: emailSettings.smtpHost, onChange: function (e) { return setEmailSettings(function (p) { return (__assign(__assign({}, p), { smtpHost: e.target.value })); }); }, placeholder: "smtp.gmail.com" })),
                        React.createElement(Field, { label: "SMTP Port" },
                            React.createElement(input_1.Input, { value: emailSettings.smtpPort, onChange: function (e) { return setEmailSettings(function (p) { return (__assign(__assign({}, p), { smtpPort: e.target.value })); }); }, placeholder: "587" })),
                        React.createElement(Field, { label: "SMTP Username" },
                            React.createElement(input_1.Input, { value: emailSettings.smtpUser, onChange: function (e) { return setEmailSettings(function (p) { return (__assign(__assign({}, p), { smtpUser: e.target.value })); }); }, placeholder: "user@gmail.com" })),
                        React.createElement(Field, { label: "SMTP Password" },
                            React.createElement(input_1.Input, { type: "password", value: emailSettings.smtpPass, onChange: function (e) { return setEmailSettings(function (p) { return (__assign(__assign({}, p), { smtpPass: e.target.value })); }); }, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" })))),
                    React.createElement(separator_1.Separator, null),
                    React.createElement("div", { className: "grid grid-cols-2 gap-4" },
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
                    React.createElement("div", { className: "grid grid-cols-2 gap-4" },
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
                    React.createElement("div", { className: "grid grid-cols-3 gap-4" },
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
                    React.createElement("div", { className: "grid grid-cols-2 gap-4" }, ["invoice", "estimate", "receipt", "proposal", "expense"].map(function (type) {
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
                    React.createElement("div", { className: "grid grid-cols-2 gap-4" },
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
                    React.createElement("div", { className: "grid grid-cols-3 gap-3" },
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
            default:
                return null;
        }
    }
    // ── Render ─────────────────────────────────────────────────────────────────
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Settings", description: "Configure every aspect of your CRM system", icon: React.createElement(lucide_react_1.Settings, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "Settings" }] },
        React.createElement("div", { className: "flex gap-6 min-h-[600px]" },
            React.createElement("aside", { className: "w-64 shrink-0" },
                React.createElement("nav", { className: "sticky top-4 max-h-[calc(100vh-140px)] overflow-y-auto pr-1 space-y-0.5" }, NAV_GROUPS.map(function (group) {
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
                }))),
            React.createElement("main", { className: "flex-1 space-y-6 min-w-0" }, renderContent()))));
}
exports["default"] = Settings;
