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
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var WebsiteNav_1 = require("./WebsiteNav");
var WebsiteFooter_1 = require("./WebsiteFooter");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var CurrencyContext_1 = require("./CurrencyContext");
var trpc_1 = require("@/lib/trpc");
var FEATURE_LABELS = {
    crm: "Core CRM & Sales",
    invoicing: "Invoicing & Payments",
    payments: "M-Pesa / Stripe",
    hr: "HR records",
    payroll: "Payroll",
    leave: "Leave & Attendance",
    attendance: "Attendance",
    projects: "Projects module",
    procurement: "Procurement",
    accounting: "Accounting",
    budgets: "Budgets",
    reports: "Reports",
    ai_hub: "AI Hub",
    communications: "Team communication",
    tickets: "Support tickets",
    contracts: "Contracts",
    work_orders: "Work orders"
};
var FEATURE_ORDER = [
    "crm",
    "invoicing",
    "payments",
    "projects",
    "hr",
    "payroll",
    "leave",
    "attendance",
    "procurement",
    "accounting",
    "budgets",
    "reports",
    "ai_hub",
    "communications",
    "tickets",
    "contracts",
    "work_orders",
];
var DEFAULT_PLANS = [
    {
        key: "starter",
        name: "Starter",
        monthlyKes: 5999, annualKes: 4799,
        desc: "Perfect for small teams just getting started.",
        highlight: false,
        badge: null,
        cta: "Get Started",
        link: "/login",
        features: [
            { text: "Up to 10 users", included: true },
            { text: "Core CRM & Sales", included: true },
            { text: "Invoicing & Payments", included: true },
            { text: "Leave & Attendance", included: true },
            { text: "Basic HR records", included: true },
            { text: "Standard reports", included: true },
            { text: "Email support", included: true },
            { text: "Projects module", included: false },
            { text: "Procurement", included: false },
            { text: "Advanced Analytics", included: false },
            { text: "M-Pesa / Stripe", included: false },
            { text: "Templates & Documents", included: true },
            { text: "AI Hub", included: false },
            { text: "Multi-organization", included: false },
            { text: "SSO / SAML", included: false },
            { text: "Dedicated support", included: false },
        ]
    },
    {
        key: "professional",
        name: "Professional",
        monthlyKes: 18999, annualKes: 15199,
        desc: "For growing businesses with advanced operational needs.",
        highlight: true,
        badge: "Most Popular",
        cta: "Get Started",
        link: "/login",
        features: [
            { text: "Up to 50 users", included: true },
            { text: "Core CRM & Sales", included: true },
            { text: "Invoicing & Payments", included: true },
            { text: "Leave & Attendance", included: true },
            { text: "Full HR & Payroll", included: true },
            { text: "Advanced reports", included: true },
            { text: "Priority support", included: true },
            { text: "Projects module", included: true },
            { text: "Procurement", included: true },
            { text: "Advanced Analytics", included: true },
            { text: "M-Pesa / Stripe", included: true },
            { text: "Templates & Documents", included: true },
            { text: "AI Hub", included: true },
            { text: "Multi-organization", included: false },
            { text: "SSO / SAML", included: false },
            { text: "Dedicated support", included: false },
        ]
    },
    {
        key: "enterprise",
        name: "Enterprise",
        monthlyKes: 0, annualKes: 0,
        desc: "Unlimited scale with white-labeling, SSO, and dedicated management.",
        highlight: false,
        badge: null,
        cta: "Contact Sales",
        link: "/contact",
        features: [
            { text: "Unlimited users", included: true },
            { text: "Core CRM & Sales", included: true },
            { text: "Invoicing & Payments", included: true },
            { text: "Leave & Attendance", included: true },
            { text: "Full HR & Payroll", included: true },
            { text: "Custom reports & SLAs", included: true },
            { text: "24/7 dedicated support", included: true },
            { text: "Projects module", included: true },
            { text: "Procurement", included: true },
            { text: "Advanced Analytics", included: true },
            { text: "M-Pesa / Stripe + custom", included: true },
            { text: "Templates & Documents", included: true },
            { text: "AI Hub", included: true },
            { text: "Multi-organization", included: true },
            { text: "SSO / SAML", included: true },
            { text: "Dedicated account manager", included: true },
        ]
    },
];
var DEFAULT_COMPARISON_ROWS = [
    { category: "Users & Scale" },
    { label: "Users", starter: "Up to 10", pro: "Up to 50", ent: "Unlimited" },
    { label: "Organizations", starter: "1", pro: "1", ent: "Unlimited" },
    { label: "Storage", starter: "10 GB", pro: "100 GB", ent: "Unlimited" },
    { category: "Core Modules" },
    { label: "CRM & Sales", starter: true, pro: true, ent: true },
    { label: "Invoicing & Finance", starter: true, pro: true, ent: true },
    { label: "Basic HR", starter: true, pro: true, ent: true },
    { label: "Full Payroll", starter: false, pro: true, ent: true },
    { label: "Projects & Work Orders", starter: false, pro: true, ent: true },
    { label: "Procurement", starter: false, pro: true, ent: true },
    { label: "Templates & Documents", starter: true, pro: true, ent: true },
    { category: "Advanced Features" },
    { label: "Advanced Analytics", starter: false, pro: true, ent: true },
    { label: "AI Hub", starter: false, pro: true, ent: true },
    { label: "M-Pesa Integration", starter: false, pro: true, ent: true },
    { label: "Stripe Integration", starter: false, pro: true, ent: true },
    { label: "Custom Integrations", starter: false, pro: false, ent: true },
    { category: "Security & Access" },
    { label: "Role-based access", starter: true, pro: true, ent: true },
    { label: "Audit logs", starter: true, pro: true, ent: true },
    { label: "MFA", starter: true, pro: true, ent: true },
    { label: "SSO / SAML", starter: false, pro: false, ent: true },
    { label: "White-labeling", starter: false, pro: false, ent: true },
    { category: "Support" },
    { label: "Email support", starter: true, pro: true, ent: true },
    { label: "Priority support", starter: false, pro: true, ent: true },
    { label: "Dedicated account manager", starter: false, pro: false, ent: true },
    { label: "SLA guarantee", starter: false, pro: false, ent: true },
];
function parsePlanFeatures(features) {
    if (!features)
        return [];
    var featureObj = typeof features === "string" ? (function () {
        try {
            return JSON.parse(features);
        }
        catch (_a) {
            return null;
        }
    })() : features;
    if (Array.isArray(featureObj)) {
        return featureObj;
    }
    if (featureObj && typeof featureObj === "object") {
        return FEATURE_ORDER.filter(function (key) { return key in featureObj; }).map(function (key) { return ({
            text: FEATURE_LABELS[key] || key.replace(/_/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); }),
            included: Boolean(featureObj[key])
        }); });
    }
    return [];
}
function normalizeDbPlan(plan) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    var planKey = plan.planSlug || plan.tier || plan.key || String(plan.name || plan.planName || "").toLowerCase().replace(/\s+/g, "-");
    var monthlyKes = Number((_b = (_a = plan.monthlyPrice) !== null && _a !== void 0 ? _a : plan.monthlyKes) !== null && _b !== void 0 ? _b : 0);
    var annualKes = Number((_d = (_c = plan.annualPrice) !== null && _c !== void 0 ? _c : plan.annualKes) !== null && _d !== void 0 ? _d : Math.round(monthlyKes * 12 * 0.8));
    var features = parsePlanFeatures(plan.features);
    var displayName = plan.planName || plan.name || plan.label || plan.key || planKey;
    return {
        key: planKey,
        name: displayName,
        monthlyKes: monthlyKes,
        annualKes: annualKes,
        desc: plan.description || plan.desc || "",
        highlight: (_e = plan.highlight) !== null && _e !== void 0 ? _e : plan.tier === "professional",
        badge: (_f = plan.badge) !== null && _f !== void 0 ? _f : null,
        cta: (_g = plan.cta) !== null && _g !== void 0 ? _g : (monthlyKes > 0 ? "Get Started" : "Contact Sales"),
        ctaLink: (_h = plan.ctaLink) !== null && _h !== void 0 ? _h : (monthlyKes > 0 ? "/checkout/" + planKey : "/contact"),
        features: features.length ? features : [],
        tier: plan.tier,
        planSlug: plan.planSlug
    };
}
function Cell(_a) {
    var value = _a.value;
    if (value === true)
        return react_1["default"].createElement(lucide_react_1.CheckCircle, { className: "h-5 w-5 text-emerald-500 mx-auto" });
    if (value === false)
        return react_1["default"].createElement(lucide_react_1.X, { className: "h-5 w-5 text-gray-300 mx-auto" });
    return react_1["default"].createElement("span", { className: "text-sm text-gray-600" }, value);
}
function Pricing() {
    var _a;
    var _b = wouter_1.useLocation(), navigate = _b[1];
    var _c = react_1.useState(false), annual = _c[0], setAnnual = _c[1];
    var _d = CurrencyContext_1.useCurrency(), currency = _d.currency, setCurrency = _d.setCurrency, fmt = _d.fmt;
    // Fetch pricing from DB
    var pricingData = trpc_1.trpc.websiteAdmin.publicPricing.useQuery(undefined, {
        staleTime: 5 * 60 * 1000,
        retry: 1
    }).data;
    // Use DB-managed pricing config if available, otherwise fall back to defaults
    var customConfig = pricingData === null || pricingData === void 0 ? void 0 : pricingData.customConfig;
    var dbPlans = ((_a = pricingData === null || pricingData === void 0 ? void 0 : pricingData.dbPlans) !== null && _a !== void 0 ? _a : []).map(normalizeDbPlan);
    var hasDbPlans = dbPlans.length > 0;
    var PLANS = (customConfig === null || customConfig === void 0 ? void 0 : customConfig.plans) || (hasDbPlans ? dbPlans : DEFAULT_PLANS);
    var COMPARISON_ROWS = (customConfig === null || customConfig === void 0 ? void 0 : customConfig.comparisonRows) || DEFAULT_COMPARISON_ROWS;
    var faqItems = (customConfig === null || customConfig === void 0 ? void 0 : customConfig.faq) || [
        { q: "Can I change plans later?", a: "Yes. You can upgrade or downgrade at any time. Pro-rated billing is applied automatically." },
        { q: "How are users counted?", a: "A user is any person invited to your organization who has login access. Deactivated users do not count." },
        { q: "Is there a free trial?", a: "Yes — contact us for a 14-day full-access trial of the Professional plan, no credit card required." },
        { q: "Do you offer discounts for NGOs?", a: "Yes. We offer 30% discounts for registered non-profit organizations. Contact sales for details." },
    ];
    var mergedPlans = !customConfig && (pricingData === null || pricingData === void 0 ? void 0 : pricingData.prices)
        ? PLANS.map(function (plan) {
            var _a;
            var tierMap = { 'Starter': 'starter', 'Professional': 'professional', 'Enterprise': 'enterprise' };
            var tier = plan.key || plan.tier || tierMap[plan.name];
            var priceData = tier ? (_a = pricingData.prices) === null || _a === void 0 ? void 0 : _a[tier] : null;
            if (priceData) {
                return __assign(__assign({}, plan), { monthlyKes: priceData.monthlyKes || plan.monthlyKes, annualKes: priceData.annualKes || Math.round((priceData.monthlyKes || plan.monthlyKes) * 12 * 0.8), desc: priceData.description || plan.desc });
            }
            return plan;
        })
        : PLANS;
    var planPrice = function (plan) {
        if (plan.monthlyKes === 0)
            return "Custom";
        return annual ? fmt(plan.annualKes) : fmt(plan.monthlyKes);
    };
    var planKeyFor = function (plan) { var _a, _b; return plan.planSlug || plan.key || plan.tier || ((_b = (_a = plan.name) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === null || _b === void 0 ? void 0 : _b.replace(/\s+/g, "-")); };
    return (react_1["default"].createElement("div", { className: "min-h-screen bg-white text-gray-900 overflow-x-hidden" },
        react_1["default"].createElement(WebsiteNav_1.WebsiteNav, null),
        react_1["default"].createElement("section", { className: "relative pt-32 pb-20 lg:pt-44 lg:pb-28 overflow-hidden bg-gradient-to-b from-indigo-50/80 via-white to-white" },
            react_1["default"].createElement("div", { className: "absolute inset-0 -z-10" },
                react_1["default"].createElement("div", { className: "absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-100/60 rounded-full blur-3xl" })),
            react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" },
                react_1["default"].createElement(badge_1.Badge, { className: "mb-6 bg-indigo-50 text-indigo-600 border border-indigo-200" },
                    react_1["default"].createElement(lucide_react_1.Zap, { className: "mr-1.5 h-3 w-3" }),
                    " Simple, transparent pricing"),
                react_1["default"].createElement("h1", { className: "text-5xl md:text-6xl font-black tracking-tight mb-6" },
                    "Plans that grow",
                    react_1["default"].createElement("br", null),
                    react_1["default"].createElement("span", { className: "bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent" }, "with your business")),
                react_1["default"].createElement("p", { className: "text-xl text-gray-500 max-w-xl mx-auto mb-10" }, "No hidden fees. No per-module charges. One price, everything included for your tier."),
                react_1["default"].createElement("div", { className: "flex justify-center mb-6" },
                    react_1["default"].createElement("div", { className: "inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-1 flex-wrap justify-center" },
                        react_1["default"].createElement("span", { className: "flex items-center gap-1.5 px-3 text-xs text-gray-400" },
                            react_1["default"].createElement(lucide_react_1.Globe, { className: "h-3 w-3" }),
                            " Currency:"),
                        CurrencyContext_1.CURRENCIES.map(function (c) { return (react_1["default"].createElement("button", { key: c.code, onClick: function () { return setCurrency(c.code); }, className: utils_1.cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", currency.code === c.code ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100") },
                            c.symbol,
                            " ",
                            c.code)); }))),
                react_1["default"].createElement("div", { className: "inline-flex items-center gap-3 rounded-full border border-gray-200 p-1.5 bg-gray-50" },
                    react_1["default"].createElement("button", { className: utils_1.cn("px-5 py-2 rounded-full text-sm font-medium transition-all", !annual ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-900"), onClick: function () { return setAnnual(false); } }, "Monthly"),
                    react_1["default"].createElement("button", { className: utils_1.cn("px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2", annual ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-900"), onClick: function () { return setAnnual(true); } },
                        "Annual",
                        react_1["default"].createElement(badge_1.Badge, { className: "text-xs bg-emerald-100 text-emerald-700 border-0 px-1.5 py-0" }, "Save 20%"))))),
        react_1["default"].createElement("section", { className: "pb-20" },
            react_1["default"].createElement("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" },
                react_1["default"].createElement("div", { className: "grid md:grid-cols-3 gap-6" }, mergedPlans.map(function (plan) { return (react_1["default"].createElement("div", { key: plan.key || plan.name, className: utils_1.cn("rounded-2xl border p-8 flex flex-col hover:shadow-xl transition-all duration-300 hover:-translate-y-1", plan.highlight
                        ? "border-indigo-400 bg-gradient-to-b from-indigo-50 to-white shadow-lg shadow-indigo-100 relative"
                        : "border-gray-200 bg-white") },
                    plan.highlight && (react_1["default"].createElement("div", { className: "absolute -top-3 left-1/2 -translate-x-1/2" },
                        react_1["default"].createElement(badge_1.Badge, { className: "bg-indigo-600 text-white border-0 px-3 py-1 text-xs shadow-lg" }, plan.badge))),
                    react_1["default"].createElement("h3", { className: "text-xl font-bold mb-2" }, plan.name),
                    react_1["default"].createElement("div", { className: "flex items-baseline gap-1 mb-2" },
                        react_1["default"].createElement("span", { className: "text-4xl font-black" }, planPrice(plan)),
                        plan.monthlyKes !== 0 && react_1["default"].createElement("span", { className: "text-gray-400 text-sm" }, "/mo")),
                    annual && plan.monthlyKes !== 0 && (react_1["default"].createElement("p", { className: "text-xs text-emerald-600 mb-3" }, "Billed annually \u2014 save 20%")),
                    react_1["default"].createElement("p", { className: "text-sm text-gray-500 mb-6" }, plan.desc),
                    react_1["default"].createElement("ul", { className: "space-y-2.5 mb-8 flex-1" }, plan.features.map(function (f) { return (react_1["default"].createElement("li", { key: f.text, className: "flex items-start gap-2.5 text-sm" },
                        f.included
                            ? react_1["default"].createElement(lucide_react_1.CheckCircle, { className: "h-4 w-4 text-emerald-500 shrink-0 mt-0.5" })
                            : react_1["default"].createElement(lucide_react_1.X, { className: "h-4 w-4 text-gray-300 shrink-0 mt-0.5" }),
                        react_1["default"].createElement("span", { className: f.included ? "text-gray-600" : "text-gray-400" }, f.text))); })),
                    react_1["default"].createElement(button_1.Button, { className: utils_1.cn("w-full", plan.highlight
                            ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                            : "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"), onClick: function () { return navigate(plan.ctaLink || plan.link || "/checkout/" + planKeyFor(plan)); } },
                        plan.cta,
                        " ",
                        plan.cta !== "Contact Sales" && react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "ml-2 h-4 w-4" })))); })))),
        react_1["default"].createElement("section", { className: "py-20 border-t border-gray-100" },
            react_1["default"].createElement("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" },
                react_1["default"].createElement("div", { className: "text-center mb-12" },
                    react_1["default"].createElement("h2", { className: "text-3xl md:text-4xl font-black mb-3" }, "Full comparison"),
                    react_1["default"].createElement("p", { className: "text-gray-500" }, "Everything, side by side.")),
                react_1["default"].createElement("div", { className: "overflow-x-auto rounded-2xl border border-gray-200" },
                    react_1["default"].createElement("table", { className: "w-full text-sm" },
                        react_1["default"].createElement("thead", null,
                            react_1["default"].createElement("tr", { className: "border-b border-gray-200 bg-gray-50" },
                                react_1["default"].createElement("th", { className: "text-left p-4 font-semibold text-gray-500 w-1/2" }, "Feature"),
                                react_1["default"].createElement("th", { className: "p-4 font-bold text-center" }, "Starter"),
                                react_1["default"].createElement("th", { className: "p-4 font-bold text-center text-indigo-600" }, "Professional"),
                                react_1["default"].createElement("th", { className: "p-4 font-bold text-center" }, "Enterprise"))),
                        react_1["default"].createElement("tbody", null, COMPARISON_ROWS.map(function (row, i) {
                            if ("category" in row) {
                                var category = String(row.category);
                                return (react_1["default"].createElement("tr", { key: category || "category-" + i, className: "bg-gray-50/80 border-b border-gray-100" },
                                    react_1["default"].createElement("td", { colSpan: 4, className: "px-4 py-2 text-xs uppercase tracking-widest font-bold text-indigo-600" }, category)));
                            }
                            return (react_1["default"].createElement("tr", { key: row.label || "row-" + i, className: "border-b border-gray-100 hover:bg-gray-50 transition-colors" },
                                react_1["default"].createElement("td", { className: "p-4 text-gray-600" }, row.label),
                                react_1["default"].createElement("td", { className: "p-4 text-center" },
                                    react_1["default"].createElement(Cell, { value: row.starter })),
                                react_1["default"].createElement("td", { className: "p-4 text-center bg-indigo-50/30" },
                                    react_1["default"].createElement(Cell, { value: row.pro })),
                                react_1["default"].createElement("td", { className: "p-4 text-center" },
                                    react_1["default"].createElement(Cell, { value: row.ent }))));
                        })))))),
        react_1["default"].createElement("section", { className: "py-20 border-t border-gray-100 bg-gray-50/50" },
            react_1["default"].createElement("div", { className: "max-w-3xl mx-auto px-4 sm:px-6 lg:px-8" },
                react_1["default"].createElement("h2", { className: "text-3xl font-black text-center mb-10" }, "Pricing FAQ"),
                react_1["default"].createElement("div", { className: "space-y-6" }, faqItems.map(function (item) { return (react_1["default"].createElement("div", { key: item.q, className: "rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow" },
                    react_1["default"].createElement("h4", { className: "font-semibold mb-2" }, item.q),
                    react_1["default"].createElement("p", { className: "text-sm text-gray-500 leading-relaxed" }, item.a))); })))),
        react_1["default"].createElement("section", { className: "py-24 bg-gradient-to-b from-white to-indigo-50/50" },
            react_1["default"].createElement("div", { className: "max-w-3xl mx-auto px-4 text-center" },
                react_1["default"].createElement("h2", { className: "text-4xl font-black mb-5" }, "Not sure which plan?"),
                react_1["default"].createElement("p", { className: "text-gray-500 mb-8 text-lg" }, "Talk to us \u2014 we will help you choose the right fit."),
                react_1["default"].createElement(button_1.Button, { size: "lg", className: "bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-6 text-lg shadow-lg shadow-indigo-200", onClick: function () { return navigate("/contact"); } },
                    "Talk to Sales ",
                    react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "ml-2 h-5 w-5" })))),
        react_1["default"].createElement(WebsiteFooter_1.WebsiteFooter, null)));
}
exports["default"] = Pricing;
