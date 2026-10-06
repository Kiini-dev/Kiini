declare module "sanitize-html" {
  interface SanitizeHtmlOptions {
    allowedTags?: string[];
    allowedAttributes?: Record<string, string[]>;
  }

  interface SanitizeHtml {
    (dirty: string, options?: SanitizeHtmlOptions): string;
    defaults: {
      allowedTags: string[];
      allowedAttributes: Record<string, string[]>;
    };
  }

  const sanitizeHtml: SanitizeHtml;
  export default sanitizeHtml;
}
