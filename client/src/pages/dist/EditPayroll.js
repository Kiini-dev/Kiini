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
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var const_1 = require("@/const");
var useCompanyInfo_1 = require("@/hooks/useCompanyInfo");
function EditPayroll() {
    var _this = this;
    var id = wouter_1.useParams().id;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var utils = trpc_1.trpc.useUtils();
    var companyInfo = useCompanyInfo_1.useCompanyInfo();
    var _b = react_1.useState(false), isGeneratingPDF = _b[0], setIsGeneratingPDF = _b[1];
    var _c = react_1.useState({
        employeeId: "",
        month: new Date().toISOString().split("T")[0].slice(0, 7),
        basicSalary: "",
        allowances: "",
        deductions: "",
        status: "draft",
        notes: ""
    }), formData = _c[0], setFormData = _c[1];
    var _d = react_1.useState(true), isLoading = _d[0], setIsLoading = _d[1];
    var payroll = trpc_1.trpc.payroll.getById.useQuery(id || "", { enabled: !!id }).data;
    var _e = trpc_1.trpc.employees.list.useQuery().data, employees = _e === void 0 ? [] : _e;
    react_1.useEffect(function () {
        if (payroll) {
            setFormData({
                employeeId: payroll.employeeId || "",
                month: payroll.month
                    ? new Date(payroll.month).toISOString().split("T")[0].slice(0, 7)
                    : new Date().toISOString().split("T")[0].slice(0, 7),
                basicSalary: payroll.basicSalary ? (payroll.basicSalary / 100).toString() : "",
                allowances: payroll.allowances ? (payroll.allowances / 100).toString() : "",
                deductions: payroll.deductions ? (payroll.deductions / 100).toString() : "",
                status: payroll.status || "draft",
                notes: payroll.notes || ""
            });
            setIsLoading(false);
        }
    }, [payroll]);
    var updatePayrollMutation = trpc_1.trpc.payroll.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Payroll record updated successfully!");
            utils.payroll.list.invalidate();
            utils.payroll.getById.invalidate(id || "");
            navigate("/payroll");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to update payroll record: " + error.message);
        }
    });
    var deletePayrollMutation = trpc_1.trpc.payroll["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Payroll record deleted successfully!");
            utils.payroll.list.invalidate();
            navigate("/payroll");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to delete payroll record: " + error.message);
        }
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!formData.employeeId || !formData.month || !formData.basicSalary) {
            sonner_1.toast.error("Please fill in all required fields");
            return;
        }
        updatePayrollMutation.mutate({
            id: id || "",
            employeeId: formData.employeeId,
            month: new Date(formData.month + "-01"),
            basicSalary: Math.round(parseFloat(formData.basicSalary) * 100),
            allowances: formData.allowances ? Math.round(parseFloat(formData.allowances) * 100) : undefined,
            deductions: formData.deductions ? Math.round(parseFloat(formData.deductions) * 100) : undefined,
            status: formData.status,
            notes: formData.notes || undefined
        });
    };
    var handleDelete = function () {
        if (confirm("Are you sure you want to delete this payroll record? This action cannot be undone.")) {
            deletePayrollMutation.mutate(id || "");
        }
    };
    var getEmployeeName = function () {
        var employee = employees.find(function (emp) { return emp.id === formData.employeeId; });
        return employee ? employee.firstName + " " + employee.lastName : 'Unknown';
    };
    var handleDownloadPDF = react_1.useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var printWindow, basicSalary, allowances, deductions, netSalary, htmlContent;
        return __generator(this, function (_a) {
            setIsGeneratingPDF(true);
            try {
                printWindow = window.open('', '_blank');
                if (!printWindow) {
                    sonner_1.toast.error("Please allow popups to download PDF");
                    setIsGeneratingPDF(false);
                    return [2 /*return*/];
                }
                basicSalary = parseFloat(formData.basicSalary || '0');
                allowances = parseFloat(formData.allowances || '0');
                deductions = parseFloat(formData.deductions || '0');
                netSalary = basicSalary + allowances - deductions;
                htmlContent = "\n        <!DOCTYPE html>\n        <html>\n        <head>\n          <title>Payslip - " + getEmployeeName() + " - " + formData.month + "</title>\n          <style>\n            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }\n            .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }\n            .company-info { text-align: right; font-size: 12px; }\n            .document-title { font-size: 28px; font-weight: bold; color: #1e40af; margin-bottom: 10px; }\n            .employee-info { background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px; }\n            .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }\n            .info-row:last-child { border-bottom: none; }\n            .label { font-weight: bold; color: #6b7280; }\n            .earnings-section, .deductions-section { margin-bottom: 20px; }\n            .section-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; padding: 8px; background: #e5e7eb; border-radius: 4px; }\n            .amount-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }\n            .net-salary { font-size: 20px; font-weight: bold; color: #059669; text-align: right; padding: 15px; background: #d1fae5; border-radius: 8px; margin-top: 20px; }\n            .status { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }\n            .status-pending { background: #fef3c7; color: #92400e; }\n            .status-processed { background: #dbeafe; color: #1e40af; }\n            .status-paid { background: #d1fae5; color: #065f46; }\n            @media print { body { margin: 20px; } }\n          </style>\n        </head>\n        <body>\n          <div class=\"header\">\n            <div>\n              <div class=\"document-title\">PAYSLIP</div>\n              <div>Period: " + formData.month + "</div>\n            </div>\n            <div class=\"company-info\">\n              <strong>" + const_1.APP_TITLE + "</strong><br>\n              " + (companyInfo.address ? companyInfo.address + '<br>' : '') + "\n              " + (companyInfo.email || '') + "\n            </div>\n          </div>\n          \n          <div class=\"employee-info\">\n            <div class=\"info-row\">\n              <span class=\"label\">Employee Name:</span>\n              <span>" + getEmployeeName() + "</span>\n            </div>\n            <div class=\"info-row\">\n              <span class=\"label\">Pay Period:</span>\n              <span>" + formData.month + "</span>\n            </div>\n            <div class=\"info-row\">\n              <span class=\"label\">Status:</span>\n              <span class=\"status status-" + (formData.status || 'draft') + "\">" + (formData.status || 'draft').toUpperCase() + "</span>\n            </div>\n          </div>\n          \n          <div class=\"earnings-section\">\n            <div class=\"section-title\">Earnings</div>\n            <div class=\"amount-row\">\n              <span>Basic Salary</span>\n              <span>KES " + basicSalary.toLocaleString() + "</span>\n            </div>\n            <div class=\"amount-row\">\n              <span>Allowances</span>\n              <span>KES " + allowances.toLocaleString() + "</span>\n            </div>\n            <div class=\"amount-row\" style=\"font-weight: bold;\">\n              <span>Total Earnings</span>\n              <span>KES " + (basicSalary + allowances).toLocaleString() + "</span>\n            </div>\n          </div>\n          \n          <div class=\"deductions-section\">\n            <div class=\"section-title\">Deductions</div>\n            <div class=\"amount-row\">\n              <span>Total Deductions</span>\n              <span>KES " + deductions.toLocaleString() + "</span>\n            </div>\n          </div>\n          \n          <div class=\"net-salary\">\n            Net Salary: KES " + netSalary.toLocaleString() + "\n          </div>\n          \n          " + (formData.notes ? "\n            <div style=\"margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 8px;\">\n              <strong>Notes:</strong><br>\n              " + formData.notes + "\n            </div>\n          " : '') + "\n          \n          <script>\n            window.onload = function() {\n              window.print();\n            }\n          </script>\n        </body>\n        </html>\n      ";
                printWindow.document.write(htmlContent);
                printWindow.document.close();
                sonner_1.toast.success("PDF download initiated");
            }
            catch (error) {
                console.error("PDF generation error:", error);
                sonner_1.toast.error("Failed to generate PDF");
            }
            finally {
                setIsGeneratingPDF(false);
            }
            return [2 /*return*/];
        });
    }); }, [formData, employees]);
    if (isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Payroll", description: "Update payroll record", icon: React.createElement(lucide_react_1.DollarSign, { className: "w-6 h-6" }), breadcrumbs: [
                { label: "Dashboard", href: "/crm-home" },
                { label: "HR", href: "/hr" },
                { label: "Payroll", href: "/payroll" },
                { label: "Edit Payroll" },
            ] },
            React.createElement("div", { className: "flex items-center justify-center p-8" },
                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Payroll", description: "Update payroll record", icon: React.createElement(lucide_react_1.DollarSign, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "HR", href: "/hr" },
            { label: "Payroll", href: "/payroll" },
            { label: "Edit Payroll" },
        ] },
        React.createElement("div", { className: "max-w-2xl" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Edit Payroll"),
                    React.createElement(card_1.CardDescription, null, "Update the payroll record below")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "employeeId" }, "Employee *"),
                                React.createElement(select_1.Select, { value: formData.employeeId, onValueChange: function (value) {
                                        return setFormData(__assign(__assign({}, formData), { employeeId: value }));
                                    } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select an employee" })),
                                    React.createElement(select_1.SelectContent, null, Array.isArray(employees) && employees.map(function (emp) { return (React.createElement(select_1.SelectItem, { key: emp.id, value: emp.id },
                                        (emp.firstName || ""),
                                        " ",
                                        (emp.lastName || ""))); })))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "month" }, "Month *"),
                                React.createElement(input_1.Input, { id: "month", type: "month", value: formData.month, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { month: e.target.value }));
                                    } }))),
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "basicSalary" }, "Basic Salary (Ksh) *"),
                                React.createElement(input_1.Input, { id: "basicSalary", type: "number", placeholder: "0.00", value: formData.basicSalary, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { basicSalary: e.target.value }));
                                    }, step: "0.01", min: "0" })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "allowances" }, "Allowances (Ksh)"),
                                React.createElement(input_1.Input, { id: "allowances", type: "number", placeholder: "0.00", value: formData.allowances, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { allowances: e.target.value }));
                                    }, step: "0.01", min: "0" }))),
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "deductions" }, "Deductions (Ksh)"),
                                React.createElement(input_1.Input, { id: "deductions", type: "number", placeholder: "0.00", value: formData.deductions, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { deductions: e.target.value }));
                                    }, step: "0.01", min: "0" })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "status" }, "Status"),
                                React.createElement(select_1.Select, { value: formData.status, onValueChange: function (value) {
                                        return setFormData(__assign(__assign({}, formData), { status: value }));
                                    } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select status" })),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                                        React.createElement(select_1.SelectItem, { value: "processed" }, "Processed"),
                                        React.createElement(select_1.SelectItem, { value: "paid" }, "Paid"))))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "notes" }, "Notes"),
                            React.createElement(textarea_1.Textarea, { id: "notes", placeholder: "Add any additional notes", value: formData.notes, onChange: function (e) {
                                    return setFormData(__assign(__assign({}, formData), { notes: e.target.value }));
                                }, rows: 4 })),
                        React.createElement("div", { className: "flex gap-2 justify-between" },
                            React.createElement(button_1.Button, { type: "button", variant: "destructive", onClick: handleDelete, disabled: deletePayrollMutation.isPending },
                                deletePayrollMutation.isPending ? (React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })) : (React.createElement(lucide_react_1.Trash2, { className: "mr-2 h-4 w-4" })),
                                "Delete"),
                            React.createElement("div", { className: "flex gap-2" },
                                React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return navigate("/payroll"); } },
                                    React.createElement(lucide_react_1.ArrowLeft, { className: "mr-2 h-4 w-4" }),
                                    "Cancel"),
                                React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: handleDownloadPDF, disabled: isGeneratingPDF },
                                    isGeneratingPDF ? (React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })) : (React.createElement(lucide_react_1.Download, { className: "mr-2 h-4 w-4" })),
                                    "Download Payslip"),
                                React.createElement(button_1.Button, { type: "submit", disabled: updatePayrollMutation.isPending },
                                    updatePayrollMutation.isPending ? (React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })) : (React.createElement(lucide_react_1.Save, { className: "mr-2 h-4 w-4" })),
                                    "Update Payroll")))))))));
}
exports["default"] = EditPayroll;
