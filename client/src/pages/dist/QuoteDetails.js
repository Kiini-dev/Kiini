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
exports.QuoteDetails = void 0;
var react_1 = require("react");
var wouter_1 = require("wouter");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("../utils/trpc");
var table_1 = require("@/components/ui/table");
var ApprovalModal_1 = require("../components/ApprovalModal");
var format_1 = require("../utils/format");
var sonner_1 = require("sonner");
function QuoteDetails() {
    var _this = this;
    var _a;
    var _b = wouter_1.useLocation(), navigate = _b[1];
    var params = wouter_1.useParams();
    var quoteId = (params === null || params === void 0 ? void 0 : params.id) || "";
    var _c = react_1.useState(null), quote = _c[0], setQuote = _c[1];
    var _d = react_1.useState(true), loading = _d[0], setLoading = _d[1];
    var _e = react_1.useState(false), showApprovalModal = _e[0], setShowApprovalModal = _e[1];
    var _f = react_1.useState("send"), approvalAction = _f[0], setApprovalAction = _f[1];
    var _g = react_1.useState(""), approvalReason = _g[0], setApprovalReason = _g[1];
    var getQuery = trpc_1.trpc.quotes.getById.useQuery(quoteId, { enabled: !!quoteId });
    var sendMutation = trpc_1.trpc.quotes.send.useMutation();
    var acceptMutation = trpc_1.trpc.quotes.accept.useMutation();
    var declineMutation = trpc_1.trpc.quotes.decline.useMutation();
    var convertMutation = trpc_1.trpc.quotes.convertToInvoice.useMutation();
    var duplicateMutation = trpc_1.trpc.quotes.duplicate.useMutation();
    var deleteMutation = trpc_1.trpc.quotes["delete"].useMutation();
    react_1.useEffect(function () {
        if (getQuery.data) {
            setQuote(getQuery.data);
            setLoading(false);
        }
    }, [getQuery.data]);
    if (loading) {
        return (React.createElement("div", { className: "flex items-center justify-center h-96" },
            React.createElement("div", { className: "text-center" },
                React.createElement("div", { className: "inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }),
                React.createElement("p", { className: "mt-2 text-gray-600" }, "Loading quote..."))));
    }
    if (!quote) {
        return (React.createElement("div", { className: "text-center py-12" },
            React.createElement("p", { className: "text-gray-600" }, "Quote not found"),
            React.createElement("button", { onClick: function () { return navigate("/quotes"); }, className: "mt-4 text-blue-600 hover:underline" }, "Back to quotes")));
    }
    var handleApprovalConfirm = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, result, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 11, , 12]);
                    _a = approvalAction;
                    switch (_a) {
                        case "send": return [3 /*break*/, 1];
                        case "accept": return [3 /*break*/, 3];
                        case "decline": return [3 /*break*/, 5];
                        case "convert": return [3 /*break*/, 7];
                    }
                    return [3 /*break*/, 9];
                case 1: return [4 /*yield*/, sendMutation.mutateAsync(quoteId)];
                case 2:
                    _b.sent();
                    sonner_1.toast.success("Quote sent to client");
                    return [3 /*break*/, 9];
                case 3: return [4 /*yield*/, acceptMutation.mutateAsync({
                        id: quoteId,
                        notes: approvalReason
                    })];
                case 4:
                    _b.sent();
                    sonner_1.toast.success("Quote accepted");
                    return [3 /*break*/, 9];
                case 5: return [4 /*yield*/, declineMutation.mutateAsync({
                        id: quoteId,
                        reason: approvalReason
                    })];
                case 6:
                    _b.sent();
                    sonner_1.toast.success("Quote declined");
                    return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, convertMutation.mutateAsync({
                        id: quoteId,
                        invoiceNote: approvalReason
                    })];
                case 8:
                    result = _b.sent();
                    sonner_1.toast.success("Quote converted to invoice " + result.invoiceId);
                    return [3 /*break*/, 9];
                case 9:
                    setShowApprovalModal(false);
                    setApprovalReason("");
                    return [4 /*yield*/, getQuery.refetch()];
                case 10:
                    _b.sent();
                    return [3 /*break*/, 12];
                case 11:
                    error_1 = _b.sent();
                    sonner_1.toast.error(error_1.message || "Operation failed");
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/];
            }
        });
    }); };
    var handleDuplicate = function () { return __awaiter(_this, void 0, void 0, function () {
        var result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, duplicateMutation.mutateAsync(quoteId)];
                case 1:
                    result = _a.sent();
                    sonner_1.toast.success("Quote duplicated");
                    navigate("/quotes/" + result.id);
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    sonner_1.toast.error(error_2.message || "Failed to duplicate quote");
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleDelete = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!window.confirm("Are you sure you want to delete this quote?"))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, deleteMutation.mutateAsync(quoteId)];
                case 2:
                    _a.sent();
                    sonner_1.toast.success("Quote deleted");
                    navigate("/quotes");
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    sonner_1.toast.error(error_3.message || "Failed to delete quote");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var getStatusColor = function (status) {
        var colors = {
            draft: "bg-gray-100 text-gray-800",
            sent: "bg-blue-100 text-blue-800",
            accepted: "bg-green-100 text-green-800",
            declined: "bg-red-100 text-red-800",
            expired: "bg-orange-100 text-orange-800",
            converted: "bg-purple-100 text-purple-800"
        };
        return colors[status];
    };
    var isExpired = quote.expirationDate && new Date(quote.expirationDate) < new Date();
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "flex items-center justify-between" },
            React.createElement("div", { className: "flex items-center gap-4" },
                React.createElement("button", { onClick: function () { return navigate("/quotes"); }, className: "p-2 hover:bg-gray-100 rounded-lg transition-colors" },
                    React.createElement(lucide_react_1.ArrowLeft, { size: 24, className: "text-gray-600" })),
                React.createElement("div", null,
                    React.createElement("div", { className: "flex items-center gap-3" },
                        React.createElement("h1", { className: "text-3xl font-bold text-gray-900" }, quote.quoteNumber),
                        React.createElement("span", { className: "px-3 py-1 rounded-full text-xs font-semibold " + getStatusColor(quote.status) }, quote.status.charAt(0).toUpperCase() + quote.status.slice(1)),
                        isExpired && (React.createElement("span", { className: "px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800" }, "Expired"))),
                    React.createElement("p", { className: "text-gray-600 mt-1" }, quote.subject))),
            React.createElement("div", { className: "flex gap-2" },
                quote.status === "draft" && (React.createElement(React.Fragment, null,
                    React.createElement("button", { onClick: function () { return navigate("/quotes/" + quoteId + "/edit"); }, className: "flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors" },
                        React.createElement(lucide_react_1.Edit, { size: 18 }),
                        "Edit"),
                    React.createElement("button", { onClick: function () {
                            setApprovalAction("send");
                            setShowApprovalModal(true);
                        }, className: "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" },
                        React.createElement(lucide_react_1.Send, { size: 18 }),
                        "Send"))),
                quote.status === "sent" && !isExpired && (React.createElement(React.Fragment, null,
                    React.createElement("button", { onClick: function () {
                            setApprovalAction("accept");
                            setShowApprovalModal(true);
                        }, className: "flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors" },
                        React.createElement(lucide_react_1.CheckCircle, { size: 18 }),
                        "Accept"),
                    React.createElement("button", { onClick: function () {
                            setApprovalAction("decline");
                            setShowApprovalModal(true);
                        }, className: "flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors" },
                        React.createElement(lucide_react_1.XCircle, { size: 18 }),
                        "Decline"))),
                quote.status === "accepted" && (React.createElement("button", { onClick: function () {
                        setApprovalAction("convert");
                        setShowApprovalModal(true);
                    }, className: "flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors" },
                    React.createElement(lucide_react_1.LogIn, { size: 18 }),
                    "Convert to Invoice")),
                React.createElement("button", { onClick: handleDuplicate, className: "flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors" },
                    React.createElement(lucide_react_1.Copy, { size: 18 }),
                    "Duplicate"),
                React.createElement("button", { onClick: handleDelete, className: "flex items-center gap-2 px-4 py-2 border border-red-300 rounded-lg text-red-700 hover:bg-red-50 transition-colors" },
                    React.createElement(lucide_react_1.Trash2, { size: 18 }),
                    "Delete"))),
        isExpired && (React.createElement("div", { className: "flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg" },
            React.createElement(lucide_react_1.AlertCircle, { className: "text-orange-600", size: 20 }),
            React.createElement("div", null,
                React.createElement("p", { className: "font-semibold text-orange-900" }, "Quote Expired"),
                React.createElement("p", { className: "text-sm text-orange-800" },
                    "This quote expired on ",
                    format_1.formatDate(new Date(quote.expirationDate)))))),
        React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6" },
            React.createElement("div", { className: "lg:col-span-2 space-y-6" },
                quote.description && (React.createElement("div", { className: "bg-white rounded-lg border border-gray-200 p-6" },
                    React.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, "Description"),
                    React.createElement("p", { className: "text-gray-600" }, quote.description))),
                React.createElement("div", { className: "bg-white rounded-lg border border-gray-200 overflow-hidden" },
                    React.createElement("div", { className: "p-6 border-b border-gray-200" },
                        React.createElement("h3", { className: "text-lg font-semibold text-gray-900" }, "Line Items")),
                    React.createElement("div", { className: "overflow-x-auto" },
                        React.createElement(table_1.Table, null,
                            React.createElement(table_1.TableHeader, null,
                                React.createElement(table_1.TableRow, null,
                                    React.createElement(table_1.TableHead, null, "Description"),
                                    React.createElement(table_1.TableHead, { className: "text-right" }, "Qty"),
                                    React.createElement(table_1.TableHead, { className: "text-right" }, "Unit Price"),
                                    React.createElement(table_1.TableHead, { className: "text-right" }, "Tax"),
                                    React.createElement(table_1.TableHead, { className: "text-right" }, "Total"))),
                            React.createElement(table_1.TableBody, null, quote.items.map(function (item, index) { return (React.createElement(table_1.TableRow, { key: index },
                                React.createElement(table_1.TableCell, null, item.description),
                                React.createElement(table_1.TableCell, { className: "text-right" }, item.quantity),
                                React.createElement(table_1.TableCell, { className: "text-right" },
                                    "$",
                                    item.unitPrice.toFixed(2)),
                                React.createElement(table_1.TableCell, { className: "text-right" },
                                    item.taxRate,
                                    "%"),
                                React.createElement(table_1.TableCell, { className: "text-right font-semibold" },
                                    "$",
                                    item.total.toFixed(2)))); }))))),
                quote.notes && (React.createElement("div", { className: "bg-white rounded-lg border border-gray-200 p-6" },
                    React.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, "Notes"),
                    React.createElement("p", { className: "text-gray-600" }, quote.notes))),
                React.createElement("div", { className: "bg-white rounded-lg border border-gray-200 p-6" },
                    React.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-4" }, "Activity"),
                    React.createElement("div", { className: "space-y-3" }, (_a = quote.logs) === null || _a === void 0 ? void 0 : _a.map(function (log, index) { return (React.createElement("div", { key: index, className: "flex items-start gap-3 pb-3 border-b border-gray-200 last:pb-0 last:border-0" },
                        React.createElement("div", { className: "mt-1 text-xs text-gray-400" }, format_1.formatDate(new Date(log.createdAt))),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm font-semibold text-gray-900" }, log.action.charAt(0).toUpperCase() + log.action.slice(1)),
                            React.createElement("p", { className: "text-sm text-gray-600" }, log.description)))); })))),
            React.createElement("div", { className: "space-y-6" },
                React.createElement("div", { className: "bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 space-y-3" },
                    React.createElement("div", { className: "flex justify-between items-center text-gray-700" },
                        React.createElement("span", null, "Subtotal:"),
                        React.createElement("span", null,
                            "$",
                            quote.subtotal.toFixed(2))),
                    React.createElement("div", { className: "flex justify-between items-center text-gray-700" },
                        React.createElement("span", null, "Tax:"),
                        React.createElement("span", null,
                            "$",
                            quote.taxAmount.toFixed(2))),
                    React.createElement("div", { className: "border-t border-blue-200 pt-3 flex justify-between items-center" },
                        React.createElement("span", { className: "font-semibold text-gray-900" }, "Total:"),
                        React.createElement("span", { className: "text-2xl font-bold text-blue-600" },
                            "$",
                            quote.total.toFixed(2)))),
                React.createElement("div", { className: "bg-white rounded-lg border border-gray-200 p-6 space-y-3" },
                    React.createElement("div", null,
                        React.createElement("p", { className: "text-xs font-semibold text-gray-600" }, "Created"),
                        React.createElement("p", { className: "text-sm text-gray-900" }, format_1.formatDate(new Date(quote.createdAt)))),
                    quote.sentDate && (React.createElement("div", null,
                        React.createElement("p", { className: "text-xs font-semibold text-gray-600" }, "Sent"),
                        React.createElement("p", { className: "text-sm text-gray-900" }, format_1.formatDate(new Date(quote.sentDate))))),
                    quote.acceptedDate && (React.createElement("div", null,
                        React.createElement("p", { className: "text-xs font-semibold text-gray-600" }, "Accepted"),
                        React.createElement("p", { className: "text-sm text-gray-900" }, format_1.formatDate(new Date(quote.acceptedDate))))),
                    quote.expirationDate && (React.createElement("div", null,
                        React.createElement("p", { className: "text-xs font-semibold text-gray-600" }, "Expires"),
                        React.createElement("p", { className: "text-sm " + (isExpired ? "text-red-600 font-semibold" : "text-gray-900") }, format_1.formatDate(new Date(quote.expirationDate)))))))),
        React.createElement(ApprovalModal_1.ApprovalModal, { isOpen: showApprovalModal, onClose: function () { return setShowApprovalModal(false); }, title: approvalAction.charAt(0).toUpperCase() + approvalAction.slice(1) + " Quote", message: "Are you sure you want to " + approvalAction + " this quote?", requiresReason: ["decline", "accept", "convert"].includes(approvalAction), reason: approvalReason, onReasonChange: setApprovalReason, onConfirm: handleApprovalConfirm, loading: sendMutation.isPending || acceptMutation.isPending || declineMutation.isPending || convertMutation.isPending })));
}
exports.QuoteDetails = QuoteDetails;
