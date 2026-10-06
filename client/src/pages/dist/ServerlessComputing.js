"use strict";
exports.__esModule = true;
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var table_1 = require("@/components/ui/table");
function ServerlessComputing() {
    var _a;
    var _b = trpc_1.trpc.cloudInfrastructure.listDeployments.useQuery({ limit: 50 }), data = _b.data, isLoading = _b.isLoading;
    var deployments = JSON.parse(JSON.stringify((_a = data === null || data === void 0 ? void 0 : data.deployments) !== null && _a !== void 0 ? _a : []));
    var serverless = deployments.filter(function (d) {
        var cfg = d.config;
        return (cfg === null || cfg === void 0 ? void 0 : cfg.type) === 'serverless' || (cfg === null || cfg === void 0 ? void 0 : cfg.runtime);
    });
    return (React.createElement("div", { className: "space-y-6 p-6 bg-gradient-to-br from-amber-50 to-orange-50 min-h-screen" },
        React.createElement("div", { className: "flex items-center justify-between" },
            React.createElement("div", null,
                React.createElement("h1", { className: "text-4xl font-bold text-gray-900" }, "Serverless Computing"),
                React.createElement("p", { className: "text-gray-600 mt-2" }, "Function-as-a-Service (FaaS) deployment and monitoring")),
            React.createElement(lucide_react_1.Zap, { className: "w-12 h-12 text-amber-600" })),
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" }, [
            { label: "Total Functions", value: String(serverless.length) },
            { label: "All Deployments", value: String(deployments.length) },
            { label: "Active", value: String(deployments.filter(function (d) { return d.status === 'ACTIVE'; }).length) },
            { label: "Running", value: String(deployments.filter(function (d) { return d.status === 'RUNNING'; }).length) },
        ].map(function (card, idx) { return (React.createElement("div", { key: idx, className: "bg-white p-6 rounded-lg border-2 border-amber-200 shadow-md" },
            React.createElement("p", { className: "text-gray-600 text-sm font-semibold" }, card.label),
            React.createElement("p", { className: "text-3xl font-bold text-gray-900 mt-2" }, card.value))); })),
        React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-amber-200 shadow-md" },
            React.createElement("h2", { className: "text-xl font-bold text-gray-900 mb-4" }, "Serverless Deployments"),
            isLoading ? React.createElement("p", { className: "text-muted-foreground" }, "Loading...") : serverless.length === 0 ? (React.createElement("p", { className: "text-center text-muted-foreground py-8" }, "No serverless configurations found. Use the API to configure serverless computing.")) : (React.createElement("div", { className: "overflow-x-auto" },
                React.createElement(table_1.Table, null,
                    React.createElement(table_1.TableHeader, null,
                        React.createElement(table_1.TableRow, null,
                            React.createElement(table_1.TableHead, null, "Name"),
                            React.createElement(table_1.TableHead, null, "Runtime"),
                            React.createElement(table_1.TableHead, null, "Status"),
                            React.createElement(table_1.TableHead, null, "Created"))),
                    React.createElement(table_1.TableBody, null, serverless.map(function (fn) {
                        var _a, _b;
                        return (React.createElement(table_1.TableRow, { key: fn.id },
                            React.createElement(table_1.TableCell, { className: "font-semibold" }, fn.name),
                            React.createElement(table_1.TableCell, null, (_b = (_a = fn.config) === null || _a === void 0 ? void 0 : _a.runtime) !== null && _b !== void 0 ? _b : '-'),
                            React.createElement(table_1.TableCell, null,
                                React.createElement("span", { className: "px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700" }, fn.status)),
                            React.createElement(table_1.TableCell, null, fn.createdAt ? new Date(fn.createdAt).toLocaleDateString() : '-')));
                    })))))),
        React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-amber-200 shadow-md" },
            React.createElement("h2", { className: "text-xl font-bold text-gray-900 mb-4" }, "All Container Deployments"),
            deployments.length === 0 ? (React.createElement("p", { className: "text-center text-muted-foreground py-8" }, "No deployments found.")) : (React.createElement("div", { className: "space-y-3" }, deployments.map(function (d) {
                var _a;
                return (React.createElement("div", { key: d.id, className: "p-3 bg-gray-50 rounded" },
                    React.createElement("div", { className: "flex justify-between mb-1" },
                        React.createElement("span", { className: "font-semibold text-gray-900 text-sm" }, d.name),
                        React.createElement("span", { className: "text-xs px-2 py-1 rounded " + (d.status === 'ACTIVE' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700") }, d.status)),
                    React.createElement("p", { className: "text-xs text-gray-600" },
                        "Replicas: ", (_a = d.replicas) !== null && _a !== void 0 ? _a : '-')));
            }))))));
}
exports["default"] = ServerlessComputing;
