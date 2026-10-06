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
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var dialog_1 = require("@/components/ui/dialog");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var emptyForm = {
    title: "",
    content: "",
    category: "General",
    shortCode: ""
};
function CannedResponses() {
    var _a = react_1.useState(""), searchQuery = _a[0], setSearchQuery = _a[1];
    var _b = react_1.useState(null), selectedCategory = _b[0], setSelectedCategory = _b[1];
    var _c = react_1.useState(false), isCreateDialogOpen = _c[0], setIsCreateDialogOpen = _c[1];
    var _d = react_1.useState(null), editingId = _d[0], setEditingId = _d[1];
    var _e = react_1.useState(null), deletingId = _e[0], setDeletingId = _e[1];
    var _f = react_1.useState(emptyForm), formState = _f[0], setFormState = _f[1];
    var _g = react_1.useState(""), newCategoryInput = _g[0], setNewCategoryInput = _g[1];
    var _h = react_1.useState(false), isCategoryDialogOpen = _h[0], setIsCategoryDialogOpen = _h[1];
    var _j = trpc_1.trpc.cannedResponses.list.useQuery({}), _k = _j.data, responses = _k === void 0 ? [] : _k, isLoading = _j.isLoading, refetch = _j.refetch;
    var createMutation = trpc_1.trpc.cannedResponses.create.useMutation({
        onSuccess: function () { sonner_1.toast.success("Response created"); setIsCreateDialogOpen(false); refetch(); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var updateMutation = trpc_1.trpc.cannedResponses.update.useMutation({
        onSuccess: function () { sonner_1.toast.success("Response updated"); setEditingId(null); refetch(); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var deleteMutation = trpc_1.trpc.cannedResponses["delete"].useMutation({
        onSuccess: function () { sonner_1.toast.success("Response deleted"); setDeletingId(null); refetch(); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    // Derive unique categories from responses
    var categories = react_1.useMemo(function () {
        var cats = new Set(responses.map(function (r) { return r.category; }));
        return Array.from(cats).sort();
    }, [responses]);
    var filtered = react_1.useMemo(function () {
        return responses.filter(function (r) {
            var matchCat = !selectedCategory || r.category === selectedCategory;
            var matchSearch = !searchQuery ||
                r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.content.toLowerCase().includes(searchQuery.toLowerCase());
            return matchCat && matchSearch;
        });
    }, [responses, selectedCategory, searchQuery]);
    function openCreate() {
        setFormState(emptyForm);
        setIsCreateDialogOpen(true);
    }
    function openEdit(id) {
        var _a;
        var item = responses.find(function (r) { return r.id === id; });
        if (!item)
            return;
        setFormState({
            title: item.title,
            content: item.content,
            category: item.category,
            shortCode: (_a = item.shortCode) !== null && _a !== void 0 ? _a : ""
        });
        setEditingId(id);
    }
    function handleCopyContent(content) {
        var text = content.replace(/<[^>]+>/g, ""); // strip HTML tags
        navigator.clipboard.writeText(text).then(function () { return sonner_1.toast.success("Copied to clipboard"); });
    }
    function handleSubmitCreate() {
        if (!formState.title.trim() || !formState.content.trim()) {
            sonner_1.toast.error("Title and content are required");
            return;
        }
        createMutation.mutate({
            title: formState.title,
            content: formState.content,
            category: formState.category || "General",
            shortCode: formState.shortCode || undefined
        });
    }
    function handleSubmitEdit() {
        if (!editingId || !formState.title.trim() || !formState.content.trim()) {
            sonner_1.toast.error("Title and content are required");
            return;
        }
        updateMutation.mutate({
            id: editingId,
            title: formState.title,
            content: formState.content,
            category: formState.category || "General",
            shortCode: formState.shortCode || undefined
        });
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Canned Responses", description: "Pre-written responses for quick replies to common support queries", icon: React.createElement(lucide_react_1.MessageSquare, { className: "h-6 w-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Communications", href: "/communications" },
            { label: "Canned Responses" },
        ], actions: React.createElement("div", { className: "flex gap-2" },
            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setIsCategoryDialogOpen(true); } },
                React.createElement(lucide_react_1.Settings, { className: "h-4 w-4 mr-2" }),
                "Manage Categories"),
            React.createElement(button_1.Button, { onClick: openCreate },
                React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                "New Response")) },
        React.createElement("div", { className: "flex flex-col gap-6 max-w-6xl" },
            React.createElement("div", { className: "flex gap-4" },
                React.createElement("aside", { className: "w-52 shrink-0 space-y-1" },
                    React.createElement("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2" }, "Categories"),
                    React.createElement("button", { onClick: function () { return setSelectedCategory(null); }, className: "w-full text-left px-3 py-2 rounded-md text-sm transition-colors " + (!selectedCategory
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted") },
                        "All Responses",
                        React.createElement(badge_1.Badge, { variant: "secondary", className: "ml-2 text-xs" }, responses.length)),
                    categories.map(function (cat) {
                        var count = responses.filter(function (r) { return r.category === cat; }).length;
                        return (React.createElement("button", { key: cat, onClick: function () { return setSelectedCategory(cat); }, className: "w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between " + (selectedCategory === cat
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted") },
                            React.createElement("span", { className: "flex items-center gap-1.5" },
                                React.createElement(lucide_react_1.Tag, { className: "h-3 w-3" }),
                                cat),
                            React.createElement(badge_1.Badge, { variant: "secondary", className: "text-xs" }, count)));
                    }),
                    categories.length === 0 && (React.createElement("p", { className: "text-xs text-muted-foreground px-2" }, "No categories yet"))),
                React.createElement("div", { className: "flex-1 space-y-4" },
                    React.createElement("div", { className: "relative" },
                        React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                        React.createElement(input_1.Input, { placeholder: "Search responses...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-9" })),
                    isLoading ? (React.createElement("p", { className: "text-muted-foreground text-sm" }, "Loading...")) : filtered.length === 0 ? (React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardContent, { className: "py-12 flex flex-col items-center gap-3 text-center text-muted-foreground" },
                            React.createElement(lucide_react_1.MessageSquare, { className: "h-10 w-10 opacity-30" }),
                            React.createElement("p", { className: "font-medium" }, "No canned responses found"),
                            React.createElement("p", { className: "text-xs" }, responses.length === 0
                                ? "Create your first canned response to get started."
                                : "Try changing the category or search query."),
                            responses.length === 0 && (React.createElement(button_1.Button, { size: "sm", onClick: openCreate, className: "mt-1" },
                                React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                                "New Response"))))) : (React.createElement("div", { className: "space-y-3" }, filtered.map(function (item) { return (React.createElement(card_1.Card, { key: item.id, className: "group" },
                        React.createElement(card_1.CardHeader, { className: "pb-2 flex-row items-start justify-between space-y-0" },
                            React.createElement("div", null,
                                React.createElement(card_1.CardTitle, { className: "text-base" }, item.title),
                                React.createElement("div", { className: "flex gap-2 mt-1" },
                                    React.createElement(badge_1.Badge, { variant: "outline", className: "text-xs" },
                                        React.createElement(lucide_react_1.Tag, { className: "h-3 w-3 mr-1" }),
                                        item.category),
                                    item.shortCode && (React.createElement(badge_1.Badge, { variant: "secondary", className: "text-xs font-mono" },
                                        "#",
                                        item.shortCode)))),
                            React.createElement("div", { className: "flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" },
                                React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: function () { return handleCopyContent(item.content); }, title: "Copy text" },
                                    React.createElement(lucide_react_1.Copy, { className: "h-3.5 w-3.5" })),
                                React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: function () { return openEdit(item.id); }, title: "Edit" },
                                    React.createElement(lucide_react_1.Edit, { className: "h-3.5 w-3.5" })),
                                React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-destructive hover:text-destructive", onClick: function () { return setDeletingId(item.id); }, title: "Delete" },
                                    React.createElement(lucide_react_1.Trash2, { className: "h-3.5 w-3.5" })))),
                        React.createElement(card_1.CardContent, { className: "pt-0" },
                            React.createElement("div", { className: "text-sm text-muted-foreground line-clamp-3 prose prose-sm max-w-none [&_p]:my-0 [&_ul]:my-0 [&_li]:my-0", dangerouslySetInnerHTML: { __html: item.content } })))); })))))),
        React.createElement(dialog_1.Dialog, { open: isCreateDialogOpen, onOpenChange: setIsCreateDialogOpen },
            React.createElement(dialog_1.DialogContent, { className: "max-w-2xl" },
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "New Canned Response")),
                React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null, "Title *"),
                            React.createElement(input_1.Input, { placeholder: "e.g., Thank you for contacting us", value: formState.title, onChange: function (e) { return setFormState(__assign(__assign({}, formState), { title: e.target.value })); } })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null, "Category"),
                            React.createElement(input_1.Input, { placeholder: "e.g., General, Billing, Technical", value: formState.category, onChange: function (e) { return setFormState(__assign(__assign({}, formState), { category: e.target.value })); }, list: "category-suggestions" }),
                            React.createElement("datalist", { id: "category-suggestions" }, categories.map(function (c) { return (React.createElement("option", { key: c, value: c })); })))),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null,
                            "Short Code ",
                            React.createElement("span", { className: "text-muted-foreground text-xs" }, "(optional \u2014 for quick inserts)")),
                        React.createElement(input_1.Input, { placeholder: "e.g., thankyou, follow-up", value: formState.shortCode, onChange: function (e) { return setFormState(__assign(__assign({}, formState), { shortCode: e.target.value })); } })),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Response Content *"),
                        React.createElement(RichTextEditor_1.RichTextEditor, { value: formState.content, onChange: function (v) { return setFormState(__assign(__assign({}, formState), { content: v })); }, placeholder: "Write your canned response here...", minHeight: "160px" }))),
                React.createElement(dialog_1.DialogFooter, null,
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setIsCreateDialogOpen(false); } }, "Cancel"),
                    React.createElement(button_1.Button, { onClick: handleSubmitCreate, disabled: createMutation.isPending }, createMutation.isPending ? "Creating..." : "Create Response")))),
        React.createElement(dialog_1.Dialog, { open: !!editingId, onOpenChange: function (open) { return !open && setEditingId(null); } },
            React.createElement(dialog_1.DialogContent, { className: "max-w-2xl" },
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "Edit Canned Response")),
                React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null, "Title *"),
                            React.createElement(input_1.Input, { placeholder: "e.g., Thank you for contacting us", value: formState.title, onChange: function (e) { return setFormState(__assign(__assign({}, formState), { title: e.target.value })); } })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null, "Category"),
                            React.createElement(input_1.Input, { placeholder: "e.g., General, Billing, Technical", value: formState.category, onChange: function (e) { return setFormState(__assign(__assign({}, formState), { category: e.target.value })); }, list: "category-suggestions-edit" }),
                            React.createElement("datalist", { id: "category-suggestions-edit" }, categories.map(function (c) { return (React.createElement("option", { key: c, value: c })); })))),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null,
                            "Short Code ",
                            React.createElement("span", { className: "text-muted-foreground text-xs" }, "(optional)")),
                        React.createElement(input_1.Input, { placeholder: "e.g., thankyou, follow-up", value: formState.shortCode, onChange: function (e) { return setFormState(__assign(__assign({}, formState), { shortCode: e.target.value })); } })),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Response Content *"),
                        React.createElement(RichTextEditor_1.RichTextEditor, { key: editingId !== null && editingId !== void 0 ? editingId : "edit", value: formState.content, onChange: function (v) { return setFormState(__assign(__assign({}, formState), { content: v })); }, placeholder: "Write your canned response here...", minHeight: "160px" }))),
                React.createElement(dialog_1.DialogFooter, null,
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setEditingId(null); } }, "Cancel"),
                    React.createElement(button_1.Button, { onClick: handleSubmitEdit, disabled: updateMutation.isPending }, updateMutation.isPending ? "Saving..." : "Save Changes")))),
        React.createElement(alert_dialog_1.AlertDialog, { open: !!deletingId, onOpenChange: function (open) { return !open && setDeletingId(null); } },
            React.createElement(alert_dialog_1.AlertDialogContent, null,
                React.createElement(alert_dialog_1.AlertDialogHeader, null,
                    React.createElement(alert_dialog_1.AlertDialogTitle, null, "Delete Canned Response?"),
                    React.createElement(alert_dialog_1.AlertDialogDescription, null, "This action cannot be undone. The canned response will be permanently deleted.")),
                React.createElement(alert_dialog_1.AlertDialogFooter, null,
                    React.createElement(alert_dialog_1.AlertDialogCancel, null, "Cancel"),
                    React.createElement(alert_dialog_1.AlertDialogAction, { onClick: function () { return deletingId && deleteMutation.mutate({ id: deletingId }); }, className: "bg-destructive text-destructive-foreground hover:bg-destructive/90" }, "Delete")))),
        React.createElement(dialog_1.Dialog, { open: isCategoryDialogOpen, onOpenChange: setIsCategoryDialogOpen },
            React.createElement(dialog_1.DialogContent, null,
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "Manage Categories")),
                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Categories are automatically created when you assign one to a canned response. To rename a category, edit each response and update its category field."),
                React.createElement("div", { className: "space-y-2 mt-2" }, categories.length === 0 ? (React.createElement("p", { className: "text-sm text-muted-foreground" }, "No categories created yet.")) : (categories.map(function (c) { return (React.createElement("div", { key: c, className: "flex items-center justify-between px-3 py-2 border rounded-md text-sm" },
                    React.createElement("span", { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Tag, { className: "h-4 w-4 text-muted-foreground" }),
                        c),
                    React.createElement(badge_1.Badge, { variant: "secondary" },
                        responses.filter(function (r) { return r.category === c; }).length,
                        " responses"))); }))),
                React.createElement(dialog_1.DialogFooter, null,
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setIsCategoryDialogOpen(false); } }, "Close"))))));
}
exports["default"] = CannedResponses;
