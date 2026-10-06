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
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var mutationHelpers_1 = require("@/lib/mutationHelpers");
function CreateSalaryStructure() {
    var _this = this;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = react_1.useState(false), isLoading = _b[0], setIsLoading = _b[1];
    var utils = trpc_1.trpc.useUtils();
    var _c = react_1.useState({
        employeeId: "",
        basicSalary: "",
        allowances: "0",
        deductions: "0",
        taxRate: "0",
        notes: ""
    }), formData = _c[0], setFormData = _c[1];
    var _d = trpc_1.trpc.employees.list.useQuery({}).data, employees = _d === void 0 ? [] : _d;
    var createMutation = trpc_1.trpc.payroll.salaryStructures.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Salary structure created successfully!");
            utils.payroll.salaryStructures.list.invalidate();
            navigate("/payroll");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to create salary structure: " + error.message);
        }
    });
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!formData.employeeId || !formData.basicSalary) {
                        sonner_1.toast.error("Please fill in required fields (Employee and Basic Salary)");
                        return [2 /*return*/];
                    }
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, mutationHelpers_1["default"](createMutation, {
                            employeeId: formData.employeeId,
                            basicSalary: parseInt(formData.basicSalary) * 100,
                            allowances: parseInt(formData.allowances) * 100,
                            deductions: parseInt(formData.deductions) * 100,
                            taxRate: parseInt(formData.taxRate) * 100,
                            notes: formData.notes || undefined
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Create Salary Structure", description: "Set up salary structure for an employee", icon: React.createElement(lucide_react_1.DollarSign, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Payroll", href: "/payroll" },
            { label: "Create Salary Structure" },
        ], backLink: { label: "Payroll", href: "/payroll" } },
        React.createElement("div", { className: "space-y-6 max-w-2xl" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Salary Structure Details"),
                    React.createElement(card_1.CardDescription, null, "Define the salary components for an employee including allowances, deductions, and tax")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "employeeId" }, "Employee *"),
                            React.createElement(select_1.Select, { value: formData.employeeId, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { employeeId: value })); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, { placeholder: "Select an employee" })),
                                React.createElement(select_1.SelectContent, null, employees.map(function (employee) { return (React.createElement(select_1.SelectItem, { key: employee.id, value: employee.id },
                                    (employee.firstName || ""),
                                    " ",
                                    (employee.lastName || ""))); })))),
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "basicSalary" },
                                    "Basic Salary (KES) *",
                                    React.createElement("span", { className: "text-xs text-muted-foreground ml-1" }, "(before allowances)")),
                                React.createElement(input_1.Input, { id: "basicSalary", type: "number", step: "0.01", value: formData.basicSalary, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { basicSalary: e.target.value })); }, placeholder: "50000", required: true })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "allowances" },
                                    "Total Allowances (KES)",
                                    React.createElement("span", { className: "text-xs text-muted-foreground ml-1" }, "(house, transport, etc.)")),
                                React.createElement(input_1.Input, { id: "allowances", type: "number", step: "0.01", value: formData.allowances, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { allowances: e.target.value })); }, placeholder: "10000" }))),
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "deductions" },
                                    "Total Deductions (KES)",
                                    React.createElement("span", { className: "text-xs text-muted-foreground ml-1" }, "(loan, pension, etc.)")),
                                React.createElement(input_1.Input, { id: "deductions", type: "number", step: "0.01", value: formData.deductions, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { deductions: e.target.value })); }, placeholder: "5000" })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "taxRate" },
                                    "Tax Rate (%)",
                                    React.createElement("span", { className: "text-xs text-muted-foreground ml-1" }, "(percentage)")),
                                React.createElement(input_1.Input, { id: "taxRate", type: "number", step: "0.1", min: "0", max: "100", value: formData.taxRate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { taxRate: e.target.value })); }, placeholder: "25" }))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "notes" }, "Notes"),
                            React.createElement(textarea_1.Textarea, { id: "notes", value: formData.notes, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { notes: e.target.value })); }, placeholder: "Any additional notes about this salary structure", rows: 4 })),
                        React.createElement("div", { className: "bg-slate-50 p-4 rounded-lg" },
                            React.createElement("h4", { className: "font-semibold mb-2" }, "Salary Summary"),
                            React.createElement("div", { className: "grid grid-cols-2 gap-2 text-sm" },
                                React.createElement("div", null, "Basic Salary:"),
                                React.createElement("div", { className: "font-semibold" },
                                    "KES ",
                                    parseInt(formData.basicSalary || 0).toLocaleString()),
                                React.createElement("div", null, "+ Allowances:"),
                                React.createElement("div", { className: "font-semibold" },
                                    "KES ",
                                    parseInt(formData.allowances || 0).toLocaleString()),
                                React.createElement("div", null, "- Deductions:"),
                                React.createElement("div", { className: "font-semibold" },
                                    "KES ",
                                    parseInt(formData.deductions || 0).toLocaleString()),
                                React.createElement("div", null,
                                    "- Tax (",
                                    parseInt(formData.taxRate || 0),
                                    "%):"),
                                React.createElement("div", { className: "font-semibold" },
                                    "KES",
                                    " ",
                                    (((parseInt(formData.basicSalary || 0) + parseInt(formData.allowances || 0)) *
                                        parseInt(formData.taxRate || 0)) /
                                        100).toLocaleString()),
                                React.createElement("div", { className: "border-t pt-2 font-bold" }, "Net Salary:"),
                                React.createElement("div", { className: "border-t pt-2 font-bold" },
                                    "KES",
                                    " ",
                                    (parseInt(formData.basicSalary || 0) +
                                        parseInt(formData.allowances || 0) -
                                        parseInt(formData.deductions || 0) -
                                        ((parseInt(formData.basicSalary || 0) + parseInt(formData.allowances || 0)) *
                                            parseInt(formData.taxRate || 0)) /
                                            100).toLocaleString()))),
                        React.createElement("div", { className: "flex gap-3 pt-4" },
                            React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return navigate("/payroll"); } }, "Cancel"),
                            React.createElement(button_1.Button, { type: "submit", disabled: isLoading || createMutation.isPending, className: "bg-green-600 hover:bg-green-700" }, (isLoading || createMutation.isPending) ? (React.createElement(React.Fragment, null,
                                React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
                                "Creating...")) : (React.createElement(React.Fragment, null,
                                React.createElement(lucide_react_1.Save, { className: "h-4 w-4 mr-2" }),
                                "Create Salary Structure"))))))))));
}
exports["default"] = CreateSalaryStructure;
