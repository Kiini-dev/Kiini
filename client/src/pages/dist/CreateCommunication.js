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
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var textarea_1 = require("@/components/ui/textarea");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var DocumentBlockEditor_1 = require("@/components/DocumentBlockEditor");
var HTMLEditor_1 = require("@/components/HTMLEditor");
var card_1 = require("@/components/ui/card");
var label_1 = require("@/components/ui/label");
var tabs_1 = require("@/components/ui/tabs");
var select_1 = require("@/components/ui/select");
var command_1 = require("@/components/ui/command");
var popover_1 = require("@/components/ui/popover");
var badge_1 = require("@/components/ui/badge");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var const_1 = require("@/const");
var TEMPLATE_GROUPS = {
    general: {
        label: "General",
        templates: [
            { id: "thank-you", name: "Thank You", subject: "Thank You for Your Business", body: "Dear Client,\n\nThank you for your business. We appreciate your continued support.\n\nBest regards,\n" + const_1.APP_TITLE, category: "general", type: "both" },
            { id: "update", name: "Client Update", subject: "Important Update", body: "Dear Client,\n\nWe hope you are doing well. Please find the latest updates below.\n\nBest regards,\n" + const_1.APP_TITLE, category: "general", type: "both" },
            { id: "follow-up", name: "Follow Up", subject: "Following Up", body: "Dear Client,\n\nI wanted to follow up on our recent conversation. Please let me know if you have any questions.\n\nBest regards,\n" + const_1.APP_TITLE, category: "general", type: "both" },
            { id: "welcome", name: "Welcome", subject: "Welcome to " + const_1.APP_TITLE, body: "Dear Client,\n\nWelcome to " + const_1.APP_TITLE + "! We are excited to have you on board.\n\nPlease don't hesitate to reach out if you need anything.\n\nBest regards,\n" + const_1.APP_TITLE, category: "general", type: "email" },
        ]
    },
    financial: {
        label: "Financial / Invoicing",
        templates: [
            { id: "invoice-reminder", name: "Invoice Reminder", subject: "Invoice Reminder - Payment Due", body: "Dear Client,\n\nThis is a friendly reminder that your invoice is due. Please arrange payment at your earliest convenience.\n\nIf you have already made the payment, please disregard this message.\n\nBest regards,\n" + const_1.APP_TITLE, category: "financial", type: "both" },
            { id: "payment-received", name: "Payment Received", subject: "Payment Received - Thank You", body: "Dear Client,\n\nThank you for your payment. We have received and processed it successfully.\n\nBest regards,\n" + const_1.APP_TITLE, category: "financial", type: "both" },
            { id: "overdue-notice", name: "Overdue Notice", subject: "Overdue Payment Notice", body: "Dear Client,\n\nWe would like to bring to your attention that your payment is now overdue. Please arrange payment as soon as possible to avoid any disruptions.\n\nBest regards,\n" + const_1.APP_TITLE, category: "financial", type: "email" },
            { id: "receipt-sent", name: "Receipt Sent", subject: "Your Receipt", body: "Dear Client,\n\nPlease find your receipt attached. Thank you for your payment.\n\nBest regards,\n" + const_1.APP_TITLE, category: "financial", type: "email" },
        ]
    },
    estimates: {
        label: "Estimates & Proposals",
        templates: [
            { id: "new-estimate", name: "New Estimate", subject: "Your Estimate is Ready", body: "Dear Client,\n\nWe have prepared an estimate for you. Please review the details and let us know if you'd like to proceed.\n\nBest regards,\n" + const_1.APP_TITLE, category: "estimates", type: "email" },
            { id: "proposal-sent", name: "Proposal Sent", subject: "Proposal for Your Review", body: "Dear Client,\n\nPlease find our proposal attached for your review. We look forward to the opportunity to work with you.\n\nBest regards,\n" + const_1.APP_TITLE, category: "estimates", type: "email" },
            { id: "quote-follow-up", name: "Quote Follow Up", subject: "Following Up on Your Quote", body: "Dear Client,\n\nI wanted to follow up on the quote we sent recently. Please let us know if you have any questions or would like to proceed.\n\nBest regards,\n" + const_1.APP_TITLE, category: "estimates", type: "both" },
        ]
    },
    projects: {
        label: "Projects",
        templates: [
            { id: "project-kickoff", name: "Project Kickoff", subject: "Project Kickoff", body: "Dear Client,\n\nWe are excited to kick off your project. Below are the key details and next steps.\n\nBest regards,\n" + const_1.APP_TITLE, category: "projects", type: "email" },
            { id: "project-update", name: "Project Status Update", subject: "Project Status Update", body: "Dear Client,\n\nHere is an update on the current status of your project.\n\nBest regards,\n" + const_1.APP_TITLE, category: "projects", type: "both" },
            { id: "project-complete", name: "Project Completed", subject: "Project Completed Successfully", body: "Dear Client,\n\nWe are pleased to inform you that your project has been completed successfully. Please review the deliverables and let us know your feedback.\n\nBest regards,\n" + const_1.APP_TITLE, category: "projects", type: "email" },
        ]
    },
    contracts: {
        label: "Contracts",
        templates: [
            { id: "contract-new", name: "New Contract", subject: "New Contract for Your Review", body: "Dear Client,\n\nA new contract has been prepared for you. Please review the terms and sign at your convenience.\n\nBest regards,\n" + const_1.APP_TITLE, category: "contracts", type: "email" },
            { id: "contract-renewal", name: "Contract Renewal", subject: "Contract Renewal Notice", body: "Dear Client,\n\nYour contract is due for renewal. Please review and confirm if you'd like to continue.\n\nBest regards,\n" + const_1.APP_TITLE, category: "contracts", type: "both" },
        ]
    },
    meetings: {
        label: "Meetings & Appointments",
        templates: [
            { id: "meeting-invite", name: "Meeting Invitation", subject: "Meeting Invitation", body: "Dear Client,\n\nYou are invited to a meeting. Please see the details below and confirm your attendance.\n\nBest regards,\n" + const_1.APP_TITLE, category: "meetings", type: "email" },
            { id: "meeting-reminder", name: "Meeting Reminder", subject: "Meeting Reminder", body: "Dear Client,\n\nThis is a reminder about your upcoming meeting. Please ensure you are available.\n\nBest regards,\n" + const_1.APP_TITLE, category: "meetings", type: "both" },
            { id: "meeting-follow-up", name: "Meeting Follow Up", subject: "Follow Up from Our Meeting", body: "Dear Client,\n\nThank you for your time during our meeting. Here is a summary of the key points discussed.\n\nBest regards,\n" + const_1.APP_TITLE, category: "meetings", type: "email" },
        ]
    },
    sms: {
        label: "SMS Templates",
        templates: [
            { id: "sms-reminder", name: "Payment Reminder (SMS)", subject: "", body: "Hi, this is a reminder that your payment is due. Please arrange payment. - " + const_1.APP_TITLE, category: "sms", type: "sms" },
            { id: "sms-confirmation", name: "Appointment Confirmation (SMS)", subject: "", body: "Hi, your appointment has been confirmed. We look forward to seeing you. - " + const_1.APP_TITLE, category: "sms", type: "sms" },
            { id: "sms-thank-you", name: "Thank You (SMS)", subject: "", body: "Thank you for your business! We appreciate your support. - " + const_1.APP_TITLE, category: "sms", type: "sms" },
            { id: "sms-update", name: "Status Update (SMS)", subject: "", body: "Hi, your request has been updated. Log in for details. - " + const_1.APP_TITLE, category: "sms", type: "sms" },
        ]
    }
};
// ─── Template Selector Component ──────────────────────────────────────────────
function TemplateSelector(_a) {
    var commType = _a.commType, onSelect = _a.onSelect;
    var _b = react_1.useState(false), open = _b[0], setOpen = _b[1];
    var _c = react_1.useState(""), search = _c[0], setSearch = _c[1];
    // Filter templates based on communication type
    var filteredGroups = react_1.useMemo(function () {
        var result = {};
        for (var _i = 0, _a = Object.entries(TEMPLATE_GROUPS); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], group = _b[1];
            var filtered = group.templates.filter(function (t) { return t.type === "both" || t.type === commType; });
            if (filtered.length > 0) {
                // Further filter by search
                var searched = search
                    ? filtered.filter(function (t) {
                        return t.name.toLowerCase().includes(search.toLowerCase()) ||
                            t.category.toLowerCase().includes(search.toLowerCase());
                    })
                    : filtered;
                if (searched.length > 0) {
                    result[key] = { label: group.label, templates: searched };
                }
            }
        }
        return result;
    }, [commType, search]);
    var totalTemplates = Object.values(filteredGroups).reduce(function (acc, g) { return acc + g.templates.length; }, 0);
    return (react_1["default"].createElement(popover_1.Popover, { open: open, onOpenChange: setOpen },
        react_1["default"].createElement(popover_1.PopoverTrigger, { asChild: true },
            react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", role: "combobox", "aria-expanded": open, className: "w-full justify-between" },
                react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                    react_1["default"].createElement(lucide_react_1.FileText, { size: 16 }),
                    react_1["default"].createElement("span", null, "Select a template...")),
                react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                    react_1["default"].createElement(badge_1.Badge, { variant: "secondary", className: "text-xs" },
                        totalTemplates,
                        " templates"),
                    react_1["default"].createElement(lucide_react_1.ChevronDown, { size: 14, className: "opacity-50" })))),
        react_1["default"].createElement(popover_1.PopoverContent, { className: "w-[500px] p-0", align: "start" },
            react_1["default"].createElement(command_1.Command, null,
                react_1["default"].createElement(command_1.CommandInput, { placeholder: "Search templates...", value: search, onValueChange: setSearch }),
                react_1["default"].createElement(command_1.CommandList, { className: "max-h-[400px]" },
                    react_1["default"].createElement(command_1.CommandEmpty, null, "No templates found."),
                    Object.entries(filteredGroups).map(function (_a, index) {
                        var key = _a[0], group = _a[1];
                        return (react_1["default"].createElement(react_1["default"].Fragment, { key: key },
                            index > 0 && react_1["default"].createElement(command_1.CommandSeparator, null),
                            react_1["default"].createElement(command_1.CommandGroup, { heading: group.label }, group.templates.map(function (template) { return (react_1["default"].createElement(command_1.CommandItem, { key: template.id, value: template.name + " " + template.category, onSelect: function () {
                                    onSelect(template);
                                    setOpen(false);
                                    setSearch("");
                                }, className: "cursor-pointer" },
                                react_1["default"].createElement("div", { className: "flex flex-col gap-0.5 flex-1" },
                                    react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                                        react_1["default"].createElement("span", { className: "font-medium text-sm" }, template.name),
                                        template.type === "sms" && (react_1["default"].createElement(badge_1.Badge, { variant: "outline", className: "text-[10px] px-1.5 py-0" }, "SMS")),
                                        template.type === "email" && (react_1["default"].createElement(badge_1.Badge, { variant: "outline", className: "text-[10px] px-1.5 py-0" }, "Email"))),
                                    template.subject && (react_1["default"].createElement("span", { className: "text-xs text-muted-foreground truncate max-w-[400px]" }, template.subject))))); }))));
                    }))))));
}
function CreateCommunication() {
    var _this = this;
    var _a, _b, _c;
    var _d = wouter_1.useLocation(), navigate = _d[1];
    var _e = react_1.useState(false), loading = _e[0], setLoading = _e[1];
    var _f = react_1.useState("richtext"), editorMode = _f[0], setEditorMode = _f[1];
    var _g = react_1.useState({
        type: "email",
        recipient: "",
        recipients: "",
        subject: "",
        body: "",
        sendAt: new Date().toISOString().split("T")[0]
    }), formData = _g[0], setFormData = _g[1];
    // tRPC mutations for email and SMS
    var sendEmailMutation = trpc_1.trpc.communications.sendEmail.useMutation();
    var sendSmsMutation = trpc_1.trpc.communications.sendSms.useMutation();
    react_1.useEffect(function () {
        var params = new URLSearchParams(window.location.search);
        var to = params.get("to") || "";
        var subject = params.get("subject") || "";
        if (!to && !subject)
            return;
        setFormData(function (prev) { return (__assign(__assign({}, prev), { recipient: to || prev.recipient, subject: subject || prev.subject, type: to && to.includes("@") ? "email" : prev.type })); });
    }, []);
    // Get clients for autocomplete
    var _h = (((_c = (_b = (_a = trpc_1.trpc.clients) === null || _a === void 0 ? void 0 : _a.list) === null || _b === void 0 ? void 0 : _b.useQuery) === null || _c === void 0 ? void 0 : _c.call(_b, {
        limit: 1000,
        offset: 0
    })) || { data: [] }).data, clients = _h === void 0 ? [] : _h;
    var handleInputChange = function (field, value) {
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[field] = value, _a)));
        });
    };
    var validateForm = function () {
        if (formData.type === "email" && !formData.subject.trim()) {
            sonner_1.toast.error("Subject is required for emails");
            return false;
        }
        if (!formData.body.trim()) {
            sonner_1.toast.error("Message body is required");
            return false;
        }
        if (!formData.recipient.trim() && !formData.recipients.trim()) {
            sonner_1.toast.error("At least one recipient is required");
            return false;
        }
        return true;
    };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var recipientsList, _i, recipientsList_1, recipient, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!validateForm()) {
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, 9, 10]);
                    recipientsList = formData.recipients
                        .split(",")
                        .map(function (r) { return r.trim(); })
                        .filter(function (r) { return r.length > 0; });
                    if (formData.recipient) {
                        recipientsList.push(formData.recipient.trim());
                    }
                    _i = 0, recipientsList_1 = recipientsList;
                    _a.label = 2;
                case 2:
                    if (!(_i < recipientsList_1.length)) return [3 /*break*/, 7];
                    recipient = recipientsList_1[_i];
                    if (!(formData.type === "email")) return [3 /*break*/, 4];
                    return [4 /*yield*/, sendEmailMutation.mutateAsync({
                            to: recipient,
                            subject: formData.subject || "Email Communication",
                            body: formData.body
                        })];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, sendSmsMutation.mutateAsync({
                        phoneNumber: recipient,
                        message: formData.body,
                        recipientId: recipient
                    })];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7:
                    sonner_1.toast.success("Communication" + (recipientsList.length > 1 ? "s" : "") + " queued successfully");
                    navigate("/communications");
                    return [3 /*break*/, 10];
                case 8:
                    error_1 = _a.sent();
                    console.error("Failed to create communication:", error_1);
                    sonner_1.toast.error("Failed to create communication");
                    return [3 /*break*/, 10];
                case 9:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    }); };
    var getTypeIcon = function (type) {
        switch (type) {
            case "email":
                return react_1["default"].createElement(lucide_react_1.Mail, { size: 16 });
            case "sms":
                return react_1["default"].createElement(lucide_react_1.Phone, { size: 16 });
            default:
                return react_1["default"].createElement(lucide_react_1.MessageSquare, { size: 16 });
        }
    };
    var filteredClients = clients.filter(function (client) {
        var _a, _b;
        return ((_a = client.name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(formData.recipient.toLowerCase())) || ((_b = client.email) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(formData.recipient.toLowerCase()));
    });
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Create Communication", description: "Send emails, SMS, or other communications to your clients", icon: react_1["default"].createElement(lucide_react_1.Plus, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Communications", href: "/communications" },
            { label: "Create" },
        ], backLink: { label: "Communications", href: "/communications" } },
        react_1["default"].createElement("div", { className: "space-y-6 p-6" },
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, null, "Communication Details"),
                    react_1["default"].createElement(card_1.CardDescription, null, "Fill in the details below to send a new communication")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                        react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, null, "Communication Type *"),
                                react_1["default"].createElement(select_1.Select, { value: formData.type, onValueChange: function (value) {
                                        return handleInputChange("type", value);
                                    } },
                                    react_1["default"].createElement(select_1.SelectTrigger, null,
                                        react_1["default"].createElement(select_1.SelectValue, null)),
                                    react_1["default"].createElement(select_1.SelectContent, null,
                                        react_1["default"].createElement(select_1.SelectItem, { value: "email" },
                                            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                                                react_1["default"].createElement(lucide_react_1.Mail, { size: 14 }),
                                                " Email")),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "sms" },
                                            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                                                react_1["default"].createElement(lucide_react_1.Phone, { size: 14 }),
                                                " SMS"))))),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, null, "Send At"),
                                react_1["default"].createElement(input_1.Input, { type: "date", value: formData.sendAt, onChange: function (e) { return handleInputChange("sendAt", e.target.value); } })),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, null, "Schedule Later?"),
                                react_1["default"].createElement("div", { className: "flex items-center gap-2 pt-2" },
                                    react_1["default"].createElement("input", { type: "checkbox", id: "schedule", defaultChecked: false, className: "w-4 h-4" }),
                                    react_1["default"].createElement(label_1.Label, { htmlFor: "schedule", className: "cursor-pointer text-sm" }, "Schedule for later")))),
                        react_1["default"].createElement("div", { className: "space-y-4 border-t pt-4" },
                            react_1["default"].createElement("h3", { className: "font-semibold" }, "Recipients *"),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, null, "Recipient Email or Phone"),
                                react_1["default"].createElement("div", { className: "relative" },
                                    react_1["default"].createElement(input_1.Input, { placeholder: formData.type === "email"
                                            ? "Enter email address..."
                                            : "Enter phone number...", value: formData.recipient, onChange: function (e) { return handleInputChange("recipient", e.target.value); }, autoComplete: "off" }),
                                    formData.recipient && filteredClients.length > 0 && (react_1["default"].createElement("div", { className: "absolute top-full mt-1 w-full bg-white border rounded-md shadow-lg z-10" }, filteredClients.slice(0, 5).map(function (client) { return (react_1["default"].createElement("div", { key: client.id, className: "px-4 py-2 hover:bg-accent cursor-pointer", onClick: function () {
                                            var email = formData.type === "email"
                                                ? client.email
                                                : client.phone || "";
                                            handleInputChange("recipient", email);
                                        } },
                                        react_1["default"].createElement("div", { className: "font-medium" }, client.name),
                                        react_1["default"].createElement("div", { className: "text-sm text-muted-foreground" }, formData.type === "email"
                                            ? client.email
                                            : client.phone))); }))))),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, null, "Additional Recipients (comma-separated)"),
                                react_1["default"].createElement(textarea_1.Textarea, { placeholder: formData.type === "email"
                                        ? "email1@example.com, email2@example.com, ..."
                                        : "+254712345678, +254987654321, ...", value: formData.recipients, onChange: function (e) { return handleInputChange("recipients", e.target.value); }, rows: 3 }),
                                react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" }, "Enter multiple recipients separated by commas"))),
                        react_1["default"].createElement("div", { className: "space-y-4 border-t pt-4" },
                            react_1["default"].createElement("h3", { className: "font-semibold" }, "Message Content"),
                            formData.type === "email" && (react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, null, "Subject *"),
                                react_1["default"].createElement(input_1.Input, { placeholder: "Enter email subject...", value: formData.subject, onChange: function (e) { return handleInputChange("subject", e.target.value); } }))),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, null,
                                    formData.type === "email" ? "Email Body" : "Message",
                                    " *"),
                                formData.type === "email" ? (react_1["default"].createElement(tabs_1.Tabs, { value: editorMode, onValueChange: function (val) { return setEditorMode(val); }, className: "w-full" },
                                    react_1["default"].createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-3" },
                                        react_1["default"].createElement(tabs_1.TabsTrigger, { value: "block", className: "flex gap-2" },
                                            react_1["default"].createElement(lucide_react_1.Code, { className: "h-4 w-4" }),
                                            "Blocks"),
                                        react_1["default"].createElement(tabs_1.TabsTrigger, { value: "richtext", className: "flex gap-2" },
                                            react_1["default"].createElement(lucide_react_1.Code, { className: "h-4 w-4" }),
                                            "Rich Text"),
                                        react_1["default"].createElement(tabs_1.TabsTrigger, { value: "html", className: "flex gap-2" },
                                            react_1["default"].createElement(lucide_react_1.Code, { className: "h-4 w-4" }),
                                            "HTML")),
                                    react_1["default"].createElement(tabs_1.TabsContent, { value: "block", className: "mt-4" },
                                        react_1["default"].createElement(DocumentBlockEditor_1["default"], { value: formData.body, onChange: function (html) { return handleInputChange("body", html); }, placeholder: "Design your email message using blocks...", minHeight: "300px" })),
                                    react_1["default"].createElement(tabs_1.TabsContent, { value: "richtext", className: "mt-4" },
                                        react_1["default"].createElement(RichTextEditor_1.RichTextEditor, { value: formData.body, onChange: function (html) { return handleInputChange("body", html); }, placeholder: "Enter your email message here...", minHeight: "300px", enhanced: true })),
                                    react_1["default"].createElement(tabs_1.TabsContent, { value: "html", className: "mt-4" },
                                        react_1["default"].createElement(HTMLEditor_1["default"], { value: formData.body, onChange: function (html) { return handleInputChange("body", html); }, placeholder: "Enter HTML email content...", minHeight: "300px", height: "400px" })))) : (react_1["default"].createElement(textarea_1.Textarea, { placeholder: "Enter your SMS message here (160 characters)...", value: formData.body, onChange: function (e) { return handleInputChange("body", e.target.value); }, rows: 8, maxLength: 160 })),
                                formData.type === "sms" && (react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" },
                                    formData.body.length,
                                    "/160 characters")))),
                        react_1["default"].createElement("div", { className: "space-y-4 border-t pt-4" },
                            react_1["default"].createElement("h3", { className: "font-semibold" }, "Quick Templates"),
                            react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Choose a template to auto-fill the message. Templates are filtered by communication type."),
                            react_1["default"].createElement(TemplateSelector, { commType: formData.type, onSelect: function (template) {
                                    handleInputChange("body", template.body);
                                    if (formData.type === "email" && template.subject) {
                                        handleInputChange("subject", template.subject);
                                    }
                                    sonner_1.toast.success("Template \"" + template.name + "\" applied");
                                } })),
                        react_1["default"].createElement("div", { className: "flex gap-4 justify-end border-t pt-6" },
                            react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return navigate("/communications"); } }, "Cancel"),
                            react_1["default"].createElement(button_1.Button, { type: "submit", disabled: loading, className: "flex items-center gap-2" },
                                getTypeIcon(formData.type),
                                loading ? "Sending..." : "Send Communication"))))))));
}
exports["default"] = CreateCommunication;
