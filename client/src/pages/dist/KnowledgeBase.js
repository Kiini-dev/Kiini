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
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var textarea_1 = require("@/components/ui/textarea");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var label_1 = require("@/components/ui/label");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var sonner_1 = require("sonner");
function KnowledgeBase() {
    var _a = react_1.useState(""), search = _a[0], setSearch = _a[1];
    var _b = react_1.useState(null), activeCategory = _b[0], setActiveCategory = _b[1];
    var _c = react_1.useState(null), activeArticleId = _c[0], setActiveArticleId = _c[1];
    var _d = react_1.useState(false), showCreateCategory = _d[0], setShowCreateCategory = _d[1];
    var _e = react_1.useState(false), showCreateArticle = _e[0], setShowCreateArticle = _e[1];
    var _search = wouter_1.useSearch();
    react_1.useEffect(function () { if (new URLSearchParams(_search).get("action") === "create")
        setShowCreateArticle(true); }, []);
    var _f = react_1.useState(null), editingCategory = _f[0], setEditingCategory = _f[1];
    var _g = react_1.useState(null), editingArticle = _g[0], setEditingArticle = _g[1];
    // Form state
    var _h = react_1.useState({ name: "", slug: "", description: "", icon: "BookOpen", color: "bg-blue-500" }), catForm = _h[0], setCatForm = _h[1];
    var _j = react_1.useState({ title: "", categoryId: "", content: "", excerpt: "", status: "published", featured: false, readTime: 3, tags: "" }), artForm = _j[0], setArtForm = _j[1];
    // tRPC queries
    var utils = trpc_1.trpc.useUtils();
    var _k = trpc_1.trpc.knowledgeBase.listCategories.useQuery(), _l = _k.data, rawCategories = _l === void 0 ? [] : _l, catsLoading = _k.isLoading;
    var _m = trpc_1.trpc.knowledgeBase.listArticles.useQuery(activeCategory ? { categoryId: activeCategory } : {}), _o = _m.data, rawArticles = _o === void 0 ? [] : _o, artsLoading = _m.isLoading;
    var _p = trpc_1.trpc.knowledgeBase.listArticles.useQuery({}).data, rawAllArticles = _p === void 0 ? [] : _p;
    var rawArticleDetail = trpc_1.trpc.knowledgeBase.getArticle.useQuery({ id: activeArticleId }, { enabled: !!activeArticleId }).data;
    var categories = JSON.parse(JSON.stringify(rawCategories));
    var articles = JSON.parse(JSON.stringify(rawArticles));
    var allArticles = JSON.parse(JSON.stringify(rawAllArticles));
    var articleDetail = rawArticleDetail ? JSON.parse(JSON.stringify(rawArticleDetail)) : null;
    // Mutations
    var createCategory = trpc_1.trpc.knowledgeBase.createCategory.useMutation({ onSuccess: function () { utils.knowledgeBase.listCategories.invalidate(); sonner_1.toast.success("Category created"); setShowCreateCategory(false); } });
    var updateCategory = trpc_1.trpc.knowledgeBase.updateCategory.useMutation({ onSuccess: function () { utils.knowledgeBase.listCategories.invalidate(); sonner_1.toast.success("Category updated"); setEditingCategory(null); } });
    var deleteCategory = trpc_1.trpc.knowledgeBase.deleteCategory.useMutation({ onSuccess: function () { utils.knowledgeBase.listCategories.invalidate(); utils.knowledgeBase.listArticles.invalidate(); sonner_1.toast.success("Category deleted"); } });
    var createArticle = trpc_1.trpc.knowledgeBase.createArticle.useMutation({ onSuccess: function () { utils.knowledgeBase.listArticles.invalidate(); sonner_1.toast.success("Article created"); setShowCreateArticle(false); } });
    var updateArticle = trpc_1.trpc.knowledgeBase.updateArticle.useMutation({ onSuccess: function () { utils.knowledgeBase.listArticles.invalidate(); utils.knowledgeBase.getArticle.invalidate(); sonner_1.toast.success("Article updated"); setEditingArticle(null); } });
    var deleteArticle = trpc_1.trpc.knowledgeBase.deleteArticle.useMutation({ onSuccess: function () { utils.knowledgeBase.listArticles.invalidate(); sonner_1.toast.success("Article deleted"); } });
    var isLoading = catsLoading || artsLoading;
    var featuredArticles = react_1.useMemo(function () { return allArticles.filter(function (a) { return a.featured; }).slice(0, 6); }, [allArticles]);
    var searchResults = react_1.useMemo(function () {
        if (!search.trim())
            return [];
        var q = search.toLowerCase();
        return allArticles.filter(function (a) { return a.title.toLowerCase().includes(q); });
    }, [search, allArticles]);
    var displayCategory = activeCategory ? categories.find(function (c) { return c.id === activeCategory; }) : null;
    var categoryArticles = react_1.useMemo(function () {
        if (!activeCategory)
            return [];
        return articles;
    }, [activeCategory, articles]);
    var getCategoryArticleCount = function (catId) { return allArticles.filter(function (a) { return a.categoryId === catId; }).length; };
    // Article detail view
    if (activeArticleId && articleDetail) {
        var cat = categories.find(function (c) { return c.id === articleDetail.categoryId; });
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Knowledge Base", description: "Help guides and documentation", icon: React.createElement(lucide_react_1.BookOpen, { className: "h-5 w-5" }) },
            React.createElement("div", { className: "max-w-3xl mx-auto" },
                React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "gap-1 mb-4 -ml-2", onClick: function () { return setActiveArticleId(null); } },
                    React.createElement(lucide_react_1.ChevronRight, { className: "h-4 w-4 rotate-180" }),
                    " Back"),
                React.createElement("div", { className: "border rounded-lg p-8 bg-card" },
                    React.createElement("div", { className: "flex items-center justify-between mb-3" },
                        React.createElement("div", { className: "flex items-center gap-2 text-xs text-muted-foreground" },
                            React.createElement(lucide_react_1.Clock, { className: "h-3 w-3" }),
                            " ",
                            articleDetail.readTime || 3,
                            " min read",
                            React.createElement("span", null, "\u00B7"),
                            React.createElement(lucide_react_1.Eye, { className: "h-3 w-3" }),
                            " ",
                            (articleDetail.views || 0).toLocaleString(),
                            " views",
                            articleDetail.featured && React.createElement(React.Fragment, null,
                                React.createElement("span", null, "\u00B7"),
                                React.createElement(lucide_react_1.Star, { className: "h-3 w-3 text-amber-400 fill-amber-400" }))),
                        React.createElement("div", { className: "flex gap-1" },
                            React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: function () {
                                    setEditingArticle(articleDetail);
                                    setArtForm({ title: articleDetail.title, categoryId: articleDetail.categoryId, content: articleDetail.content || "", excerpt: articleDetail.excerpt || "", status: articleDetail.status || "published", featured: !!articleDetail.featured, readTime: articleDetail.readTime || 3, tags: articleDetail.tags || "" });
                                } },
                                React.createElement(lucide_react_1.Pencil, { className: "h-3 w-3" })),
                            React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-destructive", onClick: function () {
                                    if (confirm("Delete this article?")) {
                                        deleteArticle.mutate({ id: articleDetail.id });
                                        setActiveArticleId(null);
                                    }
                                } },
                                React.createElement(lucide_react_1.Trash2, { className: "h-3 w-3" })))),
                    cat && React.createElement(badge_1.Badge, { variant: "secondary", className: "mb-3" }, cat.name),
                    React.createElement("h1", { className: "text-2xl font-bold mb-4" }, articleDetail.title),
                    articleDetail.excerpt && React.createElement("p", { className: "text-muted-foreground mb-4 italic" }, articleDetail.excerpt),
                    React.createElement("div", { className: "prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap" }, articleDetail.content || "This article is currently being authored. Check back soon for the full guide."),
                    articleDetail.tags && (React.createElement("div", { className: "flex gap-1 mt-4 flex-wrap" }, articleDetail.tags.split(",").map(function (t) { return React.createElement(badge_1.Badge, { key: t.trim(), variant: "outline", className: "text-xs" }, t.trim()); })))))));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Knowledge Base", description: "Help guides, tutorials, and documentation for Kiini", icon: React.createElement(lucide_react_1.BookOpen, { className: "h-5 w-5" }), actions: React.createElement("div", { className: "flex gap-2" },
            React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { setCatForm({ name: "", slug: "", description: "", icon: "BookOpen", color: "bg-blue-500" }); setShowCreateCategory(true); } },
                React.createElement(lucide_react_1.FolderPlus, { className: "h-4 w-4 mr-1" }),
                " Category"),
            React.createElement(button_1.Button, { size: "sm", onClick: function () { var _a; setArtForm({ title: "", categoryId: ((_a = categories[0]) === null || _a === void 0 ? void 0 : _a.id) || "", content: "", excerpt: "", status: "published", featured: false, readTime: 3, tags: "" }); setShowCreateArticle(true); } },
                React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                " Article")) },
        isLoading ? (React.createElement("div", { className: "flex items-center justify-center py-20" },
            React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }))) : (React.createElement(React.Fragment, null,
            React.createElement("div", { className: "max-w-xl mx-auto mb-8 mt-2" },
                React.createElement("div", { className: "relative" },
                    React.createElement(lucide_react_1.Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" }),
                    React.createElement(input_1.Input, { className: "pl-12 h-12 text-base rounded-full border-2 focus-visible:ring-2", placeholder: "Search articles, guides, documentation...", value: search, onChange: function (e) { return setSearch(e.target.value); } })),
                searchResults.length > 0 && (React.createElement("div", { className: "border rounded-xl mt-2 bg-popover shadow-md overflow-hidden" }, searchResults.slice(0, 8).map(function (a) { return (React.createElement("button", { key: a.id, onClick: function () { setSearch(""); setActiveArticleId(a.id); }, className: "w-full flex items-center justify-between px-4 py-3 hover:bg-muted/60 text-left transition-colors border-b last:border-0" },
                    React.createElement("span", { className: "text-sm" }, a.title),
                    React.createElement("span", { className: "text-xs text-muted-foreground ml-4 shrink-0 flex items-center gap-1" },
                        React.createElement(lucide_react_1.Clock, { className: "h-3 w-3" }),
                        " ",
                        a.readTime || 3,
                        "m"))); })))),
            displayCategory ? (React.createElement(React.Fragment, null,
                React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "gap-1 mb-4 -ml-2", onClick: function () { return setActiveCategory(null); } },
                    React.createElement(lucide_react_1.ChevronRight, { className: "h-4 w-4 rotate-180" }),
                    " All Categories"),
                React.createElement("div", { className: "flex items-center justify-between mb-5" },
                    React.createElement("div", { className: "flex items-center gap-3" },
                        React.createElement("div", { className: utils_1.cn("p-3 rounded-xl text-white", displayCategory.color || "bg-blue-500") },
                            React.createElement(lucide_react_1.BookOpen, { className: "h-5 w-5" })),
                        React.createElement("div", null,
                            React.createElement("h2", { className: "text-xl font-bold" }, displayCategory.name),
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, displayCategory.description))),
                    React.createElement("div", { className: "flex gap-1" },
                        React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: function () {
                                setEditingCategory(displayCategory);
                                setCatForm({ name: displayCategory.name, slug: displayCategory.slug, description: displayCategory.description || "", icon: displayCategory.icon || "BookOpen", color: displayCategory.color || "bg-blue-500" });
                            } },
                            React.createElement(lucide_react_1.Pencil, { className: "h-4 w-4" })),
                        React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 text-destructive", onClick: function () {
                                if (confirm("Delete this category and all its articles?")) {
                                    deleteCategory.mutate({ id: displayCategory.id });
                                    setActiveCategory(null);
                                }
                            } },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))),
                categoryArticles.length === 0 ? (React.createElement("div", { className: "text-center py-12 text-muted-foreground" },
                    React.createElement(lucide_react_1.FileText, { className: "h-10 w-10 mx-auto mb-3 opacity-40" }),
                    React.createElement("p", null, "No articles in this category yet."),
                    React.createElement(button_1.Button, { size: "sm", className: "mt-3", onClick: function () { setArtForm(__assign(__assign({}, artForm), { categoryId: displayCategory.id })); setShowCreateArticle(true); } },
                        React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                        " Add Article"))) : (React.createElement("div", { className: "space-y-2" }, categoryArticles.map(function (a) { return (React.createElement("button", { key: a.id, onClick: function () { return setActiveArticleId(a.id); }, className: "w-full flex items-center justify-between p-4 border rounded-lg hover:bg-muted/40 text-left transition-colors" },
                    React.createElement("div", { className: "flex items-center gap-3" },
                        React.createElement(lucide_react_1.FileText, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
                        React.createElement("span", { className: "text-sm font-medium" }, a.title),
                        a.featured && React.createElement(lucide_react_1.Star, { className: "h-3 w-3 text-amber-400 fill-amber-400" })),
                    React.createElement("div", { className: "flex items-center gap-4 text-xs text-muted-foreground ml-4 shrink-0" },
                        React.createElement("span", { className: "flex items-center gap-1" },
                            React.createElement(lucide_react_1.Clock, { className: "h-3 w-3" }),
                            " ",
                            a.readTime || 3,
                            " min"),
                        React.createElement("span", { className: "flex items-center gap-1" },
                            React.createElement(lucide_react_1.Eye, { className: "h-3 w-3" }),
                            " ",
                            a.views || 0),
                        React.createElement(lucide_react_1.ArrowRight, { className: "h-4 w-4" })))); }))))) : (React.createElement(React.Fragment, null,
                featuredArticles.length > 0 && (React.createElement("div", { className: "mb-8" },
                    React.createElement("h2", { className: "text-lg font-semibold mb-3 flex items-center gap-2" },
                        React.createElement(lucide_react_1.Star, { className: "h-4 w-4 text-amber-400 fill-amber-400" }),
                        " Featured Articles"),
                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" }, featuredArticles.map(function (a) {
                        var cat = categories.find(function (c) { return c.id === a.categoryId; });
                        return (React.createElement("button", { key: a.id, onClick: function () { return setActiveArticleId(a.id); }, className: "border rounded-lg p-4 hover:bg-muted/40 text-left transition-colors group" },
                            React.createElement("div", { className: "flex items-center gap-2 mb-2" },
                                React.createElement("div", { className: utils_1.cn("p-1.5 rounded-md text-white", (cat === null || cat === void 0 ? void 0 : cat.color) || "bg-blue-500") },
                                    React.createElement(lucide_react_1.BookOpen, { className: "h-3 w-3" })),
                                React.createElement("span", { className: "text-xs text-muted-foreground" }, (cat === null || cat === void 0 ? void 0 : cat.name) || "Uncategorized")),
                            React.createElement("p", { className: "text-sm font-medium leading-tight group-hover:text-primary transition-colors" }, a.title),
                            React.createElement("div", { className: "flex items-center gap-3 mt-2 text-xs text-muted-foreground" },
                                React.createElement("span", { className: "flex items-center gap-1" },
                                    React.createElement(lucide_react_1.Clock, { className: "h-3 w-3" }),
                                    " ",
                                    a.readTime || 3,
                                    " min"),
                                React.createElement("span", { className: "flex items-center gap-1" },
                                    React.createElement(lucide_react_1.Eye, { className: "h-3 w-3" }),
                                    " ",
                                    a.views || 0))));
                    })))),
                React.createElement("div", null,
                    React.createElement("h2", { className: "text-lg font-semibold mb-3" }, "Browse by Category"),
                    categories.length === 0 ? (React.createElement("div", { className: "text-center py-12 text-muted-foreground border rounded-lg" },
                        React.createElement(lucide_react_1.BookOpen, { className: "h-10 w-10 mx-auto mb-3 opacity-40" }),
                        React.createElement("p", null, "No categories yet. Create your first category to get started."),
                        React.createElement(button_1.Button, { size: "sm", className: "mt-3", onClick: function () { return setShowCreateCategory(true); } },
                            React.createElement(lucide_react_1.FolderPlus, { className: "h-4 w-4 mr-1" }),
                            " Create Category"))) : (React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" }, categories.map(function (cat) { return (React.createElement("button", { key: cat.id, onClick: function () { return setActiveCategory(cat.id); }, className: "flex flex-col p-5 border rounded-lg hover:bg-muted/40 text-left transition-colors group hover:border-primary/40" },
                        React.createElement("div", { className: utils_1.cn("p-2.5 rounded-xl text-white w-fit mb-3", cat.color || "bg-blue-500") },
                            React.createElement(lucide_react_1.BookOpen, { className: "h-5 w-5" })),
                        React.createElement("p", { className: "font-semibold text-sm group-hover:text-primary transition-colors" }, cat.name),
                        React.createElement("p", { className: "text-xs text-muted-foreground mt-1 leading-relaxed" }, cat.description),
                        React.createElement("div", { className: "flex items-center justify-between mt-3" },
                            React.createElement(badge_1.Badge, { variant: "secondary", className: "text-xs" },
                                getCategoryArticleCount(cat.id),
                                " articles"),
                            React.createElement(lucide_react_1.ChevronRight, { className: "h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" })))); })))))))),
        React.createElement(dialog_1.Dialog, { open: showCreateCategory || !!editingCategory, onOpenChange: function (v) { if (!v) {
                setShowCreateCategory(false);
                setEditingCategory(null);
            } } },
            React.createElement(dialog_1.DialogContent, null,
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, editingCategory ? "Edit Category" : "New Category"),
                    React.createElement(dialog_1.DialogDescription, null, "Organize your knowledge base articles into categories.")),
                React.createElement("div", { className: "space-y-3" },
                    React.createElement("div", null,
                        React.createElement(label_1.Label, null, "Name"),
                        React.createElement(input_1.Input, { value: catForm.name, onChange: function (e) { return setCatForm(function (p) { return (__assign(__assign({}, p), { name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })); }); }, placeholder: "e.g. Getting Started" })),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, null, "Slug"),
                        React.createElement(input_1.Input, { value: catForm.slug, onChange: function (e) { return setCatForm(function (p) { return (__assign(__assign({}, p), { slug: e.target.value })); }); }, placeholder: "getting-started" })),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, null, "Description"),
                        React.createElement(textarea_1.Textarea, { value: catForm.description, onChange: function (e) { return setCatForm(function (p) { return (__assign(__assign({}, p), { description: e.target.value })); }); }, rows: 2 })),
                    React.createElement("div", { className: "grid grid-cols-2 gap-3" },
                        React.createElement("div", null,
                            React.createElement(label_1.Label, null, "Color"),
                            React.createElement(select_1.Select, { value: catForm.color, onValueChange: function (v) { return setCatForm(function (p) { return (__assign(__assign({}, p), { color: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null, ["bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-pink-500", "bg-cyan-500", "bg-orange-500", "bg-slate-500", "bg-red-500", "bg-teal-500"].map(function (c) { return (React.createElement(select_1.SelectItem, { key: c, value: c },
                                    React.createElement("span", { className: "flex items-center gap-2" },
                                        React.createElement("span", { className: utils_1.cn("w-3 h-3 rounded-full", c) }),
                                        c.replace("bg-", "").replace("-500", "")))); })))),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, null, "Sort Order"),
                            React.createElement(input_1.Input, { type: "number", value: catForm.icon, onChange: function (e) { return setCatForm(function (p) { return (__assign(__assign({}, p), { icon: e.target.value })); }); } })))),
                React.createElement(dialog_1.DialogFooter, null,
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { setShowCreateCategory(false); setEditingCategory(null); } }, "Cancel"),
                    React.createElement(button_1.Button, { disabled: !catForm.name || !catForm.slug, onClick: function () {
                            if (editingCategory) {
                                updateCategory.mutate({ id: editingCategory.id, name: catForm.name, description: catForm.description, color: catForm.color });
                            }
                            else {
                                createCategory.mutate({ name: catForm.name, slug: catForm.slug, description: catForm.description, icon: catForm.icon, color: catForm.color });
                            }
                        } },
                        (createCategory.isPending || updateCategory.isPending) && React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin mr-1" }),
                        editingCategory ? "Update" : "Create")))),
        React.createElement(dialog_1.Dialog, { open: showCreateArticle || !!editingArticle, onOpenChange: function (v) { if (!v) {
                setShowCreateArticle(false);
                setEditingArticle(null);
            } } },
            React.createElement(dialog_1.DialogContent, { className: "max-w-2xl" },
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, editingArticle ? "Edit Article" : "New Article"),
                    React.createElement(dialog_1.DialogDescription, null, "Write and publish knowledge base articles.")),
                React.createElement("div", { className: "space-y-3 max-h-[60vh] overflow-y-auto pr-2" },
                    React.createElement("div", null,
                        React.createElement(label_1.Label, null, "Title"),
                        React.createElement(input_1.Input, { value: artForm.title, onChange: function (e) { return setArtForm(function (p) { return (__assign(__assign({}, p), { title: e.target.value })); }); }, placeholder: "Article title" })),
                    React.createElement("div", { className: "grid grid-cols-2 gap-3" },
                        React.createElement("div", null,
                            React.createElement(label_1.Label, null, "Category"),
                            React.createElement(select_1.Select, { value: artForm.categoryId, onValueChange: function (v) { return setArtForm(function (p) { return (__assign(__assign({}, p), { categoryId: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, { placeholder: "Select category" })),
                                React.createElement(select_1.SelectContent, null, categories.map(function (c) { return React.createElement(select_1.SelectItem, { key: c.id, value: c.id }, c.name); })))),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, null, "Status"),
                            React.createElement(select_1.Select, { value: artForm.status, onValueChange: function (v) { return setArtForm(function (p) { return (__assign(__assign({}, p), { status: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "published" }, "Published"),
                                    React.createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                                    React.createElement(select_1.SelectItem, { value: "archived" }, "Archived"))))),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, null, "Excerpt"),
                        React.createElement(input_1.Input, { value: artForm.excerpt, onChange: function (e) { return setArtForm(function (p) { return (__assign(__assign({}, p), { excerpt: e.target.value })); }); }, placeholder: "Brief description" })),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, null, "Content"),
                        React.createElement(RichTextEditor_1.RichTextEditor, { value: artForm.content, onChange: function (html) { return setArtForm(function (p) { return (__assign(__assign({}, p), { content: html })); }); }, minHeight: "250px", placeholder: "Article content..." })),
                    React.createElement("div", { className: "grid grid-cols-3 gap-3" },
                        React.createElement("div", null,
                            React.createElement(label_1.Label, null, "Read Time (min)"),
                            React.createElement(input_1.Input, { type: "number", value: artForm.readTime, onChange: function (e) { return setArtForm(function (p) { return (__assign(__assign({}, p), { readTime: parseInt(e.target.value) || 3 })); }); } })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, null, "Tags (comma-separated)"),
                            React.createElement(input_1.Input, { value: artForm.tags, onChange: function (e) { return setArtForm(function (p) { return (__assign(__assign({}, p), { tags: e.target.value })); }); }, placeholder: "tag1, tag2" })),
                        React.createElement("div", { className: "flex items-end pb-1" },
                            React.createElement("label", { className: "flex items-center gap-2 text-sm cursor-pointer" },
                                React.createElement("input", { type: "checkbox", checked: artForm.featured, onChange: function (e) { return setArtForm(function (p) { return (__assign(__assign({}, p), { featured: e.target.checked })); }); }, className: "rounded" }),
                                "Featured")))),
                React.createElement(dialog_1.DialogFooter, null,
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { setShowCreateArticle(false); setEditingArticle(null); } }, "Cancel"),
                    React.createElement(button_1.Button, { disabled: !artForm.title || !artForm.categoryId, onClick: function () {
                            if (editingArticle) {
                                updateArticle.mutate({ id: editingArticle.id, title: artForm.title, categoryId: artForm.categoryId, content: artForm.content, excerpt: artForm.excerpt, status: artForm.status, featured: artForm.featured, readTime: artForm.readTime, tags: artForm.tags });
                            }
                            else {
                                createArticle.mutate({ title: artForm.title, categoryId: artForm.categoryId, content: artForm.content, excerpt: artForm.excerpt, status: artForm.status, featured: artForm.featured, readTime: artForm.readTime, tags: artForm.tags });
                            }
                        } },
                        (createArticle.isPending || updateArticle.isPending) && React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin mr-1" }),
                        editingArticle ? "Update" : "Publish"))))));
}
exports["default"] = KnowledgeBase;
