import { describe, it, expect } from "vitest";
import { normalizeSupplierImportRow } from "../importExport";

describe("supplier import schema compatibility", () => {
  it("maps legacy CSV column names to the current supplier schema", () => {
    const row = normalizeSupplierImportRow({
      companyName: "Acme Supply",
      altPhone: "+254700123456",
      taxIdPin: "P123456789A",
      qualificationStatus: "qualified",
      notes: "Preferred vendor",
    });

    expect(row).toMatchObject({
      companyName: "Acme Supply",
      alternatePhone: "+254700123456",
      taxId: "P123456789A",
      qualificationStatus: "qualified",
      notes: "Preferred vendor",
    });

    expect(row).not.toHaveProperty("altPhone");
    expect(row).not.toHaveProperty("taxIdPin");
  });
});
