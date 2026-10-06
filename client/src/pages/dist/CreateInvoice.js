"use strict";
exports.__esModule = true;
var ModuleLayout_1 = require("@/components/ModuleLayout");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var DocumentForm_1 = require("@/components/forms/DocumentForm");
var wouter_1 = require("wouter");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var useCompanyInfo_1 = require("@/hooks/useCompanyInfo");
var card_1 = require("@/components/ui/card");
var label_1 = require("@/components/ui/label");
var input_1 = require("@/components/ui/input");
var switch_1 = require("@/components/ui/switch");
var select_1 = require("@/components/ui/select");
function CreateInvoice() {
    // CALL ALL HOOKS UNCONDITIONALLY AT TOP LEVEL
    var _a = permissions_1.useRequireFeature("accounting:invoices:create"), allowed = _a.allowed, isLoading = _a.isLoading;
    var companyInfo = useCompanyInfo_1.useCompanyInfo();
    var bankData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "payment_bank" }).data;
    var mpesaData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "payment_mpesa" }).data;
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    var utils = trpc_1.trpc.useUtils();
    var _c = react_1.useState(""), invoiceNumber = _c[0], setInvoiceNumber = _c[1];
    var _d = react_1.useState(true), isLoadingNumber = _d[0], setIsLoadingNumber = _d[1];
    var getNextNumberMutation = trpc_1.trpc.settings.getNextDocumentNumber.useMutation();
    // Recurring invoice state
    var _e = react_1.useState(false), isRecurring = _e[0], setIsRecurring = _e[1];
    var _f = react_1.useState("monthly"), recurringFrequency = _f[0], setRecurringFrequency = _f[1];
    var _g = react_1.useState(new Date().toISOString().split("T")[0]), recurringStartDate = _g[0], setRecurringStartDate = _g[1];
    var _h = react_1.useState(""), recurringEndDate = _h[0], setRecurringEndDate = _h[1];
    var _j = react_1.useState(true), recurringNoEnd = _j[0], setRecurringNoEnd = _j[1];
    // Recurring invoice creation mutation
    var createRecurringMutation = trpc_1.trpc.communications.createRecurringInvoice.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Recurring schedule created!");
        },
        onError: function (e) { return sonner_1.toast.error("Failed to create recurring schedule: " + e.message); }
    });
    // Generate invoice number on component mount
    react_1.useEffect(function () {
        var isMounted = true;
        var generateNumber = function () {
            setIsLoadingNumber(true);
            getNextNumberMutation.mutate({ documentType: 'invoice' }, {
                onSuccess: function (result) {
                    if (isMounted)
                        setInvoiceNumber(result.documentNumber || "INV-" + String(Math.random() * 1000000 | 0).padStart(6, '0'));
                },
                onError: function () {
                    if (isMounted) {
                        console.error('Failed to generate invoice number');
                        setInvoiceNumber("INV-" + String(Math.random() * 1000000 | 0).padStart(6, '0'));
                    }
                },
                onSettled: function () {
                    if (isMounted)
                        setIsLoadingNumber(false);
                }
            });
        };
        generateNumber();
        return function () {
            isMounted = false;
        };
    }, []);
    var createInvoiceMutation = trpc_1.trpc.invoices.create.useMutation({
        onSuccess: function (data) {
            sonner_1.toast.success("Invoice created successfully!");
            utils.invoices.list.invalidate();
            // If recurring, create the recurring schedule
            if (isRecurring && (data === null || data === void 0 ? void 0 : data.id)) {
                createRecurringMutation.mutate({
                    baseInvoiceId: data.id,
                    frequency: recurringFrequency,
                    startDate: recurringStartDate,
                    endDate: recurringNoEnd ? undefined : recurringEndDate || undefined,
                    isActive: true
                });
            }
            setLocation("/invoices");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to create invoice: " + error.message);
        }
    });
    var handleSave = react_1.useCallback(function (data) {
        var _a;
        if (!data.documentNumber) {
            sonner_1.toast.error("Invoice number is required");
            return;
        }
        var subtotal = data.subtotal || 0;
        var taxAmount = data.vat || 0;
        var total = data.grandTotal || (subtotal + taxAmount);
        var invoiceData = {
            invoiceNumber: data.documentNumber,
            clientId: data.clientId || "guest_" + Date.now(),
            title: data.clientName ? "Invoice for " + data.clientName : undefined,
            issueDate: new Date(data.date),
            dueDate: data.dueDate ? new Date(data.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            subtotal: Math.round(subtotal * 100),
            taxAmount: Math.round(taxAmount * 100),
            discountAmount: 0,
            total: Math.round(total * 100),
            paidAmount: 0,
            status: (data.status || "draft"),
            notes: data.notes || "",
            terms: data.terms || "",
            lineItems: (_a = data.lineItems) === null || _a === void 0 ? void 0 : _a.map(function (item) { return ({
                itemType: 'custom',
                description: item.description,
                quantity: item.qty,
                unitPrice: Math.round(item.unitPrice * 100),
                taxRate: item.tax || 0,
                discountPercent: 0,
                total: Math.round(item.total * 100)
            }); })
        };
        createInvoiceMutation.mutate(invoiceData);
    }, [createInvoiceMutation]);
    var handleSend = react_1.useCallback(function (data) {
        var _a;
        if (!data.documentNumber) {
            sonner_1.toast.error("Invoice number is required");
            return;
        }
        if (!data.clientEmail) {
            sonner_1.toast.error("Client email is required to send invoice");
            return;
        }
        var subtotal = data.subtotal || 0;
        var taxAmount = data.vat || 0;
        var total = data.grandTotal || (subtotal + taxAmount);
        var invoiceData = {
            invoiceNumber: data.documentNumber,
            clientId: data.clientId || "guest_" + Date.now(),
            title: data.clientName ? "Invoice for " + data.clientName : undefined,
            issueDate: new Date(data.date),
            dueDate: data.dueDate ? new Date(data.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            subtotal: Math.round(subtotal * 100),
            taxAmount: Math.round(taxAmount * 100),
            discountAmount: 0,
            total: Math.round(total * 100),
            paidAmount: 0,
            status: "sent",
            notes: data.notes || "",
            terms: data.terms || "",
            lineItems: (_a = data.lineItems) === null || _a === void 0 ? void 0 : _a.map(function (item) { return ({
                itemType: 'custom',
                description: item.description,
                quantity: item.qty,
                unitPrice: Math.round(item.unitPrice * 100),
                taxRate: item.tax || 0,
                discountPercent: 0,
                total: Math.round(item.total * 100)
            }); })
        };
        createInvoiceMutation.mutate(invoiceData);
        sonner_1.toast.info("Invoice will be sent to " + data.clientEmail);
    }, [createInvoiceMutation]);
    var defaultTerms = "1. All prices are in Kenya shillings (KSHs)\n2. VAT is charged where applicable.\n3. Invoice is valid for 7 days from date of generation.\n4. Late invoices will attract a penalty or suspension of service.";
    var bankMap = {};
    if (Array.isArray(bankData))
        bankData.forEach(function (r) { var _a; if (r.key)
            bankMap[r.key] = (_a = r.value) !== null && _a !== void 0 ? _a : ''; });
    else if (bankData && typeof bankData === 'object')
        Object.assign(bankMap, bankData);
    var mpesaMap = {};
    if (Array.isArray(mpesaData))
        mpesaData.forEach(function (r) { var _a; if (r.key)
            mpesaMap[r.key] = (_a = r.value) !== null && _a !== void 0 ? _a : ''; });
    else if (mpesaData && typeof mpesaData === 'object')
        Object.assign(mpesaMap, mpesaData);
    var defaultPaymentDetails = [
        bankMap.bankName && "Bank: " + bankMap.bankName,
        bankMap.branch && "Branch: " + bankMap.branch,
        bankMap.accountNumber && "Acc.: " + bankMap.accountNumber,
        bankMap.accountName && "Acc. Name: " + bankMap.accountName,
        mpesaMap.paybillNumber && "\nor\n\nMpesa Paybill: " + mpesaMap.paybillNumber,
        mpesaMap.accountNumber && "Acc. Number: " + mpesaMap.accountNumber,
    ].filter(Boolean).join('\n') || 'Payment details not configured';
    var initialData = react_1.useMemo(function () { return ({
        documentNumber: invoiceNumber,
        terms: defaultTerms,
        paymentDetails: defaultPaymentDetails
    }); }, [invoiceNumber, defaultTerms, defaultPaymentDetails]);
    // NOW SAFE TO CHECK CONDITIONAL RETURNS (ALL HOOKS ALREADY CALLED)
    if (isLoading) {
        return (react_1["default"].createElement("div", { className: "flex items-center justify-center h-screen" },
            react_1["default"].createElement(spinner_1.Spinner, { className: "size-8" })));
    }
    if (!allowed) {
        return null;
    }
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Create Invoice", description: "Create a new invoice for a client", icon: react_1["default"].createElement(lucide_react_1.Plus, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Invoices", href: "/invoices" },
            { label: "Create" },
        ], backLink: { label: "Invoices", href: "/invoices" } },
        react_1["default"].createElement(card_1.Card, { className: "mb-6" },
            react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                    react_1["default"].createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.RefreshCw, { className: "w-4 h-4" }),
                        "Recurring Options"),
                    react_1["default"].createElement(switch_1.Switch, { checked: isRecurring, onCheckedChange: setIsRecurring })),
                react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Enable to automatically generate this invoice on a schedule")),
            isRecurring && (react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement(label_1.Label, null, "Frequency"),
                        react_1["default"].createElement(select_1.Select, { value: recurringFrequency, onValueChange: setRecurringFrequency },
                            react_1["default"].createElement(select_1.SelectTrigger, null,
                                react_1["default"].createElement(select_1.SelectValue, null)),
                            react_1["default"].createElement(select_1.SelectContent, null,
                                react_1["default"].createElement(select_1.SelectItem, { value: "weekly" }, "Weekly"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "bi-weekly" }, "Bi-Weekly"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "monthly" }, "Monthly"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "quarterly" }, "Quarterly"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "annually" }, "Annually")))),
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement(label_1.Label, null, "Start Date"),
                        react_1["default"].createElement(input_1.Input, { type: "date", value: recurringStartDate, onChange: function (e) { return setRecurringStartDate(e.target.value); } })),
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement(label_1.Label, { className: "flex items-center justify-between" },
                            "End Date",
                            react_1["default"].createElement("span", { className: "flex items-center gap-1.5 text-xs font-normal text-muted-foreground" },
                                react_1["default"].createElement(switch_1.Switch, { checked: recurringNoEnd, onCheckedChange: setRecurringNoEnd, className: "scale-75" }),
                                "No end date")),
                        react_1["default"].createElement(input_1.Input, { type: "date", value: recurringEndDate, onChange: function (e) { return setRecurringEndDate(e.target.value); }, disabled: recurringNoEnd, className: recurringNoEnd ? "opacity-50" : "" })))))),
        react_1["default"].createElement(DocumentForm_1["default"], { type: "invoice", mode: "create", initialData: initialData, onSave: handleSave, onSend: handleSend, isLoading: isLoadingNumber, isSaving: createInvoiceMutation.isPending })));
}
exports["default"] = CreateInvoice;
