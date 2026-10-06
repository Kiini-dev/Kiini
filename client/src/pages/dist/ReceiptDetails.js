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
var ModuleLayout_1 = require("@/components/ModuleLayout");
var documentTemplate_1 = require("@/lib/documentTemplate");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var tabs_1 = require("@/components/ui/tabs");
var table_1 = require("@/components/ui/table");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var mutationHelpers_1 = require("@/lib/mutationHelpers");
var sonner_1 = require("sonner");
var react_1 = require("react");
var actions_1 = require("@/lib/actions");
function ReceiptDetails() {
    var _this = this;
    var _a = wouter_1.useRoute("/receipts/:id"), params = _a[1];
    var _b = wouter_1.useLocation(), navigate = _b[1];
    var receiptId = (params === null || params === void 0 ? void 0 : params.id) || "";
    var _c = react_1.useState(""), kraPIN = _c[0], setKraPIN = _c[1];
    // Fetch receipt from backend
    var _d = trpc_1.trpc.receipts.getById.useQuery(receiptId), receiptData = _d.data, isLoading = _d.isLoading;
    var _e = trpc_1.trpc.lineItems.getByDocumentId.useQuery({ documentId: receiptId, documentType: 'receipt' }).data, lineItemsData = _e === void 0 ? [] : _e;
    var _f = trpc_1.trpc.clients.list.useQuery({}).data, clientsData = _f === void 0 ? [] : _f;
    var companyInfo = trpc_1.trpc.settings.getCompanyInfo.useQuery({}).data;
    var bankPayData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "payment_bank" }).data;
    var mpesaPayData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "payment_mpesa" }).data;
    var docTemplatesData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "document_templates" }).data;
    // Get client info
    var client = receiptData ? clientsData.find(function (c) { return c.id === receiptData.clientId; }) : null;
    var receipt = receiptData ? {
        id: receiptId,
        receiptNumber: receiptData.receiptNumber || "REC-" + receiptId.slice(0, 8),
        status: receiptData.status || "draft",
        issueDate: receiptData.issueDate ? new Date(receiptData.issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        paymentMethod: receiptData.paymentMethod || "Unknown",
        referenceNumber: receiptData.referenceNumber || "",
        client: {
            name: (client === null || client === void 0 ? void 0 : client.companyName) || "Unknown Client",
            email: (client === null || client === void 0 ? void 0 : client.email) || "",
            phone: (client === null || client === void 0 ? void 0 : client.phone) || "",
            address: (client === null || client === void 0 ? void 0 : client.address) || ""
        },
        project: receiptData.projectId || "",
        items: lineItemsData && lineItemsData.length > 0
            ? lineItemsData
            : receiptData.items || [],
        subtotal: (receiptData.subtotal || 0) / 100,
        tax: (receiptData.taxAmount || 0) / 100,
        discount: (receiptData.discountAmount || 0) / 100,
        total: (receiptData.amount || 0) / 100,
        notes: receiptData.notes || ""
    } : null;
    var getStatusVariant = function (status) {
        switch (status) {
            case "received":
                return "default";
            case "pending":
                return "outline";
            case "failed":
                return "destructive";
            case "draft":
                return "secondary";
            default:
                return "default";
        }
    };
    var getStatusIcon = function (status) {
        switch (status) {
            case "received":
                return React.createElement(lucide_react_1.CheckCircle2, { className: "h-3 w-3" });
            case "pending":
                return React.createElement(lucide_react_1.Clock, { className: "h-3 w-3" });
            case "failed":
                return React.createElement(lucide_react_1.AlertCircle, { className: "h-3 w-3" });
            default:
                return null;
        }
    };
    var handleDownload = function () { return actions_1.handleDownload(receiptId, "receipt", "pdf", receipt); };
    var handleEmail = function () { var _a; return actions_1.handleEmail(receiptId, "receipt", ((_a = receipt === null || receipt === void 0 ? void 0 : receipt.client) === null || _a === void 0 ? void 0 : _a.email) || "", receipt); };
    var handlePrint = function () {
        var _a, _b, _c, _d, _e;
        var printWindow = window.open('', '_blank');
        if (!printWindow)
            return;
        var html = documentTemplate_1.generateDocumentHTML({
            documentType: 'receipt',
            documentNumber: (receipt === null || receipt === void 0 ? void 0 : receipt.receiptNumber) || 'N/A',
            documentDate: (receipt === null || receipt === void 0 ? void 0 : receipt.issueDate) || 'N/A',
            kraPIN: kraPIN,
            companyName: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyName,
            companyLogo: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyLogo,
            companyPhone: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyPhone,
            companyEmail: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyEmail,
            companyWebsite: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyWebsite,
            companyAddress: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyAddress,
            clientName: ((_a = receipt === null || receipt === void 0 ? void 0 : receipt.client) === null || _a === void 0 ? void 0 : _a.name) || 'Client',
            clientEmail: ((_b = receipt === null || receipt === void 0 ? void 0 : receipt.client) === null || _b === void 0 ? void 0 : _b.email) || 'Email',
            clientPhone: ((_c = receipt === null || receipt === void 0 ? void 0 : receipt.client) === null || _c === void 0 ? void 0 : _c.phone) || 'Phone',
            clientAddress: ((_d = receipt === null || receipt === void 0 ? void 0 : receipt.client) === null || _d === void 0 ? void 0 : _d.address) || 'Address',
            items: Array.isArray(receipt === null || receipt === void 0 ? void 0 : receipt.items) ? receipt.items.map(function (item) { return ({
                description: item.description || '',
                quantity: item.quantity || 1,
                unitPrice: (item.unitPrice || 0) / 100,
                total: (item.total || 0) / 100
            }); }) : [],
            subtotal: ((receipt === null || receipt === void 0 ? void 0 : receipt.subtotal) || 0),
            tax: ((receipt === null || receipt === void 0 ? void 0 : receipt.tax) || 0),
            total: ((receipt === null || receipt === void 0 ? void 0 : receipt.total) || 0),
            taxType: ((_e = receipt) === null || _e === void 0 ? void 0 : _e.taxType) || 'exclusive',
            paymentMethod: receipt === null || receipt === void 0 ? void 0 : receipt.paymentMethod,
            referenceNumber: receipt === null || receipt === void 0 ? void 0 : receipt.referenceNumber,
            notes: receipt === null || receipt === void 0 ? void 0 : receipt.notes,
            termsAndConditions: '',
            bankDetailsHtml: (bankPayData === null || bankPayData === void 0 ? void 0 : bankPayData.enabled) === 'true' ? bankPayData === null || bankPayData === void 0 ? void 0 : bankPayData.details : undefined,
            bankName: undefined,
            mpesaPaybill: (mpesaPayData === null || mpesaPayData === void 0 ? void 0 : mpesaPayData.enabled) === 'true' ? mpesaPayData === null || mpesaPayData === void 0 ? void 0 : mpesaPayData.paybillNumber : undefined,
            mpesaAccountNumber: (mpesaPayData === null || mpesaPayData === void 0 ? void 0 : mpesaPayData.enabled) === 'true' ? mpesaPayData === null || mpesaPayData === void 0 ? void 0 : mpesaPayData.paybillNumber : undefined,
            customTemplateHtml: (docTemplatesData === null || docTemplatesData === void 0 ? void 0 : docTemplatesData.receipt) || undefined
        });
        printWindow.document.write(html);
        printWindow.document.close();
    };
    var _g = react_1.useState(false), showDeleteModal = _g[0], setShowDeleteModal = _g[1];
    var _h = react_1.useState(false), isDeleting = _h[0], setIsDeleting = _h[1];
    var utils = trpc_1.trpc.useUtils();
    var deleteMutation = trpc_1.trpc.receipts["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Receipt deleted successfully");
            utils.receipts.list.invalidate();
            navigate("/receipts");
        },
        onError: function (err) { return sonner_1.toast.error(err.message || "Failed to delete receipt"); }
    });
    var handleDelete = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsDeleting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, mutationHelpers_1["default"](deleteMutation, receiptId)];
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
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Receipt Details", icon: React.createElement(lucide_react_1.Receipt, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "Receipts", href: "/receipts" }, { label: "Details" }], backLink: { label: "Receipts", href: "/receipts" } },
            React.createElement("div", { className: "flex items-center justify-center h-64" },
                React.createElement("p", null, "Loading receipt..."))));
    }
    if (!receipt) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Receipt Details", icon: React.createElement(lucide_react_1.Receipt, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "Receipts", href: "/receipts" }, { label: "Details" }], backLink: { label: "Receipts", href: "/receipts" } },
            React.createElement("div", { className: "flex flex-col items-center justify-center h-64 gap-4" },
                React.createElement("p", null, "Receipt not found"),
                React.createElement(button_1.Button, { onClick: function () { return navigate("/receipts"); } }, "Back to Receipts"))));
    }
    return (React.createElement(React.Fragment, null,
        React.createElement(ModuleLayout_1.ModuleLayout, { title: "Receipt Details", icon: React.createElement(lucide_react_1.Receipt, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "Receipts", href: "/receipts" }, { label: "Details" }], backLink: { label: "Receipts", href: "/receipts" } },
            React.createElement("div", { className: "space-y-6" },
                React.createElement("div", { className: "flex items-center justify-end gap-2" },
                    React.createElement(button_1.Button, { onClick: function () { return navigate("/receipts/" + receiptId + "/edit"); } },
                        React.createElement(lucide_react_1.Edit, { className: "mr-2 h-4 w-4" }),
                        "Edit"),
                    React.createElement(button_1.Button, { variant: "destructive", size: "icon", onClick: function () { return actions_1.handleDelete(receiptId, "receipt", function () { return mutationHelpers_1["default"](deleteMutation, receiptId); }); } },
                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))),
                React.createElement("div", { className: "flex flex-col lg:flex-row gap-6" },
                    React.createElement("div", { className: "w-full lg:w-80 shrink-0 space-y-4" },
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardContent, { className: "pt-6 space-y-5" },
                                React.createElement("div", { className: "text-center space-y-2" },
                                    React.createElement("div", { className: "flex items-center justify-center gap-2" },
                                        React.createElement(lucide_react_1.FileText, { className: "h-5 w-5 text-muted-foreground" }),
                                        React.createElement("h2", { className: "text-xl font-bold" }, receipt.receiptNumber)),
                                    React.createElement(badge_1.Badge, { variant: getStatusVariant(receipt.status), className: "gap-1 px-3 py-1" },
                                        getStatusIcon(receipt.status),
                                        receipt.status.toUpperCase())),
                                React.createElement(separator_1.Separator, null),
                                React.createElement("div", { className: "space-y-3" },
                                    React.createElement("div", { className: "flex items-center gap-3" },
                                        React.createElement(lucide_react_1.User, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
                                        React.createElement("div", { className: "min-w-0" },
                                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Client"),
                                            React.createElement("p", { className: "text-sm font-medium truncate" }, receipt.client.name))),
                                    React.createElement("div", { className: "flex items-center gap-3" },
                                        React.createElement(lucide_react_1.Calendar, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
                                        React.createElement("div", null,
                                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Date"),
                                            React.createElement("p", { className: "text-sm font-medium" }, new Date(receipt.issueDate).toLocaleDateString()))),
                                    React.createElement("div", { className: "flex items-center gap-3" },
                                        React.createElement(lucide_react_1.CreditCard, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
                                        React.createElement("div", null,
                                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Amount"),
                                            React.createElement("p", { className: "text-sm font-bold text-green-600" },
                                                "KES ",
                                                receipt.total.toLocaleString()))),
                                    React.createElement("div", { className: "flex items-center gap-3" },
                                        React.createElement(lucide_react_1.CreditCard, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
                                        React.createElement("div", null,
                                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Payment Method"),
                                            React.createElement("p", { className: "text-sm font-medium" }, receipt.paymentMethod))),
                                    receipt.referenceNumber && (React.createElement("div", { className: "flex items-center gap-3" },
                                        React.createElement(lucide_react_1.Hash, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
                                        React.createElement("div", null,
                                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Reference"),
                                            React.createElement("p", { className: "text-sm font-medium" }, receipt.referenceNumber))))),
                                React.createElement(separator_1.Separator, null),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement("label", { className: "text-xs font-medium text-muted-foreground" }, "KRA PIN"),
                                    React.createElement("input", { type: "text", placeholder: "Enter KRA PIN", value: kraPIN, onChange: function (e) { return setKraPIN(e.target.value); }, className: "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" })),
                                React.createElement(separator_1.Separator, null),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(button_1.Button, { variant: "outline", className: "w-full justify-start", onClick: handlePrint },
                                        React.createElement(lucide_react_1.Printer, { className: "mr-2 h-4 w-4" }),
                                        "Print Receipt"),
                                    React.createElement(button_1.Button, { variant: "outline", className: "w-full justify-start", onClick: handleDownload },
                                        React.createElement(lucide_react_1.Download, { className: "mr-2 h-4 w-4" }),
                                        "Download PDF"),
                                    React.createElement(button_1.Button, { variant: "outline", className: "w-full justify-start", onClick: handleEmail },
                                        React.createElement(lucide_react_1.Send, { className: "mr-2 h-4 w-4" }),
                                        "Email to Client"))))),
                    React.createElement("div", { className: "flex-1 min-w-0" },
                        React.createElement(tabs_1.Tabs, { defaultValue: "items", className: "w-full" },
                            React.createElement(tabs_1.TabsList, null,
                                React.createElement(tabs_1.TabsTrigger, { value: "items" }, "Items"),
                                React.createElement(tabs_1.TabsTrigger, { value: "details" }, "Details")),
                            React.createElement(tabs_1.TabsContent, { value: "items", className: "space-y-4" },
                                React.createElement(card_1.Card, null,
                                    React.createElement(card_1.CardHeader, null,
                                        React.createElement(card_1.CardTitle, { className: "text-lg" }, "Line Items")),
                                    React.createElement(card_1.CardContent, null,
                                        React.createElement(table_1.Table, null,
                                            React.createElement(table_1.TableHeader, null,
                                                React.createElement(table_1.TableRow, null,
                                                    React.createElement(table_1.TableHead, null, "Description"),
                                                    React.createElement(table_1.TableHead, { className: "text-right" }, "Qty"),
                                                    React.createElement(table_1.TableHead, { className: "text-right" }, "Rate"),
                                                    React.createElement(table_1.TableHead, { className: "text-right" }, "Amount"))),
                                            React.createElement(table_1.TableBody, null, Array.isArray(receipt.items) && receipt.items.length > 0 ? (receipt.items.map(function (item, index) { return (React.createElement(table_1.TableRow, { key: item.id || "item-" + index },
                                                React.createElement(table_1.TableCell, null, (item === null || item === void 0 ? void 0 : item.description) || "N/A"),
                                                React.createElement(table_1.TableCell, { className: "text-right" }, (item === null || item === void 0 ? void 0 : item.quantity) || 0),
                                                React.createElement(table_1.TableCell, { className: "text-right" },
                                                    "KES ",
                                                    (((item === null || item === void 0 ? void 0 : item.rate) || 0) / 100).toLocaleString()),
                                                React.createElement(table_1.TableCell, { className: "text-right font-medium" },
                                                    "KES ",
                                                    (((item === null || item === void 0 ? void 0 : item.amount) || 0) / 100).toLocaleString()))); })) : (React.createElement(table_1.TableRow, null,
                                                React.createElement(table_1.TableCell, { colSpan: 4, className: "text-center text-muted-foreground" }, "No items"))))),
                                        React.createElement(separator_1.Separator, { className: "my-4" }),
                                        React.createElement("div", { className: "flex justify-end" },
                                            React.createElement("div", { className: "w-full max-w-sm space-y-2" },
                                                React.createElement("div", { className: "flex justify-between text-sm" },
                                                    React.createElement("span", { className: "text-muted-foreground" }, "Subtotal"),
                                                    React.createElement("span", { className: "font-medium" },
                                                        "KES ",
                                                        (receipt.subtotal || 0).toLocaleString())),
                                                (receipt.tax || 0) > 0 && (React.createElement("div", { className: "flex justify-between text-sm" },
                                                    React.createElement("span", { className: "text-muted-foreground" }, "Tax (16% VAT)"),
                                                    React.createElement("span", { className: "font-medium" },
                                                        "KES ",
                                                        (receipt.tax || 0).toLocaleString()))),
                                                (receipt.discount || 0) > 0 && (React.createElement("div", { className: "flex justify-between text-sm" },
                                                    React.createElement("span", { className: "text-muted-foreground" }, "Discount"),
                                                    React.createElement("span", { className: "font-medium text-green-600" },
                                                        "-KES ",
                                                        (receipt.discount || 0).toLocaleString()))),
                                                React.createElement(separator_1.Separator, null),
                                                React.createElement("div", { className: "flex justify-between text-lg font-bold" },
                                                    React.createElement("span", null, "Total Received"),
                                                    React.createElement("span", null,
                                                        "KES ",
                                                        (receipt.total || 0).toLocaleString()))))))),
                            React.createElement(tabs_1.TabsContent, { value: "details", className: "space-y-4" },
                                React.createElement(card_1.Card, null,
                                    React.createElement(card_1.CardHeader, null,
                                        React.createElement(card_1.CardTitle, { className: "text-lg" }, "Notes")),
                                    React.createElement(card_1.CardContent, null,
                                        React.createElement("p", { className: "text-sm text-muted-foreground" }, receipt.notes || "No notes added."))),
                                React.createElement(card_1.Card, null,
                                    React.createElement(card_1.CardHeader, null,
                                        React.createElement(card_1.CardTitle, { className: "text-lg" }, "Received From")),
                                    React.createElement(card_1.CardContent, { className: "space-y-2" },
                                        React.createElement("div", { className: "flex items-center gap-2" },
                                            React.createElement(lucide_react_1.Building2, { className: "h-4 w-4 text-muted-foreground" }),
                                            React.createElement("span", { className: "font-semibold" }, receipt.client.name)),
                                        React.createElement("div", { className: "flex items-center gap-2 text-sm text-muted-foreground" },
                                            React.createElement(lucide_react_1.Mail, { className: "h-3 w-3" }),
                                            receipt.client.email || "No email"),
                                        React.createElement("div", { className: "flex items-center gap-2 text-sm text-muted-foreground" },
                                            React.createElement(lucide_react_1.Phone, { className: "h-3 w-3" }),
                                            receipt.client.phone || "No phone"),
                                        React.createElement("div", { className: "flex items-center gap-2 text-sm text-muted-foreground" },
                                            React.createElement(lucide_react_1.MapPin, { className: "h-3 w-3" }),
                                            receipt.client.address || "No address"))),
                                React.createElement(card_1.Card, null,
                                    React.createElement(card_1.CardHeader, null,
                                        React.createElement(card_1.CardTitle, { className: "text-lg" }, "From")),
                                    React.createElement(card_1.CardContent, { className: "space-y-2" },
                                        React.createElement("div", { className: "flex items-center gap-2" },
                                            React.createElement(lucide_react_1.Building2, { className: "h-4 w-4 text-muted-foreground" }),
                                            React.createElement("span", { className: "font-semibold" }, (companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyName) || "Company")),
                                        React.createElement("div", { className: "flex items-center gap-2 text-sm text-muted-foreground" },
                                            React.createElement(lucide_react_1.Mail, { className: "h-3 w-3" }),
                                            (companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyEmail) || ""),
                                        React.createElement("div", { className: "flex items-center gap-2 text-sm text-muted-foreground" },
                                            React.createElement(lucide_react_1.Phone, { className: "h-3 w-3" }),
                                            (companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyPhone) || ""),
                                        React.createElement("div", { className: "flex items-center gap-2 text-sm text-muted-foreground" },
                                            React.createElement(lucide_react_1.MapPin, { className: "h-3 w-3" }),
                                            (companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyAddress) || "")))))))))));
}
exports["default"] = ReceiptDetails;
