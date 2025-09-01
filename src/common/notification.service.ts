import { Injectable, Logger } from '@nestjs/common';

import { EmailService } from './email.service';
import { SettingsConfigService } from '../modules/settings/settings-config.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private emailService: EmailService,
    private settingsConfigService: SettingsConfigService
  ) {}

  /**
   * Send appointment reminder notification
   */
  async sendAppointmentReminder(userId: string, appointmentData: Record<string, unknown>): Promise<void> {
    try {
      // Check if notifications are enabled
      const notificationsEnabled = await this.settingsConfigService.areNotificationsEnabled();
      if (!notificationsEnabled) {
        this.logger.log('Notifications are disabled, skipping appointment reminder');
        return;
      }

      // Send email reminder if enabled
      const emailEnabled = await this.settingsConfigService.areEmailNotificationsEnabled();
      if (emailEnabled) {
        await this.emailService.sendAppointmentReminder(appointmentData.userEmail as string, appointmentData);
      }

      // Send SMS reminder if enabled
      const smsEnabled = await this.settingsConfigService.areSmsNotificationsEnabled();
      if (smsEnabled && appointmentData.userPhone) {
        // TODO: Implement SMS sending with actual SMS service
        this.logger.log(`SMS reminder would be sent to ${appointmentData.userPhone}`);
      }

      // TODO: Send push notification
      // TODO: Send in-app notification

      this.logger.log(`Appointment reminder sent for user ${userId}`, {
        service: 'NotificationService',
        method: 'sendAppointmentReminder',
        userId,
      });
    } catch (error) {
      this.logger.error('Failed to send appointment reminder:', error instanceof Error ? error.stack : 'Unknown error', {
        service: 'NotificationService',
        method: 'sendAppointmentReminder',
        userId,
      });
    }
  }

  /**
   * Send health alert notification
   */
  async sendHealthAlert(userId: string, alertData: Record<string, unknown>): Promise<void> {
    try {
      // Check if notifications are enabled
      const notificationsEnabled = await this.settingsConfigService.areNotificationsEnabled();
      if (!notificationsEnabled) {
        this.logger.log('Notifications are disabled, skipping health alert');
        return;
      }

      // Send email alert if enabled
      const emailEnabled = await this.settingsConfigService.areEmailNotificationsEnabled();
      if (emailEnabled) {
        await this.emailService.sendHealthAlert(alertData.userEmail as string, alertData);
      }

      // Send SMS alert if enabled
      const smsEnabled = await this.settingsConfigService.areSmsNotificationsEnabled();
      if (smsEnabled && alertData.userPhone) {
        // TODO: Implement SMS sending with actual SMS service
        this.logger.log(`SMS health alert would be sent to ${alertData.userPhone}`);
      }

      // TODO: Send push notification
      // TODO: Send in-app notification

      this.logger.log(`Health alert sent for user ${userId}`, {
        service: 'NotificationService',
        method: 'sendHealthAlert',
        userId,
      });
    } catch (error) {
      this.logger.error('Failed to send health alert:', error instanceof Error ? error.stack : 'Unknown error', {
        service: 'NotificationService',
        method: 'sendHealthAlert',
        userId,
      });
    }
  }

  /**
   * Send consultation reminder
   */
  async sendConsultationReminder(userId: string, consultationData: Record<string, unknown>): Promise<void> {
    try {
      const subject = 'Video Consultation Reminder';
      const body = `Your video consultation is scheduled for ${consultationData.scheduledTime}`;

      await this.emailService.sendEmail(consultationData.userEmail as string, subject, body);

      this.logger.log(`Consultation reminder sent for user ${userId}`, {
        service: 'NotificationService',
        method: 'sendConsultationReminder',
        userId,
      });
    } catch (error) {
      this.logger.error('Failed to send consultation reminder:', error instanceof Error ? error.stack : 'Unknown error', {
        service: 'NotificationService',
        method: 'sendConsultationReminder',
        userId,
      });
    }
  }

  /**
   * Send welcome notification for new users
   */
  async sendWelcomeNotification(userId: string, userData: Record<string, unknown>): Promise<void> {
    try {
      const subject = 'Welcome to Borzolini Service!';
      const body = `Welcome ${userData.name}! We're excited to help you take care of your pets.`;

      await this.emailService.sendEmail(userData.email as string, subject, body);

      this.logger.log(`Welcome notification sent for user ${userId}`, {
        service: 'NotificationService',
        method: 'sendWelcomeNotification',
        userId,
      });
    } catch (error) {
      this.logger.error('Failed to send welcome notification:', error instanceof Error ? error.stack : 'Unknown error', {
        service: 'NotificationService',
        method: 'sendWelcomeNotification',
        userId,
      });
    }
  }

  /**
   * Send AI health insight notification
   */
  async sendAiHealthInsight(userId: string, insightData: Record<string, unknown>): Promise<void> {
    try {
      const subject = 'AI Health Insight for Your Pet';
      const body = `New health insight: ${insightData.message}`;

      await this.emailService.sendEmail(insightData.userEmail as string, subject, body);

      this.logger.log(`AI health insight sent for user ${userId}`, {
        service: 'NotificationService',
        method: 'sendAiHealthInsight',
        userId,
      });
    } catch (error) {
      this.logger.error('Failed to send AI health insight:', error instanceof Error ? error.stack : 'Unknown error', {
        service: 'NotificationService',
        method: 'sendAiHealthInsight',
        userId,
      });
    }
  }
}
