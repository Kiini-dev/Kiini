"use strict";
exports.__esModule = true;
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var ModuleLayout_1 = require("@/components/ModuleLayout");
function EtlMonitor() {
    var _a = trpc_1.trpc.businessIntelligence.listEtlJobs.useQuery({ limit: 50 }), etlJobs = _a.data, isLoading = _a.isLoading, refetch = _a.refetch;
    var runEtl = trpc_1.trpc.businessIntelligence.runEtlJob.useMutation({ onSuccess: function () { sonner_1.toast.success("ETL job triggered"); refetch(); } });
    if (isLoading)
        return React.createElement("div", { className: "flex items-center justify-center min-h-screen" },
            React.createElement(lucide_react_1.Loader2, { className: "w-8 h-8 animate-spin text-indigo-600" }));
    var jobs = etlJobs ? JSON.parse(JSON.stringify(etlJobs)) : { jobs: [], total: 0 };
    var running = jobs.jobs.filter(function (j) { return j.status === "running"; });
    var completed = jobs.jobs.filter(function (j) { return j.status === "completed"; });
    var failed = jobs.jobs.filter(function (j) { return j.status === "failed"; });
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "ETL Monitor", icon: React.createElement(lucide_react_1.Activity, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "System" }, { label: "ETL Monitor" }] },
        React.createElement("div", { className: "flex justify-between items-center" },
            React.createElement("h1", { className: "text-3xl font-bold text-slate-900 flex items-center gap-2" },
                React.createElement(lucide_react_1.Zap, { size: 32 }),
                " ETL Monitoring"),
            React.createElement("button", { onClick: function () { return runEtl.mutate({ jobName: "manual", sourceTable: "all", targetTable: "all" }); }, className: "px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700" }, "Trigger Job")),
        React.createElement("div", { className: "grid grid-cols-4 gap-4" }, [
            { title: "Total Jobs", value: String(jobs.total), color: "blue" },
            { title: "Running", value: String(running.length), color: "blue" },
            { title: "Completed", value: String(completed.length), color: "green" },
            { title: "Failed", value: String(failed.length), color: "red" },
        ].map(function (stat, idx) { return (React.createElement("div", { key: idx, className: "bg-white p-4 rounded-lg shadow border-l-4 border-" + stat.color + "-500" },
            React.createElement("p", { className: "text-sm text-slate-600" }, stat.title),
            React.createElement("p", { className: "text-2xl font-bold text-slate-900" }, stat.value))); })),
        React.createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            React.createElement("h2", { className: "text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2" },
                React.createElement(lucide_react_1.Activity, { size: 20 }),
                " ETL Jobs"),
            jobs.jobs.length === 0 ? (React.createElement("p", { className: "text-slate-500 text-center py-8" }, "No ETL jobs found.")) : (React.createElement("div", { className: "space-y-3" }, jobs.jobs.map(function (job, idx) {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                return (React.createElement("div", { key: (_a = job.id) !== null && _a !== void 0 ? _a : idx, className: "p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300" },
                    React.createElement("div", { className: "flex items-center justify-between mb-2" },
                        React.createElement("h3", { className: "font-medium text-slate-900" }, (_c = (_b = job.name) !== null && _b !== void 0 ? _b : job.jobName) !== null && _c !== void 0 ? _c : "ETL Job"),
                        React.createElement("span", { className: "px-2 py-1 text-xs font-bold rounded " + (job.status === "running" ? "bg-blue-100 text-blue-700" :
                                job.status === "completed" ? "bg-green-100 text-green-700" :
                                    job.status === "failed" ? "bg-red-100 text-red-700" :
                                        "bg-gray-100 text-gray-700") }, (_d = job.status) !== null && _d !== void 0 ? _d : "unknown")),
                    React.createElement("div", { className: "flex justify-between text-sm text-slate-600" },
                        React.createElement("span", null, (_f = (_e = job.recordsProcessed) === null || _e === void 0 ? void 0 : _e.toLocaleString()) !== null && _f !== void 0 ? _f : "—",
                            " records processed"),
                        React.createElement("span", null, (_h = (_g = job.duration) !== null && _g !== void 0 ? _g : job.createdAt) !== null && _h !== void 0 ? _h : "—"))));
            })))),
        failed.length > 0 && (React.createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            React.createElement("h2", { className: "text-lg font-semibold text-slate-900 mb-4" }, "Recent Failures"),
            React.createElement("div", { className: "space-y-2" }, failed.slice(0, 5).map(function (fail, idx) {
                var _a, _b, _c, _d;
                return (React.createElement("div", { key: (_a = fail.id) !== null && _a !== void 0 ? _a : idx, className: "p-3 bg-red-50 rounded-lg border border-red-200 flex items-start gap-3" },
                    React.createElement(lucide_react_1.AlertCircle, { size: 18, className: "text-red-600 mt-0.5 flex-shrink-0" }),
                    React.createElement("div", null,
                        React.createElement("p", { className: "font-medium text-red-900" }, (_c = (_b = fail.name) !== null && _b !== void 0 ? _b : fail.jobName) !== null && _c !== void 0 ? _c : "Job"),
                        React.createElement("p", { className: "text-sm text-red-700" }, (_d = fail.error) !== null && _d !== void 0 ? _d : "Unknown error"))));
            }))))));
}
exports["default"] = EtlMonitor;
