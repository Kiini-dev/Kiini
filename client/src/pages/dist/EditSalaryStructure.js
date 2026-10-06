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
var RichTextEditor_1 = require("@/components/RichTextEditor");
var card_1 = require("@/components/ui/card");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var mutationHelpers_1 = require("@/lib/mutationHelpers");
var spinner_1 = require("@/components/ui/spinner");
function EditSalaryStructure() {
    var _this = this;
    var id = wouter_1.useParams().id;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = react_1.useState(false), isLoading = _b[0], setIsLoading = _b[1];
    var utils = trpc_1.trpc.useUtils();
    var _c = react_1.useState({
        basicSalary: "",
        allowances: "",
        deductions: "",
        taxRate: "",
        notes: ""
    }), formData = _c[0], setFormData = _c[1];
    var _d = trpc_1.trpc.payroll.salaryStructures.list.useQuery(), _e = _d.data, structures = _e === void 0 ? [] : _e, isLoadingData = _d.isLoading;
    var structure = structures.find(function (s) { return s.id === id; });
    react_1.useEffect(function () {
        if (structure) {
            setFormData({
                basicSalary: structure.basicSalary ? String(Number(structure.basicSalary) / 100) : "",
                allowances: structure.allowances ? String(Number(structure.allowances) / 100) : "",
                deductions: structure.deductions ? String(Number(structure.deductions) / 100) : "",
                taxRate: structure.taxRate ? String(structure.taxRate) : "",
                notes: structure.notes || ""
            });
        }
    }, [structure]);
    var updateMutation = trpc_1.trpc.payroll.salaryStructures.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Salary structure updated successfully!");
            utils.payroll.salaryStructures.list.invalidate();
            navigate("/payroll");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to update salary structure: " + error.message);
        }
    });
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!formData.basicSalary) {
                        sonner_1.toast.error("Basic salary is required");
                        return [2 /*return*/];
                    }
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, mutationHelpers_1["default"](updateMutation, {
                            id: id || "",
                            basicSalary: parseFloat(formData.basicSalary) * 100,
                            allowances: formData.allowances ? parseFloat(formData.allowances) * 100 : undefined,
                            deductions: formData.deductions ? parseFloat(formData.deductions) * 100 : undefined,
                            taxRate: formData.taxRate ? parseFloat(formData.taxRate) : undefined,
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
    if (isLoadingData) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Salary Structure", icon: React.createElement(lucide_react_1.Layers, { className: "w-6 h-6" }) },
            React.createElement("div", { className: "flex items-center justify-center py-12" },
                React.createElement(spinner_1.Spinner, { className: "h-8 w-8" }))));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Salary Structure", description: "Update salary structure details", icon: React.createElement(lucide_react_1.Layers, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Payroll", href: "/payroll" },
            { label: "Edit Salary Structure" },
        ], actions: React.createElement(button_1.Button, { variant: "outline", onClick: function () { return navigate("/payroll"); } },
            React.createElement(lucide_react_1.ArrowLeft, { className: "mr-2 h-4 w-4" }),
            "Back to Payroll") },
        React.createElement("div", { className: "space-y-6 max-w-2xl" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Salary Structure Details"),
                    React.createElement(card_1.CardDescription, null, "Update the salary structure breakdown")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "basicSalary" }, "Basic Salary (KES) *"),
                            React.createElement(input_1.Input, { id: "basicSalary", type: "number", step: "0.01", value: formData.basicSalary, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { basicSalary: e.target.value })); }, required: true })),
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "allowances" }, "Total Allowances (KES)"),
                                React.createElement(input_1.Input, { id: "allowances", type: "number", step: "0.01", value: formData.allowances, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { allowances: e.target.value })); } })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "deductions" }, "Total Deductions (KES)"),
                                React.createElement(input_1.Input, { id: "deductions", type: "number", step: "0.01", value: formData.deductions, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { deductions: e.target.value })); } }))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "taxRate" }, "Tax Rate (%)"),
                            React.createElement(input_1.Input, { id: "taxRate", type: "number", step: "0.01", value: formData.taxRate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { taxRate: e.target.value })); }, placeholder: "e.g., 30" })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "notes" }, "Notes"),
                            React.createElement(RichTextEditor_1.RichTextEditor, { value: formData.notes, onChange: function (html) { return setFormData(__assign(__assign({}, formData), { notes: html })); }, minHeight: "100px" })),
                        React.createElement("div", { className: "flex gap-3 pt-4" },
                            React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return navigate("/payroll"); } }, "Cancel"),
                            React.createElement(button_1.Button, { type: "submit", disabled: isLoading || updateMutation.isPending, className: "bg-blue-600 hover:bg-blue-700" }, (isLoading || updateMutation.isPending) ? React.createElement(React.Fragment, null,
                                React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
                                "Saving...") : React.createElement(React.Fragment, null,
                                React.createElement(lucide_react_1.Save, { className: "h-4 w-4 mr-2" }),
                                "Save Changes")))))))));
}
exports["default"] = EditSalaryStructure;
