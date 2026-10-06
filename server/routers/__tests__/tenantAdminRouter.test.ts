import { describe, expect, it, vi, beforeEach } from 'vitest';

const { mockCreateUser, mockGetUserByEmail, mockGetUserById, mockAssignUserToOrganization, mockUpsertUser, mockGetOrganization, mockGetAllOrganizations, mockSetOrganizationFeature, mockHardDeleteUser, mockGetAllTenantSuperAdmins, mockGetOrganizationBySlug, mockCreateOrganization, mockGetPricingTierFeatures, mockGetPricingPlan, mockCreateSubscription } = vi.hoisted(() => ({
  mockCreateUser: vi.fn(),
  mockGetUserByEmail: vi.fn(),
  mockGetUserById: vi.fn(),
  mockAssignUserToOrganization: vi.fn(),
  mockUpsertUser: vi.fn(),
  mockGetOrganization: vi.fn(),
  mockGetAllOrganizations: vi.fn(async () => [{ id: 'org_1', name: 'Org One', slug: 'org-one', isArchived: 0, plan: 'trial' }]),
  mockSetOrganizationFeature: vi.fn(),
  mockHardDeleteUser: vi.fn(),
  mockGetAllTenantSuperAdmins: vi.fn(),
  mockGetOrganizationBySlug: vi.fn(),
  mockCreateOrganization: vi.fn(),
  mockGetPricingTierFeatures: vi.fn(async () => []),
  mockGetPricingPlan: vi.fn(async () => ({ monthlyPrice: 0, annualPrice: 0 })),
  mockCreateSubscription: vi.fn(async () => ({ id: 'sub_1' })),
}));

vi.mock('../../db-users', () => ({
  getUserByEmail: mockGetUserByEmail,
  getUserById: mockGetUserById,
  createUser: mockCreateUser,
  updateUser: vi.fn(async (_id: string, updates: any) => ({ id: _id, ...updates })),
  hardDeleteUser: mockHardDeleteUser,
}));

vi.mock('../../db', () => ({
  getOrganization: mockGetOrganization,
  getAllOrganizations: mockGetAllOrganizations,
  assignUserToOrganization: mockAssignUserToOrganization,
  upsertUser: mockUpsertUser,
  setOrganizationFeature: mockSetOrganizationFeature,
  getOrganizationFeatures: vi.fn(async () => []),
  getUsersByOrganization: vi.fn(async () => []),
  getAllTenantSuperAdmins: mockGetAllTenantSuperAdmins,
  getUserById: mockGetUserById,
  getDb: vi.fn(async () => null),
  getOrganizationBySlug: mockGetOrganizationBySlug,
  createOrganization: mockCreateOrganization,
  getPricingTierFeatures: mockGetPricingTierFeatures,
  getPricingPlan: mockGetPricingPlan,
  createSubscription: mockCreateSubscription,
}));

import { multiTenancyRouter } from '../multiTenancy';

describe('multiTenancy tenant admin router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an empty organization list instead of crashing when legacy schema columns are missing', async () => {
    mockGetAllOrganizations.mockRejectedValue(new Error('Unknown column "urlMode" in field list'));
    const caller = multiTenancyRouter.createCaller({ user: { id: 'admin-1', role: 'super_admin' } as any });

    await expect(caller.listOrganizations({ includeArchived: true })).resolves.toMatchObject({ organizations: [] });
  });

  it('creates a tenant admin for a given organization', async () => {
    mockGetUserByEmail.mockResolvedValue(null);
    mockCreateUser.mockResolvedValue({ id: 'u_1', name: 'Jane Admin', email: 'jane@example.com', role: 'super_admin', organizationId: 'org_1' });

    const caller = multiTenancyRouter.createCaller({ user: { id: 'admin-1', role: 'super_admin' } as any });
    const result = await caller.createTenantAdmin({ name: 'Jane Admin', email: 'jane@example.com', organizationId: 'org_1' });

    expect(mockCreateUser).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Jane Admin',
      email: 'jane@example.com',
      role: 'super_admin',
      organizationId: 'org_1',
    }));
    expect(result.success).toBe(true);
  });

  it('updates tenant admin organization scope and keeps the user record', async () => {
    mockGetUserById.mockResolvedValue({ id: 'u_2', name: 'Old Name', email: 'old@example.com', organizationId: 'org_1' });
    const caller = multiTenancyRouter.createCaller({ user: { id: 'admin-1', role: 'super_admin' } as any });

    const result = await caller.updateTenantAdmin({ id: 'u_2', organizationId: 'org_2', name: 'Updated Name', email: 'updated@example.com' });

    expect(mockAssignUserToOrganization).toHaveBeenCalledWith('u_2', 'org_2');
    expect(result.success).toBe(true);
    expect(result.user).toMatchObject({ id: 'u_2', name: 'Updated Name', email: 'updated@example.com' });
  });

  it('hard deletes the tenant admin record when removing it', async () => {
    mockGetUserById.mockResolvedValue({ id: 'u_3', name: 'Delete Me', email: 'delete@example.com', organizationId: 'org_1' });
    mockHardDeleteUser.mockResolvedValue(true);
    const caller = multiTenancyRouter.createCaller({ user: { id: 'admin-1', role: 'super_admin' } as any });

    const result = await caller.deleteTenantAdmin({ id: 'u_3' });

    expect(mockHardDeleteUser).toHaveBeenCalledWith('u_3');
    expect(mockAssignUserToOrganization).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  it('keeps tenant admin listing alive when the linked organization lookup fails', async () => {
    mockGetOrganization.mockRejectedValue(new Error('organization lookup failed'));
    mockGetAllTenantSuperAdmins.mockResolvedValue([
      { id: 'u_4', name: 'Jane', email: 'jane@example.com', role: 'super_admin', organizationId: 'org_999', isActive: 1 },
    ]);

    const caller = multiTenancyRouter.createCaller({ user: { id: 'admin-1', role: 'super_admin' } as any });
    const result = await caller.listTenantAdmins();

    expect(result.admins).toHaveLength(1);
    expect(result.admins[0]).toMatchObject({
      id: 'u_4',
      organizationName: '—',
      organizationSlug: '—',
      organizationPlan: '—',
    });
  });

  it('blocks org-scoped super admins from reading global pricing tier data', async () => {
    const caller = multiTenancyRouter.createCaller({ user: { id: 'org-admin-1', role: 'super_admin', organizationId: 'org_1' } as any });

    await expect(caller.getPlanPrices()).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(caller.getTierDefaults()).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(caller.getPricingTierFeatures({ tier: 'trial' })).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(caller.getAllPricingTierFeatures()).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('prevents a trial org from enabling features outside its plan tier', async () => {
    mockGetOrganization.mockResolvedValue({ id: 'org_1', plan: 'trial', isActive: 1, name: 'Trial Org' });
    const caller = multiTenancyRouter.createCaller({ user: { id: 'org-admin-1', role: 'super_admin', organizationId: 'org_1' } as any });

    await expect(caller.setOrgFeature({ organizationId: 'org_1', featureKey: 'projects', isEnabled: true })).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(mockSetOrganizationFeature).not.toHaveBeenCalled();
  });

  it('creates an org with admin even when slug lookup throws a legacy schema error', async () => {
    mockGetOrganizationBySlug.mockRejectedValue(new Error('Unknown column "urlMode" in field list'));
    mockCreateOrganization.mockResolvedValue({ id: 'org_123', slug: 'mumbi-ke', name: 'Mumbi Ke Org' });
    mockCreateUser.mockResolvedValue({ id: 'u_admin', name: 'Mumbi Ke', email: 'admin@mumbi-ke.com', role: 'super_admin', organizationId: 'org_123' });
    mockSetOrganizationFeature.mockResolvedValue(undefined);
    mockCreateSubscription.mockResolvedValue({ id: 'sub_123' });

    const caller = multiTenancyRouter.createCaller({ user: { id: 'admin-1', role: 'super_admin' } as any });
    const result = await caller.createOrganizationWithAdmin({
      name: 'Mumbi Ke Org',
      slug: 'mumbi-ke',
      plan: 'trial',
      billingCycle: 'monthly',
      adminMode: 'create',
      adminName: 'Mumbi Ke',
      adminEmail: 'admin@mumbi-ke.com',
      adminPassword: 'password123',
    });

    expect(result.success).toBe(true);
    expect(result.organization).toMatchObject({ id: 'org_123', slug: 'mumbi-ke' });
    expect(mockCreateOrganization).toHaveBeenCalled();
  });

  it('promotes the first assigned org account before syncing membership role', async () => {
    mockGetOrganizationBySlug.mockResolvedValue(null);
    mockCreateOrganization.mockResolvedValue({ id: 'org_456', slug: 'org-four-five-six', name: 'Org 456' });
    mockUpsertUser.mockResolvedValue(undefined);
    mockCreateSubscription.mockResolvedValue({ id: 'sub_456' });

    const caller = multiTenancyRouter.createCaller({ user: { id: 'admin-1', role: 'super_admin' } as any });
    const result = await caller.createOrganizationWithAdmin({
      name: 'Org 456',
      slug: 'org-four-five-six',
      plan: 'trial',
      billingCycle: 'monthly',
      adminMode: 'assign',
      existingUserId: 'user-first',
    });

    expect(result.success).toBe(true);
    expect(mockUpsertUser).toHaveBeenCalledWith({ id: 'user-first', role: 'super_admin' });
    const createdOrganizationId = mockCreateOrganization.mock.calls[0][0].id;
    expect(mockAssignUserToOrganization).toHaveBeenCalledWith('user-first', createdOrganizationId);
    expect(mockUpsertUser.mock.invocationCallOrder[0]).toBeLessThan(mockAssignUserToOrganization.mock.invocationCallOrder[0]);
  });

  it('applies tier defaults to org feature maps when no explicit org feature rows exist', async () => {
    mockGetOrganization.mockResolvedValue({ id: 'org_1', plan: 'trial', isActive: 1, name: 'Trial Org', slug: 'trial-org' });
    const caller = multiTenancyRouter.createCaller({ user: { id: 'org-admin-1', role: 'super_admin', organizationId: 'org_1' } as any });

    const result = await caller.getMyOrg();

    expect(result.featureMap.crm).toBe(true);
    expect(result.featureMap.invoicing).toBe(true);
    expect(result.featureMap.reports).toBe(true);
    expect(result.featureMap.projects).toBe(false);
  });
});
