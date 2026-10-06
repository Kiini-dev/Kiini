import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({ getDb: vi.fn() }));

import { organizationUsers } from "../drizzle/schema";
import { organizationMembers } from "../drizzle/schema-extended";
import { getDb } from "./db";
import { getUserOrganizationId } from "./db-users";

describe("getUserOrganizationId", () => {
  beforeEach(() => vi.clearAllMocks());

  it("resolves the tenant from an active organizationUsers account", async () => {
    const from = vi.fn((table: unknown) => ({
      where: vi.fn(() => ({
        limit: vi.fn(async () => table === organizationUsers ? [{ organizationId: "org-tenant" }] : []),
      })),
    }));
    vi.mocked(getDb).mockResolvedValue({ select: vi.fn(() => ({ from })) } as any);

    await expect(getUserOrganizationId("user-1")).resolves.toBe("org-tenant");
    expect(from).toHaveBeenCalledWith(organizationUsers);
  });

  it("falls back to an active legacy organizationMembers membership", async () => {
    const from = vi.fn((table: unknown) => ({
      where: vi.fn(() => ({
        limit: vi.fn(async () => table === organizationMembers ? [{ organizationId: "org-legacy" }] : []),
      })),
    }));
    vi.mocked(getDb).mockResolvedValue({ select: vi.fn(() => ({ from })) } as any);

    await expect(getUserOrganizationId("user-2")).resolves.toBe("org-legacy");
    expect(from).toHaveBeenNthCalledWith(1, organizationUsers);
    expect(from).toHaveBeenNthCalledWith(2, organizationMembers);
  });

  it("resolves historical tenant accounts whose organizationUsers ID differs by email", async () => {
    let organizationUserLookups = 0;
    const from = vi.fn((table: unknown) => ({
      where: vi.fn(() => ({
        limit: vi.fn(async () => {
          if (table === organizationUsers) {
            organizationUserLookups++;
            return organizationUserLookups === 2 ? [{ organizationId: "org-email-match" }] : [];
          }
          return [];
        }),
      })),
    }));
    vi.mocked(getDb).mockResolvedValue({ select: vi.fn(() => ({ from })) } as any);

    await expect(getUserOrganizationId("global-user-1", "tenant.user@example.com"))
      .resolves.toBe("org-email-match");
    expect(organizationUserLookups).toBe(2);
  });
});