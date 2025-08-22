import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {}

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
  async sendVerificationEmail(email: string, firstName: string, token: string): Promise<boolean> {
    const subject = 'Verify Your Email - Borzolini Clinic';
    const verificationUrl = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${token}`;

    const htmlBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verify Your Email</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🐾 Borzolini Clinic</h1>
            </div>
            <div class="content">
              <h2>Hello ${firstName}!</h2>
              <p>Welcome to Borzolini Clinic! Please verify your email address to complete your registration.</p>
              <p>Click the button below to verify your email:</p>
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p><a href="${verificationUrl}">${verificationUrl}</a></p>
              <p>This link will expire in 24 hours.</p>
              <p>Best regards,<br>The Borzolini Clinic Team</p>
            </div>
            <div class="footer">
              <p>If you didn't create an account, please ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textBody = `
      Hello ${firstName}!
      
      Welcome to Borzolini Clinic! Please verify your email address to complete your registration.
      
      Click this link to verify your email: ${verificationUrl}
      
      This link will expire in 24 hours.
      
      Best regards,
      The Borzolini Clinic Team
      
      If you didn't create an account, please ignore this email.
    `;

    return this.sendEmail(email, subject, htmlBody, true);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, firstName: string, token: string): Promise<boolean> {
    const subject = 'Reset Your Password - Borzolini Clinic';
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;

    const htmlBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🐾 Borzolini Clinic</h1>
            </div>
            <div class="content">
              <h2>Hello ${firstName}!</h2>
              <p>We received a request to reset your password for your Borzolini Clinic account.</p>
              <p>Click the button below to reset your password:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p><a href="${resetUrl}">${resetUrl}</a></p>
              <p>This link will expire in 1 hour.</p>
              <p>If you didn't request a password reset, please ignore this email.</p>
              <p>Best regards,<br>The Borzolini Clinic Team</p>
            </div>
            <div class="footer">
              <p>For security reasons, this link will expire soon.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textBody = `
      Hello ${firstName}!
      
      We received a request to reset your password for your Borzolini Clinic account.
      
      Click this link to reset your password: ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you didn't request a password reset, please ignore this email.
      
      Best regards,
      The Borzolini Clinic Team
    `;

    return this.sendEmail(email, subject, htmlBody, true);
  }

  /**
   * Send welcome email after successful registration
   */
  async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    const subject = 'Welcome to Borzolini Clinic! 🐾';

    const htmlBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to Borzolini Clinic</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🐾 Borzolini Clinic</h1>
            </div>
            <div class="content">
              <h2>Welcome ${firstName}! 🎉</h2>
              <p>Thank you for joining Borzolini Clinic! We're excited to have you as part of our community.</p>
              <p>Here's what you can do next:</p>
              <ul>
                <li>Complete your profile</li>
                <li>Add your pets</li>
                <li>Book appointments</li>
                <li>Connect with our veterinarians</li>
              </ul>
              <a href="${this.configService.get('FRONTEND_URL')}/dashboard" class="button">Go to Dashboard</a>
              <p>If you have any questions, feel free to reach out to our support team.</p>
              <p>Best regards,<br>The Borzolini Clinic Team</p>
            </div>
            <div class="footer">
              <p>Thank you for choosing Borzolini Clinic for your pet's healthcare needs.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textBody = `
      Welcome ${firstName}! 🎉
      
      Thank you for joining Borzolini Clinic! We're excited to have you as part of our community.
      
      Here's what you can do next:
      - Complete your profile
      - Add your pets
      - Book appointments
      - Connect with our veterinarians
      
      Visit your dashboard: ${this.configService.get('FRONTEND_URL')}/dashboard
      
      If you have any questions, feel free to reach out to our support team.
      
      Best regards,
      The Borzolini Clinic Team
      
      Thank you for choosing Borzolini Clinic for your pet's healthcare needs.
    `;

    return this.sendEmail(email, subject, htmlBody, true);
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
