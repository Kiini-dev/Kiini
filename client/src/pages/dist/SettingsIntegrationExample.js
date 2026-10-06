"use strict";
exports.__esModule = true;
exports.PermissionChecker = exports.SETTINGS_MENU_ITEMS = exports.SettingsPage = exports.DashboardSettingsPage = exports.RolesManagementPage = void 0;
var react_query_1 = require("@tanstack/react-query");
var EnhancedRoleManagement_1 = require("@/components/EnhancedRoleManagement");
var CustomDashboardBuilder_1 = require("@/components/CustomDashboardBuilder");
var tabs_1 = require("@/components/ui/tabs");
var use_toast_1 = require("@/components/ui/use-toast");
var api_1 = require("@/utils/api");
var useEnhancedPermissions_1 = require("@/hooks/useEnhancedPermissions");
var useEnhancedDashboard_1 = require("@/hooks/useEnhancedDashboard");
/**
 * ============================================================================
 * ROLES MANAGEMENT PAGE - INTEGRATION EXAMPLE
 * ============================================================================
 *
 * This page demonstrates how to integrate EnhancedRoleManagement component
 * with the existing roles system and new enhanced permissions system.
 */
function RolesManagementPage() {
    var toast = use_toast_1.useToast().toast;
    var queryClient = react_query_1.useQueryClient();
    // Fetch all roles
    var _a = api_1.api.roles.list.useQuery(), _b = _a.data, roles = _b === void 0 ? [] : _b, rolesLoading = _a.isLoading;
    // Mutations for role management
    var createRoleMutation = api_1.api.roles.create.useMutation({
        onSuccess: function () {
            toast({
                title: 'Success',
                description: 'Role created successfully'
            });
            queryClient.invalidateQueries({ queryKey: ['roles'] });
        },
        onError: function (error) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to create role',
                variant: 'destructive'
            });
        }
    });
    var updateRoleMutation = api_1.api.roles.update.useMutation({
        onSuccess: function () {
            toast({
                title: 'Success',
                description: 'Role updated successfully'
            });
            queryClient.invalidateQueries({ queryKey: ['roles'] });
        },
        onError: function (error) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update role',
                variant: 'destructive'
            });
        }
    });
    var deleteRoleMutation = api_1.api.roles["delete"].useMutation({
        onSuccess: function () {
            toast({
                title: 'Success',
                description: 'Role deleted successfully'
            });
            queryClient.invalidateQueries({ queryKey: ['roles'] });
        },
        onError: function (error) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete role',
                variant: 'destructive'
            });
        }
    });
    // Transform API response to component format
    var transformedRoles = (roles || []).map(function (role) { return ({
        id: role.id,
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        permissions: role.permissions || [],
        isSystem: role.isSystem,
        userCount: role.userCount || 0
    }); });
    var handleRoleUpdate = function (role) {
        updateRoleMutation.mutate({
            id: role.id,
            displayName: role.displayName,
            description: role.description,
            permissions: role.permissions
        });
    };
    var handleRoleCreate = function (role) {
        createRoleMutation.mutate({
            name: role.name,
            displayName: role.displayName,
            description: role.description,
            permissions: role.permissions
        });
    };
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", null,
            React.createElement("h1", { className: "text-3xl font-bold" }, "Role Management"),
            React.createElement("p", { className: "text-gray-600 mt-2" }, "Manage roles and assign granular permissions to users")),
        React.createElement(EnhancedRoleManagement_1.EnhancedRoleManagement, { roles: transformedRoles, onRoleUpdate: handleRoleUpdate, onRoleCreate: handleRoleCreate, isLoading: rolesLoading || createRoleMutation.isPending || updateRoleMutation.isPending })));
}
exports.RolesManagementPage = RolesManagementPage;
/**
 * ============================================================================
 * DASHBOARD SETTINGS PAGE - INTEGRATION EXAMPLE
 * ============================================================================
 *
 * This page demonstrates how to integrate CustomDashboardBuilder component
 * to allow users to customize their dashboard layout.
 */
function DashboardSettingsPage() {
    var toast = use_toast_1.useToast().toast;
    // Fetch user's default dashboard layout
    var _a = useEnhancedDashboard_1.useDefaultDashboardLayout(), layout = _a.data, layoutLoading = _a.isLoading;
    // Update dashboard layout mutation
    var updateLayoutMutation = useEnhancedDashboard_1.useUpdateDashboardLayout();
    var handleSaveLayout = function (updatedLayout) {
        updateLayoutMutation.mutate(updatedLayout, {
            onSuccess: function () {
                toast({
                    title: 'Success',
                    description: 'Dashboard layout saved successfully'
                });
            },
            onError: function (error) {
                toast({
                    title: 'Error',
                    description: error.message || 'Failed to save dashboard layout',
                    variant: 'destructive'
                });
            }
        });
    };
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", null,
            React.createElement("h1", { className: "text-3xl font-bold" }, "Dashboard Settings"),
            React.createElement("p", { className: "text-gray-600 mt-2" }, "Customize your dashboard layout, add or remove widgets, and arrange them how you prefer")),
        React.createElement(CustomDashboardBuilder_1.CustomDashboardBuilder, { layout: layout, onSave: handleSaveLayout, isLoading: layoutLoading || updateLayoutMutation.isPending })));
}
exports.DashboardSettingsPage = DashboardSettingsPage;
/**
 * ============================================================================
 * SETTINGS PAGE WITH TABS - INTEGRATION EXAMPLE
 * ============================================================================
 *
 * This shows how to create a unified settings page with multiple sections
 */
function SettingsPage() {
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", null,
            React.createElement("h1", { className: "text-3xl font-bold" }, "Settings"),
            React.createElement("p", { className: "text-gray-600 mt-2" }, "Manage your account settings and preferences")),
        React.createElement(tabs_1.Tabs, { defaultValue: "roles", className: "w-full" },
            React.createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-3" },
                React.createElement(tabs_1.TabsTrigger, { value: "roles" }, "Roles & Permissions"),
                React.createElement(tabs_1.TabsTrigger, { value: "dashboard" }, "Dashboard"),
                React.createElement(tabs_1.TabsTrigger, { value: "general" }, "General")),
            React.createElement(tabs_1.TabsContent, { value: "roles", className: "space-y-4" },
                React.createElement(RolesManagementPage, null)),
            React.createElement(tabs_1.TabsContent, { value: "dashboard", className: "space-y-4" },
                React.createElement(DashboardSettingsPage, null)),
            React.createElement(tabs_1.TabsContent, { value: "general", className: "space-y-4" },
                React.createElement("div", { className: "p-6 bg-white rounded-lg border" },
                    React.createElement("h3", { className: "text-lg font-semibold mb-4" }, "General Settings"))))));
}
exports.SettingsPage = SettingsPage;
/**
 * ============================================================================
 * NAVIGATION MENU CONFIGURATION
 * ============================================================================
 */
exports.SETTINGS_MENU_ITEMS = [
    {
        id: 'roles',
        label: 'Role Management',
        href: '/settings/roles',
        icon: 'Lock',
        description: 'Manage roles and permissions',
        permission: 'role.view'
    },
    {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/settings/dashboard',
        icon: 'LayoutGrid',
        description: 'Customize your dashboard',
        permission: 'dashboard.customize'
    },
    {
        id: 'general',
        label: 'General Settings',
        href: '/settings/general',
        icon: 'Settings',
        description: 'General system settings',
        permission: 'setting.view'
    },
];
/**
 * ============================================================================
 * PERMISSION CHECKER COMPONENT - HELPER
 * ============================================================================
 *
 * Helper component to show if user has specific permissions
 */
function PermissionChecker(_a) {
    var roleId = _a.roleId;
    var _b = useEnhancedPermissions_1.useRolePermissions(roleId), permissions = _b.data, isLoading = _b.isLoading;
    var assignPermission = useEnhancedPermissions_1.useAssignPermissionToRole();
    var removePermission = useEnhancedPermissions_1.useRemovePermissionFromRole();
    if (isLoading) {
        return React.createElement("div", null, "Loading permissions...");
    }
    return (React.createElement("div", { className: "space-y-4" },
        React.createElement("h3", { className: "font-semibold" }, "Assigned Permissions"),
        React.createElement("div", { className: "grid grid-cols-1 gap-2" }, Array.isArray(permissions) && permissions.map(function (perm) { return (React.createElement("div", { key: perm.id, className: "flex items-center justify-between p-3 border rounded-lg" },
            React.createElement("div", null,
                React.createElement("div", { className: "font-medium" }, perm.label),
                React.createElement("div", { className: "text-sm text-gray-600" }, perm.description)),
            React.createElement("button", { onClick: function () {
                    return removePermission.mutate({
                        roleId: roleId,
                        permissionId: perm.id
                    });
                }, className: "px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200", disabled: removePermission.isPending }, "Remove"))); }))));
}
exports.PermissionChecker = PermissionChecker;
/**
 * ============================================================================
 * USAGE IN ROUTE CONFIGURATION
 * ============================================================================
 *
 * Example of how to add these pages to your router:
 *
 * <Route path="/settings">
 *   <Route path="" element={<SettingsPage />} />
 *   <Route path="roles" element={<RolesManagementPage />} />
 *   <Route path="dashboard" element={<DashboardSettingsPage />} />
 * </Route>
 */
/**
 * ============================================================================
 * EXAMPLE: MAIN MENU INTEGRATION
 * ============================================================================
 *
 * Add to your main navigation:
 *
 * import { useUserPermissions } from '@/hooks/useUserPermissions';
 *
 * export function MainMenu() {
 *   const { hasPermission } = useUserPermissions();
 *
 *   return (
 *     <nav>
 *       {hasPermission('role.view') && (
 *         <Link href="/settings/roles">
 *           <LockIcon /> Role Management
 *         </Link>
 *       )}
 *       {hasPermission('dashboard.customize') && (
 *         <Link href="/settings/dashboard">
 *           <LayoutGridIcon /> Dashboard
 *         </Link>
 *       )}
 *     </nav>
 *   );
 * }
 */
exports["default"] = SettingsPage;
