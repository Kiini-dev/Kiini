import { describe, expect, it } from 'vitest';
import { getEffectiveOrgUrlMode, getOrgSubdomainSlug, getOrgSubdomainUrl } from '../../client/src/lib/organizationUrl';
import { TIER_DEFAULT_FEATURES } from '../../server/routers/multiTenancy';
import { DEFAULT_TIER_PRICING, getConfiguredTrialDays, parseTierPricingOverrides, resolveTierPricingEntry } from '../../server/services/tierPricing';

describe('multitenancy defaults', () => {
  it('uses subdomains by default for tenant URLs', () => {
    expect(getEffectiveOrgUrlMode()).toBe('subdomain');
  });

  it('does not resolve reserved www or app hosts as tenant slugs', () => {
    expect(getOrgSubdomainSlug('www.kiini.africa')).toBeNull();
    expect(getOrgSubdomainSlug('app.kiini.africa')).toBeNull();
    expect(getOrgSubdomainSlug('mumbike.kiini.africa')).toBe('mumbike');
  });

  it('builds tenant destinations on subdomains while preserving the requested page', () => {
    expect(getOrgSubdomainUrl('mumbike', '/crm-home', 'subdomain'))
      .toBe(`${window.location.protocol}//mumbike.kiini.africa/crm-home`);
    expect(getOrgSubdomainUrl('mumbike', '/crm-home', 'path'))
      .toBe(`${window.location.protocol}//mumbike.kiini.africa/crm-home`);
    expect(getOrgSubdomainUrl('mumbike', '/'))
      .toBe(`${window.location.protocol}//mumbike.kiini.africa/crm-home`);
  });

  it('includes default feature offerings for the gold tier', () => {
    expect(TIER_DEFAULT_FEATURES.gold).toBeDefined();
    expect(TIER_DEFAULT_FEATURES.gold.crm).toBe(true);
    expect(TIER_DEFAULT_FEATURES.gold.hr).toBe(true);
    expect(TIER_DEFAULT_FEATURES.gold.payments).toBe(true);
  });

  it('provides the requested default pricing and user limits', () => {
    expect(DEFAULT_TIER_PRICING).toMatchObject({
      trial: { monthlyKes: 0, annualKes: 0, maxUsers: 5, trialDays: 7 },
      starter: { monthlyKes: 3500, annualKes: 35000, maxUsers: 10 },
      gold: { monthlyKes: 8500, annualKes: 85000, maxUsers: 50 },
      professional: { monthlyKes: 18500, annualKes: 185000, maxUsers: 100 },
      enterprise: { monthlyKes: 59000, annualKes: 590000, maxUsers: 500 },
    });
  });

  it('allows the admin trial duration to override the seven-day default', () => {
    const overrides = parseTierPricingOverrides(JSON.stringify({ trial: { trialDays: 10, adminCustomized: true } }));
    expect(getConfiguredTrialDays(overrides)).toBe(10);
  });

  it('replaces stale unmarked pricing with defaults but preserves admin-edited values', () => {
    const legacy = parseTierPricingOverrides(JSON.stringify({ starter: { monthlyKes: 5999, annualKes: 57590, maxUsers: 10 } }));
    const customized = parseTierPricingOverrides(JSON.stringify({ starter: { monthlyKes: 4200, annualKes: 42000, maxUsers: 12, adminCustomized: true } }));
    expect(resolveTierPricingEntry('starter', legacy).monthlyKes).toBe(3500);
    expect(resolveTierPricingEntry('starter', customized).monthlyKes).toBe(4200);
  });
});
