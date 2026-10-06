export const DEFAULT_TIER_PRICING = {
  trial: { label: 'Trial', monthlyKes: 0, annualKes: 0, maxUsers: 5, trialDays: 7, description: 'Free for 7 days' },
  starter: { label: 'Starter', monthlyKes: 3500, annualKes: 35000, maxUsers: 10, trialDays: 0, description: 'Core business tools' },
  gold: { label: 'Gold', monthlyKes: 8500, annualKes: 85000, maxUsers: 50, trialDays: 0, description: 'Expanded business operations' },
  professional: { label: 'Professional', monthlyKes: 18500, annualKes: 185000, maxUsers: 100, trialDays: 0, description: 'Full operations suite' },
  enterprise: { label: 'Enterprise', monthlyKes: 59000, annualKes: 590000, maxUsers: 500, trialDays: 0, description: 'All modules and priority support' },
  custom: { label: 'Custom', monthlyKes: 0, annualKes: 0, maxUsers: 0, trialDays: 0, description: 'Custom pricing — contact sales' },
} as const;

export const DEFAULT_TIER_FEATURES: Record<string, Record<string, boolean>> = {
  trial: { crm: true, invoicing: true, reports: true, projects: false, hr: false, payroll: false, leave: false, attendance: false, payments: false, expenses: false, procurement: false, accounting: false, budgets: false, ai_hub: false, communications: false, tickets: false, contracts: false, work_orders: false },
  starter: { crm: true, invoicing: true, payments: true, expenses: true, tickets: true, reports: true, projects: false, hr: false, payroll: false, leave: false, attendance: false, procurement: false, accounting: false, budgets: false, ai_hub: false, communications: false, contracts: false, work_orders: false },
  gold: { crm: true, invoicing: true, payments: true, expenses: true, tickets: true, reports: true, projects: true, hr: true, leave: true, attendance: true, accounting: true, budgets: true, communications: true, payroll: false, procurement: false, ai_hub: false, contracts: false, work_orders: false },
  professional: { crm: true, invoicing: true, payments: true, expenses: true, tickets: true, reports: true, projects: true, hr: true, leave: true, attendance: true, accounting: true, budgets: true, communications: true, payroll: false, procurement: false, ai_hub: false, contracts: false, work_orders: false },
  enterprise: { crm: true, projects: true, hr: true, payroll: true, leave: true, attendance: true, invoicing: true, payments: true, expenses: true, procurement: true, accounting: true, budgets: true, reports: true, ai_hub: true, communications: true, tickets: true, contracts: true, work_orders: true },
  custom: { crm: true, projects: true, hr: true, payroll: true, leave: true, attendance: true, invoicing: true, payments: true, expenses: true, procurement: true, accounting: true, budgets: true, reports: true, ai_hub: true, communications: true, tickets: true, contracts: true, work_orders: true },
};

export type TierPricingOverrides = Record<string, Record<string, unknown>>;

export function parseTierPricingOverrides(value: unknown): TierPricingOverrides {
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      return {};
    }
  }
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as TierPricingOverrides
    : {};
}

export function resolveTierPricingEntry(tier: string, overrides: TierPricingOverrides): Record<string, unknown> {
  const defaults = (DEFAULT_TIER_PRICING as Record<string, Record<string, unknown>>)[tier];
  const configured = overrides[tier] || {};
  if (defaults && configured.adminCustomized !== true) return { ...defaults };
  return { ...(defaults || {}), ...configured };
}

export function getConfiguredTrialDays(overrides: TierPricingOverrides): number {
  const configuredDays = Number(resolveTierPricingEntry('trial', overrides).trialDays ?? DEFAULT_TIER_PRICING.trial.trialDays);
  return Number.isFinite(configuredDays) ? Math.max(0, Math.floor(configuredDays)) : DEFAULT_TIER_PRICING.trial.trialDays;
}