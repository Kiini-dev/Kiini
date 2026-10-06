import { beforeEach, describe, expect, it, vi } from "vitest";

const { authenticateRequestMock } = vi.hoisted(() => ({
  authenticateRequestMock: vi.fn(),
}));

vi.mock("./_core/sdk", () => ({
  sdk: { authenticateRequest: authenticateRequestMock },
}));

import { notifyOrg, notifyUser, sseHandler } from "./sse";

describe("sseHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("preserves Express request methods while authenticating a query token", async () => {
    let closeHandler: (() => void) | undefined;
    const req = Object.assign(Object.create({
      get: vi.fn(() => "tenant.kiini.africa"),
    }), {
      query: { token: "session-token" },
      headers: { host: "tenant.kiini.africa" },
      hostname: "tenant.kiini.africa",
      url: "/api/sse/notifications?token=session-token",
      on: vi.fn((event: string, handler: () => void) => {
        if (event === "close") closeHandler = handler;
      }),
    });
    authenticateRequestMock.mockImplementation(async (authReq) => {
      expect(authReq.get("host")).toBe("tenant.kiini.africa");
      expect(authReq.headers.authorization).toBe("Bearer session-token");
      return { id: "admin-1", role: "super_admin" };
    });
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      setHeader: vi.fn(),
      flushHeaders: vi.fn(),
      write: vi.fn(),
    };

    await sseHandler(req, res as any);
    closeHandler?.();

    expect(authenticateRequestMock).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/event-stream");
  });

  it("delivers private user events to organization-scoped SSE clients", async () => {
    let closeHandler: (() => void) | undefined;
    const req = {
      query: {},
      headers: {},
      on: vi.fn((event: string, handler: () => void) => {
        if (event === "close") closeHandler = handler;
      }),
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      setHeader: vi.fn(),
      flushHeaders: vi.fn(),
      write: vi.fn(),
    };
    authenticateRequestMock.mockResolvedValue({ id: "employee-1", organizationId: "org-1" });

    await sseHandler(req, res as any);
    const userEvent = { id: "private-event", type: "info" as const, title: "Private", body: "", timestamp: "" };
    const orgEvent = { ...userEvent, id: "org-event", title: "Organization" };
    notifyUser("employee-1", userEvent);
    notifyOrg("org-1", orgEvent);
    closeHandler?.();

    expect(res.write).toHaveBeenCalledWith(`data: ${JSON.stringify(userEvent)}\n\n`);
    expect(res.write).toHaveBeenCalledWith(`data: ${JSON.stringify(orgEvent)}\n\n`);
  });
});
