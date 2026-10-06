"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var react_1 = require("react");
var react_query_1 = require("@tanstack/react-query");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var tabs_1 = require("@/components/ui/tabs");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
function SchedulerMonitoring() {
    var _this = this;
    var _a = react_1.useState(true), autoRefresh = _a[0], setAutoRefresh = _a[1];
    var _b = react_1.useState(null), selectedJob = _b[0], setSelectedJob = _b[1];
    // Fetch job statuses
    var _c = react_query_1.useQuery({
        queryKey: ['scheduler:jobs'],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch('/api/scheduler/jobs')];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error('Failed to fetch job statuses');
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        refetchInterval: autoRefresh ? 5000 : false
    }), _d = _c.data, jobStatuses = _d === void 0 ? [] : _d, isLoading = _c.isLoading, refetch = _c.refetch;
    // Fetch metrics
    var metrics = react_query_1.useQuery({
        queryKey: ['scheduler:metrics'],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch('/api/scheduler/metrics')];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error('Failed to fetch metrics');
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        refetchInterval: autoRefresh ? 10000 : false
    }).data;
    // Fetch job logs
    var _e = react_query_1.useQuery({
        queryKey: ['scheduler:logs', selectedJob],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var url, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = selectedJob
                            ? "/api/scheduler/logs?jobId=" + selectedJob
                            : '/api/scheduler/logs?limit=50';
                        return [4 /*yield*/, fetch(url)];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error('Failed to fetch logs');
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        refetchInterval: autoRefresh ? 10000 : false
    }).data, jobLogs = _e === void 0 ? [] : _e;
    var getStatusIcon = function (status) {
        switch (status) {
            case 'completed':
                return React.createElement(lucide_react_1.CheckCircle2, { className: "h-5 w-5 text-green-500" });
            case 'failed':
                return React.createElement(lucide_react_1.AlertCircle, { className: "h-5 w-5 text-red-500" });
            case 'running':
                return React.createElement(lucide_react_1.Activity, { className: "h-5 w-5 text-blue-500 animate-pulse" });
            case 'warning':
                return React.createElement(lucide_react_1.AlertTriangle, { className: "h-5 w-5 text-yellow-500" });
            default:
                return React.createElement(lucide_react_1.Clock, { className: "h-5 w-5 text-gray-500" });
        }
    };
    var getStatusBadgeColor = function (status) {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'failed':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'running':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'warning':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };
    return (React.createElement("div", { className: "space-y-6 p-6 bg-gray-50 min-h-screen" },
        React.createElement("div", { className: "flex justify-between items-center" },
            React.createElement("div", null,
                React.createElement("h1", { className: "text-3xl font-bold text-gray-900" }, "Scheduler Monitoring"),
                React.createElement("p", { className: "text-gray-600 mt-1" }, "24/7 job scheduler and background task monitoring")),
            React.createElement("div", { className: "flex gap-2" },
                React.createElement(button_1.Button, { variant: autoRefresh ? 'default' : 'outline', onClick: function () { return setAutoRefresh(!autoRefresh); }, size: "sm", className: "gap-2" },
                    React.createElement(lucide_react_1.RefreshCw, { className: "h-4 w-4" }),
                    autoRefresh ? 'Live' : 'Manual'),
                React.createElement(button_1.Button, { onClick: function () { return refetch(); }, size: "sm", className: "gap-2" },
                    React.createElement(lucide_react_1.RefreshCw, { className: "h-4 w-4" }),
                    "Refresh"))),
        metrics && metrics.failedJobs > 0 && (React.createElement(alert_1.Alert, { variant: "destructive" },
            React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4" }),
            React.createElement(alert_1.AlertDescription, null,
                metrics.failedJobs,
                " job(s) failed. Please review the logs and take corrective action."))),
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-2" },
                    React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-600 flex items-center gap-2" },
                        React.createElement(lucide_react_1.BarChart3, { className: "h-4 w-4 text-blue-500" }),
                        "Total Jobs")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "text-2xl font-bold text-gray-900" }, (metrics === null || metrics === void 0 ? void 0 : metrics.totalJobs) || 0),
                    React.createElement("p", { className: "text-xs text-gray-500 mt-1" }, "Active in scheduler"))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-2" },
                    React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-600 flex items-center gap-2" },
                        React.createElement(lucide_react_1.Activity, { className: "h-4 w-4 text-green-500" }),
                        "Running")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "text-2xl font-bold text-gray-900" }, (metrics === null || metrics === void 0 ? void 0 : metrics.runningJobs) || 0),
                    React.createElement("p", { className: "text-xs text-green-600 mt-1" }, "Currently executing"))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-2" },
                    React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-600 flex items-center gap-2" },
                        React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-red-500" }),
                        "Failed")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "text-2xl font-bold text-gray-900" }, (metrics === null || metrics === void 0 ? void 0 : metrics.failedJobs) || 0),
                    React.createElement("p", { className: "text-xs text-red-600 mt-1" }, "Recent failures"))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-2" },
                    React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-600 flex items-center gap-2" },
                        React.createElement(lucide_react_1.TrendingUp, { className: "h-4 w-4 text-purple-500" }),
                        "Success Rate")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "text-2xl font-bold text-gray-900" }, metrics ? ((metrics.successfulExecutions / metrics.totalExecutions) * 100 || 0).toFixed(1) + "%" : '0%'),
                    React.createElement("p", { className: "text-xs text-gray-500 mt-1" }, "Overall success rate")))),
        React.createElement(tabs_1.Tabs, { defaultValue: "jobs", className: "space-y-4" },
            React.createElement(tabs_1.TabsList, null,
                React.createElement(tabs_1.TabsTrigger, { value: "jobs" }, "Jobs Status"),
                React.createElement(tabs_1.TabsTrigger, { value: "logs" }, "Execution Logs"),
                React.createElement(tabs_1.TabsTrigger, { value: "details" }, "Job Details")),
            React.createElement(tabs_1.TabsContent, { value: "jobs" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Scheduled Jobs Status"),
                        React.createElement(card_1.CardDescription, null, "Real-time status of all background jobs")),
                    React.createElement(card_1.CardContent, null, isLoading ? (React.createElement("div", { className: "flex justify-center py-8" },
                        React.createElement("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" }))) : (React.createElement("div", { className: "space-y-3" }, jobStatuses.map(function (job) { return (React.createElement("div", { key: job.jobId, onClick: function () { return setSelectedJob(job.jobId); }, className: "p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition" },
                        React.createElement("div", { className: "flex items-start justify-between" },
                            React.createElement("div", { className: "flex items-center gap-3 flex-1" },
                                getStatusIcon(job.status),
                                React.createElement("div", { className: "flex-1" },
                                    React.createElement("p", { className: "font-semibold text-gray-900" }, job.jobName),
                                    React.createElement("p", { className: "text-sm text-gray-500" }, job.lastExecution
                                        ? "Last run: " + date_fns_1.formatDistance(new Date(job.lastExecution), new Date(), { addSuffix: true })
                                        : 'Never executed'))),
                            React.createElement("div", { className: "text-right" },
                                React.createElement(badge_1.Badge, { className: getStatusBadgeColor(job.status) }, job.status.toUpperCase()),
                                React.createElement("p", { className: "text-xs text-gray-500 mt-2" },
                                    job.successRate.toFixed(1),
                                    "% success rate"))),
                        React.createElement("div", { className: "flex gap-4 mt-3 text-sm" },
                            React.createElement("div", null,
                                React.createElement("span", { className: "text-gray-500" }, "Executions:"),
                                React.createElement("span", { className: "ml-2 font-semibold" }, job.executionCount)),
                            React.createElement("div", null,
                                React.createElement("span", { className: "text-gray-500" }, "Failures:"),
                                React.createElement("span", { className: "ml-2 font-semibold text-red-600" }, job.failureCount)),
                            job.duration && (React.createElement("div", null,
                                React.createElement("span", { className: "text-gray-500" }, "Last Duration:"),
                                React.createElement("span", { className: "ml-2 font-semibold" },
                                    job.duration,
                                    "ms")))),
                        job.errorMessage && (React.createElement("div", { className: "mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700" }, job.errorMessage)),
                        job.nextExecution && (React.createElement("p", { className: "text-xs text-gray-500 mt-2" },
                            "Next execution: ",
                            date_fns_1.format(new Date(job.nextExecution), 'MMM dd, yyyy HH:mm:ss'))))); })))))),
            React.createElement(tabs_1.TabsContent, { value: "logs" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Execution Logs"),
                        React.createElement(card_1.CardDescription, null, selectedJob ? 'Logs for selected job' : 'Recent logs from all jobs')),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "space-y-2 max-h-96 overflow-y-auto" }, jobLogs.length === 0 ? (React.createElement("p", { className: "text-center text-gray-500 py-8" }, "No logs available")) : (jobLogs.map(function (log) { return (React.createElement("div", { key: log.id, className: "p-3 border rounded text-sm " + (log.status === 'success'
                                ? 'border-green-200 bg-green-50'
                                : log.status === 'failure'
                                    ? 'border-red-200 bg-red-50'
                                    : 'border-yellow-200 bg-yellow-50') },
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("div", null,
                                    React.createElement("p", { className: "font-semibold" }, log.jobName),
                                    React.createElement("p", { className: "text-xs text-gray-600" }, date_fns_1.format(new Date(log.startTime), 'MMM dd, HH:mm:ss'))),
                                React.createElement(badge_1.Badge, { variant: log.status === 'success'
                                        ? 'default'
                                        : log.status === 'failure'
                                            ? 'destructive'
                                            : 'secondary' }, log.status.toUpperCase())),
                            React.createElement("p", { className: "text-xs text-gray-700 mt-1" }, log.message),
                            React.createElement("p", { className: "text-xs text-gray-500 mt-1" },
                                "Duration: ",
                                log.duration,
                                "ms"))); })))))),
            React.createElement(tabs_1.TabsContent, { value: "details" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Scheduler Metrics"),
                        React.createElement(card_1.CardDescription, null, "Overall scheduler performance statistics")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                            React.createElement("div", { className: "p-4 border rounded-lg" },
                                React.createElement("p", { className: "text-sm text-gray-600" }, "Total Executions"),
                                React.createElement("p", { className: "text-2xl font-bold text-gray-900" }, (metrics === null || metrics === void 0 ? void 0 : metrics.totalExecutions) || 0)),
                            React.createElement("div", { className: "p-4 border rounded-lg" },
                                React.createElement("p", { className: "text-sm text-gray-600" }, "Successful Executions"),
                                React.createElement("p", { className: "text-2xl font-bold text-green-600" }, (metrics === null || metrics === void 0 ? void 0 : metrics.successfulExecutions) || 0)),
                            React.createElement("div", { className: "p-4 border rounded-lg" },
                                React.createElement("p", { className: "text-sm text-gray-600" }, "Average Execution Time"),
                                React.createElement("p", { className: "text-2xl font-bold text-gray-900" },
                                    (metrics === null || metrics === void 0 ? void 0 : metrics.averageExecutionTime) || 0,
                                    "ms")),
                            React.createElement("div", { className: "p-4 border rounded-lg" },
                                React.createElement("p", { className: "text-sm text-gray-600" }, "System Status"),
                                React.createElement("p", { className: "text-2xl font-bold text-green-600" }, "Healthy"))),
                        React.createElement("div", { className: "mt-6 space-y-3" },
                            React.createElement("h3", { className: "font-semibold text-gray-900" }, "Managed Jobs"),
                            React.createElement("div", { className: "space-y-2 text-sm" },
                                React.createElement("div", { className: "flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200" },
                                    React.createElement("span", null, "Recurring Invoices"),
                                    React.createElement(badge_1.Badge, { variant: "outline" }, "Enabled")),
                                React.createElement("div", { className: "flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200" },
                                    React.createElement("span", null, "Payment Reminders"),
                                    React.createElement(badge_1.Badge, { variant: "outline" }, "Enabled")),
                                React.createElement("div", { className: "flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200" },
                                    React.createElement("span", null, "Email Queue Processing"),
                                    React.createElement(badge_1.Badge, { variant: "outline" }, "Enabled")),
                                React.createElement("div", { className: "flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200" },
                                    React.createElement("span", null, "SMS Queue Processing"),
                                    React.createElement(badge_1.Badge, { variant: "outline" }, "Enabled"))))))))));
}
exports["default"] = SchedulerMonitoring;
