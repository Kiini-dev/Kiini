/**
 * Kiini – branded HTML email templates
 * Uses orange gradient header, content section, dark footer.
 * All templates accept a Record<string, string> for variable replacement.
 */

const YEAR = new Date().getFullYear();

// ── Shared layout wrapper ──────────────────────────────────────────────
function layout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${title}</title>
<style>
body{margin:0;padding:20px;background:#f4f4f4;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;line-height:1.6;color:#333;}
.email-container{max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.1);}
.header{background:linear-gradient(135deg,#FF8C00 0%,#FFA500 100%);color:#fff;padding:30px 20px;text-align:center;}
.header img{max-width:150px;margin-bottom:10px;}
.header h1{margin:0;font-size:24px;font-weight:600;}
.content{padding:30px 20px;}
.greeting{font-size:18px;color:#333;margin-bottom:20px;}
.message{color:#555;margin-bottom:25px;}
.detail-box{background:#f9f9f9;border-left:4px solid #FF8C00;padding:15px;margin:20px 0;border-radius:4px;}
.detail-box h3{margin-top:0;color:#FF8C00;font-size:16px;}
.detail-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e0e0e0;}
.detail-row:last-child{border-bottom:none;}
.detail-label{font-weight:600;color:#666;}
.detail-value{color:#333;}
.amount-total{font-size:20px;font-weight:bold;color:#FF8C00;}
.cta-button{display:inline-block;background:linear-gradient(135deg,#FF8C00 0%,#FFA500 100%);color:#fff;padding:12px 30px;text-decoration:none;border-radius:5px;font-weight:600;margin:20px 0;text-align:center;}
.info-box{background:#f0f8ff;border-left:4px solid #4169E1;padding:15px;margin:20px 0;border-radius:4px;}
.info-box h3{margin-top:0;color:#4169E1;font-size:16px;}
.warning-box{background:#fff8f0;border-left:4px solid #FF8C00;padding:15px;margin:20px 0;border-radius:4px;}
.footer{background:#2c2c2c;color:#fff;padding:25px 20px;text-align:center;font-size:14px;}
.footer-tagline{color:#FF8C00;font-style:italic;font-size:16px;margin-bottom:15px;}
.contact-info{margin:15px 0;color:#ccc;}
.contact-info a{color:#FF8C00;text-decoration:none;}
</style></head>
<body><div class="email-container">
<div class="header">
  <img src="https://accounts.kiini.africa/logo.png" alt="Kiini">
  <h1>${title}</h1>
</div>
<div class="content">${bodyHtml}</div>
<div class="footer">
  <div class="footer-tagline">&mdash; Redefining Technology!!! &mdash;</div>
  <div class="contact-info">
    <strong>Kiini</strong><br>
    Email: <a href="mailto:info@kiini.africa">info@kiini.africa</a><br>
    Phone: +254 700 000 000<br>
    Website: <a href="https://www.kiini.africa">www.kiini.africa</a>
  </div>
  <p style="margin-top:15px;font-size:12px;color:#999;">&copy; ${YEAR} Kiini. All rights reserved.<br>This email and any attachments are confidential and intended solely for the recipient.</p>
</div>
</div></body></html>`;
}

// ── Helper: replace {{VAR}} placeholders ────────────────────────────────
export function renderTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, val] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, val);
  }
  return result;
}

// ── Template: Invoice Sent ──────────────────────────────────────────────
export function invoiceSentTemplate(): string {
  return layout('Invoice', `
<div class="greeting">Dear <strong>{{clientName}}</strong>,</div>
<div class="message"><p>Please find below the details of your invoice. We kindly request prompt payment by the due date.</p></div>
<div class="detail-box">
  <h3>📄 Invoice Details</h3>
  <div class="detail-row"><span class="detail-label">Invoice Number:</span><span class="detail-value">{{invoiceNumber}}</span></div>
  <div class="detail-row"><span class="detail-label">Invoice Date:</span><span class="detail-value">{{invoiceDate}}</span></div>
  <div class="detail-row"><span class="detail-label">Due Date:</span><span class="detail-value">{{dueDate}}</span></div>
  <div class="detail-row"><span class="detail-label">Amount Due:</span><span class="detail-value amount-total">KES {{amount}}</span></div>
</div>
<center><a href="{{invoiceUrl}}" class="cta-button">View Invoice</a></center>
<div class="message"><p>If you have any questions, please don&rsquo;t hesitate to contact us.</p></div>`);
}

// ── Template: Payment Receipt ───────────────────────────────────────────
export function paymentReceiptTemplate(): string {
  return layout('Invoice &amp; Receipt', `
<div class="greeting">Dear <strong>{{clientName}}</strong>,</div>
<div class="message">
  <p>Thank you for your business! We are pleased to confirm that we have received your payment.</p>
  <p>Please find below your invoice and official receipt details.</p>
</div>
<div class="detail-box">
  <h3>📄 Transaction Summary</h3>
  <div class="detail-row"><span class="detail-label">Invoice Number:</span><span class="detail-value">{{invoiceNumber}}</span></div>
  <div class="detail-row"><span class="detail-label">Receipt Number:</span><span class="detail-value">{{receiptNumber}}</span></div>
  <div class="detail-row"><span class="detail-label">Invoice Date:</span><span class="detail-value">{{invoiceDate}}</span></div>
  <div class="detail-row"><span class="detail-label">Payment Date:</span><span class="detail-value">{{paymentDate}}</span></div>
  <div class="detail-row"><span class="detail-label">Payment Method:</span><span class="detail-value">{{paymentMethod}}</span></div>
  <div class="detail-row"><span class="detail-label">Amount Paid:</span><span class="detail-value amount-total">KES {{amount}}</span></div>
</div>
<center><a href="{{portalUrl}}" class="cta-button">View in Client Portal</a></center>
<div class="info-box">
  <h3>💳 Payment Information (For Future Reference)</h3>
  <p style="margin:5px 0;"><strong>Bank:</strong> Equity Bank Kenya</p>
  <p style="margin:5px 0;"><strong>Account Name:</strong> Kiini</p>
  <p style="margin:5px 0;"><strong>M-Pesa Paybill:</strong> 123456 / Account: KIINI</p>
</div>`);
}

// ── Template: Estimate / Quotation Sent ─────────────────────────────────
export function estimateSentTemplate(): string {
  return layout('Estimate', `
<div class="greeting">Dear <strong>{{clientName}}</strong>,</div>
<div class="message"><p>We have prepared an estimate for the requested services. Please review the details below.</p></div>
<div class="detail-box">
  <h3>📋 Estimate Details</h3>
  <div class="detail-row"><span class="detail-label">Estimate Number:</span><span class="detail-value">{{estimateNumber}}</span></div>
  <div class="detail-row"><span class="detail-label">Date:</span><span class="detail-value">{{estimateDate}}</span></div>
  <div class="detail-row"><span class="detail-label">Valid Until:</span><span class="detail-value">{{validUntil}}</span></div>
  <div class="detail-row"><span class="detail-label">Estimated Total:</span><span class="detail-value amount-total">KES {{amount}}</span></div>
</div>
<center><a href="{{estimateUrl}}" class="cta-button">View Estimate</a></center>
<div class="message"><p>This estimate is valid until <strong>{{validUntil}}</strong>. Please contact us if you have any questions or wish to proceed.</p></div>`);
}

// ── Template: Proposal Sent ─────────────────────────────────────────────
export function proposalSentTemplate(): string {
  return layout('Proposal', `
<div class="greeting">Dear <strong>{{clientName}}</strong>,</div>
<div class="message"><p>Please find below our proposal for the discussed project. We look forward to working with you.</p></div>
<div class="detail-box">
  <h3>📑 Proposal Summary</h3>
  <div class="detail-row"><span class="detail-label">Proposal Reference:</span><span class="detail-value">{{proposalNumber}}</span></div>
  <div class="detail-row"><span class="detail-label">Date:</span><span class="detail-value">{{proposalDate}}</span></div>
  <div class="detail-row"><span class="detail-label">Project:</span><span class="detail-value">{{projectName}}</span></div>
  <div class="detail-row"><span class="detail-label">Proposed Budget:</span><span class="detail-value amount-total">KES {{amount}}</span></div>
</div>
<center><a href="{{proposalUrl}}" class="cta-button">View Proposal</a></center>`);
}

// ── Template: LPO / Purchase Order Sent ─────────────────────────────────
export function lpoSentTemplate(): string {
  return layout('Local Purchase Order', `
<div class="greeting">Dear <strong>{{supplierName}}</strong>,</div>
<div class="message"><p>Please find below the purchase order for the requested goods/services.</p></div>
<div class="detail-box">
  <h3>🛒 Purchase Order Details</h3>
  <div class="detail-row"><span class="detail-label">LPO Number:</span><span class="detail-value">{{lpoNumber}}</span></div>
  <div class="detail-row"><span class="detail-label">Date:</span><span class="detail-value">{{lpoDate}}</span></div>
  <div class="detail-row"><span class="detail-label">Delivery Date:</span><span class="detail-value">{{deliveryDate}}</span></div>
  <div class="detail-row"><span class="detail-label">Total Amount:</span><span class="detail-value amount-total">KES {{amount}}</span></div>
</div>
<center><a href="{{lpoUrl}}" class="cta-button">View Purchase Order</a></center>
<div class="message"><p>Please confirm receipt and expected delivery date at your earliest convenience.</p></div>`);
}

// ── Template: Expense Approved ──────────────────────────────────────────
export function expenseApprovedTemplate(): string {
  return layout('Expense Approved', `
<div class="greeting">Hi <strong>{{userName}}</strong>,</div>
<div class="message"><p>Your expense claim has been approved.</p></div>
<div class="detail-box">
  <h3>✅ Expense Details</h3>
  <div class="detail-row"><span class="detail-label">Expense No:</span><span class="detail-value">{{expenseNumber}}</span></div>
  <div class="detail-row"><span class="detail-label">Category:</span><span class="detail-value">{{category}}</span></div>
  <div class="detail-row"><span class="detail-label">Amount:</span><span class="detail-value amount-total">KES {{amount}}</span></div>
  <div class="detail-row"><span class="detail-label">Approved By:</span><span class="detail-value">{{approvedBy}}</span></div>
</div>
<div class="message"><p>The reimbursement will be processed in your next pay cycle.</p></div>`);
}

// ── Template: Leave Approved ────────────────────────────────────────────
export function leaveApprovedTemplate(): string {
  return layout('Leave Request Approved', `
<div class="greeting">Hi <strong>{{userName}}</strong>,</div>
<div class="message"><p>Your leave request has been approved.</p></div>
<div class="detail-box">
  <h3>🏖️ Leave Details</h3>
  <div class="detail-row"><span class="detail-label">Leave Type:</span><span class="detail-value">{{leaveType}}</span></div>
  <div class="detail-row"><span class="detail-label">Start Date:</span><span class="detail-value">{{startDate}}</span></div>
  <div class="detail-row"><span class="detail-label">End Date:</span><span class="detail-value">{{endDate}}</span></div>
  <div class="detail-row"><span class="detail-label">Days:</span><span class="detail-value">{{days}}</span></div>
  <div class="detail-row"><span class="detail-label">Approved By:</span><span class="detail-value">{{approvedBy}}</span></div>
</div>`);
}

// ── Template: Project Update ────────────────────────────────────────────
export function projectUpdateTemplate(): string {
  return layout('Project Update', `
<div class="greeting">Dear <strong>{{clientName}}</strong>,</div>
<div class="message"><p>Here is an update on your project.</p></div>
<div class="detail-box">
  <h3>📊 Project Status</h3>
  <div class="detail-row"><span class="detail-label">Project:</span><span class="detail-value">{{projectName}}</span></div>
  <div class="detail-row"><span class="detail-label">Status:</span><span class="detail-value">{{status}}</span></div>
  <div class="detail-row"><span class="detail-label">Progress:</span><span class="detail-value">{{progress}}%</span></div>
  <div class="detail-row"><span class="detail-label">Next Milestone:</span><span class="detail-value">{{nextMilestone}}</span></div>
</div>
<center><a href="{{projectUrl}}" class="cta-button">View Project</a></center>`);
}

// ── Template: Support Ticket Created ────────────────────────────────────
export function ticketCreatedTemplate(): string {
  return layout('Support Ticket Received', `
<div class="greeting">Dear <strong>{{clientName}}</strong>,</div>
<div class="message"><p>We have received your support ticket and our team will review it shortly.</p></div>
<div class="detail-box">
  <h3>🎫 Ticket Details</h3>
  <div class="detail-row"><span class="detail-label">Ticket ID:</span><span class="detail-value">{{ticketNumber}}</span></div>
  <div class="detail-row"><span class="detail-label">Subject:</span><span class="detail-value">{{ticketSubject}}</span></div>
  <div class="detail-row"><span class="detail-label">Priority:</span><span class="detail-value">{{priority}}</span></div>
  <div class="detail-row"><span class="detail-label">Created:</span><span class="detail-value">{{createdDate}}</span></div>
</div>
<center><a href="{{ticketUrl}}" class="cta-button">View Ticket</a></center>
<div class="message"><p>We aim to respond within 24 hours. You will be notified once there is an update on your ticket.</p></div>`);
}

// ── Template: Ticket Resolved ───────────────────────────────────────────
export function ticketResolvedTemplate(): string {
  return layout('Ticket Resolved', `
<div class="greeting">Dear <strong>{{clientName}}</strong>,</div>
<div class="message"><p>Good news! Your support ticket has been resolved.</p></div>
<div class="detail-box">
  <h3>✅ Resolution Summary</h3>
  <div class="detail-row"><span class="detail-label">Ticket ID:</span><span class="detail-value">{{ticketNumber}}</span></div>
  <div class="detail-row"><span class="detail-label">Subject:</span><span class="detail-value">{{ticketSubject}}</span></div>
  <div class="detail-row"><span class="detail-label">Resolution:</span><span class="detail-value">{{resolution}}</span></div>
</div>
<div class="message"><p>If you have further queries, feel free to reopen the ticket or raise a new one.</p></div>`);
}

// ── Template: Payment Reminder ──────────────────────────────────────────
export function paymentReminderTemplate(): string {
  return layout('Payment Reminder', `
<div class="greeting">Dear <strong>{{clientName}}</strong>,</div>
<div class="message"><p>This is a friendly reminder that the following invoice is due for payment.</p></div>
<div class="warning-box">
  <h3>⏰ Overdue Invoice</h3>
  <div class="detail-row"><span class="detail-label">Invoice Number:</span><span class="detail-value">{{invoiceNumber}}</span></div>
  <div class="detail-row"><span class="detail-label">Due Date:</span><span class="detail-value">{{dueDate}}</span></div>
  <div class="detail-row"><span class="detail-label">Days Overdue:</span><span class="detail-value" style="color:red;">{{daysOverdue}} days</span></div>
  <div class="detail-row"><span class="detail-label">Amount Due:</span><span class="detail-value amount-total">KES {{amount}}</span></div>
</div>
<center><a href="{{invoiceUrl}}" class="cta-button">Pay Now</a></center>
<div class="message"><p>If you have already made payment, please disregard this message.</p></div>`);
}

// ── Template: Welcome Email ─────────────────────────────────────────────
export function welcomeTemplate(): string {
  return layout('Welcome to Kiini', `
<div class="greeting">Hi <strong>{{userName}}</strong>,</div>
<div class="message">
  <p>Welcome aboard! Your account has been created successfully on the Kiini platform.</p>
  <p>Here are your login details:</p>
</div>
<div class="detail-box">
  <h3>🔑 Account Details</h3>
  <div class="detail-row"><span class="detail-label">Email:</span><span class="detail-value">{{userEmail}}</span></div>
  <div class="detail-row"><span class="detail-label">Role:</span><span class="detail-value">{{role}}</span></div>
</div>
<center><a href="{{loginUrl}}" class="cta-button">Login to Your Account</a></center>
<div class="message"><p>If you did not request this account, please contact us immediately.</p></div>`);
}

// ── Template: Password Reset ────────────────────────────────────────────
export function passwordResetTemplate(): string {
  return layout('Password Reset', `
<div class="greeting">Hi <strong>{{userName}}</strong>,</div>
<div class="message"><p>We received a request to reset your password. Click the button below to set a new password.</p></div>
<center><a href="{{resetLink}}" class="cta-button">Reset Password</a></center>
<div class="info-box">
  <h3>🔒 Security Notice</h3>
  <p>This link will expire in <strong>1 hour</strong>. If you did not request a password reset, please ignore this email — your account is safe.</p>
  <p style="font-size:12px;color:#666;word-break:break-all;">If the button doesn&rsquo;t work, copy and paste this link: {{resetLink}}</p>
</div>`);
}

// ── Template: Credit Note Sent ──────────────────────────────────────────
export function creditNoteSentTemplate(): string {
  return layout('Credit Note', `
<div class="greeting">Dear <strong>{{clientName}}</strong>,</div>
<div class="message"><p>A credit note has been issued to your account. Details below.</p></div>
<div class="detail-box">
  <h3>📋 Credit Note Details</h3>
  <div class="detail-row"><span class="detail-label">Credit Note No:</span><span class="detail-value">{{creditNoteNumber}}</span></div>
  <div class="detail-row"><span class="detail-label">Reference Invoice:</span><span class="detail-value">{{invoiceNumber}}</span></div>
  <div class="detail-row"><span class="detail-label">Date:</span><span class="detail-value">{{creditNoteDate}}</span></div>
  <div class="detail-row"><span class="detail-label">Credit Amount:</span><span class="detail-value amount-total">KES {{amount}}</span></div>
</div>
<div class="message"><p>This credit has been applied to your account balance.</p></div>`);
}

// ── Template: Payroll / Payslip ─────────────────────────────────────────
export function payslipTemplate(): string {
  return layout('Payslip', `
<div class="greeting">Hi <strong>{{employeeName}}</strong>,</div>
<div class="message"><p>Your payslip for <strong>{{payPeriod}}</strong> is ready.</p></div>
<div class="detail-box">
  <h3>💰 Pay Summary</h3>
  <div class="detail-row"><span class="detail-label">Pay Period:</span><span class="detail-value">{{payPeriod}}</span></div>
  <div class="detail-row"><span class="detail-label">Gross Pay:</span><span class="detail-value">KES {{grossPay}}</span></div>
  <div class="detail-row"><span class="detail-label">Deductions:</span><span class="detail-value">KES {{deductions}}</span></div>
  <div class="detail-row"><span class="detail-label">Net Pay:</span><span class="detail-value amount-total">KES {{netPay}}</span></div>
</div>
<center><a href="{{payslipUrl}}" class="cta-button">View Full Payslip</a></center>`);
}

// ── Template: General Notification ──────────────────────────────────────
export function generalNotificationTemplate(): string {
  return layout('Notification', `
<div class="greeting">Hi <strong>{{recipientName}}</strong>,</div>
<div class="message">{{messageBody}}</div>`);
}

// ── Map of all available templates by key ───────────────────────────────
export const EMAIL_TEMPLATES: Record<string, () => string> = {
  'invoice-sent': invoiceSentTemplate,
  'payment-receipt': paymentReceiptTemplate,
  'estimate-sent': estimateSentTemplate,
  'proposal-sent': proposalSentTemplate,
  'lpo-sent': lpoSentTemplate,
  'expense-approved': expenseApprovedTemplate,
  'leave-approved': leaveApprovedTemplate,
  'project-update': projectUpdateTemplate,
  'ticket-created': ticketCreatedTemplate,
  'ticket-resolved': ticketResolvedTemplate,
  'payment-reminder': paymentReminderTemplate,
  'welcome': welcomeTemplate,
  'password-reset': passwordResetTemplate,
  'credit-note': creditNoteSentTemplate,
  'payslip': payslipTemplate,
  'general': generalNotificationTemplate,
};

/**
 * Get a rendered email template by key with variable substitution.
 */
export function getEmailTemplate(key: string, vars: Record<string, string>): string {
  const factory = EMAIL_TEMPLATES[key];
  if (!factory) {
    // Fallback to general template
    return renderTemplate(generalNotificationTemplate(), vars);
  }
  return renderTemplate(factory(), vars);
}
