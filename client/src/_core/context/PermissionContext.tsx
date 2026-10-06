import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { trpc } from "@/lib/trpc";
import { useAuthWithPersistence } from "../hooks/useAuthWithPersistence";

/**
 * Permission context to provide user permissions throughout the app
 */
interface PermissionContextType {
  permissions: Record<string, Record<string, boolean>>;
  loading: boolean;
  hasPermission: (permissionId: string) => boolean;
  hasAnyPermission: (permissionIds: string[]) => boolean;
  hasAllPermissions: (permissionIds: string[]) => boolean;
  canAccess: (feature: string) => boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuthWithPersistence();
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>({});
  const [loading, setLoading] = useState(false);

  // Fetch permissions when user changes
  const userPermissionsQuery = trpc.permissions.getUserPermissions.useQuery(
    user?.id || "",
    {
      enabled: !!user?.id,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  useEffect(() => {
    if (userPermissionsQuery.isLoading) {
      setLoading(true);
    } else if (userPermissionsQuery.data) {
      setPermissions(userPermissionsQuery.data);
      setLoading(false);
    } else if (userPermissionsQuery.isError) {
      setLoading(false);
    }
  }, [userPermissionsQuery.isLoading, userPermissionsQuery.data, userPermissionsQuery.isError]);

  const hasPermission = (permissionId: string): boolean => {
    if ((user as any)?.effectivePermissions?.includes(permissionId)) return true;
    for (const category of Object.values(permissions)) {
      if (category[permissionId] === true) {
        return true;
      }
    }
    return false;
  };

  const hasAnyPermission = (permissionIds: string[]): boolean => {
    return permissionIds.some(hasPermission);
  };

  const hasAllPermissions = (permissionIds: string[]): boolean => {
    return permissionIds.every(hasPermission);
  };

  // For feature-based access control using the FEATURE_ACCESS mapping from permissions.ts
  const canAccess = (feature: string): boolean => {
    // This will be enhanced by checking against the FEATURE_ACCESS mapping
    // For now, if user has any permissions, they can access
    return Object.values(permissions).some(
      (category) => Object.values(category).some((perm) => perm === true)
    );
  };

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        loading,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        canAccess,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermissions must be used within PermissionProvider");
  }
  return context;
};
