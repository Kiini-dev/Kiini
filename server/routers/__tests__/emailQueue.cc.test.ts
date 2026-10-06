import { beforeEach, describe, expect, it, vi } from "vitest";

const { getDbMock, sendEmailMock } = vi.hoisted(() => ({
  getDbMock: vi.fn(),
  sendEmailMock: vi.fn(),
}));

vi.mock("../../db", () => ({ getDb: getDbMock }));
vi.mock("../../_core/mail", () => ({ sendEmail: sendEmailMock }));

import { processEmailQueue, queueEmail } from "../emailQueue";

describe("email queue CC delivery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("persists CC addresses in metadata and forwards them when the queued email is sent", async () => {
    let queuedValues: Record<string, unknown> | undefined;
    const emailRecord = {
      id: "queue-1",
      recipientEmail: "manager@example.com",
      subject: "Department report",
      htmlContent: "<p>Report</p>",
      textContent: "Report",
      eventType: "system_report_weekly_department",
      metadata: null as string | null,
      status: "pending",
      attempts: 0,
      maxAttempts: 3,
      nextRetryAt: null,
    };
    const db = {
      insert: vi.fn(() => ({
        values: vi.fn(async (values: Record<string, unknown>) => {
          if ("htmlContent" in values) {
            queuedValues = values;
            emailRecord.metadata = String(values.metadata);
          }
          return undefined;
        }),
      })),
      select: vi.fn(() => ({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn(async () => [emailRecord]),
      })),
      update: vi.fn(() => ({
        set: vi.fn().mockReturnThis(),
        where: vi.fn(async () => undefined),
      })),
    };
    getDbMock.mockResolvedValue(db);
    sendEmailMock.mockResolvedValue({ success: true, messageId: "sent-1" });

    const queued = await queueEmail({
      recipientEmail: "manager@example.com",
      subject: "Department report",
      htmlContent: "<p>Report</p>",
      textContent: "Report",
      eventType: "system_report_weekly_department",
      ccEmails: ["superadmin@example.com", " manager@example.com ", "superadmin@example.com"],
      metadata: { reportId: "report-1" },
    });
    const result = await processEmailQueue();

    expect(queued.success).toBe(true);
    expect(JSON.parse(String(queuedValues?.metadata))).toEqual({
      reportId: "report-1",
      ccEmails: ["superadmin@example.com"],
    });
    expect(sendEmailMock).toHaveBeenCalledWith(expect.objectContaining({
      to: "manager@example.com",
      cc: "superadmin@example.com",
    }));
    expect(result).toMatchObject({ success: true, processed: 1, failed: 0 });
  });
});
