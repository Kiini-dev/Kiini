"use strict";
exports.__esModule = true;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
function MaintenancePage() {
    var data = trpc_1.trpc.settings.getMaintenanceStatus.useQuery(undefined, { retry: false, refetchInterval: 30000 }).data;
    var title = (data === null || data === void 0 ? void 0 : data.title) || "Under Maintenance";
    var message = (data === null || data === void 0 ? void 0 : data.message) || "The system is currently undergoing scheduled maintenance. Please check back shortly.";
    var estimatedReturn = (data === null || data === void 0 ? void 0 : data.estimatedReturn) || "";
    var contactEmail = (data === null || data === void 0 ? void 0 : data.contactEmail) || "";
    // Live progress animation
    var _a = react_1.useState(""), dots = _a[0], setDots = _a[1];
    react_1.useEffect(function () {
        var iv = setInterval(function () { return setDots(function (d) { return d.length >= 3 ? "" : d + "."; }); }, 600);
        return function () { return clearInterval(iv); };
    }, []);
    // ETA countdown
    var _b = react_1.useState(""), eta = _b[0], setEta = _b[1];
    react_1.useEffect(function () {
        if (!estimatedReturn)
            return;
        var tick = function () {
            var diff = new Date(estimatedReturn).getTime() - Date.now();
            if (diff <= 0) {
                setEta("Returning soon…");
                return;
            }
            var h = Math.floor(diff / 3600000);
            var m = Math.floor((diff % 3600000) / 60000);
            var s = Math.floor((diff % 60000) / 1000);
            setEta(h > 0 ? h + "h " + m + "m " + s + "s" : m > 0 ? m + "m " + s + "s" : s + "s");
        };
        tick();
        var iv = setInterval(tick, 1000);
        return function () { return clearInterval(iv); };
    }, [estimatedReturn]);
    return (React.createElement("div", { className: "flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/40 to-orange-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 relative overflow-hidden" },
        React.createElement("div", { className: "absolute inset-0 pointer-events-none" },
            React.createElement("div", { className: "absolute top-20 left-10 w-72 h-72 bg-amber-200/20 dark:bg-amber-500/5 rounded-full blur-3xl" }),
            React.createElement("div", { className: "absolute bottom-20 right-10 w-96 h-96 bg-orange-200/20 dark:bg-orange-500/5 rounded-full blur-3xl" }),
            React.createElement("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-100/10 dark:bg-yellow-500/3 rounded-full blur-3xl" })),
        React.createElement("div", { className: "relative z-10 w-full max-w-lg mx-4" },
            React.createElement("div", { className: "bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-amber-500/10 dark:shadow-amber-500/5 border border-amber-200/50 dark:border-amber-700/30 p-8 md:p-10 text-center space-y-6" },
                React.createElement("div", { className: "relative inline-flex items-center justify-center" },
                    React.createElement("div", { className: "absolute inset-0 w-20 h-20 bg-amber-400/20 dark:bg-amber-500/15 rounded-full animate-ping", style: { animationDuration: "3s" } }),
                    React.createElement("div", { className: "relative w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30" },
                        React.createElement(lucide_react_1.Wrench, { className: "h-10 w-10 text-white animate-pulse", style: { animationDuration: "2s" } }))),
                React.createElement("div", { className: "space-y-2" },
                    React.createElement("h1", { className: "text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight" }, title),
                    React.createElement("div", { className: "flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400" },
                        React.createElement(lucide_react_1.RefreshCw, { className: "h-4 w-4 animate-spin", style: { animationDuration: "3s" } }),
                        React.createElement("span", { className: "text-sm font-medium" },
                            "Work in progress",
                            dots))),
                React.createElement("p", { className: "text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base" }, message),
                estimatedReturn && (React.createElement("div", { className: "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 space-y-1" },
                    React.createElement("div", { className: "flex items-center justify-center gap-2 text-amber-700 dark:text-amber-300" },
                        React.createElement(lucide_react_1.Clock, { className: "h-4 w-4" }),
                        React.createElement("span", { className: "text-xs font-semibold uppercase tracking-wider" }, "Estimated Return")),
                    React.createElement("p", { className: "text-2xl font-mono font-bold text-amber-600 dark:text-amber-400" }, eta || new Date(estimatedReturn).toLocaleString()),
                    React.createElement("p", { className: "text-xs text-amber-600/70 dark:text-amber-400/60" }, new Date(estimatedReturn).toLocaleString()))),
                contactEmail && (React.createElement("div", { className: "flex items-center justify-center gap-2 pt-2" },
                    React.createElement(lucide_react_1.Mail, { className: "h-4 w-4 text-gray-400 dark:text-gray-500" }),
                    React.createElement("p", { className: "text-sm text-gray-500 dark:text-gray-400" },
                        "Need help?",
                        " ",
                        React.createElement("a", { href: "mailto:" + contactEmail, className: "text-primary font-medium underline hover:text-primary/80 transition-colors" }, contactEmail))))),
            React.createElement("div", { className: "flex items-center justify-center gap-2 mt-6 text-xs text-gray-400 dark:text-gray-600" },
                React.createElement(lucide_react_1.Shield, { className: "h-3.5 w-3.5" }),
                React.createElement("span", null, "Your data is safe. We'll be back shortly.")))));
}
exports["default"] = MaintenancePage;
