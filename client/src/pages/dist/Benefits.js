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
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var stats_card_1 = require("@/components/ui/stats-card");
var format_1 = require("@/utils/format");
function Benefits() {
    var _this = this;
    var _a = react_1.useState(""), searchQuery = _a[0], setSearchQuery = _a[1];
    var _b = react_1.useState(false), isDialogOpen = _b[0], setIsDialogOpen = _b[1];
    var _c = react_1.useState(null), editingId = _c[0], setEditingId = _c[1];
    var _d = react_1.useState({
        type: "",
        provider: "",
        coverage: "",
        employeeCost: 0,
        employerCost: 0,
        notes: ""
    }), formData = _d[0], setFormData = _d[1];
    // Fetch benefits
    var _e = trpc_1.trpc.payroll.benefits.list.useQuery({}), _f = _e.data, benefits = _f === void 0 ? [] : _f, isLoading = _e.isLoading;
    // Mutations
    var createMut = trpc_1.trpc.payroll.benefits.create.useMutation();
    var updateMut = trpc_1.trpc.payroll.benefits.update.useMutation();
    var deleteMut = trpc_1.trpc.payroll.benefits["delete"].useMutation();
    var utils = trpc_1.trpc.useUtils();
    var filteredBenefits = benefits.filter(function (b) {
        return b.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.coverage.toLowerCase().includes(searchQuery.toLowerCase());
    });
    var handleSave = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!formData.type.trim()) {
                        sonner_1.toast.error("Please enter a benefit type");
                        return [2 /*return*/];
                    }
                    if (!formData.provider.trim()) {
                        sonner_1.toast.error("Please enter a provider");
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    if (!editingId) return [3 /*break*/, 3];
                    return [4 /*yield*/, updateMut.mutateAsync(__assign(__assign({ id: editingId }, formData), { employeeCost: Math.round(formData.employeeCost * 100), employerCost: Math.round(formData.employerCost * 100) }))];
                case 2:
                    _a.sent();
                    sonner_1.toast.success("Benefit updated");
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, createMut.mutateAsync(__assign(__assign({}, formData), { employeeCost: Math.round(formData.employeeCost * 100), employerCost: Math.round(formData.employerCost * 100) }))];
                case 4:
                    _a.sent();
                    sonner_1.toast.success("Benefit created");
                    _a.label = 5;
                case 5:
                    setIsDialogOpen(false);
                    setFormData({
                        type: "",
                        provider: "",
                        coverage: "",
                        employeeCost: 0,
                        employerCost: 0,
                        notes: ""
                    });
                    setEditingId(null);
                    utils.payroll.benefits.list.refetch();
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    sonner_1.toast.error((error_1 === null || error_1 === void 0 ? void 0 : error_1.message) || "Failed to save benefit");
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleEdit = function (benefit) {
        setFormData({
            type: benefit.type,
            provider: benefit.provider,
            coverage: benefit.coverage,
            employeeCost: benefit.employeeCost / 100,
            employerCost: benefit.employerCost / 100,
            notes: benefit.notes || ""
        });
        setEditingId(benefit.id);
        setIsDialogOpen(true);
    };
    var handleDelete = function (id) { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm("Delete this benefit?"))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, deleteMut.mutateAsync(id)];
                case 2:
                    _a.sent();
                    sonner_1.toast.success("Benefit deleted");
                    utils.payroll.benefits.list.refetch();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    sonner_1.toast.error((error_2 === null || error_2 === void 0 ? void 0 : error_2.message) || "Failed to delete benefit");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var totalEmployeeCost = filteredBenefits.reduce(function (sum, b) { return sum + (b.employeeCost || 0); }, 0);
    var totalEmployerCost = filteredBenefits.reduce(function (sum, b) { return sum + (b.employerCost || 0); }, 0);
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Employee Benefits", description: "Manage health, insurance, and other employee benefits", icon: React.createElement(lucide_react_1.Heart, { className: "h-6 w-6" }), breadcrumbs: [
            { label: "HR", href: "/hr" },
            { label: "Payroll", href: "/payroll" },
            { label: "Benefits" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                React.createElement(stats_card_1.StatsCard, { title: "Total Benefits", value: filteredBenefits.length, icon: React.createElement(lucide_react_1.Heart, { className: "h-5 w-5" }) }),
                React.createElement(stats_card_1.StatsCard, { title: "Employee Cost", value: format_1.formatCurrency(totalEmployeeCost), description: "Per benefit" }),
                React.createElement(stats_card_1.StatsCard, { title: "Employer Cost", value: format_1.formatCurrency(totalEmployerCost), description: "Per benefit" })),
            React.createElement("div", { className: "flex items-center justify-between gap-4" },
                React.createElement("div", { className: "relative flex-1 max-w-xs" },
                    React.createElement(input_1.Input, { placeholder: "Search benefits...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-4" })),
                React.createElement(dialog_1.Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen },
                    React.createElement(dialog_1.DialogTrigger, { asChild: true },
                        React.createElement(button_1.Button, { className: "gap-2" },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                            "New Benefit")),
                    React.createElement(dialog_1.DialogContent, { className: "max-w-md" },
                        React.createElement(dialog_1.DialogHeader, null,
                            React.createElement(dialog_1.DialogTitle, null, editingId ? "Edit Benefit" : "Add New Benefit"),
                            React.createElement(dialog_1.DialogDescription, null, "Configure employee benefit programs")),
                        React.createElement("div", { className: "space-y-4" },
                            React.createElement("div", null,
                                React.createElement("label", { className: "block text-sm font-medium mb-1" }, "Benefit Type"),
                                React.createElement(input_1.Input, { placeholder: "e.g., Health Insurance", value: formData.type, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { type: e.target.value })); } })),
                            React.createElement("div", null,
                                React.createElement("label", { className: "block text-sm font-medium mb-1" }, "Provider"),
                                React.createElement(input_1.Input, { placeholder: "e.g., Jubilee Insurance", value: formData.provider, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { provider: e.target.value })); } })),
                            React.createElement("div", null,
                                React.createElement("label", { className: "block text-sm font-medium mb-1" }, "Coverage Level"),
                                React.createElement(input_1.Input, { placeholder: "e.g., Family, Individual, Group", value: formData.coverage, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { coverage: e.target.value })); } })),
                            React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2" },
                                React.createElement("div", null,
                                    React.createElement("label", { className: "block text-sm font-medium mb-1" }, "Employee Cost (KES)"),
                                    React.createElement(input_1.Input, { type: "number", placeholder: "0.00", value: formData.employeeCost, onChange: function (e) {
                                            return setFormData(__assign(__assign({}, formData), { employeeCost: parseFloat(e.target.value) || 0 }));
                                        } })),
                                React.createElement("div", null,
                                    React.createElement("label", { className: "block text-sm font-medium mb-1" }, "Employer Cost (KES)"),
                                    React.createElement(input_1.Input, { type: "number", placeholder: "0.00", value: formData.employerCost, onChange: function (e) {
                                            return setFormData(__assign(__assign({}, formData), { employerCost: parseFloat(e.target.value) || 0 }));
                                        } }))),
                            React.createElement("div", null,
                                React.createElement("label", { className: "block text-sm font-medium mb-1" }, "Notes (Optional)"),
                                React.createElement(input_1.Input, { placeholder: "Additional details...", value: formData.notes, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { notes: e.target.value })); } })),
                            React.createElement(button_1.Button, { onClick: handleSave, className: "w-full" }, editingId ? "Update Benefit" : "Add Benefit"))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Benefit Programs"),
                    React.createElement(card_1.CardDescription, null,
                        filteredBenefits.length,
                        " benefits configured")),
                React.createElement(card_1.CardContent, null, isLoading ? (React.createElement("div", { className: "text-center py-8 text-muted-foreground" }, "Loading benefits...")) : filteredBenefits.length === 0 ? (React.createElement("div", { className: "text-center py-8 text-muted-foreground" }, "No benefits found")) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Type"),
                                React.createElement(table_1.TableHead, { className: "hidden md:table-cell" }, "Provider"),
                                React.createElement(table_1.TableHead, { className: "hidden md:table-cell" }, "Coverage"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Employee Cost"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Employer Cost"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, filteredBenefits.map(function (benefit) { return (React.createElement(table_1.TableRow, { key: benefit.id },
                            React.createElement(table_1.TableCell, { className: "font-medium" }, benefit.type),
                            React.createElement(table_1.TableCell, { className: "hidden md:table-cell text-sm" }, benefit.provider),
                            React.createElement(table_1.TableCell, { className: "hidden md:table-cell text-sm text-muted-foreground" }, benefit.coverage),
                            React.createElement(table_1.TableCell, { className: "text-right font-mono" }, format_1.formatCurrency(benefit.employeeCost)),
                            React.createElement(table_1.TableCell, { className: "text-right font-mono" }, format_1.formatCurrency(benefit.employerCost)),
                            React.createElement(table_1.TableCell, { className: "text-right" },
                                React.createElement("div", { className: "flex justify-end gap-2" },
                                    React.createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function () { return handleEdit(benefit); } },
                                        React.createElement(lucide_react_1.Edit2, { className: "h-4 w-4" })),
                                    React.createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function () { return handleDelete(benefit.id); } },
                                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4 text-red-500" })))))); }))))))))));
}
exports["default"] = Benefits;
