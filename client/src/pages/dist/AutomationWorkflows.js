"use strict";
exports.__esModule = true;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var ModuleLayout_1 = require("@/components/ModuleLayout");
function AutomationWorkflows() {
    var _a, _b, _c;
    var _d = trpc_1.trpc.automationRules.listRules.useQuery({}), data = _d.data, isLoading = _d.isLoading, error = _d.error;
    var utils = trpc_1.trpc.useUtils();
    var toggleStatus = trpc_1.trpc.automationRules.toggleRuleStatus.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Rule status updated");
            utils.automationRules.listRules.invalidate();
        },
        onError: function (err) { var _a; return sonner_1.toast.error((_a = err.message) !== null && _a !== void 0 ? _a : "Failed to toggle status"); }
    });
    var rules = (_c = (_b = (_a = data) === null || _a === void 0 ? void 0 : _a.rules) !== null && _b !== void 0 ? _b : data) !== null && _c !== void 0 ? _c : [];
    var activeCount = rules.filter(function (r) { return r.status === "active" || r.enabled; }).length;
    var totalExecs = rules.reduce(function (s, r) { var _a, _b; return s + ((_b = (_a = r.executions) !== null && _a !== void 0 ? _a : r.executionCount) !== null && _b !== void 0 ? _b : 0); }, 0);
    var avgSuccess = rules.length
        ? (rules.reduce(function (s, r) { var _a; return s + ((_a = r.successRate) !== null && _a !== void 0 ? _a : 0); }, 0) / rules.length).toFixed(1)
        : "0";
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Automation Workflows", icon: react_1["default"].createElement(lucide_react_1.Zap, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "System" },
            { label: "Automation Workflows" },
        ] }, isLoading ? (react_1["default"].createElement("div", { className: "flex justify-center py-12" },
        react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))) : error ? (react_1["default"].createElement("div", { className: "bg-red-50 text-red-700 p-4 rounded-lg" }, error.message)) : (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" },
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Total Workflows"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold" }, rules.length),
                react_1["default"].createElement("div", { className: "text-xs text-blue-600" },
                    activeCount,
                    " active")),
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Total Executions"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold" }, totalExecs.toLocaleString())),
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Avg Success Rate"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold" },
                    avgSuccess,
                    "%"))),
        rules.length === 0 ? (react_1["default"].createElement("p", { className: "text-center text-gray-500 py-8" }, "No workflows found")) : (react_1["default"].createElement("div", { className: "space-y-3" }, rules.map(function (workflow) {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            return (react_1["default"].createElement("div", { key: workflow.id, className: "bg-white p-4 rounded-lg shadow hover:shadow-md transition" },
                react_1["default"].createElement("div", { className: "flex items-start justify-between mb-3" },
                    react_1["default"].createElement("div", { className: "flex-1" },
                        react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                            react_1["default"].createElement("h3", { className: "font-semibold text-lg" }, (_a = workflow.name) !== null && _a !== void 0 ? _a : "\u2014"),
                            react_1["default"].createElement("span", { className: "px-2 py-1 text-xs font-medium rounded " + (workflow.status === "active" || workflow.enabled
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800") }, workflow.status === "active" || workflow.enabled ? "\uD83D\uDFE2 Active" : "\u26AA Paused")),
                        react_1["default"].createElement("p", { className: "text-sm text-gray-600 mt-1" }, (_c = (_b = workflow.trigger) !== null && _b !== void 0 ? _b : workflow.description) !== null && _c !== void 0 ? _c : "\u2014")),
                    react_1["default"].createElement("button", { onClick: function () { return toggleStatus.mutate({ ruleId: workflow.id }); }, className: "flex-shrink-0", disabled: toggleStatus.isPending }, workflow.status === "active" || workflow.enabled ? (react_1["default"].createElement(lucide_react_1.Pause, { className: "w-6 h-6 text-blue-600" })) : (react_1["default"].createElement(lucide_react_1.Play, { className: "w-6 h-6 text-gray-400" })))),
                react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("div", { className: "text-gray-600" }, "Executions"),
                        react_1["default"].createElement("div", { className: "font-semibold" }, (_e = (_d = workflow.executions) !== null && _d !== void 0 ? _d : workflow.executionCount) !== null && _e !== void 0 ? _e : 0)),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("div", { className: "text-gray-600" }, "Success Rate"),
                        react_1["default"].createElement("div", { className: "font-semibold text-green-600" }, (_f = workflow.successRate) !== null && _f !== void 0 ? _f : 0,
                            "%")),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("div", { className: "text-gray-600" }, "Created"),
                        react_1["default"].createElement("div", { className: "font-semibold" }, (_h = (_g = workflow.createdAt) !== null && _g !== void 0 ? _g : workflow.created) !== null && _h !== void 0 ? _h : "\u2014")))));
        })))))));
}
exports["default"] = AutomationWorkflows;
