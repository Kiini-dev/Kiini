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
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var dialog_1 = require("@/components/ui/dialog");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var badge_1 = require("@/components/ui/badge");
var textarea_1 = require("@/components/ui/textarea");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
var DashboardLayout_1 = require("@/components/DashboardLayout");
var sonner_1 = require("sonner");
function TimeTracking() {
    var _a, _b, _c;
    var _d = react_1.useState(false), openDialog = _d[0], setOpenDialog = _d[1];
    var _e = react_1.useState(false), isEditMode = _e[0], setIsEditMode = _e[1];
    var _f = react_1.useState(null), editingId = _f[0], setEditingId = _f[1];
    var _g = react_1.useState(null), deleteConfirmId = _g[0], setDeleteConfirmId = _g[1];
    // Form state
    var _h = react_1.useState({
        projectId: "",
        projectTaskId: "",
        entryDate: new Date().toISOString().split("T")[0],
        durationMinutes: 60,
        description: "",
        billable: true,
        hourlyRate: 0,
        notes: ""
    }), formData = _h[0], setFormData = _h[1];
    // Filter state
    var _j = react_1.useState(null), filterStatus = _j[0], setFilterStatus = _j[1];
    var _k = react_1.useState(null), filterProject = _k[0], setFilterProject = _k[1];
    var _l = react_1.useState(null), filterBillable = _l[0], setFilterBillable = _l[1];
    // Queries
    var projectsQuery = trpc_1.trpc.projects.list.useQuery(undefined);
    var entriesQuery = trpc_1.trpc.timeEntries.list.useQuery({
        projectId: filterProject || undefined,
        status: filterStatus || undefined,
        billable: filterBillable !== null ? filterBillable : undefined
    });
    // Get current date range for utilization report (last 30 days)
    var thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    var reportQuery = trpc_1.trpc.timeEntries.getUtilizationReport.useQuery({
        startDate: thirtyDaysAgo.toISOString(),
        endDate: new Date().toISOString(),
        projectId: filterProject || undefined
    });
    // Mutations
    var createMutation = trpc_1.trpc.timeEntries.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Time entry created");
            entriesQuery.refetch();
            reportQuery.refetch();
            resetForm();
            setOpenDialog(false);
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to create time entry");
        }
    });
    var updateMutation = trpc_1.trpc.timeEntries.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Time entry updated");
            entriesQuery.refetch();
            reportQuery.refetch();
            resetForm();
            setOpenDialog(false);
            setIsEditMode(false);
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to update time entry");
        }
    });
    var deleteMutation = trpc_1.trpc.timeEntries["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Time entry deleted");
            entriesQuery.refetch();
            reportQuery.refetch();
            setDeleteConfirmId(null);
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete time entry");
        }
    });
    var submitMutation = trpc_1.trpc.timeEntries.submit.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Time entry submitted for approval");
            entriesQuery.refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to submit time entry");
        }
    });
    var approveMutation = trpc_1.trpc.timeEntries.approve.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Time entry approved");
            entriesQuery.refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to approve time entry");
        }
    });
    // Helper functions
    var resetForm = function () {
        setFormData({
            projectId: "",
            projectTaskId: "",
            entryDate: new Date().toISOString().split("T")[0],
            durationMinutes: 60,
            description: "",
            billable: true,
            hourlyRate: 0,
            notes: ""
        });
        setIsEditMode(false);
        setEditingId(null);
    };
    var handleCreateOrUpdate = function () {
        if (!formData.projectId || !formData.description) {
            sonner_1.toast.error("Please fill in all required fields");
            return;
        }
        var dateString = formData.entryDate + "T12:00:00Z";
        if (isEditMode && editingId) {
            updateMutation.mutate({
                id: editingId,
                entryDate: dateString,
                durationMinutes: formData.durationMinutes,
                description: formData.description,
                billable: formData.billable,
                hourlyRate: formData.hourlyRate || undefined,
                notes: formData.notes || undefined
            });
        }
        else {
            createMutation.mutate({
                projectId: formData.projectId,
                projectTaskId: formData.projectTaskId || undefined,
                entryDate: dateString,
                durationMinutes: formData.durationMinutes,
                description: formData.description,
                billable: formData.billable,
                hourlyRate: formData.hourlyRate || undefined,
                notes: formData.notes || undefined
            });
        }
    };
    var handleEdit = function (entry) {
        setFormData({
            projectId: entry.projectId,
            projectTaskId: entry.projectTaskId || "",
            entryDate: entry.entryDate.split("T")[0],
            durationMinutes: entry.durationMinutes,
            description: entry.description,
            billable: entry.billable,
            hourlyRate: entry.hourlyRate || 0,
            notes: entry.notes || ""
        });
        setIsEditMode(true);
        setEditingId(entry.id);
        setOpenDialog(true);
    };
    var handleDelete = function (id) {
        deleteMutation.mutate(id);
    };
    var handleSubmit = function (id) {
        submitMutation.mutate(id);
    };
    var handleApprove = function (id) {
        approveMutation.mutate({ id: id, approve: true });
    };
    // Filtered entries
    var filteredEntries = entriesQuery.data || [];
    // Utility calculations
    var durationHours = formData.durationMinutes / 60;
    var estimatedAmount = formData.hourlyRate ? Math.round(durationHours * formData.hourlyRate) : 0;
    // Status badge color
    var getStatusColor = function (status) {
        switch (status) {
            case "draft":
                return "bg-gray-100 text-gray-800";
            case "submitted":
                return "bg-blue-100 text-blue-800";
            case "approved":
                return "bg-green-100 text-green-800";
            case "invoiced":
                return "bg-purple-100 text-purple-800";
            case "rejected":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    if (projectsQuery.isLoading) {
        return React.createElement("div", null, "Loading...");
    }
    var projects = projectsQuery.data || [];
    return (React.createElement(DashboardLayout_1["default"], null,
        React.createElement("div", { className: "space-y-6 p-6" },
            React.createElement("div", { className: "flex justify-between items-center" },
                React.createElement("h1", { className: "text-3xl font-bold" }, "Time Tracking"),
                React.createElement(dialog_1.Dialog, { open: openDialog, onOpenChange: setOpenDialog },
                    React.createElement(dialog_1.DialogTrigger, { asChild: true },
                        React.createElement(button_1.Button, { onClick: function () {
                                resetForm();
                                setOpenDialog(true);
                            }, className: "gap-2" },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                            " Log Time")),
                    React.createElement(dialog_1.DialogContent, { className: "max-w-md" },
                        React.createElement(dialog_1.DialogHeader, null,
                            React.createElement(dialog_1.DialogTitle, null, isEditMode ? "Edit Time Entry" : "Log New Time"),
                            React.createElement(dialog_1.DialogDescription, null, isEditMode
                                ? "Update your time entry details"
                                : "Record the time you spent working on a task")),
                        React.createElement("div", { className: "space-y-4" },
                            React.createElement("div", null,
                                React.createElement(label_1.Label, { htmlFor: "project" }, "Project *"),
                                React.createElement(select_1.Select, { value: formData.projectId, onValueChange: function (value) {
                                        return setFormData(__assign(__assign({}, formData), { projectId: value, projectTaskId: "" }));
                                    } },
                                    React.createElement(select_1.SelectTrigger, { id: "project" },
                                        React.createElement(select_1.SelectValue, { placeholder: "Select project" })),
                                    React.createElement(select_1.SelectContent, null, projects.map(function (p) { return (React.createElement(select_1.SelectItem, { key: p.id, value: p.id }, p.name || p.projectNumber)); })))),
                            formData.projectId && (React.createElement("div", null,
                                React.createElement(label_1.Label, { htmlFor: "task" }, "Task ID (optional)"),
                                React.createElement(input_1.Input, { id: "task", placeholder: "Enter task ID (optional)", value: formData.projectTaskId, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { projectTaskId: e.target.value })); } }))),
                            React.createElement("div", null,
                                React.createElement(label_1.Label, { htmlFor: "date" }, "Date *"),
                                React.createElement(input_1.Input, { id: "date", type: "date", value: formData.entryDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { entryDate: e.target.value })); } })),
                            React.createElement("div", null,
                                React.createElement(label_1.Label, { htmlFor: "duration" }, "Duration (minutes) *"),
                                React.createElement(input_1.Input, { id: "duration", type: "number", min: "1", max: "1440", value: formData.durationMinutes, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { durationMinutes: parseInt(e.target.value) || 0 }));
                                    } }),
                                React.createElement("p", { className: "text-sm text-muted-foreground mt-1" },
                                    durationHours.toFixed(2),
                                    " hours")),
                            React.createElement("div", null,
                                React.createElement(label_1.Label, { htmlFor: "description" }, "Description *"),
                                React.createElement(textarea_1.Textarea, { id: "description", placeholder: "What work did you do?", value: formData.description, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { description: e.target.value })); }, rows: 3 })),
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement("input", { type: "checkbox", id: "billable", checked: formData.billable, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { billable: e.target.checked })); } }),
                                React.createElement(label_1.Label, { htmlFor: "billable", className: "cursor-pointer" }, "Billable to client")),
                            formData.billable && (React.createElement("div", null,
                                React.createElement(label_1.Label, { htmlFor: "rate" }, "Hourly Rate (KES) (optional)"),
                                React.createElement(input_1.Input, { id: "rate", type: "number", min: "0", value: formData.hourlyRate, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { hourlyRate: parseInt(e.target.value) || 0 }));
                                    } }),
                                estimatedAmount > 0 && (React.createElement("p", { className: "text-sm text-muted-foreground mt-1" },
                                    "Estimated amount: KES ",
                                    estimatedAmount.toLocaleString())))),
                            React.createElement("div", null,
                                React.createElement(label_1.Label, { htmlFor: "notes" }, "Notes (optional)"),
                                React.createElement(textarea_1.Textarea, { id: "notes", placeholder: "Add any additional notes", value: formData.notes, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { notes: e.target.value })); }, rows: 2 })),
                            React.createElement(button_1.Button, { onClick: handleCreateOrUpdate, disabled: createMutation.isPending || updateMutation.isPending, className: "w-full" }, isEditMode ? "Update Entry" : "Log Time"))))),
            reportQuery.data && (React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-muted-foreground" }, "Total Hours (30d)")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" }, (reportQuery.data.totalMinutes / 60).toFixed(1)),
                        React.createElement("p", { className: "text-xs text-muted-foreground" },
                            reportQuery.data.entryCount,
                            " entries"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-muted-foreground" }, "Billable Hours")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" }, (reportQuery.data.billableMinutes / 60).toFixed(1)),
                        React.createElement("p", { className: "text-xs text-muted-foreground" },
                            reportQuery.data.utilization,
                            "% utilization"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-muted-foreground" }, "Billable Amount")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" },
                            "KES ",
                            (((_a = reportQuery.data) === null || _a === void 0 ? void 0 : _a.totalAmount) || 0).toLocaleString()),
                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "Across all entries"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-muted-foreground" }, "Pending Approval")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" }, ((_b = reportQuery.data) === null || _b === void 0 ? void 0 : _b.submittedCount) || 0),
                        React.createElement("p", { className: "text-xs text-muted-foreground" },
                            ((_c = reportQuery.data) === null || _c === void 0 ? void 0 : _c.draftCount) || 0,
                            " draft"))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-lg" }, "Filters")),
                React.createElement(card_1.CardContent, { className: "flex gap-4 flex-wrap" },
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { className: "text-xs mb-1" }, "Project"),
                        React.createElement(select_1.Select, { value: filterProject || "all", onValueChange: function (v) { return setFilterProject(v === "all" ? null : v); } },
                            React.createElement(select_1.SelectTrigger, { className: "w-40" },
                                React.createElement(select_1.SelectValue, { placeholder: "All projects" })),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "all" }, "All projects"),
                                projects.map(function (p) { return (React.createElement(select_1.SelectItem, { key: p.id, value: p.id }, p.name || p.projectNumber)); })))),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { className: "text-xs mb-1" }, "Status"),
                        React.createElement(select_1.Select, { value: filterStatus || "all", onValueChange: function (v) { return setFilterStatus(v === "all" ? null : v); } },
                            React.createElement(select_1.SelectTrigger, { className: "w-40" },
                                React.createElement(select_1.SelectValue, { placeholder: "All statuses" })),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "all" }, "All statuses"),
                                React.createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                                React.createElement(select_1.SelectItem, { value: "submitted" }, "Submitted"),
                                React.createElement(select_1.SelectItem, { value: "approved" }, "Approved"),
                                React.createElement(select_1.SelectItem, { value: "invoiced" }, "Invoiced"),
                                React.createElement(select_1.SelectItem, { value: "rejected" }, "Rejected")))),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { className: "text-xs mb-1" }, "Type"),
                        React.createElement(select_1.Select, { value: filterBillable === null ? "" : filterBillable ? "billable" : "non-billable", onValueChange: function (v) {
                                if (v === "")
                                    setFilterBillable(null);
                                else if (v === "billable")
                                    setFilterBillable(true);
                                else
                                    setFilterBillable(false);
                            } },
                            React.createElement(select_1.SelectTrigger, { className: "w-40" },
                                React.createElement(select_1.SelectValue, { placeholder: "All types" })),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "all" }, "All types"),
                                React.createElement(select_1.SelectItem, { value: "billable" }, "Billable"),
                                React.createElement(select_1.SelectItem, { value: "non-billable" }, "Non-billable")))))),
            React.createElement("div", { className: "space-y-3" },
                React.createElement("h2", { className: "text-xl font-semibold" }, "Time Entries"),
                entriesQuery.isLoading ? (React.createElement("p", null, "Loading entries...")) : filteredEntries.length === 0 ? (React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardContent, { className: "py-8 text-center text-muted-foreground" }, "No time entries found. Start by logging some time!"))) : (filteredEntries.map(function (entry) { return (React.createElement(card_1.Card, { key: entry.id },
                    React.createElement(card_1.CardContent, { className: "pt-6" },
                        React.createElement("div", { className: "flex justify-between items-start mb-3" },
                            React.createElement("div", { className: "flex-1" },
                                React.createElement("h3", { className: "font-semibold" }, entry.description),
                                React.createElement("p", { className: "text-sm text-muted-foreground" },
                                    utils_1.formatDate(entry.entryDate),
                                    " \u2022 ",
                                    entry.durationMinutes / 60,
                                    " hours")),
                            React.createElement("div", { className: "flex gap-2 items-center" },
                                React.createElement(badge_1.Badge, { className: "" + getStatusColor(entry.status) }, entry.status),
                                entry.billable && React.createElement(badge_1.Badge, { variant: "outline" }, "Billable"))),
                        entry.amount && entry.amount > 0 && (React.createElement("div", { className: "flex items-center gap-2 text-sm mb-3" },
                            React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4" }),
                            React.createElement("span", { className: "font-medium" },
                                "KES ",
                                entry.amount.toLocaleString()))),
                        entry.notes && (React.createElement("p", { className: "text-sm text-muted-foreground mb-3 p-2 bg-muted rounded" }, entry.notes)),
                        React.createElement("div", { className: "flex gap-2" },
                            entry.status === "draft" && (React.createElement(React.Fragment, null,
                                React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { return handleEdit(entry); } },
                                    React.createElement(lucide_react_1.Edit2, { className: "h-4 w-4 mr-1" }),
                                    " Edit"),
                                React.createElement(button_1.Button, { size: "sm", onClick: function () { return handleSubmit(entry.id); } }, "Submit"),
                                React.createElement(button_1.Button, { size: "sm", variant: "destructive", onClick: function () { return setDeleteConfirmId(entry.id); } },
                                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))),
                            entry.status === "submitted" && (React.createElement(button_1.Button, { size: "sm", onClick: function () { return handleApprove(entry.id); }, className: "bg-green-600 hover:bg-green-700" },
                                React.createElement(lucide_react_1.CheckCircle2, { className: "h-4 w-4 mr-1" }),
                                " Approve")))))); }))),
            React.createElement(alert_dialog_1.AlertDialog, { open: !!deleteConfirmId, onOpenChange: function (open) { return !open && setDeleteConfirmId(null); } },
                React.createElement(alert_dialog_1.AlertDialogContent, null,
                    React.createElement(alert_dialog_1.AlertDialogHeader, null,
                        React.createElement(alert_dialog_1.AlertDialogTitle, null, "Delete Time Entry?"),
                        React.createElement(alert_dialog_1.AlertDialogDescription, null, "This action cannot be undone. The time entry will be permanently deleted.")),
                    React.createElement(alert_dialog_1.AlertDialogAction, { onClick: function () { return deleteConfirmId && handleDelete(deleteConfirmId); }, className: "bg-destructive" }, "Delete"),
                    React.createElement(alert_dialog_1.AlertDialogCancel, null, "Cancel"))))));
}
exports["default"] = TimeTracking;
