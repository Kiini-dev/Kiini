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
var trpc_1 = require("@/lib/trpc");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var dialog_1 = require("@/components/ui/dialog");
var badge_1 = require("@/components/ui/badge");
var table_1 = require("@/components/ui/table");
var stats_card_1 = require("@/components/ui/stats-card");
var EmployeeSelector_1 = require("@/components/EmployeeSelector");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var STATUSES = [
    { value: "pending", label: "Pending", variant: "secondary" },
    { value: "in_progress", label: "In Progress", variant: "outline" },
    { value: "completed", label: "Completed", variant: "default" },
];
function StarRating(_a) {
    var rating = _a.rating, onChange = _a.onChange, readonly = _a.readonly;
    return (React.createElement("div", { className: "flex gap-0.5" }, [1, 2, 3, 4, 5].map(function (i) { return (React.createElement(lucide_react_1.Star, { key: i, className: "h-4 w-4 " + (i <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300") + " " + (!readonly ? "cursor-pointer hover:text-amber-300" : ""), onClick: function () { return !readonly && (onChange === null || onChange === void 0 ? void 0 : onChange(i)); } })); })));
}
function PerformanceReviewsPage() {
    var _a = react_1.useState("all"), filterStatus = _a[0], setFilterStatus = _a[1];
    var _b = react_1.useState(false), showForm = _b[0], setShowForm = _b[1];
    var _c = react_1.useState(null), editing = _c[0], setEditing = _c[1];
    var employeesQ = trpc_1.trpc.employees.list.useQuery({});
    var listQ = trpc_1.trpc.performanceReviews.list.useQuery({ status: filterStatus === "all" ? undefined : filterStatus });
    var statsQ = trpc_1.trpc.performanceReviews.stats.useQuery({});
    var createMut = trpc_1.trpc.performanceReviews.create.useMutation({ onSuccess: function () { sonner_1.toast.success("Review created"); listQ.refetch(); statsQ.refetch(); closeForm(); } });
    var updateMut = trpc_1.trpc.performanceReviews.update.useMutation({ onSuccess: function () { sonner_1.toast.success("Review updated"); listQ.refetch(); statsQ.refetch(); closeForm(); } });
    var deleteMut = trpc_1.trpc.performanceReviews["delete"].useMutation({ onSuccess: function () { sonner_1.toast.success("Review deleted"); listQ.refetch(); statsQ.refetch(); } });
    var emptyForm = { employeeId: "", reviewerId: "", rating: 5, comments: "", goals: "", strengths: "", improvements: "", kpiScore: "", status: "pending", reviewDate: "" };
    var _d = react_1.useState(emptyForm), form = _d[0], setForm = _d[1];
    var closeForm = function () { setShowForm(false); setEditing(null); setForm(emptyForm); };
    var openEdit = function (r) {
        var _a;
        setEditing(r);
        setForm({
            employeeId: r.employeeId, reviewerId: r.reviewerId, rating: r.rating || 5,
            comments: r.comments || "", goals: r.goals || "", strengths: r.strengths || "",
            improvements: r.improvements || "",
            kpiScore: ((_a = r.kpiScore) === null || _a === void 0 ? void 0 : _a.toString()) || "",
            status: r.status || "pending", reviewDate: r.reviewDate ? r.reviewDate.slice(0, 10) : ""
        });
        setShowForm(true);
    };
    var handleSubmit = function () {
        if (!form.employeeId || !form.reviewerId) {
            sonner_1.toast.error("Employee and reviewer are required");
            return;
        }
        var data = __assign(__assign({}, form), { rating: Number(form.rating), kpiScore: form.kpiScore ? Number(form.kpiScore) : undefined, reviewDate: form.reviewDate ? new Date(form.reviewDate) : undefined });
        if (editing)
            updateMut.mutate(__assign({ id: editing.id }, data));
        else
            createMut.mutate(data);
    };
    var stats = statsQ.data || { total: 0, pending: 0, inProgress: 0, completed: 0, averageRating: 0 };
    var reviews = listQ.data || [];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Performance Reviews", description: "Create and manage employee performance reviews with KPI tracking", icon: React.createElement(lucide_react_1.Star, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "HR", href: "/hr" }, { label: "Performance Reviews" }] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Reviews", value: stats.total, icon: React.createElement(lucide_react_1.ClipboardCheck, { className: "h-5 w-5 text-blue-500" }) }),
                React.createElement(stats_card_1.StatsCard, { label: "Pending", value: stats.pending, icon: React.createElement(lucide_react_1.Clock, { className: "h-5 w-5 text-amber-500" }) }),
                React.createElement(stats_card_1.StatsCard, { label: "In Progress", value: stats.inProgress, icon: React.createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5 text-purple-500" }) }),
                React.createElement(stats_card_1.StatsCard, { label: "Completed", value: stats.completed, icon: React.createElement(lucide_react_1.CheckCircle, { className: "h-5 w-5 text-green-500" }) }),
                React.createElement(stats_card_1.StatsCard, { label: "Avg Rating", value: Number(stats.averageRating || 0).toFixed(1), icon: React.createElement(lucide_react_1.Star, { className: "h-5 w-5 text-amber-400" }) })),
            React.createElement("div", { className: "flex items-center justify-between gap-4" },
                React.createElement(select_1.Select, { value: filterStatus, onValueChange: setFilterStatus },
                    React.createElement(select_1.SelectTrigger, { className: "w-40" },
                        React.createElement(select_1.SelectValue, null)),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "all" }, "All Statuses"),
                        STATUSES.map(function (s) { return React.createElement(select_1.SelectItem, { key: s.value, value: s.value }, s.label); }))),
                React.createElement(button_1.Button, { onClick: function () { setForm(emptyForm); setEditing(null); setShowForm(true); } },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                    " New Review")),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "p-0" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Employee"),
                                React.createElement(table_1.TableHead, null, "Reviewer"),
                                React.createElement(table_1.TableHead, null, "Rating"),
                                React.createElement(table_1.TableHead, null, "KPI Score"),
                                React.createElement(table_1.TableHead, null, "Review Date"),
                                React.createElement(table_1.TableHead, null, "Status"),
                                React.createElement(table_1.TableHead, null, "Strengths"),
                                React.createElement(table_1.TableHead, { className: "w-20" }, "Actions"))),
                        React.createElement(table_1.TableBody, null,
                            reviews.length === 0 && (React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableCell, { colSpan: 8, className: "text-center py-8 text-muted-foreground" }, "No performance reviews found"))),
                            reviews.map(function (r) {
                                var statusMeta = STATUSES.find(function (s) { return s.value === r.status; });
                                return (React.createElement(table_1.TableRow, { key: r.id },
                                    React.createElement(table_1.TableCell, { className: "font-medium" }, r.employeeName || r.employeeId),
                                    React.createElement(table_1.TableCell, null, r.reviewerName || r.reviewerId),
                                    React.createElement(table_1.TableCell, null,
                                        React.createElement(StarRating, { rating: r.rating || 0, readonly: true })),
                                    React.createElement(table_1.TableCell, null, r.kpiScore != null ? Number(r.kpiScore).toFixed(1) + "%" : "-"),
                                    React.createElement(table_1.TableCell, null, r.reviewDate ? new Date(r.reviewDate).toLocaleDateString() : "-"),
                                    React.createElement(table_1.TableCell, null,
                                        React.createElement(badge_1.Badge, { variant: (statusMeta === null || statusMeta === void 0 ? void 0 : statusMeta.variant) || "secondary" }, (statusMeta === null || statusMeta === void 0 ? void 0 : statusMeta.label) || r.status)),
                                    React.createElement(table_1.TableCell, { className: "max-w-[150px] truncate" }, r.strengths || "-"),
                                    React.createElement(table_1.TableCell, null,
                                        React.createElement("div", { className: "flex gap-1" },
                                            React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return openEdit(r); } },
                                                React.createElement(lucide_react_1.Pencil, { className: "h-4 w-4" })),
                                            React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { if (confirm("Delete this review?"))
                                                    deleteMut.mutate(r.id); } },
                                                React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4 text-red-500" }))))));
                            }))))),
            React.createElement(dialog_1.Dialog, { open: showForm, onOpenChange: function (v) { if (!v)
                    closeForm(); } },
                React.createElement(dialog_1.DialogContent, { className: "max-w-lg max-h-[85vh] overflow-y-auto" },
                    React.createElement(dialog_1.DialogHeader, null,
                        React.createElement(dialog_1.DialogTitle, null, editing ? "Edit Performance Review" : "New Performance Review")),
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                            React.createElement(EmployeeSelector_1.EmployeeSelector, { value: form.employeeId, onChange: function (v) { return setForm(__assign(__assign({}, form), { employeeId: v })); }, placeholder: "Select employee...", disabled: !!editing, label: "Employee", required: true }),
                            React.createElement(EmployeeSelector_1.EmployeeSelector, { value: form.reviewerId, onChange: function (v) { return setForm(__assign(__assign({}, form), { reviewerId: v })); }, placeholder: "Select reviewer...", label: "Reviewer", required: true })),
                        React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4" },
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "Rating"),
                                React.createElement("div", { className: "mt-2" },
                                    React.createElement(StarRating, { rating: Number(form.rating), onChange: function (r) { return setForm(__assign(__assign({}, form), { rating: r })); } }))),
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "KPI Score (%)"),
                                React.createElement(input_1.Input, { type: "number", min: 0, max: 100, step: 0.1, className: "mt-1", value: form.kpiScore, onChange: function (e) { return setForm(__assign(__assign({}, form), { kpiScore: e.target.value })); }, placeholder: "e.g. 85.5" })),
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "Status"),
                                React.createElement(select_1.Select, { value: form.status, onValueChange: function (v) { return setForm(__assign(__assign({}, form), { status: v })); } },
                                    React.createElement(select_1.SelectTrigger, { className: "mt-1" },
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null, STATUSES.map(function (s) { return React.createElement(select_1.SelectItem, { key: s.value, value: s.value }, s.label); }))))),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Review Date"),
                            React.createElement(input_1.Input, { type: "date", className: "mt-1", value: form.reviewDate, onChange: function (e) { return setForm(__assign(__assign({}, form), { reviewDate: e.target.value })); } })),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Strengths"),
                            React.createElement(textarea_1.Textarea, { className: "mt-1", rows: 2, value: form.strengths, onChange: function (e) { return setForm(__assign(__assign({}, form), { strengths: e.target.value })); }, placeholder: "Key strengths observed..." })),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Areas for Improvement"),
                            React.createElement(textarea_1.Textarea, { className: "mt-1", rows: 2, value: form.improvements, onChange: function (e) { return setForm(__assign(__assign({}, form), { improvements: e.target.value })); }, placeholder: "Areas needing improvement..." })),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Goals"),
                            React.createElement(textarea_1.Textarea, { className: "mt-1", rows: 2, value: form.goals, onChange: function (e) { return setForm(__assign(__assign({}, form), { goals: e.target.value })); }, placeholder: "Goals for next review period..." })),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Comments"),
                            React.createElement(textarea_1.Textarea, { className: "mt-1", rows: 2, value: form.comments, onChange: function (e) { return setForm(__assign(__assign({}, form), { comments: e.target.value })); }, placeholder: "Additional comments..." })),
                        React.createElement("div", { className: "flex justify-end gap-2 pt-2" },
                            React.createElement(button_1.Button, { variant: "outline", onClick: closeForm }, "Cancel"),
                            React.createElement(button_1.Button, { onClick: handleSubmit }, editing ? "Update" : "Create"))))))));
}
exports["default"] = PerformanceReviewsPage;
