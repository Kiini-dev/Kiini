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
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var tabs_1 = require("@/components/ui/tabs");
var select_1 = require("@/components/ui/select");
var alert_1 = require("@/components/ui/alert");
var textarea_1 = require("@/components/ui/textarea");
var progress_1 = require("@/components/ui/progress");
var table_1 = require("@/components/ui/table");
var lucide_react_1 = require("lucide-react");
function ProfessionalBudgeting() {
    var _this = this;
    var _a;
    var _b = wouter_1.useLocation(), navigate = _b[1];
    var _c = react_1.useState('budgets'), activeTab = _c[0], setActiveTab = _c[1];
    var _d = react_1.useState(false), isCreating = _d[0], setIsCreating = _d[1];
    var _e = react_1.useState(false), isUploading = _e[0], setIsUploading = _e[1];
    var _f = react_1.useState('__all__'), selectedDepartment = _f[0], setSelectedDepartment = _f[1];
    var _g = react_1.useState(new Date().getFullYear()), selectedYear = _g[0], setSelectedYear = _g[1];
    var _h = react_1.useState(false), createDialogOpen = _h[0], setCreateDialogOpen = _h[1];
    var _j = react_1.useState({
        budgetName: '',
        budgetDescription: '',
        departmentId: '',
        fiscalYear: new Date().getFullYear(),
        startDate: new Date().getFullYear() + "-01-01",
        endDate: new Date().getFullYear() + "-12-31",
        budgetLines: []
    }), createFormData = _j[0], setCreateFormData = _j[1];
    // Fetch departments
    var departments = trpc_1.trpc.departments.list.useQuery({}).data;
    // Fetch COA accounts
    var coaAccounts = trpc_1.trpc.chartOfAccounts.list.useQuery({}).data;
    // Fetch budgets
    var _k = trpc_1.trpc.professionalBudgeting.listBudgets.useQuery({
        departmentId: selectedDepartment && selectedDepartment !== '__all__' ? selectedDepartment : undefined,
        fiscalYear: selectedYear
    }), budgets = _k.data, budgetsLoading = _k.isLoading, refetchBudgets = _k.refetch;
    // Fetch budget template
    var template = trpc_1.trpc.professionalBudgeting.generateBudgetTemplate.useQuery({
        fiscalYear: selectedYear,
        departmentId: (selectedDepartment && selectedDepartment !== '__all__') ? selectedDepartment : (((_a = departments === null || departments === void 0 ? void 0 : departments[0]) === null || _a === void 0 ? void 0 : _a.id) || '')
    }, {
        enabled: ((selectedDepartment && selectedDepartment !== '__all__') || (departments === null || departments === void 0 ? void 0 : departments.length) === 1) && !!(departments === null || departments === void 0 ? void 0 : departments.length)
    }).data;
    // Mutations
    var createBudgetMutation = trpc_1.trpc.professionalBudgeting.createBudget.useMutation({
        onSuccess: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sonner_1.toast.success('Budget created successfully');
                        setCreateDialogOpen(false);
                        setCreateFormData({
                            budgetName: '',
                            budgetDescription: '',
                            departmentId: '',
                            fiscalYear: new Date().getFullYear(),
                            startDate: new Date().getFullYear() + "-01-01",
                            endDate: new Date().getFullYear() + "-12-31",
                            budgetLines: []
                        });
                        return [4 /*yield*/, refetchBudgets()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onError: function (error) {
            sonner_1.toast.error("Failed to create budget: " + error.message);
        }
    });
    var importBudgetMutation = trpc_1.trpc.professionalBudgeting.importBudgetFromCSV.useMutation({
        onSuccess: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sonner_1.toast.success('Budget imported successfully');
                        return [4 /*yield*/, refetchBudgets()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onError: function (error) {
            sonner_1.toast.error("Failed to import budget: " + error.message);
        }
    });
    var approveBudgetMutation = trpc_1.trpc.professionalBudgeting.approveBudget.useMutation({
        onSuccess: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sonner_1.toast.success('Budget approved');
                        return [4 /*yield*/, refetchBudgets()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onError: function (error) {
            sonner_1.toast.error("Failed to approve budget: " + error.message);
        }
    });
    // Handle file upload for budget import
    var handleCSVUpload = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var file, content, lines, headers, csvData, i, values, error_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
                    if (!file)
                        return [2 /*return*/];
                    setIsUploading(true);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, file.text()];
                case 2:
                    content = _c.sent();
                    lines = content.split('\n').filter(function (line) { return !line.startsWith('#') && line.trim(); });
                    if (lines.length < 2) {
                        sonner_1.toast.error('CSV file must have headers and at least one data row');
                        return [2 /*return*/];
                    }
                    headers = lines[0].split(',').map(function (h) { return h.trim(); });
                    csvData = [];
                    for (i = 1; i < lines.length; i++) {
                        values = lines[i].split(',').map(function (v) { return v.trim(); });
                        if (values[0]) {
                            csvData.push({
                                accountCode: values[0],
                                accountName: values[1] || '',
                                budgeted: parseInt(values[2]) || 0,
                                description: values[3] || ''
                            });
                        }
                    }
                    if (csvData.length === 0) {
                        sonner_1.toast.error('No valid budget lines found in CSV');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, importBudgetMutation.mutateAsync({
                            budgetName: "Imported Budget - " + new Date().toLocaleDateString(),
                            budgetDescription: 'Budget imported from CSV file',
                            departmentId: selectedDepartment || ((_b = departments === null || departments === void 0 ? void 0 : departments[0]) === null || _b === void 0 ? void 0 : _b.id) || '',
                            fiscalYear: selectedYear,
                            startDate: selectedYear + "-01-01",
                            endDate: selectedYear + "-12-31",
                            csvData: csvData
                        })];
                case 3:
                    _c.sent();
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _c.sent();
                    sonner_1.toast.error("Failed to parse CSV: " + error_1);
                    return [3 /*break*/, 6];
                case 5:
                    setIsUploading(false);
                    e.target.value = '';
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    // Handle create budget
    var handleCreateBudget = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!createFormData.budgetName || !createFormData.departmentId || createFormData.budgetLines.length === 0) {
                        sonner_1.toast.error('Please fill in all required fields');
                        return [2 /*return*/];
                    }
                    setIsCreating(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, createBudgetMutation.mutateAsync({
                            budgetName: createFormData.budgetName,
                            budgetDescription: createFormData.budgetDescription,
                            departmentId: createFormData.departmentId,
                            fiscalYear: createFormData.fiscalYear,
                            startDate: createFormData.startDate,
                            endDate: createFormData.endDate,
                            budgetLines: createFormData.budgetLines
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    setIsCreating(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Download template
    var downloadTemplate = function () {
        if (!template) {
            sonner_1.toast.error('Failed to load template');
            return;
        }
        var csv = __spreadArrays([
            'accountCode,accountName,budgeted,description'
        ], template.csvData.map(function (line) {
            return line.accountCode + ",\"" + line.accountName + "\"," + line.budgeted + ",\"" + line.description + "\"";
        })).join('\n');
        var blob = new Blob([csv], { type: 'text/csv' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = "budget-template-FY" + selectedYear + ".csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        sonner_1.toast.success('Template downloaded');
    };
    var currentYear = new Date().getFullYear();
    var yearOptions = Array.from({ length: 5 }, function (_, i) { return currentYear - 2 + i; });
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Professional Budgeting", description: "Create, manage, and track budgets with professional standards and detailed analysis", icon: react_1["default"].createElement(lucide_react_1.TrendingUp, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Home", href: "/" },
            { label: "Dashboard", href: "/crm-home" },
            { label: "Procurement", href: "/procurement" },
            { label: "Budgets", href: "/budgets" },
            { label: "Professional Budgeting" },
        ] },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", null,
                react_1["default"].createElement("h2", { className: "text-3xl font-bold tracking-tight" }, "Professional Budgeting"),
                react_1["default"].createElement("p", { className: "text-gray-500 dark:text-gray-400 mt-1" }, "Create, manage, and track budgets with professional standards")),
            react_1["default"].createElement("div", { className: "flex gap-4" },
                react_1["default"].createElement("div", { className: "flex-1 max-w-xs" },
                    react_1["default"].createElement(label_1.Label, { htmlFor: "department" }, "Department"),
                    react_1["default"].createElement(select_1.Select, { value: selectedDepartment, onValueChange: setSelectedDepartment },
                        react_1["default"].createElement(select_1.SelectTrigger, { id: "department" },
                            react_1["default"].createElement(select_1.SelectValue, { placeholder: "All departments" })),
                        react_1["default"].createElement(select_1.SelectContent, null,
                            react_1["default"].createElement(select_1.SelectItem, { value: "__all__" }, "All departments"), departments === null || departments === void 0 ? void 0 :
                            departments.map(function (dept) { return (react_1["default"].createElement(select_1.SelectItem, { key: dept.id, value: dept.id }, dept.name)); })))),
                react_1["default"].createElement("div", { className: "flex-1 max-w-xs" },
                    react_1["default"].createElement(label_1.Label, { htmlFor: "year" }, "Fiscal Year"),
                    react_1["default"].createElement(select_1.Select, { value: selectedYear.toString(), onValueChange: function (val) { return setSelectedYear(parseInt(val)); } },
                        react_1["default"].createElement(select_1.SelectTrigger, { id: "year" },
                            react_1["default"].createElement(select_1.SelectValue, null)),
                        react_1["default"].createElement(select_1.SelectContent, null, yearOptions.map(function (year) { return (react_1["default"].createElement(select_1.SelectItem, { key: year, value: year.toString() },
                            "FY",
                            year)); }))))),
            react_1["default"].createElement(tabs_1.Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-6" },
                react_1["default"].createElement(tabs_1.TabsList, null,
                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "budgets" }, "Active Budgets"),
                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "create" }, "Create Budget"),
                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "import" }, "Import from CSV")),
                react_1["default"].createElement(tabs_1.TabsContent, { value: "budgets", className: "space-y-4" }, budgetsLoading ? (react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardContent, { className: "pt-6" },
                        react_1["default"].createElement("div", { className: "flex items-center justify-center" },
                            react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin" }))))) : budgets && budgets.length > 0 ? (react_1["default"].createElement("div", { className: "space-y-4" }, budgets.map(function (budget) { return (react_1["default"].createElement(card_1.Card, { key: budget.id },
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement("div", { className: "flex items-start justify-between" },
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement(card_1.CardTitle, null, budget.budgetName),
                                react_1["default"].createElement(card_1.CardDescription, null, budget.budgetDescription)),
                            react_1["default"].createElement("div", { className: "text-right" },
                                react_1["default"].createElement("div", { className: "inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-100" }, budget.budgetStatus)))),
                    react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                        react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" },
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("p", { className: "text-xs text-gray-500" }, "Total Budget"),
                                react_1["default"].createElement("p", { className: "font-semibold" },
                                    "KES ",
                                    (budget.totalBudgeted || 0).toLocaleString())),
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("p", { className: "text-xs text-gray-500" }, "Actual Spend"),
                                react_1["default"].createElement("p", { className: "font-semibold" },
                                    "KES ",
                                    (budget.totalActual || 0).toLocaleString())),
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("p", { className: "text-xs text-gray-500" }, "Remaining"),
                                react_1["default"].createElement("p", { className: "font-semibold" },
                                    "KES ",
                                    (budget.remaining || 0).toLocaleString())),
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("p", { className: "text-xs text-gray-500" }, "Utilization"),
                                react_1["default"].createElement("p", { className: "font-semibold" },
                                    (budget.utilizationPercent || 0).toFixed(1),
                                    "%"))),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement("div", { className: "flex justify-between text-sm" },
                                react_1["default"].createElement("span", null, "Budget Utilization"),
                                react_1["default"].createElement("span", { className: "font-semibold" },
                                    (budget.utilizationPercent || 0).toFixed(1),
                                    "%")),
                            react_1["default"].createElement(progress_1.Progress, { value: Math.min(budget.utilizationPercent || 0, 100) })),
                        budget.budgetStatus === 'draft' && (react_1["default"].createElement(alert_1.Alert, null,
                            react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4" }),
                            react_1["default"].createElement(alert_1.AlertDescription, null, "This budget is in draft status and needs to be approved before use."))),
                        react_1["default"].createElement("div", { className: "flex gap-2" }, budget.budgetStatus === 'draft' && (react_1["default"].createElement(button_1.Button, { size: "sm", onClick: function () { return approveBudgetMutation.mutate({ budgetId: budget.id }); }, disabled: approveBudgetMutation.isPending }, approveBudgetMutation.isPending ? (react_1["default"].createElement(react_1["default"].Fragment, null,
                            react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                            "Approving...")) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                            react_1["default"].createElement(lucide_react_1.CheckCircle2, { className: "mr-2 h-4 w-4" }),
                            "Approve Budget")))))))); }))) : (react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardContent, { className: "pt-6" },
                        react_1["default"].createElement("div", { className: "text-center space-y-2" },
                            react_1["default"].createElement("p", { className: "text-gray-500" }, "No budgets found for selected criteria"),
                            react_1["default"].createElement(button_1.Button, { onClick: function () { return setActiveTab('create'); }, variant: "outline" }, "Create Budget")))))),
                react_1["default"].createElement(tabs_1.TabsContent, { value: "create", className: "space-y-4" },
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, null, "Create New Budget"),
                            react_1["default"].createElement(card_1.CardDescription, null, "Create a professional budget with detailed line items")),
                        react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                            react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                                react_1["default"].createElement("div", { className: "space-y-2" },
                                    react_1["default"].createElement(label_1.Label, { htmlFor: "name" }, "Budget Name *"),
                                    react_1["default"].createElement(input_1.Input, { id: "name", value: createFormData.budgetName, onChange: function (e) { return setCreateFormData(function (prev) { return (__assign(__assign({}, prev), { budgetName: e.target.value })); }); }, placeholder: "e.g., Marketing Department Q1 2024" })),
                                react_1["default"].createElement("div", { className: "space-y-2" },
                                    react_1["default"].createElement(label_1.Label, { htmlFor: "dept" }, "Department *"),
                                    react_1["default"].createElement(select_1.Select, { value: createFormData.departmentId, onValueChange: function (val) { return setCreateFormData(function (prev) { return (__assign(__assign({}, prev), { departmentId: val })); }); } },
                                        react_1["default"].createElement(select_1.SelectTrigger, { id: "dept" },
                                            react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select department" })),
                                        react_1["default"].createElement(select_1.SelectContent, null, departments === null || departments === void 0 ? void 0 : departments.map(function (dept) { return (react_1["default"].createElement(select_1.SelectItem, { key: dept.id, value: dept.id }, dept.name)); }))))),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "desc" }, "Budget Description"),
                                react_1["default"].createElement(textarea_1.Textarea, { id: "desc", value: createFormData.budgetDescription, onChange: function (e) { return setCreateFormData(function (prev) { return (__assign(__assign({}, prev), { budgetDescription: e.target.value })); }); }, placeholder: "Add details about this budget...", rows: 2 })),
                            react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" },
                                react_1["default"].createElement("div", { className: "space-y-2" },
                                    react_1["default"].createElement(label_1.Label, { htmlFor: "year" }, "Fiscal Year"),
                                    react_1["default"].createElement(select_1.Select, { value: createFormData.fiscalYear.toString(), onValueChange: function (val) { return setCreateFormData(function (prev) { return (__assign(__assign({}, prev), { fiscalYear: parseInt(val) })); }); } },
                                        react_1["default"].createElement(select_1.SelectTrigger, { id: "year" },
                                            react_1["default"].createElement(select_1.SelectValue, null)),
                                        react_1["default"].createElement(select_1.SelectContent, null, yearOptions.map(function (year) { return (react_1["default"].createElement(select_1.SelectItem, { key: year, value: year.toString() }, year)); })))),
                                react_1["default"].createElement("div", { className: "space-y-2" },
                                    react_1["default"].createElement(label_1.Label, { htmlFor: "start" }, "Start Date"),
                                    react_1["default"].createElement(input_1.Input, { id: "start", type: "date", value: createFormData.startDate, onChange: function (e) { return setCreateFormData(function (prev) { return (__assign(__assign({}, prev), { startDate: e.target.value })); }); } })),
                                react_1["default"].createElement("div", { className: "space-y-2" },
                                    react_1["default"].createElement(label_1.Label, { htmlFor: "end" }, "End Date"),
                                    react_1["default"].createElement(input_1.Input, { id: "end", type: "date", value: createFormData.endDate, onChange: function (e) { return setCreateFormData(function (prev) { return (__assign(__assign({}, prev), { endDate: e.target.value })); }); } }))),
                            react_1["default"].createElement("div", { className: "space-y-3" },
                                react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                                    react_1["default"].createElement(label_1.Label, null, "Budget Line Items *"),
                                    react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () {
                                            setCreateFormData(function (prev) { return (__assign(__assign({}, prev), { budgetLines: __spreadArrays(prev.budgetLines, [{ accountId: '', budgeted: 0, description: '' }]) })); });
                                        } },
                                        react_1["default"].createElement(lucide_react_1.Plus, { className: "w-4 h-4 mr-1" }),
                                        "Add Line")),
                                react_1["default"].createElement("div", { className: "border rounded-lg overflow-hidden" },
                                    react_1["default"].createElement(table_1.Table, null,
                                        react_1["default"].createElement(table_1.TableHeader, null,
                                            react_1["default"].createElement(table_1.TableRow, null,
                                                react_1["default"].createElement(table_1.TableHead, null, "Account"),
                                                react_1["default"].createElement(table_1.TableHead, null, "Amount"),
                                                react_1["default"].createElement(table_1.TableHead, null, "Description"),
                                                react_1["default"].createElement(table_1.TableHead, null))),
                                        react_1["default"].createElement(table_1.TableBody, null, createFormData.budgetLines.map(function (line, idx) { return (react_1["default"].createElement(table_1.TableRow, { key: idx },
                                            react_1["default"].createElement(table_1.TableCell, null,
                                                react_1["default"].createElement(select_1.Select, { value: line.accountId, onValueChange: function (val) {
                                                        var newLines = __spreadArrays(createFormData.budgetLines);
                                                        newLines[idx].accountId = val;
                                                        setCreateFormData(function (prev) { return (__assign(__assign({}, prev), { budgetLines: newLines })); });
                                                    } },
                                                    react_1["default"].createElement(select_1.SelectTrigger, { className: "w-full" },
                                                        react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select account" })),
                                                    react_1["default"].createElement(select_1.SelectContent, null, coaAccounts === null || coaAccounts === void 0 ? void 0 : coaAccounts.map(function (acc) { return (react_1["default"].createElement(select_1.SelectItem, { key: acc.id, value: acc.id },
                                                        acc.accountCode,
                                                        " - ",
                                                        acc.accountName)); })))),
                                            react_1["default"].createElement(table_1.TableCell, null,
                                                react_1["default"].createElement(input_1.Input, { type: "number", value: line.budgeted, onChange: function (e) {
                                                        var newLines = __spreadArrays(createFormData.budgetLines);
                                                        newLines[idx].budgeted = parseFloat(e.target.value) || 0;
                                                        setCreateFormData(function (prev) { return (__assign(__assign({}, prev), { budgetLines: newLines })); });
                                                    }, placeholder: "0" })),
                                            react_1["default"].createElement(table_1.TableCell, null,
                                                react_1["default"].createElement(input_1.Input, { value: line.description, onChange: function (e) {
                                                        var newLines = __spreadArrays(createFormData.budgetLines);
                                                        newLines[idx].description = e.target.value;
                                                        setCreateFormData(function (prev) { return (__assign(__assign({}, prev), { budgetLines: newLines })); });
                                                    }, placeholder: "Description" })),
                                            react_1["default"].createElement(table_1.TableCell, null,
                                                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function () {
                                                        var newLines = createFormData.budgetLines.filter(function (_, i) { return i !== idx; });
                                                        setCreateFormData(function (prev) { return (__assign(__assign({}, prev), { budgetLines: newLines })); });
                                                    } }, "Remove")))); }))))),
                            react_1["default"].createElement("div", { className: "flex gap-2" },
                                react_1["default"].createElement(button_1.Button, { onClick: handleCreateBudget, disabled: isCreating }, isCreating ? (react_1["default"].createElement(react_1["default"].Fragment, null,
                                    react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                                    "Creating...")) : ('Create Budget')))))),
                react_1["default"].createElement(tabs_1.TabsContent, { value: "import", className: "space-y-4" },
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, null, "Import Budget from CSV"),
                            react_1["default"].createElement(card_1.CardDescription, null, "Import a professional budget from a CSV file")),
                        react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                            react_1["default"].createElement(button_1.Button, { onClick: downloadTemplate, variant: "outline", className: "w-full" },
                                react_1["default"].createElement(lucide_react_1.Download, { className: "mr-2 h-4 w-4" }),
                                "Download Budget Template (FY",
                                selectedYear,
                                ")"),
                            react_1["default"].createElement(alert_1.Alert, null,
                                react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4" }),
                                react_1["default"].createElement(alert_1.AlertDescription, null, "CSV file format: accountCode, accountName, budgeted, description")),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "csvFile" }, "Select CSV File"),
                                react_1["default"].createElement(input_1.Input, { id: "csvFile", type: "file", accept: ".csv", onChange: handleCSVUpload, disabled: isUploading })),
                            isUploading && (react_1["default"].createElement("div", { className: "flex items-center justify-center" },
                                react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin" }),
                                react_1["default"].createElement("span", { className: "ml-2" }, "Importing..."))))))))));
}
exports["default"] = ProfessionalBudgeting;
