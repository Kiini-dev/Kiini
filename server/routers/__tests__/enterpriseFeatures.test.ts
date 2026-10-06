import { beforeEach, describe, expect, it, vi } from 'vitest';
import { enterpriseFeaturesRouter } from '../enterpriseFeatures';

vi.mock('../../db', () => ({
  getOrganization: vi.fn(),
  getOrganizationSettings: vi.fn(),
  updateOrganization: vi.fn(),
  getUsersByOrganization: vi.fn(),
  getOrganizationSubscription: vi.fn(),
  getPricingPlan: vi.fn(),
  getBillingUsageSummary: vi.fn(),
  createExportJob: vi.fn(),
}));

import * as db from '../../db';

describe('Enterprise Features Router persistence', () => {
  beforeEach(() => {
    (db.getOrganization as any).mockReset();
    (db.getOrganizationSettings as any).mockReset();
    (db.updateOrganization as any).mockReset();
    (db.getUsersByOrganization as any).mockReset();
    (db.getOrganizationSubscription as any).mockReset();
    (db.getPricingPlan as any).mockReset();
    (db.getBillingUsageSummary as any).mockReset();
    (db.createExportJob as any).mockReset();
  });

  it('configures white label and persists settings', async () => {
    (db.getOrganization as any).mockResolvedValue({ id: 'org1', settings: {} });
    (db.getOrganizationSettings as any).mockResolvedValue({});
    (db.updateOrganization as any).mockResolvedValue({});

    const caller = enterpriseFeaturesRouter.createCaller({ user: { id: 'u1', role: 'super_admin', organizationId: 'org1' } } as any);
    const response = await caller.configureWhiteLabel({
      companyName: 'Acme Systems',
      supportEmail: 'support@acme.example',
      hideKiiniLogo: true,
    });

    expect(response.success).toBe(true);
    expect(response.config.companyName).toBe('Acme Systems');
    expect(response.config.hideKiiniLogo).toBe(true);
    expect(db.updateOrganization).toHaveBeenCalledWith('org1', expect.objectContaining({
      settings: expect.objectContaining({
        enterprise: expect.objectContaining({
          whiteLabel: expect.objectContaining({ companyName: 'Acme Systems' }),
        }),
      }),
    }));
  });

  it('returns stored white-label configuration', async () => {
    (db.getOrganization as any).mockResolvedValue({ id: 'org1', settings: { enterprise: { whiteLabel: { companyName: 'Acme Systems', primaryColor: '#112233' } } } });
    (db.getOrganizationSettings as any).mockResolvedValue({ enterprise: { whiteLabel: { companyName: 'Acme Systems', primaryColor: '#112233' } } });

    const caller = enterpriseFeaturesRouter.createCaller({ user: { id: 'u1', role: 'super_admin', organizationId: 'org1' } } as any);
    const response = await caller.getWhiteLabelConfig();

    expect(response.success).toBe(true);
    expect(response.config.companyName).toBe('Acme Systems');
    expect(response.config.primaryColor).toBe('#112233');
  });

  it('stores SSO config and returns sanitized settings', async () => {
    (db.getOrganization as any).mockResolvedValue({ id: 'org1', settings: {} });
    (db.getOrganizationSettings as any).mockResolvedValue({});
    (db.updateOrganization as any).mockResolvedValue({});

    const caller = enterpriseFeaturesRouter.createCaller({ user: { id: 'u1', role: 'super_admin', organizationId: 'org1' } } as any);
    const result = await caller.configureSSOSettings({
      ssoType: 'oidc',
      name: 'Acme Login',
      idpUrl: 'https://idp.example.com',
      clientId: 'client-id',
      clientSecret: 'secret',
      mappings: { emailField: 'email', nameField: 'name' },
      autoProvision: true,
      forceSSO: false,
    });

    expect(result.success).toBe(true);
    expect(db.updateOrganization).toHaveBeenCalledWith('org1', expect.objectContaining({
      settings: expect.objectContaining({
        enterprise: expect.objectContaining({
          sso: expect.objectContaining({
            name: 'Acme Login',
            ssoType: 'oidc',
          }),
        }),
      }),
    }));

    (db.getOrganization as any).mockResolvedValue({ id: 'org1', settings: { enterprise: { sso: { name: 'Acme Login', ssoType: 'oidc', clientSecret: 'secret', idpUrl: 'https://idp.example.com', clientId: 'client-id', mappings: { emailField: 'email', nameField: 'name' }, autoProvision: true, forceSSO: false, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } } } });
    (db.getOrganizationSettings as any).mockResolvedValue({ enterprise: { sso: { name: 'Acme Login', ssoType: 'oidc', clientSecret: 'secret', idpUrl: 'https://idp.example.com', clientId: 'client-id', mappings: { emailField: 'email', nameField: 'name' }, autoProvision: true, forceSSO: false, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } } });
    const readResult = await caller.getSSOSettings();

    expect(readResult.success).toBe(true);
    expect(readResult.sso).toEqual({ name: 'Acme Login', ssoType: 'oidc', idpUrl: 'https://idp.example.com', clientId: 'client-id', mappings: { emailField: 'email', nameField: 'name' }, autoProvision: true, forceSSO: false, isActive: true, createdAt: expect.any(String), updatedAt: expect.any(String) });
    expect((readResult.sso as any).clientSecret).toBeUndefined();
  });

  it('creates workflow template and stores it in settings', async () => {
    (db.getOrganization as any).mockResolvedValue({ id: 'org1', settings: {} });
    (db.getOrganizationSettings as any).mockResolvedValue({});
    (db.updateOrganization as any).mockResolvedValue({});

    const caller = enterpriseFeaturesRouter.createCaller({ user: { id: 'u1', role: 'super_admin', organizationId: 'org1' } } as any);
    const workflowInput = {
      name: 'Invoice to Payment',
      category: 'invoice_to_payment' as const,
      steps: [{ name: 'Approve invoice', action: 'approve' }],
      triggers: ['invoice_created'],
      description: 'Payment approval workflow',
      isTemplate: true,
    };

    const response = await caller.createWorkflowTemplate(workflowInput);
    expect(response.success).toBe(true);
    expect(response.workflow.name).toBe('Invoice to Payment');
    expect(db.updateOrganization).toHaveBeenCalledWith('org1', expect.objectContaining({
      settings: expect.objectContaining({
        enterprise: expect.objectContaining({
          workflows: expect.arrayContaining([expect.objectContaining({ name: 'Invoice to Payment' })]),
        }),
      }),
    }));
  });

  it('returns enterprise feature usage from settings and billing metrics', async () => {
    (db.getOrganization as any).mockResolvedValue({ id: 'org1', settings: { enterprise: { whiteLabel: { isActive: true, customDomain: 'app.acme.com' }, sso: { id: 'sso1' }, workflows: [{ id: 'wf1' }], teamWorkflows: { dept1: { id: 'tw1' } } } } });
    (db.getOrganizationSettings as any).mockResolvedValue({ enterprise: { whiteLabel: { isActive: true, customDomain: 'app.acme.com' }, sso: { id: 'sso1' }, workflows: [{ id: 'wf1' }], teamWorkflows: { dept1: { id: 'tw1' } } } });
    (db.getUsersByOrganization as any).mockResolvedValue([{ id: 'u1' }, { id: 'u2' }]);
    (db.getOrganizationSubscription as any).mockResolvedValue({ id: 'sub1', planId: 'plan1', storageUsedGB: 12 });
    (db.getPricingPlan as any).mockResolvedValue({ id: 'plan1', maxStorageGB: 50 });
    (db.getBillingUsageSummary as any).mockResolvedValue({ totalApiCalls: 420 });

    const caller = enterpriseFeaturesRouter.createCaller({ user: { id: 'u1', role: 'super_admin', organizationId: 'org1' } } as any);
    const response = await caller.getFeatureUsage();

    expect(response.success).toBe(true);
    expect(response.usage).toMatchObject({
      whiteLabelEnabled: true,
      ssoConfigured: true,
      customDomainActive: true,
      workflowCount: 2,
      userCount: 2,
      apiCallsThisMonth: 420,
      storageUsedGB: 12,
      maxStorageGB: 50,
    });
  });

  it('queues export job for organization data export', async () => {
    (db.getOrganization as any).mockResolvedValue({ id: 'org1', settings: {} });
    (db.createExportJob as any).mockResolvedValue({});

    const caller = enterpriseFeaturesRouter.createCaller({ user: { id: 'u1', role: 'super_admin', organizationId: 'org1' } } as any);
    const response = await caller.exportOrganizationData({ format: 'json', includeUsers: true, includeTransactions: false, includeTemplates: true });

    expect(response.success).toBe(true);
    expect(response.exportId).toBeTruthy();
    expect(db.createExportJob).toHaveBeenCalledWith(expect.objectContaining({
      dataType: 'organization_export',
      format: 'json',
      status: 'processing',
      createdBy: 'u1',
    }));
  });
});
