"use strict";
exports.__esModule = true;
var wouter_1 = require("wouter");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
function UserDetails() {
    var id = wouter_1.useParams().id;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var _b = trpc_1.trpc.users.getById.useQuery(id || ""), user = _b.data, isLoading = _b.isLoading, error = _b.error;
    if (isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "User Details", description: "Loading user information", backLink: { label: "Users", href: "/admin/management" } },
            React.createElement("div", { className: "flex h-64 items-center justify-center" },
                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-blue-600" }))));
    }
    if (!user || error) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "User Details", description: "Unable to load this user", backLink: { label: "Users", href: "/admin/management" } },
            React.createElement("div", { className: "space-y-4 rounded-lg border border-gray-200 bg-white p-8 text-center" },
                React.createElement("p", { className: "text-lg font-semibold text-slate-900" }, "User not found"),
                React.createElement("p", { className: "text-sm text-slate-600" }, "This user may have been removed or you no longer have access."),
                React.createElement(button_1.Button, { onClick: function () { return setLocation("/admin/management"); } }, "Back to Users"))));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "User Details", description: "Review the full user profile and account settings", backLink: { label: "Users", href: "/admin/management" }, breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Admin", href: "/admin/management" },
            { label: "Users", href: "/admin/management" },
            { label: "Details" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement(card_1.Card, { className: "max-w-3xl" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between" },
                        React.createElement("div", null,
                            React.createElement(card_1.CardTitle, null, "User Profile"),
                            React.createElement(card_1.CardDescription, null,
                                "Detailed account information for ",
                                user.name || user.email)),
                        React.createElement("div", { className: "flex flex-wrap gap-2" },
                            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setLocation("/admin/management"); }, className: "gap-2" },
                                React.createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4" }),
                                "Back"),
                            React.createElement(button_1.Button, { onClick: function () { return setLocation("/users/" + user.id + "/edit"); }, className: "gap-2" },
                                React.createElement(lucide_react_1.Edit2, { className: "h-4 w-4" }),
                                "Edit")))),
                React.createElement(card_1.CardContent, { className: "grid gap-6 md:grid-cols-2" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm font-semibold text-gray-500" }, "Full Name"),
                            React.createElement("p", { className: "text-base font-medium text-slate-900" }, user.name || "N/A")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm font-semibold text-gray-500" }, "Email"),
                            React.createElement("p", { className: "text-base font-medium text-slate-900" }, user.email)),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm font-semibold text-gray-500" }, "Role"),
                            React.createElement("p", { className: "text-base font-medium text-slate-900" }, user.role || "N/A")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm font-semibold text-gray-500" }, "Status"),
                            React.createElement("p", { className: "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold " + (user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700') }, user.isActive ? "Active" : "Inactive"))),
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm font-semibold text-gray-500" }, "Organization"),
                            React.createElement("p", { className: "text-base font-medium text-slate-900" }, user.organizationId || "Global")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm font-semibold text-gray-500" }, "Department"),
                            React.createElement("p", { className: "text-base font-medium text-slate-900" }, user.department || "Not assigned")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm font-semibold text-gray-500" }, "Account Name"),
                            React.createElement("p", { className: "text-base font-medium text-slate-900" }, user.accountName || user.username || "N/A")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm font-semibold text-gray-500" }, "Last Updated"),
                            React.createElement("p", { className: "text-base font-medium text-slate-900" }, user.updatedAt ? new Date(user.updatedAt).toLocaleString() : "Unknown"))))),
            React.createElement(card_1.Card, { className: "max-w-3xl" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Account Details"),
                    React.createElement(card_1.CardDescription, null, "Additional metadata and login information")),
                React.createElement(card_1.CardContent, { className: "space-y-4" },
                    React.createElement("div", { className: "grid gap-4 md:grid-cols-3" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm font-semibold text-gray-500" }, "User ID"),
                            React.createElement("p", { className: "text-base font-medium text-slate-900" }, user.id)),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm font-semibold text-gray-500" }, "Created At"),
                            React.createElement("p", { className: "text-base font-medium text-slate-900" }, user.createdAt ? new Date(user.createdAt).toLocaleString() : "Unknown")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm font-semibold text-gray-500" }, "Requires Password Change"),
                            React.createElement("p", { className: "text-base font-medium text-slate-900" }, user.requiresPasswordChange ? "Yes" : "No"))))))));
}
exports["default"] = UserDetails;
