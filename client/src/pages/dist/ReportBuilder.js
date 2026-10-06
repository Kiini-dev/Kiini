"use strict";
/**
 * Report Builder Page
 *
 * Drag-and-drop report designer with:
 * - Report templates browsing
 * - Custom report building
 * - Multi-source data integration
 * - Export and scheduling capabilities
 * - Report sharing and collaboration
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
// Template Card Component
var TemplateCard = function (_a) {
    var template = _a.template, onSelect = _a.onSelect;
    return (react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer", onClick: function () { return onSelect(template.id); } },
        react_1["default"].createElement("h3", { className: "font-semibold text-gray-900 mb-1" }, template.name),
        react_1["default"].createElement("p", { className: "text-sm text-gray-600 mb-3" }, template.description),
        react_1["default"].createElement("div", { className: "flex flex-wrap gap-1 mb-3" }, template.dataSources.map(function (source) { return (react_1["default"].createElement("span", { key: source, className: "text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded" }, source)); })),
        react_1["default"].createElement("div", { className: "text-xs text-gray-600" },
            template.sections.length,
            " sections included")));
};
// Report List Item
var ReportListItem = function (_a) {
    var report = _a.report, onView = _a.onView, onEdit = _a.onEdit, onDelete = _a.onDelete;
    return (react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow" },
        react_1["default"].createElement("div", { className: "flex items-start justify-between mb-2" },
            react_1["default"].createElement("div", null,
                react_1["default"].createElement("h3", { className: "font-semibold text-gray-900" }, report.name),
                react_1["default"].createElement("p", { className: "text-sm text-gray-600" }, report.description)),
            react_1["default"].createElement("span", { className: "text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded" }, report.category)),
        react_1["default"].createElement("div", { className: "grid grid-cols-4 gap-2 text-xs text-gray-600 mb-3" },
            react_1["default"].createElement("div", null,
                react_1["default"].createElement("div", { className: "font-medium" }, "Owner"),
                report.owner),
            react_1["default"].createElement("div", null,
                react_1["default"].createElement("div", { className: "font-medium" }, "Format"),
                report.format),
            react_1["default"].createElement("div", null,
                react_1["default"].createElement("div", { className: "font-medium" }, "Last Run"),
                new Date(report.lastRun).toLocaleDateString()),
            react_1["default"].createElement("div", null,
                react_1["default"].createElement("div", { className: "font-medium" }, "Pages"),
                report.pageCount)),
        react_1["default"].createElement("div", { className: "flex gap-2 justify-between" },
            react_1["default"].createElement("div", { className: "flex gap-2" },
                react_1["default"].createElement("button", { onClick: function () { return onView(report.id); }, className: "flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors" },
                    react_1["default"].createElement(lucide_react_1.Eye, { className: "w-4 h-4" }),
                    "Preview"),
                react_1["default"].createElement("button", { onClick: function () { return onEdit(report.id); }, className: "flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors" },
                    react_1["default"].createElement(lucide_react_1.Edit, { className: "w-4 h-4" }),
                    "Edit")),
            react_1["default"].createElement("button", { onClick: function () { return onDelete(report.id); }, className: "flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors" },
                react_1["default"].createElement(lucide_react_1.Trash2, { className: "w-4 h-4" }),
                "Delete")),
        report.nextRun && (react_1["default"].createElement("div", { className: "mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600" },
            "Next scheduled run: ",
            new Date(report.nextRun).toLocaleDateString()))));
};
// Main Report Builder Page
function ReportBuilderPage() {
    var _a, _b, _c;
    var _d = react_1.useState('reports'), activeTab = _d[0], setActiveTab = _d[1];
    var _e = react_1.useState(null), selectedReport = _e[0], setSelectedReport = _e[1];
    var _f = react_1.useState({
        name: '',
        category: 'Financial',
        dataSources: [],
        format: 'PDF',
        sections: []
    }), newReportConfig = _f[0], setNewReportConfig = _f[1];
    var _g = react_1.useState(false), showShareModal = _g[0], setShowShareModal = _g[1];
    var _h = react_1.useState(false), showScheduleModal = _h[0], setShowScheduleModal = _h[1];
    var _j = react_1.useState(false), showExportModal = _j[0], setShowExportModal = _j[1];
    // Queries
    var reportsQuery = trpc_1.trpc.reportBuilder.getReports.useQuery({});
    var templatesQuery = trpc_1.trpc.reportBuilder.getTemplates.useQuery({});
    var previewQuery = trpc_1.trpc.reportBuilder.getReportPreview.useQuery({ reportId: selectedReport }, { enabled: !!selectedReport });
    // Mutations
    var createReportMutation = trpc_1.trpc.reportBuilder.createReport.useMutation({
        onSuccess: function () {
            reportsQuery.refetch();
            setNewReportConfig({
                name: '',
                category: 'Financial',
                dataSources: [],
                format: 'PDF',
                sections: []
            });
        }
    });
    var exportMutation = trpc_1.trpc.reportBuilder.exportReport.useMutation();
    var scheduleMutation = trpc_1.trpc.reportBuilder.scheduleReport.useMutation();
    var deleteMutation = trpc_1.trpc.reportBuilder.deleteReport.useMutation({
        onSuccess: function () { return reportsQuery.refetch(); }
    });
    var generateFromTemplateMutation = trpc_1.trpc.reportBuilder.generateFromTemplate.useMutation({
        onSuccess: function () {
            reportsQuery.refetch();
            sonner_1.toast.success("Report generated from template");
        },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var handleCreateReport = function () {
        if (newReportConfig.name && newReportConfig.dataSources.length > 0) {
            createReportMutation.mutate(__assign(__assign({}, newReportConfig), { layout: {} }));
        }
    };
    var handleExport = function (format) {
        if (selectedReport) {
            exportMutation.mutate({ reportId: selectedReport, format: format });
        }
    };
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Report Builder", description: "Create, customize, and manage business reports", icon: react_1["default"].createElement(lucide_react_1.FileBarChart, { className: "h-6 w-6" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Reports", href: "/reports" }, { label: "Report Builder" }] },
        react_1["default"].createElement("div", { className: "flex gap-4 mb-6 border-b border-gray-200 flex-wrap" }, ['reports', 'templates', 'builder', 'scheduled'].map(function (tab) { return (react_1["default"].createElement("button", { key: tab, onClick: function () { return setActiveTab(tab); }, className: "px-4 py-2 font-medium border-b-2 transition-colors " + (activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900') },
            tab === 'reports' && 'My Reports',
            tab === 'templates' && 'Templates',
            tab === 'builder' && 'Create New',
            tab === 'scheduled' && 'Scheduled')); })),
        react_1["default"].createElement("div", { className: "space-y-6" },
            activeTab === 'reports' && (react_1["default"].createElement("div", { className: "space-y-4" }, (_a = reportsQuery.data) === null || _a === void 0 ? void 0 : _a.reports.map(function (report) { return (react_1["default"].createElement(ReportListItem, { key: report.id, report: report, onView: function (id) { return setSelectedReport(id); }, onEdit: function () { return setActiveTab('builder'); }, onDelete: function (id) { return deleteMutation.mutate({ reportId: id }); } })); }))),
            activeTab === 'templates' && (react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" }, (_b = templatesQuery.data) === null || _b === void 0 ? void 0 : _b.templates.map(function (template) { return (react_1["default"].createElement(TemplateCard, { key: template.id, template: template, onSelect: function (templateId) {
                    generateFromTemplateMutation.mutate({
                        templateId: templateId,
                        reportName: "Report from template " + templateId
                    });
                } })); }))),
            activeTab === 'builder' && (react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
                react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg border border-gray-200" },
                    react_1["default"].createElement("h2", { className: "text-xl font-semibold text-gray-900 mb-4" }, "Create New Report"),
                    react_1["default"].createElement("div", { className: "space-y-4" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Report Name *"),
                            react_1["default"].createElement("input", { type: "text", value: newReportConfig.name, onChange: function (e) {
                                    return setNewReportConfig(__assign(__assign({}, newReportConfig), { name: e.target.value }));
                                }, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500", placeholder: "e.g., Monthly Revenue Report" })),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Category *"),
                            react_1["default"].createElement("select", { value: newReportConfig.category, onChange: function (e) {
                                    return setNewReportConfig(__assign(__assign({}, newReportConfig), { category: e.target.value }));
                                }, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" },
                                react_1["default"].createElement("option", { value: "Financial" }, "Financial"),
                                react_1["default"].createElement("option", { value: "Sales" }, "Sales"),
                                react_1["default"].createElement("option", { value: "HR" }, "HR"),
                                react_1["default"].createElement("option", { value: "Operations" }, "Operations"))),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "Data Sources *"),
                            react_1["default"].createElement("div", { className: "space-y-2" }, ['GL', 'Invoices', 'Expenses', 'Payments', 'Employees'].map(function (source) { return (react_1["default"].createElement("label", { key: source, className: "flex items-center gap-2" },
                                react_1["default"].createElement("input", { type: "checkbox", checked: newReportConfig.dataSources.includes(source), onChange: function (e) {
                                        if (e.target.checked) {
                                            setNewReportConfig(__assign(__assign({}, newReportConfig), { dataSources: __spreadArrays(newReportConfig.dataSources, [source]) }));
                                        }
                                        else {
                                            setNewReportConfig(__assign(__assign({}, newReportConfig), { dataSources: newReportConfig.dataSources.filter(function (s) { return s !== source; }) }));
                                        }
                                    }, className: "w-4 h-4 rounded border-gray-300" }),
                                react_1["default"].createElement("span", { className: "text-sm text-gray-700" }, source))); }))),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Output Format *"),
                            react_1["default"].createElement("select", { value: newReportConfig.format, onChange: function (e) {
                                    return setNewReportConfig(__assign(__assign({}, newReportConfig), { format: e.target.value }));
                                }, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" },
                                react_1["default"].createElement("option", { value: "PDF" }, "PDF"),
                                react_1["default"].createElement("option", { value: "Excel" }, "Excel"),
                                react_1["default"].createElement("option", { value: "CSV" }, "CSV"),
                                react_1["default"].createElement("option", { value: "HTML" }, "HTML"))),
                        react_1["default"].createElement("button", { onClick: handleCreateReport, disabled: !newReportConfig.name || newReportConfig.dataSources.length === 0, className: "w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" },
                            react_1["default"].createElement(lucide_react_1.Plus, { className: "w-4 h-4" }),
                            "Create Report"))),
                react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg border border-gray-200" },
                    react_1["default"].createElement("h2", { className: "text-xl font-semibold text-gray-900 mb-4" }, "Report Preview"),
                    react_1["default"].createElement("div", { className: "bg-gray-100 p-4 rounded-lg min-h-96 flex items-center justify-center text-gray-600" }, newReportConfig.name ? (react_1["default"].createElement("div", { className: "text-center" },
                        react_1["default"].createElement("div", { className: "text-lg font-semibold mb-2" }, newReportConfig.name),
                        react_1["default"].createElement("div", { className: "text-sm mb-4" },
                            "Category: ",
                            newReportConfig.category),
                        react_1["default"].createElement("div", { className: "text-sm mb-4" },
                            "Data Sources: ",
                            newReportConfig.dataSources.join(', ') || 'None selected'),
                        react_1["default"].createElement("div", { className: "text-sm" },
                            "Format: ",
                            newReportConfig.format))) : (react_1["default"].createElement("div", { className: "text-center text-gray-400" }, "Enter report details to see preview")))))),
            activeTab === 'scheduled' && (react_1["default"].createElement("div", { className: "space-y-4" }, (_c = reportsQuery.data) === null || _c === void 0 ? void 0 : _c.reports.filter(function (r) { return r.nextRun; }).map(function (report) { return (react_1["default"].createElement("div", { key: report.id, className: "bg-white p-4 rounded-lg border border-blue-200 bg-blue-50" },
                react_1["default"].createElement("div", { className: "flex items-start justify-between" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("h3", { className: "font-semibold text-gray-900 flex items-center gap-2" },
                            react_1["default"].createElement(lucide_react_1.Clock, { className: "w-4 h-4 text-blue-600" }),
                            report.name),
                        react_1["default"].createElement("div", { className: "text-sm text-gray-600 mt-1" },
                            "Frequency: ",
                            report.frequency || 'Weekly',
                            " | Next: ",
                            new Date(report.nextRun).toLocaleDateString())),
                    react_1["default"].createElement("button", { onClick: function () { return setShowScheduleModal(true); }, className: "px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors" }, "Edit Schedule")))); })))),
        selectedReport && (react_1["default"].createElement("div", { className: "fixed bottom-6 right-6 bg-white p-4 rounded-lg shadow-lg border border-gray-200" },
            react_1["default"].createElement("h3", { className: "font-semibold text-gray-900 mb-3" }, "Report Actions"),
            react_1["default"].createElement("div", { className: "space-y-2" },
                react_1["default"].createElement("button", { onClick: function () { return handleExport('PDF'); }, className: "w-full flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors" },
                    react_1["default"].createElement(lucide_react_1.Download, { className: "w-4 h-4" }),
                    "Export as PDF"),
                react_1["default"].createElement("button", { onClick: function () { return handleExport('Excel'); }, className: "w-full flex items-center gap-2 px-3 py-2 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors" },
                    react_1["default"].createElement(lucide_react_1.Download, { className: "w-4 h-4" }),
                    "Export as Excel"),
                react_1["default"].createElement("button", { onClick: function () { return setShowShareModal(true); }, className: "w-full flex items-center gap-2 px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors" },
                    react_1["default"].createElement(lucide_react_1.Share2, { className: "w-4 h-4" }),
                    "Share Report"),
                react_1["default"].createElement("button", { onClick: function () { return setShowScheduleModal(true); }, className: "w-full flex items-center gap-2 px-3 py-2 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors" },
                    react_1["default"].createElement(lucide_react_1.Clock, { className: "w-4 h-4" }),
                    "Schedule"))))));
}
exports["default"] = ReportBuilderPage;
