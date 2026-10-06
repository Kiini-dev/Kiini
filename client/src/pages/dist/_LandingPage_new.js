"use strict";
exports.__esModule = true;
var react_1 = require("react");
var useAuth_1 = require("@/_core/hooks/useAuth");
var permissions_1 = require("@/lib/permissions");
var wouter_1 = require("wouter");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var WebsiteNav_1 = require("./website/WebsiteNav");
var WebsiteFooter_1 = require("./website/WebsiteFooter");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
// ── Module data ──────────────────────────────────────────────
var MODULES = [
    { icon: lucide_react_1.Users, label: "CRM & Sales", color: "from-blue-500 to-blue-600", desc: "Clients, opportunities, pipeline" },
    { icon: lucide_react_1.DollarSign, label: "Finance", color: "from-emerald-500 to-teal-600", desc: "Invoices, payments, accounting" },
    { icon: lucide_react_1.UserCog, label: "HR Management", color: "from-violet-500 to-purple-600", desc: "Employees, payroll, leave" },
    { icon: lucide_react_1.Briefcase, label: "Projects", color: "from-amber-500 to-orange-600", desc: "Tasks, milestones, time tracking" },
    { icon: lucide_react_1.ShoppingCart, label: "Procurement", color: "from-rose-500 to-red-600", desc: "LPOs, suppliers, GRN" },
    { icon: lucide_react_1.BarChart3, label: "Reports & BI", color: "from-cyan-500 to-blue-600", desc: "Dashboards, analytics, insights" },
    { icon: lucide_react_1.Calendar, label: "Attendance", color: "from-fuchsia-500 to-pink-600", desc: "Clock in/out, timesheets" },
    { icon: lucide_react_1.Ticket, label: "Tickets", color: "from-indigo-500 to-violet-600", desc: "Support, issue tracking" },
    { icon: lucide_react_1.MessageSquare, label: "Communications", color: "from-sky-500 to-cyan-600", desc: "Email, SMS, notifications" },
    { icon: lucide_react_1.FileCheck, label: "Contracts", color: "from-lime-500 to-green-600", desc: "Document management, signing" },
    { icon: lucide_react_1.Target, label: "Budgets", color: "from-orange-500 to-amber-600", desc: "Budget plans, variance tracking" },
    { icon: lucide_react_1.Sparkles, label: "AI Hub", color: "from-violet-600 to-indigo-700", desc: "Insights, automation, AI assist" },
];
// ── Features data ────────────────────────────────────────────
var FEATURES = [
    { icon: lucide_react_1.Layers, title: "18 Integrated Modules", highlight: "All-in-one", desc: "Every business function in one platform — no integration headaches, no duplicate data entry." },
    { icon: lucide_react_1.Shield, title: "Enterprise-grade Security", highlight: "150+ permissions", desc: "Role-based access control, audit logs, MFA, and end-to-end encryption keep your data safe." },
    { icon: lucide_react_1.BarChart3, title: "Real-time Analytics", highlight: "AI-powered", desc: "Live dashboards, custom reports, and AI-powered insights give you a complete view of your business." },
    { icon: lucide_react_1.Users, title: "Multi-tenant Architecture", highlight: "Multi-org", desc: "Host and manage multiple organizations under one platform with full data isolation." },
    { icon: lucide_react_1.Globe, title: "Global Ready", highlight: "Worldwide", desc: "Multi-currency, tax compliance, and localization support for businesses operating internationally." },
    { icon: lucide_react_1.Zap, title: "Workflow Automation", highlight: "No-code", desc: "Automate approvals, reminders, recurring invoices, and complex business processes." },
];
// ── Pricing tiers ────────────────────────────────────────────
var PLANS = [
    {
        name: "Starter",
        price: "$49",
        per: "/mo",
        desc: "Perfect for small teams just getting started.",
        highlight: false,
        features: ["Up to 10 users", "Core CRM & Sales", "Invoicing & Payments", "Basic HR", "Standard reports", "Email support"]
    },
    {
        name: "Gold",
        price: "$99",
        per: "/mo",
        desc: "For mid-sized businesses with more advanced needs.",
        highlight: false,
        features: ["Up to 50 users", "All Starter modules", "Enhanced reporting", "Email support"]
    },
    {
        name: "Professional",
        price: "$149",
        per: "/mo",
        desc: "For growing businesses with advanced needs.",
        highlight: true,
        badge: "Most Popular",
        features: ["Up to 50 users", "All Starter modules", "Procurement & Inventory", "Projects & Work Orders", "Advanced Analytics", "M-Pesa / Stripe integration", "Priority support"]
    },
    {
        name: "Enterprise",
        price: "Custom",
        per: "",
        desc: "Unlimited scale with dedicated support.",
        highlight: false,
        features: ["Unlimited users", "All modules", "Multi-organization management", "Custom integrations", "White-labeling", "SSO / SAML", "Dedicated account manager", "SLA guarantee"]
    },
];
var STATS = [
    { value: "18+", label: "Business Modules" },
    { value: "150+", label: "Permission Controls" },
    { value: "99.9%", label: "Uptime SLA" },
    { value: "24/7", label: "Support" },
];
var TESTIMONIALS = [
    {
        name: "Sarah M.", title: "CFO, Apex Group", stars: 5,
        body: "Kiini replaced five separate tools for us. Now everything — invoices, payroll, procurement — flows through one system. The time savings alone paid for the subscription in the first month."
    },
    {
        name: "James K.", title: "Operations Director, BuildCo", stars: 5,
        body: "The project management and HR modules work together seamlessly. Attendance feeds directly into payroll. Our team processes payroll in minutes instead of days."
    },
    {
        name: "Amina L.", title: "CEO, TechStart Ltd", stars: 5,
        body: "The multi-tenant setup is brilliant for our group structure. Each subsidiary has its own workspace, but I get consolidated reports across the whole group from one dashboard."
    },
];
var FAQ_ITEMS = [
    { q: "Can I manage multiple companies or branches?", a: "Yes. Kiini's multi-tenant architecture lets you create separate workspaces for subsidiaries, branches, or clients — each with full data isolation and its own user management." },
    { q: "How does user access control work?", a: "We have 150+ granular permissions and 10+ predefined roles (super admin, admin, manager, HR, accountant, staff, and more). Every action in the system is permission-controlled." },
    { q: "Is Kiini suitable for African markets?", a: "Absolutely. We have native M-Pesa (Safaricom) integration, Kenya Revenue Authority tax support, KSh and multi-currency support, and Kenyan payroll calculation built in." },
    { q: "Can we self-host or is this cloud-only?", a: "Kiini can be deployed via Docker on your own infrastructure or hosted in our cloud. Enterprise customers can choose their preferred deployment model." },
    { q: "How is data security handled?", a: "Your data is encrypted at rest and in transit. We provide full audit logs, role-based access control, MFA, and complete data isolation between organizations." },
];
function FaqItem(_a) {
    var q = _a.q, a = _a.a;
    var _b = react_1.useState(false), open = _b[0], setOpen = _b[1];
    return (react_1["default"].createElement("div", { className: "border border-white/10 rounded-xl overflow-hidden" },
        react_1["default"].createElement("button", { className: "w-full flex items-center justify-between px-6 py-4 text-left text-white font-medium hover:bg-white/5 transition-colors", onClick: function () { return setOpen(!open); } },
            react_1["default"].createElement("span", null, q),
            react_1["default"].createElement(lucide_react_1.ChevronRight, { className: utils_1.cn("h-4 w-4 text-white/40 shrink-0 transition-transform", open && "rotate-90") })),
        open && (react_1["default"].createElement("div", { className: "px-6 pb-5 text-white/60 text-sm leading-relaxed" }, a))));
}
function LandingPage() {
    var _a = useAuth_1.useAuth(), user = _a.user, loading = _a.loading, isAuthenticated = _a.isAuthenticated;
    var _b = wouter_1.useLocation(), navigate = _b[1];
    react_1.useEffect(function () {
        if (!loading && isAuthenticated && user) {
            navigate(permissions_1.getDashboardUrl(user.role || "staff"));
        }
    }, [loading, isAuthenticated, user, navigate]);
    if (loading) {
        return (react_1["default"].createElement("div", { className: "min-h-screen flex items-center justify-center bg-[#07070f]" },
            react_1["default"].createElement("div", { className: "h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" })));
    }
    return (react_1["default"].createElement("div", { className: "min-h-screen bg-[#07070f] text-white overflow-x-hidden" },
        react_1["default"].createElement(WebsiteNav_1.WebsiteNav, null),
        react_1["default"].createElement("section", { className: "relative pt-32 pb-24 lg:pt-44 lg:pb-32 overflow-hidden" },
            react_1["default"].createElement("div", { className: "absolute inset-0 -z-10" },
                react_1["default"].createElement("div", { className: "absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl" }),
                react_1["default"].createElement("div", { className: "absolute top-40 right-0 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-3xl" })),
            react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" },
                react_1["default"].createElement(badge_1.Badge, { className: "mb-6 bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20" },
                    react_1["default"].createElement(lucide_react_1.Zap, { className: "mr-1.5 h-3 w-3" }),
                    " Enterprise Business Platform"),
                react_1["default"].createElement("h1", { className: "text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-none" },
                    "One Hub.",
                    react_1["default"].createElement("br", null),
                    react_1["default"].createElement("span", { className: "bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent" }, "Total Control.")),
                react_1["default"].createElement("p", { className: "text-xl md:text-2xl text-white/60 max-w-3xl mx-auto mb-10 leading-relaxed" }, "Kiini unifies CRM, HR, Finance, Projects, Procurement, and more \u2014 so your entire business runs from a single, powerful platform."),
                react_1["default"].createElement("div", { className: "flex flex-col sm:flex-row gap-4 justify-center mb-16" },
                    react_1["default"].createElement(button_1.Button, { size: "lg", className: "bg-indigo-600 hover:bg-indigo-500 text-white text-base px-8 py-6 shadow-xl shadow-indigo-500/25", onClick: function () { return navigate("/login"); } },
                        "Start a Demo ",
                        react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "ml-2 h-5 w-5" })),
                    react_1["default"].createElement(button_1.Button, { size: "lg", variant: "outline", className: "border-white/20 text-white hover:bg-white/8 text-base px-8 py-6", onClick: function () { return navigate("/features"); } }, "Explore Features")),
                react_1["default"].createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto" }, STATS.map(function (s) { return (react_1["default"].createElement("div", { key: s.label, className: "text-center" },
                    react_1["default"].createElement("p", { className: "text-3xl font-black text-indigo-400" }, s.value),
                    react_1["default"].createElement("p", { className: "text-xs text-white/40 mt-1" }, s.label))); })))),
        react_1["default"].createElement("section", { className: "py-24 border-t border-white/5" },
            react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" },
                react_1["default"].createElement("div", { className: "text-center mb-14" },
                    react_1["default"].createElement("p", { className: "text-xs uppercase tracking-widest text-indigo-400 font-semibold mb-3" }, "What's included"),
                    react_1["default"].createElement("h2", { className: "text-4xl md:text-5xl font-black mb-5" }, "Every module your business needs"),
                    react_1["default"].createElement("p", { className: "text-lg text-white/50 max-w-2xl mx-auto" }, "18 deeply integrated modules \u2014 not cobbled-together apps, but a single cohesive platform built from the ground up.")),
                react_1["default"].createElement("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" }, MODULES.map(function (mod) {
                    var Icon = mod.icon;
                    return (react_1["default"].createElement("div", { key: mod.label, className: "group rounded-2xl border border-white/8 bg-white/3 p-6 hover:border-white/20 hover:bg-white/6 transition-all duration-300" },
                        react_1["default"].createElement("div", { className: utils_1.cn("inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br mb-4", mod.color) },
                            react_1["default"].createElement(Icon, { className: "h-5 w-5 text-white" })),
                        react_1["default"].createElement("h3", { className: "font-semibold text-white mb-1" }, mod.label),
                        react_1["default"].createElement("p", { className: "text-xs text-white/45 leading-relaxed" }, mod.desc)));
                })))),
        react_1["default"].createElement("section", { className: "py-24 border-t border-white/5" },
            react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" },
                react_1["default"].createElement("div", { className: "text-center mb-16" },
                    react_1["default"].createElement("p", { className: "text-xs uppercase tracking-widest text-indigo-400 font-semibold mb-3" }, "Why Kiini"),
                    react_1["default"].createElement("h2", { className: "text-4xl md:text-5xl font-black mb-5" }, "Built for serious operations"),
                    react_1["default"].createElement("p", { className: "text-lg text-white/50 max-w-2xl mx-auto" }, "Designed for enterprises that need reliability, control, and insight across every function.")),
                react_1["default"].createElement("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6" }, FEATURES.map(function (f) {
                    var Icon = f.icon;
                    return (react_1["default"].createElement("div", { key: f.title, className: "rounded-2xl border border-white/8 bg-white/3 p-7 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all duration-300" },
                        react_1["default"].createElement(badge_1.Badge, { className: "mb-5 bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 text-xs" }, f.highlight),
                        react_1["default"].createElement("div", { className: "flex items-center gap-3 mb-3" },
                            react_1["default"].createElement(Icon, { className: "h-6 w-6 text-indigo-400" }),
                            react_1["default"].createElement("h3", { className: "text-lg font-bold" }, f.title)),
                        react_1["default"].createElement("p", { className: "text-white/50 text-sm leading-relaxed" }, f.desc)));
                })))),
        react_1["default"].createElement("section", { className: "py-24 border-t border-white/5 bg-white/2" },
            react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" },
                react_1["default"].createElement("div", { className: "text-center mb-16" },
                    react_1["default"].createElement("p", { className: "text-xs uppercase tracking-widest text-indigo-400 font-semibold mb-3" }, "Simple onboarding"),
                    react_1["default"].createElement("h2", { className: "text-4xl md:text-5xl font-black mb-5" }, "Up and running in minutes")),
                react_1["default"].createElement("div", { className: "grid md:grid-cols-3 gap-8" }, [
                    { step: "01", icon: lucide_react_1.Building2, title: "Set up your organization", desc: "Create your Kiini workspace, invite admins, and configure your plan in minutes." },
                    { step: "02", icon: lucide_react_1.Users, title: "Add your team", desc: "Invite staff with specific roles and permissions. They only see what they need." },
                    { step: "03", icon: lucide_react_1.Activity, title: "Run your business", desc: "Manage clients, raise invoices, track payroll, and monitor everything from your dashboard." },
                ].map(function (item) {
                    var Icon = item.icon;
                    return (react_1["default"].createElement("div", { key: item.step, className: "relative text-center" },
                        react_1["default"].createElement("div", { className: "text-6xl font-black text-white/5 absolute -top-4 left-1/2 -translate-x-1/2 select-none" }, item.step),
                        react_1["default"].createElement("div", { className: "relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 mb-5" },
                            react_1["default"].createElement(Icon, { className: "h-6 w-6 text-white" })),
                        react_1["default"].createElement("h3", { className: "text-xl font-bold mb-3" }, item.title),
                        react_1["default"].createElement("p", { className: "text-white/50 text-sm leading-relaxed max-w-xs mx-auto" }, item.desc)));
                })))),
        react_1["default"].createElement("section", { className: "py-24 border-t border-white/5" },
            react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" },
                react_1["default"].createElement("div", { className: "text-center mb-14" },
                    react_1["default"].createElement("p", { className: "text-xs uppercase tracking-widest text-indigo-400 font-semibold mb-3" }, "Transparent pricing"),
                    react_1["default"].createElement("h2", { className: "text-4xl md:text-5xl font-black mb-5" }, "Plans that scale with you"),
                    react_1["default"].createElement("p", { className: "text-lg text-white/50" }, "No hidden fees. Cancel anytime.")),
                react_1["default"].createElement("div", { className: "grid md:grid-cols-3 gap-6 max-w-5xl mx-auto" }, PLANS.map(function (plan) { return (react_1["default"].createElement("div", { key: plan.name, className: utils_1.cn("rounded-2xl border p-8 flex flex-col", plan.highlight
                        ? "border-indigo-500/60 bg-indigo-600/10 shadow-xl shadow-indigo-500/10"
                        : "border-white/10 bg-white/3") },
                    plan.badge && (react_1["default"].createElement(badge_1.Badge, { className: "mb-4 self-start bg-indigo-500 text-white border-0 text-xs px-2.5" }, plan.badge)),
                    react_1["default"].createElement("h3", { className: "text-xl font-bold mb-2" }, plan.name),
                    react_1["default"].createElement("div", { className: "flex items-baseline gap-1 mb-2" },
                        react_1["default"].createElement("span", { className: "text-4xl font-black" }, plan.price),
                        react_1["default"].createElement("span", { className: "text-white/40 text-sm" }, plan.per)),
                    react_1["default"].createElement("p", { className: "text-sm text-white/50 mb-6" }, plan.desc),
                    react_1["default"].createElement("ul", { className: "space-y-3 mb-8 flex-1" }, plan.features.map(function (f) { return (react_1["default"].createElement("li", { key: f, className: "flex items-start gap-2.5 text-sm text-white/70" },
                        react_1["default"].createElement(lucide_react_1.CheckCircle, { className: "h-4 w-4 text-emerald-400 shrink-0 mt-0.5" }),
                        " ",
                        f)); })),
                    react_1["default"].createElement(button_1.Button, { className: utils_1.cn("w-full", plan.highlight
                            ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                            : "border border-white/20 bg-transparent hover:bg-white/8 text-white"), onClick: function () { return navigate(plan.price === "Custom" ? "/contact" : "/login"); } }, plan.price === "Custom" ? "Contact Sales" : "Get Started"))); })),
                react_1["default"].createElement("div", { className: "text-center mt-8" },
                    react_1["default"].createElement(button_1.Button, { variant: "ghost", className: "text-indigo-400 hover:text-indigo-300", onClick: function () { return navigate("/pricing"); } }, "Compare all features \u2192")))),
        react_1["default"].createElement("section", { className: "py-24 border-t border-white/5 bg-white/2" },
            react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" },
                react_1["default"].createElement("div", { className: "text-center mb-14" },
                    react_1["default"].createElement("p", { className: "text-xs uppercase tracking-widest text-indigo-400 font-semibold mb-3" }, "Trusted by teams"),
                    react_1["default"].createElement("h2", { className: "text-4xl md:text-5xl font-black mb-5" }, "What our customers say")),
                react_1["default"].createElement("div", { className: "grid md:grid-cols-3 gap-6" }, TESTIMONIALS.map(function (t) { return (react_1["default"].createElement("div", { key: t.name, className: "rounded-2xl border border-white/8 bg-white/3 p-7" },
                    react_1["default"].createElement("div", { className: "flex gap-1 mb-4" }, Array.from({ length: t.stars }).map(function (_, i) { return (react_1["default"].createElement(lucide_react_1.Star, { key: i, className: "h-4 w-4 text-amber-400 fill-amber-400" })); })),
                    react_1["default"].createElement("p", { className: "text-white/70 text-sm leading-relaxed mb-6" },
                        "\"",
                        t.body,
                        "\""),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "font-semibold text-sm" }, t.name),
                        react_1["default"].createElement("p", { className: "text-xs text-white/40" }, t.title)))); })))),
        react_1["default"].createElement("section", { className: "py-24 border-t border-white/5" },
            react_1["default"].createElement("div", { className: "max-w-3xl mx-auto px-4 sm:px-6 lg:px-8" },
                react_1["default"].createElement("div", { className: "text-center mb-14" },
                    react_1["default"].createElement("p", { className: "text-xs uppercase tracking-widest text-indigo-400 font-semibold mb-3" }, "FAQ"),
                    react_1["default"].createElement("h2", { className: "text-4xl md:text-5xl font-black mb-5" }, "Common questions")),
                react_1["default"].createElement("div", { className: "space-y-3" }, FAQ_ITEMS.map(function (item) { return (react_1["default"].createElement(FaqItem, { key: item.q, q: item.q, a: item.a })); })))),
        react_1["default"].createElement("section", { className: "py-28 border-t border-white/5" },
            react_1["default"].createElement("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" },
                react_1["default"].createElement("div", { className: "relative inline-block mb-8" },
                    react_1["default"].createElement("div", { className: "absolute inset-0 bg-indigo-600/20 blur-3xl rounded-full" }),
                    react_1["default"].createElement("div", { className: "relative flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600" },
                        react_1["default"].createElement(lucide_react_1.Zap, { className: "h-8 w-8 text-white" }))),
                react_1["default"].createElement("h2", { className: "text-4xl md:text-5xl lg:text-6xl font-black mb-6" },
                    "Ready to take",
                    " ",
                    react_1["default"].createElement("span", { className: "bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent" }, "total control?")),
                react_1["default"].createElement("p", { className: "text-xl text-white/50 mb-10 max-w-xl mx-auto" }, "Join forward-thinking businesses that run everything on Kiini."),
                react_1["default"].createElement("div", { className: "flex flex-col sm:flex-row gap-4 justify-center" },
                    react_1["default"].createElement(button_1.Button, { size: "lg", className: "bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-6 text-lg shadow-xl shadow-indigo-500/25", onClick: function () { return navigate("/login"); } },
                        "Launch Your Hub ",
                        react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "ml-2 h-5 w-5" })),
                    react_1["default"].createElement(button_1.Button, { size: "lg", variant: "outline", className: "border-white/20 text-white hover:bg-white/8 px-10 py-6 text-lg", onClick: function () { return navigate("/contact"); } }, "Talk to Sales")))),
        react_1["default"].createElement(WebsiteFooter_1.WebsiteFooter, null)));
}
exports["default"] = LandingPage;
