export type P9ScopeUser = {
  organizationId?: string | null;
  role?: string | null;
  effectiveRole?: string | null;
};

export function resolveP9OrganizationScope(user: P9ScopeUser): string | null {
  if (user.organizationId) return user.organizationId;
  return null;
}
