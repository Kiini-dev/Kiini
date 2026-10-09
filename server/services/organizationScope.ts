export type OrganizationScopedUser = {
  organizationId?: string | null;
};

export function resolveOrganizationScope(user: OrganizationScopedUser): { organizationId: string | null } {
  const organizationId = user.organizationId?.trim();
  return { organizationId: organizationId || null };
}
