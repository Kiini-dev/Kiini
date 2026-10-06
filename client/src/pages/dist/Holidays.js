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
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var sonner_1 = require("sonner");
var date_fns_1 = require("date-fns");
var stats_card_1 = require("@/components/ui/stats-card");
function Holidays() {
    permissions_1.useRequireFeature("hr:view");
    var _a = react_1.useState(new Date().getFullYear()), year = _a[0], setYear = _a[1];
    var _b = react_1.useState(""), search = _b[0], setSearch = _b[1];
    var _c = react_1.useState(false), showForm = _c[0], setShowForm = _c[1];
    var _d = react_1.useState(null), editId = _d[0], setEditId = _d[1];
    var _e = react_1.useState(null), deleteId = _e[0], setDeleteId = _e[1];
    var _f = react_1.useState({
        name: "", date: "",
        type: "public",
        description: "", isRecurring: true
    }), form = _f[0], setForm = _f[1];
    var holidays = trpc_1.trpc.holidays.list.useQuery({ year: year });
    var utils = trpc_1.trpc.useUtils();
    var createHoliday = trpc_1.trpc.holidays.create.useMutation({
        onSuccess: function () { sonner_1.toast.success("Holiday created"); closeForm(); utils.holidays.list.invalidate(); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var updateHoliday = trpc_1.trpc.holidays.update.useMutation({
        onSuccess: function () { sonner_1.toast.success("Holiday updated"); closeForm(); utils.holidays.list.invalidate(); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var deleteHoliday = trpc_1.trpc.holidays["delete"].useMutation({
        onSuccess: function () { sonner_1.toast.success("Deleted"); setDeleteId(null); utils.holidays.list.invalidate(); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var closeForm = function () {
        setShowForm(false);
        setEditId(null);
        setForm({ name: "", date: "", type: "public", description: "", isRecurring: true });
    };
    var openEdit = function (h) {
        var _a;
        setEditId(h.id);
        setForm({ name: h.name, date: ((_a = h.date) === null || _a === void 0 ? void 0 : _a.split("T")[0]) || h.date, type: h.type || "public", description: h.description || "", isRecurring: !!h.isRecurring });
        setShowForm(true);
    };
    var handleSave = function () {
        if (editId) {
            updateHoliday.mutate(__assign({ id: editId }, form));
        }
        else {
            var year_1 = form.date ? new Date(form.date).getFullYear() : new Date().getFullYear();
            createHoliday.mutate(__assign(__assign({}, form), { year: year_1 }));
        }
    };
    var filtered = (holidays.data || []).filter(function (h) {
        return !search || h.name.toLowerCase().includes(search.toLowerCase());
    });
    var typeColors = { public: "default", company: "secondary", optional: "outline" };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Holiday Calendar", description: "Manage public and company holidays", icon: lucide_react_1.CalendarDays, breadcrumbs: [{ label: "HR", href: "/employees" }, { label: "Holidays" }] },
        React.createElement("div", { className: "grid gap-4 md:grid-cols-3 mb-6" },
            React.createElement(stats_card_1.StatsCard, { label: "Total Holidays", value: filtered.length, icon: React.createElement(lucide_react_1.Calendar, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
            React.createElement(stats_card_1.StatsCard, { label: "Public Holidays", value: filtered.filter(function (h) { return h.type === "public"; }).length, icon: React.createElement(lucide_react_1.CalendarDays, { className: "h-5 w-5" }), color: "border-l-green-500" }),
            React.createElement(stats_card_1.StatsCard, { label: "Company Holidays", value: filtered.filter(function (h) { return h.type === "company"; }).length, icon: React.createElement(lucide_react_1.CalendarDays, { className: "h-5 w-5" }), color: "border-l-purple-500" })),
        React.createElement("div", { className: "flex items-center gap-3 mb-4" },
            React.createElement("div", { className: "relative flex-1 max-w-sm" },
                React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                React.createElement(input_1.Input, { placeholder: "Search holidays...", value: search, onChange: function (e) { return setSearch(e.target.value); }, className: "pl-9" })),
            React.createElement(select_1.Select, { value: String(year), onValueChange: function (v) { return setYear(Number(v)); } },
                React.createElement(select_1.SelectTrigger, { className: "w-[120px]" },
                    React.createElement(select_1.SelectValue, null)),
                React.createElement(select_1.SelectContent, null, [2024, 2025, 2026, 2027].map(function (y) { return (React.createElement(select_1.SelectItem, { key: y, value: String(y) }, y)); }))),
            React.createElement(button_1.Button, { onClick: function () { return setShowForm(true); } },
                React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                " Add Holiday")),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardContent, { className: "p-0" }, holidays.isLoading ? (React.createElement("div", { className: "flex justify-center p-8" },
                React.createElement(spinner_1.Spinner, null))) : (React.createElement(table_1.Table, null,
                React.createElement(table_1.TableHeader, null,
                    React.createElement(table_1.TableRow, null,
                        React.createElement(table_1.TableHead, null, "Name"),
                        React.createElement(table_1.TableHead, null, "Date"),
                        React.createElement(table_1.TableHead, null, "Day"),
                        React.createElement(table_1.TableHead, null, "Type"),
                        React.createElement(table_1.TableHead, null, "Recurring"),
                        React.createElement(table_1.TableHead, null, "Actions"))),
                React.createElement(table_1.TableBody, null, filtered.length === 0 ? (React.createElement(table_1.TableRow, null,
                    React.createElement(table_1.TableCell, { colSpan: 6, className: "text-center py-8 text-muted-foreground" },
                        "No holidays for ",
                        year))) : filtered.map(function (h) {
                    var d = new Date(h.date);
                    return (React.createElement(table_1.TableRow, { key: h.id },
                        React.createElement(table_1.TableCell, { className: "font-medium" }, h.name),
                        React.createElement(table_1.TableCell, null, date_fns_1.format(d, "MMM d, yyyy")),
                        React.createElement(table_1.TableCell, null, date_fns_1.format(d, "EEEE")),
                        React.createElement(table_1.TableCell, null,
                            React.createElement(badge_1.Badge, { variant: typeColors[h.type] || "outline" }, h.type)),
                        React.createElement(table_1.TableCell, null, h.isRecurring ? "Yes" : "No"),
                        React.createElement(table_1.TableCell, { className: "flex gap-1" },
                            React.createElement(button_1.Button, { size: "icon", variant: "ghost", onClick: function () { return openEdit(h); } },
                                React.createElement(lucide_react_1.Edit2, { className: "h-4 w-4" })),
                            React.createElement(button_1.Button, { size: "icon", variant: "ghost", className: "text-destructive", onClick: function () { return setDeleteId(h.id); } },
                                React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))));
                })))))),
        React.createElement(dialog_1.Dialog, { open: showForm, onOpenChange: closeForm },
            React.createElement(dialog_1.DialogContent, null,
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, editId ? "Edit Holiday" : "Add Holiday"),
                    React.createElement(dialog_1.DialogDescription, null, "Add or edit a public/company holiday")),
                React.createElement("div", { className: "space-y-4" },
                    React.createElement(input_1.Input, { placeholder: "Holiday name", value: form.name, onChange: function (e) { return setForm(function (p) { return (__assign(__assign({}, p), { name: e.target.value })); }); } }),
                    React.createElement(input_1.Input, { type: "date", value: form.date, onChange: function (e) { return setForm(function (p) { return (__assign(__assign({}, p), { date: e.target.value })); }); } }),
                    React.createElement(select_1.Select, { value: form.type, onValueChange: function (v) { return setForm(function (p) { return (__assign(__assign({}, p), { type: v })); }); } },
                        React.createElement(select_1.SelectTrigger, null,
                            React.createElement(select_1.SelectValue, null)),
                        React.createElement(select_1.SelectContent, null,
                            React.createElement(select_1.SelectItem, { value: "public" }, "Public Holiday"),
                            React.createElement(select_1.SelectItem, { value: "company" }, "Company Holiday"),
                            React.createElement(select_1.SelectItem, { value: "optional" }, "Optional"))),
                    React.createElement(input_1.Input, { placeholder: "Description (optional)", value: form.description, onChange: function (e) { return setForm(function (p) { return (__assign(__assign({}, p), { description: e.target.value })); }); } }),
                    React.createElement("label", { className: "flex items-center gap-2 text-sm" },
                        React.createElement("input", { type: "checkbox", checked: form.isRecurring, onChange: function (e) { return setForm(function (p) { return (__assign(__assign({}, p), { isRecurring: e.target.checked })); }); } }),
                        "Recurring annually"),
                    React.createElement(button_1.Button, { className: "w-full", disabled: !form.name || !form.date || createHoliday.isPending || updateHoliday.isPending, onClick: handleSave },
                        (createHoliday.isPending || updateHoliday.isPending) ? React.createElement(spinner_1.Spinner, { className: "mr-2" }) : null,
                        editId ? "Update" : "Create",
                        " Holiday")))),
        React.createElement(alert_dialog_1.AlertDialog, { open: !!deleteId, onOpenChange: function () { return setDeleteId(null); } },
            React.createElement(alert_dialog_1.AlertDialogContent, null,
                React.createElement(alert_dialog_1.AlertDialogTitle, null, "Delete Holiday?"),
                React.createElement(alert_dialog_1.AlertDialogDescription, null, "This action cannot be undone."),
                React.createElement("div", { className: "flex justify-end gap-2" },
                    React.createElement(alert_dialog_1.AlertDialogCancel, null, "Cancel"),
                    React.createElement(alert_dialog_1.AlertDialogAction, { onClick: function () { return deleteId && deleteHoliday.mutate({ id: deleteId }); } }, "Delete"))))));
}
exports["default"] = Holidays;
