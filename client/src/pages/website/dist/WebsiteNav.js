"use strict";
exports.__esModule = true;
exports.ScrollToTop = exports.WebsiteNav = void 0;
var react_1 = require("react");
var wouter_1 = require("wouter");
var button_1 = require("@/components/ui/button");
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
var CurrencyContext_1 = require("./CurrencyContext");
var useAuthWithPersistence_1 = require("@/_core/hooks/useAuthWithPersistence");
var permissions_1 = require("@/lib/permissions");
var trpc_1 = require("@/lib/trpc");
var DEFAULT_NAV_LINKS = [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Book a Demo", href: "/book-a-demo" },
    { label: "Partners", href: "/become-a-partner" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
];
var RESOURCE_ICON_MAP = {
    "/documentation": lucide_react_1.BookOpen,
    "/user-guide": lucide_react_1.HelpCircle,
    "/troubleshooting": lucide_react_1.AlertCircle
};
var RESOURCE_DESC_MAP = {
    "/documentation": "Comprehensive platform guides",
    "/user-guide": "Step-by-step how-tos",
    "/troubleshooting": "Solutions to common issues"
};
var DEFAULT_RESOURCE_LINKS = [
    { label: "Documentation", href: "/documentation", icon: lucide_react_1.BookOpen, desc: "Comprehensive platform guides" },
    { label: "User Guide", href: "/user-guide", icon: lucide_react_1.HelpCircle, desc: "Step-by-step how-tos" },
    { label: "Troubleshooting", href: "/troubleshooting", icon: lucide_react_1.AlertCircle, desc: "Solutions to common issues" },
];
function CurrencySwitcher() {
    var _a = CurrencyContext_1.useCurrency(), currency = _a.currency, setCurrency = _a.setCurrency;
    var _b = react_1.useState(false), open = _b[0], setOpen = _b[1];
    var ref = react_1.useRef(null);
    react_1.useEffect(function () {
        var handler = function (e) {
            if (ref.current && !ref.current.contains(e.target))
                setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return function () { return document.removeEventListener("mousedown", handler); };
    }, []);
    return (react_1["default"].createElement("div", { ref: ref, className: "relative" },
        react_1["default"].createElement("button", { onClick: function () { return setOpen(!open); }, className: "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors" },
            react_1["default"].createElement("span", { className: "font-semibold text-xs text-indigo-600" }, currency.symbol),
            react_1["default"].createElement("span", { className: "text-xs" }, currency.code),
            react_1["default"].createElement(lucide_react_1.ChevronDown, { className: utils_1.cn("h-3 w-3 text-gray-400 transition-transform", open && "rotate-180") })),
        open && (react_1["default"].createElement("div", { className: "absolute right-0 top-full mt-1 w-52 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden z-50" },
            react_1["default"].createElement("div", { className: "px-3 py-2 border-b border-gray-100" },
                react_1["default"].createElement("p", { className: "text-[10px] uppercase tracking-widest text-gray-400 font-semibold" }, "Currency")),
            CurrencyContext_1.CURRENCIES.map(function (c) { return (react_1["default"].createElement("button", { key: c.code, onClick: function () { setCurrency(c.code); setOpen(false); }, className: "w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors text-left" },
                react_1["default"].createElement("div", { className: "flex items-center gap-2.5" },
                    react_1["default"].createElement("span", { className: "text-sm font-bold text-indigo-600 w-7" }, c.symbol),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "text-xs font-medium text-gray-900" }, c.code),
                        react_1["default"].createElement("p", { className: "text-[10px] text-gray-400" }, c.name))),
                currency.code === c.code && react_1["default"].createElement(lucide_react_1.Check, { className: "h-3.5 w-3.5 text-indigo-600" }))); })))));
}
function WebsiteNav() {
    var _a = wouter_1.useLocation(), location = _a[0], navigate = _a[1];
    var _b = react_1.useState(false), menuOpen = _b[0], setMenuOpen = _b[1];
    var _c = react_1.useState(false), resourcesOpen = _c[0], setResourcesOpen = _c[1];
    var _d = react_1.useState(false), scrolled = _d[0], setScrolled = _d[1];
    var _e = react_1.useState(false), bannerDismissed = _e[0], setBannerDismissed = _e[1];
    var _f = useAuthWithPersistence_1.useAuthWithPersistence(), user = _f.user, isAuthenticated = _f.isAuthenticated;
    var resourcesRef = react_1.useRef(null);
    var navConfig = trpc_1.trpc.websiteAdmin.publicNavigation.useQuery(undefined, {
        staleTime: 5 * 60 * 1000,
        retry: false
    }).data;
    var siteSettings = trpc_1.trpc.websiteAdmin.publicSettings.useQuery(undefined, {
        staleTime: 5 * 60 * 1000,
        retry: false
    }).data;
    var showBanner = (siteSettings === null || siteSettings === void 0 ? void 0 : siteSettings.announcementEnabled) && (siteSettings === null || siteSettings === void 0 ? void 0 : siteSettings.announcementBanner) && !bannerDismissed;
    var NAV_LINKS = react_1.useMemo(function () {
        if (!(navConfig === null || navConfig === void 0 ? void 0 : navConfig.mainLinks))
            return DEFAULT_NAV_LINKS;
        return navConfig.mainLinks
            .filter(function (l) { return l.visible !== false; })
            .map(function (l) { return ({ label: l.label, href: l.href }); });
    }, [navConfig]);
    var RESOURCE_LINKS = react_1.useMemo(function () {
        if (!(navConfig === null || navConfig === void 0 ? void 0 : navConfig.resourceLinks))
            return DEFAULT_RESOURCE_LINKS;
        return navConfig.resourceLinks
            .filter(function (l) { return l.visible !== false; })
            .map(function (l) { return ({
            label: l.label,
            href: l.href,
            icon: RESOURCE_ICON_MAP[l.href] || lucide_react_1.BookOpen,
            desc: RESOURCE_DESC_MAP[l.href] || l.label
        }); });
    }, [navConfig]);
    var ctaText = (navConfig === null || navConfig === void 0 ? void 0 : navConfig.ctaText) || "Get Started";
    var ctaLink = (navConfig === null || navConfig === void 0 ? void 0 : navConfig.ctaLink) || "/signup";
    react_1.useEffect(function () {
        var onScroll = function () { return setScrolled(window.scrollY > 20); };
        window.addEventListener("scroll", onScroll, { passive: true });
        return function () { return window.removeEventListener("scroll", onScroll); };
    }, []);
    react_1.useEffect(function () {
        var handler = function (e) {
            if (resourcesRef.current && !resourcesRef.current.contains(e.target))
                setResourcesOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return function () { return document.removeEventListener("mousedown", handler); };
    }, []);
    var dashboardUrl = user ? permissions_1.getDashboardUrl(user.role || "staff") : "/login";
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        showBanner && (react_1["default"].createElement("div", { className: "fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white" },
            react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center gap-3" },
                react_1["default"].createElement(lucide_react_1.Megaphone, { className: "h-4 w-4 flex-shrink-0" }),
                react_1["default"].createElement("p", { className: "text-sm font-medium text-center" }, siteSettings.announcementBanner),
                react_1["default"].createElement("button", { onClick: function () { return setBannerDismissed(true); }, className: "flex-shrink-0 ml-2 text-white/80 hover:text-white transition-colors", "aria-label": "Dismiss banner" },
                    react_1["default"].createElement(lucide_react_1.X, { className: "h-4 w-4" }))))),
        react_1["default"].createElement("header", { className: utils_1.cn("fixed left-0 right-0 z-50 transition-all duration-300", showBanner ? "top-10" : "top-0", scrolled
                ? "bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm"
                : "bg-transparent") },
            react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" },
                react_1["default"].createElement("div", { className: "flex h-16 items-center justify-between" },
                    react_1["default"].createElement("a", { href: "/", className: "flex items-center gap-2.5 no-underline", onClick: function (e) { e.preventDefault(); navigate("/"); } }, (siteSettings === null || siteSettings === void 0 ? void 0 : siteSettings.logoUrl) ? (react_1["default"].createElement("img", { src: siteSettings.logoUrl, alt: siteSettings.companyName || siteSettings.siteTitle || "Logo", className: "h-8 w-auto object-contain max-w-[160px]" })) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                        react_1["default"].createElement("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600" },
                            react_1["default"].createElement(lucide_react_1.Zap, { className: "h-4 w-4 text-white" })),
                        react_1["default"].createElement("span", { className: "text-xl font-bold text-gray-900 tracking-tight" }, (siteSettings === null || siteSettings === void 0 ? void 0 : siteSettings.companyName) || (siteSettings === null || siteSettings === void 0 ? void 0 : siteSettings.siteTitle)
                            ? react_1["default"].createElement(react_1["default"].Fragment, null, siteSettings.companyName || siteSettings.siteTitle)
                            : react_1["default"].createElement(react_1["default"].Fragment, null,
                                "Kiini",
                                react_1["default"].createElement("span", { className: "text-indigo-600" }, "360")))))),
                    react_1["default"].createElement("nav", { className: "hidden md:flex items-center gap-1" },
                        NAV_LINKS.map(function (link) { return (react_1["default"].createElement("a", { key: link.href, href: link.href, onClick: function (e) { e.preventDefault(); navigate(link.href); }, className: utils_1.cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors no-underline", location === link.href
                                ? "text-gray-900 bg-gray-100"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50") }, link.label)); }),
                        react_1["default"].createElement("div", { ref: resourcesRef, className: "relative" },
                            react_1["default"].createElement("button", { onClick: function () { return setResourcesOpen(!resourcesOpen); }, className: utils_1.cn("flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors", RESOURCE_LINKS.some(function (r) { return location === r.href; })
                                    ? "text-gray-900 bg-gray-100"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50") },
                                "Resources",
                                react_1["default"].createElement(lucide_react_1.ChevronDown, { className: utils_1.cn("h-3.5 w-3.5 transition-transform", resourcesOpen && "rotate-180") })),
                            resourcesOpen && (react_1["default"].createElement("div", { className: "absolute left-0 top-full mt-2 w-72 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden z-50" }, RESOURCE_LINKS.map(function (link) {
                                var Icon = link.icon;
                                return (react_1["default"].createElement("a", { key: link.href, href: link.href, onClick: function (e) { e.preventDefault(); navigate(link.href); setResourcesOpen(false); }, className: utils_1.cn("flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors no-underline", location === link.href && "bg-indigo-50/50") },
                                    react_1["default"].createElement("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 flex-shrink-0 mt-0.5" },
                                        react_1["default"].createElement(Icon, { className: "h-4 w-4" })),
                                    react_1["default"].createElement("div", null,
                                        react_1["default"].createElement("p", { className: "text-sm font-medium text-gray-900" }, link.label),
                                        react_1["default"].createElement("p", { className: "text-xs text-gray-400" }, link.desc))));
                            }))))),
                    react_1["default"].createElement("div", { className: "hidden md:flex items-center gap-2" },
                        react_1["default"].createElement(CurrencySwitcher, null),
                        react_1["default"].createElement("div", { className: "w-px h-5 bg-gray-200 mx-1" }),
                        isAuthenticated && user ? (react_1["default"].createElement(button_1.Button, { size: "sm", className: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200", onClick: function () { return navigate(dashboardUrl); } },
                            react_1["default"].createElement(lucide_react_1.LayoutDashboard, { className: "mr-1.5 h-3.5 w-3.5" }),
                            "Dashboard")) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                            react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-gray-600 hover:text-gray-900 hover:bg-gray-100", onClick: function () { return navigate("/login"); } }, "Sign In"),
                            react_1["default"].createElement(button_1.Button, { size: "sm", className: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200", onClick: function () { return navigate(ctaLink); } }, ctaText)))),
                    react_1["default"].createElement("div", { className: "md:hidden flex items-center gap-3" },
                        react_1["default"].createElement(CurrencySwitcher, null),
                        react_1["default"].createElement("button", { className: "text-gray-600 hover:text-gray-900", onClick: function () { return setMenuOpen(!menuOpen); } }, menuOpen ? react_1["default"].createElement(lucide_react_1.X, { className: "h-6 w-6" }) : react_1["default"].createElement(lucide_react_1.Menu, { className: "h-6 w-6" }))))),
            menuOpen && (react_1["default"].createElement("div", { className: "md:hidden bg-white/97 backdrop-blur-xl border-t border-gray-200 px-4 py-4 space-y-1" },
                NAV_LINKS.map(function (link) { return (react_1["default"].createElement("a", { key: link.href, href: link.href, onClick: function (e) { e.preventDefault(); navigate(link.href); setMenuOpen(false); }, className: "block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 no-underline" }, link.label)); }),
                react_1["default"].createElement("div", { className: "pt-2 pb-1" },
                    react_1["default"].createElement("p", { className: "px-4 text-[10px] uppercase tracking-widest text-gray-400 font-semibold" }, "Resources")),
                RESOURCE_LINKS.map(function (link) { return (react_1["default"].createElement("a", { key: link.href, href: link.href, onClick: function (e) { e.preventDefault(); navigate(link.href); setMenuOpen(false); }, className: "block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 no-underline" }, link.label)); }),
                react_1["default"].createElement("div", { className: "pt-3 border-t border-gray-200 flex flex-col gap-2" }, isAuthenticated && user ? (react_1["default"].createElement(button_1.Button, { className: "w-full bg-indigo-600 hover:bg-indigo-700 text-white", onClick: function () { navigate(dashboardUrl); setMenuOpen(false); } },
                    react_1["default"].createElement(lucide_react_1.LayoutDashboard, { className: "mr-1.5 h-4 w-4" }),
                    "Go to Dashboard")) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                    react_1["default"].createElement(button_1.Button, { variant: "outline", className: "w-full border-gray-300 text-gray-700 hover:bg-gray-50", onClick: function () { navigate("/login"); setMenuOpen(false); } }, "Sign In"),
                    react_1["default"].createElement(button_1.Button, { className: "w-full bg-indigo-600 hover:bg-indigo-700 text-white", onClick: function () { navigate(ctaLink); setMenuOpen(false); } }, ctaText)))))))));
}
exports.WebsiteNav = WebsiteNav;
/* ── Scroll-to-top button ────────────────────────────────── */
function ScrollToTop() {
    var _a = react_1.useState(false), visible = _a[0], setVisible = _a[1];
    react_1.useEffect(function () {
        var onScroll = function () { return setVisible(window.scrollY > 400); };
        window.addEventListener("scroll", onScroll, { passive: true });
        return function () { return window.removeEventListener("scroll", onScroll); };
    }, []);
    if (!visible)
        return null;
    return (react_1["default"].createElement("button", { onClick: function () { return window.scrollTo({ top: 0, behavior: "smooth" }); }, className: "fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all duration-300 hover:scale-110", "aria-label": "Back to top" },
        react_1["default"].createElement(lucide_react_1.ArrowUp, { className: "h-4 w-4" })));
}
exports.ScrollToTop = ScrollToTop;
