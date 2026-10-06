"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var skeleton_1 = require("@/components/ui/skeleton");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var lucide_react_1 = require("lucide-react");
var WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];
function EventTypeIcon(_a) {
    var type = _a.type;
    if (type === "invoice")
        return react_1["default"].createElement(lucide_react_1.FileText, { className: "h-3 w-3 shrink-0" });
    if (type === "project")
        return react_1["default"].createElement(lucide_react_1.Briefcase, { className: "h-3 w-3 shrink-0" });
    return react_1["default"].createElement(lucide_react_1.CheckSquare, { className: "h-3 w-3 shrink-0" });
}
function CalendarPage() {
    var _a, _b;
    var _c = wouter_1.useLocation(), setLocation = _c[1];
    var today = new Date();
    var _d = react_1.useState(today.getFullYear()), year = _d[0], setYear = _d[1];
    var _e = react_1.useState(today.getMonth() + 1), month = _e[0], setMonth = _e[1];
    var _f = react_1.useState(today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0")), selectedDay = _f[0], setSelectedDay = _f[1];
    var _g = trpc_1.trpc.dashboard.getCalendarEvents.useQuery({ year: year, month: month }, { staleTime: 60000 }), data = _g.data, isLoading = _g.isLoading;
    var events = ((_a = data === null || data === void 0 ? void 0 : data.events) !== null && _a !== void 0 ? _a : []);
    var eventsByDate = {};
    events.forEach(function (ev) {
        if (!eventsByDate[ev.date])
            eventsByDate[ev.date] = [];
        eventsByDate[ev.date].push(ev);
    });
    var firstDayOfMonth = new Date(year, month - 1, 1).getDay();
    var daysInMonth = new Date(year, month, 0).getDate();
    function prevMonth() {
        if (month === 1) {
            setYear(function (y) { return y - 1; });
            setMonth(12);
        }
        else
            setMonth(function (m) { return m - 1; });
        setSelectedDay(null);
    }
    function nextMonth() {
        if (month === 12) {
            setYear(function (y) { return y + 1; });
            setMonth(1);
        }
        else
            setMonth(function (m) { return m + 1; });
        setSelectedDay(null);
    }
    var todayStr = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
    var selectedEvents = selectedDay ? ((_b = eventsByDate[selectedDay]) !== null && _b !== void 0 ? _b : []) : [];
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Calendar", description: "Invoice deadlines, project milestones, and task due dates", icon: react_1["default"].createElement(lucide_react_1.Calendar, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Calendar" },
        ] },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement("div", { className: "flex flex-wrap gap-4 text-xs text-muted-foreground" }, [
                    { color: "#3b82f6", label: "Invoice due" },
                    { color: "#a855f7", label: "Project deadline" },
                    { color: "#f97316", label: "Task due" },
                    { color: "#22c55e", label: "Completed / Paid" },
                    { color: "#ef4444", label: "Overdue / Urgent" },
                ].map(function (_a) {
                    var color = _a.color, label = _a.label;
                    return (react_1["default"].createElement("span", { key: label, className: "flex items-center gap-1.5" },
                        react_1["default"].createElement("span", { className: "h-2 w-2 rounded-full inline-block", style: { background: color } }),
                        label));
                })),
                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () {
                        setYear(today.getFullYear());
                        setMonth(today.getMonth() + 1);
                        setSelectedDay(todayStr);
                    } }, "Today")),
            react_1["default"].createElement("div", { className: "grid grid-cols-1 xl:grid-cols-3 gap-6" },
                react_1["default"].createElement(card_1.Card, { className: "xl:col-span-2" },
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                        react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-lg font-semibold" },
                                MONTH_NAMES[month - 1],
                                " ",
                                year),
                            react_1["default"].createElement("div", { className: "flex gap-1" },
                                react_1["default"].createElement(button_1.Button, { size: "icon", variant: "ghost", className: "h-8 w-8", onClick: prevMonth },
                                    react_1["default"].createElement(lucide_react_1.ChevronLeft, { className: "h-4 w-4" })),
                                react_1["default"].createElement(button_1.Button, { size: "icon", variant: "ghost", className: "h-8 w-8", onClick: nextMonth },
                                    react_1["default"].createElement(lucide_react_1.ChevronRight, { className: "h-4 w-4" }))))),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "grid grid-cols-7 mb-1" }, WEEKDAYS.map(function (d) { return (react_1["default"].createElement("div", { key: d, className: "text-center text-xs font-medium text-muted-foreground py-1" }, d)); })),
                        isLoading ? (react_1["default"].createElement("div", { className: "grid grid-cols-7 gap-1" }, Array.from({ length: 35 }).map(function (_, i) { return (react_1["default"].createElement(skeleton_1.Skeleton, { key: i, className: "h-16 rounded" })); }))) : (react_1["default"].createElement("div", { className: "grid grid-cols-7 gap-px" },
                            Array.from({ length: firstDayOfMonth }).map(function (_, i) { return (react_1["default"].createElement("div", { key: "empty-" + i })); }),
                            Array.from({ length: daysInMonth }).map(function (_, i) {
                                var _a;
                                var day = i + 1;
                                var dateStr = year + "-" + String(month).padStart(2, "0") + "-" + String(day).padStart(2, "0");
                                var dayEvents = (_a = eventsByDate[dateStr]) !== null && _a !== void 0 ? _a : [];
                                var isToday = dateStr === todayStr;
                                var isSelected = dateStr === selectedDay;
                                return (react_1["default"].createElement("button", { key: dateStr, onClick: function () { return setSelectedDay(dateStr === selectedDay ? null : dateStr); }, className: "relative min-h-[72px] p-1.5 rounded text-left transition-colors border " + (isSelected
                                        ? "bg-primary/10 border-primary/30 ring-1 ring-primary/30"
                                        : isToday
                                            ? "bg-muted border-border ring-1 ring-border"
                                            : "border-transparent hover:bg-muted/50 hover:border-border") },
                                    react_1["default"].createElement("span", { className: "text-xs font-medium " + (isToday
                                            ? "text-primary font-bold"
                                            : isSelected
                                                ? "text-foreground"
                                                : "text-muted-foreground") }, day),
                                    react_1["default"].createElement("div", { className: "mt-0.5 space-y-0.5" },
                                        dayEvents.slice(0, 3).map(function (ev) { return (react_1["default"].createElement("div", { key: ev.id, className: "flex items-center gap-0.5 px-0.5 py-px rounded text-[10px] leading-tight truncate", style: { background: ev.color + "22", color: ev.color } },
                                            react_1["default"].createElement(EventTypeIcon, { type: ev.type }),
                                            react_1["default"].createElement("span", { className: "truncate" }, ev.title))); }),
                                        dayEvents.length > 3 && (react_1["default"].createElement("div", { className: "text-[10px] text-muted-foreground px-0.5" },
                                            "+",
                                            dayEvents.length - 3,
                                            " more")))));
                            }))))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-base font-semibold flex items-center gap-2" },
                            react_1["default"].createElement(lucide_react_1.Calendar, { className: "h-4 w-4 text-primary" }),
                            selectedDay
                                ? new Date(selectedDay + "T00:00:00").toLocaleDateString("en", {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long"
                                })
                                : "Select a day")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        !selectedDay ? (react_1["default"].createElement("p", { className: "text-muted-foreground text-sm text-center py-8" }, "Click a day to see events")) : selectedEvents.length === 0 ? (react_1["default"].createElement("p", { className: "text-muted-foreground text-sm text-center py-8" }, "No events on this day")) : (react_1["default"].createElement("div", { className: "space-y-3" }, selectedEvents.map(function (ev) { return (react_1["default"].createElement("button", { key: ev.id, onClick: function () { return setLocation(ev.href); }, className: "w-full text-left rounded-lg p-3 hover:bg-muted transition-colors border border-border group" },
                            react_1["default"].createElement("div", { className: "flex items-start gap-2" },
                                react_1["default"].createElement("span", { className: "mt-0.5 h-2 w-2 rounded-full shrink-0", style: { background: ev.color } }),
                                react_1["default"].createElement("div", { className: "min-w-0 flex-1" },
                                    react_1["default"].createElement("p", { className: "text-sm font-medium truncate group-hover:text-primary transition-colors" }, ev.title),
                                    react_1["default"].createElement("div", { className: "flex items-center gap-2 mt-1" },
                                        react_1["default"].createElement(badge_1.Badge, { className: "text-[10px] capitalize px-1.5 py-0", style: { background: ev.color + "22", color: ev.color, border: "none" } }, ev.type),
                                        react_1["default"].createElement("span", { className: "text-[10px] capitalize text-muted-foreground" }, ev.status.replace(/_/g, " "))))))); }))),
                        react_1["default"].createElement("div", { className: "mt-6 pt-4 border-t border-border" },
                            react_1["default"].createElement("p", { className: "text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3" }, "Month Summary"),
                            isLoading ? (react_1["default"].createElement("div", { className: "space-y-2" }, Array.from({ length: 3 }).map(function (_, i) { return (react_1["default"].createElement(skeleton_1.Skeleton, { key: i, className: "h-5 rounded" })); }))) : (react_1["default"].createElement("div", { className: "space-y-2" }, [
                                { type: "invoice", label: "Invoice deadlines", color: "#3b82f6" },
                                { type: "project", label: "Project milestones", color: "#a855f7" },
                                { type: "task", label: "Tasks due", color: "#f97316" },
                            ].map(function (_a) {
                                var type = _a.type, label = _a.label, color = _a.color;
                                var count = events.filter(function (e) { return e.type === type; }).length;
                                return (react_1["default"].createElement("div", { key: type, className: "flex items-center justify-between text-sm" },
                                    react_1["default"].createElement("span", { className: "text-muted-foreground flex items-center gap-2" },
                                        react_1["default"].createElement("span", { className: "h-1.5 w-1.5 rounded-full", style: { background: color } }),
                                        label),
                                    react_1["default"].createElement("span", { className: "font-medium" }, count)));
                            }))))))))));
}
exports["default"] = CalendarPage;
