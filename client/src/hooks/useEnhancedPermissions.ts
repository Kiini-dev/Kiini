import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";

/**
 * Hook for fetching all permissions with metadata
 */
export const usePermissions = () => {
  return trpc.enhancedPermissions.list.useQuery();
};

/**
 * Hook for fetching permissions by category
 */
export const usePermissionsByCategory = (category: string) => {
  return trpc.enhancedPermissions.getByCategory.useQuery(category, { enabled: !!category });
};

/**
 * Hook for fetching all permission categories
 */
export const usePermissionCategories = () => {
  return trpc.enhancedPermissions.getCategories.useQuery();
};

/**
 * Hook for getting permissions for a specific role
 */
export const useRolePermissions = (roleId: string | null) => {
  return trpc.enhancedPermissions.getForRole.useQuery(roleId!, { enabled: !!roleId });
};

/**
 * Hook for assigning permission to role
 */
export const useAssignPermissionToRole = () => {
  const queryClient = useQueryClient();

  return trpc.enhancedPermissions.assignToRole.useMutation({
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["permissions", "role", variables.roleId] });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

/**
 * Hook for removing permission from role
 */
export const useRemovePermissionFromRole = () => {
  const queryClient = useQueryClient();

  return trpc.enhancedPermissions.removeFromRole.useMutation({
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["permissions", "role", variables.roleId] });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

/**
 * Hook for fetching permission audit log
 */
export const usePermissionAuditLog = (roleId?: string, limit: number = 100, offset: number = 0) => {
  return trpc.enhancedPermissions.getAuditLog.useQuery(
    { roleId, limit, offset },
    { enabled: true }
  );
};

/**
 * Hook for searching permissions
 */
export const useSearchPermissions = (query: string) => {
  return trpc.enhancedPermissions.search.useQuery(query, { enabled: query.length > 0 });
};

/**
 * Hook for getting permission detail
 */
export const usePermissionDetail = (permissionId: string | null) => {
  return trpc.enhancedPermissions.getDetail.useQuery(permissionId!, { enabled: !!permissionId });
};
