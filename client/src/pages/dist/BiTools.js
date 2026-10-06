"use strict";
exports.__esModule = true;
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
function BiTools() {
    var _a, _b, _c, _d, _e, _f;
    var _g = trpc_1.trpc.businessIntelligence.getDataWarehouseMetrics.useQuery({ timeRange: "30d" }), warehouse = _g.data, wl = _g.isLoading;
    var _h = trpc_1.trpc.businessIntelligence.listEtlJobs.useQuery({ limit: 50 }), etlJobs = _h.data, el = _h.isLoading;
    if (wl || el)
        return React.createElement("div", { className: "flex items-center justify-center min-h-screen" },
            React.createElement(lucide_react_1.Loader2, { className: "w-8 h-8 animate-spin text-orange-600" }));
    var wh = warehouse ? JSON.parse(JSON.stringify(warehouse)) : {};
    var jobs = etlJobs ? JSON.parse(JSON.stringify(etlJobs)) : { jobs: [], total: 0 };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "BI Tools", icon: React.createElement(lucide_react_1.BarChart3, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Analytics" }, { label: "BI Tools" }] },
        React.createElement("h1", { className: "text-3xl font-bold text-slate-900 flex items-center gap-2" },
            React.createElement(lucide_react_1.BarChart3, { size: 32 }),
            " Business Intelligence Tools"),
        React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" }, [
            { title: "Total Records", value: (_b = (_a = wh.totalRecords) === null || _a === void 0 ? void 0 : _a.toLocaleString()) !== null && _b !== void 0 ? _b : "—", color: "blue" },
            { title: "ETL Jobs", value: String((_c = jobs.total) !== null && _c !== void 0 ? _c : 0), color: "green" },
            { title: "Tables", value: (_e = (_d = wh.totalTables) === null || _d === void 0 ? void 0 : _d.toLocaleString()) !== null && _e !== void 0 ? _e : "—", color: "purple" },
            { title: "Storage Used", value: (_f = wh.storageUsed) !== null && _f !== void 0 ? _f : "—", color: "orange" },
        ].map(function (stat, idx) { return (React.createElement("div", { key: idx, className: "bg-white p-4 rounded-lg shadow border-l-4 border-" + stat.color + "-500" },
            React.createElement("p", { className: "text-sm text-slate-600" }, stat.title),
            React.createElement("p", { className: "text-2xl font-bold text-slate-900" }, stat.value))); })),
        React.createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            React.createElement("h2", { className: "text-lg font-semibold text-slate-900 mb-4" },
                "ETL Jobs (",
                jobs.total,
                ")"),
            jobs.jobs.length === 0 ? (React.createElement("p", { className: "text-slate-500 text-center py-8" }, "No ETL jobs found.")) : (React.createElement("div", { className: "space-y-3" }, jobs.jobs.map(function (job, idx) {
                var _a, _b, _c, _d, _e, _f;
                return (React.createElement("div", { key: (_a = job.id) !== null && _a !== void 0 ? _a : idx, className: "p-3 bg-slate-50 rounded-lg hover:bg-slate-100 flex justify-between items-center" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "font-medium text-slate-900" }, (_c = (_b = job.name) !== null && _b !== void 0 ? _b : job.jobName) !== null && _c !== void 0 ? _c : "Job"),
                        React.createElement("p", { className: "text-xs text-slate-500" }, (_e = (_d = job.schedule) !== null && _d !== void 0 ? _d : job.type) !== null && _e !== void 0 ? _e : "")),
                    React.createElement("span", { className: "px-2 py-1 text-xs font-bold rounded " + (job.status === "running" ? "bg-blue-100 text-blue-700" :
                            job.status === "completed" ? "bg-green-100 text-green-700" :
                                job.status === "failed" ? "bg-red-100 text-red-700" :
                                    "bg-gray-100 text-gray-700") }, (_f = job.status) !== null && _f !== void 0 ? _f : "—")));
            }))))));
}
exports["default"] = BiTools;
