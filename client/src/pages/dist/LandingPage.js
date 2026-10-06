"use strict";
exports.__esModule = true;
var react_1 = require("react");
var useAuthWithPersistence_1 = require("@/_core/hooks/useAuthWithPersistence");
var wouter_1 = require("wouter");
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var WebsiteNav_1 = require("./website/WebsiteNav");
var WebsiteFooter_1 = require("./website/WebsiteFooter");
var WebsiteMocks_1 = require("./website/WebsiteMocks");
var CurrencyContext_1 = require("./website/CurrencyContext");
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
        monthlyKes: 5999,
        per: "/mo",
        desc: "Perfect for small teams just getting started.",
        highlight: false,
        badge: null,
        features: ["Up to 10 users", "Core CRM & Sales", "Invoicing & Payments", "Basic HR", "Standard reports", "Email support"]
    },
    {
        name: "Gold",
        monthlyKes: 12999,
        per: "/mo",
        desc: "For mid-sized businesses with more advanced needs.",
        highlight: false,
        badge: null,
        features: ["Up to 50 users", "All Starter modules", "Enhanced reporting", "Email support"]
    },
    {
        name: "Professional",
        monthlyKes: 18999,
        per: "/mo",
        desc: "For growing businesses with advanced needs.",
        highlight: true,
        badge: "Most Popular",
        features: ["Up to 50 users", "All Starter modules", "Procurement & Inventory", "Projects & Work Orders", "Advanced Analytics", "M-Pesa / Stripe integration", "Priority support"]
    },
    {
        name: "Enterprise",
        monthlyKes: 0,
        per: "",
        desc: "Unlimited scale with dedicated support.",
        highlight: false,
        badge: null,
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
    return (react_1["default"].createElement("div", { className: "border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow" },
        react_1["default"].createElement("button", { className: "w-full flex items-center justify-between px-6 py-4 text-left text-gray-900 font-medium hover:bg-gray-50 transition-colors", onClick: function () { return setOpen(!open); } },
            react_1["default"].createElement("span", null, q),
            react_1["default"].createElement(lucide_react_1.ChevronRight, { className: utils_1.cn("h-4 w-4 text-gray-400 shrink-0 transition-transform", open && "rotate-90") })),
        open && (react_1["default"].createElement("div", { className: "px-6 pb-5 text-gray-600 text-sm leading-relaxed" }, a))));
}
function LandingPage() {
    var user = useAuthWithPersistence_1.useAuthWithPersistence().user;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = CurrencyContext_1.useCurrency(), fmt = _b.fmt, currency = _b.currency, setCurrency = _b.setCurrency;
    // Pull content from admin DB with hardcoded fallbacks
    var dbTestimonials = trpc_1.trpc.websiteAdmin.publicTestimonials.useQuery({}).data;
    var dbFAQs = trpc_1.trpc.websiteAdmin.publicFAQs.useQuery({}).data;
    var dbHero = trpc_1.trpc.websiteAdmin.publicHeroContent.useQuery({}).data;
    var testimonials = dbTestimonials && dbTestimonials.length > 0
        ? dbTestimonials.map(function (t) { return ({ name: t.name, title: "" + (t.role || "") + (t.company ? ", " + t.company : ""), stars: t.rating || 5, body: t.content }); })
        : TESTIMONIALS;
    var faqItems = dbFAQs && dbFAQs.length > 0
        ? dbFAQs.map(function (f) { return ({ q: f.question, a: f.answer }); })
        : FAQ_ITEMS;
    var heroStats = (dbHero === null || dbHero === void 0 ? void 0 : dbHero.stats) && dbHero.stats.length > 0 ? dbHero.stats : STATS;
    return (react_1["default"].createElement("div", { className: "min-h-screen bg-white text-gray-900 overflow-x-hidden" },
        react_1["default"].createElement("style", null, "\n        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }\n        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }\n        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }\n        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }\n        @keyframes pulse-subtle { 0%,100% { opacity: 1; } 50% { opacity: 0.7; } }\n        .animate-fadeInUp { animation: fadeInUp 0.7s ease-out both; }\n        .animate-fadeIn { animation: fadeIn 0.6s ease-out both; }\n        .animate-slideInLeft { animation: slideInLeft 0.6s ease-out both; }\n        .animate-float { animation: float 3s ease-in-out infinite; }\n        .delay-100 { animation-delay: 0.1s; } .delay-200 { animation-delay: 0.2s; } .delay-300 { animation-delay: 0.3s; }\n        .delay-400 { animation-delay: 0.4s; } .delay-500 { animation-delay: 0.5s; }\n      "),
        react_1["default"].createElement(WebsiteNav_1.WebsiteNav, null),
        react_1["default"].createElement("section", { className: "relative pt-32 pb-24 lg:pt-44 lg:pb-32 overflow-hidden bg-gradient-to-b from-indigo-50/80 via-white to-white" },
            react_1["default"].createElement("div", { className: "absolute inset-0 -z-10" },
                react_1["default"].createElement("div", { className: "absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-100/60 rounded-full blur-3xl" }),
                react_1["default"].createElement("div", { className: "absolute top-40 right-0 w-[400px] h-[400px] bg-violet-100/50 rounded-full blur-3xl" }),
                react_1["default"].createElement("div", { className: "absolute bottom-0 left-20 w-[300px] h-[300px] bg-blue-100/40 rounded-full blur-3xl" })),
            react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" },
                react_1["default"].createElement(badge_1.Badge, { className: "mb-6 bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 animate-fadeIn" },
                    react_1["default"].createElement(lucide_react_1.Zap, { className: "mr-1.5 h-3 w-3" }),
                    " Enterprise Business Platform"),
                react_1["default"].createElement("h1", { className: "text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-none animate-fadeInUp" },
                    "One Hub.",
                    react_1["default"].createElement("br", null),
                    react_1["default"].createElement("span", { className: "bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent" }, "Total Control.")),
                react_1["default"].createElement("p", { className: "text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto mb-10 leading-relaxed animate-fadeInUp delay-200" }, "Kiini unifies CRM, HR, Finance, Projects, Procurement, Templates & Documents, and more \u2014 so your entire business runs from a single, powerful platform."),
                react_1["default"].createElement("div", { className: "flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fadeInUp delay-300" },
                    react_1["default"].createElement(button_1.Button, { size: "lg", className: "bg-indigo-600 hover:bg-indigo-700 text-white text-base px-8 py-6 shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all", onClick: function () { return navigate("/demo"); } },
                        "Start a Demo ",
                        react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "ml-2 h-5 w-5" })),
                    react_1["default"].createElement(button_1.Button, { size: "lg", variant: "outline", className: "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-indigo-300 text-base px-8 py-6 transition-all", onClick: function () { return navigate("/features"); } }, "Explore Features")),
                react_1["default"].createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto animate-fadeInUp delay-400" }, heroStats.map(function (s) { return (react_1["default"].createElement("div", { key: s.label, className: "text-center group", title: s.value + " " + s.label },
                    react_1["default"].createElement("p", { className: "text-3xl font-black text-indigo-600 group-hover:scale-110 transition-transform" }, s.value),
                    react_1["default"].createElement("p", { className: "text-xs text-gray-400 mt-1" }, s.label))); })),
                react_1["default"].createElement("div", { className: "mt-16 max-w-4xl mx-auto animate-fadeInUp delay-500" },
                    react_1["default"].createElement(WebsiteMocks_1.MockDashboardScreenshot, null)))),
        react_1["default"].createElement("section", { className: "py-24 border-t border-gray-100" },
            react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" },
                react_1["default"].createElement("div", { className: "text-center mb-14" },
                    react_1["default"].createElement("p", { className: "text-xs uppercase tracking-widest text-indigo-600 font-semibold mb-3" }, "What's included"),
                    react_1["default"].createElement("h2", { className: "text-4xl md:text-5xl font-black mb-5" }, "Every module your business needs"),
                    react_1["default"].createElement("p", { className: "text-lg text-gray-500 max-w-2xl mx-auto" }, "18 deeply integrated modules \u2014 not cobbled-together apps, but a single cohesive platform built from the ground up.")),
                react_1["default"].createElement("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" }, MODULES.map(function (mod, idx) {
                    var Icon = mod.icon;
                    return (react_1["default"].createElement("div", { key: mod.label, className: "group rounded-2xl border border-gray-200 bg-white p-6 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100/50 hover:-translate-y-1 transition-all duration-300 cursor-default", title: mod.desc },
                        react_1["default"].createElement("div", { className: utils_1.cn("inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br mb-4 shadow-md", mod.color) },
                            react_1["default"].createElement(Icon, { className: "h-5 w-5 text-white" })),
                        react_1["default"].createElement("h3", { className: "font-semibold text-gray-900 mb-1" }, mod.label),
                        react_1["default"].createElement("p", { className: "text-xs text-gray-400 leading-relaxed" }, mod.desc)));
                })))),
        react_1["default"].createElement("section", { className: "py-24 border-t border-gray-100 bg-gray-50/50" },
            react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" },
                react_1["default"].createElement("div", { className: "text-center mb-16" },
                    react_1["default"].createElement("p", { className: "text-xs uppercase tracking-widest text-indigo-600 font-semibold mb-3" }, "Why Kiini"),
                    react_1["default"].createElement("h2", { className: "text-4xl md:text-5xl font-black mb-5" }, "Built for serious operations"),
                    react_1["default"].createElement("p", { className: "text-lg text-gray-500 max-w-2xl mx-auto" }, "Designed for enterprises that need reliability, control, and insight across every function.")),
                react_1["default"].createElement("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6" }, FEATURES.map(function (f) {
                    var Icon = f.icon;
                    return (react_1["default"].createElement("div", { key: f.title, className: "rounded-2xl border border-gray-200 bg-white p-7 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-50 hover:-translate-y-1 transition-all duration-300" },
                        react_1["default"].createElement(badge_1.Badge, { className: "mb-5 bg-indigo-50 text-indigo-600 border border-indigo-200 text-xs" }, f.highlight),
                        react_1["default"].createElement("div", { className: "flex items-center gap-3 mb-3" },
                            react_1["default"].createElement(Icon, { className: "h-6 w-6 text-indigo-600" }),
                            react_1["default"].createElement("h3", { className: "text-lg font-bold text-gray-900" }, f.title)),
                        react_1["default"].createElement("p", { className: "text-gray-500 text-sm leading-relaxed" }, f.desc)));
                })))),
        react_1["default"].createElement("section", { className: "py-24 border-t border-gray-100 bg-white" },
            react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" },
                react_1["default"].createElement("div", { className: "text-center mb-12" },
                    react_1["default"].createElement("p", { className: "text-xs uppercase tracking-widest text-indigo-600 font-semibold mb-3 flex items-center justify-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.Cloud, { className: "h-3.5 w-3.5" }),
                        " Cloud Powered"),
                    react_1["default"].createElement("h2", { className: "text-4xl md:text-5xl font-black mb-5" },
                        "Built for the cloud,",
                        react_1["default"].createElement("span", { className: "bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent" }, " runs anywhere")),
                    react_1["default"].createElement("p", { className: "text-lg text-gray-500 max-w-2xl mx-auto" }, "Deploy on your cloud of choice, or let us manage it. Kiini is fully containerized and cloud-native \u2014 designed to run on the world's most trusted infrastructure.")),
                react_1["default"].createElement("div", { className: "flex flex-wrap justify-center gap-3 mb-14" }, [
                    { label: "Amazon Web Services", short: "AWS", color: "text-orange-600", border: "border-orange-200", bg: "bg-orange-50" },
                    { label: "Microsoft Azure", short: "Azure", color: "text-blue-600", border: "border-blue-200", bg: "bg-blue-50" },
                    { label: "Google Cloud", short: "GCP", color: "text-sky-600", border: "border-sky-200", bg: "bg-sky-50" },
                    { label: "DigitalOcean", short: "DigitalOcean", color: "text-blue-500", border: "border-blue-200", bg: "bg-blue-50" },
                    { label: "Cloudflare", short: "Cloudflare", color: "text-orange-500", border: "border-orange-200", bg: "bg-orange-50" },
                    { label: "Docker", short: "Docker", color: "text-cyan-600", border: "border-cyan-200", bg: "bg-cyan-50" },
                ].map(function (p) { return (react_1["default"].createElement("div", { key: p.short, className: utils_1.cn("inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 hover:shadow-md transition-shadow", p.border, p.bg), title: p.label },
                    react_1["default"].createElement(lucide_react_1.Server, { className: utils_1.cn("h-4 w-4", p.color) }),
                    react_1["default"].createElement("span", { className: utils_1.cn("text-sm font-semibold", p.color) }, p.short),
                    react_1["default"].createElement("span", { className: "text-xs text-gray-400 hidden sm:inline" }, p.label))); })),
                react_1["default"].createElement("div", { className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14" }, [
                    { icon: lucide_react_1.Globe, title: "Global CDN", desc: "Serve your users from the nearest edge node with sub-50ms response times worldwide.", color: "text-indigo-600" },
                    { icon: lucide_react_1.Cpu, title: "Auto-scaling", desc: "Traffic spikes handled seamlessly. Your platform scales up instantly and back down automatically.", color: "text-violet-600" },
                    { icon: lucide_react_1.Shield, title: "99.9% Uptime SLA", desc: "Enterprise-grade reliability with redundancy across availability zones and automated failover.", color: "text-emerald-600" },
                    { icon: lucide_react_1.Package, title: "Deploy Anywhere", desc: "Docker-native deployment means you can run Kiini on any cloud or on-premise infrastructure.", color: "text-amber-600" },
                ].map(function (card) {
                    var Icon = card.icon;
                    return (react_1["default"].createElement("div", { key: card.title, className: "rounded-2xl border border-gray-200 bg-white p-6 hover:border-indigo-300 hover:shadow-lg transition-all", title: card.desc },
                        react_1["default"].createElement(Icon, { className: utils_1.cn("h-7 w-7 mb-4", card.color) }),
                        react_1["default"].createElement("h3", { className: "font-bold text-gray-900 mb-2" }, card.title),
                        react_1["default"].createElement("p", { className: "text-sm text-gray-500 leading-relaxed" }, card.desc)));
                })),
                react_1["default"].createElement("div", { className: "grid md:grid-cols-3 gap-4" }, [
                    { title: "Fully Managed Cloud", desc: "We handle hosting, backups, updates, and scaling. Zero ops overhead for your team.", badge: "Recommended", badgeColor: "bg-indigo-600" },
                    { title: "Self-hosted Docker", desc: "Deploy on your own servers using our Docker Compose stack. Full control, your infrastructure.", badge: "Popular", badgeColor: "bg-violet-600" },
                    { title: "Private Cloud / VPC", desc: "Deploy inside your AWS, Azure, or GCP VPC for maximum data sovereignty and compliance.", badge: "Enterprise", badgeColor: "bg-emerald-600" },
                ].map(function (opt) { return (react_1["default"].createElement("div", { key: opt.title, className: "rounded-2xl border border-gray-200 bg-gray-50 p-6 hover:shadow-md transition-shadow" },
                    react_1["default"].createElement("span", { className: utils_1.cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold text-white mb-4", opt.badgeColor) }, opt.badge),
                    react_1["default"].createElement("h4", { className: "font-bold text-gray-900 mb-2" }, opt.title),
                    react_1["default"].createElement("p", { className: "text-sm text-gray-500 leading-relaxed" }, opt.desc))); })))),
        react_1["default"].createElement("section", { className: "py-24 border-t border-gray-100 bg-gray-50/50" },
            react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" },
                react_1["default"].createElement("div", { className: "text-center mb-14" },
                    react_1["default"].createElement("p", { className: "text-xs uppercase tracking-widest text-indigo-600 font-semibold mb-3" }, "Live Platform"),
                    react_1["default"].createElement("h2", { className: "text-4xl md:text-5xl font-black mb-5" }, "See Kiini in action"),
                    react_1["default"].createElement("p", { className: "text-lg text-gray-500 max-w-2xl mx-auto" }, "Every module. One workspace. Real data, real time.")),
                react_1["default"].createElement("div", { className: "grid md:grid-cols-2 gap-6" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "text-xs uppercase tracking-widest text-gray-400 font-semibold mb-3" }, "Sales Pipeline & CRM"),
                        react_1["default"].createElement(WebsiteMocks_1.MockCRMScreenshot, null)),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "text-xs uppercase tracking-widest text-gray-400 font-semibold mb-3" }, "Finance & Invoicing"),
                        react_1["default"].createElement(WebsiteMocks_1.MockFinanceScreenshot, null)),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "text-xs uppercase tracking-widest text-gray-400 font-semibold mb-3" }, "HR & Payroll"),
                        react_1["default"].createElement(WebsiteMocks_1.MockHRScreenshot, null)),
                    react_1["default"].createElement("div", { className: "rounded-2xl border border-gray-200 bg-white p-8 flex flex-col justify-center shadow-sm hover:shadow-md transition-shadow" },
                        react_1["default"].createElement(lucide_react_1.Sparkles, { className: "h-8 w-8 text-indigo-600 mb-4" }),
                        react_1["default"].createElement("h3", { className: "text-xl font-bold text-gray-900 mb-3" }, "And 15 more modules"),
                        react_1["default"].createElement("p", { className: "text-gray-500 text-sm leading-relaxed mb-6" }, "Projects, Procurement, Attendance, Contracts, Budgets, Tickets, Communications, and more \u2014 all connected, all real-time."),
                        react_1["default"].createElement(button_1.Button, { className: "bg-indigo-600 hover:bg-indigo-700 text-white self-start shadow-sm", onClick: function () { return navigate("/features"); } },
                            "Explore all features ",
                            react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "ml-2 h-4 w-4" })))))),
        react_1["default"].createElement("section", { className: "py-24 border-t border-gray-100 bg-white" },
            react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" },
                react_1["default"].createElement("div", { className: "text-center mb-16" },
                    react_1["default"].createElement("p", { className: "text-xs uppercase tracking-widest text-indigo-600 font-semibold mb-3" }, "Simple onboarding"),
                    react_1["default"].createElement("h2", { className: "text-4xl md:text-5xl font-black mb-5" }, "Up and running in minutes")),
                react_1["default"].createElement("div", { className: "grid md:grid-cols-3 gap-8" }, [
                    { step: "01", icon: lucide_react_1.Building2, title: "Set up your organization", desc: "Create your Kiini workspace, invite admins, and configure your plan in minutes." },
                    { step: "02", icon: lucide_react_1.Users, title: "Add your team", desc: "Invite staff with specific roles and permissions. They only see what they need." },
                    { step: "03", icon: lucide_react_1.Activity, title: "Run your business", desc: "Manage clients, raise invoices, track payroll, and monitor everything from your dashboard." },
                ].map(function (item) {
                    var Icon = item.icon;
                    return (react_1["default"].createElement("div", { key: item.step, className: "relative text-center group" },
                        react_1["default"].createElement("div", { className: "text-6xl font-black text-gray-100 absolute -top-4 left-1/2 -translate-x-1/2 select-none group-hover:text-indigo-100 transition-colors" }, item.step),
                        react_1["default"].createElement("div", { className: "relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 mb-5 shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform" },
                            react_1["default"].createElement(Icon, { className: "h-6 w-6 text-white" })),
                        react_1["default"].createElement("h3", { className: "text-xl font-bold text-gray-900 mb-3" }, item.title),
                        react_1["default"].createElement("p", { className: "text-gray-500 text-sm leading-relaxed max-w-xs mx-auto" }, item.desc)));
                })))),
        react_1["default"].createElement("section", { className: "py-24 border-t border-gray-100 bg-gray-50/50" },
            react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" },
                react_1["default"].createElement("div", { className: "text-center mb-14" },
                    react_1["default"].createElement("p", { className: "text-xs uppercase tracking-widest text-indigo-600 font-semibold mb-3" }, "Transparent pricing"),
                    react_1["default"].createElement("h2", { className: "text-4xl md:text-5xl font-black mb-5" }, "Plans that scale with you"),
                    react_1["default"].createElement("p", { className: "text-lg text-gray-500" }, "No hidden fees. Cancel anytime.")),
                react_1["default"].createElement("div", { className: "grid md:grid-cols-3 gap-6 max-w-5xl mx-auto" }, PLANS.map(function (plan) { return (react_1["default"].createElement("div", { key: plan.name, className: utils_1.cn("rounded-2xl border p-8 flex flex-col hover:shadow-xl transition-all duration-300 hover:-translate-y-1", plan.highlight
                        ? "border-indigo-400 bg-gradient-to-b from-indigo-50 to-white shadow-lg shadow-indigo-100"
                        : "border-gray-200 bg-white") },
                    plan.badge && (react_1["default"].createElement(badge_1.Badge, { className: "mb-4 self-start bg-indigo-600 text-white border-0 text-xs px-2.5" }, plan.badge)),
                    react_1["default"].createElement("h3", { className: "text-xl font-bold text-gray-900 mb-2" }, plan.name),
                    react_1["default"].createElement("div", { className: "flex items-baseline gap-1 mb-2" },
                        react_1["default"].createElement("span", { className: "text-4xl font-black text-gray-900" }, plan.monthlyKes === 0 ? "Custom" : fmt(plan.monthlyKes)),
                        plan.monthlyKes !== 0 && react_1["default"].createElement("span", { className: "text-gray-400 text-sm" }, "/mo")),
                    react_1["default"].createElement("p", { className: "text-sm text-gray-500 mb-6" }, plan.desc),
                    react_1["default"].createElement("ul", { className: "space-y-3 mb-8 flex-1" }, plan.features.map(function (f) { return (react_1["default"].createElement("li", { key: f, className: "flex items-start gap-2.5 text-sm text-gray-600" },
                        react_1["default"].createElement(lucide_react_1.CheckCircle, { className: "h-4 w-4 text-emerald-500 shrink-0 mt-0.5" }),
                        " ",
                        f)); })),
                    react_1["default"].createElement(button_1.Button, { className: utils_1.cn("w-full", plan.highlight
                            ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                            : "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"), onClick: function () { return navigate(plan.monthlyKes === 0 ? "/contact" : "/pricing"); } }, plan.monthlyKes === 0 ? "Contact Sales" : "Get Started"))); })),
                react_1["default"].createElement("div", { className: "text-center mt-8" },
                    react_1["default"].createElement(button_1.Button, { variant: "ghost", className: "text-indigo-600 hover:text-indigo-700", onClick: function () { return navigate("/pricing"); } }, "Compare all features \u2192")))),
        react_1["default"].createElement("section", { className: "py-24 border-t border-gray-100 bg-white" },
            react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" },
                react_1["default"].createElement("div", { className: "text-center mb-14" },
                    react_1["default"].createElement("p", { className: "text-xs uppercase tracking-widest text-indigo-600 font-semibold mb-3" }, "Trusted by teams"),
                    react_1["default"].createElement("h2", { className: "text-4xl md:text-5xl font-black mb-5" }, "What our customers say")),
                react_1["default"].createElement("div", { className: "grid md:grid-cols-3 gap-6" }, testimonials.map(function (t) { return (react_1["default"].createElement("div", { key: t.name, className: "rounded-2xl border border-gray-200 bg-white p-7 hover:shadow-lg transition-shadow" },
                    react_1["default"].createElement("div", { className: "flex gap-1 mb-4" }, Array.from({ length: t.stars }).map(function (_, i) { return (react_1["default"].createElement(lucide_react_1.Star, { key: i, className: "h-4 w-4 text-amber-400 fill-amber-400" })); })),
                    react_1["default"].createElement("p", { className: "text-gray-600 text-sm leading-relaxed mb-6" },
                        "\"",
                        t.body,
                        "\""),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "font-semibold text-sm text-gray-900" }, t.name),
                        react_1["default"].createElement("p", { className: "text-xs text-gray-400" }, t.title)))); })))),
        react_1["default"].createElement("section", { className: "py-24 border-t border-gray-100 bg-gray-50/50" },
            react_1["default"].createElement("div", { className: "max-w-3xl mx-auto px-4 sm:px-6 lg:px-8" },
                react_1["default"].createElement("div", { className: "text-center mb-14" },
                    react_1["default"].createElement("p", { className: "text-xs uppercase tracking-widest text-indigo-600 font-semibold mb-3" }, "FAQ"),
                    react_1["default"].createElement("h2", { className: "text-4xl md:text-5xl font-black mb-5" }, "Common questions")),
                react_1["default"].createElement("div", { className: "space-y-3" }, faqItems.map(function (item) { return (react_1["default"].createElement(FaqItem, { key: item.q, q: item.q, a: item.a })); })))),
        react_1["default"].createElement("section", { className: "py-28 border-t border-gray-100 bg-gradient-to-b from-white to-indigo-50/50" },
            react_1["default"].createElement("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" },
                react_1["default"].createElement("div", { className: "relative inline-block mb-8" },
                    react_1["default"].createElement("div", { className: "absolute inset-0 bg-indigo-200/50 blur-3xl rounded-full" }),
                    react_1["default"].createElement("div", { className: "relative flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200 animate-float" },
                        react_1["default"].createElement(lucide_react_1.Zap, { className: "h-8 w-8 text-white" }))),
                react_1["default"].createElement("h2", { className: "text-4xl md:text-5xl lg:text-6xl font-black mb-6" },
                    "Ready to take",
                    " ",
                    react_1["default"].createElement("span", { className: "bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent" }, "total control?")),
                react_1["default"].createElement("p", { className: "text-xl text-gray-500 mb-10 max-w-xl mx-auto" }, "Join forward-thinking businesses that run everything on Kiini."),
                react_1["default"].createElement("div", { className: "flex flex-col sm:flex-row gap-4 justify-center" },
                    react_1["default"].createElement(button_1.Button, { size: "lg", className: "bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-6 text-lg shadow-lg shadow-indigo-200 hover:shadow-xl transition-all", onClick: function () { return navigate("/login"); } },
                        "Launch Your Hub ",
                        react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "ml-2 h-5 w-5" })),
                    react_1["default"].createElement(button_1.Button, { size: "lg", variant: "outline", className: "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-indigo-300 px-10 py-6 text-lg transition-all", onClick: function () { return navigate("/contact"); } }, "Talk to Sales")))),
        react_1["default"].createElement(WebsiteFooter_1.WebsiteFooter, null)));
}
exports["default"] = LandingPage;
