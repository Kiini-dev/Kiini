"use strict";
exports.__esModule = true;
var wouter_1 = require("wouter");
var permissions_1 = require("@/lib/permissions");
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var spinner_1 = require("@/components/ui/spinner");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var UnifiedModuleLayout_1 = require("@/components/UnifiedModuleLayout");
var badge_1 = require("@/components/ui/badge");
var currency_1 = require("@/lib/currency");
function ServiceTemplateDetails() {
    var params = wouter_1.useParams();
    var templateId = params === null || params === void 0 ? void 0 : params.id;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var formatMoney = currency_1.useCurrency().format;
    var canView = permissions_1.useRequireFeature("services:read").allowed;
    var canEdit = permissions_1.useRequireFeature("services:update").allowed;
    var canDelete = permissions_1.useRequireFeature("services:delete").allowed;
    // Fetch template details
    var getQuery = trpc_1.trpc.serviceTemplates.getById.useQuery(templateId || "", {
        enabled: !!templateId,
        onError: function (error) {
            sonner_1.toast.error("Failed to load template: " + error.message);
            setLocation("/service-templates");
        }
    });
    // Fetch usage stats
    var statsQuery = trpc_1.trpc.serviceTemplates.getUsageStats.useQuery(templateId || "", {
        enabled: !!templateId
    });
    // Delete mutation
    var deleteMutation = trpc_1.trpc.serviceTemplates["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Service template deleted successfully");
            setLocation("/service-templates");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to delete: " + error.message);
        }
    });
    var handleDelete = function () {
        if (confirm("Are you sure you want to delete this template?")) {
            deleteMutation.mutate(templateId);
        }
    };
    if (!canView)
        return React.createElement("div", { className: "text-center py-10 text-red-600" }, "Access Denied");
    if (getQuery.isLoading || !getQuery.data)
        return React.createElement(spinner_1.Spinner, null);
    var template = getQuery.data;
    var stats = statsQuery.data;
    var deliverables = template.deliverables
        ? typeof template.deliverables === 'string'
            ? JSON.parse(template.deliverables)
            : template.deliverables
        : [];
    return (React.createElement(UnifiedModuleLayout_1["default"], { pageTitle: template.name, pageDescription: "Service template details and usage information", breadcrumbs: [
            { label: "Services", href: "/services" },
            { label: "Templates", href: "/service-templates" },
            { label: template.name, href: "#" },
        ], secondaryAction: {
            label: "Back",
            icon: lucide_react_1.ArrowLeft,
            onClick: function () { return setLocation("/service-templates"); }
        }, primaryAction: canEdit ? {
            label: "Edit",
            icon: lucide_react_1.Edit,
            onClick: function () { return setLocation("/service-templates/" + template.id + "/edit"); }
        } : undefined },
        React.createElement(UnifiedModuleLayout_1.ContentSection, { variant: "card", className: "mb-4" },
            React.createElement("div", { className: "flex items-center gap-2" },
                React.createElement(badge_1.Badge, { variant: template.isActive ? "default" : "secondary" }, template.isActive ? "Active" : "Inactive"),
                template.category && (React.createElement(badge_1.Badge, { variant: "outline" }, template.category)))),
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-6" },
            template.description && (React.createElement(UnifiedModuleLayout_1.ContentSection, { title: "Description", variant: "card" },
                React.createElement("p", { className: "text-gray-700" }, template.description))),
            React.createElement(UnifiedModuleLayout_1.ContentSection, { title: "Pricing", variant: "card" },
                React.createElement("div", { className: "space-y-2" },
                    template.fixedPrice && (React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", null, "Fixed Price:"),
                        React.createElement("span", { className: "font-semibold" }, formatMoney(template.fixedPrice)))),
                    template.hourlyRate && (React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", null, "Hourly Rate:"),
                        React.createElement("span", { className: "font-semibold" },
                            formatMoney(template.hourlyRate),
                            "/hr"))),
                    !template.fixedPrice && !template.hourlyRate && (React.createElement("div", { className: "text-gray-500" }, "Custom pricing")),
                    React.createElement("div", { className: "flex justify-between pt-2 border-t" },
                        React.createElement("span", null, "Tax Rate:"),
                        React.createElement("span", { className: "font-semibold" },
                            template.taxRate,
                            "%"))))),
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" },
            React.createElement(UnifiedModuleLayout_1.ContentSection, { title: "Unit", variant: "card" },
                React.createElement("p", { className: "text-lg font-semibold" }, template.unit || "—")),
            React.createElement(UnifiedModuleLayout_1.ContentSection, { title: "Est. Duration", variant: "card" },
                React.createElement("p", { className: "text-lg font-semibold" }, template.estimatedDuration ? template.estimatedDuration + " hours" : "—")),
            React.createElement(UnifiedModuleLayout_1.ContentSection, { title: "Created", variant: "card" },
                React.createElement("p", { className: "text-lg font-semibold" }, new Date(template.createdAt).toLocaleDateString()))),
        deliverables.length > 0 && (React.createElement(UnifiedModuleLayout_1.ContentSection, { title: "Deliverables", variant: "card", className: "mb-6" },
            React.createElement("ul", { className: "space-y-2" }, deliverables.map(function (d, i) { return (React.createElement("li", { key: i, className: "flex items-start gap-2" },
                React.createElement("span", { className: "text-blue-600 font-bold" }, "\u2022"),
                React.createElement("span", null, d))); })))),
        template.terms && (React.createElement(UnifiedModuleLayout_1.ContentSection, { title: "Terms & Conditions", variant: "card", className: "mb-6" },
            React.createElement("p", { className: "text-gray-700 whitespace-pre-wrap" }, template.terms))),
        stats && (React.createElement(UnifiedModuleLayout_1.ContentSection, { title: "Usage Statistics", variant: "card", className: "mb-6" },
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                React.createElement("div", null,
                    React.createElement("p", { className: "text-sm text-gray-500" }, "Total Uses"),
                    React.createElement("p", { className: "text-2xl font-bold" }, stats.totalUsages)),
                React.createElement("div", null,
                    React.createElement("p", { className: "text-sm text-gray-500" }, "Total Quantity"),
                    React.createElement("p", { className: "text-2xl font-bold" }, stats.totalQuantity)),
                React.createElement("div", null,
                    React.createElement("p", { className: "text-sm text-gray-500" }, "Total Duration"),
                    React.createElement("p", { className: "text-2xl font-bold" },
                        stats.totalDuration,
                        " hrs")),
                React.createElement("div", null,
                    React.createElement("p", { className: "text-sm text-gray-500" }, "Est. Revenue"),
                    React.createElement("p", { className: "text-2xl font-bold" }, formatMoney(stats.estimatedRevenue)))),
            stats.lastUsed && (React.createElement("p", { className: "mt-4 text-sm text-gray-500" },
                "Last used: ",
                new Date(stats.lastUsed).toLocaleDateString())))),
        React.createElement(UnifiedModuleLayout_1.ContentSection, { variant: "card", className: "flex gap-2" },
            canEdit && (React.createElement(button_1.Button, { onClick: function () { return setLocation("/service-templates/" + template.id + "/edit"); } },
                React.createElement(lucide_react_1.Edit, { className: "w-4 h-4 mr-2" }),
                "Edit Template")),
            canDelete && (React.createElement(button_1.Button, { variant: "destructive", onClick: handleDelete },
                React.createElement(lucide_react_1.Trash2, { className: "w-4 h-4 mr-2" }),
                "Delete Template")),
            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setLocation("/service-templates"); } },
                React.createElement(lucide_react_1.ArrowLeft, { className: "w-4 h-4 mr-2" }),
                "Back")),
        React.createElement(UnifiedModuleLayout_1.MetadataDisplay, { items: {
                "Template ID": template.id,
                "Created": new Date(template.createdAt).toLocaleString(),
                "Last Updated": new Date(template.updatedAt).toLocaleString()
            }, variant: "footer" })));
}
exports["default"] = ServiceTemplateDetails;
