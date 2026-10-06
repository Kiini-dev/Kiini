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
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var textarea_1 = require("@/components/ui/textarea");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var sonner_1 = require("sonner");
var date_fns_1 = require("date-fns");
var stats_card_1 = require("@/components/ui/stats-card");
var currency_1 = require("@/lib/currency");
function Training() {
    var _a, _b, _c, _d, _e, _f, _g;
    permissions_1.useRequireFeature("hr:view");
    var formatAmount = currency_1.useCurrencySettings().formatAmount;
    var _h = react_1.useState("programs"), activeTab = _h[0], setActiveTab = _h[1];
    var _j = react_1.useState(""), search = _j[0], setSearch = _j[1];
    var _k = react_1.useState(false), showForm = _k[0], setShowForm = _k[1];
    var _l = react_1.useState(null), editId = _l[0], setEditId = _l[1];
    var _m = react_1.useState(null), deleteId = _m[0], setDeleteId = _m[1];
    var _o = react_1.useState(null), showEnroll = _o[0], setShowEnroll = _o[1];
    var _p = react_1.useState([]), enrolleeIds = _p[0], setEnrolleeIds = _p[1];
    var _q = react_1.useState(null), selectedProgram = _q[0], setSelectedProgram = _q[1];
    var _r = react_1.useState({
        name: "", description: "", category: "", trainer: "",
        startDate: "", endDate: "", maxParticipants: 0, cost: 0,
        location: "", isOnline: false, isMandatory: false
    }), form = _r[0], setForm = _r[1];
    var programs = trpc_1.trpc.training.listPrograms.useQuery();
    var programDetail = trpc_1.trpc.training.getProgram.useQuery({ id: selectedProgram }, { enabled: !!selectedProgram });
    var stats = trpc_1.trpc.training.stats.useQuery();
    var employees = trpc_1.trpc.employees.list.useQuery();
    var utils = trpc_1.trpc.useUtils();
    var createProgram = trpc_1.trpc.training.createProgram.useMutation({
        onSuccess: function () { sonner_1.toast.success("Program created"); closeForm(); utils.training.listPrograms.invalidate(); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var updateProgram = trpc_1.trpc.training.updateProgram.useMutation({
        onSuccess: function () { sonner_1.toast.success("Program updated"); closeForm(); utils.training.listPrograms.invalidate(); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var deleteProgram = trpc_1.trpc.training.deleteProgram.useMutation({
        onSuccess: function () { sonner_1.toast.success("Deleted"); setDeleteId(null); utils.training.listPrograms.invalidate(); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var enroll = trpc_1.trpc.training.enroll.useMutation({
        onSuccess: function (data) {
            sonner_1.toast.success("Enrolled " + data.enrolled + " employees");
            setShowEnroll(null);
            setEnrolleeIds([]);
            utils.training.listPrograms.invalidate();
            utils.training.getProgram.invalidate();
        },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var updateEnrollment = trpc_1.trpc.training.updateEnrollment.useMutation({
        onSuccess: function () { sonner_1.toast.success("Updated"); utils.training.getProgram.invalidate(); utils.training.stats.invalidate(); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var closeForm = function () {
        setShowForm(false);
        setEditId(null);
        setForm({ name: "", description: "", category: "", trainer: "", startDate: "", endDate: "", maxParticipants: 0, cost: 0, location: "", isOnline: false, isMandatory: false });
    };
    var openEdit = function (p) {
        setEditId(p.id);
        setForm({
            name: p.name, description: p.description || "", category: p.category || "",
            trainer: p.trainer || "", startDate: (p.startDate || "").split("T")[0],
            endDate: (p.endDate || "").split("T")[0], maxParticipants: p.maxParticipants || 0,
            cost: p.cost || 0, location: p.location || "",
            isOnline: !!p.isOnline, isMandatory: !!p.isMandatory
        });
        setShowForm(true);
    };
    var handleSave = function () {
        if (editId) {
            updateProgram.mutate(__assign(__assign({ id: editId }, form), { maxParticipants: form.maxParticipants || undefined, cost: form.cost || undefined }));
        }
        else {
            createProgram.mutate(__assign(__assign({}, form), { maxParticipants: form.maxParticipants || undefined, cost: form.cost || undefined }));
        }
    };
    var filtered = (programs.data || []).filter(function (p) {
        return !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.category || "").toLowerCase().includes(search.toLowerCase());
    });
    var activePrograms = ((_b = (((_a = stats.data) === null || _a === void 0 ? void 0 : _a.programs) || []).find(function (s) { return s.status === "active"; })) === null || _b === void 0 ? void 0 : _b.cnt) || 0;
    var completedEnrollments = ((_d = (((_c = stats.data) === null || _c === void 0 ? void 0 : _c.enrollments) || []).find(function (s) { return s.status === "completed"; })) === null || _d === void 0 ? void 0 : _d.cnt) || 0;
    var totalEnrollments = (((_e = stats.data) === null || _e === void 0 ? void 0 : _e.enrollments) || []).reduce(function (sum, s) { return sum + Number(s.cnt || 0); }, 0);
    var statusColors = { active: "default", completed: "secondary", cancelled: "destructive", draft: "outline" };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Training Management", description: "Manage training programs and employee enrollments", icon: lucide_react_1.GraduationCap, breadcrumbs: [{ label: "HR", href: "/employees" }, { label: "Training" }] },
        React.createElement("div", { className: "grid gap-4 md:grid-cols-4 mb-6" },
            React.createElement(stats_card_1.StatsCard, { label: "Active Programs", value: activePrograms, icon: React.createElement(lucide_react_1.BookOpen, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
            React.createElement(stats_card_1.StatsCard, { label: "Total Enrollments", value: totalEnrollments, icon: React.createElement(lucide_react_1.Users, { className: "h-5 w-5" }), color: "border-l-green-500" }),
            React.createElement(stats_card_1.StatsCard, { label: "Completed", value: completedEnrollments, icon: React.createElement(lucide_react_1.Award, { className: "h-5 w-5" }), color: "border-l-purple-500" }),
            React.createElement(stats_card_1.StatsCard, { label: "Programs", value: (programs.data || []).length, icon: React.createElement(lucide_react_1.BarChart3, { className: "h-5 w-5" }), color: "border-l-orange-500" })),
        React.createElement("div", { className: "flex items-center gap-3 mb-4" },
            React.createElement("div", { className: "relative flex-1 max-w-sm" },
                React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                React.createElement(input_1.Input, { placeholder: "Search programs...", value: search, onChange: function (e) { return setSearch(e.target.value); }, className: "pl-9" })),
            React.createElement(button_1.Button, { onClick: function () { return setShowForm(true); } },
                React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                " New Program")),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardContent, { className: "p-0" }, programs.isLoading ? (React.createElement("div", { className: "flex justify-center p-8" },
                React.createElement(spinner_1.Spinner, null))) : (React.createElement("div", { className: "overflow-x-auto" },
                React.createElement(table_1.Table, null,
                    React.createElement(table_1.TableHeader, null,
                        React.createElement(table_1.TableRow, null,
                            React.createElement(table_1.TableHead, null, "Name"),
                            React.createElement(table_1.TableHead, null, "Category"),
                            React.createElement(table_1.TableHead, null, "Trainer"),
                            React.createElement(table_1.TableHead, null, "Dates"),
                            React.createElement(table_1.TableHead, null, "Enrolled"),
                            React.createElement(table_1.TableHead, null, "Type"),
                            React.createElement(table_1.TableHead, null, "Status"),
                            React.createElement(table_1.TableHead, null, "Actions"))),
                    React.createElement(table_1.TableBody, null, filtered.length === 0 ? (React.createElement(table_1.TableRow, null,
                        React.createElement(table_1.TableCell, { colSpan: 8, className: "text-center py-8 text-muted-foreground" }, "No training programs found"))) : filtered.map(function (p) { return (React.createElement(table_1.TableRow, { key: p.id, className: "cursor-pointer", onClick: function () { return setSelectedProgram(p.id); } },
                        React.createElement(table_1.TableCell, { className: "font-medium" },
                            p.name,
                            p.isMandatory ? React.createElement(badge_1.Badge, { variant: "destructive", className: "ml-2 text-xs" }, "Mandatory") : null),
                        React.createElement(table_1.TableCell, null, p.category || "-"),
                        React.createElement(table_1.TableCell, null, p.trainer || "-"),
                        React.createElement(table_1.TableCell, null,
                            p.startDate ? date_fns_1.format(new Date(p.startDate), "MMM d") : "-",
                            p.endDate ? " - " + date_fns_1.format(new Date(p.endDate), "MMM d, yyyy") : ""),
                        React.createElement(table_1.TableCell, null,
                            p.enrollmentCount || 0,
                            p.maxParticipants ? "/" + p.maxParticipants : ""),
                        React.createElement(table_1.TableCell, null,
                            React.createElement(badge_1.Badge, { variant: "outline" }, p.isOnline ? "Online" : "In-person")),
                        React.createElement(table_1.TableCell, null,
                            React.createElement(badge_1.Badge, { variant: statusColors[p.status] || "outline" }, p.status)),
                        React.createElement(table_1.TableCell, { className: "flex gap-1", onClick: function (e) { return e.stopPropagation(); } },
                            React.createElement(button_1.Button, { size: "icon", variant: "ghost", onClick: function () { return setShowEnroll(p.id); }, title: "Enroll" },
                                React.createElement(lucide_react_1.UserPlus, { className: "h-4 w-4" })),
                            React.createElement(button_1.Button, { size: "icon", variant: "ghost", onClick: function () { return openEdit(p); }, title: "Edit" },
                                React.createElement(lucide_react_1.Edit2, { className: "h-4 w-4" })),
                            React.createElement(button_1.Button, { size: "icon", variant: "ghost", className: "text-destructive", onClick: function () { return setDeleteId(p.id); }, title: "Delete" },
                                React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))))); }))))))),
        React.createElement(dialog_1.Dialog, { open: !!selectedProgram, onOpenChange: function () { return setSelectedProgram(null); } },
            React.createElement(dialog_1.DialogContent, { className: "max-w-2xl max-h-[80vh] overflow-y-auto" },
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, ((_f = programDetail.data) === null || _f === void 0 ? void 0 : _f.name) || "Program Details"),
                    React.createElement(dialog_1.DialogDescription, null, (_g = programDetail.data) === null || _g === void 0 ? void 0 : _g.description)),
                programDetail.isLoading ? React.createElement(spinner_1.Spinner, null) : programDetail.data && (React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", { className: "grid grid-cols-2 gap-2 text-sm" },
                        React.createElement("div", null, "Category"),
                        React.createElement("div", { className: "font-medium" }, programDetail.data.category || "-"),
                        React.createElement("div", null, "Trainer"),
                        React.createElement("div", { className: "font-medium" }, programDetail.data.trainer || "-"),
                        React.createElement("div", null, "Location"),
                        React.createElement("div", { className: "font-medium" }, programDetail.data.location || "-"),
                        React.createElement("div", null, "Cost"),
                        React.createElement("div", { className: "font-medium" }, programDetail.data.cost ? formatAmount(programDetail.data.cost) : "-")),
                    React.createElement("hr", null),
                    React.createElement("h4", { className: "font-semibold" },
                        "Enrollments (",
                        (programDetail.data.enrollments || []).length,
                        ")"),
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Employee"),
                                React.createElement(table_1.TableHead, null, "Department"),
                                React.createElement(table_1.TableHead, null, "Status"),
                                React.createElement(table_1.TableHead, null, "Score"),
                                React.createElement(table_1.TableHead, null, "Actions"))),
                        React.createElement(table_1.TableBody, null, (programDetail.data.enrollments || []).length === 0 ? (React.createElement(table_1.TableRow, null,
                            React.createElement(table_1.TableCell, { colSpan: 5, className: "text-center py-4 text-muted-foreground" }, "No enrollments yet"))) : (programDetail.data.enrollments || []).map(function (e) { return (React.createElement(table_1.TableRow, { key: e.id },
                            React.createElement(table_1.TableCell, null,
                                e.firstName,
                                " ",
                                e.lastName),
                            React.createElement(table_1.TableCell, null, e.department || "-"),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(select_1.Select, { value: e.status, onValueChange: function (v) { return updateEnrollment.mutate({ id: e.id, status: v }); } },
                                    React.createElement(select_1.SelectTrigger, { className: "w-[130px] h-8" },
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "enrolled" }, "Enrolled"),
                                        React.createElement(select_1.SelectItem, { value: "in_progress" }, "In Progress"),
                                        React.createElement(select_1.SelectItem, { value: "completed" }, "Completed"),
                                        React.createElement(select_1.SelectItem, { value: "dropped" }, "Dropped"),
                                        React.createElement(select_1.SelectItem, { value: "failed" }, "Failed")))),
                            React.createElement(table_1.TableCell, null, e.score || "-"),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(button_1.Button, { size: "sm", variant: "ghost", className: "text-destructive", onClick: function () {
                                        // remove enrollment handled inline
                                    } }, "Remove")))); }))))))),
        React.createElement(dialog_1.Dialog, { open: showForm, onOpenChange: closeForm },
            React.createElement(dialog_1.DialogContent, { className: "max-w-lg max-h-[80vh] overflow-y-auto" },
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, editId ? "Edit Program" : "New Training Program")),
                React.createElement("div", { className: "space-y-3" },
                    React.createElement(input_1.Input, { placeholder: "Program name *", value: form.name, onChange: function (e) { return setForm(function (p) { return (__assign(__assign({}, p), { name: e.target.value })); }); } }),
                    React.createElement(textarea_1.Textarea, { placeholder: "Description", value: form.description, onChange: function (e) { return setForm(function (p) { return (__assign(__assign({}, p), { description: e.target.value })); }); }, rows: 3 }),
                    React.createElement("div", { className: "grid grid-cols-2 gap-3" },
                        React.createElement(input_1.Input, { placeholder: "Category", value: form.category, onChange: function (e) { return setForm(function (p) { return (__assign(__assign({}, p), { category: e.target.value })); }); } }),
                        React.createElement(input_1.Input, { placeholder: "Trainer", value: form.trainer, onChange: function (e) { return setForm(function (p) { return (__assign(__assign({}, p), { trainer: e.target.value })); }); } })),
                    React.createElement("div", { className: "grid grid-cols-2 gap-3" },
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-xs font-medium" }, "Start Date"),
                            React.createElement(input_1.Input, { type: "date", value: form.startDate, onChange: function (e) { return setForm(function (p) { return (__assign(__assign({}, p), { startDate: e.target.value })); }); } })),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-xs font-medium" }, "End Date"),
                            React.createElement(input_1.Input, { type: "date", value: form.endDate, onChange: function (e) { return setForm(function (p) { return (__assign(__assign({}, p), { endDate: e.target.value })); }); } }))),
                    React.createElement("div", { className: "grid grid-cols-2 gap-3" },
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-xs font-medium" }, "Max Participants"),
                            React.createElement(input_1.Input, { type: "number", value: form.maxParticipants || "", onChange: function (e) { return setForm(function (p) { return (__assign(__assign({}, p), { maxParticipants: Number(e.target.value) || 0 })); }); } })),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-xs font-medium" }, "Cost"),
                            React.createElement(input_1.Input, { type: "number", value: form.cost || "", onChange: function (e) { return setForm(function (p) { return (__assign(__assign({}, p), { cost: Number(e.target.value) || 0 })); }); } }))),
                    React.createElement(input_1.Input, { placeholder: "Location", value: form.location, onChange: function (e) { return setForm(function (p) { return (__assign(__assign({}, p), { location: e.target.value })); }); } }),
                    React.createElement("div", { className: "flex gap-6" },
                        React.createElement("label", { className: "flex items-center gap-2 text-sm" },
                            React.createElement("input", { type: "checkbox", checked: form.isOnline, onChange: function (e) { return setForm(function (p) { return (__assign(__assign({}, p), { isOnline: e.target.checked })); }); } }),
                            " Online"),
                        React.createElement("label", { className: "flex items-center gap-2 text-sm" },
                            React.createElement("input", { type: "checkbox", checked: form.isMandatory, onChange: function (e) { return setForm(function (p) { return (__assign(__assign({}, p), { isMandatory: e.target.checked })); }); } }),
                            " Mandatory")),
                    React.createElement(button_1.Button, { className: "w-full", disabled: !form.name || createProgram.isPending || updateProgram.isPending, onClick: handleSave },
                        (createProgram.isPending || updateProgram.isPending) ? React.createElement(spinner_1.Spinner, { className: "mr-2" }) : null,
                        editId ? "Update" : "Create",
                        " Program")))),
        React.createElement(dialog_1.Dialog, { open: !!showEnroll, onOpenChange: function () { setShowEnroll(null); setEnrolleeIds([]); } },
            React.createElement(dialog_1.DialogContent, null,
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "Enroll Employees"),
                    React.createElement(dialog_1.DialogDescription, null, "Select employees to enroll in this program")),
                React.createElement("div", { className: "max-h-[400px] overflow-y-auto space-y-2" }, (employees.data || []).map(function (e) { return (React.createElement("label", { key: e.id, className: "flex items-center gap-3 p-2 border rounded hover:bg-muted/50 cursor-pointer" },
                    React.createElement("input", { type: "checkbox", checked: enrolleeIds.includes(e.id), onChange: function (ev) {
                            setEnrolleeIds(function (prev) { return ev.target.checked ? __spreadArrays(prev, [e.id]) : prev.filter(function (i) { return i !== e.id; }); });
                        } }),
                    React.createElement("div", null,
                        React.createElement("div", { className: "font-medium text-sm" },
                            e.firstName,
                            " ",
                            e.lastName),
                        React.createElement("div", { className: "text-xs text-muted-foreground" },
                            e.department,
                            " - ",
                            e.position)))); })),
                React.createElement(button_1.Button, { className: "w-full", disabled: enrolleeIds.length === 0 || enroll.isPending, onClick: function () { return showEnroll && enroll.mutate({ programId: showEnroll, employeeIds: enrolleeIds }); } },
                    enroll.isPending ? React.createElement(spinner_1.Spinner, { className: "mr-2" }) : null,
                    "Enroll ",
                    enrolleeIds.length,
                    " Employee",
                    enrolleeIds.length !== 1 ? "s" : ""))),
        React.createElement(alert_dialog_1.AlertDialog, { open: !!deleteId, onOpenChange: function () { return setDeleteId(null); } },
            React.createElement(alert_dialog_1.AlertDialogContent, null,
                React.createElement(alert_dialog_1.AlertDialogTitle, null, "Delete Program?"),
                React.createElement(alert_dialog_1.AlertDialogDescription, null, "This will also remove all enrollments. This cannot be undone."),
                React.createElement("div", { className: "flex justify-end gap-2" },
                    React.createElement(alert_dialog_1.AlertDialogCancel, null, "Cancel"),
                    React.createElement(alert_dialog_1.AlertDialogAction, { onClick: function () { return deleteId && deleteProgram.mutate({ id: deleteId }); } }, "Delete"))))));
}
exports["default"] = Training;
