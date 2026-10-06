/**
 * Email Notification Templates
 * Used for all billing, compliance, and system notifications
 */

export interface EmailTemplate {
  subject: string;
  htmlTemplate: string;
}

export const emailTemplates: Record<string, EmailTemplate> = {
  'payment-received': {
    subject: 'Payment Received - Invoice Receipt',
    htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
    .header { background: #2ecc71; color: white; padding: 20px; text-align: center; border-radius: 4px; }
    .content { background: white; padding: 20px; margin-top: 20px; border-radius: 4px; }
    .details { background: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #2ecc71; }
    .footer { text-align: center; font-size: 12px; color: #999; margin-top: 20px; }
    .amount { font-size: 24px; font-weight: bold; color: #2ecc71; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Payment Received</h1>
    </div>
    <div class="content">
      <p>Dear {{organizationName}},</p>
      <p>Thank you for your payment! We've received your payment for Invoice {{invoiceId}}.</p>
      
      <div class="details">
        <p><strong>Invoice ID:</strong> {{invoiceId}}</p>
        <p><strong>Amount:</strong> <span class="amount">{{currency}} {{amount}}</span></p>
        <p><strong>Date:</strong> {{date}}</p>
      </div>
      
      <p>Your subscription has been renewed successfully. You'll continue to have access to all premium features.</p>
      <p>If you have any questions, please contact our support team.</p>
      
      <p>Best regards,<br>Kiini Team</p>
    </div>
    <div class="footer">
      <p>&copy; 2026 Kiini. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
  },

  'payment-received-mpesa': {
    subject: 'Payment Received - M-Pesa Receipt',
    htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
    .header { background: #2ecc71; color: white; padding: 20px; text-align: center; }
    .content { background: white; padding: 20px; margin-top: 20px; }
    .reference { background: #f0f0f0; padding: 15px; margin: 20px 0; font-family: monospace; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>M-Pesa Payment Received</h1></div>
    <div class="content">
      <p>Your M-Pesa payment has been received and verified.</p>
      <div class="reference">
        <p><strong>Invoice:</strong> {{invoiceId}}</p>
        <p><strong>Amount:</strong> {{currency}} {{amount}}</p>
        <p><strong>Transaction ID:</strong> {{transactionId}}</p>
        <p><strong>Phone:</strong> {{msisdn}}</p>
        <p><strong>Date:</strong> {{date}}</p>
      </div>
      <p>Your subscription has been renewed. Thank you for your business!</p>
    </div>
  </div>
</body>
</html>
    `,
  },

  'payment-received-bank': {
    subject: 'Bank Transfer Payment Received',
    htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3498db; color: white; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Bank Transfer Verified</h1></div>
    <div class="content">
      <p>Your bank transfer payment has been matched and confirmed.</p>
      <p><strong>Invoice:</strong> {{invoiceId}}</p>
      <p><strong>Amount:</strong> {{currency}} {{amount}}</p>
      <p><strong>Bank:</strong> {{bankName}}</p>
      <p><strong>Reference:</strong> {{referenceNumber}}</p>
      <p><strong>Date:</strong> {{date}}</p>
      <p>Your subscription has been renewed successfully.</p>
    </div>
  </div>
</body>
</html>
    `,
  },

  'payment-failed': {
    subject: 'Payment Failed - Action Required',
    htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .alert { background: #e74c3c; color: white; padding: 20px; }
    .content { background: white; padding: 20px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="alert"><h1>⚠ Payment Failed</h1></div>
    <div class="content">
      <p>Your payment for Invoice {{invoiceId}} could not be processed.</p>
      <p><strong>Amount:</strong> {{currency}} {{amount}}</p>
      <p><strong>Reason:</strong> {{reason}}</p>
      <p>Please try updating your payment method or contact support.</p>
      <p><strong>Invoice ID:</strong> {{invoiceId}}</p>
    </div>
  </div>
</body>
</html>
    `,
  },

  'trial-converted-to-paid': {
    subject: 'Trial Period Ended - Subscription Activated',
    htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #9b59b6; color: white; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Trial Period Completed</h1></div>
    <div class="content">
      <p>Your {{tier}} trial has ended. Your subscription has been automatically converted to a paid plan.</p>
      <p><strong>Invoice:</strong> {{invoiceId}}</p>
      <p><strong>Amount Due:</strong> {{currency}} {{amount}}</p>
      <p><strong>Due Date:</strong> {{dueDate}}</p>
      <p>You can now access all {{tier}} features. Payment can be made via card, M-Pesa, or bank transfer.</p>
    </div>
  </div>
</body>
</html>
    `,
  },

  'renewal-invoice-generated': {
    subject: 'Renewal Invoice Generated',
    htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .info { background: #ecf0f1; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="info">
      <h1>Renewal Invoice</h1>
      <p><strong>Invoice ID:</strong> {{invoiceId}}</p>
      <p><strong>Amount:</strong> {{currency}} {{amount}}</p>
      <p><strong>Due Date:</strong> {{dueDate}}</p>
      <p>Your subscription is set to renew on this date. Please ensure your payment method is up to date.</p>
    </div>
  </div>
</body>
</html>
    `,
  },

  'payment-reminder-7days': {
    subject: 'Payment Due in 7 Days - Invoice {{invoiceNumber}}',
    htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .reminder { background: #f39c12; color: white; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="reminder">
      <h1>Payment Reminder</h1>
      <p>Payment is due in {{daysRemaining}} days</p>
    </div>
    <div class="content" style="background: white; padding: 20px; margin-top: 20px;">
      <p>Your payment is due on <strong>{{dueDate}}</strong></p>
      <p><strong>Invoice:</strong> {{invoiceNumber}}</p>
      <p><strong>Amount:</strong> {{amount}}</p>
      <p>Please process your payment to avoid service interruption.</p>
    </div>
  </div>
</body>
</html>
    `,
  },

  'payment-reminder-1day': {
    subject: 'URGENT: Payment Due Tomorrow - {{invoiceNumber}}',
    htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: white; }
    .urgent { background: #e74c3c; max-width: 600px; margin: 0 auto; padding: 20px; }
    .content { background: white; color: #333; padding: 20px; }
  </style>
</head>
<body>
  <div class="urgent">
    <h1>⚠ URGENT: Payment Due Tomorrow</h1>
    <p>Please process payment immediately to avoid service suspension.</p>
  </div>
  <div class="container">
    <div class="content">
      <p><strong>Invoice:</strong> {{invoiceNumber}}</p>
      <p><strong>Amount:</strong> {{amount}}</p>
      <p><strong>Due Date:</strong> {{dueDate}}</p>
      <p>Action required now to prevent disruption of service.</p>
    </div>
  </div>
</body>
</html>
    `,
  },

  'payment-overdue-locked': {
    subject: 'URGENT: Account Suspended - Payment Required',
    htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .alert { background: #c0392b; color: white; padding: 30px; text-align: center; }
  </style>
</head>
<body>
  <div class="alert">
    <h1>🔒 Account Suspended</h1>
    <p>Your account has been suspended due to overdue payment</p>
    <h2>{{daysOverdue}} Days Overdue</h2>
  </div>
  <div class="container" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <p><strong>Invoice:</strong> {{invoiceNumber}}</p>
    <p><strong>Amount Due:</strong> {{amount}}</p>
    <p>Service access has been restricted. Please contact support to restore your account.</p>
  </div>
</body>
</html>
    `,
  },

  'refund-processed': {
    subject: 'Refund Processed',
    htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .success { background: #27ae60; color: white; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="success">
      <h1>✓ Refund Processed</h1>
    </div>
    <div style="background: white; padding: 20px; margin-top: 20px;">
      <p><strong>Invoice:</strong> {{invoiceId}}</p>
      <p><strong>Refund Amount:</strong> {{currency}} {{amount}}</p>
      <p>The refund has been processed and will appear in your account within 3-5 business days.</p>
    </div>
  </div>
</body>
</html>
    `,
  },

  'bank-transfer-reminder': {
    subject: 'Bank Transfer Payment Instructions',
    htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .bank-details { background: #ecf0f1; padding: 20px; font-family: monospace; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Bank Transfer Payment</h1>
    <p>Please transfer {{currency}} {{amount}} to the account below:</p>
    
    <div class="bank-details">
      <p><strong>Bank Name:</strong> {{bankDetails.bankName}}</p>
      <p><strong>Account Name:</strong> {{bankDetails.accountName}}</p>
      <p><strong>Account Number:</strong> {{bankDetails.accountNumber}}</p>
      <p><strong>SWIFT Code:</strong> {{bankDetails.swiftCode}}</p>
      <p><strong>Reference:</strong> {{invoiceId}}</p>
    </div>
    
    <p>Invoice Due: {{dueDate}}</p>
    <p>Include the invoice ID in the transfer reference for faster processing.</p>
  </div>
</body>
</html>
    `,
  },

  'user-invited': {
    subject: 'You are invited to join {{organizationName}} on Kiini',
    htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .cta { background: #2ecc71; color: white; padding: 15px 20px; text-align: center; border-radius: 4px; display: inline-block; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>You're Invited!</h1>
    <p>{{inviterName}} has invited you to join <strong>{{organizationName}}</strong> on Kiini.</p>
    <p>You will have access to the {{role}} role with the following permissions:</p>
    <ul>
      {{#permissions}}
        <li>{{this}}</li>
      {{/permissions}}
    </ul>
    <div class="cta">
      <a href="{{inviteLink}}" style="color: white; text-decoration: none; font-weight: bold;">Accept Invitation</a>
    </div>
    <p>This invitation expires in 7 days.</p>
  </div>
</body>
</html>
    `,
  },

  'audit-log-export': {
    subject: 'Audit Log Export - {{organizationName}}',
    htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Audit Log Export</h1>
    <p>Your requested audit log export is ready for download.</p>
    <p><strong>Organization:</strong> {{organizationName}}</p>
    <p><strong>Date Range:</strong> {{startDate}} to {{endDate}}</p>
    <p><strong>Records:</strong> {{totalRecords}}</p>
    <p>The export file has been attached in {{format}} format.</p>
  </div>
</body>
</html>
    `,
  },

  'policy-updated': {
    subject: 'Organization Policies Updated',
    htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .changes { background: #ecf0f1; padding: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Organization Policies Updated</h1>
    <p>The following policies have been updated for {{organizationName}}:</p>
    <div class="changes">
      {{#changes}}
        <p><strong>{{field}}:</strong> {{oldValue}} → {{newValue}}</p>
      {{/changes}}
    </div>
    <p>These changes will take effect immediately.</p>
  </div>
</body>
</html>
    `,
  },
};

/**
 * Render email template with context
 */
export function renderEmailTemplate(template: string, context: Record<string, any>): string {
  let html = emailTemplates[template]?.htmlTemplate || '';

  // Simple variable replacement
  Object.entries(context).forEach(([key, value]) => {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), String(value || ''));
  });

  // Handle conditionals (simple version)
  html = html.replace(/{{#\w+}}[\s\S]*?{{\/\w+}}/g, '');

  return html;
}

/**
 * Get subject line for template
 */
export function getEmailSubject(template: string, context: Record<string, any>): string {
  let subject = emailTemplates[template]?.subject || '';

  Object.entries(context).forEach(([key, value]) => {
    subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), String(value || ''));
  });

  return subject;
}
