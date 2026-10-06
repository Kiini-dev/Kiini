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
var wouter_1 = require("wouter");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var DeleteConfirmationModal_1 = require("@/components/DeleteConfirmationModal");
var react_1 = require("react");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var mutationHelpers_1 = require("@/lib/mutationHelpers");
var date_fns_1 = require("date-fns");
var pdfGenerator_1 = require("@/lib/pdfGenerator");
function PaymentDetails() {
    var _this = this;
    var id = wouter_1.useParams().id;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = react_1.useState(false), showDeleteModal = _b[0], setShowDeleteModal = _b[1];
    var _c = react_1.useState(false), isDeleting = _c[0], setIsDeleting = _c[1];
    // Fetch payment from backend
    var _d = trpc_1.trpc.payments.getById.useQuery(id || ""), paymentData = _d.data, isLoading = _d.isLoading;
    var _e = trpc_1.trpc.clients.list.useQuery({}).data, clientsData = _e === void 0 ? [] : _e;
    var utils = trpc_1.trpc.useUtils();
    var deletePaymentMutation = trpc_1.trpc.payments["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Payment deleted successfully");
            utils.payments.list.invalidate();
            navigate("/payments");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete payment");
        }
    });
    // Get client info
    var client = paymentData && Array.isArray(clientsData) ? clientsData.find(function (c) { return c.id === paymentData.clientId; }) : null;
    var payment = paymentData ? {
        id: paymentData.id || id || "1",
        referenceNumber: paymentData.receiptNumber || "PAY-" + (id === null || id === void 0 ? void 0 : id.slice(0, 8)),
        client: (client === null || client === void 0 ? void 0 : client.companyName) || "Unknown Client",
        amount: (paymentData.amount || 0) / 100,
        status: paymentData.status || "pending",
        paymentMethod: paymentData.paymentMethod || "cash",
        date: paymentData.date ? date_fns_1.format(new Date(paymentData.date), "yyyy-MM-dd") : new Date().toISOString().split('T')[0],
        reference: paymentData.reference || "",
        notes: paymentData.notes || ""
    } : null;
    var handleEdit = function () {
        navigate("/payments/" + id + "/edit");
    };
    var handleDelete = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsDeleting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, mutationHelpers_1["default"](deletePaymentMutation, id || "")];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    setIsDeleting(false);
                    setShowDeleteModal(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    if (isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Payment Details", icon: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "Payments", href: "/payments" }, { label: "Details" }], backLink: { label: "Payments", href: "/payments" } },
            React.createElement("div", { className: "flex items-center justify-center h-64" },
                React.createElement("p", null, "Loading payment..."))));
    }
    if (!payment) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Payment Details", icon: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "Payments", href: "/payments" }, { label: "Details" }], backLink: { label: "Payments", href: "/payments" } },
            React.createElement("div", { className: "flex flex-col items-center justify-center h-64 gap-4" },
                React.createElement("p", null, "Payment not found"),
                React.createElement(button_1.Button, { onClick: function () { return navigate("/payments"); } }, "Back to Payments"))));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Payment Details", icon: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "Payments", href: "/payments" }, { label: "Details" }], backLink: { label: "Payments", href: "/payments" } },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "flex gap-2" },
                React.createElement(button_1.Button, { onClick: handleEdit },
                    React.createElement(lucide_react_1.Edit, { className: "mr-2 h-4 w-4" }),
                    "Edit"),
                React.createElement(button_1.Button, { variant: "destructive", onClick: function () { return setShowDeleteModal(true); } },
                    React.createElement(lucide_react_1.Trash2, { className: "mr-2 h-4 w-4" }),
                    "Delete"),
                React.createElement(button_1.Button, { variant: "outline", onClick: function () {
                        var doc = pdfGenerator_1.generateReceiptPDF({
                            receiptNumber: payment.referenceNumber,
                            date: payment.date,
                            client: {
                                name: payment.client,
                                email: (client === null || client === void 0 ? void 0 : client.email) || ""
                            },
                            amount: payment.amount,
                            paymentMethod: payment.paymentMethod.replace("_", " ").toUpperCase(),
                            notes: payment.notes || undefined
                        });
                        doc.save("Receipt-" + payment.referenceNumber + ".pdf");
                        sonner_1.toast.success("PDF downloaded");
                    } },
                    React.createElement(lucide_react_1.Download, { className: "mr-2 h-4 w-4" }),
                    "Download"),
                React.createElement(button_1.Button, { variant: "outline", onClick: function () {
                        var subject = encodeURIComponent("Payment Receipt " + payment.referenceNumber);
                        var body = encodeURIComponent("Receipt for " + payment.client + "\nAmount: Ksh " + (payment.amount / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 }) + "\nDate: " + payment.date);
                        window.open("mailto:?subject=" + subject + "&body=" + body, "_blank");
                    } },
                    React.createElement(lucide_react_1.Send, { className: "mr-2 h-4 w-4" }),
                    "Send")),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Payment Information"),
                    React.createElement(card_1.CardDescription, null, "View payment details")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Reference"),
                            React.createElement("p", { className: "text-muted-foreground" }, (payment === null || payment === void 0 ? void 0 : payment.referenceNumber) || "N/A")),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Status"),
                            React.createElement(badge_1.Badge, { variant: (payment === null || payment === void 0 ? void 0 : payment.status) === "completed" ? "default" : (payment === null || payment === void 0 ? void 0 : payment.status) === "pending" ? "secondary" : "destructive" }, ((payment === null || payment === void 0 ? void 0 : payment.status) || "pending").charAt(0).toUpperCase() + ((payment === null || payment === void 0 ? void 0 : payment.status) || "pending").slice(1))),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Amount"),
                            React.createElement("p", { className: "text-muted-foreground" },
                                "Ksh ",
                                ((payment === null || payment === void 0 ? void 0 : payment.amount) || 0).toLocaleString())),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Method"),
                            React.createElement("p", { className: "text-muted-foreground" }, ((payment === null || payment === void 0 ? void 0 : payment.paymentMethod) || "N/A").replace("_", " ").toUpperCase())),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Date"),
                            React.createElement("p", { className: "text-muted-foreground" }, (payment === null || payment === void 0 ? void 0 : payment.date) ? new Date(payment.date).toLocaleDateString() : "N/A")),
                        payment.reference && (React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Transaction Reference"),
                            React.createElement("p", { className: "text-muted-foreground" }, payment.reference))),
                        payment.notes && (React.createElement("div", { className: "md:col-span-2" },
                            React.createElement("label", { className: "text-sm font-medium" }, "Notes"),
                            React.createElement("p", { className: "text-muted-foreground" }, payment.notes))))))),
        React.createElement(DeleteConfirmationModal_1["default"], { isOpen: showDeleteModal, onCancel: function () { return setShowDeleteModal(false); }, onConfirm: handleDelete, isLoading: isDeleting, title: "Delete Payment", description: "Are you sure you want to delete this payment? This action cannot be undone." })));
}
exports["default"] = PaymentDetails;
