"use strict";
/**
 * Scheduler Job Monitoring Dashboard
 * Real-time monitoring of background jobs, health status, and job metrics
 * Supports manual job triggering and historical job tracking
 */
exports.__esModule = true;
var react_1 = require("react");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var designSystem_1 = require("@/lib/designSystem");
function SchedulerDashboard() {
    var _a = permissions_1.useRequireFeature("admin:scheduler:view"), allowed = _a.allowed, permissionsLoading = _a.isLoading;
    var _b = react_1.useState(false), refreshing = _b[0], setRefreshing = _b[1];
    var utils = trpc_1.trpc.useUtils();
    var _c = trpc_1.trpc.jobScheduler.listJobs.useQuery(), _d = _c.data, rawJobs = _d === void 0 ? [] : _d, schedulerLoading = _c.isLoading;
    var rawHealth = trpc_1.trpc.jobScheduler.getHealthStatus.useQuery().data;
    var jobs = JSON.parse(JSON.stringify(rawJobs));
    var health = rawHealth ? JSON.parse(JSON.stringify(rawHealth)) : null;
    var triggerJobMutation = trpc_1.trpc.jobScheduler.triggerJobNow.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Job triggered successfully");
            utils.jobScheduler.listJobs.invalidate();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to trigger job");
        }
    });
    var handleRefresh = function () {
        setRefreshing(true);
        utils.jobScheduler.listJobs.invalidate();
        utils.jobScheduler.getHealthStatus.invalidate();
        setTimeout(function () { return setRefreshing(false); }, 500);
    };
    var handleTriggerJob = function (jobId) {
        triggerJobMutation.mutate({ jobId: jobId });
    };
    if (permissionsLoading || schedulerLoading)
        return React.createElement(spinner_1.Spinner, { className: "w-8 h-8 mx-auto my-8" });
    if (!allowed)
        return null;
    // Calculate metrics
    var totalJobs = jobs.length;
    var activeJobs = jobs.filter(function (j) { return j.isActive; }).length;
    var totalFailures = jobs.reduce(function (sum, j) { return sum + (j.failureCount || 0); }, 0);
    var healthStatusLabel = (health === null || health === void 0 ? void 0 : health.isHealthy) ? "healthy" : totalFailures > 5 ? "critical" : "degraded";
    var statusColors = {
        healthy: "text-emerald-600 dark:text-emerald-400",
        degraded: "text-orange-600 dark:text-orange-400",
        critical: "text-red-600 dark:text-red-400"
    };
    var statusBgColors = {
        healthy: "bg-emerald-100 dark:bg-emerald-900/20",
        degraded: "bg-orange-100 dark:bg-orange-900/20",
        critical: "bg-red-100 dark:bg-red-900/20"
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Administration", href: "/admin" },
            { label: "Scheduler", href: "/scheduler" },
        ], title: "Job Scheduler", description: "Monitor and manage scheduled background jobs", icon: React.createElement(lucide_react_1.Clock, { className: "w-6 h-6" }), actions: React.createElement(button_1.Button, { variant: "outline", onClick: handleRefresh, disabled: refreshing, className: designSystem_1.animations.fadeIn },
            React.createElement(lucide_react_1.RefreshCw, { className: "w-4 h-4 mr-2 " + (refreshing ? "animate-spin" : "") }),
            refreshing ? "Refreshing..." : "Refresh") },
        React.createElement("div", { className: "space-y-6" },
            healthStatusLabel !== "healthy" && (React.createElement(alert_1.Alert, { className: statusBgColors[healthStatusLabel] + " border-2" },
                React.createElement(lucide_react_1.AlertCircle, { className: "w-4 h-4 " + statusColors[healthStatusLabel] }),
                React.createElement(alert_1.AlertDescription, null,
                    "System health status: ",
                    React.createElement("strong", null, healthStatusLabel.toUpperCase()),
                    totalFailures > 0 && " - " + totalFailures + " failed jobs"))),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" },
                React.createElement(card_1.Card, { className: designSystem_1.getGradientCard("blue") },
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium flex items-center justify-between" },
                            "Active Jobs",
                            React.createElement(lucide_react_1.Activity, { className: "w-5 h-5 " + designSystem_1.getStatusColor("active") }))),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" }, activeJobs),
                        React.createElement("p", { className: "text-xs text-muted-foreground mt-1" },
                            "of ",
                            totalJobs,
                            " total"))),
                React.createElement(card_1.Card, { className: designSystem_1.getGradientCard("emerald") },
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium flex items-center justify-between" },
                            "Health Status",
                            React.createElement(lucide_react_1.CheckCircle2, { className: "w-5 h-5 " + designSystem_1.getStatusColor("success") }))),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold text-emerald-600" }, (health === null || health === void 0 ? void 0 : health.isHealthy) ? "OK" : "Down"),
                        React.createElement("p", { className: "text-xs text-muted-foreground mt-1" }, (health === null || health === void 0 ? void 0 : health.statusMessage) || "Unknown"))),
                React.createElement(card_1.Card, { className: designSystem_1.getGradientCard("orange") },
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium flex items-center justify-between" },
                            "Recent Failures",
                            React.createElement(lucide_react_1.XCircle, { className: "w-5 h-5 " + designSystem_1.getStatusColor("error") }))),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold text-orange-600" }, (health === null || health === void 0 ? void 0 : health.recentFailuresLastHour) || 0),
                        React.createElement("p", { className: "text-xs text-muted-foreground mt-1" }, "Last hour"))),
                React.createElement(card_1.Card, { className: designSystem_1.getGradientCard("purple") },
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium flex items-center justify-between" },
                            "Total Failures",
                            React.createElement(lucide_react_1.Zap, { className: "w-5 h-5 " + designSystem_1.getStatusColor("info") }))),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" }, totalFailures),
                        React.createElement("p", { className: "text-xs text-muted-foreground mt-1" }, "Across all jobs")))),
            React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
                React.createElement(card_1.Card, { className: designSystem_1.getGradientCard("blue") },
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "System Health"),
                        React.createElement(card_1.CardDescription, null, "Real-time scheduler metrics")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "space-y-4" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-muted-foreground mb-2" }, "Status"),
                                React.createElement(badge_1.Badge, { className: "" + statusBgColors[healthStatusLabel] }, healthStatusLabel.toUpperCase())),
                            React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-2xl font-bold" }, (health === null || health === void 0 ? void 0 : health.activeJobsCount) || 0),
                                    React.createElement("p", { className: "text-xs text-muted-foreground" }, "Active Jobs")),
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-2xl font-bold" }, (health === null || health === void 0 ? void 0 : health.recentFailuresLastHour) || 0),
                                    React.createElement("p", { className: "text-xs text-muted-foreground" }, "Failures (last hr)"))),
                            (health === null || health === void 0 ? void 0 : health.lastHeartbeatAt) && (React.createElement("div", { className: "p-3 bg-white/50 dark:bg-black/20 rounded-lg" },
                                React.createElement("p", { className: "text-sm" },
                                    React.createElement("strong", null, "Last Heartbeat:"),
                                    " ",
                                    new Date(health.lastHeartbeatAt).toLocaleString())))))),
                React.createElement(card_1.Card, { className: designSystem_1.getGradientCard("slate") },
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Jobs Summary"),
                        React.createElement(card_1.CardDescription, null, "Overview of all scheduled jobs")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "space-y-3" }, jobs.length === 0 ? (React.createElement("p", { className: "text-muted-foreground text-center py-8" }, "No scheduled jobs found")) : (React.createElement(React.Fragment, null,
                            React.createElement("div", { className: "grid grid-cols-3 gap-4 text-center" },
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-2xl font-bold text-emerald-600" }, activeJobs),
                                    React.createElement("p", { className: "text-xs text-muted-foreground" }, "Active")),
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-2xl font-bold text-orange-600" }, totalJobs - activeJobs),
                                    React.createElement("p", { className: "text-xs text-muted-foreground" }, "Inactive")),
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-2xl font-bold" }, totalJobs),
                                    React.createElement("p", { className: "text-xs text-muted-foreground" }, "Total"))))))))),
            React.createElement(card_1.Card, { className: designSystem_1.getGradientCard("slate") },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: designSystem_1.animations.fadeIn }, "Scheduled Jobs"),
                    React.createElement(card_1.CardDescription, null, "View and manage all background jobs")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "space-y-4" }, jobs.length === 0 ? (React.createElement("p", { className: "text-muted-foreground text-center py-8" }, "No scheduled jobs configured")) : jobs.map(function (job) { return (React.createElement("div", { key: job.jobId, className: "p-4 rounded-lg border bg-white dark:bg-slate-900 hover:shadow-md transition-shadow" },
                        React.createElement("div", { className: "flex items-start justify-between gap-4" },
                            React.createElement("div", { className: "flex-grow" },
                                React.createElement("div", { className: "flex items-center gap-2 mb-2" },
                                    React.createElement("h3", { className: "font-semibold" }, job.jobName),
                                    React.createElement(badge_1.Badge, { variant: "outline" }, job.cronExpression),
                                    React.createElement(badge_1.Badge, { className: job.isActive
                                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100"
                                            : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100" }, job.isActive ? "Active" : "Inactive"),
                                    job.jobType && React.createElement(badge_1.Badge, { variant: "secondary" }, job.jobType)),
                                job.description && React.createElement("p", { className: "text-sm text-muted-foreground mb-3" }, job.description),
                                React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm" },
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-muted-foreground text-xs" }, "Last Run"),
                                        React.createElement("p", { className: "font-medium" }, job.lastExecutedAt ? new Date(job.lastExecutedAt).toLocaleString() : "Never")),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-muted-foreground text-xs" }, "Next Run"),
                                        React.createElement("p", { className: "font-medium" }, job.nextExecutionAt ? new Date(job.nextExecutionAt).toLocaleString() : "N/A")),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-muted-foreground text-xs" }, "Timezone"),
                                        React.createElement("p", { className: "font-medium" }, job.timezone || "UTC")),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-muted-foreground text-xs" }, "Failures"),
                                        React.createElement("p", { className: "font-medium" }, job.failureCount || 0)))),
                            React.createElement("div", { className: "flex gap-2" },
                                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return handleTriggerJob(job.jobId); }, disabled: !job.isActive || triggerJobMutation.isPending, title: "Manually trigger job" },
                                    React.createElement(lucide_react_1.Play, { className: "h-4 w-4" })))))); })))))));
}
exports["default"] = SchedulerDashboard;
