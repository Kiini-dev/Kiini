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
var tabs_1 = require("@/components/ui/tabs");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var RowActionsMenu_1 = require("@/components/list-page/RowActionsMenu");
var JOB_STATUSES = [
    { value: "draft", label: "Draft" },
    { value: "open", label: "Open" },
    { value: "closed", label: "Closed" },
    { value: "on_hold", label: "On Hold" },
];
var JOB_TYPES = [
    { value: "full_time", label: "Full Time" },
    { value: "part_time", label: "Part Time" },
    { value: "contract", label: "Contract" },
    { value: "internship", label: "Internship" },
];
var APPLICANT_STAGES = [
    { value: "applied", label: "Applied", color: "bg-blue-100 text-blue-800" },
    { value: "screening", label: "Screening", color: "bg-yellow-100 text-yellow-800" },
    { value: "interview", label: "Interview", color: "bg-purple-100 text-purple-800" },
    { value: "assessment", label: "Assessment", color: "bg-indigo-100 text-indigo-800" },
    { value: "offer", label: "Offer", color: "bg-green-100 text-green-800" },
    { value: "hired", label: "Hired", color: "bg-emerald-100 text-emerald-800" },
    { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-800" },
];
function RecruitmentPage() {
    var _a = react_1.useState("postings"), tab = _a[0], setTab = _a[1];
    var _b = react_1.useState(false), showJobForm = _b[0], setShowJobForm = _b[1];
    var _c = react_1.useState(false), showAppForm = _c[0], setShowAppForm = _c[1];
    var _d = react_1.useState(null), editingJob = _d[0], setEditingJob = _d[1];
    var _e = react_1.useState(null), editingApp = _e[0], setEditingApp = _e[1];
    var _f = react_1.useState("all"), filterJobStatus = _f[0], setFilterJobStatus = _f[1];
    var _g = react_1.useState("all"), filterAppStage = _g[0], setFilterAppStage = _g[1];
    var statsQ = trpc_1.trpc.recruitment.stats.useQuery();
    var postingsQ = trpc_1.trpc.recruitment.listPostings.useQuery({ status: filterJobStatus === "all" ? undefined : filterJobStatus });
    var applicantsQ = trpc_1.trpc.recruitment.listApplicants.useQuery({ stage: filterAppStage === "all" ? undefined : filterAppStage });
    var createJobMut = trpc_1.trpc.recruitment.createPosting.useMutation({ onSuccess: function () { sonner_1.toast.success("Job posted"); postingsQ.refetch(); statsQ.refetch(); closeJobForm(); } });
    var updateJobMut = trpc_1.trpc.recruitment.updatePosting.useMutation({ onSuccess: function () { sonner_1.toast.success("Job updated"); postingsQ.refetch(); statsQ.refetch(); closeJobForm(); } });
    var deleteJobMut = trpc_1.trpc.recruitment.deletePosting.useMutation({ onSuccess: function () { sonner_1.toast.success("Job deleted"); postingsQ.refetch(); statsQ.refetch(); } });
    var createAppMut = trpc_1.trpc.recruitment.createApplicant.useMutation({ onSuccess: function () { sonner_1.toast.success("Applicant added"); applicantsQ.refetch(); statsQ.refetch(); closeAppForm(); } });
    var updateAppMut = trpc_1.trpc.recruitment.updateApplicant.useMutation({ onSuccess: function () { sonner_1.toast.success("Applicant updated"); applicantsQ.refetch(); statsQ.refetch(); closeAppForm(); } });
    var deleteAppMut = trpc_1.trpc.recruitment.deleteApplicant.useMutation({ onSuccess: function () { sonner_1.toast.success("Applicant removed"); applicantsQ.refetch(); statsQ.refetch(); } });
    // Job form
    var emptyJob = { title: "", department: "", location: "", type: "full_time", description: "", requirements: "", salaryMin: "", salaryMax: "", status: "draft", closingDate: "" };
    var _h = react_1.useState(emptyJob), jobForm = _h[0], setJobForm = _h[1];
    var closeJobForm = function () { setShowJobForm(false); setEditingJob(null); setJobForm(emptyJob); };
    // Applicant form
    var emptyApp = { jobPostingId: "", firstName: "", lastName: "", email: "", phone: "", resumeUrl: "", stage: "applied", notes: "" };
    var _j = react_1.useState(emptyApp), appForm = _j[0], setAppForm = _j[1];
    var closeAppForm = function () { setShowAppForm(false); setEditingApp(null); setAppForm(emptyApp); };
    var openEditJob = function (j) {
        var _a, _b;
        setEditingJob(j);
        setJobForm({
            title: j.title, department: j.department || "", location: j.location || "",
            type: j.type || "full_time", description: j.description || "", requirements: j.requirements || "",
            salaryMin: ((_a = j.salaryMin) === null || _a === void 0 ? void 0 : _a.toString()) || "", salaryMax: ((_b = j.salaryMax) === null || _b === void 0 ? void 0 : _b.toString()) || "",
            status: j.status || "draft", closingDate: j.closingDate ? j.closingDate.slice(0, 10) : ""
        });
        setShowJobForm(true);
    };
    var openEditApp = function (a) {
        setEditingApp(a);
        setAppForm({
            jobPostingId: a.jobPostingId, firstName: a.firstName, lastName: a.lastName,
            email: a.email || "", phone: a.phone || "", resumeUrl: a.resumeUrl || "",
            stage: a.stage || "applied", notes: a.notes || ""
        });
        setShowAppForm(true);
    };
    var stats = statsQ.data || { totalPostings: 0, openPostings: 0, totalApplicants: 0, hiredCount: 0 };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Recruitment", description: "Manage job postings and track applicants through the hiring pipeline", icon: React.createElement(lucide_react_1.Briefcase, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "HR", href: "/hr" }, { label: "Recruitment" }] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Postings", value: stats.totalPostings, icon: React.createElement(lucide_react_1.Briefcase, { className: "h-5 w-5 text-blue-500" }) }),
                React.createElement(stats_card_1.StatsCard, { label: "Open Positions", value: stats.openPostings, icon: React.createElement(lucide_react_1.Clock, { className: "h-5 w-5 text-amber-500" }) }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Applicants", value: stats.totalApplicants, icon: React.createElement(lucide_react_1.Users, { className: "h-5 w-5 text-purple-500" }) }),
                React.createElement(stats_card_1.StatsCard, { label: "Hired", value: stats.hiredCount, icon: React.createElement(lucide_react_1.CheckCircle, { className: "h-5 w-5 text-green-500" }) })),
            React.createElement(tabs_1.Tabs, { value: tab, onValueChange: setTab },
                React.createElement(tabs_1.TabsList, null,
                    React.createElement(tabs_1.TabsTrigger, { value: "postings" }, "Job Postings"),
                    React.createElement(tabs_1.TabsTrigger, { value: "applicants" }, "Applicants")),
                React.createElement(tabs_1.TabsContent, { value: "postings", className: "space-y-4" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement(select_1.Select, { value: filterJobStatus, onValueChange: setFilterJobStatus },
                            React.createElement(select_1.SelectTrigger, { className: "w-40" },
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "all" }, "All Statuses"),
                                JOB_STATUSES.map(function (s) { return React.createElement(select_1.SelectItem, { key: s.value, value: s.value }, s.label); }))),
                        React.createElement(button_1.Button, { onClick: function () { setJobForm(emptyJob); setEditingJob(null); setShowJobForm(true); } },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                            " New Job Posting")),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardContent, { className: "p-0" },
                            React.createElement(table_1.Table, null,
                                React.createElement(table_1.TableHeader, null,
                                    React.createElement(table_1.TableRow, null,
                                        React.createElement(table_1.TableHead, null, "Title"),
                                        React.createElement(table_1.TableHead, null, "Department"),
                                        React.createElement(table_1.TableHead, null, "Type"),
                                        React.createElement(table_1.TableHead, null, "Location"),
                                        React.createElement(table_1.TableHead, null, "Status"),
                                        React.createElement(table_1.TableHead, null, "Closing Date"),
                                        React.createElement(table_1.TableHead, { className: "w-20" }, "Actions"))),
                                React.createElement(table_1.TableBody, null,
                                    (postingsQ.data || []).length === 0 && (React.createElement(table_1.TableRow, null,
                                        React.createElement(table_1.TableCell, { colSpan: 7, className: "text-center py-8 text-muted-foreground" }, "No job postings found"))),
                                    (postingsQ.data || []).map(function (j) {
                                        var _a, _b;
                                        return (React.createElement(table_1.TableRow, { key: j.id },
                                            React.createElement(table_1.TableCell, { className: "font-medium" }, j.title),
                                            React.createElement(table_1.TableCell, null, j.department || "-"),
                                            React.createElement(table_1.TableCell, null,
                                                React.createElement(badge_1.Badge, { variant: "outline" }, ((_a = JOB_TYPES.find(function (t) { return t.value === j.type; })) === null || _a === void 0 ? void 0 : _a.label) || j.type)),
                                            React.createElement(table_1.TableCell, null, j.location || "-"),
                                            React.createElement(table_1.TableCell, null,
                                                React.createElement(badge_1.Badge, { variant: j.status === "open" ? "default" : "secondary" }, ((_b = JOB_STATUSES.find(function (s) { return s.value === j.status; })) === null || _b === void 0 ? void 0 : _b.label) || j.status)),
                                            React.createElement(table_1.TableCell, null, j.closingDate ? new Date(j.closingDate).toLocaleDateString() : "-"),
                                            React.createElement(table_1.TableCell, null,
                                                React.createElement(RowActionsMenu_1.RowActionsMenu, { menuActions: [{ label: "Edit", icon: React.createElement(lucide_react_1.Pencil, { className: "h-4 w-4" }), onClick: function () { return openEditJob(j); } }, { label: "Delete", icon: React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }), onClick: function () { if (confirm("Delete posting?"))
                                                                deleteJobMut.mutate({ id: j.id }); }, variant: "destructive", separator: true }] }))));
                                    })))))),
                React.createElement(tabs_1.TabsContent, { value: "applicants", className: "space-y-4" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement(select_1.Select, { value: filterAppStage, onValueChange: setFilterAppStage },
                            React.createElement(select_1.SelectTrigger, { className: "w-40" },
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "all" }, "All Stages"),
                                APPLICANT_STAGES.map(function (s) { return React.createElement(select_1.SelectItem, { key: s.value, value: s.value }, s.label); }))),
                        React.createElement(button_1.Button, { onClick: function () { setAppForm(emptyApp); setEditingApp(null); setShowAppForm(true); } },
                            React.createElement(lucide_react_1.UserPlus, { className: "h-4 w-4 mr-2" }),
                            " Add Applicant")),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardContent, { className: "p-0" },
                            React.createElement(table_1.Table, null,
                                React.createElement(table_1.TableHeader, null,
                                    React.createElement(table_1.TableRow, null,
                                        React.createElement(table_1.TableHead, null, "Name"),
                                        React.createElement(table_1.TableHead, null, "Email"),
                                        React.createElement(table_1.TableHead, null, "Job Posting"),
                                        React.createElement(table_1.TableHead, null, "Stage"),
                                        React.createElement(table_1.TableHead, null, "Applied"),
                                        React.createElement(table_1.TableHead, { className: "w-20" }, "Actions"))),
                                React.createElement(table_1.TableBody, null,
                                    (applicantsQ.data || []).length === 0 && (React.createElement(table_1.TableRow, null,
                                        React.createElement(table_1.TableCell, { colSpan: 6, className: "text-center py-8 text-muted-foreground" }, "No applicants found"))),
                                    (applicantsQ.data || []).map(function (a) {
                                        var stageMeta = APPLICANT_STAGES.find(function (s) { return s.value === a.stage; });
                                        return (React.createElement(table_1.TableRow, { key: a.id },
                                            React.createElement(table_1.TableCell, { className: "font-medium" },
                                                a.firstName,
                                                " ",
                                                a.lastName),
                                            React.createElement(table_1.TableCell, null, a.email || "-"),
                                            React.createElement(table_1.TableCell, null, a.jobTitle || "-"),
                                            React.createElement(table_1.TableCell, null,
                                                React.createElement("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium " + ((stageMeta === null || stageMeta === void 0 ? void 0 : stageMeta.color) || "bg-gray-100 text-gray-800") }, (stageMeta === null || stageMeta === void 0 ? void 0 : stageMeta.label) || a.stage)),
                                            React.createElement(table_1.TableCell, null, a.appliedDate ? new Date(a.appliedDate).toLocaleDateString() : "-"),
                                            React.createElement(table_1.TableCell, null,
                                                React.createElement(RowActionsMenu_1.RowActionsMenu, { menuActions: [{ label: "Edit", icon: React.createElement(lucide_react_1.Pencil, { className: "h-4 w-4" }), onClick: function () { return openEditApp(a); } }, { label: "Delete", icon: React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }), onClick: function () { if (confirm("Delete applicant?"))
                                                                deleteAppMut.mutate({ id: a.id }); }, variant: "destructive", separator: true }] }))));
                                    }))))))),
            React.createElement(dialog_1.Dialog, { open: showJobForm, onOpenChange: function (v) { if (!v)
                    closeJobForm(); } },
                React.createElement(dialog_1.DialogContent, { className: "max-w-lg max-h-[85vh] overflow-y-auto" },
                    React.createElement(dialog_1.DialogHeader, null,
                        React.createElement(dialog_1.DialogTitle, null, editingJob ? "Edit Job Posting" : "New Job Posting")),
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Title *"),
                            React.createElement(input_1.Input, { className: "mt-1", value: jobForm.title, onChange: function (e) { return setJobForm(__assign(__assign({}, jobForm), { title: e.target.value })); } })),
                        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "Department"),
                                React.createElement(input_1.Input, { className: "mt-1", value: jobForm.department, onChange: function (e) { return setJobForm(__assign(__assign({}, jobForm), { department: e.target.value })); } })),
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "Location"),
                                React.createElement(input_1.Input, { className: "mt-1", value: jobForm.location, onChange: function (e) { return setJobForm(__assign(__assign({}, jobForm), { location: e.target.value })); } }))),
                        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "Job Type"),
                                React.createElement(select_1.Select, { value: jobForm.type, onValueChange: function (v) { return setJobForm(__assign(__assign({}, jobForm), { type: v })); } },
                                    React.createElement(select_1.SelectTrigger, { className: "mt-1" },
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null, JOB_TYPES.map(function (t) { return React.createElement(select_1.SelectItem, { key: t.value, value: t.value }, t.label); })))),
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "Status"),
                                React.createElement(select_1.Select, { value: jobForm.status, onValueChange: function (v) { return setJobForm(__assign(__assign({}, jobForm), { status: v })); } },
                                    React.createElement(select_1.SelectTrigger, { className: "mt-1" },
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null, JOB_STATUSES.map(function (s) { return React.createElement(select_1.SelectItem, { key: s.value, value: s.value }, s.label); }))))),
                        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "Salary Min"),
                                React.createElement(input_1.Input, { type: "number", className: "mt-1", value: jobForm.salaryMin, onChange: function (e) { return setJobForm(__assign(__assign({}, jobForm), { salaryMin: e.target.value })); } })),
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "Salary Max"),
                                React.createElement(input_1.Input, { type: "number", className: "mt-1", value: jobForm.salaryMax, onChange: function (e) { return setJobForm(__assign(__assign({}, jobForm), { salaryMax: e.target.value })); } }))),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Closing Date"),
                            React.createElement(input_1.Input, { type: "date", className: "mt-1", value: jobForm.closingDate, onChange: function (e) { return setJobForm(__assign(__assign({}, jobForm), { closingDate: e.target.value })); } })),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Description"),
                            React.createElement(textarea_1.Textarea, { className: "mt-1", rows: 3, value: jobForm.description, onChange: function (e) { return setJobForm(__assign(__assign({}, jobForm), { description: e.target.value })); } })),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Requirements"),
                            React.createElement(textarea_1.Textarea, { className: "mt-1", rows: 3, value: jobForm.requirements, onChange: function (e) { return setJobForm(__assign(__assign({}, jobForm), { requirements: e.target.value })); } })),
                        React.createElement("div", { className: "flex justify-end gap-2 pt-2" },
                            React.createElement(button_1.Button, { variant: "outline", onClick: closeJobForm }, "Cancel"),
                            React.createElement(button_1.Button, { onClick: function () {
                                    if (!jobForm.title) {
                                        sonner_1.toast.error("Job title is required");
                                        return;
                                    }
                                    var data = __assign(__assign({}, jobForm), { salaryMin: jobForm.salaryMin ? Number(jobForm.salaryMin) : undefined, salaryMax: jobForm.salaryMax ? Number(jobForm.salaryMax) : undefined });
                                    if (editingJob)
                                        updateJobMut.mutate(__assign({ id: editingJob.id }, data));
                                    else
                                        createJobMut.mutate(data);
                                } }, editingJob ? "Update" : "Create"))))),
            React.createElement(dialog_1.Dialog, { open: showAppForm, onOpenChange: function (v) { if (!v)
                    closeAppForm(); } },
                React.createElement(dialog_1.DialogContent, { className: "max-w-lg" },
                    React.createElement(dialog_1.DialogHeader, null,
                        React.createElement(dialog_1.DialogTitle, null, editingApp ? "Edit Applicant" : "Add Applicant")),
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Job Posting *"),
                            React.createElement("select", { className: "w-full mt-1 border rounded-md px-3 py-2 text-sm", value: appForm.jobPostingId, onChange: function (e) { return setAppForm(__assign(__assign({}, appForm), { jobPostingId: e.target.value })); } },
                                React.createElement("option", { value: "" }, "Select job posting..."),
                                (postingsQ.data || []).map(function (j) { return React.createElement("option", { key: j.id, value: j.id }, j.title); }))),
                        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "First Name *"),
                                React.createElement(input_1.Input, { className: "mt-1", value: appForm.firstName, onChange: function (e) { return setAppForm(__assign(__assign({}, appForm), { firstName: e.target.value })); } })),
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "Last Name *"),
                                React.createElement(input_1.Input, { className: "mt-1", value: appForm.lastName, onChange: function (e) { return setAppForm(__assign(__assign({}, appForm), { lastName: e.target.value })); } }))),
                        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "Email"),
                                React.createElement(input_1.Input, { type: "email", className: "mt-1", value: appForm.email, onChange: function (e) { return setAppForm(__assign(__assign({}, appForm), { email: e.target.value })); } })),
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "Phone"),
                                React.createElement(input_1.Input, { className: "mt-1", value: appForm.phone, onChange: function (e) { return setAppForm(__assign(__assign({}, appForm), { phone: e.target.value })); } }))),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Stage"),
                            React.createElement(select_1.Select, { value: appForm.stage, onValueChange: function (v) { return setAppForm(__assign(__assign({}, appForm), { stage: v })); } },
                                React.createElement(select_1.SelectTrigger, { className: "mt-1" },
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null, APPLICANT_STAGES.map(function (s) { return React.createElement(select_1.SelectItem, { key: s.value, value: s.value }, s.label); })))),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Notes"),
                            React.createElement(textarea_1.Textarea, { className: "mt-1", rows: 2, value: appForm.notes, onChange: function (e) { return setAppForm(__assign(__assign({}, appForm), { notes: e.target.value })); } })),
                        React.createElement("div", { className: "flex justify-end gap-2 pt-2" },
                            React.createElement(button_1.Button, { variant: "outline", onClick: closeAppForm }, "Cancel"),
                            React.createElement(button_1.Button, { onClick: function () {
                                    if (!appForm.jobPostingId || !appForm.firstName || !appForm.lastName) {
                                        sonner_1.toast.error("Job posting, first name, and last name are required");
                                        return;
                                    }
                                    if (editingApp)
                                        updateAppMut.mutate(__assign({ id: editingApp.id }, appForm));
                                    else
                                        createAppMut.mutate(appForm);
                                } }, editingApp ? "Update" : "Add"))))))));
}
exports["default"] = RecruitmentPage;
