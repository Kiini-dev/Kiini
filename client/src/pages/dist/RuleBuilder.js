"use strict";
exports.__esModule = true;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var ModuleLayout_1 = require("@/components/ModuleLayout");
function RuleBuilder() {
    var _a, _b, _c;
    var _d = trpc_1.trpc.automationRules.listRules.useQuery({}), data = _d.data, isLoading = _d.isLoading, error = _d.error;
    var utils = trpc_1.trpc.useUtils();
    var _e = react_1.useState(false), showNew = _e[0], setShowNew = _e[1];
    var _f = react_1.useState(""), newName = _f[0], setNewName = _f[1];
    var createRule = trpc_1.trpc.automationRules.createRule.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Rule created");
            utils.automationRules.listRules.invalidate();
            setShowNew(false);
            setNewName("");
        },
        onError: function (err) { var _a; return sonner_1.toast.error((_a = err.message) !== null && _a !== void 0 ? _a : "Failed to create rule"); }
    });
    var rules = (_c = (_b = (_a = data) === null || _a === void 0 ? void 0 : _a.rules) !== null && _b !== void 0 ? _b : data) !== null && _c !== void 0 ? _c : [];
    var activeCount = rules.filter(function (r) { return r.enabled || r.status === "active"; }).length;
    var totalExecs = rules.reduce(function (s, r) { var _a, _b; return s + ((_b = (_a = r.executionCount) !== null && _a !== void 0 ? _a : r.executions) !== null && _b !== void 0 ? _b : 0); }, 0);
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Rule Builder", icon: react_1["default"].createElement(lucide_react_1.Settings, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "System" },
            { label: "Rule Builder" },
        ] },
        react_1["default"].createElement("div", { className: "flex justify-end" },
            react_1["default"].createElement("button", { onClick: function () { return setShowNew(true); }, className: "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" },
                react_1["default"].createElement(lucide_react_1.Plus, { className: "w-4 h-4" }),
                " New Rule")),
        showNew && (react_1["default"].createElement("div", { className: "bg-blue-50 p-6 rounded-lg border border-blue-200" },
            react_1["default"].createElement("h2", { className: "text-lg font-semibold mb-4" }, "Create New Rule"),
            react_1["default"].createElement("div", { className: "space-y-4" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", { className: "block text-sm font-medium mb-1" }, "Rule Name"),
                    react_1["default"].createElement("input", { type: "text", value: newName, onChange: function (e) { return setNewName(e.target.value); }, placeholder: "e.g., High Alert", className: "w-full px-3 py-2 border rounded-lg" })),
                react_1["default"].createElement("div", { className: "flex gap-2" },
                    react_1["default"].createElement("button", { onClick: function () { return createRule.mutate({ name: newName }); }, disabled: createRule.isPending || !newName.trim(), className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50" }, createRule.isPending ? "Creating..." : "Create Rule"),
                    react_1["default"].createElement("button", { onClick: function () { return setShowNew(false); }, className: "px-4 py-2 border rounded-lg hover:bg-gray-50" }, "Cancel"))))),
        isLoading ? (react_1["default"].createElement("div", { className: "flex justify-center py-12" },
            react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))) : error ? (react_1["default"].createElement("div", { className: "bg-red-50 text-red-700 p-4 rounded-lg" }, error.message)) : rules.length === 0 ? (react_1["default"].createElement("p", { className: "text-center text-gray-500 py-8" }, "No rules found")) : (react_1["default"].createElement(react_1["default"].Fragment, null,
            react_1["default"].createElement("div", { className: "space-y-3" }, rules.map(function (rule) {
                var _a, _b, _c, _d, _e;
                return (react_1["default"].createElement("div", { key: rule.id, className: "bg-white p-4 rounded-lg shadow" },
                    react_1["default"].createElement("div", { className: "flex items-start justify-between mb-2" },
                        react_1["default"].createElement("div", { className: "flex-1" },
                            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                                react_1["default"].createElement("h3", { className: "font-semibold text-lg" }, (_a = rule.name) !== null && _a !== void 0 ? _a : "\u2014"),
                                react_1["default"].createElement("span", { className: "px-2 py-1 text-xs font-medium rounded " + (rule.enabled || rule.status === "active"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800") }, rule.enabled || rule.status === "active" ? "\uD83D\uDFE2 Active" : "\u26AA Inactive")),
                            react_1["default"].createElement("p", { className: "text-sm text-gray-600 mt-1 ml-6" }, (_c = (_b = rule.condition) !== null && _b !== void 0 ? _b : rule.description) !== null && _c !== void 0 ? _c : "\u2014"))),
                    react_1["default"].createElement("div", { className: "ml-6 pt-2 border-t" },
                        react_1["default"].createElement("div", { className: "text-xs text-gray-600" },
                            "Executed ", (_e = (_d = rule.executionCount) !== null && _d !== void 0 ? _d : rule.executions) !== null && _e !== void 0 ? _e : 0,
                            " times"))));
            })),
            react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
                react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "Rule Statistics"),
                react_1["default"].createElement("div", { className: "grid grid-cols-3 gap-4" },
                    react_1["default"].createElement("div", { className: "text-center" },
                        react_1["default"].createElement("div", { className: "text-3xl font-bold text-blue-600" }, rules.length),
                        react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Total Rules")),
                    react_1["default"].createElement("div", { className: "text-center" },
                        react_1["default"].createElement("div", { className: "text-3xl font-bold text-green-600" }, activeCount),
                        react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Active")),
                    react_1["default"].createElement("div", { className: "text-center" },
                        react_1["default"].createElement("div", { className: "text-3xl font-bold text-orange-600" }, totalExecs),
                        react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Total Executions"))))))));
}
exports["default"] = RuleBuilder;
