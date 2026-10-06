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
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var switch_1 = require("@/components/ui/switch");
var textarea_1 = require("@/components/ui/textarea");
var tabs_1 = require("@/components/ui/tabs");
var separator_1 = require("@/components/ui/separator");
var lucide_react_1 = require("lucide-react");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var checkbox_1 = require("@/components/ui/checkbox");
function WebsiteAdmin() {
    var _a = react_1.useState("overview"), activeTab = _a[0], setActiveTab = _a[1];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Website Administration", description: "Manage your public website pages, navigation, SEO, and settings", icon: React.createElement(lucide_react_1.Globe, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm/super-admin" },
            { label: "Administration", href: "/admin/management" },
            { label: "Website Admin" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "flex items-center justify-end" },
                React.createElement(button_1.Button, { variant: "outline", asChild: true },
                    React.createElement("a", { href: "/", target: "_blank", rel: "noopener noreferrer", className: "gap-2" },
                        React.createElement(lucide_react_1.ExternalLink, { className: "h-4 w-4" }),
                        "View Website"))),
            React.createElement(tabs_1.Tabs, { value: activeTab, onValueChange: setActiveTab },
                React.createElement(tabs_1.TabsList, { className: "flex w-full overflow-x-auto" },
                    React.createElement(tabs_1.TabsTrigger, { value: "overview", className: "gap-2" },
                        React.createElement(lucide_react_1.BarChart3, { className: "h-4 w-4" }),
                        React.createElement("span", { className: "hidden sm:inline" }, "Overview")),
                    React.createElement(tabs_1.TabsTrigger, { value: "pages", className: "gap-2" },
                        React.createElement(lucide_react_1.FileText, { className: "h-4 w-4" }),
                        React.createElement("span", { className: "hidden sm:inline" }, "Pages")),
                    React.createElement(tabs_1.TabsTrigger, { value: "navigation", className: "gap-2" },
                        React.createElement(lucide_react_1.Navigation, { className: "h-4 w-4" }),
                        React.createElement("span", { className: "hidden sm:inline" }, "Navigation")),
                    React.createElement(tabs_1.TabsTrigger, { value: "settings", className: "gap-2" },
                        React.createElement(lucide_react_1.Settings, { className: "h-4 w-4" }),
                        React.createElement("span", { className: "hidden sm:inline" }, "Settings")),
                    React.createElement(tabs_1.TabsTrigger, { value: "pricing", className: "gap-2" },
                        React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4" }),
                        React.createElement("span", { className: "hidden sm:inline" }, "Pricing")),
                    React.createElement(tabs_1.TabsTrigger, { value: "inquiries", className: "gap-2" },
                        React.createElement(lucide_react_1.MessageSquare, { className: "h-4 w-4" }),
                        React.createElement("span", { className: "hidden sm:inline" }, "Inquiries")),
                    React.createElement(tabs_1.TabsTrigger, { value: "footer", className: "gap-2" },
                        React.createElement(lucide_react_1.Layers, { className: "h-4 w-4" }),
                        React.createElement("span", { className: "hidden sm:inline" }, "Footer")),
                    React.createElement(tabs_1.TabsTrigger, { value: "about-content", className: "gap-2" },
                        React.createElement(lucide_react_1.Info, { className: "h-4 w-4" }),
                        React.createElement("span", { className: "hidden sm:inline" }, "About")),
                    React.createElement(tabs_1.TabsTrigger, { value: "features-content", className: "gap-2" },
                        React.createElement(lucide_react_1.BookOpen, { className: "h-4 w-4" }),
                        React.createElement("span", { className: "hidden sm:inline" }, "Features")),
                    React.createElement(tabs_1.TabsTrigger, { value: "testimonials", className: "gap-2" },
                        React.createElement(lucide_react_1.Star, { className: "h-4 w-4" }),
                        React.createElement("span", { className: "hidden sm:inline" }, "Testimonials")),
                    React.createElement(tabs_1.TabsTrigger, { value: "faq", className: "gap-2" },
                        React.createElement(lucide_react_1.MessageSquare, { className: "h-4 w-4" }),
                        React.createElement("span", { className: "hidden sm:inline" }, "FAQ")),
                    React.createElement(tabs_1.TabsTrigger, { value: "blog", className: "gap-2" },
                        React.createElement(lucide_react_1.FileText, { className: "h-4 w-4" }),
                        React.createElement("span", { className: "hidden sm:inline" }, "Blog")),
                    React.createElement(tabs_1.TabsTrigger, { value: "hero", className: "gap-2" },
                        React.createElement(lucide_react_1.Megaphone, { className: "h-4 w-4" }),
                        React.createElement("span", { className: "hidden sm:inline" }, "Hero"))),
                React.createElement(tabs_1.TabsContent, { value: "overview" },
                    React.createElement(OverviewTab, null)),
                React.createElement(tabs_1.TabsContent, { value: "pages" },
                    React.createElement(PagesTab, null)),
                React.createElement(tabs_1.TabsContent, { value: "navigation" },
                    React.createElement(NavigationTab, null)),
                React.createElement(tabs_1.TabsContent, { value: "settings" },
                    React.createElement(SettingsTab, null)),
                React.createElement(tabs_1.TabsContent, { value: "pricing" },
                    React.createElement(PricingTab, null)),
                React.createElement(tabs_1.TabsContent, { value: "inquiries" },
                    React.createElement(InquiriesTab, null)),
                React.createElement(tabs_1.TabsContent, { value: "footer" },
                    React.createElement(FooterTab, null)),
                React.createElement(tabs_1.TabsContent, { value: "about-content" },
                    React.createElement(AboutContentTab, null)),
                React.createElement(tabs_1.TabsContent, { value: "features-content" },
                    React.createElement(FeaturesContentTab, null)),
                React.createElement(tabs_1.TabsContent, { value: "testimonials" },
                    React.createElement(TestimonialsTab, null)),
                React.createElement(tabs_1.TabsContent, { value: "faq" },
                    React.createElement(FAQTab, null)),
                React.createElement(tabs_1.TabsContent, { value: "blog" },
                    React.createElement(BlogTab, null)),
                React.createElement(tabs_1.TabsContent, { value: "hero" },
                    React.createElement(HeroTab, null))))));
}
exports["default"] = WebsiteAdmin;
// ── Overview Tab ────────────────────────────────────────────────────────
function OverviewTab() {
    var _a, _b, _c;
    var pages = trpc_1.trpc.websiteAdmin.getPages.useQuery({}).data;
    var analytics = trpc_1.trpc.websiteAdmin.getAnalytics.useQuery({}).data;
    var contacts = trpc_1.trpc.websiteAdmin.getContactSubmissions.useQuery({}).data;
    var settings = trpc_1.trpc.websiteAdmin.getSettings.useQuery({}).data;
    var publishedCount = (_a = pages === null || pages === void 0 ? void 0 : pages.filter(function (p) { return p.isPublished; }).length) !== null && _a !== void 0 ? _a : 0;
    var totalPages = (_b = pages === null || pages === void 0 ? void 0 : pages.length) !== null && _b !== void 0 ? _b : 0;
    var newInquiries = (_c = contacts === null || contacts === void 0 ? void 0 : contacts.filter(function (c) { return c.status === "new"; }).length) !== null && _c !== void 0 ? _c : 0;
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "pt-6" },
                    React.createElement("div", { className: "flex items-center gap-3" },
                        React.createElement("div", { className: "rounded-lg bg-indigo-100 p-2.5" },
                            React.createElement(lucide_react_1.Globe, { className: "h-5 w-5 text-indigo-600" })),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-2xl font-bold" }, totalPages),
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Total Pages"))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "pt-6" },
                    React.createElement("div", { className: "flex items-center gap-3" },
                        React.createElement("div", { className: "rounded-lg bg-green-100 p-2.5" },
                            React.createElement(lucide_react_1.CheckCircle2, { className: "h-5 w-5 text-green-600" })),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-2xl font-bold" }, publishedCount),
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Published"))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "pt-6" },
                    React.createElement("div", { className: "flex items-center gap-3" },
                        React.createElement("div", { className: "rounded-lg bg-orange-100 p-2.5" },
                            React.createElement(lucide_react_1.MessageSquare, { className: "h-5 w-5 text-orange-600" })),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-2xl font-bold" }, newInquiries),
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "New Inquiries"))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "pt-6" },
                    React.createElement("div", { className: "flex items-center gap-3" },
                        React.createElement("div", { className: "rounded-lg bg-violet-100 p-2.5" },
                            React.createElement(lucide_react_1.Megaphone, { className: "h-5 w-5 text-violet-600" })),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-2xl font-bold" }, (settings === null || settings === void 0 ? void 0 : settings.announcementEnabled) ? "Active" : "Off"),
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Banner Status")))))),
        React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-lg" }, "Quick Actions")),
                React.createElement(card_1.CardContent, { className: "space-y-3" },
                    React.createElement("a", { href: "/", target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors" },
                        React.createElement(lucide_react_1.Globe, { className: "h-5 w-5 text-indigo-600" }),
                        React.createElement("div", { className: "flex-1" },
                            React.createElement("p", { className: "font-medium text-sm" }, "View Live Website"),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Open public-facing website in new tab")),
                        React.createElement(lucide_react_1.ExternalLink, { className: "h-4 w-4 text-muted-foreground" })),
                    React.createElement("a", { href: "/features", target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors" },
                        React.createElement(lucide_react_1.FileText, { className: "h-5 w-5 text-emerald-600" }),
                        React.createElement("div", { className: "flex-1" },
                            React.createElement("p", { className: "font-medium text-sm" }, "Preview Features Page"),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Check product features presentation")),
                        React.createElement(lucide_react_1.ExternalLink, { className: "h-4 w-4 text-muted-foreground" })),
                    React.createElement("a", { href: "/pricing", target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors" },
                        React.createElement(lucide_react_1.BarChart3, { className: "h-5 w-5 text-violet-600" }),
                        React.createElement("div", { className: "flex-1" },
                            React.createElement("p", { className: "font-medium text-sm" }, "Preview Pricing Page"),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Review pricing tiers and comparisons")),
                        React.createElement(lucide_react_1.ExternalLink, { className: "h-4 w-4 text-muted-foreground" })),
                    React.createElement("a", { href: "/contact", target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors" },
                        React.createElement(lucide_react_1.Mail, { className: "h-5 w-5 text-blue-600" }),
                        React.createElement("div", { className: "flex-1" },
                            React.createElement("p", { className: "font-medium text-sm" }, "Preview Contact Page"),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Test contact form and info display")),
                        React.createElement(lucide_react_1.ExternalLink, { className: "h-4 w-4 text-muted-foreground" })))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-lg" }, "Recent Inquiries"),
                    React.createElement(card_1.CardDescription, null, "Latest contact form submissions")),
                React.createElement(card_1.CardContent, null, !(contacts === null || contacts === void 0 ? void 0 : contacts.length) ? (React.createElement("div", { className: "text-center py-8 text-muted-foreground" },
                    React.createElement(lucide_react_1.MessageSquare, { className: "h-10 w-10 mx-auto mb-3 opacity-40" }),
                    React.createElement("p", { className: "text-sm" }, "No inquiries yet"))) : (React.createElement("div", { className: "space-y-3" }, contacts.slice(0, 5).map(function (c) { return (React.createElement("div", { key: c.id, className: "flex items-start gap-3 p-3 rounded-lg border" },
                    React.createElement("div", { className: "rounded-full p-1 mt-0.5 " + (c.status === "new" ? "bg-blue-100" : "bg-gray-100") },
                        React.createElement(lucide_react_1.Mail, { className: "h-3.5 w-3.5 " + (c.status === "new" ? "text-blue-600" : "text-gray-400") })),
                    React.createElement("div", { className: "flex-1 min-w-0" },
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("p", { className: "font-medium text-sm truncate" }, c.name),
                            c.status === "new" && React.createElement(badge_1.Badge, { variant: "default", className: "text-[10px] px-1.5 py-0" }, "New")),
                        React.createElement("p", { className: "text-xs text-muted-foreground truncate" }, c.subject || c.message),
                        React.createElement("p", { className: "text-[11px] text-muted-foreground mt-1" }, new Date(c.createdAt).toLocaleDateString())))); })))))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "text-lg" }, "All Website Pages"),
                React.createElement(card_1.CardDescription, null, "Status and SEO overview for all public pages")),
            React.createElement(card_1.CardContent, null,
                React.createElement(table_1.Table, null,
                    React.createElement(table_1.TableHeader, null,
                        React.createElement(table_1.TableRow, null,
                            React.createElement(table_1.TableHead, null, "Page"),
                            React.createElement(table_1.TableHead, null, "Path"),
                            React.createElement(table_1.TableHead, null, "Status"),
                            React.createElement(table_1.TableHead, null, "SEO Title"),
                            React.createElement(table_1.TableHead, { className: "text-right" }, "Action"))),
                    React.createElement(table_1.TableBody, null, pages === null || pages === void 0 ? void 0 : pages.map(function (page) { return (React.createElement(table_1.TableRow, { key: page.slug },
                        React.createElement(table_1.TableCell, { className: "font-medium" }, page.title),
                        React.createElement(table_1.TableCell, { className: "text-muted-foreground font-mono text-sm" }, page.path),
                        React.createElement(table_1.TableCell, null,
                            React.createElement(badge_1.Badge, { variant: page.isPublished ? "default" : "secondary", className: page.isPublished ? "bg-green-100 text-green-700 hover:bg-green-100" : "" }, page.isPublished ? "Published" : "Draft")),
                        React.createElement(table_1.TableCell, { className: "text-muted-foreground text-sm" }, page.seoTitle || React.createElement("span", { className: "italic opacity-50" }, "Not set")),
                        React.createElement(table_1.TableCell, { className: "text-right" },
                            React.createElement(button_1.Button, { variant: "ghost", size: "sm", asChild: true },
                                React.createElement("a", { href: page.path, target: "_blank", rel: "noopener noreferrer" },
                                    React.createElement(lucide_react_1.ExternalLink, { className: "h-4 w-4" })))))); })))))));
}
// ── Pages Tab ───────────────────────────────────────────────────────────
function PagesTab() {
    var utils = trpc_1.trpc.useUtils();
    var _a = trpc_1.trpc.websiteAdmin.getPages.useQuery({}), pages = _a.data, isLoading = _a.isLoading;
    var updatePage = trpc_1.trpc.websiteAdmin.updatePage.useMutation({
        onSuccess: function () {
            utils.websiteAdmin.getPages.invalidate();
            sonner_1.toast.success("Page settings saved");
        },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var _b = react_1.useState(null), expandedSlug = _b[0], setExpandedSlug = _b[1];
    var _c = react_1.useState({}), seoForm = _c[0], setSeoForm = _c[1];
    if (isLoading) {
        return React.createElement("div", { className: "text-center py-12 text-muted-foreground" }, "Loading pages...");
    }
    var handleTogglePublished = function (slug, current) {
        updatePage.mutate({ slug: slug, isPublished: !current });
    };
    var handleSaveSeo = function (slug) {
        var form = seoForm[slug];
        if (!form)
            return;
        updatePage.mutate(__assign({ slug: slug }, form));
    };
    var toggleExpand = function (slug) {
        if (expandedSlug === slug) {
            setExpandedSlug(null);
        }
        else {
            setExpandedSlug(slug);
            var page_1 = pages === null || pages === void 0 ? void 0 : pages.find(function (p) { return p.slug === slug; });
            if (page_1 && !seoForm[slug]) {
                setSeoForm(function (prev) {
                    var _a;
                    return (__assign(__assign({}, prev), (_a = {}, _a[slug] = {
                        seoTitle: page_1.seoTitle,
                        seoDescription: page_1.seoDescription,
                        seoKeywords: page_1.seoKeywords
                    }, _a)));
                });
            }
        }
    };
    return (React.createElement("div", { className: "space-y-4" },
        React.createElement("div", { className: "flex items-center justify-between" },
            React.createElement("div", null,
                React.createElement("h2", { className: "text-lg font-semibold" }, "Page Management"),
                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Toggle visibility and configure SEO metadata for each page"))),
        React.createElement("div", { className: "space-y-3" }, pages === null || pages === void 0 ? void 0 : pages.map(function (page) {
            var _a, _b, _c, _d, _e, _f;
            return (React.createElement(card_1.Card, { key: page.slug, className: expandedSlug === page.slug ? "ring-2 ring-indigo-200" : "" },
                React.createElement("div", { className: "flex items-center gap-4 p-4" },
                    React.createElement("div", { className: "flex-1 min-w-0" },
                        React.createElement("div", { className: "flex items-center gap-3" },
                            React.createElement("button", { onClick: function () { return toggleExpand(page.slug); }, className: "text-muted-foreground hover:text-foreground" }, expandedSlug === page.slug ? React.createElement(lucide_react_1.ChevronUp, { className: "h-4 w-4" }) : React.createElement(lucide_react_1.ChevronDown, { className: "h-4 w-4" })),
                            React.createElement("div", null,
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement("h3", { className: "font-medium" }, page.title),
                                    React.createElement(badge_1.Badge, { variant: page.isPublished ? "default" : "secondary", className: "text-[11px] " + (page.isPublished ? "bg-green-100 text-green-700 hover:bg-green-100" : "") }, page.isPublished ? "Published" : "Draft")),
                                React.createElement("p", { className: "text-sm text-muted-foreground" }, page.description)))),
                    React.createElement("div", { className: "flex items-center gap-3" },
                        React.createElement("code", { className: "text-xs bg-muted px-2 py-1 rounded font-mono hidden md:block" }, page.path),
                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", asChild: true },
                            React.createElement("a", { href: page.path, target: "_blank", rel: "noopener noreferrer" },
                                React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" }))),
                        React.createElement(switch_1.Switch, { checked: page.isPublished, onCheckedChange: function () { return handleTogglePublished(page.slug, page.isPublished); } }))),
                expandedSlug === page.slug && (React.createElement("div", { className: "border-t px-4 pb-4 pt-4 bg-muted/30" },
                    React.createElement("h4", { className: "font-medium text-sm mb-3 flex items-center gap-2" },
                        React.createElement(lucide_react_1.Search, { className: "h-4 w-4" }),
                        "SEO Settings"),
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "seo-title-" + page.slug }, "SEO Title"),
                            React.createElement(input_1.Input, { id: "seo-title-" + page.slug, placeholder: page.title + " | Kiini", value: (_b = (_a = seoForm[page.slug]) === null || _a === void 0 ? void 0 : _a.seoTitle) !== null && _b !== void 0 ? _b : page.seoTitle, onChange: function (e) {
                                    return setSeoForm(function (prev) {
                                        var _a;
                                        return (__assign(__assign({}, prev), (_a = {}, _a[page.slug] = __assign(__assign({}, prev[page.slug]), { seoTitle: e.target.value }), _a)));
                                    });
                                } })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "seo-keywords-" + page.slug }, "Keywords"),
                            React.createElement(input_1.Input, { id: "seo-keywords-" + page.slug, placeholder: "keyword1, keyword2, keyword3", value: (_d = (_c = seoForm[page.slug]) === null || _c === void 0 ? void 0 : _c.seoKeywords) !== null && _d !== void 0 ? _d : page.seoKeywords, onChange: function (e) {
                                    return setSeoForm(function (prev) {
                                        var _a;
                                        return (__assign(__assign({}, prev), (_a = {}, _a[page.slug] = __assign(__assign({}, prev[page.slug]), { seoKeywords: e.target.value }), _a)));
                                    });
                                } })),
                        React.createElement("div", { className: "space-y-2 md:col-span-2" },
                            React.createElement(label_1.Label, { htmlFor: "seo-desc-" + page.slug }, "Meta Description"),
                            React.createElement(textarea_1.Textarea, { id: "seo-desc-" + page.slug, placeholder: "Brief description for search engines (150-160 characters recommended)", rows: 2, value: (_f = (_e = seoForm[page.slug]) === null || _e === void 0 ? void 0 : _e.seoDescription) !== null && _f !== void 0 ? _f : page.seoDescription, onChange: function (e) {
                                    return setSeoForm(function (prev) {
                                        var _a;
                                        return (__assign(__assign({}, prev), (_a = {}, _a[page.slug] = __assign(__assign({}, prev[page.slug]), { seoDescription: e.target.value }), _a)));
                                    });
                                } }))),
                    React.createElement("div", { className: "flex justify-end mt-4" },
                        React.createElement(button_1.Button, { size: "sm", onClick: function () { return handleSaveSeo(page.slug); }, className: "gap-2" },
                            React.createElement(lucide_react_1.Save, { className: "h-4 w-4" }),
                            "Save SEO Settings"))))));
        }))));
}
// ── Navigation Tab ──────────────────────────────────────────────────────
function NavigationTab() {
    var utils = trpc_1.trpc.useUtils();
    var _a = trpc_1.trpc.websiteAdmin.getNavigation.useQuery({}), navConfig = _a.data, isLoading = _a.isLoading;
    var updateNav = trpc_1.trpc.websiteAdmin.updateNavigation.useMutation({
        onSuccess: function () {
            utils.websiteAdmin.getNavigation.invalidate();
            sonner_1.toast.success("Navigation updated");
        },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var _b = react_1.useState(null), form = _b[0], setForm = _b[1];
    // Initialize form when data loads
    var current = form !== null && form !== void 0 ? form : navConfig;
    if (!current) {
        return React.createElement("div", { className: "text-center py-12 text-muted-foreground" }, isLoading ? "Loading..." : "No configuration found");
    }
    var handleSave = function () {
        if (!current)
            return;
        updateNav.mutate(current);
        setForm(null);
    };
    var updateMainLink = function (idx, field, value) {
        var _a;
        var updated = __assign({}, (form !== null && form !== void 0 ? form : navConfig));
        updated.mainLinks = __spreadArrays(updated.mainLinks);
        updated.mainLinks[idx] = __assign(__assign({}, updated.mainLinks[idx]), (_a = {}, _a[field] = value, _a));
        setForm(updated);
    };
    var updateResourceLink = function (idx, field, value) {
        var _a;
        var updated = __assign({}, (form !== null && form !== void 0 ? form : navConfig));
        updated.resourceLinks = __spreadArrays(updated.resourceLinks);
        updated.resourceLinks[idx] = __assign(__assign({}, updated.resourceLinks[idx]), (_a = {}, _a[field] = value, _a));
        setForm(updated);
    };
    var updateCta = function (field, value) {
        setForm(function (prev) {
            var _a;
            return (__assign(__assign({}, (prev !== null && prev !== void 0 ? prev : navConfig)), (_a = {}, _a[field] = value, _a)));
        });
    };
    var addMainLink = function () {
        var updated = __assign({}, (form !== null && form !== void 0 ? form : navConfig));
        updated.mainLinks = __spreadArrays(updated.mainLinks, [{ label: "", href: "/", visible: true }]);
        setForm(updated);
    };
    var removeMainLink = function (idx) {
        var updated = __assign({}, (form !== null && form !== void 0 ? form : navConfig));
        updated.mainLinks = updated.mainLinks.filter(function (_, i) { return i !== idx; });
        setForm(updated);
    };
    var addResourceLink = function () {
        var updated = __assign({}, (form !== null && form !== void 0 ? form : navConfig));
        updated.resourceLinks = __spreadArrays(updated.resourceLinks, [{ label: "", href: "/", visible: true }]);
        setForm(updated);
    };
    var removeResourceLink = function (idx) {
        var updated = __assign({}, (form !== null && form !== void 0 ? form : navConfig));
        updated.resourceLinks = updated.resourceLinks.filter(function (_, i) { return i !== idx; });
        setForm(updated);
    };
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "flex items-center justify-between" },
            React.createElement("div", null,
                React.createElement("h2", { className: "text-lg font-semibold" }, "Navigation Management"),
                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Configure the website header navigation links and CTA button")),
            React.createElement(button_1.Button, { onClick: handleSave, disabled: updateNav.isPending, className: "gap-2" },
                React.createElement(lucide_react_1.Save, { className: "h-4 w-4" }),
                "Save Changes")),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "text-base" }, "Main Navigation Links"),
                React.createElement(card_1.CardDescription, null, "Primary links shown in the website header")),
            React.createElement(card_1.CardContent, { className: "space-y-3" },
                current.mainLinks.map(function (link, idx) { return (React.createElement("div", { key: idx, className: "flex items-center gap-3 p-3 rounded-lg border bg-background" },
                    React.createElement(lucide_react_1.GripVertical, { className: "h-4 w-4 text-muted-foreground/40" }),
                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1" },
                        React.createElement(input_1.Input, { value: link.label, onChange: function (e) { return updateMainLink(idx, "label", e.target.value); }, placeholder: "Label" }),
                        React.createElement(input_1.Input, { value: link.href, onChange: function (e) { return updateMainLink(idx, "href", e.target.value); }, placeholder: "/path", className: "font-mono text-sm" }),
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement(switch_1.Switch, { checked: link.visible, onCheckedChange: function (v) { return updateMainLink(idx, "visible", v); } }),
                            React.createElement("span", { className: "text-sm text-muted-foreground" }, link.visible ? "Visible" : "Hidden"))),
                    React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return removeMainLink(idx); }, className: "text-red-500 hover:text-red-600 hover:bg-red-50 flex-shrink-0" },
                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); }),
                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: addMainLink, className: "gap-2 w-full border-dashed" },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                    "Add Navigation Link"))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "text-base" }, "Resource Links"),
                React.createElement(card_1.CardDescription, null, "Links shown in the \"Resources\" dropdown menu")),
            React.createElement(card_1.CardContent, { className: "space-y-3" },
                current.resourceLinks.map(function (link, idx) { return (React.createElement("div", { key: idx, className: "flex items-center gap-3 p-3 rounded-lg border bg-background" },
                    React.createElement(lucide_react_1.GripVertical, { className: "h-4 w-4 text-muted-foreground/40" }),
                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1" },
                        React.createElement(input_1.Input, { value: link.label, onChange: function (e) { return updateResourceLink(idx, "label", e.target.value); }, placeholder: "Label" }),
                        React.createElement(input_1.Input, { value: link.href, onChange: function (e) { return updateResourceLink(idx, "href", e.target.value); }, placeholder: "/path", className: "font-mono text-sm" }),
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement(switch_1.Switch, { checked: link.visible, onCheckedChange: function (v) { return updateResourceLink(idx, "visible", v); } }),
                            React.createElement("span", { className: "text-sm text-muted-foreground" }, link.visible ? "Visible" : "Hidden"))),
                    React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return removeResourceLink(idx); }, className: "text-red-500 hover:text-red-600 hover:bg-red-50 flex-shrink-0" },
                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); }),
                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: addResourceLink, className: "gap-2 w-full border-dashed" },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                    "Add Resource Link"))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "text-base" }, "Call-to-Action Button"),
                React.createElement(card_1.CardDescription, null, "The primary action button in the navigation header")),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Button Text"),
                        React.createElement(input_1.Input, { value: current.ctaText, onChange: function (e) { return updateCta("ctaText", e.target.value); }, placeholder: "Get Started" })),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Button Link"),
                        React.createElement(input_1.Input, { value: current.ctaLink, onChange: function (e) { return updateCta("ctaLink", e.target.value); }, placeholder: "/signup", className: "font-mono" })))))));
}
// ── Settings Tab ────────────────────────────────────────────────────────
function SettingsTab() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    var utils = trpc_1.trpc.useUtils();
    var _r = trpc_1.trpc.websiteAdmin.getSettings.useQuery({}), settings = _r.data, isLoading = _r.isLoading;
    var updateSettings = trpc_1.trpc.websiteAdmin.updateSettings.useMutation({
        onSuccess: function () {
            utils.websiteAdmin.getSettings.invalidate();
            sonner_1.toast.success("Settings saved");
        },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var _s = react_1.useState({}), form = _s[0], setForm = _s[1];
    var current = __assign(__assign({}, settings), form);
    if (isLoading) {
        return React.createElement("div", { className: "text-center py-12 text-muted-foreground" }, "Loading settings...");
    }
    var handleSave = function () {
        updateSettings.mutate(form);
        setForm({});
    };
    var setField = function (key, value) {
        setForm(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[key] = value, _a)));
        });
    };
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "flex items-center justify-between" },
            React.createElement("div", null,
                React.createElement("h2", { className: "text-lg font-semibold" }, "Website Settings"),
                React.createElement("p", { className: "text-sm text-muted-foreground" }, "General configuration, contact info, social links, and more")),
            React.createElement(button_1.Button, { onClick: handleSave, disabled: updateSettings.isPending || Object.keys(form).length === 0, className: "gap-2" },
                React.createElement(lucide_react_1.Save, { className: "h-4 w-4" }),
                "Save Settings")),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "text-base" }, "General")),
            React.createElement(card_1.CardContent, { className: "space-y-4" },
                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Site Title"),
                        React.createElement(input_1.Input, { value: (_a = current.siteTitle) !== null && _a !== void 0 ? _a : "", onChange: function (e) { return setField("siteTitle", e.target.value); }, placeholder: "Kiini" })),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Tagline"),
                        React.createElement(input_1.Input, { value: (_b = current.tagline) !== null && _b !== void 0 ? _b : "", onChange: function (e) { return setField("tagline", e.target.value); }, placeholder: "Complete Business Management Platform" }))),
                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Hero Title Override"),
                        React.createElement(input_1.Input, { value: (_c = current.heroTitle) !== null && _c !== void 0 ? _c : "", onChange: function (e) { return setField("heroTitle", e.target.value); }, placeholder: "Leave empty for default" })),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Hero Subtitle Override"),
                        React.createElement(input_1.Input, { value: (_d = current.heroSubtitle) !== null && _d !== void 0 ? _d : "", onChange: function (e) { return setField("heroSubtitle", e.target.value); }, placeholder: "Leave empty for default" }))))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "text-base" }, "Contact Information"),
                React.createElement(card_1.CardDescription, null, "Displayed on the Contact page and website footer")),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Email"),
                        React.createElement(input_1.Input, { type: "email", value: (_e = current.contactEmail) !== null && _e !== void 0 ? _e : "", onChange: function (e) { return setField("contactEmail", e.target.value); }, placeholder: "info@company.com" })),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Phone"),
                        React.createElement(input_1.Input, { value: (_f = current.contactPhone) !== null && _f !== void 0 ? _f : "", onChange: function (e) { return setField("contactPhone", e.target.value); }, placeholder: "+254 700 000 000" })),
                    React.createElement("div", { className: "space-y-2 md:col-span-2" },
                        React.createElement(label_1.Label, null, "Address"),
                        React.createElement(input_1.Input, { value: (_g = current.contactAddress) !== null && _g !== void 0 ? _g : "", onChange: function (e) { return setField("contactAddress", e.target.value); }, placeholder: "123 Business Street, Nairobi, Kenya" }))))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                    React.createElement(lucide_react_1.Link2, { className: "h-4 w-4" }),
                    "Social Media Links")),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "LinkedIn"),
                        React.createElement(input_1.Input, { value: (_h = current.socialLinkedIn) !== null && _h !== void 0 ? _h : "", onChange: function (e) { return setField("socialLinkedIn", e.target.value); }, placeholder: "https://linkedin.com/company/..." })),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Twitter / X"),
                        React.createElement(input_1.Input, { value: (_j = current.socialTwitter) !== null && _j !== void 0 ? _j : "", onChange: function (e) { return setField("socialTwitter", e.target.value); }, placeholder: "https://twitter.com/..." })),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Facebook"),
                        React.createElement(input_1.Input, { value: (_k = current.socialFacebook) !== null && _k !== void 0 ? _k : "", onChange: function (e) { return setField("socialFacebook", e.target.value); }, placeholder: "https://facebook.com/..." })),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Instagram"),
                        React.createElement(input_1.Input, { value: (_l = current.socialInstagram) !== null && _l !== void 0 ? _l : "", onChange: function (e) { return setField("socialInstagram", e.target.value); }, placeholder: "https://instagram.com/..." }))))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                    React.createElement(lucide_react_1.Megaphone, { className: "h-4 w-4" }),
                    "Announcement Banner"),
                React.createElement(card_1.CardDescription, null, "Display a notification banner across the top of the website")),
            React.createElement(card_1.CardContent, { className: "space-y-4" },
                React.createElement("div", { className: "flex items-center gap-3" },
                    React.createElement(switch_1.Switch, { checked: (_m = current.announcementEnabled) !== null && _m !== void 0 ? _m : false, onCheckedChange: function (v) { return setField("announcementEnabled", v); } }),
                    React.createElement(label_1.Label, null, "Enable announcement banner")),
                React.createElement("div", { className: "space-y-2" },
                    React.createElement(label_1.Label, null, "Banner Message"),
                    React.createElement(textarea_1.Textarea, { value: (_o = current.announcementBanner) !== null && _o !== void 0 ? _o : "", onChange: function (e) { return setField("announcementBanner", e.target.value); }, placeholder: "\uD83D\uDE80 We just launched new features! Check them out...", rows: 2 })))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "text-base" }, "Analytics & Tracking")),
            React.createElement(card_1.CardContent, { className: "space-y-4" },
                React.createElement("div", { className: "space-y-2" },
                    React.createElement(label_1.Label, null, "Google Analytics ID"),
                    React.createElement(input_1.Input, { value: (_p = current.googleAnalyticsId) !== null && _p !== void 0 ? _p : "", onChange: function (e) { return setField("googleAnalyticsId", e.target.value); }, placeholder: "G-XXXXXXXXXX", className: "font-mono" })),
                React.createElement("div", { className: "space-y-2" },
                    React.createElement(label_1.Label, null, "Custom Head Script"),
                    React.createElement(textarea_1.Textarea, { value: (_q = current.customHeadScript) !== null && _q !== void 0 ? _q : "", onChange: function (e) { return setField("customHeadScript", e.target.value); }, placeholder: "<!-- Paste tracking scripts here -->", rows: 3, className: "font-mono text-sm" }),
                    React.createElement("p", { className: "text-xs text-muted-foreground" }, "Scripts injected into the <head> section of all pages"))))));
}
// ── Inquiries Tab ───────────────────────────────────────────────────────
function InquiriesTab() {
    var _a, _b, _c, _d, _e, _f;
    var utils = trpc_1.trpc.useUtils();
    var _g = trpc_1.trpc.websiteAdmin.getContactSubmissions.useQuery({}), contacts = _g.data, isLoading = _g.isLoading;
    var updateStatus = trpc_1.trpc.websiteAdmin.updateContactStatus.useMutation({
        onSuccess: function () {
            utils.websiteAdmin.getContactSubmissions.invalidate();
            sonner_1.toast.success("Status updated");
        },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var deleteContact = trpc_1.trpc.websiteAdmin.deleteContact.useMutation({
        onSuccess: function () {
            utils.websiteAdmin.getContactSubmissions.invalidate();
            sonner_1.toast.success("Inquiry deleted");
        },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var bulkUpdate = trpc_1.trpc.websiteAdmin.bulkUpdateContacts.useMutation({
        onSuccess: function () {
            utils.websiteAdmin.getContactSubmissions.invalidate();
            setSelected(new Set());
            sonner_1.toast.success("Bulk action applied");
        },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var _h = react_1.useState("all"), filter = _h[0], setFilter = _h[1];
    var _j = react_1.useState(null), expandedId = _j[0], setExpandedId = _j[1];
    var _k = react_1.useState(""), search = _k[0], setSearch = _k[1];
    var _l = react_1.useState(new Set()), selected = _l[0], setSelected = _l[1];
    if (isLoading) {
        return React.createElement("div", { className: "text-center py-12 text-muted-foreground" }, "Loading inquiries...");
    }
    var filtered = (_a = (filter === "all" ? contacts : contacts === null || contacts === void 0 ? void 0 : contacts.filter(function (c) { return c.status === filter; }))) === null || _a === void 0 ? void 0 : _a.filter(function (c) {
        return !search ||
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.email.toLowerCase().includes(search.toLowerCase()) ||
            (c.subject || "").toLowerCase().includes(search.toLowerCase()) ||
            c.message.toLowerCase().includes(search.toLowerCase());
    });
    var statusCounts = {
        all: (_b = contacts === null || contacts === void 0 ? void 0 : contacts.length) !== null && _b !== void 0 ? _b : 0,
        "new": (_c = contacts === null || contacts === void 0 ? void 0 : contacts.filter(function (c) { return c.status === "new"; }).length) !== null && _c !== void 0 ? _c : 0,
        read: (_d = contacts === null || contacts === void 0 ? void 0 : contacts.filter(function (c) { return c.status === "read"; }).length) !== null && _d !== void 0 ? _d : 0,
        replied: (_e = contacts === null || contacts === void 0 ? void 0 : contacts.filter(function (c) { return c.status === "replied"; }).length) !== null && _e !== void 0 ? _e : 0,
        archived: (_f = contacts === null || contacts === void 0 ? void 0 : contacts.filter(function (c) { return c.status === "archived"; }).length) !== null && _f !== void 0 ? _f : 0
    };
    var getStatusIcon = function (status) {
        switch (status) {
            case "new": return React.createElement(lucide_react_1.Mail, { className: "h-4 w-4 text-blue-500" });
            case "read": return React.createElement(lucide_react_1.Eye, { className: "h-4 w-4 text-amber-500" });
            case "replied": return React.createElement(lucide_react_1.Reply, { className: "h-4 w-4 text-green-500" });
            case "archived": return React.createElement(lucide_react_1.Archive, { className: "h-4 w-4 text-gray-400" });
            default: return React.createElement(lucide_react_1.Mail, { className: "h-4 w-4" });
        }
    };
    var getStatusBadge = function (status) {
        var _a;
        var variants = {
            "new": "bg-blue-100 text-blue-700",
            read: "bg-amber-100 text-amber-700",
            replied: "bg-green-100 text-green-700",
            archived: "bg-gray-100 text-gray-500"
        };
        return (React.createElement(badge_1.Badge, { className: ((_a = variants[status]) !== null && _a !== void 0 ? _a : "") + " text-xs" }, status.charAt(0).toUpperCase() + status.slice(1)));
    };
    var allSelected = !!(filtered === null || filtered === void 0 ? void 0 : filtered.length) && filtered.every(function (c) { return selected.has(c.id); });
    var toggleSelectAll = function () {
        var _a;
        if (allSelected) {
            setSelected(new Set());
        }
        else {
            setSelected(new Set((_a = filtered === null || filtered === void 0 ? void 0 : filtered.map(function (c) { return c.id; })) !== null && _a !== void 0 ? _a : []));
        }
    };
    var toggleSelect = function (id) {
        var next = new Set(selected);
        if (next.has(id))
            next["delete"](id);
        else
            next.add(id);
        setSelected(next);
    };
    var exportCSV = function () {
        if (!(contacts === null || contacts === void 0 ? void 0 : contacts.length))
            return;
        var rows = __spreadArrays([
            ["Name", "Email", "Phone", "Company", "Subject", "Message", "Status", "Date"]
        ], contacts.map(function (c) {
            var _a, _b, _c;
            return [
                c.name,
                c.email,
                (_a = c.phone) !== null && _a !== void 0 ? _a : "",
                (_b = c.company) !== null && _b !== void 0 ? _b : "",
                (_c = c.subject) !== null && _c !== void 0 ? _c : "",
                "\"" + (c.message || "").replace(/"/g, '""') + "\"",
                c.status,
                new Date(c.createdAt).toLocaleDateString(),
            ];
        }));
        var csv = rows.map(function (r) { return r.join(","); }).join("\n");
        var blob = new Blob([csv], { type: "text/csv" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "inquiries_" + new Date().toISOString().slice(0, 10) + ".csv";
        a.click();
        URL.revokeObjectURL(url);
    };
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "flex items-center justify-between" },
            React.createElement("div", null,
                React.createElement("h2", { className: "text-lg font-semibold" }, "Contact Inquiries"),
                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Manage submissions from the website contact form")),
            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: exportCSV, disabled: !(contacts === null || contacts === void 0 ? void 0 : contacts.length), className: "gap-2" },
                React.createElement(lucide_react_1.Download, { className: "h-4 w-4" }),
                "Export CSV")),
        React.createElement("div", { className: "flex gap-2 flex-wrap" }, ["all", "new", "read", "replied", "archived"].map(function (s) { return (React.createElement(button_1.Button, { key: s, variant: filter === s ? "default" : "outline", size: "sm", onClick: function () { return setFilter(s); }, className: "gap-2" },
            s === "all" ? React.createElement(lucide_react_1.MessageSquare, { className: "h-3.5 w-3.5" }) : getStatusIcon(s),
            s.charAt(0).toUpperCase() + s.slice(1),
            React.createElement(badge_1.Badge, { variant: "secondary", className: "ml-1 text-[10px] px-1.5" }, statusCounts[s]))); })),
        React.createElement("div", { className: "flex flex-wrap items-center gap-3" },
            React.createElement("div", { className: "relative flex-1 min-w-[200px] max-w-sm" },
                React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                React.createElement(input_1.Input, { value: search, onChange: function (e) { return setSearch(e.target.value); }, placeholder: "Search by name, email, or subject...", className: "pl-9" })),
            selected.size > 0 && (React.createElement("div", { className: "flex items-center gap-2 flex-wrap" },
                React.createElement("span", { className: "text-sm text-muted-foreground" },
                    selected.size,
                    " selected"),
                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return bulkUpdate.mutate({ ids: Array.from(selected), action: "read" }); } }, "Mark Read"),
                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return bulkUpdate.mutate({ ids: Array.from(selected), action: "archived" }); } }, "Archive"),
                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return bulkUpdate.mutate({ ids: Array.from(selected), action: "delete" }); }, className: "text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" },
                    React.createElement(lucide_react_1.Trash2, { className: "h-3.5 w-3.5 mr-1" }),
                    "Delete Selected")))),
        !(filtered === null || filtered === void 0 ? void 0 : filtered.length) ? (React.createElement(card_1.Card, null,
            React.createElement(card_1.CardContent, { className: "text-center py-16" },
                React.createElement(lucide_react_1.MessageSquare, { className: "h-12 w-12 mx-auto mb-4 text-muted-foreground/30" }),
                React.createElement("p", { className: "text-muted-foreground" },
                    "No ",
                    filter === "all" && !search ? "" : filter === "all" ? "matching" : filter,
                    " inquiries found")))) : (React.createElement(React.Fragment, null,
            React.createElement("div", { className: "flex items-center gap-3 px-4 py-2 bg-muted/50 rounded-lg border" },
                React.createElement(checkbox_1.Checkbox, { checked: allSelected, onCheckedChange: toggleSelectAll }),
                React.createElement("span", { className: "text-sm text-muted-foreground" },
                    "Select all (",
                    filtered.length,
                    ")")),
            React.createElement("div", { className: "space-y-3" }, filtered.map(function (contact) { return (React.createElement(card_1.Card, { key: contact.id, className: "transition-all " + (expandedId === contact.id ? "ring-2 ring-indigo-200" : "") + " " + (contact.status === "new" ? "border-blue-200" : "") },
                React.createElement("div", { className: "flex items-center gap-4 p-4" },
                    React.createElement(checkbox_1.Checkbox, { checked: selected.has(contact.id), onCheckedChange: function () { return toggleSelect(contact.id); }, onClick: function (e) { return e.stopPropagation(); } }),
                    React.createElement("div", { className: "flex items-center gap-4 flex-1 cursor-pointer", onClick: function () { return setExpandedId(expandedId === contact.id ? null : contact.id); } },
                        React.createElement("div", { className: "flex-shrink-0" }, getStatusIcon(contact.status)),
                        React.createElement("div", { className: "flex-1 min-w-0" },
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement("span", { className: "font-medium" }, contact.name),
                                getStatusBadge(contact.status)),
                            React.createElement("p", { className: "text-sm text-muted-foreground truncate" }, contact.subject || contact.message)),
                        React.createElement("div", { className: "flex items-center gap-3 flex-shrink-0" },
                            React.createElement("span", { className: "text-xs text-muted-foreground hidden sm:block" }, new Date(contact.createdAt).toLocaleDateString()),
                            expandedId === contact.id ? React.createElement(lucide_react_1.ChevronUp, { className: "h-4 w-4" }) : React.createElement(lucide_react_1.ChevronDown, { className: "h-4 w-4" })))),
                expandedId === contact.id && (React.createElement("div", { className: "border-t px-4 pb-4 pt-4 space-y-4 bg-muted/20" },
                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-xs font-medium text-muted-foreground mb-1" }, "Email"),
                            React.createElement("p", { className: "text-sm" }, contact.email)),
                        contact.phone && (React.createElement("div", null,
                            React.createElement("p", { className: "text-xs font-medium text-muted-foreground mb-1" }, "Phone"),
                            React.createElement("p", { className: "text-sm" }, contact.phone))),
                        contact.company && (React.createElement("div", null,
                            React.createElement("p", { className: "text-xs font-medium text-muted-foreground mb-1" }, "Company"),
                            React.createElement("p", { className: "text-sm" }, contact.company)))),
                    contact.subject && (React.createElement("div", null,
                        React.createElement("p", { className: "text-xs font-medium text-muted-foreground mb-1" }, "Subject"),
                        React.createElement("p", { className: "text-sm" }, contact.subject))),
                    React.createElement("div", null,
                        React.createElement("p", { className: "text-xs font-medium text-muted-foreground mb-1" }, "Message"),
                        React.createElement("div", { className: "bg-background rounded-lg border p-3 text-sm whitespace-pre-wrap" }, contact.message)),
                    React.createElement(separator_1.Separator, null),
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("span", { className: "text-sm text-muted-foreground" }, "Update status:"),
                            React.createElement(select_1.Select, { value: contact.status, onValueChange: function (v) { return updateStatus.mutate({ id: contact.id, status: v }); } },
                                React.createElement(select_1.SelectTrigger, { className: "w-32 h-8" },
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "new" }, "New"),
                                    React.createElement(select_1.SelectItem, { value: "read" }, "Read"),
                                    React.createElement(select_1.SelectItem, { value: "replied" }, "Replied"),
                                    React.createElement(select_1.SelectItem, { value: "archived" }, "Archived")))),
                        React.createElement("div", { className: "flex items-center gap-3" },
                            React.createElement("span", { className: "text-xs text-muted-foreground" },
                                "Received: ",
                                new Date(contact.createdAt).toLocaleString()),
                            React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return deleteContact.mutate({ id: contact.id }); }, className: "text-red-600 hover:text-red-700 hover:bg-red-50 gap-1" },
                                React.createElement(lucide_react_1.Trash2, { className: "h-3.5 w-3.5" }),
                                "Delete"))))))); }))))));
}
// ── Pricing Tab ─────────────────────────────────────────────────────────
function PricingTab() {
    var utils = trpc_1.trpc.useUtils();
    var _a = trpc_1.trpc.multiTenancy.getPlanPrices.useQuery({}), tiers = _a.data, tiersLoading = _a.isLoading;
    var _b = trpc_1.trpc.websiteAdmin.publicPricing.useQuery({}), publicData = _b.data, pubLoading = _b.isLoading;
    var saveMut = trpc_1.trpc.websiteAdmin.updatePricingConfig.useMutation({
        onSuccess: function () {
            utils.websiteAdmin.publicPricing.invalidate();
            sonner_1.toast.success("Pricing page configuration saved");
        },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    // Merge CRM tiers with any existing custom config
    var plans = react_1.useMemo(function () {
        var _a;
        if (!tiers || !Array.isArray(tiers))
            return [];
        var custom = (_a = publicData === null || publicData === void 0 ? void 0 : publicData.customConfig) === null || _a === void 0 ? void 0 : _a.plans;
        return tiers.map(function (t) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
            var match = custom === null || custom === void 0 ? void 0 : custom.find(function (c) { var _a; return c.tier === ((_a = t.planSlug) !== null && _a !== void 0 ? _a : t.key); });
            return {
                name: (_c = (_b = (_a = match === null || match === void 0 ? void 0 : match.name) !== null && _a !== void 0 ? _a : t.planName) !== null && _b !== void 0 ? _b : t.label) !== null && _c !== void 0 ? _c : t.key,
                tier: (_d = t.planSlug) !== null && _d !== void 0 ? _d : t.key,
                monthlyKes: (_e = match === null || match === void 0 ? void 0 : match.monthlyKes) !== null && _e !== void 0 ? _e : Number((_g = (_f = t.monthlyPrice) !== null && _f !== void 0 ? _f : t.monthlyKes) !== null && _g !== void 0 ? _g : 0),
                annualKes: (_h = match === null || match === void 0 ? void 0 : match.annualKes) !== null && _h !== void 0 ? _h : Number((_k = (_j = t.annualPrice) !== null && _j !== void 0 ? _j : t.annualKes) !== null && _k !== void 0 ? _k : 0),
                description: (_m = (_l = match === null || match === void 0 ? void 0 : match.description) !== null && _l !== void 0 ? _l : t.description) !== null && _m !== void 0 ? _m : "",
                highlight: (_o = match === null || match === void 0 ? void 0 : match.highlight) !== null && _o !== void 0 ? _o : false,
                badge: (_p = match === null || match === void 0 ? void 0 : match.badge) !== null && _p !== void 0 ? _p : null,
                cta: (_q = match === null || match === void 0 ? void 0 : match.cta) !== null && _q !== void 0 ? _q : "Get Started",
                ctaLink: (_r = match === null || match === void 0 ? void 0 : match.ctaLink) !== null && _r !== void 0 ? _r : "/signup?plan=" + ((_s = t.planSlug) !== null && _s !== void 0 ? _s : t.key),
                maxUsers: (_t = match === null || match === void 0 ? void 0 : match.maxUsers) !== null && _t !== void 0 ? _t : String((_u = t.maxUsers) !== null && _u !== void 0 ? _u : "Unlimited"),
                features: (_v = match === null || match === void 0 ? void 0 : match.features) !== null && _v !== void 0 ? _v : (t.features
                    ? Object.entries(t.features).map(function (_a) {
                        var k = _a[0], v = _a[1];
                        return ({
                            text: k.replace(/_/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); }),
                            included: Boolean(v)
                        });
                    })
                    : [])
            };
        });
    }, [tiers, publicData]);
    var _c = react_1.useState(null), edited = _c[0], setEdited = _c[1];
    var current = edited !== null && edited !== void 0 ? edited : plans;
    var update = function (idx, patch) {
        return setEdited(current.map(function (p, i) { return (i === idx ? __assign(__assign({}, p), patch) : p); }));
    };
    var updateFeature = function (planIdx, fIdx, patch) {
        return setEdited(current.map(function (p, i) {
            return i === planIdx
                ? __assign(__assign({}, p), { features: p.features.map(function (f, j) { return (j === fIdx ? __assign(__assign({}, f), patch) : f); }) }) : p;
        }));
    };
    var addFeature = function (planIdx) {
        return setEdited(current.map(function (p, i) {
            return i === planIdx ? __assign(__assign({}, p), { features: __spreadArrays(p.features, [{ text: "", included: true }]) }) : p;
        }));
    };
    var removeFeature = function (planIdx, fIdx) {
        return setEdited(current.map(function (p, i) {
            return i === planIdx ? __assign(__assign({}, p), { features: p.features.filter(function (_, j) { return j !== fIdx; }) }) : p;
        }));
    };
    var handleSave = function () {
        var _a, _b, _c, _d;
        saveMut.mutate({
            config: {
                plans: current.map(function (p) { var _a; return (__assign(__assign({}, p), { badge: (_a = p.badge) !== null && _a !== void 0 ? _a : null })); }),
                comparisonRows: (_b = (_a = publicData === null || publicData === void 0 ? void 0 : publicData.customConfig) === null || _a === void 0 ? void 0 : _a.comparisonRows) !== null && _b !== void 0 ? _b : [],
                faq: (_d = (_c = publicData === null || publicData === void 0 ? void 0 : publicData.customConfig) === null || _c === void 0 ? void 0 : _c.faq) !== null && _d !== void 0 ? _d : []
            }
        });
        setEdited(null);
    };
    var isLoading = tiersLoading || pubLoading;
    if (isLoading) {
        return React.createElement("div", { className: "text-center py-12 text-muted-foreground" }, "Loading pricing tiers...");
    }
    if (!current.length) {
        return (React.createElement(card_1.Card, null,
            React.createElement(card_1.CardContent, { className: "py-12 text-center text-muted-foreground" },
                React.createElement(lucide_react_1.DollarSign, { className: "h-12 w-12 mx-auto mb-4 opacity-30" }),
                React.createElement("p", { className: "font-semibold text-lg mb-1" }, "No pricing tiers found"),
                React.createElement("p", { className: "text-sm" }, "Create pricing tiers in the CRM Administration \u2192 Pricing Tiers page first."))));
    }
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "flex items-center justify-between" },
            React.createElement("div", null,
                React.createElement("h3", { className: "text-lg font-semibold" }, "Public Pricing Page"),
                React.createElement("p", { className: "text-sm text-muted-foreground" },
                    "Customize how pricing tiers appear on the public website. Tier prices & features are managed in",
                    " ",
                    React.createElement("span", { className: "font-medium text-foreground" }, "Administration \u2192 Pricing Tiers"),
                    ".")),
            React.createElement(button_1.Button, { onClick: handleSave, disabled: !edited || saveMut.isPending },
                React.createElement(lucide_react_1.Save, { className: "h-4 w-4 mr-2" }),
                saveMut.isPending ? "Saving..." : "Save Changes")),
        React.createElement("div", { className: "grid gap-6" }, current.map(function (plan, idx) {
            var _a;
            return (React.createElement(card_1.Card, { key: plan.tier, className: plan.highlight ? "border-primary" : "" },
                React.createElement(card_1.CardHeader, { className: "pb-3" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("div", { className: "flex items-center gap-3" },
                            React.createElement(card_1.CardTitle, { className: "text-base" }, plan.name),
                            React.createElement(badge_1.Badge, { variant: "secondary" }, plan.tier),
                            plan.highlight && React.createElement(badge_1.Badge, { variant: "default" }, "Highlighted")),
                        React.createElement("div", { className: "flex items-center gap-4 text-sm text-muted-foreground" },
                            React.createElement("span", null,
                                "Ksh ",
                                plan.monthlyKes.toLocaleString(),
                                "/mo"),
                            React.createElement("span", null,
                                "Ksh ",
                                plan.annualKes.toLocaleString(),
                                "/yr")))),
                React.createElement(card_1.CardContent, { className: "space-y-4" },
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" },
                        React.createElement("div", null,
                            React.createElement(label_1.Label, null, "Display Name"),
                            React.createElement(input_1.Input, { value: plan.name, onChange: function (e) { return update(idx, { name: e.target.value }); } })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, null, "CTA Button Text"),
                            React.createElement(input_1.Input, { value: plan.cta, onChange: function (e) { return update(idx, { cta: e.target.value }); } })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, null, "CTA Link"),
                            React.createElement(input_1.Input, { value: plan.ctaLink, onChange: function (e) { return update(idx, { ctaLink: e.target.value }); } })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, null, "Badge Text"),
                            React.createElement(input_1.Input, { value: (_a = plan.badge) !== null && _a !== void 0 ? _a : "", placeholder: "e.g. Most Popular", onChange: function (e) { return update(idx, { badge: e.target.value || null }); } }))),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, null, "Description"),
                        React.createElement(textarea_1.Textarea, { value: plan.description, rows: 2, onChange: function (e) { return update(idx, { description: e.target.value }); } })),
                    React.createElement("div", { className: "flex items-center gap-6" },
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement(switch_1.Switch, { checked: plan.highlight, onCheckedChange: function (v) { return update(idx, { highlight: v }); } }),
                            React.createElement(label_1.Label, { className: "mb-0" }, "Highlight on pricing page")),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, null, "Max Users"),
                            React.createElement(input_1.Input, { value: plan.maxUsers, className: "w-32 ml-2 inline-block", onChange: function (e) { return update(idx, { maxUsers: e.target.value }); } }))),
                    React.createElement(separator_1.Separator, null),
                    React.createElement("div", null,
                        React.createElement("div", { className: "flex items-center justify-between mb-2" },
                            React.createElement(label_1.Label, { className: "mb-0" }, "Features displayed on pricing card"),
                            React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { return addFeature(idx); } },
                                React.createElement(lucide_react_1.Plus, { className: "h-3 w-3 mr-1" }),
                                " Add")),
                        React.createElement("div", { className: "space-y-2" }, plan.features.map(function (f, fIdx) { return (React.createElement("div", { key: fIdx, className: "flex items-center gap-2" },
                            React.createElement(checkbox_1.Checkbox, { checked: f.included, onCheckedChange: function (v) { return updateFeature(idx, fIdx, { included: Boolean(v) }); } }),
                            React.createElement(input_1.Input, { value: f.text, className: "flex-1", placeholder: "Feature description", onChange: function (e) { return updateFeature(idx, fIdx, { text: e.target.value }); } }),
                            React.createElement(button_1.Button, { size: "icon", variant: "ghost", className: "h-8 w-8 text-destructive", onClick: function () { return removeFeature(idx, fIdx); } },
                                React.createElement(lucide_react_1.Minus, { className: "h-3 w-3" })))); }))))));
        }))));
}
// ── Footer Tab ──────────────────────────────────────────────────────────
function FooterTab() {
    var _a, _b, _c;
    var utils = trpc_1.trpc.useUtils();
    var _d = trpc_1.trpc.websiteAdmin.getFooterConfig.useQuery({}), footerConfig = _d.data, isLoading = _d.isLoading;
    var updateFooter = trpc_1.trpc.websiteAdmin.updateFooterConfig.useMutation({
        onSuccess: function () {
            utils.websiteAdmin.getFooterConfig.invalidate();
            sonner_1.toast.success("Footer configuration saved");
        },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var _e = react_1.useState(null), form = _e[0], setForm = _e[1];
    var current = form !== null && form !== void 0 ? form : footerConfig;
    if (!current) {
        return React.createElement("div", { className: "text-center py-12 text-muted-foreground" }, isLoading ? "Loading..." : "No configuration found");
    }
    var update = function (updater) {
        var copy = JSON.parse(JSON.stringify(current));
        updater(copy);
        setForm(copy);
    };
    var handleSave = function () {
        if (!current)
            return;
        updateFooter.mutate({
            columns: current.columns,
            copyrightText: current.copyrightText,
            showCloudPartners: current.showCloudPartners,
            showComplianceBadges: current.showComplianceBadges
        });
        setForm(null);
    };
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "flex items-center justify-between" },
            React.createElement("div", null,
                React.createElement("h2", { className: "text-lg font-semibold" }, "Footer Configuration"),
                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Manage footer link columns, copyright text, and optional sections")),
            React.createElement(button_1.Button, { onClick: handleSave, disabled: updateFooter.isPending || !form, className: "gap-2" },
                React.createElement(lucide_react_1.Save, { className: "h-4 w-4" }),
                "Save Footer")),
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" }, current.columns.map(function (col, ci) { return (React.createElement(card_1.Card, { key: ci },
            React.createElement(card_1.CardHeader, { className: "pb-3" },
                React.createElement(input_1.Input, { value: col.title, onChange: function (e) { return update(function (d) { d.columns[ci].title = e.target.value; }); }, className: "font-semibold h-8 text-sm", placeholder: "Column Title" })),
            React.createElement(card_1.CardContent, { className: "space-y-2" },
                col.links.map(function (link, li) { return (React.createElement("div", { key: li, className: "flex items-start gap-2" },
                    React.createElement("div", { className: "flex-1 space-y-1" },
                        React.createElement(input_1.Input, { value: link.label, onChange: function (e) { return update(function (d) { d.columns[ci].links[li].label = e.target.value; }); }, placeholder: "Link label", className: "h-7 text-sm" }),
                        React.createElement(input_1.Input, { value: link.href, onChange: function (e) { return update(function (d) { d.columns[ci].links[li].href = e.target.value; }); }, placeholder: "/path", className: "h-7 text-sm font-mono" })),
                    React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return update(function (d) { d.columns[ci].links.splice(li, 1); }); }, className: "text-red-500 hover:text-red-600 hover:bg-red-50 h-7 w-7 p-0 flex-shrink-0 mt-0.5" },
                        React.createElement(lucide_react_1.Minus, { className: "h-3.5 w-3.5" })))); }),
                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return update(function (d) { d.columns[ci].links.push({ label: "", href: "/" }); }); }, className: "gap-1.5 w-full border-dashed mt-2" },
                    React.createElement(lucide_react_1.Plus, { className: "h-3.5 w-3.5" }),
                    "Add Link")))); })),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "text-base" }, "Display Options"),
                React.createElement(card_1.CardDescription, null, "Control copyright text and optional footer sections")),
            React.createElement(card_1.CardContent, { className: "space-y-6" },
                React.createElement("div", { className: "space-y-2" },
                    React.createElement(label_1.Label, null, "Custom Copyright Text"),
                    React.createElement(input_1.Input, { value: (_a = current.copyrightText) !== null && _a !== void 0 ? _a : "", onChange: function (e) { return update(function (d) { d.copyrightText = e.target.value; }); }, placeholder: "\u00A9 " + new Date().getFullYear() + " Kiini. All rights reserved." }),
                    React.createElement("p", { className: "text-xs text-muted-foreground" }, "Leave empty to use the auto-generated default")),
                React.createElement("div", { className: "flex items-center gap-3" },
                    React.createElement(switch_1.Switch, { checked: (_b = current.showCloudPartners) !== null && _b !== void 0 ? _b : true, onCheckedChange: function (v) { return update(function (d) { d.showCloudPartners = v; }); } }),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, null, "Show Cloud Partners section"),
                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "AWS, Azure, Google Cloud, and other infrastructure partners"))),
                React.createElement("div", { className: "flex items-center gap-3" },
                    React.createElement(switch_1.Switch, { checked: (_c = current.showComplianceBadges) !== null && _c !== void 0 ? _c : true, onCheckedChange: function (v) { return update(function (d) { d.showComplianceBadges = v; }); } }),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, null, "Show Security & Compliance badges"),
                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "GDPR, SOC 2, Encryption, MFA badges")))))));
}
// ── About Content Tab ───────────────────────────────────────────────────
function AboutContentTab() {
    var utils = trpc_1.trpc.useUtils();
    var _a = trpc_1.trpc.websiteAdmin.getAboutContent.useQuery({}), content = _a.data, isLoading = _a.isLoading;
    var updateContent = trpc_1.trpc.websiteAdmin.updateAboutContent.useMutation({
        onSuccess: function () {
            utils.websiteAdmin.getAboutContent.invalidate();
            sonner_1.toast.success("About page content saved");
        },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var _b = react_1.useState({
        heroTitle: "",
        heroSubtitle: "",
        missionText: "",
        stats: [],
        values: [],
        milestones: [],
        team: []
    }), form = _b[0], setForm = _b[1];
    react_1.useEffect(function () {
        if (content) {
            setForm({
                heroTitle: content.heroTitle || "",
                heroSubtitle: content.heroSubtitle || "",
                missionText: content.missionText || "",
                stats: content.stats || [],
                values: content.values || [],
                milestones: content.milestones || [],
                team: content.team || []
            });
        }
    }, [content]);
    var save = function () { return updateContent.mutate(form); };
    if (isLoading)
        return React.createElement("div", { className: "flex items-center justify-center p-8" },
            React.createElement("span", { className: "animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" }));
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "flex items-center justify-between" },
            React.createElement("div", null,
                React.createElement("h3", { className: "text-lg font-semibold" }, "About Page Content"),
                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Manage the content displayed on the public About page")),
            React.createElement(button_1.Button, { onClick: save, disabled: updateContent.isPending }, updateContent.isPending ? "Saving..." : "Save Changes")),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "text-base" }, "Hero Section")),
            React.createElement(card_1.CardContent, { className: "space-y-4" },
                React.createElement("div", null,
                    React.createElement(label_1.Label, null, "Title"),
                    React.createElement(input_1.Input, { value: form.heroTitle, onChange: function (e) { return setForm(__assign(__assign({}, form), { heroTitle: e.target.value })); }, placeholder: "e.g. Our Story" })),
                React.createElement("div", null,
                    React.createElement(label_1.Label, null, "Subtitle"),
                    React.createElement(textarea_1.Textarea, { value: form.heroSubtitle, onChange: function (e) { return setForm(__assign(__assign({}, form), { heroSubtitle: e.target.value })); }, placeholder: "Short description under the hero title", rows: 3 })))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "text-base" }, "Mission Statement")),
            React.createElement(card_1.CardContent, null,
                React.createElement(textarea_1.Textarea, { value: form.missionText, onChange: function (e) { return setForm(__assign(__assign({}, form), { missionText: e.target.value })); }, placeholder: "Our mission is...", rows: 4 }))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between" },
                React.createElement(card_1.CardTitle, { className: "text-base" }, "Stats"),
                React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { return setForm(__assign(__assign({}, form), { stats: __spreadArrays(form.stats, [{ label: "", value: "" }]) })); } }, "+ Add Stat")),
            React.createElement(card_1.CardContent, { className: "space-y-3" },
                form.stats.map(function (s, i) { return (React.createElement("div", { key: i, className: "flex gap-2 items-end" },
                    React.createElement("div", { className: "flex-1" },
                        React.createElement(label_1.Label, null, "Label"),
                        React.createElement(input_1.Input, { value: s.label, onChange: function (e) { var ns = __spreadArrays(form.stats); ns[i] = __assign(__assign({}, ns[i]), { label: e.target.value }); setForm(__assign(__assign({}, form), { stats: ns })); }, placeholder: "e.g. Users" })),
                    React.createElement("div", { className: "w-32" },
                        React.createElement(label_1.Label, null, "Value"),
                        React.createElement(input_1.Input, { value: s.value, onChange: function (e) { var ns = __spreadArrays(form.stats); ns[i] = __assign(__assign({}, ns[i]), { value: e.target.value }); setForm(__assign(__assign({}, form), { stats: ns })); }, placeholder: "e.g. 5,000+" })),
                    React.createElement(button_1.Button, { size: "icon", variant: "ghost", className: "text-destructive", onClick: function () { return setForm(__assign(__assign({}, form), { stats: form.stats.filter(function (_, j) { return j !== i; }) })); } },
                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); }),
                form.stats.length === 0 && React.createElement("p", { className: "text-sm text-muted-foreground" }, "No stats added yet. Click \"+ Add Stat\" to begin."))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between" },
                React.createElement(card_1.CardTitle, { className: "text-base" }, "Company Values"),
                React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { return setForm(__assign(__assign({}, form), { values: __spreadArrays(form.values, [{ title: "", desc: "", icon: "Shield", color: "from-blue-500 to-blue-600" }]) })); } }, "+ Add Value")),
            React.createElement(card_1.CardContent, { className: "space-y-4" },
                form.values.map(function (v, i) { return (React.createElement("div", { key: i, className: "border rounded-lg p-3 space-y-2" },
                    React.createElement("div", { className: "flex gap-2" },
                        React.createElement("div", { className: "flex-1" },
                            React.createElement(label_1.Label, null, "Title"),
                            React.createElement(input_1.Input, { value: v.title, onChange: function (e) { var nv = __spreadArrays(form.values); nv[i] = __assign(__assign({}, nv[i]), { title: e.target.value }); setForm(__assign(__assign({}, form), { values: nv })); } })),
                        React.createElement("div", { className: "w-40" },
                            React.createElement(label_1.Label, null, "Icon name"),
                            React.createElement(input_1.Input, { value: v.icon, onChange: function (e) { var nv = __spreadArrays(form.values); nv[i] = __assign(__assign({}, nv[i]), { icon: e.target.value }); setForm(__assign(__assign({}, form), { values: nv })); }, placeholder: "Shield" })),
                        React.createElement(button_1.Button, { size: "icon", variant: "ghost", className: "text-destructive mt-5", onClick: function () { return setForm(__assign(__assign({}, form), { values: form.values.filter(function (_, j) { return j !== i; }) })); } },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, null, "Description"),
                        React.createElement(textarea_1.Textarea, { value: v.desc, onChange: function (e) { var nv = __spreadArrays(form.values); nv[i] = __assign(__assign({}, nv[i]), { desc: e.target.value }); setForm(__assign(__assign({}, form), { values: nv })); }, rows: 2 })),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, null, "Color gradient"),
                        React.createElement(input_1.Input, { value: v.color, onChange: function (e) { var nv = __spreadArrays(form.values); nv[i] = __assign(__assign({}, nv[i]), { color: e.target.value }); setForm(__assign(__assign({}, form), { values: nv })); }, placeholder: "from-blue-500 to-blue-600" })))); }),
                form.values.length === 0 && React.createElement("p", { className: "text-sm text-muted-foreground" }, "No values added yet."))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between" },
                React.createElement(card_1.CardTitle, { className: "text-base" }, "Timeline / Milestones"),
                React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { return setForm(__assign(__assign({}, form), { milestones: __spreadArrays(form.milestones, [{ year: "", event: "" }]) })); } }, "+ Add Milestone")),
            React.createElement(card_1.CardContent, { className: "space-y-3" },
                form.milestones.map(function (m, i) { return (React.createElement("div", { key: i, className: "flex gap-2 items-end" },
                    React.createElement("div", { className: "w-24" },
                        React.createElement(label_1.Label, null, "Year"),
                        React.createElement(input_1.Input, { value: m.year, onChange: function (e) { var nm = __spreadArrays(form.milestones); nm[i] = __assign(__assign({}, nm[i]), { year: e.target.value }); setForm(__assign(__assign({}, form), { milestones: nm })); }, placeholder: "2024" })),
                    React.createElement("div", { className: "flex-1" },
                        React.createElement(label_1.Label, null, "Event"),
                        React.createElement(input_1.Input, { value: m.event, onChange: function (e) { var nm = __spreadArrays(form.milestones); nm[i] = __assign(__assign({}, nm[i]), { event: e.target.value }); setForm(__assign(__assign({}, form), { milestones: nm })); }, placeholder: "What happened" })),
                    React.createElement(button_1.Button, { size: "icon", variant: "ghost", className: "text-destructive", onClick: function () { return setForm(__assign(__assign({}, form), { milestones: form.milestones.filter(function (_, j) { return j !== i; }) })); } },
                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); }),
                form.milestones.length === 0 && React.createElement("p", { className: "text-sm text-muted-foreground" }, "No milestones added yet."))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between" },
                React.createElement(card_1.CardTitle, { className: "text-base" }, "Team Members"),
                React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { return setForm(__assign(__assign({}, form), { team: __spreadArrays(form.team, [{ name: "", role: "", bio: "" }]) })); } }, "+ Add Member")),
            React.createElement(card_1.CardContent, { className: "space-y-4" },
                form.team.map(function (t, i) { return (React.createElement("div", { key: i, className: "border rounded-lg p-3 space-y-2" },
                    React.createElement("div", { className: "flex gap-2" },
                        React.createElement("div", { className: "flex-1" },
                            React.createElement(label_1.Label, null, "Name"),
                            React.createElement(input_1.Input, { value: t.name, onChange: function (e) { var nt = __spreadArrays(form.team); nt[i] = __assign(__assign({}, nt[i]), { name: e.target.value }); setForm(__assign(__assign({}, form), { team: nt })); } })),
                        React.createElement("div", { className: "flex-1" },
                            React.createElement(label_1.Label, null, "Role"),
                            React.createElement(input_1.Input, { value: t.role, onChange: function (e) { var nt = __spreadArrays(form.team); nt[i] = __assign(__assign({}, nt[i]), { role: e.target.value }); setForm(__assign(__assign({}, form), { team: nt })); } })),
                        React.createElement(button_1.Button, { size: "icon", variant: "ghost", className: "text-destructive mt-5", onClick: function () { return setForm(__assign(__assign({}, form), { team: form.team.filter(function (_, j) { return j !== i; }) })); } },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, null, "Bio"),
                        React.createElement(textarea_1.Textarea, { value: t.bio, onChange: function (e) { var nt = __spreadArrays(form.team); nt[i] = __assign(__assign({}, nt[i]), { bio: e.target.value }); setForm(__assign(__assign({}, form), { team: nt })); }, rows: 2 })))); }),
                form.team.length === 0 && React.createElement("p", { className: "text-sm text-muted-foreground" }, "No team members added yet.")))));
}
// ── Features Content Tab ────────────────────────────────────────────────
function FeaturesContentTab() {
    var utils = trpc_1.trpc.useUtils();
    var _a = trpc_1.trpc.websiteAdmin.getFeaturesContent.useQuery({}), content = _a.data, isLoading = _a.isLoading;
    var updateContent = trpc_1.trpc.websiteAdmin.updateFeaturesContent.useMutation({
        onSuccess: function () {
            utils.websiteAdmin.getFeaturesContent.invalidate();
            sonner_1.toast.success("Features page content saved");
        },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var _b = react_1.useState({
        heroTitle: "",
        heroBadge: "",
        heroSubtitle: "",
        sections: [],
        pillars: []
    }), form = _b[0], setForm = _b[1];
    react_1.useEffect(function () {
        if (content) {
            setForm({
                heroTitle: content.heroTitle || "",
                heroBadge: content.heroBadge || "",
                heroSubtitle: content.heroSubtitle || "",
                sections: content.sections || [],
                pillars: content.pillars || []
            });
        }
    }, [content]);
    var save = function () { return updateContent.mutate(form); };
    if (isLoading)
        return React.createElement("div", { className: "flex items-center justify-center p-8" },
            React.createElement("span", { className: "animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" }));
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "flex items-center justify-between" },
            React.createElement("div", null,
                React.createElement("h3", { className: "text-lg font-semibold" }, "Features Page Content"),
                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Manage modules and platform pillars displayed on the public Features page")),
            React.createElement(button_1.Button, { onClick: save, disabled: updateContent.isPending }, updateContent.isPending ? "Saving..." : "Save Changes")),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "text-base" }, "Hero Section")),
            React.createElement(card_1.CardContent, { className: "space-y-4" },
                React.createElement("div", null,
                    React.createElement(label_1.Label, null, "Badge Text"),
                    React.createElement(input_1.Input, { value: form.heroBadge, onChange: function (e) { return setForm(__assign(__assign({}, form), { heroBadge: e.target.value })); }, placeholder: "e.g. All-in-One Platform" })),
                React.createElement("div", null,
                    React.createElement(label_1.Label, null, "Title"),
                    React.createElement(input_1.Input, { value: form.heroTitle, onChange: function (e) { return setForm(__assign(__assign({}, form), { heroTitle: e.target.value })); }, placeholder: "e.g. Everything your team needs" })),
                React.createElement("div", null,
                    React.createElement(label_1.Label, null, "Subtitle"),
                    React.createElement(textarea_1.Textarea, { value: form.heroSubtitle, onChange: function (e) { return setForm(__assign(__assign({}, form), { heroSubtitle: e.target.value })); }, placeholder: "Short description", rows: 3 })))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between" },
                React.createElement(card_1.CardTitle, { className: "text-base" }, "Feature Sections"),
                React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { return setForm(__assign(__assign({}, form), { sections: __spreadArrays(form.sections, [{ category: "", desc: "", icon: "Users", features: [] }]) })); } }, "+ Add Section")),
            React.createElement(card_1.CardContent, { className: "space-y-4" },
                form.sections.map(function (sec, i) { return (React.createElement("div", { key: i, className: "border rounded-lg p-4 space-y-3" },
                    React.createElement("div", { className: "flex gap-2 items-start" },
                        React.createElement("div", { className: "flex-1" },
                            React.createElement(label_1.Label, null, "Category"),
                            React.createElement(input_1.Input, { value: sec.category, onChange: function (e) { var ns = __spreadArrays(form.sections); ns[i] = __assign(__assign({}, ns[i]), { category: e.target.value }); setForm(__assign(__assign({}, form), { sections: ns })); }, placeholder: "e.g. CRM & Sales" })),
                        React.createElement("div", { className: "w-36" },
                            React.createElement(label_1.Label, null, "Icon name"),
                            React.createElement(input_1.Input, { value: sec.icon, onChange: function (e) { var ns = __spreadArrays(form.sections); ns[i] = __assign(__assign({}, ns[i]), { icon: e.target.value }); setForm(__assign(__assign({}, form), { sections: ns })); }, placeholder: "Users" })),
                        React.createElement(button_1.Button, { size: "icon", variant: "ghost", className: "text-destructive mt-5", onClick: function () { return setForm(__assign(__assign({}, form), { sections: form.sections.filter(function (_, j) { return j !== i; }) })); } },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, null, "Description"),
                        React.createElement(textarea_1.Textarea, { value: sec.desc, onChange: function (e) { var ns = __spreadArrays(form.sections); ns[i] = __assign(__assign({}, ns[i]), { desc: e.target.value }); setForm(__assign(__assign({}, form), { sections: ns })); }, rows: 2 })),
                    React.createElement("div", null,
                        React.createElement("div", { className: "flex items-center justify-between mb-1" },
                            React.createElement(label_1.Label, null, "Features (one per line)")),
                        React.createElement(textarea_1.Textarea, { value: sec.features.join("\n"), onChange: function (e) { var ns = __spreadArrays(form.sections); ns[i] = __assign(__assign({}, ns[i]), { features: e.target.value.split("\n") }); setForm(__assign(__assign({}, form), { sections: ns })); }, rows: 5, placeholder: "Feature 1\nFeature 2\nFeature 3" })))); }),
                form.sections.length === 0 && React.createElement("p", { className: "text-sm text-muted-foreground" }, "No feature sections added yet. Click \"+ Add Section\" to begin."))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between" },
                React.createElement(card_1.CardTitle, { className: "text-base" }, "Platform Pillars"),
                React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { return setForm(__assign(__assign({}, form), { pillars: __spreadArrays(form.pillars, [{ title: "", desc: "", icon: "Shield" }]) })); } }, "+ Add Pillar")),
            React.createElement(card_1.CardContent, { className: "space-y-3" },
                form.pillars.map(function (p, i) { return (React.createElement("div", { key: i, className: "flex gap-2 items-end" },
                    React.createElement("div", { className: "flex-1" },
                        React.createElement(label_1.Label, null, "Title"),
                        React.createElement(input_1.Input, { value: p.title, onChange: function (e) { var np = __spreadArrays(form.pillars); np[i] = __assign(__assign({}, np[i]), { title: e.target.value }); setForm(__assign(__assign({}, form), { pillars: np })); } })),
                    React.createElement("div", { className: "flex-1" },
                        React.createElement(label_1.Label, null, "Description"),
                        React.createElement(input_1.Input, { value: p.desc, onChange: function (e) { var np = __spreadArrays(form.pillars); np[i] = __assign(__assign({}, np[i]), { desc: e.target.value }); setForm(__assign(__assign({}, form), { pillars: np })); } })),
                    React.createElement("div", { className: "w-28" },
                        React.createElement(label_1.Label, null, "Icon"),
                        React.createElement(input_1.Input, { value: p.icon, onChange: function (e) { var np = __spreadArrays(form.pillars); np[i] = __assign(__assign({}, np[i]), { icon: e.target.value }); setForm(__assign(__assign({}, form), { pillars: np })); } })),
                    React.createElement(button_1.Button, { size: "icon", variant: "ghost", className: "text-destructive", onClick: function () { return setForm(__assign(__assign({}, form), { pillars: form.pillars.filter(function (_, j) { return j !== i; }) })); } },
                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); }),
                form.pillars.length === 0 && React.createElement("p", { className: "text-sm text-muted-foreground" }, "No pillars added yet.")))));
}
// ── Testimonials Tab ─────────────────────────────────────────────────
function TestimonialsTab() {
    var _a = trpc_1.trpc.websiteAdmin.getTestimonials.useQuery({}), data = _a.data, refetch = _a.refetch;
    var updateMut = trpc_1.trpc.websiteAdmin.updateTestimonials.useMutation({ onSuccess: function () { refetch(); sonner_1.toast.success("Testimonials saved"); } });
    var _b = react_1.useState([]), items = _b[0], setItems = _b[1];
    react_1.useEffect(function () { if (data)
        setItems(data); }, [data]);
    var addItem = function () {
        setItems(__spreadArrays(items, [{ id: "t_" + Date.now(), name: "", role: "", company: "", content: "", rating: 5, isVisible: true, avatarUrl: "" }]));
    };
    var remove = function (i) { return setItems(items.filter(function (_, j) { return j !== i; })); };
    var update = function (i, field, val) {
        var _a;
        var n = __spreadArrays(items);
        n[i] = __assign(__assign({}, n[i]), (_a = {}, _a[field] = val, _a));
        setItems(n);
    };
    return (React.createElement("div", { className: "space-y-4" },
        React.createElement("div", { className: "flex items-center justify-between" },
            React.createElement("h3", { className: "text-lg font-semibold" }, "Testimonials Management"),
            React.createElement("div", { className: "flex gap-2" },
                React.createElement(button_1.Button, { variant: "outline", onClick: addItem },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                    "Add Testimonial"),
                React.createElement(button_1.Button, { onClick: function () { return updateMut.mutate(items); }, disabled: updateMut.isPending },
                    React.createElement(lucide_react_1.Save, { className: "h-4 w-4 mr-1" }),
                    "Save All"))),
        items.map(function (item, i) { return (React.createElement(card_1.Card, { key: item.id },
            React.createElement(card_1.CardContent, { className: "pt-4 space-y-3" },
                React.createElement("div", { className: "flex gap-3" },
                    React.createElement("div", { className: "flex-1" },
                        React.createElement(label_1.Label, null, "Name"),
                        React.createElement(input_1.Input, { value: item.name, onChange: function (e) { return update(i, "name", e.target.value); } })),
                    React.createElement("div", { className: "flex-1" },
                        React.createElement(label_1.Label, null, "Role"),
                        React.createElement(input_1.Input, { value: item.role || "", onChange: function (e) { return update(i, "role", e.target.value); } })),
                    React.createElement("div", { className: "flex-1" },
                        React.createElement(label_1.Label, null, "Company"),
                        React.createElement(input_1.Input, { value: item.company || "", onChange: function (e) { return update(i, "company", e.target.value); } }))),
                React.createElement("div", null,
                    React.createElement(label_1.Label, null, "Testimonial"),
                    React.createElement(textarea_1.Textarea, { value: item.content, onChange: function (e) { return update(i, "content", e.target.value); }, rows: 3 })),
                React.createElement("div", { className: "flex gap-3 items-end" },
                    React.createElement("div", { className: "w-24" },
                        React.createElement(label_1.Label, null, "Rating"),
                        React.createElement(input_1.Input, { type: "number", min: 1, max: 5, value: item.rating, onChange: function (e) { return update(i, "rating", parseInt(e.target.value) || 5); } })),
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement(switch_1.Switch, { checked: item.isVisible, onCheckedChange: function (v) { return update(i, "isVisible", v); } }),
                        React.createElement(label_1.Label, null, "Visible")),
                    React.createElement(button_1.Button, { size: "icon", variant: "ghost", className: "text-destructive ml-auto", onClick: function () { return remove(i); } },
                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))))); }),
        items.length === 0 && React.createElement(card_1.Card, null,
            React.createElement(card_1.CardContent, { className: "py-8 text-center text-muted-foreground" }, "No testimonials yet. Click \"Add Testimonial\" to get started."))));
}
// ── FAQ Tab ──────────────────────────────────────────────────────────
function FAQTab() {
    var _a = trpc_1.trpc.websiteAdmin.getFAQs.useQuery({}), data = _a.data, refetch = _a.refetch;
    var updateMut = trpc_1.trpc.websiteAdmin.updateFAQs.useMutation({ onSuccess: function () { refetch(); sonner_1.toast.success("FAQs saved"); } });
    var _b = react_1.useState([]), items = _b[0], setItems = _b[1];
    react_1.useEffect(function () { if (data)
        setItems(data); }, [data]);
    var addItem = function () {
        setItems(__spreadArrays(items, [{ id: "faq_" + Date.now(), question: "", answer: "", category: "General", order: items.length, isVisible: true }]));
    };
    var remove = function (i) { return setItems(items.filter(function (_, j) { return j !== i; })); };
    var update = function (i, field, val) {
        var _a;
        var n = __spreadArrays(items);
        n[i] = __assign(__assign({}, n[i]), (_a = {}, _a[field] = val, _a));
        setItems(n);
    };
    return (React.createElement("div", { className: "space-y-4" },
        React.createElement("div", { className: "flex items-center justify-between" },
            React.createElement("h3", { className: "text-lg font-semibold" }, "FAQ Management"),
            React.createElement("div", { className: "flex gap-2" },
                React.createElement(button_1.Button, { variant: "outline", onClick: addItem },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                    "Add FAQ"),
                React.createElement(button_1.Button, { onClick: function () { return updateMut.mutate(items); }, disabled: updateMut.isPending },
                    React.createElement(lucide_react_1.Save, { className: "h-4 w-4 mr-1" }),
                    "Save All"))),
        items.map(function (item, i) { return (React.createElement(card_1.Card, { key: item.id },
            React.createElement(card_1.CardContent, { className: "pt-4 space-y-3" },
                React.createElement("div", { className: "flex gap-3" },
                    React.createElement("div", { className: "flex-1" },
                        React.createElement(label_1.Label, null, "Question"),
                        React.createElement(input_1.Input, { value: item.question, onChange: function (e) { return update(i, "question", e.target.value); } })),
                    React.createElement("div", { className: "w-40" },
                        React.createElement(label_1.Label, null, "Category"),
                        React.createElement(input_1.Input, { value: item.category || "", onChange: function (e) { return update(i, "category", e.target.value); } })),
                    React.createElement("div", { className: "w-20" },
                        React.createElement(label_1.Label, null, "Order"),
                        React.createElement(input_1.Input, { type: "number", value: item.order, onChange: function (e) { return update(i, "order", parseInt(e.target.value) || 0); } }))),
                React.createElement("div", null,
                    React.createElement(label_1.Label, null, "Answer"),
                    React.createElement(textarea_1.Textarea, { value: item.answer, onChange: function (e) { return update(i, "answer", e.target.value); }, rows: 3 })),
                React.createElement("div", { className: "flex items-center gap-2 justify-between" },
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement(switch_1.Switch, { checked: item.isVisible, onCheckedChange: function (v) { return update(i, "isVisible", v); } }),
                        React.createElement(label_1.Label, null, "Visible")),
                    React.createElement(button_1.Button, { size: "icon", variant: "ghost", className: "text-destructive", onClick: function () { return remove(i); } },
                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))))); }),
        items.length === 0 && React.createElement(card_1.Card, null,
            React.createElement(card_1.CardContent, { className: "py-8 text-center text-muted-foreground" }, "No FAQs yet. Click \"Add FAQ\" to get started."))));
}
// ── Blog Tab ─────────────────────────────────────────────────────────
function BlogTab() {
    var _a = trpc_1.trpc.websiteAdmin.getBlogPosts.useQuery({}), data = _a.data, refetch = _a.refetch;
    var updateMut = trpc_1.trpc.websiteAdmin.updateBlogPosts.useMutation({ onSuccess: function () { refetch(); sonner_1.toast.success("Blog posts saved"); } });
    var _b = react_1.useState([]), posts = _b[0], setPosts = _b[1];
    var _c = react_1.useState(null), editing = _c[0], setEditing = _c[1];
    react_1.useEffect(function () { if (data)
        setPosts(data); }, [data]);
    var addPost = function () {
        var id = "post_" + Date.now();
        var newPost = {
            id: id,
            title: "", slug: "", excerpt: "", content: "", author: "", category: "General",
            tags: [], coverImageUrl: "", isPublished: false, publishedAt: "", createdAt: new Date().toISOString()
        };
        setPosts(__spreadArrays([newPost], posts));
        setEditing(id);
    };
    var remove = function (i) { return setPosts(posts.filter(function (_, j) { return j !== i; })); };
    var update = function (i, field, val) {
        var _a;
        var n = __spreadArrays(posts);
        n[i] = __assign(__assign({}, n[i]), (_a = {}, _a[field] = val, _a));
        setPosts(n);
    };
    var autoSlug = function (i, title) {
        update(i, "title", title);
        update(i, "slug", title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    };
    return (React.createElement("div", { className: "space-y-4" },
        React.createElement("div", { className: "flex items-center justify-between" },
            React.createElement("h3", { className: "text-lg font-semibold" }, "Blog Management"),
            React.createElement("div", { className: "flex gap-2" },
                React.createElement(button_1.Button, { variant: "outline", onClick: addPost },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                    "New Post"),
                React.createElement(button_1.Button, { onClick: function () { return updateMut.mutate(posts); }, disabled: updateMut.isPending },
                    React.createElement(lucide_react_1.Save, { className: "h-4 w-4 mr-1" }),
                    "Save All"))),
        posts.map(function (post, i) { return (React.createElement(card_1.Card, { key: post.id },
            React.createElement(card_1.CardHeader, { className: "cursor-pointer pb-2", onClick: function () { return setEditing(editing === post.id ? null : post.id); } },
                React.createElement("div", { className: "flex items-center justify-between" },
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement(card_1.CardTitle, { className: "text-base" }, post.title || "Untitled Post"),
                        React.createElement(badge_1.Badge, { variant: post.isPublished ? "default" : "secondary" }, post.isPublished ? "Published" : "Draft")),
                    editing === post.id ? React.createElement(lucide_react_1.ChevronUp, { className: "h-4 w-4" }) : React.createElement(lucide_react_1.ChevronDown, { className: "h-4 w-4" }))),
            editing === post.id && (React.createElement(card_1.CardContent, { className: "space-y-3" },
                React.createElement("div", { className: "flex gap-3" },
                    React.createElement("div", { className: "flex-1" },
                        React.createElement(label_1.Label, null, "Title"),
                        React.createElement(input_1.Input, { value: post.title, onChange: function (e) { return autoSlug(i, e.target.value); } })),
                    React.createElement("div", { className: "flex-1" },
                        React.createElement(label_1.Label, null, "Slug"),
                        React.createElement(input_1.Input, { value: post.slug, onChange: function (e) { return update(i, "slug", e.target.value); } }))),
                React.createElement("div", { className: "flex gap-3" },
                    React.createElement("div", { className: "flex-1" },
                        React.createElement(label_1.Label, null, "Author"),
                        React.createElement(input_1.Input, { value: post.author || "", onChange: function (e) { return update(i, "author", e.target.value); } })),
                    React.createElement("div", { className: "flex-1" },
                        React.createElement(label_1.Label, null, "Category"),
                        React.createElement(input_1.Input, { value: post.category || "", onChange: function (e) { return update(i, "category", e.target.value); } }))),
                React.createElement("div", null,
                    React.createElement(label_1.Label, null, "Excerpt"),
                    React.createElement(textarea_1.Textarea, { value: post.excerpt || "", onChange: function (e) { return update(i, "excerpt", e.target.value); }, rows: 2 })),
                React.createElement("div", null,
                    React.createElement(label_1.Label, null, "Content"),
                    React.createElement(textarea_1.Textarea, { value: post.content, onChange: function (e) { return update(i, "content", e.target.value); }, rows: 10 })),
                React.createElement("div", null,
                    React.createElement(label_1.Label, null, "Tags (comma-separated)"),
                    React.createElement(input_1.Input, { value: (post.tags || []).join(", "), onChange: function (e) { return update(i, "tags", e.target.value.split(",").map(function (t) { return t.trim(); }).filter(Boolean)); } })),
                React.createElement("div", { className: "flex gap-3 items-end" },
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement(switch_1.Switch, { checked: post.isPublished, onCheckedChange: function (v) { update(i, "isPublished", v); if (v && !post.publishedAt)
                                update(i, "publishedAt", new Date().toISOString()); } }),
                        React.createElement(label_1.Label, null, "Published")),
                    React.createElement(button_1.Button, { size: "icon", variant: "ghost", className: "text-destructive ml-auto", onClick: function () { return remove(i); } },
                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))))))); }),
        posts.length === 0 && React.createElement(card_1.Card, null,
            React.createElement(card_1.CardContent, { className: "py-8 text-center text-muted-foreground" }, "No blog posts. Click \"New Post\" to create your first article."))));
}
// ── Hero Tab ─────────────────────────────────────────────────────────
function HeroTab() {
    var _a = trpc_1.trpc.websiteAdmin.getHeroContent.useQuery({}), data = _a.data, refetch = _a.refetch;
    var updateMut = trpc_1.trpc.websiteAdmin.updateHeroContent.useMutation({ onSuccess: function () { refetch(); sonner_1.toast.success("Hero content saved"); } });
    var _b = react_1.useState({
        badge: "", title: "", subtitle: "",
        ctaPrimary: { label: "Get Started", href: "/signup" },
        ctaSecondary: { label: "Watch Demo", href: "/demo" },
        stats: []
    }), form = _b[0], setForm = _b[1];
    react_1.useEffect(function () {
        if (data)
            setForm({
                badge: data.badge || "",
                title: data.title || "",
                subtitle: data.subtitle || "",
                ctaPrimary: data.ctaPrimary || { label: "Get Started", href: "/signup" },
                ctaSecondary: data.ctaSecondary || { label: "Watch Demo", href: "/demo" },
                stats: data.stats || []
            });
    }, [data]);
    return (React.createElement("div", { className: "space-y-4" },
        React.createElement("div", { className: "flex items-center justify-between" },
            React.createElement("h3", { className: "text-lg font-semibold" }, "Landing Page Hero"),
            React.createElement(button_1.Button, { onClick: function () { return updateMut.mutate(form); }, disabled: updateMut.isPending },
                React.createElement(lucide_react_1.Save, { className: "h-4 w-4 mr-1" }),
                "Save")),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardContent, { className: "pt-4 space-y-3" },
                React.createElement("div", null,
                    React.createElement(label_1.Label, null, "Badge Text"),
                    React.createElement(input_1.Input, { value: form.badge, onChange: function (e) { return setForm(__assign(__assign({}, form), { badge: e.target.value })); }, placeholder: "e.g. Kiini CRM Platform" })),
                React.createElement("div", null,
                    React.createElement(label_1.Label, null, "Title"),
                    React.createElement(textarea_1.Textarea, { value: form.title, onChange: function (e) { return setForm(__assign(__assign({}, form), { title: e.target.value })); }, rows: 2, placeholder: "Main hero headline" })),
                React.createElement("div", null,
                    React.createElement(label_1.Label, null, "Subtitle"),
                    React.createElement(textarea_1.Textarea, { value: form.subtitle, onChange: function (e) { return setForm(__assign(__assign({}, form), { subtitle: e.target.value })); }, rows: 2, placeholder: "Supporting text" })))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "text-base" }, "CTA Buttons")),
            React.createElement(card_1.CardContent, { className: "space-y-3" },
                React.createElement("div", { className: "flex gap-3" },
                    React.createElement("div", { className: "flex-1" },
                        React.createElement(label_1.Label, null, "Primary Label"),
                        React.createElement(input_1.Input, { value: form.ctaPrimary.label, onChange: function (e) { return setForm(__assign(__assign({}, form), { ctaPrimary: __assign(__assign({}, form.ctaPrimary), { label: e.target.value }) })); } })),
                    React.createElement("div", { className: "flex-1" },
                        React.createElement(label_1.Label, null, "Primary Href"),
                        React.createElement(input_1.Input, { value: form.ctaPrimary.href, onChange: function (e) { return setForm(__assign(__assign({}, form), { ctaPrimary: __assign(__assign({}, form.ctaPrimary), { href: e.target.value }) })); } }))),
                React.createElement("div", { className: "flex gap-3" },
                    React.createElement("div", { className: "flex-1" },
                        React.createElement(label_1.Label, null, "Secondary Label"),
                        React.createElement(input_1.Input, { value: form.ctaSecondary.label, onChange: function (e) { return setForm(__assign(__assign({}, form), { ctaSecondary: __assign(__assign({}, form.ctaSecondary), { label: e.target.value }) })); } })),
                    React.createElement("div", { className: "flex-1" },
                        React.createElement(label_1.Label, null, "Secondary Href"),
                        React.createElement(input_1.Input, { value: form.ctaSecondary.href, onChange: function (e) { return setForm(__assign(__assign({}, form), { ctaSecondary: __assign(__assign({}, form.ctaSecondary), { href: e.target.value }) })); } }))))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between" },
                React.createElement(card_1.CardTitle, { className: "text-base" }, "Stats"),
                React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { return setForm(__assign(__assign({}, form), { stats: __spreadArrays(form.stats, [{ label: "", value: "" }]) })); } }, "+ Add Stat")),
            React.createElement(card_1.CardContent, { className: "space-y-2" },
                form.stats.map(function (s, i) { return (React.createElement("div", { key: i, className: "flex gap-2 items-end" },
                    React.createElement("div", { className: "flex-1" },
                        React.createElement(label_1.Label, null, "Value"),
                        React.createElement(input_1.Input, { value: s.value, onChange: function (e) { var ns = __spreadArrays(form.stats); ns[i] = __assign(__assign({}, ns[i]), { value: e.target.value }); setForm(__assign(__assign({}, form), { stats: ns })); }, placeholder: "10,000+" })),
                    React.createElement("div", { className: "flex-1" },
                        React.createElement(label_1.Label, null, "Label"),
                        React.createElement(input_1.Input, { value: s.label, onChange: function (e) { var ns = __spreadArrays(form.stats); ns[i] = __assign(__assign({}, ns[i]), { label: e.target.value }); setForm(__assign(__assign({}, form), { stats: ns })); }, placeholder: "Active Users" })),
                    React.createElement(button_1.Button, { size: "icon", variant: "ghost", className: "text-destructive", onClick: function () { return setForm(__assign(__assign({}, form), { stats: form.stats.filter(function (_, j) { return j !== i; }) })); } },
                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); }),
                form.stats.length === 0 && React.createElement("p", { className: "text-sm text-muted-foreground" }, "No stats added yet.")))));
}
