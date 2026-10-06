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
var wouter_1 = require("wouter");
var react_1 = require("react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var tabs_1 = require("@/components/ui/tabs");
var table_1 = require("@/components/ui/table");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var utils_1 = require("@/lib/utils");
var mutationHelpers_1 = require("@/lib/mutationHelpers");
var STATUS_STYLES = {
    active: { label: "Active", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400", icon: React.createElement(lucide_react_1.CheckCircle2, { className: "h-3 w-3" }) },
    trial: { label: "Trial", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400", icon: React.createElement(lucide_react_1.Clock, { className: "h-3 w-3" }) },
    suspended: { label: "Suspended", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400", icon: React.createElement(lucide_react_1.AlertTriangle, { className: "h-3 w-3" }) },
    cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400", icon: React.createElement(lucide_react_1.XCircle, { className: "h-3 w-3" }) },
    expired: { label: "Expired", className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400", icon: React.createElement(lucide_react_1.XCircle, { className: "h-3 w-3" }) }
};
function StatusBadge(_a) {
    var status = _a.status;
    var s = STATUS_STYLES[status] || STATUS_STYLES.active;
    return (React.createElement(badge_1.Badge, { className: utils_1.cn("gap-1 border-0 font-medium text-xs", s.className) },
        s.icon,
        " ",
        s.label));
}
function SubscriptionDetails() {
    var _this = this;
    var _a = wouter_1.useRoute("/subscriptions/:id"), params = _a[1];
    var _b = wouter_1.useLocation(), navigate = _b[1];
    var subscriptionId = (params === null || params === void 0 ? void 0 : params.id) || "";
    var _c = react_1.useState(false), isDeleting = _c[0], setIsDeleting = _c[1];
    // Fetch subscription (recurring invoice)
    var _d = trpc_1.trpc.recurringInvoices.getById.useQuery(subscriptionId), subData = _d.data, isLoading = _d.isLoading, refetch = _d.refetch;
    var _e = trpc_1.trpc.clients.list.useQuery({}).data, clientsData = _e === void 0 ? [] : _e;
    var _f = trpc_1.trpc.invoices.list.useQuery({}).data, invoicesList = _f === void 0 ? [] : _f;
    // Get client info
    var client = subData && clientsData ? clientsData.find(function (c) { return c.id === subData.clientId; }) : null;
    var utils = trpc_1.trpc.useUtils();
    var deleteMutation = trpc_1.trpc.recurringInvoices["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Subscription deleted successfully");
            utils.recurringInvoices.list.invalidate();
            navigate("/subscriptions");
        },
        onError: function (err) { return sonner_1.toast.error(err.message || "Failed to delete subscription"); }
    });
    var toggleMutation = trpc_1.trpc.recurringInvoices.toggleActive.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Subscription status updated");
            refetch();
        },
        onError: function (err) { return sonner_1.toast.error(err.message || "Failed to update subscription"); }
    });
    var handleDelete = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsDeleting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, mutationHelpers_1["default"](deleteMutation, subscriptionId)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    setIsDeleting(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleToggleStatus = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, mutationHelpers_1["default"](toggleMutation, subscriptionId)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var subscription = subData ? {
        id: subscriptionId,
        clientId: subData.clientId,
        clientName: (client === null || client === void 0 ? void 0 : client.companyName) || (client === null || client === void 0 ? void 0 : client.name) || "Unknown Client",
        clientEmail: (client === null || client === void 0 ? void 0 : client.email) || "",
        clientPhone: (client === null || client === void 0 ? void 0 : client.phone) || "",
        clientAddress: (client === null || client === void 0 ? void 0 : client.address) || "",
        description: subData.description || "Subscription",
        title: subData.title || "Subscription",
        amount: (subData.amount || 0) / 100,
        frequency: subData.frequency || "monthly",
        startDate: subData.startDate,
        nextDueDate: subData.nextDueDate,
        endDate: subData.endDate,
        isActive: subData.isActive,
        notes: subData.notes || ""
    } : null;
    // Get related invoices
    var relatedInvoices = subscription && invoicesList ? invoicesList
        .filter(function (inv) { return inv.recurringInvoiceId === subscriptionId; })
        .slice(0, 10)
        : [];
    var getStatusDisplay = function () {
        if (!subscription)
            return "unknown";
        return subscription.isActive ? "active" : "cancelled";
    };
    var getFrequencyLabel = function () {
        var _a;
        if (!subscription)
            return "N/A";
        var freq = ((_a = subscription.frequency) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || "monthly";
        var map = {
            weekly: "Weekly",
            biweekly: "Bi-weekly",
            monthly: "Monthly",
            quarterly: "Quarterly",
            annually: "Annually",
            yearly: "Annually"
        };
        return map[freq] || "Monthly";
    };
    if (isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Subscription Details", icon: React.createElement(lucide_react_1.Repeat2, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Dashboard", href: "/" },
                { label: "Subscriptions", href: "/subscriptions" },
                { label: "Details" },
            ], backLink: { label: "Subscriptions", href: "/subscriptions" } },
            React.createElement("div", { className: "flex items-center justify-center h-64" },
                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-muted-foreground" }))));
    }
    if (!subscription) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Subscription Details", icon: React.createElement(lucide_react_1.Repeat2, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Dashboard", href: "/" },
                { label: "Subscriptions", href: "/subscriptions" },
                { label: "Details" },
            ], backLink: { label: "Subscriptions", href: "/subscriptions" } },
            React.createElement("div", { className: "flex flex-col items-center justify-center h-64 gap-4" },
                React.createElement(lucide_react_1.AlertCircle, { className: "h-8 w-8 text-muted-foreground" }),
                React.createElement("p", null, "Subscription not found"),
                React.createElement(button_1.Button, { onClick: function () { return navigate("/subscriptions"); } }, "Back to Subscriptions"))));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Subscription Details", icon: React.createElement(lucide_react_1.Repeat2, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Subscriptions", href: "/subscriptions" },
            { label: subscription.clientName },
        ], backLink: { label: "Subscriptions", href: "/subscriptions" } },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", null),
                React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement(button_1.Button, { variant: subscription.isActive ? "outline" : "default", onClick: handleToggleStatus },
                        React.createElement(lucide_react_1.RefreshCw, { className: "mr-2 h-4 w-4" }),
                        subscription.isActive ? "Suspend" : "Reactivate"),
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return navigate("/subscriptions/" + subscriptionId + "/edit"); } },
                        React.createElement(lucide_react_1.Edit, { className: "mr-2 h-4 w-4" }),
                        "Edit"),
                    React.createElement(button_1.Button, { variant: "destructive", size: "icon", onClick: handleDelete, disabled: isDeleting },
                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))),
            React.createElement("div", { className: "flex flex-col lg:flex-row gap-6" },
                React.createElement("div", { className: "w-full lg:w-80 shrink-0 space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardContent, { className: "pt-6 space-y-5" },
                            React.createElement("div", { className: "text-center space-y-2" },
                                React.createElement("div", { className: "flex items-center justify-center gap-2" },
                                    React.createElement(lucide_react_1.Repeat2, { className: "h-5 w-5 text-muted-foreground" }),
                                    React.createElement("h2", { className: "text-xl font-bold" }, subscription.title)),
                                React.createElement(StatusBadge, { status: getStatusDisplay() })),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", { className: "space-y-3" },
                                React.createElement("div", { className: "flex items-center gap-3" },
                                    React.createElement(lucide_react_1.Building2, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
                                    React.createElement("div", { className: "min-w-0" },
                                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "Client"),
                                        React.createElement("p", { className: "text-sm font-medium truncate" }, subscription.clientName))),
                                React.createElement("div", { className: "flex items-center gap-3" },
                                    React.createElement(lucide_react_1.Mail, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
                                    React.createElement("div", { className: "min-w-0" },
                                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "Email"),
                                        React.createElement("p", { className: "text-sm font-medium truncate" }, subscription.clientEmail || "—"))),
                                React.createElement("div", { className: "flex items-center gap-3" },
                                    React.createElement(lucide_react_1.Phone, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
                                    React.createElement("div", { className: "min-w-0" },
                                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "Phone"),
                                        React.createElement("p", { className: "text-sm font-medium" }, subscription.clientPhone || "—"))),
                                React.createElement("div", { className: "flex items-center gap-3" },
                                    React.createElement(lucide_react_1.MapPin, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
                                    React.createElement("div", { className: "min-w-0" },
                                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "Address"),
                                        React.createElement("p", { className: "text-sm font-medium" }, subscription.clientAddress || "—"))),
                                React.createElement("div", { className: "flex items-center gap-3" },
                                    React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "Amount"),
                                        React.createElement("p", { className: "text-sm font-bold text-green-600" },
                                            "$",
                                            subscription.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })))),
                                React.createElement("div", { className: "flex items-center gap-3" },
                                    React.createElement(lucide_react_1.RefreshCw, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "Frequency"),
                                        React.createElement("p", { className: "text-sm font-medium" }, getFrequencyLabel()))),
                                React.createElement("div", { className: "flex items-center gap-3" },
                                    React.createElement(lucide_react_1.Calendar, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "Start Date"),
                                        React.createElement("p", { className: "text-sm font-medium" }, subscription.startDate
                                            ? new Date(subscription.startDate).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric"
                                            })
                                            : "—"))),
                                React.createElement("div", { className: "flex items-center gap-3" },
                                    React.createElement(lucide_react_1.Calendar, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "Next Renewal"),
                                        React.createElement("p", { className: "text-sm font-medium" }, subscription.nextDueDate
                                            ? new Date(subscription.nextDueDate).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric"
                                            })
                                            : "—"))))))),
                React.createElement("div", { className: "flex-1 min-w-0" },
                    React.createElement(tabs_1.Tabs, { defaultValue: "overview", className: "w-full" },
                        React.createElement(tabs_1.TabsList, null,
                            React.createElement(tabs_1.TabsTrigger, { value: "overview" }, "Overview"),
                            React.createElement(tabs_1.TabsTrigger, { value: "invoices" },
                                "Invoices (",
                                relatedInvoices.length,
                                ")")),
                        React.createElement(tabs_1.TabsContent, { value: "overview", className: "space-y-4" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement(card_1.CardTitle, { className: "text-lg" }, "Subscription Details"),
                                    React.createElement(card_1.CardDescription, null, "Plan and renewal information")),
                                React.createElement(card_1.CardContent, { className: "space-y-6" },
                                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                                        React.createElement("div", null,
                                            React.createElement("p", { className: "text-sm font-medium text-muted-foreground mb-1" }, "Plan Name"),
                                            React.createElement("p", { className: "text-base font-semibold" }, subscription.title)),
                                        React.createElement("div", null,
                                            React.createElement("p", { className: "text-sm font-medium text-muted-foreground mb-1" }, "Status"),
                                            React.createElement(StatusBadge, { status: getStatusDisplay() })),
                                        React.createElement("div", null,
                                            React.createElement("p", { className: "text-sm font-medium text-muted-foreground mb-1" }, "Billing Frequency"),
                                            React.createElement("p", { className: "text-base font-semibold" }, getFrequencyLabel())),
                                        React.createElement("div", null,
                                            React.createElement("p", { className: "text-sm font-medium text-muted-foreground mb-1" }, "Amount Per Cycle"),
                                            React.createElement("p", { className: "text-base font-semibold text-green-600" },
                                                "$",
                                                subscription.amount.toLocaleString("en-US", { minimumFractionDigits: 2 }))),
                                        React.createElement("div", null,
                                            React.createElement("p", { className: "text-sm font-medium text-muted-foreground mb-1" }, "Start Date"),
                                            React.createElement("p", { className: "text-base font-semibold" }, subscription.startDate
                                                ? new Date(subscription.startDate).toLocaleDateString("en-GB", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric"
                                                })
                                                : "—")),
                                        React.createElement("div", null,
                                            React.createElement("p", { className: "text-sm font-medium text-muted-foreground mb-1" }, "Next Renewal Date"),
                                            React.createElement("p", { className: "text-base font-semibold" }, subscription.nextDueDate
                                                ? new Date(subscription.nextDueDate).toLocaleDateString("en-GB", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric"
                                                })
                                                : "—"))),
                                    subscription.endDate && (React.createElement(React.Fragment, null,
                                        React.createElement(separator_1.Separator, null),
                                        React.createElement("div", null,
                                            React.createElement("p", { className: "text-sm font-medium text-muted-foreground mb-1" }, "End Date"),
                                            React.createElement("p", { className: "text-base font-semibold" }, new Date(subscription.endDate).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric"
                                            }))))),
                                    subscription.notes && (React.createElement(React.Fragment, null,
                                        React.createElement(separator_1.Separator, null),
                                        React.createElement("div", null,
                                            React.createElement("p", { className: "text-sm font-medium text-muted-foreground mb-2" }, "Notes"),
                                            React.createElement("p", { className: "text-sm text-foreground" }, subscription.notes))))))),
                        React.createElement(tabs_1.TabsContent, { value: "invoices", className: "space-y-4" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement(card_1.CardTitle, { className: "text-lg" }, "Generated Invoices"),
                                    React.createElement(card_1.CardDescription, null, "Last 10 invoices from this subscription")),
                                React.createElement(card_1.CardContent, null, relatedInvoices.length === 0 ? (React.createElement("div", { className: "flex flex-col items-center justify-center py-12 text-muted-foreground" },
                                    React.createElement(lucide_react_1.FileText, { className: "h-8 w-8 mb-2 opacity-30" }),
                                    React.createElement("p", null, "No invoices generated yet"))) : (React.createElement(table_1.Table, null,
                                    React.createElement(table_1.TableHeader, null,
                                        React.createElement(table_1.TableRow, null,
                                            React.createElement(table_1.TableHead, null, "Invoice #"),
                                            React.createElement(table_1.TableHead, null, "Date"),
                                            React.createElement(table_1.TableHead, { className: "text-right" }, "Amount"),
                                            React.createElement(table_1.TableHead, null, "Status"))),
                                    React.createElement(table_1.TableBody, null, relatedInvoices.map(function (inv, idx) { return (React.createElement(table_1.TableRow, { key: inv.id, className: "cursor-pointer hover:bg-muted/50" },
                                        React.createElement(table_1.TableCell, { className: "font-medium" },
                                            React.createElement("a", { href: "/invoices/" + inv.id, className: "text-blue-600 hover:underline" }, inv.invoiceNumber || "INV-" + inv.id.slice(0, 8))),
                                        React.createElement(table_1.TableCell, null, inv.issueDate
                                            ? new Date(inv.issueDate).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric"
                                            })
                                            : "—"),
                                        React.createElement(table_1.TableCell, { className: "text-right font-medium" },
                                            "$",
                                            ((inv.total || 0) / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })),
                                        React.createElement(table_1.TableCell, null,
                                            React.createElement(badge_1.Badge, { variant: "outline", className: "text-xs" }, inv.status || "Draft")))); })))))))))))));
}
exports["default"] = SubscriptionDetails;
