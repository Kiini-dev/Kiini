import { describe, expect, it } from "vitest";
import { applyContractTypeTemplate, CONTRACT_TYPES, getContractTemplateFields } from "./contractTemplates";

describe("contract type templates", () => {
  it("provides a distinct, complete draft for each built-in contract type", () => {
    const descriptions = new Set<string>();
    for (const type of CONTRACT_TYPES) {
      const fields = getContractTemplateFields(type.value);
      expect(fields.name).toBe(type.label);
      expect(fields.description.length).toBeGreaterThan(100);
      descriptions.add(fields.description);
      expect(fields.paymentTerms).toBeTruthy();
      expect(fields.terminationTerms).toBeTruthy();
      expect(fields.confidentialityTerms).toBeTruthy();
      expect(fields.disputeResolution).toBeTruthy();
    }
    expect(descriptions.size).toBe(CONTRACT_TYPES.length);
  });

  it("uses the supplied marketing and CCTV agreement guidance for service contracts", () => {
    const service = getContractTemplateFields("service").description.toLowerCase();
    expect(service).toContain("cctv");
    expect(service).toContain("router");
    expect(service).toContain("social-media");
    expect(service).toContain("monthly");
    expect(service).toContain("client data");
    expect(getContractTemplateFields("service").disputeResolution).toContain("arbitration");
    expect(getContractTemplateFields("Digital Marketing Agreement").description).toContain("mutually selected platforms");
  });

  it("replaces previous generated defaults on type change but preserves user edits", () => {
    const service = applyContractTypeTemplate({
      contractType: "",
      name: "",
      description: "",
      paymentTerms: "",
      terminationTerms: "",
      confidentialityTerms: "",
      disputeResolution: "",
    }, "service");
    const edited = { ...service, name: "My custom title", description: "My negotiated scope" };

    const lease = applyContractTypeTemplate(edited, "lease");

    expect(lease.name).toBe("My custom title");
    expect(lease.description).toBe("My negotiated scope");
    expect(lease.paymentTerms).toContain("lease consideration");
    expect(lease.terminationTerms).toContain("Expiry");
  });

  it("supports custom configured types with their label and a safe general draft", () => {
    const fields = getContractTemplateFields("custom_type", "Custom Contract");
    expect(fields.name).toBe("Custom Contract");
    expect(fields.description).toContain("transaction and purpose");
  });
});
