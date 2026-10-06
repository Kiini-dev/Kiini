# Email Templates - Kiini CRM

This directory contains email templates for various automated communications from the CRM system.

## Password Reset Email Template

### Files
- `password-reset.html` - HTML version (rich formatting, responsive design)
- `password-reset.txt` - Plain text version (fallback for email clients that don't support HTML)

### Template Variables

The following variables should be replaced when sending the email:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{USER_NAME}}` | User's full name | "John Smith" |
| `{{USER_EMAIL}}` | User's email address | "john@acmecorp.com" |
| `{{RESET_LINK}}` | Password reset URL with token | "https://accounts.kiini.africa/reset-password?token=abc123..." |

### Usage Example (Node.js with Nodemailer)

```javascript
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

async function sendPasswordResetEmail(user, resetToken) {
  // Read email templates
  const htmlTemplate = fs.readFileSync(
    path.join(__dirname, 'email-templates/password-reset.html'),
    'utf-8'
  );
  const textTemplate = fs.readFileSync(
    path.join(__dirname, 'email-templates/password-reset.txt'),
    'utf-8'
  );

  // Generate reset link
  const resetLink = `https://accounts.kiini.africa/reset-password?token=${resetToken}`;

  // Replace template variables
  const htmlContent = htmlTemplate
    .replace(/{{USER_NAME}}/g, user.name)
    .replace(/{{USER_EMAIL}}/g, user.email)
    .replace(/{{RESET_LINK}}/g, resetLink);

  const textContent = textTemplate
    .replace(/{{USER_NAME}}/g, user.name)
    .replace(/{{USER_EMAIL}}/g, user.email)
    .replace(/{{RESET_LINK}}/g, resetLink);

  // Configure email transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Send email
  await transporter.sendMail({
    from: '"Kiini CRM" <noreply@kiini.africa>',
    to: user.email,
    subject: 'Reset Your Password - Kiini CRM',
    text: textContent,
    html: htmlContent,
  });
}
```

### Backend Implementation (tRPC)

Add this to your `server/routers.ts`:

```typescript
import crypto from 'crypto';

export const appRouter = router({
  // ... existing routers

  auth: router({
    sendPasswordResetEmail: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        // Find user by email
        const user = await db.getUserByEmail(input.email);
        if (!user) {
          // Don't reveal if email exists for security
          return { success: true };
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Save token to database
        await db.savePasswordResetToken({
          userId: user.id,
          token: resetToken,
          expiresAt,
        });

        // Send email
        await sendPasswordResetEmail(user, resetToken);

        return { success: true };
      }),

    resetPassword: publicProcedure
      .input(z.object({
        token: z.string(),
        password: z.string().min(8),
      }))
      .mutation(async ({ input }) => {
        // Verify token
        const resetRequest = await db.getPasswordResetToken(input.token);
        if (!resetRequest || resetRequest.expiresAt < new Date()) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid or expired reset token',
          });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(input.password, 10);

        // Update user password
        await db.updateUserPassword(resetRequest.userId, hashedPassword);

        // Delete used token
        await db.deletePasswordResetToken(input.token);

        return { success: true };
      }),
  }),
});
```

### Database Schema

Add these tables to `drizzle/schema.ts`:

```typescript
export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});
```

### Email Service Configuration

#### Option 1: Gmail SMTP
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### Option 2: SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### Option 3: AWS SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
```

### Testing

Test the email template locally:

```bash
# Install dependencies
npm install nodemailer

# Create test script
node test-email.js
```

```javascript
// test-email.js
const nodemailer = require('nodemailer');

// Use Ethereal Email for testing (fake SMTP service)
nodemailer.createTestAccount((err, account) => {
  const transporter = nodemailer.createTransporter({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: account.user,
      pass: account.pass,
    },
  });

  // Send test email
  transporter.sendMail({
    from: '"Kiini" <noreply@kiini.africa>',
    to: 'test@example.com',
    subject: 'Test Password Reset Email',
    html: fs.readFileSync('./password-reset.html', 'utf-8')
      .replace(/{{USER_NAME}}/g, 'Test User')
      .replace(/{{USER_EMAIL}}/g, 'test@example.com')
      .replace(/{{RESET_LINK}}/g, 'https://accounts.kiini.africa/reset-password?token=test123'),
  }, (err, info) => {
    console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
  });
});
```

### Security Best Practices

1. **Token Generation**: Use cryptographically secure random tokens
2. **Token Expiration**: Set short expiration times (1 hour recommended)
3. **One-Time Use**: Invalidate tokens after use
4. **Rate Limiting**: Limit password reset requests per email/IP
5. **No Email Enumeration**: Don't reveal if email exists in system
6. **HTTPS Only**: Always use HTTPS for reset links
7. **Audit Logging**: Log all password reset attempts

### Customization

To customize the email template:

1. Update company logo URL in the HTML template
2. Modify colors in the `<style>` section
3. Update contact information in the footer
4. Add social media links
5. Adjust expiration time messaging

## Canonical CRM Tokens

All HTML templates use double-brace tokens. Document-specific values use the
snake-case names below so the same templates work in the editor, notification
renderer, and email queue:

- Identity: `{{recipient_name}}`, `{{user_name}}`, `{{user_email}}`, `{{client_name}}`, `{{company_name}}`
- Documents: `{{invoice_number}}`, `{{estimate_number}}`, `{{proposal_number}}`, `{{receipt_number}}`, `{{ticket_number}}`, `{{project_name}}`
- Dates and amounts: `{{invoice_date}}`, `{{due_date}}`, `{{payment_date}}`, `{{payment_method}}`, `{{subtotal}}`, `{{tax_amount}}`, `{{total_amount}}`, `{{amount_paid}}`
- Links and branding: `{{invoice_url}}`, `{{estimate_url}}`, `{{proposal_url}}`, `{{receipt_url}}`, `{{company_logo_url}}`, `{{company_address}}`, `{{company_email}}`, `{{company_website}}`
- Attachments: `{{invoice_pdf_filename}}`, `{{estimate_pdf_filename}}`, `{{proposal_pdf_filename}}`, `{{receipt_pdf_filename}}`, `{{payslip_pdf_filename}}`, `{{attachment_filename}}`
- Footer/social: `{{unsubscribe_url}}`, `{{company_facebook_url}}`, `{{company_twitter_url}}`, `{{company_linkedin_url}}`, `{{company_instagram_url}}`, `{{app_name}}`

Templates that reference a document attachment should be sent with the matching
generated file in the mail service's `attachments` array. The filename token is
display text; it does not create or attach a file by itself.

### Future Email Templates

Consider creating templates for:
- Welcome email (new user registration)
- Invoice sent notification
- Payment received confirmation
- Project status updates
- Appointment reminders
- Account verification
- Two-factor authentication codes

