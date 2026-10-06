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
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var table_1 = require("@/components/ui/table");
var currency_1 = require("@/lib/currency");
function TaxCompliancePage() {
    var _this = this;
    var formatMoney = currency_1.useCurrency().format;
    var _a = react_1.useState(new Date().toISOString().slice(0, 10)), from = _a[0], setFrom = _a[1];
    var _b = react_1.useState(new Date().toISOString().slice(0, 10)), to = _b[0], setTo = _b[1];
    var _c = react_1.useState(""), employeeId = _c[0], setEmployeeId = _c[1];
    var _d = react_1.useState(""), departmentId = _d[0], setDepartmentId = _d[1];
    var paye = trpc_1.trpc.taxCompliance.getPAYEReport.useQuery({ from: new Date(from), to: new Date(to), employeeId: employeeId || undefined, departmentId: departmentId || undefined }, { enabled: !!from && !!to });
    var nssf = trpc_1.trpc.taxCompliance.getNSSFReport.useQuery({ from: new Date(from), to: new Date(to), employeeId: employeeId || undefined, departmentId: departmentId || undefined }, { enabled: !!from && !!to });
    var shif = trpc_1.trpc.taxCompliance.getSHIFReport.useQuery({ from: new Date(from), to: new Date(to), employeeId: employeeId || undefined, departmentId: departmentId || undefined }, { enabled: !!from && !!to });
    var housing = trpc_1.trpc.taxCompliance.getHousingLevyReport.useQuery({ from: new Date(from), to: new Date(to), employeeId: employeeId || undefined, departmentId: departmentId || undefined }, { enabled: !!from && !!to });
    var kraExport = trpc_1.trpc.taxCompliance.getKRAFilingFormat.useQuery({ from: new Date(from), to: new Date(to) }, { enabled: false });
    var ytd = trpc_1.trpc.taxCompliance.getYearToDateSummary.useQuery({ employeeId: employeeId || undefined }, { enabled: false });
    var handleDownloadKRA = function () { return __awaiter(_this, void 0, void 0, function () {
        var resp, bytes, blob, url, a, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, kraExport.refetch()];
                case 1:
                    resp = _a.sent();
                    if (!resp || !resp.data) {
                        sonner_1.toast.error('No KRA data available for selected range');
                        return [2 /*return*/];
                    }
                    bytes = Uint8Array.from(atob(resp.data), function (c) { return c.charCodeAt(0); });
                    blob = new Blob([bytes], { type: 'text/csv' });
                    url = URL.createObjectURL(blob);
                    a = document.createElement('a');
                    a.href = url;
                    a.download = "KRA_" + from + "_" + to + ".csv";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    sonner_1.toast.success('KRA file downloaded');
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    console.error(err_1);
                    sonner_1.toast.error((err_1 === null || err_1 === void 0 ? void 0 : err_1.message) || 'Failed to download KRA file');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleYTD = function () { return __awaiter(_this, void 0, void 0, function () {
        var resp, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, ytd.refetch()];
                case 1:
                    resp = _a.sent();
                    sonner_1.toast.success('YTD summary fetched');
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _a.sent();
                    sonner_1.toast.error('Failed to fetch YTD summary');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Tax Compliance", description: "Generate PAYE, NSSF, SHIF and KRA reports", icon: React.createElement(lucide_react_1.Calculator, { className: "h-6 w-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Finance", href: "/accounting" },
            { label: "Tax Compliance" },
        ], actions: React.createElement("div", { className: "flex gap-2" },
            React.createElement(button_1.Button, { variant: "outline", onClick: handleDownloadKRA },
                React.createElement(lucide_react_1.Download, { className: "mr-2 h-4 w-4" }),
                "Download KRA CSV"),
            React.createElement(button_1.Button, { onClick: handleYTD },
                React.createElement(lucide_react_1.FileText, { className: "mr-2 h-4 w-4" }),
                "YTD Summary")) },
        React.createElement("div", { className: "space-y-6" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Filters"),
                    React.createElement(card_1.CardDescription, null, "Select date range and optional filters")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-4 gap-4" },
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm text-muted-foreground" }, "From"),
                            React.createElement(input_1.Input, { type: "date", value: from, onChange: function (e) { return setFrom(e.target.value); } })),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm text-muted-foreground" }, "To"),
                            React.createElement(input_1.Input, { type: "date", value: to, onChange: function (e) { return setTo(e.target.value); } })),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm text-muted-foreground" }, "Employee ID (optional)"),
                            React.createElement(input_1.Input, { placeholder: "Employee ID", value: employeeId, onChange: function (e) { return setEmployeeId(e.target.value); } })),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm text-muted-foreground" }, "Department ID (optional)"),
                            React.createElement(input_1.Input, { placeholder: "Department ID", value: departmentId, onChange: function (e) { return setDepartmentId(e.target.value); } }))))),
            React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "PAYE Withholdings")),
                    React.createElement(card_1.CardContent, null, paye.isLoading ? React.createElement("p", null, "Loading...") : (React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Month"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Total PAYE"))),
                        React.createElement(table_1.TableBody, null, Array.isArray(paye.data) && paye.data.map(function (r) { return (React.createElement(table_1.TableRow, { key: r.month },
                            React.createElement(table_1.TableCell, null, r.month),
                            React.createElement(table_1.TableCell, { className: "text-right" }, formatMoney(r.totalPayee)))); })))))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "NSSF")),
                    React.createElement(card_1.CardContent, null, nssf.isLoading ? React.createElement("p", null, "Loading...") : (React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Month"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Total NSSF"))),
                        React.createElement(table_1.TableBody, null, Array.isArray(nssf.data) && nssf.data.map(function (r) { return (React.createElement(table_1.TableRow, { key: r.month },
                            React.createElement(table_1.TableCell, null, r.month),
                            React.createElement(table_1.TableCell, { className: "text-right" }, formatMoney(r.totalNSSF)))); }))))))),
            React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "SHIF")),
                    React.createElement(card_1.CardContent, null, shif.isLoading ? React.createElement("p", null, "Loading...") : (React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Month"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Total SHIF"))),
                        React.createElement(table_1.TableBody, null, Array.isArray(shif.data) && shif.data.map(function (r) { return (React.createElement(table_1.TableRow, { key: r.month },
                            React.createElement(table_1.TableCell, null, r.month),
                            React.createElement(table_1.TableCell, { className: "text-right" }, formatMoney(r.totalSHIF)))); })))))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Housing Levy")),
                    React.createElement(card_1.CardContent, null, housing.isLoading ? React.createElement("p", null, "Loading...") : (React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Month"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Total Housing Levy"))),
                        React.createElement(table_1.TableBody, null, Array.isArray(housing.data) && housing.data.map(function (r) { return (React.createElement(table_1.TableRow, { key: r.month },
                            React.createElement(table_1.TableCell, null, r.month),
                            React.createElement(table_1.TableCell, { className: "text-right" }, formatMoney(r.totalHousing)))); }))))))))));
}
exports["default"] = TaxCompliancePage;
