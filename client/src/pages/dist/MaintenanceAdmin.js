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
var wouter_1 = require("wouter");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var switch_1 = require("@/components/ui/switch");
var separator_1 = require("@/components/ui/separator");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
function MaintenanceAdmin() {
    var _this = this;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    // Fetch current maintenance settings
    var _b = trpc_1.trpc.settings.getByCategory.useQuery({ category: "maintenance" }, { retry: false }), maintenanceData = _b.data, refetch = _b.refetch;
    var updateByCategory = trpc_1.trpc.settings.updateByCategory.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Maintenance settings saved");
            refetch();
        },
        onError: function (err) { return sonner_1.toast.error(err.message || "Failed to save"); }
    });
    // Local form state
    var _c = react_1.useState(false), enabled = _c[0], setEnabled = _c[1];
    var _d = react_1.useState("Under Maintenance"), title = _d[0], setTitle = _d[1];
    var _e = react_1.useState("The system is currently undergoing scheduled maintenance. Please check back shortly."), message = _e[0], setMessage = _e[1];
    var _f = react_1.useState(""), estimatedReturn = _f[0], setEstimatedReturn = _f[1];
    var _g = react_1.useState(""), contactEmail = _g[0], setContactEmail = _g[1];
    // Scheduling state
    var _h = react_1.useState(""), scheduledAt = _h[0], setScheduledAt = _h[1];
    var _j = react_1.useState("60"), scheduledDuration = _j[0], setScheduledDuration = _j[1]; // minutes
    var _k = react_1.useState(""), countdown = _k[0], setCountdown = _k[1];
    var _l = react_1.useState(false), isScheduled = _l[0], setIsScheduled = _l[1];
    var countdownRef = react_1.useRef(null);
    // Hydrate form from DB
    react_1.useEffect(function () {
        if (maintenanceData) {
            setEnabled(maintenanceData.maintenance_mode === "true" || maintenanceData.maintenance_mode === "1");
            if (maintenanceData.maintenance_title)
                setTitle(maintenanceData.maintenance_title);
            if (maintenanceData.maintenance_message)
                setMessage(maintenanceData.maintenance_message);
            if (maintenanceData.maintenance_estimated_return)
                setEstimatedReturn(maintenanceData.maintenance_estimated_return);
            if (maintenanceData.maintenance_contact_email)
                setContactEmail(maintenanceData.maintenance_contact_email);
            if (maintenanceData.maintenance_scheduled_at) {
                setScheduledAt(maintenanceData.maintenance_scheduled_at);
                setIsScheduled(true);
            }
            if (maintenanceData.maintenance_scheduled_duration) {
                setScheduledDuration(maintenanceData.maintenance_scheduled_duration);
            }
        }
    }, [maintenanceData]);
    // Countdown timer logic
    react_1.useEffect(function () {
        if (countdownRef.current)
            clearInterval(countdownRef.current);
        if (!isScheduled || !scheduledAt) {
            setCountdown("");
            return;
        }
        var tick = function () {
            var target = new Date(scheduledAt).getTime();
            var now = Date.now();
            var diff = target - now;
            if (diff <= 0) {
                setCountdown("Starting now...");
                // Auto-enable maintenance
                if (!enabled) {
                    handleToggle(true);
                    setIsScheduled(false);
                    sonner_1.toast.info("Scheduled maintenance has started automatically.");
                }
                if (countdownRef.current)
                    clearInterval(countdownRef.current);
                return;
            }
            var h = Math.floor(diff / 3600000);
            var m = Math.floor((diff % 3600000) / 60000);
            var s = Math.floor((diff % 60000) / 1000);
            setCountdown(h + "h " + m + "m " + s + "s");
        };
        tick();
        countdownRef.current = setInterval(tick, 1000);
        return function () { if (countdownRef.current)
            clearInterval(countdownRef.current); };
    }, [isScheduled, scheduledAt, enabled]);
    var handleSave = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, updateByCategory.mutateAsync({
                        category: "maintenance",
                        values: {
                            maintenance_mode: String(enabled),
                            maintenance_title: title,
                            maintenance_message: message,
                            maintenance_estimated_return: estimatedReturn,
                            maintenance_contact_email: contactEmail,
                            maintenance_scheduled_at: isScheduled ? scheduledAt : "",
                            maintenance_scheduled_duration: scheduledDuration
                        }
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var handleSchedule = function () { return __awaiter(_this, void 0, void 0, function () {
        var target, durationMs, returnTime;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!scheduledAt) {
                        sonner_1.toast.error("Please select a date and time for scheduled maintenance.");
                        return [2 /*return*/];
                    }
                    target = new Date(scheduledAt);
                    if (target.getTime() <= Date.now()) {
                        sonner_1.toast.error("Scheduled time must be in the future.");
                        return [2 /*return*/];
                    }
                    durationMs = (parseInt(scheduledDuration) || 60) * 60000;
                    returnTime = new Date(target.getTime() + durationMs).toISOString().slice(0, 16);
                    setEstimatedReturn(returnTime);
                    setIsScheduled(true);
                    return [4 /*yield*/, updateByCategory.mutateAsync({
                            category: "maintenance",
                            values: {
                                maintenance_mode: String(enabled),
                                maintenance_title: title,
                                maintenance_message: message,
                                maintenance_estimated_return: returnTime,
                                maintenance_contact_email: contactEmail,
                                maintenance_scheduled_at: scheduledAt,
                                maintenance_scheduled_duration: scheduledDuration
                            }
                        })];
                case 1:
                    _a.sent();
                    sonner_1.toast.success("Maintenance scheduled for " + target.toLocaleString());
                    return [2 /*return*/];
            }
        });
    }); };
    var handleCancelSchedule = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsScheduled(false);
                    setScheduledAt("");
                    return [4 /*yield*/, updateByCategory.mutateAsync({
                            category: "maintenance",
                            values: {
                                maintenance_mode: String(enabled),
                                maintenance_title: title,
                                maintenance_message: message,
                                maintenance_estimated_return: estimatedReturn,
                                maintenance_contact_email: contactEmail,
                                maintenance_scheduled_at: "",
                                maintenance_scheduled_duration: scheduledDuration
                            }
                        })];
                case 1:
                    _a.sent();
                    sonner_1.toast.success("Scheduled maintenance cancelled.");
                    return [2 /*return*/];
            }
        });
    }); };
    var handleToggle = function (newVal) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setEnabled(newVal);
                    // Immediately persist the toggle
                    return [4 /*yield*/, updateByCategory.mutateAsync({
                            category: "maintenance",
                            values: {
                                maintenance_mode: String(newVal),
                                maintenance_title: title,
                                maintenance_message: message,
                                maintenance_estimated_return: estimatedReturn,
                                maintenance_contact_email: contactEmail
                            }
                        })];
                case 1:
                    // Immediately persist the toggle
                    _a.sent();
                    sonner_1.toast.success(newVal ? "Maintenance mode enabled" : "Maintenance mode disabled");
                    return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Maintenance Mode", description: "Enable maintenance mode to show a custom overlay to all users except Global Super Admin and Global ICT Manager.", icon: React.createElement(lucide_react_1.Wrench, { className: "h-6 w-6 text-amber-500" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm/super-admin" },
            { label: "Admin", href: "/admin/management" },
            { label: "Maintenance Mode" },
        ] },
        React.createElement("div", { className: "max-w-4xl mx-auto space-y-6" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("div", { className: "space-y-1" },
                            React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                React.createElement(lucide_react_1.Shield, { className: "h-5 w-5" }),
                                "Maintenance Status"),
                            React.createElement(card_1.CardDescription, null, "Toggle maintenance mode on or off. Only Global Super Admin and Global ICT Manager can access the system during maintenance.")),
                        React.createElement("div", { className: "flex items-center gap-3" },
                            React.createElement(badge_1.Badge, { variant: enabled ? "destructive" : "secondary", className: "text-sm px-3 py-1" }, enabled ? "ACTIVE" : "INACTIVE"),
                            React.createElement(switch_1.Switch, { checked: enabled, onCheckedChange: handleToggle, className: "data-[state=checked]:bg-amber-500" }))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.FileText, { className: "h-5 w-5" }),
                        "Overlay Content"),
                    React.createElement(card_1.CardDescription, null, "Customize the message displayed to users during maintenance.")),
                React.createElement(card_1.CardContent, { className: "space-y-4" },
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, { htmlFor: "maint-title" }, "Page Title"),
                        React.createElement(input_1.Input, { id: "maint-title", value: title, onChange: function (e) { return setTitle(e.target.value); }, placeholder: "Under Maintenance" })),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, { htmlFor: "maint-message" }, "Message"),
                        React.createElement("textarea", { id: "maint-message", className: "w-full min-h-[120px] p-3 text-sm border rounded-md bg-background resize-y", value: message, onChange: function (e) { return setMessage(e.target.value); }, placeholder: "Explain what is happening and when service will resume..." })),
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "maint-eta", className: "flex items-center gap-2" },
                                React.createElement(lucide_react_1.Clock, { className: "h-4 w-4" }),
                                "Estimated Return Time"),
                            React.createElement(input_1.Input, { id: "maint-eta", type: "datetime-local", value: estimatedReturn, onChange: function (e) { return setEstimatedReturn(e.target.value); } })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "maint-email" }, "Contact Email (optional)"),
                            React.createElement(input_1.Input, { id: "maint-email", type: "email", value: contactEmail, onChange: function (e) { return setContactEmail(e.target.value); }, placeholder: "support@example.com" }))),
                    React.createElement("div", { className: "flex justify-end pt-2" },
                        React.createElement(button_1.Button, { onClick: handleSave, disabled: updateByCategory.isPending },
                            React.createElement(lucide_react_1.Save, { className: "h-4 w-4 mr-2" }),
                            updateByCategory.isPending ? "Saving..." : "Save Overlay Settings")))),
            React.createElement(card_1.Card, { className: isScheduled ? "border-amber-300 dark:border-amber-700" : "" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.CalendarClock, { className: "h-5 w-5" }),
                        "Schedule Maintenance"),
                    React.createElement(card_1.CardDescription, null, "Set a date and time to automatically enable maintenance mode. A countdown will display until the scheduled time.")),
                React.createElement(card_1.CardContent, { className: "space-y-4" },
                    isScheduled && countdown && (React.createElement("div", { className: "flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg" },
                        React.createElement(lucide_react_1.Timer, { className: "h-6 w-6 text-amber-600 animate-pulse" }),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm font-medium text-amber-800 dark:text-amber-200" }, "Maintenance Scheduled"),
                            React.createElement("p", { className: "text-2xl font-mono font-bold text-amber-600 dark:text-amber-400" }, countdown),
                            React.createElement("p", { className: "text-xs text-amber-600 dark:text-amber-500" },
                                "Starts at ",
                                new Date(scheduledAt).toLocaleString())),
                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "ml-auto text-amber-600 hover:text-red-600", onClick: handleCancelSchedule },
                            React.createElement(lucide_react_1.X, { className: "h-4 w-4 mr-1" }),
                            " Cancel"))),
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "sched-time", className: "flex items-center gap-2" },
                                React.createElement(lucide_react_1.CalendarClock, { className: "h-4 w-4" }),
                                "Start Date & Time"),
                            React.createElement(input_1.Input, { id: "sched-time", type: "datetime-local", value: scheduledAt, onChange: function (e) { return setScheduledAt(e.target.value); }, disabled: isScheduled })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "sched-duration", className: "flex items-center gap-2" },
                                React.createElement(lucide_react_1.Clock, { className: "h-4 w-4" }),
                                "Expected Duration (minutes)"),
                            React.createElement(input_1.Input, { id: "sched-duration", type: "number", min: "5", max: "1440", value: scheduledDuration, onChange: function (e) { return setScheduledDuration(e.target.value); }, disabled: isScheduled, placeholder: "60" }))),
                    React.createElement("div", { className: "flex justify-end gap-2 pt-2" }, isScheduled ? (React.createElement(button_1.Button, { variant: "outline", onClick: handleCancelSchedule, className: "text-red-600 border-red-200" },
                        React.createElement(lucide_react_1.X, { className: "h-4 w-4 mr-2" }),
                        " Cancel Schedule")) : (React.createElement(button_1.Button, { onClick: handleSchedule, disabled: !scheduledAt || updateByCategory.isPending, className: "bg-amber-500 hover:bg-amber-600" },
                        React.createElement(lucide_react_1.CalendarClock, { className: "h-4 w-4 mr-2" }),
                        "Schedule Maintenance"))))),
            React.createElement(separator_1.Separator, null),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Eye, { className: "h-5 w-5" }),
                        "Preview"),
                    React.createElement(card_1.CardDescription, null, "This is how the maintenance page will appear to users.")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "border rounded-lg overflow-hidden" },
                        React.createElement("div", { className: "flex items-center justify-center min-h-[320px] bg-gradient-to-br from-slate-50 via-amber-50/40 to-orange-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900" },
                            React.createElement("div", { className: "text-center space-y-4 p-8 max-w-md" },
                                React.createElement("div", { className: "inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-lg shadow-amber-500/30 mx-auto" },
                                    React.createElement(lucide_react_1.Wrench, { className: "h-8 w-8 text-white" })),
                                React.createElement("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white" }, title || "Under Maintenance"),
                                React.createElement("p", { className: "text-gray-600 dark:text-gray-300 text-sm" }, message || "The system is currently undergoing scheduled maintenance."),
                                estimatedReturn && (React.createElement("div", { className: "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3" },
                                    React.createElement("div", { className: "flex items-center justify-center gap-2 text-amber-700 dark:text-amber-300 text-xs font-semibold uppercase" },
                                        React.createElement(lucide_react_1.Clock, { className: "h-3.5 w-3.5" }),
                                        "Estimated Return"),
                                    React.createElement("p", { className: "text-lg font-mono font-bold text-amber-600 dark:text-amber-400 mt-1" }, new Date(estimatedReturn).toLocaleString()))),
                                contactEmail && (React.createElement("p", { className: "text-sm text-gray-500 dark:text-gray-400" },
                                    "Need help? Contact",
                                    " ",
                                    React.createElement("span", { className: "text-primary font-medium" }, contactEmail)))))))),
            React.createElement(card_1.Card, { className: "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20" },
                React.createElement(card_1.CardContent, { className: "pt-6" },
                    React.createElement("div", { className: "flex gap-3" },
                        React.createElement(lucide_react_1.Shield, { className: "h-5 w-5 text-blue-500 mt-0.5 shrink-0" }),
                        React.createElement("div", { className: "space-y-1" },
                            React.createElement("p", { className: "text-sm font-medium text-blue-900 dark:text-blue-100" }, "Access Rules During Maintenance"),
                            React.createElement("ul", { className: "text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside" },
                                React.createElement("li", null,
                                    React.createElement("strong", null, "Global Super Admin"),
                                    " \u2014 Full access to all dashboards and API"),
                                React.createElement("li", null,
                                    React.createElement("strong", null, "Global ICT Manager"),
                                    " \u2014 Full access to all dashboards and API"),
                                React.createElement("li", null,
                                    React.createElement("strong", null, "All other users"),
                                    " \u2014 Redirected to maintenance page (both UI and API)"),
                                React.createElement("li", null, "When maintenance is disabled, all logged-in users are redirected to their respective dashboards")))))))));
}
exports["default"] = MaintenanceAdmin;
