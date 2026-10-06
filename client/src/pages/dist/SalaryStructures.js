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
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var stats_card_1 = require("@/components/ui/stats-card");
var format_1 = require("@/utils/format");
function SalaryStructures() {
    var _this = this;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var _b = react_1.useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = react_1.useState(false), isDialogOpen = _c[0], setIsDialogOpen = _c[1];
    var _d = react_1.useState(null), editingId = _d[0], setEditingId = _d[1];
    var _e = react_1.useState({
        name: "",
        description: "",
        basicSalary: 0
    }), formData = _e[0], setFormData = _e[1];
    // Fetch salary structures
    var _f = trpc_1.trpc.payroll.salaryStructures.list.useQuery({}), _g = _f.data, structures = _g === void 0 ? [] : _g, isLoading = _f.isLoading;
    // Mutations
    var createMut = trpc_1.trpc.payroll.salaryStructures.create.useMutation();
    var updateMut = trpc_1.trpc.payroll.salaryStructures.update.useMutation();
    var deleteMut = trpc_1.trpc.payroll.salaryStructures["delete"].useMutation();
    var utils = trpc_1.trpc.useUtils();
    var filteredStructures = structures.filter(function (s) {
        return s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.description.toLowerCase().includes(searchQuery.toLowerCase());
    });
    var handleSave = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!formData.name.trim()) {
                        sonner_1.toast.error("Please enter a structure name");
                        return [2 /*return*/];
                    }
                    if (formData.basicSalary <= 0) {
                        sonner_1.toast.error("Basic salary must be greater than 0");
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    if (!editingId) return [3 /*break*/, 3];
                    return [4 /*yield*/, updateMut.mutateAsync(__assign({ id: editingId }, formData))];
                case 2:
                    _a.sent();
                    sonner_1.toast.success("Salary structure updated");
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, createMut.mutateAsync(formData)];
                case 4:
                    _a.sent();
                    sonner_1.toast.success("Salary structure created");
                    _a.label = 5;
                case 5:
                    setIsDialogOpen(false);
                    setFormData({ name: "", description: "", basicSalary: 0 });
                    setEditingId(null);
                    utils.payroll.salaryStructures.list.refetch();
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    sonner_1.toast.error((error_1 === null || error_1 === void 0 ? void 0 : error_1.message) || "Failed to save structure");
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleEdit = function (structure) {
        setFormData({
            name: structure.name,
            description: structure.description,
            basicSalary: structure.basicSalary
        });
        setEditingId(structure.id);
        setIsDialogOpen(true);
    };
    var handleDelete = function (id) { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm("Delete this salary structure?"))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, deleteMut.mutateAsync(id)];
                case 2:
                    _a.sent();
                    sonner_1.toast.success("Salary structure deleted");
                    utils.payroll.salaryStructures.list.refetch();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    sonner_1.toast.error((error_2 === null || error_2 === void 0 ? void 0 : error_2.message) || "Failed to delete structure");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var totalStructures = structures.length;
    var averageBasicSalary = structures.length > 0
        ? structures.reduce(function (sum, s) { return sum + (s.basicSalary || 0); }, 0) / structures.length
        : 0;
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Salary Structures", description: "Manage salary grades and structures for employees", icon: React.createElement(lucide_react_1.DollarSign, { className: "h-6 w-6" }), breadcrumbs: [
            { label: "HR", href: "/hr" },
            { label: "Payroll", href: "/payroll" },
            { label: "Salary Structures" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                React.createElement(stats_card_1.StatsCard, { title: "Total Structures", value: totalStructures, icon: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }) }),
                React.createElement(stats_card_1.StatsCard, { title: "Avg Basic Salary", value: format_1.formatCurrency(averageBasicSalary), icon: React.createElement(lucide_react_1.Users, { className: "h-5 w-5" }) })),
            React.createElement("div", { className: "flex items-center justify-between gap-4" },
                React.createElement("div", { className: "relative flex-1 max-w-xs" },
                    React.createElement(input_1.Input, { placeholder: "Search structures...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-4" })),
                React.createElement(dialog_1.Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen },
                    React.createElement(dialog_1.DialogTrigger, { asChild: true },
                        React.createElement(button_1.Button, { className: "gap-2" },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                            "New Structure")),
                    React.createElement(dialog_1.DialogContent, { className: "max-w-md" },
                        React.createElement(dialog_1.DialogHeader, null,
                            React.createElement(dialog_1.DialogTitle, null, editingId ? "Edit Salary Structure" : "Create Salary Structure"),
                            React.createElement(dialog_1.DialogDescription, null, "Define salary grade levels and basic compensation")),
                        React.createElement("div", { className: "space-y-4" },
                            React.createElement("div", null,
                                React.createElement("label", { className: "block text-sm font-medium mb-1" }, "Structure Name"),
                                React.createElement(input_1.Input, { placeholder: "e.g., Senior Manager Grade 1", value: formData.name, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { name: e.target.value })); } })),
                            React.createElement("div", null,
                                React.createElement("label", { className: "block text-sm font-medium mb-1" }, "Description"),
                                React.createElement(input_1.Input, { placeholder: "e.g., For senior management roles", value: formData.description, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { description: e.target.value })); } })),
                            React.createElement("div", null,
                                React.createElement("label", { className: "block text-sm font-medium mb-1" }, "Basic Salary (KES)"),
                                React.createElement(input_1.Input, { type: "number", placeholder: "0.00", value: formData.basicSalary, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { basicSalary: parseFloat(e.target.value) || 0 }));
                                    } })),
                            React.createElement(button_1.Button, { onClick: handleSave, disabled: createMut.isPending || updateMut.isPending, className: "w-full" }, editingId ? "Update Structure" : "Create Structure"))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "All Salary Structures"),
                    React.createElement(card_1.CardDescription, null,
                        filteredStructures.length,
                        " structures configured")),
                React.createElement(card_1.CardContent, null, isLoading ? (React.createElement("div", { className: "text-center py-8 text-muted-foreground" }, "Loading structures...")) : filteredStructures.length === 0 ? (React.createElement("div", { className: "text-center py-8 text-muted-foreground" }, "No salary structures found")) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Name"),
                                React.createElement(table_1.TableHead, { className: "hidden md:table-cell" }, "Description"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Basic Salary"),
                                React.createElement(table_1.TableHead, { className: "text-center" }, "Employees"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, filteredStructures.map(function (structure) { return (React.createElement(table_1.TableRow, { key: structure.id },
                            React.createElement(table_1.TableCell, { className: "font-medium" }, structure.name),
                            React.createElement(table_1.TableCell, { className: "hidden md:table-cell text-sm text-muted-foreground" }, structure.description),
                            React.createElement(table_1.TableCell, { className: "text-right font-mono" }, format_1.formatCurrency(structure.basicSalary)),
                            React.createElement(table_1.TableCell, { className: "text-center" },
                                React.createElement(badge_1.Badge, { variant: "outline" }, structure.employeeCount || 0)),
                            React.createElement(table_1.TableCell, { className: "text-right" },
                                React.createElement("div", { className: "flex justify-end gap-2" },
                                    React.createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function () { return handleEdit(structure); } },
                                        React.createElement(lucide_react_1.Edit2, { className: "h-4 w-4" })),
                                    React.createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function () { return handleDelete(structure.id); } },
                                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4 text-red-500" })))))); }))))))))));
}
exports["default"] = SalaryStructures;
