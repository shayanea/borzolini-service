import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

export interface SmsMessage {
  to: string;
  message: string;
  from?: string;
}

export interface SmsResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: Date;
}

export interface SmsConfig {
  isEnabled: boolean;
  defaultFrom: string;
  provider: string;
  apiKey?: string;
  apiSecret?: string;
  accountSid?: string;
  authToken?: string;
}

@Injectable()
export class SmsService implements OnModuleInit {
  private readonly logger = new Logger(SmsService.name);
  private isInitialized = false;
  private smsConfig: SmsConfig | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.logger.log('Initializing SMS service...');

    try {
      await this.validateConfiguration();
      await this.testConnection();

      this.isInitialized = true;
      this.logger.log('SMS service initialized successfully');
    } catch (error) {
      this.logger.warn('SMS service initialization failed, running in mock mode:', error instanceof Error ? error.message : 'Unknown error');
      this.isInitialized = false;
    }
  }

  private async validateConfiguration(): Promise<void> {
    const isEnabled = this.configService.get<boolean>('SMS_ENABLED', false);

    if (!isEnabled) {
      this.logger.log('SMS service is disabled via configuration');
      this.smsConfig = {
        isEnabled: false,
        defaultFrom: 'Borzolini Clinic',
        provider: 'mock',
      };
      return;
    }

    // Check for required SMS provider configuration
    const provider = this.configService.get<string>('SMS_PROVIDER', 'twilio');
    let hasValidConfig = false;

    if (provider === 'twilio') {
      const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
      const authToken = this.configService.get('TWILIO_AUTH_TOKEN');

      if (accountSid && authToken) {
        hasValidConfig = true;
        this.smsConfig = {
          isEnabled: true,
          defaultFrom: this.configService.get<string>('SMS_DEFAULT_FROM', 'Borzolini Clinic'),
          provider: 'twilio',
          accountSid,
          authToken,
        };
      }
    } else if (provider === 'aws-sns') {
      const apiKey = this.configService.get('AWS_ACCESS_KEY_ID');
      const apiSecret = this.configService.get('AWS_SECRET_ACCESS_KEY');

      if (apiKey && apiSecret) {
        hasValidConfig = true;
        this.smsConfig = {
          isEnabled: true,
          defaultFrom: this.configService.get<string>('SMS_DEFAULT_FROM', 'Borzolini Clinic'),
          provider: 'aws-sns',
          apiKey,
          apiSecret,
        };
      }
    }

    if (!hasValidConfig) {
      throw new Error(`SMS provider '${provider}' configuration is incomplete. Check environment variables.`);
    }

    this.logger.log(`SMS configuration validated successfully for provider: ${provider}`);
  }

  private async testConnection(): Promise<void> {
    if (!this.smsConfig?.isEnabled) {
      this.logger.log('SMS service disabled, skipping connection test');
      return;
    }

    try {
      // TODO: Implement actual SMS provider connection test
      // For now, just validate the configuration
      this.logger.log('SMS configuration test passed (mock mode)');
    } catch (error) {
      this.logger.error('SMS connection test failed:', error);
      throw new Error(`SMS connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send an SMS message
   * @param message The SMS message to send
   * @returns Promise<SmsResponse> The result of the SMS sending operation
   */
  async sendSms(message: SmsMessage): Promise<SmsResponse> {
    if (!this.isInitialized) {
      return {
        success: false,
        error: 'SMS service not initialized',
        timestamp: new Date(),
      };
    }

    if (!this.smsConfig?.isEnabled) {
      this.logger.warn('SMS service is disabled. Message would have been sent:', message);
      return {
        success: true,
        messageId: 'mock-message-id',
        timestamp: new Date(),
      };
    }

    try {
      // TODO: Integrate with actual SMS provider (Twilio, AWS SNS, etc.)
      this.logger.log(`Sending SMS to ${message.to}: ${message.message}`);

      // For now, just log the message
      // In production, this would call the actual SMS service
      // Example with Twilio:
      // const twilioClient = require('twilio')(accountSid, authToken);
      // const result = await twilioClient.messages.create({
      //   body: message.message,
      //   from: message.from || this.smsConfig.defaultFrom,
      //   to: message.to
      // });

      return {
        success: true,
        messageId: `mock-${Date.now()}`,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to send SMS:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Send a phone verification OTP
   * @param phoneNumber The phone number to send OTP to
   * @param otp The OTP code to send
   * @returns Promise<SmsResponse> The result of the SMS sending operation
   */
  async sendVerificationOtp(phoneNumber: string, otp: string): Promise<SmsResponse> {
    const message = `Your Borzolini Clinic verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`;

    return this.sendSms({
      to: phoneNumber,
      message,
      from: this.smsConfig?.defaultFrom || 'Borzolini Clinic',
    });
  }

  /**
   * Send an appointment reminder
   * @param phoneNumber The phone number to send reminder to
   * @param appointmentDetails The appointment details
   * @returns Promise<SmsResponse> The result of the SMS sending operation
   */
  async sendAppointmentReminder(phoneNumber: string, appointmentDetails: any): Promise<SmsResponse> {
    const message = `Reminder: You have an appointment at Borzolini Clinic on ${appointmentDetails.date} at ${appointmentDetails.time}. Please arrive 15 minutes early.`;

    return this.sendSms({
      to: phoneNumber,
      message,
      from: this.smsConfig?.defaultFrom || 'Borzolini Clinic',
    });
  }

  /**
   * Send a health alert
   * @param phoneNumber The phone number to send alert to
   * @param alertMessage The health alert message
   * @returns Promise<SmsResponse> The result of the SMS sending operation
   */
  async sendHealthAlert(phoneNumber: string, alertMessage: string): Promise<SmsResponse> {
    const message = `Health Alert from Borzolini Clinic: ${alertMessage}`;

    return this.sendSms({
      to: phoneNumber,
      message,
      from: this.smsConfig?.defaultFrom || 'Borzolini Clinic',
    });
  }

  /**
   * Send a general notification
   * @param phoneNumber The phone number to send notification to
   * @param notificationMessage The notification message
   * @returns Promise<SmsResponse> The result of the SMS sending operation
   */
  async sendNotification(phoneNumber: string, notificationMessage: string): Promise<SmsResponse> {
    return this.sendSms({
      to: phoneNumber,
      message: notificationMessage,
      from: this.smsConfig?.defaultFrom || 'Borzolini Clinic',
    });
  }

  /**
   * Check if SMS service is enabled
   * @returns boolean Whether SMS service is enabled
   */
  isSmsEnabled(): boolean {
    return this.smsConfig?.isEnabled || false;
  }

  /**
   * Get the default sender name/number
   * @returns string The default sender
   */
  getDefaultFrom(): string {
    return this.smsConfig?.defaultFrom || 'Borzolini Clinic';
  }

  /**
   * Check if SMS service is ready
   */
  isServiceReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get SMS service status
   */
  getServiceStatus(): { isInitialized: boolean; isEnabled: boolean; provider: string; hasConfig: boolean } {
    return {
      isInitialized: this.isInitialized,
      isEnabled: this.smsConfig?.isEnabled || false,
      provider: this.smsConfig?.provider || 'none',
      hasConfig: !!this.smsConfig,
    };
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    // Basic phone number validation (can be enhanced)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }

  /**
   * Format phone number for SMS sending
   */
  formatPhoneNumber(phoneNumber: string): string {
    // Ensure phone number starts with +
    if (!phoneNumber.startsWith('+')) {
      // Assume US number if no country code
      return `+1${phoneNumber.replace(/\D/g, '')}`;
    }
    return phoneNumber;
  }
}
