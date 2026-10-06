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
exports.EmailCalendarIntegration = void 0;
var react_1 = require("react");
var react_query_1 = require("@tanstack/react-query");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
/**
 * Email & Calendar Integration Page (Phase 5.4)
 *
 * Email and calendar management including:
 * - Email integration (Gmail, Outlook)
 * - Calendar synchronization
 * - Event scheduling
 * - Availability checking
 * - Email tracking
 */
function EmailCalendarIntegration() {
    var _this = this;
    var _a = react_1.useState(new Date().toISOString().split('T')[0]), selectedDate = _a[0], setSelectedDate = _a[1];
    var emailIntegration = react_query_1.useQuery({
        queryKey: ['emailIntegration'],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, trpc_1.trpc.emailCalendar.getEmailIntegration.query()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        }); }
    }).data;
    var availability = react_query_1.useQuery({
        queryKey: ['availability', selectedDate],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, trpc_1.trpc.emailCalendar.getAvailability.query({
                            date: selectedDate
                        })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        }); }
    }).data;
    return (react_1["default"].createElement("div", { className: "p-8 space-y-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen" },
        react_1["default"].createElement("div", { className: "max-w-7xl mx-auto" },
            react_1["default"].createElement("div", { className: "flex items-center gap-3 mb-8" },
                react_1["default"].createElement(lucide_react_1.Mail, { className: "w-8 h-8 text-blue-600" }),
                react_1["default"].createElement("h1", { className: "text-3xl font-bold text-slate-900" }, "Email & Calendar Integration")),
            emailIntegration && (react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8" },
                react_1["default"].createElement("div", { className: "flex items-center gap-2 mb-6" },
                    react_1["default"].createElement(lucide_react_1.Mail, { className: "w-5 h-5 text-blue-600" }),
                    react_1["default"].createElement("h2", { className: "text-xl font-semibold text-slate-900" }, "Email Integrations")),
                react_1["default"].createElement("div", { className: "space-y-4" }, emailIntegration.integrations.map(function (integration, idx) { return (react_1["default"].createElement("div", { key: idx, className: "p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition" },
                    react_1["default"].createElement("div", { className: "flex items-center justify-between mb-3" },
                        react_1["default"].createElement("h3", { className: "font-semibold text-slate-900 capitalize" }, integration.provider),
                        react_1["default"].createElement("span", { className: "inline-block px-3 py-1 text-xs font-semibold rounded " + (integration.connected
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700') }, integration.connected ? 'CONNECTED' : 'NOT CONNECTED')),
                    react_1["default"].createElement("div", { className: "grid grid-cols-3 gap-4 text-sm" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("p", { className: "text-slate-600 mb-1" }, "Inbox"),
                            react_1["default"].createElement("p", { className: "font-semibold text-slate-900" }, integration.inboxCount)),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("p", { className: "text-slate-600 mb-1" }, "Unread"),
                            react_1["default"].createElement("p", { className: "font-semibold text-slate-900" }, integration.unreadCount)),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("p", { className: "text-slate-600 mb-1" }, "Last Sync"),
                            react_1["default"].createElement("p", { className: "font-semibold text-slate-900" }, "Active"))))); })),
                react_1["default"].createElement("button", { className: "mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium" }, "Add Email Account"))),
            react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8" },
                react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow-sm border border-slate-200" },
                    react_1["default"].createElement("div", { className: "flex items-center gap-2 mb-6" },
                        react_1["default"].createElement(lucide_react_1.Calendar, { className: "w-5 h-5 text-cyan-600" }),
                        react_1["default"].createElement("h2", { className: "text-xl font-semibold text-slate-900" }, "Today's Availability")),
                    react_1["default"].createElement("div", { className: "mb-4" },
                        react_1["default"].createElement("input", { type: "date", value: selectedDate, onChange: function (e) { return setSelectedDate(e.target.value); }, className: "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" })),
                    availability && (react_1["default"].createElement("div", { className: "space-y-3" },
                        availability.available.map(function (slot, idx) { return (react_1["default"].createElement("div", { key: idx, className: "p-3 bg-slate-50 rounded-lg border border-green-200" },
                            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                                react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                                    react_1["default"].createElement(lucide_react_1.Clock, { className: "w-4 h-4 text-green-600" }),
                                    react_1["default"].createElement("span", { className: "text-sm font-medium text-slate-900" },
                                        slot.start,
                                        " - ",
                                        slot.end)),
                                react_1["default"].createElement("span", { className: "text-xs text-slate-500" },
                                    slot.duration,
                                    " min")))); }),
                        availability.available.length === 0 && (react_1["default"].createElement("p", { className: "text-sm text-slate-600 text-center py-4" }, "No available slots today"))))),
                react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow-sm border border-slate-200" },
                    react_1["default"].createElement("div", { className: "flex items-center gap-2 mb-6" },
                        react_1["default"].createElement(lucide_react_1.Send, { className: "w-5 h-5 text-purple-600" }),
                        react_1["default"].createElement("h2", { className: "text-xl font-semibold text-slate-900" }, "Schedule Event")),
                    react_1["default"].createElement("form", { className: "space-y-4" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "block text-sm font-medium text-slate-700 mb-1" }, "Event Title"),
                            react_1["default"].createElement("input", { type: "text", placeholder: "Team Meeting", className: "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" })),
                        react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-3" },
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("label", { className: "block text-sm font-medium text-slate-700 mb-1" }, "Date"),
                                react_1["default"].createElement("input", { type: "date", className: "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" })),
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("label", { className: "block text-sm font-medium text-slate-700 mb-1" }, "Time"),
                                react_1["default"].createElement("input", { type: "time", className: "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" }))),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "block text-sm font-medium text-slate-700 mb-1" }, "Attendees (emails, comma-separated)"),
                            react_1["default"].createElement("input", { type: "text", placeholder: "john@company.com, jane@company.com", className: "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" })),
                        react_1["default"].createElement("button", { type: "button", className: "w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium" }, "Create & Send Invitations")))),
            react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow-sm border border-slate-200" },
                react_1["default"].createElement("div", { className: "flex items-center gap-2 mb-6" },
                    react_1["default"].createElement(lucide_react_1.Mail, { className: "w-5 h-5 text-amber-600" }),
                    react_1["default"].createElement("h2", { className: "text-xl font-semibold text-slate-900" }, "Email Tracking")),
                react_1["default"].createElement("div", { className: "space-y-4" },
                    react_1["default"].createElement("div", { className: "p-4 border border-slate-200 rounded-lg" },
                        react_1["default"].createElement("div", { className: "flex items-start justify-between mb-3" },
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("h3", { className: "font-semibold text-slate-900" }, "Invoice Reminder - January 2025"),
                                react_1["default"].createElement("p", { className: "text-sm text-slate-500" }, "Sent to 45 recipients \u2022 3 days ago"))),
                        react_1["default"].createElement("div", { className: "bg-slate-50 p-3 rounded text-sm space-y-2" },
                            react_1["default"].createElement("div", { className: "flex justify-between" },
                                react_1["default"].createElement("span", { className: "text-slate-600" }, "Delivered:"),
                                react_1["default"].createElement("span", { className: "font-semibold text-slate-900" }, "43 of 45")),
                            react_1["default"].createElement("div", { className: "flex justify-between" },
                                react_1["default"].createElement("span", { className: "text-slate-600" }, "Opened:"),
                                react_1["default"].createElement("span", { className: "font-semibold text-slate-900" }, "28 (65%)")),
                            react_1["default"].createElement("div", { className: "flex justify-between" },
                                react_1["default"].createElement("span", { className: "text-slate-600" }, "Clicked:"),
                                react_1["default"].createElement("span", { className: "font-semibold text-slate-900" }, "15 (35%)")))),
                    react_1["default"].createElement("div", { className: "p-4 border border-slate-200 rounded-lg" },
                        react_1["default"].createElement("div", { className: "flex items-start justify-between mb-3" },
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("h3", { className: "font-semibold text-slate-900" }, "Monthly Report - February 2025"),
                                react_1["default"].createElement("p", { className: "text-sm text-slate-500" }, "Sent to 12 recipients \u2022 2 days ago"))),
                        react_1["default"].createElement("div", { className: "bg-slate-50 p-3 rounded text-sm space-y-2" },
                            react_1["default"].createElement("div", { className: "flex justify-between" },
                                react_1["default"].createElement("span", { className: "text-slate-600" }, "Delivered:"),
                                react_1["default"].createElement("span", { className: "font-semibold text-slate-900" }, "12 of 12")),
                            react_1["default"].createElement("div", { className: "flex justify-between" },
                                react_1["default"].createElement("span", { className: "text-slate-600" }, "Opened:"),
                                react_1["default"].createElement("span", { className: "font-semibold text-slate-900" }, "9 (75%)")),
                            react_1["default"].createElement("div", { className: "flex justify-between" },
                                react_1["default"].createElement("span", { className: "text-slate-600" }, "Clicked:"),
                                react_1["default"].createElement("span", { className: "font-semibold text-slate-900" }, "6 (50%)")))))))));
}
exports.EmailCalendarIntegration = EmailCalendarIntegration;
exports["default"] = EmailCalendarIntegration;
