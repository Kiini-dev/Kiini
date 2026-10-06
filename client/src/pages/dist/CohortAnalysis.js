"use strict";
exports.__esModule = true;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
function CohortAnalysis() {
    var _a, _b;
    var _c = react_1.useState("SIGNUP_DATE"), cohortType = _c[0], setCohortType = _c[1];
    var cohortQuery = trpc_1.trpc.cohortAnalytics.getCohortAnalysis.useQuery({ cohortType: cohortType, period: "MONTHLY" });
    var cohort = cohortQuery.data ? JSON.parse(JSON.stringify(cohortQuery.data)) : null;
    var cohorts = (cohort === null || cohort === void 0 ? void 0 : cohort.cohorts) || [];
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Cohort Analysis", icon: react_1["default"].createElement(lucide_react_1.Users, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Analytics" }, { label: "Cohort Analysis" }] },
        react_1["default"].createElement("div", { className: "flex justify-between items-center" },
            react_1["default"].createElement(select_1.Select, { value: cohortType, onValueChange: function (v) { return setCohortType(v); } },
                react_1["default"].createElement(select_1.SelectTrigger, { className: "w-[200px]" },
                    react_1["default"].createElement(select_1.SelectValue, null)),
                react_1["default"].createElement(select_1.SelectContent, null,
                    react_1["default"].createElement(select_1.SelectItem, { value: "SIGNUP_DATE" }, "By Signup Date"),
                    react_1["default"].createElement(select_1.SelectItem, { value: "FIRST_PURCHASE" }, "By First Purchase"),
                    react_1["default"].createElement(select_1.SelectItem, { value: "REGION" }, "By Region")))),
        react_1["default"].createElement("div", { className: "grid grid-cols-4 gap-4" },
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Total Cohorts"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold" }, cohorts.length))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Overall Retention"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold" }, (_a = cohort === null || cohort === void 0 ? void 0 : cohort.overallRetention) !== null && _a !== void 0 ? _a : 0,
                        "%"))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Best Performing"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold" }, (cohort === null || cohort === void 0 ? void 0 : cohort.bestPerformingCohort) || "—"))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Avg Churn Rate"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold" },
                        cohorts.length > 0
                            ? (cohorts.reduce(function (s, c) { return s + (c.churnRate || 0); }, 0) / cohorts.length).toFixed(1)
                            : 0,
                        "%")))),
        react_1["default"].createElement(card_1.Card, null,
            react_1["default"].createElement(card_1.CardHeader, null,
                react_1["default"].createElement(card_1.CardTitle, null, "Cohort Retention Matrix")),
            react_1["default"].createElement(card_1.CardContent, null, cohorts.length > 0 ? (react_1["default"].createElement("div", { className: "overflow-x-auto" },
                react_1["default"].createElement(table_1.Table, null,
                    react_1["default"].createElement(table_1.TableHeader, null,
                        react_1["default"].createElement(table_1.TableRow, null,
                            react_1["default"].createElement(table_1.TableHead, null, "Cohort"),
                            react_1["default"].createElement(table_1.TableHead, { className: "text-center" }, "Users"),
                            react_1["default"].createElement(table_1.TableHead, { className: "text-center" }, "Churn %"),
                            react_1["default"].createElement(table_1.TableHead, { className: "text-center" }, "Avg LTV"),
                            react_1["default"].createElement(table_1.TableHead, { className: "text-center" }, "Avg Retention Days"),
                            (((_b = cohorts[0]) === null || _b === void 0 ? void 0 : _b.retention) || []).map(function (_, i) { return (react_1["default"].createElement(table_1.TableHead, { key: i, className: "text-center" },
                                "Period ",
                                i + 1)); }))),
                    react_1["default"].createElement(table_1.TableBody, null, cohorts.map(function (row, idx) {
                        var _a, _b;
                        return (react_1["default"].createElement(table_1.TableRow, { key: idx },
                            react_1["default"].createElement(table_1.TableCell, { className: "font-medium" }, row.cohort),
                            react_1["default"].createElement(table_1.TableCell, { className: "text-center" }, row.users),
                            react_1["default"].createElement(table_1.TableCell, { className: "text-center" },
                                row.churnRate,
                                "%"),
                            react_1["default"].createElement(table_1.TableCell, { className: "text-center" },
                                "$", (_b = (_a = row.avgLifetimeValue) === null || _a === void 0 ? void 0 : _a.toLocaleString()) !== null && _b !== void 0 ? _b : 0),
                            react_1["default"].createElement(table_1.TableCell, { className: "text-center" }, row.avgRetentionDays),
                            (row.retention || []).map(function (val, i) { return (react_1["default"].createElement(table_1.TableCell, { key: i, className: "text-center" },
                                val,
                                "%")); })));
                    }))))) : (react_1["default"].createElement("p", { className: "text-muted-foreground text-center py-8" }, "No cohort data yet \u2014 cohort analyses will appear once data is populated"))))));
}
exports["default"] = CohortAnalysis;
