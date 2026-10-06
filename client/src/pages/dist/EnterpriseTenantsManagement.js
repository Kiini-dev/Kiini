"use strict";
/**
 * Enterprise Tenants Management
 * Super admin page for managing all tenants/organizations
 */
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
var useAuth_1 = require("@/_core/hooks/useAuth");
var wouter_1 = require("wouter");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var tabs_1 = require("@/components/ui/tabs");
var label_1 = require("@/components/ui/label");
var spinner_1 = require("@/components/ui/spinner");
var lucide_react_1 = require("lucide-react");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
function EnterpriseTenantsManagement() {
    var _a, _b, _c;
    var user = useAuth_1.useAuth().user;
    var _d = wouter_1.useLocation(), navigate = _d[1];
    // Check if super admin
    if ((user === null || user === void 0 ? void 0 : user.role) !== "super_admin") {
        navigate("/");
        return null;
    }
    // State
    var _e = react_1.useState(""), search = _e[0], setSearch = _e[1];
    var _f = react_1.useState(), tierFilter = _f[0], setTierFilter = _f[1];
    var _g = react_1.useState(), isActiveFilter = _g[0], setIsActiveFilter = _g[1];
    var _h = react_1.useState("createdAt"), sortBy = _h[0], setSortBy = _h[1];
    var _j = react_1.useState("desc"), sortOrder = _j[0], setSortOrder = _j[1];
    var _k = react_1.useState(false), showUpdateDialog = _k[0], setShowUpdateDialog = _k[1];
    var _l = react_1.useState(null), selectedTenant = _l[0], setSelectedTenant = _l[1];
    var _m = react_1.useState({
        name: "",
        slug: "",
        plan: "",
        maxUsers: 10,
        isActive: true
    }), updateFormData = _m[0], setUpdateFormData = _m[1];
    var _o = react_1.useState(false), showTierDialog = _o[0], setShowTierDialog = _o[1];
    var _p = react_1.useState(""), selectedTierPlan = _p[0], setSelectedTierPlan = _p[1];
    var _q = react_1.useState(10), selectedTierMaxUsers = _q[0], setSelectedTierMaxUsers = _q[1];
    var _r = react_1.useState(false), showCreateDialog = _r[0], setShowCreateDialog = _r[1];
    var _s = react_1.useState({
        name: "", slug: "", plan: "trial", maxUsers: 10,
        domain: "", contactEmail: "", contactPhone: "", industry: ""
    }), createFormData = _s[0], setCreateFormData = _s[1];
    // Queries
    var _t = trpc_1.trpc.enterpriseTenants.list.useQuery({
        search: search || undefined,
        tier: tierFilter,
        isActive: isActiveFilter,
        sortBy: sortBy,
        sortOrder: sortOrder,
        limit: 100,
        offset: 0
    }), tenantsData = _t.data, isLoading = _t.isLoading, refetch = _t.refetch;
    var _u = trpc_1.trpc.enterpriseTenants.getPricingTiers.useQuery(), _v = _u.data, pricingTiers = _v === void 0 ? [] : _v, tiersLoading = _u.isLoading;
    // Mutations
    var updateMutation = trpc_1.trpc.enterpriseTenants.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Tenant updated successfully");
            setShowUpdateDialog(false);
            refetch();
        },
        onError: function (error) { return sonner_1.toast.error(error.message); }
    });
    var updatePricingMutation = trpc_1.trpc.enterpriseTenants.updatePricingTier.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Pricing tier updated successfully");
            setShowTierDialog(false);
            refetch();
        },
        onError: function (error) { return sonner_1.toast.error(error.message); }
    });
    var createMutation = trpc_1.trpc.enterpriseTenants.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Tenant created successfully");
            setShowCreateDialog(false);
            setCreateFormData({ name: "", slug: "", plan: "trial", maxUsers: 10, domain: "", contactEmail: "", contactPhone: "", industry: "" });
            refetch();
        },
        onError: function (error) { return sonner_1.toast.error(error.message); }
    });
    var deleteMutation = trpc_1.trpc.enterpriseTenants["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Tenant deleted successfully");
            refetch();
        },
        onError: function (error) { return sonner_1.toast.error(error.message); }
    });
    // Handlers
    var openUpdateDialog = function (tenant) {
        setSelectedTenant(tenant);
        setUpdateFormData({
            name: tenant.name,
            slug: tenant.slug,
            plan: tenant.plan,
            maxUsers: tenant.maxUsers,
            isActive: tenant.isActive === 1
        });
        setShowUpdateDialog(true);
    };
    var handleUpdateTenant = function () {
        if (!selectedTenant)
            return;
        updateMutation.mutate({
            tenantId: selectedTenant.id,
            name: updateFormData.name,
            slug: updateFormData.slug,
            plan: updateFormData.plan,
            maxUsers: updateFormData.maxUsers,
            isActive: updateFormData.isActive
        });
    };
    var openTierDialog = function (tenant) {
        var _a;
        setSelectedTenant(tenant);
        setSelectedTierPlan(((_a = tenant.activePlan) === null || _a === void 0 ? void 0 : _a.id) || "");
        setSelectedTierMaxUsers(tenant.maxUsers || 10);
        setShowTierDialog(true);
    };
    var handleUpdateTier = function () {
        if (!selectedTenant || !selectedTierPlan)
            return;
        updatePricingMutation.mutate({
            tenantId: selectedTenant.id,
            planId: selectedTierPlan,
            maxUsers: selectedTierMaxUsers
        });
    };
    var getTierBadgeColor = function (tier) {
        var colors = {
            free: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
            starter: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
            gold: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
            professional: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
            enterprise: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
        };
        return colors[tier] || "bg-gray-100 text-gray-800";
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Enterprise Tenants", description: "Manage all tenant organizations, plans, and user limits", icon: React.createElement(lucide_react_1.Users, { className: "h-6 w-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm/super-admin" },
            { label: "Enterprise", href: "/enterprise" },
            { label: "Tenants Management" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Total Tenants")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" }, (tenantsData === null || tenantsData === void 0 ? void 0 : tenantsData.total) || 0))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Active Tenants")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" }, ((_a = tenantsData === null || tenantsData === void 0 ? void 0 : tenantsData.tenants) === null || _a === void 0 ? void 0 : _a.filter(function (t) { return t.isActive; }).length) || 0))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Total Users")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" }, ((_b = tenantsData === null || tenantsData === void 0 ? void 0 : tenantsData.tenants) === null || _b === void 0 ? void 0 : _b.reduce(function (sum, t) { return sum + (t.userCount || 0); }, 0)) || 0))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Plans")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" }, pricingTiers.length)))),
            React.createElement(tabs_1.Tabs, { defaultValue: "tenants", className: "space-y-4" },
                React.createElement(tabs_1.TabsList, null,
                    React.createElement(tabs_1.TabsTrigger, { value: "tenants" }, "Tenants"),
                    React.createElement(tabs_1.TabsTrigger, { value: "pricing" }, "Pricing Tiers")),
                React.createElement(tabs_1.TabsContent, { value: "tenants", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement("div", { className: "flex items-center justify-between gap-4" },
                                React.createElement("div", { className: "flex-1 flex gap-2" },
                                    React.createElement("div", { className: "relative flex-1" },
                                        React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" }),
                                        React.createElement(input_1.Input, { placeholder: "Search tenants...", value: search, onChange: function (e) { return setSearch(e.target.value); }, className: "pl-9" })),
                                    React.createElement(button_1.Button, { onClick: function () { return setShowCreateDialog(true); } },
                                        React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                                        " New Tenant"),
                                    React.createElement(select_1.Select, { value: tierFilter || "", onValueChange: function (v) { return setTierFilter(v || undefined); } },
                                        React.createElement(select_1.SelectTrigger, { className: "w-40" },
                                            React.createElement(select_1.SelectValue, { placeholder: "Filter by tier" })),
                                        React.createElement(select_1.SelectContent, null,
                                            React.createElement(select_1.SelectItem, { value: "" }, "All Tiers"),
                                            React.createElement(select_1.SelectItem, { value: "free" }, "Free"),
                                            React.createElement(select_1.SelectItem, { value: "starter" }, "Starter"),
                                            React.createElement(select_1.SelectItem, { value: "gold" }, "Gold"),
                                            React.createElement(select_1.SelectItem, { value: "professional" }, "Professional"),
                                            React.createElement(select_1.SelectItem, { value: "enterprise" }, "Enterprise"))),
                                    React.createElement(select_1.Select, { value: isActiveFilter === undefined ? "" : isActiveFilter ? "active" : "inactive", onValueChange: function (v) {
                                            if (v === "")
                                                setIsActiveFilter(undefined);
                                            else
                                                setIsActiveFilter(v === "active");
                                        } },
                                        React.createElement(select_1.SelectTrigger, { className: "w-40" },
                                            React.createElement(select_1.SelectValue, { placeholder: "Filter by status" })),
                                        React.createElement(select_1.SelectContent, null,
                                            React.createElement(select_1.SelectItem, { value: "" }, "All Status"),
                                            React.createElement(select_1.SelectItem, { value: "active" }, "Active"),
                                            React.createElement(select_1.SelectItem, { value: "inactive" }, "Inactive"))))))),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardContent, { className: "pt-6" }, isLoading ? (React.createElement("div", { className: "flex items-center justify-center p-8" },
                            React.createElement(spinner_1.Spinner, { className: "mr-2" }),
                            "Loading tenants...")) : (React.createElement("div", { className: "overflow-x-auto" },
                            React.createElement(table_1.Table, null,
                                React.createElement(table_1.TableHeader, null,
                                    React.createElement(table_1.TableRow, null,
                                        React.createElement(table_1.TableHead, { className: "cursor-pointer", onClick: function () {
                                                if (sortBy === "name") {
                                                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                                }
                                                else {
                                                    setSortBy("name");
                                                    setSortOrder("asc");
                                                }
                                            } },
                                            React.createElement("div", { className: "flex items-center gap-2" },
                                                "Name",
                                                sortBy === "name" && (sortOrder === "asc" ? React.createElement(lucide_react_1.ChevronUp, { className: "h-4 w-4" }) : React.createElement(lucide_react_1.ChevronDown, { className: "h-4 w-4" })))),
                                        React.createElement(table_1.TableHead, null, "Slug"),
                                        React.createElement(table_1.TableHead, { className: "cursor-pointer", onClick: function () {
                                                if (sortBy === "plan") {
                                                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                                }
                                                else {
                                                    setSortBy("plan");
                                                    setSortOrder("asc");
                                                }
                                            } },
                                            React.createElement("div", { className: "flex items-center gap-2" },
                                                "Plan",
                                                sortBy === "plan" && (sortOrder === "asc" ? React.createElement(lucide_react_1.ChevronUp, { className: "h-4 w-4" }) : React.createElement(lucide_react_1.ChevronDown, { className: "h-4 w-4" })))),
                                        React.createElement(table_1.TableHead, null,
                                            React.createElement("div", { className: "flex items-center gap-1" },
                                                React.createElement(lucide_react_1.Users, { className: "h-4 w-4" }),
                                                "Users")),
                                        React.createElement(table_1.TableHead, null, "Max Users"),
                                        React.createElement(table_1.TableHead, null, "Domain"),
                                        React.createElement(table_1.TableHead, null, "Status"),
                                        React.createElement(table_1.TableHead, { className: "w-10" }, "Actions"))),
                                React.createElement(table_1.TableBody, null, (_c = tenantsData === null || tenantsData === void 0 ? void 0 : tenantsData.tenants) === null || _c === void 0 ? void 0 : _c.map(function (tenant) { return (React.createElement(table_1.TableRow, { key: tenant.id },
                                    React.createElement(table_1.TableCell, { className: "font-medium" }, tenant.name),
                                    React.createElement(table_1.TableCell, { className: "text-sm text-slate-600 dark:text-slate-400" }, tenant.slug),
                                    React.createElement(table_1.TableCell, null,
                                        React.createElement(badge_1.Badge, { className: getTierBadgeColor(tenant.plan) }, tenant.plan)),
                                    React.createElement(table_1.TableCell, null, tenant.userCount || 0),
                                    React.createElement(table_1.TableCell, null, tenant.maxUsers === -1 ? "Unlimited" : tenant.maxUsers),
                                    React.createElement(table_1.TableCell, { className: "text-sm text-slate-600 dark:text-slate-400" }, tenant.domain || "-"),
                                    React.createElement(table_1.TableCell, null,
                                        React.createElement(badge_1.Badge, { variant: tenant.isActive ? "default" : "secondary" }, tenant.isActive ? "Active" : "Inactive")),
                                    React.createElement(table_1.TableCell, null,
                                        React.createElement(dropdown_menu_1.DropdownMenu, null,
                                            React.createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                                                React.createElement(button_1.Button, { variant: "ghost", size: "sm" },
                                                    React.createElement(lucide_react_1.MoreHorizontal, { className: "h-4 w-4" }))),
                                            React.createElement(dropdown_menu_1.DropdownMenuContent, { align: "end" },
                                                React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return openUpdateDialog(tenant); } },
                                                    React.createElement(lucide_react_1.Edit2, { className: "h-4 w-4 mr-2" }),
                                                    "Edit"),
                                                React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return openTierDialog(tenant); } },
                                                    React.createElement(lucide_react_1.Settings, { className: "h-4 w-4 mr-2" }),
                                                    "Update Tier"),
                                                React.createElement(dropdown_menu_1.DropdownMenuItem, null,
                                                    React.createElement(lucide_react_1.Users, { className: "h-4 w-4 mr-2" }),
                                                    "View Users"),
                                                React.createElement(dropdown_menu_1.DropdownMenuItem, { className: "text-red-600", onClick: function () {
                                                        if (confirm("Delete tenant \"" + tenant.name + "\"? This cannot be undone.")) {
                                                            deleteMutation.mutate(tenant.id);
                                                        }
                                                    } },
                                                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4 mr-2" }),
                                                    "Delete")))))); })))))))),
                React.createElement(tabs_1.TabsContent, { value: "pricing", className: "space-y-4" }, tiersLoading ? (React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardContent, { className: "pt-6" },
                        React.createElement("div", { className: "flex items-center justify-center p-8" },
                            React.createElement(spinner_1.Spinner, { className: "mr-2" }),
                            "Loading pricing tiers...")))) : (React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" }, pricingTiers.map(function (tier) {
                    var _a;
                    return (React.createElement(card_1.Card, { key: tier.id },
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "text-lg" }, tier.planName),
                            React.createElement(badge_1.Badge, { className: getTierBadgeColor(tier.tier) }, tier.tier)),
                        React.createElement(card_1.CardContent, { className: "space-y-3" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-xs text-slate-600 dark:text-slate-400" }, "Monthly Price"),
                                React.createElement("p", { className: "text-lg font-semibold" },
                                    "KES ",
                                    Number(tier.monthlyPrice || 0).toLocaleString())),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-xs text-slate-600 dark:text-slate-400" }, "Max Users"),
                                React.createElement("p", { className: "text-lg font-semibold" }, tier.maxUsers === -1 ? "Unlimited" : tier.maxUsers)),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-xs text-slate-600 dark:text-slate-400" }, "Support Level"),
                                React.createElement("p", { className: "text-sm capitalize" }, (_a = tier.supportLevel) === null || _a === void 0 ? void 0 : _a.replace(/_/g, " "))),
                            tier.description && (React.createElement("div", null,
                                React.createElement("p", { className: "text-xs text-slate-600 dark:text-slate-400" }, "Description"),
                                React.createElement("p", { className: "text-sm" }, tier.description))))));
                }))))),
            React.createElement(dialog_1.Dialog, { open: showUpdateDialog, onOpenChange: setShowUpdateDialog },
                React.createElement(dialog_1.DialogContent, null,
                    React.createElement(dialog_1.DialogHeader, null,
                        React.createElement(dialog_1.DialogTitle, null, "Update Tenant"),
                        React.createElement(dialog_1.DialogDescription, null, "Update organization details")),
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "name" }, "Organization Name"),
                            React.createElement(input_1.Input, { id: "name", value: updateFormData.name, onChange: function (e) { return setUpdateFormData(__assign(__assign({}, updateFormData), { name: e.target.value })); } })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "slug" }, "Slug"),
                            React.createElement(input_1.Input, { id: "slug", value: updateFormData.slug, onChange: function (e) { return setUpdateFormData(__assign(__assign({}, updateFormData), { slug: e.target.value })); } })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "plan" }, "Plan"),
                            React.createElement(input_1.Input, { id: "plan", value: updateFormData.plan, onChange: function (e) { return setUpdateFormData(__assign(__assign({}, updateFormData), { plan: e.target.value })); } })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "maxUsers" }, "Max Users"),
                            React.createElement(input_1.Input, { id: "maxUsers", type: "number", value: updateFormData.maxUsers, onChange: function (e) { return setUpdateFormData(__assign(__assign({}, updateFormData), { maxUsers: parseInt(e.target.value) || 10 })); } })),
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("input", { type: "checkbox", id: "isActive", title: "Active status", checked: updateFormData.isActive, onChange: function (e) { return setUpdateFormData(__assign(__assign({}, updateFormData), { isActive: e.target.checked })); }, className: "rounded" }),
                            React.createElement(label_1.Label, { htmlFor: "isActive" }, "Active"))),
                    React.createElement(dialog_1.DialogFooter, null,
                        React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setShowUpdateDialog(false); } }, "Cancel"),
                        React.createElement(button_1.Button, { onClick: handleUpdateTenant, disabled: updateMutation.isPending }, "Update")))),
            React.createElement(dialog_1.Dialog, { open: showTierDialog, onOpenChange: setShowTierDialog },
                React.createElement(dialog_1.DialogContent, null,
                    React.createElement(dialog_1.DialogHeader, null,
                        React.createElement(dialog_1.DialogTitle, null, "Update Pricing Tier"),
                        React.createElement(dialog_1.DialogDescription, null, "Change the tenant's pricing plan and user limit")),
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "plan" }, "Pricing Plan"),
                            React.createElement(select_1.Select, { value: selectedTierPlan, onValueChange: setSelectedTierPlan },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, { placeholder: "Select a plan" })),
                                React.createElement(select_1.SelectContent, null, pricingTiers.map(function (tier) { return (React.createElement(select_1.SelectItem, { key: tier.id, value: tier.id },
                                    tier.planName,
                                    " (",
                                    tier.tier,
                                    ")")); })))),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "maxUsers" }, "Max Users"),
                            React.createElement(input_1.Input, { id: "maxUsers", type: "number", value: selectedTierMaxUsers, onChange: function (e) { return setSelectedTierMaxUsers(parseInt(e.target.value) || 10); } }))),
                    React.createElement(dialog_1.DialogFooter, null,
                        React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setShowTierDialog(false); } }, "Cancel"),
                        React.createElement(button_1.Button, { onClick: handleUpdateTier, disabled: updatePricingMutation.isPending }, "Update Tier")))),
            React.createElement(dialog_1.Dialog, { open: showCreateDialog, onOpenChange: setShowCreateDialog },
                React.createElement(dialog_1.DialogContent, { className: "max-w-lg" },
                    React.createElement(dialog_1.DialogHeader, null,
                        React.createElement(dialog_1.DialogTitle, null, "Create New Tenant"),
                        React.createElement(dialog_1.DialogDescription, null, "Add a new organization/tenant")),
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                            React.createElement("div", null,
                                React.createElement(label_1.Label, null, "Organization Name *"),
                                React.createElement(input_1.Input, { value: createFormData.name, onChange: function (e) { return setCreateFormData(__assign(__assign({}, createFormData), { name: e.target.value })); }, placeholder: "e.g. Acme Corp" })),
                            React.createElement("div", null,
                                React.createElement(label_1.Label, null, "Slug *"),
                                React.createElement(input_1.Input, { value: createFormData.slug, onChange: function (e) { return setCreateFormData(__assign(__assign({}, createFormData), { slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })); }, placeholder: "e.g. acme-corp" }))),
                        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                            React.createElement("div", null,
                                React.createElement(label_1.Label, null, "Plan"),
                                React.createElement(select_1.Select, { value: createFormData.plan, onValueChange: function (v) { return setCreateFormData(__assign(__assign({}, createFormData), { plan: v })); } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "trial" }, "Trial"),
                                        React.createElement(select_1.SelectItem, { value: "free" }, "Free"),
                                        React.createElement(select_1.SelectItem, { value: "starter" }, "Starter"),
                                        React.createElement(select_1.SelectItem, { value: "gold" }, "Gold"),
                                        React.createElement(select_1.SelectItem, { value: "professional" }, "Professional"),
                                        React.createElement(select_1.SelectItem, { value: "enterprise" }, "Enterprise")))),
                            React.createElement("div", null,
                                React.createElement(label_1.Label, null, "Max Users"),
                                React.createElement(input_1.Input, { type: "number", value: createFormData.maxUsers, onChange: function (e) { return setCreateFormData(__assign(__assign({}, createFormData), { maxUsers: parseInt(e.target.value) || 10 })); }, min: 1 }))),
                        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                            React.createElement("div", null,
                                React.createElement(label_1.Label, null, "Contact Email"),
                                React.createElement(input_1.Input, { type: "email", value: createFormData.contactEmail, onChange: function (e) { return setCreateFormData(__assign(__assign({}, createFormData), { contactEmail: e.target.value })); }, placeholder: "admin@company.com" })),
                            React.createElement("div", null,
                                React.createElement(label_1.Label, null, "Contact Phone"),
                                React.createElement(input_1.Input, { value: createFormData.contactPhone, onChange: function (e) { return setCreateFormData(__assign(__assign({}, createFormData), { contactPhone: e.target.value })); }, placeholder: "+254..." }))),
                        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                            React.createElement("div", null,
                                React.createElement(label_1.Label, null, "Domain"),
                                React.createElement(input_1.Input, { value: createFormData.domain, onChange: function (e) { return setCreateFormData(__assign(__assign({}, createFormData), { domain: e.target.value })); }, placeholder: "company.com" })),
                            React.createElement("div", null,
                                React.createElement(label_1.Label, null, "Industry"),
                                React.createElement(input_1.Input, { value: createFormData.industry, onChange: function (e) { return setCreateFormData(__assign(__assign({}, createFormData), { industry: e.target.value })); }, placeholder: "e.g. Technology" })))),
                    React.createElement(dialog_1.DialogFooter, null,
                        React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setShowCreateDialog(false); } }, "Cancel"),
                        React.createElement(button_1.Button, { onClick: function () {
                                if (!createFormData.name || !createFormData.slug) {
                                    sonner_1.toast.error("Name and slug are required");
                                    return;
                                }
                                createMutation.mutate({
                                    name: createFormData.name,
                                    slug: createFormData.slug,
                                    plan: createFormData.plan,
                                    maxUsers: createFormData.maxUsers,
                                    domain: createFormData.domain || undefined,
                                    contactEmail: createFormData.contactEmail || undefined,
                                    contactPhone: createFormData.contactPhone || undefined,
                                    industry: createFormData.industry || undefined
                                });
                            }, disabled: createMutation.isPending }, createMutation.isPending ? "Creating..." : "Create Tenant")))))));
}
exports["default"] = EnterpriseTenantsManagement;
