"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var trpc_1 = require("@/lib/trpc");
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgBreadcrumb_1 = require("@/components/OrgBreadcrumb");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var badge_1 = require("@/components/ui/badge");
var stats_card_1 = require("@/components/ui/stats-card");
var table_1 = require("@/components/ui/table");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var useOrgPermission_1 = require("@/hooks/useOrgPermission");
function OrgServiceTemplates() {
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var hasPermission = useOrgPermission_1.useOrgPermission().hasPermission;
    var canCreate = hasPermission("service_templates");
    var canEdit = hasPermission("service_templates");
    var canDelete = hasPermission("service_templates");
    var _b = react_1.useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = react_1.useState("all"), categoryFilter = _c[0], setCategoryFilter = _c[1];
    var _d = trpc_1.trpc.serviceTemplates.list.useQuery(undefined), _e = _d.data, templates = _e === void 0 ? [] : _e, isLoadingTemplates = _d.isLoading;
    var utils = trpc_1.trpc.useUtils();
    var deleteTemplateMutation = trpc_1.trpc.serviceTemplates["delete"].useMutation({
        onSuccess: function () {
            var _a, _b;
            (_b = (_a = utils.serviceTemplates.list).invalidate) === null || _b === void 0 ? void 0 : _b.call(_a);
            sonner_1.toast.success("Service template deleted successfully");
        },
        onError: function (error) {
            sonner_1.toast.error((error === null || error === void 0 ? void 0 : error.message) || "Failed to delete template");
        }
    });
    var plainTemplates = Array.isArray(templates)
        ? templates.map(function (template) { return JSON.parse(JSON.stringify(template)); })
        : [];
    var rows = react_1.useMemo(function () {
        return plainTemplates.map(function (template) {
            var _a;
            return ({
                id: template.id,
                name: template.name || "Untitled",
                category: template.category || "General",
                price: template.fixedPrice || template.hourlyRate || 0,
                unit: template.unit || "unit",
                taxRate: template.taxRate || 0,
                isActive: (_a = template.isActive) !== null && _a !== void 0 ? _a : true
            });
        });
    }, [plainTemplates]);
    var categories = react_1.useMemo(function () { return Array.from(new Set(rows.map(function (row) { return row.category; }).filter(Boolean))); }, [rows]);
    var filteredRows = react_1.useMemo(function () {
        return rows.filter(function (template) {
            var matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                template.category.toLowerCase().includes(searchQuery.toLowerCase());
            var matchesCategory = categoryFilter === "all" || template.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [rows, searchQuery, categoryFilter]);
    var stats = react_1.useMemo(function () {
        var totalValue = rows.reduce(function (sum, row) { return sum + row.price; }, 0);
        var active = rows.filter(function (row) { return row.isActive; }).length;
        return {
            count: rows.length,
            active: active,
            totalValue: totalValue
        };
    }, [rows]);
    var handleView = function (id) { return navigate("/org/" + slug + "/service-templates/" + id); };
    var handleEdit = function (id) { return navigate("/org/" + slug + "/service-templates/" + id + "/edit"); };
    var handleDelete = function (id) {
        if (confirm("Delete this service template?")) {
            deleteTemplateMutation.mutate(id);
        }
    };
    var handleNew = function () { return navigate("/org/" + slug + "/service-templates/new"); };
    return (React.createElement(OrgLayout_1["default"], null,
        React.createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [
                { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                { label: "Service Templates", href: "/org/" + slug + "/service-templates" },
            ] }),
        React.createElement("div", { className: "p-6 space-y-6" },
            React.createElement("div", { className: "flex items-center justify-between gap-4 flex-wrap" },
                React.createElement("div", null,
                    React.createElement("h1", { className: "text-3xl font-bold" }, "Service Templates"),
                    React.createElement("p", { className: "text-muted-foreground mt-2" }, "Create reusable service templates for quotes and invoices.")),
                canCreate && (React.createElement(button_1.Button, { onClick: handleNew },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                    "New Template"))),
            React.createElement("div", { className: "grid gap-4 md:grid-cols-3" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Templates", value: stats.count, color: "border-l-slate-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Active Templates", value: stats.active, color: "border-l-emerald-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Pricing", value: "KSh " + (stats.totalValue / 100).toLocaleString(), color: "border-l-blue-500" })),
            React.createElement("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" },
                React.createElement("div", { className: "relative flex-1 min-w-[220px]" },
                    React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                    React.createElement(input_1.Input, { placeholder: "Search templates...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-9" })),
                React.createElement("div", { className: "min-w-[200px]" },
                    React.createElement("select", { "aria-label": "Filter template category", className: "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm", value: categoryFilter, onChange: function (e) { return setCategoryFilter(e.target.value); } },
                        React.createElement("option", { value: "all" }, "All categories"),
                        categories.map(function (category) { return (React.createElement("option", { key: category, value: category }, category)); })))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Service Templates"),
                    React.createElement("p", { className: "text-sm text-muted-foreground" },
                        filteredRows.length,
                        " templates")),
                React.createElement(card_1.CardContent, null, isLoadingTemplates ? (React.createElement("div", { className: "flex justify-center py-10" },
                    React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }))) : filteredRows.length === 0 ? (React.createElement("div", { className: "text-center py-10 text-muted-foreground" },
                    React.createElement(lucide_react_1.AlertCircle, { className: "h-8 w-8 mx-auto mb-2 opacity-50" }),
                    React.createElement("p", null, "No service templates found."))) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Template"),
                                React.createElement(table_1.TableHead, null, "Category"),
                                React.createElement(table_1.TableHead, null, "Price"),
                                React.createElement(table_1.TableHead, null, "Unit"),
                                React.createElement(table_1.TableHead, null, "Tax"),
                                React.createElement(table_1.TableHead, null, "Status"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, filteredRows.map(function (template) { return (React.createElement(table_1.TableRow, { key: template.id },
                            React.createElement(table_1.TableCell, { className: "font-semibold" }, template.name),
                            React.createElement(table_1.TableCell, null, template.category),
                            React.createElement(table_1.TableCell, null,
                                "KSh ",
                                (template.price / 100).toLocaleString()),
                            React.createElement(table_1.TableCell, null, template.unit),
                            React.createElement(table_1.TableCell, null,
                                template.taxRate,
                                "%"),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { variant: template.isActive ? "default" : "secondary" }, template.isActive ? "Active" : "Inactive")),
                            React.createElement(table_1.TableCell, { className: "text-right space-x-2" },
                                React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleView(template.id); }, title: "View" },
                                    React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                canEdit && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleEdit(template.id); }, title: "Edit" },
                                    React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" }))),
                                canDelete && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleDelete(template.id); }, title: "Delete" },
                                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))))); }))))))))));
}
exports["default"] = OrgServiceTemplates;
