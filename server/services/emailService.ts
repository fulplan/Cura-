import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { MailOptions } from 'nodemailer/lib/json-transport';

export interface EmailConfig {
  provider: 'smtp' | 'gmail' | 'outlook';
  smtpHost?: string;
  smtpPort?: number;
  smtpUsername?: string;
  smtpPassword?: string;
  fromEmail: string;
  fromName: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: Transporter | null = null;
  private config: EmailConfig | null = null;

  constructor() {
    // Service starts without configuration
    // Configuration is loaded when initialize() is called
  }

  async initialize(config: EmailConfig): Promise<boolean> {
    try {
      this.config = config;

      // Create transporter based on provider
      if (config.provider === 'smtp') {
        this.transporter = nodemailer.createTransport({
          host: config.smtpHost,
          port: config.smtpPort || 587,
          secure: config.smtpPort === 465, // true for 465, false for other ports
          auth: {
            user: config.smtpUsername,
            pass: config.smtpPassword,
          },
        });
      } else if (config.provider === 'gmail') {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: config.smtpUsername,
            pass: config.smtpPassword,
          },
        });
      } else if (config.provider === 'outlook') {
        this.transporter = nodemailer.createTransport({
          service: 'outlook',
          auth: {
            user: config.smtpUsername,
            pass: config.smtpPassword,
          },
        });
      }

      if (!this.transporter) {
        throw new Error(`Unsupported email provider: ${config.provider}`);
      }

      // Verify connection
      await this.transporter.verify();
      console.log('✅ Email service initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ Email service initialization failed:', error);
      this.transporter = null;
      return false;
    }
  }

  isConfigured(): boolean {
    return this.transporter !== null && this.config !== null;
  }

  async sendEmail(to: string | string[], subject: string, html: string, text?: string): Promise<boolean> {
    if (!this.isConfigured()) {
      console.error('Email service not configured');
      return false;
    }

    try {
      const mailOptions: MailOptions = {
        from: `"${this.config!.fromName}" <${this.config!.fromEmail}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      };

      const result = await this.transporter!.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);
      return true;

    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  async sendTemplateEmail(to: string | string[], template: EmailTemplate): Promise<boolean> {
    return this.sendEmail(to, template.subject, template.html, template.text);
  }

  // Pre-built email templates
  getWelcomeTemplate(username: string, siteUrl: string): EmailTemplate {
    return {
      subject: 'Welcome to the CMS!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome ${username}!</h2>
          <p>Your account has been successfully created. You can now start using the Content Management System.</p>
          <p>
            <a href="${siteUrl}" style="background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Access CMS
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">If you have any questions, please don't hesitate to contact our support team.</p>
        </div>
      `,
      text: `Welcome ${username}! Your account has been created. Visit ${siteUrl} to access the CMS.`
    };
  }

  getPasswordResetTemplate(username: string, resetLink: string): EmailTemplate {
    return {
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset</h2>
          <p>Hi ${username},</p>
          <p>You requested a password reset. Click the button below to reset your password:</p>
          <p>
            <a href="${resetLink}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">This link will expire in 1 hour. If you didn't request this reset, please ignore this email.</p>
        </div>
      `,
      text: `Hi ${username}, you requested a password reset. Visit ${resetLink} to reset your password. This link expires in 1 hour.`
    };
  }

  getNotificationTemplate(title: string, message: string, actionUrl?: string, actionText?: string): EmailTemplate {
    return {
      subject: title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${title}</h2>
          <p>${message}</p>
          ${actionUrl && actionText ? `
            <p>
              <a href="${actionUrl}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                ${actionText}
              </a>
            </p>
          ` : ''}
          <p style="color: #666; font-size: 14px;">This is an automated message from your CMS.</p>
        </div>
      `,
      text: `${title}: ${message}${actionUrl ? ` ${actionText}: ${actionUrl}` : ''}`
    };
  }

  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email connection test failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const emailService = new EmailService();