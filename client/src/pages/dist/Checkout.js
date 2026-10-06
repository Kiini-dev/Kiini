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
var react_1 = require("react");
var wouter_1 = require("wouter");
var useAuthWithPersistence_1 = require("@/_core/hooks/useAuthWithPersistence");
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var radio_group_1 = require("@/components/ui/radio-group");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var PAYMENT_METHODS = [
    {
        type: "card",
        label: "Credit/Debit Card",
        icon: react_1["default"].createElement(lucide_react_1.CreditCard, { className: "h-5 w-5" })
    },
    {
        type: "mpesa",
        label: "M-Pesa",
        icon: react_1["default"].createElement(lucide_react_1.Smartphone, { className: "h-5 w-5" })
    },
    {
        type: "bank",
        label: "Bank Transfer",
        icon: react_1["default"].createElement(lucide_react_1.Building2, { className: "h-5 w-5" })
    },
];
function Checkout() {
    var _this = this;
    var _a = useAuthWithPersistence_1.useAuthWithPersistence(), user = _a.user, authLoading = _a.loading;
    var _b = wouter_1.useLocation(), location = _b[0], navigate = _b[1];
    var _c = wouter_1.useRoute("/checkout/:planKey?"), params = _c[1];
    var _d = react_1.useState("plan"), currentStep = _d[0], setCurrentStep = _d[1];
    var _e = react_1.useState((params === null || params === void 0 ? void 0 : params.planKey) || ""), selectedPlan = _e[0], setSelectedPlan = _e[1];
    var _f = react_1.useState("monthly"), billingCycle = _f[0], setBillingCycle = _f[1];
    var _g = react_1.useState(""), paymentMethod = _g[0], setPaymentMethod = _g[1];
    // Payment form state
    var _h = react_1.useState(""), cardNumber = _h[0], setCardNumber = _h[1];
    var _j = react_1.useState(""), expiryDate = _j[0], setExpiryDate = _j[1];
    var _k = react_1.useState(""), cvv = _k[0], setCvv = _k[1];
    var _l = react_1.useState(""), cardholderName = _l[0], setCardholderName = _l[1];
    var _m = react_1.useState(""), mpesaNumber = _m[0], setMpesaNumber = _m[1];
    var _o = react_1.useState(""), bankName = _o[0], setBankName = _o[1];
    var _p = react_1.useState(""), accountNumber = _p[0], setAccountNumber = _p[1];
    // Fetch data
    var _q = trpc_1.trpc.multiTenancy.getPlanPrices.useQuery(), planData = _q.data, plansLoading = _q.isLoading;
    var currentSubscription = trpc_1.trpc.multiTenancy.getCurrentSubscription.useQuery().data;
    var plansArray = (planData === null || planData === void 0 ? void 0 : planData.prices) ? Object.entries(planData.prices).map(function (_a) {
        var key = _a[0], value = _a[1];
        return (__assign({ key: key }, value));
    }) : [];
    // Mutations
    var createSubscriptionMutation = trpc_1.trpc.multiTenancy.createSubscription.useMutation({
        onSuccess: function (data) {
            sonner_1.toast.success("Subscription created successfully!");
            navigate("/portal");
        },
        onError: function (err) { return sonner_1.toast.error(err.message || "Failed to create subscription"); }
    });
    var upgradeSubscriptionMutation = trpc_1.trpc.multiTenancy.upgradeSubscription.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Subscription upgraded successfully!");
            navigate("/portal");
        },
        onError: function (err) { return sonner_1.toast.error(err.message || "Failed to upgrade subscription"); }
    });
    react_1.useEffect(function () {
        if (params === null || params === void 0 ? void 0 : params.planKey) {
            setSelectedPlan(params.planKey);
        }
        else {
            try {
                var queryString = location.split("?")[1] || "";
                var planParam = new URLSearchParams(queryString).get("plan");
                if (planParam) {
                    setSelectedPlan(planParam);
                }
            }
            catch (_a) {
                // ignore malformed query
            }
        }
    }, [params === null || params === void 0 ? void 0 : params.planKey, location]);
    react_1.useEffect(function () {
        if (!user && !authLoading) {
            var nextPath = location || "/checkout";
            navigate("/signup?next=" + encodeURIComponent(nextPath));
        }
    }, [user, location, navigate]);
    if (!user) {
        return null;
    }
    var selectedPlanData = plansArray === null || plansArray === void 0 ? void 0 : plansArray.find(function (p) { return p.key === selectedPlan; });
    var isUpgrade = currentSubscription && currentSubscription.planKey !== selectedPlan;
    var calculatePrice = function () {
        if (!selectedPlanData)
            return 0;
        return billingCycle === "annual"
            ? selectedPlanData.annualKes || selectedPlanData.monthlyKes * 12
            : selectedPlanData.monthlyKes;
    };
    var handleNext = function () {
        if (currentStep === "plan" && selectedPlan) {
            setCurrentStep("payment");
        }
        else if (currentStep === "payment" && paymentMethod) {
            setCurrentStep("confirm");
        }
    };
    var handleBack = function () {
        if (currentStep === "payment") {
            setCurrentStep("plan");
        }
        else if (currentStep === "confirm") {
            setCurrentStep("payment");
        }
    };
    var handleSubmit = function () { return __awaiter(_this, void 0, void 0, function () {
        var paymentData, subscriptionData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedPlanData)
                        return [2 /*return*/];
                    paymentData = paymentMethod === "card"
                        ? {
                            card: {
                                number: cardNumber.replace(/\s/g, ""),
                                expiry: expiryDate,
                                cvv: cvv,
                                name: cardholderName
                            }
                        }
                        : paymentMethod === "mpesa"
                            ? {
                                mpesa: {
                                    phoneNumber: mpesaNumber
                                }
                            }
                            : paymentMethod === "bank"
                                ? {
                                    bank: {
                                        bankName: bankName,
                                        accountNumber: accountNumber
                                    }
                                }
                                : {};
                    subscriptionData = {
                        planKey: selectedPlan,
                        billingCycle: billingCycle,
                        paymentMethod: paymentMethod,
                        paymentData: paymentData
                    };
                    if (!isUpgrade) return [3 /*break*/, 2];
                    return [4 /*yield*/, upgradeSubscriptionMutation.mutateAsync(subscriptionData)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, createSubscriptionMutation.mutateAsync(subscriptionData)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var renderPlanStep = function () { return (react_1["default"].createElement("div", { className: "space-y-6" },
        react_1["default"].createElement("div", null,
            react_1["default"].createElement("h2", { className: "text-2xl font-bold mb-2" }, "Choose Your Plan"),
            react_1["default"].createElement("p", { className: "text-muted-foreground" }, "Select the plan that best fits your needs")),
        plansLoading ? (react_1["default"].createElement("div", { className: "flex items-center justify-center py-12" },
            react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))) : (react_1["default"].createElement("div", { className: "space-y-4" },
            react_1["default"].createElement("div", { className: "flex items-center justify-center" },
                react_1["default"].createElement("div", { className: "bg-muted p-1 rounded-lg" },
                    react_1["default"].createElement(button_1.Button, { variant: billingCycle === "monthly" ? "default" : "ghost", size: "sm", onClick: function () { return setBillingCycle("monthly"); } }, "Monthly"),
                    react_1["default"].createElement(button_1.Button, { variant: billingCycle === "annual" ? "default" : "ghost", size: "sm", onClick: function () { return setBillingCycle("annual"); } },
                        "Annual",
                        react_1["default"].createElement(badge_1.Badge, { variant: "secondary", className: "ml-2" }, "Save 20%")))),
            react_1["default"].createElement(radio_group_1.RadioGroup, { value: selectedPlan, onValueChange: setSelectedPlan },
                react_1["default"].createElement("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3" }, plansArray === null || plansArray === void 0 ? void 0 : plansArray.map(function (plan) {
                    var _a;
                    return (react_1["default"].createElement("div", { key: plan.key },
                        react_1["default"].createElement(radio_group_1.RadioGroupItem, { value: plan.key, id: plan.key, className: "sr-only" }),
                        react_1["default"].createElement(label_1.Label, { htmlFor: plan.key, className: utils_1.cn("block cursor-pointer rounded-lg border-2 p-4 transition-colors", selectedPlan === plan.key
                                ? "border-primary bg-primary/5"
                                : "border-muted hover:border-primary/50") },
                            react_1["default"].createElement("div", { className: "space-y-3" },
                                react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                                    react_1["default"].createElement("h3", { className: "font-semibold" }, plan.label),
                                    plan.key === "professional" && (react_1["default"].createElement(badge_1.Badge, { variant: "default" }, "Most Popular"))),
                                react_1["default"].createElement("div", { className: "text-2xl font-bold" },
                                    "Ksh ",
                                    billingCycle === "annual"
                                        ? (plan.annualKes || plan.monthlyKes * 12).toLocaleString()
                                        : plan.monthlyKes.toLocaleString(),
                                    react_1["default"].createElement("span", { className: "text-sm font-normal text-muted-foreground" },
                                        "/",
                                        billingCycle === "annual" ? "year" : "month")),
                                react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, plan.description),
                                react_1["default"].createElement("ul", { className: "space-y-1" }, (_a = (Array.isArray(plan.features)
                                    ? plan.features
                                    : typeof plan.features === 'object' && plan.features !== null
                                        ? Object.values(plan.features)
                                        : [])) === null || _a === void 0 ? void 0 : _a.slice(0, 3).map(function (feature, idx) { return (react_1["default"].createElement("li", { key: idx, className: "flex items-center text-sm" },
                                    react_1["default"].createElement(lucide_react_1.CheckCircle2, { className: "h-4 w-4 text-green-500 mr-2 flex-shrink-0" }),
                                    typeof feature === 'string' ? feature : (feature === null || feature === void 0 ? void 0 : feature.label) || String(feature))); }))))));
                }))))))); };
    var renderPaymentStep = function () { return (react_1["default"].createElement("div", { className: "space-y-6" },
        react_1["default"].createElement("div", null,
            react_1["default"].createElement("h2", { className: "text-2xl font-bold mb-2" }, "Payment Information"),
            react_1["default"].createElement("p", { className: "text-muted-foreground" }, "Choose your payment method and enter details")),
        react_1["default"].createElement("div", { className: "space-y-4" },
            react_1["default"].createElement(label_1.Label, { className: "text-base font-medium" }, "Payment Method"),
            react_1["default"].createElement(radio_group_1.RadioGroup, { value: paymentMethod, onValueChange: setPaymentMethod },
                react_1["default"].createElement("div", { className: "grid gap-3" }, PAYMENT_METHODS.map(function (method) { return (react_1["default"].createElement("div", { key: method.type },
                    react_1["default"].createElement(radio_group_1.RadioGroupItem, { value: method.type, id: method.type, className: "sr-only" }),
                    react_1["default"].createElement(label_1.Label, { htmlFor: method.type, className: utils_1.cn("flex items-center cursor-pointer rounded-lg border-2 p-4 transition-colors", paymentMethod === method.type
                            ? "border-primary bg-primary/5"
                            : "border-muted hover:border-primary/50") },
                        method.icon,
                        react_1["default"].createElement("span", { className: "ml-3 font-medium" }, method.label)))); })))),
        paymentMethod === "card" && (react_1["default"].createElement(card_1.Card, null,
            react_1["default"].createElement(card_1.CardHeader, null,
                react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center" },
                    react_1["default"].createElement(lucide_react_1.CreditCard, { className: "h-5 w-5 mr-2" }),
                    "Card Details")),
            react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement(label_1.Label, { htmlFor: "cardNumber" }, "Card Number"),
                    react_1["default"].createElement(input_1.Input, { id: "cardNumber", placeholder: "1234 5678 9012 3456", value: cardNumber, onChange: function (e) { return setCardNumber(e.target.value); } })),
                react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-4" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { htmlFor: "expiry" }, "Expiry Date"),
                        react_1["default"].createElement(input_1.Input, { id: "expiry", placeholder: "MM/YY", value: expiryDate, onChange: function (e) { return setExpiryDate(e.target.value); } })),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { htmlFor: "cvv" }, "CVV"),
                        react_1["default"].createElement(input_1.Input, { id: "cvv", placeholder: "123", value: cvv, onChange: function (e) { return setCvv(e.target.value); } }))),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement(label_1.Label, { htmlFor: "cardholderName" }, "Cardholder Name"),
                    react_1["default"].createElement(input_1.Input, { id: "cardholderName", placeholder: "John Doe", value: cardholderName, onChange: function (e) { return setCardholderName(e.target.value); } }))))),
        paymentMethod === "mpesa" && (react_1["default"].createElement(card_1.Card, null,
            react_1["default"].createElement(card_1.CardHeader, null,
                react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center" },
                    react_1["default"].createElement(lucide_react_1.Smartphone, { className: "h-5 w-5 mr-2" }),
                    "M-Pesa Details")),
            react_1["default"].createElement(card_1.CardContent, null,
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement(label_1.Label, { htmlFor: "mpesaNumber" }, "M-Pesa Phone Number"),
                    react_1["default"].createElement(input_1.Input, { id: "mpesaNumber", placeholder: "+254 712 345 678", value: mpesaNumber, onChange: function (e) { return setMpesaNumber(e.target.value); } }),
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground mt-1" }, "You'll receive a prompt on this number to complete the payment"))))),
        paymentMethod === "bank" && (react_1["default"].createElement(card_1.Card, null,
            react_1["default"].createElement(card_1.CardHeader, null,
                react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center" },
                    react_1["default"].createElement(lucide_react_1.Building2, { className: "h-5 w-5 mr-2" }),
                    "Bank Transfer Details")),
            react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement(label_1.Label, { htmlFor: "bankName" }, "Bank Name"),
                    react_1["default"].createElement(input_1.Input, { id: "bankName", placeholder: "KCB Bank", value: bankName, onChange: function (e) { return setBankName(e.target.value); } })),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement(label_1.Label, { htmlFor: "accountNumber" }, "Account Number"),
                    react_1["default"].createElement(input_1.Input, { id: "accountNumber", placeholder: "1234567890", value: accountNumber, onChange: function (e) { return setAccountNumber(e.target.value); } })),
                react_1["default"].createElement("div", { className: "bg-muted p-4 rounded-lg" },
                    react_1["default"].createElement("p", { className: "text-sm font-medium mb-2" }, "Bank Transfer Instructions:"),
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "After submitting, you'll receive bank details to complete the transfer. Your subscription will be activated once payment is confirmed."))))))); };
    var renderConfirmStep = function () { return (react_1["default"].createElement("div", { className: "space-y-6" },
        react_1["default"].createElement("div", null,
            react_1["default"].createElement("h2", { className: "text-2xl font-bold mb-2" }, "Confirm Your Order"),
            react_1["default"].createElement("p", { className: "text-muted-foreground" }, "Review your subscription details before confirming")),
        react_1["default"].createElement("div", { className: "grid gap-6 md:grid-cols-2" },
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, null, "Order Summary")),
                react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                    react_1["default"].createElement("div", { className: "flex justify-between" },
                        react_1["default"].createElement("span", null, "Plan:"),
                        react_1["default"].createElement("span", { className: "font-medium" }, selectedPlanData === null || selectedPlanData === void 0 ? void 0 : selectedPlanData.label)),
                    react_1["default"].createElement("div", { className: "flex justify-between" },
                        react_1["default"].createElement("span", null, "Billing Cycle:"),
                        react_1["default"].createElement("span", { className: "capitalize" }, billingCycle)),
                    react_1["default"].createElement("div", { className: "flex justify-between" },
                        react_1["default"].createElement("span", null, "Payment Method:"),
                        react_1["default"].createElement("span", { className: "capitalize" }, paymentMethod)),
                    react_1["default"].createElement(separator_1.Separator, null),
                    react_1["default"].createElement("div", { className: "flex justify-between text-lg font-bold" },
                        react_1["default"].createElement("span", null, "Total:"),
                        react_1["default"].createElement("span", null,
                            "Ksh ",
                            calculatePrice().toLocaleString())))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, null, "Account Information")),
                react_1["default"].createElement(card_1.CardContent, { className: "space-y-3" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { className: "text-sm font-medium" }, "Name"),
                        react_1["default"].createElement("p", null, user.name)),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { className: "text-sm font-medium" }, "Email"),
                        react_1["default"].createElement("p", null, user.email)),
                    isUpgrade && (react_1["default"].createElement("div", { className: "mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg" },
                        react_1["default"].createElement("p", { className: "text-sm text-amber-800 dark:text-amber-200" },
                            "This will upgrade your current ", currentSubscription === null || currentSubscription === void 0 ? void 0 :
                            currentSubscription.planName,
                            " plan. Changes will be prorated.")))))),
        react_1["default"].createElement(card_1.Card, null,
            react_1["default"].createElement(card_1.CardContent, { className: "pt-6" },
                react_1["default"].createElement("div", { className: "flex items-center text-sm text-muted-foreground" },
                    react_1["default"].createElement(lucide_react_1.Shield, { className: "h-4 w-4 mr-2" }),
                    "Your payment information is secure and encrypted.",
                    react_1["default"].createElement(lucide_react_1.Lock, { className: "h-4 w-4 ml-2" })))))); };
    var canProceed = function () {
        switch (currentStep) {
            case "plan":
                return selectedPlan;
            case "payment":
                if (paymentMethod === "card") {
                    return cardNumber && expiryDate && cvv && cardholderName;
                }
                else if (paymentMethod === "mpesa") {
                    return mpesaNumber;
                }
                else if (paymentMethod === "bank") {
                    return bankName && accountNumber;
                }
                return false;
            case "confirm":
                return true;
            default:
                return false;
        }
    };
    return (react_1["default"].createElement("div", { className: "min-h-screen bg-background" },
        react_1["default"].createElement("div", { className: "border-b bg-card" },
            react_1["default"].createElement("div", { className: "container mx-auto px-4 py-6" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                    react_1["default"].createElement(button_1.Button, { variant: "ghost", onClick: function () { return navigate("/pricing"); } },
                        react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-2" }),
                        "Back to Pricing"),
                    react_1["default"].createElement("div", { className: "text-center" },
                        react_1["default"].createElement("h1", { className: "text-xl font-bold" }, "Secure Checkout")),
                    react_1["default"].createElement("div", { className: "w-20" }),
                    " "))),
        react_1["default"].createElement("div", { className: "border-b" },
            react_1["default"].createElement("div", { className: "container mx-auto px-4 py-4" },
                react_1["default"].createElement("div", { className: "flex items-center justify-center space-x-8" }, [
                    { key: "plan", label: "Choose Plan", step: 1 },
                    { key: "payment", label: "Payment", step: 2 },
                    { key: "confirm", label: "Confirm", step: 3 },
                ].map(function (step) { return (react_1["default"].createElement("div", { key: step.key, className: "flex items-center" },
                    react_1["default"].createElement("div", { className: utils_1.cn("flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium", currentStep === step.key
                            ? "bg-primary text-primary-foreground"
                            : ["plan", "payment", "confirm"].indexOf(currentStep) >= step.step - 1
                                ? "bg-primary/20 text-primary"
                                : "bg-muted text-muted-foreground") }, step.step),
                    react_1["default"].createElement("span", { className: utils_1.cn("ml-2 text-sm font-medium", currentStep === step.key ? "text-foreground" : "text-muted-foreground") }, step.label))); })))),
        react_1["default"].createElement("div", { className: "container mx-auto px-4 py-8 max-w-4xl" },
            currentStep === "plan" && renderPlanStep(),
            currentStep === "payment" && renderPaymentStep(),
            currentStep === "confirm" && renderConfirmStep(),
            react_1["default"].createElement("div", { className: "flex justify-between mt-8" },
                react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: handleBack, disabled: currentStep === "plan" },
                    react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-2" }),
                    "Back"),
                currentStep === "confirm" ? (react_1["default"].createElement(button_1.Button, { onClick: handleSubmit, disabled: !canProceed() || createSubscriptionMutation.isLoading || upgradeSubscriptionMutation.isLoading, size: "lg" },
                    (createSubscriptionMutation.isLoading || upgradeSubscriptionMutation.isLoading) && (react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" })),
                    isUpgrade ? "Upgrade Subscription" : "Complete Purchase")) : (react_1["default"].createElement(button_1.Button, { onClick: handleNext, disabled: !canProceed() },
                    "Next",
                    react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "h-4 w-4 ml-2" })))))));
}
exports["default"] = Checkout;
