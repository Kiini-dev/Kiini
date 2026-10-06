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
var useAuthWithPersistence_1 = require("@/_core/hooks/useAuthWithPersistence");
var wouter_1 = require("wouter");
var react_1 = require("react");
var spinner_1 = require("@/components/ui/spinner");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var input_1 = require("@/components/ui/input");
var checkbox_1 = require("@/components/ui/checkbox");
var dialog_1 = require("@/components/ui/dialog");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var table_1 = require("@/components/ui/table");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var recharts_1 = require("recharts");
var stats_card_1 = require("@/components/ui/stats-card");
var EnhancedBulkActions_1 = require("@/components/list-page/EnhancedBulkActions");
/**
 * Admin Management Page
 *
 * Features:
 * - User management (create, edit, delete users)
 * - Role management
 * - Permissions management
 * - System settings and configuration
 * - Activity logs and audit trails
 *
 * Access: super_admin, admin users only
 */
/**
 * Permissions Management Component
 * Allows super_admin to manage user permissions by category
 */
function PermissionsManagement(_a) {
    var _this = this;
    var _b, _c;
    var users = _a.users, searchQuery = _a.searchQuery, setSearchQuery = _a.setSearchQuery;
    var _d = react_1.useState(null), selectedUserId = _d[0], setSelectedUserId = _d[1];
    var _e = react_1.useState(null), selectedCategory = _e[0], setSelectedCategory = _e[1];
    var _f = react_1.useState({}), userPermissions = _f[0], setUserPermissions = _f[1];
    var _g = react_1.useState(false), isSaving = _g[0], setIsSaving = _g[1];
    var permissionDefs = trpc_1.trpc.permissions.getAll.useQuery({}).data;
    var _h = trpc_1.trpc.permissions.getUserPermissions.useQuery(selectedUserId || "", { enabled: !!selectedUserId }), userPerms = _h.data, refetchUserPerms = _h.refetch;
    var updatePermMutation = trpc_1.trpc.permissions.bulkUpdatePermissions.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Permissions updated successfully");
            refetchUserPerms();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to update permissions");
        }
    });
    react_1.useEffect(function () {
        if (userPerms) {
            setUserPermissions(userPerms);
            var categories = Object.keys(userPerms);
            if (categories.length > 0 && !selectedCategory) {
                setSelectedCategory(categories[0]);
            }
        }
    }, [userPerms, selectedCategory]);
    var handlePermissionToggle = function (permissionId) {
        if (!selectedCategory)
            return;
        var updated = __assign({}, userPermissions);
        if (!updated[selectedCategory]) {
            updated[selectedCategory] = {};
        }
        updated[selectedCategory][permissionId] = !updated[selectedCategory][permissionId];
        setUserPermissions(updated);
    };
    var handleSelectAllPermissions = function () {
        var _a;
        if (!selectedCategory || !permissionDefs)
            return;
        var updated = __assign({}, userPermissions);
        if (!updated[selectedCategory]) {
            updated[selectedCategory] = {};
        }
        var categoryKey = selectedCategory.toLowerCase().replace(/\s+/g, '_');
        var permissions = ((_a = permissionDefs === null || permissionDefs === void 0 ? void 0 : permissionDefs[categoryKey]) === null || _a === void 0 ? void 0 : _a.permissions) || [];
        permissions.forEach(function (perm) {
            updated[selectedCategory][perm.id] = true;
        });
        setUserPermissions(updated);
        sonner_1.toast.success("All " + selectedCategory + " permissions selected");
    };
    var handleDeselectAllPermissions = function () {
        if (!selectedCategory)
            return;
        var updated = __assign({}, userPermissions);
        if (!updated[selectedCategory]) {
            updated[selectedCategory] = {};
        }
        Object.keys(updated[selectedCategory]).forEach(function (key) {
            updated[selectedCategory][key] = false;
        });
        setUserPermissions(updated);
        sonner_1.toast.success("All " + selectedCategory + " permissions deselected");
    };
    var getSeletedPermissionCount = function () {
        if (!selectedCategory || !userPermissions[selectedCategory])
            return 0;
        return Object.values(userPermissions[selectedCategory]).filter(Boolean).length;
    };
    var getTotalPermissionCount = function () {
        var _a, _b;
        if (!selectedCategory || !permissionDefs)
            return 0;
        var categoryKey = selectedCategory.toLowerCase().replace(/\s+/g, '_');
        return ((_b = (_a = permissionDefs === null || permissionDefs === void 0 ? void 0 : permissionDefs[categoryKey]) === null || _a === void 0 ? void 0 : _a.permissions) === null || _b === void 0 ? void 0 : _b.length) || 0;
    };
    var handleSavePermissions = function () { return __awaiter(_this, void 0, void 0, function () {
        var flatPermissions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedUserId)
                        return [2 /*return*/];
                    setIsSaving(true);
                    flatPermissions = {};
                    Object.values(userPermissions).forEach(function (category) {
                        Object.entries(category).forEach(function (_a) {
                            var key = _a[0], value = _a[1];
                            // Explicitly cast to boolean to handle any type coercion issues
                            flatPermissions[key] = Boolean(value);
                        });
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, updatePermMutation.mutateAsync({
                            userId: selectedUserId,
                            permissions: flatPermissions
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    setIsSaving(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var filteredUsers = users.filter(function (u) {
        var _a, _b;
        return ((_a = u.fullName) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchQuery.toLowerCase())) || ((_b = u.email) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(searchQuery.toLowerCase()));
    });
    return (React.createElement(card_1.Card, null,
        React.createElement(card_1.CardHeader, null,
            React.createElement(card_1.CardTitle, null, "User Permissions Management"),
            React.createElement(card_1.CardDescription, null, "Configure granular permissions for each user by role and category")),
        React.createElement(card_1.CardContent, { className: "space-y-6" },
            React.createElement("div", { className: "grid gap-6 md:grid-cols-3" },
                React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", null,
                        React.createElement("h3", { className: "font-semibold text-sm mb-2" }, "Select User"),
                        React.createElement("p", { className: "text-xs text-gray-500 mb-3" }, "Choose a user to manage their permissions")),
                    React.createElement("div", { className: "relative" },
                        React.createElement(lucide_react_1.Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }),
                        React.createElement(input_1.Input, { placeholder: "Search users...", className: "pl-8 border-gray-300", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); } })),
                    React.createElement("div", { className: "space-y-2 max-h-96 overflow-y-auto border rounded-lg p-2" }, filteredUsers.length === 0 ? (React.createElement("div", { className: "text-sm text-muted-foreground text-center py-6 bg-gray-50 rounded" },
                        React.createElement(lucide_react_1.Users, { className: "h-6 w-6 mx-auto mb-2 opacity-40" }),
                        "No users found")) : (filteredUsers.map(function (u) { return (React.createElement("button", { key: u.id, onClick: function () { return setSelectedUserId(u.id); }, className: "w-full text-left p-3 rounded-lg border transition-all " + (selectedUserId === u.id
                            ? "bg-blue-50 border-blue-300 ring-1 ring-blue-200"
                            : "hover:bg-gray-50 hover:border-gray-300") },
                        React.createElement("div", { className: "font-medium text-sm text-gray-900" }, u.fullName || u.name),
                        React.createElement("div", { className: "text-xs text-gray-600 truncate" }, u.email),
                        React.createElement("div", { className: "text-xs text-gray-400 mt-0.5" },
                            React.createElement("span", { className: "inline-block px-2 py-0.5 bg-gray-100 rounded text-gray-600" }, u.role)))); })))),
                selectedUserId && (React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", null,
                        React.createElement("h3", { className: "font-semibold text-sm mb-2" }, "Permission Categories"),
                        React.createElement("p", { className: "text-xs text-gray-500 mb-3" }, "Select a category to view permissions")),
                    React.createElement("div", { className: "space-y-2 max-h-96 overflow-y-auto border rounded-lg p-2" }, permissionDefs && Object.entries(permissionDefs).length > 0 ? (Object.entries(permissionDefs).map(function (_a) {
                        var _b;
                        var key = _a[0], category = _a[1];
                        return (React.createElement("button", { key: key, onClick: function () { return setSelectedCategory(category.category); }, className: "w-full text-left p-3 rounded-lg border transition-all " + (selectedCategory === category.category
                                ? "bg-blue-50 border-blue-300 ring-1 ring-blue-200"
                                : "hover:bg-gray-50 hover:border-gray-300") },
                            React.createElement("div", { className: "font-medium text-sm text-gray-900" }, category.category),
                            React.createElement("div", { className: "text-xs text-gray-500 mt-1" },
                                ((_b = category.permissions) === null || _b === void 0 ? void 0 : _b.length) || 0,
                                " permissions")));
                    })) : (React.createElement("div", { className: "text-sm text-muted-foreground text-center py-6 bg-gray-50 rounded" },
                        React.createElement(lucide_react_1.Lock, { className: "h-6 w-6 mx-auto mb-2 opacity-40" }),
                        "No categories available"))))),
                selectedUserId && selectedCategory && permissionDefs && (React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", null,
                        React.createElement("div", { className: "flex items-center justify-between mb-2" },
                            React.createElement("h3", { className: "font-semibold text-sm" }, selectedCategory),
                            React.createElement("span", { className: "text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded" },
                                getSeletedPermissionCount(),
                                "/",
                                getTotalPermissionCount())),
                        React.createElement("p", { className: "text-xs text-gray-500 mb-3" }, "Select permissions to assign to this user")),
                    React.createElement("div", { className: "flex gap-2 mb-3" },
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleSelectAllPermissions, className: "text-xs flex-1" },
                            React.createElement(lucide_react_1.Check, { className: "h-3 w-3 mr-1" }),
                            "Select All"),
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleDeselectAllPermissions, className: "text-xs flex-1" },
                            React.createElement(lucide_react_1.X, { className: "h-3 w-3 mr-1" }),
                            "Clear All")),
                    React.createElement("div", { className: "space-y-2 max-h-96 overflow-y-auto border rounded-lg p-3 bg-gray-50/50" }, ((_c = (_b = permissionDefs === null || permissionDefs === void 0 ? void 0 : permissionDefs[selectedCategory.toLowerCase().replace(/\s+/g, '_')]) === null || _b === void 0 ? void 0 : _b.permissions) === null || _c === void 0 ? void 0 : _c.map(function (perm) {
                        var _a;
                        return (React.createElement("label", { key: perm.id, className: "flex items-start gap-3 p-2.5 hover:bg-white rounded cursor-pointer transition-colors" },
                            React.createElement(checkbox_1.Checkbox, { checked: ((_a = userPermissions[selectedCategory]) === null || _a === void 0 ? void 0 : _a[perm.id]) || false, onCheckedChange: function () { return handlePermissionToggle(perm.id); }, className: "mt-1" }),
                            React.createElement("div", { className: "flex-1" },
                                React.createElement("div", { className: "font-medium text-sm text-gray-900" }, perm.label),
                                React.createElement("div", { className: "text-xs text-gray-500" }, perm.description))));
                    })) || (React.createElement("div", { className: "text-sm text-muted-foreground text-center py-6" }, "No permissions found for this category")))))),
            selectedUserId && (React.createElement("div", { className: "flex justify-end gap-2 pt-4 border-t" },
                React.createElement(button_1.Button, { variant: "outline", onClick: function () {
                        setSelectedUserId(null);
                        setSelectedCategory(null);
                    } }, "Cancel"),
                React.createElement(button_1.Button, { onClick: handleSavePermissions, disabled: isSaving, className: "gap-2" },
                    isSaving && React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin" }),
                    isSaving ? "Saving Permissions..." : "Save Permissions"))))));
}
/**
 * Admin Management Page
 *
 * Features:
 * - User management (create, edit, delete users)
 * - Role management
 * - Permissions management
 * - System settings and configuration
 * - Activity logs and audit trails
 *
 * Access: super_admin, admin users only
 */
function AdminManagement() {
    var _this = this;
    var _a, _b, _c, _d;
    // ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT THE TOP LEVEL
    var _e = useAuthWithPersistence_1.useAuthWithPersistence({
        redirectOnUnauthenticated: true
    }), user = _e.user, loading = _e.loading, isAuthenticated = _e.isAuthenticated, logout = _e.logout;
    var _f = wouter_1.useLocation(), setLocation = _f[1];
    var _g = react_1.useState(""), searchQuery = _g[0], setSearchQuery = _g[1];
    var _h = react_1.useState(null), selectedUser = _h[0], setSelectedUser = _h[1];
    var _j = react_1.useState(false), showDeleteDialog = _j[0], setShowDeleteDialog = _j[1];
    var _k = react_1.useState(false), showPermanentDeleteDialog = _k[0], setShowPermanentDeleteDialog = _k[1];
    var _l = react_1.useState(new Set()), selectedUsers = _l[0], setSelectedUsers = _l[1];
    var _m = react_1.useState("users"), activeTab = _m[0], setActiveTab = _m[1];
    // Role Management State
    var _o = react_1.useState(false), showRoleDialog = _o[0], setShowRoleDialog = _o[1];
    var _p = react_1.useState(null), editingRole = _p[0], setEditingRole = _p[1];
    var _q = react_1.useState(""), newRoleName = _q[0], setNewRoleName = _q[1];
    var _r = react_1.useState(""), newRoleDescription = _r[0], setNewRoleDescription = _r[1];
    var _s = react_1.useState(false), showDeleteRoleDialog = _s[0], setShowDeleteRoleDialog = _s[1];
    var _t = react_1.useState(null), roleToDelete = _t[0], setRoleToDelete = _t[1];
    var _u = react_1.useState({
        appName: "CRM Platform",
        supportEmail: "support@example.com",
        sessionTimeout: "30"
    }), systemSettings = _u[0], setSystemSettings = _u[1];
    var _v = react_1.useState(false), isSavingSettings = _v[0], setIsSavingSettings = _v[1];
    var _w = react_1.useState(""), newPermissionName = _w[0], setNewPermissionName = _w[1];
    var _x = react_1.useState(""), newPermissionDescription = _x[0], setNewPermissionDescription = _x[1];
    var _y = react_1.useState("general"), newPermissionCategory = _y[0], setNewPermissionCategory = _y[1];
    var _z = react_1.useState(null), selectedRoleForPermissions = _z[0], setSelectedRoleForPermissions = _z[1];
    var _0 = react_1.useState([]), rolePermissions = _0[0], setRolePermissions = _0[1];
    var _1 = react_1.useState({
        totalInvoices: 0,
        totalPayments: 0,
        totalExpenses: 0,
        totalRevenue: 0,
        netProfit: 0
    }), financialData = _1[0], setFinancialData = _1[1];
    // Fetch users list from backend
    var _2 = trpc_1.trpc.users.list.useQuery({}), _3 = _2.data, usersData = _3 === void 0 ? [] : _3, usersLoading = _2.isLoading, usersError = _2.error, refetchUsers = _2.refetch;
    // Fetch roles and permissions
    var _4 = trpc_1.trpc.settings.getRoles.useQuery({}), _5 = _4.data, roles = _5 === void 0 ? [] : _5, rolesLoading = _4.isLoading, refetchRoles = _4.refetch;
    var _6 = trpc_1.trpc.settings.getPermissions.useQuery({}).data, permissions = _6 === void 0 ? [] : _6;
    // Fetch system settings
    var settingsData = trpc_1.trpc.settings.getAll.useQuery({}).data;
    // Fetch dashboard metrics
    var _7 = trpc_1.trpc.dashboard.metrics.useQuery({}), metrics = _7.data, metricsLoading = _7.isLoading;
    // Fetch accounting metrics for analytics
    var _8 = trpc_1.trpc.invoices.list.useQuery({}).data, invoices = _8 === void 0 ? [] : _8;
    var _9 = trpc_1.trpc.payments.list.useQuery({}).data, payments = _9 === void 0 ? [] : _9;
    var _10 = trpc_1.trpc.expenses.list.useQuery({}).data, expenses = _10 === void 0 ? [] : _10;
    // Delete user mutation
    var permanentDeleteUserMutation = trpc_1.trpc.users.permanentDelete.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("User permanently deleted");
            setShowPermanentDeleteDialog(false);
            setSelectedUser(null);
            refetchUsers();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to permanently delete user");
        }
    });
    var deleteUserMutation = trpc_1.trpc.users["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("User deleted successfully");
            setShowDeleteDialog(false);
            setSelectedUser(null);
            refetchUsers();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete user");
        }
    });
    // Role mutations
    var createRoleMutation = trpc_1.trpc.settings.createRole.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Role created successfully");
            setShowRoleDialog(false);
            setNewRoleName("");
            setNewRoleDescription("");
            refetchRoles();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to create role");
        }
    });
    var updateRoleMutation = trpc_1.trpc.settings.updateRole.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Role updated successfully");
            setShowRoleDialog(false);
            setEditingRole(null);
            setNewRoleName("");
            setNewRoleDescription("");
            refetchRoles();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to update role");
        }
    });
    var deleteRoleMutation = trpc_1.trpc.settings.deleteRole.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Role deleted successfully");
            setShowDeleteRoleDialog(false);
            setRoleToDelete(null);
            refetchRoles();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete role");
        }
    });
    // Settings mutations
    var updateSettingMutation = trpc_1.trpc.settings.set.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Settings saved successfully");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to save settings");
        }
    });
    // MOVE ALL useEffect HOOKS HERE BEFORE CONDITIONAL RETURNS
    // Calculate financial metrics
    react_1.useEffect(function () {
        if (settingsData && Array.isArray(settingsData)) {
            var appNameSetting = settingsData.find(function (s) { return s.key === "app_name"; });
            var emailSetting = settingsData.find(function (s) { return s.key === "support_email"; });
            var timeoutSetting = settingsData.find(function (s) { return s.key === "session_timeout"; });
            setSystemSettings({
                appName: (appNameSetting === null || appNameSetting === void 0 ? void 0 : appNameSetting.value) || "CRM Platform",
                supportEmail: (emailSetting === null || emailSetting === void 0 ? void 0 : emailSetting.value) || "support@example.com",
                sessionTimeout: (timeoutSetting === null || timeoutSetting === void 0 ? void 0 : timeoutSetting.value) || "30"
            });
        }
    }, [settingsData]);
    react_1.useEffect(function () {
        if (!Array.isArray(invoices) || !Array.isArray(payments) || !Array.isArray(expenses)) {
            return;
        }
        var totalRevenue = invoices.reduce(function (sum, inv) { return sum + (inv.total || 0); }, 0) / 100;
        var totalExpensesAmount = expenses.reduce(function (sum, exp) { return sum + (exp.amount || 0); }, 0) / 100;
        var netProfit = totalRevenue - totalExpensesAmount;
        var newData = {
            totalInvoices: invoices.length,
            totalPayments: payments.length,
            totalExpenses: expenses.length,
            totalRevenue: totalRevenue,
            netProfit: netProfit
        };
        setFinancialData(function (prev) {
            if (prev.totalInvoices === newData.totalInvoices &&
                prev.totalPayments === newData.totalPayments &&
                prev.totalExpenses === newData.totalExpenses &&
                prev.totalRevenue === newData.totalRevenue &&
                prev.netProfit === newData.netProfit) {
                return prev;
            }
            return newData;
        });
    }, [invoices, payments, expenses]);
    react_1.useEffect(function () {
        // Verify user has super_admin or admin role
        if (!loading && isAuthenticated && (user === null || user === void 0 ? void 0 : user.role) !== "super_admin" && (user === null || user === void 0 ? void 0 : user.role) !== "admin") {
            setLocation("/dashboard");
        }
        // setLocation is intentionally omitted; it is stable in practice but
        // including it causes React to complain about changing dependencies.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, isAuthenticated, user]);
    // NOW PERFORM CONDITIONAL RETURNS AFTER ALL HOOKS ARE CALLED
    // Check if user has required role
    var isAdmin = user && (user.role === "super_admin" || user.role === "admin");
    if (loading)
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" }));
    if (!isAuthenticated || !isAdmin)
        return null;
    var filteredUsers = usersData.filter(function (u) {
        var _a, _b, _c;
        // Super admins: exclude org-scoped users (managed via multi-tenancy)
        if ((user === null || user === void 0 ? void 0 : user.role) === "super_admin" && u.organizationId)
            return false;
        return (((_a = u.fullName) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchQuery.toLowerCase())) || ((_b = u.email) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(searchQuery.toLowerCase())) || ((_c = u.role) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(searchQuery.toLowerCase())));
    });
    var handleDeleteUser = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(selectedUser === null || selectedUser === void 0 ? void 0 : selectedUser.id)) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, deleteUserMutation.mutateAsync(selectedUser.id)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("Error deleting user:", error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleSaveSettings = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsSavingSettings(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, Promise.all([
                            updateSettingMutation.mutateAsync({
                                key: "app_name",
                                value: systemSettings.appName,
                                category: "general",
                                description: "Application name"
                            }),
                            updateSettingMutation.mutateAsync({
                                key: "support_email",
                                value: systemSettings.supportEmail,
                                category: "general",
                                description: "Support email address"
                            }),
                            updateSettingMutation.mutateAsync({
                                key: "session_timeout",
                                value: systemSettings.sessionTimeout,
                                category: "security",
                                description: "Session timeout in minutes"
                            }),
                        ])];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    console.error("Error saving settings:", error_2);
                    return [3 /*break*/, 5];
                case 4:
                    setIsSavingSettings(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Role Handlers
    var handleCreateRole = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!newRoleName.trim()) {
                        sonner_1.toast.error("Role name is required");
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, createRoleMutation.mutateAsync({
                            name: newRoleName,
                            displayName: newRoleName,
                            description: newRoleDescription
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error("Error creating role:", error_3);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleUpdateRole = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!newRoleName.trim()) {
                        sonner_1.toast.error("Role name is required");
                        return [2 /*return*/];
                    }
                    if (!(editingRole === null || editingRole === void 0 ? void 0 : editingRole.id))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, updateRoleMutation.mutateAsync({
                            id: editingRole.id,
                            displayName: newRoleName,
                            description: newRoleDescription
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_4 = _a.sent();
                    console.error("Error updating role:", error_4);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleEditRole = function (role) {
        setEditingRole(role);
        setNewRoleName(role.displayName || role.name || "");
        setNewRoleDescription(role.description || "");
        setShowRoleDialog(true);
    };
    var handleDeleteRole = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(roleToDelete === null || roleToDelete === void 0 ? void 0 : roleToDelete.id)) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, deleteRoleMutation.mutateAsync(roleToDelete.id)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_5 = _a.sent();
                    console.error("Error deleting role:", error_5);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleOpenRoleDialog = function () {
        setEditingRole(null);
        setNewRoleName("");
        setNewRoleDescription("");
        setShowRoleDialog(true);
    };
    if (loading) {
        return (React.createElement("div", { className: "flex items-center justify-center min-h-screen" },
            React.createElement("p", null, "Loading...")));
    }
    if (!isAuthenticated) {
        return null;
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Admin Management", description: "Manage users, roles, permissions, and system settings", icon: React.createElement(lucide_react_1.Shield, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Admin Management" },
        ] },
        React.createElement("div", { className: "space-y-6 p-4 sm:p-6" },
            React.createElement("div", { className: "grid gap-4 md:grid-cols-5" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Users", value: (usersData === null || usersData === void 0 ? void 0 : usersData.length) || 0, description: React.createElement(React.Fragment, null,
                        (usersData === null || usersData === void 0 ? void 0 : usersData.filter(function (u) { return u.isActive; }).length) || 0,
                        " active"), color: "border-l-blue-500", onClick: function () { return setLocation("/admin/management"); } }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Invoices", value: financialData.totalInvoices, description: "Documents created", color: "border-l-amber-500", onClick: function () { return setLocation("/invoices"); } }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Revenue", value: React.createElement(React.Fragment, null,
                        "Ksh ",
                        (financialData.totalRevenue || 0).toLocaleString('en-KE', { maximumFractionDigits: 0 })), description: "All time revenue", color: "border-l-cyan-500", onClick: function () { return setLocation("/reports"); } }),
                React.createElement(stats_card_1.StatsCard, { label: "Active Clients", value: (metrics === null || metrics === void 0 ? void 0 : metrics.activeClients) || 0, description: "Client accounts", color: "border-l-pink-500", onClick: function () { return setLocation("/clients"); } }),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-600" }, "Net Profit")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold " + (financialData.netProfit >= 0 ? 'text-green-600' : 'text-red-600') },
                            "Ksh ",
                            (financialData.netProfit || 0).toLocaleString('en-KE', { maximumFractionDigits: 0 })),
                        React.createElement("p", { className: "text-xs text-gray-500 mt-1" }, "Revenue - Expenses")))),
            React.createElement(tabs_1.Tabs, { value: activeTab, onValueChange: setActiveTab },
                React.createElement(tabs_1.TabsList, { className: "grid w-full max-w-2xl grid-cols-5" },
                    React.createElement(tabs_1.TabsTrigger, { value: "users" },
                        React.createElement(lucide_react_1.Users, { className: "h-4 w-4 mr-2" }),
                        "Users"),
                    React.createElement(tabs_1.TabsTrigger, { value: "roles" },
                        React.createElement(lucide_react_1.Shield, { className: "h-4 w-4 mr-2" }),
                        "Roles"),
                    React.createElement(tabs_1.TabsTrigger, { value: "permissions" },
                        React.createElement(lucide_react_1.Lock, { className: "h-4 w-4 mr-2" }),
                        "Permissions"),
                    React.createElement(tabs_1.TabsTrigger, { value: "settings" },
                        React.createElement(lucide_react_1.Settings, { className: "h-4 w-4 mr-2" }),
                        "Settings"),
                    React.createElement(tabs_1.TabsTrigger, { value: "analytics" },
                        React.createElement(lucide_react_1.BarChart3, { className: "h-4 w-4 mr-2" }),
                        "Analytics")),
                React.createElement(tabs_1.TabsContent, { value: "users", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, { className: "pb-3" },
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("div", null,
                                    React.createElement(card_1.CardTitle, null, "Users Management"),
                                    React.createElement(card_1.CardDescription, null, "Create, edit, and manage user accounts and permissions")),
                                React.createElement(button_1.Button, { onClick: function () { return setLocation("/users/new"); } },
                                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                                    "New User"))),
                        React.createElement(card_1.CardContent, { className: "space-y-4" },
                            React.createElement("div", { className: "flex gap-2" },
                                React.createElement("div", { className: "flex-1 relative" },
                                    React.createElement(lucide_react_1.Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }),
                                    React.createElement(input_1.Input, { placeholder: "Search users by name, email, or role...", className: "pl-8", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); } }))),
                            selectedUsers.size > 0 && (React.createElement(EnhancedBulkActions_1.EnhancedBulkActions, { selectedCount: selectedUsers.size, onClear: function () { return setSelectedUsers(new Set()); }, actions: [
                                    EnhancedBulkActions_1.bulkExportAction(selectedUsers, filteredUsers, [
                                        { key: "fullName", label: "Name" },
                                        { key: "email", label: "Email" },
                                        { key: "role", label: "Role" },
                                        { key: "isActive", label: "Status" },
                                    ], "users"),
                                    EnhancedBulkActions_1.bulkCopyIdsAction(selectedUsers),
                                    EnhancedBulkActions_1.bulkDeleteAction(selectedUsers, function (ids) { return __awaiter(_this, void 0, void 0, function () {
                                        var _i, ids_1, id, _a;
                                        return __generator(this, function (_b) {
                                            switch (_b.label) {
                                                case 0:
                                                    _i = 0, ids_1 = ids;
                                                    _b.label = 1;
                                                case 1:
                                                    if (!(_i < ids_1.length)) return [3 /*break*/, 6];
                                                    id = ids_1[_i];
                                                    _b.label = 2;
                                                case 2:
                                                    _b.trys.push([2, 4, , 5]);
                                                    return [4 /*yield*/, deleteUserMutation.mutateAsync(id)];
                                                case 3:
                                                    _b.sent();
                                                    return [3 /*break*/, 5];
                                                case 4:
                                                    _a = _b.sent();
                                                    return [3 /*break*/, 5];
                                                case 5:
                                                    _i++;
                                                    return [3 /*break*/, 1];
                                                case 6:
                                                    setSelectedUsers(new Set());
                                                    refetchUsers();
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); }),
                                ] })),
                            usersLoading ? (React.createElement("div", { className: "flex items-center justify-center py-8" },
                                React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin" }))) : usersError ? (React.createElement("div", { className: "flex items-center gap-2 p-4 text-red-600 bg-red-50 rounded-lg" },
                                React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4" }),
                                "Error loading users")) : filteredUsers.length === 0 ? (React.createElement("div", { className: "text-center py-8 text-muted-foreground" }, "No users found")) : (React.createElement("div", { className: "border rounded-lg overflow-x-auto" },
                                React.createElement(table_1.Table, null,
                                    React.createElement(table_1.TableHeader, null,
                                        React.createElement(table_1.TableRow, null,
                                            React.createElement(table_1.TableHead, { className: "w-10" },
                                                React.createElement(checkbox_1.Checkbox, { checked: selectedUsers.size === filteredUsers.length && filteredUsers.length > 0, onCheckedChange: function (checked) {
                                                        if (checked)
                                                            setSelectedUsers(new Set(filteredUsers.map(function (u) { return u.id; })));
                                                        else
                                                            setSelectedUsers(new Set());
                                                    } })),
                                            React.createElement(table_1.TableHead, null, "Name"),
                                            React.createElement(table_1.TableHead, null, "Account Name"),
                                            React.createElement(table_1.TableHead, null, "Email"),
                                            React.createElement(table_1.TableHead, null, "Role"),
                                            React.createElement(table_1.TableHead, null, "Status"),
                                            React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                                    React.createElement(table_1.TableBody, null, filteredUsers.map(function (u) {
                                        var _a;
                                        return (React.createElement(table_1.TableRow, { key: u.id },
                                            React.createElement(table_1.TableCell, null,
                                                React.createElement(checkbox_1.Checkbox, { checked: selectedUsers.has(u.id), onCheckedChange: function (checked) {
                                                        var next = new Set(selectedUsers);
                                                        if (checked)
                                                            next.add(u.id);
                                                        else
                                                            next["delete"](u.id);
                                                        setSelectedUsers(next);
                                                    } })),
                                            React.createElement(table_1.TableCell, { className: "font-medium" }, u.fullName || u.name || "N/A"),
                                            React.createElement(table_1.TableCell, null, u.accountName || u.username || ((_a = u.email) === null || _a === void 0 ? void 0 : _a.split("@")[0]) || "N/A"),
                                            React.createElement(table_1.TableCell, null, u.email),
                                            React.createElement(table_1.TableCell, null,
                                                React.createElement("span", { className: "inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800" }, u.role)),
                                            React.createElement(table_1.TableCell, null, u.isActive ? (React.createElement("span", { className: "inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800" }, "Active")) : (React.createElement("span", { className: "inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800" }, "Inactive"))),
                                            React.createElement(table_1.TableCell, { className: "text-right space-x-2" },
                                                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setLocation("/users/" + u.id); } },
                                                    React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setLocation("/users/" + u.id + "/edit"); } },
                                                    React.createElement(lucide_react_1.Edit2, { className: "h-4 w-4" })),
                                                React.createElement(button_1.Button, { variant: "outline", size: "sm", className: "text-red-600 hover:text-red-700", onClick: function () {
                                                        setSelectedUser(u);
                                                        setShowDeleteDialog(true);
                                                    } },
                                                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })),
                                                !u.isActive && (React.createElement(button_1.Button, { variant: "destructive", size: "sm", title: "Permanently delete this inactive user", onClick: function () {
                                                        setSelectedUser(u);
                                                        setShowPermanentDeleteDialog(true);
                                                    } },
                                                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }),
                                                    React.createElement("span", { className: "ml-1 text-xs" }, "Perm"))))));
                                    })))))))),
                React.createElement(tabs_1.TabsContent, { value: "roles", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("div", null,
                                    React.createElement(card_1.CardTitle, null, "Roles & Permissions"),
                                    React.createElement(card_1.CardDescription, null, "Manage user roles and their associated permissions")),
                                React.createElement(button_1.Button, { onClick: handleOpenRoleDialog, className: "gap-2" },
                                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                                    "Create Role"))),
                        React.createElement(card_1.CardContent, { className: "space-y-6" }, rolesLoading ? (React.createElement("div", { className: "flex items-center justify-center py-8" },
                            React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin" }))) : (React.createElement(React.Fragment, null,
                            React.createElement("div", { className: "space-y-3" }, ((_a = roles === null || roles === void 0 ? void 0 : roles.filter(function (r) { return !r.isSystem; })) === null || _a === void 0 ? void 0 : _a.length) > 0 ? (React.createElement(React.Fragment, null,
                                React.createElement("h3", { className: "text-sm font-semibold text-gray-700" }, "Custom Roles"),
                                React.createElement("div", { className: "space-y-3" }, (_b = roles === null || roles === void 0 ? void 0 : roles.filter(function (r) { return !r.isSystem; })) === null || _b === void 0 ? void 0 : _b.map(function (role) { return (React.createElement("div", { key: role.id, className: "flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors group" },
                                    React.createElement("div", { className: "flex-1" },
                                        React.createElement("h4", { className: "font-medium text-sm text-gray-900" }, role.displayName || role.name),
                                        React.createElement("p", { className: "text-xs text-gray-500 mt-1" }, role.description || "No description provided")),
                                    React.createElement("div", { className: "flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" },
                                        React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return handleEditRole(role); }, className: "gap-2" },
                                            React.createElement(lucide_react_1.Edit2, { className: "h-4 w-4" }),
                                            "Configure"),
                                        React.createElement(button_1.Button, { variant: "outline", size: "sm", className: "text-red-600 hover:text-red-700 hover:bg-red-50", onClick: function () {
                                                setRoleToDelete(role);
                                                setShowDeleteRoleDialog(true);
                                            } },
                                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))))); })))) : (React.createElement("div", { className: "text-center py-6 text-muted-foreground bg-gray-50 rounded-lg" },
                                React.createElement(lucide_react_1.Shield, { className: "h-8 w-8 mx-auto mb-2 opacity-50" }),
                                React.createElement("p", { className: "text-sm" }, "No custom roles created yet")))),
                            React.createElement("div", { className: "pt-4 border-t space-y-3" },
                                React.createElement("h3", { className: "text-sm font-semibold text-gray-700" }, "System Roles"),
                                React.createElement("div", { className: "space-y-3" }, ((_c = roles === null || roles === void 0 ? void 0 : roles.filter(function (r) { return r.isSystem; })) === null || _c === void 0 ? void 0 : _c.length) > 0 ? ((_d = roles === null || roles === void 0 ? void 0 : roles.filter(function (r) { return r.isSystem; })) === null || _d === void 0 ? void 0 : _d.map(function (role) { return (React.createElement("div", { key: role.id, className: "flex items-center justify-between p-4 border rounded-lg bg-gray-50" },
                                    React.createElement("div", { className: "flex-1" },
                                        React.createElement("h4", { className: "font-medium text-sm text-gray-900" }, role.displayName || role.name),
                                        React.createElement("p", { className: "text-xs text-gray-500 mt-1" }, role.description || "System role")),
                                    React.createElement("span", { className: "text-xs font-medium text-gray-500 px-2.5 py-1 bg-gray-200 rounded" }, "System"))); })) : (React.createElement("div", { className: "text-center py-6 text-muted-foreground bg-gray-50 rounded-lg" },
                                    React.createElement("p", { className: "text-sm" }, "No system roles available"))))))))),
                    React.createElement(dialog_1.Dialog, { open: showRoleDialog, onOpenChange: setShowRoleDialog },
                        React.createElement(dialog_1.DialogContent, null,
                            React.createElement(dialog_1.DialogHeader, null,
                                React.createElement(dialog_1.DialogTitle, null, editingRole ? "Edit Role" : "Create New Role"),
                                React.createElement(dialog_1.DialogDescription, null, editingRole
                                    ? "Update role details. System roles cannot be modified."
                                    : "Create a new custom role for your organization")),
                            React.createElement("div", { className: "space-y-4" },
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement("label", { className: "text-sm font-medium text-gray-700" }, "Role Name *"),
                                    React.createElement(input_1.Input, { placeholder: "e.g., Manager, Senior Analyst, Supervisor", value: newRoleName, onChange: function (e) { return setNewRoleName(e.target.value); }, className: "border-gray-300" }),
                                    React.createElement("p", { className: "text-xs text-gray-500" }, "The display name for this role")),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement("label", { className: "text-sm font-medium text-gray-700" }, "Description"),
                                    React.createElement(input_1.Input, { placeholder: "Describe the purpose and responsibilities of this role", value: newRoleDescription, onChange: function (e) { return setNewRoleDescription(e.target.value); }, className: "border-gray-300" }),
                                    React.createElement("p", { className: "text-xs text-gray-500" }, "Optional description for role reference")),
                                React.createElement("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-3" },
                                    React.createElement("p", { className: "text-xs text-blue-800" },
                                        React.createElement("strong", null, "Note:"),
                                        " After creating the role, you can assign specific permissions to users under the Permissions tab.")),
                                React.createElement("div", { className: "flex gap-2 justify-end pt-4 border-t" },
                                    React.createElement(button_1.Button, { variant: "outline", onClick: function () {
                                            setShowRoleDialog(false);
                                            setEditingRole(null);
                                            setNewRoleName("");
                                            setNewRoleDescription("");
                                        } }, "Cancel"),
                                    React.createElement(button_1.Button, { onClick: editingRole ? handleUpdateRole : handleCreateRole, disabled: !newRoleName.trim() ||
                                            createRoleMutation.isPending ||
                                            updateRoleMutation.isPending },
                                        (createRoleMutation.isPending || updateRoleMutation.isPending) && (React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" })),
                                        editingRole ? "Update Role" : "Create Role"))))),
                    React.createElement(alert_dialog_1.AlertDialog, { open: showDeleteRoleDialog, onOpenChange: setShowDeleteRoleDialog },
                        React.createElement(alert_dialog_1.AlertDialogContent, null,
                            React.createElement(alert_dialog_1.AlertDialogTitle, null, "Delete Role?"),
                            React.createElement(alert_dialog_1.AlertDialogDescription, null,
                                "Are you sure you want to delete the role ",
                                React.createElement("strong", null,
                                    "\"",
                                    (roleToDelete === null || roleToDelete === void 0 ? void 0 : roleToDelete.displayName) || (roleToDelete === null || roleToDelete === void 0 ? void 0 : roleToDelete.name),
                                    "\""),
                                "? This action cannot be undone and users with this role will be affected."),
                            React.createElement("div", { className: "bg-red-50 border border-red-200 rounded-lg p-3 my-4" },
                                React.createElement("p", { className: "text-xs text-red-800" },
                                    React.createElement("strong", null, "Warning:"),
                                    " Deleting this role may impact users currently assigned to it.")),
                            React.createElement("div", { className: "flex gap-4 justify-end" },
                                React.createElement(alert_dialog_1.AlertDialogCancel, null, "Cancel"),
                                React.createElement(alert_dialog_1.AlertDialogAction, { onClick: handleDeleteRole, className: "bg-red-600 hover:bg-red-700", disabled: deleteRoleMutation.isPending }, deleteRoleMutation.isPending ? (React.createElement(React.Fragment, null,
                                    React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
                                    "Deleting...")) : ("Delete Role")))))),
                React.createElement(tabs_1.TabsContent, { value: "permissions", className: "space-y-4" },
                    React.createElement(PermissionsManagement, { users: usersData, searchQuery: searchQuery, setSearchQuery: setSearchQuery })),
                React.createElement(tabs_1.TabsContent, { value: "settings", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "System Settings"),
                            React.createElement(card_1.CardDescription, null, "Configure general system settings, application preferences, and security options")),
                        React.createElement(card_1.CardContent, { className: "space-y-6" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement("label", { htmlFor: "appName", className: "text-sm font-medium text-gray-700" }, "Application Name"),
                                React.createElement(input_1.Input, { id: "appName", placeholder: "Enter application name", value: systemSettings.appName, onChange: function (e) { return setSystemSettings(__assign(__assign({}, systemSettings), { appName: e.target.value })); }, className: "border-gray-300" }),
                                React.createElement("p", { className: "text-xs text-gray-500" }, "This name appears in the application header and emails")),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement("label", { htmlFor: "supportEmail", className: "text-sm font-medium text-gray-700" }, "Support Email"),
                                React.createElement(input_1.Input, { id: "supportEmail", type: "email", placeholder: "support@example.com", value: systemSettings.supportEmail, onChange: function (e) { return setSystemSettings(__assign(__assign({}, systemSettings), { supportEmail: e.target.value })); }, className: "border-gray-300" }),
                                React.createElement("p", { className: "text-xs text-gray-500" }, "Email address users can contact for support")),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement("label", { htmlFor: "sessionTimeout", className: "text-sm font-medium text-gray-700" }, "Session Timeout (minutes)"),
                                React.createElement(input_1.Input, { id: "sessionTimeout", type: "number", placeholder: "30", value: systemSettings.sessionTimeout, onChange: function (e) { return setSystemSettings(__assign(__assign({}, systemSettings), { sessionTimeout: e.target.value })); }, min: "5", max: "480", className: "border-gray-300" }),
                                React.createElement("p", { className: "text-xs text-gray-500" }, "Time before automatic logout. Range: 5-480 minutes")),
                            React.createElement("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4" },
                                React.createElement("p", { className: "text-sm text-blue-800" },
                                    React.createElement("strong", null, "Security Tip:"),
                                    " Shorter session timeouts provide better security but may require more frequent logins.")),
                            React.createElement("div", { className: "flex gap-3 pt-4 border-t" },
                                React.createElement(button_1.Button, { onClick: handleSaveSettings, disabled: isSavingSettings, className: "gap-2" },
                                    isSavingSettings && React.createElement(lucide_react_1.Loader2, { className: "w-4 h-4 animate-spin" }),
                                    isSavingSettings ? "Saving..." : "Save Settings"),
                                React.createElement(button_1.Button, { variant: "outline", onClick: function () {
                                        var _a, _b, _c;
                                        setSystemSettings({
                                            appName: ((_a = settingsData === null || settingsData === void 0 ? void 0 : settingsData.find(function (s) { return s.key === "app_name"; })) === null || _a === void 0 ? void 0 : _a.value) || "CRM Platform",
                                            supportEmail: ((_b = settingsData === null || settingsData === void 0 ? void 0 : settingsData.find(function (s) { return s.key === "support_email"; })) === null || _b === void 0 ? void 0 : _b.value) || "support@example.com",
                                            sessionTimeout: ((_c = settingsData === null || settingsData === void 0 ? void 0 : settingsData.find(function (s) { return s.key === "session_timeout"; })) === null || _c === void 0 ? void 0 : _c.value) || "30"
                                        });
                                    } }, "Reset"))))),
                React.createElement(tabs_1.TabsContent, { value: "analytics", className: "space-y-4" },
                    React.createElement("div", { className: "grid gap-4 md:grid-cols-6" },
                        React.createElement(stats_card_1.StatsCard, { label: "Total Invoices", value: financialData.totalInvoices, description: "Documents", color: "border-l-emerald-500" }),
                        React.createElement(stats_card_1.StatsCard, { label: "Total Payments", value: financialData.totalPayments, description: "Received", color: "border-l-orange-500" }),
                        React.createElement(stats_card_1.StatsCard, { label: "Total Expenses", value: financialData.totalExpenses, description: "Recorded", color: "border-l-purple-500" }),
                        React.createElement(stats_card_1.StatsCard, { label: "Total Revenue", value: React.createElement(React.Fragment, null,
                                "Ksh ",
                                (financialData.totalRevenue || 0).toLocaleString('en-KE', { maximumFractionDigits: 0 })), description: "All time", color: "border-l-green-500" }),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, { className: "pb-2" },
                                React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Net Profit")),
                            React.createElement(card_1.CardContent, null,
                                React.createElement("div", { className: "text-2xl font-bold " + (financialData.netProfit >= 0 ? 'text-green-600' : 'text-red-600') },
                                    "Ksh ",
                                    (financialData.netProfit || 0).toLocaleString('en-KE', { maximumFractionDigits: 0 })),
                                React.createElement("p", { className: "text-xs text-gray-500 mt-1" }, "Profit/Loss"))),
                        React.createElement(stats_card_1.StatsCard, { label: "Active Users", value: (usersData === null || usersData === void 0 ? void 0 : usersData.filter(function (u) { return u.isActive; }).length) || 0, description: React.createElement(React.Fragment, null,
                                "Of ",
                                (usersData === null || usersData === void 0 ? void 0 : usersData.length) || 0), color: "border-l-blue-500" })),
                    React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, null,
                                React.createElement(card_1.CardTitle, null, "Financial Breakdown"),
                                React.createElement(card_1.CardDescription, null, "Revenue vs Expenses distribution")),
                            React.createElement(card_1.CardContent, null,
                                React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                                    React.createElement(recharts_1.PieChart, null,
                                        React.createElement(recharts_1.Pie, { data: [
                                                { name: "Revenue", value: financialData.totalRevenue || 0, fill: "#10b981" },
                                                { name: "Expenses", value: financialData.totalExpenses || 0, fill: "#ef4444" },
                                            ], cx: "50%", cy: "50%", labelLine: false, label: function (_a) {
                                                var name = _a.name, value = _a.value;
                                                return name + ": " + (value / 1000).toFixed(0) + "k";
                                            }, outerRadius: 100, fill: "#8884d8", dataKey: "value" },
                                            React.createElement(recharts_1.Cell, { fill: "#10b981" }),
                                            React.createElement(recharts_1.Cell, { fill: "#ef4444" })),
                                        React.createElement(recharts_1.Tooltip, { formatter: function (value) { return "Ksh " + (value || 0).toLocaleString(); } }),
                                        React.createElement(recharts_1.Legend, null))))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, null,
                                React.createElement(card_1.CardTitle, null, "User Status Distribution"),
                                React.createElement(card_1.CardDescription, null, "Active vs Inactive users")),
                            React.createElement(card_1.CardContent, null,
                                React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                                    React.createElement(recharts_1.PieChart, null,
                                        React.createElement(recharts_1.Pie, { data: [
                                                { name: "Active", value: (usersData === null || usersData === void 0 ? void 0 : usersData.filter(function (u) { return u.isActive; }).length) || 0, fill: "#3b82f6" },
                                                { name: "Inactive", value: ((usersData === null || usersData === void 0 ? void 0 : usersData.length) || 0) - ((usersData === null || usersData === void 0 ? void 0 : usersData.filter(function (u) { return u.isActive; }).length) || 0), fill: "#9ca3af" },
                                            ], cx: "50%", cy: "50%", labelLine: false, label: function (_a) {
                                                var name = _a.name, value = _a.value;
                                                return name + ": " + value;
                                            }, outerRadius: 100, fill: "#8884d8", dataKey: "value" },
                                            React.createElement(recharts_1.Cell, { fill: "#3b82f6" }),
                                            React.createElement(recharts_1.Cell, { fill: "#9ca3af" })),
                                        React.createElement(recharts_1.Tooltip, null),
                                        React.createElement(recharts_1.Legend, null))))),
                        React.createElement(card_1.Card, { className: "md:col-span-2" },
                            React.createElement(card_1.CardHeader, null,
                                React.createElement(card_1.CardTitle, null, "Financial Metrics Comparison"),
                                React.createElement(card_1.CardDescription, null, "Key financial indicators")),
                            React.createElement(card_1.CardContent, null,
                                React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                                    React.createElement(recharts_1.BarChart, { data: [
                                            {
                                                name: "Financial Metrics",
                                                "Invoices": financialData.totalInvoices * 1000,
                                                "Payments": financialData.totalPayments * 1000,
                                                "Expenses": financialData.totalExpenses,
                                                "Revenue": financialData.totalRevenue
                                            },
                                        ] },
                                        React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                                        React.createElement(recharts_1.XAxis, { dataKey: "name" }),
                                        React.createElement(recharts_1.YAxis, null),
                                        React.createElement(recharts_1.Tooltip, { formatter: function (value) { return "" + (value).toLocaleString(); } }),
                                        React.createElement(recharts_1.Legend, null),
                                        React.createElement(recharts_1.Bar, { dataKey: "Invoices", fill: "#8b5cf6" }),
                                        React.createElement(recharts_1.Bar, { dataKey: "Payments", fill: "#10b981" }),
                                        React.createElement(recharts_1.Bar, { dataKey: "Expenses", fill: "#ef4444" }),
                                        React.createElement(recharts_1.Bar, { dataKey: "Revenue", fill: "#f59e0b" }))))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, null,
                                React.createElement(card_1.CardTitle, null, "Users by Role"),
                                React.createElement(card_1.CardDescription, null, "User distribution across roles")),
                            React.createElement(card_1.CardContent, null,
                                React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                                    React.createElement(recharts_1.PieChart, null,
                                        React.createElement(recharts_1.Pie, { data: (usersData === null || usersData === void 0 ? void 0 : usersData.length) > 0
                                                ? Object.entries((usersData || []).reduce(function (acc, u) {
                                                    acc[u.role || "unassigned"] = (acc[u.role || "unassigned"] || 0) + 1;
                                                    return acc;
                                                }, {})).map(function (_a) {
                                                    var role = _a[0], count = _a[1];
                                                    return ({ name: role, value: count });
                                                })
                                                : [], cx: "50%", cy: "50%", labelLine: false, label: function (_a) {
                                                var name = _a.name, value = _a.value;
                                                return name + ": " + value;
                                            }, outerRadius: 100, fill: "#8884d8", dataKey: "value" },
                                            React.createElement(recharts_1.Cell, { fill: "#3b82f6" }),
                                            React.createElement(recharts_1.Cell, { fill: "#10b981" }),
                                            React.createElement(recharts_1.Cell, { fill: "#f59e0b" }),
                                            React.createElement(recharts_1.Cell, { fill: "#ef4444" })),
                                        React.createElement(recharts_1.Tooltip, null),
                                        React.createElement(recharts_1.Legend, null))))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, null,
                                React.createElement(card_1.CardTitle, null, "Transaction Summary"),
                                React.createElement(card_1.CardDescription, null, "Invoices, Payments, and Expenses count")),
                            React.createElement(card_1.CardContent, null,
                                React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                                    React.createElement(recharts_1.BarChart, { data: [
                                            {
                                                category: "Documents",
                                                count: financialData.totalInvoices,
                                                fill: "#8b5cf6"
                                            },
                                            {
                                                category: "Payments",
                                                count: financialData.totalPayments,
                                                fill: "#10b981"
                                            },
                                            {
                                                category: "Expenses",
                                                count: financialData.totalExpenses,
                                                fill: "#ef4444"
                                            },
                                        ] },
                                        React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                                        React.createElement(recharts_1.XAxis, { dataKey: "category" }),
                                        React.createElement(recharts_1.YAxis, null),
                                        React.createElement(recharts_1.Tooltip, null),
                                        React.createElement(recharts_1.Bar, { dataKey: "count", fill: "#3b82f6", radius: [8, 8, 0, 0] })))))),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "System Performance Summary"),
                            React.createElement(card_1.CardDescription, null, "Key performance indicators")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                                React.createElement("div", { className: "p-4 bg-blue-50 rounded-lg" },
                                    React.createElement("p", { className: "text-sm text-gray-600" }, "Total Users"),
                                    React.createElement("p", { className: "text-3xl font-bold text-blue-600 mt-2" }, (usersData === null || usersData === void 0 ? void 0 : usersData.length) || 0),
                                    React.createElement("p", { className: "text-xs text-gray-500 mt-2" },
                                        ((((usersData === null || usersData === void 0 ? void 0 : usersData.filter(function (u) { return u.isActive; }).length) || 0) / ((usersData === null || usersData === void 0 ? void 0 : usersData.length) || 1)) * 100).toFixed(1),
                                        "% active")),
                                React.createElement("div", { className: "p-4 bg-green-50 rounded-lg" },
                                    React.createElement("p", { className: "text-sm text-gray-600" }, "Total Revenue"),
                                    React.createElement("p", { className: "text-3xl font-bold text-green-600 mt-2" },
                                        "Ksh ",
                                        ((financialData.totalRevenue || 0) / 1000).toFixed(0),
                                        "k"),
                                    React.createElement("p", { className: "text-xs text-gray-500 mt-2" }, "All invoices combined")),
                                React.createElement("div", { className: "p-4 bg-orange-50 rounded-lg" },
                                    React.createElement("p", { className: "text-sm text-gray-600" }, "Avg Invoice Value"),
                                    React.createElement("p", { className: "text-3xl font-bold text-orange-600 mt-2" },
                                        "Ksh ",
                                        financialData.totalInvoices > 0 ? ((financialData.totalRevenue / financialData.totalInvoices) / 1000).toFixed(0) : 0,
                                        "k"),
                                    React.createElement("p", { className: "text-xs text-gray-500 mt-2" }, "Per document")),
                                React.createElement("div", { className: "p-4 bg-purple-50 rounded-lg" },
                                    React.createElement("p", { className: "text-sm text-gray-600" }, "System Health"),
                                    React.createElement("p", { className: "text-3xl font-bold text-purple-600 mt-2" }, "98%"),
                                    React.createElement("p", { className: "text-xs text-gray-500 mt-2" }, "Uptime this month")))))))),
        React.createElement(alert_dialog_1.AlertDialog, { open: showDeleteDialog, onOpenChange: setShowDeleteDialog },
            React.createElement(alert_dialog_1.AlertDialogContent, null,
                React.createElement(alert_dialog_1.AlertDialogTitle, null, "Delete User"),
                React.createElement(alert_dialog_1.AlertDialogDescription, null,
                    "Are you sure you want to delete user \"", selectedUser === null || selectedUser === void 0 ? void 0 :
                    selectedUser.fullName,
                    "\"? This action cannot be undone."),
                React.createElement("div", { className: "flex gap-4 justify-end" },
                    React.createElement(alert_dialog_1.AlertDialogCancel, null, "Cancel"),
                    React.createElement(alert_dialog_1.AlertDialogAction, { onClick: handleDeleteUser, className: "bg-red-600 hover:bg-red-700", disabled: deleteUserMutation.isPending }, deleteUserMutation.isPending ? (React.createElement(React.Fragment, null,
                        React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
                        "Deleting...")) : ("Delete"))))),
        React.createElement(alert_dialog_1.AlertDialog, { open: showPermanentDeleteDialog, onOpenChange: setShowPermanentDeleteDialog },
            React.createElement(alert_dialog_1.AlertDialogContent, null,
                React.createElement(alert_dialog_1.AlertDialogTitle, { className: "text-red-600" }, "Permanently Delete User"),
                React.createElement(alert_dialog_1.AlertDialogDescription, null,
                    React.createElement("strong", null, "WARNING: This cannot be undone."),
                    " User \u201C", selectedUser === null || selectedUser === void 0 ? void 0 :
                    selectedUser.fullName,
                    "\u201D and all their data (activity logs, audit logs, settings, API keys) will be permanently removed from the database. This action is irreversible."),
                React.createElement("div", { className: "flex gap-4 justify-end" },
                    React.createElement(alert_dialog_1.AlertDialogCancel, null, "Cancel"),
                    React.createElement(alert_dialog_1.AlertDialogAction, { onClick: function () { return (selectedUser === null || selectedUser === void 0 ? void 0 : selectedUser.id) && permanentDeleteUserMutation.mutate(selectedUser.id); }, className: "bg-red-700 hover:bg-red-800", disabled: permanentDeleteUserMutation.isPending }, permanentDeleteUserMutation.isPending ? (React.createElement(React.Fragment, null,
                        React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
                        "Deleting permanently...")) : ("Yes, permanently delete")))))));
}
exports["default"] = AdminManagement;
