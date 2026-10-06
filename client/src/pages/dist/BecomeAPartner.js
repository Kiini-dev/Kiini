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
var WebsiteNav_1 = require("./website/WebsiteNav");
var WebsiteFooter_1 = require("./website/WebsiteFooter");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var badge_1 = require("@/components/ui/badge");
var PhoneInput_1 = require("@/components/PhoneInput");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
// ─── Partnership tiers ───────────────────────────────────────
var PARTNER_TIERS = [
    {
        icon: lucide_react_1.Send,
        name: "Referral Partner",
        badge: "Start here",
        badgeColor: "bg-blue-50 text-blue-700",
        borderColor: "border-blue-200 hover:border-blue-400",
        accentColor: "text-blue-600",
        desc: "Recommend Kiini to businesses you know. Earn a recurring commission for every client you bring.",
        commission: "Up to 15%",
        commissionLabel: "recurring commission",
        features: [
            "No upfront cost or contract",
            "Personal referral link & tracking dashboard",
            "Co-branded marketing assets",
            "Dedicated partner manager",
            "Payouts within 30 days",
        ],
        cta: "Become a Referral Partner"
    },
    {
        icon: lucide_react_1.Building2,
        name: "Reseller Partner",
        badge: "Most Popular",
        badgeColor: "bg-indigo-600 text-white",
        borderColor: "border-indigo-400 hover:border-indigo-600",
        accentColor: "text-indigo-600",
        desc: "Bundle Kiini under your brand. Sell, invoice, and manage client subscriptions as your own product.",
        commission: "Up to 40%",
        commissionLabel: "margin on each sale",
        features: [
            "Full white-label capability",
            "Reseller pricing (significant margin)",
            "Client onboarding & training toolkit",
            "Priority technical support",
            "Joint go-to-market campaigns",
            "Volume-based tier upgrades",
        ],
        cta: "Apply as Reseller",
        highlight: true
    },
    {
        icon: lucide_react_1.Code2,
        name: "Technology Partner",
        badge: "API Access",
        badgeColor: "bg-violet-50 text-violet-700",
        borderColor: "border-violet-200 hover:border-violet-400",
        accentColor: "text-violet-600",
        desc: "Integrate your product with Kiini's API. Co-sell, cross-promote, and reach thousands of businesses.",
        commission: "Custom",
        commissionLabel: "revenue share",
        features: [
            "Full API access & webhooks",
            "Marketplace listing on Kiini",
            "Co-marketing & joint press releases",
            "Technical integration support",
            "Joint product roadmap influence",
            "Dedicated sandbox environment",
        ],
        cta: "Explore Tech Partnership"
    },
];
// ─── Benefits ────────────────────────────────────────────────
var BENEFITS = [
    { icon: lucide_react_1.DollarSign, title: "Attractive Commissions", desc: "Earn recurring revenue. Our partners average 3x ROI within the first year of joining." },
    { icon: lucide_react_1.TrendingUp, title: "Fast-growing Market", desc: "SME software adoption in Africa is growing 30% YoY. Be positioned at the forefront." },
    { icon: lucide_react_1.Shield, title: "Proven Product", desc: "Kiini powers hundreds of businesses. Sell a product your clients will actually love." },
    { icon: lucide_react_1.HeadphonesIcon, title: "Full Support", desc: "Dedicated partner success manager, onboarding kit, and priority technical support." },
    { icon: lucide_react_1.Globe, title: "Global Reach", desc: "Multi-currency, multi-language. Serve clients across Africa and beyond." },
    { icon: lucide_react_1.Sparkles, title: "Continuous Innovation", desc: "New modules and features ship monthly. Your clients always have something new to look forward to." },
];
// ─── Stats ───────────────────────────────────────────────────
var STATS = [
    { value: "200+", label: "Active Businesses" },
    { value: "18+", label: "Modules" },
    { value: "30%", label: "YoY Growth" },
    { value: "97%", label: "Client Retention" },
];
var INITIAL_FORM = {
    name: "", email: "", company: "", phone: "", website: "",
    partnerType: "", message: ""
};
function BecomeAPartner() {
    var _a = react_1.useState(INITIAL_FORM), form = _a[0], setForm = _a[1];
    var _b = react_1.useState(false), submitted = _b[0], setSubmitted = _b[1];
    var _c = react_1.useState({}), errors = _c[0], setErrors = _c[1];
    var contactMutation = trpc_1.trpc.websiteAdmin.submitContact.useMutation({
        onSuccess: function () {
            setSubmitted(true);
            setForm(INITIAL_FORM);
        },
        onError: function (err) {
            sonner_1.toast.error(err.message || "Failed to submit application. Please try again.");
        }
    });
    function validate() {
        var e = {};
        if (!form.name.trim())
            e.name = "Name is required";
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            e.email = "Valid email required";
        if (!form.company.trim())
            e.company = "Company name is required";
        if (!form.partnerType)
            e.partnerType = "Select a partnership type";
        setErrors(e);
        return Object.keys(e).length === 0;
    }
    function handleSubmit(e) {
        e.preventDefault();
        if (!validate())
            return;
        contactMutation.mutate({
            name: form.name,
            email: form.email,
            company: form.company,
            phone: form.phone || undefined,
            website: form.website || undefined,
            subject: "Partner Application \u2013 " + form.partnerType,
            message: "[Partner Application - " + form.partnerType + "]\nCompany: " + form.company + "\nPhone: " + form.phone + "\nWebsite: " + form.website + "\n\n" + form.message
        });
    }
    function setField(key, value) {
        setForm(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[key] = value, _a)));
        });
        if (errors[key])
            setErrors(function (prev) {
                var _a;
                return (__assign(__assign({}, prev), (_a = {}, _a[key] = undefined, _a)));
            });
    }
    return (react_1["default"].createElement("div", { className: "min-h-screen bg-white dark:bg-gray-950" },
        react_1["default"].createElement(WebsiteNav_1.WebsiteNav, null),
        react_1["default"].createElement("section", { className: "relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900 text-white pt-28 pb-20" },
            react_1["default"].createElement("div", { className: "pointer-events-none absolute inset-0 overflow-hidden" },
                react_1["default"].createElement("div", { className: "absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-violet-600/20 blur-3xl" }),
                react_1["default"].createElement("div", { className: "absolute -bottom-20 -left-40 h-[400px] w-[400px] rounded-full bg-indigo-500/20 blur-3xl" })),
            react_1["default"].createElement("div", { className: "relative mx-auto max-w-6xl px-6 text-center" },
                react_1["default"].createElement(badge_1.Badge, { className: "mb-6 bg-white/10 text-white hover:bg-white/15 border border-white/20" },
                    react_1["default"].createElement(lucide_react_1.Handshake, { className: "mr-1.5 h-3.5 w-3.5" }),
                    "Partner Program"),
                react_1["default"].createElement("h1", { className: "text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6" },
                    "Grow your business",
                    react_1["default"].createElement("br", null),
                    react_1["default"].createElement("span", { className: "text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-indigo-300" }, "by partnering with us")),
                react_1["default"].createElement("p", { className: "mx-auto max-w-2xl text-lg sm:text-xl text-indigo-200 leading-relaxed mb-10" }, "Join the Kiini Partner Program and earn while helping businesses across Africa unlock their full potential with our all-in-one management platform."),
                react_1["default"].createElement("div", { className: "flex flex-wrap items-center justify-center gap-4" },
                    react_1["default"].createElement("a", { href: "#partner-tiers" },
                        react_1["default"].createElement(button_1.Button, { size: "lg", className: "bg-white text-indigo-900 hover:bg-indigo-50 font-semibold shadow-lg" },
                            "Choose your partnership ",
                            react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "ml-2 h-4 w-4" }))),
                    react_1["default"].createElement("a", { href: "#apply" },
                        react_1["default"].createElement(button_1.Button, { size: "lg", variant: "outline", className: "border-white text-white bg-transparent hover:bg-white/15 hover:text-white" }, "Apply now")))),
            react_1["default"].createElement("div", { className: "relative mx-auto max-w-4xl px-6 mt-16" },
                react_1["default"].createElement("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-6 bg-white/8 backdrop-blur-sm border border-white/15 rounded-2xl px-8 py-6" }, STATS.map(function (s) { return (react_1["default"].createElement("div", { key: s.label, className: "text-center" },
                    react_1["default"].createElement("div", { className: "text-3xl font-bold text-white" }, s.value),
                    react_1["default"].createElement("div", { className: "text-sm text-indigo-300 mt-1" }, s.label))); })))),
        react_1["default"].createElement("section", { id: "partner-tiers", className: "py-20 bg-gray-50 dark:bg-gray-900" },
            react_1["default"].createElement("div", { className: "mx-auto max-w-6xl px-6" },
                react_1["default"].createElement("div", { className: "text-center mb-14" },
                    react_1["default"].createElement("h2", { className: "text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4" }, "Choose your partnership model"),
                    react_1["default"].createElement("p", { className: "text-gray-500 dark:text-gray-400 max-w-xl mx-auto" }, "Whether you're an individual consultant or a full-service agency, there's a path for you.")),
                react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8" }, PARTNER_TIERS.map(function (tier) {
                    var Icon = tier.icon;
                    return (react_1["default"].createElement("div", { key: tier.name, className: utils_1.cn("relative flex flex-col bg-white dark:bg-gray-800 rounded-2xl border-2 p-8 transition-all duration-200 shadow-sm hover:shadow-lg", tier.borderColor, tier.highlight && "ring-2 ring-indigo-500/30 scale-[1.02]") },
                        tier.badge && (react_1["default"].createElement("span", { className: utils_1.cn("absolute -top-3 left-6 text-xs font-semibold px-3 py-1 rounded-full", tier.badgeColor) }, tier.badge)),
                        react_1["default"].createElement("div", { className: utils_1.cn("mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-700") },
                            react_1["default"].createElement(Icon, { className: utils_1.cn("h-6 w-6", tier.accentColor) })),
                        react_1["default"].createElement("h3", { className: "text-xl font-bold text-gray-900 dark:text-white mb-2" }, tier.name),
                        react_1["default"].createElement("p", { className: "text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6" }, tier.desc),
                        react_1["default"].createElement("div", { className: "bg-gray-50 dark:bg-gray-700/60 rounded-xl p-4 mb-6" },
                            react_1["default"].createElement("div", { className: utils_1.cn("text-3xl font-bold", tier.accentColor) }, tier.commission),
                            react_1["default"].createElement("div", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1" }, tier.commissionLabel)),
                        react_1["default"].createElement("ul", { className: "space-y-2 mb-8 flex-1" }, tier.features.map(function (f) { return (react_1["default"].createElement("li", { key: f, className: "flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300" },
                            react_1["default"].createElement(lucide_react_1.CheckCircle, { className: "h-4 w-4 text-green-500 shrink-0 mt-0.5" }),
                            f)); })),
                        react_1["default"].createElement("a", { href: "#apply", onClick: function () { return setField("partnerType", tier.name.split(" ")[0].toLowerCase()); } },
                            react_1["default"].createElement(button_1.Button, { className: utils_1.cn("w-full", tier.highlight ? "bg-indigo-600 hover:bg-indigo-700 text-white" : ""), variant: tier.highlight ? "default" : "outline" },
                                tier.cta,
                                " ",
                                react_1["default"].createElement(lucide_react_1.ChevronRight, { className: "ml-1 h-4 w-4" })))));
                })))),
        react_1["default"].createElement("section", { className: "py-20 bg-white dark:bg-gray-950" },
            react_1["default"].createElement("div", { className: "mx-auto max-w-6xl px-6" },
                react_1["default"].createElement("div", { className: "text-center mb-14" },
                    react_1["default"].createElement("h2", { className: "text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4" }, "Why partner with Kiini?"),
                    react_1["default"].createElement("p", { className: "text-gray-500 dark:text-gray-400 max-w-xl mx-auto" }, "We invest in your success. Our partners get everything they need to grow.")),
                react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" }, BENEFITS.map(function (b) {
                    var Icon = b.icon;
                    return (react_1["default"].createElement("div", { key: b.title, className: "group flex gap-4 p-6 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors duration-200" },
                        react_1["default"].createElement("div", { className: "shrink-0 flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/40 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/50 transition-colors" },
                            react_1["default"].createElement(Icon, { className: "h-5 w-5 text-indigo-600 dark:text-indigo-400" })),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("h3", { className: "font-semibold text-gray-900 dark:text-white text-sm mb-1" }, b.title),
                            react_1["default"].createElement("p", { className: "text-sm text-gray-500 dark:text-gray-400 leading-relaxed" }, b.desc))));
                })))),
        react_1["default"].createElement("section", { className: "py-20 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20" },
            react_1["default"].createElement("div", { className: "mx-auto max-w-4xl px-6" },
                react_1["default"].createElement("div", { className: "text-center mb-14" },
                    react_1["default"].createElement("h2", { className: "text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4" }, "How it works"),
                    react_1["default"].createElement("p", { className: "text-gray-500 dark:text-gray-400 max-w-xl mx-auto" }, "Getting started is simple. You can be earning commissions in as little as 48 hours.")),
                react_1["default"].createElement("div", { className: "relative" },
                    react_1["default"].createElement("div", { className: "hidden md:block absolute top-8 left-12 right-12 h-0.5 bg-gradient-to-r from-indigo-200 via-violet-200 to-indigo-200 dark:from-indigo-800 dark:via-violet-800 dark:to-indigo-800" }),
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-8" }, [
                        { step: "01", title: "Apply", desc: "Fill out the short application form below." },
                        { step: "02", title: "Onboard", desc: "Get your partner portal access and resources within 48h." },
                        { step: "03", title: "Sell & Refer", desc: "Use your tools to bring in clients." },
                        { step: "04", title: "Earn", desc: "Track commissions and receive monthly payouts." },
                    ].map(function (item) { return (react_1["default"].createElement("div", { key: item.step, className: "relative flex flex-col items-center text-center" },
                        react_1["default"].createElement("div", { className: "flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-gray-800 shadow-md border border-indigo-100 dark:border-indigo-900/40 mb-4 z-10" },
                            react_1["default"].createElement("span", { className: "text-xl font-bold text-indigo-600 dark:text-indigo-400" }, item.step)),
                        react_1["default"].createElement("h3", { className: "font-bold text-gray-900 dark:text-white mb-2" }, item.title),
                        react_1["default"].createElement("p", { className: "text-sm text-gray-500 dark:text-gray-400" }, item.desc))); }))))),
        react_1["default"].createElement("section", { id: "apply", className: "py-20 bg-white dark:bg-gray-950" },
            react_1["default"].createElement("div", { className: "mx-auto max-w-2xl px-6" },
                react_1["default"].createElement("div", { className: "text-center mb-10" },
                    react_1["default"].createElement(badge_1.Badge, { className: "mb-4 bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950 dark:text-indigo-300" }, "Apply Now"),
                    react_1["default"].createElement("h2", { className: "text-3xl font-bold text-gray-900 dark:text-white mb-3" }, "Start your partnership journey"),
                    react_1["default"].createElement("p", { className: "text-gray-500 dark:text-gray-400" }, "Complete the form below and our team will reach out within 1 business day.")),
                submitted ? (react_1["default"].createElement("div", { className: "flex flex-col items-center justify-center py-16 text-center" },
                    react_1["default"].createElement("div", { className: "flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-6" },
                        react_1["default"].createElement(lucide_react_1.CheckCircle, { className: "h-10 w-10 text-green-600 dark:text-green-400" })),
                    react_1["default"].createElement("h3", { className: "text-2xl font-bold text-gray-900 dark:text-white mb-3" }, "Application received!"),
                    react_1["default"].createElement("p", { className: "text-gray-500 dark:text-gray-400 max-w-sm mb-8" }, "Thank you for your interest. Our partner team will review your application and reach out within 1 business day."),
                    react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return setSubmitted(false); } }, "Submit another application"))) : (react_1["default"].createElement("form", { onSubmit: handleSubmit, className: "space-y-6 bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800" },
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                        react_1["default"].createElement("div", { className: "space-y-1.5" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "name" },
                                "Full Name ",
                                react_1["default"].createElement("span", { className: "text-red-500" }, "*")),
                            react_1["default"].createElement(input_1.Input, { id: "name", placeholder: "Jane Smith", value: form.name, onChange: function (e) { return setField("name", e.target.value); }, className: errors.name ? "border-red-400" : "" }),
                            errors.name && react_1["default"].createElement("p", { className: "text-xs text-red-500" }, errors.name)),
                        react_1["default"].createElement("div", { className: "space-y-1.5" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "email" },
                                "Business Email ",
                                react_1["default"].createElement("span", { className: "text-red-500" }, "*")),
                            react_1["default"].createElement(input_1.Input, { id: "email", type: "email", placeholder: "jane@company.com", value: form.email, onChange: function (e) { return setField("email", e.target.value); }, className: errors.email ? "border-red-400" : "" }),
                            errors.email && react_1["default"].createElement("p", { className: "text-xs text-red-500" }, errors.email))),
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                        react_1["default"].createElement("div", { className: "space-y-1.5" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "company" },
                                "Company / Organization ",
                                react_1["default"].createElement("span", { className: "text-red-500" }, "*")),
                            react_1["default"].createElement(input_1.Input, { id: "company", placeholder: "Acme Ltd.", value: form.company, onChange: function (e) { return setField("company", e.target.value); }, className: errors.company ? "border-red-400" : "" }),
                            errors.company && react_1["default"].createElement("p", { className: "text-xs text-red-500" }, errors.company)),
                        react_1["default"].createElement("div", { className: "space-y-1.5" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "phone" }, "Phone Number"),
                            react_1["default"].createElement(PhoneInput_1.PhoneInput, { id: "phone", value: form.phone, onChange: function (v) { return setField("phone", v); }, placeholder: "700 000 000" }))),
                    react_1["default"].createElement("div", { className: "space-y-1.5" },
                        react_1["default"].createElement(label_1.Label, { htmlFor: "website" }, "Website (optional)"),
                        react_1["default"].createElement(input_1.Input, { id: "website", type: "url", placeholder: "https://yourcompany.com", value: form.website, onChange: function (e) { return setField("website", e.target.value); } })),
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement(label_1.Label, null,
                            "Partnership Type ",
                            react_1["default"].createElement("span", { className: "text-red-500" }, "*")),
                        react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3" }, ["referral", "reseller", "technology"].map(function (type) { return (react_1["default"].createElement("button", { key: type, type: "button", onClick: function () { return setField("partnerType", type); }, className: utils_1.cn("flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium capitalize transition-all duration-150", form.partnerType === type
                                ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600") },
                            type === "referral" && react_1["default"].createElement(lucide_react_1.Send, { className: "h-5 w-5" }),
                            type === "reseller" && react_1["default"].createElement(lucide_react_1.Building2, { className: "h-5 w-5" }),
                            type === "technology" && react_1["default"].createElement(lucide_react_1.Code2, { className: "h-5 w-5" }),
                            type)); })),
                        errors.partnerType && react_1["default"].createElement("p", { className: "text-xs text-red-500" }, errors.partnerType)),
                    react_1["default"].createElement("div", { className: "space-y-1.5" },
                        react_1["default"].createElement(label_1.Label, { htmlFor: "message" }, "Tell us about your business"),
                        react_1["default"].createElement("textarea", { id: "message", rows: 4, placeholder: "Briefly describe your business, target market, and why you'd like to partner with us...", value: form.message, onChange: function (e) { return setField("message", e.target.value); }, className: "w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" })),
                    react_1["default"].createElement(button_1.Button, { type: "submit", size: "lg", className: "w-full bg-indigo-600 hover:bg-indigo-700", disabled: contactMutation.isPending }, contactMutation.isPending ? "Submitting…" : (react_1["default"].createElement(react_1["default"].Fragment, null,
                        "Submit Application ",
                        react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "ml-2 h-4 w-4" })))))))),
        react_1["default"].createElement("section", { className: "py-16 bg-gradient-to-r from-indigo-600 to-violet-600 text-white" },
            react_1["default"].createElement("div", { className: "mx-auto max-w-4xl px-6 text-center" },
                react_1["default"].createElement(lucide_react_1.Award, { className: "mx-auto h-12 w-12 mb-4 opacity-80" }),
                react_1["default"].createElement("h2", { className: "text-3xl font-bold mb-4" }, "Ready to start earning?"),
                react_1["default"].createElement("p", { className: "text-indigo-200 max-w-xl mx-auto mb-8" }, "Join a growing network of partners helping businesses unlock their potential with Kiini."),
                react_1["default"].createElement("a", { href: "#apply" },
                    react_1["default"].createElement(button_1.Button, { size: "lg", className: "bg-white text-indigo-700 hover:bg-indigo-50 font-semibold shadow-lg" },
                        "Apply now \u2014 it's free ",
                        react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "ml-2 h-4 w-4" }))))),
        react_1["default"].createElement(WebsiteFooter_1.WebsiteFooter, null)));
}
exports["default"] = BecomeAPartner;
