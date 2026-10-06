import { describe, expect, it } from "vitest";
import { getLoginUrl } from "@/const";
import { getOrgSubdomainSlug, getOrgSubdomainUrl, normalizeBrowserNavigationTarget } from "./organizationUrl";

describe("organizationUrl browser navigation", () => {
  it("sends tenant logout to the primary login domain", () => {
    expect(getLoginUrl("mumbike.kiini.africa")).toBe("https://kiini.africa/login");
  });

  it("keeps local development login on the current origin", () => {
    expect(getLoginUrl("localhost")).toBe("/login");
  });

  it("does not interpret the reserved admin host as an organization", () => {
    expect(getOrgSubdomainSlug("admin.kiini.africa")).toBeNull();
  });

  it("routes legacy admin slugs through the primary domain", () => {
    expect(getOrgSubdomainUrl("admin", "/crm-home"))
      .toBe(`${window.location.protocol}//kiini.africa/org/admin/crm-home`);
  });

  it("does not duplicate an existing admin organization path", () => {
    expect(getOrgSubdomainUrl("admin", "/org/admin/reports"))
      .toBe(`${window.location.protocol}//kiini.africa/org/admin/reports`);
  });

  it("keeps same-origin absolute URLs as browser paths instead of pushing them into history", () => {
    const current = "https://kiini.africa/mumbike/crm-home";
    const target = "https://kiini.africa/mumbike/clients";

    expect(normalizeBrowserNavigationTarget(target, current)).toBe("/mumbike/clients");
  });

  it("preserves cross-origin tenant URLs so the browser can redirect to the correct subdomain", () => {
    const current = "https://kiini.africa/mumbike/crm-home";
    const target = "https://mumbike.kiini.africa/crm-home";

    expect(normalizeBrowserNavigationTarget(target, current)).toBe(target);
  });

  it("does not append an absolute tenant URL as a duplicated path", () => {
    expect(normalizeBrowserNavigationTarget(
      getOrgSubdomainUrl("mumbike", "https://mumbike.kiini.africa/activity"),
      "https://kiini.africa/mumbike/crm-home",
    )).toBe(`${window.location.protocol}//mumbike.kiini.africa/activity`);
  });

  it("maps absolute primary-domain routes onto the tenant host", () => {
    expect(getOrgSubdomainUrl("mumbike", "https://kiini.africa/clients?sort=name"))
      .toBe(`${window.location.protocol}//mumbike.kiini.africa/clients?sort=name`);
  });
});
