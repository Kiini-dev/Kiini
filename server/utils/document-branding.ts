import sanitizeHtml from "sanitize-html";

const LETTERHEAD_TAGS = [
  "img", "table", "thead", "tbody", "tr", "td", "th", "div", "span",
  "p", "br", "hr", "strong", "b", "em", "i", "u", "small", "h1", "h2", "h3",
  "ul", "ol", "li", "a",
];

const LETTERHEAD_OPTIONS = {
  allowedTags: LETTERHEAD_TAGS,
  allowedAttributes: {
    a: ["href", "title"],
    img: ["src", "alt", "width", "height", "style"],
    "*": ["class", "style"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel", "data"],
  allowedStyles: {
    "*": {
      color: [/^#[\da-f]{3,8}$/i, /^[a-z]+$/i],
      "background-color": [/^#[\da-f]{3,8}$/i, /^[a-z]+$/i],
      "font-family": [/^[\w\s,"'-]+$/],
      "font-size": [/^\d+(?:\.\d+)?(?:px|pt|em|rem|%)$/],
      "font-weight": [/^(?:normal|bold|[1-9]00)$/],
      "text-align": [/^(?:left|right|center|justify)$/],
      "vertical-align": [/^(?:top|middle|bottom)$/],
      width: [/^\d+(?:\.\d+)?(?:px|pt|mm|cm|%)$/],
      height: [/^\d+(?:\.\d+)?(?:px|pt|mm|cm|%)$/],
      "max-width": [/^\d+(?:\.\d+)?(?:px|pt|mm|cm|%)$/],
      "max-height": [/^\d+(?:\.\d+)?(?:px|pt|mm|cm|%)$/],
      padding: [/^[\d.\s]*(?:px|pt|mm|cm|%)?$/],
      margin: [/^[\d.\s]*(?:px|pt|mm|cm|%)?$/],
      border: [/^[\w#(),.\s-]+$/],
      "border-bottom": [/^[\w#(),.\s-]+$/],
      "line-height": [/^\d+(?:\.\d+)?(?:px|pt|em|rem|%)?$/],
      display: [/^(?:block|inline|inline-block|flex|table)$/],
      "object-fit": [/^(?:contain|cover)$/],
    },
  },
};

function removeUnsafeCss(css: string): string {
  return css
    .replace(/@import\b[^;]*;?/gi, "")
    .replace(/@font-face\s*\{[^}]*\}/gi, "")
    .replace(/url\s*\([^)]*\)/gi, "none")
    .replace(/expression\s*\([^)]*\)/gi, "")
    .replace(/(?:javascript|vbscript)\s*:/gi, "")
    .replace(/(?:behavior|-moz-binding)\s*:[^;}]*;?/gi, "");
}

export function sanitizeDocumentLetterhead(html: string): string {
  const bodyMatch = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  const source = bodyMatch?.[1] ?? html;
  const styles = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((match) => removeUnsafeCss(match[1]))
    .filter(Boolean)
    .join("\n");
  const safeMarkup = sanitizeHtml(source.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ""), LETTERHEAD_OPTIONS);
  const safeStyles = styles ? `<style>${styles}</style>` : "";
  return `${safeStyles}${safeMarkup}`;
}

function escapeAttribute(value: string): string {
  return value.replace(/[&"<>]/g, (character) => ({
    "&": "&amp;",
    '"': "&quot;",
    "<": "&lt;",
    ">": "&gt;",
  })[character]!);
}

export function injectDocumentLetterhead(documentHtml: string, html: string, image: string): string {
  if (!html && !image) return documentHtml;
  const content = image
    ? `<img src="${escapeAttribute(image)}" alt="Company letterhead">`
    : sanitizeDocumentLetterhead(html);
  const pageBasedLayout = /class=["'][^"']*\bpg\b/i.test(documentHtml);
  const styles = `<style>
.kiini-document-letterhead{position:fixed;top:0;left:0;right:0;height:25mm;display:flex;align-items:center;justify-content:center;overflow:hidden;z-index:9999;background:#fff}
.kiini-document-letterhead img{display:block;width:100%;height:100%;max-height:25mm;object-fit:contain}
${pageBasedLayout ? "" : "body{padding-top:28mm!important}"}
@media print{.kiini-document-letterhead{position:fixed;break-inside:avoid}}
</style>`;
  const header = `<div class="kiini-document-letterhead">${content}</div>`;
  let result = documentHtml;
  const headEnd = result.search(/<\/head\s*>/i);
  if (headEnd >= 0) result = `${result.slice(0, headEnd)}${styles}${result.slice(headEnd)}`;
  else result = `${styles}${result}`;
  const bodyStart = result.match(/<body\b[^>]*>/i);
  if (bodyStart?.index !== undefined) {
    const insertAt = bodyStart.index + bodyStart[0].length;
    result = `${result.slice(0, insertAt)}${header}${result.slice(insertAt)}`;
  } else {
    result = `${header}${result}`;
  }
  return result;
}
