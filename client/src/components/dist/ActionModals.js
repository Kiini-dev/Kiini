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
exports.EditModal = exports.EmailModal = exports.DeleteModal = void 0;
var react_1 = require("react");
var dialog_1 = require("@/components/ui/dialog");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var const_1 = require("@/const");
function DeleteModal(_a) {
    var _this = this;
    var open = _a.open, onOpenChange = _a.onOpenChange, onConfirm = _a.onConfirm, itemType = _a.itemType, itemName = _a.itemName;
    var _b = react_1.useState(false), isDeleting = _b[0], setIsDeleting = _b[1];
    var handleDelete = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsDeleting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, onConfirm()];
                case 2:
                    _a.sent();
                    onOpenChange(false);
                    sonner_1.toast.success(itemType + " deleted successfully");
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    sonner_1.toast.error("Failed to delete " + itemType);
                    return [3 /*break*/, 5];
                case 4:
                    setIsDeleting(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement(alert_dialog_1.AlertDialog, { open: open, onOpenChange: onOpenChange },
        React.createElement(alert_dialog_1.AlertDialogContent, null,
            React.createElement(alert_dialog_1.AlertDialogHeader, null,
                React.createElement(alert_dialog_1.AlertDialogTitle, null, "Are you absolutely sure?"),
                React.createElement(alert_dialog_1.AlertDialogDescription, null,
                    "This action cannot be undone. This will permanently delete",
                    " ",
                    itemName ? "\"" + itemName + "\"" : "this " + itemType,
                    " from the system.")),
            React.createElement(alert_dialog_1.AlertDialogFooter, null,
                React.createElement(alert_dialog_1.AlertDialogCancel, { disabled: isDeleting }, "Cancel"),
                React.createElement(alert_dialog_1.AlertDialogAction, { onClick: handleDelete, disabled: isDeleting, className: "hover:opacity-90", style: { background: 'var(--destructive)', color: 'var(--destructive-foreground)' } }, isDeleting ? (React.createElement(React.Fragment, null,
                    React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                    "Deleting...")) : ("Delete"))))));
}
exports.DeleteModal = DeleteModal;
function EmailModal(_a) {
    var _this = this;
    var open = _a.open, onOpenChange = _a.onOpenChange, onSend = _a.onSend, itemType = _a.itemType, itemNumber = _a.itemNumber, _b = _a.defaultEmail, defaultEmail = _b === void 0 ? "" : _b;
    var _c = react_1.useState(defaultEmail), email = _c[0], setEmail = _c[1];
    // Company name from environment variable (VITE_APP_TITLE) or default
    var companyName = const_1.APP_TITLE || "Your Company";
    var _d = react_1.useState(itemType + " " + (itemNumber ? "#" + itemNumber : "") + " from " + companyName), subject = _d[0], setSubject = _d[1];
    var _e = react_1.useState("Dear valued client,\n\nPlease find attached your " + itemType.toLowerCase() + " " + (itemNumber ? "#" + itemNumber : "") + ".\n\nThank you for your business!\n\nBest regards,\n" + companyName + " Team"), message = _e[0], setMessage = _e[1];
    var _f = react_1.useState(false), isSending = _f[0], setIsSending = _f[1];
    var handleSend = function () { return __awaiter(_this, void 0, void 0, function () {
        var emailRegex, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!email) {
                        sonner_1.toast.error("Please enter an email address");
                        return [2 /*return*/];
                    }
                    emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(email)) {
                        sonner_1.toast.error("Please enter a valid email address");
                        return [2 /*return*/];
                    }
                    setIsSending(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, onSend(email, subject, message)];
                case 2:
                    _a.sent();
                    onOpenChange(false);
                    sonner_1.toast.success(itemType + " sent successfully to " + email);
                    // Reset form
                    setEmail(defaultEmail);
                    setSubject(itemType + " " + (itemNumber ? "#" + itemNumber : "") + " from " + companyName);
                    setMessage("Dear valued client,\n\nPlease find attached your " + itemType.toLowerCase() + " " + (itemNumber ? "#" + itemNumber : "") + ".\n\nThank you for your business!\n\nBest regards,\n" + companyName + " Team");
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    sonner_1.toast.error("Failed to send " + itemType);
                    return [3 /*break*/, 5];
                case 4:
                    setIsSending(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement(dialog_1.Dialog, { open: open, onOpenChange: onOpenChange },
        React.createElement(dialog_1.DialogContent, { className: "sm:max-w-[500px]" },
            React.createElement(dialog_1.DialogHeader, null,
                React.createElement(dialog_1.DialogTitle, null,
                    React.createElement(lucide_react_1.Mail, { className: "inline mr-2 h-5 w-5" }),
                    "Send ",
                    itemType,
                    " via Email"),
                React.createElement(dialog_1.DialogDescription, null,
                    "Send this ",
                    itemType.toLowerCase(),
                    " to your client via email")),
            React.createElement("div", { className: "space-y-4 py-4" },
                React.createElement("div", { className: "space-y-2" },
                    React.createElement(label_1.Label, { htmlFor: "email" }, "Recipient Email *"),
                    React.createElement(input_1.Input, { id: "email", type: "email", placeholder: "client@example.com", value: email, onChange: function (e) { return setEmail(e.target.value); }, disabled: isSending })),
                React.createElement("div", { className: "space-y-2" },
                    React.createElement(label_1.Label, { htmlFor: "subject" }, "Subject *"),
                    React.createElement(input_1.Input, { id: "subject", placeholder: "Email subject", value: subject, onChange: function (e) { return setSubject(e.target.value); }, disabled: isSending })),
                React.createElement("div", { className: "space-y-2" },
                    React.createElement(label_1.Label, { htmlFor: "message" }, "Message"),
                    React.createElement(textarea_1.Textarea, { id: "message", placeholder: "Email message", value: message, onChange: function (e) { return setMessage(e.target.value); }, rows: 6, disabled: isSending }))),
            React.createElement(dialog_1.DialogFooter, null,
                React.createElement(button_1.Button, { variant: "outline", onClick: function () { return onOpenChange(false); }, disabled: isSending }, "Cancel"),
                React.createElement(button_1.Button, { onClick: handleSend, disabled: isSending }, isSending ? (React.createElement(React.Fragment, null,
                    React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                    "Sending...")) : (React.createElement(React.Fragment, null,
                    React.createElement(lucide_react_1.Mail, { className: "mr-2 h-4 w-4" }),
                    "Send Email")))))));
}
exports.EmailModal = EmailModal;
function EditModal(_a) {
    var open = _a.open, onOpenChange = _a.onOpenChange, onSave = _a.onSave, itemType = _a.itemType, children = _a.children;
    var _b = react_1.useState(false), isSaving = _b[0], setIsSaving = _b[1];
    return (React.createElement(dialog_1.Dialog, { open: open, onOpenChange: onOpenChange },
        React.createElement(dialog_1.DialogContent, { className: "sm:max-w-[600px] max-h-[80vh] overflow-y-auto" },
            React.createElement(dialog_1.DialogHeader, null,
                React.createElement(dialog_1.DialogTitle, null,
                    "Edit ",
                    itemType),
                React.createElement(dialog_1.DialogDescription, null,
                    "Make changes to this ",
                    itemType.toLowerCase(),
                    ". Click save when you're done.")),
            children)));
}
exports.EditModal = EditModal;
