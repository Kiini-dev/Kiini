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
var react_router_dom_1 = require("react-router-dom");
var lucide_react_1 = require("lucide-react");
/**
 * Contact Page
 * Contact form and company contact information
 */
function ContactPage() {
    var _this = this;
    var _a = react_1.useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: '',
        type: 'general'
    }), formData = _a[0], setFormData = _a[1];
    var _b = react_1.useState(false), submitted = _b[0], setSubmitted = _b[1];
    var _c = react_1.useState(false), loading = _c[0], setLoading = _c[1];
    var handleChange = function (e) {
        var _a = e.target, name = _a.name, value = _a.value;
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[name] = value, _a)));
        });
    };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            e.preventDefault();
            setLoading(true);
            try {
                // TODO: Call tRPC mutation to save contact form submission
                // await trpc.contact.submitContactForm.mutate(formData);
                // For now, just simulate success
                setTimeout(function () {
                    setSubmitted(true);
                    setFormData({ name: '', email: '', phone: '', company: '', subject: '', message: '', type: 'general' });
                    setLoading(false);
                    setTimeout(function () {
                        setSubmitted(false);
                    }, 5000);
                }, 1000);
            }
            catch (error) {
                console.error('Error submitting form:', error);
                setLoading(false);
            }
            return [2 /*return*/];
        });
    }); };
    var contactInfo = [
        {
            icon: react_1["default"].createElement(lucide_react_1.MapPin, { size: 24 }),
            title: 'Office Location',
            content: 'Nairobi, Kenya',
            details: 'Tech Innovation Hub, Gigiri'
        },
        {
            icon: react_1["default"].createElement(lucide_react_1.Phone, { size: 24 }),
            title: 'Phone',
            content: '+254 (0) 700 123 456',
            details: 'Monday - Friday, 9 AM - 5 PM EAT'
        },
        {
            icon: react_1["default"].createElement(lucide_react_1.Mail, { size: 24 }),
            title: 'Email',
            content: 'support@kiini.africa',
            details: 'We respond within 24 hours'
        },
        {
            icon: react_1["default"].createElement(lucide_react_1.MessageSquare, { size: 24 }),
            title: 'Live Chat',
            content: 'In-app chat support',
            details: 'For existing customers'
        },
    ];
    return (react_1["default"].createElement("div", { className: "min-h-screen bg-white" },
        react_1["default"].createElement("header", { className: "border-b border-gray-200 sticky top-0 z-50 bg-white" },
            react_1["default"].createElement("nav", { className: "max-w-7xl mx-auto px-6 py-4 flex items-center justify-between" },
                react_1["default"].createElement(react_router_dom_1.Link, { to: "/", className: "text-2xl font-bold text-blue-600" }, "\uD83C\uDFE2 Kiini CRM"),
                react_1["default"].createElement("div", { className: "flex gap-4" },
                    react_1["default"].createElement(react_router_dom_1.Link, { to: "/pricing", className: "text-gray-700 hover:text-blue-600" }, "Pricing"),
                    react_1["default"].createElement(react_router_dom_1.Link, { to: "/about", className: "text-gray-700 hover:text-blue-600" }, "About"),
                    react_1["default"].createElement(react_router_dom_1.Link, { to: "/login", className: "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" }, "Sign In")))),
        react_1["default"].createElement("section", { className: "bg-gradient-to-br from-blue-600 to-purple-600 text-white py-16" },
            react_1["default"].createElement("div", { className: "max-w-3xl mx-auto px-6 text-center" },
                react_1["default"].createElement("h1", { className: "text-5xl font-bold mb-4" }, "Get in Touch"),
                react_1["default"].createElement("p", { className: "text-xl text-blue-100" }, "Have questions? We'd love to hear from you. Our team is here to help."))),
        react_1["default"].createElement("section", { className: "py-16 bg-gray-50" },
            react_1["default"].createElement("div", { className: "max-w-6xl mx-auto px-6" },
                react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" }, contactInfo.map(function (info, idx) { return (react_1["default"].createElement("div", { key: idx, className: "bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition" },
                    react_1["default"].createElement("div", { className: "text-blue-600 mb-4 flex justify-center" }, info.icon),
                    react_1["default"].createElement("h3", { className: "text-lg font-bold text-gray-900 mb-2" }, info.title),
                    react_1["default"].createElement("p", { className: "text-blue-600 font-semibold mb-1" }, info.content),
                    react_1["default"].createElement("p", { className: "text-gray-600 text-sm" }, info.details))); })))),
        react_1["default"].createElement("section", { className: "py-16 bg-white" },
            react_1["default"].createElement("div", { className: "max-w-3xl mx-auto px-6" },
                react_1["default"].createElement("h2", { className: "text-3xl font-bold text-gray-900 mb-12 text-center" }, "Send us a Message"),
                submitted && (react_1["default"].createElement("div", { className: "mb-8 p-4 bg-green-50 border border-green-200 rounded text-green-700" }, "\u2713 Thank you! Your message has been sent. We'll get back to you soon.")),
                react_1["default"].createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "block text-sm font-semibold text-gray-700 mb-2" }, "Full Name *"),
                            react_1["default"].createElement("input", { type: "text", name: "name", value: formData.name, onChange: handleChange, required: true, className: "w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Your name" })),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "block text-sm font-semibold text-gray-700 mb-2" }, "Email Address *"),
                            react_1["default"].createElement("input", { type: "email", name: "email", value: formData.email, onChange: handleChange, required: true, className: "w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "you@company.com" })),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "block text-sm font-semibold text-gray-700 mb-2" }, "Phone Number"),
                            react_1["default"].createElement("input", { type: "tel", name: "phone", value: formData.phone, onChange: handleChange, className: "w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "+254 700 123 456" })),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "block text-sm font-semibold text-gray-700 mb-2" }, "Company Name"),
                            react_1["default"].createElement("input", { type: "text", name: "company", value: formData.company, onChange: handleChange, className: "w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Your company" }))),
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "block text-sm font-semibold text-gray-700 mb-2" }, "Subject *"),
                            react_1["default"].createElement("input", { type: "text", name: "subject", value: formData.subject, onChange: handleChange, required: true, className: "w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "What is this regarding?" })),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "block text-sm font-semibold text-gray-700 mb-2" }, "Inquiry Type *"),
                            react_1["default"].createElement("select", { name: "type", value: formData.type, onChange: handleChange, className: "w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" },
                                react_1["default"].createElement("option", { value: "general" }, "General Inquiry"),
                                react_1["default"].createElement("option", { value: "sales" }, "Sales Question"),
                                react_1["default"].createElement("option", { value: "support" }, "Technical Support"),
                                react_1["default"].createElement("option", { value: "partnership" }, "Partnership Opportunity")))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-semibold text-gray-700 mb-2" }, "Message *"),
                        react_1["default"].createElement("textarea", { name: "message", value: formData.message, onChange: handleChange, required: true, rows: 6, className: "w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Tell us more about your inquiry..." })),
                    react_1["default"].createElement("button", { type: "submit", disabled: loading, className: "w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition flex items-center justify-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.Send, { size: 18 }),
                        loading ? 'Sending...' : 'Send Message')))),
        react_1["default"].createElement("section", { className: "py-16 bg-gray-50" },
            react_1["default"].createElement("div", { className: "max-w-3xl mx-auto px-6" },
                react_1["default"].createElement("h2", { className: "text-3xl font-bold text-gray-900 mb-12 text-center" }, "Common Questions"),
                react_1["default"].createElement("div", { className: "space-y-8" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("h3", { className: "text-lg font-bold text-gray-900 mb-2" }, "What's your typical response time?"),
                        react_1["default"].createElement("p", { className: "text-gray-600" }, "We aim to respond to all inquiries within 24 hours during business days. Sales inquiries are often answered within 4 hours.")),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("h3", { className: "text-lg font-bold text-gray-900 mb-2" }, "Do you offer demos?"),
                        react_1["default"].createElement("p", { className: "text-gray-600" }, "Yes! We offer free 30-minute demos for teams interested in learning more about Kiini CRM. Book a demo on our website.")),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("h3", { className: "text-lg font-bold text-gray-900 mb-2" }, "Can I speak to someone before signing up?"),
                        react_1["default"].createElement("p", { className: "text-gray-600" }, "Absolutely! Our sales team is happy to answer any questions before you commit. Fill out the form above and select \"Sales Question\".")),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("h3", { className: "text-lg font-bold text-gray-900 mb-2" }, "Is there technical support?"),
                        react_1["default"].createElement("p", { className: "text-gray-600" }, "Yes, we offer email support for all plans, and priority/dedicated support for Professional and Enterprise tiers."))))),
        react_1["default"].createElement("section", { className: "py-16 bg-white" },
            react_1["default"].createElement("div", { className: "max-w-6xl mx-auto px-6" },
                react_1["default"].createElement("h2", { className: "text-2xl font-bold text-gray-900 mb-8 text-center" }, "Visit Us"),
                react_1["default"].createElement("div", { className: "rounded-lg overflow-hidden shadow-lg h-96 bg-gray-200 flex items-center justify-center" },
                    react_1["default"].createElement("div", { className: "text-center" },
                        react_1["default"].createElement(lucide_react_1.MapPin, { size: 48, className: "text-gray-400 mx-auto mb-4" }),
                        react_1["default"].createElement("p", { className: "text-gray-600" }, "Kiini Solutions"),
                        react_1["default"].createElement("p", { className: "text-gray-600" }, "Tech Innovation Hub, Gigiri"),
                        react_1["default"].createElement("p", { className: "text-gray-600" }, "Nairobi, Kenya"))))),
        react_1["default"].createElement("section", { className: "bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16" },
            react_1["default"].createElement("div", { className: "max-w-3xl mx-auto px-6 text-center" },
                react_1["default"].createElement("h2", { className: "text-3xl font-bold mb-4" }, "Ready to Get Started?"),
                react_1["default"].createElement("p", { className: "text-lg mb-8 text-blue-100" }, "Try Kiini CRM free for 14 days. No credit card required."),
                react_1["default"].createElement(react_router_dom_1.Link, { to: "/signup", className: "inline-block bg-white text-blue-600 px-8 py-3 rounded font-bold hover:bg-blue-50 transition" }, "Start Free Trial"))),
        react_1["default"].createElement("footer", { className: "bg-gray-900 text-gray-400 py-8 border-t border-gray-800" },
            react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-6 text-center" },
                react_1["default"].createElement("p", null, "\u00A9 2025 Kiini Solutions. All rights reserved."),
                react_1["default"].createElement("div", { className: "flex justify-center gap-6 mt-4" },
                    react_1["default"].createElement(react_router_dom_1.Link, { to: "/privacy", className: "hover:text-white" }, "Privacy Policy"),
                    react_1["default"].createElement(react_router_dom_1.Link, { to: "/terms", className: "hover:text-white" }, "Terms of Service"),
                    react_1["default"].createElement(react_router_dom_1.Link, { to: "/pricing", className: "hover:text-white" }, "Pricing"))))));
}
exports["default"] = ContactPage;
