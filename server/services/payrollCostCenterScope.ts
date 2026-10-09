export type PayrollCostCenterScopeUser = {
  organizationId?: string | null;
  role?: string | null;
  effectiveRole?: string | null;
};

export function resolvePayrollCostCenterScope(user: PayrollCostCenterScopeUser): string | null {
  if (user.organizationId) return user.organizationId;
  return null;
}
