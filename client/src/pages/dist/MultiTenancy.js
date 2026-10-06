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
/**
 * Multi-Tenancy Management Page
 * Kiini super-admins can create/edit/delete organizations (tenants),
 * toggle per-org module availability, assign users to organizations,
 * manage pricing tiers, view tenant admins list, and send tenant communications.
 */
var react_1 = require("react");
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var select_1 = require("@/components/ui/select");
var dialog_1 = require("@/components/ui/dialog");
var tabs_1 = require("@/components/ui/tabs");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var lucide_react_1 = require("lucide-react");
var LocationSelects_1 = require("@/components/LocationSelects");
var PhoneInput_1 = require("@/components/PhoneInput");
var date_fns_1 = require("date-fns");
var table_1 = require("@/components/ui/table");
// ─── helpers ────────────────────────────────────────────────────────────────
var DEFAULT_PLAN_OPTIONS = ["trial", "starter", "gold", "professional", "enterprise", "custom"];
var PLAN_COLORS = {
    trial: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    starter: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    gold: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    professional: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
    enterprise: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    custom: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
};
var PRIORITY_COLORS = {
    low: "bg-gray-100 text-gray-700",
    normal: "bg-blue-100 text-blue-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800"
};
function planBadge(plan) {
    var _a;
    var cls = (_a = PLAN_COLORS[plan]) !== null && _a !== void 0 ? _a : "bg-gray-100 text-gray-700";
    return react_1["default"].createElement("span", { className: "inline-block rounded px-2 py-0.5 text-xs font-medium capitalize " + cls }, plan);
}
function slugify(v) {
    return v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function fmt(dt) {
    if (!dt)
        return "\u2014";
    try {
        return date_fns_1.format(date_fns_1.parseISO(dt), "d MMM yyyy");
    }
    catch (_a) {
        return dt.slice(0, 10);
    }
}
function fmtFull(dt) {
    if (!dt)
        return "\u2014";
    var s = dt instanceof Date ? dt.toISOString() : dt;
    try {
        return date_fns_1.format(date_fns_1.parseISO(s), "d MMM yyyy, h:mm a");
    }
    catch (_a) {
        return s.slice(0, 16).replace("T", " ");
    }
}
function formatPlanName(planKey, prices) {
    var _a;
    return ((_a = prices[planKey]) === null || _a === void 0 ? void 0 : _a.label) || planKey.replace(/_/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); });
}
// ─── Form defaults ───────────────────────────────────────────────────────────
var BLANK_FORM = {
    name: "", slug: "", plan: "trial",
    maxUsers: 5, contactEmail: "", contactPhone: "",
    domain: "", country: "", address: "",
    industry: "", website: "", taxId: "", billingEmail: "",
    timezone: "Africa/Nairobi", currency: "KES",
    description: "",
    employeeCount: "",
    registrationNumber: "", paymentMethod: "",
    adminMode: "create",
    adminName: "", adminEmail: "", adminPassword: "",
    existingUserId: ""
};
var BLANK_MESSAGE = {
    subject: "", content: "", priority: "normal", type: "announcement",
    targetType: "all_admins", targetOrgId: "", targetUserId: ""
};
// ── Branding Panel ──────────────────────────────────────────────────────────
function BrandingPanel(_a) {
    var orgId = _a.orgId;
    var _b = react_1.useState("#3b82f6"), primaryColor = _b[0], setPrimaryColor = _b[1];
    var _c = react_1.useState("#10b981"), secondaryColor = _c[0], setSecondaryColor = _c[1];
    var _d = react_1.useState(""), customDomain = _d[0], setCustomDomain = _d[1];
    var _e = react_1.useState(""), logoUrl = _e[0], setLogoUrl = _e[1];
    var _f = react_1.useState(false), loaded = _f[0], setLoaded = _f[1];
    var whiteLabelQuery = trpc_1.trpc.multiTenancy.getWhiteLabelConfig.useQuery({ tenantId: orgId }, { enabled: !!orgId });
    react_1.useEffect(function () {
        var data = whiteLabelQuery.data;
        if (!loaded && (data === null || data === void 0 ? void 0 : data.whiteLabel)) {
            setPrimaryColor(data.whiteLabel.primaryColor || "#3b82f6");
            setSecondaryColor(data.whiteLabel.secondaryColor || "#10b981");
            setCustomDomain(data.whiteLabel.customDomain || "");
            setLogoUrl(data.whiteLabel.logo || data.logoUrl || "");
            setLoaded(true);
        }
    }, [whiteLabelQuery.data]);
    var saveBranding = trpc_1.trpc.multiTenancy.configureWhiteLabelOptions.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Branding saved successfully");
            whiteLabelQuery.refetch();
        },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var handleSave = function () {
        saveBranding.mutate({
            tenantId: orgId,
            branding: {
                logo: logoUrl || undefined,
                colors: { primary: primaryColor, secondary: secondaryColor },
                customDomain: customDomain || undefined
            }
        });
    };
    return (react_1["default"].createElement("div", { className: "space-y-4" },
        react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Configure white-label branding for this organization."),
        react_1["default"].createElement("div", { className: "grid gap-4 sm:grid-cols-2" },
            react_1["default"].createElement("div", null,
                react_1["default"].createElement(label_1.Label, { className: "text-xs" }, "Primary Color"),
                react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                    react_1["default"].createElement("input", { type: "color", title: "Primary color", value: primaryColor, onChange: function (e) { return setPrimaryColor(e.target.value); }, className: "h-9 w-12 cursor-pointer rounded border" }),
                    react_1["default"].createElement(input_1.Input, { value: primaryColor, onChange: function (e) { return setPrimaryColor(e.target.value); }, className: "flex-1" }))),
            react_1["default"].createElement("div", null,
                react_1["default"].createElement(label_1.Label, { className: "text-xs" }, "Secondary Color"),
                react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                    react_1["default"].createElement("input", { type: "color", title: "Secondary color", value: secondaryColor, onChange: function (e) { return setSecondaryColor(e.target.value); }, className: "h-9 w-12 cursor-pointer rounded border" }),
                    react_1["default"].createElement(input_1.Input, { value: secondaryColor, onChange: function (e) { return setSecondaryColor(e.target.value); }, className: "flex-1" }))),
            react_1["default"].createElement("div", { className: "sm:col-span-2" },
                react_1["default"].createElement(label_1.Label, { className: "text-xs" }, "Logo URL"),
                react_1["default"].createElement(input_1.Input, { value: logoUrl, onChange: function (e) { return setLogoUrl(e.target.value); }, placeholder: "https://example.com/logo.png" })),
            react_1["default"].createElement("div", { className: "sm:col-span-2" },
                react_1["default"].createElement(label_1.Label, { className: "text-xs" }, "Custom Domain"),
                react_1["default"].createElement(input_1.Input, { value: customDomain, onChange: function (e) { return setCustomDomain(e.target.value); }, placeholder: "crm.clientdomain.com" }),
                react_1["default"].createElement("p", { className: "mt-1 text-xs text-muted-foreground" }, "The organization will access the platform via this domain."))),
        primaryColor && (react_1["default"].createElement("div", { className: "flex gap-3 items-center pt-2" },
            react_1["default"].createElement("div", { className: "h-8 w-8 rounded", style: { backgroundColor: primaryColor } }),
            react_1["default"].createElement("div", { className: "h-8 w-8 rounded", style: { backgroundColor: secondaryColor } }),
            react_1["default"].createElement("span", { className: "text-xs text-muted-foreground" }, "Color preview"))),
        react_1["default"].createElement("div", { className: "flex justify-end pt-2" },
            react_1["default"].createElement(button_1.Button, { onClick: handleSave, disabled: saveBranding.isPending }, saveBranding.isPending ? react_1["default"].createElement(react_1["default"].Fragment, null,
                react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                " Saving...") : "Save Branding"))));
}
// ─────────────────────────────────────────────────────────────────────────────
function MultiTenancy() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1;
    var utils = trpc_1.trpc.useUtils();
    var location = wouter_1.useLocation()[0];
    var tabFromPath = function (p) {
        return p.includes("tenant-admins") ? "admins"
            : p.includes("pricing") ? "pricing"
                : p.includes("tenant-comms") ? "comms"
                    : p.includes("tenant-users") ? "tenant-users"
                        : "organizations";
    };
    var _2 = react_1.useState(function () { return tabFromPath(location); }), mainTab = _2[0], setMainTab = _2[1];
    react_1.useEffect(function () { setMainTab(tabFromPath(location)); }, [location]);
    // ── List ─────────────────────────────────────────────────────────────────
    var _3 = trpc_1.trpc.multiTenancy.listOrganizations.useQuery(), listData = _3.data, listLoading = _3.isLoading, refetchList = _3.refetch;
    var orgs = (_a = listData === null || listData === void 0 ? void 0 : listData.organizations) !== null && _a !== void 0 ? _a : [];
    var archivedQuery = trpc_1.trpc.multiTenancy.listOrganizations.useQuery({ includeArchived: true });
    var archivedOrgs = ((_c = (_b = archivedQuery.data) === null || _b === void 0 ? void 0 : _b.organizations) !== null && _c !== void 0 ? _c : []).filter(function (o) { return o.isArchived; });
    // ── Selected org detail ─────────────────────────────────────────────────
    var _4 = react_1.useState(null), selectedOrgId = _4[0], setSelectedOrgId = _4[1];
    var _5 = trpc_1.trpc.multiTenancy.getOrganization.useQuery({ id: selectedOrgId }, { enabled: !!selectedOrgId }), orgDetail = _5.data, detailLoading = _5.isLoading;
    var _6 = trpc_1.trpc.multiTenancy.getOrgFeatures.useQuery({ organizationId: selectedOrgId }, { enabled: !!selectedOrgId }), featuresData = _6.data, featuresLoading = _6.isLoading;
    var featureMap = (_e = (_d = featuresData) === null || _d === void 0 ? void 0 : _d.features) !== null && _e !== void 0 ? _e : {};
    var orgUsers = (_g = (_f = trpc_1.trpc.multiTenancy.getOrgUsers.useQuery({ organizationId: selectedOrgId }, { enabled: !!selectedOrgId }).data) === null || _f === void 0 ? void 0 : _f.users) !== null && _g !== void 0 ? _g : [];
    var allUsers = (_h = trpc_1.trpc.users.list.useQuery().data) !== null && _h !== void 0 ? _h : [];
    // ── Pricing tier data ───────────────────────────────────────────────────
    var _7 = trpc_1.trpc.multiTenancy.getAllPricingTierFeatures.useQuery(), allTierData = _7.data, tiersLoading = _7.isLoading;
    var tierMap = (_k = (_j = allTierData) === null || _j === void 0 ? void 0 : _j.tiers) !== null && _k !== void 0 ? _k : {};
    var planPricesData = trpc_1.trpc.multiTenancy.getPlanPrices.useQuery().data;
    var tierDefaultsData = trpc_1.trpc.multiTenancy.getTierDefaults.useQuery().data;
    var apiPrices = (((_l = planPricesData) === null || _l === void 0 ? void 0 : _l.prices) || {});
    var tierMaxUsers = react_1.useMemo(function () {
        var _a, _b;
        var defaults = (_b = (_a = tierDefaultsData) === null || _a === void 0 ? void 0 : _a.tierMaxUsers) !== null && _b !== void 0 ? _b : { trial: 5, starter: 10, gold: 50, professional: 100, enterprise: 500, custom: 0 };
        // Build complete tierMaxUsers by reading directly from apiPrices for each available plan
        // This ensures custom tiers have their correct maxUsers values
        var result = {};
        // First add all defaults
        for (var _i = 0, _c = Object.entries(defaults); _i < _c.length; _i++) {
            var _d = _c[_i], key = _d[0], value = _d[1];
            result[key] = value;
        }
        // Then override with values from apiPrices (which includes custom tiers from database)
        for (var _e = 0, _f = Object.entries(apiPrices); _e < _f.length; _e++) {
            var key = _f[_e][0];
            var tierData = apiPrices[key];
            if (tierData && typeof tierData === 'object' && typeof tierData.maxUsers === 'number') {
                result[key] = tierData.maxUsers;
            }
        }
        return result;
    }, [tierDefaultsData, apiPrices]);
    // ── Tenant admins ───────────────────────────────────────────────────────
    var _8 = trpc_1.trpc.multiTenancy.listTenantAdmins.useQuery(), tenantAdminsData = _8.data, adminsLoading = _8.isLoading;
    var tenantAdmins = (_o = (_m = tenantAdminsData) === null || _m === void 0 ? void 0 : _m.admins) !== null && _o !== void 0 ? _o : [];
    // ── Tenant users (all org users across organizations) ────────────────────
    var _9 = react_1.useState(""), tenantUsersSearch = _9[0], setTenantUsersSearch = _9[1];
    var _10 = react_1.useState(""), tenantUsersOrgFilter = _10[0], setTenantUsersOrgFilter = _10[1];
    var _11 = react_1.useState(1), tenantUsersPage = _11[0], setTenantUsersPage = _11[1];
    var TENANT_USERS_PAGE_SIZE = 20;
    var _12 = trpc_1.trpc.organizationUsers.list.useQuery({
        search: tenantUsersSearch || undefined,
        organizationId: tenantUsersOrgFilter || undefined,
        limit: TENANT_USERS_PAGE_SIZE,
        offset: (tenantUsersPage - 1) * TENANT_USERS_PAGE_SIZE
    }, { staleTime: 30000 }), tenantUsersData = _12.data, tenantUsersLoading = _12.isLoading, refetchTenantUsers = _12.refetch;
    var tenantUsersList = (_q = (_p = tenantUsersData) === null || _p === void 0 ? void 0 : _p.users) !== null && _q !== void 0 ? _q : [];
    var tenantUsersTotal = (_s = (_r = tenantUsersData) === null || _r === void 0 ? void 0 : _r.total) !== null && _s !== void 0 ? _s : 0;
    var tenantUsersTotalPages = Math.max(1, Math.ceil(tenantUsersTotal / TENANT_USERS_PAGE_SIZE));
    // ── Tenant messages ─────────────────────────────────────────────────────
    var _13 = trpc_1.trpc.multiTenancy.getTenantMessages.useQuery({ limit: 100, offset: 0 }), messagesData = _13.data, messagesLoading = _13.isLoading, refetchMessages = _13.refetch;
    var messages = (_u = (_t = messagesData) === null || _t === void 0 ? void 0 : _t.messages) !== null && _u !== void 0 ? _u : [];
    // ── Tenant Communications (full CRUD) ──────────────────────────────────
    var _14 = trpc_1.trpc.tenantCommunications.list.useQuery(), commsData = _14.data, commsLoading = _14.isLoading, refetchComms = _14.refetch;
    var comms = commsData !== null && commsData !== void 0 ? commsData : [];
    // ── Mutations ───────────────────────────────────────────────────────────
    var createOrgWithAdmin = trpc_1.trpc.multiTenancy.createOrganizationWithAdmin.useMutation({
        onSuccess: function () { sonner_1.toast.success("Organization created with super admin"); refetchList(); utils.multiTenancy.listTenantAdmins.invalidate(); setShowCreate(false); setForm(__assign({}, BLANK_FORM)); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var updateOrg = trpc_1.trpc.multiTenancy.updateOrganization.useMutation({
        onSuccess: function () { sonner_1.toast.success("Organization updated"); refetchList(); utils.multiTenancy.getOrganization.invalidate(); setShowEdit(false); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var deleteOrg = trpc_1.trpc.multiTenancy.deleteOrganization.useMutation({
        onSuccess: function () { sonner_1.toast.success("Organization deleted"); refetchList(); setToDelete(null); setSelectedOrgId(null); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var archiveOrg = trpc_1.trpc.multiTenancy.archiveOrganization.useMutation({
        onSuccess: function () { sonner_1.toast.success("Organization archived"); refetchList(); archivedQuery.refetch(); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var restoreOrg = trpc_1.trpc.multiTenancy.restoreOrganization.useMutation({
        onSuccess: function () { sonner_1.toast.success("Organization restored"); refetchList(); archivedQuery.refetch(); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var setFeature = trpc_1.trpc.multiTenancy.setOrgFeature.useMutation({
        onSuccess: function () { utils.multiTenancy.getOrgFeatures.invalidate(); utils.multiTenancy.listOrganizations.invalidate(); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var bulkSetFeatures = trpc_1.trpc.multiTenancy.bulkSetOrgFeatures.useMutation({
        onSuccess: function () { sonner_1.toast.success("Features saved"); utils.multiTenancy.getOrgFeatures.invalidate(); utils.multiTenancy.listOrganizations.invalidate(); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var assignUser = trpc_1.trpc.multiTenancy.assignUserToOrg.useMutation({
        onSuccess: function () { sonner_1.toast.success("User assigned"); utils.multiTenancy.getOrgUsers.invalidate(); utils.multiTenancy.listOrganizations.invalidate(); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var bulkSetTierFeatures = trpc_1.trpc.multiTenancy.bulkSetPricingTierFeatures.useMutation({
        onSuccess: function () { sonner_1.toast.success("Pricing tier features saved"); utils.multiTenancy.getAllPricingTierFeatures.invalidate(); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var seedTierFeatures = trpc_1.trpc.multiTenancy.seedDefaultTierFeatures.useMutation({
        onSuccess: function (data) { sonner_1.toast.success("Seeded " + data.seeded + " tier feature entries"); utils.multiTenancy.getAllPricingTierFeatures.invalidate(); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var applyTierToOrg = trpc_1.trpc.multiTenancy.applyTierToOrganization.useMutation({
        onSuccess: function () { sonner_1.toast.success("Tier features applied to organization"); utils.multiTenancy.getOrgFeatures.invalidate(); utils.multiTenancy.listOrganizations.invalidate(); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var sendMessage = trpc_1.trpc.multiTenancy.sendTenantMessage.useMutation({
        onSuccess: function () { sonner_1.toast.success("Message sent to tenant admins"); refetchMessages(); setMsgForm(__assign({}, BLANK_MESSAGE)); setShowCompose(false); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var createComm = trpc_1.trpc.tenantCommunications.create.useMutation({
        onSuccess: function () { sonner_1.toast.success("Communication created"); refetchComms(); setShowCompose(false); setMsgForm(__assign({}, BLANK_MESSAGE)); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var updateComm = trpc_1.trpc.tenantCommunications.update.useMutation({
        onSuccess: function () { sonner_1.toast.success("Communication updated"); refetchComms(); setShowEditComm(false); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var deleteComm = trpc_1.trpc.tenantCommunications["delete"].useMutation({
        onSuccess: function () { sonner_1.toast.success("Communication deleted"); refetchComms(); setCommToDelete(null); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var sendComm = trpc_1.trpc.tenantCommunications.send.useMutation({
        onSuccess: function () { sonner_1.toast.success("Communication sent"); refetchComms(); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var updateOrgAdmin = trpc_1.trpc.multiTenancy.updateOrganizationAdmin.useMutation({
        onSuccess: function () { sonner_1.toast.success("Organization admin updated"); utils.multiTenancy.getOrganization.invalidate(); utils.multiTenancy.listTenantAdmins.invalidate(); refetchList(); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    // ── UI state ────────────────────────────────────────────────────────────
    var _15 = react_1.useState(""), search = _15[0], setSearch = _15[1];
    var _16 = react_1.useState(false), showCreate = _16[0], setShowCreate = _16[1];
    var _17 = react_1.useState(false), showEdit = _17[0], setShowEdit = _17[1];
    var _18 = react_1.useState(null), toDelete = _18[0], setToDelete = _18[1];
    var _19 = react_1.useState(__assign({}, BLANK_FORM)), form = _19[0], setForm = _19[1];
    var _20 = react_1.useState(""), assignUserId = _20[0], setAssignUserId = _20[1];
    var _21 = react_1.useState("trial"), selectedTier = _21[0], setSelectedTier = _21[1];
    var _22 = react_1.useState(false), showCompose = _22[0], setShowCompose = _22[1];
    var _23 = react_1.useState(__assign({}, BLANK_MESSAGE)), msgForm = _23[0], setMsgForm = _23[1];
    var _24 = react_1.useState(null), expandedMsg = _24[0], setExpandedMsg = _24[1];
    var _25 = react_1.useState(""), adminSearch = _25[0], setAdminSearch = _25[1];
    var _26 = react_1.useState(false), showEditComm = _26[0], setShowEditComm = _26[1];
    var _27 = react_1.useState(null), editingComm = _27[0], setEditingComm = _27[1];
    var _28 = react_1.useState({ subject: "", message: "", type: "announcement", priority: "normal", status: "draft", recipientType: "all_tenants" }), editCommForm = _28[0], setEditCommForm = _28[1];
    var _29 = react_1.useState(null), commToDelete = _29[0], setCommToDelete = _29[1];
    var _30 = react_1.useState("all"), commStatusFilter = _30[0], setCommStatusFilter = _30[1];
    var _31 = react_1.useState(""), commSearch = _31[0], setCommSearch = _31[1];
    var _32 = react_1.useState("update"), editAdminMode = _32[0], setEditAdminMode = _32[1];
    var _33 = react_1.useState(""), editAdminName = _33[0], setEditAdminName = _33[1];
    var _34 = react_1.useState(""), editAdminEmail = _34[0], setEditAdminEmail = _34[1];
    var _35 = react_1.useState(""), editAdminPassword = _35[0], setEditAdminPassword = _35[1];
    var _36 = react_1.useState(""), editAssignUserId = _36[0], setEditAssignUserId = _36[1];
    // populate edit form when org detail loads
    react_1.useEffect(function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
        if (showEdit && ((_a = orgDetail) === null || _a === void 0 ? void 0 : _a.organization)) {
            var o = orgDetail.organization;
            setForm({
                name: (_b = o.name) !== null && _b !== void 0 ? _b : "", slug: (_c = o.slug) !== null && _c !== void 0 ? _c : "", plan: (_d = o.plan) !== null && _d !== void 0 ? _d : "trial",
                maxUsers: (_e = o.maxUsers) !== null && _e !== void 0 ? _e : 10, contactEmail: (_f = o.contactEmail) !== null && _f !== void 0 ? _f : "",
                contactPhone: (_g = o.contactPhone) !== null && _g !== void 0 ? _g : "", domain: (_h = o.domain) !== null && _h !== void 0 ? _h : "",
                country: (_j = o.country) !== null && _j !== void 0 ? _j : "", address: (_k = o.address) !== null && _k !== void 0 ? _k : "",
                industry: (_l = o.industry) !== null && _l !== void 0 ? _l : "", website: (_m = o.website) !== null && _m !== void 0 ? _m : "",
                taxId: (_o = o.taxId) !== null && _o !== void 0 ? _o : "", billingEmail: (_p = o.billingEmail) !== null && _p !== void 0 ? _p : "",
                timezone: (_q = o.timezone) !== null && _q !== void 0 ? _q : "Africa/Nairobi", currency: (_r = o.currency) !== null && _r !== void 0 ? _r : "KES",
                description: (_s = o.description) !== null && _s !== void 0 ? _s : "", employeeCount: (_t = o.employeeCount) !== null && _t !== void 0 ? _t : "",
                registrationNumber: (_u = o.registrationNumber) !== null && _u !== void 0 ? _u : "", paymentMethod: (_v = o.paymentMethod) !== null && _v !== void 0 ? _v : "",
                adminMode: "create", adminName: "", adminEmail: "", adminPassword: "", existingUserId: ""
            });
            var users = ((_w = orgDetail) === null || _w === void 0 ? void 0 : _w.users) || [];
            var superAdmin = users.find(function (u) { return u.role === "super_admin"; });
            if (superAdmin) {
                setEditAdminMode("update");
                setEditAdminName(superAdmin.name || "");
                setEditAdminEmail(superAdmin.email || "");
            }
            else {
                setEditAdminMode("create");
                setEditAdminName("");
                setEditAdminEmail("");
            }
            setEditAdminPassword("");
            setEditAssignUserId("");
        }
    }, [showEdit, orgDetail]);
    // ── Derived ─────────────────────────────────────────────────────────────
    var filtered = orgs.filter(function (o) {
        return !search || o.name.toLowerCase().includes(search.toLowerCase()) || o.slug.includes(search.toLowerCase());
    });
    var totalUsers = orgs.reduce(function (s, o) { var _a; return s + ((_a = o.userCount) !== null && _a !== void 0 ? _a : 0); }, 0);
    var activeCount = orgs.filter(function (o) { return o.isActive; }).length;
    var moduleListData = trpc_1.trpc.multiTenancy.getModuleList.useQuery().data;
    var modules = (_w = (_v = moduleListData) === null || _v === void 0 ? void 0 : _v.modules) !== null && _w !== void 0 ? _w : [];
    var planOptions = react_1.useMemo(function () {
        var keys = Object.keys(apiPrices);
        return keys.length > 0 ? keys : __spreadArrays(DEFAULT_PLAN_OPTIONS);
    }, [apiPrices]);
    var tierDescriptions = react_1.useMemo(function () {
        var desc = {};
        for (var _i = 0, planOptions_1 = planOptions; _i < planOptions_1.length; _i++) {
            var key = planOptions_1[_i];
            var p = apiPrices[key];
            var users = (p === null || p === void 0 ? void 0 : p.maxUsers) ? "Up to " + p.maxUsers + " users." : "Flexible user limits.";
            desc[key] = (p === null || p === void 0 ? void 0 : p.description) ? "" + p.description + (p.description.endsWith(".") ? "" : ".") + " " + users
                : formatPlanName(key, apiPrices) + " plan feature configuration.";
        }
        return desc;
    }, [planOptions, apiPrices]);
    react_1.useEffect(function () {
        if (planOptions.length > 0 && !planOptions.includes(selectedTier)) {
            setSelectedTier(planOptions[0]);
        }
    }, [planOptions, selectedTier]);
    var currentTierFeatures = (_x = tierMap[selectedTier]) !== null && _x !== void 0 ? _x : {};
    var filteredAdmins = react_1.useMemo(function () {
        if (!adminSearch)
            return tenantAdmins;
        var s = adminSearch.toLowerCase();
        return tenantAdmins.filter(function (a) { var _a, _b, _c; return ((_a = a.name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(s)) || ((_b = a.email) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(s)) || ((_c = a.organizationName) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(s)); });
    }, [tenantAdmins, adminSearch]);
    // ── Form helpers ────────────────────────────────────────────────────────
    function handleCreateSubmit() {
        createOrgWithAdmin.mutate({
            name: form.name, slug: form.slug, plan: form.plan,
            maxUsers: Number(form.maxUsers) || undefined,
            contactEmail: form.contactEmail || undefined,
            contactPhone: form.contactPhone || undefined,
            domain: form.domain || undefined,
            country: form.country || undefined,
            address: form.address || undefined,
            industry: form.industry || undefined,
            website: form.website || undefined,
            taxId: form.taxId || undefined,
            billingEmail: form.billingEmail || undefined,
            timezone: form.timezone || undefined,
            currency: form.currency || undefined,
            description: form.description || undefined,
            employeeCount: form.employeeCount ? Number(form.employeeCount) : undefined,
            registrationNumber: form.registrationNumber || undefined,
            paymentMethod: form.paymentMethod || undefined,
            adminMode: form.adminMode,
            adminName: form.adminMode === "create" ? form.adminName || undefined : undefined,
            adminEmail: form.adminMode === "create" ? form.adminEmail || undefined : undefined,
            adminPassword: form.adminMode === "create" ? form.adminPassword || undefined : undefined,
            existingUserId: form.adminMode === "assign" ? form.existingUserId || undefined : undefined
        });
    }
    function handleEditSubmit() {
        var _a;
        if (!selectedOrgId)
            return;
        updateOrg.mutate({
            id: selectedOrgId, name: form.name, plan: form.plan,
            maxUsers: Number(form.maxUsers) || undefined,
            contactEmail: form.contactEmail || undefined,
            contactPhone: form.contactPhone || undefined,
            domain: form.domain || undefined,
            country: form.country || undefined,
            address: form.address || undefined,
            industry: form.industry || undefined,
            website: form.website || undefined,
            taxId: form.taxId || undefined,
            billingEmail: form.billingEmail || undefined,
            timezone: form.timezone || undefined,
            currency: form.currency || undefined,
            description: form.description || undefined,
            employeeCount: form.employeeCount ? Number(form.employeeCount) : undefined,
            registrationNumber: form.registrationNumber || undefined,
            paymentMethod: form.paymentMethod || undefined
        });
        var users = ((_a = orgDetail) === null || _a === void 0 ? void 0 : _a.users) || [];
        var superAdmin = users.find(function (u) { return u.role === "super_admin"; });
        if (editAdminMode === "update" && superAdmin) {
            var hasChanges = (editAdminName && editAdminName !== superAdmin.name) ||
                (editAdminEmail && editAdminEmail !== superAdmin.email) ||
                editAdminPassword;
            if (hasChanges) {
                updateOrgAdmin.mutate({
                    organizationId: selectedOrgId, mode: "update",
                    adminUserId: superAdmin.id,
                    adminName: editAdminName || undefined,
                    adminEmail: editAdminEmail || undefined,
                    adminPassword: editAdminPassword || undefined
                });
            }
        }
        else if (editAdminMode === "create" && editAdminName && editAdminEmail && editAdminPassword) {
            updateOrgAdmin.mutate({
                organizationId: selectedOrgId, mode: "create",
                adminName: editAdminName, adminEmail: editAdminEmail, adminPassword: editAdminPassword
            });
        }
        else if (editAdminMode === "assign" && editAssignUserId) {
            updateOrgAdmin.mutate({
                organizationId: selectedOrgId, mode: "assign",
                existingUserId: editAssignUserId
            });
        }
    }
    function handleToggleFeature(key, current) {
        if (!selectedOrgId)
            return;
        setFeature.mutate({ organizationId: selectedOrgId, featureKey: key, isEnabled: !current });
    }
    function handleEnableAll(enable) {
        if (!selectedOrgId)
            return;
        var all = {};
        modules.forEach(function (m) { all[m.key] = enable; });
        bulkSetFeatures.mutate({ organizationId: selectedOrgId, features: all });
    }
    function handleAssignUser() {
        if (!assignUserId || !selectedOrgId)
            return;
        assignUser.mutate({ userId: assignUserId, organizationId: selectedOrgId });
        setAssignUserId("");
    }
    function handleRemoveUser(userId) {
        assignUser.mutate({ userId: userId, organizationId: null });
    }
    function handleSaveTierFeatures(features) {
        var coerced = Object.fromEntries(Object.entries(features).map(function (_a) {
            var k = _a[0], v = _a[1];
            return [k, Boolean(v)];
        }));
        bulkSetTierFeatures.mutate({ tier: selectedTier, features: coerced });
    }
    function handleApplyTier(orgId, tier) {
        applyTierToOrg.mutate({ organizationId: orgId, tier: tier });
    }
    function handleSendMessage() {
        sendMessage.mutate({
            subject: msgForm.subject, content: msgForm.content,
            priority: msgForm.priority, targetType: msgForm.targetType,
            targetOrgId: msgForm.targetOrgId || undefined,
            targetUserId: msgForm.targetUserId || undefined
        });
    }
    var createFormValid = form.name && form.slug &&
        (form.adminMode === "create"
            ? form.adminName && form.adminEmail && form.adminPassword && form.adminPassword.length >= 8
            : form.existingUserId);
    // ─────────────────────────────────────────────────────────────────────────
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Multi-Tenancy Management", description: "Manage organizations, pricing, admins, and communications" },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement(tabs_1.Tabs, { value: mainTab, onValueChange: setMainTab },
                react_1["default"].createElement(tabs_1.TabsList, { className: "flex flex-wrap h-auto gap-1 p-1 w-full" },
                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "organizations", className: "gap-1.5 flex-1 min-w-[120px]" },
                        react_1["default"].createElement(lucide_react_1.Building2, { className: "h-4 w-4" }),
                        " Organizations"),
                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "archived", className: "gap-1.5 flex-1 min-w-[100px]" },
                        react_1["default"].createElement(lucide_react_1.Archive, { className: "h-4 w-4" }),
                        " Archived",
                        archivedOrgs.length > 0 && react_1["default"].createElement(badge_1.Badge, { variant: "secondary", className: "ml-1 text-xs" }, archivedOrgs.length)),
                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "pricing", className: "gap-1.5 flex-1 min-w-[110px]" },
                        react_1["default"].createElement(lucide_react_1.CreditCard, { className: "h-4 w-4" }),
                        " Pricing Tiers"),
                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "admins", className: "gap-1.5 flex-1 min-w-[110px]" },
                        react_1["default"].createElement(lucide_react_1.Shield, { className: "h-4 w-4" }),
                        " Tenant Admins"),
                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "tenant-users", className: "gap-1.5 flex-1 min-w-[110px]" },
                        react_1["default"].createElement(lucide_react_1.Users, { className: "h-4 w-4" }),
                        " Tenant Users"),
                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "comms", className: "gap-1.5 flex-1 min-w-[120px]" },
                        react_1["default"].createElement(lucide_react_1.MessageSquare, { className: "h-4 w-4" }),
                        " Communications")),
                react_1["default"].createElement(tabs_1.TabsContent, { value: "organizations", className: "mt-6 space-y-6" },
                    react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-4 sm:grid-cols-4" }, [
                        { label: "Total Organizations", value: orgs.length, icon: react_1["default"].createElement(lucide_react_1.Building2, { className: "h-5 w-5 text-muted-foreground" }) },
                        { label: "Active", value: activeCount, icon: react_1["default"].createElement(lucide_react_1.CheckCircle2, { className: "h-5 w-5 text-green-500" }) },
                        { label: "Total Users", value: totalUsers, icon: react_1["default"].createElement(lucide_react_1.Users, { className: "h-5 w-5 text-blue-500" }) },
                        { label: "Modules Available", value: modules.length, icon: react_1["default"].createElement(lucide_react_1.LayoutGrid, { className: "h-5 w-5 text-violet-500" }) },
                    ].map(function (s) { return (react_1["default"].createElement(card_1.Card, { key: s.label },
                        react_1["default"].createElement(card_1.CardContent, { className: "flex items-center gap-3 pt-5" },
                            s.icon,
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("p", { className: "text-2xl font-bold" }, listLoading ? "\u2026" : s.value),
                                react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" }, s.label))))); })),
                    react_1["default"].createElement("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" },
                        react_1["default"].createElement("div", { className: "relative w-full sm:w-64" },
                            react_1["default"].createElement(lucide_react_1.Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
                            react_1["default"].createElement(input_1.Input, { className: "pl-9", placeholder: "Search organizations\\u2026", value: search, onChange: function (e) { return setSearch(e.target.value); } })),
                        react_1["default"].createElement("div", { className: "flex gap-2" },
                            react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return refetchList(); } },
                                react_1["default"].createElement(lucide_react_1.RefreshCw, { className: "mr-1.5 h-4 w-4" }),
                                " Refresh"),
                            react_1["default"].createElement(button_1.Button, { size: "sm", onClick: function () { setForm(__assign({}, BLANK_FORM)); setShowCreate(true); } },
                                react_1["default"].createElement(lucide_react_1.Plus, { className: "mr-1.5 h-4 w-4" }),
                                " New Organization"))),
                    listLoading ? (react_1["default"].createElement("div", { className: "flex items-center justify-center py-20" },
                        react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-muted-foreground" }))) : filtered.length === 0 ? (react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardContent, { className: "flex flex-col items-center gap-3 py-16 text-center text-muted-foreground" },
                            react_1["default"].createElement(lucide_react_1.Building2, { className: "h-12 w-12 opacity-30" }),
                            react_1["default"].createElement("p", { className: "text-sm" }, search ? "No organizations match your search." : "No organizations yet. Create one to get started.")))) : (react_1["default"].createElement("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3" }, filtered.map(function (org) {
                        var _a, _b;
                        return (react_1["default"].createElement(card_1.Card, { key: org.id, className: "cursor-pointer transition-shadow hover:shadow-md " + (selectedOrgId === org.id ? "ring-2 ring-primary" : ""), onClick: function () { return setSelectedOrgId(org.id === selectedOrgId ? null : org.id); } },
                            react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                                react_1["default"].createElement("div", { className: "flex items-start justify-between gap-2" },
                                    react_1["default"].createElement("div", { className: "flex-1 min-w-0" },
                                        react_1["default"].createElement(card_1.CardTitle, { className: "truncate text-base" }, org.name),
                                        react_1["default"].createElement(card_1.CardDescription, { className: "truncate text-xs" }, org.slug)),
                                    org.isActive
                                        ? react_1["default"].createElement(lucide_react_1.CheckCircle2, { className: "h-4 w-4 text-green-500 shrink-0" })
                                        : react_1["default"].createElement(lucide_react_1.XCircle, { className: "h-4 w-4 text-red-400 shrink-0" }))),
                            react_1["default"].createElement(card_1.CardContent, { className: "space-y-3" },
                                react_1["default"].createElement("div", { className: "flex flex-wrap items-center gap-2" },
                                    planBadge(org.plan),
                                    react_1["default"].createElement("span", { className: "text-xs text-muted-foreground" }, (_a = org.userCount) !== null && _a !== void 0 ? _a : 0,
                                        " users"),
                                    react_1["default"].createElement("span", { className: "text-xs text-muted-foreground" }, (_b = org.featureCount) !== null && _b !== void 0 ? _b : 0,
                                        " features")),
                                org.contactEmail && react_1["default"].createElement("p", { className: "truncate text-xs text-muted-foreground" }, org.contactEmail),
                                react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" },
                                    "Created ",
                                    fmt(org.createdAt)),
                                react_1["default"].createElement("div", { className: "flex gap-2 pt-1" },
                                    react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "flex-1 text-xs", onClick: function (e) { e.stopPropagation(); setSelectedOrgId(org.id); setShowEdit(true); } },
                                        react_1["default"].createElement(lucide_react_1.Pencil, { className: "mr-1 h-3 w-3" }),
                                        " Edit"),
                                    react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "text-xs", onClick: function (e) { e.stopPropagation(); handleApplyTier(org.id, org.plan); }, disabled: applyTierToOrg.isPending },
                                        react_1["default"].createElement(lucide_react_1.CreditCard, { className: "mr-1 h-3 w-3" }),
                                        " Apply Tier"),
                                    react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "text-xs text-amber-600 hover:bg-amber-50", onClick: function (e) { e.stopPropagation(); archiveOrg.mutate({ id: org.id }); }, disabled: archiveOrg.isPending },
                                        react_1["default"].createElement(lucide_react_1.Archive, { className: "h-3 w-3" })),
                                    react_1["default"].createElement(button_1.Button, { size: "sm", variant: "destructive", className: "text-xs", onClick: function (e) { e.stopPropagation(); setToDelete(org); } },
                                        react_1["default"].createElement(lucide_react_1.Trash2, { className: "h-3 w-3" }))))));
                    }))),
                    selectedOrgId && (react_1["default"].createElement(card_1.Card, { className: "mt-2" },
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                react_1["default"].createElement(lucide_react_1.Building2, { className: "h-5 w-5" }),
                                " ",
                                detailLoading ? "Loading\u2026" : (_z = (_y = orgDetail) === null || _y === void 0 ? void 0 : _y.organization) === null || _z === void 0 ? void 0 : _z.name),
                            react_1["default"].createElement(card_1.CardDescription, null, "Manage features, members, and details for this organization")),
                        react_1["default"].createElement(card_1.CardContent, null, detailLoading ? (react_1["default"].createElement("div", { className: "flex items-center justify-center py-12" },
                            react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }))) : (react_1["default"].createElement(tabs_1.Tabs, { defaultValue: "features" },
                            react_1["default"].createElement(tabs_1.TabsList, null,
                                react_1["default"].createElement(tabs_1.TabsTrigger, { value: "features" }, "Module Access"),
                                react_1["default"].createElement(tabs_1.TabsTrigger, { value: "members" }, "Members"),
                                react_1["default"].createElement(tabs_1.TabsTrigger, { value: "branding" }, "Branding"),
                                react_1["default"].createElement(tabs_1.TabsTrigger, { value: "info" }, "Details")),
                            react_1["default"].createElement(tabs_1.TabsContent, { value: "features", className: "mt-4" },
                                react_1["default"].createElement("div", { className: "mb-3 flex items-center justify-between" },
                                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Toggle which modules are available."),
                                    react_1["default"].createElement("div", { className: "flex gap-2" },
                                        react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { return handleEnableAll(true); }, disabled: bulkSetFeatures.isPending }, "Enable All"),
                                        react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { return handleEnableAll(false); }, disabled: bulkSetFeatures.isPending }, "Disable All"))),
                                featuresLoading ? (react_1["default"].createElement("div", { className: "flex justify-center py-8" },
                                    react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-5 w-5 animate-spin" }))) : (react_1["default"].createElement("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3" }, modules.map(function (mod) {
                                    var enabled = featureMap[mod.key] !== false;
                                    return (react_1["default"].createElement("div", { key: mod.key, className: "flex items-start gap-3 rounded-lg border p-3 transition-colors " + (enabled ? "bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-800" : "opacity-60") },
                                        react_1["default"].createElement("button", { type: "button", onClick: function () { return handleToggleFeature(mod.key, enabled); }, disabled: setFeature.isPending, className: "mt-0.5 shrink-0" }, enabled ? react_1["default"].createElement(lucide_react_1.ToggleRight, { className: "h-5 w-5 text-green-600" }) : react_1["default"].createElement(lucide_react_1.ToggleLeft, { className: "h-5 w-5 text-muted-foreground" })),
                                        react_1["default"].createElement("div", { className: "min-w-0" },
                                            react_1["default"].createElement("p", { className: "text-sm font-medium leading-tight" }, mod.label),
                                            react_1["default"].createElement("p", { className: "mt-0.5 text-xs text-muted-foreground leading-snug" }, mod.description))));
                                })))),
                            react_1["default"].createElement(tabs_1.TabsContent, { value: "members", className: "mt-4 space-y-4" },
                                react_1["default"].createElement("div", { className: "flex gap-2" },
                                    react_1["default"].createElement(select_1.Select, { value: assignUserId, onValueChange: setAssignUserId },
                                        react_1["default"].createElement(select_1.SelectTrigger, { className: "flex-1" },
                                            react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select user to assign\\u2026" })),
                                        react_1["default"].createElement(select_1.SelectContent, null, allUsers.filter(function (u) { return u.organizationId !== selectedOrgId; }).map(function (u) { return (react_1["default"].createElement(select_1.SelectItem, { key: u.id, value: u.id },
                                            u.name,
                                            " (",
                                            u.email,
                                            ")")); }))),
                                    react_1["default"].createElement(button_1.Button, { onClick: handleAssignUser, disabled: !assignUserId || assignUser.isPending },
                                        react_1["default"].createElement(lucide_react_1.UserPlus, { className: "mr-1.5 h-4 w-4" }),
                                        " Assign")),
                                orgUsers.length === 0 ? (react_1["default"].createElement("p", { className: "py-6 text-center text-sm text-muted-foreground" }, "No users assigned.")) : (react_1["default"].createElement("div", { className: "divide-y rounded-lg border" }, orgUsers.map(function (u) { return (react_1["default"].createElement("div", { key: u.id, className: "flex items-center gap-3 px-4 py-3" },
                                    react_1["default"].createElement("div", { className: "flex-1 min-w-0" },
                                        react_1["default"].createElement("p", { className: "truncate text-sm font-medium" }, u.name),
                                        react_1["default"].createElement("p", { className: "truncate text-xs text-muted-foreground" }, u.email)),
                                    react_1["default"].createElement(badge_1.Badge, { variant: "secondary", className: "shrink-0 capitalize text-xs" }, u.role),
                                    u.role === "super_admin" && react_1["default"].createElement(lucide_react_1.Crown, { className: "h-4 w-4 text-yellow-500 shrink-0" }),
                                    react_1["default"].createElement(button_1.Button, { size: "sm", variant: "ghost", className: "shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50", onClick: function () { return handleRemoveUser(u.id); }, disabled: assignUser.isPending },
                                        react_1["default"].createElement(lucide_react_1.XCircle, { className: "h-4 w-4" })))); })))),
                            react_1["default"].createElement(tabs_1.TabsContent, { value: "info", className: "mt-4" }, ((_0 = orgDetail) === null || _0 === void 0 ? void 0 : _0.organization) && (function () {
                                var o = orgDetail.organization;
                                return (react_1["default"].createElement("dl", { className: "grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2" },
                                    [
                                        ["ID", o.id], ["Slug", o.slug], ["Plan", planBadge(o.plan)],
                                        ["Max Users", o.maxUsers === -1 ? "Unlimited" : o.maxUsers],
                                        ["Status", o.isActive ? "Active" : "Inactive"],
                                        ["Contact Email", o.contactEmail || "\u2014"],
                                        ["Contact Phone", o.contactPhone || "\u2014"],
                                        ["Domain", o.domain || "\u2014"],
                                        ["Country", o.country || "\u2014"],
                                        ["Created", fmt(o.createdAt)],
                                        ["Last Updated", fmt(o.updatedAt)],
                                    ].map(function (_a) {
                                        var k = _a[0], v = _a[1];
                                        return (react_1["default"].createElement("div", { key: k, className: "flex flex-col gap-0.5" },
                                            react_1["default"].createElement("dt", { className: "text-xs text-muted-foreground" }, k),
                                            react_1["default"].createElement("dd", { className: "font-medium" }, v)));
                                    }),
                                    o.address && (react_1["default"].createElement("div", { className: "sm:col-span-2 flex flex-col gap-0.5" },
                                        react_1["default"].createElement("dt", { className: "text-xs text-muted-foreground" }, "Address"),
                                        react_1["default"].createElement("dd", { className: "font-medium" }, o.address)))));
                            })()),
                            react_1["default"].createElement(tabs_1.TabsContent, { value: "branding", className: "mt-4 space-y-4" },
                                react_1["default"].createElement(BrandingPanel, { orgId: selectedOrgId })))))))),
                react_1["default"].createElement(tabs_1.TabsContent, { value: "archived", className: "mt-6 space-y-6" },
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                react_1["default"].createElement(lucide_react_1.Archive, { className: "h-5 w-5" }),
                                " Archived Organizations"),
                            react_1["default"].createElement(card_1.CardDescription, null, "Archived organizations are inactive and hidden from normal views. You can restore them at any time.")),
                        react_1["default"].createElement(card_1.CardContent, null, archivedQuery.isLoading ? (react_1["default"].createElement("div", { className: "flex items-center justify-center py-12" },
                            react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }))) : archivedOrgs.length === 0 ? (react_1["default"].createElement("div", { className: "text-center py-12 text-muted-foreground" },
                            react_1["default"].createElement(lucide_react_1.Archive, { className: "h-10 w-10 mx-auto mb-3 opacity-40" }),
                            react_1["default"].createElement("p", { className: "font-medium" }, "No archived organizations"),
                            react_1["default"].createElement("p", { className: "text-sm" }, "Archived organizations will appear here"))) : (react_1["default"].createElement("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" }, archivedOrgs.map(function (org) {
                            var _a;
                            return (react_1["default"].createElement(card_1.Card, { key: org.id, className: "border-dashed opacity-80 hover:opacity-100 transition-opacity" },
                                react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                                    react_1["default"].createElement("div", { className: "flex items-start justify-between gap-2" },
                                        react_1["default"].createElement("div", { className: "flex-1 min-w-0" },
                                            react_1["default"].createElement(card_1.CardTitle, { className: "truncate text-base" }, org.name),
                                            react_1["default"].createElement(card_1.CardDescription, { className: "truncate text-xs" }, org.slug)),
                                        react_1["default"].createElement(badge_1.Badge, { variant: "secondary", className: "text-xs" }, "Archived"))),
                                react_1["default"].createElement(card_1.CardContent, { className: "space-y-3" },
                                    react_1["default"].createElement("div", { className: "flex flex-wrap items-center gap-2" },
                                        planBadge(org.plan),
                                        react_1["default"].createElement("span", { className: "text-xs text-muted-foreground" }, (_a = org.userCount) !== null && _a !== void 0 ? _a : 0,
                                            " users")),
                                    org.archivedAt && react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" },
                                        "Archived ",
                                        new Date(org.archivedAt).toLocaleDateString()),
                                    react_1["default"].createElement("div", { className: "flex gap-2 pt-1" },
                                        react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "flex-1 text-xs text-emerald-600 hover:bg-emerald-50", onClick: function () { return restoreOrg.mutate({ id: org.id }); }, disabled: restoreOrg.isPending },
                                            react_1["default"].createElement(lucide_react_1.RotateCcw, { className: "mr-1 h-3 w-3" }),
                                            " Restore"),
                                        react_1["default"].createElement(button_1.Button, { size: "sm", variant: "destructive", className: "text-xs", onClick: function () { return setToDelete(org); } },
                                            react_1["default"].createElement(lucide_react_1.Trash2, { className: "h-3 w-3 mr-1" }),
                                            " Delete")))));
                        })))))),
                react_1["default"].createElement(tabs_1.TabsContent, { value: "pricing", className: "mt-6 space-y-6" },
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                react_1["default"].createElement(lucide_react_1.CreditCard, { className: "h-5 w-5" }),
                                " Pricing Tier Feature Configuration"),
                            react_1["default"].createElement(card_1.CardDescription, null, "Define which modules are included in each pricing tier. Tier features are auto-applied when creating organizations.")),
                        react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                            react_1["default"].createElement("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" },
                                react_1["default"].createElement("div", { className: "flex items-center gap-3" },
                                    react_1["default"].createElement(label_1.Label, { className: "text-sm font-medium" }, "Select Tier:"),
                                    react_1["default"].createElement("div", { className: "flex gap-1" }, planOptions.map(function (tier) { return (react_1["default"].createElement(button_1.Button, { key: tier, size: "sm", variant: selectedTier === tier ? "default" : "outline", className: "capitalize", onClick: function () { return setSelectedTier(tier); } }, formatPlanName(tier, apiPrices))); }))),
                                react_1["default"].createElement("div", { className: "flex gap-2" },
                                    react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", disabled: bulkSetTierFeatures.isPending, onClick: function () { var all = {}; modules.forEach(function (m) { all[m.key] = true; }); handleSaveTierFeatures(all); } }, "Enable All"),
                                    react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", disabled: bulkSetTierFeatures.isPending, onClick: function () { var all = {}; modules.forEach(function (m) { all[m.key] = false; }); handleSaveTierFeatures(all); } }, "Disable All"),
                                    react_1["default"].createElement(button_1.Button, { size: "sm", variant: "secondary", disabled: seedTierFeatures.isPending, onClick: function () { return seedTierFeatures.mutate(); } },
                                        seedTierFeatures.isPending ? react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-1.5 h-3.5 w-3.5 animate-spin" }) : null,
                                        "Seed Defaults"))),
                            react_1["default"].createElement("div", { className: "rounded-lg border bg-muted/30 p-3" },
                                react_1["default"].createElement("p", { className: "text-sm" }, tierDescriptions[selectedTier])),
                            tiersLoading ? (react_1["default"].createElement("div", { className: "flex justify-center py-8" },
                                react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-5 w-5 animate-spin" }))) : (react_1["default"].createElement("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3" }, modules.map(function (mod) {
                                var _a;
                                var enabled = (_a = currentTierFeatures[mod.key]) !== null && _a !== void 0 ? _a : false;
                                return (react_1["default"].createElement("div", { key: mod.key, className: "flex items-start gap-3 rounded-lg border p-3 transition-colors " + (enabled ? "bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-800" : "opacity-60") },
                                    react_1["default"].createElement("button", { type: "button", disabled: bulkSetTierFeatures.isPending, className: "mt-0.5 shrink-0", onClick: function () {
                                            var _a;
                                            var updated = __assign(__assign({}, currentTierFeatures), (_a = {}, _a[mod.key] = !enabled, _a));
                                            handleSaveTierFeatures(updated);
                                        } }, enabled ? react_1["default"].createElement(lucide_react_1.ToggleRight, { className: "h-5 w-5 text-green-600" }) : react_1["default"].createElement(lucide_react_1.ToggleLeft, { className: "h-5 w-5 text-muted-foreground" })),
                                    react_1["default"].createElement("div", { className: "min-w-0" },
                                        react_1["default"].createElement("p", { className: "text-sm font-medium leading-tight" }, mod.label),
                                        react_1["default"].createElement("p", { className: "mt-0.5 text-xs text-muted-foreground leading-snug" }, mod.description))));
                            }))),
                            react_1["default"].createElement("div", { className: "mt-6" },
                                react_1["default"].createElement("h3", { className: "mb-3 text-sm font-semibold" }, "Tier Comparison"),
                                react_1["default"].createElement("div", { className: "overflow-x-auto rounded-lg border" },
                                    react_1["default"].createElement(table_1.Table, { className: "w-full text-sm" },
                                        react_1["default"].createElement(table_1.TableHeader, { className: "bg-muted/50" },
                                            react_1["default"].createElement(table_1.TableRow, null,
                                                react_1["default"].createElement(table_1.TableHead, { className: "px-3 py-2 text-left font-medium" }, "Module"),
                                                planOptions.map(function (t) { return react_1["default"].createElement(table_1.TableHead, { key: t, className: "px-3 py-2 text-center font-medium" }, formatPlanName(t, apiPrices)); }))),
                                        react_1["default"].createElement(table_1.TableBody, { className: "divide-y" }, modules.map(function (mod) { return (react_1["default"].createElement(table_1.TableRow, { key: mod.key, className: "hover:bg-muted/30" },
                                            react_1["default"].createElement(table_1.TableCell, { className: "px-3 py-2 font-medium" }, mod.label),
                                            planOptions.map(function (t) {
                                                var _a;
                                                return (react_1["default"].createElement(table_1.TableCell, { key: t, className: "px-3 py-2 text-center" }, ((_a = tierMap[t]) === null || _a === void 0 ? void 0 : _a[mod.key]) ? react_1["default"].createElement(lucide_react_1.CheckCircle2, { className: "mx-auto h-4 w-4 text-green-500" }) : react_1["default"].createElement(lucide_react_1.XCircle, { className: "mx-auto h-4 w-4 text-gray-300" })));
                                            }))); })),
                                        react_1["default"].createElement(table_1.TableFooter, { className: "bg-muted/30" },
                                            react_1["default"].createElement(table_1.TableRow, null,
                                                react_1["default"].createElement(table_1.TableCell, { className: "px-3 py-2 font-semibold" }, "Total Features"),
                                                planOptions.map(function (t) {
                                                    var _a;
                                                    return (react_1["default"].createElement(table_1.TableCell, { key: t, className: "px-3 py-2 text-center font-semibold" }, Object.values((_a = tierMap[t]) !== null && _a !== void 0 ? _a : {}).filter(Boolean).length));
                                                }))))))))),
                react_1["default"].createElement(tabs_1.TabsContent, { value: "admins", className: "mt-6 space-y-6" },
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                react_1["default"].createElement(lucide_react_1.Shield, { className: "h-5 w-5" }),
                                " Tenant Super Admins"),
                            react_1["default"].createElement(card_1.CardDescription, null, "All organization super administrators in one place for easy accessibility, communication & updates.")),
                        react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                            react_1["default"].createElement("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" },
                                react_1["default"].createElement("div", { className: "relative w-full sm:w-64" },
                                    react_1["default"].createElement(lucide_react_1.Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
                                    react_1["default"].createElement(input_1.Input, { className: "pl-9", placeholder: "Search admins\\u2026", value: adminSearch, onChange: function (e) { return setAdminSearch(e.target.value); } })),
                                react_1["default"].createElement(badge_1.Badge, { variant: "secondary", className: "w-fit" },
                                    tenantAdmins.length,
                                    " admin",
                                    tenantAdmins.length !== 1 ? "s" : "",
                                    " total")),
                            adminsLoading ? (react_1["default"].createElement("div", { className: "flex justify-center py-8" },
                                react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-5 w-5 animate-spin" }))) : filteredAdmins.length === 0 ? (react_1["default"].createElement("div", { className: "flex flex-col items-center gap-2 py-12 text-center text-muted-foreground" },
                                react_1["default"].createElement(lucide_react_1.Shield, { className: "h-10 w-10 opacity-30" }),
                                react_1["default"].createElement("p", { className: "text-sm" }, adminSearch ? "No admins match your search." : "No tenant admins found."))) : (react_1["default"].createElement("div", { className: "divide-y rounded-lg border" }, filteredAdmins.map(function (admin) {
                                var _a, _b, _c;
                                return (react_1["default"].createElement("div", { key: admin.id, className: "flex items-center gap-4 px-4 py-3 hover:bg-muted/30" },
                                    react_1["default"].createElement("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0" }, (_c = (_b = (_a = admin.name) === null || _a === void 0 ? void 0 : _a.charAt(0)) === null || _b === void 0 ? void 0 : _b.toUpperCase()) !== null && _c !== void 0 ? _c : "?"),
                                    react_1["default"].createElement("div", { className: "flex-1 min-w-0" },
                                        react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                                            react_1["default"].createElement("p", { className: "truncate text-sm font-medium" }, admin.name),
                                            react_1["default"].createElement(lucide_react_1.Crown, { className: "h-3.5 w-3.5 text-yellow-500 shrink-0" })),
                                        react_1["default"].createElement("p", { className: "truncate text-xs text-muted-foreground" }, admin.email)),
                                    react_1["default"].createElement("div", { className: "text-right shrink-0" },
                                        react_1["default"].createElement("p", { className: "text-sm font-medium" }, admin.organizationName),
                                        react_1["default"].createElement("div", { className: "flex items-center gap-1.5 justify-end" },
                                            react_1["default"].createElement("span", { className: "text-xs text-muted-foreground" }, admin.organizationSlug),
                                            planBadge(admin.organizationPlan))),
                                    react_1["default"].createElement("div", { className: "shrink-0" }, admin.isActive
                                        ? react_1["default"].createElement(badge_1.Badge, { className: "bg-green-100 text-green-800 text-xs" }, "Active")
                                        : react_1["default"].createElement(badge_1.Badge, { variant: "secondary", className: "text-xs" }, "Inactive")),
                                    react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "shrink-0", onClick: function () {
                                            setMsgForm(__assign(__assign({}, BLANK_MESSAGE), { targetType: "specific_user", targetUserId: admin.id, subject: "Message to " + admin.name }));
                                            setShowCompose(true);
                                        } },
                                        react_1["default"].createElement(lucide_react_1.Mail, { className: "h-3.5 w-3.5" }))));
                            })))))),
                react_1["default"].createElement(tabs_1.TabsContent, { value: "tenant-users", className: "mt-6 space-y-6" },
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                react_1["default"].createElement(lucide_react_1.Users, { className: "h-5 w-5" }),
                                " Tenant Users"),
                            react_1["default"].createElement(card_1.CardDescription, null, "All users across all organizations. Filter by organization or search by name/email.")),
                        react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                            react_1["default"].createElement("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" },
                                react_1["default"].createElement("div", { className: "flex flex-1 gap-2" },
                                    react_1["default"].createElement("div", { className: "relative w-full sm:w-64" },
                                        react_1["default"].createElement(lucide_react_1.Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
                                        react_1["default"].createElement(input_1.Input, { className: "pl-9", placeholder: "Search users\u2026", value: tenantUsersSearch, onChange: function (e) { setTenantUsersSearch(e.target.value); setTenantUsersPage(1); } })),
                                    react_1["default"].createElement(select_1.Select, { value: tenantUsersOrgFilter || "__all__", onValueChange: function (v) { setTenantUsersOrgFilter(v === "__all__" ? "" : v); setTenantUsersPage(1); } },
                                        react_1["default"].createElement(select_1.SelectTrigger, { className: "w-[180px]" },
                                            react_1["default"].createElement(select_1.SelectValue, { placeholder: "All Organizations" })),
                                        react_1["default"].createElement(select_1.SelectContent, null,
                                            react_1["default"].createElement(select_1.SelectItem, { value: "__all__" }, "All Organizations"),
                                            orgs.map(function (org) { return (react_1["default"].createElement(select_1.SelectItem, { key: org.id, value: org.id }, org.name)); })))),
                                react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                                    react_1["default"].createElement(badge_1.Badge, { variant: "secondary" },
                                        tenantUsersTotal,
                                        " user",
                                        tenantUsersTotal !== 1 ? "s" : ""),
                                    react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return refetchTenantUsers(); } },
                                        react_1["default"].createElement(lucide_react_1.RefreshCw, { className: "mr-1.5 h-4 w-4" }),
                                        " Refresh"))),
                            tenantUsersLoading ? (react_1["default"].createElement("div", { className: "flex justify-center py-8" },
                                react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-5 w-5 animate-spin" }))) : tenantUsersList.length === 0 ? (react_1["default"].createElement("div", { className: "flex flex-col items-center gap-2 py-12 text-center text-muted-foreground" },
                                react_1["default"].createElement(lucide_react_1.Users, { className: "h-10 w-10 opacity-30" }),
                                react_1["default"].createElement("p", { className: "text-sm" }, tenantUsersSearch || tenantUsersOrgFilter ? "No users match your filters." : "No tenant users found."))) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                                react_1["default"].createElement("div", { className: "rounded-lg border overflow-hidden" },
                                    react_1["default"].createElement(table_1.Table, null,
                                        react_1["default"].createElement(table_1.TableHeader, null,
                                            react_1["default"].createElement(table_1.TableRow, null,
                                                react_1["default"].createElement(table_1.TableHead, null, "Name"),
                                                react_1["default"].createElement(table_1.TableHead, null, "Email"),
                                                react_1["default"].createElement(table_1.TableHead, null, "Organization"),
                                                react_1["default"].createElement(table_1.TableHead, null, "Role"),
                                                react_1["default"].createElement(table_1.TableHead, null, "Status"),
                                                react_1["default"].createElement(table_1.TableHead, null, "Last Sign In"))),
                                        react_1["default"].createElement(table_1.TableBody, null, tenantUsersList.map(function (user) {
                                            var _a, _b, _c;
                                            var org = orgs.find(function (o) { return o.id === user.organizationId; });
                                            return (react_1["default"].createElement(table_1.TableRow, { key: user.id },
                                                react_1["default"].createElement(table_1.TableCell, null,
                                                    react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                                                        react_1["default"].createElement("div", { className: "flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs shrink-0" }, (_c = (_b = (_a = user.name) === null || _a === void 0 ? void 0 : _a.charAt(0)) === null || _b === void 0 ? void 0 : _b.toUpperCase()) !== null && _c !== void 0 ? _c : "?"),
                                                        react_1["default"].createElement("div", null,
                                                            react_1["default"].createElement("p", { className: "font-medium text-sm" }, user.name),
                                                            user.position && react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" }, user.position)))),
                                                react_1["default"].createElement(table_1.TableCell, { className: "text-sm text-muted-foreground" }, user.email),
                                                react_1["default"].createElement(table_1.TableCell, null, org ? (react_1["default"].createElement("div", { className: "flex items-center gap-1.5" },
                                                    react_1["default"].createElement("span", { className: "text-sm" }, org.name),
                                                    planBadge(org.plan))) : (react_1["default"].createElement("span", { className: "text-xs text-muted-foreground" }, user.organizationId))),
                                                react_1["default"].createElement(table_1.TableCell, null,
                                                    react_1["default"].createElement("span", { className: "capitalize text-sm" }, user.role)),
                                                react_1["default"].createElement(table_1.TableCell, null, user.isActive
                                                    ? react_1["default"].createElement(badge_1.Badge, { className: "bg-green-100 text-green-800 text-xs" }, "Active")
                                                    : react_1["default"].createElement(badge_1.Badge, { variant: "secondary", className: "text-xs" }, "Inactive")),
                                                react_1["default"].createElement(table_1.TableCell, { className: "text-xs text-muted-foreground" }, fmt(user.lastSignedIn))));
                                        })))),
                                tenantUsersTotalPages > 1 && (react_1["default"].createElement("div", { className: "flex items-center justify-between pt-2" },
                                    react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" },
                                        "Page ",
                                        tenantUsersPage,
                                        " of ",
                                        tenantUsersTotalPages,
                                        " (",
                                        tenantUsersTotal,
                                        " total users)"),
                                    react_1["default"].createElement("div", { className: "flex gap-1" },
                                        react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", disabled: tenantUsersPage <= 1, onClick: function () { return setTenantUsersPage(function (p) { return p - 1; }); } }, "Previous"),
                                        react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", disabled: tenantUsersPage >= tenantUsersTotalPages, onClick: function () { return setTenantUsersPage(function (p) { return p + 1; }); } }, "Next"))))))))),
                react_1["default"].createElement(tabs_1.TabsContent, { value: "comms", className: "mt-6 space-y-6" },
                    react_1["default"].createElement("div", { className: "grid gap-4 grid-cols-2 sm:grid-cols-4" }, [
                        { label: "Total", value: comms.length, color: "" },
                        { label: "Sent", value: comms.filter(function (c) { return c.status === "sent"; }).length, color: "text-green-600" },
                        { label: "Drafts", value: comms.filter(function (c) { return c.status === "draft"; }).length, color: "text-amber-600" },
                        { label: "Scheduled", value: comms.filter(function (c) { return c.status === "scheduled"; }).length, color: "text-blue-600" },
                    ].map(function (s) { return (react_1["default"].createElement(card_1.Card, { key: s.label },
                        react_1["default"].createElement(card_1.CardContent, { className: "pt-5" },
                            react_1["default"].createElement("p", { className: "text-2xl font-bold " + s.color }, s.value),
                            react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" }, s.label)))); })),
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                        react_1["default"].createElement(lucide_react_1.MessageSquare, { className: "h-5 w-5" }),
                                        " Tenant Communications"),
                                    react_1["default"].createElement(card_1.CardDescription, null, "Full lifecycle: compose, edit, send, resend, and delete messages to tenants.")),
                                react_1["default"].createElement("div", { className: "flex gap-2" },
                                    react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return refetchComms(); } },
                                        react_1["default"].createElement(lucide_react_1.RefreshCw, { className: "mr-1.5 h-4 w-4" }),
                                        " Refresh"),
                                    react_1["default"].createElement(button_1.Button, { onClick: function () { setMsgForm(__assign({}, BLANK_MESSAGE)); setShowCompose(true); } },
                                        react_1["default"].createElement(lucide_react_1.Plus, { className: "mr-1.5 h-4 w-4" }),
                                        " New Message")))),
                        react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                            react_1["default"].createElement("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center" },
                                react_1["default"].createElement("div", { className: "relative flex-1" },
                                    react_1["default"].createElement(lucide_react_1.Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
                                    react_1["default"].createElement(input_1.Input, { className: "pl-9", placeholder: "Search communications\u2026", value: commSearch, onChange: function (e) { return setCommSearch(e.target.value); } })),
                                react_1["default"].createElement(select_1.Select, { value: commStatusFilter, onValueChange: setCommStatusFilter },
                                    react_1["default"].createElement(select_1.SelectTrigger, { className: "w-36" },
                                        react_1["default"].createElement(select_1.SelectValue, null)),
                                    react_1["default"].createElement(select_1.SelectContent, null,
                                        react_1["default"].createElement(select_1.SelectItem, { value: "all" }, "All Status"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "sent" }, "Sent"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "scheduled" }, "Scheduled")))),
                            commsLoading ? (react_1["default"].createElement("div", { className: "flex justify-center py-8" },
                                react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-5 w-5 animate-spin" }))) : (function () {
                                var filteredComms = comms.filter(function (c) {
                                    var _a, _b;
                                    var matchSearch = !commSearch || ((_a = c.subject) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(commSearch.toLowerCase())) || ((_b = c.message) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(commSearch.toLowerCase()));
                                    var matchStatus = commStatusFilter === "all" || c.status === commStatusFilter;
                                    return matchSearch && matchStatus;
                                });
                                return filteredComms.length === 0 ? (react_1["default"].createElement("div", { className: "flex flex-col items-center gap-2 py-12 text-center text-muted-foreground" },
                                    react_1["default"].createElement(lucide_react_1.MessageSquare, { className: "h-10 w-10 opacity-30" }),
                                    react_1["default"].createElement("p", { className: "text-sm" }, commSearch || commStatusFilter !== "all" ? "No communications match your filters." : "No communications yet. Send your first message."))) : (react_1["default"].createElement("div", { className: "space-y-3" }, filteredComms.map(function (comm) {
                                    var _a, _b;
                                    return (react_1["default"].createElement("div", { key: comm.id, className: "rounded-lg border p-4 hover:bg-muted/30 transition-colors" },
                                        react_1["default"].createElement("div", { className: "flex items-start justify-between gap-3" },
                                            react_1["default"].createElement("div", { className: "flex-1 min-w-0 cursor-pointer", onClick: function () { return setExpandedMsg(expandedMsg === comm.id ? null : comm.id); } },
                                                react_1["default"].createElement("div", { className: "flex items-center gap-2 mb-1 flex-wrap" },
                                                    react_1["default"].createElement("p", { className: "text-sm font-semibold" }, comm.subject),
                                                    react_1["default"].createElement(badge_1.Badge, { variant: comm.status === "sent" ? "default" : comm.status === "draft" ? "secondary" : "outline", className: "text-xs capitalize" }, comm.status),
                                                    react_1["default"].createElement("span", { className: "inline-block rounded px-1.5 py-0.5 text-xs font-medium capitalize " + ((_a = PRIORITY_COLORS[comm.priority]) !== null && _a !== void 0 ? _a : "") }, comm.priority),
                                                    react_1["default"].createElement("span", { className: "inline-block rounded px-1.5 py-0.5 text-xs font-medium capitalize bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" }, comm.type)),
                                                react_1["default"].createElement("div", { className: "flex items-center gap-2 text-xs text-muted-foreground" },
                                                    react_1["default"].createElement("span", null, fmtFull(comm.createdAt)),
                                                    react_1["default"].createElement("span", null, "\u2022"),
                                                    react_1["default"].createElement("span", { className: "capitalize" }, (_b = comm.recipientType) === null || _b === void 0 ? void 0 : _b.replace(/_/g, " ")),
                                                    comm.sentAt && react_1["default"].createElement(react_1["default"].Fragment, null,
                                                        react_1["default"].createElement("span", null, "\u2022"),
                                                        react_1["default"].createElement("span", null,
                                                            "Sent ",
                                                            fmtFull(comm.sentAt))))),
                                            react_1["default"].createElement("div", { className: "flex items-center gap-1 shrink-0" },
                                                comm.status === "draft" && (react_1["default"].createElement(button_1.Button, { size: "sm", variant: "default", className: "text-xs", onClick: function () { return sendComm.mutate(comm.id); }, disabled: sendComm.isPending },
                                                    react_1["default"].createElement(lucide_react_1.Send, { className: "h-3 w-3 mr-1" }),
                                                    " Send")),
                                                comm.status === "sent" && (react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "text-xs", onClick: function () { return sendComm.mutate(comm.id); }, disabled: sendComm.isPending },
                                                    react_1["default"].createElement(lucide_react_1.Send, { className: "h-3 w-3 mr-1" }),
                                                    " Resend")),
                                                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "text-xs", onClick: function () {
                                                        setEditingComm(comm);
                                                        setEditCommForm({ subject: comm.subject, message: comm.message, type: comm.type, priority: comm.priority, status: comm.status, recipientType: comm.recipientType });
                                                        setShowEditComm(true);
                                                    } },
                                                    react_1["default"].createElement(lucide_react_1.Pencil, { className: "h-3 w-3" })),
                                                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "text-xs text-red-500 hover:text-red-600 hover:bg-red-50", onClick: function () { return setCommToDelete(comm); } },
                                                    react_1["default"].createElement(lucide_react_1.Trash2, { className: "h-3 w-3" })))),
                                        expandedMsg === comm.id && (react_1["default"].createElement("div", { className: "mt-3 rounded-lg bg-muted/30 p-3 text-sm", dangerouslySetInnerHTML: { __html: comm.message } }))));
                                })));
                            })()))))),
        react_1["default"].createElement(dialog_1.Dialog, { open: showCreate, onOpenChange: setShowCreate },
            react_1["default"].createElement(dialog_1.DialogContent, { className: "max-w-xl max-h-[90vh] overflow-y-auto" },
                react_1["default"].createElement(dialog_1.DialogHeader, null,
                    react_1["default"].createElement(dialog_1.DialogTitle, null, "Create Organization"),
                    react_1["default"].createElement(dialog_1.DialogDescription, null, "Add a new tenant organization with its super administrator.")),
                react_1["default"].createElement(OrgFormWithAdmin, { form: form, setForm: setForm, allUsers: allUsers, planOptions: planOptions, tierMaxUsers: tierMaxUsers }),
                react_1["default"].createElement(dialog_1.DialogFooter, null,
                    react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return setShowCreate(false); } }, "Cancel"),
                    react_1["default"].createElement(button_1.Button, { onClick: handleCreateSubmit, disabled: createOrgWithAdmin.isPending || !createFormValid },
                        createOrgWithAdmin.isPending && react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                        "Create Organization")))),
        react_1["default"].createElement(dialog_1.Dialog, { open: showEdit, onOpenChange: setShowEdit },
            react_1["default"].createElement(dialog_1.DialogContent, { className: "max-w-lg" },
                react_1["default"].createElement(dialog_1.DialogHeader, null,
                    react_1["default"].createElement(dialog_1.DialogTitle, null, "Edit Organization"),
                    react_1["default"].createElement(dialog_1.DialogDescription, null, "Update organization details.")),
                react_1["default"].createElement(OrgFormBasic, { form: form, setForm: setForm, mode: "edit", planOptions: planOptions, tierMaxUsers: tierMaxUsers }),
                react_1["default"].createElement("div", { className: "border-t pt-4 mt-4 space-y-4" },
                    react_1["default"].createElement("h4", { className: "text-sm font-semibold flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.Shield, { className: "h-4 w-4" }),
                        " Organization Super Admin"),
                    (function () {
                        var _a;
                        var users = ((_a = orgDetail) === null || _a === void 0 ? void 0 : _a.users) || [];
                        var superAdmin = users.find(function (u) { return u.role === "super_admin"; });
                        return (react_1["default"].createElement("div", { className: "space-y-3" },
                            superAdmin && (react_1["default"].createElement("div", { className: "flex items-center gap-2 p-2 bg-muted/50 rounded text-sm" },
                                react_1["default"].createElement(lucide_react_1.User, { className: "h-4 w-4 text-muted-foreground" }),
                                react_1["default"].createElement("span", null,
                                    "Current: ",
                                    react_1["default"].createElement("strong", null, superAdmin.name),
                                    " (",
                                    superAdmin.email,
                                    ")"))),
                            react_1["default"].createElement("div", { className: "space-y-1.5" },
                                react_1["default"].createElement(label_1.Label, null, "Admin Action"),
                                react_1["default"].createElement(select_1.Select, { value: editAdminMode, onValueChange: function (v) { return setEditAdminMode(v); } },
                                    react_1["default"].createElement(select_1.SelectTrigger, null,
                                        react_1["default"].createElement(select_1.SelectValue, null)),
                                    react_1["default"].createElement(select_1.SelectContent, null,
                                        superAdmin && react_1["default"].createElement(select_1.SelectItem, { value: "update" }, "Update Existing Admin"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "create" }, "Create New Admin"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "assign" }, "Assign Existing User")))),
                            editAdminMode === "update" && superAdmin && (react_1["default"].createElement(react_1["default"].Fragment, null,
                                react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-3" },
                                    react_1["default"].createElement("div", { className: "space-y-1.5" },
                                        react_1["default"].createElement(label_1.Label, null, "Name"),
                                        react_1["default"].createElement(input_1.Input, { value: editAdminName, onChange: function (e) { return setEditAdminName(e.target.value); } })),
                                    react_1["default"].createElement("div", { className: "space-y-1.5" },
                                        react_1["default"].createElement(label_1.Label, null, "Email"),
                                        react_1["default"].createElement(input_1.Input, { type: "email", value: editAdminEmail, onChange: function (e) { return setEditAdminEmail(e.target.value); } }))),
                                react_1["default"].createElement("div", { className: "space-y-1.5" },
                                    react_1["default"].createElement(label_1.Label, null, "New Password (leave blank to keep current)"),
                                    react_1["default"].createElement(input_1.Input, { type: "password", value: editAdminPassword, onChange: function (e) { return setEditAdminPassword(e.target.value); }, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" })))),
                            editAdminMode === "create" && (react_1["default"].createElement(react_1["default"].Fragment, null,
                                react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-3" },
                                    react_1["default"].createElement("div", { className: "space-y-1.5" },
                                        react_1["default"].createElement(label_1.Label, null, "Admin Name *"),
                                        react_1["default"].createElement(input_1.Input, { value: editAdminName, onChange: function (e) { return setEditAdminName(e.target.value); }, placeholder: "John Doe" })),
                                    react_1["default"].createElement("div", { className: "space-y-1.5" },
                                        react_1["default"].createElement(label_1.Label, null, "Admin Email *"),
                                        react_1["default"].createElement(input_1.Input, { type: "email", value: editAdminEmail, onChange: function (e) { return setEditAdminEmail(e.target.value); }, placeholder: "admin@example.com" }))),
                                react_1["default"].createElement("div", { className: "space-y-1.5" },
                                    react_1["default"].createElement(label_1.Label, null, "Password *"),
                                    react_1["default"].createElement(input_1.Input, { type: "password", value: editAdminPassword, onChange: function (e) { return setEditAdminPassword(e.target.value); }, placeholder: "Minimum 6 characters" })))),
                            editAdminMode === "assign" && (react_1["default"].createElement("div", { className: "space-y-1.5" },
                                react_1["default"].createElement(label_1.Label, null, "Select User to Promote"),
                                react_1["default"].createElement(select_1.Select, { value: editAssignUserId, onValueChange: function (v) { return setEditAssignUserId(v); } },
                                    react_1["default"].createElement(select_1.SelectTrigger, null,
                                        react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select a user\\u2026" })),
                                    react_1["default"].createElement(select_1.SelectContent, null, allUsers.filter(function (u) { return !superAdmin || u.id !== superAdmin.id; }).map(function (u) { return (react_1["default"].createElement(select_1.SelectItem, { key: u.id, value: u.id },
                                        u.name,
                                        " (",
                                        u.email,
                                        ")")); })))))));
                    })()),
                react_1["default"].createElement(dialog_1.DialogFooter, null,
                    react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return setShowEdit(false); } }, "Cancel"),
                    react_1["default"].createElement(button_1.Button, { onClick: handleEditSubmit, disabled: updateOrg.isPending || !form.name },
                        updateOrg.isPending && react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                        "Save Changes")))),
        react_1["default"].createElement(dialog_1.Dialog, { open: showCompose, onOpenChange: setShowCompose },
            react_1["default"].createElement(dialog_1.DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto" },
                react_1["default"].createElement(dialog_1.DialogHeader, null,
                    react_1["default"].createElement(dialog_1.DialogTitle, { className: "flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.Send, { className: "h-5 w-5" }),
                        " Compose Message"),
                    react_1["default"].createElement(dialog_1.DialogDescription, null, "Create or send a communication to tenants.")),
                react_1["default"].createElement("div", { className: "space-y-4 py-1" },
                    react_1["default"].createElement("div", { className: "space-y-1.5" },
                        react_1["default"].createElement(label_1.Label, null, "Target Audience"),
                        react_1["default"].createElement(select_1.Select, { value: msgForm.targetType, onValueChange: function (v) { return setMsgForm(function (p) { return (__assign(__assign({}, p), { targetType: v })); }); } },
                            react_1["default"].createElement(select_1.SelectTrigger, null,
                                react_1["default"].createElement(select_1.SelectValue, null)),
                            react_1["default"].createElement(select_1.SelectContent, null,
                                react_1["default"].createElement(select_1.SelectItem, { value: "all_admins" }, "All Tenant Admins"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "all_tenants" }, "All Tenants"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "specific_org" }, "Specific Organization"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "specific_user" }, "Specific User")))),
                    msgForm.targetType === "specific_org" && (react_1["default"].createElement("div", { className: "space-y-1.5" },
                        react_1["default"].createElement(label_1.Label, null, "Organization"),
                        react_1["default"].createElement(select_1.Select, { value: msgForm.targetOrgId, onValueChange: function (v) { return setMsgForm(function (p) { return (__assign(__assign({}, p), { targetOrgId: v })); }); } },
                            react_1["default"].createElement(select_1.SelectTrigger, null,
                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select organization\\u2026" })),
                            react_1["default"].createElement(select_1.SelectContent, null, orgs.map(function (o) { return react_1["default"].createElement(select_1.SelectItem, { key: o.id, value: o.id }, o.name); }))))),
                    msgForm.targetType === "specific_user" && (react_1["default"].createElement("div", { className: "space-y-1.5" },
                        react_1["default"].createElement(label_1.Label, null, "User"),
                        react_1["default"].createElement(select_1.Select, { value: msgForm.targetUserId, onValueChange: function (v) { return setMsgForm(function (p) { return (__assign(__assign({}, p), { targetUserId: v })); }); } },
                            react_1["default"].createElement(select_1.SelectTrigger, null,
                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select user\\u2026" })),
                            react_1["default"].createElement(select_1.SelectContent, null, tenantAdmins.map(function (a) { return react_1["default"].createElement(select_1.SelectItem, { key: a.id, value: a.id },
                                a.name,
                                " (",
                                a.email,
                                ")"); }))))),
                    react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-3" },
                        react_1["default"].createElement("div", { className: "space-y-1.5" },
                            react_1["default"].createElement(label_1.Label, null, "Type"),
                            react_1["default"].createElement(select_1.Select, { value: (_1 = msgForm.type) !== null && _1 !== void 0 ? _1 : "announcement", onValueChange: function (v) { return setMsgForm(function (p) { return (__assign(__assign({}, p), { type: v })); }); } },
                                react_1["default"].createElement(select_1.SelectTrigger, null,
                                    react_1["default"].createElement(select_1.SelectValue, null)),
                                react_1["default"].createElement(select_1.SelectContent, null,
                                    react_1["default"].createElement(select_1.SelectItem, { value: "announcement" }, "Announcement"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "alert" }, "Alert"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "notice" }, "Notice"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "update" }, "Update"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "maintenance" }, "Maintenance")))),
                        react_1["default"].createElement("div", { className: "space-y-1.5" },
                            react_1["default"].createElement(label_1.Label, null, "Priority"),
                            react_1["default"].createElement(select_1.Select, { value: msgForm.priority, onValueChange: function (v) { return setMsgForm(function (p) { return (__assign(__assign({}, p), { priority: v })); }); } },
                                react_1["default"].createElement(select_1.SelectTrigger, null,
                                    react_1["default"].createElement(select_1.SelectValue, null)),
                                react_1["default"].createElement(select_1.SelectContent, null, ["low", "normal", "high", "urgent"].map(function (p) { return react_1["default"].createElement(select_1.SelectItem, { key: p, value: p, className: "capitalize" }, p); }))))),
                    react_1["default"].createElement("div", { className: "space-y-1.5" },
                        react_1["default"].createElement(label_1.Label, null, "Subject *"),
                        react_1["default"].createElement(input_1.Input, { value: msgForm.subject, onChange: function (e) { return setMsgForm(function (p) { return (__assign(__assign({}, p), { subject: e.target.value })); }); }, placeholder: "System maintenance notice" })),
                    react_1["default"].createElement("div", { className: "space-y-1.5" },
                        react_1["default"].createElement(label_1.Label, null, "Message *"),
                        react_1["default"].createElement(RichTextEditor_1.RichTextEditor, { value: msgForm.content, onChange: function (html) { return setMsgForm(function (p) { return (__assign(__assign({}, p), { content: html })); }); }, placeholder: "Write your message to tenants\\u2026", minHeight: "150px" }))),
                react_1["default"].createElement(dialog_1.DialogFooter, { className: "gap-2 sm:gap-0" },
                    react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return setShowCompose(false); } }, "Cancel"),
                    react_1["default"].createElement(button_1.Button, { variant: "secondary", disabled: createComm.isPending || !msgForm.subject || !msgForm.content, onClick: function () { var _a; return createComm.mutate({ subject: msgForm.subject, message: msgForm.content, type: ((_a = msgForm.type) !== null && _a !== void 0 ? _a : "announcement"), priority: msgForm.priority, recipientType: (msgForm.targetType === "all_admins" || msgForm.targetType === "all_tenants") ? "all_tenants" : "specific_tenant", status: "draft" }); } },
                        createComm.isPending && react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                        "Save Draft"),
                    react_1["default"].createElement(button_1.Button, { onClick: handleSendMessage, disabled: sendMessage.isPending || !msgForm.subject || !msgForm.content },
                        sendMessage.isPending && react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                        react_1["default"].createElement(lucide_react_1.Send, { className: "mr-1.5 h-4 w-4" }),
                        " Send Now")))),
        react_1["default"].createElement(alert_dialog_1.AlertDialog, { open: !!toDelete, onOpenChange: function (o) { if (!o)
                setToDelete(null); } },
            react_1["default"].createElement(alert_dialog_1.AlertDialogContent, null,
                react_1["default"].createElement(alert_dialog_1.AlertDialogHeader, null,
                    react_1["default"].createElement(alert_dialog_1.AlertDialogTitle, null,
                        "Delete \"", toDelete === null || toDelete === void 0 ? void 0 :
                        toDelete.name,
                        "\"?"),
                    react_1["default"].createElement(alert_dialog_1.AlertDialogDescription, null, "This will permanently delete the organization and remove all its feature flags. Users will be unlinked but not deleted.")),
                react_1["default"].createElement(alert_dialog_1.AlertDialogFooter, null,
                    react_1["default"].createElement(alert_dialog_1.AlertDialogCancel, null, "Cancel"),
                    react_1["default"].createElement(alert_dialog_1.AlertDialogAction, { className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", onClick: function () { return toDelete && deleteOrg.mutate({ id: toDelete.id }); } },
                        deleteOrg.isPending ? react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
                        "Delete Organization")))),
        react_1["default"].createElement(dialog_1.Dialog, { open: showEditComm, onOpenChange: function (o) { if (!o) {
                setShowEditComm(false);
                setEditingComm(null);
            } } },
            react_1["default"].createElement(dialog_1.DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto" },
                react_1["default"].createElement(dialog_1.DialogHeader, null,
                    react_1["default"].createElement(dialog_1.DialogTitle, { className: "flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.Pencil, { className: "h-5 w-5" }),
                        " Edit Communication"),
                    react_1["default"].createElement(dialog_1.DialogDescription, null, "Update the communication details below.")),
                react_1["default"].createElement("div", { className: "space-y-4" },
                    react_1["default"].createElement("div", { className: "space-y-1.5" },
                        react_1["default"].createElement(label_1.Label, null, "Subject"),
                        react_1["default"].createElement(input_1.Input, { value: editCommForm.subject, onChange: function (e) { return setEditCommForm(function (p) { return (__assign(__assign({}, p), { subject: e.target.value })); }); } })),
                    react_1["default"].createElement("div", { className: "grid grid-cols-3 gap-3" },
                        react_1["default"].createElement("div", { className: "space-y-1.5" },
                            react_1["default"].createElement(label_1.Label, null, "Type"),
                            react_1["default"].createElement(select_1.Select, { value: editCommForm.type, onValueChange: function (v) { return setEditCommForm(function (p) { return (__assign(__assign({}, p), { type: v })); }); } },
                                react_1["default"].createElement(select_1.SelectTrigger, null,
                                    react_1["default"].createElement(select_1.SelectValue, null)),
                                react_1["default"].createElement(select_1.SelectContent, null,
                                    react_1["default"].createElement(select_1.SelectItem, { value: "announcement" }, "Announcement"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "alert" }, "Alert"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "notice" }, "Notice"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "update" }, "Update"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "maintenance" }, "Maintenance")))),
                        react_1["default"].createElement("div", { className: "space-y-1.5" },
                            react_1["default"].createElement(label_1.Label, null, "Priority"),
                            react_1["default"].createElement(select_1.Select, { value: editCommForm.priority, onValueChange: function (v) { return setEditCommForm(function (p) { return (__assign(__assign({}, p), { priority: v })); }); } },
                                react_1["default"].createElement(select_1.SelectTrigger, null,
                                    react_1["default"].createElement(select_1.SelectValue, null)),
                                react_1["default"].createElement(select_1.SelectContent, null,
                                    react_1["default"].createElement(select_1.SelectItem, { value: "low" }, "Low"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "normal" }, "Normal"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "high" }, "High"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "urgent" }, "Urgent")))),
                        react_1["default"].createElement("div", { className: "space-y-1.5" },
                            react_1["default"].createElement(label_1.Label, null, "Recipient Type"),
                            react_1["default"].createElement(select_1.Select, { value: editCommForm.recipientType, onValueChange: function (v) { return setEditCommForm(function (p) { return (__assign(__assign({}, p), { recipientType: v })); }); } },
                                react_1["default"].createElement(select_1.SelectTrigger, null,
                                    react_1["default"].createElement(select_1.SelectValue, null)),
                                react_1["default"].createElement(select_1.SelectContent, null,
                                    react_1["default"].createElement(select_1.SelectItem, { value: "all_tenants" }, "All Tenants"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "specific_tenant" }, "Specific Tenant"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "tier_based" }, "Tier Based"))))),
                    react_1["default"].createElement("div", { className: "space-y-1.5" },
                        react_1["default"].createElement(label_1.Label, null, "Message"),
                        react_1["default"].createElement(RichTextEditor_1.RichTextEditor, { value: editCommForm.message, onChange: function (v) { return setEditCommForm(function (p) { return (__assign(__assign({}, p), { message: v })); }); } }))),
                react_1["default"].createElement(dialog_1.DialogFooter, null,
                    react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { setShowEditComm(false); setEditingComm(null); } }, "Cancel"),
                    react_1["default"].createElement(button_1.Button, { disabled: updateComm.isPending || !editCommForm.subject.trim(), onClick: function () {
                            if (!editingComm)
                                return;
                            updateComm.mutate({
                                id: editingComm.id,
                                subject: editCommForm.subject,
                                message: editCommForm.message,
                                type: editCommForm.type,
                                priority: editCommForm.priority,
                                status: editCommForm.status,
                                recipientType: editCommForm.recipientType
                            });
                        } },
                        updateComm.isPending ? react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-1.5 h-4 w-4 animate-spin" }) : react_1["default"].createElement(lucide_react_1.CheckCircle2, { className: "mr-1.5 h-4 w-4" }),
                        "Save Changes")))),
        react_1["default"].createElement(alert_dialog_1.AlertDialog, { open: !!commToDelete, onOpenChange: function (o) { if (!o)
                setCommToDelete(null); } },
            react_1["default"].createElement(alert_dialog_1.AlertDialogContent, null,
                react_1["default"].createElement(alert_dialog_1.AlertDialogHeader, null,
                    react_1["default"].createElement(alert_dialog_1.AlertDialogTitle, null, "Delete Communication?"),
                    react_1["default"].createElement(alert_dialog_1.AlertDialogDescription, null,
                        "Permanently delete \"", commToDelete === null || commToDelete === void 0 ? void 0 :
                        commToDelete.subject,
                        "\"? This action cannot be undone.")),
                react_1["default"].createElement(alert_dialog_1.AlertDialogFooter, null,
                    react_1["default"].createElement(alert_dialog_1.AlertDialogCancel, null, "Cancel"),
                    react_1["default"].createElement(alert_dialog_1.AlertDialogAction, { className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", onClick: function () { return commToDelete && deleteComm.mutate(commToDelete.id); } },
                        deleteComm.isPending ? react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
                        "Delete"))))));
}
exports["default"] = MultiTenancy;
// ─── Create form with mandatory super admin ──────────────────────────────────
function OrgFormWithAdmin(_a) {
    var _b;
    var form = _a.form, setForm = _a.setForm, allUsers = _a.allUsers, planOptions = _a.planOptions, tierMaxUsers = _a.tierMaxUsers;
    var f = function (key) { return function (e) { return setForm(function (p) {
        var _a;
        return (__assign(__assign({}, p), (_a = {}, _a[key] = e.target.value, _a)));
    }); }; };
    var isCustom = form.plan === "custom";
    return (react_1["default"].createElement("div", { className: "space-y-6 py-1" },
        react_1["default"].createElement("div", null,
            react_1["default"].createElement("h3", { className: "text-sm font-semibold mb-3 flex items-center gap-2" },
                react_1["default"].createElement(lucide_react_1.Building2, { className: "h-4 w-4" }),
                " Organization Details"),
            react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-4" },
                react_1["default"].createElement("div", { className: "col-span-2 space-y-1.5" },
                    react_1["default"].createElement(label_1.Label, null, "Organization Name *"),
                    react_1["default"].createElement(input_1.Input, { value: form.name, onChange: function (e) { var name = e.target.value; setForm(function (p) { return (__assign(__assign({}, p), { name: name, slug: slugify(name) })); }); }, placeholder: "Acme Corporation" })),
                react_1["default"].createElement("div", { className: "col-span-2 space-y-1.5" },
                    react_1["default"].createElement(label_1.Label, null, "Slug *"),
                    react_1["default"].createElement(input_1.Input, { value: form.slug, onChange: f("slug"), placeholder: "acme-corporation" }),
                    react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" }, "Lowercase letters, numbers, hyphens only.")),
                react_1["default"].createElement("div", { className: "space-y-1.5" },
                    react_1["default"].createElement(label_1.Label, null, "Plan"),
                    react_1["default"].createElement(select_1.Select, { value: form.plan, onValueChange: function (v) {
                            var _a;
                            var mu = v === "custom" ? form.maxUsers : ((_a = tierMaxUsers[v]) !== null && _a !== void 0 ? _a : 10);
                            setForm(function (p) { return (__assign(__assign({}, p), { plan: v, maxUsers: mu })); });
                        } },
                        react_1["default"].createElement(select_1.SelectTrigger, null,
                            react_1["default"].createElement(select_1.SelectValue, null)),
                        react_1["default"].createElement(select_1.SelectContent, null, planOptions.map(function (p) { return react_1["default"].createElement(select_1.SelectItem, { key: p, value: p, className: "capitalize" }, p.replace(/_/g, " ")); })))),
                react_1["default"].createElement("div", { className: "space-y-1.5" },
                    react_1["default"].createElement(label_1.Label, null,
                        "Max Users ",
                        !isCustom && react_1["default"].createElement("span", { className: "text-xs text-muted-foreground" }, "(auto from plan)")),
                    react_1["default"].createElement(input_1.Input, { type: "number", min: 1, value: form.maxUsers, disabled: !isCustom, className: !isCustom ? "opacity-60" : "", onChange: function (e) { return setForm(function (p) { return (__assign(__assign({}, p), { maxUsers: Number(e.target.value) })); }); } }),
                    !isCustom && react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" },
                        "Locked to ", (_b = tierMaxUsers[form.plan]) !== null && _b !== void 0 ? _b : "plan",
                        " users for ",
                        form.plan,
                        " tier.")),
                react_1["default"].createElement("div", { className: "space-y-1.5" },
                    react_1["default"].createElement(label_1.Label, null, "Industry"),
                    react_1["default"].createElement(select_1.Select, { value: form.industry || "__none__", onValueChange: function (v) { return setForm(function (p) { return (__assign(__assign({}, p), { industry: v === "__none__" ? "" : v })); }); } },
                        react_1["default"].createElement(select_1.SelectTrigger, null,
                            react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select industry\u2026" })),
                        react_1["default"].createElement(select_1.SelectContent, null,
                            react_1["default"].createElement(select_1.SelectItem, { value: "__none__" }, "\u2014 Select \u2014"),
                            ["Technology", "Finance", "Healthcare", "Education", "Retail", "Manufacturing", "Real Estate", "Agriculture", "Logistics", "Legal", "Media", "Hospitality", "NGO/Non-Profit", "Government", "Consulting", "Other"].map(function (i) { return react_1["default"].createElement(select_1.SelectItem, { key: i, value: i.toLowerCase() }, i); })))),
                react_1["default"].createElement("div", { className: "space-y-1.5" },
                    react_1["default"].createElement(label_1.Label, null, "Employee Count"),
                    react_1["default"].createElement(input_1.Input, { type: "number", min: 1, value: form.employeeCount, onChange: function (e) { return setForm(function (p) { return (__assign(__assign({}, p), { employeeCount: e.target.value })); }); }, placeholder: "50" })),
                react_1["default"].createElement("div", { className: "space-y-1.5" },
                    react_1["default"].createElement(label_1.Label, null, "Contact Email"),
                    react_1["default"].createElement(input_1.Input, { type: "email", value: form.contactEmail, onChange: f("contactEmail"), placeholder: "admin@example.com" })),
                react_1["default"].createElement("div", { className: "space-y-1.5" },
                    react_1["default"].createElement(label_1.Label, null, "Billing Email"),
                    react_1["default"].createElement(input_1.Input, { type: "email", value: form.billingEmail, onChange: f("billingEmail"), placeholder: "billing@example.com" })),
                react_1["default"].createElement("div", { className: "space-y-1.5" },
                    react_1["default"].createElement(label_1.Label, null, "Contact Phone"),
                    react_1["default"].createElement(PhoneInput_1.PhoneInput, { value: form.contactPhone, onChange: function (v) { return setForm(__assign(__assign({}, form), { contactPhone: v })); }, placeholder: "700 000 000" })),
                react_1["default"].createElement("div", { className: "space-y-1.5" },
                    react_1["default"].createElement(label_1.Label, null, "Website"),
                    react_1["default"].createElement(input_1.Input, { value: form.website, onChange: f("website"), placeholder: "https://example.com" })),
                react_1["default"].createElement("div", { className: "space-y-1.5" },
                    react_1["default"].createElement(label_1.Label, null, "Domain"),
                    react_1["default"].createElement(input_1.Input, { value: form.domain, onChange: f("domain"), placeholder: "example.com" })),
                react_1["default"].createElement("div", { className: "space-y-1.5" },
                    react_1["default"].createElement(label_1.Label, null, "Country"),
                    react_1["default"].createElement(LocationSelects_1.CountrySelect, { value: form.country, onChange: function (v) { return setForm(__assign(__assign({}, form), { country: v })); } })),
                react_1["default"].createElement("div", { className: "space-y-1.5" },
                    react_1["default"].createElement(label_1.Label, null, "Tax ID / KRA PIN"),
                    react_1["default"].createElement(input_1.Input, { value: form.taxId, onChange: f("taxId"), placeholder: "P051234567A" })),
                react_1["default"].createElement("div", { className: "space-y-1.5" },
                    react_1["default"].createElement(label_1.Label, null, "Registration No."),
                    react_1["default"].createElement(input_1.Input, { value: form.registrationNumber, onChange: f("registrationNumber"), placeholder: "PVT-12345" })),
                react_1["default"].createElement("div", { className: "space-y-1.5" },
                    react_1["default"].createElement(label_1.Label, null, "Timezone"),
                    react_1["default"].createElement(select_1.Select, { value: form.timezone, onValueChange: function (v) { return setForm(function (p) { return (__assign(__assign({}, p), { timezone: v })); }); } },
                        react_1["default"].createElement(select_1.SelectTrigger, null,
                            react_1["default"].createElement(select_1.SelectValue, null)),
                        react_1["default"].createElement(select_1.SelectContent, null, ["Africa/Nairobi", "Africa/Lagos", "Africa/Cairo", "Africa/Johannesburg", "Europe/London", "America/New_York", "Asia/Dubai", "Asia/Kolkata"].map(function (tz) { return react_1["default"].createElement(select_1.SelectItem, { key: tz, value: tz }, tz); })))),
                react_1["default"].createElement("div", { className: "space-y-1.5" },
                    react_1["default"].createElement(label_1.Label, null, "Currency"),
                    react_1["default"].createElement(select_1.Select, { value: form.currency, onValueChange: function (v) { return setForm(function (p) { return (__assign(__assign({}, p), { currency: v })); }); } },
                        react_1["default"].createElement(select_1.SelectTrigger, null,
                            react_1["default"].createElement(select_1.SelectValue, null)),
                        react_1["default"].createElement(select_1.SelectContent, null, ["KES", "USD", "EUR", "GBP", "ZAR", "NGN", "UGX", "TZS", "AED", "INR"].map(function (c) { return react_1["default"].createElement(select_1.SelectItem, { key: c, value: c }, c); })))),
                react_1["default"].createElement("div", { className: "space-y-1.5" },
                    react_1["default"].createElement(label_1.Label, null, "Payment Method"),
                    react_1["default"].createElement(select_1.Select, { value: form.paymentMethod || "__none__", onValueChange: function (v) { return setForm(function (p) { return (__assign(__assign({}, p), { paymentMethod: v === "__none__" ? "" : v })); }); } },
                        react_1["default"].createElement(select_1.SelectTrigger, null,
                            react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select\u2026" })),
                        react_1["default"].createElement(select_1.SelectContent, null,
                            react_1["default"].createElement(select_1.SelectItem, { value: "__none__" }, "\u2014 Select \u2014"),
                            ["mpesa", "card", "bank_transfer", "cheque"].map(function (m) { return react_1["default"].createElement(select_1.SelectItem, { key: m, value: m, className: "capitalize" }, m.replace(/_/g, " ")); })))),
                react_1["default"].createElement("div", { className: "col-span-2 space-y-1.5" },
                    react_1["default"].createElement(label_1.Label, null, "Address"),
                    react_1["default"].createElement(input_1.Input, { value: form.address, onChange: f("address"), placeholder: "123 Main St, Nairobi" })),
                react_1["default"].createElement("div", { className: "col-span-2 space-y-1.5" },
                    react_1["default"].createElement(label_1.Label, null, "Description"),
                    react_1["default"].createElement(textarea_1.Textarea, { value: form.description, onChange: f("description"), placeholder: "Brief description of the organization\u2026", rows: 2 })))),
        react_1["default"].createElement("div", { className: "border-t pt-4" },
            react_1["default"].createElement("h3", { className: "text-sm font-semibold mb-1 flex items-center gap-2" },
                react_1["default"].createElement(lucide_react_1.Shield, { className: "h-4 w-4" }),
                " Organization Super Admin *"),
            react_1["default"].createElement("p", { className: "text-xs text-muted-foreground mb-3" }, "Every organization requires a super admin. Create a new account or assign an existing user."),
            react_1["default"].createElement("div", { className: "flex gap-2 mb-4" },
                react_1["default"].createElement(button_1.Button, { size: "sm", variant: form.adminMode === "create" ? "default" : "outline", onClick: function () { return setForm(function (p) { return (__assign(__assign({}, p), { adminMode: "create" })); }); }, type: "button" },
                    react_1["default"].createElement(lucide_react_1.UserPlus, { className: "mr-1.5 h-4 w-4" }),
                    " Create New Admin"),
                react_1["default"].createElement(button_1.Button, { size: "sm", variant: form.adminMode === "assign" ? "default" : "outline", onClick: function () { return setForm(function (p) { return (__assign(__assign({}, p), { adminMode: "assign" })); }); }, type: "button" },
                    react_1["default"].createElement(lucide_react_1.Users, { className: "mr-1.5 h-4 w-4" }),
                    " Assign Existing User")),
            form.adminMode === "create" ? (react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-4 rounded-lg border bg-muted/20 p-4" },
                react_1["default"].createElement("div", { className: "col-span-2 space-y-1.5" },
                    react_1["default"].createElement(label_1.Label, null, "Admin Full Name *"),
                    react_1["default"].createElement(input_1.Input, { value: form.adminName, onChange: f("adminName"), placeholder: "John Doe" })),
                react_1["default"].createElement("div", { className: "space-y-1.5" },
                    react_1["default"].createElement(label_1.Label, null, "Admin Email *"),
                    react_1["default"].createElement(input_1.Input, { type: "email", value: form.adminEmail, onChange: f("adminEmail"), placeholder: "john@example.com" })),
                react_1["default"].createElement("div", { className: "space-y-1.5" },
                    react_1["default"].createElement(label_1.Label, null, "Admin Password *"),
                    react_1["default"].createElement(input_1.Input, { type: "password", value: form.adminPassword, onChange: f("adminPassword"), placeholder: "Min 8 characters" }),
                    form.adminPassword && form.adminPassword.length < 8 && react_1["default"].createElement("p", { className: "text-xs text-red-500" }, "Password must be at least 8 characters")),
                react_1["default"].createElement("div", { className: "col-span-2" },
                    react_1["default"].createElement("div", { className: "flex items-start gap-2 rounded bg-blue-50 dark:bg-blue-950/30 p-2.5" },
                        react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-blue-500 mt-0.5 shrink-0" }),
                        react_1["default"].createElement("p", { className: "text-xs text-blue-700 dark:text-blue-300" }, "This user will be created as the organization's super admin with full access to all enabled features."))))) : (react_1["default"].createElement("div", { className: "rounded-lg border bg-muted/20 p-4 space-y-3" },
                react_1["default"].createElement("div", { className: "space-y-1.5" },
                    react_1["default"].createElement(label_1.Label, null, "Select Existing User *"),
                    react_1["default"].createElement(select_1.Select, { value: form.existingUserId, onValueChange: function (v) { return setForm(function (p) { return (__assign(__assign({}, p), { existingUserId: v })); }); } },
                        react_1["default"].createElement(select_1.SelectTrigger, null,
                            react_1["default"].createElement(select_1.SelectValue, { placeholder: "Choose a user to promote\\u2026" })),
                        react_1["default"].createElement(select_1.SelectContent, null, allUsers.map(function (u) { return react_1["default"].createElement(select_1.SelectItem, { key: u.id, value: u.id },
                            u.name,
                            " (",
                            u.email,
                            ") \u2014 ",
                            u.role); })))),
                react_1["default"].createElement("div", { className: "flex items-start gap-2 rounded bg-amber-50 dark:bg-amber-950/30 p-2.5" },
                    react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-amber-500 mt-0.5 shrink-0" }),
                    react_1["default"].createElement("p", { className: "text-xs text-amber-700 dark:text-amber-300" }, "The selected user will be assigned to this organization and promoted to super admin role with full feature access.")))))));
}
// ─── Basic org form (for editing) ────────────────────────────────────────────
function OrgFormBasic(_a) {
    var form = _a.form, setForm = _a.setForm, mode = _a.mode, planOptions = _a.planOptions, tierMaxUsers = _a.tierMaxUsers;
    var f = function (key) { return function (e) { return setForm(function (p) {
        var _a;
        return (__assign(__assign({}, p), (_a = {}, _a[key] = e.target.value, _a)));
    }); }; };
    var isCustom = form.plan === "custom";
    return (react_1["default"].createElement("div", { className: "space-y-4 py-1" },
        react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-4" },
            react_1["default"].createElement("div", { className: "col-span-2 space-y-1.5" },
                react_1["default"].createElement(label_1.Label, null, "Organization Name *"),
                react_1["default"].createElement(input_1.Input, { value: form.name, onChange: function (e) { var name = e.target.value; setForm(function (p) { return (__assign(__assign({}, p), { name: name, slug: mode === "create" ? slugify(name) : p.slug })); }); }, placeholder: "Acme Corporation" })),
            mode === "create" && (react_1["default"].createElement("div", { className: "col-span-2 space-y-1.5" },
                react_1["default"].createElement(label_1.Label, null, "Slug *"),
                react_1["default"].createElement(input_1.Input, { value: form.slug, onChange: f("slug"), placeholder: "acme-corporation" }))),
            react_1["default"].createElement("div", { className: "space-y-1.5" },
                react_1["default"].createElement(label_1.Label, null, "Plan"),
                react_1["default"].createElement(select_1.Select, { value: form.plan, onValueChange: function (v) {
                        var _a;
                        var mu = v === "custom" ? form.maxUsers : ((_a = tierMaxUsers[v]) !== null && _a !== void 0 ? _a : 10);
                        setForm(function (p) { return (__assign(__assign({}, p), { plan: v, maxUsers: mu })); });
                    } },
                    react_1["default"].createElement(select_1.SelectTrigger, null,
                        react_1["default"].createElement(select_1.SelectValue, null)),
                    react_1["default"].createElement(select_1.SelectContent, null, planOptions.map(function (p) { return react_1["default"].createElement(select_1.SelectItem, { key: p, value: p, className: "capitalize" }, p.replace(/_/g, " ")); })))),
            react_1["default"].createElement("div", { className: "space-y-1.5" },
                react_1["default"].createElement(label_1.Label, null,
                    "Max Users ",
                    !isCustom && react_1["default"].createElement("span", { className: "text-xs text-muted-foreground" }, "(auto)")),
                react_1["default"].createElement(input_1.Input, { type: "number", min: 1, value: form.maxUsers, disabled: !isCustom, className: !isCustom ? "opacity-60" : "", onChange: function (e) { return setForm(function (p) { return (__assign(__assign({}, p), { maxUsers: Number(e.target.value) })); }); } })),
            react_1["default"].createElement("div", { className: "space-y-1.5" },
                react_1["default"].createElement(label_1.Label, null, "Industry"),
                react_1["default"].createElement(select_1.Select, { value: form.industry || "__none__", onValueChange: function (v) { return setForm(function (p) { return (__assign(__assign({}, p), { industry: v === "__none__" ? "" : v })); }); } },
                    react_1["default"].createElement(select_1.SelectTrigger, null,
                        react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select industry\u2026" })),
                    react_1["default"].createElement(select_1.SelectContent, null,
                        react_1["default"].createElement(select_1.SelectItem, { value: "__none__" }, "\u2014 Select \u2014"),
                        ["Technology", "Finance", "Healthcare", "Education", "Retail", "Manufacturing", "Real Estate", "Agriculture", "Logistics", "Legal", "Media", "Hospitality", "NGO/Non-Profit", "Government", "Consulting", "Other"].map(function (i) { return react_1["default"].createElement(select_1.SelectItem, { key: i, value: i.toLowerCase() }, i); })))),
            react_1["default"].createElement("div", { className: "space-y-1.5" },
                react_1["default"].createElement(label_1.Label, null, "Employee Count"),
                react_1["default"].createElement(input_1.Input, { type: "number", min: 1, value: form.employeeCount, onChange: function (e) { return setForm(function (p) { return (__assign(__assign({}, p), { employeeCount: e.target.value })); }); }, placeholder: "50" })),
            react_1["default"].createElement("div", { className: "space-y-1.5" },
                react_1["default"].createElement(label_1.Label, null, "Contact Email"),
                react_1["default"].createElement(input_1.Input, { type: "email", value: form.contactEmail, onChange: f("contactEmail"), placeholder: "admin@example.com" })),
            react_1["default"].createElement("div", { className: "space-y-1.5" },
                react_1["default"].createElement(label_1.Label, null, "Billing Email"),
                react_1["default"].createElement(input_1.Input, { type: "email", value: form.billingEmail, onChange: f("billingEmail"), placeholder: "billing@example.com" })),
            react_1["default"].createElement("div", { className: "space-y-1.5" },
                react_1["default"].createElement(label_1.Label, null, "Contact Phone"),
                react_1["default"].createElement(PhoneInput_1.PhoneInput, { value: form.contactPhone, onChange: function (v) { return setForm(__assign(__assign({}, form), { contactPhone: v })); }, placeholder: "700 000 000" })),
            react_1["default"].createElement("div", { className: "space-y-1.5" },
                react_1["default"].createElement(label_1.Label, null, "Website"),
                react_1["default"].createElement(input_1.Input, { value: form.website, onChange: f("website"), placeholder: "https://example.com" })),
            react_1["default"].createElement("div", { className: "space-y-1.5" },
                react_1["default"].createElement(label_1.Label, null, "Domain"),
                react_1["default"].createElement(input_1.Input, { value: form.domain, onChange: f("domain"), placeholder: "example.com" })),
            react_1["default"].createElement("div", { className: "space-y-1.5" },
                react_1["default"].createElement(label_1.Label, null, "Country"),
                react_1["default"].createElement(LocationSelects_1.CountrySelect, { value: form.country, onChange: function (v) { return setForm(__assign(__assign({}, form), { country: v })); } })),
            react_1["default"].createElement("div", { className: "space-y-1.5" },
                react_1["default"].createElement(label_1.Label, null, "Tax ID / KRA PIN"),
                react_1["default"].createElement(input_1.Input, { value: form.taxId, onChange: f("taxId"), placeholder: "P051234567A" })),
            react_1["default"].createElement("div", { className: "space-y-1.5" },
                react_1["default"].createElement(label_1.Label, null, "Registration No."),
                react_1["default"].createElement(input_1.Input, { value: form.registrationNumber, onChange: f("registrationNumber"), placeholder: "PVT-12345" })),
            react_1["default"].createElement("div", { className: "space-y-1.5" },
                react_1["default"].createElement(label_1.Label, null, "Timezone"),
                react_1["default"].createElement(select_1.Select, { value: form.timezone, onValueChange: function (v) { return setForm(function (p) { return (__assign(__assign({}, p), { timezone: v })); }); } },
                    react_1["default"].createElement(select_1.SelectTrigger, null,
                        react_1["default"].createElement(select_1.SelectValue, null)),
                    react_1["default"].createElement(select_1.SelectContent, null, ["Africa/Nairobi", "Africa/Lagos", "Africa/Cairo", "Africa/Johannesburg", "Europe/London", "America/New_York", "Asia/Dubai", "Asia/Kolkata"].map(function (tz) { return react_1["default"].createElement(select_1.SelectItem, { key: tz, value: tz }, tz); })))),
            react_1["default"].createElement("div", { className: "space-y-1.5" },
                react_1["default"].createElement(label_1.Label, null, "Currency"),
                react_1["default"].createElement(select_1.Select, { value: form.currency, onValueChange: function (v) { return setForm(function (p) { return (__assign(__assign({}, p), { currency: v })); }); } },
                    react_1["default"].createElement(select_1.SelectTrigger, null,
                        react_1["default"].createElement(select_1.SelectValue, null)),
                    react_1["default"].createElement(select_1.SelectContent, null, ["KES", "USD", "EUR", "GBP", "ZAR", "NGN", "UGX", "TZS", "AED", "INR"].map(function (c) { return react_1["default"].createElement(select_1.SelectItem, { key: c, value: c }, c); })))),
            react_1["default"].createElement("div", { className: "space-y-1.5" },
                react_1["default"].createElement(label_1.Label, null, "Payment Method"),
                react_1["default"].createElement(select_1.Select, { value: form.paymentMethod || "__none__", onValueChange: function (v) { return setForm(function (p) { return (__assign(__assign({}, p), { paymentMethod: v === "__none__" ? "" : v })); }); } },
                    react_1["default"].createElement(select_1.SelectTrigger, null,
                        react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select\u2026" })),
                    react_1["default"].createElement(select_1.SelectContent, null,
                        react_1["default"].createElement(select_1.SelectItem, { value: "__none__" }, "\u2014 Select \u2014"),
                        ["mpesa", "card", "bank_transfer", "cheque"].map(function (m) { return react_1["default"].createElement(select_1.SelectItem, { key: m, value: m, className: "capitalize" }, m.replace(/_/g, " ")); })))),
            react_1["default"].createElement("div", { className: "col-span-2 space-y-1.5" },
                react_1["default"].createElement(label_1.Label, null, "Address"),
                react_1["default"].createElement(input_1.Input, { value: form.address, onChange: f("address"), placeholder: "123 Main St, Nairobi" })),
            react_1["default"].createElement("div", { className: "col-span-2 space-y-1.5" },
                react_1["default"].createElement(label_1.Label, null, "Description"),
                react_1["default"].createElement(textarea_1.Textarea, { value: form.description, onChange: f("description"), placeholder: "Brief description of the organization\u2026", rows: 2 })))));
}
