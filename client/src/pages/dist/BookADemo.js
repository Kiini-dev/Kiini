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
var WebsiteNav_1 = require("./website/WebsiteNav");
var WebsiteFooter_1 = require("./website/WebsiteFooter");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var badge_1 = require("@/components/ui/badge");
var PhoneInput_1 = require("@/components/PhoneInput");
var sonner_1 = require("sonner");
var utils_1 = require("@/lib/utils");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
// ─── Constants ────────────────────────────────────────────────
var TIMEZONES = [
    { label: "Nairobi (EAT)     UTC+3", value: "Africa/Nairobi", offset: "+03:00" },
    { label: "Lagos (WAT)       UTC+1", value: "Africa/Lagos", offset: "+01:00" },
    { label: "Johannesburg      UTC+2", value: "Africa/Johannesburg", offset: "+02:00" },
    { label: "Cairo             UTC+2", value: "Africa/Cairo", offset: "+02:00" },
    { label: "Accra (GMT)       UTC+0", value: "Africa/Accra", offset: "+00:00" },
    { label: "Casablanca        UTC+1", value: "Africa/Casablanca", offset: "+01:00" },
    { label: "London (GMT)      UTC+0", value: "Europe/London", offset: "+00:00" },
    { label: "Dubai             UTC+4", value: "Asia/Dubai", offset: "+04:00" },
    { label: "New York (EST)    UTC-5", value: "America/New_York", offset: "-05:00" },
    { label: "Los Angeles (PST) UTC-8", value: "America/Los_Angeles", offset: "-08:00" },
];
var DEMO_DURATIONS = [
    { label: "30 min", value: 30, desc: "Quick overview" },
    { label: "60 min", value: 60, desc: "Full walkthrough", popular: true },
    { label: "90 min", value: 90, desc: "In-depth + Q&A" },
];
var TIME_SLOTS = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30",
];
// Days blocked from booking (0=Sun, 6=Sat)
var BLOCKED_DAYS = [0, 6];
var DEMO_FEATURES = [
    { icon: lucide_react_1.Building2, text: "Multi-tenant setup & org management" },
    { icon: lucide_react_1.BarChart3, text: "Live dashboards & financial reporting" },
    { icon: lucide_react_1.Users, text: "HR, payroll & employee management" },
    { icon: lucide_react_1.Zap, text: "Workflow automation & integrations" },
    { icon: lucide_react_1.Star, text: "White-label & custom branding" },
    { icon: lucide_react_1.Globe, text: "Multi-currency, KES / USD support" },
];
var DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];
// ─── Helpers ─────────────────────────────────────────────────
function buildCalendarDays(year, month) {
    var firstDay = new Date(year, month, 1).getDay();
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var days = [];
    // Padding before first day
    for (var i = 0; i < firstDay; i++)
        days.push({ date: null, disabled: true });
    // Days of month
    for (var d = 1; d <= daysInMonth; d++) {
        var date = new Date(year, month, d);
        var isPast = date < today;
        var isWeekend = BLOCKED_DAYS.includes(date.getDay());
        days.push({ date: date, disabled: isPast || isWeekend });
    }
    return days;
}
function formatDateLong(d) {
    return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function formatDateShort(d) {
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
var INITIAL_BOOKING = {
    date: null,
    time: "",
    timezone: "Africa/Nairobi",
    duration: 60,
    name: "",
    email: "",
    company: "",
    phone: "",
    teamSize: "",
    message: ""
};
// ─── Main Component ───────────────────────────────────────────
function BookADemo() {
    var _a, _b;
    var today = new Date();
    var _c = react_1.useState(1), step = _c[0], setStep = _c[1];
    var _d = react_1.useState(today.getFullYear()), calYear = _d[0], setCalYear = _d[1];
    var _e = react_1.useState(today.getMonth()), calMonth = _e[0], setCalMonth = _e[1];
    var _f = react_1.useState(INITIAL_BOOKING), booking = _f[0], setBooking = _f[1];
    var _g = react_1.useState({}), errors = _g[0], setErrors = _g[1];
    var _h = react_1.useState(false), confirmed = _h[0], setConfirmed = _h[1];
    var _j = react_1.useState(false), loading = _j[0], setLoading = _j[1];
    var bookDemoMutation = trpc_1.trpc.websiteAdmin.bookDemo.useMutation({
        onSuccess: function () {
            setConfirmed(true);
            setLoading(false);
        },
        onError: function (err) {
            sonner_1.toast.error(err.message || "Failed to book demo. Please try again.");
            setLoading(false);
        }
    });
    var calendarDays = react_1.useMemo(function () { return buildCalendarDays(calYear, calMonth); }, [calYear, calMonth]);
    function setField(key, val) {
        setBooking(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[key] = val, _a)));
        });
        if (errors[key])
            setErrors(function (prev) {
                var _a;
                return (__assign(__assign({}, prev), (_a = {}, _a[key] = undefined, _a)));
            });
    }
    function prevMonth() {
        if (calMonth === 0) {
            setCalMonth(11);
            setCalYear(function (y) { return y - 1; });
        }
        else
            setCalMonth(function (m) { return m - 1; });
    }
    function nextMonth() {
        if (calMonth === 11) {
            setCalMonth(0);
            setCalYear(function (y) { return y + 1; });
        }
        else
            setCalMonth(function (m) { return m + 1; });
    }
    function validateStep1() {
        var e = {};
        if (!booking.date)
            e.date = "Select a date";
        if (!booking.time)
            e.time = "Select a time";
        setErrors(e);
        return Object.keys(e).length === 0;
    }
    function validateStep2() {
        var e = {};
        if (!booking.name.trim())
            e.name = "Name required";
        if (!booking.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.email))
            e.email = "Valid email required";
        if (!booking.company.trim())
            e.company = "Company required";
        setErrors(e);
        return Object.keys(e).length === 0;
    }
    function handleNextStep1() {
        if (validateStep1())
            setStep(2);
    }
    function handleConfirm() {
        if (!validateStep2())
            return;
        if (!booking.date)
            return;
        setLoading(true);
        bookDemoMutation.mutate({
            name: booking.name,
            email: booking.email,
            company: booking.company || undefined,
            phone: booking.phone || undefined,
            teamSize: booking.teamSize || undefined,
            message: booking.message || undefined,
            date: booking.date.toLocaleDateString("en-GB"),
            time: booking.time,
            timezone: booking.timezone,
            duration: booking.duration
        });
    }
    var tzLabel = ((_a = TIMEZONES.find(function (t) { return t.value === booking.timezone; })) === null || _a === void 0 ? void 0 : _a.label) || booking.timezone;
    var durationLabel = ((_b = DEMO_DURATIONS.find(function (d) { return d.value === booking.duration; })) === null || _b === void 0 ? void 0 : _b.label) || booking.duration + " min";
    return (react_1["default"].createElement("div", { className: "min-h-screen bg-white dark:bg-gray-950" },
        react_1["default"].createElement(WebsiteNav_1.WebsiteNav, null),
        react_1["default"].createElement("section", { className: "pt-24 pb-12 bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900 text-white" },
            react_1["default"].createElement("div", { className: "mx-auto max-w-4xl px-6 text-center" },
                react_1["default"].createElement(badge_1.Badge, { className: "mb-5 bg-white/10 text-white border border-white/20" },
                    react_1["default"].createElement(lucide_react_1.Video, { className: "mr-1.5 h-3.5 w-3.5" }),
                    "Live Product Demo"),
                react_1["default"].createElement("h1", { className: "text-4xl sm:text-5xl font-bold tracking-tight mb-4" }, "See Kiini in action"),
                react_1["default"].createElement("p", { className: "text-indigo-200 text-lg max-w-2xl mx-auto" }, "Pick a date and time that works for you. Our team will walk you through the full platform tailored to your business needs."))),
        react_1["default"].createElement("section", { className: "py-16 bg-gray-50 dark:bg-gray-900" },
            react_1["default"].createElement("div", { className: "mx-auto max-w-6xl px-6" }, confirmed ? (
            // ── Confirmation screen ──────────────────────────
            react_1["default"].createElement("div", { className: "max-w-lg mx-auto text-center py-12" },
                react_1["default"].createElement("div", { className: "flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mx-auto mb-6" },
                    react_1["default"].createElement(lucide_react_1.CheckCircle, { className: "h-12 w-12 text-green-600 dark:text-green-400" })),
                react_1["default"].createElement("h2", { className: "text-3xl font-bold text-gray-900 dark:text-white mb-3" }, "You're all set!"),
                react_1["default"].createElement("p", { className: "text-gray-500 dark:text-gray-400 mb-6" },
                    "Your demo has been booked. A calendar invite and confirmation details have been sent to",
                    " ",
                    react_1["default"].createElement("strong", { className: "text-gray-700 dark:text-gray-300" }, booking.email),
                    "."),
                react_1["default"].createElement("div", { className: "bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 text-left space-y-3 mb-8" }, [
                    { icon: lucide_react_1.Calendar, label: "Date", value: booking.date ? formatDateLong(booking.date) : "" },
                    { icon: lucide_react_1.Clock, label: "Time", value: booking.time + " (" + durationLabel + ")" },
                    { icon: lucide_react_1.Globe, label: "Timezone", value: tzLabel },
                    { icon: lucide_react_1.Video, label: "Format", value: "Google Meet / Zoom — link in your email" },
                ].map(function (row) { return (react_1["default"].createElement("div", { key: row.label, className: "flex items-center gap-3" },
                    react_1["default"].createElement(row.icon, { className: "h-4 w-4 text-indigo-500 shrink-0" }),
                    react_1["default"].createElement("span", { className: "text-sm text-gray-500 dark:text-gray-400 w-20 shrink-0" }, row.label),
                    react_1["default"].createElement("span", { className: "text-sm font-medium text-gray-900 dark:text-white" }, row.value))); })),
                react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { setConfirmed(false); setStep(1); setBooking(INITIAL_BOOKING); } }, "Book another demo"))) : (react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-10" },
                react_1["default"].createElement("div", { className: "lg:col-span-1" },
                    react_1["default"].createElement("div", { className: "bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 sticky top-24" },
                        react_1["default"].createElement("div", { className: "flex items-center gap-3 mb-5" },
                            react_1["default"].createElement("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white" },
                                react_1["default"].createElement(lucide_react_1.Zap, { className: "h-5 w-5" })),
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("div", { className: "font-bold text-gray-900 dark:text-white text-sm" }, "Kiini Demo"),
                                react_1["default"].createElement("div", { className: "text-xs text-gray-500" }, "Live walkthrough"))),
                        react_1["default"].createElement("p", { className: "text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5" }, "A personal, live demo tailored to your industry and team size. No sales pressure \u2014 just a genuine product walkthrough."),
                        react_1["default"].createElement("div", { className: "space-y-2 mb-6" }, DEMO_FEATURES.map(function (f) { return (react_1["default"].createElement("div", { key: f.text, className: "flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300" },
                            react_1["default"].createElement(f.icon, { className: "h-4 w-4 text-indigo-500 shrink-0" }),
                            f.text)); })),
                        (booking.date || booking.time) && (react_1["default"].createElement("div", { className: "border-t border-gray-100 dark:border-gray-700 pt-4 space-y-2" },
                            react_1["default"].createElement("p", { className: "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2" }, "Your selection"),
                            booking.date && (react_1["default"].createElement("div", { className: "flex items-center gap-2 text-sm" },
                                react_1["default"].createElement(lucide_react_1.Calendar, { className: "h-4 w-4 text-indigo-500" }),
                                react_1["default"].createElement("span", { className: "text-gray-700 dark:text-gray-300" }, formatDateShort(booking.date)))),
                            booking.time && (react_1["default"].createElement("div", { className: "flex items-center gap-2 text-sm" },
                                react_1["default"].createElement(lucide_react_1.Clock, { className: "h-4 w-4 text-indigo-500" }),
                                react_1["default"].createElement("span", { className: "text-gray-700 dark:text-gray-300" },
                                    booking.time,
                                    " \u2014 ",
                                    durationLabel))),
                            booking.timezone && (react_1["default"].createElement("div", { className: "flex items-center gap-2 text-sm" },
                                react_1["default"].createElement(lucide_react_1.Globe, { className: "h-4 w-4 text-indigo-500" }),
                                react_1["default"].createElement("span", { className: "text-gray-700 dark:text-gray-300 text-xs" }, tzLabel))))))),
                react_1["default"].createElement("div", { className: "lg:col-span-2" },
                    react_1["default"].createElement("div", { className: "flex items-center gap-2 mb-8" }, [1, 2, 3].map(function (s) { return (react_1["default"].createElement(react_1["default"].Fragment, { key: s },
                        react_1["default"].createElement("div", { className: utils_1.cn("flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors", step === s
                                ? "bg-indigo-600 text-white"
                                : step > s
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-400") }, step > s ? react_1["default"].createElement(lucide_react_1.CheckCircle, { className: "h-4 w-4" }) : s),
                        s < 3 && (react_1["default"].createElement("div", { className: utils_1.cn("flex-1 h-0.5 rounded transition-colors", step > s ? "bg-green-400" : "bg-gray-200 dark:bg-gray-700") })))); })),
                    step === 1 && (react_1["default"].createElement("div", { className: "bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8" },
                        react_1["default"].createElement("h2", { className: "text-xl font-bold text-gray-900 dark:text-white mb-1" }, "Pick a date & time"),
                        react_1["default"].createElement("p", { className: "text-sm text-gray-500 dark:text-gray-400 mb-6" }, "All times shown in your selected timezone. Weekends unavailable."),
                        react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8" },
                            react_1["default"].createElement("div", { className: "space-y-1.5" },
                                react_1["default"].createElement(label_1.Label, { className: "flex items-center gap-1.5" },
                                    react_1["default"].createElement(lucide_react_1.Globe, { className: "h-3.5 w-3.5" }),
                                    " Timezone"),
                                react_1["default"].createElement("select", { value: booking.timezone, onChange: function (e) { return setField("timezone", e.target.value); }, className: "w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" }, TIMEZONES.map(function (tz) { return (react_1["default"].createElement("option", { key: tz.value, value: tz.value }, tz.label)); }))),
                            react_1["default"].createElement("div", { className: "space-y-1.5" },
                                react_1["default"].createElement(label_1.Label, { className: "flex items-center gap-1.5" },
                                    react_1["default"].createElement(lucide_react_1.Clock, { className: "h-3.5 w-3.5" }),
                                    " Duration"),
                                react_1["default"].createElement("div", { className: "flex gap-2" }, DEMO_DURATIONS.map(function (d) { return (react_1["default"].createElement("button", { key: d.value, type: "button", onClick: function () { return setField("duration", d.value); }, className: utils_1.cn("flex-1 rounded-lg border-2 px-3 py-2 text-sm transition-all", booking.duration === d.value
                                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-medium"
                                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300") },
                                    react_1["default"].createElement("div", { className: "font-semibold" }, d.label),
                                    react_1["default"].createElement("div", { className: "text-xs opacity-70" }, d.desc))); })))),
                        react_1["default"].createElement("div", { className: "mb-6" },
                            react_1["default"].createElement("div", { className: "flex items-center justify-between mb-4" },
                                react_1["default"].createElement("button", { type: "button", onClick: prevMonth, className: "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" },
                                    react_1["default"].createElement(lucide_react_1.ChevronLeft, { className: "h-4 w-4 text-gray-600 dark:text-gray-400" })),
                                react_1["default"].createElement("span", { className: "font-semibold text-gray-900 dark:text-white" },
                                    MONTHS[calMonth],
                                    " ",
                                    calYear),
                                react_1["default"].createElement("button", { type: "button", onClick: nextMonth, className: "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" },
                                    react_1["default"].createElement(lucide_react_1.ChevronRight, { className: "h-4 w-4 text-gray-600 dark:text-gray-400" }))),
                            react_1["default"].createElement("div", { className: "grid grid-cols-7 gap-1 mb-2" }, DAYS_OF_WEEK.map(function (d) { return (react_1["default"].createElement("div", { key: d, className: "text-center text-xs font-medium text-gray-400 py-1" }, d)); })),
                            react_1["default"].createElement("div", { className: "grid grid-cols-7 gap-1" }, calendarDays.map(function (day, idx) {
                                var _a;
                                if (!day.date)
                                    return react_1["default"].createElement("div", { key: "pad-" + idx });
                                var isSelected = ((_a = booking.date) === null || _a === void 0 ? void 0 : _a.toDateString()) === day.date.toDateString();
                                var isToday = day.date.toDateString() === today.toDateString();
                                return (react_1["default"].createElement("button", { key: day.date.toISOString(), type: "button", disabled: day.disabled, onClick: function () { return setField("date", day.date); }, className: utils_1.cn("h-9 w-full rounded-lg text-sm transition-all duration-150 font-medium", isSelected
                                        ? "bg-indigo-600 text-white shadow-md"
                                        : day.disabled
                                            ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                                            : isToday
                                                ? "text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700") }, day.date.getDate()));
                            })),
                            errors.date && (react_1["default"].createElement("p", { className: "text-xs text-red-500 mt-2" }, errors.date))),
                        booking.date && (react_1["default"].createElement("div", null,
                            react_1["default"].createElement("p", { className: "text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3" },
                                "Available times \u2014 ",
                                formatDateShort(booking.date)),
                            react_1["default"].createElement("div", { className: "grid grid-cols-4 sm:grid-cols-5 gap-2" }, TIME_SLOTS.map(function (slot) { return (react_1["default"].createElement("button", { key: slot, type: "button", onClick: function () { return setField("time", slot); }, className: utils_1.cn("rounded-lg border-2 py-2 text-sm font-medium transition-all duration-150", booking.time === slot
                                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300"
                                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300 hover:bg-indigo-50/50") }, slot)); })),
                            errors.time && (react_1["default"].createElement("p", { className: "text-xs text-red-500 mt-2" }, errors.time)))),
                        react_1["default"].createElement("div", { className: "mt-8 flex justify-end" },
                            react_1["default"].createElement(button_1.Button, { onClick: handleNextStep1, className: "bg-indigo-600 hover:bg-indigo-700" },
                                "Continue ",
                                react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "ml-2 h-4 w-4" }))))),
                    step === 2 && (react_1["default"].createElement("div", { className: "bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8" },
                        react_1["default"].createElement("h2", { className: "text-xl font-bold text-gray-900 dark:text-white mb-1" }, "Your details"),
                        react_1["default"].createElement("p", { className: "text-sm text-gray-500 dark:text-gray-400 mb-6" }, "We'll use this to send your confirmation and calendar invite."),
                        react_1["default"].createElement("div", { className: "space-y-5" },
                            react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                                react_1["default"].createElement("div", { className: "space-y-1.5" },
                                    react_1["default"].createElement(label_1.Label, { htmlFor: "name" },
                                        "Full Name ",
                                        react_1["default"].createElement("span", { className: "text-red-500" }, "*")),
                                    react_1["default"].createElement(input_1.Input, { id: "name", placeholder: "Jane Smith", value: booking.name, onChange: function (e) { return setField("name", e.target.value); }, className: errors.name ? "border-red-400" : "" }),
                                    errors.name && react_1["default"].createElement("p", { className: "text-xs text-red-500" }, errors.name)),
                                react_1["default"].createElement("div", { className: "space-y-1.5" },
                                    react_1["default"].createElement(label_1.Label, { htmlFor: "email" },
                                        "Work Email ",
                                        react_1["default"].createElement("span", { className: "text-red-500" }, "*")),
                                    react_1["default"].createElement(input_1.Input, { id: "email", type: "email", placeholder: "jane@company.com", value: booking.email, onChange: function (e) { return setField("email", e.target.value); }, className: errors.email ? "border-red-400" : "" }),
                                    errors.email && react_1["default"].createElement("p", { className: "text-xs text-red-500" }, errors.email))),
                            react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                                react_1["default"].createElement("div", { className: "space-y-1.5" },
                                    react_1["default"].createElement(label_1.Label, { htmlFor: "company" },
                                        "Company / Organization ",
                                        react_1["default"].createElement("span", { className: "text-red-500" }, "*")),
                                    react_1["default"].createElement(input_1.Input, { id: "company", placeholder: "Acme Ltd.", value: booking.company, onChange: function (e) { return setField("company", e.target.value); }, className: errors.company ? "border-red-400" : "" }),
                                    errors.company && react_1["default"].createElement("p", { className: "text-xs text-red-500" }, errors.company)),
                                react_1["default"].createElement("div", { className: "space-y-1.5" },
                                    react_1["default"].createElement(label_1.Label, { htmlFor: "phone" }, "Phone Number"),
                                    react_1["default"].createElement(PhoneInput_1.PhoneInput, { id: "phone", value: booking.phone, onChange: function (v) { return setField("phone", v); }, placeholder: "700 000 000" }))),
                            react_1["default"].createElement("div", { className: "space-y-1.5" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "teamSize" }, "Team size"),
                                react_1["default"].createElement("select", { id: "teamSize", value: booking.teamSize, onChange: function (e) { return setField("teamSize", e.target.value); }, className: "w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" },
                                    react_1["default"].createElement("option", { value: "" }, "Select team size"),
                                    react_1["default"].createElement("option", { value: "1-5" }, "1\u20135 people"),
                                    react_1["default"].createElement("option", { value: "6-15" }, "6\u201315 people"),
                                    react_1["default"].createElement("option", { value: "16-50" }, "16\u201350 people"),
                                    react_1["default"].createElement("option", { value: "51-200" }, "51\u2013200 people"),
                                    react_1["default"].createElement("option", { value: "200+" }, "200+ people"))),
                            react_1["default"].createElement("div", { className: "space-y-1.5" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "msg" }, "Anything specific you'd like to see?"),
                                react_1["default"].createElement("textarea", { id: "msg", rows: 3, placeholder: "e.g. payroll processing, multi-tenant setup, invoicing workflow...", value: booking.message, onChange: function (e) { return setField("message", e.target.value); }, className: "w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" }))),
                        react_1["default"].createElement("div", { className: "mt-8 flex justify-between" },
                            react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return setStep(1); } },
                                react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "mr-2 h-4 w-4" }),
                                " Back"),
                            react_1["default"].createElement(button_1.Button, { onClick: function () { if (validateStep2())
                                    setStep(3); }, className: "bg-indigo-600 hover:bg-indigo-700" },
                                "Review booking ",
                                react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "ml-2 h-4 w-4" }))))),
                    step === 3 && (react_1["default"].createElement("div", { className: "bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8" },
                        react_1["default"].createElement("h2", { className: "text-xl font-bold text-gray-900 dark:text-white mb-1" }, "Review & confirm"),
                        react_1["default"].createElement("p", { className: "text-sm text-gray-500 dark:text-gray-400 mb-6" }, "Please review the details below before confirming."),
                        react_1["default"].createElement("div", { className: "space-y-4 mb-8" },
                            react_1["default"].createElement("div", { className: "bg-indigo-50 dark:bg-indigo-950/30 rounded-xl p-5 border border-indigo-100 dark:border-indigo-900/40" },
                                react_1["default"].createElement("p", { className: "text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-3" }, "Demo Details"),
                                react_1["default"].createElement("div", { className: "space-y-2.5" }, [
                                    { icon: lucide_react_1.Calendar, label: "Date", value: booking.date ? formatDateLong(booking.date) : "" },
                                    { icon: lucide_react_1.Clock, label: "Time", value: booking.time + " (" + durationLabel + ")" },
                                    { icon: lucide_react_1.Globe, label: "Timezone", value: tzLabel },
                                    { icon: lucide_react_1.Video, label: "Format", value: "Google Meet — link will be emailed to you" },
                                ].map(function (row) { return (react_1["default"].createElement("div", { key: row.label, className: "flex items-center gap-3 text-sm" },
                                    react_1["default"].createElement(row.icon, { className: "h-4 w-4 text-indigo-500 shrink-0" }),
                                    react_1["default"].createElement("span", { className: "text-gray-500 dark:text-gray-400 w-20 shrink-0" }, row.label),
                                    react_1["default"].createElement("span", { className: "font-medium text-gray-900 dark:text-white" }, row.value))); }))),
                            react_1["default"].createElement("div", { className: "bg-gray-50 dark:bg-gray-900/60 rounded-xl p-5 border border-gray-100 dark:border-gray-700" },
                                react_1["default"].createElement("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3" }, "Your Details"),
                                react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-2 text-sm" }, [
                                    ["Name", booking.name],
                                    ["Email", booking.email],
                                    ["Company", booking.company],
                                    ["Phone", booking.phone || "—"],
                                    ["Team", booking.teamSize || "—"],
                                ].map(function (_a) {
                                    var label = _a[0], val = _a[1];
                                    return (react_1["default"].createElement("div", { key: label },
                                        react_1["default"].createElement("span", { className: "text-gray-400 dark:text-gray-500" },
                                            label,
                                            ": "),
                                        react_1["default"].createElement("span", { className: "font-medium text-gray-900 dark:text-white" }, val)));
                                })))),
                        react_1["default"].createElement("div", { className: "flex justify-between" },
                            react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return setStep(2); } },
                                react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "mr-2 h-4 w-4" }),
                                " Back"),
                            react_1["default"].createElement(button_1.Button, { onClick: handleConfirm, disabled: loading, className: "bg-indigo-600 hover:bg-indigo-700 min-w-[160px]" }, loading ? (react_1["default"].createElement("span", { className: "flex items-center gap-2" },
                                react_1["default"].createElement("span", { className: "h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" }),
                                "Booking\u2026")) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                                react_1["default"].createElement(lucide_react_1.CheckCircle, { className: "mr-2 h-4 w-4" }),
                                "Confirm demo"))))))))))),
        react_1["default"].createElement(WebsiteFooter_1.WebsiteFooter, null)));
}
exports["default"] = BookADemo;
