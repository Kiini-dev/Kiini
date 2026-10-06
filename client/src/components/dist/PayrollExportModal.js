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
var dialog_1 = require("@/components/ui/dialog");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
function PayrollExportModal(_a) {
    var _this = this;
    var open = _a.open, onOpenChange = _a.onOpenChange;
    var _b = react_1.useState(new Date().toISOString().slice(0, 10)), startDate = _b[0], setStartDate = _b[1];
    var _c = react_1.useState(new Date().toISOString().slice(0, 10)), endDate = _c[0], setEndDate = _c[1];
    var _d = react_1.useState("xlsx"), format = _d[0], setFormat = _d[1];
    var _e = react_1.useState(""), employeeId = _e[0], setEmployeeId = _e[1];
    var _f = react_1.useState(""), departmentId = _f[0], setDepartmentId = _f[1];
    var exportMutation = trpc_1.trpc.payrollExport.exportPayroll.useMutation();
    var utils = trpc_1.trpc.useUtils();
    var handleExport = function () { return __awaiter(_this, void 0, void 0, function () {
        var resp, bytes, blob, url, a, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exportMutation.mutateAsync({ startDate: startDate, endDate: endDate, employeeId: employeeId || undefined, departmentId: departmentId || undefined, format: format })];
                case 1:
                    resp = _a.sent();
                    if (!resp || !resp.success) {
                        sonner_1.toast.error((resp === null || resp === void 0 ? void 0 : resp.message) || "No data to export");
                        return [2 /*return*/];
                    }
                    bytes = Uint8Array.from(atob(resp.data), function (c) { return c.charCodeAt(0); });
                    blob = new Blob([bytes], { type: resp.format === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv' });
                    url = URL.createObjectURL(blob);
                    a = document.createElement('a');
                    a.href = url;
                    a.download = resp.filename || "payroll_export." + resp.format;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    sonner_1.toast.success("Exported " + (resp.recordCount || 0) + " records");
                    utils.payroll.list.invalidate();
                    onOpenChange(false);
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error("Export failed", error_1);
                    sonner_1.toast.error((error_1 === null || error_1 === void 0 ? void 0 : error_1.message) || "Failed to export payroll");
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return (react_1["default"].createElement(dialog_1.Dialog, { open: open, onOpenChange: onOpenChange },
        react_1["default"].createElement(dialog_1.DialogContent, null,
            react_1["default"].createElement(dialog_1.DialogHeader, null,
                react_1["default"].createElement(dialog_1.DialogTitle, null, "Export Payroll")),
            react_1["default"].createElement("div", { className: "space-y-4" },
                react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "text-sm text-muted-foreground" }, "Start Date"),
                        react_1["default"].createElement(input_1.Input, { type: "date", value: startDate, onChange: function (e) { return setStartDate(e.target.value); } })),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "text-sm text-muted-foreground" }, "End Date"),
                        react_1["default"].createElement(input_1.Input, { type: "date", value: endDate, onChange: function (e) { return setEndDate(e.target.value); } }))),
                react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "text-sm text-muted-foreground" }, "Employee (optional)"),
                        react_1["default"].createElement(input_1.Input, { placeholder: "Employee ID", value: employeeId, onChange: function (e) { return setEmployeeId(e.target.value); } })),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "text-sm text-muted-foreground" }, "Department (optional)"),
                        react_1["default"].createElement(input_1.Input, { placeholder: "Department ID", value: departmentId, onChange: function (e) { return setDepartmentId(e.target.value); } }))),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", { className: "text-sm text-muted-foreground" }, "Format"),
                    react_1["default"].createElement(select_1.Select, { value: format, onValueChange: function (v) { return setFormat(v); } },
                        react_1["default"].createElement(select_1.SelectTrigger, { className: "w-36" },
                            react_1["default"].createElement(select_1.SelectValue, null)),
                        react_1["default"].createElement(select_1.SelectContent, null,
                            react_1["default"].createElement(select_1.SelectItem, { value: "xlsx" }, "Excel (.xlsx)"),
                            react_1["default"].createElement(select_1.SelectItem, { value: "csv" }, "CSV (.csv)")))),
                react_1["default"].createElement("div", { className: "flex gap-2 justify-end" },
                    react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return onOpenChange(false); } }, "Cancel"),
                    react_1["default"].createElement(button_1.Button, { onClick: handleExport, disabled: exportMutation.isPending }, exportMutation.isPending ? 'Exporting...' : 'Export'))))));
}
exports["default"] = PayrollExportModal;
