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
var useAuthWithPersistence_1 = require("@/_core/hooks/useAuthWithPersistence");
var wouter_1 = require("wouter");
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var stats_card_1 = require("@/components/ui/stats-card");
/**
 * HRAdminDashboard component
 *
 * Features:
 * - Departmental heads management
 * - P9 forms generation and distribution
 * - Payroll administration
 * - Employee records management
 */
function HRAdminDashboard() {
    var _this = this;
    var _a = useAuthWithPersistence_1.useAuthWithPersistence({
        redirectOnUnauthenticated: true
    }), user = _a.user, loading = _a.loading, isAuthenticated = _a.isAuthenticated, logout = _a.logout;
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    var _c = react_1.useState(new Date().getFullYear()), taxYear = _c[0], setTaxYear = _c[1];
    var _d = react_1.useState(false), generatingP9 = _d[0], setGeneratingP9 = _d[1];
    var _e = react_1.useState(""), selectedDepartment = _e[0], setSelectedDepartment = _e[1];
    var _f = react_1.useState(""), selectedEmployee = _f[0], setSelectedEmployee = _f[1];
    var _g = react_1.useState(false), assigningHead = _g[0], setAssigningHead = _g[1];
    // Fetch departmental heads
    var _h = trpc_1.trpc.departmentalHeads.list.useQuery({ limit: 50, offset: 0 }, { enabled: !!user }), departmentalHeads = _h.data, headsLoading = _h.isLoading, refetchHeads = _h.refetch;
    // Fetch departments
    var departments = trpc_1.trpc.departments.list.useQuery({ limit: 100, offset: 0 }, { enabled: !!user }).data;
    // Fetch employees
    var employees = trpc_1.trpc.employees.list.useQuery({ limit: 100, offset: 0 }, { enabled: !!user }).data;
    // Fetch P9 forms
    var _j = trpc_1.trpc.p9Forms.list.useQuery({ taxYear: taxYear, limit: 50, offset: 0 }, { enabled: !!user }), p9Forms = _j.data, p9Loading = _j.isLoading;
    // Mutations
    var assignHeadMutation = trpc_1.trpc.departmentalHeads.assign.useMutation();
    var generateP9Mutation = trpc_1.trpc.p9Forms.generateForTaxYear.useMutation();
    react_1.useEffect(function () {
        var _a;
        if (!loading && isAuthenticated && (user === null || user === void 0 ? void 0 : user.role) !== "admin" && !((_a = user === null || user === void 0 ? void 0 : user.permissions) === null || _a === void 0 ? void 0 : _a.includes("hr:manage"))) {
            setLocation("/dashboard");
        }
    }, [loading, isAuthenticated, user, setLocation]);
    if (loading || headsLoading) {
        return (React.createElement("div", { className: "min-h-screen flex items-center justify-center" },
            React.createElement("div", { className: "flex flex-col items-center gap-3" },
                React.createElement(lucide_react_1.Loader2, { className: "h-12 w-12 animate-spin text-blue-600" }),
                React.createElement("p", { className: "text-gray-600" }, "Loading HR Dashboard..."))));
    }
    if (!isAuthenticated) {
        return null;
    }
    var handleAssignHead = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedDepartment || !selectedEmployee) {
                        alert("Please select both department and employee");
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setAssigningHead(true);
                    return [4 /*yield*/, assignHeadMutation.mutateAsync({
                            departmentId: selectedDepartment,
                            employeeId: selectedEmployee
                        })];
                case 2:
                    _a.sent();
                    alert("Department head assigned successfully");
                    setSelectedDepartment("");
                    setSelectedEmployee("");
                    refetchHeads();
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error("Failed to assign head:", error_1);
                    alert(error_1.message || "Failed to assign department head");
                    return [3 /*break*/, 5];
                case 4:
                    setAssigningHead(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleGenerateP9 = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setGeneratingP9(true);
                    return [4 /*yield*/, generateP9Mutation.mutateAsync({ taxYear: taxYear })];
                case 1:
                    _a.sent();
                    alert("P9 forms generated for tax year " + taxYear);
                    return [3 /*break*/, 4];
                case 2:
                    error_2 = _a.sent();
                    console.error("Failed to generate P9:", error_2);
                    alert(error_2.message || "Failed to generate P9 forms");
                    return [3 /*break*/, 4];
                case 3:
                    setGeneratingP9(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var headsData = departmentalHeads || [];
    var p9Data = (p9Forms === null || p9Forms === void 0 ? void 0 : p9Forms.p9Forms) || [];
    var departmentsData = departments || [];
    var employeesData = employees || [];
    var sentP9 = p9Data.filter(function (p) { return p.status === "sent"; }).length;
    var draftP9 = p9Data.filter(function (p) { return p.status === "draft"; }).length;
    var totalHeads = headsData.length;
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "HR Administration" },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Department Heads", value: totalHeads, description: "Active assignments", color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "P9 Forms - Sent", value: sentP9, description: "Tax year " + taxYear, color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "P9 Forms - Draft", value: draftP9, description: "To be sent", color: "border-l-orange-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Employees", value: employeesData.length, description: "Active records", color: "border-l-purple-500" })),
            React.createElement(tabs_1.Tabs, { defaultValue: "heads", className: "space-y-4" },
                React.createElement(tabs_1.TabsList, null,
                    React.createElement(tabs_1.TabsTrigger, { value: "heads", className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Users, { className: "w-4 h-4" }),
                        "Department Heads"),
                    React.createElement(tabs_1.TabsTrigger, { value: "p9", className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.FileText, { className: "w-4 h-4" }),
                        "P9 Forms")),
                React.createElement(tabs_1.TabsContent, { value: "heads", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Assign Department Head"),
                            React.createElement(card_1.CardDescription, null, "Assign an employee as department head")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("div", { className: "space-y-4" },
                                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                                    React.createElement("div", null,
                                        React.createElement("label", { className: "text-sm font-medium block mb-1" }, "Department"),
                                        React.createElement("select", { value: selectedDepartment, onChange: function (e) { return setSelectedDepartment(e.target.value); }, className: "w-full p-2 border rounded text-sm" },
                                            React.createElement("option", { value: "" }, "Select a department"),
                                            departmentsData.map(function (dept) { return (React.createElement("option", { key: dept.id, value: dept.id }, dept.name)); }))),
                                    React.createElement("div", null,
                                        React.createElement("label", { className: "text-sm font-medium block mb-1" }, "Employee"),
                                        React.createElement("select", { value: selectedEmployee, onChange: function (e) { return setSelectedEmployee(e.target.value); }, className: "w-full p-2 border rounded text-sm" },
                                            React.createElement("option", { value: "" }, "Select an employee"),
                                            employeesData.map(function (emp) { return (React.createElement("option", { key: emp.id, value: emp.id },
                                                emp.firstName,
                                                " ",
                                                emp.lastName)); })))),
                                React.createElement(button_1.Button, { onClick: handleAssignHead, disabled: assigningHead || !selectedDepartment || !selectedEmployee, className: "w-full" },
                                    assigningHead ? React.createElement(lucide_react_1.Loader2, { className: "w-4 h-4 animate-spin mr-2" }) : React.createElement(lucide_react_1.Plus, { className: "w-4 h-4 mr-2" }),
                                    "Assign Department Head")))),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Current Department Heads"),
                            React.createElement(card_1.CardDescription, null, "Active department head assignments")),
                        React.createElement(card_1.CardContent, null, headsData.length > 0 ? (React.createElement("div", { className: "space-y-3" }, headsData.map(function (head) { return (React.createElement("div", { key: head.id, className: "p-3 border rounded-lg flex items-start justify-between hover:bg-gray-50" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "font-medium text-sm" },
                                    head.firstName,
                                    " ",
                                    head.lastName),
                                React.createElement("p", { className: "text-xs text-gray-500" }, head.departmentName),
                                React.createElement("p", { className: "text-xs text-gray-500" }, head.position)),
                            React.createElement("div", { className: "text-right" },
                                React.createElement("p", { className: "text-xs text-gray-500" }, head.createdAt ? new Date(head.createdAt).toLocaleDateString() : "N/A"),
                                React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-xs mt-1 h-6" }, "Remove")))); }))) : (React.createElement("div", { className: "text-center py-8 text-gray-500" },
                            React.createElement(lucide_react_1.Users, { className: "w-12 h-12 mx-auto text-gray-300 mb-2" }),
                            React.createElement("p", null, "No department heads assigned yet")))))),
                React.createElement(tabs_1.TabsContent, { value: "p9", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Generate P9 Forms"),
                            React.createElement(card_1.CardDescription, null, "Generate annual tax forms for all employees")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("div", { className: "space-y-4" },
                                React.createElement("div", null,
                                    React.createElement("label", { className: "text-sm font-medium block mb-1" }, "Tax Year"),
                                    React.createElement("input", { type: "number", value: taxYear, onChange: function (e) { return setTaxYear(parseInt(e.target.value)); }, min: 2000, max: 2100, className: "w-full md:w-32 p-2 border rounded text-sm" })),
                                React.createElement(button_1.Button, { onClick: handleGenerateP9, disabled: generatingP9, className: "w-full md:w-auto" },
                                    generatingP9 ? React.createElement(lucide_react_1.Loader2, { className: "w-4 h-4 animate-spin mr-2" }) : React.createElement(lucide_react_1.FileText, { className: "w-4 h-4 mr-2" }),
                                    "Generate P9 Forms for ",
                                    taxYear)))),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "P9 Forms"),
                            React.createElement(card_1.CardDescription, null,
                                "Tax year ",
                                taxYear)),
                        React.createElement(card_1.CardContent, null, p9Loading ? (React.createElement("div", { className: "flex items-center justify-center py-8" },
                            React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin text-blue-600" }))) : p9Data.length > 0 ? (React.createElement("div", { className: "space-y-2" }, p9Data.map(function (p9) { return (React.createElement("div", { key: p9.id, className: "p-3 border rounded-lg flex items-start justify-between hover:bg-gray-50" },
                            React.createElement("div", { className: "flex-1" },
                                React.createElement("p", { className: "font-medium text-sm" },
                                    p9.firstName,
                                    " ",
                                    p9.lastName),
                                React.createElement("p", { className: "text-xs text-gray-500" }, p9.email),
                                React.createElement("div", { className: "flex gap-4 text-xs text-gray-500 mt-1" },
                                    React.createElement("span", null,
                                        "Gross: KES ",
                                        (p9.grossIncome || 0).toLocaleString()),
                                    React.createElement("span", null,
                                        "Tax: KES ",
                                        (p9.netTaxPayable || 0).toLocaleString()))),
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement("div", { className: "text-right" }, p9.status === "sent" ? (React.createElement("div", { className: "flex items-center gap-1 text-green-600 text-xs" },
                                    React.createElement(lucide_react_1.CheckCircle2, { className: "w-3 h-3" }),
                                    "Sent")) : p9.status === "draft" ? (React.createElement("div", { className: "text-xs text-orange-600" }, "Draft")) : (React.createElement("div", { className: "text-xs text-gray-500" }, p9.status))),
                                React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-xs h-8" },
                                    React.createElement(lucide_react_1.Download, { className: "w-3 h-3" }))))); }))) : (React.createElement("div", { className: "text-center py-8 text-gray-500" },
                            React.createElement(lucide_react_1.FileText, { className: "w-12 h-12 mx-auto text-gray-300 mb-2" }),
                            React.createElement("p", null,
                                "No P9 forms generated for ",
                                taxYear),
                            React.createElement("p", { className: "text-xs mt-1" }, "Use the form above to generate P9 forms for this tax year"))))))))));
}
exports["default"] = HRAdminDashboard;
