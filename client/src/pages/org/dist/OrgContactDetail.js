"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgBreadcrumb_1 = require("@/components/OrgBreadcrumb");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var skeleton_1 = require("@/components/ui/skeleton");
var trpc_1 = require("@/lib/trpc");
var useOrgPermission_1 = require("@/hooks/useOrgPermission");
var lucide_react_1 = require("lucide-react");
function OrgContactDetail() {
    var params = wouter_1.useParams();
    var slug = params.slug;
    var contactId = params.id;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var checkPermission = useOrgPermission_1.useOrgPermission().checkPermission;
    var _b = trpc_1.trpc.contacts.getById.useQuery(contactId, {
        enabled: !!contactId && checkPermission("crm:contacts:view")
    }), contact = _b.data, isLoading = _b.isLoading;
    var handleEdit = function () {
        setLocation("/org/" + slug + "/contacts/" + contactId + "/edit");
    };
    var handleBack = function () {
        setLocation("/org/" + slug + "/contacts");
    };
    if (isLoading) {
        return (react_1["default"].createElement(OrgLayout_1["default"], { slug: slug },
            react_1["default"].createElement("div", { className: "space-y-4 p-6" },
                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-10 w-1/4" }),
                react_1["default"].createElement("div", { className: "space-y-2" }, __spreadArrays(Array(5)).map(function (_, i) { return (react_1["default"].createElement(skeleton_1.Skeleton, { key: i, className: "h-12 w-full" })); })))));
    }
    if (!contact) {
        return (react_1["default"].createElement(OrgLayout_1["default"], { slug: slug },
            react_1["default"].createElement("div", { className: "p-6" },
                react_1["default"].createElement("div", { className: "text-center text-red-400" }, "Contact not found"))));
    }
    return (react_1["default"].createElement(OrgLayout_1["default"], { slug: slug },
        react_1["default"].createElement("div", { className: "p-6 space-y-6" },
            react_1["default"].createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [
                    { label: "Contacts", href: "/org/" + slug + "/contacts" },
                    { label: contact.name || "Contact #" + contactId },
                ] }),
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement("div", { className: "flex items-center gap-3" },
                    react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: handleBack },
                        react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4" })),
                    react_1["default"].createElement("h1", { className: "text-3xl font-bold" }, contact.name || "Contact Details")),
                checkPermission("crm:contacts:edit") && (react_1["default"].createElement(button_1.Button, { onClick: handleEdit, className: "gap-2" },
                    react_1["default"].createElement(lucide_react_1.Edit2, { className: "h-4 w-4" }),
                    "Edit Contact"))),
            react_1["default"].createElement("div", { className: "grid gap-6 md:grid-cols-3" },
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-400" }, "Email")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                            react_1["default"].createElement(lucide_react_1.Mail, { className: "h-4 w-4 text-blue-500" }),
                            react_1["default"].createElement("a", { href: "mailto:" + contact.email, className: "text-sm hover:underline" }, contact.email || "N/A")))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-400" }, "Phone")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                            react_1["default"].createElement(lucide_react_1.Phone, { className: "h-4 w-4 text-green-500" }),
                            react_1["default"].createElement("a", { href: "tel:" + contact.phone, className: "text-sm hover:underline" }, contact.phone || "N/A")))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-400" }, "Company")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                            react_1["default"].createElement(lucide_react_1.Building2, { className: "h-4 w-4 text-purple-500" }),
                            react_1["default"].createElement("span", { className: "text-sm" }, contact.company || "N/A"))))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, null, "Contact Information")),
                react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                    react_1["default"].createElement("div", { className: "grid gap-4" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "text-xs font-medium text-gray-400" }, "Title"),
                            react_1["default"].createElement("p", { className: "text-sm" }, contact.title || "N/A")),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "text-xs font-medium text-gray-400" }, "Department"),
                            react_1["default"].createElement("p", { className: "text-sm" }, contact.department || "N/A")),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "text-xs font-medium text-gray-400" }, "Notes"),
                            react_1["default"].createElement("p", { className: "text-sm" }, contact.notes || "No notes"))))))));
}
exports["default"] = OrgContactDetail;
