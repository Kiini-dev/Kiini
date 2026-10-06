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
var wouter_1 = require("wouter");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var ModuleLayout_1 = require("@/components/ModuleLayout");
// Using actions helpers for download/delete
var lucide_react_1 = require("lucide-react");
var actions_1 = require("@/lib/actions");
var trpc_1 = require("@/lib/trpc");
function ReportsDetails() {
    var _this = this;
    var _a, _b;
    var id = wouter_1.useParams().id;
    var _c = wouter_1.useLocation(), setLocation = _c[1];
    var _d = react_1.useState(false), showDeleteModal = _d[0], setShowDeleteModal = _d[1];
    var _e = react_1.useState(false), isDeleting = _e[0], setIsDeleting = _e[1];
    // Default to current month for date range
    var now = new Date();
    var startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    var endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    // Query sales report for the current month
    var _f = trpc_1.trpc.reports.salesReport.useQuery({
        startDate: startDate,
        endDate: endDate,
        groupBy: "month"
    }), reportData = _f.data, isLoading = _f.isLoading;
    // Generate a report object from the query data
    var report = {
        id: id,
        name: "Monthly Sales Report",
        type: "Sales",
        period: "" + startDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
        generatedDate: new Date().toLocaleDateString(),
        totalRevenue: ((_a = reportData === null || reportData === void 0 ? void 0 : reportData.summary) === null || _a === void 0 ? void 0 : _a.totalSales) || 0,
        totalTransactions: ((_b = reportData === null || reportData === void 0 ? void 0 : reportData.summary) === null || _b === void 0 ? void 0 : _b.totalInvoices) || 0,
        status: "Completed"
    };
    var handleDelete = function () { return __awaiter(_this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsDeleting(true);
                    return [4 /*yield*/, actions_1.handleDelete(id || "", "report", function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                // backend delete then navigate
                                setLocation("/reports");
                                return [2 /*return*/];
                            });
                        }); })];
                case 1:
                    _a.sent();
                    setIsDeleting(false);
                    setShowDeleteModal(false);
                    return [2 /*return*/];
            }
        });
    }); };
    var handleDownload = function () { return actions_1.handleDownload(id || "", "report", "pdf", report); };
    var handleEdit = function () {
        setLocation("/reports/" + id + "/edit");
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Report Details", description: report.name, icon: React.createElement(lucide_react_1.FileText, { className: "h-6 w-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Reports", href: "/reports" },
            { label: "Details" },
        ], backLink: { label: "Reports", href: "/reports" } },
        React.createElement("div", { className: "space-y-6" }, isLoading ? (React.createElement(card_1.Card, null,
            React.createElement(card_1.CardContent, { className: "p-8" },
                React.createElement("p", { className: "text-muted-foreground text-center" }, "Loading report data...")))) : !reportData ? (React.createElement(card_1.Card, null,
            React.createElement(card_1.CardContent, { className: "p-8" },
                React.createElement("p", { className: "text-muted-foreground text-center" }, "No report data available")))) : (React.createElement(React.Fragment, null,
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, report.name),
                    React.createElement(card_1.CardDescription, null,
                        "Period: ",
                        report.period)),
                React.createElement(card_1.CardContent, { className: "space-y-4" },
                    React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-slate-600" }, "Report Type"),
                            React.createElement("p", { className: "font-semibold" }, report.type)),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-slate-600" }, "Status"),
                            React.createElement("p", { className: "font-semibold " + (report.status === 'Completed' ? 'text-green-600' : 'text-yellow-600') }, report.status)),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-slate-600" }, "Generated Date"),
                            React.createElement("p", { className: "font-semibold" }, report.generatedDate)),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-slate-600" }, "Total Revenue"),
                            React.createElement("p", { className: "font-semibold" },
                                "KES ",
                                (report.totalRevenue || 0).toLocaleString())),
                        React.createElement("div", { className: "col-span-2" },
                            React.createElement("p", { className: "text-sm text-slate-600" }, "Total Transactions"),
                            React.createElement("p", { className: "font-semibold" }, report.totalTransactions))),
                    React.createElement("div", { className: "flex gap-2 pt-4" },
                        React.createElement(button_1.Button, { variant: "outline", className: "gap-2", onClick: handleDownload },
                            React.createElement(lucide_react_1.Download, { className: "w-4 h-4" }),
                            "Download"),
                        React.createElement(button_1.Button, { variant: "outline", className: "gap-2", onClick: handleEdit },
                            React.createElement(lucide_react_1.Edit2, { className: "w-4 h-4" }),
                            "Edit"),
                        React.createElement(button_1.Button, { variant: "destructive", className: "gap-2", onClick: function () { return setShowDeleteModal(true); } },
                            React.createElement(lucide_react_1.Trash2, { className: "w-4 h-4" }),
                            "Delete")))))))));
}
exports["default"] = ReportsDetails;
