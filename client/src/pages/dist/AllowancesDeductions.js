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
var react_1 = require("react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var stats_card_1 = require("@/components/ui/stats-card");
var format_1 = require("@/utils/format");
function AllowancesDeductions() {
    var _this = this;
    var _a = react_1.useState("allowances"), activeTab = _a[0], setActiveTab = _a[1];
    var _b = react_1.useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = react_1.useState("all"), filterType = _c[0], setFilterType = _c[1];
    var _d = react_1.useState(false), isDialogOpen = _d[0], setIsDialogOpen = _d[1];
    var _e = react_1.useState(null), editingId = _e[0], setEditingId = _e[1];
    var _f = react_1.useState({
        type: "",
        amount: 0,
        frequency: "monthly",
        reference: ""
    }), formData = _f[0], setFormData = _f[1];
    // Fetch allowances and deductions
    var _g = trpc_1.trpc.payroll.salaryAllowances.list.useQuery({}), _h = _g.data, allowances = _h === void 0 ? [] : _h, allowLoading = _g.isLoading;
    var _j = trpc_1.trpc.payroll.salaryDeductions.list.useQuery({}), _k = _j.data, deductions = _k === void 0 ? [] : _k, dedLoading = _j.isLoading;
    // Mutations
    var createAllowMut = trpc_1.trpc.payroll.salaryAllowances.create.useMutation();
    var updateAllowMut = trpc_1.trpc.payroll.salaryAllowances.update.useMutation();
    var deleteAllowMut = trpc_1.trpc.payroll.salaryAllowances["delete"].useMutation();
    var createDedMut = trpc_1.trpc.payroll.salaryDeductions.create.useMutation();
    var updateDedMut = trpc_1.trpc.payroll.salaryDeductions.update.useMutation();
    var deleteDedMut = trpc_1.trpc.payroll.salaryDeductions["delete"].useMutation();
    var utils = trpc_1.trpc.useUtils();
    var isLoading = activeTab === "allowances" ? allowLoading : dedLoading;
    var items = activeTab === "allowances" ? allowances : deductions;
    var filteredItems = items.filter(function (item) {
        var matchesSearch = item.type.toLowerCase().includes(searchQuery.toLowerCase());
        var matchesFilter = filterType === "all" || item.frequency === filterType;
        return matchesSearch && matchesFilter;
    });
    var handleSave = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!formData.type.trim()) {
                        sonner_1.toast.error("Please enter a type/name");
                        return [2 /*return*/];
                    }
                    if (formData.amount <= 0) {
                        sonner_1.toast.error("Amount must be greater than 0");
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 12, , 13]);
                    if (!(activeTab === "allowances")) return [3 /*break*/, 6];
                    if (!editingId) return [3 /*break*/, 3];
                    return [4 /*yield*/, updateAllowMut.mutateAsync(__assign(__assign({ id: editingId }, formData), { amount: Math.round(formData.amount * 100) }))];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, createAllowMut.mutateAsync(__assign(__assign({}, formData), { amount: Math.round(formData.amount * 100) }))];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    utils.payroll.salaryAllowances.list.refetch();
                    return [3 /*break*/, 11];
                case 6:
                    if (!editingId) return [3 /*break*/, 8];
                    return [4 /*yield*/, updateDedMut.mutateAsync(__assign(__assign({ id: editingId }, formData), { amount: Math.round(formData.amount * 100) }))];
                case 7:
                    _a.sent();
                    return [3 /*break*/, 10];
                case 8: return [4 /*yield*/, createDedMut.mutateAsync(__assign(__assign({}, formData), { amount: Math.round(formData.amount * 100) }))];
                case 9:
                    _a.sent();
                    _a.label = 10;
                case 10:
                    utils.payroll.salaryDeductions.list.refetch();
                    _a.label = 11;
                case 11:
                    sonner_1.toast.success((activeTab === "allowances" ? "Allowance" : "Deduction") + " " + (editingId ? "updated" : "created"));
                    setIsDialogOpen(false);
                    setFormData({ type: "", amount: 0, frequency: "monthly", reference: "" });
                    setEditingId(null);
                    return [3 /*break*/, 13];
                case 12:
                    error_1 = _a.sent();
                    sonner_1.toast.error((error_1 === null || error_1 === void 0 ? void 0 : error_1.message) || "Failed to save");
                    return [3 /*break*/, 13];
                case 13: return [2 /*return*/];
            }
        });
    }); };
    var handleEdit = function (item) {
        setFormData({
            type: item.type,
            amount: item.amount / 100,
            frequency: item.frequency,
            reference: item.reference || ""
        });
        setEditingId(item.id);
        setIsDialogOpen(true);
    };
    var handleDelete = function (id) { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm("Delete this " + (activeTab === "allowances" ? "allowance" : "deduction") + "?"))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    if (!(activeTab === "allowances")) return [3 /*break*/, 3];
                    return [4 /*yield*/, deleteAllowMut.mutateAsync(id)];
                case 2:
                    _a.sent();
                    utils.payroll.salaryAllowances.list.refetch();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, deleteDedMut.mutateAsync(id)];
                case 4:
                    _a.sent();
                    utils.payroll.salaryDeductions.list.refetch();
                    _a.label = 5;
                case 5:
                    sonner_1.toast.success("Deleted successfully");
                    return [3 /*break*/, 7];
                case 6:
                    error_2 = _a.sent();
                    sonner_1.toast.error((error_2 === null || error_2 === void 0 ? void 0 : error_2.message) || "Failed to delete");
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var totalAmount = filteredItems.reduce(function (sum, item) { return sum + item.amount; }, 0);
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Allowances & Deductions", description: "Manage employee salary allowances and deductions", icon: React.createElement(lucide_react_1.Briefcase, { className: "h-6 w-6" }), breadcrumbs: [
            { label: "HR", href: "/hr" },
            { label: "Payroll", href: "/payroll" },
            { label: "Allowances & Deductions" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "flex gap-2" },
                React.createElement(button_1.Button, { variant: activeTab === "allowances" ? "default" : "outline", onClick: function () {
                        setActiveTab("allowances");
                        setSearchQuery("");
                        setFilterType("all");
                    } }, "Allowances"),
                React.createElement(button_1.Button, { variant: activeTab === "deductions" ? "default" : "outline", onClick: function () {
                        setActiveTab("deductions");
                        setSearchQuery("");
                        setFilterType("all");
                    } }, "Deductions")),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                React.createElement(stats_card_1.StatsCard, { title: "Total " + (activeTab === "allowances" ? "Allowances" : "Deductions"), value: filteredItems.length, icon: React.createElement(lucide_react_1.Briefcase, { className: "h-5 w-5" }) }),
                React.createElement(stats_card_1.StatsCard, { title: "Total Amount (Monthly)", value: format_1.formatCurrency(totalAmount), icon: React.createElement(lucide_react_1.Filter, { className: "h-5 w-5" }) })),
            React.createElement("div", { className: "flex items-center justify-between gap-4" },
                React.createElement("div", { className: "flex items-center gap-2 flex-1 max-w-md" },
                    React.createElement(input_1.Input, { placeholder: "Search by type...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-4" }),
                    React.createElement(select_1.Select, { value: filterType, onValueChange: setFilterType },
                        React.createElement(select_1.SelectTrigger, { className: "w-40" },
                            React.createElement(select_1.SelectValue, { placeholder: "Filter by frequency" })),
                        React.createElement(select_1.SelectContent, null,
                            React.createElement(select_1.SelectItem, { value: "all" }, "All Frequencies"),
                            React.createElement(select_1.SelectItem, { value: "monthly" }, "Monthly"),
                            React.createElement(select_1.SelectItem, { value: "quarterly" }, "Quarterly"),
                            React.createElement(select_1.SelectItem, { value: "annual" }, "Annual")))),
                React.createElement(dialog_1.Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen },
                    React.createElement(dialog_1.DialogTrigger, { asChild: true },
                        React.createElement(button_1.Button, { className: "gap-2", onClick: function () {
                                setEditingId(null);
                                setFormData({ type: "", amount: 0, frequency: "monthly", reference: "" });
                            } },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                            "New ",
                            activeTab === "allowances" ? "Allowance" : "Deduction")),
                    React.createElement(dialog_1.DialogContent, { className: "max-w-md" },
                        React.createElement(dialog_1.DialogHeader, null,
                            React.createElement(dialog_1.DialogTitle, null,
                                editingId ? "Edit" : "Create",
                                " ",
                                activeTab === "allowances" ? "Allowance" : "Deduction"),
                            React.createElement(dialog_1.DialogDescription, null,
                                "Add a new ",
                                activeTab === "allowances" ? "allowance" : "deduction",
                                " component")),
                        React.createElement("div", { className: "space-y-4" },
                            React.createElement("div", null,
                                React.createElement("label", { className: "block text-sm font-medium mb-1" }, "Type/Name"),
                                React.createElement(input_1.Input, { placeholder: activeTab === "allowances" ? "e.g., Housing Allowance" : "e.g., Health Insurance", value: formData.type, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { type: e.target.value })); } })),
                            React.createElement("div", null,
                                React.createElement("label", { className: "block text-sm font-medium mb-1" }, "Amount (KES)"),
                                React.createElement(input_1.Input, { type: "number", placeholder: "0.00", value: formData.amount, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { amount: parseFloat(e.target.value) || 0 }));
                                    } })),
                            React.createElement("div", null,
                                React.createElement("label", { className: "block text-sm font-medium mb-1" }, "Frequency"),
                                React.createElement(select_1.Select, { value: formData.frequency, onValueChange: function (value) {
                                        return setFormData(__assign(__assign({}, formData), { frequency: value }));
                                    } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "monthly" }, "Monthly"),
                                        React.createElement(select_1.SelectItem, { value: "quarterly" }, "Quarterly"),
                                        React.createElement(select_1.SelectItem, { value: "annual" }, "Annual")))),
                            activeTab === "deductions" && (React.createElement("div", null,
                                React.createElement("label", { className: "block text-sm font-medium mb-1" }, "Reference (Optional)"),
                                React.createElement(input_1.Input, { placeholder: "e.g., Insurance Policy #", value: formData.reference, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { reference: e.target.value })); } }))),
                            React.createElement(button_1.Button, { onClick: handleSave, className: "w-full" }, editingId ? "Update" : "Create"))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, activeTab === "allowances" ? "Salary Allowances" : "Salary Deductions"),
                    React.createElement(card_1.CardDescription, null,
                        filteredItems.length,
                        " items configured")),
                React.createElement(card_1.CardContent, null, isLoading ? (React.createElement("div", { className: "text-center py-8 text-muted-foreground" }, "Loading...")) : filteredItems.length === 0 ? (React.createElement("div", { className: "text-center py-8 text-muted-foreground" },
                    "No ",
                    activeTab === "allowances" ? "allowances" : "deductions",
                    " found")) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Type"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Amount"),
                                React.createElement(table_1.TableHead, null, "Frequency"),
                                activeTab === "deductions" && React.createElement(table_1.TableHead, { className: "hidden md:table-cell" }, "Reference"),
                                React.createElement(table_1.TableHead, { className: "text-center" }, "Status"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, filteredItems.map(function (item) { return (React.createElement(table_1.TableRow, { key: item.id },
                            React.createElement(table_1.TableCell, { className: "font-medium" }, item.type),
                            React.createElement(table_1.TableCell, { className: "text-right font-mono" }, format_1.formatCurrency(item.amount)),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { variant: "outline" }, item.frequency)),
                            activeTab === "deductions" && (React.createElement(table_1.TableCell, { className: "hidden md:table-cell text-sm text-muted-foreground" }, item.reference || "-")),
                            React.createElement(table_1.TableCell, { className: "text-center" },
                                React.createElement(badge_1.Badge, { variant: item.isActive ? "default" : "secondary" }, item.isActive ? "Active" : "Inactive")),
                            React.createElement(table_1.TableCell, { className: "text-right" },
                                React.createElement("div", { className: "flex justify-end gap-2" },
                                    React.createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function () { return handleEdit(item); } },
                                        React.createElement(lucide_react_1.Edit2, { className: "h-4 w-4" })),
                                    React.createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function () { return handleDelete(item.id); } },
                                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4 text-red-500" })))))); }))))))))));
}
exports["default"] = AllowancesDeductions;
