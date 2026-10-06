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
var useAuth_1 = require("@/_core/hooks/useAuth");
var trpc_1 = require("@/lib/trpc");
var permissions_1 = require("@/lib/permissions");
var OrgLayout_1 = require("@/components/OrgLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var FormToggle_1 = require("@/components/FormToggle");
var sonner_1 = require("sonner");
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
var scroll_area_1 = require("@/components/ui/scroll-area");
var S = function (id, label, sectionId) {
    return ({ id: id, label: label, type: "section", sectionId: sectionId });
};
// ─── Org settings tree (org-level only, excluding global settings) ────────────
var ORG_NAV_GROUPS = [
    {
        id: "main", label: "Organization Settings",
        icon: react_1["default"].createElement(lucide_react_1.Settings, { className: "h-4 w-4" }),
        children: [
            S("general", "General Settings", "general"),
            S("company", "Company Details", "company"),
            S("currency", "Currency & Timezone", "currency"),
            S("theme", "Theme", "theme"),
            S("company-logo", "Company Logo", "company-logo"),
        ]
    },
    {
        id: "email-group", label: "Email",
        icon: react_1["default"].createElement(lucide_react_1.Mail, { className: "h-4 w-4" }),
        children: [
            S("email-settings", "Email Settings", "email"),
            S("email-templates", "Email Templates", "email-templates"),
        ]
    },
    {
        id: "templates", label: "Template Systems",
        icon: react_1["default"].createElement(lucide_react_1.FileText, { className: "h-4 w-4" }),
        children: [
            S("proposal-templates", "Proposal Templates", "proposal-templates"),
            S("service-templates", "Service Templates", "service-templates"),
            S("contract-templates", "Contract Templates", "contract-templates"),
            S("document-templates", "Document Templates", "document-templates"),
        ]
    },
    {
        id: "security", label: "Security",
        icon: react_1["default"].createElement(lucide_react_1.Lock, { className: "h-4 w-4" }),
        children: [
            S("security-password", "Password Policy", "security-password"),
            S("security-2fa", "Two-Factor Auth", "security-2fa"),
            S("security-sessions", "Active Sessions", "security-sessions"),
            S("security-log", "Login History", "security-log"),
        ]
    },
    {
        id: "user-roles", label: "User Management",
        icon: react_1["default"].createElement(lucide_react_1.Users, { className: "h-4 w-4" }),
        children: [
            S("roles", "Roles & Permissions", "roles"),
            S("permissions", "Advanced Permissions", "permissions-matrix"),
        ]
    },
    {
        id: "notifications-group", label: "Notifications",
        icon: react_1["default"].createElement(lucide_react_1.Bell, { className: "h-4 w-4" }),
        children: [
            S("notifications", "Preferences", "notifications"),
        ]
    },
    {
        id: "sms", label: "SMS",
        icon: react_1["default"].createElement(lucide_react_1.Smartphone, { className: "h-4 w-4" }),
        children: [
            S("sms-settings", "SMS Settings", "sms-settings"),
            S("sms-templates", "SMS Templates", "sms-templates"),
        ]
    },
    {
        id: "backup", label: "Data",
        icon: react_1["default"].createElement(lucide_react_1.Database, { className: "h-4 w-4" }),
        children: [
            S("backup", "Backup & Restore", "backup"),
        ]
    },
];
function OrgSettings() {
    var _a, _b, _c, _d, _e;
    var user = useAuth_1.useAuth().user;
    var _f = wouter_1.useLocation(), navigate = _f[1];
    var slug = wouter_1.useParams().slug;
    var _g = react_1.useState(false), editing = _g[0], setEditing = _g[1];
    var _h = react_1.useState("general"), activeSection = _h[0], setActiveSection = _h[1];
    var _j = react_1.useState(new Set(["main"])), expandedGroups = _j[0], setExpandedGroups = _j[1];
    var logoInputRef = react_1.useRef(null);
    var _k = trpc_1.trpc.multiTenancy.getMyOrg.useQuery(undefined, {
        enabled: !!(user === null || user === void 0 ? void 0 : user.organizationId)
    }), data = _k.data, isLoading = _k.isLoading, refetch = _k.refetch;
    var org = data === null || data === void 0 ? void 0 : data.organization;
    var featureMap = (_a = data === null || data === void 0 ? void 0 : data.featureMap) !== null && _a !== void 0 ? _a : {};
    var _l = react_1.useState(false), testingSmtp = _l[0], setTestingSmtp = _l[1];
    var updateMutation = trpc_1.trpc.multiTenancy.updateMyOrg.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Settings saved", { description: "Organization profile updated successfully." });
            setEditing(false);
            refetch();
        },
        onError: function (err) {
            sonner_1.toast.error(err.message);
        }
    });
    var brandingMutation = trpc_1.trpc.multiTenancy.updateOrgBranding.useMutation({
        onSuccess: function () { refetch(); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var testSmtpMutation = trpc_1.trpc.multiTenancy.testSmtpConnection.useMutation({
        onSuccess: function (result) {
            setTestingSmtp(false);
            if (result.success) {
                sonner_1.toast.success("Connection successful", { description: "SMTP credentials are valid." });
            }
            else {
                sonner_1.toast.error("Connection failed", { description: result.error || "Unable to connect with these settings." });
            }
        },
        onError: function (err) {
            setTestingSmtp(false);
            sonner_1.toast.error("Test failed", { description: err.message });
        }
    });
    var _m = react_1.useState({
        name: "", contactEmail: "", contactPhone: "", address: "", country: "", domain: "", logoUrl: "",
        primaryColor: "", secondaryColor: "", themeMode: "system",
        industry: "", website: "", taxId: "", billingEmail: "", timezone: "Africa/Nairobi",
        currency: "KES", description: "", employeeCount: "", registrationNumber: "", paymentMethod: "",
        useGlobalSmtp: true,
        smtpHost: "", smtpPort: "587", smtpUser: "", smtpPassword: "",
        smtpFromEmail: "", smtpFromName: ""
    }), form = _m[0], setForm = _m[1];
    react_1.useEffect(function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5;
        if (org) {
            var branding = (_b = (_a = org.settings) === null || _a === void 0 ? void 0 : _a.branding) !== null && _b !== void 0 ? _b : {};
            var emailSettings = (_d = (_c = org.settings) === null || _c === void 0 ? void 0 : _c.emailSettings) !== null && _d !== void 0 ? _d : {};
            setForm({
                name: (_e = org.name) !== null && _e !== void 0 ? _e : "",
                contactEmail: (_f = org.contactEmail) !== null && _f !== void 0 ? _f : "",
                contactPhone: (_g = org.contactPhone) !== null && _g !== void 0 ? _g : "",
                address: (_h = org.address) !== null && _h !== void 0 ? _h : "",
                country: (_j = org.country) !== null && _j !== void 0 ? _j : "",
                domain: (_k = org.domain) !== null && _k !== void 0 ? _k : "",
                logoUrl: (_l = org.logoUrl) !== null && _l !== void 0 ? _l : "",
                primaryColor: (_m = branding.primaryColor) !== null && _m !== void 0 ? _m : "#2563eb",
                secondaryColor: (_o = branding.secondaryColor) !== null && _o !== void 0 ? _o : "#7c3aed",
                themeMode: (_p = branding.themeMode) !== null && _p !== void 0 ? _p : "system",
                industry: (_q = org.industry) !== null && _q !== void 0 ? _q : "",
                website: (_r = org.website) !== null && _r !== void 0 ? _r : "",
                taxId: (_s = org.taxId) !== null && _s !== void 0 ? _s : "",
                billingEmail: (_t = org.billingEmail) !== null && _t !== void 0 ? _t : "",
                timezone: (_u = org.timezone) !== null && _u !== void 0 ? _u : "Africa/Nairobi",
                currency: (_v = org.currency) !== null && _v !== void 0 ? _v : "KES",
                description: (_w = org.description) !== null && _w !== void 0 ? _w : "",
                employeeCount: org.employeeCount ? String(org.employeeCount) : "",
                registrationNumber: (_x = org.registrationNumber) !== null && _x !== void 0 ? _x : "",
                paymentMethod: (_y = org.paymentMethod) !== null && _y !== void 0 ? _y : "",
                useGlobalSmtp: (_z = emailSettings.useGlobalSmtp) !== null && _z !== void 0 ? _z : true,
                smtpHost: (_0 = emailSettings.smtpHost) !== null && _0 !== void 0 ? _0 : "",
                smtpPort: (_1 = emailSettings.smtpPort) !== null && _1 !== void 0 ? _1 : "587",
                smtpUser: (_2 = emailSettings.smtpUser) !== null && _2 !== void 0 ? _2 : "",
                smtpPassword: (_3 = emailSettings.smtpPassword) !== null && _3 !== void 0 ? _3 : "",
                smtpFromEmail: (_4 = emailSettings.smtpFromEmail) !== null && _4 !== void 0 ? _4 : "",
                smtpFromName: (_5 = emailSettings.smtpFromName) !== null && _5 !== void 0 ? _5 : ""
            });
        }
    }, [org]);
    var handleLogoUpload = function (e) {
        var _a;
        var file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        if (file.size > 2 * 1024 * 1024) {
            sonner_1.toast.error("Logo too large. Please use an image under 2 MB.");
            return;
        }
        var reader = new FileReader();
        reader.onload = function () {
            var base64 = reader.result;
            setForm(function (f) { return (__assign(__assign({}, f), { logoUrl: base64 })); });
        };
        reader.readAsDataURL(file);
    };
    var handleSave = function () {
        var payload = {};
        if (form.name)
            payload.name = form.name;
        if (form.contactEmail)
            payload.contactEmail = form.contactEmail;
        if (form.contactPhone)
            payload.contactPhone = form.contactPhone;
        if (form.address)
            payload.address = form.address;
        if (form.country)
            payload.country = form.country;
        if (form.domain)
            payload.domain = form.domain;
        if (form.logoUrl !== undefined)
            payload.logoUrl = form.logoUrl;
        if (form.industry)
            payload.industry = form.industry;
        if (form.website)
            payload.website = form.website;
        if (form.taxId)
            payload.taxId = form.taxId;
        if (form.billingEmail)
            payload.billingEmail = form.billingEmail;
        if (form.timezone)
            payload.timezone = form.timezone;
        if (form.currency)
            payload.currency = form.currency;
        if (form.description)
            payload.description = form.description;
        if (form.employeeCount)
            payload.employeeCount = parseInt(form.employeeCount, 10);
        if (form.registrationNumber)
            payload.registrationNumber = form.registrationNumber;
        if (form.paymentMethod)
            payload.paymentMethod = form.paymentMethod;
        payload.useGlobalSmtp = form.useGlobalSmtp;
        if (!form.useGlobalSmtp) {
            if (form.smtpHost)
                payload.smtpHost = form.smtpHost;
            if (form.smtpPort)
                payload.smtpPort = form.smtpPort;
            if (form.smtpUser)
                payload.smtpUser = form.smtpUser;
            if (form.smtpPassword)
                payload.smtpPassword = form.smtpPassword;
            if (form.smtpFromEmail)
                payload.smtpFromEmail = form.smtpFromEmail;
            if (form.smtpFromName)
                payload.smtpFromName = form.smtpFromName;
        }
        updateMutation.mutate(payload);
        brandingMutation.mutate({
            primaryColor: form.primaryColor,
            secondaryColor: form.secondaryColor,
            themeMode: form.themeMode,
            logoUrl: form.logoUrl
        });
    };
    var handleCancel = function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5;
        if (org) {
            var branding = (_b = (_a = org.settings) === null || _a === void 0 ? void 0 : _a.branding) !== null && _b !== void 0 ? _b : {};
            var emailSettings = (_d = (_c = org.settings) === null || _c === void 0 ? void 0 : _c.emailSettings) !== null && _d !== void 0 ? _d : {};
            setForm({
                name: (_e = org.name) !== null && _e !== void 0 ? _e : "",
                contactEmail: (_f = org.contactEmail) !== null && _f !== void 0 ? _f : "",
                contactPhone: (_g = org.contactPhone) !== null && _g !== void 0 ? _g : "",
                address: (_h = org.address) !== null && _h !== void 0 ? _h : "",
                country: (_j = org.country) !== null && _j !== void 0 ? _j : "",
                domain: (_k = org.domain) !== null && _k !== void 0 ? _k : "",
                logoUrl: (_l = org.logoUrl) !== null && _l !== void 0 ? _l : "",
                primaryColor: (_m = branding.primaryColor) !== null && _m !== void 0 ? _m : "#2563eb",
                secondaryColor: (_o = branding.secondaryColor) !== null && _o !== void 0 ? _o : "#7c3aed",
                themeMode: (_p = branding.themeMode) !== null && _p !== void 0 ? _p : "system",
                industry: (_q = org.industry) !== null && _q !== void 0 ? _q : "",
                website: (_r = org.website) !== null && _r !== void 0 ? _r : "",
                taxId: (_s = org.taxId) !== null && _s !== void 0 ? _s : "",
                billingEmail: (_t = org.billingEmail) !== null && _t !== void 0 ? _t : "",
                timezone: (_u = org.timezone) !== null && _u !== void 0 ? _u : "Africa/Nairobi",
                currency: (_v = org.currency) !== null && _v !== void 0 ? _v : "KES",
                description: (_w = org.description) !== null && _w !== void 0 ? _w : "",
                employeeCount: org.employeeCount ? String(org.employeeCount) : "",
                registrationNumber: (_x = org.registrationNumber) !== null && _x !== void 0 ? _x : "",
                paymentMethod: (_y = org.paymentMethod) !== null && _y !== void 0 ? _y : "",
                useGlobalSmtp: (_z = emailSettings.useGlobalSmtp) !== null && _z !== void 0 ? _z : true,
                smtpHost: (_0 = emailSettings.smtpHost) !== null && _0 !== void 0 ? _0 : "",
                smtpPort: (_1 = emailSettings.smtpPort) !== null && _1 !== void 0 ? _1 : "587",
                smtpUser: (_2 = emailSettings.smtpUser) !== null && _2 !== void 0 ? _2 : "",
                smtpPassword: (_3 = emailSettings.smtpPassword) !== null && _3 !== void 0 ? _3 : "",
                smtpFromEmail: (_4 = emailSettings.smtpFromEmail) !== null && _4 !== void 0 ? _4 : "",
                smtpFromName: (_5 = emailSettings.smtpFromName) !== null && _5 !== void 0 ? _5 : ""
            });
        }
        setEditing(false);
    };
    // Access guard — check basic org settings view permission
    if (!permissions_1.canAccessFeature((_b = user === null || user === void 0 ? void 0 : user.role) !== null && _b !== void 0 ? _b : "", "org:settings:view")) {
        return (react_1["default"].createElement(OrgLayout_1.OrgLayout, { title: "Organization Settings" },
            react_1["default"].createElement("div", { className: "flex flex-col items-center justify-center py-24 text-center" },
                react_1["default"].createElement(lucide_react_1.ShieldOff, { className: "h-16 w-16 text-muted-foreground mb-4" }),
                react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-2" }, "Access Denied"),
                react_1["default"].createElement("p", { className: "text-muted-foreground max-w-sm" }, "You don't have permission to access organization settings."))));
    }
    if (isLoading) {
        return (react_1["default"].createElement(OrgLayout_1.OrgLayout, { title: "Organization Settings" },
            react_1["default"].createElement("div", { className: "flex items-center justify-center py-24" },
                react_1["default"].createElement("div", { className: "h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" }))));
    }
    var toggleGroup = function (groupId) {
        setExpandedGroups(function (prev) {
            var next = new Set(prev);
            if (next.has(groupId))
                next["delete"](groupId);
            else
                next.add(groupId);
            return next;
        });
    };
    // Helper to check section permissions
    var canAccessSection = function (sectionId) {
        var _a;
        var featureName = "org:settings:" + sectionId;
        var allowed = permissions_1.canAccessFeature((_a = user === null || user === void 0 ? void 0 : user.role) !== null && _a !== void 0 ? _a : "", featureName);
        var fallbackOpenSections = new Set([
            "proposal-templates",
            "service-templates",
            "contract-templates",
            "document-templates",
            "api-integrations",
            "automation",
        ]);
        return allowed || fallbackOpenSections.has(sectionId);
    };
    // Helper to check if user can edit settings
    var canEditSettings = function () {
        var _a;
        return permissions_1.canAccessFeature((_a = user === null || user === void 0 ? void 0 : user.role) !== null && _a !== void 0 ? _a : "", "org:settings:edit");
    };
    var renderSettingsContent = function () {
        // Check permission for the active section
        if (!canAccessSection(activeSection)) {
            return (react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, null, "Access Denied"),
                    react_1["default"].createElement(card_1.CardDescription, null, "You don't have permission to access this section")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("div", { className: "flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900" },
                        react_1["default"].createElement(lucide_react_1.ShieldOff, { className: "h-5 w-5 text-red-600" }),
                        react_1["default"].createElement("p", { className: "text-sm text-red-700 dark:text-red-300" }, "You don't have permission to view or manage this setting. Contact your administrator if you believe this is an error.")))));
        }
        switch (activeSection) {
            case "general":
                return (react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "General Settings"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Basic organization information")),
                    react_1["default"].createElement(card_1.CardContent, { className: "grid gap-5 sm:grid-cols-2" },
                        react_1["default"].createElement("div", { className: "space-y-1.5" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "name" }, "Organization Name"),
                            react_1["default"].createElement("div", { className: "relative" },
                                react_1["default"].createElement(lucide_react_1.Building2, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }),
                                react_1["default"].createElement(input_1.Input, { id: "name", value: form.name, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { name: e.target.value })); }); }, disabled: !editing, className: "pl-9", placeholder: "Acme Corp" }))),
                        react_1["default"].createElement("div", { className: "space-y-1.5" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "contactEmail" }, "Contact Email"),
                            react_1["default"].createElement("div", { className: "relative" },
                                react_1["default"].createElement(lucide_react_1.Mail, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }),
                                react_1["default"].createElement(input_1.Input, { id: "contactEmail", type: "email", value: form.contactEmail, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { contactEmail: e.target.value })); }); }, disabled: !editing, className: "pl-9", placeholder: "info@acme.com" }))),
                        react_1["default"].createElement("div", { className: "space-y-1.5" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "contactPhone" }, "Phone Number"),
                            react_1["default"].createElement("div", { className: "relative" },
                                react_1["default"].createElement(lucide_react_1.Phone, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }),
                                react_1["default"].createElement(input_1.Input, { id: "contactPhone", value: form.contactPhone, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { contactPhone: e.target.value })); }); }, disabled: !editing, className: "pl-9", placeholder: "+1 555 0100" }))),
                        react_1["default"].createElement("div", { className: "space-y-1.5" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "country" }, "Country"),
                            react_1["default"].createElement("div", { className: "relative" },
                                react_1["default"].createElement(lucide_react_1.Globe, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }),
                                react_1["default"].createElement(input_1.Input, { id: "country", value: form.country, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { country: e.target.value })); }); }, disabled: !editing, className: "pl-9", placeholder: "United States" }))),
                        react_1["default"].createElement("div", { className: "col-span-full space-y-1.5" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "address" }, "Address"),
                            react_1["default"].createElement("div", { className: "relative" },
                                react_1["default"].createElement(lucide_react_1.MapPin, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }),
                                react_1["default"].createElement(input_1.Input, { id: "address", value: form.address, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { address: e.target.value })); }); }, disabled: !editing, className: "pl-9", placeholder: "123 Main St, City, State 12345" }))),
                        react_1["default"].createElement("div", { className: "space-y-1.5" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "domain" }, "Website / Domain"),
                            react_1["default"].createElement("div", { className: "relative" },
                                react_1["default"].createElement(lucide_react_1.Globe, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }),
                                react_1["default"].createElement(input_1.Input, { id: "domain", value: form.domain, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { domain: e.target.value })); }); }, disabled: !editing, className: "pl-9", placeholder: "acme.com" }))),
                        react_1["default"].createElement("div", { className: "col-span-full space-y-1.5" },
                            react_1["default"].createElement(label_1.Label, null, "Description"),
                            react_1["default"].createElement(textarea_1.Textarea, { value: form.description, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { description: e.target.value })); }); }, disabled: !editing, rows: 3, placeholder: "Brief description of your organization\u2026" })))));
            case "company":
                return (react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Company Details"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Industry classification and business registration information")),
                    react_1["default"].createElement(card_1.CardContent, { className: "grid gap-5 sm:grid-cols-2" },
                        react_1["default"].createElement("div", { className: "space-y-1.5" },
                            react_1["default"].createElement(label_1.Label, null, "Industry"),
                            react_1["default"].createElement(select_1.Select, { value: form.industry, onValueChange: function (v) { return setForm(function (f) { return (__assign(__assign({}, f), { industry: v })); }); }, disabled: !editing },
                                react_1["default"].createElement(select_1.SelectTrigger, null,
                                    react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select industry\u2026" })),
                                react_1["default"].createElement(select_1.SelectContent, null, ["Agriculture", "Automotive", "Construction", "Education", "Energy", "Finance & Banking",
                                    "Government", "Healthcare", "Hospitality", "Insurance", "Legal", "Logistics & Transport",
                                    "Manufacturing", "Media & Entertainment", "NGO / Non-profit", "Real Estate",
                                    "Retail & E-commerce", "Telecommunications", "Technology", "Other"].map(function (i) { return (react_1["default"].createElement(select_1.SelectItem, { key: i, value: i }, i)); })))),
                        react_1["default"].createElement("div", { className: "space-y-1.5" },
                            react_1["default"].createElement(label_1.Label, null, "Employee Count"),
                            react_1["default"].createElement(input_1.Input, { value: form.employeeCount, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { employeeCount: e.target.value })); }); }, disabled: !editing, type: "number", min: "1", placeholder: "50" })),
                        react_1["default"].createElement("div", { className: "space-y-1.5" },
                            react_1["default"].createElement(label_1.Label, null, "Registration Number"),
                            react_1["default"].createElement("div", { className: "relative" },
                                react_1["default"].createElement(lucide_react_1.FileText, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }),
                                react_1["default"].createElement(input_1.Input, { value: form.registrationNumber, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { registrationNumber: e.target.value })); }); }, disabled: !editing, className: "pl-9", placeholder: "CPR/2023/12345" }))),
                        react_1["default"].createElement("div", { className: "space-y-1.5" },
                            react_1["default"].createElement(label_1.Label, null, "Tax ID / KRA PIN"),
                            react_1["default"].createElement("div", { className: "relative" },
                                react_1["default"].createElement(lucide_react_1.FileText, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }),
                                react_1["default"].createElement(input_1.Input, { value: form.taxId, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { taxId: e.target.value })); }); }, disabled: !editing, className: "pl-9", placeholder: "A000000000X" }))),
                        react_1["default"].createElement("div", { className: "space-y-1.5" },
                            react_1["default"].createElement(label_1.Label, null, "Website"),
                            react_1["default"].createElement("div", { className: "relative" },
                                react_1["default"].createElement(lucide_react_1.Globe, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }),
                                react_1["default"].createElement(input_1.Input, { value: form.website, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { website: e.target.value })); }); }, disabled: !editing, className: "pl-9", placeholder: "https://yourcompany.com" }))))));
            case "currency":
                return (react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Currency & Timezone"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Regional and currency preferences for your organization")),
                    react_1["default"].createElement(card_1.CardContent, { className: "grid gap-5 sm:grid-cols-2" },
                        react_1["default"].createElement("div", { className: "space-y-1.5" },
                            react_1["default"].createElement(label_1.Label, null, "Currency"),
                            react_1["default"].createElement(select_1.Select, { value: form.currency, onValueChange: function (v) { return setForm(function (f) { return (__assign(__assign({}, f), { currency: v })); }); }, disabled: !editing },
                                react_1["default"].createElement(select_1.SelectTrigger, null,
                                    react_1["default"].createElement(select_1.SelectValue, null)),
                                react_1["default"].createElement(select_1.SelectContent, null, [["KES", "KES — Kenyan Shilling"], ["USD", "USD — US Dollar"], ["EUR", "EUR — Euro"],
                                    ["GBP", "GBP — British Pound"], ["UGX", "UGX — Ugandan Shilling"], ["TZS", "TZS — Tanzanian Shilling"],
                                    ["RWF", "RWF — Rwandan Franc"], ["ZAR", "ZAR — South African Rand"], ["NGN", "NGN — Nigerian Naira"], ["GHS", "GHS — Ghanaian Cedi"]].map(function (_a) {
                                    var v = _a[0], l = _a[1];
                                    return (react_1["default"].createElement(select_1.SelectItem, { key: v, value: v }, l));
                                })))),
                        react_1["default"].createElement("div", { className: "space-y-1.5" },
                            react_1["default"].createElement(label_1.Label, null, "Timezone"),
                            react_1["default"].createElement(select_1.Select, { value: form.timezone, onValueChange: function (v) { return setForm(function (f) { return (__assign(__assign({}, f), { timezone: v })); }); }, disabled: !editing },
                                react_1["default"].createElement(select_1.SelectTrigger, null,
                                    react_1["default"].createElement(select_1.SelectValue, null)),
                                react_1["default"].createElement(select_1.SelectContent, null, [["Africa/Nairobi", "Africa/Nairobi (EAT +3)"], ["Africa/Lagos", "Africa/Lagos (WAT +1)"],
                                    ["Africa/Johannesburg", "Africa/Johannesburg (SAST +2)"], ["Africa/Cairo", "Africa/Cairo (EET +2)"],
                                    ["Africa/Accra", "Africa/Accra (GMT +0)"], ["Europe/London", "Europe/London (GMT/BST)"],
                                    ["Europe/Paris", "Europe/Paris (CET +1)"], ["America/New_York", "America/New_York (EST/EDT)"]].map(function (_a) {
                                    var v = _a[0], l = _a[1];
                                    return (react_1["default"].createElement(select_1.SelectItem, { key: v, value: v }, l));
                                })))),
                        react_1["default"].createElement("div", { className: "space-y-1.5" },
                            react_1["default"].createElement(label_1.Label, null, "Billing Email"),
                            react_1["default"].createElement("div", { className: "relative" },
                                react_1["default"].createElement(lucide_react_1.Mail, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }),
                                react_1["default"].createElement(input_1.Input, { type: "email", value: form.billingEmail, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { billingEmail: e.target.value })); }); }, disabled: !editing, className: "pl-9", placeholder: "billing@yourcompany.com" }))),
                        react_1["default"].createElement("div", { className: "space-y-1.5" },
                            react_1["default"].createElement(label_1.Label, null, "Payment Method"),
                            react_1["default"].createElement(select_1.Select, { value: form.paymentMethod, onValueChange: function (v) { return setForm(function (f) { return (__assign(__assign({}, f), { paymentMethod: v })); }); }, disabled: !editing },
                                react_1["default"].createElement(select_1.SelectTrigger, null,
                                    react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select method\u2026" })),
                                react_1["default"].createElement(select_1.SelectContent, null,
                                    react_1["default"].createElement(select_1.SelectItem, { value: "mpesa" }, "M-Pesa"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "bank_transfer" }, "Bank Transfer"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "credit_card" }, "Credit / Debit Card"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "invoice" }, "Invoice (Net 30)")))))));
            case "theme":
                return (react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Theme"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Customize your organization's branding colors and appearance")),
                    react_1["default"].createElement(card_1.CardContent, { className: "grid gap-5 sm:grid-cols-2" },
                        react_1["default"].createElement("div", { className: "space-y-1.5" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "primaryColor", className: "flex items-center gap-1.5" },
                                react_1["default"].createElement(lucide_react_1.Palette, { className: "h-3.5 w-3.5" }),
                                "Primary Color"),
                            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                                react_1["default"].createElement("input", { id: "primaryColor", type: "color", title: "Primary brand color", value: form.primaryColor || "#2563eb", onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { primaryColor: e.target.value })); }); }, disabled: !editing, className: "h-9 w-12 cursor-pointer rounded border border-white/10 bg-transparent p-0.5 disabled:opacity-50" }),
                                react_1["default"].createElement(input_1.Input, { value: form.primaryColor, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { primaryColor: e.target.value })); }); }, disabled: !editing, placeholder: "#2563eb", className: "font-mono text-sm flex-1" }))),
                        react_1["default"].createElement("div", { className: "space-y-1.5" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "secondaryColor", className: "flex items-center gap-1.5" },
                                react_1["default"].createElement(lucide_react_1.Palette, { className: "h-3.5 w-3.5" }),
                                "Secondary Color"),
                            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                                react_1["default"].createElement("input", { id: "secondaryColor", type: "color", title: "Secondary brand color", value: form.secondaryColor || "#7c3aed", onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { secondaryColor: e.target.value })); }); }, disabled: !editing, className: "h-9 w-12 cursor-pointer rounded border border-white/10 bg-transparent p-0.5 disabled:opacity-50" }),
                                react_1["default"].createElement(input_1.Input, { value: form.secondaryColor, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { secondaryColor: e.target.value })); }); }, disabled: !editing, placeholder: "#7c3aed", className: "font-mono text-sm flex-1" }))),
                        react_1["default"].createElement("div", { className: "space-y-1.5" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "themeMode" }, "Theme Mode"),
                            react_1["default"].createElement(select_1.Select, { value: form.themeMode, onValueChange: function (v) { return setForm(function (f) { return (__assign(__assign({}, f), { themeMode: v })); }); }, disabled: !editing },
                                react_1["default"].createElement(select_1.SelectTrigger, null,
                                    react_1["default"].createElement(select_1.SelectValue, { placeholder: "System default" })),
                                react_1["default"].createElement(select_1.SelectContent, null,
                                    react_1["default"].createElement(select_1.SelectItem, { value: "system" }, "System Default"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "light" }, "Light Mode"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "dark" }, "Dark Mode")))),
                        react_1["default"].createElement("div", { className: "space-y-3 rounded-2xl border border-border bg-slate-50/80 p-4 dark:bg-slate-950/80" },
                            react_1["default"].createElement("div", { className: "flex items-center justify-between gap-3" },
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "text-sm font-semibold" }, "Live Theme Preview"),
                                    react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" }, "Preview how colors and mode feel in the org dashboard.")),
                                react_1["default"].createElement("span", { className: "rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary-700 dark:text-primary-300" }, form.themeMode === "system" ? "System" : form.themeMode === "light" ? "Light" : "Dark")),
                            react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-3" },
                                react_1["default"].createElement("div", { className: "rounded-2xl p-3 text-white", style: { backgroundColor: form.primaryColor || "#2563eb" } },
                                    react_1["default"].createElement("p", { className: "text-sm font-semibold" }, "Primary"),
                                    react_1["default"].createElement("p", { className: "text-xs opacity-80 mt-1" }, form.primaryColor)),
                                react_1["default"].createElement("div", { className: "rounded-2xl p-3 text-white", style: { backgroundColor: form.secondaryColor || "#7c3aed" } },
                                    react_1["default"].createElement("p", { className: "text-sm font-semibold" }, "Secondary"),
                                    react_1["default"].createElement("p", { className: "text-xs opacity-80 mt-1" }, form.secondaryColor)))))));
            case "company-logo":
                return (react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Company Logo"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Upload your organization's logo for branding")),
                    react_1["default"].createElement(card_1.CardContent, { className: "space-y-6" },
                        react_1["default"].createElement("div", { className: "flex items-center gap-6" },
                            form.logoUrl ? (react_1["default"].createElement("img", { src: form.logoUrl, alt: "Logo preview", className: "h-24 w-24 rounded-xl object-cover border border-white/10" })) : (react_1["default"].createElement("div", { className: "flex h-24 w-24 items-center justify-center rounded-xl bg-white/5 border border-white/10" },
                                react_1["default"].createElement(lucide_react_1.Image, { className: "h-8 w-8 text-muted-foreground" }))),
                            react_1["default"].createElement("div", { className: "flex flex-col gap-3 flex-1" },
                                react_1["default"].createElement("input", { ref: logoInputRef, type: "file", accept: "image/*", "aria-label": "Upload organization logo", className: "hidden", onChange: handleLogoUpload, disabled: !editing }),
                                react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", disabled: !editing, onClick: function () { var _a; return (_a = logoInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }, className: "w-full sm:w-auto" },
                                    react_1["default"].createElement(lucide_react_1.Upload, { className: "mr-2 h-4 w-4" }),
                                    form.logoUrl ? "Replace Logo" : "Upload Logo"),
                                form.logoUrl && editing && (react_1["default"].createElement(button_1.Button, { type: "button", variant: "ghost", size: "sm", className: "text-destructive hover:text-destructive w-full sm:w-auto", onClick: function () { return setForm(function (f) { return (__assign(__assign({}, f), { logoUrl: "" })); }); } }, "Remove")),
                                react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" }, "PNG, JPG up to 2 MB"))))));
            case "email":
                return (react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Email & SMTP Configuration"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Configure email delivery settings for your organization")),
                    react_1["default"].createElement(card_1.CardContent, { className: "space-y-6" },
                        react_1["default"].createElement("div", { className: "space-y-4 pb-4 border-b border-white/5" },
                            react_1["default"].createElement(FormToggle_1.FormToggle, { id: "useGlobalSmtp", label: "Use Global SMTP", description: "Use the platform's default email service instead of custom SMTP", checked: form.useGlobalSmtp, onChange: function (checked) { return setForm(function (f) { return (__assign(__assign({}, f), { useGlobalSmtp: checked })); }); }, disabled: !editing })),
                        !form.useGlobalSmtp && (react_1["default"].createElement("div", { className: "space-y-4 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20" },
                            react_1["default"].createElement("div", { className: "flex items-start gap-2 text-sm text-blue-600 dark:text-blue-400" },
                                react_1["default"].createElement(lucide_react_1.Check, { className: "h-4 w-4 mt-0.5 flex-shrink-0" }),
                                react_1["default"].createElement("p", null, "Custom SMTP is enabled. Configure your email provider settings below.")),
                            react_1["default"].createElement("div", { className: "grid gap-4 sm:grid-cols-2" },
                                react_1["default"].createElement("div", { className: "space-y-1.5" },
                                    react_1["default"].createElement(label_1.Label, { htmlFor: "smtpHost" }, "SMTP Host"),
                                    react_1["default"].createElement(input_1.Input, { id: "smtpHost", value: form.smtpHost, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { smtpHost: e.target.value })); }); }, disabled: !editing || form.useGlobalSmtp, placeholder: "e.g., smtp.gmail.com" })),
                                react_1["default"].createElement("div", { className: "space-y-1.5" },
                                    react_1["default"].createElement(label_1.Label, { htmlFor: "smtpPort" }, "Port"),
                                    react_1["default"].createElement(input_1.Input, { id: "smtpPort", type: "number", value: form.smtpPort, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { smtpPort: e.target.value })); }); }, disabled: !editing || form.useGlobalSmtp, placeholder: "587" })),
                                react_1["default"].createElement("div", { className: "space-y-1.5" },
                                    react_1["default"].createElement(label_1.Label, { htmlFor: "smtpFromEmail" }, "From Email Address"),
                                    react_1["default"].createElement("div", { className: "relative" },
                                        react_1["default"].createElement(lucide_react_1.Mail, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }),
                                        react_1["default"].createElement(input_1.Input, { id: "smtpFromEmail", type: "email", value: form.smtpFromEmail, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { smtpFromEmail: e.target.value })); }); }, disabled: !editing || form.useGlobalSmtp, className: "pl-9", placeholder: "noreply@yourcompany.com" }))),
                                react_1["default"].createElement("div", { className: "space-y-1.5" },
                                    react_1["default"].createElement(label_1.Label, { htmlFor: "smtpFromName" }, "From Display Name"),
                                    react_1["default"].createElement(input_1.Input, { id: "smtpFromName", value: form.smtpFromName, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { smtpFromName: e.target.value })); }); }, disabled: !editing || form.useGlobalSmtp, placeholder: "Your Company Name" })),
                                react_1["default"].createElement("div", { className: "space-y-1.5" },
                                    react_1["default"].createElement(label_1.Label, { htmlFor: "smtpUser" }, "SMTP Username"),
                                    react_1["default"].createElement(input_1.Input, { id: "smtpUser", value: form.smtpUser, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { smtpUser: e.target.value })); }); }, disabled: !editing || form.useGlobalSmtp, placeholder: "username@provider.com" })),
                                react_1["default"].createElement("div", { className: "space-y-1.5" },
                                    react_1["default"].createElement(label_1.Label, { htmlFor: "smtpPassword" }, "SMTP Password"),
                                    react_1["default"].createElement(input_1.Input, { id: "smtpPassword", type: "password", value: form.smtpPassword, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { smtpPassword: e.target.value })); }); }, disabled: !editing || form.useGlobalSmtp, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" }))),
                            editing && !form.useGlobalSmtp && (react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", size: "sm", className: "mt-2", disabled: !form.smtpHost || !form.smtpPort || !form.smtpUser || !form.smtpPassword || testingSmtp, onClick: function () {
                                    setTestingSmtp(true);
                                    testSmtpMutation.mutate({
                                        smtpHost: form.smtpHost,
                                        smtpPort: form.smtpPort,
                                        smtpUser: form.smtpUser,
                                        smtpPassword: form.smtpPassword,
                                        smtpFromEmail: form.smtpFromEmail
                                    });
                                } },
                                react_1["default"].createElement(lucide_react_1.Zap, { className: "mr-2 h-4 w-4" }),
                                testingSmtp ? "Testing..." : "Test Connection")))),
                        form.useGlobalSmtp && (react_1["default"].createElement("div", { className: "p-4 rounded-lg bg-green-500/5 border border-green-500/20" },
                            react_1["default"].createElement("div", { className: "flex items-start gap-2 text-sm text-green-600 dark:text-green-400" },
                                react_1["default"].createElement(lucide_react_1.Check, { className: "h-4 w-4 mt-0.5 flex-shrink-0" }),
                                react_1["default"].createElement("p", null, "Using platform default email service. Email configuration will be handled by the platform.")))))));
            case "email-templates":
                return (react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Email Templates"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Customize email templates for your organization")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("p", { className: "text-muted-foreground mb-4" }, "Manage transactional email templates like password resets, invoices, and notifications."),
                        react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return navigate("/org/" + slug + "/settings?section=email-templates"); } },
                            react_1["default"].createElement(lucide_react_1.Mail, { className: "mr-2 h-4 w-4" }),
                            "Manage Templates"))));
            case "proposal-templates":
                return (react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Proposal Templates"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Manage your reusable proposal and quotation templates.")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("p", { className: "text-muted-foreground mb-4" }, "Use customizable proposal templates to streamline sales and quoting workflows."),
                        react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return navigate("/org/" + slug + "/proposals/templates"); } },
                            react_1["default"].createElement(lucide_react_1.FileText, { className: "mr-2 h-4 w-4" }),
                            "Open Proposal Templates"))));
            case "service-templates":
                return (react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Service Templates"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Organize standard service bundles and service descriptions.")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("p", { className: "text-muted-foreground mb-4" }, "Create, update, and reuse service templates to simplify invoicing and quoting."),
                        react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return navigate("/org/" + slug + "/service-templates"); } },
                            react_1["default"].createElement(lucide_react_1.FileText, { className: "mr-2 h-4 w-4" }),
                            "Open Service Templates"))));
            case "contract-templates":
                return (react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Contract Templates"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Manage reusable contracts and work orders for the organization.")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("p", { className: "text-muted-foreground mb-4" }, "Save and reuse contract templates to accelerate onboarding and project delivery."),
                        react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return navigate("/org/" + slug + "/contracts/templates"); } },
                            react_1["default"].createElement(lucide_react_1.FileText, { className: "mr-2 h-4 w-4" }),
                            "Open Contract Templates"))));
            case "document-templates":
                return (react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Document Templates"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Configure built-in document templates and layouts.")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("p", { className: "text-muted-foreground mb-4" }, "Document templates are coming soon for invoices, receipts, and purchase orders."),
                        react_1["default"].createElement(button_1.Button, { variant: "outline", disabled: true },
                            react_1["default"].createElement(lucide_react_1.FileText, { className: "mr-2 h-4 w-4" }),
                            "Coming Soon"))));
            case "security-password":
                return (react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Password Policy"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Configure password requirements for your organization")),
                    react_1["default"].createElement(card_1.CardContent, { className: "space-y-6" },
                        react_1["default"].createElement("div", { className: "grid gap-5 sm:grid-cols-2" },
                            react_1["default"].createElement("div", { className: "space-y-1.5" },
                                react_1["default"].createElement(label_1.Label, null, "Minimum Password Length"),
                                react_1["default"].createElement(input_1.Input, { type: "number", placeholder: "8", min: "6", max: "32", disabled: !editing })),
                            react_1["default"].createElement("div", { className: "space-y-1.5" },
                                react_1["default"].createElement(label_1.Label, null, "Password Expiry (Days)"),
                                react_1["default"].createElement(input_1.Input, { type: "number", placeholder: "90", min: "0", disabled: !editing })),
                            react_1["default"].createElement(FormToggle_1.FormToggle, { id: "pw-uppercase", label: "Require Uppercase", description: "At least one capital letter", checked: true, onChange: function () { }, disabled: !editing }),
                            react_1["default"].createElement(FormToggle_1.FormToggle, { id: "pw-numbers", label: "Require Numbers", description: "At least one digit", checked: true, onChange: function () { }, disabled: !editing }),
                            react_1["default"].createElement(FormToggle_1.FormToggle, { id: "pw-special", label: "Require Special Characters", description: "At least one symbol (!@#$%)", checked: false, onChange: function () { }, disabled: !editing })))));
            case "security-2fa":
                return (react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Two-Factor Authentication"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Configure 2FA requirements for your organization")),
                    react_1["default"].createElement(card_1.CardContent, { className: "space-y-6" },
                        react_1["default"].createElement(FormToggle_1.FormToggle, { id: "2fa-required", label: "Require 2FA", description: "Force all users to enable two-factor authentication", checked: false, onChange: function () { }, disabled: !editing }),
                        react_1["default"].createElement("div", { className: "space-y-1.5" },
                            react_1["default"].createElement(label_1.Label, null, "Allowed 2FA Methods"),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(FormToggle_1.FormToggle, { id: "2fa-totp", label: "Authenticator App (TOTP)", checked: true, onChange: function () { }, disabled: !editing }),
                                react_1["default"].createElement(FormToggle_1.FormToggle, { id: "2fa-sms", label: "SMS", checked: true, onChange: function () { }, disabled: !editing }),
                                react_1["default"].createElement(FormToggle_1.FormToggle, { id: "2fa-email", label: "Email", checked: true, onChange: function () { }, disabled: !editing }))))));
            case "security-sessions":
                return (react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Active Sessions"),
                        react_1["default"].createElement(card_1.CardDescription, null, "View and manage active user sessions in your organization")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "text-center py-8" },
                            react_1["default"].createElement(lucide_react_1.Smartphone, { className: "h-12 w-12 text-muted-foreground mx-auto mb-3" }),
                            react_1["default"].createElement("p", { className: "text-muted-foreground" }, "No active sessions to display")))));
            case "security-log":
                return (react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Login History"),
                        react_1["default"].createElement(card_1.CardDescription, null, "View login activity for your organization")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "space-y-4" },
                            react_1["default"].createElement("div", { className: "flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10" },
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "font-medium" }, "admin@example.com"),
                                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Logged in from 192.168.1.1")),
                                react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Today at 10:32 AM"))))));
            case "roles":
                return (react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Roles & Permissions"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Manage user roles and their permissions")),
                    react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" }, ["Admin", "Manager", "Employee", "Client"].map(function (role) { return (react_1["default"].createElement("div", { key: role, className: "flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("p", { className: "font-medium" }, role),
                            react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Standard organization role")),
                        react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm" }, "Edit"))); }))));
            case "permissions-matrix":
                return (react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Advanced Permissions"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Configure granular permissions per feature and role")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("p", { className: "text-muted-foreground mb-4" }, "Create custom permission matrices to control which roles have access to specific features."),
                        react_1["default"].createElement(button_1.Button, { variant: "outline" },
                            react_1["default"].createElement(lucide_react_1.Shield, { className: "mr-2 h-4 w-4" }),
                            "Configure Permissions"))));
            case "notifications":
                return (react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Notification Preferences"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Manage notification settings for your organization")),
                    react_1["default"].createElement(card_1.CardContent, { className: "space-y-6" },
                        react_1["default"].createElement(FormToggle_1.FormToggle, { id: "notify-invoices", label: "Invoice Notifications", description: "Notify when invoices are created or updated", checked: true, onChange: function () { }, disabled: !editing }),
                        react_1["default"].createElement(FormToggle_1.FormToggle, { id: "notify-payments", label: "Payment Notifications", description: "Notify when payments are received", checked: true, onChange: function () { }, disabled: !editing }),
                        react_1["default"].createElement(FormToggle_1.FormToggle, { id: "notify-users", label: "User Activity Notifications", description: "Notify about user logins and role changes", checked: false, onChange: function () { }, disabled: !editing }),
                        react_1["default"].createElement(FormToggle_1.FormToggle, { id: "notify-daily-digest", label: "Daily Digest", description: "Receive a daily summary of organization activity", checked: false, onChange: function () { }, disabled: !editing }))));
            case "sms-settings":
                return (react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "SMS Configuration"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Configure SMS delivery settings for your organization")),
                    react_1["default"].createElement(card_1.CardContent, { className: "space-y-6" },
                        react_1["default"].createElement(FormToggle_1.FormToggle, { id: "sms-enabled", label: "Enable SMS", description: "Allow SMS notifications and messages", checked: false, onChange: function () { }, disabled: !editing }),
                        react_1["default"].createElement("div", { className: "grid gap-5 sm:grid-cols-2" },
                            react_1["default"].createElement("div", { className: "space-y-1.5" },
                                react_1["default"].createElement(label_1.Label, null, "SMS Provider"),
                                react_1["default"].createElement(select_1.Select, { disabled: !editing },
                                    react_1["default"].createElement(select_1.SelectTrigger, null,
                                        react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select provider\u2026" })),
                                    react_1["default"].createElement(select_1.SelectContent, null,
                                        react_1["default"].createElement(select_1.SelectItem, { value: "twilio" }, "Twilio"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "aws-sns" }, "AWS SNS"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "nexmo" }, "Vonage (Nexmo)")))),
                            react_1["default"].createElement("div", { className: "space-y-1.5" },
                                react_1["default"].createElement(label_1.Label, null, "API Key"),
                                react_1["default"].createElement(input_1.Input, { type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", disabled: !editing }))))));
            case "sms-templates":
                return (react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "SMS Templates"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Customize SMS templates for your organization")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("p", { className: "text-muted-foreground mb-4" }, "Manage SMS message templates for invoices, payments, and notifications."),
                        react_1["default"].createElement(button_1.Button, { variant: "outline" },
                            react_1["default"].createElement(lucide_react_1.MessageSquare, { className: "mr-2 h-4 w-4" }),
                            "Manage SMS Templates"))));
            case "backup":
                return (react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Backup & Restore"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Manage backups of your organization data")),
                    react_1["default"].createElement(card_1.CardContent, { className: "space-y-6" },
                        react_1["default"].createElement("div", { className: "p-4 rounded-lg bg-blue-500/5 border border-blue-500/20" },
                            react_1["default"].createElement("div", { className: "flex items-start gap-3" },
                                react_1["default"].createElement(lucide_react_1.Database, { className: "h-5 w-5 text-blue-600 mt-0.5" }),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "font-medium text-blue-600" }, "Last backup"),
                                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Today at 2:30 AM (automatic)")))),
                        react_1["default"].createElement("div", { className: "flex gap-2" },
                            react_1["default"].createElement(button_1.Button, { variant: "outline" },
                                react_1["default"].createElement(lucide_react_1.Upload, { className: "mr-2 h-4 w-4" }),
                                "Create Backup"),
                            react_1["default"].createElement(button_1.Button, { variant: "outline" },
                                react_1["default"].createElement(lucide_react_1.Database, { className: "mr-2 h-4 w-4" }),
                                "Restore")))));
            default:
                return (react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Coming Soon"),
                        react_1["default"].createElement(card_1.CardDescription, null, "This section is not yet available")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("p", { className: "text-muted-foreground" },
                            "Settings for \"",
                            activeSection,
                            "\" will be available soon."))));
        }
    };
    var enabledFeatureCount = Object.values(featureMap).filter(Boolean).length;
    return (react_1["default"].createElement(OrgLayout_1.OrgLayout, { title: "Organization Settings", description: "Manage your organization profile, configuration, and preferences" },
        react_1["default"].createElement("div", { className: "flex gap-6" },
            react_1["default"].createElement("div", { className: "hidden lg:block w-64 flex-shrink-0" },
                react_1["default"].createElement(scroll_area_1.ScrollArea, { className: "h-[calc(100vh-12rem)]" },
                    react_1["default"].createElement("div", { className: "space-y-1 pr-4" }, ORG_NAV_GROUPS.map(function (group) { return (react_1["default"].createElement("div", { key: group.id, className: "space-y-1" },
                        react_1["default"].createElement("button", { onClick: function () { return toggleGroup(group.id); }, className: "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md hover:bg-white/5 transition-colors" },
                            react_1["default"].createElement("span", { className: "inline-flex items-center gap-2 flex-1" },
                                group.icon,
                                group.label),
                            expandedGroups.has(group.id) ? (react_1["default"].createElement(lucide_react_1.ChevronDown, { className: "h-4 w-4" })) : (react_1["default"].createElement(lucide_react_1.ChevronRight, { className: "h-4 w-4" }))),
                        expandedGroups.has(group.id) && (react_1["default"].createElement("div", { className: "space-y-1 pl-7" }, group.children.map(function (child) {
                            var sectionId = child.sectionId;
                            var hasAccess = canAccessSection(sectionId);
                            return (react_1["default"].createElement("button", { key: child.id, onClick: function () { return hasAccess && setActiveSection(sectionId); }, disabled: !hasAccess, className: utils_1.cn("block w-full text-left px-3 py-2 text-sm rounded-md transition-colors", !hasAccess && "opacity-50 cursor-not-allowed", hasAccess && activeSection === sectionId
                                    ? "bg-blue-600/10 text-blue-600 font-medium"
                                    : "text-muted-foreground hover:bg-white/5"), title: !hasAccess ? "You don't have permission to access this section" : "" }, child.label));
                        }))))); })))),
            react_1["default"].createElement("div", { className: "flex-1 min-w-0" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between mb-6 flex-wrap gap-4" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("h2", { className: "text-lg font-semibold" }, "Organization Settings"),
                        react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Manage your organization's profile and preferences")),
                    react_1["default"].createElement("div", { className: "flex gap-2" }, editing ? (react_1["default"].createElement(react_1["default"].Fragment, null,
                        react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleCancel }, "Cancel"),
                        react_1["default"].createElement(button_1.Button, { size: "sm", onClick: handleSave, disabled: !canEditSettings() || updateMutation.isPending || brandingMutation.isPending },
                            react_1["default"].createElement(lucide_react_1.Save, { className: "mr-2 h-4 w-4" }),
                            updateMutation.isPending ? "Saving…" : "Save Changes"))) : (react_1["default"].createElement(button_1.Button, { size: "sm", onClick: function () { return setEditing(true); }, disabled: !canEditSettings() },
                        react_1["default"].createElement(lucide_react_1.Pencil, { className: "mr-2 h-4 w-4" }),
                        "Edit Profile")))),
                react_1["default"].createElement(card_1.Card, { className: "mb-6" },
                    react_1["default"].createElement(card_1.CardContent, { className: "pt-6" },
                        react_1["default"].createElement("div", { className: "flex items-center gap-4" },
                            react_1["default"].createElement("div", { className: "flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/20" }, ((_c = org) === null || _c === void 0 ? void 0 : _c.logoUrl) ? (react_1["default"].createElement("img", { src: org.logoUrl, alt: org === null || org === void 0 ? void 0 : org.name, className: "h-14 w-14 rounded-xl object-cover" })) : (react_1["default"].createElement(lucide_react_1.Building2, { className: "h-7 w-7 text-blue-500" }))),
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("h3", { className: "font-semibold" }, org === null || org === void 0 ? void 0 : org.name),
                                react_1["default"].createElement("div", { className: "flex items-center gap-2 mt-1" },
                                    react_1["default"].createElement(badge_1.Badge, { variant: "outline", className: "capitalize" }, ((_d = org) === null || _d === void 0 ? void 0 : _d.plan) || "starter"),
                                    ((_e = org) === null || _e === void 0 ? void 0 : _e.isActive) ? (react_1["default"].createElement(badge_1.Badge, { variant: "outline", className: "border-green-500/30 bg-green-500/10 text-green-500 gap-1" },
                                        react_1["default"].createElement(lucide_react_1.CheckCircle2, { className: "h-3 w-3" }),
                                        " Active")) : (react_1["default"].createElement(badge_1.Badge, { variant: "outline", className: "border-red-500/30 bg-red-500/10 text-red-500" }, "Inactive")),
                                    react_1["default"].createElement("span", { className: "text-xs text-muted-foreground" },
                                        enabledFeatureCount,
                                        " modules enabled")))))),
                renderSettingsContent(),
                activeSection === "general" && (react_1["default"].createElement(card_1.Card, { className: "mt-6" },
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-base" }, "Enabled Modules"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Modules enabled on your plan")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "flex flex-wrap gap-2" }, Object.entries(featureMap).length === 0 ? (react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "No modules configured yet.")) : (Object.entries(featureMap).map(function (_a) {
                            var key = _a[0], enabled = _a[1];
                            return (react_1["default"].createElement(badge_1.Badge, { key: key, variant: "outline", className: enabled
                                    ? "border-green-500/30 bg-green-500/10 text-green-600"
                                    : "border-muted text-muted-foreground opacity-50" }, key.replace(/_/g, " ")));
                        }))))))))));
}
exports["default"] = OrgSettings;
