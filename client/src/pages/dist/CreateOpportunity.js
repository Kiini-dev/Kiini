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
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var card_1 = require("@/components/ui/card");
var separator_1 = require("@/components/ui/separator");
var select_1 = require("@/components/ui/select");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var currency_1 = require("@/lib/currency");
var SOURCES = [
    "Referral",
    "Website / SEO",
    "Cold Call",
    "Social Media",
    "Email Campaign",
    "Exhibition / Event",
    "Walk-in",
    "Partner",
    "Tender / RFQ",
    "Other",
];
var STAGE_PROBABILITY = {
    lead: 10,
    qualified: 30,
    proposal: 50,
    negotiation: 75,
    closed_won: 100,
    closed_lost: 0
};
function CreateOpportunity() {
    var _a, _b, _c, _d;
    var currencyCode = currency_1.useCurrencySettings().code;
    var _e = wouter_1.useLocation(), navigate = _e[1];
    var utils = trpc_1.trpc.useUtils();
    var _f = react_1.useState({
        clientId: "",
        title: "",
        description: "",
        companyRevenue: "",
        decisionMaker: "",
        competitorInfo: "",
        value: "",
        stage: "lead",
        probability: "10",
        currency: currencyCode,
        expectedCloseDate: "",
        actualCloseDate: "",
        nextFollowUpDate: "",
        assignedTo: "",
        source: "",
        campaignName: "",
        referredBy: "",
        winReason: "",
        lossReason: "",
        notes: "",
        internalNotes: ""
    }), formData = _f[0], setFormData = _f[1];
    var _g = trpc_1.trpc.clients.list.useQuery({}).data, clients = _g === void 0 ? [] : _g;
    var _h = trpc_1.trpc.users.list.useQuery({}).data, usersData = _h === void 0 ? [] : _h;
    var teamMembers = Array.isArray(usersData) ? usersData : (_b = (_a = usersData) === null || _a === void 0 ? void 0 : _a.users) !== null && _b !== void 0 ? _b : [];
    var clientsArr = Array.isArray(clients) ? clients : (_d = (_c = clients) === null || _c === void 0 ? void 0 : _c.items) !== null && _d !== void 0 ? _d : [];
    var createMutation = trpc_1.trpc.opportunities.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Opportunity created successfully!");
            utils.opportunities.list.invalidate();
            navigate("/opportunities");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to create opportunity: " + error.message);
        }
    });
    var isClosed = formData.stage === "closed_won" || formData.stage === "closed_lost";
    var handleStageChange = function (stage) {
        var _a;
        setFormData(__assign(__assign({}, formData), { stage: stage, probability: String((_a = STAGE_PROBABILITY[stage]) !== null && _a !== void 0 ? _a : formData.probability) }));
    };
    var set = function (field) { return function (e) {
        var _a;
        return setFormData(__assign(__assign({}, formData), (_a = {}, _a[field] = e.target.value, _a)));
    }; };
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!formData.clientId || !formData.title || !formData.value) {
            sonner_1.toast.error("Client, Title and Value are required");
            return;
        }
        createMutation.mutate({
            clientId: formData.clientId,
            title: formData.title,
            description: formData.description || undefined,
            value: Math.round(parseFloat(formData.value) * 100),
            stage: formData.stage,
            probability: formData.probability ? parseInt(formData.probability) : undefined,
            expectedCloseDate: formData.expectedCloseDate ? new Date(formData.expectedCloseDate) : undefined,
            actualCloseDate: formData.actualCloseDate ? new Date(formData.actualCloseDate) : undefined,
            assignedTo: formData.assignedTo || undefined,
            source: formData.source || undefined,
            notes: formData.notes || undefined,
            winReason: formData.winReason || undefined,
            lossReason: formData.lossReason || undefined
        });
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Create Opportunity", description: "Track a new sales opportunity through your pipeline", icon: React.createElement(lucide_react_1.Plus, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Opportunities", href: "/opportunities" },
            { label: "Create" },
        ], backLink: { label: "Opportunities", href: "/opportunities" } },
        React.createElement("div", { className: "space-y-6 max-w-5xl" },
            React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2 text-base" },
                            React.createElement(lucide_react_1.Target, { className: "h-4 w-4" }),
                            "Opportunity Details")),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null,
                                "Client ",
                                React.createElement("span", { className: "text-destructive" }, "*")),
                            React.createElement(select_1.Select, { value: formData.clientId, onValueChange: function (v) { return setFormData(__assign(__assign({}, formData), { clientId: v })); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, { placeholder: "Select a client" })),
                                React.createElement(select_1.SelectContent, { className: "max-h-60 overflow-y-auto" }, clientsArr.map(function (c) { return (React.createElement(select_1.SelectItem, { key: c.id, value: c.id }, c.companyName || c.contactPerson)); })))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null,
                                "Opportunity Title ",
                                React.createElement("span", { className: "text-destructive" }, "*")),
                            React.createElement(input_1.Input, { value: formData.title, onChange: set("title"), placeholder: "e.g., Website Redesign for Acme Corp" })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null, "Brief Description / Scope"),
                            React.createElement(RichTextEditor_1.RichTextEditor, { value: formData.description, onChange: function (v) { return setFormData(__assign(__assign({}, formData), { description: v })); }, placeholder: "Describe the opportunity, client needs, and scope of work...", minHeight: "120px" })),
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Key Decision Maker"),
                                React.createElement(input_1.Input, { value: formData.decisionMaker, onChange: set("decisionMaker"), placeholder: "Name and title of decision maker" })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Client Annual Revenue (KES)"),
                                React.createElement(input_1.Input, { type: "number", value: formData.companyRevenue, onChange: set("companyRevenue"), placeholder: "Estimated client revenue", min: "0" }))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null, "Competitor / Alternative Solutions"),
                            React.createElement(input_1.Input, { value: formData.competitorInfo, onChange: set("competitorInfo"), placeholder: "e.g., Zoho CRM, Salesforce, in-house system" })))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2 text-base" },
                            React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4" }),
                            "Deal Value & Pipeline Stage")),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null,
                                    "Deal Value ",
                                    React.createElement("span", { className: "text-destructive" }, "*")),
                                React.createElement(input_1.Input, { type: "number", value: formData.value, onChange: set("value"), placeholder: "0.00", min: "0", step: "0.01" })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Currency"),
                                React.createElement(select_1.Select, { value: formData.currency, onValueChange: function (v) { return setFormData(__assign(__assign({}, formData), { currency: v })); } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "KES" }, "KES \u2013 Kenyan Shilling"),
                                        React.createElement(select_1.SelectItem, { value: "USD" }, "USD \u2013 US Dollar"),
                                        React.createElement(select_1.SelectItem, { value: "EUR" }, "EUR \u2013 Euro"),
                                        React.createElement(select_1.SelectItem, { value: "GBP" }, "GBP \u2013 British Pound"),
                                        React.createElement(select_1.SelectItem, { value: "UGX" }, "UGX \u2013 Ugandan Shilling"),
                                        React.createElement(select_1.SelectItem, { value: "TZS" }, "TZS \u2013 Tanzanian Shilling")))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null,
                                    "Pipeline Stage ",
                                    React.createElement("span", { className: "text-destructive" }, "*")),
                                React.createElement(select_1.Select, { value: formData.stage, onValueChange: handleStageChange },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "lead" }, "\uD83D\uDD35 Lead"),
                                        React.createElement(select_1.SelectItem, { value: "qualified" }, "\uD83D\uDFE2 Qualified"),
                                        React.createElement(select_1.SelectItem, { value: "proposal" }, "\uD83D\uDFE1 Proposal Sent"),
                                        React.createElement(select_1.SelectItem, { value: "negotiation" }, "\uD83D\uDFE0 Negotiation"),
                                        React.createElement(select_1.SelectItem, { value: "closed_won" }, "\u2705 Closed Won"),
                                        React.createElement(select_1.SelectItem, { value: "closed_lost" }, "\u274C Closed Lost"))))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null,
                                "Win Probability: ",
                                formData.probability,
                                "%"),
                            React.createElement("input", { type: "range", min: "0", max: "100", value: formData.probability, onChange: set("probability"), className: "w-full accent-primary", "aria-label": "Win probability percentage", title: "Win probability percentage" }),
                            React.createElement("div", { className: "flex justify-between text-xs text-muted-foreground" },
                                React.createElement("span", null, "0% \u2013 Very unlikely"),
                                React.createElement("span", null, "50% \u2013 Even odds"),
                                React.createElement("span", null, "100% \u2013 Certain"))),
                        isClosed && (React.createElement(React.Fragment, null,
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, formData.stage === "closed_won" ? "Win Reason" : "Loss Reason"),
                                React.createElement(textarea_1.Textarea, { value: formData.stage === "closed_won" ? formData.winReason : formData.lossReason, onChange: formData.stage === "closed_won"
                                        ? function (e) { return setFormData(__assign(__assign({}, formData), { winReason: e.target.value })); }
                                        : function (e) { return setFormData(__assign(__assign({}, formData), { lossReason: e.target.value })); }, placeholder: formData.stage === "closed_won"
                                        ? "What factors contributed to winning this deal? (price, relationship, features...)"
                                        : "Why was this deal lost? (lost to competitor, budget constraints, no decision...)", rows: 3 })))))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2 text-base" },
                            React.createElement(lucide_react_1.Calendar, { className: "h-4 w-4" }),
                            "Timeline & Follow-up")),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Expected Close Date"),
                                React.createElement(input_1.Input, { type: "date", value: formData.expectedCloseDate, onChange: set("expectedCloseDate") })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Actual Close Date"),
                                React.createElement(input_1.Input, { type: "date", value: formData.actualCloseDate, onChange: set("actualCloseDate") }),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Fill when deal is closed")),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Next Follow-up Date"),
                                React.createElement(input_1.Input, { type: "date", value: formData.nextFollowUpDate, onChange: set("nextFollowUpDate") }))))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2 text-base" },
                            React.createElement(lucide_react_1.Briefcase, { className: "h-4 w-4" }),
                            "Lead Source & Marketing")),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Lead Source"),
                                React.createElement(select_1.Select, { value: formData.source, onValueChange: function (v) { return setFormData(__assign(__assign({}, formData), { source: v })); } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "How did this lead come in?" })),
                                    React.createElement(select_1.SelectContent, { className: "max-h-56 overflow-y-auto" }, SOURCES.map(function (s) { return (React.createElement(select_1.SelectItem, { key: s, value: s }, s)); })))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Campaign / Marketing Initiative"),
                                React.createElement(input_1.Input, { value: formData.campaignName, onChange: set("campaignName"), placeholder: "e.g., Q1 2025 Email Campaign" }))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null, "Referred By"),
                            React.createElement(input_1.Input, { value: formData.referredBy, onChange: set("referredBy"), placeholder: "Name of the person or company that referred this lead" })))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2 text-base" },
                            React.createElement(lucide_react_1.Users, { className: "h-4 w-4" }),
                            "Team Assignment & Notes")),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null, "Assigned Sales Rep"),
                            React.createElement(select_1.Select, { value: formData.assignedTo, onValueChange: function (v) { return setFormData(__assign(__assign({}, formData), { assignedTo: v })); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, { placeholder: "Select team member" })),
                                React.createElement(select_1.SelectContent, { className: "max-h-56 overflow-y-auto" },
                                    React.createElement(select_1.SelectItem, { value: "unassigned" }, "\u2014 Unassigned \u2014"),
                                    teamMembers.map(function (u) { return (React.createElement(select_1.SelectItem, { key: u.id, value: u.id }, u.name || u.email)); })))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null, "Client-Facing Notes"),
                            React.createElement(RichTextEditor_1.RichTextEditor, { value: formData.notes, onChange: function (v) { return setFormData(__assign(__assign({}, formData), { notes: v })); }, placeholder: "Notes visible in proposals, reports, or shared with client...", minHeight: "100px" })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null, "Internal Notes"),
                            React.createElement(RichTextEditor_1.RichTextEditor, { value: formData.internalNotes, onChange: function (v) { return setFormData(__assign(__assign({}, formData), { internalNotes: v })); }, placeholder: "Internal notes, next steps, action items, objections raised...", minHeight: "120px" })))),
                React.createElement("div", { className: "flex gap-3 justify-between pb-8" },
                    React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return navigate("/opportunities"); } },
                        React.createElement(ArrowLeft, { className: "h-4 w-4 mr-2" }),
                        "Cancel"),
                    React.createElement(button_1.Button, { type: "submit", disabled: createMutation.isPending, size: "lg" },
                        React.createElement(lucide_react_1.Save, { className: "h-4 w-4 mr-2" }),
                        createMutation.isPending ? "Creating..." : "Create Opportunity"))))));
}
exports["default"] = CreateOpportunity;
