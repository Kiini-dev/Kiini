"use strict";
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
var useAuth_1 = require("@/_core/hooks/useAuth");
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var tabs_1 = require("@/components/ui/tabs");
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var utils_1 = require("@/lib/utils");
var STATUS_STYLES = {
    active: { label: "Active", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400", icon: react_1["default"].createElement(lucide_react_1.CheckCircle2, { className: "h-3 w-3" }) },
    trial: { label: "Trial", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400", icon: react_1["default"].createElement(lucide_react_1.Clock, { className: "h-3 w-3" }) },
    suspended: { label: "Suspended", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400", icon: react_1["default"].createElement(lucide_react_1.AlertTriangle, { className: "h-3 w-3" }) },
    cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400", icon: react_1["default"].createElement(lucide_react_1.XCircle, { className: "h-3 w-3" }) },
    expired: { label: "Expired", className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400", icon: react_1["default"].createElement(lucide_react_1.XCircle, { className: "h-3 w-3" }) }
};
function StatusBadge(_a) {
    var status = _a.status;
    var s = STATUS_STYLES[status] || STATUS_STYLES.active;
    return (react_1["default"].createElement(badge_1.Badge, { className: utils_1.cn("gap-1 border-0 font-medium text-xs", s.className) },
        s.icon,
        " ",
        s.label));
}
function CustomerPortal() {
    var _this = this;
    var _a, _b, _c;
    var user = useAuth_1.useAuth().user;
    var _d = wouter_1.useLocation(), navigate = _d[1];
    var _e = react_1.useState("overview"), activeTab = _e[0], setActiveTab = _e[1];
    var _f = react_1.useState(false), showPlanChange = _f[0], setShowPlanChange = _f[1];
    var _g = react_1.useState(""), selectedPlan = _g[0], setSelectedPlan = _g[1];
    // Fetch customer data
    var _h = trpc_1.trpc.multiTenancy.getCurrentSubscription.useQuery(), subscription = _h.data, subLoading = _h.isLoading;
    var _j = trpc_1.trpc.multiTenancy.getCustomerInvoices.useQuery(), invoices = _j.data, invoicesLoading = _j.isLoading;
    var _k = trpc_1.trpc.multiTenancy.getCustomerPayments.useQuery(), payments = _k.data, paymentsLoading = _k.isLoading;
    var _l = trpc_1.trpc.multiTenancy.getPlanPrices.useQuery(), plans = _l.data, plansLoading = _l.isLoading;
    // Mutations
    var changePlanMutation = trpc_1.trpc.multiTenancy.changePlan.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Plan changed successfully");
            setShowPlanChange(false);
            // Refetch subscription data
            trpc_1.trpc.multiTenancy.getCurrentSubscription.invalidate();
        },
        onError: function (err) { return sonner_1.toast.error(err.message || "Failed to change plan"); }
    });
    var cancelSubscriptionMutation = trpc_1.trpc.multiTenancy.cancelSubscription.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Subscription cancelled");
            trpc_1.trpc.multiTenancy.getCurrentSubscription.invalidate();
        },
        onError: function (err) { return sonner_1.toast.error(err.message || "Failed to cancel subscription"); }
    });
    var handlePlanChange = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedPlan)
                        return [2 /*return*/];
                    return [4 /*yield*/, changePlanMutation.mutateAsync({ planKey: selectedPlan })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var handleCancelSubscription = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm("Are you sure you want to cancel your subscription?"))
                        return [2 /*return*/];
                    return [4 /*yield*/, cancelSubscriptionMutation.mutateAsync()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    if (!user) {
        navigate("/login");
        return null;
    }
    return (react_1["default"].createElement("div", { className: "min-h-screen bg-background" },
        react_1["default"].createElement("div", { className: "border-b bg-card" },
            react_1["default"].createElement("div", { className: "container mx-auto px-4 py-6" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("h1", { className: "text-2xl font-bold" }, "Customer Portal"),
                        react_1["default"].createElement("p", { className: "text-muted-foreground" }, "Manage your subscription and billing")),
                    react_1["default"].createElement("div", { className: "flex items-center gap-4" },
                        react_1["default"].createElement("div", { className: "text-right" },
                            react_1["default"].createElement("p", { className: "font-medium" }, user.name),
                            react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, user.email)),
                        react_1["default"].createElement("div", { className: "h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center" },
                            react_1["default"].createElement(lucide_react_1.User, { className: "h-5 w-5" })))))),
        react_1["default"].createElement("div", { className: "container mx-auto px-4 py-8" },
            react_1["default"].createElement(tabs_1.Tabs, { value: activeTab, onValueChange: setActiveTab },
                react_1["default"].createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-4" },
                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "overview" }, "Overview"),
                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "subscription" }, "Subscription"),
                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "billing" }, "Billing"),
                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "settings" }, "Settings")),
                react_1["default"].createElement(tabs_1.TabsContent, { value: "overview", className: "space-y-6" },
                    react_1["default"].createElement("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3" },
                        react_1["default"].createElement(card_1.Card, null,
                            react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                                react_1["default"].createElement(card_1.CardTitle, { className: "text-lg" }, "Subscription Status")),
                            react_1["default"].createElement(card_1.CardContent, null, subLoading ? (react_1["default"].createElement("div", { className: "flex items-center justify-center py-8" },
                                react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin" }))) : subscription ? (react_1["default"].createElement("div", { className: "space-y-3" },
                                react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                                    react_1["default"].createElement("span", { className: "font-medium" }, subscription.planName),
                                    react_1["default"].createElement(StatusBadge, { status: subscription.status })),
                                react_1["default"].createElement("div", { className: "text-2xl font-bold" },
                                    "Ksh ", (_a = subscription.monthlyAmount) === null || _a === void 0 ? void 0 :
                                    _a.toLocaleString(),
                                    "/mo"),
                                react_1["default"].createElement("div", { className: "text-sm text-muted-foreground" },
                                    "Next billing: ",
                                    subscription.nextBillingDate ? date_fns_1.format(new Date(subscription.nextBillingDate), "MMM dd, yyyy") : "N/A"))) : (react_1["default"].createElement("div", { className: "text-center py-8 text-muted-foreground" }, "No active subscription")))),
                        react_1["default"].createElement(card_1.Card, null,
                            react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                                react_1["default"].createElement(card_1.CardTitle, { className: "text-lg" }, "Recent Invoice")),
                            react_1["default"].createElement(card_1.CardContent, null, invoicesLoading ? (react_1["default"].createElement("div", { className: "flex items-center justify-center py-8" },
                                react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin" }))) : invoices && invoices.length > 0 ? (react_1["default"].createElement("div", { className: "space-y-3" },
                                react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                                    react_1["default"].createElement("span", { className: "font-medium" },
                                        "#",
                                        invoices[0].invoiceNumber),
                                    react_1["default"].createElement(badge_1.Badge, { variant: invoices[0].status === "paid" ? "default" : "secondary" }, invoices[0].status)),
                                react_1["default"].createElement("div", { className: "text-2xl font-bold" },
                                    "Ksh ", (_b = invoices[0].total) === null || _b === void 0 ? void 0 :
                                    _b.toLocaleString()),
                                react_1["default"].createElement("div", { className: "text-sm text-muted-foreground" }, date_fns_1.format(new Date(invoices[0].createdAt), "MMM dd, yyyy")))) : (react_1["default"].createElement("div", { className: "text-center py-8 text-muted-foreground" }, "No invoices yet")))),
                        react_1["default"].createElement(card_1.Card, null,
                            react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                                react_1["default"].createElement(card_1.CardTitle, { className: "text-lg" }, "Quick Actions")),
                            react_1["default"].createElement(card_1.CardContent, { className: "space-y-3" },
                                react_1["default"].createElement(button_1.Button, { variant: "outline", className: "w-full justify-start", onClick: function () { return setActiveTab("subscription"); } },
                                    react_1["default"].createElement(lucide_react_1.Settings, { className: "h-4 w-4 mr-2" }),
                                    "Manage Subscription"),
                                react_1["default"].createElement(button_1.Button, { variant: "outline", className: "w-full justify-start", onClick: function () { return setActiveTab("billing"); } },
                                    react_1["default"].createElement(lucide_react_1.FileText, { className: "h-4 w-4 mr-2" }),
                                    "View Invoices"),
                                react_1["default"].createElement(button_1.Button, { variant: "outline", className: "w-full justify-start", onClick: function () { return window.open("/pricing", "_blank"); } },
                                    react_1["default"].createElement(lucide_react_1.ArrowUpCircle, { className: "h-4 w-4 mr-2" }),
                                    "Upgrade Plan"))))),
                react_1["default"].createElement(tabs_1.TabsContent, { value: "subscription", className: "space-y-6" },
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, null, "Current Subscription"),
                            react_1["default"].createElement(card_1.CardDescription, null, "Manage your subscription plan and billing")),
                        react_1["default"].createElement(card_1.CardContent, { className: "space-y-6" }, subscription ? (react_1["default"].createElement(react_1["default"].Fragment, null,
                            react_1["default"].createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("label", { className: "text-sm font-medium" }, "Plan"),
                                    react_1["default"].createElement("p", { className: "text-lg font-semibold" }, subscription.planName),
                                    react_1["default"].createElement(StatusBadge, { status: subscription.status })),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("label", { className: "text-sm font-medium" }, "Monthly Amount"),
                                    react_1["default"].createElement("p", { className: "text-lg font-semibold" },
                                        "Ksh ", (_c = subscription.monthlyAmount) === null || _c === void 0 ? void 0 :
                                        _c.toLocaleString())),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("label", { className: "text-sm font-medium" }, "Next Billing Date"),
                                    react_1["default"].createElement("p", null, subscription.nextBillingDate ? date_fns_1.format(new Date(subscription.nextBillingDate), "MMMM dd, yyyy") : "N/A")),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("label", { className: "text-sm font-medium" }, "Current Period"),
                                    react_1["default"].createElement("p", null,
                                        subscription.currentPeriodStart ? date_fns_1.format(new Date(subscription.currentPeriodStart), "MMM dd") : "N/A",
                                        " - ",
                                        " ",
                                        subscription.currentPeriodEnd ? date_fns_1.format(new Date(subscription.currentPeriodEnd), "MMM dd, yyyy") : "N/A"))),
                            react_1["default"].createElement(separator_1.Separator, null),
                            react_1["default"].createElement("div", { className: "flex gap-3" },
                                react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return setShowPlanChange(true); }, disabled: subscription.status !== "active" },
                                    react_1["default"].createElement(lucide_react_1.ArrowUpCircle, { className: "h-4 w-4 mr-2" }),
                                    "Change Plan"),
                                react_1["default"].createElement(button_1.Button, { variant: "destructive", onClick: handleCancelSubscription, disabled: subscription.status === "cancelled" },
                                    react_1["default"].createElement(lucide_react_1.XCircle, { className: "h-4 w-4 mr-2" }),
                                    "Cancel Subscription")))) : (react_1["default"].createElement("div", { className: "text-center py-12" },
                            react_1["default"].createElement(lucide_react_1.Building2, { className: "h-12 w-12 mx-auto text-muted-foreground mb-4" }),
                            react_1["default"].createElement("h3", { className: "text-lg font-semibold mb-2" }, "No Active Subscription"),
                            react_1["default"].createElement("p", { className: "text-muted-foreground mb-6" }, "Choose a plan to get started"),
                            react_1["default"].createElement(button_1.Button, { onClick: function () { return window.open("/pricing", "_blank"); } }, "View Plans")))))),
                react_1["default"].createElement(tabs_1.TabsContent, { value: "billing", className: "space-y-6" },
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, null, "Invoice History"),
                            react_1["default"].createElement(card_1.CardDescription, null, "View and download your invoices")),
                        react_1["default"].createElement(card_1.CardContent, null, invoicesLoading ? (react_1["default"].createElement("div", { className: "flex items-center justify-center py-8" },
                            react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin" }))) : invoices && invoices.length > 0 ? (react_1["default"].createElement(table_1.Table, null,
                            react_1["default"].createElement(table_1.TableHeader, null,
                                react_1["default"].createElement(table_1.TableRow, null,
                                    react_1["default"].createElement(table_1.TableHead, null, "Invoice #"),
                                    react_1["default"].createElement(table_1.TableHead, null, "Date"),
                                    react_1["default"].createElement(table_1.TableHead, null, "Amount"),
                                    react_1["default"].createElement(table_1.TableHead, null, "Status"),
                                    react_1["default"].createElement(table_1.TableHead, null, "Actions"))),
                            react_1["default"].createElement(table_1.TableBody, null, invoices.map(function (invoice) {
                                var _a;
                                return (react_1["default"].createElement(table_1.TableRow, { key: invoice.id },
                                    react_1["default"].createElement(table_1.TableCell, { className: "font-medium" },
                                        "#",
                                        invoice.invoiceNumber),
                                    react_1["default"].createElement(table_1.TableCell, null, date_fns_1.format(new Date(invoice.createdAt), "MMM dd, yyyy")),
                                    react_1["default"].createElement(table_1.TableCell, null,
                                        "Ksh ", (_a = invoice.total) === null || _a === void 0 ? void 0 :
                                        _a.toLocaleString()),
                                    react_1["default"].createElement(table_1.TableCell, null,
                                        react_1["default"].createElement(badge_1.Badge, { variant: invoice.status === "paid" ? "default" : "secondary" }, invoice.status)),
                                    react_1["default"].createElement(table_1.TableCell, null,
                                        react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm" },
                                            react_1["default"].createElement(lucide_react_1.Download, { className: "h-4 w-4" })))));
                            })))) : (react_1["default"].createElement("div", { className: "text-center py-8 text-muted-foreground" }, "No invoices found")))),
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, null, "Payment History"),
                            react_1["default"].createElement(card_1.CardDescription, null, "View your payment transactions")),
                        react_1["default"].createElement(card_1.CardContent, null, paymentsLoading ? (react_1["default"].createElement("div", { className: "flex items-center justify-center py-8" },
                            react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin" }))) : payments && payments.length > 0 ? (react_1["default"].createElement(table_1.Table, null,
                            react_1["default"].createElement(table_1.TableHeader, null,
                                react_1["default"].createElement(table_1.TableRow, null,
                                    react_1["default"].createElement(table_1.TableHead, null, "Date"),
                                    react_1["default"].createElement(table_1.TableHead, null, "Amount"),
                                    react_1["default"].createElement(table_1.TableHead, null, "Method"),
                                    react_1["default"].createElement(table_1.TableHead, null, "Status"),
                                    react_1["default"].createElement(table_1.TableHead, null, "Reference"))),
                            react_1["default"].createElement(table_1.TableBody, null, payments.map(function (payment) {
                                var _a;
                                return (react_1["default"].createElement(table_1.TableRow, { key: payment.id },
                                    react_1["default"].createElement(table_1.TableCell, null, date_fns_1.format(new Date(payment.createdAt), "MMM dd, yyyy")),
                                    react_1["default"].createElement(table_1.TableCell, null,
                                        "Ksh ", (_a = payment.amount) === null || _a === void 0 ? void 0 :
                                        _a.toLocaleString()),
                                    react_1["default"].createElement(table_1.TableCell, { className: "capitalize" }, payment.paymentMethod),
                                    react_1["default"].createElement(table_1.TableCell, null,
                                        react_1["default"].createElement(badge_1.Badge, { variant: payment.status === "completed" ? "default" : "secondary" }, payment.status)),
                                    react_1["default"].createElement(table_1.TableCell, { className: "font-mono text-xs" }, payment.reference)));
                            })))) : (react_1["default"].createElement("div", { className: "text-center py-8 text-muted-foreground" }, "No payments found"))))),
                react_1["default"].createElement(tabs_1.TabsContent, { value: "settings", className: "space-y-6" },
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, null, "Account Settings"),
                            react_1["default"].createElement(card_1.CardDescription, null, "Manage your account preferences")),
                        react_1["default"].createElement(card_1.CardContent, { className: "space-y-6" },
                            react_1["default"].createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("label", { className: "text-sm font-medium" }, "Name"),
                                    react_1["default"].createElement("p", { className: "mt-1" }, user.name)),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("label", { className: "text-sm font-medium" }, "Email"),
                                    react_1["default"].createElement("p", { className: "mt-1" }, user.email))),
                            react_1["default"].createElement(separator_1.Separator, null),
                            react_1["default"].createElement("div", { className: "space-y-4" },
                                react_1["default"].createElement("h4", { className: "font-medium" }, "Billing Preferences"),
                                react_1["default"].createElement("div", { className: "text-sm text-muted-foreground" }, "Billing preferences and payment methods can be managed in the Billing tab."))))))),
        react_1["default"].createElement(dialog_1.Dialog, { open: showPlanChange, onOpenChange: setShowPlanChange },
            react_1["default"].createElement(dialog_1.DialogContent, null,
                react_1["default"].createElement(dialog_1.DialogHeader, null,
                    react_1["default"].createElement(dialog_1.DialogTitle, null, "Change Subscription Plan"),
                    react_1["default"].createElement(dialog_1.DialogDescription, null, "Select a new plan. Changes will be prorated and applied to your next billing cycle.")),
                react_1["default"].createElement("div", { className: "space-y-4" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "text-sm font-medium" }, "Current Plan"),
                        react_1["default"].createElement("p", { className: "text-lg" }, subscription === null || subscription === void 0 ? void 0 : subscription.planName)),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "text-sm font-medium" }, "New Plan"),
                        react_1["default"].createElement(select_1.Select, { value: selectedPlan, onValueChange: setSelectedPlan },
                            react_1["default"].createElement(select_1.SelectTrigger, null,
                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select a plan" })),
                            react_1["default"].createElement(select_1.SelectContent, null, plans === null || plans === void 0 ? void 0 : plans.map(function (plan) {
                                var _a;
                                return (react_1["default"].createElement(select_1.SelectItem, { key: plan.key, value: plan.key },
                                    plan.label,
                                    " - Ksh ", (_a = plan.monthlyPrice) === null || _a === void 0 ? void 0 :
                                    _a.toLocaleString(),
                                    "/mo"));
                            }))))),
                react_1["default"].createElement(dialog_1.DialogFooter, null,
                    react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return setShowPlanChange(false); } }, "Cancel"),
                    react_1["default"].createElement(button_1.Button, { onClick: handlePlanChange, disabled: !selectedPlan || changePlanMutation.isLoading },
                        changePlanMutation.isLoading && react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
                        "Change Plan"))))));
}
exports["default"] = CustomerPortal;
