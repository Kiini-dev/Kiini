import { describe, expect, it } from "vitest";
import { injectDocumentLetterhead, sanitizeDocumentLetterhead } from "./document-branding";

describe("document letterhead", () => {
  it("sanitizes uploaded markup and keeps safe styling", () => {
    const result = sanitizeDocumentLetterhead(`
      <html><head><style>.brand { color: #123456; background: url(https://example.com/x); }</style></head>
      <body><script>alert(1)</script><div class="brand" onclick="alert(1)">Company</div>
      <a href="javascript:alert(1)">unsafe link</a></body></html>
    `);

    expect(result).toContain(".brand { color: #123456; background: none; }");
    expect(result).toContain('class="brand"');
    expect(result).toContain("Company");
    expect(result).not.toContain("<script");
    expect(result).not.toContain("onclick");
    expect(result).not.toContain("javascript:");
  });

  it("injects an image letterhead without shifting page-based layouts", () => {
    const result = injectDocumentLetterhead(
      '<html><head></head><body><section class="pg">Page</section></body></html>',
      "",
      "data:image/png;base64,AA==",
    );

    expect(result).toContain('class="kiini-document-letterhead"');
    expect(result).toContain("data:image/png;base64,AA==");
    expect(result).not.toContain("body{padding-top:28mm");
    expect(result).toContain('<section class="pg">Page</section>');
  });

  it("reserves space for letterhead on regular document layouts", () => {
    const result = injectDocumentLetterhead(
      "<html><head></head><body><main>Document</main></body></html>",
      "<div>Company</div>",
      "",
    );

    expect(result).toContain("body{padding-top:28mm!important}");
    expect(result).toContain("Company");
  });
});
