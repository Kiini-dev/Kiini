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
var separator_1 = require("@/components/ui/separator");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var DeleteConfirmationModal_1 = require("@/components/DeleteConfirmationModal");
var react_1 = require("react");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var mutationHelpers_1 = require("@/lib/mutationHelpers");
var RichTextEditor_1 = require("@/components/RichTextEditor");
function OpportunityDetails() {
    var _this = this;
    var id = wouter_1.useParams().id;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = react_1.useState(false), showDeleteModal = _b[0], setShowDeleteModal = _b[1];
    var _c = react_1.useState(false), isDeleting = _c[0], setIsDeleting = _c[1];
    var _d = trpc_1.trpc.opportunities.getById.useQuery(id || ""), opportunityData = _d.data, isLoading = _d.isLoading;
    var utils = trpc_1.trpc.useUtils();
    var deleteOpportunityMutation = trpc_1.trpc.opportunities["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Opportunity deleted successfully");
            utils.opportunities.list.invalidate();
            navigate("/opportunities");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete opportunity");
        }
    });
    var opportunity = opportunityData ? {
        id: opportunityData.id || id || "1",
        name: opportunityData.name || "Unknown Opportunity",
        client: opportunityData.clientId || "Unknown Client",
        value: (opportunityData.value || 0) / 100,
        stage: opportunityData.stage || "prospecting",
        probability: opportunityData.probability || 0,
        expectedClose: opportunityData.expectedCloseDate ? new Date(opportunityData.expectedCloseDate).toISOString().split('T')[0] : "",
        status: opportunityData.status || "active",
        owner: opportunityData.owner || "",
        source: opportunityData.source || "",
        notes: opportunityData.notes || ""
    } : null;
    var handleEdit = function () {
        navigate("/opportunities/" + id + "/edit");
    };
    var handleDelete = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsDeleting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, mutationHelpers_1["default"](deleteOpportunityMutation, id || "")];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    setIsDeleting(false);
                    setShowDeleteModal(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var getStageLabel = function (stage) {
        var labels = {
            prospecting: "Prospecting",
            qualification: "Qualification",
            proposal: "Proposal",
            negotiation: "Negotiation",
            closed_won: "Closed Won",
            closed_lost: "Closed Lost"
        };
        return labels[stage] || stage;
    };
    var getStageBadgeVariant = function (stage) {
        switch (stage) {
            case "closed_won": return "default";
            case "closed_lost": return "destructive";
            case "negotiation": return "secondary";
            default: return "outline";
        }
    };
    var getStageColor = function (stage) {
        switch (stage) {
            case "prospecting": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
            case "qualification": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
            case "proposal": return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
            case "negotiation": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
            case "closed_won": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
            case "closed_lost": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
            default: return "";
        }
    };
    if (isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Opportunity Details", icon: React.createElement(lucide_react_1.Target, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "Opportunities", href: "/opportunities" }, { label: "Details" }], backLink: { label: "Opportunities", href: "/opportunities" } },
            React.createElement("div", { className: "flex items-center justify-center h-64" },
                React.createElement("p", null, "Loading opportunity..."))));
    }
    if (!opportunity) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Opportunity Details", icon: React.createElement(lucide_react_1.Target, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "Opportunities", href: "/opportunities" }, { label: "Details" }], backLink: { label: "Opportunities", href: "/opportunities" } },
            React.createElement("div", { className: "flex flex-col items-center justify-center h-64 gap-4" },
                React.createElement("p", null, "Opportunity not found"),
                React.createElement(button_1.Button, { onClick: function () { return navigate("/opportunities"); } }, "Back to Opportunities"))));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Opportunity Details", icon: React.createElement(lucide_react_1.Target, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "Opportunities", href: "/opportunities" }, { label: "Details" }], backLink: { label: "Opportunities", href: "/opportunities" } },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "flex gap-2" },
                React.createElement(button_1.Button, { onClick: handleEdit },
                    React.createElement(lucide_react_1.Edit, { className: "mr-2 h-4 w-4" }),
                    "Edit"),
                React.createElement(button_1.Button, { variant: "destructive", onClick: function () { return setShowDeleteModal(true); } },
                    React.createElement(lucide_react_1.Trash2, { className: "mr-2 h-4 w-4" }),
                    "Delete")),
            React.createElement("div", { className: "flex flex-col lg:flex-row gap-6" },
                React.createElement("div", { className: "w-full lg:w-80 shrink-0 space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardContent, { className: "pt-6" },
                            React.createElement("div", { className: "flex flex-col items-center text-center space-y-3" },
                                React.createElement("h2", { className: "text-xl font-semibold" }, opportunity.name),
                                React.createElement(badge_1.Badge, { className: getStageColor(opportunity.stage) }, getStageLabel(opportunity.stage))),
                            React.createElement(separator_1.Separator, { className: "my-5" }),
                            React.createElement("div", { className: "space-y-4" },
                                React.createElement("div", { className: "flex items-center gap-3" },
                                    React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
                                    React.createElement("div", { className: "min-w-0" },
                                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "Value / Amount"),
                                        React.createElement("p", { className: "text-sm font-medium" },
                                            "Ksh ",
                                            (opportunity.value || 0).toLocaleString()))),
                                React.createElement("div", { className: "flex items-center gap-3" },
                                    React.createElement(lucide_react_1.Percent, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
                                    React.createElement("div", { className: "min-w-0" },
                                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "Probability"),
                                        React.createElement("p", { className: "text-sm font-medium" },
                                            opportunity.probability,
                                            "%"))),
                                React.createElement("div", { className: "flex items-center gap-3" },
                                    React.createElement(lucide_react_1.CalendarDays, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
                                    React.createElement("div", { className: "min-w-0" },
                                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "Close Date"),
                                        React.createElement("p", { className: "text-sm font-medium" }, opportunity.expectedClose || "Not set"))),
                                opportunity.owner && (React.createElement("div", { className: "flex items-center gap-3" },
                                    React.createElement(lucide_react_1.User, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
                                    React.createElement("div", { className: "min-w-0" },
                                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "Owner"),
                                        React.createElement("p", { className: "text-sm font-medium" }, opportunity.owner)))),
                                opportunity.source && (React.createElement("div", { className: "flex items-center gap-3" },
                                    React.createElement(lucide_react_1.Globe, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
                                    React.createElement("div", { className: "min-w-0" },
                                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "Source"),
                                        React.createElement("p", { className: "text-sm font-medium" }, opportunity.source)))))))),
                React.createElement("div", { className: "flex-1 min-w-0" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Description & Notes")),
                        React.createElement(card_1.CardContent, null, opportunity.notes ? (React.createElement(RichTextEditor_1.RichTextDisplay, { html: opportunity.notes, className: "text-sm text-muted-foreground" })) : (React.createElement("p", { className: "text-sm text-muted-foreground italic" }, "No notes added yet."))))))),
        React.createElement(DeleteConfirmationModal_1["default"], { isOpen: showDeleteModal, onCancel: function () { return setShowDeleteModal(false); }, onConfirm: handleDelete, isLoading: isDeleting, title: "Delete Opportunity", description: "Are you sure you want to delete this opportunity? This action cannot be undone." })));
}
exports["default"] = OpportunityDetails;
