"use strict";
exports.__esModule = true;
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
function ContactDetails() {
    var params = wouter_1.useParams();
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var _b = trpc_1.trpc.contacts.getById.useQuery(params.id, {
        enabled: !!params.id
    }), contact = _b.data, isLoading = _b.isLoading;
    if (isLoading) {
        return (React.createElement("div", { className: "flex items-center justify-center min-h-[400px]" },
            React.createElement(lucide_react_1.Loader2, { className: "w-8 h-8 animate-spin text-muted-foreground" })));
    }
    if (!contact) {
        return (React.createElement("div", { className: "flex flex-col items-center justify-center min-h-[400px] gap-4" },
            React.createElement("p", { className: "text-muted-foreground" }, "Contact not found"),
            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setLocation("/contacts"); } },
                React.createElement(lucide_react_1.ArrowLeft, { className: "w-4 h-4 mr-2" }),
                " Back to Contacts")));
    }
    var fullName = [contact.salutation, contact.firstName, contact.lastName].filter(Boolean).join(" ");
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: fullName, description: "Contact Details", icon: React.createElement(lucide_react_1.User, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Contacts", href: "/contacts" },
            { label: fullName },
        ], actions: React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setLocation("/contacts"); } },
            React.createElement(lucide_react_1.ArrowLeft, { className: "w-4 h-4 mr-2" }),
            " Back") },
        React.createElement("div", { className: "max-w-4xl space-y-6" },
            React.createElement("div", { className: "flex items-center justify-between" },
                contact.isPrimary ? (React.createElement(badge_1.Badge, { className: "bg-blue-100 text-blue-800 text-sm px-3 py-1" }, "Primary Contact")) : (React.createElement(badge_1.Badge, { className: "bg-gray-100 text-gray-800 text-sm px-3 py-1" }, "Contact")),
                contact.createdAt && (React.createElement("span", { className: "text-sm text-muted-foreground" },
                    "Added ",
                    new Date(contact.createdAt).toLocaleDateString()))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-4" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.User, { className: "w-4 h-4 text-blue-600" }),
                        "Contact Information")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Full Name"),
                            React.createElement("p", { className: "font-medium" }, fullName)),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Job Title"),
                            React.createElement("p", { className: "font-medium" }, contact.jobTitle || "—")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground flex items-center gap-1" },
                                React.createElement(lucide_react_1.Building2, { className: "w-3 h-3" }),
                                " Department"),
                            React.createElement("p", { className: "font-medium" }, contact.department || "—"))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-4" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.Phone, { className: "w-4 h-4 text-green-600" }),
                        "Communication")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground flex items-center gap-1" },
                                React.createElement(lucide_react_1.Mail, { className: "w-3 h-3" }),
                                " Email"),
                            React.createElement("p", { className: "font-medium" }, contact.email ? (React.createElement("a", { href: "mailto:" + contact.email, className: "text-blue-600 hover:underline" }, contact.email)) : "—")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Phone"),
                            React.createElement("p", { className: "font-medium" }, contact.phone || "—")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Mobile"),
                            React.createElement("p", { className: "font-medium" }, contact.mobile || "—")),
                        contact.linkedIn && (React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "LinkedIn"),
                            React.createElement("a", { href: contact.linkedIn, target: "_blank", rel: "noopener noreferrer", className: "text-blue-600 hover:underline text-sm break-all" }, contact.linkedIn)))))),
            (contact.address || contact.city || contact.country) && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-4" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.MapPin, { className: "w-4 h-4 text-orange-600" }),
                        "Location")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                        contact.address && (React.createElement("div", { className: "md:col-span-2" },
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Address"),
                            React.createElement("p", { className: "font-medium" }, contact.address))),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "City"),
                            React.createElement("p", { className: "font-medium" }, contact.city || "—")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Country"),
                            React.createElement("p", { className: "font-medium" }, contact.country || "—")),
                        contact.postalCode && (React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Postal Code"),
                            React.createElement("p", { className: "font-medium" }, contact.postalCode))))))),
            contact.notes && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-4" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.StickyNote, { className: "w-4 h-4 text-purple-600" }),
                        "Notes")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("p", { className: "text-sm whitespace-pre-wrap" }, contact.notes)))))));
}
exports["default"] = ContactDetails;
