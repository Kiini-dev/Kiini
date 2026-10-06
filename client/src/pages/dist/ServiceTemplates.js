"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var permissions_1 = require("@/lib/permissions");
var trpc_1 = require("@/lib/trpc");
var currency_1 = require("@/lib/currency");
var button_1 = require("@/components/ui/button");
var spinner_1 = require("@/components/ui/spinner");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var UnifiedModuleLayout_1 = require("@/components/UnifiedModuleLayout");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
function ServiceTemplates() {
    var formatMoney = currency_1.useCurrency().format;
    var _a = permissions_1.useRequireFeature("services:read"), allowed = _a.allowed, permLoading = _a.isLoading;
    var canCreate = permissions_1.useRequireFeature("services:create").allowed;
    var canEdit = permissions_1.useRequireFeature("services:update").allowed;
    var canDelete = permissions_1.useRequireFeature("services:delete").allowed;
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    var _c = react_1.useState([]), templates = _c[0], setTemplates = _c[1];
    var _d = react_1.useState(true), isLoading = _d[0], setIsLoading = _d[1];
    var _e = react_1.useState(""), searchTerm = _e[0], setSearchTerm = _e[1];
    var _f = react_1.useState("all"), categoryFilter = _f[0], setCategoryFilter = _f[1];
    var _g = react_1.useState([]), categories = _g[0], setCategories = _g[1];
    // Fetch service templates
    var listQuery = trpc_1.trpc.serviceTemplates.list.useQuery({}, {
        onSuccess: function (data) {
            setTemplates(data || []);
            // Extract unique categories
            var uniqueCategories = Array.from(new Set((data || []).map(function (t) { return t.category; }).filter(Boolean)));
            setCategories(uniqueCategories);
            setIsLoading(false);
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to load service templates: " + error.message);
            setIsLoading(false);
        }
    });
    // Delete mutation
    var deleteMutation = trpc_1.trpc.serviceTemplates["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Service template deleted successfully");
            listQuery.refetch();
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to delete: " + error.message);
        }
    });
    var handleDelete = function (id) {
        if (confirm("Are you sure you want to delete this template?")) {
            deleteMutation.mutate(id);
        }
    };
    // Filter templates
    var filteredTemplates = react_1.useMemo(function () {
        var result = templates;
        if (searchTerm) {
            result = result.filter(function (t) {
                var _a;
                return t.name.toLowerCase().includes(searchTerm.toLowerCase()) || ((_a = t.description) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm.toLowerCase()));
            });
        }
        if (categoryFilter !== "all") {
            result = result.filter(function (t) { return t.category === categoryFilter; });
        }
        return result;
    }, [templates, searchTerm, categoryFilter]);
    // Calculate stats
    var stats = {
        totalTemplates: templates.length,
        activeTemplates: templates.filter(function (t) { return t.isActive; }).length,
        totalValue: templates.reduce(function (sum, t) { return sum + ((t.fixedPrice || 0) + (t.hourlyRate || 0) * 40); }, 0)
    };
    if (permLoading)
        return React.createElement(spinner_1.Spinner, null);
    if (!allowed)
        return React.createElement("div", { className: "text-center py-10 text-red-600" }, "Access Denied");
    return (React.createElement(UnifiedModuleLayout_1["default"], { title: "Service Templates", description: "Manage reusable service templates for invoicing and quotes", breadcrumbs: [
            { label: "Services", href: "/services" },
            { label: "Templates", href: "/service-templates" },
        ], actions: canCreate ? (React.createElement(button_1.Button, { onClick: function () { return setLocation("/service-templates/create"); } },
            React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
            "New Template")) : undefined, themeControl: true, brandControl: true, printable: true },
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" },
            React.createElement(UnifiedModuleLayout_1.DashboardCard, { id: "total-templates", title: "Total Templates", value: stats.totalTemplates.toString(), subtitle: stats.activeTemplates + " active", icon: React.createElement(lucide_react_1.TrendingUp, { className: "w-5 h-5" }), gradient: { from: "#3b82f6", to: "#1d4ed8" } }),
            React.createElement(UnifiedModuleLayout_1.DashboardCard, { id: "active-templates", title: "Active Templates", value: stats.activeTemplates.toString(), subtitle: stats.totalTemplates > 0 ? (stats.activeTemplates / stats.totalTemplates * 100).toFixed(0) + "%" : "0%", icon: React.createElement(lucide_react_1.Eye, { className: "w-5 h-5" }), gradient: { from: "#22c55e", to: "#15803d" } }),
            React.createElement(UnifiedModuleLayout_1.DashboardCard, { id: "monthly-value", title: "Est. Monthly Value", value: formatMoney(stats.totalValue), subtitle: "Based on hourly rates (40hrs)", icon: React.createElement(lucide_react_1.TrendingUp, { className: "w-5 h-5" }), gradient: { from: "#a855f7", to: "#7e22ce" } })),
        React.createElement(UnifiedModuleLayout_1.ContentSection, { title: "Filters", variant: "card" },
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                React.createElement(input_1.Input, { placeholder: "Search templates by name...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); } }),
                React.createElement(select_1.Select, { value: categoryFilter, onValueChange: setCategoryFilter },
                    React.createElement(select_1.SelectTrigger, null,
                        React.createElement(select_1.SelectValue, { placeholder: "Filter by category" })),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "all" }, "All Categories"),
                        categories.map(function (cat) { return (React.createElement(select_1.SelectItem, { key: cat, value: cat }, cat)); }))))),
        isLoading ? (React.createElement(UnifiedModuleLayout_1.ContentSection, { variant: "card" },
            React.createElement("div", { className: "flex justify-center py-10" },
                React.createElement(spinner_1.Spinner, null)))) : filteredTemplates.length === 0 ? (React.createElement(UnifiedModuleLayout_1.ContentSection, { variant: "card" },
            React.createElement("div", { className: "text-center py-10 text-gray-500" }, templates.length === 0
                ? "No service templates created yet"
                : "No templates match your filters"))) : (React.createElement(UnifiedModuleLayout_1.ContentSection, { title: "Service Templates", className: "print-section" },
            React.createElement(UnifiedModuleLayout_1.PrintOptimizedTable, { columns: [
                    { key: "name", label: "Template Name", width: 200 },
                    { key: "category", label: "Category", width: 120 },
                    { key: "pricing", label: "Pricing", width: 150 },
                    { key: "unit", label: "Unit", width: 80 },
                    { key: "taxRate", label: "Tax Rate", width: 80 },
                    { key: "status", label: "Status", width: 100 },
                    { key: "actions", label: "Actions", width: 150, printHidden: true },
                ], data: filteredTemplates.map(function (template) { return ({
                    name: template.name,
                    category: template.category || "—",
                    pricing: template.fixedPrice
                        ? formatMoney(template.fixedPrice)
                        : template.hourlyRate
                            ? formatMoney(template.hourlyRate) + "/hr"
                            : "Custom",
                    unit: template.unit || "—",
                    taxRate: template.taxRate + "%",
                    status: (React.createElement("span", { className: "px-2 py-1 rounded text-xs font-semibold " + (template.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800") }, template.isActive ? "Active" : "Inactive")),
                    actions: (React.createElement("div", { className: "flex gap-2" },
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setLocation("/service-templates/" + template.id); }, title: "View details" },
                            React.createElement(lucide_react_1.Eye, { className: "w-4 h-4" })),
                        canEdit && (React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setLocation("/service-templates/" + template.id + "/edit"); }, title: "Edit template" },
                            React.createElement(lucide_react_1.Edit, { className: "w-4 h-4" }))),
                        canDelete && (React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return handleDelete(template.id); }, title: "Delete template" },
                            React.createElement(lucide_react_1.Trash2, { className: "w-4 h-4" })))))
                }); }) }))),
        React.createElement(UnifiedModuleLayout_1.MetadataDisplay, { items: [
                { label: "Total Records", value: filteredTemplates.length },
                { label: "Last Updated", value: new Date().toLocaleDateString() },
                { label: "System", value: "Service Template Management" },
            ] })));
}
exports["default"] = ServiceTemplates;
