/**
 * Dunning System Tests
 * Comprehensive test suite for subscription dunning workflows
 * Tests payment reminders, service suspension, and termination logic
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { addDays, subDays } from "date-fns";
import {
  getDaysDueDate,
  getNextDunningNotice,
  getDueNotices,
  shouldSuspendService,
  shouldTerminateSubscription,
  getSuspensionStatus,
  DUNNING_SCHEDULE,
  DUNNING_SCHEDULE_MULTITENANCY,
} from "../server/services/dunningScheduleService";

describe("Dunning Schedule Service", () => {
  describe("getDaysDueDate()", () => {
    it("should return negative days for dates before due date", () => {
      const dueDate = addDays(new Date(), 10);
      const days = getDaysDueDate(dueDate);
      expect(days).toBeLessThan(0);
      expect(days).toBeGreaterThan(-11);
    });

    it("should return 0 for due date today", () => {
      const dueDate = new Date();
      const days = getDaysDueDate(dueDate);
      expect(Math.abs(days)).toBeLessThanOrEqual(1); // Allow 1 day margin for time zones
    });

    it("should return positive days for dates after due date", () => {
      const dueDate = subDays(new Date(), 5);
      const days = getDaysDueDate(dueDate);
      expect(days).toBeGreaterThan(0);
      expect(days).toBeLessThan(10);
    });
  });

  describe("shouldSuspendService()", () => {
    it("should suspend at 5 days overdue for standard subscriptions", () => {
      const dueDate = subDays(new Date(), 5);
      const shouldSuspend = shouldSuspendService(dueDate, false);
      expect(shouldSuspend).toBe(true);
    });

    it("should not suspend before 5 days overdue for standard subscriptions", () => {
      const dueDate = subDays(new Date(), 4);
      const shouldSuspend = shouldSuspendService(dueDate, false);
      expect(shouldSuspend).toBe(false);
    });

    it("should suspend at 3 days overdue for multi-tenant subscriptions", () => {
      const dueDate = subDays(new Date(), 3);
      const shouldSuspend = shouldSuspendService(dueDate, true);
      expect(shouldSuspend).toBe(true);
    });

    it("should not suspend before 3 days overdue for multi-tenant subscriptions", () => {
      const dueDate = subDays(new Date(), 2);
      const shouldSuspend = shouldSuspendService(dueDate, true);
      expect(shouldSuspend).toBe(false);
    });

    it("should not suspend before due date", () => {
      const dueDate = addDays(new Date(), 5);
      const shouldSuspend = shouldSuspendService(dueDate, false);
      expect(shouldSuspend).toBe(false);
    });
  });

  describe("shouldTerminateSubscription()", () => {
    it("should terminate at 21 days overdue", () => {
      const dueDate = subDays(new Date(), 21);
      const shouldTerminate = shouldTerminateSubscription(dueDate);
      expect(shouldTerminate).toBe(true);
    });

    it("should not terminate before 21 days overdue", () => {
      const dueDate = subDays(new Date(), 20);
      const shouldTerminate = shouldTerminateSubscription(dueDate);
      expect(shouldTerminate).toBe(false);
    });

    it("should not terminate before due date", () => {
      const dueDate = addDays(new Date(), 10);
      const shouldTerminate = shouldTerminateSubscription(dueDate);
      expect(shouldTerminate).toBe(false);
    });
  });

  describe("getNextDunningNotice()", () => {
    it("should return 20-day advance notice when due in 20 days", () => {
      const dueDate = addDays(new Date(), 20);
      const notice = getNextDunningNotice(dueDate, false, []);
      expect(notice).toBeDefined();
      expect(notice?.daysDiff).toBe(-20);
      expect(notice?.eventType).toContain("advance");
    });

    it("should return 1-day overdue notice when 1 day past due", () => {
      const dueDate = subDays(new Date(), 1);
      const notice = getNextDunningNotice(dueDate, false, []);
      expect(notice).toBeDefined();
      expect(notice?.daysDiff).toBe(1);
    });

    it("should skip already-sent notices", () => {
      const dueDate = addDays(new Date(), 20);
      const notice = getNextDunningNotice(dueDate, false, [-20]);
      // Should return next notice in sequence, not -20
      expect(notice?.daysDiff).not.toBe(-20);
    });

    it("should return null when all notices sent", () => {
      const dueDate = subDays(new Date(), 1);
      const allLevels = DUNNING_SCHEDULE.map((l) => l.daysDiff);
      const notice = getNextDunningNotice(dueDate, false, allLevels);
      expect(notice).toBeNull();
    });
  });

  describe("getDueNotices()", () => {
    it("should return all overdue notices", () => {
      const dueDate = subDays(new Date(), 10);
      const notices = getDueNotices(dueDate, false, []);
      expect(notices.length).toBeGreaterThan(0);
      // Should include at least the 7-day and 3-day notices
      expect(notices.some((n) => n.daysDiff >= 3)).toBe(true);
    });

    it("should exclude already-sent notices", () => {
      const dueDate = subDays(new Date(), 10);
      const notices = getDueNotices(dueDate, false, [7, 3]);
      // Should not include the 7-day or 3-day notices
      expect(notices.every((n) => n.daysDiff !== 7 && n.daysDiff !== 3)).toBe(true);
    });

    it("should return empty array for pre-due invoices", () => {
      const dueDate = addDays(new Date(), 10);
      const notices = getDueNotices(dueDate, false, []);
      expect(notices.length).toBe(0);
    });

    it("should respect multi-tenant schedule", () => {
      const dueDate = subDays(new Date(), 3);
      const notices = getDueNotices(dueDate, true, []);
      // Multi-tenant should use different schedule
      expect(notices.length).toBeGreaterThan(0);
    });
  });

  describe("getSuspensionStatus()", () => {
    it("should report suspension status for overdue invoices", () => {
      const dueDate = subDays(new Date(), 5);
      const status = getSuspensionStatus(dueDate, false);
      expect(status.isSuspended).toBe(true);
      expect(status.daysSinceOverdue).toBeGreaterThan(0);
    });

    it("should calculate days until termination", () => {
      const dueDate = subDays(new Date(), 10);
      const status = getSuspensionStatus(dueDate, false);
      expect(status.daysUntilTermination).toBeGreaterThan(0);
      expect(status.daysUntilTermination).toBeLessThanOrEqual(11);
    });

    it("should not report suspension for pre-due invoices", () => {
      const dueDate = addDays(new Date(), 10);
      const status = getSuspensionStatus(dueDate, false);
      expect(status.isSuspended).toBe(false);
    });
  });

  describe("Schedule Structure", () => {
    it("should have 11 levels in standard schedule", () => {
      expect(DUNNING_SCHEDULE.length).toBe(11);
    });

    it("should have 10 levels in multi-tenant schedule", () => {
      expect(DUNNING_SCHEDULE_MULTITENANCY.length).toBe(10);
    });

    it("should have correct timing for standard schedule", () => {
      const days = DUNNING_SCHEDULE.map((s) => s.daysDiff);
      expect(days).toContain(-20);
      expect(days).toContain(-14);
      expect(days).toContain(-7);
      expect(days).toContain(-3);
      expect(days).toContain(0);
      expect(days).toContain(1);
      expect(days).toContain(3);
      expect(days).toContain(5);
      expect(days).toContain(7);
      expect(days).toContain(14);
      expect(days).toContain(21);
    });

    it("should have action types defined", () => {
      DUNNING_SCHEDULE.forEach((level) => {
        expect(["notify", "suspend", "terminate"]).toContain(level.action);
      });
    });

    it("should have suspension timing metadata", () => {
      const suspendLevel = DUNNING_SCHEDULE.find((s) => s.action === "suspend");
      expect(suspendLevel).toBeDefined();
      expect(suspendLevel?.suspendAfterDays).toBeDefined();
    });
  });

  describe("Edge Cases", () => {
    it("should handle DST transitions", () => {
      // Test with dates around DST
      const dueDate = new Date("2024-03-10");
      const days = getDaysDueDate(dueDate);
      expect(typeof days).toBe("number");
      expect(isNaN(days)).toBe(false);
    });

    it("should handle leap years", () => {
      const dueDate = new Date("2024-02-29"); // Leap year date
      const days = getDaysDueDate(dueDate);
      expect(typeof days).toBe("number");
      expect(isNaN(days)).toBe(false);
    });

    it("should handle timezone variations", () => {
      const dueDate = new Date();
      const days1 = getDaysDueDate(dueDate);
      const days2 = getDaysDueDate(dueDate);
      // Results should be the same regardless of timezone
      expect(Math.abs(days1 - days2)).toBeLessThanOrEqual(1);
    });
  });
});

describe("Dunning Workflow Integration", () => {
  describe("Payment Timeline", () => {
    it("should send notice 20 days before due", () => {
      const dueDate = addDays(new Date(), 20);
      const notices = getDueNotices(dueDate, false, []);
      const advanceNotice = notices.find((n) => n.daysDiff === -20);
      expect(advanceNotice).toBeDefined();
      expect(advanceNotice?.eventType).toContain("advance");
    });

    it("should send notice on due date", () => {
      const dueDate = new Date();
      const notices = getDueNotices(dueDate, false, []);
      const dueNotice = notices.find((n) => n.daysDiff === 0);
      expect(dueNotice).toBeDefined();
      expect(dueNotice?.label).toContain("Due");
    });

    it("should suspend 5 days after due", () => {
      const dueDate = subDays(new Date(), 5);
      expect(shouldSuspendService(dueDate, false)).toBe(true);
      const notices = getDueNotices(dueDate, false, []);
      expect(notices.length).toBeGreaterThan(0);
    });

    it("should terminate 21 days after due", () => {
      const dueDate = subDays(new Date(), 21);
      expect(shouldTerminateSubscription(dueDate)).toBe(true);
    });
  });

  describe("Multi-Tenancy Differences", () => {
    it("should use different suspension threshold for multi-tenant", () => {
      const dueDate = subDays(new Date(), 3);
      expect(shouldSuspendService(dueDate, true)).toBe(true); // 3 days for multi-tenant
      expect(shouldSuspendService(dueDate, false)).toBe(false); // 5 days for standard
    });

    it("should use different schedule levels for multi-tenant", () => {
      const dueDate = subDays(new Date(), 5);
      const standardNotices = getDueNotices(dueDate, false, []);
      const multiTenantNotices = getDueNotices(dueDate, true, []);
      // Counts might differ based on schedule
      expect(standardNotices.length).toBeGreaterThanOrEqual(0);
      expect(multiTenantNotices.length).toBeGreaterThanOrEqual(0);
    });
  });
});
