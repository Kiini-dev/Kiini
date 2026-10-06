function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]!);
}

export function designEmailTemplateBody(subject: string, body: string): string {
  if (/<!doctype\s+html|<html[\s>]/i.test(body)) return body;

  const content = body.trim() || "<p>Write your message here.</p>";
  return `<!doctype html>
<html>
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(subject)}</title></head>
  <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#172033">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0">A message from your team</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:32px 12px">
      <tr><td align="center">
        <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:640px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden">
          <tr><td style="height:6px;background-color:#f97316;font-size:0;line-height:0">&nbsp;</td></tr>
          <tr><td style="padding:24px 32px;background-color:#001d3d;color:#ffffff;font-size:13px;font-weight:bold;letter-spacing:1.2px">YOUR ORGANIZATION <span style="color:#f97316">|</span> BUSINESS UPDATE</td></tr>
          <tr><td style="padding:32px">
            <div style="font-size:15px;line-height:1.7;color:#334155">${content}</div>
          </td></tr>
          <tr><td style="padding:20px 32px;border-top:1px solid #e2e8f0;background-color:#f8fafc;color:#64748b;font-size:12px;line-height:1.6">This message was sent by your organization. If you have questions, reply to this email or contact your usual representative.</td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

export interface MarketingEmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export const MARKETING_EMAIL_TEMPLATE_DEFAULTS: MarketingEmailTemplate[] = [
  {
    id: "marketing-welcome-email",
    name: "Welcome Email",
    subject: "Welcome, {first_name}!",
    body: "<p>Hi {first_name},</p><p>Welcome to our community. We are glad you are here and look forward to keeping you up to date with helpful news, product updates, and offers.</p><p>Explore your account whenever you are ready.</p><p><a href=\"{dashboard_url}\" style=\"display:inline-block;padding:12px 22px;background:#f97316;color:#ffffff;text-decoration:none;border-radius:5px;font-weight:bold\">Visit your dashboard</a></p><p>Thank you,<br>{our_company_name}</p>",
  },
  {
    id: "marketing-product-launch",
    name: "Product Launch",
    subject: "Introducing {product_name}",
    body: "<p>Hi {first_name},</p><p>We are excited to introduce <strong>{product_name}</strong>, created to help you get more from your business.</p><table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"margin:20px 0;background:#f8fafc;border:1px solid #e2e8f0\"><tr><td style=\"padding:18px\"><strong>What is new</strong><br>Discover the latest improvements and see how they fit your workflow.</td></tr></table><p><a href=\"{dashboard_url}\" style=\"display:inline-block;padding:12px 22px;background:#f97316;color:#ffffff;text-decoration:none;border-radius:5px;font-weight:bold\">Explore the update</a></p><p>Best,<br>{our_company_name}</p>",
  },
  {
    id: "marketing-event-invitation",
    name: "Event Invitation",
    subject: "You are invited: {event_name}",
    body: "<p>Hi {first_name},</p><p>We would love you to join us for <strong>{event_name}</strong>.</p><table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"margin:20px 0;background:#f8fafc;border:1px solid #e2e8f0\"><tr><td style=\"padding:18px\"><strong>Date and time</strong><br>{event_date}</td></tr></table><p>We hope you can make it.</p><p>Regards,<br>{our_company_name}</p>",
  },
  {
    id: "marketing-monthly-digest",
    name: "Monthly Digest",
    subject: "Your monthly update from {our_company_name}",
    body: "<p>Hi {first_name},</p><p>Here is your monthly roundup of news, useful resources, and updates from our team.</p><h2 style=\"font-size:17px;color:#001d3d\">In this issue</h2><ul><li>What is new this month</li><li>Ideas and resources for your team</li><li>Upcoming announcements</li></ul><p>Thank you for being part of our community.</p><p>Warm regards,<br>{our_company_name}</p>",
  },
  {
    id: "marketing-special-offer",
    name: "Special Offer",
    subject: "A special offer for you, {first_name}",
    body: "<p>Hi {first_name},</p><p>As a thank-you for being with us, enjoy this special offer:</p><table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"margin:20px 0;background:#fff7ed;border:1px solid #fed7aa\"><tr><td style=\"padding:18px;text-align:center\"><strong style=\"font-size:20px;color:#9a3412\">{promo_code}</strong><br>Use this code when you redeem your offer.</td></tr></table><p>We hope you enjoy it.</p><p>Best,<br>{our_company_name}</p>",
  },
];

export interface PurchasingEmailTemplate extends MarketingEmailTemplate {
  vars: string[];
}

export const PURCHASING_EMAIL_TEMPLATE_DEFAULTS: PurchasingEmailTemplate[] = [
  {
    id: "purchase-order-created-team",
    name: "Purchase Order Created - Team",
    subject: "Purchase Order {po_number} Created",
    vars: ["recipient_name", "po_number", "vendor_name", "po_total", "due_date", "company_name", "approval_status"],
    body: "<p>Hello {recipient_name},</p><p>A purchase order has been created and is ready for review.</p><table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-collapse:collapse;margin:20px 0\"><tr><td style=\"padding:10px;border-bottom:1px solid #e2e8f0;color:#64748b\">Purchase order</td><td style=\"padding:10px;border-bottom:1px solid #e2e8f0\"><strong>{po_number}</strong></td></tr><tr><td style=\"padding:10px;border-bottom:1px solid #e2e8f0;color:#64748b\">Supplier</td><td style=\"padding:10px;border-bottom:1px solid #e2e8f0\">{vendor_name}</td></tr><tr><td style=\"padding:10px;border-bottom:1px solid #e2e8f0;color:#64748b\">Total</td><td style=\"padding:10px;border-bottom:1px solid #e2e8f0\">{po_total}</td></tr><tr><td style=\"padding:10px;color:#64748b\">Status</td><td style=\"padding:10px\">{approval_status}</td></tr></table><p>Please review the order in the procurement workspace.</p><p>Regards,<br>{company_name}</p>",
  },
  {
    id: "purchase-order-approved-team",
    name: "Purchase Order Approved - Team",
    subject: "Purchase Order {po_number} Approved",
    vars: ["recipient_name", "po_number", "vendor_name", "po_total", "approved_by", "company_name"],
    body: "<p>Hello {recipient_name},</p><p>Purchase order <strong>{po_number}</strong> has been approved.</p><table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-collapse:collapse;margin:20px 0\"><tr><td style=\"padding:10px;border-bottom:1px solid #e2e8f0;color:#64748b\">Supplier</td><td style=\"padding:10px;border-bottom:1px solid #e2e8f0\">{vendor_name}</td></tr><tr><td style=\"padding:10px;border-bottom:1px solid #e2e8f0;color:#64748b\">Order total</td><td style=\"padding:10px;border-bottom:1px solid #e2e8f0\">{po_total}</td></tr><tr><td style=\"padding:10px;color:#64748b\">Approved by</td><td style=\"padding:10px\">{approved_by}</td></tr></table><p>The order can proceed to the next procurement step.</p><p>Regards,<br>{company_name}</p>",
  },
  {
    id: "purchase-order-received-team",
    name: "Purchase Order Received - Team",
    subject: "Goods Received for Purchase Order {po_number}",
    vars: ["recipient_name", "po_number", "vendor_name", "received_date", "po_total", "company_name"],
    body: "<p>Hello {recipient_name},</p><p>Goods have been recorded as received for purchase order <strong>{po_number}</strong>.</p><table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-collapse:collapse;margin:20px 0\"><tr><td style=\"padding:10px;border-bottom:1px solid #e2e8f0;color:#64748b\">Supplier</td><td style=\"padding:10px;border-bottom:1px solid #e2e8f0\">{vendor_name}</td></tr><tr><td style=\"padding:10px;border-bottom:1px solid #e2e8f0;color:#64748b\">Received on</td><td style=\"padding:10px;border-bottom:1px solid #e2e8f0\">{received_date}</td></tr><tr><td style=\"padding:10px;color:#64748b\">Order total</td><td style=\"padding:10px\">{po_total}</td></tr></table><p>Regards,<br>{company_name}</p>",
  },
  {
    id: "purchase-order-rejected-team",
    name: "Purchase Order Rejected - Team",
    subject: "Purchase Order {po_number} Requires Changes",
    vars: ["recipient_name", "po_number", "vendor_name", "rejection_reason", "company_name"],
    body: "<p>Hello {recipient_name},</p><p>Purchase order <strong>{po_number}</strong> for {vendor_name} was not approved.</p><table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"margin:20px 0;background:#fff7ed;border-left:4px solid #f97316\"><tr><td style=\"padding:16px\"><strong>Reason</strong><br>{rejection_reason}</td></tr></table><p>Please review the feedback and update the order before resubmitting.</p><p>Regards,<br>{company_name}</p>",
  },
];

export function parseMarketingTemplateCatalog(value: string | undefined): MarketingEmailTemplate[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is MarketingEmailTemplate => {
      if (!item || typeof item !== "object") return false;
      const candidate = item as Record<string, unknown>;
      return typeof candidate.id === "string"
        && typeof candidate.name === "string"
        && typeof candidate.subject === "string"
        && typeof candidate.body === "string";
    });
  } catch {
    return [];
  }
}
