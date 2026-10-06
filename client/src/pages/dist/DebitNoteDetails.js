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
function DebitNoteDetails() {
    var id = wouter_1.useParams().id;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var formatCurrency = currency_1.useCurrency().format;
    var _b = trpc_1.trpc.debitNotes.get.useQuery({ id: id || "" }, { enabled: !!id }), debitNote = _b.data, isLoading = _b.isLoading;
    var companyInfo = trpc_1.trpc.settings.getCompanyInfo.useQuery().data;
    var _c = trpc_1.trpc.documentTemplates.list.useQuery({ type: "debit_note" }).data, docTemplatesList = _c === void 0 ? [] : _c;
    var defaultDocTemplate = docTemplatesList.find(function (t) { return t.isDefault; }) || docTemplatesList[0] || null;
    var deleteMutation = trpc_1.trpc.debitNotes["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Debit note deleted");
            navigate("/debit-notes");
        },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var handlePrint = function () {
        var printWindow = window.open('', '_blank');
        if (!printWindow)
            return;
        var dn = debitNote;
        var html = documentTemplate_1.generateDocumentHTML({
            documentType: 'debit_note',
            documentNumber: (dn === null || dn === void 0 ? void 0 : dn.debitNoteNumber) || 'DN',
            documentDate: (dn === null || dn === void 0 ? void 0 : dn.issueDate) ? new Date(dn.issueDate).toLocaleDateString() : new Date().toLocaleDateString(),
            companyName: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyName,
            companyLogo: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyLogo,
            companyPhone: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyPhone,
            companyEmail: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyEmail,
            companyWebsite: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyWebsite,
            companyAddress: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyAddress,
            clientName: (dn === null || dn === void 0 ? void 0 : dn.supplierName) || '',
            clientEmail: (dn === null || dn === void 0 ? void 0 : dn.supplierEmail) || '',
            clientPhone: '',
            clientAddress: '',
            items: Array.isArray(dn === null || dn === void 0 ? void 0 : dn.items) ? dn.items.map(function (item) { return ({
                description: item.description || '',
                quantity: item.quantity || 1,
                unitPrice: (item.unitPrice || item.rate || 0) / 100,
                total: (item.total || item.amount || 0) / 100
            }); }) : [],
            subtotal: ((dn === null || dn === void 0 ? void 0 : dn.subtotal) || (dn === null || dn === void 0 ? void 0 : dn.total) || 0) / 100,
            tax: ((dn === null || dn === void 0 ? void 0 : dn.taxAmount) || 0) / 100,
            total: ((dn === null || dn === void 0 ? void 0 : dn.total) || 0) / 100,
            notes: (dn === null || dn === void 0 ? void 0 : dn.notes) || '',
            customTemplateHtml: (defaultDocTemplate === null || defaultDocTemplate === void 0 ? void 0 : defaultDocTemplate.content) || undefined
        });
        printWindow.document.write(html);
        printWindow.document.close();
    };
    if (isLoading) {
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, null));
    }
    if (!debitNote) {
        return (React.createElement("div", { className: "flex flex-col items-center justify-center h-96 gap-4" },
            React.createElement("p", { className: "text-muted-foreground" }, "Debit note not found"),
            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return navigate("/debit-notes"); } }, "Back to Debit Notes")));
    }
    var dn = debitNote;
    var statusColor = function (status) {
        return status === "draft" ? "secondary" : status === "approved" ? "default" : "outline";
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: dn.debitNoteNumber || "Debit Note", icon: React.createElement(lucide_react_1.FileMinus, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Accounting", href: "/accounting" },
            { label: "Debit Notes", href: "/debit-notes" },
            { label: dn.debitNoteNumber || "Details" },
        ], actions: React.createElement("div", { className: "flex gap-2" },
            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return navigate("/debit-notes"); } },
                React.createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-2" }),
                " Back"),
            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return navigate("/debit-notes/" + id + "/edit"); } },
                React.createElement(lucide_react_1.Edit, { className: "h-4 w-4 mr-2" }),
                " Edit"),
            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handlePrint },
                React.createElement(lucide_react_1.Printer, { className: "h-4 w-4 mr-2" }),
                " Print"),
            React.createElement(button_1.Button, { variant: "destructive", size: "sm", onClick: function () {
                    if (confirm("Delete this debit note?"))
                        deleteMutation.mutate({ id: id });
                } },
                React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4 mr-2" }),
                " Delete")) },
        React.createElement("div", { className: "max-w-4xl space-y-6" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement("div", { className: "flex justify-between items-center" },
                        React.createElement(card_1.CardTitle, null, "Debit Note Details"),
                        React.createElement(badge_1.Badge, { variant: statusColor(dn.status) }, dn.status))),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Debit Note Number"),
                            React.createElement("p", { className: "font-semibold" }, dn.debitNoteNumber)),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Issue Date"),
                            React.createElement("p", { className: "font-semibold" }, dn.issueDate ? new Date(dn.issueDate).toLocaleDateString() : "—")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Supplier"),
                            React.createElement("p", { className: "font-semibold" }, dn.supplierName)),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Reason"),
                            React.createElement("p", { className: "font-semibold capitalize" }, (dn.reason || "").replace(/-/g, " ")))))),
            dn.items && dn.items.length > 0 && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Line Items")),
                React.createElement(card_1.CardContent, null,
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Description"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Qty"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Unit Price"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Total"))),
                        React.createElement(table_1.TableBody, null, dn.items.map(function (item, idx) { return (React.createElement(table_1.TableRow, { key: idx },
                            React.createElement(table_1.TableCell, null, item.description),
                            React.createElement(table_1.TableCell, { className: "text-right" }, item.quantity),
                            React.createElement(table_1.TableCell, { className: "text-right" }, formatCurrency(Number(item.unitPrice))),
                            React.createElement(table_1.TableCell, { className: "text-right font-medium" }, formatCurrency(Number(item.total))))); }))),
                    React.createElement(separator_1.Separator, { className: "my-4" }),
                    React.createElement("div", { className: "text-right text-lg font-bold" },
                        "Total: ",
                        formatCurrency(Number(dn.total)))))),
            dn.notes && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Notes")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("p", { className: "text-sm text-muted-foreground whitespace-pre-wrap" }, dn.notes)))))));
}
exports["default"] = DebitNoteDetails;
