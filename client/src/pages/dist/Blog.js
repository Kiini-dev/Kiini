"use strict";
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
var WebsiteNav_1 = require("./website/WebsiteNav");
var WebsiteFooter_1 = require("./website/WebsiteFooter");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var lucide_react_1 = require("lucide-react");
function Blog() {
    var posts = trpc_1.trpc.websiteAdmin.publicBlogPosts.useQuery({}).data;
    var _a = react_1.useState(null), selectedPost = _a[0], setSelectedPost = _a[1];
    var _b = react_1.useState(""), search = _b[0], setSearch = _b[1];
    var _c = react_1.useState(""), categoryFilter = _c[0], setCategoryFilter = _c[1];
    var categories = __spreadArrays(new Set((posts || []).map(function (p) { return p.category; }).filter(Boolean)));
    var filtered = (posts || []).filter(function (p) {
        var matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.excerpt || "").toLowerCase().includes(search.toLowerCase());
        var matchCat = !categoryFilter || p.category === categoryFilter;
        return matchSearch && matchCat;
    });
    if (selectedPost) {
        return (React.createElement("div", { className: "min-h-screen bg-white text-gray-900" },
            React.createElement(WebsiteNav_1.WebsiteNav, null),
            React.createElement("div", { className: "max-w-3xl mx-auto px-4 pt-32 pb-16" },
                React.createElement(button_1.Button, { variant: "ghost", className: "mb-6 text-indigo-600", onClick: function () { return setSelectedPost(null); } },
                    React.createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-2" }),
                    " Back to Blog"),
                React.createElement("article", null,
                    React.createElement("h1", { className: "text-4xl font-black mb-4" }, selectedPost.title),
                    React.createElement("div", { className: "flex items-center gap-4 text-sm text-gray-500 mb-8" },
                        selectedPost.author && React.createElement("span", { className: "flex items-center gap-1" },
                            React.createElement(lucide_react_1.User, { className: "h-3.5 w-3.5" }),
                            selectedPost.author),
                        selectedPost.publishedAt && (React.createElement("span", { className: "flex items-center gap-1" },
                            React.createElement(lucide_react_1.Calendar, { className: "h-3.5 w-3.5" }),
                            new Date(selectedPost.publishedAt).toLocaleDateString())),
                        selectedPost.category && React.createElement(badge_1.Badge, { variant: "secondary" }, selectedPost.category)),
                    React.createElement("div", { className: "prose prose-gray max-w-none whitespace-pre-wrap leading-relaxed" }, selectedPost.content),
                    selectedPost.tags && selectedPost.tags.length > 0 && (React.createElement("div", { className: "flex gap-2 mt-8 pt-6 border-t" },
                        React.createElement(lucide_react_1.Tag, { className: "h-4 w-4 text-gray-400 mt-0.5" }),
                        selectedPost.tags.map(function (tag) { return (React.createElement(badge_1.Badge, { key: tag, variant: "outline" }, tag)); }))))),
            React.createElement(WebsiteFooter_1.WebsiteFooter, null)));
    }
    return (React.createElement("div", { className: "min-h-screen bg-white text-gray-900" },
        React.createElement(WebsiteNav_1.WebsiteNav, null),
        React.createElement("section", { className: "pt-32 pb-16 bg-gradient-to-b from-indigo-50/80 via-white to-white" },
            React.createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" },
                React.createElement(badge_1.Badge, { className: "mb-4 bg-indigo-50 text-indigo-600 border border-indigo-200" }, "Blog"),
                React.createElement("h1", { className: "text-5xl font-black mb-4" }, "Latest Insights"),
                React.createElement("p", { className: "text-lg text-gray-500 max-w-2xl mx-auto" }, "Tips, guides, and news from the Kiini team."))),
        React.createElement("section", { className: "py-12" },
            React.createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" },
                React.createElement("div", { className: "flex flex-col sm:flex-row gap-3 mb-8" },
                    React.createElement("div", { className: "relative flex-1 max-w-sm" },
                        React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" }),
                        React.createElement(input_1.Input, { placeholder: "Search articles...", value: search, onChange: function (e) { return setSearch(e.target.value); }, className: "pl-9" })),
                    React.createElement("div", { className: "flex gap-2 flex-wrap" },
                        React.createElement(button_1.Button, { variant: !categoryFilter ? "default" : "outline", size: "sm", onClick: function () { return setCategoryFilter(""); } }, "All"),
                        categories.map(function (cat) { return (React.createElement(button_1.Button, { key: cat, variant: categoryFilter === cat ? "default" : "outline", size: "sm", onClick: function () { return setCategoryFilter(cat); } }, cat)); }))),
                filtered.length === 0 ? (React.createElement("div", { className: "text-center py-20 text-gray-500" },
                    React.createElement("p", { className: "text-lg font-medium" }, "No articles yet"),
                    React.createElement("p", { className: "text-sm" }, "Check back soon for new content."))) : (React.createElement("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6" }, filtered.map(function (post) { return (React.createElement("div", { key: post.id, className: "rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group", onClick: function () { return setSelectedPost(post); } },
                    post.coverImageUrl && (React.createElement("div", { className: "h-48 bg-gray-100 overflow-hidden" },
                        React.createElement("img", { src: post.coverImageUrl, alt: post.title, className: "w-full h-full object-cover group-hover:scale-105 transition-transform" }))),
                    React.createElement("div", { className: "p-6" },
                        post.category && React.createElement(badge_1.Badge, { variant: "secondary", className: "mb-3" }, post.category),
                        React.createElement("h3", { className: "text-lg font-bold mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2" }, post.title),
                        post.excerpt && React.createElement("p", { className: "text-sm text-gray-500 line-clamp-3 mb-4" }, post.excerpt),
                        React.createElement("div", { className: "flex items-center gap-3 text-xs text-gray-400" },
                            post.author && React.createElement("span", { className: "flex items-center gap-1" },
                                React.createElement(lucide_react_1.User, { className: "h-3 w-3" }),
                                post.author),
                            post.publishedAt && (React.createElement("span", { className: "flex items-center gap-1" },
                                React.createElement(lucide_react_1.Calendar, { className: "h-3 w-3" }),
                                new Date(post.publishedAt).toLocaleDateString())))))); }))))),
        React.createElement(WebsiteFooter_1.WebsiteFooter, null)));
}
exports["default"] = Blog;
