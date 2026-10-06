"use strict";
exports.__esModule = true;
exports.filterNavigationByPermissions = exports.NAVIGATION_ITEMS = exports.usePermissions = void 0;
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
/**
 * Hook for managing and checking user permissions
 * Provides permission-based access control throughout the application
 */
function usePermissions(userId) {
    var _a = react_1.useState({}), permissions = _a[0], setPermissions = _a[1];
    var _b = react_1.useState(true), loading = _b[0], setLoading = _b[1];
    var userPermissions = trpc_1.trpc.permissions.getUserPermissions.useQuery(userId || "", { enabled: !!userId }).data;
    react_1.useEffect(function () {
        if (userPermissions) {
            setPermissions(userPermissions);
            setLoading(false);
        }
    }, [userPermissions]);
    /**
     * Check if user has a specific permission
     */
    var hasPermission = react_1.useCallback(function (permissionId) {
        // Check all categories for the permission
        for (var category in permissions) {
            if (permissions[category][permissionId]) {
                return true;
            }
        }
        return false;
    }, [permissions]);
    /**
     * Check if user has any permission in a category
     */
    var hasAnyInCategory = react_1.useCallback(function (category) {
        return Object.keys(permissions[category] || {}).some(function (perm) { return permissions[category][perm]; });
    }, [permissions]);
    /**
     * Get all permissions for a specific category
     */
    var getCategoryPermissions = react_1.useCallback(function (category) {
        return Object.entries(permissions[category] || {})
            .filter(function (_a) {
            var _ = _a[0], granted = _a[1];
            return granted;
        })
            .map(function (_a) {
            var perm = _a[0], _ = _a[1];
            return perm;
        });
    }, [permissions]);
    /**
     * Check multiple permissions (AND)
     */
    var hasAllPermissions = react_1.useCallback(function (permissionIds) {
        return permissionIds.every(function (perm) { return hasPermission(perm); });
    }, [hasPermission]);
    /**
     * Check multiple permissions (OR)
     */
    var hasAnyPermission = react_1.useCallback(function (permissionIds) {
        return permissionIds.some(function (perm) { return hasPermission(perm); });
    }, [hasPermission]);
    return {
        permissions: permissions,
        loading: loading,
        hasPermission: hasPermission,
        hasAnyInCategory: hasAnyInCategory,
        getCategoryPermissions: getCategoryPermissions,
        hasAllPermissions: hasAllPermissions,
        hasAnyPermission: hasAnyPermission
    };
}
exports.usePermissions = usePermissions;
/**
 * Navigation items configuration with permission mapping
 */
exports.NAVIGATION_ITEMS = [
    {
        name: "Dashboard",
        href: "/dashboard",
        icon: "LayoutDashboard",
        permissions: []
    },
    {
        name: "Invoices",
        href: "/invoices",
        icon: "FileText",
        permissions: ["invoices_view"]
    },
    {
        name: "Estimates",
        href: "/estimates",
        icon: "BarChart3",
        permissions: ["estimates_view"]
    },
    {
        name: "Receipts",
        href: "/receipts",
        icon: "Receipt",
        permissions: ["receipts_view"]
    },
    {
        name: "Payments",
        href: "/payments",
        icon: "DollarSign",
        permissions: ["payments_view"]
    },
    {
        name: "Expenses",
        href: "/expenses",
        icon: "TrendingDown",
        permissions: ["expenses_view"]
    },
    {
        name: "Clients",
        href: "/clients",
        icon: "Users",
        permissions: ["clients_view"]
    },
    {
        name: "Products",
        href: "/products",
        icon: "Package",
        permissions: ["products_view"]
    },
    {
        name: "Projects",
        href: "/projects",
        icon: "FolderOpen",
        permissions: ["projects_view"]
    },
    {
        name: "Reports",
        href: "/reports",
        icon: "BarChart2",
        permissions: ["reports_view"]
    },
    {
        name: "HR",
        href: "/hr",
        icon: "Users",
        permissions: ["hr_view"]
    },
    {
        name: "Admin",
        href: "/admin/management",
        icon: "Settings",
        permissions: ["users_view", "settings_view"]
    },
];
/**
 * Filter navigation items based on user permissions
 */
function filterNavigationByPermissions(navigationItems, checkPermission, userRole) {
    return navigationItems.filter(function (item) {
        // Admin and super_admin always see all items
        if (userRole === "admin" || userRole === "super_admin") {
            return true;
        }
        // If no permissions are required, always show
        if (item.permissions.length === 0) {
            return true;
        }
        // Show if user has any of the required permissions
        return item.permissions.some(function (perm) { return checkPermission(perm); });
    });
}
exports.filterNavigationByPermissions = filterNavigationByPermissions;
