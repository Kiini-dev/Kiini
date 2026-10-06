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
var wouter_1 = require("wouter");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var mutationHelpers_1 = require("@/lib/mutationHelpers");
var actions_1 = require("@/lib/actions");
var sonner_1 = require("sonner");
function ProposalDetails() {
    var _this = this;
    var id = wouter_1.useParams().id;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = react_1.useState(false), isDeleting = _b[0], setIsDeleting = _b[1];
    var _c = trpc_1.trpc.opportunities.getById.useQuery(id || "", {
        enabled: !!id
    }), proposal = _c.data, isLoading = _c.isLoading;
    var deleteMutation = trpc_1.trpc.opportunities["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Opportunity deleted successfully");
            navigate("/opportunities");
        },
        onError: function () { return sonner_1.toast.error("Failed to delete opportunity"); },
        onSettled: function () { return setIsDeleting(false); }
    });
    var handleEdit = function () {
        navigate("/opportunities/" + id + "/edit");
    };
    var onDelete = function () { return __awaiter(_this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsDeleting(true);
                    return [4 /*yield*/, actions_1.handleDelete(id || "", "opportunity", function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, mutationHelpers_1["default"](deleteMutation, id || "")];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        }); }); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var handleDownload = function () { return actions_1.handleDownload(id || "", "proposal", "pdf", proposal); };
    var handleEmail = function () {
        if (proposal) {
            actions_1.handleEmail(id || "", "proposal", proposal.clientId || "Unknown", proposal);
        }
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Proposal Details", icon: React.createElement(lucide_react_1.FileText, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Proposals", href: "/proposals" },
            { label: "Details" },
        ], backLink: { label: "Proposals", href: "/proposals" } },
        React.createElement("div", { className: "space-y-6" }, isLoading ? (React.createElement("div", { className: "flex items-center justify-center p-8" },
            React.createElement("p", { className: "text-muted-foreground" }, "Loading opportunity details..."))) : !proposal ? (React.createElement("div", { className: "flex items-center justify-center p-8" },
            React.createElement("p", { className: "text-muted-foreground" }, "Opportunity not found"))) : (React.createElement(React.Fragment, null,
            React.createElement("div", { className: "flex gap-2" },
                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleDownload },
                    React.createElement(lucide_react_1.Download, { className: "mr-2 h-4 w-4" }),
                    "Download"),
                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleEmail },
                    React.createElement(lucide_react_1.Send, { className: "mr-2 h-4 w-4" }),
                    "Send"),
                React.createElement(button_1.Button, { onClick: handleEdit },
                    React.createElement(lucide_react_1.Edit, { className: "mr-2 h-4 w-4" }),
                    "Edit"),
                React.createElement(button_1.Button, { variant: "destructive", onClick: onDelete, disabled: isDeleting },
                    React.createElement(lucide_react_1.Trash2, { className: "mr-2 h-4 w-4" }),
                    "Delete")),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Opportunity Information")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Title"),
                            React.createElement("p", { className: "text-muted-foreground" }, proposal.title)),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Client ID"),
                            React.createElement("p", { className: "text-muted-foreground" }, proposal.clientId)),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Amount"),
                            React.createElement("p", { className: "text-muted-foreground" },
                                "KES ",
                                (proposal.amount || proposal.value || 0).toLocaleString())),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Status"),
                            React.createElement(badge_1.Badge, null, proposal.status || proposal.stage || 'unknown')),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Created Date"),
                            React.createElement("p", { className: "text-muted-foreground" }, proposal.createdAt ? new Date(proposal.createdAt).toLocaleDateString() : 'N/A')),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Valid Until"),
                            React.createElement("p", { className: "text-muted-foreground" }, proposal.validUntil || proposal.expectedCloseDate ? new Date(proposal.validUntil || proposal.expectedCloseDate).toLocaleDateString() : 'N/A'))))),
            proposal.description && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Description")),
                React.createElement(card_1.CardContent, null,
                    React.createElement(RichTextEditor_1.RichTextDisplay, { html: proposal.description })))),
            proposal.notes && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Notes")),
                React.createElement(card_1.CardContent, null,
                    React.createElement(RichTextEditor_1.RichTextDisplay, { html: proposal.notes })))))))));
}
exports["default"] = ProposalDetails;
