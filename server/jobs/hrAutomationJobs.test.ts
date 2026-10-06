import { afterEach, describe, expect, it, vi } from "vitest";

const { getDbMock, getPoolMock, createNotificationMock, sendEmailImmediatelyMock } = vi.hoisted(() => ({
  getDbMock: vi.fn(),
  getPoolMock: vi.fn(),
  createNotificationMock: vi.fn(),
  sendEmailImmediatelyMock: vi.fn(),
}));

vi.mock("../db", () => ({
  getDb: getDbMock,
  getPool: getPoolMock,
  createNotification: createNotificationMock,
}));
vi.mock("../services/emailService", () => ({
  sendEmailImmediately: sendEmailImmediatelyMock,
}));

import { contractExpiryReminder, performanceReviewCycle } from "./hrAutomationJobs";

describe("contract expiry reminder", () => {
  afterEach(() => vi.clearAllMocks());

  it("notifies HR in-app and by email once per contract expiry threshold", async () => {
    let notificationExists = false;
    const pool = {
      query: vi.fn(async (query: string) => {
        if (query.includes("FROM employee_contracts")) {
          return [[{
            id: "contract-1",
            employee_id: "employee-1",
            contract_type: "fixed-term",
            end_date: "2026-10-11",
            organization_id: "org-1",
            firstName: "Amina",
            lastName: "Otieno",
            days_remaining: 7,
          }], []];
        }
        if (query.includes("FROM users")) {
          return [[{ id: "hr-1", name: "HR", email: "hr@example.test" }], []];
        }
        if (query.includes("FROM notifications")) {
          return [notificationExists ? [{ id: "notification-1" }] : [], []];
        }
        return [[], []];
      }),
    };
    getPoolMock.mockReturnValue(pool);
    createNotificationMock.mockImplementation(async () => {
      notificationExists = true;
      return "notification-1";
    });
    sendEmailImmediatelyMock.mockResolvedValue({ success: true });

    const job = contractExpiryReminder();
    await job.handler();
    await job.handler();

    expect(createNotificationMock).toHaveBeenCalledWith(expect.objectContaining({
      userId: "hr-1",
      entityType: "contract_expiry_7",
      entityId: "contract-1:2026-10-11",
    }));
    expect(sendEmailImmediatelyMock).toHaveBeenCalledWith(expect.objectContaining({
      toEmail: "hr@example.test",
      subject: "Contract expiring in 7 days",
    }));
    expect(createNotificationMock).toHaveBeenCalledOnce();
    expect(sendEmailImmediatelyMock).toHaveBeenCalledOnce();
  });
});

describe("quarterly performance review cycle", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("creates a draft review for an active employee and notifies their department manager", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-20T08:00:00.000Z"));
    const insertedReviews: unknown[][] = [];
    const pool = {
      query: vi.fn(async (query: string, params: unknown[] = []) => {
        if (query.includes("SELECT e.id AS employeeId")) {
          return [[{
            employeeId: "employee-1",
            firstName: "Amina",
            lastName: "Otieno",
            organizationId: "org-1",
            reviewerId: "manager-1",
            reviewerUserId: "user-manager-1",
          }], []];
        }
        if (query.includes("FROM performanceReviews WHERE")) return [[], []];
        if (query.includes("FROM notifications")) return [[], []];
        if (query.includes("INSERT INTO performanceReviews")) {
          insertedReviews.push(params);
          return [{ affectedRows: 1 }, []];
        }
        return [[], []];
      }),
    };
    getPoolMock.mockReturnValue(pool);

    await performanceReviewCycle().handler();

    expect(insertedReviews).toHaveLength(1);
    expect(insertedReviews[0]).toEqual([
      expect.any(String),
      "employee-1",
      "manager-1",
      "2026-Q4",
      "2026-10-01 00:00:00",
    ]);
    expect(createNotificationMock).toHaveBeenCalledWith(expect.objectContaining({
      userId: "user-manager-1",
      entityType: "performance_review_cycle",
      title: "Quarterly performance review assigned",
    }));
  });

  it("does not duplicate the review or manager notification when the cycle runs again", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-20T08:00:00.000Z"));
    const reviewId = "existing-review";
    let reviewExists = false;
    let notificationExists = false;
    const pool = {
      query: vi.fn(async (query: string, params: unknown[] = []) => {
        if (query.includes("SELECT e.id AS employeeId")) {
          return [[{
            employeeId: "employee-1",
            firstName: "Amina",
            lastName: "Otieno",
            organizationId: "org-1",
            reviewerId: "manager-1",
            reviewerUserId: "user-manager-1",
          }], []];
        }
        if (query.includes("FROM performanceReviews WHERE")) {
          return [reviewExists ? [{ id: reviewId }] : [], []];
        }
        if (query.includes("FROM notifications")) {
          return [notificationExists ? [{ id: "notification-1" }] : [], []];
        }
        if (query.includes("INSERT INTO performanceReviews")) {
          reviewExists = true;
          params[0] = reviewId;
          return [{ affectedRows: 1 }, []];
        }
        return [[], []];
      }),
    };
    getPoolMock.mockReturnValue(pool);
    createNotificationMock.mockImplementation(async () => {
      notificationExists = true;
      return "notification-1";
    });

    const job = performanceReviewCycle();
    await job.handler();
    await job.handler();

    expect(pool.query.mock.calls.filter(([query]) => query.includes("INSERT INTO performanceReviews"))).toHaveLength(1);
    expect(createNotificationMock).toHaveBeenCalledOnce();
  });

  it("skips employees without an assigned department manager", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const pool = {
      query: vi.fn(async (query: string) => {
        if (query.includes("SELECT e.id AS employeeId")) {
          return [[{
            employeeId: "employee-unassigned",
            firstName: "Sam",
            lastName: "Kariuki",
            organizationId: "org-1",
            reviewerId: null,
            reviewerUserId: null,
          }], []];
        }
        return [[], []];
      }),
    };
    getPoolMock.mockReturnValue(pool);

    await performanceReviewCycle().handler();

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("department manager is not assigned"));
    expect(createNotificationMock).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
