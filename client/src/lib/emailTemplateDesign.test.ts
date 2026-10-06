import { describe, expect, it } from "vitest";
import {
  designEmailTemplateBody,
  MARKETING_EMAIL_TEMPLATE_DEFAULTS,
  parseMarketingTemplateCatalog,
  PURCHASING_EMAIL_TEMPLATE_DEFAULTS,
} from "./emailTemplateDesign";

describe("email template design helpers", () => {
  it("wraps template fragments in a responsive branded email document", () => {
    const html = designEmailTemplateBody("Welcome <there>", "<p>Hello {first_name}</p>");

    expect(html).toContain("<!doctype html>");
    expect(html).toContain("max-width:640px");
    expect(html).toContain("Welcome &lt;there&gt;");
    expect(html).toContain("<p>Hello {first_name}</p>");
  });

  it("does not nest complete documents when an existing template is opened", () => {
    const existing = "<!doctype html><html><body><p>Existing design</p></body></html>";

    expect(designEmailTemplateBody("Subject", existing)).toBe(existing);
  });

  it("provides designed, non-empty marketing and purchasing defaults", () => {
    expect(MARKETING_EMAIL_TEMPLATE_DEFAULTS).toHaveLength(5);
    expect(PURCHASING_EMAIL_TEMPLATE_DEFAULTS).toHaveLength(4);
    expect([...MARKETING_EMAIL_TEMPLATE_DEFAULTS, ...PURCHASING_EMAIL_TEMPLATE_DEFAULTS]
      .every((template) => template.subject.trim() && template.body.includes("<p>"))).toBe(true);
  });

  it("rejects malformed marketing catalogs and retains only valid entries", () => {
    expect(parseMarketingTemplateCatalog("{broken")).toEqual([]);
    expect(parseMarketingTemplateCatalog(JSON.stringify([
      { id: "custom-one", name: "Custom", subject: "Subject", body: "<p>Body</p>" },
      { id: "invalid", name: "Missing body" },
    ]))).toEqual([
      { id: "custom-one", name: "Custom", subject: "Subject", body: "<p>Body</p>" },
    ]);
  });
});
