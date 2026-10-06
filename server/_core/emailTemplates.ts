/**
 * Professional Email HTML Template Builder
 * Generates email-client-safe HTML with inline styles, proper padding, and branding.
 * All styles are inline to maximize compatibility across email clients.
 */

interface EmailTemplateOptions {
  title: string;
  preheader?: string;
  bodyContent: string;      // HTML content for the body
  ctaText?: string;         // Optional primary call-to-action button text
  ctaUrl?: string;          // Optional CTA URL
  ctaSecondaryText?: string;
  ctaSecondaryUrl?: string;
  companyName?: string;
  companyEmail?: string;
  logoUrl?: string;
  brandColor?: string;      // Hex color for brand accent (default: #4F46E5)
  footerNote?: string;
}

/**
 * Strips HTML tags and returns plain text (for email fallback).
 */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '  • ')
    .replace(/<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, '$2 ($1)')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function resolveEmailLinks(html: string, baseUrl = process.env.APP_URL || process.env.PUBLIC_APP_URL || 'https://kiini.africa'): string {
  const normalizedBase = baseUrl.replace(/\/$/, '');
  const resolved = html.replace(/\b(href|src)=(['"])(.*?)\2/gi, (_match, attribute: string, quote: string, rawValue: string) => {
    const value = rawValue.replace(/&amp;/gi, '&').trim();
    if (!value || value.startsWith('{{') || value.startsWith('${')) return `${attribute}=${quote}${quote}`;
    if (value.startsWith('#')) return `${attribute}=${quote}${value}${quote}`;
    try {
      const parsed = new URL(value, `${normalizedBase}/`);
      const allowed = attribute.toLowerCase() === 'src'
        ? ['http:', 'https:', 'data:', 'cid:']
        : ['http:', 'https:', 'mailto:', 'tel:'];
      if (!allowed.includes(parsed.protocol)) return `${attribute}=${quote}${quote}`;
      return `${attribute}=${quote}${parsed.href.replace(/&/g, '&amp;')}${quote}`;
    } catch {
      return `${attribute}=${quote}${quote}`;
    }
  });
  return resolved.replace(/<a\b([^>]*?)\bhref=(['"])\s*\2([^>]*)>([\s\S]*?)<\/a>/gi, '$4$5');
}

export function buildEmailHtmlFromContent(
  content: string,
  subject: string,
  companyName = 'Kiini: One Hub. Total Control',
  companyEmail = '',
  logoUrl = '',
): string {
  const normalized = resolveEmailLinks(content);
  if (/<!doctype\s+html|<html[\s>]/i.test(normalized)) return normalized;
  return buildEmailHtml({
    title: subject,
    bodyContent: normalized,
    companyName,
    companyEmail,
    logoUrl: resolveEmailLinks(`<img src="${logoUrl}">`).match(/\bsrc="([^"]+)"/i)?.[1] || logoUrl,
  });
}

export function escapeEmailText(text: string): string {
  return text.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]!).replace(/\r\n?|\n/g, '<br>');
}

/**
 * Creates an info row for data display inside email (e.g., invoice details).
 */
export function emailInfoRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 14px; font-family: Arial, sans-serif;">${label}</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-size: 14px; font-weight: 600; font-family: Arial, sans-serif; text-align: right;">${value}</td>
    </tr>
  `;
}

/**
 * Creates a highlighted total row.
 */
export function emailTotalRow(label: string, value: string, currency = ''): string {
  return `
    <tr>
      <td style="padding: 14px 0 4px; color: #111827; font-size: 16px; font-weight: 700; font-family: Arial, sans-serif;">${label}</td>
      <td style="padding: 14px 0 4px; color: #4F46E5; font-size: 20px; font-weight: 700; font-family: Arial, sans-serif; text-align: right;">${currency}${value}</td>
    </tr>
  `;
}

/**
 * Generates a complete, email-client-safe HTML email document.
 */
export function buildEmailHtml(opts: EmailTemplateOptions): string {
  const {
    title,
    preheader = '',
    bodyContent,
    ctaText,
    ctaUrl,
    ctaSecondaryText,
    ctaSecondaryUrl,
    companyName = 'Kiini: One Hub. Total Control',
    companyEmail = '',
    logoUrl = '',
    brandColor = '#E78200',
    footerNote = '',
  } = opts;

  const year = new Date().getFullYear();

  const logoHtml = logoUrl
    ? `<img src="${logoUrl}" alt="${companyName}" style="max-height: 40px; max-width: 160px; display: inline-block; vertical-align: middle;" />`
    : `<span style="font-size: 22px; font-weight: 700; color: #ffffff; font-family: Arial, sans-serif; letter-spacing: -0.5px;">${companyName}</span>`;

  const ctaButtonHtml = ctaText && ctaUrl ? `
    <div style="text-align: center; margin: 32px 0 24px;">
      <a href="${ctaUrl}" target="_blank"
         style="display: inline-block; padding: 14px 36px; background-color: ${brandColor}; color: #ffffff;
                text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600;
                font-family: Arial, sans-serif; letter-spacing: 0.3px; mso-padding-alt: 14px 36px;">
        <!--[if mso]><i style="letter-spacing: 36px; mso-font-width: -100%; mso-text-raise: 30pt;">&nbsp;</i><![endif]-->
        ${ctaText}
        <!--[if mso]><i style="letter-spacing: 36px; mso-font-width: -100%;">&nbsp;</i><![endif]-->
      </a>
    </div>
  ` : '';

  const ctaSecondaryHtml = ctaSecondaryText && ctaSecondaryUrl ? `
    <div style="text-align: center; margin: 0 0 24px;">
      <a href="${ctaSecondaryUrl}" target="_blank"
         style="display: inline-block; padding: 12px 28px; background-color: transparent; color: ${brandColor};
                text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;
                font-family: Arial, sans-serif; border: 2px solid ${brandColor};">
        ${ctaSecondaryText}
      </a>
    </div>
  ` : '';

  const footerNoteHtml = footerNote ? `
    <p style="margin: 16px 0 0; color: #9ca3af; font-size: 12px; font-family: Arial, sans-serif; text-align: center; line-height: 1.6;">
      ${footerNote}
    </p>
  ` : '';

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
  <title>${title}</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
  <style>
    @media only screen and (max-width: 600px) {
      .email-body-content { padding: 24px 16px !important; }
      .email-wrapper { padding: 16px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F2F3F7; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; -webkit-font-smoothing: antialiased; mso-line-height-rule: exactly;">
  <!-- Preheader text (hidden) -->
  ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #F2F3F7;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ''}

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F2F3F7;">
    <tr>
      <td style="padding: 32px 16px;" class="email-wrapper">
        <!-- Outer centered container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 8px; overflow: hidden;">

          <!-- Header / Brand bar -->
          <tr>
            <td style="background-color: #001D3D; border-bottom: 3px solid ${brandColor};
                        padding: 24px 32px; text-align: left;">
              ${logoHtml}
            </td>
          </tr>

          <!-- Main content card -->
          <tr>
            <td style="background-color: #ffffff; padding: 32px; color: #33344F;" class="email-body-content">
              ${bodyContent}
              ${ctaButtonHtml}
              ${ctaSecondaryHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #ffffff; padding: 24px 32px; border-top: 1px solid #E3E4EC; text-align: left;">
              <p style="margin: 0 0 8px; color: #62647A; font-size: 12px; font-family: Arial, sans-serif; line-height: 1.6;">
                © ${year} ${companyName}${companyEmail ? ` · <a href="mailto:${companyEmail}" style="color: ${brandColor}; text-decoration: none;">${companyEmail}</a>` : ''}
              </p>
              <p style="margin: 0; color: #9A9CB0; font-size: 11px; font-family: Arial, sans-serif;">
                This email was sent by ${companyName}. If you believe this was sent in error, please disregard it.
              </p>
              ${footerNoteHtml}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────
// Pre-built template functions for common system emails
// ─────────────────────────────────────────────────────────

interface CompanyBranding {
  companyName?: string;
  companyEmail?: string;
  logoUrl?: string;
  brandColor?: string;
}

/** Password reset email */
export function passwordResetEmail(
  userName: string,
  resetLink: string,
  branding: CompanyBranding = {}
): { html: string; text: string; subject: string } {
  const subject = `Reset your password — ${branding.companyName || 'Kiini: One Hub. Total Control'}`;

  const bodyContent = `
    <h2 style="margin: 0 0 8px; color: #111827; font-size: 24px; font-weight: 700; font-family: Arial, sans-serif;">Reset your password</h2>
    <p style="margin: 0 0 24px; color: #6b7280; font-size: 15px; font-family: Arial, sans-serif;">Hi ${escapeHtml(userName)},</p>
    <p style="margin: 0 0 20px; color: #374151; font-size: 15px; line-height: 1.7; font-family: Arial, sans-serif;">
      We received a request to reset the password for your account. Click the button below to choose a new password.
      This link will expire in <strong>1 hour</strong>.
    </p>
    <div style="background-color: #fef9c3; border-left: 4px solid #f59e0b; border-radius: 4px; padding: 14px 18px; margin: 24px 0;">
      <p style="margin: 0; color: #92400e; font-size: 14px; font-family: Arial, sans-serif; line-height: 1.6;">
        <strong>Security tip:</strong> If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
      </p>
    </div>
    <p style="margin: 24px 0 8px; color: #6b7280; font-size: 13px; font-family: Arial, sans-serif;">
      If the button above doesn't work, copy and paste this link into your browser:
    </p>
    <p style="margin: 0; word-break: break-all;">
      <a href="${resetLink}" style="color: ${branding.brandColor || '#4F46E5'}; font-size: 13px; font-family: Arial, sans-serif;">${resetLink}</a>
    </p>
  `;

  const html = buildEmailHtml({
    title: 'Reset your password',
    preheader: 'A password reset was requested for your account.',
    bodyContent,
    ctaText: 'Reset Password',
    ctaUrl: resetLink,
    ...branding,
  });

  const text = `Reset your password\n\nHi ${userName},\n\nWe received a request to reset your password. Use the link below (expires in 1 hour):\n\n${resetLink}\n\nIf you didn't request this, ignore this email.`;

  return { html, text, subject };
}

/** Welcome / account created email */
export function welcomeEmail(
  userName: string,
  loginLink: string,
  branding: CompanyBranding = {}
): { html: string; text: string; subject: string } {
  const appName = branding.companyName || 'Kiini: One Hub. Total Control';
  const subject = `Welcome to ${appName}!`;

  const bodyContent = `
    <h2 style="margin: 0 0 8px; color: #111827; font-size: 24px; font-weight: 700; font-family: Arial, sans-serif;">Welcome aboard, ${escapeHtml(userName)}!</h2>
    <p style="margin: 0 0 20px; color: #374151; font-size: 15px; line-height: 1.7; font-family: Arial, sans-serif;">
      Your account on <strong>${appName}</strong> has been created. You now have access to manage your business operations, finances, projects, and much more — all in one place.
    </p>
    <p style="margin: 0 0 8px; color: #374151; font-size: 15px; font-family: Arial, sans-serif; font-weight: 600;">Getting started:</p>
    <ul style="margin: 0 0 24px; padding-left: 0; list-style: none; font-family: Arial, sans-serif;">
      ${['Complete your profile', 'Set up your organization details', 'Invite your team members', 'Create your first invoice or project'].map(item =>
        `<li style="padding: 8px 0; color: #374151; font-size: 14px; border-bottom: 1px solid #f3f4f6;">
          <span style="display: inline-block; width: 20px; height: 20px; background-color: ${branding.brandColor || '#4F46E5'}; color: white; border-radius: 50%; text-align: center; line-height: 20px; font-size: 11px; font-weight: 700; margin-right: 10px; vertical-align: middle;">✓</span>
          ${item}
        </li>`
      ).join('')}
    </ul>
  `;

  const html = buildEmailHtml({
    title: `Welcome to ${appName}`,
    preheader: `Your account is ready. Let's get started.`,
    bodyContent,
    ctaText: 'Go to Dashboard',
    ctaUrl: loginLink,
    ...branding,
  });

  const text = `Welcome to ${appName}!\n\nHi ${userName},\n\nYour account has been created. Log in here:\n${loginLink}`;

  return { html, text, subject };
}

/** Email verification OTP email */
export function emailVerificationEmail(
  userName: string,
  otp: string,
  branding: CompanyBranding = {},
  verificationLink?: string,
): { html: string; text: string; subject: string } {
  const appName = branding.companyName || 'Kiini: One Hub. Total Control';
  const subject = `Verify your ${appName} email address`;
  const verificationBody = verificationLink ? `
    <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.7;font-family:Arial,sans-serif;">Hi ${escapeHtml(userName)}, please confirm your email address to activate your ${escapeHtml(appName)} account.</p>
    <div style="margin:24px 0;padding:18px;text-align:center;background:#eef2ff;border-radius:8px;color:${branding.brandColor || '#4F46E5'};font-size:32px;font-weight:700;letter-spacing:8px;font-family:Arial,sans-serif;">${escapeHtml(otp)}</div>
    <p style="margin:0 0 12px;color:#6b7280;font-size:13px;font-family:Arial,sans-serif;">Or confirm instantly using the secure link below:</p>
  ` : `
    <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.7;font-family:Arial,sans-serif;">Hi ${escapeHtml(userName)}, enter this one-time code to activate your ${escapeHtml(appName)} account:</p>
    <div style="margin:24px 0;padding:18px;text-align:center;background:#eef2ff;border-radius:8px;color:${branding.brandColor || '#4F46E5'};font-size:32px;font-weight:700;letter-spacing:8px;font-family:Arial,sans-serif;">${escapeHtml(otp)}</div>
    <p style="margin:0;color:#6b7280;font-size:13px;font-family:Arial,sans-serif;">This code expires in 10 minutes. If you did not create this account, you can ignore this email.</p>
  `;

  const html = buildEmailHtml({
    title: `Verify your ${appName} email`,
    preheader: 'Your email verification link and code',
    bodyContent: `
      <h2 style="margin:0 0 8px;color:#111827;font-size:24px;font-weight:700;font-family:Arial,sans-serif;">Verify your email</h2>
      ${verificationBody}
      ${verificationLink ? `<p style="margin:0 0 24px;color:#374151;font-size:14px;line-height:1.7;font-family:Arial,sans-serif;"><a href="${verificationLink}" style="color:${branding.brandColor || '#4F46E5'};text-decoration:none;">Confirm my email address</a></p>` : ''}
      <p style="margin:0;color:#6b7280;font-size:13px;font-family:Arial,sans-serif;">This code expires in 10 minutes. If you did not create this account, you can ignore this email.</p>
    `,
    ctaText: verificationLink ? 'Confirm Email' : undefined,
    ctaUrl: verificationLink || undefined,
    ...branding,
  });

  const text = verificationLink
    ? `Verify your email\n\nHi ${userName},\n\nYour verification code is ${otp}.\n\nConfirm here: ${verificationLink}\n\nThis link expires in 10 minutes.`
    : `Verify your email\n\nHi ${userName},\n\nYour verification code is ${otp}. It expires in 10 minutes.`;

  return { html, text, subject };
}

/** Invoice notification email */
export function invoiceEmail(opts: {
  clientName: string;
  invoiceNumber: string;
  amount: string;
  currency: string;
  dueDate: string;
  invoiceUrl: string;
  message?: string;
  branding?: CompanyBranding;
}): { html: string; text: string; subject: string } {
  const { clientName, invoiceNumber, amount, currency, dueDate, invoiceUrl, message, branding = {} } = opts;
  const appName = branding.companyName || 'Kiini: One Hub. Total Control';
  const subject = `Invoice ${invoiceNumber} from ${appName}`;

  const bodyContent = `
    <h2 style="margin: 0 0 8px; color: #111827; font-size: 24px; font-weight: 700; font-family: Arial, sans-serif;">Invoice ${escapeHtml(invoiceNumber)}</h2>
    <p style="margin: 0 0 24px; color: #374151; font-size: 15px; line-height: 1.7; font-family: Arial, sans-serif;">Hi ${escapeHtml(clientName)},</p>
    ${message ? `<p style="margin: 0 0 24px; color: #374151; font-size: 15px; line-height: 1.7; font-family: Arial, sans-serif;">${escapeHtml(message)}</p>` : `<p style="margin: 0 0 24px; color: #374151; font-size: 15px; line-height: 1.7; font-family: Arial, sans-serif;">Please find your invoice attached. A summary is shown below.</p>`}
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9fafb; border-radius: 8px; padding: 4px 0; margin-bottom: 8px;">
      <tr><td style="padding: 0 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          ${emailInfoRow('Invoice Number', invoiceNumber)}
          ${emailInfoRow('Due Date', dueDate)}
          ${emailTotalRow('Total Due', amount, currency + ' ')}
        </table>
      </td></tr>
    </table>
    <p style="margin: 24px 0 0; color: #6b7280; font-size: 13px; font-family: Arial, sans-serif;">
      Please review and process payment before the due date to avoid any inconvenience.
    </p>
  `;

  const html = buildEmailHtml({
    title: `Invoice ${invoiceNumber}`,
    preheader: `Invoice ${invoiceNumber} — ${currency} ${amount} due on ${dueDate}`,
    bodyContent,
    ctaText: 'View & Pay Invoice',
    ctaUrl: invoiceUrl,
    ...branding,
  });

  const text = `Invoice ${invoiceNumber}\n\nHi ${clientName},\n\nAmount Due: ${currency} ${amount}\nDue Date: ${dueDate}\n\nView invoice: ${invoiceUrl}`;

  return { html, text, subject };
}

/** Payment receipt email */
export function paymentReceiptEmail(opts: {
  clientName: string;
  receiptNumber: string;
  amount: string;
  currency: string;
  paymentDate: string;
  paymentMethod: string;
  receiptUrl: string;
  branding?: CompanyBranding;
}): { html: string; text: string; subject: string } {
  const { clientName, receiptNumber, amount, currency, paymentDate, paymentMethod, receiptUrl, branding = {} } = opts;
  const appName = branding.companyName || 'Kiini';
  const subject = `Payment Receipt ${receiptNumber} — ${appName}`;

  const bodyContent = `
    <div style="text-align: center; margin-bottom: 28px;">
      <div style="display: inline-block; width: 64px; height: 64px; background-color: #dcfce7; border-radius: 50%; line-height: 64px; font-size: 28px; text-align: center;">✓</div>
    </div>
    <h2 style="margin: 0 0 8px; color: #111827; font-size: 24px; font-weight: 700; font-family: Arial, sans-serif; text-align: center;">Payment Received</h2>
    <p style="margin: 0 0 24px; color: #374151; font-size: 15px; line-height: 1.7; font-family: Arial, sans-serif;">Hi ${escapeHtml(clientName)},</p>
    <p style="margin: 0 0 24px; color: #374151; font-size: 15px; line-height: 1.7; font-family: Arial, sans-serif;">
      We've received your payment. Thank you! Here is your receipt summary:
    </p>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9fafb; border-radius: 8px; padding: 4px 0; margin-bottom: 8px;">
      <tr><td style="padding: 0 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          ${emailInfoRow('Receipt Number', receiptNumber)}
          ${emailInfoRow('Payment Date', paymentDate)}
          ${emailInfoRow('Payment Method', paymentMethod)}
          ${emailTotalRow('Amount Paid', amount, currency + ' ')}
        </table>
      </td></tr>
    </table>
  `;

  const html = buildEmailHtml({
    title: `Receipt ${receiptNumber}`,
    preheader: `Payment of ${currency} ${amount} received. Thank you!`,
    bodyContent,
    ctaText: 'Download Receipt',
    ctaUrl: receiptUrl,
    brandColor: '#16a34a',
    ...branding,
  });

  const text = `Payment Received\n\nHi ${clientName},\n\nReceipt: ${receiptNumber}\nAmount: ${currency} ${amount}\nDate: ${paymentDate}\nMethod: ${paymentMethod}\n\nDownload receipt: ${receiptUrl}`;

  return { html, text, subject };
}

/** Generic notification email */
export function notificationEmail(opts: {
  title: string;
  recipientName: string;
  message: string;
  ctaText?: string;
  ctaUrl?: string;
  branding?: CompanyBranding;
}): { html: string; text: string; subject: string } {
  const { title, recipientName, message, ctaText, ctaUrl, branding = {} } = opts;

  const bodyContent = `
    <h2 style="margin: 0 0 16px; color: #111827; font-size: 22px; font-weight: 700; font-family: Arial, sans-serif;">${escapeHtml(title)}</h2>
    <p style="margin: 0 0 12px; color: #374151; font-size: 15px; font-family: Arial, sans-serif;">Hi ${escapeHtml(recipientName)},</p>
    <div style="color: #374151; font-size: 15px; line-height: 1.7; font-family: Arial, sans-serif;">
      ${message}
    </div>
  `;

  const html = buildEmailHtml({
    title,
    bodyContent,
    ctaText,
    ctaUrl,
    ...branding,
  });

  const text = `${title}\n\nHi ${recipientName},\n\n${htmlToPlainText(message)}${ctaUrl ? `\n\n${ctaText || 'View'}: ${ctaUrl}` : ''}`;

  return { html, text, subject: title };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
