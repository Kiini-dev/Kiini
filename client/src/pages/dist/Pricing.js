"use strict";
/**
 * Pricing Plans Page
 * Displays available subscription tiers with feature comparison,
 * monthly/annual billing toggle, and trial countdown banner.
 */
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var TIER_META = {
    free: { icon: React.createElement(lucide_react_1.Zap, { className: "w-5 h-5" }), accentClass: "text-gray-500" },
    starter: { icon: React.createElement(lucide_react_1.Star, { className: "w-5 h-5" }), accentClass: "text-blue-500" },
    gold: { icon: React.createElement(lucide_react_1.Star, { className: "w-5 h-5" }), accentClass: "text-yellow-500" },
    professional: { icon: React.createElement(lucide_react_1.Crown, { className: "w-5 h-5" }), accentClass: "text-violet-600", popular: true },
    enterprise: { icon: React.createElement(lucide_react_1.Shield, { className: "w-5 h-5" }), accentClass: "text-indigo-600" },
    custom: { icon: React.createElement(lucide_react_1.Shield, { className: "w-5 h-5" }), accentClass: "text-orange-500" }
};
var TIER_RANK = {
    free: 0, starter: 1, gold: 2, professional: 3, enterprise: 4, custom: 5
};
function formatMonthlyDisplay(plan, cycle) {
    var _a, _b;
    var amount = cycle === "annual"
        ? parseFloat((_a = plan.annualPrice) !== null && _a !== void 0 ? _a : "0") / 12
        : parseFloat((_b = plan.monthlyPrice) !== null && _b !== void 0 ? _b : "0");
    if (amount === 0)
        return "Free";
    return "$" + (amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2));
}
function parseFeatures(raw) {
    if (Array.isArray(raw))
        return raw.map(String);
    if (typeof raw === "string") {
        try {
            return JSON.parse(raw);
        }
        catch ( /* ignore */_a) { /* ignore */ }
    }
    return [];
}
// ─── Component ──────────────────────────────────────────────────────────────
function Pricing() {
    var _a;
    var _b = react_1.useState("monthly"), billingCycle = _b[0], setBillingCycle = _b[1];
    // ── Data queries ────────────────────────────────────────────────────────
    var _c = trpc_1.trpc.billing.getPlans.useQuery({}), plansData = _c.data, plansLoading = _c.isLoading;
    var subData = trpc_1.trpc.billing.getCurrentSubscription.useQuery(undefined, {
        retry: false,
        // gracefully ignore feature-permission errors
        onError: function () { }
    }).data;
    var subscribeMutation = trpc_1.trpc.billing.createSubscription.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Subscription updated! Your plan has been changed.");
        },
        onError: function (err) {
            sonner_1.toast.error("Could not update plan: " + err.message);
        }
    });
    // ── Derived state ────────────────────────────────────────────────────────
    var plans = react_1.useMemo(function () {
        var _a;
        var list = (_a = plansData === null || plansData === void 0 ? void 0 : plansData.plans) !== null && _a !== void 0 ? _a : [];
        return __spreadArrays(list).sort(function (a, b) {
            var _a, _b, _c, _d;
            var byOrder = ((_a = a.displayOrder) !== null && _a !== void 0 ? _a : 0) - ((_b = b.displayOrder) !== null && _b !== void 0 ? _b : 0);
            if (byOrder !== 0)
                return byOrder;
            return ((_c = TIER_RANK[a.tier]) !== null && _c !== void 0 ? _c : 99) - ((_d = TIER_RANK[b.tier]) !== null && _d !== void 0 ? _d : 99);
        });
    }, [plansData === null || plansData === void 0 ? void 0 : plansData.plans]);
    var subscription = subData === null || subData === void 0 ? void 0 : subData.subscription;
    var currentPlanId = (_a = subscription === null || subscription === void 0 ? void 0 : subscription.planId) !== null && _a !== void 0 ? _a : null;
    var isTrialUser = (subscription === null || subscription === void 0 ? void 0 : subscription.status) === "trial";
    var trialDaysLeft = react_1.useMemo(function () {
        if (!isTrialUser || !(subscription === null || subscription === void 0 ? void 0 : subscription.renewalDate))
            return 0;
        try {
            return Math.max(0, date_fns_1.differenceInDays(date_fns_1.parseISO(subscription.renewalDate), new Date()));
        }
        catch (_a) {
            return 0;
        }
    }, [isTrialUser, subscription === null || subscription === void 0 ? void 0 : subscription.renewalDate]);
    // ── Handlers ─────────────────────────────────────────────────────────────
    function handleSelectPlan(planId) {
        var clientId = subscription === null || subscription === void 0 ? void 0 : subscription.clientId;
        if (!clientId) {
            sonner_1.toast.error("Your account is not linked to an organization. Contact your administrator.");
            return;
        }
        subscribeMutation.mutate({ clientId: clientId, planId: planId, billingCycle: billingCycle });
    }
    // ── Render ────────────────────────────────────────────────────────────────
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Pricing Plans", description: "Flexible plans for every team size \u2014 upgrade or downgrade any time" },
        isTrialUser && (React.createElement("div", { className: "mb-6 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/30" },
            React.createElement(lucide_react_1.Clock, { className: "mt-0.5 h-5 w-5 shrink-0 text-amber-500" }),
            React.createElement("div", null,
                React.createElement("p", { className: "font-semibold text-amber-800 dark:text-amber-300" },
                    "Trial period active \u2014 ",
                    trialDaysLeft,
                    " day",
                    trialDaysLeft !== 1 ? "s" : "",
                    " remaining"),
                React.createElement("p", { className: "mt-0.5 text-sm text-amber-700 dark:text-amber-400" }, "Upgrade to a paid plan to maintain uninterrupted access when your trial ends.")))),
        React.createElement("div", { className: "mb-10 flex items-center justify-center gap-4" },
            React.createElement("span", { className: billingCycle === "monthly" ? "font-semibold" : "text-muted-foreground" }, "Monthly"),
            React.createElement("button", { type: "button", role: "switch", "aria-checked": billingCycle === "annual", onClick: function () {
                    return setBillingCycle(function (c) { return (c === "monthly" ? "annual" : "monthly"); });
                }, className: [
                    "relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    billingCycle === "annual" ? "bg-primary" : "bg-input",
                ].join(" ") },
                React.createElement("span", { className: [
                        "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
                        billingCycle === "annual" ? "translate-x-6" : "translate-x-1",
                    ].join(" ") })),
            React.createElement("span", { className: billingCycle === "annual" ? "font-semibold" : "text-muted-foreground" },
                "Annual",
                " ",
                React.createElement(badge_1.Badge, { variant: "secondary", className: "ml-1 text-xs" }, "Save up to 20%"))),
        plansLoading ? (React.createElement("div", { className: "flex items-center justify-center py-24" },
            React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-muted-foreground" }))) : plans.length === 0 ? (React.createElement("p", { className: "py-24 text-center text-muted-foreground" }, "No plans available at this time. Please contact support.")) : (React.createElement("div", { className: "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4" }, plans.map(function (plan) {
            var _a, _b, _c, _d;
            var meta = (_a = TIER_META[plan.tier]) !== null && _a !== void 0 ? _a : TIER_META.starter;
            var isCurrent = plan.id === currentPlanId;
            var isFree = parseFloat((_b = plan.monthlyPrice) !== null && _b !== void 0 ? _b : "0") === 0;
            var features = parseFeatures(plan.features);
            var monthlyDisplay = formatMonthlyDisplay(plan, billingCycle);
            var annualTotal = billingCycle === "annual" && !isFree
                ? "$" + parseFloat((_c = plan.annualPrice) !== null && _c !== void 0 ? _c : "0").toFixed(0) + " billed annually"
                : null;
            return (React.createElement(card_1.Card, { key: plan.id, className: [
                    "relative flex flex-col transition-shadow hover:shadow-md",
                    meta.popular
                        ? "ring-2 ring-primary shadow-lg"
                        : "border",
                    isCurrent ? "bg-primary/5 dark:bg-primary/10" : "",
                ].join(" ") },
                meta.popular && (React.createElement("div", { className: "absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap" },
                    React.createElement(badge_1.Badge, { className: "px-3 py-1 text-xs" }, "Most Popular"))),
                isCurrent && (React.createElement("div", { className: "absolute -top-3.5 right-4" },
                    React.createElement(badge_1.Badge, { variant: "secondary", className: "px-3 py-1 text-xs" }, "Current Plan"))),
                React.createElement(card_1.CardHeader, { className: "pb-3" },
                    React.createElement("div", { className: "mb-1 flex items-center gap-2 " + meta.accentClass },
                        meta.icon,
                        React.createElement(card_1.CardTitle, { className: "text-lg" }, plan.planName)),
                    plan.description && (React.createElement(card_1.CardDescription, { className: "text-sm leading-snug" }, plan.description)),
                    React.createElement("div", { className: "mt-4" }, isFree ? (React.createElement("span", { className: "text-4xl font-bold" }, "Free")) : (React.createElement(React.Fragment, null,
                        React.createElement("span", { className: "text-4xl font-bold" }, monthlyDisplay),
                        React.createElement("span", { className: "ml-1 text-sm text-muted-foreground" }, "/mo"),
                        annualTotal && (React.createElement("p", { className: "mt-1 text-xs text-muted-foreground" }, annualTotal)))))),
                React.createElement(card_1.CardContent, { className: "flex flex-1 flex-col gap-5" },
                    React.createElement("div", { className: "space-y-2 text-sm" },
                        React.createElement("div", { className: "flex items-center gap-2 text-muted-foreground" },
                            React.createElement(lucide_react_1.Users, { className: "h-4 w-4 shrink-0" }),
                            React.createElement("span", null, plan.maxUsers === -1
                                ? "Unlimited users"
                                : "Up to " + plan.maxUsers + " user" + (plan.maxUsers !== 1 ? "s" : ""))),
                        React.createElement("div", { className: "flex items-center gap-2 text-muted-foreground" },
                            React.createElement(lucide_react_1.FolderKanban, { className: "h-4 w-4 shrink-0" }),
                            React.createElement("span", null, plan.maxProjects === -1
                                ? "Unlimited projects"
                                : "Up to " + plan.maxProjects + " project" + (plan.maxProjects !== 1 ? "s" : ""))),
                        plan.maxStorageGB !== undefined && plan.maxStorageGB !== null && (React.createElement("div", { className: "flex items-center gap-2 text-muted-foreground" },
                            React.createElement(lucide_react_1.HardDrive, { className: "h-4 w-4 shrink-0" }),
                            React.createElement("span", null, plan.maxStorageGB === -1
                                ? "Unlimited storage"
                                : plan.maxStorageGB + " GB storage"))),
                        React.createElement("div", { className: "flex items-center gap-2 text-muted-foreground" },
                            React.createElement(lucide_react_1.HeadphonesIcon, { className: "h-4 w-4 shrink-0" }),
                            React.createElement("span", { className: "capitalize" },
                                ((_d = plan.supportLevel) !== null && _d !== void 0 ? _d : "email").replace(/[_/]/g, " "),
                                " support"))),
                    features.length > 0 && (React.createElement("ul", { className: "flex-1 space-y-2" }, features.map(function (feat, i) { return (React.createElement("li", { key: i, className: "flex items-start gap-2 text-sm" },
                        React.createElement(lucide_react_1.Check, { className: "mt-0.5 h-4 w-4 shrink-0 text-green-500" }),
                        React.createElement("span", null, feat))); }))),
                    React.createElement(button_1.Button, { className: "mt-auto w-full", variant: meta.popular && !isCurrent ? "default" : "outline", disabled: isCurrent || subscribeMutation.isPending, onClick: function () { return handleSelectPlan(plan.id); } },
                        subscribeMutation.isPending ? (React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })) : (React.createElement(lucide_react_1.ArrowRight, { className: "mr-2 h-4 w-4" })),
                        isCurrent
                            ? "Current Plan"
                            : isFree
                                ? "Get Started Free"
                                : isTrialUser
                                    ? "Upgrade to " + plan.planName
                                    : "Select Plan"))));
        }))),
        !plansLoading && plans.length > 1 && (React.createElement(card_1.Card, { className: "mt-14" },
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Plan Comparison"),
                React.createElement(card_1.CardDescription, null, "Side-by-side overview of what each plan includes")),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement("table", { className: "w-full text-sm" },
                        React.createElement("thead", null,
                            React.createElement("tr", { className: "border-b" },
                                React.createElement("th", { className: "py-3 pr-6 text-left font-medium" }, "Feature"),
                                plans.map(function (p) { return (React.createElement("th", { key: p.id, className: [
                                        "px-3 py-3 text-center font-medium",
                                        p.id === currentPlanId
                                            ? "text-primary"
                                            : "",
                                    ].join(" ") },
                                    p.planName,
                                    p.id === currentPlanId && (React.createElement("span", { className: "ml-1 text-xs font-normal text-muted-foreground" }, "(current)")))); }))),
                        React.createElement("tbody", null, [
                            {
                                label: "Monthly Price",
                                getValue: function (p) {
                                    var _a;
                                    return parseFloat((_a = p.monthlyPrice) !== null && _a !== void 0 ? _a : "0") === 0
                                        ? "Free"
                                        : "$" + parseFloat(p.monthlyPrice).toFixed(0) + "/mo";
                                }
                            },
                            {
                                label: "Annual Price",
                                getValue: function (p) {
                                    var _a;
                                    return parseFloat((_a = p.annualPrice) !== null && _a !== void 0 ? _a : "0") === 0
                                        ? "—"
                                        : "$" + parseFloat(p.annualPrice).toFixed(0) + "/yr";
                                }
                            },
                            {
                                label: "Users",
                                getValue: function (p) {
                                    return p.maxUsers === -1 ? "Unlimited" : p.maxUsers;
                                }
                            },
                            {
                                label: "Projects",
                                getValue: function (p) {
                                    return p.maxProjects === -1 ? "Unlimited" : p.maxProjects;
                                }
                            },
                            {
                                label: "Storage",
                                getValue: function (p) {
                                    return p.maxStorageGB === -1
                                        ? "Unlimited"
                                        : p.maxStorageGB === null || p.maxStorageGB === undefined
                                            ? "—"
                                            : p.maxStorageGB + " GB";
                                }
                            },
                            {
                                label: "Support",
                                getValue: function (p) {
                                    var _a;
                                    return ((_a = p.supportLevel) !== null && _a !== void 0 ? _a : "email")
                                        .replace(/[_/]/g, " ")
                                        .replace(/\b\w/g, function (c) { return c.toUpperCase(); });
                                }
                            },
                        ].map(function (row) { return (React.createElement("tr", { key: row.label, className: "border-b last:border-0" },
                            React.createElement("td", { className: "py-3 pr-6 font-medium" }, row.label),
                            plans.map(function (p) { return (React.createElement("td", { key: p.id, className: "px-3 py-3 text-center text-muted-foreground" }, row.getValue(p))); }))); }))))))),
        React.createElement("div", { className: "mt-10 rounded-xl border bg-muted/30 p-8 text-center" },
            React.createElement("h3", { className: "mb-2 text-lg font-semibold" }, "Need a custom plan?"),
            React.createElement("p", { className: "mb-4 text-sm text-muted-foreground" }, "We offer tailored solutions for large enterprises with specific requirements. Contact Kiini Solutions to discuss a custom quote."),
            React.createElement(button_1.Button, { variant: "outline", asChild: true },
                React.createElement("a", { href: "mailto:sales@kiini.africa" }, "Contact Sales")))));
}
exports["default"] = Pricing;
