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
var react_1 = require("react");
var DeleteConfirmationModal_1 = require("@/components/DeleteConfirmationModal");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var PaymentTracking_1 = require("@/components/PaymentTracking");
var documentTemplate_1 = require("@/lib/documentTemplate");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var table_1 = require("@/components/ui/table");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var mutationHelpers_1 = require("@/lib/mutationHelpers");
var useAuthWithPersistence_1 = require("@/_core/hooks/useAuthWithPersistence");
var currency_1 = require("@/lib/currency");
var ResponsiveTabs_1 = require("@/components/ResponsiveTabs");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var lucide_react_2 = require("lucide-react");
var useFavorite_1 = require("@/hooks/useFavorite");
function InvoiceDetails() {
    var _this = this;
    var _a;
    var _b = wouter_1.useRoute("/invoices/:id"), params = _b[1];
    var _c = wouter_1.useLocation(), navigate = _c[1];
    var invoiceId = (params === null || params === void 0 ? void 0 : params.id) || "";
    var _d = useFavorite_1.useFavorite("invoice", invoiceId), isStarred = _d.isStarred, toggleStar = _d.toggleStar;
    var utils = trpc_1.trpc.useUtils();
    var user = useAuthWithPersistence_1.useAuthWithPersistence().user;
    var currencyCode = currency_1.useCurrencySettings().code;
    var _e = trpc_1.trpc.invoices.getWithItems.useQuery(invoiceId, {
        enabled: !!invoiceId
    }), invoiceData = _e.data, isLoading = _e.isLoading;
    var _f = trpc_1.trpc.clients.list.useQuery().data, clientsData = _f === void 0 ? [] : _f;
    var rawCompanyInfo = trpc_1.trpc.settings.getCompanyInfo.useQuery().data;
    var bankPayData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "payment_bank" }).data;
    var mpesaPayData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "payment_mpesa" }).data;
    var invoiceSettingsData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "invoice_settings" }).data;
    var docTemplatesData = trpc_1.trpc.documentTemplates.list.useQuery({ type: "invoice" }).data;
    // Convert frozen Drizzle objects to plain objects to avoid React error #306
    var clientsDataPlain = clientsData ? JSON.parse(JSON.stringify(clientsData)) : [];
    var invoiceDataPlain = invoiceData ? JSON.parse(JSON.stringify(invoiceData)) : null;
    var companyInfo = rawCompanyInfo ? JSON.parse(JSON.stringify(rawCompanyInfo)) : null;
    var approveMutation = trpc_1.trpc.approvals.approveInvoice.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Invoice approved successfully");
            utils.invoices.getWithItems.invalidate(invoiceId);
        },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var client = invoiceDataPlain ? clientsDataPlain.find(function (c) { return c.id === invoiceDataPlain.clientId; }) : null;
    var _g = react_1.useState(false), showDeleteModal = _g[0], setShowDeleteModal = _g[1];
    var _h = react_1.useState(false), isDeleting = _h[0], setIsDeleting = _h[1];
    var deleteMutation = trpc_1.trpc.invoices["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Invoice deleted successfully");
            utils.invoices.list.invalidate();
            navigate("/invoices");
        },
        onError: function (err) { return sonner_1.toast.error(err.message || "Failed to delete invoice"); }
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
                    return [4 /*yield*/, mutationHelpers_1["default"](deleteMutation, invoiceId)];
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
    var invoice = invoiceDataPlain ? {
        id: invoiceId,
        invoiceNumber: invoiceDataPlain.invoiceNumber || "INV-" + invoiceId.slice(0, 8),
        status: invoiceDataPlain.status || "draft",
        issueDate: invoiceDataPlain.issueDate ? new Date(invoiceDataPlain.issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        dueDate: invoiceDataPlain.dueDate ? new Date(invoiceDataPlain.dueDate).toISOString().split('T')[0] : "",
        paidDate: invoiceDataPlain.paidDate ? new Date(invoiceDataPlain.paidDate).toISOString().split('T')[0] : "",
        client: {
            name: (client === null || client === void 0 ? void 0 : client.companyName) || "Unknown Client",
            email: (client === null || client === void 0 ? void 0 : client.email) || "",
            phone: (client === null || client === void 0 ? void 0 : client.phone) || "",
            address: (client === null || client === void 0 ? void 0 : client.address) || ""
        },
        items: invoiceDataPlain.lineItems || invoiceDataPlain.items || [],
        subtotal: (invoiceDataPlain.subtotal || 0) / 100,
        tax: (invoiceDataPlain.taxAmount || 0) / 100,
        total: (invoiceDataPlain.total || 0) / 100,
        notes: invoiceDataPlain.notes || ""
    } : null;
    var handlePrint = function () {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        var printWindow = window.open('', '_blank');
        if (!printWindow)
            return;
        var html = documentTemplate_1.generateDocumentHTML({
            documentType: 'invoice',
            documentNumber: (invoice === null || invoice === void 0 ? void 0 : invoice.invoiceNumber) || 'N/A',
            documentDate: (invoice === null || invoice === void 0 ? void 0 : invoice.issueDate) || 'N/A',
            dueDate: invoice === null || invoice === void 0 ? void 0 : invoice.dueDate,
            companyName: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyName,
            companyLogo: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyLogo,
            companyPhone: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyPhone,
            companyEmail: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyEmail,
            companyWebsite: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyWebsite,
            companyAddress: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyAddress,
            clientName: ((_a = invoice === null || invoice === void 0 ? void 0 : invoice.client) === null || _a === void 0 ? void 0 : _a.name) || 'Client',
            clientEmail: ((_b = invoice === null || invoice === void 0 ? void 0 : invoice.client) === null || _b === void 0 ? void 0 : _b.email) || 'Email',
            clientPhone: ((_c = invoice === null || invoice === void 0 ? void 0 : invoice.client) === null || _c === void 0 ? void 0 : _c.phone) || 'Phone',
            clientAddress: ((_d = invoice === null || invoice === void 0 ? void 0 : invoice.client) === null || _d === void 0 ? void 0 : _d.address) || 'Address',
            items: Array.isArray(invoice === null || invoice === void 0 ? void 0 : invoice.items) ? invoice.items.map(function (item) { return ({
                description: item.description || '',
                quantity: item.quantity || 0,
                unitPrice: (item.unitPrice || 0) / 100,
                total: (item.total || 0) / 100
            }); }) : [],
            subtotal: ((invoice === null || invoice === void 0 ? void 0 : invoice.subtotal) || 0),
            tax: ((invoice === null || invoice === void 0 ? void 0 : invoice.tax) || 0),
            total: ((invoice === null || invoice === void 0 ? void 0 : invoice.total) || 0),
            taxType: ((_e = invoice) === null || _e === void 0 ? void 0 : _e.taxType) || 'exclusive',
            notes: invoice === null || invoice === void 0 ? void 0 : invoice.notes,
            termsAndConditions: (invoiceSettingsData === null || invoiceSettingsData === void 0 ? void 0 : invoiceSettingsData.termsAndConditions) || ((_f = invoice) === null || _f === void 0 ? void 0 : _f.termsAndConditions) || '',
            bankDetailsHtml: (bankPayData === null || bankPayData === void 0 ? void 0 : bankPayData.enabled) === 'true' ? bankPayData === null || bankPayData === void 0 ? void 0 : bankPayData.details : undefined,
            bankName: undefined,
            mpesaPaybill: (mpesaPayData === null || mpesaPayData === void 0 ? void 0 : mpesaPayData.enabled) === 'true' ? mpesaPayData === null || mpesaPayData === void 0 ? void 0 : mpesaPayData.paybillNumber : undefined,
            mpesaAccountNumber: (mpesaPayData === null || mpesaPayData === void 0 ? void 0 : mpesaPayData.enabled) === 'true' ? mpesaPayData === null || mpesaPayData === void 0 ? void 0 : mpesaPayData.paybillNumber : undefined,
            customTemplateHtml: ((_h = (_g = docTemplatesData) === null || _g === void 0 ? void 0 : _g[0]) === null || _h === void 0 ? void 0 : _h.content) || undefined
        });
        printWindow.document.write(html);
        printWindow.document.close();
    };
    if (isLoading)
        return React.createElement(ModuleLayout_1.ModuleLayout, { title: "Invoice Details", icon: React.createElement(lucide_react_2.FileText, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "Invoices", href: "/invoices" }, { label: "Details" }], backLink: { label: "Invoices", href: "/invoices" } },
            React.createElement("div", { className: "p-8 text-center" }, "Loading..."));
    if (!invoice)
        return React.createElement(ModuleLayout_1.ModuleLayout, { title: "Invoice Details", icon: React.createElement(lucide_react_2.FileText, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "Invoices", href: "/invoices" }, { label: "Details" }], backLink: { label: "Invoices", href: "/invoices" } },
            React.createElement("div", { className: "p-8 text-center" }, "Not found"));
    var canApprove = ((user === null || user === void 0 ? void 0 : user.role) === 'admin' || (user === null || user === void 0 ? void 0 : user.role) === 'super_admin' || (user === null || user === void 0 ? void 0 : user.role) === 'accountant') && invoice.status === 'draft';
    var fmtAmt = function (v) { return new Intl.NumberFormat("en-KE", { style: "currency", currency: currencyCode }).format(v); };
    var statusColor = { paid: "bg-green-100 text-green-800", draft: "bg-gray-100 text-gray-800", sent: "bg-blue-100 text-blue-800", overdue: "bg-red-100 text-red-800", partial: "bg-yellow-100 text-yellow-800" };
    return (React.createElement(React.Fragment, null,
        React.createElement(ModuleLayout_1.ModuleLayout, { title: "Invoice Details", icon: React.createElement(lucide_react_2.FileText, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "Invoices", href: "/invoices" }, { label: "Details" }], backLink: { label: "Invoices", href: "/invoices" } },
            React.createElement("div", { className: "space-y-4" },
                React.createElement("div", { className: "flex items-center justify-end gap-1" },
                    React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: toggleStar },
                        React.createElement(lucide_react_1.Star, { className: "h-4 w-4 " + (isStarred ? "fill-amber-400 text-amber-400" : "") })),
                    canApprove && React.createElement(button_1.Button, { size: "sm", onClick: function () { return approveMutation.mutate({ id: invoice.id }); } },
                        React.createElement(lucide_react_1.Check, { className: "mr-1 h-4 w-4" }),
                        "Approve"),
                    React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: handlePrint },
                        React.createElement(lucide_react_1.Printer, { className: "h-4 w-4" })),
                    React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: function () { return navigate("/invoices/" + invoiceId + "/edit"); } },
                        React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" })),
                    React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 text-destructive", onClick: function () { return setShowDeleteModal(true); } },
                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))),
                React.createElement("div", { className: "flex flex-col lg:flex-row gap-3 sm:gap-4 md:gap-6" },
                    React.createElement("div", { className: "w-full lg:w-80 lg:shrink-0 space-y-3 sm:space-y-4" },
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardContent, { className: "p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4" },
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement("h2", { className: "text-lg sm:text-xl font-bold" }, invoice.invoiceNumber),
                                    React.createElement(badge_1.Badge, { className: statusColor[invoice.status] || "" }, (invoice.status || "pending").toUpperCase())),
                                React.createElement(separator_1.Separator, null),
                                React.createElement("div", { className: "space-y-2 sm:space-y-3 text-xs sm:text-sm" },
                                    React.createElement("div", { className: "flex items-start gap-2" },
                                        React.createElement(lucide_react_1.Building2, { className: "h-4 w-4 mt-0.5 text-muted-foreground shrink-0" }),
                                        React.createElement("div", null,
                                            React.createElement("p", { className: "text-muted-foreground text-xs" }, "Client"),
                                            React.createElement("p", { className: "font-medium" }, ((_a = invoice.client) === null || _a === void 0 ? void 0 : _a.name) || "—"))),
                                    React.createElement("div", { className: "flex items-start gap-2" },
                                        React.createElement(lucide_react_1.Calendar, { className: "h-4 w-4 mt-0.5 text-muted-foreground shrink-0" }),
                                        React.createElement("div", null,
                                            React.createElement("p", { className: "text-muted-foreground text-xs" }, "Issue Date"),
                                            React.createElement("p", null, invoice.issueDate || "—"))),
                                    React.createElement("div", { className: "flex items-start gap-2" },
                                        React.createElement(lucide_react_1.Clock, { className: "h-4 w-4 mt-0.5 text-muted-foreground shrink-0" }),
                                        React.createElement("div", null,
                                            React.createElement("p", { className: "text-muted-foreground text-xs" }, "Due Date"),
                                            React.createElement("p", null, invoice.dueDate || "—")))),
                                React.createElement(separator_1.Separator, null),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement("div", { className: "flex justify-between text-sm" },
                                        React.createElement("span", { className: "text-muted-foreground" }, "Subtotal"),
                                        React.createElement("span", null, fmtAmt(invoice.subtotal || 0))),
                                    React.createElement("div", { className: "flex justify-between text-sm" },
                                        React.createElement("span", { className: "text-muted-foreground" }, "Tax"),
                                        React.createElement("span", null, fmtAmt(invoice.tax || 0))),
                                    React.createElement(separator_1.Separator, null),
                                    React.createElement("div", { className: "flex justify-between font-bold" },
                                        React.createElement("span", null, "Total"),
                                        React.createElement("span", null, fmtAmt(invoice.total || 0))))))),
                    React.createElement("div", { className: "flex-1 min-w-0" },
                        React.createElement(ResponsiveTabs_1.ResponsiveTabs, { defaultValue: "items", tabs: [
                                {
                                    value: "items",
                                    label: "Line Items",
                                    content: (React.createElement(card_1.Card, null,
                                        React.createElement(card_1.CardContent, { className: "p-2 sm:p-3 md:p-0 overflow-x-auto" },
                                            React.createElement(table_1.Table, { className: "text-xs sm:text-sm" },
                                                React.createElement(table_1.TableHeader, null,
                                                    React.createElement(table_1.TableRow, null,
                                                        React.createElement(table_1.TableHead, { className: "px-2 sm:px-3" }, "Description"),
                                                        React.createElement(table_1.TableHead, { className: "text-right px-2 sm:px-3" }, "Qty"),
                                                        React.createElement(table_1.TableHead, { className: "text-right px-2 sm:px-3" }, "Rate"),
                                                        React.createElement(table_1.TableHead, { className: "text-right px-2 sm:px-3" }, "Amount"))),
                                                React.createElement(table_1.TableBody, null, Array.isArray(invoice === null || invoice === void 0 ? void 0 : invoice.items) && invoice.items.map(function (item, i) { return (React.createElement(table_1.TableRow, { key: item.id || "inv-item-" + i },
                                                    React.createElement(table_1.TableCell, { className: "px-2 sm:px-3" }, (item === null || item === void 0 ? void 0 : item.description) || "N/A"),
                                                    React.createElement(table_1.TableCell, { className: "text-right px-2 sm:px-3" }, (item === null || item === void 0 ? void 0 : item.quantity) || 0),
                                                    React.createElement(table_1.TableCell, { className: "text-right px-2 sm:px-3 whitespace-nowrap" }, fmtAmt(((item === null || item === void 0 ? void 0 : item.unitPrice) || 0) / 100)),
                                                    React.createElement(table_1.TableCell, { className: "text-right px-2 sm:px-3 whitespace-nowrap font-medium" }, fmtAmt(((item === null || item === void 0 ? void 0 : item.total) || 0) / 100)))); }))))))
                                },
                                {
                                    value: "notes",
                                    label: "Notes & Terms",
                                    content: (React.createElement("div", { className: "space-y-3 sm:space-y-4" },
                                        invoice.notes && (React.createElement(card_1.Card, null,
                                            React.createElement(card_1.CardHeader, { className: "py-3 sm:py-4" },
                                                React.createElement(card_1.CardTitle, { className: "text-base sm:text-lg flex items-center gap-2" },
                                                    React.createElement(lucide_react_2.FileText, { className: "h-4 sm:h-5 w-4 sm:w-5" }),
                                                    "Notes")),
                                            React.createElement(card_1.CardContent, { className: "text-sm" },
                                                React.createElement(RichTextEditor_1.RichTextDisplay, { html: invoice.notes })))),
                                        invoice.termsAndConditions && (React.createElement(card_1.Card, null,
                                            React.createElement(card_1.CardHeader, { className: "py-3 sm:py-4" },
                                                React.createElement(card_1.CardTitle, { className: "text-base sm:text-lg flex items-center gap-2" },
                                                    React.createElement(lucide_react_2.Scale, { className: "h-4 sm:h-5 w-4 sm:w-5" }),
                                                    "Terms & Conditions")),
                                            React.createElement(card_1.CardContent, { className: "text-sm" },
                                                React.createElement(RichTextEditor_1.RichTextDisplay, { html: invoice.termsAndConditions })))),
                                        !invoice.notes && !invoice.termsAndConditions && (React.createElement("p", { className: "text-muted-foreground text-xs sm:text-sm py-4" }, "No notes or terms added."))))
                                },
                                {
                                    value: "payments",
                                    label: "Payments",
                                    content: (React.createElement(PaymentTracking_1["default"], { invoiceId: invoiceId, invoiceTotal: Math.round(invoice.total * 100), invoiceStatus: invoice.status }))
                                },
                            ] }))))),
        React.createElement(DeleteConfirmationModal_1["default"], { isOpen: showDeleteModal, onCancel: function () { return setShowDeleteModal(false); }, onConfirm: handleDelete, isLoading: isDeleting, title: "Delete Invoice", description: "Are you sure you want to delete this invoice? This action cannot be undone." })));
}
exports["default"] = InvoiceDetails;
