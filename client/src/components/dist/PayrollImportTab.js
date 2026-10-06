"use strict";
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
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var card_1 = require("@/components/ui/card");
var alert_1 = require("@/components/ui/alert");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var table_1 = require("@/components/ui/table");
var PAYROLL_FIELDS = [
    "employeeId",
    "payPeriodStart",
    "payPeriodEnd",
    "basicSalary",
    "allowances",
    "deductions",
    "tax",
    "netSalary",
    "status",
    "paymentDate",
    "paymentMethod",
    "notes",
];
function PayrollImportTab() {
    var _this = this;
    var _a = react_1.useState(null), file = _a[0], setFile = _a[1];
    var _b = react_1.useState([]), previewRows = _b[0], setPreviewRows = _b[1];
    var _c = react_1.useState([]), validationErrors = _c[0], setValidationErrors = _c[1];
    var _d = react_1.useState(null), importResult = _d[0], setImportResult = _d[1];
    var _e = react_1.useState(true), skipDuplicates = _e[0], setSkipDuplicates = _e[1];
    var _f = react_1.useState(false), isProcessing = _f[0], setIsProcessing = _f[1];
    var importPayroll = trpc_1.trpc.importExport.importPayroll.useMutation({
        onSuccess: function (result) {
            setImportResult({
                imported: result.imported || 0,
                skipped: result.skipped || 0,
                errors: result.errors || []
            });
            sonner_1.toast.success("Import completed: " + result.imported + " records imported");
            setIsProcessing(false);
        },
        onError: function (error) {
            sonner_1.toast.error("Import failed: " + error.message);
            setIsProcessing(false);
        }
    });
    var downloadTemplate = react_1.useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var XLSX, template, worksheet, workbook, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('xlsx'); })];
                case 1:
                    XLSX = _a.sent();
                    template = [
                        {
                            employeeId: "EMP001",
                            payPeriodStart: "2024-01-01",
                            payPeriodEnd: "2024-01-31",
                            basicSalary: "50000",
                            allowances: "5000",
                            deductions: "2000",
                            tax: "8000",
                            netSalary: "45000",
                            status: "draft",
                            paymentDate: "2024-02-05",
                            paymentMethod: "bank_transfer",
                            notes: "January payroll"
                        },
                        {
                            employeeId: "EMP002",
                            payPeriodStart: "2024-01-01",
                            payPeriodEnd: "2024-01-31",
                            basicSalary: "45000",
                            allowances: "4000",
                            deductions: "1800",
                            tax: "7200",
                            netSalary: "40000",
                            status: "draft",
                            paymentDate: "2024-02-05",
                            paymentMethod: "bank_transfer",
                            notes: "January payroll"
                        },
                    ];
                    worksheet = XLSX.utils.json_to_sheet(template);
                    workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll");
                    // Set column widths
                    worksheet["!cols"] = [
                        { wch: 12 },
                        { wch: 15 },
                        { wch: 15 },
                        { wch: 12 },
                        { wch: 12 },
                        { wch: 12 },
                        { wch: 10 },
                        { wch: 12 },
                        { wch: 10 },
                        { wch: 15 },
                        { wch: 15 },
                        { wch: 20 },
                    ];
                    XLSX.writeFile(workbook, "payroll-import-template-" + new Date().toISOString().split('T')[0] + ".xlsx");
                    sonner_1.toast.success("Template downloaded successfully");
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    sonner_1.toast.error("Failed to generate template");
                    console.error("Template download error:", error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    var handleFileChange = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var f, reader;
        var _this = this;
        return __generator(this, function (_a) {
            if (e.target.files && e.target.files.length > 0) {
                f = e.target.files[0];
                setFile(f);
                setValidationErrors([]);
                setImportResult(null);
                reader = new FileReader();
                reader.onload = function (event) { return __awaiter(_this, void 0, void 0, function () {
                    var XLSX, data, workbook, worksheet, rows, error_2;
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                _b.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, Promise.resolve().then(function () { return require('xlsx'); })];
                            case 1:
                                XLSX = _b.sent();
                                data = (_a = event.target) === null || _a === void 0 ? void 0 : _a.result;
                                workbook = XLSX.read(data, { type: "binary" });
                                worksheet = workbook.Sheets[workbook.SheetNames[0]];
                                rows = XLSX.utils.sheet_to_json(worksheet);
                                setPreviewRows(rows.slice(0, 5));
                                return [3 /*break*/, 3];
                            case 2:
                                error_2 = _b.sent();
                                sonner_1.toast.error("Failed to read file");
                                setFile(null);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); };
                reader.readAsBinaryString(f);
            }
            return [2 /*return*/];
        });
    }); };
    var handleImport = function () { return __awaiter(_this, void 0, void 0, function () {
        var reader;
        var _this = this;
        return __generator(this, function (_a) {
            if (!file) {
                sonner_1.toast.error("Please select a file to import");
                return [2 /*return*/];
            }
            setIsProcessing(true);
            try {
                reader = new FileReader();
                reader.onload = function (event) { return __awaiter(_this, void 0, void 0, function () {
                    var XLSX, data, workbook, worksheet, rows, errors_1, error_3;
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                _b.trys.push([0, 3, , 4]);
                                return [4 /*yield*/, Promise.resolve().then(function () { return require('xlsx'); })];
                            case 1:
                                XLSX = _b.sent();
                                data = (_a = event.target) === null || _a === void 0 ? void 0 : _a.result;
                                workbook = XLSX.read(data, { type: "binary" });
                                worksheet = workbook.Sheets[workbook.SheetNames[0]];
                                rows = XLSX.utils.sheet_to_json(worksheet);
                                errors_1 = [];
                                rows.forEach(function (row, index) {
                                    if (!row.employeeId) {
                                        errors_1.push({
                                            row: index + 2,
                                            field: "employeeId",
                                            message: "Employee ID is required",
                                            severity: "error"
                                        });
                                    }
                                    if (!row.payPeriodStart) {
                                        errors_1.push({
                                            row: index + 2,
                                            field: "payPeriodStart",
                                            message: "Pay Period Start is required",
                                            severity: "error"
                                        });
                                    }
                                    if (!row.basicSalary) {
                                        errors_1.push({
                                            row: index + 2,
                                            field: "basicSalary",
                                            message: "Basic Salary is required",
                                            severity: "error"
                                        });
                                    }
                                });
                                setValidationErrors(errors_1);
                                if (errors_1.length > 0) {
                                    sonner_1.toast.error("Validation failed: " + errors_1.length + " error(s) found");
                                    setIsProcessing(false);
                                    return [2 /*return*/];
                                }
                                // Import data
                                return [4 /*yield*/, importPayroll.mutateAsync({
                                        data: rows,
                                        skipDuplicates: skipDuplicates
                                    })];
                            case 2:
                                // Import data
                                _b.sent();
                                return [3 /*break*/, 4];
                            case 3:
                                error_3 = _b.sent();
                                sonner_1.toast.error("Import error: " + (error_3 instanceof Error ? error_3.message : "Unknown error"));
                                setIsProcessing(false);
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); };
                reader.readAsBinaryString(file);
            }
            catch (error) {
                sonner_1.toast.error("Failed to process file");
                setIsProcessing(false);
            }
            return [2 /*return*/];
        });
    }); };
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement(card_1.Card, { className: "border-blue-200 bg-blue-50" },
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                    React.createElement(lucide_react_1.Download, { className: "h-5 w-5 text-blue-600" }),
                    "CSV Template"),
                React.createElement(card_1.CardDescription, null, "Download a sample payroll import template to get started")),
            React.createElement(card_1.CardContent, null,
                React.createElement(button_1.Button, { onClick: downloadTemplate, className: "bg-blue-600 hover:bg-blue-700" },
                    React.createElement(lucide_react_1.Download, { className: "mr-2 h-4 w-4" }),
                    "Download Template"),
                React.createElement("div", { className: "mt-4 text-sm text-muted-foreground" },
                    React.createElement("p", { className: "font-medium mb-2" }, "Template includes columns for:"),
                    React.createElement("ul", { className: "list-disc list-inside space-y-1" },
                        React.createElement("li", null, "Employee ID"),
                        React.createElement("li", null, "Pay Period Start & End"),
                        React.createElement("li", null, "Basic Salary, Allowances, Deductions"),
                        React.createElement("li", null, "Tax, Net Salary, Payment Details"),
                        React.createElement("li", null, "Status and Notes"))))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                    React.createElement(lucide_react_1.FileUp, { className: "h-5 w-5" }),
                    "Import Payroll Data"),
                React.createElement(card_1.CardDescription, null, "Upload a CSV or Excel file with payroll records")),
            React.createElement(card_1.CardContent, { className: "space-y-4" },
                React.createElement("div", null,
                    React.createElement("label", { className: "text-sm font-medium mb-2 block" }, "Select File"),
                    React.createElement(input_1.Input, { type: "file", accept: ".csv,.xlsx,.xls", onChange: handleFileChange, disabled: isProcessing }),
                    file && (React.createElement("p", { className: "text-sm text-green-600 mt-2" },
                        React.createElement(lucide_react_1.CheckCircle, { className: "inline h-4 w-4 mr-1" }),
                        "File selected: ",
                        file.name))),
                previewRows.length > 0 && (React.createElement("div", null,
                    React.createElement("label", { className: "text-sm font-medium mb-2 block" }, "Preview (First 5 rows)"),
                    React.createElement("div", { className: "border rounded-lg overflow-x-auto" },
                        React.createElement(table_1.Table, null,
                            React.createElement(table_1.TableHeader, null,
                                React.createElement(table_1.TableRow, null, Object.keys(previewRows[0] || {}).map(function (key) { return (React.createElement(table_1.TableHead, { key: key, className: "min-w-[100px]" }, key)); }))),
                            React.createElement(table_1.TableBody, null, previewRows.map(function (row, idx) { return (React.createElement(table_1.TableRow, { key: "row-" + idx }, Object.entries(row).map(function (_a) {
                                var colKey = _a[0], value = _a[1];
                                return (React.createElement(table_1.TableCell, { key: idx + "-" + colKey }, String(value)));
                            }))); })))))),
                validationErrors.length > 0 && (React.createElement(alert_1.Alert, { variant: "destructive" },
                    React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4" }),
                    React.createElement(alert_1.AlertDescription, null,
                        React.createElement("p", { className: "font-medium mb-2" },
                            validationErrors.length,
                            " validation error(s) found:"),
                        React.createElement("ul", { className: "space-y-1 text-sm" },
                            validationErrors.slice(0, 10).map(function (error, idx) { return (React.createElement("li", { key: idx },
                                "Row ",
                                error.row,
                                ": ",
                                error.field,
                                " - ",
                                error.message)); }),
                            validationErrors.length > 10 && (React.createElement("li", null,
                                "... and ",
                                validationErrors.length - 10,
                                " more errors")))))),
                React.createElement("div", { className: "flex gap-4 items-center" },
                    React.createElement(button_1.Button, { onClick: handleImport, disabled: !file || isProcessing || validationErrors.length !== previewRows.length, className: "bg-green-600 hover:bg-green-700" },
                        React.createElement(lucide_react_1.FileUp, { className: "mr-2 h-4 w-4" }),
                        isProcessing ? "Processing..." : "Import Data"),
                    React.createElement("label", { className: "flex items-center gap-2 cursor-pointer" },
                        React.createElement("input", { type: "checkbox", checked: skipDuplicates, onChange: function (e) { return setSkipDuplicates(e.target.checked); }, disabled: isProcessing }),
                        React.createElement("span", { className: "text-sm" }, "Skip duplicate records"))),
                importResult && (React.createElement(alert_1.Alert, { className: "border-green-200 bg-green-50" },
                    React.createElement(lucide_react_1.CheckCircle, { className: "h-4 w-4 text-green-600" }),
                    React.createElement(alert_1.AlertDescription, null,
                        React.createElement("p", { className: "font-medium text-green-900" }, "Import Completed Successfully"),
                        React.createElement("div", { className: "mt-2 text-sm text-green-800 space-y-1" },
                            React.createElement("p", null,
                                "\u2713 Imported: ",
                                importResult.imported,
                                " records"),
                            React.createElement("p", null,
                                "\u2298 Skipped: ",
                                importResult.skipped,
                                " records"),
                            importResult.errors.length > 0 && (React.createElement("p", null,
                                "\u2717 Errors: ",
                                importResult.errors.length,
                                " records"))))))))));
}
exports["default"] = PayrollImportTab;
