"use strict";
exports.__esModule = true;
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var documentTemplate_1 = require("@/lib/documentTemplate");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var table_1 = require("@/components/ui/table");
var lucide_react_1 = require("lucide-react");
var tabs_1 = require("@/components/ui/tabs");
var currency_1 = require("@/lib/currency");
var actions_1 = require("@/lib/actions");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var lucide_react_2 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var mutationHelpers_1 = require("@/lib/mutationHelpers");
var sonner_1 = require("sonner");
var useAuthWithPersistence_1 = require("@/_core/hooks/useAuthWithPersistence");
var useFavorite_1 = require("@/hooks/useFavorite");
function EstimateDetails() {
    var _a, _b, _c, _d, _e, _f;
    var _g = wouter_1.useRoute("/estimates/:id"), params = _g[1];
    var _h = wouter_1.useLocation(), navigate = _h[1];
    var estimateId = (params === null || params === void 0 ? void 0 : params.id) || "";
    var utils = trpc_1.trpc.useUtils();
    var user = useAuthWithPersistence_1.useAuthWithPersistence().user;
    var _j = trpc_1.trpc.estimates.getWithItems.useQuery(estimateId), estimateData = _j.data, isLoading = _j.isLoading;
    var _k = useFavorite_1.useFavorite("estimate", estimateId, estimateData === null || estimateData === void 0 ? void 0 : estimateData.estimateNumber), isStarred = _k.isStarred, toggleStar = _k.toggleStar;
    var _l = trpc_1.trpc.clients.list.useQuery().data, clientsData = _l === void 0 ? [] : _l;
    var rawCompanyInfo = trpc_1.trpc.settings.getCompanyInfo.useQuery().data;
    var bankPayData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "payment_bank" }).data;
    var mpesaPayData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "payment_mpesa" }).data;
    var invoiceSettingsData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "invoice_settings" }).data;
    var docTemplatesData = trpc_1.trpc.documentTemplates.list.useQuery({ type: "estimate" }).data;
    var currencyCode = currency_1.useCurrencySettings().code;
    // Convert frozen Drizzle objects to plain objects to avoid React error #306
    var clientsDataPlain = clientsData ? JSON.parse(JSON.stringify(clientsData)) : [];
    var estimateDataPlain = estimateData ? JSON.parse(JSON.stringify(estimateData)) : null;
    var companyInfo = rawCompanyInfo ? JSON.parse(JSON.stringify(rawCompanyInfo)) : null;
    var approveMutation = trpc_1.trpc.approvals.approveEstimate.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Estimate approved successfully");
            utils.estimates.getWithItems.invalidate(estimateId);
        },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var deleteMutation = trpc_1.trpc.estimates["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Estimate deleted successfully");
            utils.estimates.list.invalidate();
            navigate("/estimates");
        },
        onError: function (err) { return sonner_1.toast.error((err === null || err === void 0 ? void 0 : err.message) || "Failed to delete estimate"); }
    });
    var client = estimateDataPlain ? clientsDataPlain.find(function (c) { return c.id === estimateDataPlain.clientId; }) : null;
    var estimate = estimateDataPlain ? {
        id: estimateId,
        estimateNumber: estimateDataPlain.estimateNumber || "EST-" + estimateId.slice(0, 8),
        status: estimateDataPlain.status || "draft",
        issueDate: estimateDataPlain.issueDate ? new Date(estimateDataPlain.issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        client: {
            name: (client === null || client === void 0 ? void 0 : client.companyName) || "Unknown Client",
            email: (client === null || client === void 0 ? void 0 : client.email) || "",
            address: (client === null || client === void 0 ? void 0 : client.address) || ""
        },
        items: estimateDataPlain.lineItems || estimateDataPlain.items || [],
        subtotal: (estimateDataPlain.subtotal || 0) / 100,
        tax: (estimateDataPlain.taxAmount || 0) / 100,
        total: (estimateDataPlain.total || 0) / 100
    } : null;
    var handlePrint = function () {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        var printWindow = window.open('', '_blank');
        if (!printWindow)
            return;
        var html = documentTemplate_1.generateDocumentHTML({
            documentType: 'estimate',
            documentNumber: (estimate === null || estimate === void 0 ? void 0 : estimate.estimateNumber) || 'N/A',
            documentDate: (estimate === null || estimate === void 0 ? void 0 : estimate.issueDate) || 'N/A',
            companyName: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyName,
            companyLogo: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyLogo,
            companyPhone: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyPhone,
            companyEmail: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyEmail,
            companyWebsite: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyWebsite,
            companyAddress: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyAddress,
            clientName: ((_a = estimate === null || estimate === void 0 ? void 0 : estimate.client) === null || _a === void 0 ? void 0 : _a.name) || 'Client',
            clientEmail: ((_b = estimate === null || estimate === void 0 ? void 0 : estimate.client) === null || _b === void 0 ? void 0 : _b.email) || 'Email',
            clientPhone: ((_c = estimate === null || estimate === void 0 ? void 0 : estimate.client) === null || _c === void 0 ? void 0 : _c.phone) || 'Phone',
            clientAddress: ((_d = estimate === null || estimate === void 0 ? void 0 : estimate.client) === null || _d === void 0 ? void 0 : _d.address) || 'Address',
            items: Array.isArray(estimate === null || estimate === void 0 ? void 0 : estimate.items) ? estimate.items.map(function (item) { return ({
                description: item.description || '',
                quantity: item.quantity || 0,
                unitPrice: (item.unitPrice || 0) / 100,
                total: (item.total || 0) / 100
            }); }) : [],
            subtotal: ((estimate === null || estimate === void 0 ? void 0 : estimate.subtotal) || 0),
            tax: ((estimate === null || estimate === void 0 ? void 0 : estimate.tax) || 0),
            total: ((estimate === null || estimate === void 0 ? void 0 : estimate.total) || 0),
            taxType: ((_e = estimate) === null || _e === void 0 ? void 0 : _e.taxType) || 'exclusive',
            notes: estimate === null || estimate === void 0 ? void 0 : estimate.notes,
            termsAndConditions: (invoiceSettingsData === null || invoiceSettingsData === void 0 ? void 0 : invoiceSettingsData.termsAndConditions) || ((_f = estimate) === null || _f === void 0 ? void 0 : _f.termsAndConditions) || '',
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
        return React.createElement(ModuleLayout_1.ModuleLayout, { title: "Estimate Details", icon: React.createElement(lucide_react_2.FileText, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "Estimates", href: "/estimates" }, { label: "Details" }], backLink: { label: "Estimates", href: "/estimates" } },
            React.createElement("div", { className: "p-8 text-center" }, "Loading..."));
    if (!estimate)
        return React.createElement(ModuleLayout_1.ModuleLayout, { title: "Estimate Details", icon: React.createElement(lucide_react_2.FileText, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "Estimates", href: "/estimates" }, { label: "Details" }], backLink: { label: "Estimates", href: "/estimates" } },
            React.createElement("div", { className: "p-8 text-center" }, "Not found"));
    var fmtAmt = function (v) { return new Intl.NumberFormat("en-KE", { style: "currency", currency: currencyCode }).format(v); };
    var canApprove = ((user === null || user === void 0 ? void 0 : user.role) === 'admin' || (user === null || user === void 0 ? void 0 : user.role) === 'super_admin' || (user === null || user === void 0 ? void 0 : user.role) === 'accountant') && estimate.status === 'draft';
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Estimate Details", icon: React.createElement(lucide_react_2.FileText, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "Estimates", href: "/estimates" }, { label: "Details" }], backLink: { label: "Estimates", href: "/estimates" } },
        React.createElement("div", { className: "space-y-4" },
            React.createElement("div", { className: "flex items-center justify-end gap-1" },
                React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: toggleStar },
                    React.createElement(lucide_react_1.Star, { className: "h-4 w-4 " + (isStarred ? "fill-amber-400 text-amber-400" : "") })),
                canApprove && React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return approveMutation.mutate({ id: estimate.id }); } },
                    React.createElement(lucide_react_1.Check, { className: "h-4 w-4" })),
                React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: handlePrint },
                    React.createElement(lucide_react_1.Printer, { className: "h-4 w-4" })),
                React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return navigate("/estimates/" + estimateId + "/edit"); } },
                    React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" })),
                React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return actions_1.handleDelete(estimateId, "estimate", function () { return mutationHelpers_1["default"](deleteMutation, estimateId); }); } },
                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4 text-destructive" }))),
            React.createElement("div", { className: "flex gap-6" },
                React.createElement("div", { className: "w-[320px] min-w-[320px] space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardContent, { className: "pt-6 space-y-4" },
                            React.createElement("div", null,
                                React.createElement("h2", { className: "text-xl font-bold" }, estimate === null || estimate === void 0 ? void 0 : estimate.estimateNumber),
                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Quotation")),
                            React.createElement(badge_1.Badge, null, ((_a = estimate === null || estimate === void 0 ? void 0 : estimate.status) === null || _a === void 0 ? void 0 : _a.toUpperCase()) || "DRAFT"),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", { className: "space-y-3 text-sm" },
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4 text-muted-foreground" }),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-muted-foreground" }, "Client"),
                                        React.createElement("p", { className: "font-medium" }, (_b = estimate === null || estimate === void 0 ? void 0 : estimate.client) === null || _b === void 0 ? void 0 : _b.name))),
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement(lucide_react_1.Calendar, { className: "h-4 w-4 text-muted-foreground" }),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-muted-foreground" }, "Issue Date"),
                                        React.createElement("p", { className: "font-medium" }, estimate === null || estimate === void 0 ? void 0 : estimate.issueDate)))),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-muted-foreground mb-2" }, "Financial Summary"),
                                React.createElement("div", { className: "space-y-2 text-sm" },
                                    React.createElement("div", { className: "flex justify-between" },
                                        React.createElement("span", { className: "text-muted-foreground" }, "Subtotal"),
                                        React.createElement("span", null, fmtAmt(estimate.subtotal || 0))),
                                    React.createElement("div", { className: "flex justify-between" },
                                        React.createElement("span", { className: "text-muted-foreground" }, "Tax"),
                                        React.createElement("span", null, fmtAmt(estimate.tax || 0))),
                                    React.createElement(separator_1.Separator, null),
                                    React.createElement("div", { className: "flex justify-between font-bold" },
                                        React.createElement("span", null, "Total"),
                                        React.createElement("span", null, fmtAmt(estimate.total || 0)))))))),
                React.createElement("div", { className: "flex-1 min-w-0" },
                    React.createElement(tabs_1.Tabs, { defaultValue: "items", className: "space-y-4" },
                        React.createElement(tabs_1.TabsList, null,
                            React.createElement(tabs_1.TabsTrigger, { value: "items" }, "Line Items"),
                            React.createElement(tabs_1.TabsTrigger, { value: "notes" }, "Notes & Terms")),
                        React.createElement(tabs_1.TabsContent, { value: "items" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement("div", { className: "flex justify-between items-center" },
                                        React.createElement(card_1.CardTitle, null, "Quotation Details"),
                                        React.createElement("p", { className: "text-sm text-muted-foreground" },
                                            "Bill To: ", (_c = estimate === null || estimate === void 0 ? void 0 : estimate.client) === null || _c === void 0 ? void 0 :
                                            _c.name,
                                            " \u2014 ", (_d = estimate === null || estimate === void 0 ? void 0 : estimate.client) === null || _d === void 0 ? void 0 :
                                            _d.address))),
                                React.createElement(card_1.CardContent, null,
                                    React.createElement(table_1.Table, null,
                                        React.createElement(table_1.TableHeader, null,
                                            React.createElement(table_1.TableRow, null,
                                                React.createElement(table_1.TableHead, null, "Description"),
                                                React.createElement(table_1.TableHead, { className: "text-right" }, "Qty"),
                                                React.createElement(table_1.TableHead, { className: "text-right" }, "Rate"),
                                                React.createElement(table_1.TableHead, { className: "text-right" }, "Amount"))),
                                        React.createElement(table_1.TableBody, null, Array.isArray(estimate === null || estimate === void 0 ? void 0 : estimate.items) && estimate.items.map(function (item, i) { return (React.createElement(table_1.TableRow, { key: item.id || "est-item-" + i },
                                            React.createElement(table_1.TableCell, null, (item === null || item === void 0 ? void 0 : item.description) || "N/A"),
                                            React.createElement(table_1.TableCell, { className: "text-right" }, (item === null || item === void 0 ? void 0 : item.quantity) || 0),
                                            React.createElement(table_1.TableCell, { className: "text-right" }, fmtAmt(((item === null || item === void 0 ? void 0 : item.unitPrice) || 0) / 100)),
                                            React.createElement(table_1.TableCell, { className: "text-right" }, fmtAmt(((item === null || item === void 0 ? void 0 : item.total) || 0) / 100)))); })))))),
                        React.createElement(tabs_1.TabsContent, { value: "notes" },
                            (estimate === null || estimate === void 0 ? void 0 : estimate.notes) && (React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                        React.createElement(lucide_react_2.FileText, { className: "h-5 w-5" }),
                                        "Notes")),
                                React.createElement(card_1.CardContent, null,
                                    React.createElement(RichTextEditor_1.RichTextDisplay, { html: estimate.notes })))),
                            ((_e = estimate) === null || _e === void 0 ? void 0 : _e.termsAndConditions) && (React.createElement(card_1.Card, { className: "mt-4" },
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                        React.createElement(lucide_react_2.Scale, { className: "h-5 w-5" }),
                                        "Terms & Conditions")),
                                React.createElement(card_1.CardContent, null,
                                    React.createElement(RichTextEditor_1.RichTextDisplay, { html: estimate.termsAndConditions })))),
                            !(estimate === null || estimate === void 0 ? void 0 : estimate.notes) && !((_f = estimate) === null || _f === void 0 ? void 0 : _f.termsAndConditions) && (React.createElement("p", { className: "text-muted-foreground text-sm py-4" }, "No notes or terms added.")))))))));
}
exports["default"] = EstimateDetails;
