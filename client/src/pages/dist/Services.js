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
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var sonner_1 = require("sonner");
var SearchAndFilter_1 = require("@/components/SearchAndFilter");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
var stats_card_1 = require("@/components/ui/stats-card");
var RowActionsMenu_1 = require("@/components/list-page/RowActionsMenu");
function Services() {
    var _this = this;
    // CALL ALL HOOKS UNCONDITIONALLY AT TOP LEVEL
    var _a = permissions_1.useRequireFeature("services:view"), allowed = _a.allowed, isLoading = _a.isLoading;
    var _b = wouter_1.useLocation(), navigate = _b[1];
    var _c = react_1.useState(""), searchQuery = _c[0], setSearchQuery = _c[1];
    var _d = react_1.useState({
        category: "all",
        status: "all",
        sortBy: "name",
        sortOrder: "asc"
    }), filters = _d[0], setFilters = _d[1];
    // Fetch services from backend
    var _e = trpc_1.trpc.services.list.useQuery(), _f = _e.data, services = _f === void 0 ? [] : _f, isLoadingServices = _e.isLoading;
    var utils = trpc_1.trpc.useUtils();
    // Delete mutation
    var deleteServiceMutation = trpc_1.trpc.services["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Service deleted successfully");
            utils.services.list.invalidate();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete service");
        }
    });
    var filteredServices = services
        .filter(function (service) {
        return service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (service.description && service.description.toLowerCase().includes(searchQuery.toLowerCase()));
    })
        .sort(function (a, b) {
        var aVal = a[filters.sortBy];
        var bVal = b[filters.sortBy];
        if (typeof aVal === "string")
            aVal = aVal.toLowerCase();
        if (typeof bVal === "string")
            bVal = bVal.toLowerCase();
        var comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return filters.sortOrder === "desc" ? -comparison : comparison;
    });
    var handleDeleteService = function (serviceId, serviceName) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (confirm("Are you sure you want to delete service \"" + serviceName + "\"?")) {
                deleteServiceMutation.mutate(serviceId);
            }
            return [2 /*return*/];
        });
    }); };
    // NOW SAFE TO CHECK CONDITIONAL RETURNS (ALL HOOKS ALREADY CALLED)
    if (isLoading) {
        return (React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" })));
    }
    if (!allowed) {
        return null;
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Services", description: "Manage your service offerings and rates", icon: React.createElement(lucide_react_1.Wrench, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Products & Services", href: "/services" },
            { label: "Services", href: "/services" },
        ], actions: React.createElement(button_1.Button, { onClick: function () { return navigate("/services/create"); } },
            React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
            "Add Service") },
        React.createElement("div", { className: "space-y-6" },
            React.createElement(SearchAndFilter_1.ServiceSearchFilter, { onSearch: setSearchQuery, onFilter: setFilters }),
            React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Services", value: services.length, icon: React.createElement(lucide_react_1.Wrench, { className: "h-5 w-5" }), color: "border-l-orange-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Active", value: services.filter(function (s) { return s.isActive !== 0; }).length, icon: React.createElement(lucide_react_1.CheckCircle2, { className: "h-5 w-5" }), color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Avg Rate", value: React.createElement(React.Fragment, null,
                        "Ksh ",
                        services.length > 0 ? (services.reduce(function (sum, s) { return sum + Number(s.hourlyRate || s.fixedPrice || 0); }, 0) / (services.length * 100)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"), icon: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Inactive", value: services.filter(function (s) { return s.isActive === 0; }).length, icon: React.createElement(lucide_react_1.XCircle, { className: "h-5 w-5" }), color: "border-l-red-500" })),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "p-0" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "Name"),
                                React.createElement(table_1.TableHead, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "Category"),
                                React.createElement(table_1.TableHead, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "Rate/Price"),
                                React.createElement(table_1.TableHead, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "Unit"),
                                React.createElement(table_1.TableHead, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "Status"),
                                React.createElement(table_1.TableHead, { className: "text-right px-2 sm:px-3" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, isLoading ? (React.createElement(table_1.TableRow, null,
                            React.createElement(table_1.TableCell, { colSpan: 6, className: "text-center py-8 text-muted-foreground" }, "Loading services..."))) : filteredServices.length === 0 ? (React.createElement(table_1.TableRow, null,
                            React.createElement(table_1.TableCell, { colSpan: 6, className: "text-center py-8 text-muted-foreground" }, "No services found."))) : (filteredServices.map(function (service) { return (React.createElement(table_1.TableRow, { key: service.id },
                            React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm font-medium" }, service.name),
                            React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, service.category || "Uncategorized"),
                            React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm font-semibold" },
                                "Ksh ",
                                (Number(service.hourlyRate || service.fixedPrice || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })),
                            React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, service.unit || "hour"),
                            React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, service.isActive !== 0 ? (React.createElement(badge_1.Badge, { variant: "outline", className: "bg-green-50 text-green-700 border-green-200" }, "Active")) : (React.createElement(badge_1.Badge, { variant: "outline", className: "bg-red-50 text-red-700 border-red-200" }, "Inactive"))),
                            React.createElement(table_1.TableCell, { className: "text-right px-2 sm:px-3" },
                                React.createElement(RowActionsMenu_1.RowActionsMenu, { primaryActions: [
                                        { label: "View", icon: React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" }), onClick: function () { return navigate("/services/" + service.id); } },
                                    ], menuActions: [
                                        { label: "Edit", icon: React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" }), onClick: function () { return navigate("/services/" + service.id + "/edit"); } },
                                        { label: "Delete", icon: React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }), onClick: function () { return handleDeleteService(service.id, service.name); }, variant: "destructive", separator: true },
                                    ] })))); })))))))));
}
exports["default"] = Services;
