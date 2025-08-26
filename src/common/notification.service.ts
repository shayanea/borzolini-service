import { EmailService } from "./email.service";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private emailService: EmailService) {}

  /**
   * Send appointment reminder notification
   */
  async sendAppointmentReminder(
    userId: string,
    appointmentData: any,
  ): Promise<void> {
    try {
      // Send email reminder
      await this.emailService.sendAppointmentReminder(
        appointmentData.userEmail,
        appointmentData,
      );

      // TODO: Send push notification
      // TODO: Send in-app notification

      this.logger.log(`Appointment reminder sent for user ${userId}`, {
        service: "NotificationService",
        method: "sendAppointmentReminder",
        userId,
      });
    } catch (error) {
      this.logger.error(
        "Failed to send appointment reminder:",
        error instanceof Error ? error.stack : "Unknown error",
        {
          service: "NotificationService",
          method: "sendAppointmentReminder",
          userId,
        },
      );
    }
  }

  /**
   * Send health alert notification
   */
  async sendHealthAlert(userId: string, alertData: any): Promise<void> {
    try {
      // Send email alert
      await this.emailService.sendHealthAlert(alertData.userEmail, alertData);

      // TODO: Send push notification
      // TODO: Send in-app notification

      this.logger.log(`Health alert sent for user ${userId}`, {
        service: "NotificationService",
        method: "sendHealthAlert",
        userId,
      });
    } catch (error) {
      this.logger.error(
        "Failed to send health alert:",
        error instanceof Error ? error.stack : "Unknown error",
        {
          service: "NotificationService",
          method: "sendHealthAlert",
          userId,
        },
      );
    }
  }

  /**
   * Send consultation reminder
   */
  async sendConsultationReminder(
    userId: string,
    consultationData: any,
  ): Promise<void> {
    try {
      const subject = "Video Consultation Reminder";
      const body = `Your video consultation is scheduled for ${consultationData.scheduledTime}`;

      await this.emailService.sendEmail(
        consultationData.userEmail,
        subject,
        body,
      );

      this.logger.log(`Consultation reminder sent for user ${userId}`, {
        service: "NotificationService",
        method: "sendConsultationReminder",
        userId,
      });
    } catch (error) {
      this.logger.error(
        "Failed to send consultation reminder:",
        error instanceof Error ? error.stack : "Unknown error",
        {
          service: "NotificationService",
          method: "sendConsultationReminder",
          userId,
        },
      );
    }
  }

  /**
   * Send welcome notification for new users
   */
  async sendWelcomeNotification(userId: string, userData: any): Promise<void> {
    try {
      const subject = "Welcome to Borzolini Service!";
      const body = `Welcome ${userData.name}! We're excited to help you take care of your pets.`;

      await this.emailService.sendEmail(userData.email, subject, body);

      this.logger.log(`Welcome notification sent for user ${userId}`, {
        service: "NotificationService",
        method: "sendWelcomeNotification",
        userId,
      });
    } catch (error) {
      this.logger.error(
        "Failed to send welcome notification:",
        error instanceof Error ? error.stack : "Unknown error",
        {
          service: "NotificationService",
          method: "sendWelcomeNotification",
          userId,
        },
      );
    }
  }

  /**
   * Send AI health insight notification
   */
  async sendAiHealthInsight(userId: string, insightData: any): Promise<void> {
    try {
      const subject = "AI Health Insight for Your Pet";
      const body = `New health insight: ${insightData.message}`;

      await this.emailService.sendEmail(insightData.userEmail, subject, body);

      this.logger.log(`AI health insight sent for user ${userId}`, {
        service: "NotificationService",
        method: "sendAiHealthInsight",
        userId,
      });
    } catch (error) {
      this.logger.error(
        "Failed to send AI health insight:",
        error instanceof Error ? error.stack : "Unknown error",
        {
          service: "NotificationService",
          method: "sendAiHealthInsight",
          userId,
        },
      );
    }
  }
}
