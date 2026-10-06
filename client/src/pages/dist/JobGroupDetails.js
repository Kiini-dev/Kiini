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
exports.__esModule = true;
var wouter_1 = require("wouter");
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var textarea_1 = require("@/components/ui/textarea");
var lucide_react_1 = require("lucide-react");
var recharts_1 = require("recharts");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var currency_1 = require("@/lib/currency");
var sonner_1 = require("sonner");
var table_1 = require("@/components/ui/table");
var DeleteConfirmationModal_1 = require("@/components/DeleteConfirmationModal");
function JobGroupDetails() {
    var _this = this;
    var _a;
    var id = wouter_1.useParams().id;
    var _b = wouter_1.useLocation(), navigate = _b[1];
    var _c = currency_1.useCurrencySettings(), currencyCode = _c.code, symbol = _c.symbol, position = _c.position;
    var _d = react_1.useState(false), showEditModal = _d[0], setShowEditModal = _d[1];
    var _e = react_1.useState(false), showDeleteModal = _e[0], setShowDeleteModal = _e[1];
    var _f = react_1.useState(false), isSubmitting = _f[0], setIsSubmitting = _f[1];
    var _g = react_1.useState({ name: "", description: "", minimumGrossSalary: 0, maximumGrossSalary: 0 }), formData = _g[0], setFormData = _g[1];
    var _h = trpc_1.trpc.jobGroups.getById.useQuery(id || ""), jobGroup = _h.data, isLoading = _h.isLoading;
    var _j = trpc_1.trpc.employees.byJobGroup.useQuery({ jobGroupId: id || "" }, { enabled: !!id }).data, employeesData = _j === void 0 ? [] : _j;
    var utils = trpc_1.trpc.useUtils();
    // Mutations for CRUD
    var updateJobGroupMutation = trpc_1.trpc.jobGroups.update.useMutation({
        onSuccess: function () {
            utils.jobGroups.getById.invalidate(id);
            utils.jobGroups.list.invalidate();
            sonner_1.toast.success("Job group updated successfully");
            setShowEditModal(false);
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to update job group");
        }
    });
    var deleteJobGroupMutation = trpc_1.trpc.jobGroups["delete"].useMutation({
        onSuccess: function () {
            utils.jobGroups.list.invalidate();
            sonner_1.toast.success("Job group deleted successfully");
            navigate("/job-groups");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete job group");
        }
    });
    var allEmployees = employeesData;
    var groupEmployees = allEmployees; // Already filtered by byJobGroup query
    // Calculate salary statistics
    var salaries = groupEmployees
        .map(function (emp) { return emp.salary; })
        .filter(function (salary) { return salary && salary > 0; });
    var salaryStats = salaries.length > 0 ? {
        min: Math.min.apply(Math, salaries),
        max: Math.max.apply(Math, salaries),
        avg: salaries.reduce(function (a, b) { return a + b; }, 0) / salaries.length,
        median: salaries.sort(function (a, b) { return a - b; })[Math.floor(salaries.length / 2)]
    } : null;
    // Department distribution
    var departmentStats = groupEmployees.reduce(function (acc, emp) {
        var dept = emp.department || "Unassigned";
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
    }, {});
    var departmentChartData = Object.entries(departmentStats).map(function (_a) {
        var name = _a[0], value = _a[1];
        return ({
            name: name,
            value: value
        });
    });
    // Employment type distribution
    var employmentTypeStats = groupEmployees.reduce(function (acc, emp) {
        var type = emp.employmentType || "Unknown";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});
    var employmentTypeChartData = Object.entries(employmentTypeStats).map(function (_a) {
        var name = _a[0], value = _a[1];
        return ({
            name: name,
            value: value
        });
    });
    var COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
    var breadcrumbs = [
        { label: "Dashboard", href: "/" },
        { label: "HR", href: "/hr" },
        { label: "Job Groups", href: "/job-groups" },
        { label: ((_a = jobGroup) === null || _a === void 0 ? void 0 : _a.name) || "Details" },
    ];
    var handleEdit = function () {
        var jg = jobGroup;
        setFormData({
            name: jg.name || "",
            description: jg.description || "",
            minimumGrossSalary: Number(jg.minimumGrossSalary || 0),
            maximumGrossSalary: Number(jg.maximumGrossSalary || 0)
        });
        setShowEditModal(true);
    };
    var handleSaveEdit = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsSubmitting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, updateJobGroupMutation.mutateAsync({
                            id: id || "",
                            data: formData
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    setIsSubmitting(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleDelete = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsSubmitting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, deleteJobGroupMutation.mutateAsync(id || "")];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    setIsSubmitting(false);
                    setShowDeleteModal(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    if (isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Job Group Details", icon: React.createElement(lucide_react_1.Building2, { className: "h-5 w-5" }), breadcrumbs: breadcrumbs, backLink: { label: "Job Groups", href: "/job-groups" } },
            React.createElement("div", { className: "flex items-center justify-center h-64" },
                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-muted-foreground" }))));
    }
    if (!jobGroup) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Job Group Details", icon: React.createElement(lucide_react_1.Building2, { className: "h-5 w-5" }), breadcrumbs: breadcrumbs, backLink: { label: "Job Groups", href: "/job-groups" } },
            React.createElement("div", { className: "flex flex-col items-center justify-center h-64 gap-4" },
                React.createElement("p", { className: "text-muted-foreground" }, "Job group not found."),
                React.createElement(button_1.Button, { onClick: function () { return navigate("/job-groups"); } },
                    React.createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-2" }),
                    " Back to Job Groups"))));
    }
    var jg = jobGroup;
    var isActive = jg.isActive !== false && jg.isActive !== 0;
    var minSalary = Number(jg.minimumGrossSalary || 0);
    var maxSalary = Number(jg.maximumGrossSalary || 0);
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: jg.name || "Job Group Details", icon: React.createElement(lucide_react_1.Building2, { className: "h-5 w-5" }), breadcrumbs: breadcrumbs, backLink: { label: "Job Groups", href: "/job-groups" } },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "flex justify-end gap-2" },
                React.createElement(button_1.Button, { variant: "outline", onClick: handleEdit },
                    React.createElement(lucide_react_1.Edit, { className: "h-4 w-4 mr-2" }),
                    " Edit"),
                React.createElement(button_1.Button, { variant: "destructive", onClick: function () { return setShowDeleteModal(true); } },
                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4 mr-2" }),
                    " Delete")),
            React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-4" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardContent, { className: "pt-4 pb-3 px-4" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Employees"),
                                React.createElement("p", { className: "text-2xl font-bold" }, groupEmployees.length)),
                            React.createElement(lucide_react_1.Users, { className: "h-8 w-8 text-blue-500 opacity-80" })))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardContent, { className: "pt-4 pb-3 px-4" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Min Salary"),
                            React.createElement("p", { className: "text-lg font-bold text-green-600" }, currency_1.formatAmount(minSalary * 100, symbol, position))))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardContent, { className: "pt-4 pb-3 px-4" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Max Salary"),
                            React.createElement("p", { className: "text-lg font-bold text-blue-600" }, currency_1.formatAmount(maxSalary * 100, symbol, position)))))),
            salaryStats && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5" }),
                        "Salary Analytics"),
                    React.createElement(card_1.CardDescription, null, "Salary distribution and statistics for employees in this job group")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" },
                        React.createElement("div", { className: "text-center" },
                            React.createElement("div", { className: "text-2xl font-bold text-green-600" }, currency_1.formatAmount(salaryStats.min, symbol, position)),
                            React.createElement("div", { className: "text-sm text-muted-foreground" }, "Minimum")),
                        React.createElement("div", { className: "text-center" },
                            React.createElement("div", { className: "text-2xl font-bold text-blue-600" }, currency_1.formatAmount(salaryStats.avg, symbol, position)),
                            React.createElement("div", { className: "text-sm text-muted-foreground" }, "Average")),
                        React.createElement("div", { className: "text-center" },
                            React.createElement("div", { className: "text-2xl font-bold text-purple-600" }, currency_1.formatAmount(salaryStats.median, symbol, position)),
                            React.createElement("div", { className: "text-sm text-muted-foreground" }, "Median")),
                        React.createElement("div", { className: "text-center" },
                            React.createElement("div", { className: "text-2xl font-bold text-red-600" }, currency_1.formatAmount(salaryStats.max, symbol, position)),
                            React.createElement("div", { className: "text-sm text-muted-foreground" }, "Maximum"))),
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                        React.createElement("div", null,
                            React.createElement("h4", { className: "text-sm font-medium mb-4" }, "Department Distribution"),
                            React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 200 },
                                React.createElement(recharts_1.PieChart, null,
                                    React.createElement(recharts_1.Pie, { data: departmentChartData, cx: "50%", cy: "50%", outerRadius: 60, fill: "#8884d8", dataKey: "value", label: function (_a) {
                                            var name = _a.name, percent = _a.percent;
                                            return name + " " + (percent * 100).toFixed(0) + "%";
                                        } }, departmentChartData.map(function (entry, index) { return (React.createElement(recharts_1.Cell, { key: "cell-" + index, fill: COLORS[index % COLORS.length] })); })),
                                    React.createElement(recharts_1.Tooltip, null)))),
                        React.createElement("div", null,
                            React.createElement("h4", { className: "text-sm font-medium mb-4" }, "Employment Type Distribution"),
                            React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 200 },
                                React.createElement(recharts_1.BarChart, { data: employmentTypeChartData },
                                    React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                                    React.createElement(recharts_1.XAxis, { dataKey: "name" }),
                                    React.createElement(recharts_1.YAxis, null),
                                    React.createElement(recharts_1.Tooltip, null),
                                    React.createElement(recharts_1.Bar, { dataKey: "value", fill: "#8884d8" })))))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement("div", { className: "flex items-center justify-between flex-wrap gap-2" },
                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                            React.createElement(lucide_react_1.Building2, { className: "h-5 w-5" }),
                            jg.name),
                        React.createElement(badge_1.Badge, { variant: isActive ? "default" : "secondary" }, isActive ? (React.createElement("span", { className: "flex items-center gap-1" },
                            React.createElement(lucide_react_1.CheckCircle2, { className: "h-3 w-3" }),
                            " Active")) : (React.createElement("span", { className: "flex items-center gap-1" },
                            React.createElement(lucide_react_1.XCircle, { className: "h-3 w-3" }),
                            " Inactive")))),
                    jg.description && (React.createElement(card_1.CardDescription, null, jg.description))),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid gap-4 sm:grid-cols-2" },
                        React.createElement("div", { className: "rounded-lg border p-3" },
                            React.createElement("p", { className: "text-xs text-muted-foreground mb-1 flex items-center gap-1" },
                                React.createElement(lucide_react_1.DollarSign, { className: "h-3 w-3" }),
                                " Salary Range"),
                            React.createElement("p", { className: "font-semibold" }, minSalary > 0 || maxSalary > 0
                                ? currency_1.formatAmount(minSalary * 100, symbol, position) + " \u2013 " + currency_1.formatAmount(maxSalary * 100, symbol, position)
                                : "Not set")),
                        React.createElement("div", { className: "rounded-lg border p-3" },
                            React.createElement("p", { className: "text-xs text-muted-foreground mb-1" }, "Currency"),
                            React.createElement("p", { className: "font-semibold" }, jg.currency || "KES"))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Users, { className: "h-5 w-5" }),
                        "Employees in this Job Group",
                        React.createElement(badge_1.Badge, { variant: "secondary", className: "ml-1" }, groupEmployees.length)),
                    React.createElement(card_1.CardDescription, null,
                        "All employees assigned to the ",
                        jg.name,
                        " job group")),
                React.createElement(card_1.CardContent, null, groupEmployees.length === 0 ? (React.createElement("div", { className: "flex flex-col items-center justify-center py-10 text-center gap-2" },
                    React.createElement(lucide_react_1.Users, { className: "h-10 w-10 text-muted-foreground" }),
                    React.createElement("p", { className: "text-muted-foreground text-sm" }, "No employees assigned to this job group yet."))) : (React.createElement("div", { className: "rounded-lg border overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Name"),
                                React.createElement(table_1.TableHead, null, "Position"),
                                React.createElement(table_1.TableHead, null, "Department"),
                                React.createElement(table_1.TableHead, null, "Salary"),
                                React.createElement(table_1.TableHead, null, "Employment Type"),
                                React.createElement(table_1.TableHead, null, "Email"),
                                React.createElement(table_1.TableHead, null, "Hire Date"),
                                React.createElement(table_1.TableHead, null, "Status"))),
                        React.createElement(table_1.TableBody, null, groupEmployees.map(function (emp) {
                            var _a, _b;
                            return (React.createElement(table_1.TableRow, { key: emp.id },
                                React.createElement(table_1.TableCell, { className: "font-medium" },
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        React.createElement("div", { className: "h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold shrink-0" }, (((_a = emp.firstName) === null || _a === void 0 ? void 0 : _a[0]) || ((_b = emp.name) === null || _b === void 0 ? void 0 : _b[0]) || "?").toUpperCase()),
                                        React.createElement("span", { className: "whitespace-nowrap" }, emp.firstName && emp.lastName
                                            ? emp.firstName + " " + emp.lastName
                                            : emp.name || "Unknown"))),
                                React.createElement(table_1.TableCell, { className: "text-muted-foreground text-sm" }, emp.position || emp.jobTitle || "—"),
                                React.createElement(table_1.TableCell, { className: "text-muted-foreground text-sm" }, emp.department || "—"),
                                React.createElement(table_1.TableCell, { className: "text-sm" }, emp.salary ? currency_1.formatAmount(emp.salary, symbol, position) : "—"),
                                React.createElement(table_1.TableCell, { className: "text-sm" },
                                    React.createElement(badge_1.Badge, { variant: "outline" }, emp.employmentType || "Unknown")),
                                React.createElement(table_1.TableCell, { className: "text-sm" }, emp.email ? (React.createElement("a", { href: "mailto:" + emp.email, className: "flex items-center gap-1 text-blue-600 hover:underline" },
                                    React.createElement(lucide_react_1.Mail, { className: "h-3 w-3" }),
                                    " ",
                                    emp.email)) : "—"),
                                React.createElement(table_1.TableCell, { className: "text-sm text-muted-foreground" }, emp.hireDate ? new Date(emp.hireDate).toLocaleDateString() : "—"),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(badge_1.Badge, { variant: (emp.status || "active") === "active" ? "default" : "secondary", className: "capitalize text-xs" }, emp.status || "active"))));
                        }))))))),
            showEditModal && (React.createElement("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50" },
                React.createElement(card_1.Card, { className: "w-full max-w-md" },
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Edit Job Group")),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Name"),
                            React.createElement(input_1.Input, { value: formData.name, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { name: e.target.value })); }, placeholder: "Job group name", className: "mt-1" })),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Description"),
                            React.createElement(textarea_1.Textarea, { value: formData.description, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { description: e.target.value })); }, placeholder: "Job group description", className: "mt-1", rows: 3 })),
                        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "Min Salary"),
                                React.createElement(input_1.Input, { type: "number", value: formData.minimumGrossSalary, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { minimumGrossSalary: Number(e.target.value) })); }, placeholder: "0", className: "mt-1" })),
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "Max Salary"),
                                React.createElement(input_1.Input, { type: "number", value: formData.maximumGrossSalary, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { maximumGrossSalary: Number(e.target.value) })); }, placeholder: "0", className: "mt-1" }))),
                        React.createElement("div", { className: "flex gap-2 justify-end" },
                            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setShowEditModal(false); } }, "Cancel"),
                            React.createElement(button_1.Button, { onClick: handleSaveEdit, disabled: isSubmitting }, isSubmitting ? "Saving..." : "Save Changes")))))),
            React.createElement(DeleteConfirmationModal_1["default"], { isOpen: showDeleteModal, title: "Delete Job Group", description: "Are you sure you want to delete \"" + jg.name + "\"? This action cannot be undone.", isLoading: isSubmitting, onConfirm: handleDelete, onCancel: function () { return setShowDeleteModal(false); } }))));
}
exports["default"] = JobGroupDetails;
