import { Injectable, Logger } from '@nestjs/common';
import { AppointmentSettings, GeneralSettings, NotificationSettings, SecuritySettings } from './entities/settings.entity';
import { SettingsService } from './settings.service';

@Injectable()
export class SettingsConfigService {
  private readonly logger = new Logger(SettingsConfigService.name);
  private cachedSettings: {
    general: GeneralSettings;
    notifications: NotificationSettings;
    appointments: AppointmentSettings;
    security: SecuritySettings;
  } | null = null;
  private lastCacheUpdate: Date | null = null;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(private readonly settingsService: SettingsService) {}

  /**
   * Get cached settings or fetch from database
   */
  private async getCachedSettings() {
    const now = new Date();

    if (!this.cachedSettings || !this.lastCacheUpdate || now.getTime() - this.lastCacheUpdate.getTime() > this.CACHE_TTL) {
      try {
        const activeSettings = await this.settingsService.findActive();
        this.cachedSettings = {
          general: activeSettings.generalSettings,
          notifications: activeSettings.notificationSettings,
          appointments: activeSettings.appointmentSettings,
          security: activeSettings.securitySettings,
        };
        this.lastCacheUpdate = now;
        this.logger.debug('Settings cache updated');
      } catch (error) {
        this.logger.error('Failed to fetch settings, using defaults', error);
        // Fallback to default values
        this.cachedSettings = {
          general: {
            clinicName: 'Borzolini Veterinary Clinic',
            currency: 'USD',
            timezone: 'America/New_York',
            businessHours: '8:00 AM - 6:00 PM',
          },
          notifications: {
            enableNotifications: true,
            emailNotifications: true,
            smsNotifications: false,
            notificationEmail: 'admin@clinic.com',
          },
          appointments: {
            defaultAppointmentDuration: 30,
            bookingLeadTime: 24,
            cancellationPolicy: 24,
            maxAppointmentsPerDay: 50,
          },
          security: {
            sessionTimeout: 30,
            passwordExpiry: 90,
            twoFactorAuthentication: false,
          },
        };
      }
    }

    return this.cachedSettings;
  }

  /**
   * Clear settings cache (call when settings are updated)
   */
  clearCache(): void {
    this.cachedSettings = null;
    this.lastCacheUpdate = null;
    this.logger.debug('Settings cache cleared');
  }

  // General Settings
  async getClinicName(): Promise<string> {
    const settings = await this.getCachedSettings();
    return settings.general.clinicName;
  }

  async getCurrency(): Promise<string> {
    const settings = await this.getCachedSettings();
    return settings.general.currency;
  }

  async getTimezone(): Promise<string> {
    const settings = await this.getCachedSettings();
    return settings.general.timezone;
  }

  async getBusinessHours(): Promise<string> {
    const settings = await this.getCachedSettings();
    return settings.general.businessHours;
  }

  // Notification Settings
  async areNotificationsEnabled(): Promise<boolean> {
    const settings = await this.getCachedSettings();
    return settings.notifications.enableNotifications;
  }

  async areEmailNotificationsEnabled(): Promise<boolean> {
    const settings = await this.getCachedSettings();
    return settings.notifications.emailNotifications;
  }

  async areSmsNotificationsEnabled(): Promise<boolean> {
    const settings = await this.getCachedSettings();
    return settings.notifications.smsNotifications;
  }

  async getNotificationEmail(): Promise<string> {
    const settings = await this.getCachedSettings();
    return settings.notifications.notificationEmail;
  }

  // Appointment Settings
  async getDefaultAppointmentDuration(): Promise<number> {
    const settings = await this.getCachedSettings();
    return settings.appointments.defaultAppointmentDuration;
  }

  async getBookingLeadTime(): Promise<number> {
    const settings = await this.getCachedSettings();
    return settings.appointments.bookingLeadTime;
  }

  async getCancellationPolicy(): Promise<number> {
    const settings = await this.getCachedSettings();
    return settings.appointments.cancellationPolicy;
  }

  async getMaxAppointmentsPerDay(): Promise<number> {
    const settings = await this.getCachedSettings();
    return settings.appointments.maxAppointmentsPerDay;
  }

  // Security Settings
  async getSessionTimeout(): Promise<number> {
    const settings = await this.getCachedSettings();
    return settings.security.sessionTimeout;
  }

  async getPasswordExpiry(): Promise<number> {
    const settings = await this.getCachedSettings();
    return settings.security.passwordExpiry;
  }

  async isTwoFactorAuthenticationEnabled(): Promise<boolean> {
    const settings = await this.getCachedSettings();
    return settings.security.twoFactorAuthentication;
  }

  // Validation helpers
  async canBookAppointment(requestedDate: Date): Promise<{ canBook: boolean; reason?: string }> {
    const bookingLeadTime = await this.getBookingLeadTime();
    const now = new Date();
    const minBookingTime = new Date(now.getTime() + bookingLeadTime * 60 * 60 * 1000);

    if (requestedDate < minBookingTime) {
      return {
        canBook: false,
        reason: `Appointments must be booked at least ${bookingLeadTime} hours in advance`,
      };
    }

    return { canBook: true };
  }

  async canCancelAppointment(appointmentDate: Date): Promise<{ canCancel: boolean; reason?: string }> {
    const cancellationPolicy = await this.getCancellationPolicy();
    const now = new Date();
    const maxCancellationTime = new Date(appointmentDate.getTime() - cancellationPolicy * 60 * 60 * 1000);

    if (now > maxCancellationTime) {
      return {
        canCancel: false,
        reason: `Appointments can only be cancelled at least ${cancellationPolicy} hours in advance`,
      };
    }

    return { canCancel: true };
  }

  async getDailyAppointmentLimit(): Promise<number> {
    return await this.getMaxAppointmentsPerDay();
  }
}
