import nodemailer from 'nodemailer';

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  password?: string;
  fromEmail: string;
  fromName: string;
}

class SMTPService {
  private config: SMTPConfig | null = null;

  /**
   * Initialize SMTP service with configuration
   */
  setConfig(config: SMTPConfig) {
    this.config = config;
  }

  /**
   * Get current SMTP configuration
   */
  getConfig(): SMTPConfig | null {
    return this.config;
  }

  /**
   * Create transporter with current config or environment fallback
   */
  createTransporter() {
    // Use integration config if available, otherwise fall back to environment variables
    const config = this.config || this.getEnvConfig();

    if (!config.host || !config.port) {
      throw new Error('SMTP configuration not available. Please configure SMTP in Integrations.');
    }

    return nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.user ? { user: config.user, pass: config.password } : undefined,
    });
  }

  /**
   * Get SMTP config from environment variables (fallback)
   */
  private getEnvConfig(): SMTPConfig {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'info@kiini.africa';
    const fromName = process.env.SMTP_FROM_NAME || 'Kiini';

    return {
      host: host || '',
      port,
      secure: port === 465,
      user,
      password: pass,
      fromEmail,
      fromName,
    };
  }

  /**
   * Get the from address in email format
   */
  getFromAddress(): string {
    const config = this.config || this.getEnvConfig();
    return `"${config.fromName}" <${config.fromEmail}>`;
  }

  /**
   * Verify SMTP connection
   */
  async verify(): Promise<boolean> {
    try {
      const transporter = this.createTransporter();
      return await transporter.verify();
    } catch (error) {
      console.error('[SMTP] Verification failed:', error);
      return false;
    }
  }

  /**
   * Test send an email
   */
  async testSend(toEmail: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const transporter = this.createTransporter();
      const config = this.config || this.getEnvConfig();

      const info = await transporter.sendMail({
        from: this.getFromAddress(),
        to: toEmail,
        subject: 'SMTP Configuration Test Email',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>SMTP Configuration Test Successful!</h2>
            <p>This is a test email to verify your SMTP configuration.</p>
            <p><strong>Configuration Details:</strong></p>
            <ul>
              <li>Host: ${config.host}</li>
              <li>Port: ${config.port}</li>
              <li>Secure: ${config.secure ? 'Yes' : 'No'}</li>
              <li>From: ${this.getFromAddress()}</li>
            </ul>
            <p>If you received this email, your SMTP configuration is working correctly!</p>
          </div>
        `,
        text: 'SMTP Configuration Test Successful! This is a test email to verify your SMTP configuration.',
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error('[SMTP] Test send failed:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }
}

// Singleton instance
export const smtpService = new SMTPService();
