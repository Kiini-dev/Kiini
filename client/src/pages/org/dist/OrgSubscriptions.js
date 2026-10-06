"use strict";
exports.__esModule = true;
var wouter_1 = require("wouter");
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgBreadcrumb_1 = require("@/components/OrgBreadcrumb");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
function OrgSubscriptions() {
    var params = wouter_1.useParams();
    var slug = params.slug;
    return (React.createElement(OrgLayout_1["default"], null,
        React.createElement(OrgBreadcrumb_1["default"], { items: [{ label: "Dashboard", href: "/org/" + slug + "/dashboard" }, { label: "Subscriptions", href: "/org/" + slug + "/subscriptions" }] }),
        React.createElement("div", { className: "p-6 space-y-6" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", null,
                    React.createElement("h1", { className: "text-3xl font-bold" }, "Subscriptions"),
                    React.createElement("p", { className: "text-muted-foreground mt-2" }, "Manage your subscriptions")),
                React.createElement(button_1.Button, null,
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                    "New Subscription")),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "All Subscriptions")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "text-center py-8 text-muted-foreground" },
                        React.createElement(lucide_react_1.AlertCircle, { className: "h-8 w-8 mx-auto mb-2 opacity-50" }),
                        React.createElement("p", null, "No subscriptions found")))))));
}
exports["default"] = OrgSubscriptions;
