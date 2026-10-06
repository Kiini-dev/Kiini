/**
 * Hook for organization-level permission-based access control
 * Combines user role, org membership, and org feature availability
 */

import { useCallback, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { canAccessOrgFeature, canAccessOrgFeatureComplete, getAccessibleOrgFeatures } from "@/lib/orgPermissions";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface UseOrgAccessOptions {
  silent?: boolean; // Don't show toast on permission denied
  showReason?: boolean; // Show detailed reason in toast
}

/**
 * Hook for org-level permission checking
 * Returns helper functions to check permissions in org context
 */
export function useOrgAccess(options: UseOrgAccessOptions = {}) {
  const { user } = useAuth();
  const { data: myOrgData } = trpc.multiTenancy.getMyOrg.useQuery(undefined, { staleTime: 300_000 });
  
  const orgFeatureMap = useMemo(() => {
    const rawMap = myOrgData?.featureMap ?? {};
    const plan = String(myOrgData?.organization?.plan || "trial").toLowerCase();
    if (plan === "custom") return rawMap;
    const allowed = new Set([
      "crm","projects","hr","payroll","leave","attendance","invoicing","payments","expenses","procurement","accounting","budgets","reports","ai_hub","communications","tickets","contracts","work_orders",
    ]);
    const tierAllowed = new Set<string>();
    if (plan === "trial") { ["crm","invoicing","reports"].forEach((item) => tierAllowed.add(item)); }
    else if (plan === "starter") { ["crm","invoicing","payments","expenses","tickets","reports"].forEach((item) => tierAllowed.add(item)); }
    else if (plan === "professional") { ["crm","invoicing","payments","expenses","tickets","reports","projects","hr","leave","attendance","accounting","budgets","communications"].forEach((item) => tierAllowed.add(item)); }
    else { ["crm","projects","hr","payroll","leave","attendance","invoicing","payments","expenses","procurement","accounting","budgets","reports","ai_hub","communications","tickets","contracts","work_orders"].forEach((item) => tierAllowed.add(item)); }
    return Object.fromEntries(
      Object.entries(rawMap).map(([key, value]) => {
        const normalized = key.replace(/^org:/, "");
        return [key, tierAllowed.has(normalized) ? Boolean(value) : false];
      })
    );
  }, [myOrgData?.featureMap, myOrgData?.organization?.plan]);
  const userRole = useMemo(() => user?.role ?? "", [user?.role]);

  /**
   * Check if user has role-based access to a feature
   */
  const hasRoleAccess = useCallback((feature: string): boolean => {
    return canAccessOrgFeature(userRole, feature);
  }, [userRole]);

  /**
   * Check if org has feature enabled
   */
  const hasOrgFeature = useCallback((feature: string): boolean => {
    const cleanFeature = feature.startsWith("org:") ? feature.slice(4) : feature;
    return orgFeatureMap[cleanFeature] === true;
  }, [orgFeatureMap]);

  /**
   * Complete check: both role AND org feature
   */
  const hasAccess = useCallback((feature: string): boolean => {
    return canAccessOrgFeatureComplete(userRole, orgFeatureMap, feature);
  }, [userRole, orgFeatureMap]);

  /**
   * Check permission and show error if denied
   */
  const checkAccess = useCallback((feature: string, actionName?: string): boolean => {
    if (hasAccess(feature)) {
      return true;
    }
    
    if (!options.silent) {
      const action = actionName || feature.split(":").pop() || "perform this action";
      let description = `You lack the required permissions to ${action}.`;
      
      if (options.showReason) {
        if (!hasRoleAccess(feature)) {
          description += " Your role does not have access.";
        } else if (!hasOrgFeature(feature)) {
          description += " This feature is not enabled in your organization.";
        }
      }
      
      description += " Contact your administrator if you believe this is an error.";
      
      toast.error("Access Denied", {
        description,
        duration: 5000,
      });
    }
    
    return false;
  }, [hasAccess, hasRoleAccess, hasOrgFeature, options]);

  /**
   * Require permission (async version)
   */
  const requireAccess = useCallback(async (feature: string, actionName?: string): Promise<boolean> => {
    return checkAccess(feature, actionName);
  }, [checkAccess]);

  /**
   * Get all features accessible to this user in this org
   */
  const getAccessibleFeatures = useCallback((): string[] => {
    const roleFeatures = getAccessibleOrgFeatures(userRole);
    // Filter by org features
    return roleFeatures.filter(feature => {
      const cleanFeature = feature.startsWith("org:") ? feature.slice(4) : feature;
      return orgFeatureMap[cleanFeature] !== false; // Include if not explicitly disabled
    });
  }, [userRole, orgFeatureMap]);

  /**
   * Filter navigation items by permission
   */
  const filterNavByPermission = useCallback((navItems: any[]): any[] => {
    return navItems.filter(item => {
      if (!item.featureKey) return true; // No feature key = always show
      return hasAccess(`org:${item.featureKey}`);
    });
  }, [hasAccess]);

  return {
    // Basic checks
    hasRoleAccess,
    hasOrgFeature,
    hasAccess,
    
    // Advanced checks
    checkAccess,
    requireAccess,
    
    // Utilities
    getAccessibleFeatures,
    filterNavByPermission,
    
    // Context
    userRole,
    orgFeatureMap,
    isLoading: !myOrgData,
    isOrgAdmin: user?.organizationRole === "admin" || user?.role === "admin" || user?.role === "super_admin",
  };
}

/**
 * Hook to require a specific feature with automatic error handling
 */
export function useRequireOrgFeature(feature: string, actionName?: string) {
  const { hasAccess, checkAccess } = useOrgAccess();
  
  return {
    hasAccess: hasAccess(`org:${feature}`),
    check: () => checkAccess(`org:${feature}`, actionName),
  };
}
