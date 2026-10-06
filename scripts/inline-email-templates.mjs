import fs from "node:fs";
import path from "node:path";
import juice from "juice";

const directory = path.resolve("email-templates");
const socialFooter = `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:16px;">
  <tr>
    <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#6B7280;">
      <a href="{{company_facebook_url}}" style="display:inline-block;margin:0 6px;color:#2563EB;text-decoration:none;font-weight:bold;">f</a>
      <a href="{{company_twitter_url}}" style="display:inline-block;margin:0 6px;color:#2563EB;text-decoration:none;font-weight:bold;">X</a>
      <a href="{{company_linkedin_url}}" style="display:inline-block;margin:0 6px;color:#2563EB;text-decoration:none;font-weight:bold;">in</a>
      <a href="{{company_instagram_url}}" style="display:inline-block;margin:0 6px;color:#2563EB;text-decoration:none;font-weight:bold;">ig</a>
    </td>
  </tr>
</table>`;

const tokenReplacements = [
  ["[CLIENT_NAME]", "{{client_name}}"],
  ["[INVOICE_NUMBER].pdf", "{{invoice_pdf_filename}}"],
  ["[RECEIPT_NUMBER].pdf", "{{receipt_pdf_filename}}"],
  ["[INVOICE_NUMBER]", "{{invoice_number}}"],
  ["[RECEIPT_NUMBER]", "{{receipt_number}}"],
  ["[INVOICE_DATE]", "{{invoice_date}}"],
  ["[PAYMENT_DATE]", "{{payment_date}}"],
  ["[PAYMENT_METHOD]", "{{payment_method}}"],
  ["[AMOUNT]", "{{amount_paid}}"],
  ["[USER_NAME]", "{{user_name}}"],
  ["[USER_EMAIL]", "{{user_email}}"],
  ["[RESET_LINK]", "{{reset_link}}"],
];

for (const entry of fs.readdirSync(directory)) {
  if (!entry.endsWith(".html")) continue;

  const filePath = path.join(directory, entry);
  let html = fs.readFileSync(filePath, "utf8");
  for (const [from, to] of tokenReplacements) html = html.replaceAll(from, to);

  html = juice(html, {
    applyStyleTags: true,
    removeStyleTags: true,
    preserveMediaQueries: true,
    applyWidthAttributes: true,
    applyHeightAttributes: true,
    applyAttributesTableElements: true,
  });

  if (!/company_facebook_url|social-links/i.test(html)) {
    html = html.replace(/\s*<\/body>/i, `${socialFooter}\n</body>`);
  }

  fs.writeFileSync(filePath, html.endsWith("\n") ? html : `${html}\n`);
}