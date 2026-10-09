import { describe, expect, it } from "vitest";
import { canAccessRoute } from "./permissions";

describe("client portal route access", () => {
  it("allows portal tabs encoded in the query string", () => {
    expect(canAccessRoute("client", "/crm/client-portal?tab=projects")).toBe(true);
    expect(canAccessRoute("client", "/crm/client-portal?tab=documents")).toBe(true);
  });

  it("keeps clients out of staff module routes", () => {
    expect(canAccessRoute("client", "/projects")).toBe(false);
    expect(canAccessRoute("client", "/invoices")).toBe(false);
    expect(canAccessRoute("client", "/payments")).toBe(false);
    expect(canAccessRoute("client", "/proposals")).toBe(false);
    expect(canAccessRoute("client", "/tickets")).toBe(false);
  });

  it("retains access to supported client account pages", () => {
    expect(canAccessRoute("client", "/knowledge-base")).toBe(true);
    expect(canAccessRoute("client", "/account")).toBe(true);
    expect(canAccessRoute("client", "/change-password")).toBe(true);
  });
});
