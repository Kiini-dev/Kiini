"use strict";
exports.__esModule = true;
var react_1 = require("react");
var UnifiedModuleLayout_1 = require("@/components/UnifiedModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var spinner_1 = require("@/components/ui/spinner");
var badge_1 = require("@/components/ui/badge");
var permissions_1 = require("@/lib/permissions");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
var table_1 = require("@/components/ui/table");
function Permissions() {
    var _a = permissions_1.useRequireFeature("permissions:manage"), allowed = _a.allowed, permLoading = _a.isLoading, user = _a.user;
    var _b = react_1.useState(""), searchUser = _b[0], setSearchUser = _b[1];
    var _c = react_1.useState(""), selectedUser = _c[0], setSelectedUser = _c[1];
    var _d = react_1.useState("all"), filterCategory = _d[0], setFilterCategory = _d[1];
    // Queries
    var categoriesQuery = trpc_1.trpc.permissions.getCategories.useQuery(undefined, {
        enabled: allowed
    });
    var userPermissionsQuery = trpc_1.trpc.permissions.getUserPermissions.useQuery({ userId: selectedUser }, { enabled: allowed && selectedUser.length > 0 });
    // Get all categories
    var categories = categoriesQuery.data || [];
    if (permLoading) {
        return (React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, null)));
    }
    if (!allowed) {
        return (React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(card_1.Card, { className: "w-full max-w-md border-red-200 bg-red-50" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2 text-red-700" },
                        React.createElement(lucide_react_1.XCircle, { className: "h-5 w-5" }),
                        "Access Denied")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("p", { className: "text-sm text-red-600" }, "You don't have permission to manage permissions.")))));
    }
    return (React.createElement(UnifiedModuleLayout_1["default"], { title: "Permissions Management", description: "Manage user roles, permissions, and access control", icon: React.createElement(lucide_react_1.Lock, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Settings", href: "/settings" },
            { label: "Permissions" },
        ] },
        React.createElement("div", { className: "space-y-8" },
            React.createElement(card_1.Card, { className: "bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-2xl" }, "System Permissions"),
                    React.createElement(card_1.CardDescription, { className: "text-base" }, "Manage role-based access control and assign permissions to users")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid md:grid-cols-3 gap-4 text-sm" },
                        React.createElement("div", null,
                            React.createElement("div", { className: "font-semibold text-slate-900 dark:text-white mb-1" }, "\uD83D\uDD10 Role-Based Control"),
                            React.createElement("p", { className: "text-slate-600 dark:text-slate-400" }, "Manage permissions by user role and individual user assignments")),
                        React.createElement("div", null,
                            React.createElement("div", { className: "font-semibold text-slate-900 dark:text-white mb-1" }, "\uD83D\uDCCB Permission Categories"),
                            React.createElement("p", { className: "text-slate-600 dark:text-slate-400" },
                                categories.length,
                                " categories with granular permission controls")),
                        React.createElement("div", null,
                            React.createElement("div", { className: "font-semibold text-slate-900 dark:text-white mb-1" }, "\uD83D\uDC65 User Assignments"),
                            React.createElement("p", { className: "text-slate-600 dark:text-slate-400" }, "Assign specific permissions to individual users or roles"))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Shield, { className: "h-5 w-5" }),
                        "Permission Categories"),
                    React.createElement(card_1.CardDescription, null, "Available permission categories in the system")),
                React.createElement(card_1.CardContent, null, categoriesQuery.isLoading ? (React.createElement("div", { className: "flex justify-center py-8" },
                    React.createElement(spinner_1.Spinner, null))) : categories.length === 0 ? (React.createElement("p", { className: "text-sm text-slate-600 dark:text-slate-400 py-8 text-center" }, "No permission categories found")) : (React.createElement("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3" }, categories.map(function (cat) { return (React.createElement("div", { key: cat.key, className: "p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors" },
                    React.createElement("div", { className: "font-semibold text-sm mb-2" }, cat.name),
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement(badge_1.Badge, { variant: "secondary", className: "text-xs" },
                            cat.permissionCount,
                            " permissions"),
                        React.createElement("code", { className: "text-xs text-slate-500 dark:text-slate-400" }, cat.key)))); }))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Users, { className: "h-5 w-5" }),
                        "User Permissions"),
                    React.createElement(card_1.CardDescription, null, "View and manage permissions for specific users")),
                React.createElement(card_1.CardContent, { className: "space-y-6" },
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, { htmlFor: "userId" }, "Select User"),
                        React.createElement("div", { className: "flex gap-2" },
                            React.createElement(input_1.Input, { id: "userId", placeholder: "Search or enter user ID...", value: searchUser, onChange: function (e) { return setSearchUser(e.target.value); }, className: "flex-1" }),
                            React.createElement(button_1.Button, { onClick: function () { return setSelectedUser(searchUser); }, disabled: !searchUser, className: "px-4" },
                                React.createElement(lucide_react_1.Search, { className: "h-4 w-4 mr-2" }),
                                "Search")),
                        React.createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400" }, "Enter a user ID to view their current permissions")),
                    selectedUser && (React.createElement("div", { className: "mt-6 space-y-4" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("h3", { className: "font-semibold text-sm" },
                                "Permissions for User: ",
                                selectedUser),
                            React.createElement(button_1.Button, { size: "sm", variant: "outline" },
                                React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                                "Add Permission")),
                        userPermissionsQuery.isLoading ? (React.createElement("div", { className: "flex justify-center py-8" },
                            React.createElement(spinner_1.Spinner, null))) : !userPermissionsQuery.data || userPermissionsQuery.data.length === 0 ? (React.createElement("div", { className: "p-8 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 text-center" },
                            React.createElement(lucide_react_1.Lock, { className: "h-8 w-8 mx-auto text-slate-400 mb-2" }),
                            React.createElement("p", { className: "text-sm text-slate-600 dark:text-slate-400" }, "No specific permissions assigned to this user"),
                            React.createElement("p", { className: "text-xs text-slate-500 dark:text-slate-500 mt-1" }, "User permissions are inherited from their role"))) : (React.createElement("div", { className: "rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden" },
                            React.createElement(table_1.Table, null,
                                React.createElement(table_1.TableHeader, null,
                                    React.createElement(table_1.TableRow, { className: "bg-slate-50 dark:bg-slate-900" },
                                        React.createElement(table_1.TableHead, null, "Permission"),
                                        React.createElement(table_1.TableHead, { className: "w-24" }, "Status"),
                                        React.createElement(table_1.TableHead, { className: "w-24" }, "Actions"))),
                                React.createElement(table_1.TableBody, null, userPermissionsQuery.data.map(function (perm) { return (React.createElement(table_1.TableRow, { key: perm.id },
                                    React.createElement(table_1.TableCell, { className: "font-mono text-xs" }, perm.resource),
                                    React.createElement(table_1.TableCell, null, perm.granted ? (React.createElement(badge_1.Badge, { variant: "default", className: "bg-green-600" },
                                        React.createElement(lucide_react_1.CheckCircle2, { className: "h-3 w-3 mr-1" }),
                                        "Granted")) : (React.createElement(badge_1.Badge, { variant: "secondary" },
                                        React.createElement(lucide_react_1.XCircle, { className: "h-3 w-3 mr-1" }),
                                        "Denied"))),
                                    React.createElement(table_1.TableCell, null,
                                        React.createElement("div", { className: "flex gap-1" },
                                            React.createElement(button_1.Button, { size: "sm", variant: "ghost" },
                                                React.createElement(lucide_react_1.Edit2, { className: "h-3 w-3" })),
                                            React.createElement(button_1.Button, { size: "sm", variant: "ghost", className: "text-red-600 hover:text-red-700" },
                                                React.createElement(lucide_react_1.Trash2, { className: "h-3 w-3" })))))); }))))))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Shield, { className: "h-5 w-5" }),
                        "Role-Based Permissions"),
                    React.createElement(card_1.CardDescription, null, "Default permissions for each role")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                            React.createElement("div", { className: "p-4 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800" },
                                React.createElement("h4", { className: "font-semibold text-sm mb-2" }, "Super Admin"),
                                React.createElement("p", { className: "text-sm text-slate-600 dark:text-slate-400" }, "Full access to all system features and permissions")),
                            React.createElement("div", { className: "p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800" },
                                React.createElement("h4", { className: "font-semibold text-sm mb-2" }, "Admin"),
                                React.createElement("p", { className: "text-sm text-slate-600 dark:text-slate-400" }, "Access to most features with some restrictions")),
                            React.createElement("div", { className: "p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800" },
                                React.createElement("h4", { className: "font-semibold text-sm mb-2" }, "HR Manager"),
                                React.createElement("p", { className: "text-sm text-slate-600 dark:text-slate-400" }, "Access to HR and employee management features")),
                            React.createElement("div", { className: "p-4 rounded-lg bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800" },
                                React.createElement("h4", { className: "font-semibold text-sm mb-2" }, "Staff"),
                                React.createElement("p", { className: "text-sm text-slate-600 dark:text-slate-400" }, "Limited access to basic features")))))))));
}
exports["default"] = Permissions;
