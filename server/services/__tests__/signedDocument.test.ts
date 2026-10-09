import { describe, expect, it } from "vitest";
import { placeSignaturesInFields } from "../signedDocument";

describe("placeSignaturesInFields", () => {
  it("places the ordered electronic signatures inside the document's signature blocks", () => {
    const html = `<div class="signatures">
      <div class="signature">For Melitech Solutions<br><br>Name and signature</div>
      <div class="signature">For Mumbi Ke<br><br>Name and signature</div>
    </div>`;

    const result = placeSignaturesInFields(html, [
      { signerName: "Mumbi Ke", typedSignature: "Mumbi Ke", signedAt: "2026-10-08 17:18:57" },
      { signerName: "Eliakim Mwaniki", typedSignature: "Eliakim Mwaniki", signedAt: "2026-10-08 17:21:40" },
    ]);

    expect(result.match(/class="kiini-electronic-signature"/g)).toHaveLength(2);
    expect(result.indexOf("Mumbi Ke")).toBeLessThan(result.indexOf("Eliakim Mwaniki"));
    expect(result).not.toContain("Name and signature");
  });

  it("supports explicit signature tokens and escapes signer-provided markup", () => {
    const result = placeSignaturesInFields(
      "<p>{{signature_2}}</p><p>[[signature]]</p>",
      [
        { signerName: "First", typedSignature: "First", signedAt: "2026-10-08" },
        { signerName: "Second", typedSignature: "<script>alert(1)</script>", signedAt: "2026-10-08" },
      ],
    );

    expect(result).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(result).not.toContain("<script>");
    expect(result.match(/class="kiini-electronic-signature"/g)).toHaveLength(2);
  });
});
