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
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var WebsiteNav_1 = require("./WebsiteNav");
var WebsiteFooter_1 = require("./WebsiteFooter");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
function Contact() {
    var _this = this;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = react_1.useState("idle"), formState = _b[0], setFormState = _b[1];
    var _c = react_1.useState({ name: "", email: "", company: "", subject: "", message: "" }), form = _c[0], setForm = _c[1];
    var handleChange = function (e) {
        setForm(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[e.target.name] = e.target.value, _a)));
        });
    };
    var submitMutation = trpc_1.trpc.websiteContact.submit.useMutation();
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    e.preventDefault();
                    setFormState("submitting");
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, submitMutation.mutateAsync({
                            name: form.name,
                            email: form.email,
                            company: form.company || undefined,
                            subject: form.subject,
                            message: form.message
                        })];
                case 2:
                    _b.sent();
                    setFormState("success");
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    setFormState("error");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (react_1["default"].createElement("div", { className: "min-h-screen bg-white text-gray-900 overflow-x-hidden" },
        react_1["default"].createElement(WebsiteNav_1.WebsiteNav, null),
        react_1["default"].createElement("section", { className: "relative pt-32 pb-16 lg:pt-44 lg:pb-24 overflow-hidden bg-gradient-to-b from-indigo-50/80 via-white to-white" },
            react_1["default"].createElement("div", { className: "absolute inset-0 -z-10" },
                react_1["default"].createElement("div", { className: "absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-100/60 rounded-full blur-3xl" })),
            react_1["default"].createElement("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" },
                react_1["default"].createElement(badge_1.Badge, { className: "mb-6 bg-indigo-50 text-indigo-600 border border-indigo-200" },
                    react_1["default"].createElement(lucide_react_1.MessageSquare, { className: "mr-1.5 h-3 w-3" }),
                    " We'd love to hear from you"),
                react_1["default"].createElement("h1", { className: "text-5xl md:text-6xl font-black tracking-tight mb-6 leading-none" },
                    "Let's start a",
                    " ",
                    react_1["default"].createElement("span", { className: "bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent" }, "conversation")),
                react_1["default"].createElement("p", { className: "text-xl text-gray-500 max-w-xl mx-auto leading-relaxed" }, "Whether you have a question, need a demo, or are ready to get started \u2014 our team is here to help."))),
        react_1["default"].createElement("section", { className: "pb-32" },
            react_1["default"].createElement("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" },
                react_1["default"].createElement("div", { className: "grid lg:grid-cols-3 gap-10" },
                    react_1["default"].createElement("div", { className: "space-y-6" },
                        [
                            { icon: lucide_react_1.Mail, label: "Email us", value: "hello@kiini.africa", sub: "We respond within 4 business hours" },
                            { icon: lucide_react_1.Phone, label: "Call us", value: "+254 700 000 000", sub: "Mon–Fri, 8am–6pm EAT" },
                            { icon: lucide_react_1.MapPin, label: "Office", value: "Nairobi, Kenya", sub: "Westlands Business District" },
                        ].map(function (item) {
                            var Icon = item.icon;
                            return (react_1["default"].createElement("div", { key: item.label, className: "flex gap-4 rounded-2xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow" },
                                react_1["default"].createElement("div", { className: "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100" },
                                    react_1["default"].createElement(Icon, { className: "h-5 w-5 text-indigo-600" })),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "text-xs text-gray-400 mb-0.5" }, item.label),
                                    react_1["default"].createElement("p", { className: "font-semibold text-sm" }, item.value),
                                    react_1["default"].createElement("p", { className: "text-xs text-gray-400 mt-0.5" }, item.sub))));
                        }),
                        react_1["default"].createElement("div", { className: "rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6" },
                            react_1["default"].createElement("div", { className: "flex items-center gap-2 mb-3" },
                                react_1["default"].createElement(lucide_react_1.Clock, { className: "h-4 w-4 text-indigo-600" }),
                                react_1["default"].createElement("span", { className: "text-sm font-semibold text-indigo-700" }, "Response times")),
                            react_1["default"].createElement("ul", { className: "space-y-2 text-xs text-gray-500" },
                                react_1["default"].createElement("li", null, "Sales inquiries: within 2 business hours"),
                                react_1["default"].createElement("li", null, "Support tickets: within 4 hours (Pro) / 24h (Starter)"),
                                react_1["default"].createElement("li", null, "Enterprise: dedicated account manager")))),
                    react_1["default"].createElement("div", { className: "lg:col-span-2" }, formState === "success" ? (react_1["default"].createElement("div", { className: "flex flex-col items-center justify-center h-full py-20 text-center rounded-2xl border border-emerald-200 bg-emerald-50/50" },
                        react_1["default"].createElement("div", { className: "flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-6" },
                            react_1["default"].createElement(lucide_react_1.CheckCircle, { className: "h-8 w-8 text-emerald-600" })),
                        react_1["default"].createElement("h3", { className: "text-2xl font-black mb-3" }, "Message sent!"),
                        react_1["default"].createElement("p", { className: "text-gray-500 mb-8 max-w-sm" }, "Thanks for reaching out. A member of our team will be in touch shortly."),
                        react_1["default"].createElement(button_1.Button, { variant: "outline", className: "border-gray-300 text-gray-700 hover:bg-gray-50", onClick: function () { return navigate("/"); } }, "Back to Home"))) : (react_1["default"].createElement("form", { onSubmit: handleSubmit, className: "rounded-2xl border border-gray-200 bg-white p-8 space-y-5 shadow-sm" },
                        react_1["default"].createElement("h2", { className: "text-xl font-bold mb-1" }, "Send us a message"),
                        react_1["default"].createElement("p", { className: "text-sm text-gray-400 mb-6" }, "Fill out the form and we'll get back to you promptly."),
                        react_1["default"].createElement("div", { className: "grid sm:grid-cols-2 gap-5" },
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "name", className: "text-gray-600 text-sm" }, "Full name *"),
                                react_1["default"].createElement(input_1.Input, { id: "name", name: "name", required: true, placeholder: "Jane Doe", value: form.name, onChange: handleChange, className: "border-gray-300 focus:border-indigo-500" })),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "email", className: "text-gray-600 text-sm" }, "Work email *"),
                                react_1["default"].createElement(input_1.Input, { id: "email", name: "email", type: "email", required: true, placeholder: "jane@company.com", value: form.email, onChange: handleChange, className: "border-gray-300 focus:border-indigo-500" }))),
                        react_1["default"].createElement("div", { className: "grid sm:grid-cols-2 gap-5" },
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "company", className: "text-gray-600 text-sm" }, "Company name"),
                                react_1["default"].createElement(input_1.Input, { id: "company", name: "company", placeholder: "Acme Corp", value: form.company, onChange: handleChange, className: "border-gray-300 focus:border-indigo-500" })),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "subject", className: "text-gray-600 text-sm" }, "Subject *"),
                                react_1["default"].createElement("select", { id: "subject", name: "subject", required: true, value: form.subject, onChange: handleChange, className: "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-indigo-500" },
                                    react_1["default"].createElement("option", { value: "" }, "Select a topic\u2026"),
                                    react_1["default"].createElement("option", { value: "demo" }, "Request a demo"),
                                    react_1["default"].createElement("option", { value: "pricing" }, "Pricing inquiry"),
                                    react_1["default"].createElement("option", { value: "support" }, "Technical support"),
                                    react_1["default"].createElement("option", { value: "partnership" }, "Partnership"),
                                    react_1["default"].createElement("option", { value: "other" }, "Other")))),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "message", className: "text-gray-600 text-sm" }, "Message *"),
                            react_1["default"].createElement(textarea_1.Textarea, { id: "message", name: "message", required: true, rows: 5, placeholder: "Tell us about your business and what you're looking for\u2026", value: form.message, onChange: handleChange, className: "border-gray-300 focus:border-indigo-500 resize-none" })),
                        react_1["default"].createElement(button_1.Button, { type: "submit", disabled: formState === "submitting", className: "w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6" }, formState === "submitting" ? (react_1["default"].createElement(react_1["default"].Fragment, null,
                            react_1["default"].createElement("div", { className: "h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" }),
                            "Sending\u2026")) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                            "Send Message ",
                            react_1["default"].createElement(lucide_react_1.Send, { className: "ml-2 h-4 w-4" })))),
                        react_1["default"].createElement("p", { className: "text-center text-xs text-gray-400" }, "By submitting this form you agree to our Privacy Policy. We won't share your data."))))))),
        react_1["default"].createElement(WebsiteFooter_1.WebsiteFooter, null)));
}
exports["default"] = Contact;
