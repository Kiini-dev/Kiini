import { beforeEach, describe, expect, it, vi } from "vitest";

const { getConnectionMock, connectionQueryMock, commitMock, rollbackMock, releaseMock } = vi.hoisted(() => ({
  getConnectionMock: vi.fn(),
  connectionQueryMock: vi.fn(),
  commitMock: vi.fn(),
  rollbackMock: vi.fn(),
  releaseMock: vi.fn(),
}));

vi.mock("../db", () => ({
  getPool: () => ({ getConnection: getConnectionMock }),
}));

import { renderMarketingCampaign } from "./emailMarketing";
import { unsubscribeMarketingToken } from "./emailMarketing";

describe("renderMarketingCampaign", () => {
  it("substitutes recipient data, escapes HTML, and adds an unsubscribe link", () => {
    const html = renderMarketingCampaign(
      "<p>Hello {first_name} {last_name}; {campaign_name}</p>",
      "Monthly Update",
      { email: "user@example.com", name: "<Sam> Rivera", unsubscribeToken: "token-123" },
      "https://kiini.africa/",
    );

    expect(html).toContain("Hello &lt;Sam&gt; Rivera; Monthly Update");
    expect(html).toContain("https://kiini.africa/api/email/unsubscribe/token-123");
    expect(html).toContain("You are receiving this email because you opted in");
  });

  it("uses an explicitly placed unsubscribe field without adding a duplicate footer", () => {
    const html = renderMarketingCampaign(
      '<p><a href="{unsubscribe_url}">Unsubscribe</a></p>',
      "Update",
      { email: "user@example.com", unsubscribeToken: "token-456" },
      "https://kiini.africa",
    );

    expect(html).toContain('href="https://kiini.africa/api/email/unsubscribe/token-456"');
    expect(html).not.toContain("You are receiving this email because you opted in");
  });
});

describe("unsubscribeMarketingToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getConnectionMock.mockResolvedValue({
      beginTransaction: vi.fn(),
      query: connectionQueryMock,
      commit: commitMock,
      rollback: rollbackMock,
      release: releaseMock,
    });
  });

  it("opts the address out across all organizations and records global suppression", async () => {
    connectionQueryMock
      .mockResolvedValueOnce([[{ email: "user@example.com" }], {}])
      .mockResolvedValue([{}, {}]);

    await expect(unsubscribeMarketingToken("token-123")).resolves.toBe(true);

    expect(connectionQueryMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("UPDATE emailMarketingSubscribers SET optedIn = 0"),
      ["user@example.com"],
    );
    expect(connectionQueryMock).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining("INSERT INTO emailUnsubscribes"),
      ["unsub_token-123", "user@example.com"],
    );
    expect(commitMock).toHaveBeenCalledOnce();
    expect(releaseMock).toHaveBeenCalledOnce();
  });

  it("does not commit when the token is unknown", async () => {
    connectionQueryMock.mockResolvedValueOnce([[], {}]);

    await expect(unsubscribeMarketingToken("missing-token")).resolves.toBe(false);

    expect(rollbackMock).toHaveBeenCalledOnce();
    expect(commitMock).not.toHaveBeenCalled();
  });
});
