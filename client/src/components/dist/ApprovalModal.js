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
exports.ApprovalModal = void 0;
var react_1 = require("react");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var textarea_1 = require("@/components/ui/textarea");
var label_1 = require("@/components/ui/label");
var lucide_react_1 = require("lucide-react");
function ApprovalModal(_a) {
    var _this = this;
    var isOpen = _a.isOpen, title = _a.title, description = _a.description, entityName = _a.entityName, _b = _a.isLoading, isLoading = _b === void 0 ? false : _b, onApprove = _a.onApprove, onCancel = _a.onCancel;
    var _c = react_1.useState(""), notes = _c[0], setNotes = _c[1];
    var handleApprove = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, onApprove(notes)];
                case 1:
                    _a.sent();
                    setNotes("");
                    return [2 /*return*/];
            }
        });
    }); };
    var handleCancel = function () {
        setNotes("");
        onCancel();
    };
    return (react_1["default"].createElement(alert_dialog_1.AlertDialog, { open: isOpen, onOpenChange: function (open) { return !open && handleCancel(); } },
        react_1["default"].createElement(alert_dialog_1.AlertDialogContent, null,
            react_1["default"].createElement(alert_dialog_1.AlertDialogHeader, null,
                react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                    react_1["default"].createElement(lucide_react_1.CheckCircle2, { className: "h-5 w-5 text-green-600" }),
                    react_1["default"].createElement(alert_dialog_1.AlertDialogTitle, null, title)),
                react_1["default"].createElement(alert_dialog_1.AlertDialogDescription, null, description)),
            react_1["default"].createElement("div", { className: "space-y-4 py-2" },
                react_1["default"].createElement("div", { className: "p-3 bg-blue-50 border border-blue-200 rounded flex gap-2" },
                    react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" }),
                    react_1["default"].createElement("p", { className: "text-sm text-blue-700" },
                        "You are about to approve ",
                        react_1["default"].createElement("strong", null, entityName),
                        ". This action will update its status and cannot be easily reverted.")),
                react_1["default"].createElement("div", { className: "space-y-2" },
                    react_1["default"].createElement(label_1.Label, { htmlFor: "approval-notes" }, "Approval Notes (Optional)"),
                    react_1["default"].createElement(textarea_1.Textarea, { id: "approval-notes", placeholder: "Add any notes about this approval...", value: notes, onChange: function (e) { return setNotes(e.target.value); }, rows: 3, disabled: isLoading }))),
            react_1["default"].createElement(alert_dialog_1.AlertDialogFooter, null,
                react_1["default"].createElement(alert_dialog_1.AlertDialogCancel, { disabled: isLoading, onClick: handleCancel }, "Cancel"),
                react_1["default"].createElement(alert_dialog_1.AlertDialogAction, { onClick: handleApprove, disabled: isLoading, className: "hover:opacity-90", style: { background: 'var(--success)', color: 'var(--success-foreground)' } },
                    isLoading && react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                    isLoading ? "Approving..." : "Approve")))));
}
exports.ApprovalModal = ApprovalModal;
