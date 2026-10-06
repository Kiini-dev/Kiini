export type OrganizationScopedUser = {
  organizationId?: string | null;
};

export function resolveOrganizationScope(user: OrganizationScopedUser): { organizationId: string | null } {
  return { organizationId: user.organizationId || null };
}
