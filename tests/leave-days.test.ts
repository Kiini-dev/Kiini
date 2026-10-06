import { describe, expect, it } from "vitest";
import { addWeekdays, countWeekdaysInclusive } from "../shared/leaveDays";

describe("leave weekday calculations", () => {
  it("counts weekdays inclusively and excludes weekend boundaries", () => {
    expect(countWeekdaysInclusive("2026-06-05", "2026-06-08")).toBe(2);
    expect(countWeekdaysInclusive("2026-06-06", "2026-06-07")).toBe(0);
    expect(countWeekdaysInclusive("2026-06-08", "2026-06-12")).toBe(5);
  });

  it("finds the end date after the requested number of weekdays", () => {
    expect(addWeekdays("2026-06-05", 1)).toBe("2026-06-05");
    expect(addWeekdays("2026-06-05", 2)).toBe("2026-06-08");
    expect(addWeekdays("2026-06-06", 1)).toBe("2026-06-08");
    expect(addWeekdays("2026-06-08", 5)).toBe("2026-06-12");
  });

  it("returns no weekdays for invalid or reversed date ranges", () => {
    expect(countWeekdaysInclusive("2026-06-09", "2026-06-08")).toBe(0);
    expect(countWeekdaysInclusive("2026-02-30", "2026-03-02")).toBe(0);
    expect(addWeekdays("2026-06-08", 0)).toBeNull();
  });
});
