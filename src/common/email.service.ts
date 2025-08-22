import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor() {}

  /**
   * Send email notification
   */
  async sendEmail(to: string, subject: string, body: string, isHtml: boolean = false): Promise<boolean> {
    // TODO: Implement actual email sending logic with SMTP or email service
    console.log(`📧 Email sent to ${to}: ${subject}`);
    if (isHtml) {
      console.log(`📧 HTML Content: ${body}`);
    } else {
      console.log(`📧 Text Content: ${body}`);
    }
    return true;
  }

  /**
   * Send email verification email
   */
  async sendVerificationEmail(email: string, firstName: string, token: string): Promise<void> {
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Borzolini Clinic!</h2>
        <p>Hello ${firstName},</p>
        <p>Thank you for registering with us. Please verify your email address by clicking the button below:</p>
        <a href="${process.env.FRONTEND_URL}/verify-email?token=${token}" 
           style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Verify Email
        </a>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p>${process.env.FRONTEND_URL}/verify-email?token=${token}</p>
        <p>This link will expire in 24 hours.</p>
        <p>Best regards,<br>The Borzolini Clinic Team</p>
      </div>
    `;

    await this.sendEmail(email, 'Verify Your Email - Borzolini Clinic', htmlBody);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, firstName: string, resetToken: string): Promise<void> {
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello ${firstName},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}" 
           style="display: inline-block; background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Reset Password
        </a>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p>${process.env.FRONTEND_URL}/reset-password?token=${resetToken}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
        <p>Best regards,<br>The Borzolini Clinic Team</p>
      </div>
    `;

    await this.sendEmail(email, 'Password Reset Request - Borzolini Clinic', htmlBody);
  }

  /**
   * Send welcome email after successful registration
   */
  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
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

    await this.sendEmail(email, 'Welcome to Borzolini Clinic!', htmlBody);
  }

  /**
   * Send phone verification SMS (placeholder for SMS service)
   */
  async sendPhoneVerificationSMS(phone: string, otp: string): Promise<boolean> {
    // TODO: Implement actual SMS sending logic with Twilio or similar service
    console.log(`📱 SMS sent to ${phone}: Your verification code is ${otp}`);
    return true;
  }

  /**
   * Send appointment reminder
   */
  async sendAppointmentReminder(to: string, appointmentDetails: any): Promise<boolean> {
    const subject = 'Appointment Reminder';
    const body = `Your appointment is scheduled for ${appointmentDetails.date}`;
    return this.sendEmail(to, subject, body);
  }

  /**
   * Send health alert
   */
  async sendHealthAlert(to: string, alertDetails: any): Promise<boolean> {
    const subject = 'Health Alert - Action Required';
    const body = `Health alert: ${alertDetails.message}`;
    return this.sendEmail(to, subject, body);
  }
}
