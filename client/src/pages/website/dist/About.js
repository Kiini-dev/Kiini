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
var trpc_1 = require("@/lib/trpc");
var ICON_MAP = { Shield: lucide_react_1.Shield, Lightbulb: lucide_react_1.Lightbulb, Heart: lucide_react_1.Heart, Globe: lucide_react_1.Globe, Sparkles: lucide_react_1.Sparkles, Target: lucide_react_1.Target, Award: lucide_react_1.Award, Users: lucide_react_1.Users, Zap: lucide_react_1.Zap };
var DEFAULT_VALUES = [
    {
        icon: lucide_react_1.Shield,
        title: "Reliability",
        desc: "We build platforms that teams depend on every day. Uptime, data integrity, and consistency are non-negotiable.",
        color: "from-blue-500 to-blue-600"
    },
    {
        icon: lucide_react_1.Lightbulb,
        title: "Simplicity",
        desc: "Powerful does not have to mean complex. We design for clarity so your team can get work done without training manuals.",
        color: "from-amber-500 to-orange-600"
    },
    {
        icon: lucide_react_1.Heart,
        title: "Customer-first",
        desc: "Every feature we build is driven by real customer feedback. Your business problems shape our product roadmap.",
        color: "from-rose-500 to-red-600"
    },
    {
        icon: lucide_react_1.Globe,
        title: "Global perspective, local roots",
        desc: "Built with African markets in mind — M-Pesa, KRA, Kenyan payroll — but designed for businesses worldwide.",
        color: "from-emerald-500 to-teal-600"
    },
    {
        icon: lucide_react_1.Sparkles,
        title: "Innovation",
        desc: "We are not content with the status quo. AI, automation, and continuous improvement are built into how we work.",
        color: "from-violet-500 to-purple-600"
    },
    {
        icon: lucide_react_1.Target,
        title: "Accountability",
        desc: "We own our results. If something is broken, we fix it. If something can be better, we improve it. No excuses.",
        color: "from-cyan-500 to-blue-600"
    },
];
var DEFAULT_TEAM = [
    { name: "Dr. Jane Mwangi", role: "Chief Executive Officer", bio: "15 years of enterprise software leadership across East Africa. Previously Director of Digital Transformation at a pan-African financial group." },
    { name: "Kevin Odhiambo", role: "Chief Technology Officer", bio: "Full-stack architect with a track record of scaling SaaS platforms. Open-source contributor and systems design expert." },
    { name: "Amelia Njoroge", role: "Head of Product", bio: "Product strategist who has launched B2B products used by 200+ enterprises. Advocates for user-centric design at every layer." },
    { name: "Samuel Otieno", role: "Head of Customer Success", bio: "Oversees onboarding, support, and retention. Ensures every Kiini customer gets maximum value from day one." },
];
var DEFAULT_MILESTONES = [
    { year: "2022", event: "Kiini founded with a mission to unify African business software." },
    { year: "2023", event: "Core platform shipped — CRM, Finance, and HR modules go live." },
    { year: "2024", event: "Procurement, Projects, AI Hub, and M-Pesa integration launched." },
    { year: "2025", event: "Multi-tenant architecture released, enabling group-wide deployments." },
    { year: "2026", event: "18-module platform with 99.9% uptime SLA and enterprise contracts." },
];
function About() {
    var _a, _b, _c, _d;
    var _e = wouter_1.useLocation(), navigate = _e[1];
    var dbContent = trpc_1.trpc.websiteAdmin.publicAboutContent.useQuery(undefined, { retry: false, staleTime: 300000 }).data;
    var heroTitle = (dbContent === null || dbContent === void 0 ? void 0 : dbContent.heroTitle) || "Built to put businesses back in control";
    var heroSubtitle = (dbContent === null || dbContent === void 0 ? void 0 : dbContent.heroSubtitle) || "We started Kiini because we were tired of watching great businesses struggle with fragmented tools that never spoke to each other. One invoice in one system. Payroll in another. HR somewhere else. Reports nowhere. We built the platform we wished existed.";
    var missionText = (dbContent === null || dbContent === void 0 ? void 0 : dbContent.missionText) || "We believe business software should work for the people running businesses, not the other way around. Kiini is designed to eliminate silos, automate repetitive work, and give leadership real-time visibility into every function — finance, people, operations, and customers — from a single window.";
    var stats = ((_a = dbContent === null || dbContent === void 0 ? void 0 : dbContent.stats) === null || _a === void 0 ? void 0 : _a.length) ? dbContent.stats : [
        { label: "Organizations powered", value: "200+" },
        { label: "Users on platform", value: "5,000+" },
        { label: "Uptime SLA", value: "99.9%" },
        { label: "Modules integrated", value: "18" },
    ];
    var values = ((_b = dbContent === null || dbContent === void 0 ? void 0 : dbContent.values) === null || _b === void 0 ? void 0 : _b.length) ? dbContent.values.map(function (v) { return (__assign(__assign({}, v), { icon: ICON_MAP[v.icon] || lucide_react_1.Shield })); }) : DEFAULT_VALUES;
    var milestones = ((_c = dbContent === null || dbContent === void 0 ? void 0 : dbContent.milestones) === null || _c === void 0 ? void 0 : _c.length) ? dbContent.milestones : DEFAULT_MILESTONES;
    var team = ((_d = dbContent === null || dbContent === void 0 ? void 0 : dbContent.team) === null || _d === void 0 ? void 0 : _d.length) ? dbContent.team : DEFAULT_TEAM;
    return (react_1["default"].createElement("div", { className: "min-h-screen bg-white text-gray-900 overflow-x-hidden" },
        react_1["default"].createElement(WebsiteNav_1.WebsiteNav, null),
        react_1["default"].createElement("section", { className: "relative pt-32 pb-20 lg:pt-44 lg:pb-28 overflow-hidden bg-gradient-to-b from-indigo-50/80 via-white to-white" },
            react_1["default"].createElement("div", { className: "absolute inset-0 -z-10" },
                react_1["default"].createElement("div", { className: "absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-100/60 rounded-full blur-3xl" })),
            react_1["default"].createElement("div", { className: "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center" },
                react_1["default"].createElement(badge_1.Badge, { className: "mb-6 bg-indigo-50 text-indigo-600 border border-indigo-200" },
                    react_1["default"].createElement(lucide_react_1.Zap, { className: "mr-1.5 h-3 w-3" }),
                    " Our story"),
                react_1["default"].createElement("h1", { className: "text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-none" }, heroTitle),
                react_1["default"].createElement("p", { className: "text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed" }, heroSubtitle))),
        react_1["default"].createElement("section", { className: "py-20 border-t border-gray-100" },
            react_1["default"].createElement("div", { className: "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8" },
                react_1["default"].createElement("div", { className: "grid lg:grid-cols-2 gap-12 items-center" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "text-xs uppercase tracking-widest text-indigo-600 font-semibold mb-4" }, "Our mission"),
                        react_1["default"].createElement("h2", { className: "text-4xl font-black mb-6 leading-tight" }, "Give every business one hub. Total control."),
                        react_1["default"].createElement("p", { className: "text-gray-500 leading-relaxed mb-6" }, missionText),
                        react_1["default"].createElement("p", { className: "text-gray-500 leading-relaxed" }, "We serve businesses across Africa and beyond, with particular depth in Kenya's financial and compliance ecosystem \u2014 from M-Pesa to KRA to Kenyan payroll statutes.")),
                    react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-4" }, stats.map(function (s) { return (react_1["default"].createElement("div", { key: s.label, className: "rounded-2xl border border-gray-200 bg-gray-50/50 p-6 text-center hover:shadow-md transition-shadow" },
                        react_1["default"].createElement("p", { className: "text-4xl font-black text-indigo-600 mb-1" }, s.value),
                        react_1["default"].createElement("p", { className: "text-xs text-gray-400" }, s.label))); }))))),
        react_1["default"].createElement("section", { className: "py-24 border-t border-gray-100 bg-gray-50/50" },
            react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" },
                react_1["default"].createElement("div", { className: "text-center mb-14" },
                    react_1["default"].createElement("p", { className: "text-xs uppercase tracking-widest text-indigo-600 font-semibold mb-3" }, "What we stand for"),
                    react_1["default"].createElement("h2", { className: "text-4xl md:text-5xl font-black" }, "Our values")),
                react_1["default"].createElement("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-6" }, values.map(function (v) {
                    var Icon = v.icon;
                    return (react_1["default"].createElement("div", { key: v.title, className: "rounded-2xl border border-gray-200 bg-white p-7 hover:shadow-lg hover:border-indigo-300 transition-all" },
                        react_1["default"].createElement("div", { className: utils_1.cn("inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br mb-5", v.color) },
                            react_1["default"].createElement(Icon, { className: "h-5 w-5 text-white" })),
                        react_1["default"].createElement("h3", { className: "text-lg font-bold mb-2" }, v.title),
                        react_1["default"].createElement("p", { className: "text-sm text-gray-500 leading-relaxed" }, v.desc)));
                })))),
        react_1["default"].createElement("section", { className: "py-24 border-t border-gray-100" },
            react_1["default"].createElement("div", { className: "max-w-3xl mx-auto px-4 sm:px-6 lg:px-8" },
                react_1["default"].createElement("div", { className: "text-center mb-14" },
                    react_1["default"].createElement("p", { className: "text-xs uppercase tracking-widest text-indigo-600 font-semibold mb-3" }, "Our journey"),
                    react_1["default"].createElement("h2", { className: "text-4xl font-black" }, "From idea to platform")),
                react_1["default"].createElement("div", { className: "space-y-0" }, milestones.map(function (m, i) { return (react_1["default"].createElement("div", { key: m.year, className: "flex gap-6" },
                    react_1["default"].createElement("div", { className: "flex flex-col items-center" },
                        react_1["default"].createElement("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-indigo-500 bg-indigo-100 text-sm font-bold text-indigo-600" }, m.year.slice(2)),
                        i < milestones.length - 1 && react_1["default"].createElement("div", { className: "w-px flex-1 bg-gray-200 my-2" })),
                    react_1["default"].createElement("div", { className: utils_1.cn("pb-8", i === milestones.length - 1 && "pb-0") },
                        react_1["default"].createElement("p", { className: "text-xs text-indigo-600 font-semibold mb-1" }, m.year),
                        react_1["default"].createElement("p", { className: "text-gray-600 text-sm leading-relaxed" }, m.event)))); })))),
        react_1["default"].createElement("section", { className: "py-24 border-t border-gray-100 bg-gray-50/50" },
            react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" },
                react_1["default"].createElement("div", { className: "text-center mb-14" },
                    react_1["default"].createElement("p", { className: "text-xs uppercase tracking-widest text-indigo-600 font-semibold mb-3" }, "The people"),
                    react_1["default"].createElement("h2", { className: "text-4xl md:text-5xl font-black" }, "Leadership team")),
                react_1["default"].createElement("div", { className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-6" }, team.map(function (member) { return (react_1["default"].createElement("div", { key: member.name, className: "rounded-2xl border border-gray-200 bg-white p-7 hover:shadow-lg hover:border-indigo-300 transition-all" },
                    react_1["default"].createElement("div", { className: "h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-5" },
                        react_1["default"].createElement("span", { className: "text-xl font-black text-white" }, member.name.charAt(0))),
                    react_1["default"].createElement("h3", { className: "font-bold text-base mb-0.5" }, member.name),
                    react_1["default"].createElement("p", { className: "text-xs text-indigo-600 mb-3" }, member.role),
                    react_1["default"].createElement("p", { className: "text-xs text-gray-500 leading-relaxed" }, member.bio))); })))),
        react_1["default"].createElement("section", { className: "py-24 bg-gradient-to-b from-white to-indigo-50/50" },
            react_1["default"].createElement("div", { className: "max-w-4xl mx-auto px-4" },
                react_1["default"].createElement("div", { className: "text-center mb-12" },
                    react_1["default"].createElement("h2", { className: "text-4xl font-black mb-5" }, "Ready to work with us?"),
                    react_1["default"].createElement("p", { className: "text-gray-500 text-lg" }, "Let's talk about how Kiini can transform your operations.")),
                react_1["default"].createElement("div", { className: "grid sm:grid-cols-3 gap-4" },
                    react_1["default"].createElement(button_1.Button, { size: "lg", className: "bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 shadow-lg shadow-indigo-200 h-auto flex-col", onClick: function () { return navigate("/book-a-demo"); } },
                        react_1["default"].createElement("span", { className: "text-base" }, "Book a Demo"),
                        react_1["default"].createElement("span", { className: "text-xs opacity-90 mt-1" }, "See Kiini in action")),
                    react_1["default"].createElement(button_1.Button, { size: "lg", className: "bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 shadow-lg shadow-indigo-200 h-auto flex-col", onClick: function () { return navigate("/contact"); } },
                        react_1["default"].createElement("span", { className: "text-base" }, "Get in Touch"),
                        react_1["default"].createElement("span", { className: "text-xs opacity-90 mt-1" }, "Contact our team")),
                    react_1["default"].createElement(button_1.Button, { size: "lg", variant: "outline", className: "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-indigo-300 px-8 py-6 h-auto flex-col", onClick: function () { return navigate("/pricing"); } },
                        react_1["default"].createElement("span", { className: "text-base" }, "View Pricing"),
                        react_1["default"].createElement("span", { className: "text-xs text-gray-500 mt-1" }, "Explore our plans"))))),
        react_1["default"].createElement(WebsiteFooter_1.WebsiteFooter, null)));
}
exports["default"] = About;
