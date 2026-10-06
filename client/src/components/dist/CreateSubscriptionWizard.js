"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.CreateSubscriptionWizard = void 0;
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var separator_1 = require("@/components/ui/separator");
var switch_1 = require("@/components/ui/switch");
var select_1 = require("@/components/ui/select");
var dialog_1 = require("@/components/ui/dialog");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var EMPTY_FORM = {
    clientId: "",
    planName: "",
    planDescription: "",
    frequency: "monthly",
    amountPerCycle: "",
    currency: "KES",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    trialDays: "",
    autoRenew: true,
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    contactRole: "",
    billingStreet: "",
    billingCity: "",
    billingCountry: "",
    billingPostalCode: "",
    paymentMethod: "bank_transfer",
    paymentReference: "",
    templateInvoiceId: "",
    noteToInvoice: "",
    generateDaysBefore: "3",
    taxRate: "16"
};
// ─── Step definitions ─────────────────────────────────────────────────────────
var STEPS = [
    { id: 0, label: "Client & Plan", icon: lucide_react_1.Building2 },
    { id: 1, label: "Billing Cycle", icon: lucide_react_1.CalendarClock },
    { id: 2, label: "Contact Person", icon: lucide_react_1.User },
    { id: 3, label: "Billing Address", icon: lucide_react_1.MapPin },
    { id: 4, label: "Invoice Settings", icon: lucide_react_1.FileText },
    { id: 5, label: "Review & Confirm", icon: lucide_react_1.CheckCircle2 },
];
// ─── Helpers ──────────────────────────────────────────────────────────────────
var FREQUENCY_LABELS = {
    weekly: "Weekly",
    biweekly: "Bi-weekly",
    monthly: "Monthly",
    quarterly: "Quarterly",
    annually: "Annually"
};
var PAYMENT_METHODS = [
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "mpesa", label: "M-Pesa" },
    { value: "credit_card", label: "Credit / Debit Card" },
    { value: "cheque", label: "Cheque" },
    { value: "cash", label: "Cash" },
    { value: "paypal", label: "PayPal" },
    { value: "other", label: "Other" },
];
// ─── Step components ──────────────────────────────────────────────────────────
function StepClientPlan(_a) {
    var form = _a.form, onChange = _a.onChange, clients = _a.clients;
    return (React.createElement("div", { className: "space-y-5" },
        React.createElement("div", { className: "space-y-2" },
            React.createElement(label_1.Label, null, "Client *"),
            React.createElement(select_1.Select, { value: form.clientId, onValueChange: function (v) { return onChange({ clientId: v }); } },
                React.createElement(select_1.SelectTrigger, null,
                    React.createElement(select_1.SelectValue, { placeholder: "Select a client" })),
                React.createElement(select_1.SelectContent, null, clients.map(function (c) { return (React.createElement(select_1.SelectItem, { key: c.id, value: c.id }, c.companyName || c.name || c.businessName)); })))),
        React.createElement("div", { className: "space-y-2" },
            React.createElement(label_1.Label, null, "Plan / Product Name *"),
            React.createElement(input_1.Input, { value: form.planName, onChange: function (e) { return onChange({ planName: e.target.value }); }, placeholder: "e.g. Professional Plan, Monthly Hosting, SaaS License" })),
        React.createElement("div", { className: "space-y-2" },
            React.createElement(label_1.Label, null, "Plan Description"),
            React.createElement(textarea_1.Textarea, { value: form.planDescription, onChange: function (e) { return onChange({ planDescription: e.target.value }); }, placeholder: "Describe what is included in this subscription plan...", rows: 3 }))));
}
function StepBillingCycle(_a) {
    var form = _a.form, onChange = _a.onChange;
    return (React.createElement("div", { className: "space-y-5" },
        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
            React.createElement("div", { className: "space-y-2" },
                React.createElement(label_1.Label, null, "Billing Frequency *"),
                React.createElement(select_1.Select, { value: form.frequency, onValueChange: function (v) { return onChange({ frequency: v }); } },
                    React.createElement(select_1.SelectTrigger, null,
                        React.createElement(select_1.SelectValue, null)),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "weekly" }, "Weekly"),
                        React.createElement(select_1.SelectItem, { value: "biweekly" }, "Bi-weekly"),
                        React.createElement(select_1.SelectItem, { value: "monthly" }, "Monthly"),
                        React.createElement(select_1.SelectItem, { value: "quarterly" }, "Quarterly"),
                        React.createElement(select_1.SelectItem, { value: "annually" }, "Annually")))),
            React.createElement("div", { className: "space-y-2" },
                React.createElement(label_1.Label, null, "Currency"),
                React.createElement(select_1.Select, { value: form.currency, onValueChange: function (v) { return onChange({ currency: v }); } },
                    React.createElement(select_1.SelectTrigger, null,
                        React.createElement(select_1.SelectValue, null)),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "KES" }, "KES \u2014 Kenyan Shilling"),
                        React.createElement(select_1.SelectItem, { value: "USD" }, "USD \u2014 US Dollar"),
                        React.createElement(select_1.SelectItem, { value: "EUR" }, "EUR \u2014 Euro"),
                        React.createElement(select_1.SelectItem, { value: "GBP" }, "GBP \u2014 British Pound"),
                        React.createElement(select_1.SelectItem, { value: "TZS" }, "TZS \u2014 Tanzanian Shilling"),
                        React.createElement(select_1.SelectItem, { value: "UGX" }, "UGX \u2014 Ugandan Shilling"))))),
        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
            React.createElement("div", { className: "space-y-2" },
                React.createElement(label_1.Label, null,
                    "Amount per Cycle (",
                    form.currency,
                    ") *"),
                React.createElement(input_1.Input, { type: "number", min: "0", step: "0.01", value: form.amountPerCycle, onChange: function (e) { return onChange({ amountPerCycle: e.target.value }); }, placeholder: "0.00" })),
            React.createElement("div", { className: "space-y-2" },
                React.createElement(label_1.Label, null, "Tax / VAT Rate (%)"),
                React.createElement(input_1.Input, { type: "number", min: "0", max: "100", step: "0.1", value: form.taxRate, onChange: function (e) { return onChange({ taxRate: e.target.value }); }, placeholder: "16" }))),
        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
            React.createElement("div", { className: "space-y-2" },
                React.createElement(label_1.Label, null, "Start Date *"),
                React.createElement(input_1.Input, { type: "date", value: form.startDate, onChange: function (e) { return onChange({ startDate: e.target.value }); } })),
            React.createElement("div", { className: "space-y-2" },
                React.createElement(label_1.Label, null,
                    "End Date ",
                    React.createElement("span", { className: "text-muted-foreground text-xs" }, "(leave blank for open-ended)")),
                React.createElement(input_1.Input, { type: "date", value: form.endDate, onChange: function (e) { return onChange({ endDate: e.target.value }); } }))),
        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
            React.createElement("div", { className: "space-y-2" },
                React.createElement(label_1.Label, null, "Trial Period (days)"),
                React.createElement(input_1.Input, { type: "number", min: "0", value: form.trialDays, onChange: function (e) { return onChange({ trialDays: e.target.value }); }, placeholder: "0 \u2014 no trial" })),
            React.createElement("div", { className: "space-y-2 pt-1" },
                React.createElement(label_1.Label, { className: "mb-3 block" }, "Auto-Renew"),
                React.createElement("div", { className: "flex items-center gap-3" },
                    React.createElement(switch_1.Switch, { checked: form.autoRenew, onCheckedChange: function (v) { return onChange({ autoRenew: v }); } }),
                    React.createElement("span", { className: "text-sm text-muted-foreground" }, form.autoRenew ? "Automatically renews on due date" : "Manual renewal required"))))));
}
function StepContactPerson(_a) {
    var form = _a.form, onChange = _a.onChange, clients = _a.clients;
    // Pre-fill from selected client
    var selectedClient = clients.find(function (c) { return c.id === form.clientId; });
    react_1.useEffect(function () {
        if (selectedClient && !form.contactName) {
            onChange({
                contactName: selectedClient.contactPerson || selectedClient.contactName || "",
                contactEmail: selectedClient.email || "",
                contactPhone: selectedClient.phone || ""
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedClient === null || selectedClient === void 0 ? void 0 : selectedClient.id]);
    return (React.createElement("div", { className: "space-y-5" },
        selectedClient && (React.createElement("div", { className: "bg-muted/50 rounded-lg p-3 text-sm flex items-start gap-2" },
            React.createElement(lucide_react_1.Building2, { className: "h-4 w-4 mt-0.5 text-muted-foreground shrink-0" }),
            React.createElement("div", null,
                React.createElement("p", { className: "font-medium" }, selectedClient.companyName || selectedClient.name),
                React.createElement("p", { className: "text-muted-foreground text-xs mt-0.5" }, "Contact details pre-filled from client record. You may override below.")))),
        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
            React.createElement("div", { className: "space-y-2" },
                React.createElement(label_1.Label, null, "Contact Full Name *"),
                React.createElement(input_1.Input, { value: form.contactName, onChange: function (e) { return onChange({ contactName: e.target.value }); }, placeholder: "Jane Doe" })),
            React.createElement("div", { className: "space-y-2" },
                React.createElement(label_1.Label, null, "Role / Title"),
                React.createElement(input_1.Input, { value: form.contactRole, onChange: function (e) { return onChange({ contactRole: e.target.value }); }, placeholder: "e.g. Procurement Manager, CEO" }))),
        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
            React.createElement("div", { className: "space-y-2" },
                React.createElement(label_1.Label, null, "Email Address *"),
                React.createElement(input_1.Input, { type: "email", value: form.contactEmail, onChange: function (e) { return onChange({ contactEmail: e.target.value }); }, placeholder: "jane@company.com" })),
            React.createElement("div", { className: "space-y-2" },
                React.createElement(label_1.Label, null, "Phone Number"),
                React.createElement(input_1.Input, { type: "tel", value: form.contactPhone, onChange: function (e) { return onChange({ contactPhone: e.target.value }); }, placeholder: "+254 700 000 000" })))));
}
function StepBillingAddress(_a) {
    var form = _a.form, onChange = _a.onChange, clients = _a.clients;
    var selectedClient = clients.find(function (c) { return c.id === form.clientId; });
    var fillFromClient = function () {
        if (!selectedClient)
            return;
        onChange({
            billingStreet: selectedClient.address || "",
            billingCity: selectedClient.city || "",
            billingCountry: selectedClient.country || "",
            billingPostalCode: selectedClient.postalCode || ""
        });
    };
    return (React.createElement("div", { className: "space-y-5" },
        selectedClient && (React.createElement(button_1.Button, { type: "button", variant: "outline", size: "sm", onClick: fillFromClient, className: "gap-2" },
            React.createElement(lucide_react_1.Building2, { className: "h-4 w-4" }),
            "Copy from client record")),
        React.createElement("div", { className: "space-y-2" },
            React.createElement(label_1.Label, null, "Street / Physical Address"),
            React.createElement(input_1.Input, { value: form.billingStreet, onChange: function (e) { return onChange({ billingStreet: e.target.value }); }, placeholder: "Street address, building, suite/apartment" })),
        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
            React.createElement("div", { className: "space-y-2" },
                React.createElement(label_1.Label, null, "City"),
                React.createElement(input_1.Input, { value: form.billingCity, onChange: function (e) { return onChange({ billingCity: e.target.value }); }, placeholder: "Nairobi" })),
            React.createElement("div", { className: "space-y-2" },
                React.createElement(label_1.Label, null, "Postal / ZIP Code"),
                React.createElement(input_1.Input, { value: form.billingPostalCode, onChange: function (e) { return onChange({ billingPostalCode: e.target.value }); }, placeholder: "00100" }))),
        React.createElement("div", { className: "space-y-2" },
            React.createElement(label_1.Label, null, "Country"),
            React.createElement(input_1.Input, { value: form.billingCountry, onChange: function (e) { return onChange({ billingCountry: e.target.value }); }, placeholder: "Kenya" })),
        React.createElement(separator_1.Separator, null),
        React.createElement("div", { className: "space-y-4" },
            React.createElement("h4", { className: "text-sm font-medium flex items-center gap-2" },
                React.createElement(lucide_react_1.CreditCard, { className: "h-4 w-4" }),
                "Payment Method"),
            React.createElement("div", { className: "space-y-2" },
                React.createElement(label_1.Label, null, "Preferred Payment Method *"),
                React.createElement(select_1.Select, { value: form.paymentMethod, onValueChange: function (v) { return onChange({ paymentMethod: v }); } },
                    React.createElement(select_1.SelectTrigger, null,
                        React.createElement(select_1.SelectValue, null)),
                    React.createElement(select_1.SelectContent, null, PAYMENT_METHODS.map(function (pm) { return (React.createElement(select_1.SelectItem, { key: pm.value, value: pm.value }, pm.label)); })))),
            React.createElement("div", { className: "space-y-2" },
                React.createElement(label_1.Label, null,
                    "Payment Reference / Account No.",
                    React.createElement("span", { className: "text-muted-foreground text-xs ml-1" }, "(optional)")),
                React.createElement(input_1.Input, { value: form.paymentReference, onChange: function (e) { return onChange({ paymentReference: e.target.value }); }, placeholder: "e.g. Bank account number, M-Pesa till, PayBill" })))));
}
function StepInvoiceSettings(_a) {
    var form = _a.form, onChange = _a.onChange, invoices = _a.invoices;
    // Filter invoices for selected client
    var clientInvoices = form.clientId
        ? invoices.filter(function (inv) { return inv.clientId === form.clientId; })
        : invoices;
    var displayInvoices = clientInvoices.length > 0 ? clientInvoices : invoices.slice(0, 50);
    return (React.createElement("div", { className: "space-y-5" },
        React.createElement("div", { className: "space-y-2" },
            React.createElement(label_1.Label, null, "Template Invoice *"),
            React.createElement("p", { className: "text-xs text-muted-foreground" }, "The recurring system will clone this invoice each billing cycle. Select an existing invoice that represents this subscription."),
            React.createElement(select_1.Select, { value: form.templateInvoiceId, onValueChange: function (v) { return onChange({ templateInvoiceId: v }); } },
                React.createElement(select_1.SelectTrigger, null,
                    React.createElement(select_1.SelectValue, { placeholder: "Select a template invoice" })),
                React.createElement(select_1.SelectContent, null, displayInvoices.map(function (inv) { return (React.createElement(select_1.SelectItem, { key: inv.id, value: inv.id },
                    inv.invoiceNumber,
                    " \u2014 ",
                    inv.clientName || "Client",
                    inv.total ? " (" + inv.total + ")" : "")); }))),
            clientInvoices.length === 0 && form.clientId && (React.createElement("p", { className: "text-xs text-amber-600" }, "No invoices found for this client \u2014 showing all invoices."))),
        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
            React.createElement("div", { className: "space-y-2" },
                React.createElement(label_1.Label, null, "Generate Invoice X Days Before Renewal"),
                React.createElement(input_1.Input, { type: "number", min: "0", max: "30", value: form.generateDaysBefore, onChange: function (e) { return onChange({ generateDaysBefore: e.target.value }); }, placeholder: "3" })),
            React.createElement("div", { className: "space-y-2" },
                React.createElement(label_1.Label, null, "Tax Rate (%)"),
                React.createElement(input_1.Input, { type: "number", min: "0", max: "100", step: "0.1", value: form.taxRate, onChange: function (e) { return onChange({ taxRate: e.target.value }); }, placeholder: "16" }))),
        React.createElement("div", { className: "space-y-2" },
            React.createElement(label_1.Label, null, "Note to Invoice"),
            React.createElement(textarea_1.Textarea, { value: form.noteToInvoice, onChange: function (e) { return onChange({ noteToInvoice: e.target.value }); }, placeholder: "This note will appear on all generated invoices (e.g. payment instructions, terms)...", rows: 3 }))));
}
function ReviewRow(_a) {
    var label = _a.label, value = _a.value;
    if (!value)
        return null;
    return (React.createElement("div", { className: "flex justify-between gap-4 text-sm py-1" },
        React.createElement("span", { className: "text-muted-foreground shrink-0" }, label),
        React.createElement("span", { className: "font-medium text-right" }, value)));
}
function StepReview(_a) {
    var _b;
    var form = _a.form, clients = _a.clients, invoices = _a.invoices;
    var client = clients.find(function (c) { return c.id === form.clientId; });
    var invoice = invoices.find(function (i) { return i.id === form.templateInvoiceId; });
    var paymentMethod = ((_b = PAYMENT_METHODS.find(function (p) { return p.value === form.paymentMethod; })) === null || _b === void 0 ? void 0 : _b.label) || form.paymentMethod;
    var amount = form.amountPerCycle
        ? form.currency + " " + parseFloat(form.amountPerCycle).toLocaleString(undefined, { minimumFractionDigits: 2 })
        : undefined;
    var taxAmount = form.amountPerCycle && form.taxRate
        ? form.currency + " " + (parseFloat(form.amountPerCycle) * parseFloat(form.taxRate) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })
        : undefined;
    var billingAddress = [form.billingStreet, form.billingCity, form.billingPostalCode, form.billingCountry]
        .filter(Boolean)
        .join(", ");
    return (React.createElement("div", { className: "space-y-4" },
        React.createElement("div", null,
            React.createElement("h4", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5" },
                React.createElement(lucide_react_1.Building2, { className: "h-3.5 w-3.5" }),
                " Plan & Client"),
            React.createElement("div", { className: "bg-muted/40 rounded-lg px-4 py-2 space-y-0.5" },
                React.createElement(ReviewRow, { label: "Client", value: (client === null || client === void 0 ? void 0 : client.companyName) || (client === null || client === void 0 ? void 0 : client.name) || form.clientId }),
                React.createElement(ReviewRow, { label: "Plan Name", value: form.planName }),
                React.createElement(ReviewRow, { label: "Description", value: form.planDescription }))),
        React.createElement("div", null,
            React.createElement("h4", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5" },
                React.createElement(lucide_react_1.CalendarClock, { className: "h-3.5 w-3.5" }),
                " Billing Configuration"),
            React.createElement("div", { className: "bg-muted/40 rounded-lg px-4 py-2 space-y-0.5" },
                React.createElement(ReviewRow, { label: "Frequency", value: FREQUENCY_LABELS[form.frequency] }),
                React.createElement(ReviewRow, { label: "Amount per Cycle", value: amount }),
                React.createElement(ReviewRow, { label: "VAT/Tax", value: taxAmount ? taxAmount + " (" + form.taxRate + "%)" : undefined }),
                React.createElement(ReviewRow, { label: "Start Date", value: form.startDate }),
                React.createElement(ReviewRow, { label: "End Date", value: form.endDate || "Open-ended" }),
                React.createElement(ReviewRow, { label: "Trial Period", value: form.trialDays ? form.trialDays + " days" : "None" }),
                React.createElement(ReviewRow, { label: "Auto-Renew", value: form.autoRenew ? "Yes" : "No" }))),
        React.createElement("div", null,
            React.createElement("h4", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5" },
                React.createElement(lucide_react_1.User, { className: "h-3.5 w-3.5" }),
                " Contact Person"),
            React.createElement("div", { className: "bg-muted/40 rounded-lg px-4 py-2 space-y-0.5" },
                React.createElement(ReviewRow, { label: "Name", value: form.contactName }),
                React.createElement(ReviewRow, { label: "Role", value: form.contactRole }),
                React.createElement(ReviewRow, { label: "Email", value: form.contactEmail }),
                React.createElement(ReviewRow, { label: "Phone", value: form.contactPhone }))),
        React.createElement("div", null,
            React.createElement("h4", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5" },
                React.createElement(lucide_react_1.CreditCard, { className: "h-3.5 w-3.5" }),
                " Payment & Billing Address"),
            React.createElement("div", { className: "bg-muted/40 rounded-lg px-4 py-2 space-y-0.5" },
                React.createElement(ReviewRow, { label: "Payment Method", value: paymentMethod }),
                React.createElement(ReviewRow, { label: "Payment Reference", value: form.paymentReference }),
                React.createElement(ReviewRow, { label: "Billing Address", value: billingAddress || undefined }))),
        React.createElement("div", null,
            React.createElement("h4", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5" },
                React.createElement(lucide_react_1.FileText, { className: "h-3.5 w-3.5" }),
                " Invoice Settings"),
            React.createElement("div", { className: "bg-muted/40 rounded-lg px-4 py-2 space-y-0.5" },
                React.createElement(ReviewRow, { label: "Template Invoice", value: invoice ? invoice.invoiceNumber + " (" + (invoice.clientName || "") + ")" : form.templateInvoiceId }),
                React.createElement(ReviewRow, { label: "Generate Days Before", value: form.generateDaysBefore ? form.generateDaysBefore + " day(s)" : undefined }),
                React.createElement(ReviewRow, { label: "Note to Invoice", value: form.noteToInvoice })))));
}
function CreateSubscriptionWizard(_a) {
    var open = _a.open, onOpenChange = _a.onOpenChange, onSuccess = _a.onSuccess;
    var _b = react_1.useState(0), step = _b[0], setStep = _b[1];
    var _c = react_1.useState(EMPTY_FORM), form = _c[0], setForm = _c[1];
    var _d = trpc_1.trpc.clients.list.useQuery().data, clients = _d === void 0 ? [] : _d;
    var _e = trpc_1.trpc.invoices.list.useQuery().data, invoicesList = _e === void 0 ? [] : _e;
    var createMutation = trpc_1.trpc.recurringInvoices.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Subscription created successfully!");
            setStep(0);
            setForm(EMPTY_FORM);
            onSuccess();
            onOpenChange(false);
        },
        onError: function (e) { return sonner_1.toast.error(e.message || "Failed to create subscription"); }
    });
    var onChange = function (patch) {
        setForm(function (f) { return (__assign(__assign({}, f), patch)); });
    };
    // Validate current step before advancing
    var canProceed = function () {
        switch (step) {
            case 0:
                return !!form.clientId && !!form.planName;
            case 1:
                return !!form.amountPerCycle && !!form.startDate;
            case 2:
                return !!form.contactName && !!form.contactEmail;
            case 3:
                return !!form.paymentMethod;
            case 4:
                return !!form.templateInvoiceId;
            default:
                return true;
        }
    };
    var handleNext = function () {
        if (!canProceed()) {
            sonner_1.toast.error("Please fill in the required fields before proceeding.");
            return;
        }
        setStep(function (s) { return s + 1; });
    };
    var handleBack = function () { return setStep(function (s) { return s - 1; }); };
    // Build the description and noteToInvoice to persist extra data
    var buildDescription = function () {
        var parts = [form.planName];
        if (form.planDescription)
            parts.push(form.planDescription);
        if (form.amountPerCycle)
            parts.push("Amount: " + form.currency + " " + form.amountPerCycle + "/cycle");
        if (form.taxRate)
            parts.push("VAT: " + form.taxRate + "%");
        if (form.trialDays)
            parts.push("Trial: " + form.trialDays + " days");
        return parts.join(" | ");
    };
    var buildNoteToInvoice = function () {
        var _a;
        var lines = [];
        if (form.contactName) {
            var contactLine = [form.contactName, form.contactRole].filter(Boolean).join(" — ");
            lines.push("Contact: " + contactLine);
        }
        if (form.contactEmail)
            lines.push("Email: " + form.contactEmail);
        if (form.contactPhone)
            lines.push("Phone: " + form.contactPhone);
        var billingAddr = [form.billingStreet, form.billingCity, form.billingPostalCode, form.billingCountry]
            .filter(Boolean)
            .join(", ");
        if (billingAddr)
            lines.push("Billing Address: " + billingAddr);
        var pm = ((_a = PAYMENT_METHODS.find(function (p) { return p.value === form.paymentMethod; })) === null || _a === void 0 ? void 0 : _a.label) || form.paymentMethod;
        if (pm)
            lines.push("Payment Method: " + pm);
        if (form.paymentReference)
            lines.push("Payment Ref: " + form.paymentReference);
        if (form.generateDaysBefore)
            lines.push("Generate invoice " + form.generateDaysBefore + " day(s) before renewal");
        if (form.noteToInvoice)
            lines.push("", form.noteToInvoice);
        return lines.join("\n");
    };
    var handleSubmit = function () {
        createMutation.mutate({
            clientId: form.clientId,
            templateInvoiceId: form.templateInvoiceId,
            frequency: form.frequency,
            startDate: new Date(form.startDate).toISOString(),
            endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
            description: buildDescription(),
            noteToInvoice: buildNoteToInvoice() || undefined
        });
    };
    var handleClose = function () {
        setStep(0);
        setForm(EMPTY_FORM);
        onOpenChange(false);
    };
    var CurrentIcon = STEPS[step].icon;
    return (React.createElement(dialog_1.Dialog, { open: open, onOpenChange: handleClose },
        React.createElement(dialog_1.DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-hidden flex flex-col gap-0 p-0" },
            React.createElement(dialog_1.DialogHeader, { className: "px-6 pt-6 pb-4 border-b shrink-0" },
                React.createElement(dialog_1.DialogTitle, { className: "flex items-center gap-2" },
                    React.createElement(lucide_react_1.Repeat2, { className: "h-5 w-5 text-primary" }),
                    "New Subscription"),
                React.createElement(dialog_1.DialogDescription, null, "Create a recurring billing subscription for a client.")),
            React.createElement("div", { className: "px-6 py-3 border-b bg-muted/30 shrink-0" },
                React.createElement("div", { className: "flex items-center gap-1 overflow-x-auto" }, STEPS.map(function (s, i) {
                    var Icon = s.icon;
                    var isActive = i === step;
                    var isDone = i < step;
                    return (React.createElement("div", { key: s.id, className: "flex items-center gap-1" },
                        React.createElement("button", { type: "button", className: utils_1.cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap", isActive
                                ? "bg-primary text-primary-foreground"
                                : isDone
                                    ? "bg-primary/15 text-primary cursor-pointer hover:bg-primary/25"
                                    : "text-muted-foreground cursor-default"), onClick: function () { return isDone && setStep(i); } },
                            isDone ? (React.createElement(lucide_react_1.CheckCircle2, { className: "h-3.5 w-3.5" })) : (React.createElement(Icon, { className: "h-3.5 w-3.5" })),
                            s.label),
                        i < STEPS.length - 1 && (React.createElement(lucide_react_1.ChevronRight, { className: "h-3.5 w-3.5 text-muted-foreground shrink-0" }))));
                }))),
            React.createElement("div", { className: "flex-1 overflow-y-auto px-6 py-5" },
                React.createElement("div", { className: "flex items-center gap-2 mb-5" },
                    React.createElement("div", { className: "flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary" },
                        React.createElement(CurrentIcon, { className: "h-4 w-4" })),
                    React.createElement("div", null,
                        React.createElement("h3", { className: "font-semibold text-sm" }, STEPS[step].label),
                        React.createElement("p", { className: "text-xs text-muted-foreground" },
                            "Step ",
                            step + 1,
                            " of ",
                            STEPS.length))),
                step === 0 && React.createElement(StepClientPlan, { form: form, onChange: onChange, clients: clients }),
                step === 1 && React.createElement(StepBillingCycle, { form: form, onChange: onChange }),
                step === 2 && React.createElement(StepContactPerson, { form: form, onChange: onChange, clients: clients }),
                step === 3 && React.createElement(StepBillingAddress, { form: form, onChange: onChange, clients: clients }),
                step === 4 && React.createElement(StepInvoiceSettings, { form: form, onChange: onChange, invoices: invoicesList }),
                step === 5 && React.createElement(StepReview, { form: form, clients: clients, invoices: invoicesList })),
            React.createElement("div", { className: "px-6 py-4 border-t bg-muted/20 shrink-0 flex items-center justify-between gap-3" },
                React.createElement(button_1.Button, { variant: "outline", onClick: step === 0 ? handleClose : handleBack, disabled: createMutation.isPending },
                    React.createElement(lucide_react_1.ChevronLeft, { className: "h-4 w-4 mr-1" }),
                    step === 0 ? "Cancel" : "Back"),
                React.createElement("div", { className: "flex items-center gap-2" }, STEPS.map(function (_, i) { return (React.createElement("div", { key: i, className: utils_1.cn("rounded-full transition-all", i === step
                        ? "h-2.5 w-2.5 bg-primary"
                        : i < step
                            ? "h-2 w-2 bg-primary/50"
                            : "h-2 w-2 bg-muted-foreground/30") })); })),
                step < STEPS.length - 1 ? (React.createElement(button_1.Button, { onClick: handleNext },
                    "Next",
                    React.createElement(lucide_react_1.ChevronRight, { className: "h-4 w-4 ml-1" }))) : (React.createElement(button_1.Button, { onClick: handleSubmit, disabled: createMutation.isPending, className: "gap-2" },
                    createMutation.isPending ? (React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin" })) : (React.createElement(lucide_react_1.CheckCircle2, { className: "h-4 w-4" })),
                    "Create Subscription"))))));
}
exports.CreateSubscriptionWizard = CreateSubscriptionWizard;
