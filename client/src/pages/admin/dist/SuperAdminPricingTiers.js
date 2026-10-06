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
var react_1 = require("react");
var useAuth_1 = require("@/_core/hooks/useAuth");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var badge_1 = require("@/components/ui/badge");
var switch_1 = require("@/components/ui/switch");
var separator_1 = require("@/components/ui/separator");
var textarea_1 = require("@/components/ui/textarea");
var dialog_1 = require("@/components/ui/dialog");
var table_1 = require("@/components/ui/table");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
// ─── Module list (mirrors ORG_MODULES on server) ─────────────────────────────
var ORG_MODULES = [
    { key: "crm", label: "CRM" },
    { key: "projects", label: "Projects & Tasks" },
    { key: "hr", label: "HR Management" },
    { key: "payroll", label: "Payroll" },
    { key: "leave", label: "Leave Management" },
    { key: "attendance", label: "Attendance" },
    { key: "invoicing", label: "Invoicing & Billing" },
    { key: "payments", label: "Payments" },
    { key: "expenses", label: "Expenses" },
    { key: "procurement", label: "Procurement" },
    { key: "accounting", label: "Accounting" },
    { key: "budgets", label: "Budgets" },
    { key: "reports", label: "Reports & Analytics" },
    { key: "ai_hub", label: "AI Hub" },
    { key: "communications", label: "Communications" },
    { key: "tickets", label: "Support Tickets" },
    { key: "contracts", label: "Contracts & Assets" },
    { key: "work_orders", label: "Work Orders" },
];
var PLAN_ORDER = ["trial", "starter", "gold", "professional", "enterprise", "custom"];
function planBadgeClass(key) {
    switch (key) {
        case "trial": return "border-gray-500/40 bg-gray-500/10 text-gray-700 dark:text-gray-400";
        case "starter": return "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-400";
        case "gold": return "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400";
        case "professional": return "border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-400";
        case "enterprise": return "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400";
        default: return "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400";
    }
}
function planHeaderColor(key) {
    switch (key) {
        case "trial": return "from-gray-200/60 to-gray-100/30 dark:from-gray-600/30 dark:to-gray-700/10 border-gray-400/30 dark:border-gray-500/30";
        case "starter": return "from-blue-200/60 to-blue-100/30 dark:from-blue-600/30 dark:to-blue-700/10 border-blue-400/30 dark:border-blue-500/30";
        case "gold": return "from-green-200/60 to-green-100/30 dark:from-green-600/30 dark:to-green-700/10 border-green-400/30 dark:border-green-500/30";
        case "professional": return "from-purple-200/60 to-purple-100/30 dark:from-purple-600/30 dark:to-purple-700/10 border-purple-400/30 dark:border-purple-500/30";
        case "enterprise": return "from-amber-200/60 to-amber-100/30 dark:from-amber-600/30 dark:to-amber-700/10 border-amber-400/30 dark:border-amber-500/30";
        default: return "from-green-200/60 to-green-100/30 dark:from-green-600/30 dark:to-green-700/10 border-green-400/30 dark:border-green-500/30";
    }
}
function CreateTierDialog(_a) {
    var open = _a.open, onOpenChange = _a.onOpenChange, onCreated = _a.onCreated;
    var _b = react_1.useState(""), key = _b[0], setKey = _b[1];
    var _c = react_1.useState(""), label = _c[0], setLabel = _c[1];
    var _d = react_1.useState(""), description = _d[0], setDescription = _d[1];
    var _e = react_1.useState(0), monthlyKes = _e[0], setMonthlyKes = _e[1];
    var _f = react_1.useState(0), annualKes = _f[0], setAnnualKes = _f[1];
    var _g = react_1.useState(10), maxUsers = _g[0], setMaxUsers = _g[1];
    var _h = react_1.useState(Object.fromEntries(ORG_MODULES.map(function (m) { return [m.key, false]; }))), features = _h[0], setFeatures = _h[1];
    var createMutation = trpc_1.trpc.multiTenancy.createPricingTier.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Pricing tier created", { description: "Tier \"" + label + "\" has been added." });
            onCreated();
            onOpenChange(false);
            reset();
        },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var reset = function () {
        setKey("");
        setLabel("");
        setDescription("");
        setMonthlyKes(0);
        setAnnualKes(0);
        setMaxUsers(10);
        setFeatures(Object.fromEntries(ORG_MODULES.map(function (m) { return [m.key, false]; })));
    };
    var handleCreate = function () {
        if (!key || !label) {
            sonner_1.toast.error("Tier key and label are required");
            return;
        }
        if (!/^[a-z0-9_]+$/.test(key)) {
            sonner_1.toast.error("Key must be lowercase letters, numbers, underscores only");
            return;
        }
        createMutation.mutate({ key: key, label: label, description: description, monthlyKes: monthlyKes, annualKes: annualKes, maxUsers: maxUsers, features: features });
    };
    var toggleAll = function (enabled) {
        setFeatures(Object.fromEntries(ORG_MODULES.map(function (m) { return [m.key, enabled]; })));
    };
    return (react_1["default"].createElement(dialog_1.Dialog, { open: open, onOpenChange: function (v) { if (!v)
            reset(); onOpenChange(v); } },
        react_1["default"].createElement(dialog_1.DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto" },
            react_1["default"].createElement(dialog_1.DialogHeader, null,
                react_1["default"].createElement(dialog_1.DialogTitle, null, "Create New Pricing Tier"),
                react_1["default"].createElement(dialog_1.DialogDescription, null, "Define a new plan with pricing and module access.")),
            react_1["default"].createElement("div", { className: "space-y-5" },
                react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                    react_1["default"].createElement("div", { className: "space-y-1.5" },
                        react_1["default"].createElement(label_1.Label, null,
                            "Tier Key ",
                            react_1["default"].createElement("span", { className: "text-red-400" }, "*")),
                        react_1["default"].createElement(input_1.Input, { value: key, onChange: function (e) { return setKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")); }, placeholder: "e.g. growth_plan" }),
                        react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" }, "lowercase, underscores only")),
                    react_1["default"].createElement("div", { className: "space-y-1.5" },
                        react_1["default"].createElement(label_1.Label, null,
                            "Display Label ",
                            react_1["default"].createElement("span", { className: "text-red-400" }, "*")),
                        react_1["default"].createElement(input_1.Input, { value: label, onChange: function (e) { return setLabel(e.target.value); }, placeholder: "e.g. Growth Plan" }))),
                react_1["default"].createElement("div", { className: "space-y-1.5" },
                    react_1["default"].createElement(label_1.Label, null, "Description"),
                    react_1["default"].createElement(textarea_1.Textarea, { value: description, onChange: function (e) { return setDescription(e.target.value); }, placeholder: "Brief description of this plan", rows: 2 })),
                react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" },
                    react_1["default"].createElement("div", { className: "space-y-1.5" },
                        react_1["default"].createElement(label_1.Label, null, "Monthly Price (KES)"),
                        react_1["default"].createElement(input_1.Input, { type: "number", min: 0, value: monthlyKes, onChange: function (e) {
                                var val = Number(e.target.value);
                                setMonthlyKes(val);
                                // Auto-calculate annual: 10 months (2 months free / ~17% discount)
                                if (val > 0)
                                    setAnnualKes(Math.round(val * 10));
                            } })),
                    react_1["default"].createElement("div", { className: "space-y-1.5" },
                        react_1["default"].createElement(label_1.Label, null,
                            "Annual Price (KES) ",
                            react_1["default"].createElement("span", { className: "text-xs text-muted-foreground ml-1" }, "auto: 10\u00D7 monthly")),
                        react_1["default"].createElement(input_1.Input, { type: "number", min: 0, value: annualKes, onChange: function (e) { return setAnnualKes(Number(e.target.value)); } })),
                    react_1["default"].createElement("div", { className: "space-y-1.5" },
                        react_1["default"].createElement(label_1.Label, null, "Max Users"),
                        react_1["default"].createElement(input_1.Input, { type: "number", min: 1, value: maxUsers, onChange: function (e) { return setMaxUsers(Number(e.target.value)); } }))),
                react_1["default"].createElement("div", { className: "space-y-3" },
                    react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                        react_1["default"].createElement(label_1.Label, { className: "text-sm font-semibold" }, "Included Modules"),
                        react_1["default"].createElement("div", { className: "flex gap-2" },
                            react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "h-7 text-xs", onClick: function () { return toggleAll(true); } }, "All"),
                            react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "h-7 text-xs", onClick: function () { return toggleAll(false); } }, "None"))),
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2" }, ORG_MODULES.map(function (mod) {
                        var _a;
                        return (react_1["default"].createElement("div", { key: mod.key, className: "flex items-center justify-between rounded-md border border-border bg-muted/50 px-3 py-2" },
                            react_1["default"].createElement("span", { className: "text-sm text-foreground/80" }, mod.label),
                            react_1["default"].createElement(switch_1.Switch, { checked: (_a = features[mod.key]) !== null && _a !== void 0 ? _a : false, onCheckedChange: function (v) { return setFeatures(function (f) {
                                    var _a;
                                    return (__assign(__assign({}, f), (_a = {}, _a[mod.key] = v, _a)));
                                }); } })));
                    })))),
            react_1["default"].createElement(dialog_1.DialogFooter, null,
                react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { reset(); onOpenChange(false); } },
                    react_1["default"].createElement(lucide_react_1.X, { className: "mr-2 h-4 w-4" }),
                    "Cancel"),
                react_1["default"].createElement(button_1.Button, { onClick: handleCreate, disabled: createMutation.isPending },
                    react_1["default"].createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
                    createMutation.isPending ? "Creating…" : "Create Tier")))));
}
function EditTierDialog(_a) {
    var open = _a.open, onOpenChange = _a.onOpenChange, tierKey = _a.tierKey, tierLabel = _a.tierLabel, priceData = _a.priceData, currentFeatures = _a.currentFeatures, onSaved = _a.onSaved;
    var _b = react_1.useState(tierLabel), label = _b[0], setLabel = _b[1];
    var _c = react_1.useState(priceData.description), description = _c[0], setDescription = _c[1];
    var _d = react_1.useState(priceData.monthlyKes), monthlyKes = _d[0], setMonthlyKes = _d[1];
    var _e = react_1.useState(priceData.annualKes), annualKes = _e[0], setAnnualKes = _e[1];
    var _f = react_1.useState(priceData.maxUsers), maxUsers = _f[0], setMaxUsers = _f[1];
    var _g = react_1.useState(currentFeatures), features = _g[0], setFeatures = _g[1];
    react_1["default"].useEffect(function () {
        if (open) {
            setLabel(tierLabel);
            setDescription(priceData.description);
            setMonthlyKes(priceData.monthlyKes);
            setAnnualKes(priceData.annualKes);
            setMaxUsers(priceData.maxUsers);
            setFeatures(currentFeatures);
        }
    }, [open, tierKey, tierLabel, priceData, currentFeatures]);
    var updateMutation = trpc_1.trpc.multiTenancy.updatePricingTier.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Tier updated", { description: "\"" + label + "\" has been saved." });
            onSaved();
            onOpenChange(false);
        },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var toggleAll = function (enabled) {
        setFeatures(Object.fromEntries(ORG_MODULES.map(function (m) { return [m.key, enabled]; })));
    };
    return (react_1["default"].createElement(dialog_1.Dialog, { open: open, onOpenChange: onOpenChange },
        react_1["default"].createElement(dialog_1.DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto" },
            react_1["default"].createElement(dialog_1.DialogHeader, null,
                react_1["default"].createElement(dialog_1.DialogTitle, null,
                    "Edit Tier \u2014 ",
                    tierLabel),
                react_1["default"].createElement(dialog_1.DialogDescription, null, "Modify pricing, limits, and module access for this plan.")),
            react_1["default"].createElement("div", { className: "space-y-5" },
                react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-4" },
                    react_1["default"].createElement("div", { className: "space-y-1.5" },
                        react_1["default"].createElement(label_1.Label, null, "Tier Key"),
                        react_1["default"].createElement(input_1.Input, { value: tierKey, disabled: true, className: "opacity-60" }),
                        react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" }, "Cannot be changed after creation")),
                    react_1["default"].createElement("div", { className: "space-y-1.5" },
                        react_1["default"].createElement(label_1.Label, null, "Display Label"),
                        react_1["default"].createElement(input_1.Input, { value: label, onChange: function (e) { return setLabel(e.target.value); } }))),
                react_1["default"].createElement("div", { className: "space-y-1.5" },
                    react_1["default"].createElement(label_1.Label, null, "Description"),
                    react_1["default"].createElement(textarea_1.Textarea, { value: description, onChange: function (e) { return setDescription(e.target.value); }, rows: 2 })),
                react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" },
                    react_1["default"].createElement("div", { className: "space-y-1.5" },
                        react_1["default"].createElement(label_1.Label, null, "Monthly Price (KES)"),
                        react_1["default"].createElement(input_1.Input, { type: "number", min: 0, value: monthlyKes, onChange: function (e) {
                                var val = Number(e.target.value);
                                setMonthlyKes(val);
                                if (val > 0)
                                    setAnnualKes(Math.round(val * 10));
                            } })),
                    react_1["default"].createElement("div", { className: "space-y-1.5" },
                        react_1["default"].createElement(label_1.Label, null,
                            "Annual Price (KES) ",
                            react_1["default"].createElement("span", { className: "text-xs text-muted-foreground ml-1" }, "auto: 10\u00D7 monthly")),
                        react_1["default"].createElement(input_1.Input, { type: "number", min: 0, value: annualKes, onChange: function (e) { return setAnnualKes(Number(e.target.value)); } })),
                    react_1["default"].createElement("div", { className: "space-y-1.5" },
                        react_1["default"].createElement(label_1.Label, null, "Max Users"),
                        react_1["default"].createElement(input_1.Input, { type: "number", min: 0, value: maxUsers, onChange: function (e) { return setMaxUsers(Number(e.target.value)); } }))),
                react_1["default"].createElement("div", { className: "space-y-3" },
                    react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                        react_1["default"].createElement(label_1.Label, { className: "text-sm font-semibold" }, "Included Modules"),
                        react_1["default"].createElement("div", { className: "flex gap-2" },
                            react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "h-7 text-xs", onClick: function () { return toggleAll(true); } }, "All"),
                            react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "h-7 text-xs", onClick: function () { return toggleAll(false); } }, "None"))),
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2" }, ORG_MODULES.map(function (mod) {
                        var _a;
                        return (react_1["default"].createElement("div", { key: mod.key, className: "flex items-center justify-between rounded-md border border-border bg-muted/50 px-3 py-2" },
                            react_1["default"].createElement("span", { className: "text-sm text-foreground/80" }, mod.label),
                            react_1["default"].createElement(switch_1.Switch, { checked: (_a = features[mod.key]) !== null && _a !== void 0 ? _a : false, onCheckedChange: function (v) { return setFeatures(function (f) {
                                    var _a;
                                    return (__assign(__assign({}, f), (_a = {}, _a[mod.key] = v, _a)));
                                }); } })));
                    })))),
            react_1["default"].createElement(dialog_1.DialogFooter, null,
                react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return onOpenChange(false); } }, "Cancel"),
                react_1["default"].createElement(button_1.Button, { onClick: function () { return updateMutation.mutate({ key: tierKey, label: label, description: description, monthlyKes: monthlyKes, annualKes: annualKes, maxUsers: maxUsers, features: features }); }, disabled: updateMutation.isPending },
                    react_1["default"].createElement(lucide_react_1.Save, { className: "mr-2 h-4 w-4" }),
                    updateMutation.isPending ? "Saving…" : "Save Changes")))));
}
function DeleteTierDialog(_a) {
    var open = _a.open, onOpenChange = _a.onOpenChange, tierKey = _a.tierKey, tierLabel = _a.tierLabel, onDeleted = _a.onDeleted;
    var deleteMutation = trpc_1.trpc.multiTenancy.deletePricingTier.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Tier deleted", { description: "\"" + tierLabel + "\" has been removed." });
            onDeleted();
            onOpenChange(false);
        },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    return (react_1["default"].createElement(dialog_1.Dialog, { open: open, onOpenChange: onOpenChange },
        react_1["default"].createElement(dialog_1.DialogContent, { className: "max-w-md" },
            react_1["default"].createElement(dialog_1.DialogHeader, null,
                react_1["default"].createElement(dialog_1.DialogTitle, null, "Delete Pricing Tier"),
                react_1["default"].createElement(dialog_1.DialogDescription, null,
                    "Are you sure you want to permanently delete the ",
                    react_1["default"].createElement("strong", null, tierLabel),
                    " tier? This will remove all associated pricing and module configurations. Organizations currently on this tier will not be affected.")),
            react_1["default"].createElement(dialog_1.DialogFooter, null,
                react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return onOpenChange(false); } }, "Cancel"),
                react_1["default"].createElement(button_1.Button, { variant: "destructive", onClick: function () { return deleteMutation.mutate({ key: tierKey }); }, disabled: deleteMutation.isPending },
                    react_1["default"].createElement(lucide_react_1.Trash2, { className: "mr-2 h-4 w-4" }),
                    deleteMutation.isPending ? "Deleting…" : "Delete Tier")))));
}
function ComparisonTable(_a) {
    var planKeys = _a.planKeys, prices = _a.prices, tierFeatures = _a.tierFeatures;
    if (planKeys.length === 0)
        return null;
    return (react_1["default"].createElement("div", { className: "border rounded-lg overflow-x-auto" },
        react_1["default"].createElement(table_1.Table, null,
            react_1["default"].createElement(table_1.TableHeader, null,
                react_1["default"].createElement(table_1.TableRow, { className: "bg-muted/50" },
                    react_1["default"].createElement(table_1.TableHead, { className: "min-w-[180px] font-semibold sticky left-0 bg-muted/50 z-10" }, "Feature / Plan"),
                    planKeys.map(function (key) {
                        var _a;
                        return (react_1["default"].createElement(table_1.TableHead, { key: key, className: "text-center min-w-[150px]" },
                            react_1["default"].createElement("div", { className: "inline-flex flex-col items-center gap-1 rounded-lg px-3 py-2 bg-gradient-to-b " + planHeaderColor(key) },
                                react_1["default"].createElement("span", { className: "font-bold text-sm capitalize" }, ((_a = prices[key]) === null || _a === void 0 ? void 0 : _a.label) || key),
                                react_1["default"].createElement(badge_1.Badge, { variant: "outline", className: "text-[10px] " + planBadgeClass(key) }, key))));
                    }))),
            react_1["default"].createElement(table_1.TableBody, null,
                react_1["default"].createElement(table_1.TableRow, { className: "bg-muted/20 font-medium" },
                    react_1["default"].createElement(table_1.TableCell, { className: "sticky left-0 bg-muted/20 z-10" },
                        react_1["default"].createElement("span", { className: "flex items-center gap-2" },
                            react_1["default"].createElement(lucide_react_1.DollarSign, { className: "h-3.5 w-3.5 text-green-600 dark:text-green-400" }),
                            "Monthly Price (KES)")),
                    planKeys.map(function (key) {
                        var _a, _b;
                        return (react_1["default"].createElement(table_1.TableCell, { key: key, className: "text-center font-semibold" }, (((_a = prices[key]) === null || _a === void 0 ? void 0 : _a.monthlyKes) || 0) === 0 ? react_1["default"].createElement("span", { className: "text-muted-foreground" }, "Free") : "KES " + (((_b = prices[key]) === null || _b === void 0 ? void 0 : _b.monthlyKes) || 0).toLocaleString()));
                    })),
                react_1["default"].createElement(table_1.TableRow, { className: "bg-muted/20 font-medium" },
                    react_1["default"].createElement(table_1.TableCell, { className: "sticky left-0 bg-muted/20 z-10" },
                        react_1["default"].createElement("span", { className: "flex items-center gap-2" },
                            react_1["default"].createElement(lucide_react_1.DollarSign, { className: "h-3.5 w-3.5 text-green-600 dark:text-green-400" }),
                            "Annual Price (KES)")),
                    planKeys.map(function (key) {
                        var _a, _b;
                        return (react_1["default"].createElement(table_1.TableCell, { key: key, className: "text-center font-semibold" }, (((_a = prices[key]) === null || _a === void 0 ? void 0 : _a.annualKes) || 0) === 0 ? react_1["default"].createElement("span", { className: "text-muted-foreground" }, "Free") : "KES " + (((_b = prices[key]) === null || _b === void 0 ? void 0 : _b.annualKes) || 0).toLocaleString()));
                    })),
                react_1["default"].createElement(table_1.TableRow, { className: "bg-muted/20 font-medium" },
                    react_1["default"].createElement(table_1.TableCell, { className: "sticky left-0 bg-muted/20 z-10" },
                        react_1["default"].createElement("span", { className: "flex items-center gap-2" },
                            react_1["default"].createElement(lucide_react_1.Users, { className: "h-3.5 w-3.5 text-blue-600 dark:text-blue-400" }),
                            "Max Users")),
                    planKeys.map(function (key) {
                        var _a, _b, _c;
                        return (react_1["default"].createElement(table_1.TableCell, { key: key, className: "text-center font-semibold" }, (((_a = prices[key]) === null || _a === void 0 ? void 0 : _a.maxUsers) || 0) === 0 ? "Unlimited" : (_c = (_b = prices[key]) === null || _b === void 0 ? void 0 : _b.maxUsers) === null || _c === void 0 ? void 0 : _c.toLocaleString()));
                    })),
                react_1["default"].createElement(table_1.TableRow, null,
                    react_1["default"].createElement(table_1.TableCell, { colSpan: planKeys.length + 1, className: "py-1 px-0" },
                        react_1["default"].createElement(separator_1.Separator, null))),
                ORG_MODULES.map(function (mod) { return (react_1["default"].createElement(table_1.TableRow, { key: mod.key, className: "hover:bg-muted/30" },
                    react_1["default"].createElement(table_1.TableCell, { className: "sticky left-0 bg-background z-10" },
                        react_1["default"].createElement("span", { className: "text-sm" }, mod.label)),
                    planKeys.map(function (planKey) {
                        var _a, _b;
                        var enabled = (_b = (_a = tierFeatures[planKey]) === null || _a === void 0 ? void 0 : _a[mod.key]) !== null && _b !== void 0 ? _b : false;
                        return (react_1["default"].createElement(table_1.TableCell, { key: planKey, className: "text-center" }, enabled ? (react_1["default"].createElement(lucide_react_1.Check, { className: "h-4 w-4 text-green-500 mx-auto" })) : (react_1["default"].createElement(lucide_react_1.Minus, { className: "h-4 w-4 text-muted-foreground/40 mx-auto" }))));
                    }))); }),
                react_1["default"].createElement(table_1.TableRow, { className: "bg-muted/30 font-medium border-t-2" },
                    react_1["default"].createElement(table_1.TableCell, { className: "sticky left-0 bg-muted/30 z-10" },
                        react_1["default"].createElement("span", { className: "flex items-center gap-2" },
                            react_1["default"].createElement(lucide_react_1.Layers, { className: "h-3.5 w-3.5 text-purple-600 dark:text-purple-400" }),
                            "Total Modules")),
                    planKeys.map(function (planKey) {
                        var count = ORG_MODULES.filter(function (m) { var _a; return (_a = tierFeatures[planKey]) === null || _a === void 0 ? void 0 : _a[m.key]; }).length;
                        return (react_1["default"].createElement(table_1.TableCell, { key: planKey, className: "text-center font-bold" },
                            count,
                            " / ",
                            ORG_MODULES.length));
                    }))))));
}
function PlanCard(_a) {
    var planKey = _a.planKey, priceData = _a.priceData, features = _a.features, onEdit = _a.onEdit, onDelete = _a.onDelete;
    var enabledCount = Object.values(features).filter(Boolean).length;
    return (react_1["default"].createElement(card_1.Card, { className: "relative overflow-hidden" },
        react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
            react_1["default"].createElement("div", { className: "flex items-start justify-between" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("div", { className: "flex items-center gap-2 mb-1" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-base capitalize" }, priceData.label || planKey),
                        react_1["default"].createElement(badge_1.Badge, { variant: "outline", className: "text-xs " + planBadgeClass(planKey) }, planKey)),
                    react_1["default"].createElement(card_1.CardDescription, { className: "text-xs" }, priceData.description)),
                react_1["default"].createElement("div", { className: "flex gap-1" },
                    react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground", onClick: function () { return onEdit(planKey); } },
                        react_1["default"].createElement(lucide_react_1.Edit2, { className: "h-3 w-3" }),
                        "Edit"),
                    react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "h-7 text-xs gap-1.5 text-destructive hover:text-red-400", onClick: function () { return onDelete(planKey); } },
                        react_1["default"].createElement(lucide_react_1.Trash2, { className: "h-3 w-3" }))))),
        react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
            react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3" },
                react_1["default"].createElement("div", { className: "space-y-1" },
                    react_1["default"].createElement("p", { className: "text-xs text-muted-foreground flex items-center gap-1" },
                        react_1["default"].createElement(lucide_react_1.DollarSign, { className: "h-3 w-3" }),
                        "Monthly (KES)"),
                    react_1["default"].createElement("p", { className: "text-lg font-bold" }, priceData.monthlyKes === 0 ? react_1["default"].createElement("span", { className: "text-muted-foreground text-base" }, "Free") : "KES " + priceData.monthlyKes.toLocaleString())),
                react_1["default"].createElement("div", { className: "space-y-1" },
                    react_1["default"].createElement("p", { className: "text-xs text-muted-foreground flex items-center gap-1" },
                        react_1["default"].createElement(lucide_react_1.DollarSign, { className: "h-3 w-3" }),
                        "Annual (KES)"),
                    react_1["default"].createElement("p", { className: "text-lg font-bold" }, priceData.annualKes === 0 ? react_1["default"].createElement("span", { className: "text-muted-foreground text-base" }, "Free") : "KES " + priceData.annualKes.toLocaleString())),
                react_1["default"].createElement("div", { className: "space-y-1" },
                    react_1["default"].createElement("p", { className: "text-xs text-muted-foreground flex items-center gap-1" },
                        react_1["default"].createElement(lucide_react_1.Users, { className: "h-3 w-3" }),
                        "Max Users"),
                    react_1["default"].createElement("p", { className: "text-lg font-bold" }, priceData.maxUsers === 0 ? "Unlimited" : priceData.maxUsers.toLocaleString()))),
            react_1["default"].createElement("div", null,
                react_1["default"].createElement("p", { className: "text-xs text-muted-foreground mb-2" },
                    "Modules (",
                    enabledCount,
                    "/",
                    ORG_MODULES.length,
                    ")"),
                react_1["default"].createElement("div", { className: "flex flex-wrap gap-1" }, ORG_MODULES.map(function (mod) { return (react_1["default"].createElement("span", { key: mod.key, className: "text-xs px-2 py-0.5 rounded-full border " + (features[mod.key]
                        ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
                        : "border-border bg-muted text-muted-foreground") }, mod.label)); }))))));
}
function SuperAdminPricingTiers() {
    var _a, _b, _c, _d, _e, _f;
    var user = useAuth_1.useAuth().user;
    var _g = react_1.useState(false), createOpen = _g[0], setCreateOpen = _g[1];
    var _h = react_1.useState(null), editTierKey = _h[0], setEditTierKey = _h[1];
    var _j = react_1.useState(null), deleteTierKey = _j[0], setDeleteTierKey = _j[1];
    var _k = react_1.useState("cards"), viewMode = _k[0], setViewMode = _k[1];
    // Access guard
    if (user && (user.role !== "super_admin" || user.organizationId)) {
        return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Pricing Tiers", description: "Manage subscription plans and modules", icon: react_1["default"].createElement(lucide_react_1.DollarSign, { className: "h-6 w-6" }), breadcrumbs: [
                { label: "Dashboard", href: "/" },
                { label: "Admin", href: "/admin" },
                { label: "Pricing Tiers" },
            ] },
            react_1["default"].createElement("div", { className: "flex flex-col items-center justify-center py-24 text-center" },
                react_1["default"].createElement(lucide_react_1.ShieldOff, { className: "h-16 w-16 text-muted-foreground mb-4" }),
                react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-2" }, "Access Denied"),
                react_1["default"].createElement("p", { className: "text-muted-foreground max-w-sm" }, "Only global administrators can manage pricing tiers."))));
    }
    var _l = trpc_1.trpc.multiTenancy.getPlanPrices.useQuery({}), priceData = _l.data, pricesLoading = _l.isLoading, refetchPrices = _l.refetch;
    var _m = trpc_1.trpc.multiTenancy.getAllPricingTierFeatures.useQuery({}), featuresData = _m.data, featuresLoading = _m.isLoading, refetchFeatures = _m.refetch;
    var prices = (_a = priceData === null || priceData === void 0 ? void 0 : priceData.prices) !== null && _a !== void 0 ? _a : {};
    var tierFeatures = (_b = featuresData === null || featuresData === void 0 ? void 0 : featuresData.tiers) !== null && _b !== void 0 ? _b : {};
    // Ordered plan keys: known plans first, then any custom tiers — all sorted by price ascending
    var knownKeys = PLAN_ORDER.filter(function (k) { return Boolean(prices[k]); });
    var customKeys = Object.keys(prices).filter(function (k) { return !PLAN_ORDER.includes(k); });
    var allKeys = __spreadArrays(knownKeys, customKeys);
    // Auto-sort by monthly price ascending (free/trial at top, enterprise at bottom)
    var planKeys = allKeys.sort(function (a, b) {
        var _a, _b, _c, _d;
        var priceA = Number((_b = (_a = prices[a]) === null || _a === void 0 ? void 0 : _a.monthlyKes) !== null && _b !== void 0 ? _b : 0);
        var priceB = Number((_d = (_c = prices[b]) === null || _c === void 0 ? void 0 : _c.monthlyKes) !== null && _d !== void 0 ? _d : 0);
        return priceA - priceB;
    });
    var refetchAll = function () { refetchPrices(); refetchFeatures(); };
    var isLoading = pricesLoading || featuresLoading;
    var editingTier = editTierKey
        ? {
            key: editTierKey,
            label: ((_c = prices[editTierKey]) === null || _c === void 0 ? void 0 : _c.label) || editTierKey,
            priceData: prices[editTierKey] || { monthlyKes: 0, annualKes: 0, maxUsers: 10, description: "" },
            features: (_d = tierFeatures[editTierKey]) !== null && _d !== void 0 ? _d : {}
        }
        : null;
    var deletingTier = deleteTierKey
        ? { key: deleteTierKey, label: ((_e = prices[deleteTierKey]) === null || _e === void 0 ? void 0 : _e.label) || deleteTierKey }
        : null;
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Pricing Tiers", description: "Manage subscription plans, pricing, and included modules for all organizations", icon: react_1["default"].createElement(lucide_react_1.DollarSign, { className: "h-6 w-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Admin", href: "/admin" },
            { label: "Pricing Tiers" },
        ] },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                    react_1["default"].createElement(button_1.Button, { variant: viewMode === "cards" ? "default" : "outline", size: "sm", onClick: function () { return setViewMode("cards"); } },
                        react_1["default"].createElement(lucide_react_1.LayoutGrid, { className: "mr-2 h-4 w-4" }),
                        "Cards"),
                    react_1["default"].createElement(button_1.Button, { variant: viewMode === "comparison" ? "default" : "outline", size: "sm", onClick: function () { return setViewMode("comparison"); } },
                        react_1["default"].createElement(lucide_react_1.TableProperties, { className: "mr-2 h-4 w-4" }),
                        "Comparison Table")),
                react_1["default"].createElement(button_1.Button, { size: "sm", onClick: function () { return setCreateOpen(true); } },
                    react_1["default"].createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
                    "New Tier")),
            react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" },
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardContent, { className: "flex items-center gap-3 pt-4 pb-4" },
                        react_1["default"].createElement("div", { className: "rounded-lg bg-blue-600/10 border border-blue-500/20 p-2" },
                            react_1["default"].createElement(lucide_react_1.Layers, { className: "h-5 w-5 text-blue-600 dark:text-blue-400" })),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("p", { className: "text-2xl font-bold" }, planKeys.length),
                            react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" }, "Total Tiers")))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardContent, { className: "flex items-center gap-3 pt-4 pb-4" },
                        react_1["default"].createElement("div", { className: "rounded-lg bg-green-600/10 border border-green-500/20 p-2" },
                            react_1["default"].createElement(lucide_react_1.DollarSign, { className: "h-5 w-5 text-green-600 dark:text-green-400" })),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("p", { className: "text-2xl font-bold" },
                                "KES ",
                                (((_f = prices["professional"]) === null || _f === void 0 ? void 0 : _f.monthlyKes) || 0).toLocaleString()),
                            react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" }, "Professional / month")))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardContent, { className: "flex items-center gap-3 pt-4 pb-4" },
                        react_1["default"].createElement("div", { className: "rounded-lg bg-purple-600/10 border border-purple-500/20 p-2" },
                            react_1["default"].createElement(lucide_react_1.CheckCircle2, { className: "h-5 w-5 text-purple-400" })),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("p", { className: "text-2xl font-bold" }, ORG_MODULES.length),
                            react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" }, "Available Modules"))))),
            react_1["default"].createElement(separator_1.Separator, null),
            isLoading ? (react_1["default"].createElement("div", { className: "flex items-center justify-center py-20" },
                react_1["default"].createElement("div", { className: "h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" }))) : planKeys.length === 0 ? (react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "flex flex-col items-center justify-center py-16 text-center" },
                    react_1["default"].createElement(lucide_react_1.Layers, { className: "h-12 w-12 text-muted-foreground mb-4" }),
                    react_1["default"].createElement("h3", { className: "font-semibold mb-2" }, "No pricing tiers found"),
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground mb-4" }, "Click \"New Tier\" to create your first pricing plan."),
                    react_1["default"].createElement(button_1.Button, { size: "sm", onClick: function () { return setCreateOpen(true); } },
                        react_1["default"].createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
                        "Create First Tier")))) : viewMode === "cards" ? (react_1["default"].createElement(react_1["default"].Fragment, null,
                react_1["default"].createElement("div", { className: "grid gap-4 lg:grid-cols-2" }, planKeys.map(function (key) {
                    var _a;
                    return (react_1["default"].createElement(PlanCard, { key: key, planKey: key, priceData: prices[key], features: (_a = tierFeatures[key]) !== null && _a !== void 0 ? _a : {}, onEdit: setEditTierKey, onDelete: setDeleteTierKey }));
                })),
                react_1["default"].createElement("div", { className: "space-y-3" },
                    react_1["default"].createElement("h3", { className: "text-lg font-semibold flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.TableProperties, { className: "h-5 w-5 text-muted-foreground" }),
                        "Plan Comparison"),
                    react_1["default"].createElement(ComparisonTable, { planKeys: planKeys, prices: prices, tierFeatures: tierFeatures })))) : (react_1["default"].createElement(ComparisonTable, { planKeys: planKeys, prices: prices, tierFeatures: tierFeatures }))),
        react_1["default"].createElement(CreateTierDialog, { open: createOpen, onOpenChange: setCreateOpen, onCreated: refetchAll }),
        editingTier && (react_1["default"].createElement(EditTierDialog, { open: !!editTierKey, onOpenChange: function (v) { if (!v)
                setEditTierKey(null); }, tierKey: editingTier.key, tierLabel: editingTier.label, priceData: editingTier.priceData, currentFeatures: editingTier.features, onSaved: function () { refetchAll(); setEditTierKey(null); } })),
        deletingTier && (react_1["default"].createElement(DeleteTierDialog, { open: !!deleteTierKey, onOpenChange: function (v) { if (!v)
                setDeleteTierKey(null); }, tierKey: deletingTier.key, tierLabel: deletingTier.label, onDeleted: function () { refetchAll(); setDeleteTierKey(null); } }))));
}
exports["default"] = SuperAdminPricingTiers;
