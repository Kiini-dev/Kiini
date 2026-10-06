import { useAuthWithPersistence } from "./useAuthWithPersistence";
import { usePermissions } from "../context/PermissionContext";
import { useMemo } from "react";
import { FEATURE_ACCESS } from "@/lib/permissions";

/**
 * Hook to check if the current user can access specific features
 * Based on their role and explicit permissions
 */
export function useDashboardPermissions() {
  const { user } = useAuthWithPersistence();
  const { permissions, loading, hasPermission, canAccess } = usePermissions();

  // Map user role to allowed features from FEATURE_ACCESS
  const allowedFeatures = useMemo(() => {
    if (!user?.role) return [];
    const role = user.effectiveRole || user.role;
    
    const features: string[] = [];
    for (const [feature, allowedRoles] of Object.entries(FEATURE_ACCESS)) {
      if (allowedRoles.includes(role as any) || user.effectivePermissions?.includes(feature)) {
        features.push(feature);
      }
    }
    return features;
  }, [user?.role, user?.effectiveRole]);

  const canAccessFeature = (feature: string): boolean => {
    if (!user?.role) return false;
    if (hasPermission(feature) || user.effectivePermissions?.includes(feature)) return true;
    const role = user.effectiveRole || user.role;
    const allowedRoles = FEATURE_ACCESS[feature];
    if (!allowedRoles) return false;
    return allowedRoles.includes(role as any);
  };

  return {
    user,
    permissions,
    loading,
    allowedFeatures,
    canAccessFeature,
    hasPermission,
    canAccess,
    userRole: user?.effectiveRole || user?.role,
  };
}
