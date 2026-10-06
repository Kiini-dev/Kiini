"use strict";
exports.__esModule = true;
var react_1 = require("react");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
function Attribution() {
    var _a, _b, _c;
    var _d = react_1.useState("LINEAR"), model = _d[0], setModel = _d[1];
    var attrQuery = trpc_1.trpc.cohortAnalytics.getAttributionModel.useQuery({ model: model });
    var data = attrQuery.data ? JSON.parse(JSON.stringify(attrQuery.data)) : null;
    var channels = (data === null || data === void 0 ? void 0 : data.channels) || [];
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Attribution Modeling", icon: react_1["default"].createElement(lucide_react_1.GitBranch, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Analytics" }, { label: "Attribution" }] },
        react_1["default"].createElement("div", { className: "flex gap-3 items-center" },
            react_1["default"].createElement(select_1.Select, { value: model, onValueChange: function (v) { return setModel(v); } },
                react_1["default"].createElement(select_1.SelectTrigger, { className: "w-[200px]" },
                    react_1["default"].createElement(select_1.SelectValue, null)),
                react_1["default"].createElement(select_1.SelectContent, null,
                    react_1["default"].createElement(select_1.SelectItem, { value: "FIRST_TOUCH" }, "First Touch"),
                    react_1["default"].createElement(select_1.SelectItem, { value: "LAST_TOUCH" }, "Last Touch"),
                    react_1["default"].createElement(select_1.SelectItem, { value: "LINEAR" }, "Linear"),
                    react_1["default"].createElement(select_1.SelectItem, { value: "TIME_DECAY" }, "Time Decay"),
                    react_1["default"].createElement(select_1.SelectItem, { value: "POSITION_BASED" }, "Position Based")))),
        react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" },
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Model Type"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold" }, model.replace(/_/g, " ")))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Total Conversions"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold" }, (_a = data === null || data === void 0 ? void 0 : data.totalConversions) !== null && _a !== void 0 ? _a : 0))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Avg Touchpoints"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold" }, (_b = data === null || data === void 0 ? void 0 : data.avgTouchpoints) !== null && _b !== void 0 ? _b : 0))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Cycle Time"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold" }, (_c = data === null || data === void 0 ? void 0 : data.cycleTime) !== null && _c !== void 0 ? _c : 0,
                        "d")))),
        react_1["default"].createElement(card_1.Card, null,
            react_1["default"].createElement(card_1.CardHeader, null,
                react_1["default"].createElement(card_1.CardTitle, null, "Channel Attribution")),
            react_1["default"].createElement(card_1.CardContent, null, channels.length > 0 ? (react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                react_1["default"].createElement(recharts_1.BarChart, { data: channels },
                    react_1["default"].createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                    react_1["default"].createElement(recharts_1.XAxis, { dataKey: "channel" }),
                    react_1["default"].createElement(recharts_1.YAxis, null),
                    react_1["default"].createElement(recharts_1.Tooltip, null),
                    react_1["default"].createElement(recharts_1.Bar, { dataKey: "credit", fill: "#6366f1", name: "Credit Score" })))) : (react_1["default"].createElement("p", { className: "text-muted-foreground text-center py-8" }, "No attribution data yet \u2014 add cohort analysis data to see channel attribution"))))));
}
exports["default"] = Attribution;
