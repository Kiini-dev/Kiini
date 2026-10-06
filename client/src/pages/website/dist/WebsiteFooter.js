"use strict";
exports.__esModule = true;
exports.WebsiteFooter = void 0;
var react_1 = require("react");
var wouter_1 = require("wouter");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var WebsiteNav_1 = require("./WebsiteNav");
var DEFAULT_FOOTER_COLUMNS = [
    { title: "Product", links: [
            { label: "Features", href: "/features" },
            { label: "Pricing", href: "/pricing" },
            { label: "Book a Demo", href: "/book-a-demo" },
            { label: "Documentation", href: "/documentation" },
        ] },
    { title: "Company", links: [
            { label: "About", href: "/about" },
            { label: "Contact", href: "/contact" },
            { label: "Become a Partner", href: "/become-a-partner" },
            { label: "Blog", href: "/blog" },
        ] },
    { title: "Resources", links: [
            { label: "User Guide", href: "/user-guide" },
            { label: "Template Guide", href: "/documentation/templates" },
            { label: "Troubleshooting", href: "/troubleshooting" },
        ] },
    { title: "Legal", links: [
            { label: "Privacy Policy", href: "/privacy-policy" },
            { label: "Terms & Conditions", href: "/terms-and-conditions" },
        ] },
];
function WebsiteFooter() {
    var _a;
    var _b = wouter_1.useLocation(), navigate = _b[1];
    var settings = trpc_1.trpc.websiteAdmin.publicSettings.useQuery(undefined, {
        staleTime: 5 * 60 * 1000,
        retry: false
    }).data;
    var footerConfig = trpc_1.trpc.websiteAdmin.publicFooterConfig.useQuery(undefined, {
        staleTime: 5 * 60 * 1000,
        retry: false
    }).data;
    var siteTitle = (settings === null || settings === void 0 ? void 0 : settings.siteTitle) || "Kiini";
    var tagline = (settings === null || settings === void 0 ? void 0 : settings.tagline) || "One Hub. Total Control.\nThe unified business management platform for modern enterprises.";
    var contactEmail = (settings === null || settings === void 0 ? void 0 : settings.contactEmail) || "hello@kiini.africa";
    var socialLinks = [
        { icon: react_1["default"].createElement(lucide_react_1.Twitter, { className: "h-4 w-4" }), href: (settings === null || settings === void 0 ? void 0 : settings.socialTwitter) || "#" },
        { icon: react_1["default"].createElement(lucide_react_1.Linkedin, { className: "h-4 w-4" }), href: (settings === null || settings === void 0 ? void 0 : settings.socialLinkedIn) || "#" },
        { icon: react_1["default"].createElement(lucide_react_1.Github, { className: "h-4 w-4" }), href: "#" },
        { icon: react_1["default"].createElement(lucide_react_1.Mail, { className: "h-4 w-4" }), href: contactEmail ? "mailto:" + contactEmail : "mailto:hello@kiini.africa" },
    ];
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement("footer", { className: "bg-gray-50 border-t border-gray-200" },
            react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" },
                react_1["default"].createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-10 mb-12" },
                    react_1["default"].createElement("div", { className: "col-span-2 md:col-span-1" },
                        react_1["default"].createElement("a", { href: "/", className: "flex items-center gap-2.5 no-underline mb-4", onClick: function (e) { e.preventDefault(); navigate("/"); } },
                            react_1["default"].createElement("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600" },
                                react_1["default"].createElement(lucide_react_1.Zap, { className: "h-4 w-4 text-white" })),
                            react_1["default"].createElement("span", { className: "text-xl font-bold text-gray-900" },
                                "Kiini: One Hub. Total Control.")),
                        react_1["default"].createElement("p", { className: "text-sm text-gray-500 leading-relaxed mb-5" }, tagline.split('\n').map(function (line, i) { return (react_1["default"].createElement(react_1["default"].Fragment, { key: i },
                            line,
                            i < tagline.split('\n').length - 1 && react_1["default"].createElement("br", null))); })),
                        react_1["default"].createElement("div", { className: "flex gap-3" }, socialLinks.filter(function (s) { return s.href && s.href !== "#"; }).length > 0 ? (socialLinks.filter(function (s) { return s.href && s.href !== "#"; }).map(function (s, i) { return (react_1["default"].createElement("a", { key: i, href: s.href, target: s.href.startsWith("mailto:") ? undefined : "_blank", rel: "noopener noreferrer", className: "flex h-8 w-8 items-center justify-center rounded-lg bg-gray-200 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors no-underline" }, s.icon)); })) : (socialLinks.map(function (s, i) { return (react_1["default"].createElement("a", { key: i, href: s.href, className: "flex h-8 w-8 items-center justify-center rounded-lg bg-gray-200 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors no-underline" }, s.icon)); })))),
                    ((_a = footerConfig === null || footerConfig === void 0 ? void 0 : footerConfig.columns) !== null && _a !== void 0 ? _a : DEFAULT_FOOTER_COLUMNS).map(function (col) { return (react_1["default"].createElement("div", { key: col.title },
                        react_1["default"].createElement("p", { className: "text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4" }, col.title),
                        react_1["default"].createElement("ul", { className: "space-y-3" }, col.links.map(function (link) { return (react_1["default"].createElement("li", { key: link.label },
                            react_1["default"].createElement("a", { href: link.href, onClick: function (e) { e.preventDefault(); navigate(link.href); }, className: "text-sm text-gray-500 hover:text-indigo-600 transition-colors no-underline" }, link.label))); })))); })),
                ((footerConfig === null || footerConfig === void 0 ? void 0 : footerConfig.showCloudPartners) !== false || (footerConfig === null || footerConfig === void 0 ? void 0 : footerConfig.showComplianceBadges) !== false) && (react_1["default"].createElement("div", { className: "border-t border-gray-200 pt-8 mb-8" },
                    react_1["default"].createElement("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6" },
                        (footerConfig === null || footerConfig === void 0 ? void 0 : footerConfig.showCloudPartners) !== false && (react_1["default"].createElement("div", null,
                            react_1["default"].createElement("p", { className: "text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-3 flex items-center gap-1.5" },
                                react_1["default"].createElement(lucide_react_1.Cloud, { className: "h-3 w-3" }),
                                " Cloud Infrastructure Partners"),
                            react_1["default"].createElement("div", { className: "flex flex-wrap gap-2" }, [
                                { label: "AWS", color: "text-orange-600" },
                                { label: "Microsoft Azure", color: "text-blue-600" },
                                { label: "Google Cloud", color: "text-sky-600" },
                                { label: "DigitalOcean", color: "text-blue-500" },
                                { label: "Cloudflare", color: "text-orange-500" },
                                { label: "Docker", color: "text-cyan-600" },
                            ].map(function (p) { return (react_1["default"].createElement("span", { key: p.label, className: "inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold " + p.color }, p.label)); })))),
                        (footerConfig === null || footerConfig === void 0 ? void 0 : footerConfig.showComplianceBadges) !== false && (react_1["default"].createElement("div", null,
                            react_1["default"].createElement("p", { className: "text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-3" }, "Security & Compliance"),
                            react_1["default"].createElement("div", { className: "flex flex-wrap gap-2" }, ["GDPR Ready", "SOC 2 Type II", "End-to-End Encrypted", "MFA Enabled"].map(function (badge) { return (react_1["default"].createElement("span", { key: badge, className: "inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700" },
                                "\u2713 ",
                                badge)); }))))))),
                react_1["default"].createElement("div", { className: "border-t border-gray-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400" },
                    react_1["default"].createElement("p", null, (footerConfig === null || footerConfig === void 0 ? void 0 : footerConfig.copyrightText) || "\u00A9 " + new Date().getFullYear() + " " + siteTitle + ". All rights reserved."),
                    react_1["default"].createElement("p", null, "Built for enterprise scale.")))),
        react_1["default"].createElement(WebsiteNav_1.ScrollToTop, null),
        react_1["default"].createElement(CookieConsent, null)));
}
exports.WebsiteFooter = WebsiteFooter;
/* ── Cookie Consent Banner ────────────────────────────────── */
function CookieConsent() {
    var _a = react_1.useState(false), visible = _a[0], setVisible = _a[1];
    react_1.useEffect(function () {
        var consent = localStorage.getItem("kiini_cookie_consent");
        if (!consent) {
            var timer_1 = setTimeout(function () { return setVisible(true); }, 1500);
            return function () { return clearTimeout(timer_1); };
        }
    }, []);
    var accept = function () {
        localStorage.setItem("kiini_cookie_consent", "accepted");
        setVisible(false);
    };
    var decline = function () {
        localStorage.setItem("kiini_cookie_consent", "declined");
        setVisible(false);
    };
    if (!visible)
        return null;
    return (react_1["default"].createElement("div", { className: "fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 pointer-events-none" },
        react_1["default"].createElement("div", { className: "max-w-lg mx-auto sm:mx-0 sm:ml-6 pointer-events-auto" },
            react_1["default"].createElement("div", { className: "rounded-xl border border-gray-200 bg-white shadow-2xl p-5" },
                react_1["default"].createElement("div", { className: "flex items-start gap-3" },
                    react_1["default"].createElement("div", { className: "flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 flex-shrink-0 mt-0.5" },
                        react_1["default"].createElement(lucide_react_1.Cookie, { className: "h-4 w-4" })),
                    react_1["default"].createElement("div", { className: "flex-1" },
                        react_1["default"].createElement("p", { className: "text-sm font-semibold text-gray-900 mb-1" }, "We use cookies"),
                        react_1["default"].createElement("p", { className: "text-xs text-gray-500 leading-relaxed mb-3" },
                            "We use essential cookies to keep the platform running and optional analytics cookies to improve your experience.",
                            " ",
                            react_1["default"].createElement("a", { href: "/privacy-policy", className: "text-indigo-600 hover:text-indigo-700 underline" }, "Learn more")),
                        react_1["default"].createElement("div", { className: "flex gap-2" },
                            react_1["default"].createElement("button", { onClick: accept, className: "rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors" }, "Accept All"),
                            react_1["default"].createElement("button", { onClick: decline, className: "rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors" }, "Essential Only"))))))));
}
