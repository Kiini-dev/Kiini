import { afterEach, describe, expect, it, vi } from "vitest";

const { getDbMock, getUserOrganizationIdMock } = vi.hoisted(() => ({
  getDbMock: vi.fn(),
  getUserOrganizationIdMock: vi.fn(),
}));

vi.mock("../../db", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../db")>()),
  getDb: getDbMock,
}));

vi.mock("../../db-users", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../db-users")>()),
  getUserOrganizationId: getUserOrganizationIdMock,
}));

import { authRouter } from "../auth";

describe("auth.me", () => {
  afterEach(() => vi.clearAllMocks());

  it("returns the authenticated user and role permissions if the explicit-permissions table is missing", async () => {
    const missingPermissionsTable = Object.assign(
      new Error("Table 'kiini.userPermissions' doesn't exist"),
      { code: "ER_NO_SUCH_TABLE" },
    );
    getDbMock.mockResolvedValue({
      select: () => ({
        from: () => ({
          where: () => Promise.reject(missingPermissionsTable),
        }),
      }),
    });
    getUserOrganizationIdMock.mockResolvedValue(null);

    const caller = authRouter.createCaller({
      user: {
        id: "admin-1",
        email: "admin@example.com",
        role: "super_admin",
        organizationId: null,
        permissions: JSON.stringify(["legacy:read"]),
      },
    } as any);

    await expect(caller.me()).resolves.toMatchObject({
      id: "admin-1",
      role: "super_admin",
      effectiveRole: "super_admin",
      effectivePermissions: ["legacy:read"],
    });
  });
});
