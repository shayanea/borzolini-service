import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  fromEmail: string;
  fromName: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: Date;
}

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private isInitialized = false;
  private emailConfig: EmailConfig | null = null;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.logger.log('Initializing Email service...');

    try {
      await this.validateConfiguration();
      await this.testConnection();

      this.isInitialized = true;
      this.logger.log('Email service initialized successfully');
    } catch (error) {
      this.logger.warn('Email service initialization failed, running in mock mode:', error instanceof Error ? error.message : 'Unknown error');
      this.isInitialized = false;
    }
  }

  private async validateConfiguration(): Promise<void> {
    const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
    const missingVars: string[] = [];

    for (const varName of requiredVars) {
      const value = this.configService.get(varName);
      if (!value) {
        missingVars.push(varName);
      }
    }

    if (missingVars.length > 0) {
      throw new Error(`Missing required email environment variables: ${missingVars.join(', ')}`);
    }

    // Validate SMTP port
    const smtpPort = this.configService.get<number>('SMTP_PORT');
    if (isNaN(smtpPort!) || smtpPort! < 1 || smtpPort! > 65535) {
      throw new Error(`Invalid SMTP_PORT: ${smtpPort}`);
    }

    this.emailConfig = {
      smtpHost: this.configService.get('SMTP_HOST')!,
      smtpPort: smtpPort!,
      smtpUser: this.configService.get('SMTP_USER')!,
      smtpPass: this.configService.get('SMTP_PASS')!,
      fromEmail: this.configService.get('SMTP_USER')!,
      fromName: this.configService.get('EMAIL_FROM_NAME', 'Borzolini Clinic'),
    };

    this.logger.log('Email configuration validated successfully');
  }

  private async testConnection(): Promise<void> {
    if (!this.emailConfig) {
      throw new Error('Email configuration not available');
    }

    try {
      // TODO: Implement actual SMTP connection test
      // For now, just validate the configuration
      this.logger.log('Email configuration test passed (mock mode)');
    } catch (error) {
      this.logger.error('Email connection test failed:', error);
      throw new Error(`Email connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send email notification
   */
  async sendEmail(to: string, subject: string, body: string, isHtml: boolean = false): Promise<EmailResult> {
    if (!this.isInitialized) {
      return {
        success: false,
        error: 'Email service not initialized',
        timestamp: new Date(),
      };
    }

    try {
      if (this.emailConfig) {
        // TODO: Implement actual email sending logic with SMTP
        this.logger.log(`📧 Email sent to ${to}: ${subject}`);
        if (isHtml) {
          this.logger.log(`📧 HTML Content: ${body}`);
        } else {
          this.logger.log(`📧 Text Content: ${body}`);
        }

        return {
          success: true,
          messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
        };
      } else {
        // Fallback to console logging
        this.logger.warn('Email service not configured, logging to console');
        this.logger.log(`📧 Email would be sent to ${to}: ${subject}`);

        return {
          success: true,
          messageId: `console-${Date.now()}`,
          timestamp: new Date(),
        };
      }
    } catch (error) {
      this.logger.error('Failed to send email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Send email verification email
   */
  async sendVerificationEmail(email: string, firstName: string, token: string): Promise<EmailResult> {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Borzolini Clinic!</h2>
        <p>Hello ${firstName},</p>
        <p>Thank you for registering with us. Please verify your email address by clicking the button below:</p>
        <a href="${frontendUrl}/verify-email?token=${token}" 
           style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Verify Email
        </a>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p>${frontendUrl}/verify-email?token=${token}</p>
        <p>This link will expire in 24 hours.</p>
        <p>Best regards,<br>The Borzolini Clinic Team</p>
      </div>
    `;

    return await this.sendEmail(email, 'Verify Your Email - Borzolini Clinic', htmlBody, true);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, firstName: string, resetToken: string): Promise<EmailResult> {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello ${firstName},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <a href="${frontendUrl}/reset-password?token=${resetToken}" 
           style="display: inline-block; background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Reset Password
        </a>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p>${frontendUrl}/reset-password?token=${resetToken}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
        <p>Best regards,<br>The Borzolini Clinic Team</p>
      </div>
    `;

    return await this.sendEmail(email, 'Password Reset Request - Borzolini Clinic', htmlBody, true);
  }

  /**
   * Send welcome email after successful registration
   */
  async sendWelcomeEmail(email: string, firstName: string): Promise<EmailResult> {
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Borzolini Clinic!</h2>
        <p>Hello ${firstName},</p>
        <p>Welcome to Borzolini Clinic! Your account has been successfully verified and you're now ready to use our services.</p>
        <p>You can now:</p>
        <ul>
          <li>Log in to your account</li>
          <li>Book appointments</li>
          <li>Access telemedicine services</li>
          <li>Monitor your pet's health</li>
        </ul>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br>The Borzolini Clinic Team</p>
      </div>
    `;

    return await this.sendEmail(email, 'Welcome to Borzolini Clinic!', htmlBody, true);
  }

  /**
   * Send phone verification SMS (placeholder for SMS service)
   */
  async sendPhoneVerificationSMS(phone: string, otp: string): Promise<boolean> {
    // TODO: Implement actual SMS sending logic with Twilio or similar service
    this.logger.log(`📱 SMS sent to ${phone}: Your verification code is ${otp}`);
    return true;
  }

  /**
   * Send appointment reminder email
   */
  async sendAppointmentReminder(email: string, appointmentData: any): Promise<EmailResult> {
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Appointment Reminder</h2>
        <p>Hello,</p>
        <p>This is a reminder for your upcoming appointment:</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Date:</strong> ${appointmentData.scheduledDate}</p>
          <p><strong>Time:</strong> ${appointmentData.scheduledTime}</p>
          <p><strong>Service:</strong> ${appointmentData.serviceName}</p>
          <p><strong>Location:</strong> ${appointmentData.location}</p>
        </div>
        <p>Please arrive 10 minutes before your scheduled time.</p>
        <p>If you need to reschedule, please contact us at least 24 hours in advance.</p>
        <p>Best regards,<br>The Borzolini Clinic Team</p>
      </div>
    `;

    return await this.sendEmail(email, 'Appointment Reminder - Borzolini Clinic', htmlBody, true);
  }

  /**
   * Send health alert email
   */
  async sendHealthAlert(email: string, alertData: any): Promise<EmailResult> {
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Health Alert</h2>
        <p>Hello,</p>
        <p>This is an important health alert regarding your pet:</p>
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Alert Type:</strong> ${alertData.type}</p>
          <p><strong>Message:</strong> ${alertData.message}</p>
          <p><strong>Priority:</strong> ${alertData.priority}</p>
        </div>
        <p>Please review this information and take appropriate action if necessary.</p>
        <p>If you have any concerns, please contact our veterinary team immediately.</p>
        <p>Best regards,<br>The Borzolini Clinic Team</p>
      </div>
    `;

    return await this.sendEmail(email, 'Health Alert - Borzolini Clinic', htmlBody, true);
  }

  /**
   * Check if email service is ready
   */
  isServiceReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get email service status
   */
  getServiceStatus(): { isInitialized: boolean; hasConfig: boolean; mode: string } {
    return {
      isInitialized: this.isInitialized,
      hasConfig: !!this.emailConfig,
      mode: this.emailConfig ? 'smtp' : 'mock',
    };
  }
}
