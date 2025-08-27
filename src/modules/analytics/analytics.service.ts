import { Injectable, Logger } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { Umami } from '@umami/node';

export interface TrackEventOptions {
  eventName: string;
  eventData?: Record<string, any>;
  url?: string;
  referrer?: string;
  userAgent?: string;
  ip?: string;
}

export interface TrackPageViewOptions {
  url: string;
  referrer?: string;
  userAgent?: string;
  ip?: string;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private umami: Umami | null = null;
  private readonly isEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isEnabled = this.configService.get<boolean>('UMAMI_ENABLED', false);

    if (this.isEnabled) {
      const websiteId = this.configService.get<string>('UMAMI_WEBSITE_ID');
      const apiUrl = this.configService.get<string>('UMAMI_API_URL');

      if (!websiteId || !apiUrl) {
        this.logger.warn('Umami analytics not properly configured. Missing UMAMI_WEBSITE_ID or UMAMI_API_URL');
        return;
      }

      try {
        this.umami = new Umami({
          websiteId,
          baseUrl: apiUrl.replace('/api/collect', ''),
        } as any);
        this.logger.log('Umami analytics service initialized successfully');
      } catch (error) {
        this.logger.error('Failed to initialize Umami analytics service', error);
      }
    } else {
      this.logger.log('Umami analytics is disabled');
    }
  }

  /**
   * Track a custom event
   */
  async trackEvent(options: TrackEventOptions): Promise<void> {
    if (!this.isEnabled || !this.umami) {
      this.logger.debug('Analytics disabled or not initialized, skipping event tracking');
      return;
    }

    try {
      await this.umami.track(options.eventName, options.eventData || {});
      
      this.logger.debug(`Event tracked: ${options.eventName}`);
    } catch (error) {
      this.logger.error(`Failed to track event: ${options.eventName}`, error);
    }
  }

  /**
   * Track a page view
   */
  async trackPageView(options: TrackPageViewOptions): Promise<void> {
    if (!this.isEnabled || !this.umami) {
      this.logger.debug('Analytics disabled or not initialized, skipping page view tracking');
      return;
    }

    try {
      await this.umami.track('pageview', { 
        url: options.url,
        referrer: options.referrer,
        userAgent: options.userAgent,
        ip: options.ip,
      } as any);
      
      this.logger.debug(`Page view tracked: ${options.url}`);
    } catch (error) {
      this.logger.error(`Failed to track page view: ${options.url}`, error);
    }
  }

  /**
   * Track user authentication events
   */
  async trackAuthEvent(eventType: 'login' | 'logout' | 'register' | 'password_reset', userId?: string): Promise<void> {
    await this.trackEvent({
      eventName: `auth_${eventType}`,
      eventData: {
        userId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Track appointment-related events
   */
  async trackAppointmentEvent(eventType: 'created' | 'updated' | 'cancelled' | 'completed', appointmentId: string, clinicId?: string): Promise<void> {
    await this.trackEvent({
      eventName: `appointment_${eventType}`,
      eventData: {
        appointmentId,
        clinicId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Track pet health monitoring events
   */
  async trackHealthEvent(eventType: 'checkup' | 'vaccination' | 'emergency' | 'ai_insight', petId: string, clinicId?: string): Promise<void> {
    await this.trackEvent({
      eventName: `health_${eventType}`,
      eventData: {
        petId,
        clinicId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Track clinic management events
   */
  async trackClinicEvent(eventType: 'created' | 'updated' | 'service_added' | 'staff_added', clinicId: string): Promise<void> {
    await this.trackEvent({
      eventName: `clinic_${eventType}`,
      eventData: {
        clinicId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Check if analytics is enabled
   */
  isAnalyticsEnabled(): boolean {
    return this.isEnabled && this.umami !== null;
  }

  /**
   * Get analytics configuration status
   */
  getAnalyticsStatus(): {
    enabled: boolean;
    configured: boolean;
    websiteId?: string;
    apiUrl?: string;
  } {
    const websiteId = this.configService.get<string>('UMAMI_WEBSITE_ID');
    const apiUrl = this.configService.get<string>('UMAMI_API_URL');
    
    const result: {
      enabled: boolean;
      configured: boolean;
      websiteId?: string;
      apiUrl?: string;
    } = {
      enabled: this.isEnabled,
      configured: this.umami !== null,
    };

    if (websiteId) result.websiteId = websiteId;
    if (apiUrl) result.apiUrl = apiUrl;
    
    return result;
  }
}
