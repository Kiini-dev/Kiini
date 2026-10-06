"use strict";
exports.__esModule = true;
var react_1 = require("react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
var dialog_1 = require("@/components/ui/dialog");
var label_1 = require("@/components/ui/label");
var lucide_react_1 = require("lucide-react");
var export_utils_1 = require("@/lib/export-utils");
var sonner_1 = require("sonner");
var utils_1 = require("@/lib/utils");
var trpc_1 = require("@/lib/trpc");
var CATEGORIES = ["General", "Work", "Ideas", "Meeting", "Personal", "Follow-up"];
var CATEGORY_COLORS = {
    General: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    Work: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    Ideas: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    Meeting: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    Personal: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    "Follow-up": "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
};
var SAMPLE_NOTES_REMOVED = true; // Data now comes from backend
function isThisWeek(dateStr) {
    var date = new Date(dateStr);
    var now = new Date();
    var weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return date >= weekAgo && date <= now;
}
function Notes() {
    var utils = trpc_1.trpc.useUtils();
    var _a = trpc_1.trpc.notes.list.useQuery({}), _b = _a.data, rawNotes = _b === void 0 ? [] : _b, isLoading = _a.isLoading;
    var notes = JSON.parse(JSON.stringify(rawNotes));
    var createMutation = trpc_1.trpc.notes.create.useMutation({
        onSuccess: function () { utils.notes.list.invalidate(); setDialogOpen(false); sonner_1.toast.success("Note created successfully"); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var updateMutation = trpc_1.trpc.notes.update.useMutation({
        onSuccess: function () { utils.notes.list.invalidate(); setDialogOpen(false); sonner_1.toast.success("Note updated successfully"); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var deleteMutation = trpc_1.trpc.notes["delete"].useMutation({
        onSuccess: function () { utils.notes.list.invalidate(); sonner_1.toast.success("Note deleted"); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var _c = react_1.useState(""), search = _c[0], setSearch = _c[1];
    var _d = react_1.useState("all"), categoryFilter = _d[0], setCategoryFilter = _d[1];
    var _e = react_1.useState(false), dialogOpen = _e[0], setDialogOpen = _e[1];
    var _f = react_1.useState(null), editingNote = _f[0], setEditingNote = _f[1];
    // Form state
    var _g = react_1.useState(""), formTitle = _g[0], setFormTitle = _g[1];
    var _h = react_1.useState(""), formContent = _h[0], setFormContent = _h[1];
    var _j = react_1.useState("General"), formCategory = _j[0], setFormCategory = _j[1];
    var _k = react_1.useState(false), formPinned = _k[0], setFormPinned = _k[1];
    var filtered = react_1.useMemo(function () {
        var result = notes;
        if (search) {
            var q_1 = search.toLowerCase();
            result = result.filter(function (n) {
                return n.title.toLowerCase().includes(q_1) ||
                    n.content.toLowerCase().includes(q_1);
            });
        }
        if (categoryFilter !== "all") {
            result = result.filter(function (n) { return n.category === categoryFilter; });
        }
        // Pinned notes first
        return result.sort(function (a, b) { return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0); });
    }, [notes, search, categoryFilter]);
    var totalNotes = notes.length;
    var favoriteCount = notes.filter(function (n) { return n.favorite; }).length;
    var recentCount = notes.filter(function (n) { return isThisWeek(n.createdAt); }).length;
    function openCreate() {
        setEditingNote(null);
        setFormTitle("");
        setFormContent("");
        setFormCategory("General");
        setFormPinned(false);
        setDialogOpen(true);
    }
    function openEdit(note) {
        setEditingNote(note);
        setFormTitle(note.title);
        setFormContent(note.content);
        setFormCategory(note.category);
        setFormPinned(note.pinned);
        setDialogOpen(true);
    }
    function handleSave() {
        if (!formTitle.trim()) {
            sonner_1.toast.error("Title is required");
            return;
        }
        if (editingNote) {
            updateMutation.mutate({
                id: editingNote.id,
                title: formTitle,
                content: formContent,
                category: formCategory,
                pinned: formPinned
            });
        }
        else {
            createMutation.mutate({
                title: formTitle,
                content: formContent,
                category: formCategory,
                pinned: formPinned
            });
        }
    }
    function handleDelete(id) {
        deleteMutation.mutate(id);
    }
    function toggleFavorite(id) {
        var note = notes.find(function (n) { return n.id === id; });
        if (note)
            updateMutation.mutate({ id: id, favorite: !note.favorite });
    }
    function togglePin(id) {
        var note = notes.find(function (n) { return n.id === id; });
        if (note)
            updateMutation.mutate({ id: id, pinned: !note.pinned });
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Notes", icon: React.createElement(lucide_react_1.StickyNote, { className: "h-6 w-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Notes" },
        ], actions: React.createElement("div", { className: "flex gap-2" },
            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return export_utils_1.downloadCSV(filtered, "notes"); } },
                React.createElement(lucide_react_1.Download, { className: "mr-2 h-4 w-4" }),
                "Export CSV"),
            React.createElement(button_1.Button, { onClick: openCreate, size: "sm" },
                React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
                "New Note")) },
        React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "p-4 flex items-center gap-3" },
                    React.createElement("div", { className: "rounded-lg bg-blue-100 dark:bg-blue-900/40 p-2.5" },
                        React.createElement(lucide_react_1.StickyNote, { className: "h-5 w-5 text-blue-600 dark:text-blue-400" })),
                    React.createElement("div", null,
                        React.createElement("p", { className: "text-sm text-muted-foreground" }, "Total Notes"),
                        React.createElement("p", { className: "text-2xl font-bold" }, totalNotes)))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "p-4 flex items-center gap-3" },
                    React.createElement("div", { className: "rounded-lg bg-amber-100 dark:bg-amber-900/40 p-2.5" },
                        React.createElement(lucide_react_1.Star, { className: "h-5 w-5 text-amber-600 dark:text-amber-400" })),
                    React.createElement("div", null,
                        React.createElement("p", { className: "text-sm text-muted-foreground" }, "Favorites"),
                        React.createElement("p", { className: "text-2xl font-bold" }, favoriteCount)))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "p-4 flex items-center gap-3" },
                    React.createElement("div", { className: "rounded-lg bg-green-100 dark:bg-green-900/40 p-2.5" },
                        React.createElement(lucide_react_1.Edit2, { className: "h-5 w-5 text-green-600 dark:text-green-400" })),
                    React.createElement("div", null,
                        React.createElement("p", { className: "text-sm text-muted-foreground" }, "Recent (This Week)"),
                        React.createElement("p", { className: "text-2xl font-bold" }, recentCount))))),
        React.createElement("div", { className: "flex flex-col sm:flex-row gap-3" },
            React.createElement("div", { className: "relative flex-1" },
                React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                React.createElement(input_1.Input, { placeholder: "Search notes...", value: search, onChange: function (e) { return setSearch(e.target.value); }, className: "pl-9" })),
            React.createElement(select_1.Select, { value: categoryFilter, onValueChange: setCategoryFilter },
                React.createElement(select_1.SelectTrigger, { className: "w-full sm:w-[180px]" },
                    React.createElement(select_1.SelectValue, { placeholder: "Category" })),
                React.createElement(select_1.SelectContent, null,
                    React.createElement(select_1.SelectItem, { value: "all" }, "All Categories"),
                    CATEGORIES.map(function (c) { return (React.createElement(select_1.SelectItem, { key: c, value: c }, c)); })))),
        filtered.length === 0 ? (React.createElement("div", { className: "text-center py-16 text-muted-foreground" },
            React.createElement(lucide_react_1.StickyNote, { className: "mx-auto h-12 w-12 mb-3 opacity-40" }),
            React.createElement("p", { className: "text-lg font-medium" }, isLoading ? "Loading notes..." : "No notes found"),
            React.createElement("p", { className: "text-sm" }, "Create a new note or adjust your filters."))) : (React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" }, filtered.map(function (note) { return (React.createElement(card_1.Card, { key: note.id, className: utils_1.cn("group relative transition-shadow hover:shadow-md", note.pinned && "ring-1 ring-blue-300 dark:ring-blue-700") },
            React.createElement(card_1.CardContent, { className: "p-4 space-y-3" },
                React.createElement("div", { className: "flex items-start justify-between gap-2" },
                    React.createElement("h3", { className: "font-semibold text-sm leading-tight line-clamp-2" }, note.title),
                    React.createElement("div", { className: "flex items-center gap-1 shrink-0" },
                        React.createElement("button", { onClick: function () { return togglePin(note.id); }, className: utils_1.cn("p-1 rounded hover:bg-muted transition-colors", note.pinned ? "text-blue-500" : "text-muted-foreground opacity-0 group-hover:opacity-100") },
                            React.createElement(lucide_react_1.Pin, { className: "h-3.5 w-3.5" })),
                        React.createElement("button", { onClick: function () { return toggleFavorite(note.id); }, className: utils_1.cn("p-1 rounded hover:bg-muted transition-colors", note.favorite ? "text-amber-500" : "text-muted-foreground opacity-0 group-hover:opacity-100") },
                            React.createElement(lucide_react_1.Star, { className: utils_1.cn("h-3.5 w-3.5", note.favorite && "fill-current") })))),
                React.createElement("div", { className: "text-xs text-muted-foreground line-clamp-3" },
                    React.createElement(RichTextEditor_1.RichTextDisplay, { content: note.content })),
                React.createElement("div", { className: "flex items-center justify-between pt-1" },
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement(badge_1.Badge, { variant: "secondary", className: utils_1.cn("text-[10px] px-1.5 py-0", CATEGORY_COLORS[note.category]) }, note.category),
                        React.createElement("span", { className: "text-[10px] text-muted-foreground" }, new Date(note.createdAt).toLocaleDateString())),
                    React.createElement("div", { className: "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" },
                        React.createElement("button", { onClick: function () { return openEdit(note); }, className: "p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" },
                            React.createElement(lucide_react_1.Edit2, { className: "h-3.5 w-3.5" })),
                        React.createElement("button", { onClick: function () { return handleDelete(note.id); }, className: "p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" },
                            React.createElement(lucide_react_1.Trash2, { className: "h-3.5 w-3.5" }))))))); }))),
        React.createElement(dialog_1.Dialog, { open: dialogOpen, onOpenChange: setDialogOpen },
            React.createElement(dialog_1.DialogContent, { className: "sm:max-w-md" },
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, editingNote ? "Edit Note" : "New Note")),
                React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "note-title" }, "Title"),
                        React.createElement(input_1.Input, { id: "note-title", placeholder: "Note title", value: formTitle, onChange: function (e) { return setFormTitle(e.target.value); } })),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "note-content" }, "Content"),
                        React.createElement(RichTextEditor_1.RichTextEditor, { content: formContent, onChange: setFormContent, placeholder: "Write your note..." })),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, null, "Category"),
                        React.createElement(select_1.Select, { value: formCategory, onValueChange: setFormCategory },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null, CATEGORIES.map(function (c) { return (React.createElement(select_1.SelectItem, { key: c, value: c }, c)); })))),
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement("input", { type: "checkbox", id: "note-pinned", checked: formPinned, onChange: function (e) { return setFormPinned(e.target.checked); }, className: "rounded border-gray-300" }),
                        React.createElement(label_1.Label, { htmlFor: "note-pinned", className: "cursor-pointer" }, "Pin this note"))),
                React.createElement(dialog_1.DialogFooter, null,
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setDialogOpen(false); } }, "Cancel"),
                    React.createElement(button_1.Button, { onClick: handleSave, disabled: createMutation.isPending || updateMutation.isPending }, editingNote ? "Update" : "Create"))))));
}
exports["default"] = Notes;
