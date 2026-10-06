"use strict";
exports.__esModule = true;
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var table_1 = require("@/components/ui/table");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var spinner_1 = require("@/components/ui/spinner");
var currency_1 = require("@/lib/currency");
var documentTemplate_1 = require("@/lib/documentTemplate");
function CreditNoteDetails() {
    var id = wouter_1.useParams().id;
    var formatMoney = currency_1.useCurrency().format;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = trpc_1.trpc.creditNotes.get.useQuery({ id: id || "" }, { enabled: !!id }), creditNote = _b.data, isLoading = _b.isLoading;
    var companyInfo = trpc_1.trpc.settings.getCompanyInfo.useQuery().data;
    var _c = trpc_1.trpc.documentTemplates.list.useQuery({ type: "credit_note" }).data, docTemplatesList = _c === void 0 ? [] : _c;
    var defaultDocTemplate = docTemplatesList.find(function (t) { return t.isDefault; }) || docTemplatesList[0] || null;
    var deleteMutation = trpc_1.trpc.creditNotes["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Credit note deleted");
            navigate("/credit-notes");
        },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var handlePrint = function () {
        var printWindow = window.open('', '_blank');
        if (!printWindow)
            return;
        var cn = creditNote;
        var html = documentTemplate_1.generateDocumentHTML({
            documentType: 'credit_note',
            documentNumber: (cn === null || cn === void 0 ? void 0 : cn.creditNoteNumber) || 'CN',
            documentDate: (cn === null || cn === void 0 ? void 0 : cn.issueDate) ? new Date(cn.issueDate).toLocaleDateString() : new Date().toLocaleDateString(),
            companyName: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyName,
            companyLogo: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyLogo,
            companyPhone: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyPhone,
            companyEmail: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyEmail,
            companyWebsite: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyWebsite,
            companyAddress: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyAddress,
            clientName: (cn === null || cn === void 0 ? void 0 : cn.clientName) || '',
            clientEmail: (cn === null || cn === void 0 ? void 0 : cn.clientEmail) || '',
            clientPhone: '',
            clientAddress: '',
            items: Array.isArray(cn === null || cn === void 0 ? void 0 : cn.items) ? cn.items.map(function (item) { return ({
                description: item.description || '',
                quantity: item.quantity || 1,
                unitPrice: (item.rate || item.unitPrice || 0) / 100,
                total: (item.amount || item.total || 0) / 100
            }); }) : [],
            subtotal: ((cn === null || cn === void 0 ? void 0 : cn.subtotal) || 0) / 100,
            tax: ((cn === null || cn === void 0 ? void 0 : cn.taxAmount) || 0) / 100,
            total: ((cn === null || cn === void 0 ? void 0 : cn.total) || 0) / 100,
            notes: (cn === null || cn === void 0 ? void 0 : cn.notes) || '',
            customTemplateHtml: (defaultDocTemplate === null || defaultDocTemplate === void 0 ? void 0 : defaultDocTemplate.content) || undefined
        });
        printWindow.document.write(html);
        printWindow.document.close();
    };
    if (isLoading) {
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, null));
    }
    if (!creditNote) {
        return (React.createElement("div", { className: "flex flex-col items-center justify-center h-96 gap-4" },
            React.createElement("p", { className: "text-muted-foreground" }, "Credit note not found"),
            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return navigate("/credit-notes"); } }, "Back to Credit Notes")));
    }
    var cn = creditNote;
    var statusColor = function (status) {
        return status === "draft" ? "secondary" : status === "approved" ? "default" : status === "applied" ? "outline" : "destructive";
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: cn.creditNoteNumber || "Credit Note", icon: React.createElement(lucide_react_1.FileText, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Accounting", href: "/accounting" },
            { label: "Credit Notes", href: "/credit-notes" },
            { label: cn.creditNoteNumber || "Details" },
        ], actions: React.createElement("div", { className: "flex gap-2" },
            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return navigate("/credit-notes"); } },
                React.createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-2" }),
                " Back"),
            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return navigate("/credit-notes/" + id + "/edit"); } },
                React.createElement(lucide_react_1.Edit, { className: "h-4 w-4 mr-2" }),
                " Edit"),
            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handlePrint },
                React.createElement(lucide_react_1.Printer, { className: "h-4 w-4 mr-2" }),
                " Print"),
            React.createElement(button_1.Button, { variant: "destructive", size: "sm", onClick: function () {
                    if (confirm("Delete this credit note?"))
                        deleteMutation.mutate({ id: id });
                } },
                React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4 mr-2" }),
                " Delete")) },
        React.createElement("div", { className: "max-w-4xl space-y-6" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement("div", { className: "flex justify-between items-center" },
                        React.createElement(card_1.CardTitle, null, "Credit Note Details"),
                        React.createElement(badge_1.Badge, { variant: statusColor(cn.status) }, cn.status))),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Credit Note Number"),
                            React.createElement("p", { className: "font-semibold" }, cn.creditNoteNumber)),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Issue Date"),
                            React.createElement("p", { className: "font-semibold" }, cn.issueDate ? new Date(cn.issueDate).toLocaleDateString() : "—")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Client"),
                            React.createElement("p", { className: "font-semibold" }, cn.clientName)),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Reason"),
                            React.createElement("p", { className: "font-semibold capitalize" }, (cn.reason || "").replace(/-/g, " "))),
                        cn.invoiceId && (React.createElement("div", null,
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Related Invoice"),
                            React.createElement("p", { className: "font-semibold" }, cn.invoiceId)))))),
            cn.items && cn.items.length > 0 && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Line Items")),
                React.createElement(card_1.CardContent, null,
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Description"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Qty"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Rate"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Tax"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Amount"))),
                        React.createElement(table_1.TableBody, null, cn.items.map(function (item, idx) { return (React.createElement(table_1.TableRow, { key: idx },
                            React.createElement(table_1.TableCell, null, item.description),
                            React.createElement(table_1.TableCell, { className: "text-right" }, item.quantity),
                            React.createElement(table_1.TableCell, { className: "text-right" }, formatMoney(Number(item.rate))),
                            React.createElement(table_1.TableCell, { className: "text-right" }, formatMoney(Number(item.taxAmount))),
                            React.createElement(table_1.TableCell, { className: "text-right font-medium" }, formatMoney(Number(item.amount))))); }))),
                    React.createElement(separator_1.Separator, { className: "my-4" }),
                    React.createElement("div", { className: "space-y-1 text-right" },
                        React.createElement("p", { className: "text-sm text-muted-foreground" },
                            "Subtotal: ",
                            formatMoney(Number(cn.subtotal))),
                        cn.taxAmount > 0 && React.createElement("p", { className: "text-sm text-muted-foreground" },
                            "Tax: ",
                            formatMoney(Number(cn.taxAmount))),
                        React.createElement("p", { className: "text-lg font-bold" },
                            "Total: ",
                            formatMoney(Number(cn.total))))))),
            cn.notes && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Notes")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("p", { className: "text-sm text-muted-foreground whitespace-pre-wrap" }, cn.notes)))))));
}
exports["default"] = CreditNoteDetails;
