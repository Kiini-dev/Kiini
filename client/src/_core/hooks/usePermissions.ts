import { useMemo, useCallback, useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

/**
 * Hook for managing and checking user permissions
 * Provides permission-based access control throughout the application
 */
export function usePermissions(userId?: string) {
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>({});
  const [loading, setLoading] = useState(true);

  const { data: userPermissions, isError } = trpc.permissions.getUserPermissions.useQuery(
    userId || "",
    { enabled: !!userId }
  );

  useEffect(() => {
    if (userPermissions) {
      setPermissions(userPermissions);
      setLoading(false);
    } else if (isError) {
      setLoading(false);
    }
  }, [userPermissions, isError]);

  /**
   * Check if user has a specific permission
   */
  const hasPermission = useCallback((permissionId: string): boolean => {
    // Check all categories for the permission
    for (const category in permissions) {
      if (permissions[category][permissionId]) {
        return true;
      }
    }
    return false;
  }, [permissions]);

  /**
   * Check if user has any permission in a category
   */
  const hasAnyInCategory = useCallback((category: string): boolean => {
    return Object.keys(permissions[category] || {}).some(
      (perm) => permissions[category][perm]
    );
  }, [permissions]);

  /**
   * Get all permissions for a specific category
   */
  const getCategoryPermissions = useCallback((category: string): string[] => {
    return Object.entries(permissions[category] || {})
      .filter(([_, granted]) => granted)
      .map(([perm, _]) => perm);
  }, [permissions]);

  /**
   * Check multiple permissions (AND)
   */
  const hasAllPermissions = useCallback(
    (permissionIds: string[]): boolean => {
      return permissionIds.every((perm) => hasPermission(perm));
    },
    [hasPermission]
  );

  /**
   * Check multiple permissions (OR)
   */
  const hasAnyPermission = useCallback(
    (permissionIds: string[]): boolean => {
      return permissionIds.some((perm) => hasPermission(perm));
    },
    [hasPermission]
  );

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyInCategory,
    getCategoryPermissions,
    hasAllPermissions,
    hasAnyPermission,
  };
}

/**
 * Navigation items configuration with permission mapping
 */
export const NAVIGATION_ITEMS = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
    permissions: [], // Always visible
  },
  {
    name: "Invoices",
    href: "/invoices",
    icon: "FileText",
    permissions: ["invoices_view"],
  },
  {
    name: "Estimates",
    href: "/estimates",
    icon: "BarChart3",
    permissions: ["estimates_view"],
  },
  {
    name: "Receipts",
    href: "/receipts",
    icon: "Receipt",
    permissions: ["receipts_view"],
  },
  {
    name: "Payments",
    href: "/payments",
    icon: "DollarSign",
    permissions: ["payments_view"],
  },
  {
    name: "Expenses",
    href: "/expenses",
    icon: "TrendingDown",
    permissions: ["expenses_view"],
  },
  {
    name: "Clients",
    href: "/clients",
    icon: "Users",
    permissions: ["clients_view"],
  },
  {
    name: "Products",
    href: "/products",
    icon: "Package",
    permissions: ["products_view"],
  },
  {
    name: "Projects",
    href: "/projects",
    icon: "FolderOpen",
    permissions: ["projects_view"],
  },
  {
    name: "Reports",
    href: "/reports",
    icon: "BarChart2",
    permissions: ["reports_view"],
  },
  {
    name: "HR",
    href: "/hr",
    icon: "Users",
    permissions: ["hr_view"],
  },
  {
    name: "Admin",
    href: "/admin/management",
    icon: "Settings",
    permissions: ["users_view", "settings_view"],
  },
];

/**
 * Filter navigation items based on user permissions
 */
export function filterNavigationByPermissions(
  navigationItems: typeof NAVIGATION_ITEMS,
  checkPermission: (perm: string) => boolean,
  userRole?: string
): typeof NAVIGATION_ITEMS {
  return navigationItems.filter((item) => {
    // Admin and super_admin always see all items
    if (userRole === "admin" || userRole === "super_admin") {
      return true;
    }

    // If no permissions are required, always show
    if (item.permissions.length === 0) {
      return true;
    }

    // Show if user has any of the required permissions
    return item.permissions.some((perm) => checkPermission(perm));
  });
}
