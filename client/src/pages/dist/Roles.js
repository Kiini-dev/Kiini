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
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var checkbox_1 = require("@/components/ui/checkbox");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var switch_1 = require("@/components/ui/switch");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var RowActionsMenu_1 = require("@/components/list-page/RowActionsMenu");
var SYSTEM_ROLES = [
    { value: 'staff', label: 'Staff' },
    { value: 'admin', label: 'Admin' },
    { value: 'accountant', label: 'Accountant' },
    { value: 'hr', label: 'HR' },
    { value: 'project_manager', label: 'Project Manager' },
    { value: 'ict_manager', label: 'ICT Manager' },
    { value: 'procurement_manager', label: 'Procurement Manager' },
    { value: 'sales_manager', label: 'Sales Manager' },
    { value: 'user', label: 'User' },
];
function Roles() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = react_1.useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = react_1.useState(false), isCreateOpen = _c[0], setIsCreateOpen = _c[1];
    var _d = react_1.useState(false), isEditOpen = _d[0], setIsEditOpen = _d[1];
    var _e = react_1.useState(null), selectedRole = _e[0], setSelectedRole = _e[1];
    var _f = react_1.useState({
        name: "",
        displayName: "",
        description: "",
        permissions: [],
        baseRole: "staff",
        isAdvanced: false
    }), formData = _f[0], setFormData = _f[1];
    // Fetch roles from backend
    var _g = trpc_1.trpc.roles.list.useQuery(), _h = _g.data, rolesData = _h === void 0 ? [] : _h, isLoading = _g.isLoading, refetch = _g.refetch;
    var _j = trpc_1.trpc.roles.getPermissions.useQuery().data, permissionsData = _j === void 0 ? [] : _j;
    var _k = trpc_1.trpc.roles.getAvailableFeatures.useQuery().data, availableFeatures = _k === void 0 ? [] : _k;
    var _l = trpc_1.trpc.roles.getUserCounts.useQuery().data, userCounts = _l === void 0 ? {} : _l;
    var utils = trpc_1.trpc.useUtils();
    // Use the feature-based permissions for custom roles
    var featurePermissions = react_1.useMemo(function () {
        var groups = {};
        availableFeatures.forEach(function (f) {
            if (!groups[f.category])
                groups[f.category] = [];
            groups[f.category].push(f);
        });
        return groups;
    }, [availableFeatures]);
    // Mutations - use custom role endpoints
    var createRoleMutation = trpc_1.trpc.roles.createCustomRole.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Role created successfully!");
            setIsCreateOpen(false);
            resetForm();
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to create role: " + ((error === null || error === void 0 ? void 0 : error.message) || String(error)));
        }
    });
    var updateRoleMutation = trpc_1.trpc.roles.updateCustomRole.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Role updated successfully!");
            setIsEditOpen(false);
            setSelectedRole(null);
            resetForm();
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to update role: " + ((error === null || error === void 0 ? void 0 : error.message) || String(error)));
        }
    });
    var deleteRoleMutation = trpc_1.trpc.roles.deleteCustomRole.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Role deleted successfully!");
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to delete role: " + ((error === null || error === void 0 ? void 0 : error.message) || String(error)));
        }
    });
    var resetForm = function () {
        setFormData({
            name: "",
            displayName: "",
            description: "",
            permissions: [],
            baseRole: "staff",
            isAdvanced: false
        });
    };
    var handleCreate = function () {
        if (!formData.name || !formData.displayName) {
            sonner_1.toast.error("Please fill in all required fields");
            return;
        }
        if (formData.permissions.length === 0) {
            sonner_1.toast.error("Please select at least one permission");
            return;
        }
        createRoleMutation.mutate({
            name: formData.name.toLowerCase().replace(/\s+/g, '_'),
            displayName: formData.displayName,
            description: formData.description,
            permissions: formData.permissions,
            baseRole: formData.baseRole,
            isAdvanced: formData.isAdvanced
        });
    };
    var handleEdit = function (role) {
        setSelectedRole(role);
        setFormData({
            name: role.name,
            displayName: role.displayName,
            description: role.description || "",
            permissions: role.permissions,
            baseRole: role.baseRole || "staff",
            isAdvanced: role.isAdvanced || false
        });
        setIsEditOpen(true);
    };
    var handleUpdate = function () {
        if (!selectedRole)
            return;
        updateRoleMutation.mutate({
            id: selectedRole.id,
            displayName: formData.displayName,
            description: formData.description,
            permissions: formData.permissions,
            baseRole: formData.baseRole,
            isAdvanced: formData.isAdvanced
        });
    };
    var handleDelete = function (role) {
        if (role.isSystem) {
            sonner_1.toast.error("System roles cannot be deleted");
            return;
        }
        if (confirm("Are you sure you want to delete the role \"" + role.displayName + "\"?")) {
            deleteRoleMutation.mutate(role.id);
        }
    };
    var togglePermission = function (permission) {
        setFormData(function (prev) { return (__assign(__assign({}, prev), { permissions: prev.permissions.includes(permission)
                ? prev.permissions.filter(function (p) { return p !== permission; })
                : __spreadArrays(prev.permissions, [permission]) })); });
    };
    // Filter roles
    var filteredRoles = react_1.useMemo(function () {
        if (!Array.isArray(rolesData))
            return [];
        return rolesData.filter(function (role) {
            var search = searchQuery.toLowerCase();
            var displayName = (role.displayName || "").toLowerCase();
            var name = (role.name || "").toLowerCase();
            var description = (role.description || "").toLowerCase();
            return displayName.includes(search) ||
                name.includes(search) ||
                description.includes(search);
        });
    }, [rolesData, searchQuery]);
    // Group permissions by category
    var groupedPermissions = react_1.useMemo(function () {
        var groups = {};
        permissionsData.forEach(function (perm) {
            if (!groups[perm.category]) {
                groups[perm.category] = [];
            }
            groups[perm.category].push(perm);
        });
        return groups;
    }, [permissionsData]);
    var getRoleColor = function (role) {
        if (role.name === 'super_admin')
            return "bg-purple-500/10 text-purple-500 border-purple-500/20";
        if (role.name === 'admin')
            return "bg-red-500/10 text-red-500 border-red-500/20";
        if (role.name === 'hr')
            return "bg-blue-500/10 text-blue-500 border-blue-500/20";
        if (role.name === 'accountant')
            return "bg-green-500/10 text-green-500 border-green-500/20";
        if (role.name === 'staff')
            return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Roles & Permissions", description: "Manage user roles and their permissions", icon: React.createElement(lucide_react_1.Shield, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Settings", href: "/settings" },
            { label: "Roles" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-600 flex items-center gap-2" },
                            React.createElement(lucide_react_1.Shield, { className: "h-4 w-4" }),
                            "Total Roles")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" }, filteredRoles.length),
                        React.createElement("p", { className: "text-xs text-gray-500 mt-1" },
                            filteredRoles.filter(function (r) { return r.isSystem; }).length,
                            " system roles"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-600 flex items-center gap-2" },
                            React.createElement(lucide_react_1.Users, { className: "h-4 w-4" }),
                            "Total Users")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" }, Object.values(userCounts).reduce(function (a, b) { return a + b; }, 0)),
                        React.createElement("p", { className: "text-xs text-gray-500 mt-1" }, "Across all roles"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-600 flex items-center gap-2" },
                            React.createElement(lucide_react_1.Lock, { className: "h-4 w-4" }),
                            "Permissions")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" }, permissionsData.length),
                        React.createElement("p", { className: "text-xs text-gray-500 mt-1" }, "Available permissions")))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement("div", { className: "flex flex-col md:flex-row gap-4 items-start md:items-center justify-between" },
                        React.createElement("div", null,
                            React.createElement(card_1.CardTitle, null, "Roles"),
                            React.createElement(card_1.CardDescription, null, "Manage roles and their permissions")),
                        React.createElement("div", { className: "flex gap-2" },
                            React.createElement("div", { className: "relative" },
                                React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }),
                                React.createElement(input_1.Input, { placeholder: "Search roles...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-10 w-64" })),
                            React.createElement(dialog_1.Dialog, { open: isCreateOpen, onOpenChange: setIsCreateOpen },
                                React.createElement(dialog_1.DialogTrigger, { asChild: true },
                                    React.createElement(button_1.Button, { onClick: function () { resetForm(); setIsCreateOpen(true); } },
                                        React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
                                        "Create Role")),
                                React.createElement(dialog_1.DialogContent, { className: "max-w-2xl max-h-[80vh] overflow-y-auto" },
                                    React.createElement(dialog_1.DialogHeader, null,
                                        React.createElement(dialog_1.DialogTitle, null, "Create New Role"),
                                        React.createElement(dialog_1.DialogDescription, null, "Define a new role with specific permissions")),
                                    React.createElement("div", { className: "space-y-4 py-4" },
                                        React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                                            React.createElement("div", { className: "space-y-2" },
                                                React.createElement(label_1.Label, { htmlFor: "name" }, "Role Name *"),
                                                React.createElement(input_1.Input, { id: "name", placeholder: "e.g., project_manager", value: formData.name, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { name: e.target.value })); } }),
                                                React.createElement("p", { className: "text-xs text-gray-500" }, "Lowercase with underscores only")),
                                            React.createElement("div", { className: "space-y-2" },
                                                React.createElement(label_1.Label, { htmlFor: "displayName" }, "Display Name *"),
                                                React.createElement(input_1.Input, { id: "displayName", placeholder: "e.g., Project Manager", value: formData.displayName, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { displayName: e.target.value })); } }))),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "description" }, "Description"),
                                            React.createElement(textarea_1.Textarea, { id: "description", placeholder: "Describe the role's responsibilities", value: formData.description, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { description: e.target.value })); }, rows: 2 })),
                                        React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                                            React.createElement("div", { className: "space-y-2" },
                                                React.createElement(label_1.Label, { htmlFor: "baseRole" }, "Base Role *"),
                                                React.createElement(select_1.Select, { value: formData.baseRole, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { baseRole: value })); } },
                                                    React.createElement(select_1.SelectTrigger, null,
                                                        React.createElement(select_1.SelectValue, { placeholder: "Select base role" })),
                                                    React.createElement(select_1.SelectContent, null, SYSTEM_ROLES.map(function (r) { return (React.createElement(select_1.SelectItem, { key: r.value, value: r.value }, r.label)); }))),
                                                React.createElement("p", { className: "text-xs text-gray-500" }, "Users with this role inherit base role access as a fallback")),
                                            React.createElement("div", { className: "space-y-2" },
                                                React.createElement(label_1.Label, null, "Advanced Role"),
                                                React.createElement("div", { className: "flex items-center gap-3 pt-2" },
                                                    React.createElement(switch_1.Switch, { checked: formData.isAdvanced, onCheckedChange: function (checked) { return setFormData(__assign(__assign({}, formData), { isAdvanced: checked })); } }),
                                                    React.createElement("span", { className: "text-sm text-muted-foreground" }, formData.isAdvanced ? "Advanced permissions enabled" : "Standard permissions only")),
                                                React.createElement("p", { className: "text-xs text-gray-500" }, "Advanced roles can access delete, approve, and management features"))),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, null, "Permissions *"),
                                            React.createElement("div", { className: "border rounded-lg p-4 max-h-60 overflow-y-auto" }, Object.keys(featurePermissions).length > 0
                                                ? Object.entries(featurePermissions).map(function (_a) {
                                                    var category = _a[0], perms = _a[1];
                                                    return (React.createElement("div", { key: category, className: "mb-4" },
                                                        React.createElement("h4", { className: "font-medium text-sm mb-2 flex items-center gap-1" }, category),
                                                        React.createElement("div", { className: "grid grid-cols-2 gap-2" }, perms.map(function (perm) {
                                                            var hidden = !formData.isAdvanced && perm.isAdvanced;
                                                            if (hidden)
                                                                return null;
                                                            return (React.createElement("div", { key: perm.key, className: "flex items-center space-x-2" },
                                                                React.createElement(checkbox_1.Checkbox, { id: perm.key, checked: formData.permissions.includes(perm.key), onCheckedChange: function () { return togglePermission(perm.key); } }),
                                                                React.createElement("label", { htmlFor: perm.key, className: "text-sm cursor-pointer flex items-center gap-1" },
                                                                    perm.label,
                                                                    perm.isAdvanced && React.createElement(lucide_react_1.Sparkles, { className: "h-3 w-3 text-amber-500" }))));
                                                        }))));
                                                })
                                                : Object.entries(groupedPermissions).map(function (_a) {
                                                    var category = _a[0], perms = _a[1];
                                                    return (React.createElement("div", { key: category, className: "mb-4" },
                                                        React.createElement("h4", { className: "font-medium text-sm mb-2" }, category),
                                                        React.createElement("div", { className: "grid grid-cols-2 gap-2" }, Array.isArray(perms) && perms.map(function (perm) { return (React.createElement("div", { key: perm.key, className: "flex items-center space-x-2" },
                                                            React.createElement(checkbox_1.Checkbox, { id: perm.key, checked: formData.permissions.includes(perm.key), onCheckedChange: function () { return togglePermission(perm.key); } }),
                                                            React.createElement("label", { htmlFor: perm.key, className: "text-sm cursor-pointer" }, perm.label))); }))));
                                                })))),
                                    React.createElement(dialog_1.DialogFooter, null,
                                        React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setIsCreateOpen(false); } }, "Cancel"),
                                        React.createElement(button_1.Button, { onClick: handleCreate, disabled: createRoleMutation.isPending }, createRoleMutation.isPending ? "Creating..." : "Create Role"))))))),
                React.createElement(card_1.CardContent, null, isLoading ? (React.createElement("div", { className: "text-center py-8" }, "Loading roles...")) : filteredRoles.length === 0 ? (React.createElement("div", { className: "text-center py-8 text-gray-500" }, "No roles found")) : (React.createElement(table_1.Table, null,
                    React.createElement(table_1.TableHeader, null,
                        React.createElement(table_1.TableRow, null,
                            React.createElement(table_1.TableHead, null, "Role"),
                            React.createElement(table_1.TableHead, null, "Description"),
                            React.createElement(table_1.TableHead, null, "Base Role"),
                            React.createElement(table_1.TableHead, null, "Users"),
                            React.createElement(table_1.TableHead, null, "Permissions"),
                            React.createElement(table_1.TableHead, null, "Type"),
                            React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                    React.createElement(table_1.TableBody, null, filteredRoles.map(function (role) { return (React.createElement(table_1.TableRow, { key: role.id },
                        React.createElement(table_1.TableCell, null,
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement(badge_1.Badge, { className: getRoleColor(role) }, role.displayName)),
                            React.createElement("p", { className: "text-xs text-gray-500 mt-1" }, role.name)),
                        React.createElement(table_1.TableCell, { className: "max-w-xs truncate" }, role.description || "-"),
                        React.createElement(table_1.TableCell, null, role.isCustom && role.baseRole ? (React.createElement("div", { className: "flex items-center gap-1" },
                            React.createElement(badge_1.Badge, { variant: "outline", className: "capitalize" }, role.baseRole),
                            role.isAdvanced && React.createElement(lucide_react_1.Sparkles, { className: "h-3 w-3 text-amber-500" }))) : (React.createElement("span", { className: "text-gray-400" }, "\u2014"))),
                        React.createElement(table_1.TableCell, null,
                            React.createElement("div", { className: "flex items-center gap-1" },
                                React.createElement(lucide_react_1.Users, { className: "h-4 w-4 text-gray-400" }),
                                React.createElement("span", null, userCounts[role.name] || 0))),
                        React.createElement(table_1.TableCell, null,
                            React.createElement(badge_1.Badge, { variant: "outline" },
                                role.permissions.length,
                                " permissions")),
                        React.createElement(table_1.TableCell, null, role.isSystem ? (React.createElement(badge_1.Badge, { variant: "secondary", className: "gap-1" },
                            React.createElement(lucide_react_1.Lock, { className: "h-3 w-3" }),
                            "System")) : (React.createElement(badge_1.Badge, { variant: "outline", className: "gap-1" },
                            React.createElement(lucide_react_1.Unlock, { className: "h-3 w-3" }),
                            "Custom"))),
                        React.createElement(table_1.TableCell, { className: "text-right" },
                            React.createElement(RowActionsMenu_1.RowActionsMenu, { primaryActions: [], menuActions: [
                                    { label: "Edit", icon: React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" }), onClick: function () { return handleEdit(role); }, disabled: role.isSystem },
                                    { label: "Delete", icon: React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }), onClick: function () { return handleDelete(role); }, disabled: role.isSystem, variant: "destructive", separator: true },
                                ] })))); })))))),
            React.createElement(dialog_1.Dialog, { open: isEditOpen, onOpenChange: setIsEditOpen },
                React.createElement(dialog_1.DialogContent, { className: "max-w-2xl max-h-[80vh] overflow-y-auto" },
                    React.createElement(dialog_1.DialogHeader, null,
                        React.createElement(dialog_1.DialogTitle, null, "Edit Role"),
                        React.createElement(dialog_1.DialogDescription, null, "Update role details and permissions")),
                    React.createElement("div", { className: "space-y-4 py-4" },
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "edit-name" }, "Role Name"),
                                React.createElement(input_1.Input, { id: "edit-name", value: formData.name, disabled: true, className: "bg-gray-100" }),
                                React.createElement("p", { className: "text-xs text-gray-500" }, "Role name cannot be changed")),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "edit-displayName" }, "Display Name *"),
                                React.createElement(input_1.Input, { id: "edit-displayName", value: formData.displayName, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { displayName: e.target.value })); } }))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "edit-description" }, "Description"),
                            React.createElement(textarea_1.Textarea, { id: "edit-description", value: formData.description, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { description: e.target.value })); }, rows: 2 })),
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "edit-baseRole" }, "Base Role *"),
                                React.createElement(select_1.Select, { value: formData.baseRole, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { baseRole: value })); } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select base role" })),
                                    React.createElement(select_1.SelectContent, null, SYSTEM_ROLES.map(function (r) { return (React.createElement(select_1.SelectItem, { key: r.value, value: r.value }, r.label)); })))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Advanced Role"),
                                React.createElement("div", { className: "flex items-center gap-3 pt-2" },
                                    React.createElement(switch_1.Switch, { checked: formData.isAdvanced, onCheckedChange: function (checked) { return setFormData(__assign(__assign({}, formData), { isAdvanced: checked })); } }),
                                    React.createElement("span", { className: "text-sm text-muted-foreground" }, formData.isAdvanced ? "Advanced" : "Standard")))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null, "Permissions *"),
                            React.createElement("div", { className: "border rounded-lg p-4 max-h-60 overflow-y-auto" }, Object.keys(featurePermissions).length > 0
                                ? Object.entries(featurePermissions).map(function (_a) {
                                    var category = _a[0], perms = _a[1];
                                    return (React.createElement("div", { key: category, className: "mb-4" },
                                        React.createElement("h4", { className: "font-medium text-sm mb-2 flex items-center gap-1" }, category),
                                        React.createElement("div", { className: "grid grid-cols-2 gap-2" }, perms.map(function (perm) {
                                            var hidden = !formData.isAdvanced && perm.isAdvanced;
                                            if (hidden)
                                                return null;
                                            return (React.createElement("div", { key: perm.key, className: "flex items-center space-x-2" },
                                                React.createElement(checkbox_1.Checkbox, { id: "edit-" + perm.key, checked: formData.permissions.includes(perm.key), onCheckedChange: function () { return togglePermission(perm.key); } }),
                                                React.createElement("label", { htmlFor: "edit-" + perm.key, className: "text-sm cursor-pointer flex items-center gap-1" },
                                                    perm.label,
                                                    perm.isAdvanced && React.createElement(lucide_react_1.Sparkles, { className: "h-3 w-3 text-amber-500" }))));
                                        }))));
                                })
                                : Object.entries(groupedPermissions).map(function (_a) {
                                    var category = _a[0], perms = _a[1];
                                    return (React.createElement("div", { key: category, className: "mb-4" },
                                        React.createElement("h4", { className: "font-medium text-sm mb-2" }, category),
                                        React.createElement("div", { className: "grid grid-cols-2 gap-2" }, Array.isArray(perms) && perms.map(function (perm) { return (React.createElement("div", { key: perm.key, className: "flex items-center space-x-2" },
                                            React.createElement(checkbox_1.Checkbox, { id: "edit-" + perm.key, checked: formData.permissions.includes(perm.key), onCheckedChange: function () { return togglePermission(perm.key); } }),
                                            React.createElement("label", { htmlFor: "edit-" + perm.key, className: "text-sm cursor-pointer" }, perm.label))); }))));
                                })))),
                    React.createElement(dialog_1.DialogFooter, null,
                        React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setIsEditOpen(false); } }, "Cancel"),
                        React.createElement(button_1.Button, { onClick: handleUpdate, disabled: updateRoleMutation.isPending }, updateRoleMutation.isPending ? "Updating..." : "Update Role")))))));
}
exports["default"] = Roles;
