import { describe, expect, it } from "vitest";
import { getNextSortDirection, getSortIndicator } from "@/lib/tableSort";

describe("table sort helpers", () => {
  it("toggles descending when the active field is clicked again", () => {
    expect(getNextSortDirection("name", "name", "asc")).toBe("desc");
    expect(getNextSortDirection("status", "name", "asc")).toBe("asc");
  });

  it("shows the active arrow only for the selected column", () => {
    expect(getSortIndicator("name", "name", "asc")).toBe("↑");
    expect(getSortIndicator("name", "status", "asc")).toBe("↕");
    expect(getSortIndicator("status", "status", "desc")).toBe("↓");
  });
});
