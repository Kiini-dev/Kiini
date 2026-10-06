/**
 * Dunning Schedule Service
 * Manages payment reminder schedule for subscriptions and recurring invoices
 * Defines when notices should be sent relative to due date
 */

import { differenceInDays, addDays, subDays } from "date-fns";

/**
 * Dunning schedule defining notice triggers for subscriptions/recurring invoices
 * Notices sent: 20, 14, 7, 3 days before due date
 * Then: on due date, 1, 3, 5, 7, 14, 21 days after due date
 */
export interface DunningScheduleLevel {
  level: number;
  label: string;
  daysDiff: number; // Negative = before due date, positive = after due date
  eventType:
    | "advance_notice_20d"
    | "advance_notice_14d"
    | "advance_notice_7d"
    | "advance_notice_3d"
    | "due_date_reminder"
    | "overdue_1d"
    | "overdue_3d"
    | "overdue_5d"
    | "overdue_7d"
    | "overdue_14d"
    | "overdue_21d";
  emailTemplate: string;
  action?: "suspend" | "terminate" | "notify";
  suspendAfterDays?: number; // For multi-tenancy, suspend at 3 days overdue
}

export const DUNNING_SCHEDULE: DunningScheduleLevel[] = [
  {
    level: 1,
    label: "First Notice - 20 Days Before Due Date",
    daysDiff: -20,
    eventType: "advance_notice_20d",
    emailTemplate: "payment_notice_advance_20d",
    action: "notify",
  },
  {
    level: 2,
    label: "Second Notice - 14 Days Before Due Date",
    daysDiff: -14,
    eventType: "advance_notice_14d",
    emailTemplate: "payment_notice_advance_14d",
    action: "notify",
  },
  {
    level: 3,
    label: "Third Notice - 7 Days Before Due Date",
    daysDiff: -7,
    eventType: "advance_notice_7d",
    emailTemplate: "payment_notice_advance_7d",
    action: "notify",
  },
  {
    level: 4,
    label: "Fourth Notice - 3 Days Before Due Date",
    daysDiff: -3,
    eventType: "advance_notice_3d",
    emailTemplate: "payment_notice_advance_3d",
    action: "notify",
  },
  {
    level: 5,
    label: "Due Date Reminder",
    daysDiff: 0,
    eventType: "due_date_reminder",
    emailTemplate: "payment_notice_due_today",
    action: "notify",
  },
  {
    level: 6,
    label: "First Overdue Notice - 1 Day Overdue",
    daysDiff: 1,
    eventType: "overdue_1d",
    emailTemplate: "payment_notice_overdue_1d",
    action: "notify",
  },
  {
    level: 7,
    label: "Second Overdue Notice - 3 Days Overdue",
    daysDiff: 3,
    eventType: "overdue_3d",
    emailTemplate: "payment_notice_overdue_3d",
    action: "notify",
  },
  {
    level: 8,
    label: "Service Suspension Warning - 5 Days Overdue",
    daysDiff: 5,
    eventType: "overdue_5d",
    emailTemplate: "payment_notice_overdue_5d",
    action: "suspend",
    suspendAfterDays: 5, // General case: suspend at 5 days
  },
  {
    level: 9,
    label: "Suspension Confirmed - 7 Days Overdue",
    daysDiff: 7,
    eventType: "overdue_7d",
    emailTemplate: "payment_notice_overdue_7d",
    action: "suspend",
  },
  {
    level: 10,
    label: "Final Notice - 14 Days Overdue",
    daysDiff: 14,
    eventType: "overdue_14d",
    emailTemplate: "payment_notice_overdue_14d",
    action: "notify",
  },
  {
    level: 11,
    label: "Subscription Termination - 21 Days Overdue",
    daysDiff: 21,
    eventType: "overdue_21d",
    emailTemplate: "payment_notice_termination_notice",
    action: "terminate",
  },
];

/**
 * Multi-tenancy specific dunning schedule (suspend earlier)
 * Used for SaaS multi-tenant environments
 */
export const DUNNING_SCHEDULE_MULTITENANCY: DunningScheduleLevel[] = [
  {
    level: 1,
    label: "First Notice - 20 Days Before Due Date",
    daysDiff: -20,
    eventType: "advance_notice_20d",
    emailTemplate: "payment_notice_advance_20d",
    action: "notify",
  },
  {
    level: 2,
    label: "Second Notice - 14 Days Before Due Date",
    daysDiff: -14,
    eventType: "advance_notice_14d",
    emailTemplate: "payment_notice_advance_14d",
    action: "notify",
  },
  {
    level: 3,
    label: "Third Notice - 7 Days Before Due Date",
    daysDiff: -7,
    eventType: "advance_notice_7d",
    emailTemplate: "payment_notice_advance_7d",
    action: "notify",
  },
  {
    level: 4,
    label: "Fourth Notice - 3 Days Before Due Date",
    daysDiff: -3,
    eventType: "advance_notice_3d",
    emailTemplate: "payment_notice_advance_3d",
    action: "notify",
  },
  {
    level: 5,
    label: "Due Date Reminder",
    daysDiff: 0,
    eventType: "due_date_reminder",
    emailTemplate: "payment_notice_due_today",
    action: "notify",
  },
  {
    level: 6,
    label: "First Overdue Notice - 1 Day Overdue",
    daysDiff: 1,
    eventType: "overdue_1d",
    emailTemplate: "payment_notice_overdue_1d",
    action: "notify",
  },
  {
    level: 7,
    label: "Second Overdue Notice - 3 Days Overdue",
    daysDiff: 3,
    eventType: "overdue_3d",
    emailTemplate: "payment_notice_overdue_3d",
    action: "notify",
  },
  {
    level: 8,
    label: "Service Suspension (Multi-tenant) - 3 Days Overdue",
    daysDiff: 3,
    eventType: "overdue_3d",
    emailTemplate: "payment_notice_overdue_3d_multitenancy",
    action: "suspend",
    suspendAfterDays: 3, // Multi-tenant: suspend at 3 days
  },
  {
    level: 9,
    label: "Final Notice - 14 Days Overdue",
    daysDiff: 14,
    eventType: "overdue_14d",
    emailTemplate: "payment_notice_overdue_14d",
    action: "notify",
  },
  {
    level: 10,
    label: "Subscription Termination - 21 Days Overdue",
    daysDiff: 21,
    eventType: "overdue_21d",
    emailTemplate: "payment_notice_termination_notice",
    action: "terminate",
  },
];

/**
 * Calculate days until due date (negative = before, positive = after)
 */
export function getDaysDueDate(dueDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate = new Date(dueDate);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get the next dunning notice that should be sent
 * Returns the appropriate schedule level based on current date vs due date
 */
export function getNextDunningNotice(
  dueDate: Date,
  isMultiTenant: boolean = false,
  noticesSentLevels: number[] = []
): DunningScheduleLevel | null {
  const schedule = isMultiTenant ? DUNNING_SCHEDULE_MULTITENANCY : DUNNING_SCHEDULE;
  const daysDue = getDaysDueDate(dueDate);

  // Find the next notice that should be sent
  for (const level of schedule) {
    // Skip if this notice has already been sent
    if (noticesSentLevels.includes(level.level)) {
      continue;
    }

    // For before-due dates, check if we're within the window
    if (level.daysDiff < 0) {
      // Should send notice from (daysDiff) to (daysDiff + 1) days before
      if (daysDue <= level.daysDiff && daysDue > level.daysDiff - 1) {
        return level;
      }
      // Always allow sending if current day matches exactly
      if (daysDue === level.daysDiff) {
        return level;
      }
    } else {
      // For on/after-due dates
      if (daysDue >= level.daysDiff && daysDue < level.daysDiff + 1) {
        return level;
      }
      // Allow for exact matches
      if (daysDue === level.daysDiff) {
        return level;
      }
    }
  }

  return null;
}

/**
 * Get all dunning notices that are due (past their trigger date)
 */
export function getDueNotices(
  dueDate: Date,
  isMultiTenant: boolean = false,
  noticesSentLevels: number[] = []
): DunningScheduleLevel[] {
  const schedule = isMultiTenant ? DUNNING_SCHEDULE_MULTITENANCY : DUNNING_SCHEDULE;
  const daysDue = getDaysDueDate(dueDate);
  const dueNotices: DunningScheduleLevel[] = [];

  for (const level of schedule) {
    // Skip if already sent
    if (noticesSentLevels.includes(level.level)) {
      continue;
    }

    // Check if this notice's trigger date has passed
    if (daysDue >= level.daysDiff) {
      dueNotices.push(level);
    }
  }

  return dueNotices;
}

/**
 * Check if a subscription should be suspended
 */
export function shouldSuspendService(
  dueDate: Date,
  isMultiTenant: boolean = false
): boolean {
  const daysDue = getDaysDueDate(dueDate);
  const schedule = isMultiTenant ? DUNNING_SCHEDULE_MULTITENANCY : DUNNING_SCHEDULE;

  for (const level of schedule) {
    if (level.action === "suspend" && daysDue >= level.daysDiff) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a subscription should be terminated
 */
export function shouldTerminateSubscription(dueDate: Date): boolean {
  const daysDue = getDaysDueDate(dueDate);
  return daysDue >= 21; // Terminate after 21 days overdue
}

/**
 * Get suspension status details
 */
export function getSuspensionStatus(
  dueDate: Date,
  isMultiTenant: boolean = false
): {
  isSuspended: boolean;
  daysSinceOverdue: number;
  daysUntilTermination: number;
  suspensionReason: string;
} {
  const daysDue = getDaysDueDate(dueDate);
  const daysOverdue = Math.max(0, daysDue);
  const suspensionThreshold = isMultiTenant ? 3 : 5;
  const terminationThreshold = 21;

  return {
    isSuspended: daysOverdue >= suspensionThreshold,
    daysSinceOverdue: daysOverdue,
    daysUntilTermination: Math.max(0, terminationThreshold - daysOverdue),
    suspensionReason:
      daysOverdue >= suspensionThreshold
        ? `Payment overdue for ${daysOverdue} days. Service suspended.`
        : "",
  };
}
