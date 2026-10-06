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
function TaxInformation() {
    var _this = this;
    var _a = react_1.useState(""), searchQuery = _a[0], setSearchQuery = _a[1];
    var _b = react_1.useState(false), isDialogOpen = _b[0], setIsDialogOpen = _b[1];
    var _c = react_1.useState(null), editingId = _c[0], setEditingId = _c[1];
    var _d = react_1.useState(""), selectedEmployeeId = _d[0], setSelectedEmployeeId = _d[1];
    var _e = react_1.useState({
        taxNumber: "",
        taxBracket: "25%",
        exemptions: 0,
        notes: ""
    }), formData = _e[0], setFormData = _e[1];
    // Fetch employees for dropdown
    var _f = trpc_1.trpc.employees.list.useQuery({}), _g = _f.data, employees = _g === void 0 ? [] : _g, empLoading = _f.isLoading;
    // Fetch tax information
    var _h = trpc_1.trpc.payroll.employeeTaxInfo.list.useQuery({}), _j = _h.data, taxInfo = _j === void 0 ? [] : _j, isLoading = _h.isLoading;
    // Mutations
    var createMut = trpc_1.trpc.payroll.employeeTaxInfo.create.useMutation();
    var updateMut = trpc_1.trpc.payroll.employeeTaxInfo.update.useMutation();
    var deleteMut = trpc_1.trpc.payroll.employeeTaxInfo["delete"].useMutation();
    var utils = trpc_1.trpc.useUtils();
    var filteredTaxInfo = taxInfo.filter(function (t) {
        var emp = employees.find(function (e) { return e.id === t.employeeId; });
        var empName = emp ? emp.firstName + " " + emp.lastName : "";
        return (empName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.taxNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    });
    var handleSave = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedEmployeeId && !editingId) {
                        sonner_1.toast.error("Please select an employee");
                        return [2 /*return*/];
                    }
                    if (!formData.taxNumber.trim()) {
                        sonner_1.toast.error("Please enter a tax number");
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    if (!editingId) return [3 /*break*/, 3];
                    return [4 /*yield*/, updateMut.mutateAsync(__assign({ id: editingId }, formData))];
                case 2:
                    _a.sent();
                    sonner_1.toast.success("Tax information updated");
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, createMut.mutateAsync(__assign({ employeeId: selectedEmployeeId }, formData))];
                case 4:
                    _a.sent();
                    sonner_1.toast.success("Tax information created");
                    _a.label = 5;
                case 5:
                    setIsDialogOpen(false);
                    setFormData({
                        taxNumber: "",
                        taxBracket: "25%",
                        exemptions: 0,
                        notes: ""
                    });
                    setSelectedEmployeeId("");
                    setEditingId(null);
                    utils.payroll.employeeTaxInfo.list.refetch();
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    sonner_1.toast.error((error_1 === null || error_1 === void 0 ? void 0 : error_1.message) || "Failed to save tax information");
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleEdit = function (taxRecord) {
        setFormData({
            taxNumber: taxRecord.taxNumber,
            taxBracket: taxRecord.taxBracket,
            exemptions: taxRecord.exemptions,
            notes: taxRecord.notes || ""
        });
        setSelectedEmployeeId(taxRecord.employeeId);
        setEditingId(taxRecord.id);
        setIsDialogOpen(true);
    };
    var handleDelete = function (id) { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm("Delete this tax record?"))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, deleteMut.mutateAsync(id)];
                case 2:
                    _a.sent();
                    sonner_1.toast.success("Tax information deleted");
                    utils.payroll.employeeTaxInfo.list.refetch();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    sonner_1.toast.error((error_2 === null || error_2 === void 0 ? void 0 : error_2.message) || "Failed to delete");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var employeesWithTax = filteredTaxInfo.length;
    var avgExemptions = filteredTaxInfo.length > 0
        ? Math.round(filteredTaxInfo.reduce(function (sum, t) { return sum + (t.exemptions || 0); }, 0) /
            filteredTaxInfo.length)
        : 0;
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Tax Information", description: "Manage employee KRA PIN, tax brackets, and exemptions", icon: React.createElement(lucide_react_1.FileText, { className: "h-6 w-6" }), breadcrumbs: [
            { label: "HR", href: "/hr" },
            { label: "Payroll", href: "/payroll" },
            { label: "Tax Information" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                React.createElement(stats_card_1.StatsCard, { title: "Employees with Tax Info", value: employeesWithTax, icon: React.createElement(lucide_react_1.FileText, { className: "h-5 w-5" }) }),
                React.createElement(stats_card_1.StatsCard, { title: "Avg Exemptions", value: avgExemptions, description: "Per employee" })),
            React.createElement("div", { className: "flex items-center justify-between gap-4" },
                React.createElement("div", { className: "relative flex-1 max-w-xs" },
                    React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                    React.createElement(input_1.Input, { placeholder: "Search employees or KRA PIN...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-10" })),
                React.createElement(dialog_1.Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen },
                    React.createElement(dialog_1.DialogTrigger, { asChild: true },
                        React.createElement(button_1.Button, { className: "gap-2" },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                            "Add Tax Info")),
                    React.createElement(dialog_1.DialogContent, { className: "max-w-md" },
                        React.createElement(dialog_1.DialogHeader, null,
                            React.createElement(dialog_1.DialogTitle, null, editingId ? "Edit Tax Information" : "Add Tax Information"),
                            React.createElement(dialog_1.DialogDescription, null, "Configure employee KRA PIN and tax details")),
                        React.createElement("div", { className: "space-y-4" },
                            React.createElement("div", null,
                                React.createElement("label", { className: "block text-sm font-medium mb-1" }, "Employee"),
                                React.createElement(select_1.Select, { value: selectedEmployeeId, onValueChange: setSelectedEmployeeId, disabled: !!editingId },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select employee" })),
                                    React.createElement(select_1.SelectContent, null, employees.map(function (emp) { return (React.createElement(select_1.SelectItem, { key: emp.id, value: emp.id },
                                        emp.firstName,
                                        " ",
                                        emp.lastName,
                                        " (",
                                        emp.employeeNumber,
                                        ")")); })))),
                            React.createElement("div", null,
                                React.createElement("label", { className: "block text-sm font-medium mb-1" }, "KRA PIN"),
                                React.createElement(input_1.Input, { placeholder: "e.g., A012345678B", value: formData.taxNumber, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { taxNumber: e.target.value })); } })),
                            React.createElement("div", null,
                                React.createElement("label", { className: "block text-sm font-medium mb-1" }, "Tax Bracket"),
                                React.createElement(select_1.Select, { value: formData.taxBracket, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { taxBracket: value })); } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "10%" }, "10%"),
                                        React.createElement(select_1.SelectItem, { value: "15%" }, "15%"),
                                        React.createElement(select_1.SelectItem, { value: "20%" }, "20%"),
                                        React.createElement(select_1.SelectItem, { value: "25%" }, "25%"),
                                        React.createElement(select_1.SelectItem, { value: "30%" }, "30%"),
                                        React.createElement(select_1.SelectItem, { value: "32.5%" }, "32.5%"),
                                        React.createElement(select_1.SelectItem, { value: "35%" }, "35%")))),
                            React.createElement("div", null,
                                React.createElement("label", { className: "block text-sm font-medium mb-1" }, "Number of Exemptions"),
                                React.createElement(input_1.Input, { type: "number", placeholder: "0", min: "0", value: formData.exemptions, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { exemptions: parseInt(e.target.value) || 0 }));
                                    } })),
                            React.createElement("div", null,
                                React.createElement("label", { className: "block text-sm font-medium mb-1" }, "Notes (Optional)"),
                                React.createElement(input_1.Input, { placeholder: "e.g., Effective from Jan 2024...", value: formData.notes, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { notes: e.target.value })); } })),
                            React.createElement(button_1.Button, { onClick: handleSave, className: "w-full" }, editingId ? "Update Tax Info" : "Add Tax Info"))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Employee Tax Records"),
                    React.createElement(card_1.CardDescription, null,
                        filteredTaxInfo.length,
                        " tax records configured")),
                React.createElement(card_1.CardContent, null, isLoading ? (React.createElement("div", { className: "text-center py-8 text-muted-foreground" }, "Loading tax information...")) : filteredTaxInfo.length === 0 ? (React.createElement("div", { className: "text-center py-8 text-muted-foreground" }, "No tax information found")) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Employee Name"),
                                React.createElement(table_1.TableHead, null, "KRA PIN"),
                                React.createElement(table_1.TableHead, null, "Tax Bracket"),
                                React.createElement(table_1.TableHead, { className: "text-center" }, "Exemptions"),
                                React.createElement(table_1.TableHead, { className: "hidden md:table-cell" }, "Notes"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, filteredTaxInfo.map(function (taxRecord) { return (React.createElement(table_1.TableRow, { key: taxRecord.id },
                            React.createElement(table_1.TableCell, { className: "font-medium" }, taxRecord.employeeName),
                            React.createElement(table_1.TableCell, { className: "font-mono text-sm" }, taxRecord.taxNumber),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { variant: "outline" }, taxRecord.taxBracket)),
                            React.createElement(table_1.TableCell, { className: "text-center" }, taxRecord.exemptions),
                            React.createElement(table_1.TableCell, { className: "hidden md:table-cell text-sm text-muted-foreground" }, taxRecord.notes || "-"),
                            React.createElement(table_1.TableCell, { className: "text-right" },
                                React.createElement("div", { className: "flex justify-end gap-2" },
                                    React.createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function () { return handleEdit(taxRecord); } },
                                        React.createElement(lucide_react_1.Edit2, { className: "h-4 w-4" })),
                                    React.createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function () { return handleDelete(taxRecord.id); } },
                                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4 text-red-500" })))))); }))))))))));
}
exports["default"] = TaxInformation;
