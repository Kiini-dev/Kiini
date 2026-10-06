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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.EmailComposer = void 0;
var react_1 = require("react");
var dialog_1 = require("@/components/ui/dialog");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
var tabs_1 = require("@/components/ui/tabs");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
exports.EmailComposer = function (_a) {
    var _b;
    var open = _a.open, onOpenChange = _a.onOpenChange, onSend = _a.onSend, recipientEmail = _a.recipientEmail, _c = _a.defaultSubject, defaultSubject = _c === void 0 ? "" : _c, _d = _a.defaultBody, defaultBody = _d === void 0 ? "" : _d, _e = _a.templates, templates = _e === void 0 ? [] : _e, _f = _a.previewMode, previewMode = _f === void 0 ? false : _f;
    var _g = react_1.useState({
        to: recipientEmail ? [recipientEmail] : [],
        subject: defaultSubject,
        body: defaultBody,
        htmlBody: defaultBody,
        cc: [],
        bcc: []
    }), emailData = _g[0], setEmailData = _g[1];
    var _h = react_1.useState(false), showPreview = _h[0], setShowPreview = _h[1];
    var _j = react_1.useState(false), isSending = _j[0], setIsSending = _j[1];
    var _k = react_1.useState(""), selectedTemplate = _k[0], setSelectedTemplate = _k[1];
    var handleTemplateSelect = function (templateId) {
        var template = templates.find(function (t) { return t.id === templateId; });
        if (template) {
            setEmailData(function (prev) { return (__assign(__assign({}, prev), { subject: template.subject, body: template.body, htmlBody: template.htmlBody || template.body })); });
            setSelectedTemplate(templateId);
        }
    };
    var handleAddRecipient = function (email) {
        if (email && !emailData.to.includes(email)) {
            setEmailData(function (prev) { return (__assign(__assign({}, prev), { to: __spreadArrays(prev.to, [email]) })); });
        }
    };
    var handleRemoveRecipient = function (email) {
        setEmailData(function (prev) { return (__assign(__assign({}, prev), { to: prev.to.filter(function (e) { return e !== email; }) })); });
    };
    var handleSend = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!emailData.to.length) {
                        sonner_1.toast.error("Please add at least one recipient");
                        return [2 /*return*/];
                    }
                    if (!emailData.subject.trim()) {
                        sonner_1.toast.error("Subject is required");
                        return [2 /*return*/];
                    }
                    if (!emailData.body.trim()) {
                        sonner_1.toast.error("Email body is required");
                        return [2 /*return*/];
                    }
                    setIsSending(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, onSend(emailData)];
                case 2:
                    _a.sent();
                    sonner_1.toast.success("Email sent successfully");
                    onOpenChange(false);
                    setEmailData({
                        to: recipientEmail ? [recipientEmail] : [],
                        subject: defaultSubject,
                        body: defaultBody,
                        htmlBody: defaultBody,
                        cc: [],
                        bcc: []
                    });
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    sonner_1.toast.error("Failed to send email: " + (error_1 instanceof Error ? error_1.message : "Unknown error"));
                    return [3 /*break*/, 5];
                case 4:
                    setIsSending(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (react_1["default"].createElement(dialog_1.Dialog, { open: open, onOpenChange: onOpenChange },
        react_1["default"].createElement(dialog_1.DialogContent, { className: "max-w-3xl max-h-[90vh] overflow-y-auto" },
            react_1["default"].createElement(dialog_1.DialogHeader, null,
                react_1["default"].createElement(dialog_1.DialogTitle, { className: "flex items-center gap-2" },
                    react_1["default"].createElement(lucide_react_1.Mail, { className: "h-5 w-5" }),
                    "HTML Email Composer"),
                react_1["default"].createElement(dialog_1.DialogDescription, null, "Compose and send professional HTML emails with templates")),
            react_1["default"].createElement(tabs_1.Tabs, { defaultValue: "compose", className: "w-full" },
                react_1["default"].createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-2" },
                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "compose" }, "Compose"),
                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "preview" }, "Preview")),
                react_1["default"].createElement(tabs_1.TabsContent, { value: "compose", className: "space-y-4" },
                    templates.length > 0 && (react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement(label_1.Label, null, "Email Templates"),
                        react_1["default"].createElement(select_1.Select, { value: selectedTemplate, onValueChange: handleTemplateSelect },
                            react_1["default"].createElement(select_1.SelectTrigger, null,
                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "Load a template..." })),
                            react_1["default"].createElement(select_1.SelectContent, null, templates.map(function (template) { return (react_1["default"].createElement(select_1.SelectItem, { key: template.id, value: template.id }, template.name)); }))))),
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement(label_1.Label, null, "Recipients"),
                        react_1["default"].createElement("div", { className: "flex gap-2" },
                            react_1["default"].createElement(input_1.Input, { type: "email", placeholder: "Add email address", onKeyPress: function (e) {
                                    if (e.key === "Enter") {
                                        handleAddRecipient(e.target.value);
                                        e.target.value = "";
                                    }
                                } }),
                            react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", onClick: function (e) {
                                    var _a;
                                    var input = (_a = e.currentTarget.parentElement) === null || _a === void 0 ? void 0 : _a.querySelector("input");
                                    if (input === null || input === void 0 ? void 0 : input.value) {
                                        handleAddRecipient(input.value);
                                        input.value = "";
                                    }
                                } }, "Add")),
                        react_1["default"].createElement("div", { className: "flex flex-wrap gap-2" }, emailData.to.map(function (email) { return (react_1["default"].createElement("div", { key: email, className: "bg-primary/10 px-3 py-1 rounded-full text-sm flex items-center gap-2" },
                            email,
                            react_1["default"].createElement("button", { onClick: function () { return handleRemoveRecipient(email); }, className: "ml-1 hover:text-destructive" }, "\u2715"))); }))),
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement(label_1.Label, { htmlFor: "subject" }, "Subject"),
                        react_1["default"].createElement(input_1.Input, { id: "subject", value: emailData.subject, onChange: function (e) {
                                return setEmailData(function (prev) { return (__assign(__assign({}, prev), { subject: e.target.value })); });
                            }, placeholder: "Enter email subject" })),
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement(label_1.Label, { htmlFor: "body" }, "Email Body (HTML)"),
                        react_1["default"].createElement(RichTextEditor_1.RichTextEditor, { value: emailData.htmlBody, onChange: function (value) {
                                return setEmailData(function (prev) { return (__assign(__assign({}, prev), { body: value, htmlBody: value })); });
                            }, placeholder: "Enter email content (supports HTML)", minHeight: "250px" })),
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "cc" }, "CC"),
                            react_1["default"].createElement(input_1.Input, { id: "cc", placeholder: "cc@example.com (comma-separated)", onChange: function (e) {
                                    return setEmailData(function (prev) { return (__assign(__assign({}, prev), { cc: e.target.value
                                            .split(",")
                                            .map(function (email) { return email.trim(); })
                                            .filter(function (email) { return email; }) })); });
                                } })),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "bcc" }, "BCC"),
                            react_1["default"].createElement(input_1.Input, { id: "bcc", placeholder: "bcc@example.com (comma-separated)", onChange: function (e) {
                                    return setEmailData(function (prev) { return (__assign(__assign({}, prev), { bcc: e.target.value
                                            .split(",")
                                            .map(function (email) { return email.trim(); })
                                            .filter(function (email) { return email; }) })); });
                                } })))),
                react_1["default"].createElement(tabs_1.TabsContent, { value: "preview", className: "space-y-4" },
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardContent, { className: "pt-6" },
                            react_1["default"].createElement("div", { className: "space-y-4" },
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement(label_1.Label, { className: "text-xs text-muted-foreground" }, "TO"),
                                    react_1["default"].createElement("p", { className: "font-medium" }, emailData.to.join(", "))),
                                ((_b = emailData.cc) === null || _b === void 0 ? void 0 : _b.length) > 0 && (react_1["default"].createElement("div", null,
                                    react_1["default"].createElement(label_1.Label, { className: "text-xs text-muted-foreground" }, "CC"),
                                    react_1["default"].createElement("p", { className: "font-medium" }, emailData.cc.join(", ")))),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement(label_1.Label, { className: "text-xs text-muted-foreground" }, "SUBJECT"),
                                    react_1["default"].createElement("p", { className: "font-medium text-lg" }, emailData.subject)),
                                react_1["default"].createElement("div", { className: "border rounded p-4 bg-white text-black min-h-[300px]" },
                                    react_1["default"].createElement("div", { dangerouslySetInnerHTML: { __html: emailData.htmlBody } }))))))),
            react_1["default"].createElement(dialog_1.DialogFooter, { className: "flex items-center gap-2" },
                react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return onOpenChange(false); } }, "Cancel"),
                react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return setShowPreview(!showPreview); } },
                    react_1["default"].createElement(lucide_react_1.Eye, { className: "h-4 w-4 mr-2" }),
                    "Preview"),
                react_1["default"].createElement(button_1.Button, { onClick: handleSend, disabled: isSending },
                    react_1["default"].createElement(lucide_react_1.Send, { className: "h-4 w-4 mr-2" }),
                    isSending ? "Sending..." : "Send Email")))));
};
