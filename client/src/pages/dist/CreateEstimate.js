"use strict";
exports.__esModule = true;
var ModuleLayout_1 = require("@/components/ModuleLayout");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var DocumentForm_1 = require("@/components/forms/DocumentForm");
var wouter_1 = require("wouter");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var useCompanyInfo_1 = require("@/hooks/useCompanyInfo");
function CreateEstimate() {
    var companyInfo = useCompanyInfo_1.useCompanyInfo();
    var bankData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "payment_bank" }).data;
    var mpesaData = trpc_1.trpc.settings.getByCategory.useQuery({ category: "payment_mpesa" }).data;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var utils = trpc_1.trpc.useUtils();
    var _b = react_1.useState(""), estimateNumber = _b[0], setEstimateNumber = _b[1];
    var _c = react_1.useState(true), isLoadingNumber = _c[0], setIsLoadingNumber = _c[1];
    var getNextNumberMutation = trpc_1.trpc.settings.getNextDocumentNumber.useMutation();
    // Generate estimate number on component mount
    react_1.useEffect(function () {
        var isMounted = true;
        var generateNumber = function () {
            setIsLoadingNumber(true);
            getNextNumberMutation.mutate({ documentType: 'estimate' }, {
                onSuccess: function (result) {
                    if (isMounted)
                        setEstimateNumber(result.documentNumber || "EST-" + String(Math.random() * 1000000 | 0).padStart(6, '0'));
                },
                onError: function () {
                    if (isMounted) {
                        console.error('Failed to generate estimate number');
                        setEstimateNumber("EST-" + String(Math.random() * 1000000 | 0).padStart(6, '0'));
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
    var createEstimateMutation = trpc_1.trpc.estimates.create.useMutation({
        onSuccess: function (data) {
            sonner_1.toast.success("Estimate created successfully!");
            utils.estimates.list.invalidate();
            setLocation("/estimates");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to create estimate: " + error.message);
        }
    });
    var handleSave = react_1.useCallback(function (data) {
        var _a;
        if (!data.documentNumber) {
            sonner_1.toast.error("Estimate number is required");
            return;
        }
        var subtotal = data.subtotal || 0;
        var taxAmount = data.vat || 0;
        var total = data.grandTotal || (subtotal + taxAmount);
        var estimateData = {
            estimateNumber: data.documentNumber,
            clientId: data.clientId || "guest_" + Date.now(),
            title: data.clientName ? "Quotation for " + data.clientName : undefined,
            issueDate: new Date(data.date),
            expiryDate: data.dueDate ? new Date(data.dueDate) : new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
            subtotal: Math.round(subtotal * 100),
            taxAmount: Math.round(taxAmount * 100),
            discountAmount: 0,
            total: Math.round(total * 100),
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
        createEstimateMutation.mutate(estimateData);
    }, [createEstimateMutation]);
    var handleSend = react_1.useCallback(function (data) {
        var _a;
        if (!data.documentNumber) {
            sonner_1.toast.error("Estimate number is required");
            return;
        }
        if (!data.clientEmail) {
            sonner_1.toast.error("Client email is required to send estimate");
            return;
        }
        var subtotal = data.subtotal || 0;
        var taxAmount = data.vat || 0;
        var total = data.grandTotal || (subtotal + taxAmount);
        var estimateData = {
            estimateNumber: data.documentNumber,
            clientId: data.clientId || "guest_" + Date.now(),
            title: data.clientName ? "Quotation for " + data.clientName : undefined,
            issueDate: new Date(data.date),
            expiryDate: data.dueDate ? new Date(data.dueDate) : new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
            subtotal: Math.round(subtotal * 100),
            taxAmount: Math.round(taxAmount * 100),
            discountAmount: 0,
            total: Math.round(total * 100),
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
        createEstimateMutation.mutate(estimateData);
        sonner_1.toast.info("Estimate will be sent to " + data.clientEmail);
    }, [createEstimateMutation]);
    var defaultTerms = "1. All prices are in Kenya shillings (KSHs)\n2. VAT is charged where applicable.\n3. Quotation is valid for 45 days from date of generation.\n4. Payment of 75% is expected before commencement of the project.";
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
        documentNumber: estimateNumber,
        terms: defaultTerms,
        paymentDetails: defaultPaymentDetails
    }); }, [estimateNumber, defaultTerms, defaultPaymentDetails]);
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Create Estimate", description: "Create a new estimate for a client", icon: react_1["default"].createElement(lucide_react_1.Plus, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Estimates", href: "/estimates" },
            { label: "Create" },
        ], backLink: { label: "Estimates", href: "/estimates" } },
        react_1["default"].createElement(DocumentForm_1["default"], { type: "estimate", mode: "create", initialData: initialData, onSave: handleSave, onSend: handleSend, isLoading: isLoadingNumber, isSaving: createEstimateMutation.isPending })));
}
exports["default"] = CreateEstimate;
