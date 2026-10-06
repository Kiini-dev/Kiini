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
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var badge_1 = require("@/components/ui/badge");
function EnterpriseSettings() {
    var _a, _b;
    var _c = react_1.useState(false), editingProfile = _c[0], setEditingProfile = _c[1];
    var _d = react_1.useState({}), profileForm = _d[0], setProfileForm = _d[1];
    var _e = trpc_1.trpc.settings.getCompanyInfo.useQuery(), companyInfo = _e.data, infoLoading = _e.isLoading, refetchInfo = _e.refetch;
    var _f = trpc_1.trpc.settings.getUserCounts.useQuery(), userCounts = _f.data, countsLoading = _f.isLoading;
    var updateCompanyInfo = trpc_1.trpc.settings.updateCompanyInfo.useMutation({
        onSuccess: function () { sonner_1.toast.success("Company info saved"); refetchInfo(); setEditingProfile(false); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    react_1.useEffect(function () {
        if (companyInfo)
            setProfileForm(companyInfo);
    }, [companyInfo]);
    var totalUsers = userCounts ? Object.values(userCounts).reduce(function (a, b) { return a + b; }, 0) : 0;
    var adminUsers = userCounts ? ((_a = userCounts.super_admin) !== null && _a !== void 0 ? _a : 0) + ((_b = userCounts.admin) !== null && _b !== void 0 ? _b : 0) : 0;
    var PROFILE_FIELDS = [
        { key: 'companyName', label: 'Company Name', placeholder: 'Your Company Name' },
        { key: 'industry', label: 'Industry', placeholder: 'SaaS / Technology' },
        { key: 'email', label: 'Contact Email', placeholder: 'info@yourcompany.com' },
        { key: 'phone', label: 'Phone', placeholder: '+254 700 000 000' },
        { key: 'website', label: 'Website', placeholder: 'https://yourcompany.com' },
        { key: 'address', label: 'Address', placeholder: 'City, Country' },
        { key: 'country', label: 'Country', placeholder: 'Kenya' },
        { key: 'taxPin', label: 'Tax PIN / VAT Number', placeholder: 'P000000000X' },
    ];
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Enterprise Settings", icon: react_1["default"].createElement(lucide_react_1.Building2, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/enterprise/tenants" }, { label: "Enterprise Settings" }] },
        react_1["default"].createElement("div", { className: "grid gap-6 lg:grid-cols-2" },
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-4" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                            react_1["default"].createElement(lucide_react_1.Building2, { className: "h-5 w-5" }),
                            " Company Profile"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Core platform identity information")),
                    !editingProfile ? (react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { return setEditingProfile(true); } },
                        react_1["default"].createElement(lucide_react_1.Pencil, { className: "mr-1.5 h-3.5 w-3.5" }),
                        " Edit")) : (react_1["default"].createElement("div", { className: "flex gap-2" },
                        react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { var _a; setEditingProfile(false); setProfileForm((_a = companyInfo) !== null && _a !== void 0 ? _a : {}); } },
                            react_1["default"].createElement(lucide_react_1.X, { className: "mr-1.5 h-3.5 w-3.5" }),
                            " Cancel"),
                        react_1["default"].createElement(button_1.Button, { size: "sm", disabled: updateCompanyInfo.isPending, onClick: function () { return updateCompanyInfo.mutate(profileForm); } },
                            updateCompanyInfo.isPending ? react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-1.5 h-3.5 w-3.5 animate-spin" }) : react_1["default"].createElement(lucide_react_1.Save, { className: "mr-1.5 h-3.5 w-3.5" }),
                            "Save")))),
                react_1["default"].createElement(card_1.CardContent, null, infoLoading ? (react_1["default"].createElement("div", { className: "flex justify-center py-8" },
                    react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-5 w-5 animate-spin" }))) : (react_1["default"].createElement("div", { className: "space-y-4" }, PROFILE_FIELDS.map(function (_a) {
                    var _b, _c;
                    var key = _a.key, label = _a.label, placeholder = _a.placeholder;
                    return (react_1["default"].createElement("div", { key: key, className: "space-y-1" },
                        react_1["default"].createElement(label_1.Label, { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide" }, label),
                        editingProfile ? (react_1["default"].createElement(input_1.Input, { value: (_b = profileForm[key]) !== null && _b !== void 0 ? _b : '', placeholder: placeholder, onChange: function (e) { return setProfileForm(function (prev) {
                                var _a;
                                return (__assign(__assign({}, prev), (_a = {}, _a[key] = e.target.value, _a)));
                            }); } })) : (react_1["default"].createElement("p", { className: "text-sm font-medium" }, ((_c = companyInfo) === null || _c === void 0 ? void 0 : _c[key]) || react_1["default"].createElement("span", { className: "text-muted-foreground italic" }, "Not set")))));
                }))))),
            react_1["default"].createElement("div", { className: "space-y-6" },
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                            react_1["default"].createElement(lucide_react_1.Users, { className: "h-5 w-5" }),
                            " Platform Users"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Across all organizations")),
                    react_1["default"].createElement(card_1.CardContent, null, countsLoading ? (react_1["default"].createElement("div", { className: "flex justify-center py-4" },
                        react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-5 w-5 animate-spin" }))) : (react_1["default"].createElement("div", { className: "space-y-3" },
                        react_1["default"].createElement("div", { className: "flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2" },
                            react_1["default"].createElement("span", { className: "text-sm font-medium" }, "Total Users"),
                            react_1["default"].createElement(badge_1.Badge, { variant: "secondary" }, totalUsers)),
                        react_1["default"].createElement("div", { className: "flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2" },
                            react_1["default"].createElement("span", { className: "text-sm font-medium" }, "Admins"),
                            react_1["default"].createElement(badge_1.Badge, { variant: "secondary" }, adminUsers)),
                        userCounts && Object.entries(userCounts).map(function (_a) {
                            var role = _a[0], count = _a[1];
                            return (react_1["default"].createElement("div", { key: role, className: "flex items-center justify-between px-3 py-1.5 border rounded-lg" },
                                react_1["default"].createElement("span", { className: "text-sm capitalize" }, role.replace(/_/g, ' ')),
                                react_1["default"].createElement("span", { className: "text-sm font-semibold" }, count)));
                        }))))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                            react_1["default"].createElement(lucide_react_1.Globe, { className: "h-5 w-5" }),
                            " Integration Status"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Configured via environment variables")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "space-y-2" }, [
                            { name: 'Stripe Payments', key: 'stripe' },
                            { name: "M-Pesa (Africa's Talking)", key: 'mpesa' },
                            { name: 'Google OAuth', key: 'oauth' },
                            { name: 'SMTP Email', key: 'smtp' },
                            { name: 'AWS S3 Storage', key: 's3' },
                            { name: 'Anthropic AI', key: 'ai' },
                        ].map(function (_a) {
                            var name = _a.name;
                            return (react_1["default"].createElement("div", { key: name, className: "flex items-center justify-between rounded-lg border px-3 py-2" },
                                react_1["default"].createElement("span", { className: "text-sm" }, name),
                                react_1["default"].createElement("span", { className: "text-xs text-muted-foreground" }, "Env vars")));
                        })))))),
        react_1["default"].createElement(card_1.Card, null,
            react_1["default"].createElement(card_1.CardHeader, null,
                react_1["default"].createElement(card_1.CardTitle, null, "Security & Compliance"),
                react_1["default"].createElement(card_1.CardDescription, null, "Platform security configuration \u2014 managed via system settings")),
            react_1["default"].createElement(card_1.CardContent, null,
                react_1["default"].createElement("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3" }, [
                    { name: 'JWT Authentication', status: 'Active', ok: true },
                    { name: 'Password Hashing', status: 'bcrypt (10 rounds)', ok: true },
                    { name: 'Rate Limiting', status: 'Active', ok: true },
                    { name: 'RBAC Permissions', status: 'Active', ok: true },
                    { name: 'Org Scope Isolation', status: 'Active', ok: true },
                    { name: 'CSRF Protection', status: 'JWT mode', ok: true },
                ].map(function (item) { return (react_1["default"].createElement("div", { key: item.name, className: "flex items-center gap-3 rounded-lg border p-3" },
                    item.ok
                        ? react_1["default"].createElement(lucide_react_1.CheckCircle2, { className: "h-4 w-4 shrink-0 text-green-500" })
                        : react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 shrink-0 text-yellow-500" }),
                    react_1["default"].createElement("div", { className: "min-w-0" },
                        react_1["default"].createElement("p", { className: "text-sm font-medium leading-tight" }, item.name),
                        react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" }, item.status)))); }))))));
}
exports["default"] = EnterpriseSettings;
