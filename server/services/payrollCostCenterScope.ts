export type PayrollCostCenterScopeUser = {
  organizationId?: string | null;
  role?: string | null;
  effectiveRole?: string | null;
};

export function resolvePayrollCostCenterScope(user: PayrollCostCenterScopeUser): string | null | undefined {
  if (user.organizationId) return user.organizationId;
  if (user.role === "super_admin" || user.effectiveRole === "super_admin") return null;
  return undefined;
}
