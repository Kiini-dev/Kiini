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
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var dialog_1 = require("@/components/ui/dialog");
var alert_1 = require("@/components/ui/alert");
var textarea_1 = require("@/components/ui/textarea");
var lucide_react_1 = require("lucide-react");
function ProcurementImprestsPage() {
    var _this = this;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = react_1.useState(''), searchTerm = _b[0], setSearchTerm = _b[1];
    var _c = react_1.useState('__all__'), statusFilter = _c[0], setStatusFilter = _c[1];
    var _d = react_1.useState(false), createDialogOpen = _d[0], setCreateDialogOpen = _d[1];
    var _e = react_1.useState(null), selectedImprest = _e[0], setSelectedImprest = _e[1];
    var _f = react_1.useState(false), viewDialogOpen = _f[0], setViewDialogOpen = _f[1];
    var _g = react_1.useState({
        employeeId: '',
        employeeName: '',
        purpose: '',
        amount: 0,
        justification: '',
        expectedReturnDate: '',
        status: 'requested'
    }), formData = _g[0], setFormData = _g[1];
    // Fetch imprests
    var _h = trpc_1.trpc.procurementMgmt.imprestList.useQuery({
        search: searchTerm,
        status: statusFilter === '__all__' ? undefined : statusFilter || undefined,
        limit: 100
    }), _j = _h.data, imprests = _j === void 0 ? [] : _j, isLoading = _h.isLoading, refetch = _h.refetch;
    // Create mutation
    var createMutation = trpc_1.trpc.procurementMgmt.imprestCreate.useMutation({
        onSuccess: function () {
            sonner_1.toast.success('Imprest request created successfully');
            refetch();
            setCreateDialogOpen(false);
            resetForm();
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to create imprest: " + error.message);
        }
    });
    // Update mutation
    var updateMutation = trpc_1.trpc.procurementMgmt.imprestUpdate.useMutation({
        onSuccess: function () {
            sonner_1.toast.success('Imprest updated successfully');
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to update imprest: " + error.message);
        }
    });
    var resetForm = function () {
        setFormData({
            employeeId: '',
            employeeName: '',
            purpose: '',
            amount: 0,
            justification: '',
            expectedReturnDate: '',
            status: 'requested'
        });
    };
    var handleSave = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!formData.employeeName || formData.amount <= 0 || !formData.purpose) {
                        sonner_1.toast.error('Please fill in all required fields');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, createMutation.mutateAsync({
                            employeeId: formData.employeeId,
                            employeeName: formData.employeeName,
                            purpose: formData.purpose,
                            amount: formData.amount,
                            justification: formData.justification,
                            expectedReturnDate: formData.expectedReturnDate,
                            status: formData.status
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var handleStatusChange = function (imprestId, newStatus) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, updateMutation.mutateAsync({
                        id: imprestId,
                        status: newStatus
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var getStatusColor = function (status) {
        var colors = {
            requested: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
            approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
            rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
            issued: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
            surrendered: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };
    // Calculate statistics
    var stats = {
        total: imprests.length,
        totalAmount: imprests.reduce(function (sum, i) { return sum + (i.amount || 0); }, 0),
        requestedCount: imprests.filter(function (i) { return i.status === 'requested'; }).length,
        approvedCount: imprests.filter(function (i) { return i.status === 'approved'; }).length,
        issuedCount: imprests.filter(function (i) { return i.status === 'issued'; }).length,
        surrenderedCount: imprests.filter(function (i) { return i.status === 'surrendered'; }).length
    };
    return (react_1["default"].createElement("div", { className: "space-y-6 p-6" },
        react_1["default"].createElement("div", null,
            react_1["default"].createElement("h1", { className: "text-3xl font-bold" }, "Imprests"),
            react_1["default"].createElement("p", { className: "text-gray-500 dark:text-gray-400 mt-1" }, "Request, manage, and track employee imprests")),
        react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4" },
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-6" },
                    react_1["default"].createElement("div", { className: "text-center" },
                        react_1["default"].createElement("p", { className: "text-sm text-gray-500" }, "Total Imprests"),
                        react_1["default"].createElement("p", { className: "text-3xl font-bold" }, stats.total),
                        react_1["default"].createElement("p", { className: "text-xs text-gray-500 mt-1" },
                            "KES ",
                            (stats.totalAmount / 100).toLocaleString())))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-6" },
                    react_1["default"].createElement("div", { className: "text-center" },
                        react_1["default"].createElement("p", { className: "text-sm text-gray-500" }, "Requested"),
                        react_1["default"].createElement("p", { className: "text-3xl font-bold text-yellow-600" }, stats.requestedCount)))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-6" },
                    react_1["default"].createElement("div", { className: "text-center" },
                        react_1["default"].createElement("p", { className: "text-sm text-gray-500" }, "Approved"),
                        react_1["default"].createElement("p", { className: "text-3xl font-bold text-blue-600" }, stats.approvedCount)))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-6" },
                    react_1["default"].createElement("div", { className: "text-center" },
                        react_1["default"].createElement("p", { className: "text-sm text-gray-500" }, "Issued"),
                        react_1["default"].createElement("p", { className: "text-3xl font-bold text-green-600" }, stats.issuedCount)))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-6" },
                    react_1["default"].createElement("div", { className: "text-center" },
                        react_1["default"].createElement("p", { className: "text-sm text-gray-500" }, "Surrendered"),
                        react_1["default"].createElement("p", { className: "text-3xl font-bold text-purple-600" }, stats.surrenderedCount))))),
        react_1["default"].createElement(card_1.Card, null,
            react_1["default"].createElement(card_1.CardHeader, null,
                react_1["default"].createElement(card_1.CardTitle, { className: "text-lg" }, "Search & Filter")),
            react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" },
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement(label_1.Label, { htmlFor: "search" }, "Search Imprests"),
                        react_1["default"].createElement(input_1.Input, { id: "search", placeholder: "Search by employee name or number", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); } })),
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement(label_1.Label, { htmlFor: "status" }, "Status"),
                        react_1["default"].createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                            react_1["default"].createElement(select_1.SelectTrigger, { id: "status" },
                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "All statuses" })),
                            react_1["default"].createElement(select_1.SelectContent, null,
                                react_1["default"].createElement(select_1.SelectItem, { value: "__all__" }, "All statuses"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "requested" }, "Requested"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "approved" }, "Approved"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "rejected" }, "Rejected"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "issued" }, "Issued"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "surrendered" }, "Surrendered")))),
                    react_1["default"].createElement("div", { className: "flex items-end gap-2" },
                        react_1["default"].createElement(button_1.Button, { onClick: function () { return setCreateDialogOpen(true); }, className: "flex-1" },
                            react_1["default"].createElement(lucide_react_1.Plus, { className: "w-4 h-4 mr-2" }),
                            "New Imprest"))))),
        react_1["default"].createElement(card_1.Card, null,
            react_1["default"].createElement(card_1.CardHeader, null,
                react_1["default"].createElement(card_1.CardTitle, null, "Imprest Requests"),
                react_1["default"].createElement(card_1.CardDescription, null,
                    imprests.length,
                    " records found")),
            react_1["default"].createElement(card_1.CardContent, null, isLoading ? (react_1["default"].createElement("div", { className: "flex items-center justify-center py-8" },
                react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin" }))) : imprests.length > 0 ? (react_1["default"].createElement("div", { className: "overflow-x-auto" },
                react_1["default"].createElement(table_1.Table, null,
                    react_1["default"].createElement(table_1.TableHeader, null,
                        react_1["default"].createElement(table_1.TableRow, null,
                            react_1["default"].createElement(table_1.TableHead, null, "Imprest #"),
                            react_1["default"].createElement(table_1.TableHead, null, "Employee"),
                            react_1["default"].createElement(table_1.TableHead, null, "Purpose"),
                            react_1["default"].createElement(table_1.TableHead, { className: "text-right" }, "Amount"),
                            react_1["default"].createElement(table_1.TableHead, null, "Status"),
                            react_1["default"].createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                    react_1["default"].createElement(table_1.TableBody, null, imprests.map(function (imprest) { return (react_1["default"].createElement(table_1.TableRow, { key: imprest.id },
                        react_1["default"].createElement(table_1.TableCell, { className: "font-mono font-semibold" }, imprest.imprestNumber),
                        react_1["default"].createElement(table_1.TableCell, null,
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("p", { className: "font-medium" }, imprest.employeeName),
                                react_1["default"].createElement("p", { className: "text-xs text-gray-500" }, imprest.employeeId))),
                        react_1["default"].createElement(table_1.TableCell, { className: "max-w-xs truncate" }, imprest.purpose),
                        react_1["default"].createElement(table_1.TableCell, { className: "text-right font-semibold" },
                            "KES ",
                            ((imprest.amount || 0) / 100).toLocaleString()),
                        react_1["default"].createElement(table_1.TableCell, null,
                            react_1["default"].createElement(badge_1.Badge, { className: getStatusColor(imprest.status) }, imprest.status)),
                        react_1["default"].createElement(table_1.TableCell, { className: "text-right space-x-2" },
                            react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () {
                                    setSelectedImprest(imprest);
                                    setViewDialogOpen(true);
                                } },
                                react_1["default"].createElement(lucide_react_1.Eye, { className: "w-4 h-4" })),
                            imprest.status === 'requested' && (react_1["default"].createElement(react_1["default"].Fragment, null,
                                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { return handleStatusChange(imprest.id, 'approved'); }, disabled: updateMutation.isPending, className: "text-green-600" },
                                    react_1["default"].createElement(lucide_react_1.CheckCircle2, { className: "w-4 h-4" })),
                                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { return handleStatusChange(imprest.id, 'rejected'); }, disabled: updateMutation.isPending, className: "text-red-600" },
                                    react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "w-4 h-4" })))),
                            imprest.status === 'approved' && (react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { return handleStatusChange(imprest.id, 'issued'); }, disabled: updateMutation.isPending, className: "text-green-600" },
                                react_1["default"].createElement(lucide_react_1.DollarSign, { className: "w-4 h-4" }))),
                            imprest.status === 'issued' && (react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { return handleStatusChange(imprest.id, 'surrendered'); }, disabled: updateMutation.isPending, className: "text-purple-600" },
                                react_1["default"].createElement(lucide_react_1.TrendingDown, { className: "w-4 h-4" })))))); }))))) : (react_1["default"].createElement("div", { className: "text-center py-8 text-gray-500" }, "No imprests found. Create one to get started.")))),
        react_1["default"].createElement(dialog_1.Dialog, { open: createDialogOpen, onOpenChange: setCreateDialogOpen },
            react_1["default"].createElement(dialog_1.DialogContent, null,
                react_1["default"].createElement(dialog_1.DialogHeader, null,
                    react_1["default"].createElement(dialog_1.DialogTitle, null, "Request New Imprest"),
                    react_1["default"].createElement(dialog_1.DialogDescription, null, "Submit an imprest request to your department")),
                react_1["default"].createElement("div", { className: "space-y-4" },
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement(label_1.Label, { htmlFor: "employeeName" }, "Employee Name *"),
                        react_1["default"].createElement(input_1.Input, { id: "employeeName", value: formData.employeeName, onChange: function (e) {
                                return setFormData(function (prev) { return (__assign(__assign({}, prev), { employeeName: e.target.value })); });
                            }, placeholder: "Your name" })),
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement(label_1.Label, { htmlFor: "employeeId" }, "Employee ID"),
                        react_1["default"].createElement(input_1.Input, { id: "employeeId", value: formData.employeeId, onChange: function (e) {
                                return setFormData(function (prev) { return (__assign(__assign({}, prev), { employeeId: e.target.value })); });
                            }, placeholder: "Employee ID" })),
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement(label_1.Label, { htmlFor: "purpose" }, "Purpose *"),
                        react_1["default"].createElement(input_1.Input, { id: "purpose", value: formData.purpose, onChange: function (e) {
                                return setFormData(function (prev) { return (__assign(__assign({}, prev), { purpose: e.target.value })); });
                            }, placeholder: "What is the imprest for?" })),
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement(label_1.Label, { htmlFor: "amount" }, "Amount (KES) *"),
                        react_1["default"].createElement(input_1.Input, { id: "amount", type: "number", value: formData.amount, onChange: function (e) {
                                return setFormData(function (prev) { return (__assign(__assign({}, prev), { amount: parseFloat(e.target.value) || 0 })); });
                            }, placeholder: "0" })),
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement(label_1.Label, { htmlFor: "justification" }, "Justification"),
                        react_1["default"].createElement(textarea_1.Textarea, { id: "justification", value: formData.justification, onChange: function (e) {
                                return setFormData(function (prev) { return (__assign(__assign({}, prev), { justification: e.target.value })); });
                            }, placeholder: "Why do you need this imprest?", rows: 3 })),
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement(label_1.Label, { htmlFor: "returnDate" }, "Expected Return Date"),
                        react_1["default"].createElement(input_1.Input, { id: "returnDate", type: "date", value: formData.expectedReturnDate, onChange: function (e) {
                                return setFormData(function (prev) { return (__assign(__assign({}, prev), { expectedReturnDate: e.target.value })); });
                            } })),
                    react_1["default"].createElement(alert_1.Alert, null,
                        react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4" }),
                        react_1["default"].createElement(alert_1.AlertDescription, null, "The imprest amount must be settled/surrendered within the specified period"))),
                react_1["default"].createElement(dialog_1.DialogFooter, null,
                    react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () {
                            setCreateDialogOpen(false);
                            resetForm();
                        } }, "Cancel"),
                    react_1["default"].createElement(button_1.Button, { onClick: handleSave, disabled: createMutation.isPending }, createMutation.isPending ? (react_1["default"].createElement(react_1["default"].Fragment, null,
                        react_1["default"].createElement(lucide_react_1.Loader2, { className: "w-4 h-4 mr-2 animate-spin" }),
                        "Submitting...")) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                        react_1["default"].createElement(lucide_react_1.CheckCircle2, { className: "w-4 h-4 mr-2" }),
                        "Submit Request")))))),
        react_1["default"].createElement(dialog_1.Dialog, { open: viewDialogOpen, onOpenChange: setViewDialogOpen },
            react_1["default"].createElement(dialog_1.DialogContent, null,
                react_1["default"].createElement(dialog_1.DialogHeader, null,
                    react_1["default"].createElement(dialog_1.DialogTitle, null, "Imprest Details")),
                selectedImprest && (react_1["default"].createElement("div", { className: "space-y-4" },
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("p", { className: "text-sm text-gray-500" }, "Imprest Number"),
                            react_1["default"].createElement("p", { className: "font-mono font-semibold" }, selectedImprest.imprestNumber)),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("p", { className: "text-sm text-gray-500" }, "Status"),
                            react_1["default"].createElement(badge_1.Badge, { className: getStatusColor(selectedImprest.status) }, selectedImprest.status))),
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("p", { className: "text-sm text-gray-500" }, "Employee"),
                            react_1["default"].createElement("p", { className: "font-semibold" }, selectedImprest.employeeName)),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("p", { className: "text-sm text-gray-500" }, "Amount"),
                            react_1["default"].createElement("p", { className: "font-semibold" },
                                "KES ",
                                ((selectedImprest.amount || 0) / 100).toLocaleString()))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "text-sm text-gray-500" }, "Purpose"),
                        react_1["default"].createElement("p", { className: "font-medium" }, selectedImprest.purpose)),
                    selectedImprest.justification && (react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "text-sm text-gray-500" }, "Justification"),
                        react_1["default"].createElement("p", null, selectedImprest.justification))),
                    selectedImprest.expectedReturnDate && (react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "text-sm text-gray-500" }, "Expected Return Date"),
                        react_1["default"].createElement("p", { className: "font-medium" }, new Date(selectedImprest.expectedReturnDate).toLocaleDateString()))),
                    selectedImprest.createdAt && (react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "text-sm text-gray-500" }, "Requested On"),
                        react_1["default"].createElement("p", { className: "font-medium" }, new Date(selectedImprest.createdAt).toLocaleDateString())))))))));
}
exports["default"] = ProcurementImprestsPage;
