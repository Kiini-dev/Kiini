import { describe, expect, it } from "vitest";
import { normalizeSupplierDateValue } from "./supplierDate";

describe("normalizeSupplierDateValue", () => {
  it("keeps valid ISO date strings unchanged", () => {
    expect(normalizeSupplierDateValue("2024-06-20")).toBe("2024-06-20");
  });

  it("converts Date objects to YYYY-MM-DD", () => {
    expect(normalizeSupplierDateValue(new Date("2024-06-20T00:00:00Z"))).toBe("2024-06-20");
  });

  it("safely handles date-like objects without crashing", () => {
    const dateLike = { toISOString: () => "2024-06-20T00:00:00.000Z" };
    expect(normalizeSupplierDateValue(dateLike as any)).toBe("2024-06-20");
  });
});
