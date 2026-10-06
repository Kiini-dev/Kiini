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
exports.__esModule = true;
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var stats_card_1 = require("@/components/ui/stats-card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var switch_1 = require("@/components/ui/switch");
var tabs_1 = require("@/components/ui/tabs");
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
function HRAutomation() {
    var _a, _b, _c, _d;
    var _e = react_1.useState("dashboard"), tab = _e[0], setTab = _e[1];
    var _f = trpc_1.trpc.hrAutomation.getStats.useQuery(), stats = _f.data, refetchStats = _f.refetch;
    var _g = trpc_1.trpc.hrAutomation.getRules.useQuery(), rules = _g.data, refetchRules = _g.refetch;
    var _h = trpc_1.trpc.hrAutomation.getLogs.useQuery({ limit: 50 }), logs = _h.data, refetchLogs = _h.refetch;
    var expiringContracts = trpc_1.trpc.hrAutomation.getExpiringContracts.useQuery({ days: 30 }).data;
    var runAutomation = trpc_1.trpc.hrAutomation.runAutomation.useMutation({
        onSuccess: function (data) {
            sonner_1.toast.success("Automation completed: " + data.results.length + " rules executed");
            refetchStats();
            refetchLogs();
        },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var runLeaveAccrual = trpc_1.trpc.hrAutomation.runLeaveAccrual.useMutation({
        onSuccess: function (data) { sonner_1.toast.success(data.message); refetchStats(); refetchLogs(); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var generatePayroll = trpc_1.trpc.hrAutomation.generatePayroll.useMutation({
        onSuccess: function (data) { sonner_1.toast.success(data.message); refetchStats(); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var createRule = trpc_1.trpc.hrAutomation.createRule.useMutation({
        onSuccess: function () { sonner_1.toast.success("Rule created"); refetchRules(); }
    });
    var deleteRule = trpc_1.trpc.hrAutomation.deleteRule.useMutation({
        onSuccess: function () { sonner_1.toast.success("Rule deleted"); refetchRules(); }
    });
    var updateRule = trpc_1.trpc.hrAutomation.updateRule.useMutation({
        onSuccess: function () { refetchRules(); }
    });
    var _j = react_1.useState({ name: "", type: "leave_accrual", schedule: "monthly", config: "{}" }), newRule = _j[0], setNewRule = _j[1];
    var _k = react_1.useState(new Date().getMonth() + 1), payrollMonth = _k[0], setPayrollMonth = _k[1];
    var _l = react_1.useState(new Date().getFullYear()), payrollYear = _l[0], setPayrollYear = _l[1];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "HR Automation", description: "Automate leave accrual, contract alerts, payroll generation, and more", icon: React.createElement(lucide_react_1.Zap, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm" },
            { label: "HR", href: "/hr/employees" },
            { label: "Automation" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Expiring Contracts", value: (_a = stats === null || stats === void 0 ? void 0 : stats.expiringContracts) !== null && _a !== void 0 ? _a : 0, icon: React.createElement(lucide_react_1.AlertTriangle, { className: "h-5 w-5" }) }),
                React.createElement(stats_card_1.StatsCard, { label: "Leave Accruals", value: (_b = stats === null || stats === void 0 ? void 0 : stats.pendingAccrual) !== null && _b !== void 0 ? _b : 0, icon: React.createElement(lucide_react_1.Calendar, { className: "h-5 w-5" }) }),
                React.createElement(stats_card_1.StatsCard, { label: "Draft Payrolls", value: (_c = stats === null || stats === void 0 ? void 0 : stats.pendingPayroll) !== null && _c !== void 0 ? _c : 0, icon: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }) }),
                React.createElement(stats_card_1.StatsCard, { label: "Active Rules", value: (_d = stats === null || stats === void 0 ? void 0 : stats.activeRules) !== null && _d !== void 0 ? _d : 0, icon: React.createElement(lucide_react_1.Zap, { className: "h-5 w-5" }) })),
            React.createElement(tabs_1.Tabs, { value: tab, onValueChange: setTab },
                React.createElement(tabs_1.TabsList, null,
                    React.createElement(tabs_1.TabsTrigger, { value: "dashboard" }, "Dashboard"),
                    React.createElement(tabs_1.TabsTrigger, { value: "rules" }, "Automation Rules"),
                    React.createElement(tabs_1.TabsTrigger, { value: "actions" }, "Quick Actions"),
                    React.createElement(tabs_1.TabsTrigger, { value: "logs" }, "Activity Logs")),
                React.createElement(tabs_1.TabsContent, { value: "dashboard" },
                    React.createElement("div", { className: "grid lg:grid-cols-2 gap-6" },
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, null,
                                React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                                    React.createElement(lucide_react_1.AlertTriangle, { className: "h-4 w-4 text-amber-500" }),
                                    "Contracts Expiring (30 days)")),
                            React.createElement(card_1.CardContent, null, !expiringContracts || expiringContracts.length === 0 ? (React.createElement("p", { className: "text-sm text-muted-foreground py-4 text-center" }, "No contracts expiring soon")) : (React.createElement(table_1.Table, null,
                                React.createElement(table_1.TableHeader, null,
                                    React.createElement(table_1.TableRow, null,
                                        React.createElement(table_1.TableHead, null, "Employee"),
                                        React.createElement(table_1.TableHead, null, "Type"),
                                        React.createElement(table_1.TableHead, null, "Expires"))),
                                React.createElement(table_1.TableBody, null, expiringContracts.slice(0, 10).map(function (c) { return (React.createElement(table_1.TableRow, { key: c.id },
                                    React.createElement(table_1.TableCell, { className: "font-medium" },
                                        c.first_name,
                                        " ",
                                        c.last_name),
                                    React.createElement(table_1.TableCell, null,
                                        React.createElement(badge_1.Badge, { variant: "outline" }, c.contract_type)),
                                    React.createElement(table_1.TableCell, null, c.end_date ? new Date(c.end_date).toLocaleDateString() : "-"))); })))))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, null,
                                React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                                    React.createElement(lucide_react_1.Clock, { className: "h-4 w-4" }),
                                    "Recent Automation Activity")),
                            React.createElement(card_1.CardContent, null, !logs || logs.length === 0 ? (React.createElement("p", { className: "text-sm text-muted-foreground py-4 text-center" }, "No automation activity yet")) : (React.createElement("div", { className: "space-y-2 max-h-64 overflow-y-auto" }, logs.slice(0, 10).map(function (log) { return (React.createElement("div", { key: log.id, className: "flex items-center gap-2 text-sm border-b pb-2" },
                                log.status === "success" ? (React.createElement(lucide_react_1.CheckCircle, { className: "h-3.5 w-3.5 text-green-500 shrink-0" })) : (React.createElement(lucide_react_1.XCircle, { className: "h-3.5 w-3.5 text-red-500 shrink-0" })),
                                React.createElement("div", { className: "flex-1 min-w-0" },
                                    React.createElement("p", { className: "font-medium truncate" }, log.rule_name),
                                    React.createElement("p", { className: "text-xs text-muted-foreground truncate" }, log.result)),
                                React.createElement("span", { className: "text-xs text-muted-foreground whitespace-nowrap" }, log.executed_at ? new Date(log.executed_at).toLocaleString() : ""))); }))))))),
                React.createElement(tabs_1.TabsContent, { value: "rules" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement(card_1.CardTitle, { className: "text-base" }, "Automation Rules"),
                                React.createElement(card_1.CardDescription, null, "Configure automated HR processes")),
                            React.createElement("div", { className: "flex gap-2" },
                                React.createElement(button_1.Button, { variant: "outline", onClick: function () { return runAutomation.mutate(); }, disabled: runAutomation.isPending },
                                    React.createElement(lucide_react_1.Play, { className: "h-4 w-4 mr-1" }),
                                    " Run All"),
                                React.createElement(dialog_1.Dialog, null,
                                    React.createElement(dialog_1.DialogTrigger, { asChild: true },
                                        React.createElement(button_1.Button, null,
                                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                                            " New Rule")),
                                    React.createElement(dialog_1.DialogContent, null,
                                        React.createElement(dialog_1.DialogHeader, null,
                                            React.createElement(dialog_1.DialogTitle, null, "Create Automation Rule")),
                                        React.createElement("div", { className: "space-y-3" },
                                            React.createElement("div", null,
                                                React.createElement(label_1.Label, null, "Name"),
                                                React.createElement(input_1.Input, { value: newRule.name, onChange: function (e) { return setNewRule(__assign(__assign({}, newRule), { name: e.target.value })); } })),
                                            React.createElement("div", null,
                                                React.createElement(label_1.Label, null, "Type"),
                                                React.createElement(select_1.Select, { value: newRule.type, onValueChange: function (v) { return setNewRule(__assign(__assign({}, newRule), { type: v })); } },
                                                    React.createElement(select_1.SelectTrigger, null,
                                                        React.createElement(select_1.SelectValue, null)),
                                                    React.createElement(select_1.SelectContent, null,
                                                        React.createElement(select_1.SelectItem, { value: "leave_accrual" }, "Leave Accrual"),
                                                        React.createElement(select_1.SelectItem, { value: "contract_alert" }, "Contract Expiry Alert"),
                                                        React.createElement(select_1.SelectItem, { value: "payroll_generation" }, "Payroll Generation"),
                                                        React.createElement(select_1.SelectItem, { value: "probation_alert" }, "Probation Alert"),
                                                        React.createElement(select_1.SelectItem, { value: "birthday_reminder" }, "Birthday Reminder")))),
                                            React.createElement("div", null,
                                                React.createElement(label_1.Label, null, "Schedule"),
                                                React.createElement(select_1.Select, { value: newRule.schedule, onValueChange: function (v) { return setNewRule(__assign(__assign({}, newRule), { schedule: v })); } },
                                                    React.createElement(select_1.SelectTrigger, null,
                                                        React.createElement(select_1.SelectValue, null)),
                                                    React.createElement(select_1.SelectContent, null,
                                                        React.createElement(select_1.SelectItem, { value: "daily" }, "Daily"),
                                                        React.createElement(select_1.SelectItem, { value: "weekly" }, "Weekly"),
                                                        React.createElement(select_1.SelectItem, { value: "monthly" }, "Monthly")))),
                                            React.createElement(button_1.Button, { className: "w-full", onClick: function () { createRule.mutate(newRule); setNewRule({ name: "", type: "leave_accrual", schedule: "monthly", config: "{}" }); } }, "Create Rule")))))),
                        React.createElement(card_1.CardContent, null, !rules || rules.length === 0 ? (React.createElement("p", { className: "text-sm text-muted-foreground py-8 text-center" }, "No automation rules configured. Create one to get started.")) : (React.createElement(table_1.Table, null,
                            React.createElement(table_1.TableHeader, null,
                                React.createElement(table_1.TableRow, null,
                                    React.createElement(table_1.TableHead, null, "Name"),
                                    React.createElement(table_1.TableHead, null, "Type"),
                                    React.createElement(table_1.TableHead, null, "Schedule"),
                                    React.createElement(table_1.TableHead, null, "Active"),
                                    React.createElement(table_1.TableHead, { className: "w-20" }, "Actions"))),
                            React.createElement(table_1.TableBody, null, rules.map(function (rule) { return (React.createElement(table_1.TableRow, { key: rule.id },
                                React.createElement(table_1.TableCell, { className: "font-medium" }, rule.name),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(badge_1.Badge, { variant: "outline" }, rule.type)),
                                React.createElement(table_1.TableCell, null, rule.schedule),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(switch_1.Switch, { checked: !!rule.is_active, onCheckedChange: function (v) { return updateRule.mutate({ id: rule.id, isActive: v }); } })),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(button_1.Button, { size: "icon", variant: "ghost", className: "text-destructive", onClick: function () { return deleteRule.mutate({ id: rule.id }); } },
                                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))))); }))))))),
                React.createElement(tabs_1.TabsContent, { value: "actions" },
                    React.createElement("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-4" },
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, null,
                                React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                                    React.createElement(lucide_react_1.Calendar, { className: "h-4 w-4 text-blue-500" }),
                                    " Leave Accrual"),
                                React.createElement(card_1.CardDescription, null, "Run monthly leave accrual for all active employees")),
                            React.createElement(card_1.CardContent, null,
                                React.createElement(button_1.Button, { className: "w-full", onClick: function () { return runLeaveAccrual.mutate({ leaveType: "annual", accrualDays: 1.75 }); }, disabled: runLeaveAccrual.isPending },
                                    React.createElement(lucide_react_1.RefreshCw, { className: "h-4 w-4 mr-1" }),
                                    " Run Accrual (1.75 days)"))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, null,
                                React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                                    React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4 text-emerald-500" }),
                                    " Generate Payroll"),
                                React.createElement(card_1.CardDescription, null, "Auto-generate payroll for all active employees")),
                            React.createElement(card_1.CardContent, { className: "space-y-3" },
                                React.createElement("div", { className: "flex gap-2" },
                                    React.createElement("div", { className: "flex-1" },
                                        React.createElement(label_1.Label, null, "Month"),
                                        React.createElement(select_1.Select, { value: String(payrollMonth), onValueChange: function (v) { return setPayrollMonth(parseInt(v)); } },
                                            React.createElement(select_1.SelectTrigger, null,
                                                React.createElement(select_1.SelectValue, null)),
                                            React.createElement(select_1.SelectContent, null, Array.from({ length: 12 }, function (_, i) { return (React.createElement(select_1.SelectItem, { key: i + 1, value: String(i + 1) }, new Date(2024, i).toLocaleString("default", { month: "long" }))); })))),
                                    React.createElement("div", { className: "w-24" },
                                        React.createElement(label_1.Label, null, "Year"),
                                        React.createElement(input_1.Input, { type: "number", value: payrollYear, onChange: function (e) { return setPayrollYear(parseInt(e.target.value)); } }))),
                                React.createElement(button_1.Button, { className: "w-full", onClick: function () { return generatePayroll.mutate({ month: payrollMonth, year: payrollYear }); }, disabled: generatePayroll.isPending },
                                    React.createElement(lucide_react_1.Play, { className: "h-4 w-4 mr-1" }),
                                    " Generate Payroll"))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, null,
                                React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                                    React.createElement(lucide_react_1.Zap, { className: "h-4 w-4 text-purple-500" }),
                                    " Run All Automation"),
                                React.createElement(card_1.CardDescription, null, "Execute all active automation rules at once")),
                            React.createElement(card_1.CardContent, null,
                                React.createElement(button_1.Button, { className: "w-full", variant: "outline", onClick: function () { return runAutomation.mutate(); }, disabled: runAutomation.isPending },
                                    React.createElement(lucide_react_1.Play, { className: "h-4 w-4 mr-1" }),
                                    " Execute All Rules"))))),
                React.createElement(tabs_1.TabsContent, { value: "logs" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "text-base" }, "Automation Logs")),
                        React.createElement(card_1.CardContent, null, !logs || logs.length === 0 ? (React.createElement("p", { className: "text-sm text-muted-foreground py-8 text-center" }, "No automation logs yet.")) : (React.createElement(table_1.Table, null,
                            React.createElement(table_1.TableHeader, null,
                                React.createElement(table_1.TableRow, null,
                                    React.createElement(table_1.TableHead, null, "Rule"),
                                    React.createElement(table_1.TableHead, null, "Status"),
                                    React.createElement(table_1.TableHead, null, "Result"),
                                    React.createElement(table_1.TableHead, null, "Executed"))),
                            React.createElement(table_1.TableBody, null, logs.map(function (log) { return (React.createElement(table_1.TableRow, { key: log.id },
                                React.createElement(table_1.TableCell, { className: "font-medium" }, log.rule_name),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(badge_1.Badge, { variant: log.status === "success" ? "default" : "destructive" }, log.status)),
                                React.createElement(table_1.TableCell, { className: "max-w-xs truncate" }, log.result),
                                React.createElement(table_1.TableCell, { className: "whitespace-nowrap" }, log.executed_at ? new Date(log.executed_at).toLocaleString() : "-"))); })))))))))));
}
exports["default"] = HRAutomation;
