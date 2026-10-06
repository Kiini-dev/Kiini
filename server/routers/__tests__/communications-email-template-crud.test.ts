import { beforeEach, describe, expect, it, vi } from "vitest";

const { queryMock, logActivityMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  logActivityMock: vi.fn(),
}));

vi.mock("../../db", () => ({
  getPool: () => ({ query: queryMock }),
  getDb: vi.fn(),
  logActivity: logActivityMock,
}));

vi.mock("../../middleware/enhancedRbac", async () => {
  const { initTRPC } = await import("@trpc/server");
  const t = initTRPC.context().create();
  return { createFeatureRestrictedProcedure: () => t.procedure };
});

import { communicationsRouter } from "../communications";

describe("communications email template persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryMock.mockResolvedValue([[], {}]);
    logActivityMock.mockResolvedValue(undefined);
  });

  it("creates a tenant-scoped template in the shared emailTemplates table", async () => {
    const caller = communicationsRouter.createCaller({
      user: { id: "user-1", email: "admin@example.com", organizationId: "org-1", role: "admin" },
    } as any);

    const created = await caller.createEmailTemplate({
      name: "Purchase update",
      subject: "Order status",
      body: "<p>Order status</p>",
      category: "general",
      variables: ["po_number"],
    });

    expect(created.id).toBeTruthy();
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO emailTemplates"),
      expect.arrayContaining(["Purchase update", "Order status", "org-1"]),
    );
    expect(logActivityMock).toHaveBeenCalledOnce();
  });

  it("updates only a template owned by the caller's organization", async () => {
    queryMock.mockResolvedValueOnce([[{ id: "template-1" }], {}]);
    const caller = communicationsRouter.createCaller({
      user: { id: "user-1", organizationId: "org-1", role: "admin" },
    } as any);

    await caller.updateEmailTemplate({ id: "template-1", subject: "Updated subject" });

    expect(queryMock).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("organizationId = ? LIMIT 1"),
      ["template-1", "org-1"],
    );
    expect(queryMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("UPDATE emailTemplates SET subject = ? WHERE id = ? AND organizationId = ?"),
      ["Updated subject", "template-1", "org-1"],
    );
  });

  it("rejects attempts to update a template owned by another tenant", async () => {
    queryMock.mockResolvedValueOnce([[], {}]);
    const caller = communicationsRouter.createCaller({
      user: { id: "user-1", organizationId: "org-1", role: "admin" },
    } as any);

    await expect(caller.updateEmailTemplate({ id: "other-tenant-template", name: "Changed" }))
      .rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(queryMock).toHaveBeenCalledOnce();
  });
});
