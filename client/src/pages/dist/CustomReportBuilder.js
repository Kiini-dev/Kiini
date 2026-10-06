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
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var tabs_1 = require("@/components/ui/tabs");
var select_1 = require("@/components/ui/select");
var checkbox_1 = require("@/components/ui/checkbox");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var table_1 = require("@/components/ui/table");
var trpc_1 = require("@/lib/trpc");
var recharts_1 = require("recharts");
// Fallback tables in case schema introspection fails
var DEFAULT_TABLES = [
    { value: "invoices", label: "Invoices" },
    { value: "payments", label: "Payments" },
    { value: "employees", label: "Employees" },
    { value: "payroll", label: "Payroll" },
    { value: "expenses", label: "Expenses" },
    { value: "clients", label: "Clients" },
    { value: "projects", label: "Projects" },
];
var AGGREGATION_TYPES = [
    { value: "sum", label: "Sum" },
    { value: "avg", label: "Average" },
    { value: "count", label: "Count" },
    { value: "min", label: "Minimum" },
    { value: "max", label: "Maximum" },
];
var CHART_TYPES = [
    { value: "bar", label: "Bar Chart" },
    { value: "line", label: "Line Chart" },
    { value: "pie", label: "Pie Chart" },
    { value: "table", label: "Table" },
];
function CustomReportBuilder() {
    var _a = react_1.useState({
        name: "",
        table: "",
        selectedFields: [],
        filters: [],
        groupBy: "",
        aggregations: [],
        chartType: "table",
        description: ""
    }), reportConfig = _a[0], setReportConfig = _a[1];
    var _b = react_1.useState([]), reportData = _b[0], setReportData = _b[1];
    var _c = react_1.useState(false), showPreview = _c[0], setShowPreview = _c[1];
    var _d = react_1.useState(null), schemaData = _d[0], setSchemaData = _d[1];
    // Fetch schema introspection from backend
    var _e = trpc_1.trpc.reports.schemaIntrospection.useQuery({}), schemaIntrospection = _e.data, schemaLoading = _e.isLoading;
    // Fetch report data
    var _f = trpc_1.trpc.reports.getReportData.useQuery({
        table: reportConfig.table,
        fields: reportConfig.selectedFields,
        filters: reportConfig.filters,
        limit: 100
    }, { enabled: Boolean(reportConfig.table && reportConfig.selectedFields.length > 0) }), reportDataResult = _f.data, reportLoading = _f.isLoading;
    react_1.useEffect(function () {
        if (schemaIntrospection) {
            setSchemaData(schemaIntrospection);
        }
    }, [schemaIntrospection]);
    react_1.useEffect(function () {
        if (reportDataResult) {
            setReportData(reportDataResult);
        }
    }, [reportDataResult]);
    var handleTableChange = function (value) {
        setReportConfig(__assign(__assign({}, reportConfig), { table: value, selectedFields: [], groupBy: "" }));
    };
    var handleFieldToggle = function (field) {
        var updated = reportConfig.selectedFields.includes(field)
            ? reportConfig.selectedFields.filter(function (f) { return f !== field; })
            : __spreadArrays(reportConfig.selectedFields, [field]);
        setReportConfig(__assign(__assign({}, reportConfig), { selectedFields: updated }));
    };
    var handleAddFilter = function () {
        setReportConfig(__assign(__assign({}, reportConfig), { filters: __spreadArrays(reportConfig.filters, [{ field: "", operator: "=", value: "" }]) }));
    };
    var handleRemoveFilter = function (idx) {
        setReportConfig(__assign(__assign({}, reportConfig), { filters: reportConfig.filters.filter(function (_, i) { return i !== idx; }) }));
    };
    var handleAddAggregation = function () {
        setReportConfig(__assign(__assign({}, reportConfig), { aggregations: __spreadArrays(reportConfig.aggregations, [{ field: "", type: "sum" }]) }));
    };
    var handleRemoveAggregation = function (idx) {
        setReportConfig(__assign(__assign({}, reportConfig), { aggregations: reportConfig.aggregations.filter(function (_, i) { return i !== idx; }) }));
    };
    var handleGeneratePreview = function () {
        if (!reportConfig.table) {
            sonner_1.toast.error("Please select a table");
            return;
        }
        if (reportConfig.selectedFields.length === 0) {
            sonner_1.toast.error("Please select at least one field");
            return;
        }
        setShowPreview(true);
        sonner_1.toast.success("Preview generated successfully");
    };
    var handleSaveReport = function () {
        if (!reportConfig.name) {
            sonner_1.toast.error("Please enter a report name");
            return;
        }
        if (!reportConfig.table) {
            sonner_1.toast.error("Please select a table");
            return;
        }
        if (reportConfig.selectedFields.length === 0) {
            sonner_1.toast.error("Please select at least one field");
            return;
        }
        // Save report (would be sent to backend)
        sonner_1.toast.success("Report \"" + reportConfig.name + "\" saved successfully");
    };
    var handleExport = function () {
        if (reportData.length === 0) {
            sonner_1.toast.error("Please generate preview first");
            return;
        }
        // Create CSV
        var headers = reportConfig.selectedFields.length > 0
            ? reportConfig.selectedFields
            : Object.keys(reportData[0] || {});
        var csvContent = __spreadArrays([
            headers.join(",")
        ], reportData.map(function (row) { return headers.map(function (h) { return JSON.stringify(row[h] || ""); }).join(","); })).join("\n");
        var blob = new Blob([csvContent], { type: "text/csv" });
        var link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = reportConfig.name + "_" + new Date().getTime() + ".csv";
        link.click();
        sonner_1.toast.success("Report exported successfully");
    };
    // Get available tables from schema introspection or use defaults
    var availableTables = (schemaData === null || schemaData === void 0 ? void 0 : schemaData.tables) || DEFAULT_TABLES;
    // Get fields for the selected table
    var currentTableSchema = availableTables.find(function (t) { return t.value === reportConfig.table; });
    var fields = (currentTableSchema === null || currentTableSchema === void 0 ? void 0 : currentTableSchema.fields) || [];
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Custom Report Builder", icon: react_1["default"].createElement(lucide_react_1.FileText, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Reports" }, { label: "Custom Report Builder" }] },
        react_1["default"].createElement("div", { className: "flex justify-between items-center" }),
        react_1["default"].createElement(tabs_1.Tabs, { defaultValue: "design", className: "space-y-4" },
            react_1["default"].createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-3" },
                react_1["default"].createElement(tabs_1.TabsTrigger, { value: "design" }, "Design"),
                react_1["default"].createElement(tabs_1.TabsTrigger, { value: "preview" }, "Preview"),
                react_1["default"].createElement(tabs_1.TabsTrigger, { value: "settings" }, "Settings")),
            react_1["default"].createElement(tabs_1.TabsContent, { value: "design", className: "space-y-4" },
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Report Basic Information")),
                    react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "text-sm font-medium mb-2 block" }, "Report Name *"),
                            react_1["default"].createElement(input_1.Input, { value: reportConfig.name, onChange: function (e) {
                                    return setReportConfig(__assign(__assign({}, reportConfig), { name: e.target.value }));
                                }, placeholder: "e.g., Monthly Sales Report" })),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "text-sm font-medium mb-2 block" }, "Description"),
                            react_1["default"].createElement(input_1.Input, { value: reportConfig.description, onChange: function (e) {
                                    return setReportConfig(__assign(__assign({}, reportConfig), { description: e.target.value }));
                                }, placeholder: "Optional description for this report" })))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Data Selection")),
                    react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "text-sm font-medium mb-2 block" }, "Select Table *"),
                            schemaLoading ? (react_1["default"].createElement("div", { className: "flex items-center gap-2 text-gray-600" },
                                react_1["default"].createElement(lucide_react_1.Loader, { className: "w-4 h-4 animate-spin" }),
                                "Loading schema...")) : (react_1["default"].createElement(select_1.Select, { value: reportConfig.table, onValueChange: handleTableChange, disabled: schemaLoading },
                                react_1["default"].createElement(select_1.SelectTrigger, null,
                                    react_1["default"].createElement(select_1.SelectValue, { placeholder: "Choose a table..." })),
                                react_1["default"].createElement(select_1.SelectContent, null, availableTables.map(function (table) { return (react_1["default"].createElement(select_1.SelectItem, { key: table.value, value: table.value }, table.label)); }))))),
                        fields.length > 0 && (react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "text-sm font-medium mb-3 block" }, "Select Fields *"),
                            react_1["default"].createElement("div", { className: "space-y-2" }, fields.map(function (field) { return (react_1["default"].createElement("div", { key: field, className: "flex items-center gap-2" },
                                react_1["default"].createElement(checkbox_1.Checkbox, { checked: reportConfig.selectedFields.includes(field), onCheckedChange: function () { return handleFieldToggle(field); } }),
                                react_1["default"].createElement("label", { className: "text-sm cursor-pointer" }, field))); })))))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, { className: "flex justify-between items-center" },
                        react_1["default"].createElement(card_1.CardTitle, null, "Filters (Optional)"),
                        react_1["default"].createElement(button_1.Button, { size: "sm", onClick: handleAddFilter, className: "gap-1" },
                            react_1["default"].createElement(lucide_react_1.Plus, { className: "w-4 h-4" }),
                            "Add Filter")),
                    react_1["default"].createElement(card_1.CardContent, { className: "space-y-3" },
                        reportConfig.filters.map(function (filter, idx) { return (react_1["default"].createElement("div", { key: filter.field || "filter-" + idx, className: "flex gap-2 items-end" },
                            react_1["default"].createElement(select_1.Select, { value: filter.field, onValueChange: function (value) {
                                    var updated = __spreadArrays(reportConfig.filters);
                                    updated[idx].field = value;
                                    setReportConfig(__assign(__assign({}, reportConfig), { filters: updated }));
                                } },
                                react_1["default"].createElement(select_1.SelectTrigger, { className: "w-32" },
                                    react_1["default"].createElement(select_1.SelectValue, { placeholder: "Field" })),
                                react_1["default"].createElement(select_1.SelectContent, null, fields.map(function (f) { return (react_1["default"].createElement(select_1.SelectItem, { key: f, value: f }, f)); }))),
                            react_1["default"].createElement(select_1.Select, { value: filter.operator, onValueChange: function (value) {
                                    var updated = __spreadArrays(reportConfig.filters);
                                    updated[idx].operator = value;
                                    setReportConfig(__assign(__assign({}, reportConfig), { filters: updated }));
                                } },
                                react_1["default"].createElement(select_1.SelectTrigger, { className: "w-24" },
                                    react_1["default"].createElement(select_1.SelectValue, null)),
                                react_1["default"].createElement(select_1.SelectContent, null,
                                    react_1["default"].createElement(select_1.SelectItem, { value: "=" }, "="),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "!=" }, "!="),
                                    react_1["default"].createElement(select_1.SelectItem, { value: ">" }, ">"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "<" }, "<"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: ">=" }, ">="),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "<=" }, "<="))),
                            react_1["default"].createElement(input_1.Input, { className: "flex-1", placeholder: "Value", value: filter.value, onChange: function (e) {
                                    var updated = __spreadArrays(reportConfig.filters);
                                    updated[idx].value = e.target.value;
                                    setReportConfig(__assign(__assign({}, reportConfig), { filters: updated }));
                                } }),
                            react_1["default"].createElement(button_1.Button, { variant: "destructive", size: "sm", onClick: function () { return handleRemoveFilter(idx); } },
                                react_1["default"].createElement(lucide_react_1.Trash2, { className: "w-4 h-4" })))); }),
                        reportConfig.filters.length === 0 && (react_1["default"].createElement("p", { className: "text-sm text-gray-500" }, "No filters added")))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, { className: "flex justify-between items-center" },
                        react_1["default"].createElement(card_1.CardTitle, null, "Aggregations (Optional)"),
                        react_1["default"].createElement(button_1.Button, { size: "sm", onClick: handleAddAggregation, className: "gap-1" },
                            react_1["default"].createElement(lucide_react_1.Plus, { className: "w-4 h-4" }),
                            "Add Aggregation")),
                    react_1["default"].createElement(card_1.CardContent, { className: "space-y-3" },
                        reportConfig.aggregations.map(function (agg, idx) { return (react_1["default"].createElement("div", { key: agg.field || "agg-" + idx, className: "flex gap-2 items-end" },
                            react_1["default"].createElement(select_1.Select, { value: agg.field, onValueChange: function (value) {
                                    var updated = __spreadArrays(reportConfig.aggregations);
                                    updated[idx].field = value;
                                    setReportConfig(__assign(__assign({}, reportConfig), { aggregations: updated }));
                                } },
                                react_1["default"].createElement(select_1.SelectTrigger, { className: "flex-1" },
                                    react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select field to aggregate" })),
                                react_1["default"].createElement(select_1.SelectContent, null, fields.map(function (f) { return (react_1["default"].createElement(select_1.SelectItem, { key: f, value: f }, f)); }))),
                            react_1["default"].createElement(select_1.Select, { value: agg.type, onValueChange: function (value) {
                                    var updated = __spreadArrays(reportConfig.aggregations);
                                    updated[idx].type = value;
                                    setReportConfig(__assign(__assign({}, reportConfig), { aggregations: updated }));
                                } },
                                react_1["default"].createElement(select_1.SelectTrigger, { className: "w-32" },
                                    react_1["default"].createElement(select_1.SelectValue, null)),
                                react_1["default"].createElement(select_1.SelectContent, null, AGGREGATION_TYPES.map(function (type) { return (react_1["default"].createElement(select_1.SelectItem, { key: type.value, value: type.value }, type.label)); }))),
                            react_1["default"].createElement(button_1.Button, { variant: "destructive", size: "sm", onClick: function () { return handleRemoveAggregation(idx); } },
                                react_1["default"].createElement(lucide_react_1.Trash2, { className: "w-4 h-4" })))); }),
                        reportConfig.aggregations.length === 0 && (react_1["default"].createElement("p", { className: "text-sm text-gray-500" }, "No aggregations added"))))),
            react_1["default"].createElement(tabs_1.TabsContent, { value: "preview", className: "space-y-4" },
                react_1["default"].createElement(button_1.Button, { onClick: handleGeneratePreview, disabled: reportLoading || !reportConfig.table, className: "gap-2" }, reportLoading ? (react_1["default"].createElement(react_1["default"].Fragment, null,
                    react_1["default"].createElement(lucide_react_1.Loader, { className: "w-4 h-4 animate-spin" }),
                    "Loading...")) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                    react_1["default"].createElement(lucide_react_1.Play, { className: "w-4 h-4" }),
                    "Generate Preview"))),
                showPreview && reportData.length > 0 && (react_1["default"].createElement(react_1["default"].Fragment, null,
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, null,
                                "Data Preview (",
                                reportData.length,
                                " rows)")),
                        react_1["default"].createElement(card_1.CardContent, null,
                            react_1["default"].createElement("div", { className: "overflow-x-auto" },
                                react_1["default"].createElement(table_1.Table, { className: "w-full text-sm" },
                                    react_1["default"].createElement(table_1.TableHeader, { className: "border-b bg-gray-50" },
                                        react_1["default"].createElement(table_1.TableRow, null, (reportConfig.selectedFields.length > 0 ? reportConfig.selectedFields : Object.keys(reportData[0] || {})).map(function (key) { return (react_1["default"].createElement(table_1.TableHead, { key: key, className: "text-left py-2 px-4 font-medium" }, typeof key === 'string' ? key.charAt(0).toUpperCase() + key.slice(1) : key)); }))),
                                    react_1["default"].createElement(table_1.TableBody, null, reportData.slice(0, 50).map(function (row, idx) { return (react_1["default"].createElement(table_1.TableRow, { key: "row-" + idx, className: "border-b hover:bg-gray-50" }, (reportConfig.selectedFields.length > 0 ? reportConfig.selectedFields : Object.keys(row)).map(function (key) { return (react_1["default"].createElement(table_1.TableCell, { key: idx + "-" + key, className: "py-2 px-4" }, typeof row[key] === "string"
                                        ? row[key]
                                        : row[key] instanceof Date
                                            ? new Date(row[key]).toLocaleDateString()
                                            : JSON.stringify(row[key]))); }))); })))),
                            reportData.length > 50 && (react_1["default"].createElement("p", { className: "text-sm text-gray-600 mt-2" },
                                "Showing 1-50 of ",
                                reportData.length,
                                " rows. Export to see all data.")))),
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, null, "Visualization")),
                        react_1["default"].createElement(card_1.CardContent, null, reportConfig.chartType === "table" ? (react_1["default"].createElement("div", { className: "text-center py-8 text-gray-600" }, "Table view selected. See data preview above.")) : (react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                            reportConfig.chartType === "bar" && (react_1["default"].createElement(recharts_1.BarChart, { data: reportData.slice(0, 20) },
                                react_1["default"].createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                                react_1["default"].createElement(recharts_1.XAxis, { dataKey: reportConfig.selectedFields[0] || "id" }),
                                react_1["default"].createElement(recharts_1.YAxis, null),
                                react_1["default"].createElement(recharts_1.Tooltip, null),
                                react_1["default"].createElement(recharts_1.Legend, null),
                                reportConfig.selectedFields.slice(1).map(function (field, i) { return (react_1["default"].createElement(recharts_1.Bar, { key: field, dataKey: field, fill: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][i % 5] })); }))),
                            reportConfig.chartType === "line" && (react_1["default"].createElement(recharts_1.LineChart, { data: reportData.slice(0, 20) },
                                react_1["default"].createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                                react_1["default"].createElement(recharts_1.XAxis, { dataKey: reportConfig.selectedFields[0] || "id" }),
                                react_1["default"].createElement(recharts_1.YAxis, null),
                                react_1["default"].createElement(recharts_1.Tooltip, null),
                                react_1["default"].createElement(recharts_1.Legend, null),
                                reportConfig.selectedFields.slice(1).map(function (field, i) { return (react_1["default"].createElement(recharts_1.Line, { key: field, type: "monotone", dataKey: field, stroke: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][i % 5] })); }))),
                            reportConfig.chartType === "pie" && (react_1["default"].createElement(recharts_1.PieChart, null,
                                react_1["default"].createElement(recharts_1.Pie, { data: reportData.slice(0, 20), dataKey: reportConfig.selectedFields[1] || "value", nameKey: reportConfig.selectedFields[0] || "name", cx: "50%", cy: "50%", outerRadius: 100, label: true }, reportData.slice(0, 20).map(function (data, index) { return (react_1["default"].createElement(recharts_1.Cell, { key: "" + (data.name || index), fill: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"][index % 6] })); })),
                                react_1["default"].createElement(recharts_1.Tooltip, null)))))))))),
            react_1["default"].createElement(tabs_1.TabsContent, { value: "settings", className: "space-y-4" },
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Visualization Settings")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "text-sm font-medium mb-2 block" }, "Chart Type"),
                            react_1["default"].createElement(select_1.Select, { value: reportConfig.chartType, onValueChange: function (value) {
                                    return setReportConfig(__assign(__assign({}, reportConfig), { chartType: value }));
                                } },
                                react_1["default"].createElement(select_1.SelectTrigger, null,
                                    react_1["default"].createElement(select_1.SelectValue, null)),
                                react_1["default"].createElement(select_1.SelectContent, null, CHART_TYPES.map(function (chart) { return (react_1["default"].createElement(select_1.SelectItem, { key: chart.value, value: chart.value }, chart.label)); })))))),
                react_1["default"].createElement("div", { className: "flex gap-4" },
                    react_1["default"].createElement(button_1.Button, { onClick: handleSaveReport, className: "flex-1" }, "Save Report"),
                    react_1["default"].createElement(button_1.Button, { onClick: handleExport, variant: "outline", className: "gap-2" },
                        react_1["default"].createElement(lucide_react_1.Download, { className: "w-4 h-4" }),
                        "Export"))))));
}
exports["default"] = CustomReportBuilder;
