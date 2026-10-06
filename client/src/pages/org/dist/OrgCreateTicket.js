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
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgBreadcrumb_1 = require("@/components/OrgBreadcrumb");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
var trpc_1 = require("@/lib/trpc");
var useOrgPermission_1 = require("@/hooks/useOrgPermission");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
function OrgCreateTicket() {
    var _this = this;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var _b = useOrgPermission_1.useOrgPermission(), checkPermission = _b.checkPermission, hasPermission = _b.hasPermission;
    var _c = react_1.useState({
        clientId: "",
        title: "",
        description: "",
        category: "",
        priority: "medium",
        requestedDueDate: ""
    }), form = _c[0], setForm = _c[1];
    var _d = react_1.useState(false), isSubmitting = _d[0], setIsSubmitting = _d[1];
    // Fetch clients for dropdown
    var _e = trpc_1.trpc.clients.list.useQuery(undefined, {
        enabled: hasPermission("org:clients:view")
    }).data, clients = _e === void 0 ? [] : _e;
    var createMutation = trpc_1.trpc.tickets.create.useMutation({
        onSuccess: function (data) {
            sonner_1.toast.success("Ticket created", { description: "Ticket has been created successfully." });
            setLocation("/org/" + slug + "/tickets");
        },
        onError: function (err) {
            sonner_1.toast.error("Failed to create ticket", { description: err.message });
            setIsSubmitting(false);
        }
    });
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            e.preventDefault();
            if (!checkPermission("org:tickets:create", "create tickets")) {
                return [2 /*return*/];
            }
            if (!form.clientId || !form.title) {
                sonner_1.toast.error("Missing required fields", { description: "Client and title are required." });
                return [2 /*return*/];
            }
            if (form.title.length < 3) {
                sonner_1.toast.error("Invalid title", { description: "Title must be at least 3 characters long." });
                return [2 /*return*/];
            }
            setIsSubmitting(true);
            createMutation.mutate({
                clientId: form.clientId,
                title: form.title,
                description: form.description || undefined,
                category: form.category || undefined,
                priority: form.priority,
                requestedDueDate: form.requestedDueDate || undefined
            });
            return [2 /*return*/];
        });
    }); };
    if (!hasPermission("org:tickets:create")) {
        return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Create Ticket", showOrgInfo: false },
            react_1["default"].createElement("div", { className: "space-y-6" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                    react_1["default"].createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [{ label: "Tickets", href: "/org/" + slug + "/tickets" }, { label: "Create Ticket" }] }),
                    react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-white/50 hover:text-white", onClick: function () { return setLocation("/org/" + slug + "/dashboard"); } },
                        react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-1" }),
                        " Back")),
                react_1["default"].createElement("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-10 text-center" },
                    react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "mx-auto h-12 w-12 text-white/30" }),
                    react_1["default"].createElement("h2", { className: "mt-5 text-xl font-semibold text-white" }, "Access Denied"),
                    react_1["default"].createElement("p", { className: "mt-2 text-sm text-white/60" }, "You do not have permission to create tickets.")))));
    }
    return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Create Ticket", showOrgInfo: false },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [
                            { label: "Tickets", href: "/org/" + slug + "/tickets" },
                            { label: "Create Ticket" },
                        ] })),
                react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-white/50 hover:text-white", onClick: function () { return setLocation("/org/" + slug + "/tickets"); } },
                    react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-1" }),
                    " Back to Tickets")),
            react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, { className: "text-white flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-5 w-5" }),
                        "New Ticket"),
                    react_1["default"].createElement(card_1.CardDescription, { className: "text-white/60" }, "Create a new support ticket for your organization")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                        react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "clientId", className: "text-white" }, "Client *"),
                                react_1["default"].createElement(select_1.Select, { value: form.clientId, onValueChange: function (value) { return setForm(__assign(__assign({}, form), { clientId: value })); } },
                                    react_1["default"].createElement(select_1.SelectTrigger, { className: "bg-white/5 border-white/10 text-white" },
                                        react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select client" })),
                                    react_1["default"].createElement(select_1.SelectContent, null, clients.map(function (client) { return (react_1["default"].createElement(select_1.SelectItem, { key: client.id, value: client.id }, client.name)); })))),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "priority", className: "text-white" }, "Priority"),
                                react_1["default"].createElement(select_1.Select, { value: form.priority, onValueChange: function (value) { return setForm(__assign(__assign({}, form), { priority: value })); } },
                                    react_1["default"].createElement(select_1.SelectTrigger, { className: "bg-white/5 border-white/10 text-white" },
                                        react_1["default"].createElement(select_1.SelectValue, null)),
                                    react_1["default"].createElement(select_1.SelectContent, null,
                                        react_1["default"].createElement(select_1.SelectItem, { value: "low" }, "Low"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "medium" }, "Medium"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "high" }, "High")))),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "category", className: "text-white" }, "Category"),
                                react_1["default"].createElement(select_1.Select, { value: form.category, onValueChange: function (value) { return setForm(__assign(__assign({}, form), { category: value })); } },
                                    react_1["default"].createElement(select_1.SelectTrigger, { className: "bg-white/5 border-white/10 text-white" },
                                        react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select category" })),
                                    react_1["default"].createElement(select_1.SelectContent, null,
                                        react_1["default"].createElement(select_1.SelectItem, { value: "technical" }, "Technical"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "billing" }, "Billing"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "feature_request" }, "Feature Request"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "bug" }, "Bug Report"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "general" }, "General"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "other" }, "Other")))),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "requestedDueDate", className: "text-white" }, "Requested Due Date"),
                                react_1["default"].createElement(input_1.Input, { id: "requestedDueDate", type: "date", value: form.requestedDueDate, onChange: function (e) { return setForm(__assign(__assign({}, form), { requestedDueDate: e.target.value })); }, className: "bg-white/5 border-white/10 text-white" }))),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "title", className: "text-white" }, "Title *"),
                            react_1["default"].createElement(input_1.Input, { id: "title", value: form.title, onChange: function (e) { return setForm(__assign(__assign({}, form), { title: e.target.value })); }, className: "bg-white/5 border-white/10 text-white", placeholder: "Brief description of the issue", required: true })),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "description", className: "text-white" }, "Description"),
                            react_1["default"].createElement(textarea_1.Textarea, { id: "description", value: form.description, onChange: function (e) { return setForm(__assign(__assign({}, form), { description: e.target.value })); }, className: "bg-white/5 border-white/10 text-white min-h-[120px]", placeholder: "Detailed description of the issue or request..." })),
                        react_1["default"].createElement("div", { className: "flex justify-end gap-3 pt-6" },
                            react_1["default"].createElement(button_1.Button, { type: "button", variant: "ghost", onClick: function () { return setLocation("/org/" + slug + "/tickets"); }, className: "text-white/50 hover:text-white" }, "Cancel"),
                            react_1["default"].createElement(button_1.Button, { type: "submit", disabled: isSubmitting, className: "bg-blue-600 hover:bg-blue-700 text-white" }, isSubmitting ? "Creating..." : "Create Ticket"))))))));
}
exports["default"] = OrgCreateTicket;
