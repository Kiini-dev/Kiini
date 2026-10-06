# Sample Email: Invoice and Receipt Delivery

## Email Details

**From:** Kiini <info@kiini.africa>  
**To:** John Smith <john@acmecorp.com>  
**Subject:** Invoice INV-2024-001 & Receipt REC-00001 - Payment Received  
**Attachments:** INV-2024-001.pdf, REC-00001.pdf

---

## Email Body (HTML Version)

Dear **John Smith**,

Thank you for your business! We are pleased to confirm that we have received your payment.

Please find attached your invoice and official receipt for the services provided. We appreciate your prompt payment and continued trust in Kiini.

### 📄 Transaction Summary

| Field | Value |
|-------|-------|
| **Invoice Number** | INV-2024-001 |
| **Receipt Number** | REC-00001 |
| **Invoice Date** | March 15, 2024 |
| **Payment Date** | March 15, 2024 |
| **Payment Method** | Bank Transfer |
| **Amount Paid** | **KES 1,102,000** |

### 📎 Attached Documents

- 📄 **INV-2024-001.pdf** - Invoice Document
- 🧾 **REC-00001.pdf** - Official Receipt

If you have any questions about this invoice or receipt, please don't hesitate to contact us. We're here to help!

[VIEW_IN_CLIENT_PORTAL](https://accounts.kiini.africa/client-portal)

### 💳 Payment Information (For Future Reference)

- **Bank:** Equity Bank Kenya
- **Account Name:** Kiini
- **Account Number:** 1234567890
- **M-Pesa Paybill:** 123456
- **Account Number:** KIINI

---

**— Redefining Technology!!! —**

**Kiini**  
Email: info@kiini.africa  
Phone: +254 700 000 000  
Website: www.kiini.africa

© 2024 Kiini. All rights reserved.

---

## Usage Instructions

### Template Variables

Replace the following placeholders in the template:

- `{{CLIENT_NAME}}` - Client's full name (e.g., "John Smith")
- `{{INVOICE_NUMBER}}` - Invoice number (e.g., "INV-2024-001")
- `{{RECEIPT_NUMBER}}` - Receipt number (e.g., "REC-00001")
- `{{INVOICE_DATE}}` - Invoice date (e.g., "March 15, 2024")
- `{{PAYMENT_DATE}}` - Payment date (e.g., "March 15, 2024")
- `{{PAYMENT_METHOD}}` - Payment method (e.g., "Bank Transfer", "M-Pesa", "Cash")
- `{{AMOUNT}}` - Payment amount (e.g., "1,102,000")

### Backend Implementation Example

```javascript
// Example function to send invoice and receipt email
async function sendInvoiceReceiptEmail(invoiceData, receiptData, clientEmail) {
  const emailTemplate = await readFile('email-templates/invoice-receipt-email.html', 'utf8');
  
  // Replace placeholders
  const emailContent = emailTemplate
    .replace(/{{CLIENT_NAME}}/g, invoiceData.clientName)
    .replace(/{{INVOICE_NUMBER}}/g, invoiceData.invoiceNumber)
    .replace(/{{RECEIPT_NUMBER}}/g, receiptData.receiptNumber)
    .replace(/{{INVOICE_DATE}}/g, formatDate(invoiceData.date))
    .replace(/{{PAYMENT_DATE}}/g, formatDate(receiptData.date))
    .replace(/{{PAYMENT_METHOD}}/g, receiptData.paymentMethod)
    .replace(/{{AMOUNT}}/g, formatCurrency(receiptData.amount));
  
  // Generate PDFs
  const invoicePDF = generateInvoicePDF(invoiceData);
  const receiptPDF = generateReceiptPDF(receiptData);
  
  // Send email with attachments
  await sendEmail({
    from: 'info@kiini.africa',
    to: clientEmail,
    subject: `Invoice ${invoiceData.invoiceNumber} & Receipt ${receiptData.receiptNumber} - Payment Received`,
    html: emailContent,
    attachments: [_FILENAME_INVOICEDATAINVOICENUMBERPDF_CONTENT_INVOICEPDF_FILENAME_RECEIPTDATARECEIPTNUMBERPDF_CONTENT_RECEIPTPDF_]
  });
  
  return { success: true };
}
```

### SMTP Configuration

Configure your SMTP settings in the backend:

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // or your SMTP server
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});
```

### Environment Variables Required

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=info@kiini.africa
SMTP_PASSWORD=your_smtp_password
SMTP_FROM_NAME=Kiini
SMTP_FROM_EMAIL=info@kiini.africa
```

## Email Variations

### For Invoice Only (No Payment Yet)

**Subject:** Invoice INV-2024-001 from Kiini

Change the opening to:
> "Thank you for your business! Please find attached your invoice for the services provided."

Remove the receipt-related content and payment confirmation.

### For Receipt Only (Payment Confirmation)

**Subject:** Payment Receipt REC-00001 - Thank You!

Focus on payment confirmation:
> "Thank you for your payment! We have successfully received your payment of KES 1,102,000."

### For Overdue Invoice Reminder

**Subject:** Reminder: Invoice INV-2024-001 Due Soon

Add urgency:
> "This is a friendly reminder that Invoice INV-2024-001 is due on [DUE_DATE]. Please arrange payment at your earliest convenience."

## Best Practices

1. **Personalization** - Always use the client's name
2. **Clear Subject Lines** - Include invoice/receipt numbers
3. **Professional Tone** - Maintain courtesy and professionalism
4. **Attachments** - Always attach both PDF documents
5. **Contact Information** - Make it easy for clients to reach you
6. **Mobile-Friendly** - Template is responsive for mobile devices
7. **Brand Consistency** - Uses Kiini orange (#FF8C00) throughout
8. **Call-to-Action** - Includes link to client portal
9. **Payment Instructions** - Provides clear payment details for future transactions
10. **Legal Footer** - Includes confidentiality notice and copyright

## Testing Checklist

- [_] All template variables replaced correctly
- [_] PDF attachments generated and attached
- [_] Email renders correctly in Gmail
- [_] Email renders correctly in Outlook
- [_] Email renders correctly on mobile devices
- [_] Links work correctly (client portal, website)
- [_] Unsubscribe link included (if required by law)
- [_] Spam score checked (use mail-tester.com)
- [_] Test send to internal email first
- [_] Verify client receives email successfully

