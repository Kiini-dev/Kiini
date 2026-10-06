import { describe, expect, it } from "vitest";
import { isMissingOptionalSchemaError, queryOptionalPaymentData } from "../ai";

describe("AI analytics optional supplier schema handling", () => {
  it("recognizes missing tables and columns wrapped by Drizzle", () => {
    expect(isMissingOptionalSchemaError({ cause: { code: "ER_NO_SUCH_TABLE" } })).toBe(true);
    expect(isMissingOptionalSchemaError({ cause: { code: "ER_BAD_FIELD_ERROR" } })).toBe(true);
    expect(isMissingOptionalSchemaError(new Error("Table 'crm.suppliers' doesn't exist"))).toBe(true);
    expect(isMissingOptionalSchemaError(new Error("Unknown column 'organizationId'"))).toBe(true);
  });

  it("does not suppress connection or unrelated query failures", () => {
    expect(isMissingOptionalSchemaError({ cause: { code: "ECONNREFUSED" } })).toBe(false);
    expect(isMissingOptionalSchemaError(new Error("Query timed out"))).toBe(false);
  });

  it("keeps chat available when legacy payments schema is missing", async () => {
    const paymentQuery = vi.fn().mockRejectedValue({
      cause: { code: "ER_BAD_FIELD_ERROR", message: "Unknown column 'paymentDate'" },
    });

    await expect(queryOptionalPaymentData(paymentQuery, "test")).resolves.toBeNull();
    expect(paymentQuery).toHaveBeenCalledOnce();
  });

  it("still surfaces unrelated payment query failures", async () => {
    const failure = new Error("Database connection lost");
    await expect(queryOptionalPaymentData(async () => { throw failure; }, "test")).rejects.toBe(failure);
  });
});