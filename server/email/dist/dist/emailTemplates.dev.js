"use strict";
/**
 * Email Notification Templates
 * Used for all billing, compliance, and system notifications
 */

exports.__esModule = true;
exports.getEmailSubject = exports.renderEmailTemplate = exports.emailTemplates = void 0;
exports.emailTemplates = {
  'payment-received': {
    subject: 'Payment Received - Invoice Receipt',
    htmlTemplate: "\n<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }\n    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }\n    .header { background: #2ecc71; color: white; padding: 20px; text-align: center; border-radius: 4px; }\n    .content { background: white; padding: 20px; margin-top: 20px; border-radius: 4px; }\n    .details { background: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #2ecc71; }\n    .footer { text-align: center; font-size: 12px; color: #999; margin-top: 20px; }\n    .amount { font-size: 24px; font-weight: bold; color: #2ecc71; }\n  </style>\n</head>\n<body>\n  <div class=\"container\">\n    <div class=\"header\">\n      <h1>\u2713 Payment Received</h1>\n    </div>\n    <div class=\"content\">\n      <p>Dear {{organizationName}},</p>\n      <p>Thank you for your payment! We've received your payment for Invoice {{invoiceId}}.</p>\n      \n      <div class=\"details\">\n        <p><strong>Invoice ID:</strong> {{invoiceId}}</p>\n        <p><strong>Amount:</strong> <span class=\"amount\">{{currency}} {{amount}}</span></p>\n        <p><strong>Date:</strong> {{date}}</p>\n      </div>\n      \n      <p>Your subscription has been renewed successfully. You'll continue to have access to all premium features.</p>\n      <p>If you have any questions, please contact our support team.</p>\n      \n      <p>Best regards,<br>CRM Team</p>\n    </div>\n    <div class=\"footer\">\n      <p>&copy; 2026 All rights reserved.</p>\n    </div>\n  </div>\n</body>\n</html>\n    "
  },
  'payment-received-mpesa': {
    subject: 'Payment Received - M-Pesa Receipt',
    htmlTemplate: "\n<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { font-family: Arial, sans-serif; color: #333; }\n    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }\n    .header { background: #2ecc71; color: white; padding: 20px; text-align: center; }\n    .content { background: white; padding: 20px; margin-top: 20px; }\n    .reference { background: #f0f0f0; padding: 15px; margin: 20px 0; font-family: monospace; }\n  </style>\n</head>\n<body>\n  <div class=\"container\">\n    <div class=\"header\"><h1>M-Pesa Payment Received</h1></div>\n    <div class=\"content\">\n      <p>Your M-Pesa payment has been received and verified.</p>\n      <div class=\"reference\">\n        <p><strong>Invoice:</strong> {{invoiceId}}</p>\n        <p><strong>Amount:</strong> {{currency}} {{amount}}</p>\n        <p><strong>Transaction ID:</strong> {{transactionId}}</p>\n        <p><strong>Phone:</strong> {{msisdn}}</p>\n        <p><strong>Date:</strong> {{date}}</p>\n      </div>\n      <p>Your subscription has been renewed. Thank you for your business!</p>\n    </div>\n  </div>\n</body>\n</html>\n    "
  },
  'payment-received-bank': {
    subject: 'Bank Transfer Payment Received',
    htmlTemplate: "\n<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { font-family: Arial, sans-serif; color: #333; }\n    .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n    .header { background: #3498db; color: white; padding: 20px; }\n  </style>\n</head>\n<body>\n  <div class=\"container\">\n    <div class=\"header\"><h1>Bank Transfer Verified</h1></div>\n    <div class=\"content\">\n      <p>Your bank transfer payment has been matched and confirmed.</p>\n      <p><strong>Invoice:</strong> {{invoiceId}}</p>\n      <p><strong>Amount:</strong> {{currency}} {{amount}}</p>\n      <p><strong>Bank:</strong> {{bankName}}</p>\n      <p><strong>Reference:</strong> {{referenceNumber}}</p>\n      <p><strong>Date:</strong> {{date}}</p>\n      <p>Your subscription has been renewed successfully.</p>\n    </div>\n  </div>\n</body>\n</html>\n    "
  },
  'payment-failed': {
    subject: 'Payment Failed - Action Required',
    htmlTemplate: "\n<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { font-family: Arial, sans-serif; color: #333; }\n    .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n    .alert { background: #e74c3c; color: white; padding: 20px; }\n    .content { background: white; padding: 20px; margin-top: 20px; }\n  </style>\n</head>\n<body>\n  <div class=\"container\">\n    <div class=\"alert\"><h1>\u26A0 Payment Failed</h1></div>\n    <div class=\"content\">\n      <p>Your payment for Invoice {{invoiceId}} could not be processed.</p>\n      <p><strong>Amount:</strong> {{currency}} {{amount}}</p>\n      <p><strong>Reason:</strong> {{reason}}</p>\n      <p>Please try updating your payment method or contact support.</p>\n      <p><strong>Invoice ID:</strong> {{invoiceId}}</p>\n    </div>\n  </div>\n</body>\n</html>\n    "
  },
  'trial-converted-to-paid': {
    subject: 'Trial Period Ended - Subscription Activated',
    htmlTemplate: "\n<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { font-family: Arial, sans-serif; color: #333; }\n    .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n    .header { background: #9b59b6; color: white; padding: 20px; }\n  </style>\n</head>\n<body>\n  <div class=\"container\">\n    <div class=\"header\"><h1>Trial Period Completed</h1></div>\n    <div class=\"content\">\n      <p>Your {{tier}} trial has ended. Your subscription has been automatically converted to a paid plan.</p>\n      <p><strong>Invoice:</strong> {{invoiceId}}</p>\n      <p><strong>Amount Due:</strong> {{currency}} {{amount}}</p>\n      <p><strong>Due Date:</strong> {{dueDate}}</p>\n      <p>You can now access all {{tier}} features. Payment can be made via card, M-Pesa, or bank transfer.</p>\n    </div>\n  </div>\n</body>\n</html>\n    "
  },
  'renewal-invoice-generated': {
    subject: 'Renewal Invoice Generated',
    htmlTemplate: "\n<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { font-family: Arial, sans-serif; color: #333; }\n    .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n    .info { background: #ecf0f1; padding: 20px; }\n  </style>\n</head>\n<body>\n  <div class=\"container\">\n    <div class=\"info\">\n      <h1>Renewal Invoice</h1>\n      <p><strong>Invoice ID:</strong> {{invoiceId}}</p>\n      <p><strong>Amount:</strong> {{currency}} {{amount}}</p>\n      <p><strong>Due Date:</strong> {{dueDate}}</p>\n      <p>Your subscription is set to renew on this date. Please ensure your payment method is up to date.</p>\n    </div>\n  </div>\n</body>\n</html>\n    "
  },
  'payment-reminder-7days': {
    subject: 'Payment Due in 7 Days - Invoice {{invoiceNumber}}',
    htmlTemplate: "\n<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { font-family: Arial, sans-serif; color: #333; }\n    .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n    .reminder { background: #f39c12; color: white; padding: 20px; }\n  </style>\n</head>\n<body>\n  <div class=\"container\">\n    <div class=\"reminder\">\n      <h1>Payment Reminder</h1>\n      <p>Payment is due in {{daysRemaining}} days</p>\n    </div>\n    <div class=\"content\" style=\"background: white; padding: 20px; margin-top: 20px;\">\n      <p>Your payment is due on <strong>{{dueDate}}</strong></p>\n      <p><strong>Invoice:</strong> {{invoiceNumber}}</p>\n      <p><strong>Amount:</strong> {{amount}}</p>\n      <p>Please process your payment to avoid service interruption.</p>\n    </div>\n  </div>\n</body>\n</html>\n    "
  },
  'payment-reminder-1day': {
    subject: 'URGENT: Payment Due Tomorrow - {{invoiceNumber}}',
    htmlTemplate: "\n<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { font-family: Arial, sans-serif; color: white; }\n    .urgent { background: #e74c3c; max-width: 600px; margin: 0 auto; padding: 20px; }\n    .content { background: white; color: #333; padding: 20px; }\n  </style>\n</head>\n<body>\n  <div class=\"urgent\">\n    <h1>\u26A0 URGENT: Payment Due Tomorrow</h1>\n    <p>Please process payment immediately to avoid service suspension.</p>\n  </div>\n  <div class=\"container\">\n    <div class=\"content\">\n      <p><strong>Invoice:</strong> {{invoiceNumber}}</p>\n      <p><strong>Amount:</strong> {{amount}}</p>\n      <p><strong>Due Date:</strong> {{dueDate}}</p>\n      <p>Action required now to prevent disruption of service.</p>\n    </div>\n  </div>\n</body>\n</html>\n    "
  },
  'payment-overdue-locked': {
    subject: 'URGENT: Account Suspended - Payment Required',
    htmlTemplate: "\n<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { font-family: Arial, sans-serif; }\n    .alert { background: #c0392b; color: white; padding: 30px; text-align: center; }\n  </style>\n</head>\n<body>\n  <div class=\"alert\">\n    <h1>\uD83D\uDD12 Account Suspended</h1>\n    <p>Your account has been suspended due to overdue payment</p>\n    <h2>{{daysOverdue}} Days Overdue</h2>\n  </div>\n  <div class=\"container\" style=\"max-width: 600px; margin: 0 auto; padding: 20px;\">\n    <p><strong>Invoice:</strong> {{invoiceNumber}}</p>\n    <p><strong>Amount Due:</strong> {{amount}}</p>\n    <p>Service access has been restricted. Please contact support to restore your account.</p>\n  </div>\n</body>\n</html>\n    "
  },
  'refund-processed': {
    subject: 'Refund Processed',
    htmlTemplate: "\n<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { font-family: Arial, sans-serif; color: #333; }\n    .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n    .success { background: #27ae60; color: white; padding: 20px; }\n  </style>\n</head>\n<body>\n  <div class=\"container\">\n    <div class=\"success\">\n      <h1>\u2713 Refund Processed</h1>\n    </div>\n    <div style=\"background: white; padding: 20px; margin-top: 20px;\">\n      <p><strong>Invoice:</strong> {{invoiceId}}</p>\n      <p><strong>Refund Amount:</strong> {{currency}} {{amount}}</p>\n      <p>The refund has been processed and will appear in your account within 3-5 business days.</p>\n    </div>\n  </div>\n</body>\n</html>\n    "
  },
  'bank-transfer-reminder': {
    subject: 'Bank Transfer Payment Instructions',
    htmlTemplate: "\n<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { font-family: Arial, sans-serif; color: #333; }\n    .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n    .bank-details { background: #ecf0f1; padding: 20px; font-family: monospace; }\n  </style>\n</head>\n<body>\n  <div class=\"container\">\n    <h1>Bank Transfer Payment</h1>\n    <p>Please transfer {{currency}} {{amount}} to the account below:</p>\n    \n    <div class=\"bank-details\">\n      <p><strong>Bank Name:</strong> {{bankDetails.bankName}}</p>\n      <p><strong>Account Name:</strong> {{bankDetails.accountName}}</p>\n      <p><strong>Account Number:</strong> {{bankDetails.accountNumber}}</p>\n      <p><strong>SWIFT Code:</strong> {{bankDetails.swiftCode}}</p>\n      <p><strong>Reference:</strong> {{invoiceId}}</p>\n    </div>\n    \n    <p>Invoice Due: {{dueDate}}</p>\n    <p>Include the invoice ID in the transfer reference for faster processing.</p>\n  </div>\n</body>\n</html>\n    "
  },
  'user-invited': {
    subject: 'You are invited to join {{organizationName}} on Kiini CRM',
    htmlTemplate: "\n<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { font-family: Arial, sans-serif; color: #333; }\n    .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n    .cta { background: #2ecc71; color: white; padding: 15px 20px; text-align: center; border-radius: 4px; display: inline-block; margin: 20px 0; }\n  </style>\n</head>\n<body>\n  <div class=\"container\">\n    <h1>You're Invited!</h1>\n    <p>{{inviterName}} has invited you to join <strong>{{organizationName}}</strong> on Kiini CRM.</p>\n    <p>You will have access to the {{role}} role with the following permissions:</p>\n    <ul>\n      {{#permissions}}\n        <li>{{this}}</li>\n      {{/permissions}}\n    </ul>\n    <div class=\"cta\">\n      <a href=\"{{inviteLink}}\" style=\"color: white; text-decoration: none; font-weight: bold;\">Accept Invitation</a>\n    </div>\n    <p>This invitation expires in 7 days.</p>\n  </div>\n</body>\n</html>\n    "
  },
  'audit-log-export': {
    subject: 'Audit Log Export - {{organizationName}}',
    htmlTemplate: "\n<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { font-family: Arial, sans-serif; color: #333; }\n    .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n  </style>\n</head>\n<body>\n  <div class=\"container\">\n    <h1>Audit Log Export</h1>\n    <p>Your requested audit log export is ready for download.</p>\n    <p><strong>Organization:</strong> {{organizationName}}</p>\n    <p><strong>Date Range:</strong> {{startDate}} to {{endDate}}</p>\n    <p><strong>Records:</strong> {{totalRecords}}</p>\n    <p>The export file has been attached in {{format}} format.</p>\n  </div>\n</body>\n</html>\n    "
  },
  'policy-updated': {
    subject: 'Organization Policies Updated',
    htmlTemplate: "\n<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { font-family: Arial, sans-serif; color: #333; }\n    .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n    .changes { background: #ecf0f1; padding: 15px; }\n  </style>\n</head>\n<body>\n  <div class=\"container\">\n    <h1>Organization Policies Updated</h1>\n    <p>The following policies have been updated for {{organizationName}}:</p>\n    <div class=\"changes\">\n      {{#changes}}\n        <p><strong>{{field}}:</strong> {{oldValue}} \u2192 {{newValue}}</p>\n      {{/changes}}\n    </div>\n    <p>These changes will take effect immediately.</p>\n  </div>\n</body>\n</html>\n    "
  }
};
/**
 * Render email template with context
 */

function renderEmailTemplate(template, context) {
  var _a;

  var html = ((_a = exports.emailTemplates[template]) === null || _a === void 0 ? void 0 : _a.htmlTemplate) || ''; // Simple variable replacement

  Object.entries(context).forEach(function (_a) {
    var key = _a[0],
        value = _a[1];
    html = html.replace(new RegExp("{{" + key + "}}", 'g'), String(value || ''));
  }); // Handle conditionals (simple version)

  html = html.replace(/{{#\w+}}[\s\S]*?{{\/\w+}}/g, '');
  return html;
}

exports.renderEmailTemplate = renderEmailTemplate;
/**
 * Get subject line for template
 */

function getEmailSubject(template, context) {
  var _a;

  var subject = ((_a = exports.emailTemplates[template]) === null || _a === void 0 ? void 0 : _a.subject) || '';
  Object.entries(context).forEach(function (_a) {
    var key = _a[0],
        value = _a[1];
    subject = subject.replace(new RegExp("{{" + key + "}}", 'g'), String(value || ''));
  });
  return subject;
}

exports.getEmailSubject = getEmailSubject;