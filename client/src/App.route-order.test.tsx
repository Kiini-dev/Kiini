import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { isKnownGlobalAppRoute } from './lib/permissions';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appSource = readFileSync(join(__dirname, 'App.tsx'), 'utf-8');

describe('App route ordering', () => {
  it('places concrete app routes before dynamic org aliases so /projects and /invoices do not get captured by /:slug', () => {
    const concreteProjects = appSource.indexOf('<Route path={"/projects"} component={Projects} />');
    const concreteInvoices = appSource.indexOf('<Route path={"/invoices"} component={Invoices} />');
    const orgAlias = appSource.indexOf('<Route path={"/:slug/"} component={OrgDashboardHome} />');

    expect(concreteProjects).toBeGreaterThan(-1);
    expect(concreteInvoices).toBeGreaterThan(-1);
    expect(orgAlias).toBeGreaterThan(-1);
    expect(concreteProjects).toBeLessThan(orgAlias);
    expect(concreteInvoices).toBeLessThan(orgAlias);
  });

  it('keeps valid global app routes available for org users instead of redirecting them to the org dashboard', () => {
    expect(isKnownGlobalAppRoute('/projects')).toBe(true);
    expect(isKnownGlobalAppRoute('/invoices')).toBe(true);
    expect(isKnownGlobalAppRoute('/crm-home')).toBe(true);
    expect(isKnownGlobalAppRoute('/admin/management')).toBe(true);
    expect(isKnownGlobalAppRoute('/org/acme/dashboard')).toBe(false);
    expect(isKnownGlobalAppRoute('/org/acme/projects')).toBe(false);
  });
});
