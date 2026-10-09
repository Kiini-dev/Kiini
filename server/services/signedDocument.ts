export interface SignedDocumentSigner {
  signerName: string;
  typedSignature: string | null;
  signedAt: string | null;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]!);
}

function renderSignatureMark(signer: SignedDocumentSigner): string {
  return `<span class="kiini-electronic-signature" style="display:block;margin-top:12px;font-family:Arial,sans-serif">
    <strong style="display:block;font-size:16px;font-style:italic;color:#123b58">${escapeHtml(signer.typedSignature || signer.signerName)}</strong>
    <span style="display:block;margin-top:3px;font-size:10px;color:#52616b">Digitally signed by ${escapeHtml(signer.signerName)} · ${escapeHtml(signer.signedAt || "")} UTC</span>
  </span>`;
}

export function placeSignaturesInFields(documentHtml: string, signers: SignedDocumentSigner[]): string {
  let signerIndex = 0;
  const withFieldSignatures = documentHtml.replace(
    /<(div|td|section)\b([^>]*\bclass\s*=\s*(["'])[^"']*\bsignature\b[^"']*\3[^>]*)>([\s\S]*?)<\/\1\s*>/gi,
    (field, _tag: string, _attributes: string, _quote: string, content: string) => {
      const signer = signers[signerIndex];
      if (!signer) return field;
      signerIndex += 1;
      const mark = renderSignatureMark(signer);
      if (/name\s+and\s+signature/i.test(content)) {
        return field.replace(/name\s+and\s+signature/i, mark);
      }
      return field.replace(content, `${content}${mark}`);
    },
  );
  return withFieldSignatures.replace(
    /\{\{\s*signature(?:_([1-9]\d*))?\s*\}\}|\[\[\s*signature(?:_([1-9]\d*))?\s*\]\]/gi,
    (placeholder, numberedA: string | undefined, numberedB: string | undefined) => {
      const requestedIndex = Number(numberedA || numberedB || 1) - 1;
      const signer = signers[requestedIndex];
      return signer ? renderSignatureMark(signer) : placeholder;
    },
  );
}
