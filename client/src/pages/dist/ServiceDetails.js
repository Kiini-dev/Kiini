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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var wouter_1 = require("wouter");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var badge_1 = require("@/components/ui/badge");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var DeleteConfirmationModal_1 = require("@/components/DeleteConfirmationModal");
var react_1 = require("react");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var mutationHelpers_1 = require("@/lib/mutationHelpers");
var RichTextEditor_1 = require("@/components/RichTextEditor");
function ServiceDetails() {
    var _this = this;
    var id = wouter_1.useParams().id;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = react_1.useState(false), showDeleteModal = _b[0], setShowDeleteModal = _b[1];
    var _c = react_1.useState(false), isDeleting = _c[0], setIsDeleting = _c[1];
    var _d = react_1.useState(""), newDeliverable = _d[0], setNewDeliverable = _d[1];
    // Fetch service from backend
    var _e = trpc_1.trpc.services.getById.useQuery(id || ""), serviceData = _e.data, isLoading = _e.isLoading;
    var utils = trpc_1.trpc.useUtils();
    var updateServiceMutation = trpc_1.trpc.services.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Service deliverables updated.");
            utils.services.getById.invalidate(id || "");
            setNewDeliverable("");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to update deliverables");
        }
    });
    // Fetch invoices that use this service (mock - would need backend support)
    var _f = trpc_1.trpc.invoices.list.useQuery({ limit: 100 }).data, invoicesData = _f === void 0 ? [] : _f;
    var deleteServiceMutation = trpc_1.trpc.services["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Service deleted successfully");
            utils.services.list.invalidate();
            navigate("/services");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete service");
        }
    });
    var serviceDeliverables = react_1.useMemo(function () {
        if (!serviceData)
            return [];
        var raw = serviceData.deliverables;
        if (Array.isArray(raw))
            return raw;
        if (typeof raw === "string") {
            try {
                return JSON.parse(raw);
            }
            catch (_a) {
                return raw ? [raw] : [];
            }
        }
        return [];
    }, [serviceData]);
    var service = serviceData ? {
        id: serviceData.id || id || "1",
        name: serviceData.name || "Unknown Service",
        code: serviceData.code || "SVC-" + id,
        category: serviceData.category || "General",
        rate: (serviceData.hourlyRate || 0) / 100,
        billingType: serviceData.billingType || "hourly",
        status: serviceData.status || "active",
        description: serviceData.description || ""
    } : null;
    var handleEdit = function () {
        navigate("/services/" + id + "/edit");
    };
    var handleDelete = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsDeleting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, mutationHelpers_1["default"](deleteServiceMutation, id || "")];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    setIsDeleting(false);
                    setShowDeleteModal(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    if (isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Service Details", icon: React.createElement(lucide_react_1.Wrench, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Dashboard", href: "/" },
                { label: "Services", href: "/services" },
                { label: "Details" },
            ], backLink: { label: "Services", href: "/services" } },
            React.createElement("div", { className: "flex items-center justify-center h-64" },
                React.createElement("p", null, "Loading service..."))));
    }
    if (!service) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Service Details", icon: React.createElement(lucide_react_1.Wrench, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Dashboard", href: "/" },
                { label: "Services", href: "/services" },
                { label: "Details" },
            ], backLink: { label: "Services", href: "/services" } },
            React.createElement("div", { className: "flex flex-col items-center justify-center h-64 gap-4" },
                React.createElement("p", null, "Service not found"),
                React.createElement(button_1.Button, { onClick: function () { return navigate("/services"); } }, "Back to Services"))));
    }
    // Calculate mock statistics
    var serviceInvoices = invoicesData.filter(function (inv) {
        return (inv.items || []).some(function (item) { return item.serviceId === id; });
    });
    var serviceRevenue = serviceInvoices.reduce(function (sum, inv) {
        return sum + ((inv.items || []).filter(function (item) { return item.serviceId === id; })
            .reduce(function (itemSum, item) { return itemSum + (item.amount || 0); }, 0));
    }, 0);
    var deliverableCount = serviceDeliverables.length;
    var handleAddDeliverable = function () {
        var value = newDeliverable.trim();
        if (!value || !id)
            return;
        updateServiceMutation.mutate({ id: id, deliverables: __spreadArrays(serviceDeliverables, [value]) });
    };
    var handleRemoveDeliverable = function (index) {
        if (!id)
            return;
        updateServiceMutation.mutate({ id: id, deliverables: serviceDeliverables.filter(function (_, i) { return i !== index; }) });
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: service.name, icon: React.createElement(lucide_react_1.Wrench, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Services", href: "/services" },
            { label: service.name },
        ], backLink: { label: "Services", href: "/services" } },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "flex gap-2" },
                React.createElement(button_1.Button, { onClick: handleEdit, variant: "default" },
                    React.createElement(lucide_react_1.Edit, { className: "mr-2 h-4 w-4" }),
                    "Edit Service"),
                React.createElement(button_1.Button, { variant: "destructive", onClick: function () { return setShowDeleteModal(true); } },
                    React.createElement(lucide_react_1.Trash2, { className: "mr-2 h-4 w-4" }),
                    "Delete")),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-muted-foreground" }, "Rate")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" },
                            "KES ",
                            service.rate.toLocaleString('en-KE', { maximumFractionDigits: 0 })),
                        React.createElement("p", { className: "text-xs text-muted-foreground mt-1" }, service.billingType))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-muted-foreground" }, "Total Revenue")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold text-emerald-600" },
                            "KES ",
                            (serviceRevenue / 100).toLocaleString('en-KE', { maximumFractionDigits: 0 })),
                        React.createElement("p", { className: "text-xs text-muted-foreground mt-1" },
                            serviceInvoices.length,
                            " invoices"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-muted-foreground" }, "Status")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement(badge_1.Badge, { className: "mt-1", variant: service.status === "active" ? "default" : "secondary" }, service.status))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-muted-foreground" }, "Deliverables")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" }, deliverableCount),
                        React.createElement("p", { className: "text-xs text-muted-foreground mt-1" }, "attached")))),
            React.createElement(tabs_1.Tabs, { defaultValue: "overview", className: "space-y-4" },
                React.createElement(tabs_1.TabsList, null,
                    React.createElement(tabs_1.TabsTrigger, { value: "overview" }, "Overview"),
                    React.createElement(tabs_1.TabsTrigger, { value: "deliverables" }, "Deliverables"),
                    React.createElement(tabs_1.TabsTrigger, { value: "usage" }, "Usage"),
                    React.createElement(tabs_1.TabsTrigger, { value: "revenue" }, "Revenue"),
                    React.createElement(tabs_1.TabsTrigger, { value: "invoices" }, "Invoices")),
                React.createElement(tabs_1.TabsContent, { value: "overview", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Service Information")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("div", { className: "grid gap-6 md:grid-cols-2" },
                                React.createElement("div", null,
                                    React.createElement("label", { className: "text-sm font-medium" }, "Service Name"),
                                    React.createElement("p", { className: "text-muted-foreground mt-1" }, service.name)),
                                React.createElement("div", null,
                                    React.createElement("label", { className: "text-sm font-medium" }, "Service Code"),
                                    React.createElement("p", { className: "text-muted-foreground mt-1" }, service.code)),
                                React.createElement("div", null,
                                    React.createElement("label", { className: "text-sm font-medium" }, "Category"),
                                    React.createElement("p", { className: "text-muted-foreground mt-1" }, service.category)),
                                React.createElement("div", null,
                                    React.createElement("label", { className: "text-sm font-medium" }, "Billing Type"),
                                    React.createElement("p", { className: "text-muted-foreground mt-1 capitalize" }, service.billingType)),
                                React.createElement("div", null,
                                    React.createElement("label", { className: "text-sm font-medium" }, "Service Rate"),
                                    React.createElement("p", { className: "text-muted-foreground mt-1" },
                                        "KES ",
                                        service.rate.toLocaleString('en-KE'),
                                        " per ",
                                        service.billingType)),
                                React.createElement("div", null,
                                    React.createElement("label", { className: "text-sm font-medium" }, "Status"),
                                    React.createElement(badge_1.Badge, { className: "mt-1", variant: service.status === "active" ? "default" : "secondary" }, service.status))),
                            service.description && (React.createElement("div", { className: "mt-6 pt-6 border-t" },
                                React.createElement("label", { className: "text-sm font-medium" }, "Description"),
                                React.createElement(RichTextEditor_1.RichTextDisplay, { html: service.description, className: "text-muted-foreground mt-2" })))))),
                React.createElement(tabs_1.TabsContent, { value: "deliverables", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("div", null,
                                    React.createElement(card_1.CardTitle, null, "Service Deliverables"),
                                    React.createElement(card_1.CardDescription, null, "Manage what clients receive with this service")))),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("div", { className: "space-y-4" },
                                React.createElement("div", { className: "grid gap-2 md:grid-cols-[1fr_auto] items-end" },
                                    React.createElement(input_1.Input, { placeholder: "Enter a new deliverable", value: newDeliverable, onChange: function (e) { return setNewDeliverable(e.target.value); } }),
                                    React.createElement(button_1.Button, { type: "button", onClick: handleAddDeliverable, disabled: !newDeliverable.trim() || updateServiceMutation.isPending },
                                        React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
                                        " Add Deliverable")),
                                serviceDeliverables.length > 0 ? (React.createElement("div", { className: "space-y-2" }, serviceDeliverables.map(function (deliverable, index) { return (React.createElement("div", { key: index, className: "flex items-center justify-between rounded-md border p-3" },
                                    React.createElement("span", { className: "text-sm text-muted-foreground" }, deliverable),
                                    React.createElement(button_1.Button, { type: "button", variant: "ghost", size: "sm", onClick: function () { return handleRemoveDeliverable(index); }, disabled: updateServiceMutation.isPending }, "Remove"))); }))) : (React.createElement("div", { className: "text-center py-12 text-muted-foreground" },
                                    React.createElement(lucide_react_1.Package, { className: "h-12 w-12 mx-auto opacity-50 mb-3" }),
                                    React.createElement("p", null, "No deliverables defined for this service yet"),
                                    React.createElement("p", { className: "text-xs mt-1" }, "Add deliverables to clarify what clients receive"))))))),
                React.createElement(tabs_1.TabsContent, { value: "usage", className: "space-y-4" },
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, { className: "pb-2" },
                                React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Times Used")),
                            React.createElement(card_1.CardContent, null,
                                React.createElement("p", { className: "text-3xl font-bold" }, serviceInvoices.length),
                                React.createElement("p", { className: "text-xs text-muted-foreground mt-1" }, "in invoices"))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, { className: "pb-2" },
                                React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Total Units")),
                            React.createElement(card_1.CardContent, null,
                                React.createElement("p", { className: "text-3xl font-bold" }, serviceInvoices.reduce(function (sum, inv) {
                                    return sum + ((inv.items || []).filter(function (item) { return item.serviceId === id; })
                                        .reduce(function (itemSum, item) { return itemSum + (item.quantity || 0); }, 0));
                                }, 0)),
                                React.createElement("p", { className: "text-xs text-muted-foreground mt-1" }, "units sold"))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, { className: "pb-2" },
                                React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Avg Value")),
                            React.createElement(card_1.CardContent, null,
                                React.createElement("p", { className: "text-3xl font-bold text-emerald-600" },
                                    "KES ",
                                    serviceInvoices.length > 0 ? (serviceRevenue / serviceInvoices.length / 100).toLocaleString('en-KE', { maximumFractionDigits: 0 }) : '0'),
                                React.createElement("p", { className: "text-xs text-muted-foreground mt-1" }, "per invoice")))),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "text-sm" }, "Usage Trend")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("div", { className: "flex items-center justify-center h-48 text-muted-foreground" },
                                React.createElement("p", null, "Usage trend chart would appear here"))))),
                React.createElement(tabs_1.TabsContent, { value: "revenue", className: "space-y-4" },
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, { className: "pb-2" },
                                React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Total Revenue")),
                            React.createElement(card_1.CardContent, null,
                                React.createElement("p", { className: "text-3xl font-bold text-emerald-600" },
                                    "KES ",
                                    (serviceRevenue / 100).toLocaleString('en-KE', { maximumFractionDigits: 0 })),
                                React.createElement("p", { className: "text-xs text-muted-foreground mt-1" }, "all time"))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, { className: "pb-2" },
                                React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Revenue Growth")),
                            React.createElement(card_1.CardContent, { className: "flex items-center gap-2" },
                                React.createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5 text-emerald-600" }),
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-2xl font-bold" }, "+12.5%"),
                                    React.createElement("p", { className: "text-xs text-muted-foreground" }, "vs last month"))))),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "text-sm" }, "Revenue Breakdown")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("div", { className: "space-y-4" }, serviceInvoices.length > 0 ? (React.createElement("div", { className: "space-y-2" },
                                React.createElement("p", { className: "text-sm text-muted-foreground" },
                                    "Distributed across ",
                                    serviceInvoices.length,
                                    " invoices"),
                                React.createElement("div", { className: "h-2 bg-slate-100 rounded-full overflow-hidden" },
                                    React.createElement("div", { className: "h-full bg-emerald-500", style: { width: "100%" } })))) : (React.createElement("div", { className: "text-center py-6 text-muted-foreground" },
                                React.createElement(lucide_react_1.AlertCircle, { className: "h-8 w-8 mx-auto opacity-50 mb-2" }),
                                React.createElement("p", { className: "text-sm" }, "No revenue data available"))))))),
                React.createElement(tabs_1.TabsContent, { value: "invoices", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "text-sm" }, "Invoices Using This Service")),
                        React.createElement(card_1.CardContent, null, serviceInvoices.length > 0 ? (React.createElement("div", { className: "space-y-3" }, serviceInvoices.map(function (invoice) {
                            var serviceItems = (invoice.items || []).filter(function (item) { return item.serviceId === id; });
                            var invoiceServiceTotal = serviceItems.reduce(function (sum, item) { return sum + (item.amount || 0); }, 0);
                            return (React.createElement("div", { key: invoice.id, className: "p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer", onClick: function () { return navigate("/invoices/" + invoice.id); } },
                                React.createElement("div", { className: "flex items-start justify-between" },
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "font-medium text-sm" }, invoice.invoiceNumber || "INV-" + invoice.id),
                                        React.createElement("p", { className: "text-xs text-muted-foreground mt-1" }, invoice.clientName || invoice.clientId || "Unknown Client"),
                                        React.createElement("p", { className: "text-xs text-muted-foreground" }, new Date(invoice.invoiceDate).toLocaleDateString('en-KE'))),
                                    React.createElement("div", { className: "text-right" },
                                        React.createElement("p", { className: "font-medium text-sm text-emerald-600" },
                                            "KES ",
                                            (invoiceServiceTotal / 100).toLocaleString('en-KE')),
                                        React.createElement(badge_1.Badge, { variant: "outline", className: "text-xs mt-1" }, invoice.status || "pending")))));
                        }))) : (React.createElement("div", { className: "text-center py-8 text-muted-foreground" },
                            React.createElement(lucide_react_1.FileText, { className: "h-12 w-12 mx-auto opacity-50 mb-2" }),
                            React.createElement("p", null, "No invoices found using this service")))))))),
        React.createElement(DeleteConfirmationModal_1["default"], { isOpen: showDeleteModal, onCancel: function () { return setShowDeleteModal(false); }, onConfirm: handleDelete, isLoading: isDeleting, title: "Delete Service", description: "Are you sure you want to delete this service? This action cannot be undone." })));
}
exports["default"] = ServiceDetails;
