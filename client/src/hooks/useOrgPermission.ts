import { useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { canAccessFeature } from "@/lib/permissions";
import { toast } from "sonner";

/**
 * Hook for permission-based access control in org modules
 * Returns helper functions to check permissions and show appropriate errors
 */
export function useOrgPermission() {
  const { user } = useAuth();

  const hasPermission = useCallback((featureName: string): boolean => {
    return canAccessFeature(user?.role ?? "", featureName);
  }, [user?.role]);

  const checkPermission = useCallback((featureName: string, actionName?: string): boolean => {
    if (hasPermission(featureName)) {
      return true;
    }
    
    // Show user-friendly permission error
    const action = actionName || featureName.split(":").pop() || "perform this action";
    toast.error("Access Denied", {
      description: `You lack the required permissions to ${action}. Contact your administrator if you believe this is an error.`,
      duration: 5000,
    });
    
    return false;
  }, [hasPermission]);

  const requirePermission = useCallback(async (featureName: string, actionName?: string): Promise<boolean> => {
    return checkPermission(featureName, actionName);
  }, [checkPermission]);

  return {
    hasPermission,
    checkPermission,
    requirePermission,
    userRole: user?.role ?? "",
  };
}
