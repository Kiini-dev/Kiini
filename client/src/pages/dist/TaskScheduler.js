"use strict";
exports.__esModule = true;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var ModuleLayout_1 = require("@/components/ModuleLayout");
function TaskScheduler() {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    var _j = trpc_1.trpc.jobScheduler.listJobs.useQuery(), jobsData = _j.data, isLoading = _j.isLoading, error = _j.error;
    var healthData = trpc_1.trpc.jobScheduler.getHealthStatus.useQuery().data;
    var utils = trpc_1.trpc.useUtils();
    var triggerJob = trpc_1.trpc.jobScheduler.triggerJobNow.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Job triggered successfully");
            utils.jobScheduler.listJobs.invalidate();
        },
        onError: function (err) { var _a; return sonner_1.toast.error((_a = err.message) !== null && _a !== void 0 ? _a : "Failed to trigger job"); }
    });
    var jobs = (_c = (_b = (_a = jobsData) === null || _a === void 0 ? void 0 : _a.jobs) !== null && _b !== void 0 ? _b : jobsData) !== null && _c !== void 0 ? _c : [];
    var health = (_d = healthData) !== null && _d !== void 0 ? _d : {};
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Task Scheduler", icon: react_1["default"].createElement(lucide_react_1.Clock, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "System" },
            { label: "Task Scheduler" },
        ] }, isLoading ? (react_1["default"].createElement("div", { className: "flex justify-center py-12" },
        react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))) : error ? (react_1["default"].createElement("div", { className: "bg-red-50 text-red-700 p-4 rounded-lg" }, error.message)) : (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement("div", { className: "grid grid-cols-3 gap-4" },
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Scheduled Jobs"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold" }, jobs.length),
                react_1["default"].createElement("div", { className: "text-xs text-green-600" },
                    jobs.filter(function (j) { return j.status === "scheduled" || j.status === "active"; }).length,
                    " active")),
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Executions Today"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold" }, (_f = (_e = health.executionsToday) !== null && _e !== void 0 ? _e : health.totalExecutions) !== null && _f !== void 0 ? _f : 0),
                react_1["default"].createElement("div", { className: "text-xs text-blue-600" }, "Last 24 hours")),
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Success Rate"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold" }, (_h = (_g = health.successRate) !== null && _g !== void 0 ? _g : health.uptime) !== null && _h !== void 0 ? _h : "\u2014"),
                react_1["default"].createElement("div", { className: "text-xs text-green-600" }, "This month"))),
        jobs.length === 0 ? (react_1["default"].createElement("p", { className: "text-center text-gray-500 py-8" }, "No scheduled jobs found")) : (react_1["default"].createElement("div", { className: "space-y-3" }, jobs.map(function (job) {
            var _a, _b, _c, _d, _e, _f, _g;
            return (react_1["default"].createElement("div", { key: job.id, className: "bg-white p-4 rounded-lg shadow hover:shadow-md transition" },
                react_1["default"].createElement("div", { className: "flex items-start justify-between mb-3" },
                    react_1["default"].createElement("div", { className: "flex-1" },
                        react_1["default"].createElement("h3", { className: "font-semibold text-lg" }, (_a = job.name) !== null && _a !== void 0 ? _a : "\u2014"),
                        react_1["default"].createElement("p", { className: "text-sm text-gray-600 mt-1" }, (_c = (_b = job.schedule) !== null && _b !== void 0 ? _b : job.cronExpression) !== null && _c !== void 0 ? _c : "\u2014")),
                    react_1["default"].createElement("button", { onClick: function () { return triggerJob.mutate({ jobId: job.id }); }, disabled: triggerJob.isPending, className: "p-2 text-blue-600 hover:bg-blue-50 rounded", title: "Run now" },
                        react_1["default"].createElement(lucide_react_1.Play, { className: "w-5 h-5" }))),
                react_1["default"].createElement("div", { className: "grid grid-cols-3 gap-4 text-sm" },
                    react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.Calendar, { className: "w-4 h-4 text-gray-400" }),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("div", { className: "text-gray-600" }, "Next Run"),
                            react_1["default"].createElement("div", { className: "font-medium" }, (_e = (_d = job.nextRun) !== null && _d !== void 0 ? _d : job.nextRunAt) !== null && _e !== void 0 ? _e : "\u2014"))),
                    react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.Clock, { className: "w-4 h-4 text-gray-400" }),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("div", { className: "text-gray-600" }, "Last Run"),
                            react_1["default"].createElement("div", { className: "font-medium" }, (_g = (_f = job.lastRun) !== null && _f !== void 0 ? _f : job.lastRunAt) !== null && _g !== void 0 ? _g : "\u2014"))),
                    react_1["default"].createElement("div", { className: "text-right" },
                        react_1["default"].createElement("span", { className: "inline-block w-2 h-2 rounded-full " + (job.status === "scheduled" || job.status === "active"
                                ? "bg-green-500"
                                : "bg-gray-400") })))));
        })))))));
}
exports["default"] = TaskScheduler;
