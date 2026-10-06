import { describe, expect, it } from "vitest";
import {
  applyRecurringLabel,
  generateRecurringExpenseDescription,
  parseRecurringOccurrenceDate,
} from "./recurringLabels";

describe("recurring invoice labels and occurrence dates", () => {
  it("parses MySQL datetime values as UTC without shifting the scheduled date", () => {
    expect(parseRecurringOccurrenceDate("2026-06-01 00:00:00").toISOString())
      .toBe("2026-06-01T00:00:00.000Z");
  });

  it("labels the invoice with the scheduled month rather than generation month", () => {
    const labeled = applyRecurringLabel(
      "Phone bill",
      "",
      "Monthly service",
      parseRecurringOccurrenceDate("2026-06-01 00:00:00"),
    );

    expect(labeled.title).toBe("Phone bill - June 2026");
    expect(labeled.notes).toContain("Monthly service");
  });

  it("labels recurring expenses with the scheduled month and avoids duplicate month suffixes", () => {
    const occurrence = parseRecurringOccurrenceDate("2026-09-01 00:00:00");
    expect(generateRecurringExpenseDescription("Monthly Postpaid bill (Director)", occurrence))
      .toBe("Monthly Postpaid bill (Director) for September 2026");
    expect(generateRecurringExpenseDescription("Monthly Postpaid bill (Director) for August 2026", occurrence))
      .toBe("Monthly Postpaid bill (Director) for September 2026");
  });
});