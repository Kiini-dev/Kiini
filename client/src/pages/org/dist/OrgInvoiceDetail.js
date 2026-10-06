"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgBreadcrumb_1 = require("@/components/OrgBreadcrumb");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var skeleton_1 = require("@/components/ui/skeleton");
var table_1 = require("@/components/ui/table");
var trpc_1 = require("@/lib/trpc");
var useOrgPermission_1 = require("@/hooks/useOrgPermission");
var lucide_react_1 = require("lucide-react");
function StatusBadge(_a) {
    var _b;
    var status = _a.status;
    if (!status)
        return null;
    var map = {
        draft: "bg-slate-500/20 text-slate-300 border-slate-500/30",
        sent: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        paid: "bg-green-500/20 text-green-300 border-green-500/30",
        overdue: "bg-red-500/20 text-red-300 border-red-500/30",
        cancelled: "bg-gray-500/20 text-gray-300 border-gray-500/30"
    };
    return (react_1["default"].createElement("span", { className: "inline-flex px-2 py-0.5 rounded text-xs font-medium border capitalize " + ((_b = map[status]) !== null && _b !== void 0 ? _b : "bg-white/10 text-white/60 border-white/20") }, status));
}
function OrgInvoiceDetail() {
    var _a, _b;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var invoiceId = params.id;
    var _c = wouter_1.useLocation(), setLocation = _c[1];
    var checkPermission = useOrgPermission_1.useOrgPermission().checkPermission;
    var _d = trpc_1.trpc.invoices.getWithItems.useQuery(invoiceId, {
        enabled: !!invoiceId && checkPermission("invoicing:invoices:view")
    }), invoice = _d.data, isLoading = _d.isLoading;
    var client = trpc_1.trpc.clients.get.useQuery((invoice === null || invoice === void 0 ? void 0 : invoice.clientId) || "", {
        enabled: !!(invoice === null || invoice === void 0 ? void 0 : invoice.clientId) && checkPermission("crm:clients:view")
    }).data;
    var total = ((_a = invoice === null || invoice === void 0 ? void 0 : invoice.items) === null || _a === void 0 ? void 0 : _a.reduce(function (sum, item) { return sum + (item.quantity * item.unitPrice); }, 0)) || 0;
    if (isLoading) {
        return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Invoice Details", showOrgInfo: false },
            react_1["default"].createElement("div", { className: "space-y-6" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                    react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-6 w-48 bg-white/5" }),
                    react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-8 w-24 bg-white/5" })),
                react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-6 w-32 bg-white/5" })),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "space-y-4" },
                            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-4 w-full bg-white/5" }),
                            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-4 w-3/4 bg-white/5" }),
                            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-4 w-1/2 bg-white/5" })))))));
    }
    if (!invoice) {
        return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Invoice Not Found", showOrgInfo: false },
            react_1["default"].createElement("div", { className: "text-center py-16" },
                react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-12 w-12 text-white/20 mx-auto mb-4" }),
                react_1["default"].createElement("p", { className: "text-white/40" }, "Invoice not found or access denied."),
                react_1["default"].createElement(button_1.Button, { variant: "ghost", className: "mt-4 text-white/50 hover:text-white", onClick: function () { return setLocation("/org/" + slug + "/invoices"); } }, "Back to Invoices"))));
    }
    return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Invoice " + (invoice.invoiceNumber || invoice.id), showOrgInfo: false },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [
                            { label: "Invoices", href: "/org/" + slug + "/invoices" },
                            { label: invoice.invoiceNumber || "Invoice " + invoice.id.slice(-8) },
                        ] })),
                react_1["default"].createElement("div", { className: "flex gap-2" },
                    checkPermission("invoicing:invoices:edit") && (react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "text-white border-white/20 hover:bg-white/5", onClick: function () { return setLocation("/org/" + slug + "/invoices/" + invoice.id + "/edit"); } },
                        react_1["default"].createElement(lucide_react_1.Edit2, { className: "h-4 w-4 mr-1" }),
                        " Edit")),
                    react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "text-white border-white/20 hover:bg-white/5", onClick: function () { return setLocation("/org/" + slug + "/invoices"); } },
                        react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-1" }),
                        " Back"))),
            react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6" },
                react_1["default"].createElement("div", { className: "lg:col-span-2 space-y-6" },
                    react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                                react_1["default"].createElement(card_1.CardTitle, { className: "text-white flex items-center gap-2" },
                                    react_1["default"].createElement(lucide_react_1.FileText, { className: "h-5 w-5" }),
                                    "Invoice Details"),
                                react_1["default"].createElement(StatusBadge, { status: invoice.status }))),
                        react_1["default"].createElement(card_1.CardContent, null,
                            react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-4" },
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "text-sm text-white/60" }, "Invoice Number"),
                                    react_1["default"].createElement("p", { className: "text-white font-medium" }, invoice.invoiceNumber || "INV-" + invoice.id.slice(-8))),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "text-sm text-white/60" }, "Issue Date"),
                                    react_1["default"].createElement("p", { className: "text-white" }, invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : "—")),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "text-sm text-white/60" }, "Due Date"),
                                    react_1["default"].createElement("p", { className: "text-white" }, invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "—")),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "text-sm text-white/60" }, "Total Amount"),
                                    react_1["default"].createElement("p", { className: "text-white font-semibold" },
                                        "KES ",
                                        total.toLocaleString()))),
                            invoice.notes && (react_1["default"].createElement("div", { className: "mt-4" },
                                react_1["default"].createElement("p", { className: "text-sm text-white/60 mb-1" }, "Notes"),
                                react_1["default"].createElement("p", { className: "text-white text-sm" }, invoice.notes))))),
                    react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-white" }, "Line Items")),
                        react_1["default"].createElement(card_1.CardContent, null,
                            react_1["default"].createElement(table_1.Table, null,
                                react_1["default"].createElement(table_1.TableHeader, null,
                                    react_1["default"].createElement(table_1.TableRow, { className: "border-white/10" },
                                        react_1["default"].createElement(table_1.TableHead, { className: "text-white/60" }, "Description"),
                                        react_1["default"].createElement(table_1.TableHead, { className: "text-white/60 text-right" }, "Qty"),
                                        react_1["default"].createElement(table_1.TableHead, { className: "text-white/60 text-right" }, "Unit Price"),
                                        react_1["default"].createElement(table_1.TableHead, { className: "text-white/60 text-right" }, "Total"))),
                                react_1["default"].createElement(table_1.TableBody, null, (_b = invoice.items) === null || _b === void 0 ? void 0 :
                                    _b.map(function (item) { return (react_1["default"].createElement(table_1.TableRow, { key: item.id, className: "border-white/10" },
                                        react_1["default"].createElement(table_1.TableCell, { className: "text-white" }, item.description),
                                        react_1["default"].createElement(table_1.TableCell, { className: "text-white text-right" }, item.quantity),
                                        react_1["default"].createElement(table_1.TableCell, { className: "text-white text-right" },
                                            "KES ",
                                            item.unitPrice.toLocaleString()),
                                        react_1["default"].createElement(table_1.TableCell, { className: "text-white text-right font-medium" },
                                            "KES ",
                                            (item.quantity * item.unitPrice).toLocaleString()))); }),
                                    react_1["default"].createElement(table_1.TableRow, { className: "border-white/10" },
                                        react_1["default"].createElement(table_1.TableCell, { colSpan: 3, className: "text-white font-semibold text-right" }, "Total"),
                                        react_1["default"].createElement(table_1.TableCell, { className: "text-white font-bold text-right" },
                                            "KES ",
                                            total.toLocaleString()))))))),
                react_1["default"].createElement("div", { className: "space-y-6" },
                    react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-white flex items-center gap-2" },
                                react_1["default"].createElement(lucide_react_1.Building2, { className: "h-5 w-5" }),
                                "Client Information")),
                        react_1["default"].createElement(card_1.CardContent, null, client ? (react_1["default"].createElement("div", { className: "space-y-3" },
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("p", { className: "text-sm text-white/60" }, "Name"),
                                react_1["default"].createElement("p", { className: "text-white font-medium" }, client.name)),
                            client.email && (react_1["default"].createElement("div", null,
                                react_1["default"].createElement("p", { className: "text-sm text-white/60" }, "Email"),
                                react_1["default"].createElement("p", { className: "text-white" }, client.email))),
                            client.phone && (react_1["default"].createElement("div", null,
                                react_1["default"].createElement("p", { className: "text-sm text-white/60" }, "Phone"),
                                react_1["default"].createElement("p", { className: "text-white" }, client.phone))),
                            client.company && (react_1["default"].createElement("div", null,
                                react_1["default"].createElement("p", { className: "text-sm text-white/60" }, "Company"),
                                react_1["default"].createElement("p", { className: "text-white" }, client.company))))) : (react_1["default"].createElement("p", { className: "text-white/60" }, "Client information not available")))))))));
}
exports["default"] = OrgInvoiceDetail;
