/**
 * Row-Level Security (RLS) System
 * Restricts data visibility based on user's department, team, and organizational hierarchy
 */

import { useCallback, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export interface RLSContext {
  userId: string;
  orgId: string;
  departmentId?: string;
  teamId?: string;
  managedUserIds?: string[];
  restrictionLevel?: "own" | "team" | "department" | "organization" | "all";
}

export interface RLSFilter {
  field: string;
  operator: "eq" | "in" | "neq" | "nin";
  value: any;
}

/**
 * Hook for applying row-level security filters to queries
 */
export function useRowLevelSecurity() {
  const { user } = useAuth();

  /**
   * Build RLS filters based on user role and context
   */
  const buildRLSFilters = useCallback(
    (resourceType: string): RLSFilter[] => {
      if (!user?.id) return [];

      const filters: RLSFilter[] = [];

      // Role-based restrictions
      switch (user.role) {
        case "super_admin":
          // No restrictions - can see everything
          break;

        case "admin":
          // Can see entire organization
          filters.push({
            field: "orgId",
            operator: "eq",
            value: user.orgId,
          });
          break;

        case "accountant":
          // Can see financial records for entire organization
          if (resourceType === "invoices" || resourceType === "expenses" || resourceType === "payments") {
            filters.push({
              field: "orgId",
              operator: "eq",
              value: user.orgId,
            });
          } else {
            // Cannot see other departments' data
            filters.push({
              field: "departmentId",
              operator: "eq",
              value: user.departmentId,
            });
          }
          break;

        case "hr":
          // Can see employees in same department or managed
          filters.push({
            field: "departmentId",
            operator: "eq",
            value: user.departmentId,
          });
          break;

        case "manager":
        case "procurement_manager":
        case "project_manager":
        case "sales_manager":
          // Can see team members' data
          filters.push({
            field: "userId",
            operator: "in",
            value: [user.id, ...(user.managedUserIds || [])],
          });
          break;

        case "staff":
        default:
          // Can only see own data
          filters.push({
            field: "userId",
            operator: "eq",
            value: user.id,
          });
          break;
      }

      // Department-level restriction
      if (user.departmentId && !["super_admin", "admin"].includes(user.role || "")) {
        filters.push({
          field: "departmentId",
          operator: "eq",
          value: user.departmentId,
        });
      }

      return filters;
    },
    [user]
  );

  /**
   * Check if user can access a specific record
   */
  const canAccessRecord = useCallback(
    (record: any): boolean => {
      if (!user?.id) return false;

      // Super admin can access everything
      if (user.role === "super_admin") return true;

      // Check organization
      if (record.orgId && record.orgId !== user.orgId) return false;

      // Check ownership
      if (record.userId === user.id) return true;

      // Check if user manages this person
      if (user.managedUserIds?.includes(record.userId)) return true;

      // Check department access
      if (record.departmentId === user.departmentId) {
        // Department members can access records
        return !["staff"].includes(user.role || "");
      }

      return false;
    },
    [user]
  );

  /**
   * Filter array of records based on RLS
   */
  const filterRecords = useCallback(
    (records: any[]): any[] => {
      return records.filter((record) => canAccessRecord(record));
    },
    [canAccessRecord]
  );

  /**
   * Build query filter object for tRPC procedures
   */
  const buildQueryFilters = useCallback(
    (resourceType: string) => {
      const filters = buildRLSFilters(resourceType);
      return filters.reduce((acc, filter) => {
        acc[filter.field] = { [filter.operator]: filter.value };
        return acc;
      }, {} as Record<string, any>);
    },
    [buildRLSFilters]
  );

  /**
   * Get visibility scope for user
   */
  const getVisibilityScope = useCallback((): RLSContext => {
    return {
      userId: user?.id || "",
      orgId: user?.orgId || "",
      departmentId: user?.departmentId,
      teamId: user?.teamId,
      managedUserIds: user?.managedUserIds || [],
      restrictionLevel: getRoleRestrictionLevel(user?.role),
    };
  }, [user]);

  return {
    buildRLSFilters,
    canAccessRecord,
    filterRecords,
    buildQueryFilters,
    getVisibilityScope,
  };
}

/**
 * Determine restriction level for a role
 */
function getRoleRestrictionLevel(
  role?: string
): "own" | "team" | "department" | "organization" | "all" {
  switch (role) {
    case "super_admin":
      return "all";
    case "admin":
      return "organization";
    case "accountant":
    case "hr":
      return "department";
    case "manager":
    case "project_manager":
    case "sales_manager":
    case "procurement_manager":
      return "team";
    default:
      return "own";
  }
}

/**
 * Hook to fetch and apply RLS-filtered data
 */
export function useRLSFilteredQuery<T>(
  resourceType: string,
  queryFn: (filters: any) => any,
  options?: { staleTime?: number }
) {
  const { buildQueryFilters } = useRowLevelSecurity();
  const filters = useMemo(() => buildQueryFilters(resourceType), [resourceType, buildQueryFilters]);

  return queryFn({
    ...filters,
    staleTime: options?.staleTime || 60_000,
  });
}

/**
 * Hook to get users visible to current user (for delegation, assignment, etc.)
 */
export function useVisibleUsers() {
  const { user } = useAuth();

  return trpc.users.listVisibleUsers.useQuery(
    {
      departmentId: user?.departmentId,
      restrictionLevel: getRoleRestrictionLevel(user?.role),
    },
    { staleTime: 60_000 }
  );
}

/**
 * Hook to get data accessible to user
 */
export function useAccessibleData<T>(resourceType: string) {
  const { buildQueryFilters } = useRowLevelSecurity();
  const filters = useMemo(() => buildQueryFilters(resourceType), [resourceType, buildQueryFilters]);

  // This would be implemented based on your specific data fetching patterns
  return {
    filters,
    buildQuery: (baseQuery: any) => ({ ...baseQuery, ...filters }),
  };
}

/**
 * Helper to apply RLS to a query configuration
 */
export function applyRLSToQuery(resourceType: string, baseConfig: any) {
  // This should be called from useQuery options
  const { buildQueryFilters } = useRowLevelSecurity();
  const filters = buildQueryFilters(resourceType);

  return {
    ...baseConfig,
    where: {
      ...baseConfig.where,
      ...filters,
    },
  };
}
