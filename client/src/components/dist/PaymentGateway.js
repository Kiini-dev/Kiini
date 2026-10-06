"use strict";
/**
 * Payment Gateway Component
 * Unified payment form supporting Stripe and M-Pesa payment methods
 * Handles payment processing, error handling, and success confirmation
 */
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
exports.PaymentGateway = void 0;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var PhoneInput_1 = require("@/components/PhoneInput");
var card_1 = require("@/components/ui/card");
var alert_1 = require("@/components/ui/alert");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var designSystem_1 = require("@/lib/designSystem");
function PaymentGateway(_a) {
    var _this = this;
    var amount = _a.amount, _b = _a.currency, currency = _b === void 0 ? "KES" : _b, _c = _a.description, description = _c === void 0 ? "Payment" : _c, onSuccess = _a.onSuccess, onError = _a.onError, _d = _a.disabled, disabled = _d === void 0 ? false : _d;
    var _e = react_1.useState("stripe"), paymentMethod = _e[0], setPaymentMethod = _e[1];
    var _f = react_1.useState(false), loading = _f[0], setLoading = _f[1];
    var _g = react_1.useState(""), error = _g[0], setError = _g[1];
    var _h = react_1.useState(false), success = _h[0], setSuccess = _h[1];
    var _j = react_1.useState(""), transactionId = _j[0], setTransactionId = _j[1];
    var _k = react_1.useState(false), showCardDetails = _k[0], setShowCardDetails = _k[1];
    var _l = react_1.useState(false), showCVV = _l[0], setShowCVV = _l[1];
    var _m = react_1.useState({
        amount: amount,
        currency: currency,
        paymentMethod: "stripe",
        email: "",
        phone: "",
        cardNumber: "",
        expiryDate: "",
        cvv: ""
    }), formData = _m[0], setFormData = _m[1];
    // Payment mutations
    var stripePaymentMutation = trpc_1.trpc.payments.stripe.createPaymentIntent.useMutation({
        onSuccess: function (data) {
            setTransactionId(data.clientSecret || data.id);
            setSuccess(true);
            sonner_1.toast.success("Payment processed successfully");
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(transactionId);
        },
        onError: function (error) {
            var errorMsg = error.message || "Payment failed";
            setError(errorMsg);
            sonner_1.toast.error(errorMsg);
            onError === null || onError === void 0 ? void 0 : onError(errorMsg);
        }
    });
    var mpesaPaymentMutation = trpc_1.trpc.payments.mpesa.initiateSTKPush.useMutation({
        onSuccess: function (data) {
            setTransactionId(data.checkoutRequestID || data.id);
            setSuccess(true);
            sonner_1.toast.success("M-Pesa prompt sent to your phone");
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(transactionId);
        },
        onError: function (error) {
            var errorMsg = error.message || "M-Pesa payment failed";
            setError(errorMsg);
            sonner_1.toast.error(errorMsg);
            onError === null || onError === void 0 ? void 0 : onError(errorMsg);
        }
    });
    var handleInputChange = function (e) {
        var _a = e.target, name = _a.name, value = _a.value;
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[name] = name === "amount" ? parseFloat(value) || 0 : value, _a)));
        });
    };
    var validateForm = function () {
        setError("");
        if (!formData.email) {
            setError("Email is required");
            return false;
        }
        if (!formData.email.includes("@")) {
            setError("Valid email is required");
            return false;
        }
        if (paymentMethod === "mpesa" && !formData.phone) {
            setError("Phone number is required for M-Pesa");
            return false;
        }
        if (paymentMethod === "mpesa" && formData.phone.length < 10) {
            setError("Valid phone number is required");
            return false;
        }
        if (paymentMethod === "stripe" && !formData.cardNumber) {
            setError("Card number is required");
            return false;
        }
        if (paymentMethod === "stripe" && formData.cardNumber.length < 13) {
            setError("Valid card number is required");
            return false;
        }
        if (paymentMethod === "stripe" && !formData.expiryDate) {
            setError("Card expiry date is required");
            return false;
        }
        if (paymentMethod === "stripe" && !formData.cvv) {
            setError("CVV is required");
            return false;
        }
        return true;
    };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            e.preventDefault();
            if (!validateForm()) {
                return [2 /*return*/];
            }
            setLoading(true);
            try {
                if (paymentMethod === "stripe") {
                    stripePaymentMutation.mutate({
                        amount: Math.round(amount * 100),
                        currency: currency,
                        email: formData.email,
                        cardNumber: formData.cardNumber || "",
                        expiryDate: formData.expiryDate || "",
                        cvv: formData.cvv || "",
                        description: description
                    });
                }
                else {
                    mpesaPaymentMutation.mutate({
                        amount: Math.round(amount * 100),
                        phone: formData.phone || "",
                        email: formData.email,
                        accountReference: description
                    });
                }
            }
            catch (err) {
                setError(err.message || "Payment processing failed");
                sonner_1.toast.error(err.message || "Payment processing failed");
            }
            finally {
                setLoading(false);
            }
            return [2 /*return*/];
        });
    }); };
    if (success) {
        return (React.createElement(card_1.Card, { className: designSystem_1.getGradientCard("emerald") + " border-2" },
            React.createElement(card_1.CardHeader, { className: "text-center" },
                React.createElement(lucide_react_1.CheckCircle2, { className: "w-12 h-12 text-emerald-600 mx-auto mb-4" }),
                React.createElement(card_1.CardTitle, { className: designSystem_1.animations.fadeIn }, "Payment Successful"),
                React.createElement(card_1.CardDescription, null, "Your transaction has been completed")),
            React.createElement(card_1.CardContent, { className: "text-center" },
                React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", { className: "p-4 bg-white/50 dark:bg-black/20 rounded-lg" },
                        React.createElement("p", { className: "text-sm text-muted-foreground" }, "Transaction ID"),
                        React.createElement("p", { className: "text-lg font-mono font-semibold break-all" }, transactionId)),
                    React.createElement("div", null,
                        React.createElement(badge_1.Badge, { variant: "default", className: "bg-emerald-600" }, "PAID")),
                    React.createElement(button_1.Button, { onClick: function () {
                            setSuccess(false);
                            setFormData({
                                amount: amount,
                                currency: currency,
                                paymentMethod: "stripe",
                                email: "",
                                phone: "",
                                cardNumber: "",
                                expiryDate: "",
                                cvv: ""
                            });
                        } }, "Make Another Payment")))));
    }
    return (React.createElement(card_1.Card, { className: designSystem_1.getGradientCard("blue") },
        React.createElement(card_1.CardHeader, null,
            React.createElement(card_1.CardTitle, { className: designSystem_1.animations.fadeIn }, "Payment Gateway"),
            React.createElement(card_1.CardDescription, null,
                description,
                " - ",
                currency,
                " ",
                amount.toLocaleString("en-KE", { minimumFractionDigits: 2 }))),
        React.createElement(card_1.CardContent, null,
            error && (React.createElement(alert_1.Alert, { variant: "destructive", className: "mb-4" },
                React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4" }),
                React.createElement(alert_1.AlertDescription, null, error))),
            React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                React.createElement("div", { className: "space-y-3" },
                    React.createElement(label_1.Label, null, "Payment Method"),
                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                        React.createElement("label", { className: "p-4 border-2 rounded-lg cursor-pointer transition-all " + (paymentMethod === "stripe"
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                                : "border-gray-200 dark:border-gray-800") },
                            React.createElement("input", { type: "radio", value: "stripe", checked: paymentMethod === "stripe", onChange: function (e) { return setPaymentMethod(e.target.value); }, className: "mr-2" }),
                            React.createElement(lucide_react_1.CreditCard, { className: "h-5 w-5 inline mr-2" }),
                            React.createElement("span", { className: "font-medium" }, "Stripe Card")),
                        React.createElement("label", { className: "p-4 border-2 rounded-lg cursor-pointer transition-all " + (paymentMethod === "mpesa"
                                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                                : "border-gray-200 dark:border-gray-800") },
                            React.createElement("input", { type: "radio", value: "mpesa", checked: paymentMethod === "mpesa", onChange: function (e) { return setPaymentMethod(e.target.value); }, className: "mr-2" }),
                            React.createElement(lucide_react_1.Smartphone, { className: "h-5 w-5 inline mr-2" }),
                            React.createElement("span", { className: "font-medium" }, "M-Pesa")))),
                React.createElement("div", { className: "space-y-2" },
                    React.createElement(label_1.Label, { htmlFor: "email" }, "Email Address *"),
                    React.createElement(input_1.Input, { id: "email", name: "email", type: "email", placeholder: "your@email.com", value: formData.email, onChange: handleInputChange, required: true, disabled: loading || disabled })),
                paymentMethod === "stripe" && (React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, { htmlFor: "cardNumber" }, "Card Number *"),
                        React.createElement("div", { className: "relative" },
                            React.createElement(input_1.Input, { id: "cardNumber", name: "cardNumber", type: showCardDetails ? "text" : "password", placeholder: "4242 4242 4242 4242", value: formData.cardNumber, onChange: handleInputChange, maxLength: 19, required: true, disabled: loading || disabled, className: "pr-10" }),
                            React.createElement("button", { type: "button", onClick: function () { return setShowCardDetails(!showCardDetails); }, className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700", disabled: loading || disabled }, showCardDetails ? (React.createElement(lucide_react_1.EyeOff, { className: "w-4 h-4" })) : (React.createElement(lucide_react_1.Eye, { className: "w-4 h-4" }))))),
                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "expiryDate" }, "Expiry Date *"),
                            React.createElement(input_1.Input, { id: "expiryDate", name: "expiryDate", type: "text", placeholder: "MM/YY", value: formData.expiryDate, onChange: handleInputChange, maxLength: 5, required: true, disabled: loading || disabled })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "cvv" }, "CVV *"),
                            React.createElement("div", { className: "relative" },
                                React.createElement(input_1.Input, { id: "cvv", name: "cvv", type: showCVV ? "text" : "password", placeholder: "123", value: formData.cvv, onChange: handleInputChange, maxLength: 4, required: true, disabled: loading || disabled, className: "pr-10" }),
                                React.createElement("button", { type: "button", onClick: function () { return setShowCVV(!showCVV); }, className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700", disabled: loading || disabled }, showCVV ? (React.createElement(lucide_react_1.EyeOff, { className: "w-4 h-4" })) : (React.createElement(lucide_react_1.Eye, { className: "w-4 h-4" })))))),
                    React.createElement("div", { className: "p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-sm" },
                        React.createElement("p", null,
                            React.createElement("strong", null, "Test Card:"),
                            " 4242 4242 4242 4242 | Any Future Date | Any CVV")))),
                paymentMethod === "mpesa" && (React.createElement("div", { className: "space-y-2" },
                    React.createElement(label_1.Label, { htmlFor: "phone" }, "Phone Number (M-Pesa) *"),
                    React.createElement(PhoneInput_1.PhoneInput, { id: "phone", value: formData.phone, onChange: function (v) { return setFormData(__assign(__assign({}, formData), { phone: v })); }, placeholder: "700 000 000", required: true }),
                    React.createElement("p", { className: "text-xs text-muted-foreground" }, "You will receive a payment prompt on your phone"))),
                React.createElement("div", { className: "p-4 bg-white/50 dark:bg-black/20 border rounded-lg" },
                    React.createElement("div", { className: "flex justify-between items-center" },
                        React.createElement("span", { className: "text-muted-foreground" }, "Amount to Pay"),
                        React.createElement("span", { className: "text-2xl font-bold" },
                            currency,
                            " ",
                            amount.toLocaleString("en-KE", { minimumFractionDigits: 2 })))),
                React.createElement(button_1.Button, { type: "submit", disabled: loading || disabled, className: "w-full gap-2 h-12 text-base" }, loading ? (React.createElement(React.Fragment, null,
                    React.createElement(lucide_react_1.Loader2, { className: "w-4 h-4 animate-spin" }),
                    "Processing Payment...")) : (React.createElement(React.Fragment, null,
                    React.createElement(lucide_react_1.Lock, { className: "w-4 h-4" }),
                    "Pay ",
                    currency,
                    " ",
                    amount.toLocaleString("en-KE", { minimumFractionDigits: 2 })))),
                React.createElement("p", { className: "text-xs text-center text-muted-foreground" }, "Your payment information is secure and encrypted")))));
}
exports.PaymentGateway = PaymentGateway;
exports["default"] = PaymentGateway;
