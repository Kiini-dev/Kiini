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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var useAuth_1 = require("@/_core/hooks/useAuth");
var trpc_1 = require("@/lib/trpc");
var OrgLayout_1 = require("@/components/OrgLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var badge_1 = require("@/components/ui/badge");
var switch_1 = require("@/components/ui/switch");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
// ─── Helper ───────────────────────────────────────────────────────────────────
function methodLabel(type) {
    return { mpesa: "M-Pesa", card: "Card (Visa/Mastercard)", bank: "Bank Transfer", cheque: "Cheque" }[type];
}
function methodIcon(type) {
    switch (type) {
        case "mpesa": return react_1["default"].createElement(lucide_react_1.Smartphone, { className: "h-5 w-5 text-green-400" });
        case "card": return react_1["default"].createElement(lucide_react_1.CreditCard, { className: "h-5 w-5 text-blue-400" });
        case "bank": return react_1["default"].createElement(lucide_react_1.Building2, { className: "h-5 w-5 text-indigo-400" });
        case "cheque": return react_1["default"].createElement(lucide_react_1.FileText, { className: "h-5 w-5 text-orange-400" });
    }
}
function methodSummary(m) {
    if (m.type === "mpesa" && m.mpesa)
        return m.mpesa.phoneNumber;
    if (m.type === "card" && m.card)
        return m.card.brand.toUpperCase() + " \u2022\u2022\u2022\u2022 " + m.card.last4;
    if (m.type === "bank" && m.bank)
        return m.bank.bankName + " \u2014 " + m.bank.accountNumber;
    if (m.type === "cheque" && m.cheque)
        return "Payable to: " + m.cheque.payableTo;
    return "";
}
function AddMethodDialog(_a) {
    var open = _a.open, onOpenChange = _a.onOpenChange, onSave = _a.onSave, isSaving = _a.isSaving;
    var _b = react_1.useState(""), type = _b[0], setType = _b[1];
    var _c = react_1.useState({ phoneNumber: "", accountName: "" }), mpesa = _c[0], setMpesa = _c[1];
    var _d = react_1.useState({
        cardholderName: "", last4: "", brand: "visa",
        expiryMonth: "", expiryYear: "", autopayEnabled: false
    }), card = _d[0], setCard = _d[1];
    var _e = react_1.useState({
        bankName: "", accountName: "", accountNumber: "", branchCode: "", swiftCode: ""
    }), bank = _e[0], setBank = _e[1];
    var _f = react_1.useState({ payableTo: "", deliveryAddress: "" }), cheque = _f[0], setCheque = _f[1];
    var _g = react_1.useState(""), nickname = _g[0], setNickname = _g[1];
    var _h = react_1.useState(false), isDefault = _h[0], setIsDefault = _h[1];
    var reset = function () {
        setType("");
        setNickname("");
        setIsDefault(false);
        setMpesa({ phoneNumber: "", accountName: "" });
        setCard({ cardholderName: "", last4: "", brand: "visa", expiryMonth: "", expiryYear: "", autopayEnabled: false });
        setBank({ bankName: "", accountName: "", accountNumber: "", branchCode: "", swiftCode: "" });
        setCheque({ payableTo: "", deliveryAddress: "" });
    };
    var handleSave = function () {
        if (!type) {
            sonner_1.toast.error("Please select a payment method type");
            return;
        }
        var base = { type: type, isDefault: isDefault, nickname: nickname };
        if (type === "mpesa") {
            if (!mpesa.phoneNumber) {
                sonner_1.toast.error("Phone number is required");
                return;
            }
            onSave(__assign(__assign({}, base), { mpesa: mpesa }));
        }
        else if (type === "card") {
            if (!card.last4 || card.last4.length !== 4) {
                sonner_1.toast.error("Enter the last 4 digits of the card");
                return;
            }
            if (!card.cardholderName) {
                sonner_1.toast.error("Cardholder name is required");
                return;
            }
            onSave(__assign(__assign({}, base), { card: card }));
        }
        else if (type === "bank") {
            if (!bank.bankName || !bank.accountNumber) {
                sonner_1.toast.error("Bank name and account number are required");
                return;
            }
            onSave(__assign(__assign({}, base), { bank: bank }));
        }
        else if (type === "cheque") {
            if (!cheque.payableTo) {
                sonner_1.toast.error("Payable To is required");
                return;
            }
            onSave(__assign(__assign({}, base), { cheque: cheque }));
        }
        reset();
    };
    return (react_1["default"].createElement(dialog_1.Dialog, { open: open, onOpenChange: function (v) { if (!v)
            reset(); onOpenChange(v); } },
        react_1["default"].createElement(dialog_1.DialogContent, { className: "max-w-lg" },
            react_1["default"].createElement(dialog_1.DialogHeader, null,
                react_1["default"].createElement(dialog_1.DialogTitle, null, "Add Payment Method"),
                react_1["default"].createElement(dialog_1.DialogDescription, null, "Choose a payment method type and enter the details.")),
            react_1["default"].createElement("div", { className: "space-y-4" },
                react_1["default"].createElement("div", { className: "space-y-1.5" },
                    react_1["default"].createElement(label_1.Label, null, "Payment Method Type"),
                    react_1["default"].createElement(select_1.Select, { value: type, onValueChange: function (v) { return setType(v); } },
                        react_1["default"].createElement(select_1.SelectTrigger, null,
                            react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select type\u2026" })),
                        react_1["default"].createElement(select_1.SelectContent, null,
                            react_1["default"].createElement(select_1.SelectItem, { value: "mpesa" }, "M-Pesa"),
                            react_1["default"].createElement(select_1.SelectItem, { value: "card" }, "Visa / Mastercard"),
                            react_1["default"].createElement(select_1.SelectItem, { value: "bank" }, "Bank Transfer"),
                            react_1["default"].createElement(select_1.SelectItem, { value: "cheque" }, "Cheque")))),
                type && (react_1["default"].createElement("div", { className: "space-y-1.5" },
                    react_1["default"].createElement(label_1.Label, null, "Nickname (optional)"),
                    react_1["default"].createElement(input_1.Input, { value: nickname, onChange: function (e) { return setNickname(e.target.value); }, placeholder: "e.g. Main Business Account" }))),
                type === "mpesa" && (react_1["default"].createElement("div", { className: "space-y-3" },
                    react_1["default"].createElement("div", { className: "space-y-1.5" },
                        react_1["default"].createElement(label_1.Label, null, "M-Pesa Phone Number"),
                        react_1["default"].createElement(input_1.Input, { value: mpesa.phoneNumber, onChange: function (e) { return setMpesa(function (p) { return (__assign(__assign({}, p), { phoneNumber: e.target.value })); }); }, placeholder: "+254 7XX XXX XXX" })),
                    react_1["default"].createElement("div", { className: "space-y-1.5" },
                        react_1["default"].createElement(label_1.Label, null, "Account Name"),
                        react_1["default"].createElement(input_1.Input, { value: mpesa.accountName, onChange: function (e) { return setMpesa(function (p) { return (__assign(__assign({}, p), { accountName: e.target.value })); }); }, placeholder: "Name on M-Pesa account" })))),
                type === "card" && (react_1["default"].createElement("div", { className: "space-y-3" },
                    react_1["default"].createElement("div", { className: "space-y-1.5" },
                        react_1["default"].createElement(label_1.Label, null, "Card Brand"),
                        react_1["default"].createElement(select_1.Select, { value: card.brand, onValueChange: function (v) { return setCard(function (c) { return (__assign(__assign({}, c), { brand: v })); }); } },
                            react_1["default"].createElement(select_1.SelectTrigger, null,
                                react_1["default"].createElement(select_1.SelectValue, null)),
                            react_1["default"].createElement(select_1.SelectContent, null,
                                react_1["default"].createElement(select_1.SelectItem, { value: "visa" }, "Visa"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "mastercard" }, "Mastercard")))),
                    react_1["default"].createElement("div", { className: "space-y-1.5" },
                        react_1["default"].createElement(label_1.Label, null, "Cardholder Name"),
                        react_1["default"].createElement(input_1.Input, { value: card.cardholderName, onChange: function (e) { return setCard(function (c) { return (__assign(__assign({}, c), { cardholderName: e.target.value })); }); }, placeholder: "Exactly as on card" })),
                    react_1["default"].createElement("div", { className: "grid grid-cols-3 gap-3" },
                        react_1["default"].createElement("div", { className: "col-span-1 space-y-1.5" },
                            react_1["default"].createElement(label_1.Label, null, "Last 4 Digits"),
                            react_1["default"].createElement(input_1.Input, { maxLength: 4, value: card.last4, onChange: function (e) { return setCard(function (c) { return (__assign(__assign({}, c), { last4: e.target.value.replace(/\D/g, "") })); }); }, placeholder: "1234" })),
                        react_1["default"].createElement("div", { className: "space-y-1.5" },
                            react_1["default"].createElement(label_1.Label, null, "Expiry MM"),
                            react_1["default"].createElement(input_1.Input, { maxLength: 2, value: card.expiryMonth, onChange: function (e) { return setCard(function (c) { return (__assign(__assign({}, c), { expiryMonth: e.target.value.replace(/\D/g, "") })); }); }, placeholder: "MM" })),
                        react_1["default"].createElement("div", { className: "space-y-1.5" },
                            react_1["default"].createElement(label_1.Label, null, "Expiry YY"),
                            react_1["default"].createElement(input_1.Input, { maxLength: 2, value: card.expiryYear, onChange: function (e) { return setCard(function (c) { return (__assign(__assign({}, c), { expiryYear: e.target.value.replace(/\D/g, "") })); }); }, placeholder: "YY" }))),
                    react_1["default"].createElement("div", { className: "flex items-center justify-between rounded-lg border border-blue-500/20 bg-blue-600/10 p-3" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("p", { className: "text-sm font-medium text-white/90" }, "Enable Autopayment"),
                            react_1["default"].createElement("p", { className: "text-xs text-white/50" }, "Automatically charge this card for upcoming invoices when set as default.")),
                        react_1["default"].createElement(switch_1.Switch, { checked: card.autopayEnabled, onCheckedChange: function (v) { return setCard(function (c) { return (__assign(__assign({}, c), { autopayEnabled: v })); }); } })))),
                type === "bank" && (react_1["default"].createElement("div", { className: "space-y-3" },
                    react_1["default"].createElement("div", { className: "space-y-1.5" },
                        react_1["default"].createElement(label_1.Label, null, "Bank Name"),
                        react_1["default"].createElement(input_1.Input, { value: bank.bankName, onChange: function (e) { return setBank(function (b) { return (__assign(__assign({}, b), { bankName: e.target.value })); }); }, placeholder: "e.g. KCB, Equity, NCBA" })),
                    react_1["default"].createElement("div", { className: "space-y-1.5" },
                        react_1["default"].createElement(label_1.Label, null, "Account Name"),
                        react_1["default"].createElement(input_1.Input, { value: bank.accountName, onChange: function (e) { return setBank(function (b) { return (__assign(__assign({}, b), { accountName: e.target.value })); }); }, placeholder: "Account holder name" })),
                    react_1["default"].createElement("div", { className: "space-y-1.5" },
                        react_1["default"].createElement(label_1.Label, null, "Account Number"),
                        react_1["default"].createElement(input_1.Input, { value: bank.accountNumber, onChange: function (e) { return setBank(function (b) { return (__assign(__assign({}, b), { accountNumber: e.target.value })); }); }, placeholder: "1234567890" })),
                    react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-3" },
                        react_1["default"].createElement("div", { className: "space-y-1.5" },
                            react_1["default"].createElement(label_1.Label, null, "Branch Code"),
                            react_1["default"].createElement(input_1.Input, { value: bank.branchCode, onChange: function (e) { return setBank(function (b) { return (__assign(__assign({}, b), { branchCode: e.target.value })); }); }, placeholder: "Optional" })),
                        react_1["default"].createElement("div", { className: "space-y-1.5" },
                            react_1["default"].createElement(label_1.Label, null, "SWIFT / BIC"),
                            react_1["default"].createElement(input_1.Input, { value: bank.swiftCode, onChange: function (e) { return setBank(function (b) { return (__assign(__assign({}, b), { swiftCode: e.target.value })); }); }, placeholder: "Optional" }))))),
                type === "cheque" && (react_1["default"].createElement("div", { className: "space-y-3" },
                    react_1["default"].createElement("div", { className: "space-y-1.5" },
                        react_1["default"].createElement(label_1.Label, null, "Payable To"),
                        react_1["default"].createElement(input_1.Input, { value: cheque.payableTo, onChange: function (e) { return setCheque(function (c) { return (__assign(__assign({}, c), { payableTo: e.target.value })); }); }, placeholder: "Name on cheque" })),
                    react_1["default"].createElement("div", { className: "space-y-1.5" },
                        react_1["default"].createElement(label_1.Label, null, "Delivery Address"),
                        react_1["default"].createElement(input_1.Input, { value: cheque.deliveryAddress, onChange: function (e) { return setCheque(function (c) { return (__assign(__assign({}, c), { deliveryAddress: e.target.value })); }); }, placeholder: "Address to mail cheques" })))),
                type && (react_1["default"].createElement("div", { className: "flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3" },
                    react_1["default"].createElement("p", { className: "text-sm text-white/80" }, "Set as default payment method"),
                    react_1["default"].createElement(switch_1.Switch, { checked: isDefault, onCheckedChange: setIsDefault })))),
            react_1["default"].createElement(dialog_1.DialogFooter, null,
                react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { reset(); onOpenChange(false); } }, "Cancel"),
                react_1["default"].createElement(button_1.Button, { onClick: handleSave, disabled: isSaving || !type }, isSaving ? "Saving…" : "Add Method")))));
}
// ─── Main Component ───────────────────────────────────────────────────────────
function OrgBilling() {
    var _a;
    var user = useAuth_1.useAuth().user;
    var _b = trpc_1.trpc.multiTenancy.getMyOrg.useQuery(undefined, {
        enabled: !!(user === null || user === void 0 ? void 0 : user.organizationId)
    }), myOrgData = _b.data, refetch = _b.refetch;
    var org = myOrgData === null || myOrgData === void 0 ? void 0 : myOrgData.organization;
    var _c = react_1.useState([]), methods = _c[0], setMethods = _c[1];
    var _d = react_1.useState(false), addOpen = _d[0], setAddOpen = _d[1];
    // Load saved methods from org settings
    react_1.useEffect(function () {
        var _a;
        if ((_a = org === null || org === void 0 ? void 0 : org.settings) === null || _a === void 0 ? void 0 : _a.paymentMethods) {
            setMethods(org.settings.paymentMethods);
        }
    }, [org]);
    var updateMutation = trpc_1.trpc.multiTenancy.saveOrgPaymentMethods.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Payment methods updated");
            refetch();
        },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var persistMethods = function (updated) {
        setMethods(updated);
        updateMutation.mutate({ paymentMethods: updated });
    };
    var handleAdd = function (newMethod) {
        var id = "pm_" + Date.now() + "_" + crypto.randomUUID().slice(0, 7);
        var entry = __assign(__assign({}, newMethod), { id: id, createdAt: new Date().toISOString() });
        var updated;
        if (entry.isDefault) {
            updated = __spreadArrays(methods.map(function (m) { return (__assign(__assign({}, m), { isDefault: false })); }), [entry]);
        }
        else {
            updated = __spreadArrays(methods, [entry]);
        }
        persistMethods(updated);
        setAddOpen(false);
    };
    var handleSetDefault = function (id) {
        persistMethods(methods.map(function (m) { return (__assign(__assign({}, m), { isDefault: m.id === id })); }));
    };
    var handleRemove = function (id) {
        persistMethods(methods.filter(function (m) { return m.id !== id; }));
    };
    var handleToggleAutopay = function (id, enabled) {
        persistMethods(methods.map(function (m) {
            return m.id === id && m.card ? __assign(__assign({}, m), { card: __assign(__assign({}, m.card), { autopayEnabled: enabled }) }) : m;
        }));
    };
    // Access guard
    if ((user === null || user === void 0 ? void 0 : user.role) !== "super_admin" && (user === null || user === void 0 ? void 0 : user.role) !== "admin") {
        return (react_1["default"].createElement(OrgLayout_1.OrgLayout, { title: "Billing & Payments" },
            react_1["default"].createElement("div", { className: "flex flex-col items-center justify-center py-24 text-center" },
                react_1["default"].createElement(lucide_react_1.ShieldOff, { className: "h-16 w-16 text-muted-foreground mb-4" }),
                react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-2" }, "Access Denied"),
                react_1["default"].createElement("p", { className: "text-muted-foreground max-w-sm" }, "Only organization administrators can manage payment methods."))));
    }
    var defaultMethod = methods.find(function (m) { return m.isDefault; });
    return (react_1["default"].createElement(OrgLayout_1.OrgLayout, { title: "Billing & Payments", description: "Manage your organization's payment methods" },
        react_1["default"].createElement("div", { className: "space-y-6 max-w-3xl" },
            react_1["default"].createElement(card_1.Card, { className: "border-blue-500/20 bg-blue-600/10" },
                react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                    react_1["default"].createElement(card_1.CardTitle, { className: "text-base text-white" }, "Current Subscription"),
                    react_1["default"].createElement(card_1.CardDescription, null, "Your active plan and billing status")),
                react_1["default"].createElement(card_1.CardContent, { className: "grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "text-white/50" }, "Plan"),
                        react_1["default"].createElement("p", { className: "font-semibold text-white capitalize mt-0.5" }, (org === null || org === void 0 ? void 0 : org.plan) || "Starter")),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "text-white/50" }, "Status"),
                        react_1["default"].createElement("p", { className: "mt-0.5" }, (org === null || org === void 0 ? void 0 : org.isActive) ? react_1["default"].createElement("span", { className: "text-green-400 font-semibold" }, "Active")
                            : react_1["default"].createElement("span", { className: "text-red-400 font-semibold" }, "Inactive"))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "text-white/50" }, "Default Method"),
                        react_1["default"].createElement("p", { className: "font-semibold text-white mt-0.5" }, defaultMethod ? methodLabel(defaultMethod.type) : "—")))),
            (defaultMethod === null || defaultMethod === void 0 ? void 0 : defaultMethod.type) === "card" && ((_a = defaultMethod.card) === null || _a === void 0 ? void 0 : _a.autopayEnabled) && (react_1["default"].createElement("div", { className: "flex items-start gap-3 rounded-lg border border-green-500/20 bg-green-600/10 p-4" },
                react_1["default"].createElement(lucide_react_1.Zap, { className: "h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" }),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("p", { className: "text-sm font-semibold text-green-300" }, "Autopayment Enabled"),
                    react_1["default"].createElement("p", { className: "text-sm text-white/60 mt-0.5" },
                        "Subscription invoices will be charged automatically to your",
                        " ",
                        defaultMethod.card.brand.toUpperCase(),
                        " \u2022\u2022\u2022\u2022 ",
                        defaultMethod.card.last4,
                        ".")))),
            react_1["default"].createElement("div", { className: "space-y-3" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                    react_1["default"].createElement("h3", { className: "text-sm font-semibold text-white/50 uppercase tracking-wider" }, "Saved Payment Methods"),
                    react_1["default"].createElement(button_1.Button, { size: "sm", onClick: function () { return setAddOpen(true); } },
                        react_1["default"].createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
                        " Add Method")),
                methods.length === 0 && (react_1["default"].createElement(card_1.Card, { className: "border-dashed border-white/10 bg-white/3" },
                    react_1["default"].createElement(card_1.CardContent, { className: "py-12 text-center text-white/40" },
                        react_1["default"].createElement(lucide_react_1.CreditCard, { className: "h-10 w-10 mx-auto mb-3" }),
                        react_1["default"].createElement("p", { className: "text-sm" }, "No payment methods added yet."),
                        react_1["default"].createElement("p", { className: "text-xs mt-1" }, "Add M-Pesa, a bank account, or a card to get started.")))),
                methods.map(function (m) { return (react_1["default"].createElement(card_1.Card, { key: m.id, className: "border-white/10 bg-white/5 " + (m.isDefault ? "ring-1 ring-blue-500/40" : "") },
                    react_1["default"].createElement(card_1.CardContent, { className: "p-4" },
                        react_1["default"].createElement("div", { className: "flex items-start gap-3" },
                            react_1["default"].createElement("div", { className: "rounded-lg border border-white/10 bg-white/5 p-2 flex-shrink-0" }, methodIcon(m.type)),
                            react_1["default"].createElement("div", { className: "flex-1 min-w-0" },
                                react_1["default"].createElement("div", { className: "flex items-center gap-2 flex-wrap" },
                                    react_1["default"].createElement("span", { className: "text-sm font-semibold text-white" }, methodLabel(m.type)),
                                    m.nickname && react_1["default"].createElement("span", { className: "text-xs text-white/40" },
                                        "\u00B7 ",
                                        m.nickname),
                                    m.isDefault && (react_1["default"].createElement(badge_1.Badge, { className: "border-blue-500/20 bg-blue-600/20 text-blue-300 border text-xs gap-1" },
                                        react_1["default"].createElement(lucide_react_1.Star, { className: "h-3 w-3" }),
                                        " Default"))),
                                react_1["default"].createElement("p", { className: "text-xs text-white/50 mt-0.5" }, methodSummary(m)),
                                m.type === "card" && m.card && m.isDefault && (react_1["default"].createElement("div", { className: "flex items-center gap-2 mt-3 rounded-md border border-white/10 bg-white/5 p-2" },
                                    react_1["default"].createElement(lucide_react_1.Zap, { className: "h-3.5 w-3.5 text-yellow-400 flex-shrink-0" }),
                                    react_1["default"].createElement("span", { className: "text-xs text-white/70 flex-1" }, "Autopayment"),
                                    react_1["default"].createElement(switch_1.Switch, { checked: m.card.autopayEnabled, onCheckedChange: function (v) { return handleToggleAutopay(m.id, v); } })))),
                            react_1["default"].createElement("div", { className: "flex flex-col gap-1.5 flex-shrink-0" },
                                !m.isDefault && (react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "text-xs border-white/10 h-7 px-2", onClick: function () { return handleSetDefault(m.id); } }, "Set Default")),
                                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "ghost", className: "text-xs text-red-400 hover:text-red-300 hover:bg-red-600/10 h-7 px-2", onClick: function () { return handleRemove(m.id); } },
                                    react_1["default"].createElement(lucide_react_1.Trash2, { className: "h-3 w-3" }))))))); })),
            react_1["default"].createElement(card_1.Card, { className: "border-white/10 bg-white/5" },
                react_1["default"].createElement(card_1.CardContent, { className: "p-4 flex items-start gap-3" },
                    react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-white/40 mt-0.5 flex-shrink-0" }),
                    react_1["default"].createElement("div", { className: "text-xs text-white/50" },
                        react_1["default"].createElement("p", { className: "font-medium text-white/70 mb-1" }, "Payment & Security"),
                        react_1["default"].createElement("p", null, "Card numbers are never stored in full \u2014 only the last 4 digits and cardholder name are saved for reference. Autopayment for cards enables Kiini to charge your subscription invoices automatically on the due date. M-Pesa and bank transfer payments require manual confirmation via STK push or bank notification."))))),
        react_1["default"].createElement(AddMethodDialog, { open: addOpen, onOpenChange: setAddOpen, onSave: handleAdd, isSaving: updateMutation.isPending })));
}
exports["default"] = OrgBilling;
