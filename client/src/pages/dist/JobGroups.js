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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var sonner_1 = require("sonner");
var date_fns_1 = require("date-fns");
var currency_1 = require("@/lib/currency");
var data_table_controls_1 = require("@/components/ui/data-table-controls");
function JobGroups() {
    var _this = this;
    var _a;
    var currencyCode = currency_1.useCurrencySettings().code;
    var _b = permissions_1.useRequireFeature("jobGroups:read"), allowed = _b.allowed, permissionLoading = _b.isLoading;
    var _c = wouter_1.useLocation(), navigate = _c[1];
    var _d = react_1.useState(""), searchQuery = _d[0], setSearchQuery = _d[1];
    var _e = data_table_controls_1.usePagination(25), page = _e.page, pageSize = _e.pageSize, setPage = _e.setPage, setPageSize = _e.setPageSize, paginate = _e.paginate;
    var _f = react_1.useState(false), isCreateDialogOpen = _f[0], setIsCreateDialogOpen = _f[1];
    var _g = react_1.useState(false), isEditDialogOpen = _g[0], setIsEditDialogOpen = _g[1];
    var _h = react_1.useState(null), editingJobGroup = _h[0], setEditingJobGroup = _h[1];
    var _j = react_1.useState(null), deleteConfirmId = _j[0], setDeleteConfirmId = _j[1];
    var _k = react_1.useState(new Set()), selectedJobGroups = _k[0], setSelectedJobGroups = _k[1];
    var _l = react_1.useState("name"), sortField = _l[0], setSortField = _l[1];
    var _m = react_1.useState("asc"), sortOrder = _m[0], setSortOrder = _m[1];
    // Form state
    var _o = react_1.useState({
        name: "",
        description: "",
        minSalary: "",
        maxSalary: "",
        currency: currencyCode
    }), formData = _o[0], setFormData = _o[1];
    // Queries
    var _p = trpc_1.trpc.jobGroups.list.useQuery({}), _q = _p.data, jobGroupsData = _q === void 0 ? [] : _q, jobGroupsLoading = _p.isLoading, refetch = _p.refetch;
    var utils = trpc_1.trpc.useUtils();
    // Mutations
    var createMutation = trpc_1.trpc.jobGroups.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Job group created successfully");
            setFormData({ name: "", description: "", minSalary: "", maxSalary: "", currency: currencyCode });
            setIsCreateDialogOpen(false);
            utils.jobGroups.list.invalidate();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to create job group");
        }
    });
    var updateMutation = trpc_1.trpc.jobGroups.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Job group updated successfully");
            setFormData({ name: "", description: "", minSalary: "", maxSalary: "", currency: currencyCode });
            setIsEditDialogOpen(false);
            setEditingJobGroup(null);
            utils.jobGroups.list.invalidate();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to update job group");
        }
    });
    var deleteMutation = trpc_1.trpc.jobGroups["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Job group deleted successfully");
            setDeleteConfirmId(null);
            utils.jobGroups.list.invalidate();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete job group");
        }
    });
    var bulkDeleteMutation = (_a = trpc_1.trpc.jobGroups.bulkDelete) === null || _a === void 0 ? void 0 : _a.useMutation({
        onSuccess: function (data) {
            utils.jobGroups.list.invalidate();
            sonner_1.toast.success(((data === null || data === void 0 ? void 0 : data.count) || 0) + " job group(s) deleted");
            setSelectedJobGroups(new Set());
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete job groups");
        }
    });
    if (permissionLoading) {
        return (React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" })));
    }
    if (!allowed) {
        return null;
    }
    var handleCreate = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!formData.name.trim()) {
                        sonner_1.toast.error("Job group name is required");
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, createMutation.mutateAsync({
                            name: formData.name,
                            description: formData.description || undefined,
                            minSalary: formData.minSalary ? Math.round(parseFloat(formData.minSalary) * 100) : undefined,
                            maxSalary: formData.maxSalary ? Math.round(parseFloat(formData.maxSalary) * 100) : undefined,
                            currency: formData.currency
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var handleEdit = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!editingJobGroup || !formData.name.trim()) {
                        sonner_1.toast.error("Job group name is required");
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, updateMutation.mutateAsync({
                            id: editingJobGroup.id,
                            name: formData.name,
                            description: formData.description || undefined,
                            minSalary: formData.minSalary ? Math.round(parseFloat(formData.minSalary) * 100) : undefined,
                            maxSalary: formData.maxSalary ? Math.round(parseFloat(formData.maxSalary) * 100) : undefined,
                            currency: formData.currency
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var openEditDialog = function (jobGroup) {
        setEditingJobGroup(jobGroup);
        setFormData({
            name: jobGroup.name,
            description: jobGroup.description || "",
            minSalary: jobGroup.minSalary ? (jobGroup.minSalary / 100).toString() : "",
            maxSalary: jobGroup.maxSalary ? (jobGroup.maxSalary / 100).toString() : "",
            currency: jobGroup.currency || currencyCode
        });
        setIsEditDialogOpen(true);
    };
    var filteredJobGroups = __spreadArrays(jobGroupsData).filter(function (jg) {
        return jg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (jg.description && jg.description.toLowerCase().includes(searchQuery.toLowerCase()));
    })
        .sort(function (a, b) {
        var aVal = a[sortField] || "";
        var bVal = b[sortField] || "";
        if (sortField === "minSalary" || sortField === "maxSalary") {
            aVal = parseFloat(String(aVal));
            bVal = parseFloat(String(bVal));
        }
        if (sortOrder === "asc") {
            return aVal > bVal ? 1 : -1;
        }
        else {
            return aVal < bVal ? 1 : -1;
        }
    });
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Job Groups", description: "Manage job grades, salary structures, and employee classifications", icon: React.createElement(lucide_react_1.Building2, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "HR", href: "/hr" },
            { label: "Job Groups" },
        ] },
        React.createElement("div", { className: "space-y-6 p-4 sm:p-6" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", null,
                    React.createElement("h2", { className: "text-2xl font-bold" }, "Job Groups"),
                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "Create and manage job grades for your organization")),
                React.createElement(dialog_1.Dialog, { open: isCreateDialogOpen, onOpenChange: setIsCreateDialogOpen },
                    React.createElement(dialog_1.DialogTrigger, { asChild: true },
                        React.createElement(button_1.Button, null,
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                            "Create Job Group")),
                    React.createElement(dialog_1.DialogContent, null,
                        React.createElement(dialog_1.DialogHeader, null,
                            React.createElement(dialog_1.DialogTitle, null, "Create New Job Group"),
                            React.createElement(dialog_1.DialogDescription, null, "Add a new job grade or classification to your organization")),
                        React.createElement("div", { className: "space-y-4" },
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "Job Group Name *"),
                                React.createElement(input_1.Input, { placeholder: "e.g., Senior Developer, Manager", value: formData.name, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { name: e.target.value })); } })),
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "Description"),
                                React.createElement(input_1.Input, { placeholder: "Job group description or criteria", value: formData.description, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { description: e.target.value })); } })),
                            React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                                React.createElement("div", null,
                                    React.createElement("label", { className: "text-sm font-medium" }, "Minimum Salary"),
                                    React.createElement(input_1.Input, { type: "number", placeholder: "0.00", value: formData.minSalary, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { minSalary: e.target.value })); } })),
                                React.createElement("div", null,
                                    React.createElement("label", { className: "text-sm font-medium" }, "Maximum Salary"),
                                    React.createElement(input_1.Input, { type: "number", placeholder: "0.00", value: formData.maxSalary, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { maxSalary: e.target.value })); } }))),
                            React.createElement("div", { className: "flex gap-3 pt-4" },
                                React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setIsCreateDialogOpen(false); } }, "Cancel"),
                                React.createElement(button_1.Button, { onClick: handleCreate, disabled: createMutation.isPending }, createMutation.isPending ? "Creating..." : "Create Job Group")))))),
            React.createElement("div", { className: "flex items-center gap-2" },
                React.createElement(lucide_react_1.Search, { className: "h-4 w-4 text-muted-foreground" }),
                React.createElement(input_1.Input, { placeholder: "Search job groups...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "flex-1" })),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Job Groups List"),
                    React.createElement(card_1.CardDescription, null,
                        filteredJobGroups.length,
                        " job group",
                        filteredJobGroups.length !== 1 ? "s" : "",
                        " total")),
                React.createElement(card_1.CardContent, null, jobGroupsLoading ? (React.createElement("div", { className: "flex items-center justify-center py-8" },
                    React.createElement(spinner_1.Spinner, { className: "size-6" }))) : filteredJobGroups.length === 0 ? (React.createElement("div", { className: "flex items-center justify-center py-8 text-center" },
                    React.createElement("div", null,
                        React.createElement(lucide_react_1.AlertCircle, { className: "h-8 w-8 mx-auto text-muted-foreground mb-2" }),
                        React.createElement("p", { className: "text-sm text-muted-foreground" }, "No job groups found")))) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Name"),
                                React.createElement(table_1.TableHead, null, "Description"),
                                React.createElement(table_1.TableHead, null, "Salary Range"),
                                React.createElement(table_1.TableHead, null, "Status"),
                                React.createElement(table_1.TableHead, null, "Created"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, filteredJobGroups.map(function (jobGroup) { return (React.createElement(table_1.TableRow, { key: jobGroup.id },
                            React.createElement(table_1.TableCell, { className: "font-medium" },
                                React.createElement(button_1.Button, { variant: "link", className: "p-0 h-auto font-medium text-left justify-start", onClick: function () { return navigate("/job-groups/" + jobGroup.id); } }, jobGroup.name)),
                            React.createElement(table_1.TableCell, { className: "text-sm text-muted-foreground" }, jobGroup.description || "N/A"),
                            React.createElement(table_1.TableCell, { className: "text-sm" }, jobGroup.minSalary && jobGroup.maxSalary
                                ? (jobGroup.minSalary / 100).toLocaleString() + " - " + (jobGroup.maxSalary / 100).toLocaleString() + " " + (jobGroup.currency || currencyCode)
                                : "Not set"),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { variant: jobGroup.isActive ? "default" : "secondary" }, jobGroup.isActive ? "Active" : "Inactive")),
                            React.createElement(table_1.TableCell, { className: "text-sm text-muted-foreground" }, jobGroup.createdAt
                                ? date_fns_1.format(new Date(jobGroup.createdAt), "MMM dd, yyyy")
                                : "N/A"),
                            React.createElement(table_1.TableCell, { className: "text-right" },
                                React.createElement("div", { className: "flex items-center justify-end gap-2" },
                                    React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return openEditDialog(jobGroup); } },
                                        React.createElement(lucide_react_1.Edit2, { className: "h-4 w-4" })),
                                    React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return setDeleteConfirmId(jobGroup.id); }, className: "text-red-500 hover:text-red-700 hover:bg-red-50" },
                                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))))); }))))))),
            React.createElement(dialog_1.Dialog, { open: isEditDialogOpen, onOpenChange: setIsEditDialogOpen },
                React.createElement(dialog_1.DialogContent, null,
                    React.createElement(dialog_1.DialogHeader, null,
                        React.createElement(dialog_1.DialogTitle, null, "Edit Job Group"),
                        React.createElement(dialog_1.DialogDescription, null, "Update the job group information")),
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Job Group Name *"),
                            React.createElement(input_1.Input, { placeholder: "e.g., Senior Developer, Manager", value: formData.name, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { name: e.target.value })); } })),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Description"),
                            React.createElement(input_1.Input, { placeholder: "Job group description or criteria", value: formData.description, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { description: e.target.value })); } })),
                        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "Minimum Salary"),
                                React.createElement(input_1.Input, { type: "number", placeholder: "0.00", value: formData.minSalary, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { minSalary: e.target.value })); } })),
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "Maximum Salary"),
                                React.createElement(input_1.Input, { type: "number", placeholder: "0.00", value: formData.maxSalary, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { maxSalary: e.target.value })); } }))),
                        React.createElement("div", { className: "flex gap-3 pt-4" },
                            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setIsEditDialogOpen(false); } }, "Cancel"),
                            React.createElement(button_1.Button, { onClick: handleEdit, disabled: updateMutation.isPending }, updateMutation.isPending ? "Updating..." : "Update Job Group"))))),
            React.createElement(alert_dialog_1.AlertDialog, { open: !!deleteConfirmId, onOpenChange: function (open) { return !open && setDeleteConfirmId(null); } },
                React.createElement(alert_dialog_1.AlertDialogContent, null,
                    React.createElement(alert_dialog_1.AlertDialogTitle, null, "Delete Job Group"),
                    React.createElement(alert_dialog_1.AlertDialogDescription, null, "Are you sure you want to delete this job group? This action cannot be undone."),
                    React.createElement("div", { className: "flex gap-3 pt-4" },
                        React.createElement(alert_dialog_1.AlertDialogCancel, null, "Cancel"),
                        React.createElement(alert_dialog_1.AlertDialogAction, { onClick: function () {
                                if (deleteConfirmId) {
                                    deleteMutation.mutate({ id: deleteConfirmId });
                                }
                            }, className: "bg-red-500 hover:bg-red-600" }, deleteMutation.isPending ? "Deleting..." : "Delete")))))));
}
exports["default"] = JobGroups;
