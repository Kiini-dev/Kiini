"use strict";
/**
 * Email & SMS Service Component
 * Unified interface for sending emails and SMS with templating support
 * Includes delivery tracking and history
 */
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.MessageService = void 0;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var date_fns_1 = require("date-fns");
var designSystem_1 = require("@/lib/designSystem");
var emailTemplates = [
    {
        id: "tmpl-1",
        name: "Invoice Notification",
        subject: "Your Invoice #{invoiceNumber} is Ready",
        html: "<p>Dear {clientName},</p><p>Your invoice #{invoiceNumber} totaling {amount} is ready.</p>",
        variables: ["invoiceNumber", "clientName", "amount"]
    },
    {
        id: "tmpl-2",
        name: "Payment Reminder",
        subject: "Payment Due: {invoiceNumber}",
        html: "<p>Dear {clientName},</p><p>Payment of {amount} for invoice {invoiceNumber} is due on {dueDate}.</p>",
        variables: ["invoiceNumber", "clientName", "amount", "dueDate"]
    },
    {
        id: "tmpl-3",
        name: "Receipt Confirmation",
        subject: "Receipt #{receiptNumber} - {amount}",
        html: "<p>Thank you for your payment of {amount}.</p><p>Receipt #{receiptNumber} has been issued.</p>",
        variables: ["receiptNumber", "amount"]
    },
];
var smsTemplates = [
    {
        id: "sms-1",
        name: "Payment Reminder",
        message: "Hi {name}, reminder: Invoice {inv} amount {amount} is due on {date}. Pay now.",
        variables: ["name", "inv", "amount", "date"]
    },
    {
        id: "sms-2",
        name: "Invoice Notification",
        message: "Hi {name}, your invoice {inv} for {amount} is ready. View it here.",
        variables: ["name", "inv", "amount"]
    },
    {
        id: "sms-3",
        name: "Payment Confirmation",
        message: "Thank you {name}! We received your payment of {amount}. Ref: {ref}",
        variables: ["name", "amount", "ref"]
    },
];
function MessageService(_a) {
    var _this = this;
    var _b = _a.type, type = _b === void 0 ? "both" : _b, onSuccess = _a.onSuccess, onError = _a.onError;
    var _c = react_1.useState(type === "both" ? "email" : type), messageType = _c[0], setMessageType = _c[1];
    var _d = react_1.useState("__none__"), templateId = _d[0], setTemplateId = _d[1];
    var _e = react_1.useState(""), recipients = _e[0], setRecipients = _e[1];
    var _f = react_1.useState(""), subject = _f[0], setSubject = _f[1];
    var _g = react_1.useState(""), message = _g[0], setMessage = _g[1];
    var _h = react_1.useState(false), loading = _h[0], setLoading = _h[1];
    var _j = react_1.useState("send"), activeTab = _j[0], setActiveTab = _j[1];
    var _k = react_1.useState([
        {
            id: "msg-1",
            type: "email",
            recipient: "client@example.com",
            subject: "Your Invoice #INV-001 is Ready",
            message: "Invoice notification sent",
            status: "delivered",
            sentAt: new Date(Date.now() - 3600000),
            deliveredAt: new Date(Date.now() - 3595000)
        },
        {
            id: "msg-2",
            type: "sms",
            recipient: "+254712345678",
            message: "Payment reminder",
            status: "sent",
            sentAt: new Date(Date.now() - 7200000)
        },
        {
            id: "msg-3",
            type: "email",
            recipient: "another@example.com",
            subject: "Payment Reminder",
            message: "Invoice reminder sent",
            status: "failed",
            sentAt: new Date(Date.now() - 86400000),
            errorMessage: "Invalid email address"
        },
    ]), messages = _k[0], setMessages = _k[1];
    // Get templates for current message type
    var templates = messageType === "email" ? emailTemplates : smsTemplates;
    var selectedTemplate = templates.find(function (t) { return t.id === templateId; });
    // Send email mutation
    var sendEmailMutation = trpc_1.trpc.email.queueEmail.useMutation({
        onSuccess: function (data) {
            sonner_1.toast.success("Email sent successfully");
            var newMessage = {
                id: data.id,
                type: "email",
                recipient: recipients,
                subject: subject,
                message: message,
                status: "sent",
                sentAt: new Date()
            };
            setMessages(__spreadArrays([newMessage], messages));
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(data.id);
            resetForm();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to send email");
            onError === null || onError === void 0 ? void 0 : onError(error.message || "Failed to send email");
        }
    });
    // Send SMS mutation
    var sendSMSMutation = trpc_1.trpc.sms.sendSMS.useMutation({
        onSuccess: function (data) {
            sonner_1.toast.success("SMS sent successfully");
            var newMessage = {
                id: data.id,
                type: "sms",
                recipient: recipients,
                message: message,
                status: "sent",
                sentAt: new Date()
            };
            setMessages(__spreadArrays([newMessage], messages));
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(data.id);
            resetForm();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to send SMS");
            onError === null || onError === void 0 ? void 0 : onError(error.message || "Failed to send SMS");
        }
    });
    var resetForm = function () {
        setTemplateId("__none__");
        setRecipients("");
        setSubject("");
        setMessage("");
    };
    var handleTemplateChange = function (id) {
        setTemplateId(id);
        var template = templates.find(function (t) { return t.id === id; });
        if (template) {
            if (messageType === "email") {
                setSubject(template.subject);
                setMessage(template.html);
            }
            else {
                setMessage(template.message);
            }
        }
    };
    var handleSendMessage = function (e) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            e.preventDefault();
            if (!recipients.trim()) {
                sonner_1.toast.error("Please enter at least one recipient");
                return [2 /*return*/];
            }
            if (!message.trim()) {
                sonner_1.toast.error("Message cannot be empty");
                return [2 /*return*/];
            }
            setLoading(true);
            try {
                if (messageType === "email") {
                    if (!subject.trim()) {
                        sonner_1.toast.error("Email subject is required");
                        setLoading(false);
                        return [2 /*return*/];
                    }
                    sendEmailMutation.mutate({
                        to: recipients,
                        subject: subject,
                        html: message,
                        template: templateId && templateId !== "__none__" ? templateId : undefined
                    });
                }
                else {
                    sendSMSMutation.mutate({
                        phoneNumber: recipients,
                        message: message,
                        template: templateId && templateId !== "__none__" ? templateId : undefined
                    });
                }
            }
            finally {
                setLoading(false);
            }
            return [2 /*return*/];
        });
    }); };
    var statusColors = {
        pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
        sent: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
        delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100",
        failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
    };
    var statusIcons = {
        pending: lucide_react_1.AlertCircle,
        sent: lucide_react_1.Send,
        delivered: lucide_react_1.CheckCircle2,
        failed: lucide_react_1.AlertCircle
    };
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "flex gap-2 border-b" },
            React.createElement("button", { onClick: function () { return setActiveTab("send"); }, className: "pb-2 px-4 font-medium transition-colors " + (activeTab === "send"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-muted-foreground hover:text-foreground") },
                React.createElement(lucide_react_1.Send, { className: "w-4 h-4 inline mr-2" }),
                "Send Message"),
            React.createElement("button", { onClick: function () { return setActiveTab("history"); }, className: "pb-2 px-4 font-medium transition-colors " + (activeTab === "history"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-muted-foreground hover:text-foreground") },
                React.createElement(lucide_react_1.Archive, { className: "w-4 h-4 inline mr-2" }),
                "History")),
        activeTab === "send" && (React.createElement(card_1.Card, { className: designSystem_1.getGradientCard("blue") },
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: designSystem_1.animations.fadeIn }, "Send Message"),
                React.createElement(card_1.CardDescription, null,
                    "Send ",
                    messageType === "email" ? "emails" : "SMS",
                    " to your contacts")),
            React.createElement(card_1.CardContent, null,
                React.createElement("form", { onSubmit: handleSendMessage, className: "space-y-4" },
                    type === "both" && (React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                        React.createElement("label", { className: "p-4 border-2 rounded-lg cursor-pointer transition-all " + (messageType === "email"
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                                : "border-gray-200 dark:border-gray-800") },
                            React.createElement("input", { type: "radio", value: "email", checked: messageType === "email", onChange: function (e) { return setMessageType(e.target.value); }, className: "mr-2" }),
                            React.createElement(lucide_react_1.Mail, { className: "h-5 w-5 inline mr-2" }),
                            React.createElement("span", { className: "font-medium" }, "Email")),
                        React.createElement("label", { className: "p-4 border-2 rounded-lg cursor-pointer transition-all " + (messageType === "sms"
                                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                                : "border-gray-200 dark:border-gray-800") },
                            React.createElement("input", { type: "radio", value: "sms", checked: messageType === "sms", onChange: function (e) { return setMessageType(e.target.value); }, className: "mr-2" }),
                            React.createElement(lucide_react_1.MessageSquare, { className: "h-5 w-5 inline mr-2" }),
                            React.createElement("span", { className: "font-medium" }, "SMS")))),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, { htmlFor: "template" }, "Template (Optional)"),
                        React.createElement(select_1.Select, { value: templateId, onValueChange: handleTemplateChange },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, { placeholder: "Select a template" })),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "__none__" }, "No Template"),
                                templates.map(function (tmpl) { return (React.createElement(select_1.SelectItem, { key: tmpl.id, value: tmpl.id }, tmpl.name)); })))),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, { htmlFor: "recipients" },
                            messageType === "email" ? "Email Address(es)" : "Phone Number(s)",
                            " *"),
                        React.createElement(textarea_1.Textarea, { id: "recipients", placeholder: messageType === "email"
                                ? "client@example.com, another@example.com"
                                : "+254712345678, +254723456789", value: recipients, onChange: function (e) { return setRecipients(e.target.value); }, disabled: loading, className: "h-20" }),
                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "Separate multiple recipients with commas")),
                    messageType === "email" && (React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, { htmlFor: "subject" }, "Subject *"),
                        React.createElement(input_1.Input, { id: "subject", placeholder: "Email subject", value: subject, onChange: function (e) { return setSubject(e.target.value); }, disabled: loading }))),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, { htmlFor: "message" },
                            messageType === "email" ? "Email Body" : "Message",
                            " *"),
                        React.createElement(textarea_1.Textarea, { id: "message", placeholder: messageType === "email"
                                ? "Email HTML content"
                                : "SMS message (160 characters)", value: message, onChange: function (e) { return setMessage(e.target.value); }, disabled: loading, className: "h-32" }),
                        React.createElement("div", { className: "flex justify-between text-xs text-muted-foreground" },
                            React.createElement("span", null, messageType === "sms" && message.length + "/160 characters"),
                            selectedTemplate && (React.createElement("span", { className: "text-blue-600" },
                                "Template variables: ",
                                selectedTemplate.variables.join(", "))))),
                    React.createElement(button_1.Button, { type: "submit", disabled: loading, className: "w-full gap-2" }, loading ? (React.createElement(React.Fragment, null,
                        React.createElement(lucide_react_1.Loader2, { className: "w-4 h-4 animate-spin" }),
                        "Sending...")) : (React.createElement(React.Fragment, null,
                        React.createElement(lucide_react_1.Send, { className: "w-4 h-4" }),
                        "Send ",
                        messageType === "email" ? "Email" : "SMS"))))))),
        activeTab === "history" && (React.createElement(card_1.Card, { className: designSystem_1.getGradientCard("slate") },
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: designSystem_1.animations.fadeIn }, "Message History"),
                React.createElement(card_1.CardDescription, null,
                    "Recent messages sent (",
                    messages.length,
                    " total)")),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Type"),
                                React.createElement(table_1.TableHead, null, "Recipient"),
                                React.createElement(table_1.TableHead, null, "Subject/Message"),
                                React.createElement(table_1.TableHead, null, "Status"),
                                React.createElement(table_1.TableHead, null, "Sent"),
                                React.createElement(table_1.TableHead, null, "Actions"))),
                        React.createElement(table_1.TableBody, null, messages.map(function (msg) {
                            var StatusIcon = statusIcons[msg.status];
                            return (React.createElement(table_1.TableRow, { key: msg.id },
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(badge_1.Badge, { variant: "outline" }, msg.type === "email" ? (React.createElement(React.Fragment, null,
                                        React.createElement(lucide_react_1.Mail, { className: "w-3 h-3 mr-1" }),
                                        "Email")) : (React.createElement(React.Fragment, null,
                                        React.createElement(lucide_react_1.MessageSquare, { className: "w-3 h-3 mr-1" }),
                                        "SMS")))),
                                React.createElement(table_1.TableCell, { className: "font-mono text-sm" }, msg.recipient),
                                React.createElement(table_1.TableCell, { className: "max-w-xs truncate" }, msg.subject || msg.message),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(badge_1.Badge, { className: statusColors[msg.status] },
                                        React.createElement(StatusIcon, { className: "w-3 h-3 mr-1" }),
                                        msg.status)),
                                React.createElement(table_1.TableCell, { className: "text-sm" }, date_fns_1.format(msg.sentAt, "MMM dd, HH:mm")),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement("div", { className: "flex gap-2" },
                                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", title: "View" },
                                            React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" }))))));
                        })))))))));
}
exports.MessageService = MessageService;
exports["default"] = MessageService;
