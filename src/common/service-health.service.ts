import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { DatabaseService } from './database.service';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { SupabaseService } from './supabase.service';

export interface ServiceHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  message: string;
  timestamp: Date;
  details?: any;
}

export interface OverallHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  services: ServiceHealth[];
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
    unknown: number;
  };
}

@Injectable()
export class ServiceHealthService implements OnModuleInit {
  private readonly logger = new Logger(ServiceHealthService.name);
  private isInitialized = false;
  private services: Map<string, any> = new Map();

  constructor(
    private databaseService: DatabaseService,
    private supabaseService: SupabaseService,
    private emailService: EmailService,
    private smsService: SmsService
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing Service Health service...');

    try {
      // Register all services
      this.registerService('database', this.databaseService);
      this.registerService('supabase', this.supabaseService);
      this.registerService('email', this.emailService);
      this.registerService('sms', this.smsService);

      this.isInitialized = true;
      this.logger.log('Service Health service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Service Health service:', error);
      throw error;
    }
  }

  private registerService(name: string, service: any): void {
    this.services.set(name, service);
    this.logger.log(`Registered service: ${name}`);
  }

  /**
   * Check health of all registered services
   */
  async checkAllServices(): Promise<OverallHealth> {
    if (!this.isInitialized) {
      throw new Error('Service Health service not initialized');
    }

    const serviceHealths: ServiceHealth[] = [];
    const checks = Array.from(this.services.entries()).map(([name, service]) => this.checkServiceHealth(name, service));

    try {
      const results = await Promise.allSettled(checks);

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          serviceHealths.push(result.value);
        } else {
          const serviceName = Array.from(this.services.keys())[index];
          serviceHealths.push({
            service: serviceName!,
            status: 'unhealthy',
            message: `Health check failed: ${result.reason?.message || 'Unknown error'}`,
            timestamp: new Date(),
          });
        }
      });

      return this.calculateOverallHealth(serviceHealths);
    } catch (error) {
      this.logger.error('Failed to check service health:', error);
      throw error;
    }
  }

  /**
   * Check health of a specific service
   */
  private async checkServiceHealth(serviceName: string, service: any): Promise<ServiceHealth> {
    try {
      let status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown' = 'unknown';
      let message = 'Service health unknown';
      let details: any = {};

      switch (serviceName) {
        case 'database':
          const dbHealth = await this.databaseService.checkHealth();
          status = dbHealth.status;
          message = dbHealth.message;
          details = {
            connectionCount: dbHealth.connectionCount,
            isConnected: dbHealth.isConnected,
          };
          break;

        case 'supabase':
          if (service.isServiceReady && service.isServiceReady()) {
            const supabaseStatus = service.getServiceStatus();
            status = supabaseStatus.isInitialized ? 'healthy' : 'unhealthy';
            message = supabaseStatus.isInitialized ? 'Supabase service ready' : 'Supabase service not initialized';
            details = supabaseStatus;
          } else {
            status = 'unhealthy';
            message = 'Supabase service not available';
          }
          break;

        case 'email':
          if (service.isServiceReady && service.isServiceReady()) {
            const emailStatus = service.getServiceStatus();
            status = emailStatus.isInitialized ? 'healthy' : 'degraded';
            message = emailStatus.isInitialized ? 'Email service ready' : 'Email service in mock mode';
            details = emailStatus;
          } else {
            status = 'unhealthy';
            message = 'Email service not available';
          }
          break;

        case 'sms':
          if (service.isServiceReady && service.isServiceReady()) {
            const smsStatus = service.getServiceStatus();
            status = smsStatus.isInitialized ? 'healthy' : 'degraded';
            message = smsStatus.isInitialized ? 'SMS service ready' : 'SMS service in mock mode';
            details = smsStatus;
          } else {
            status = 'unhealthy';
            message = 'SMS service not available';
          }
          break;

        default:
          status = 'unknown';
          message = `Unknown service: ${serviceName}`;
      }

      return {
        service: serviceName,
        status,
        message,
        timestamp: new Date(),
        details,
      };
    } catch (error) {
      this.logger.error(`Failed to check health of ${serviceName}:`, error);
      return {
        service: serviceName,
        status: 'unhealthy',
        message: `Health check error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  /**
   * Calculate overall health status
   */
  private calculateOverallHealth(serviceHealths: ServiceHealth[]): OverallHealth {
    const summary = {
      total: serviceHealths.length,
      healthy: serviceHealths.filter((s) => s.status === 'healthy').length,
      degraded: serviceHealths.filter((s) => s.status === 'degraded').length,
      unhealthy: serviceHealths.filter((s) => s.status === 'unhealthy').length,
      unknown: serviceHealths.filter((s) => s.status === 'unknown').length,
    };

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (summary.unhealthy > 0) {
      overallStatus = 'unhealthy';
    } else if (summary.degraded > 0 || summary.unknown > 0) {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      timestamp: new Date(),
      services: serviceHealths,
      summary,
    };
  }

  /**
   * Get health status of a specific service
   */
  async getServiceHealth(serviceName: string): Promise<ServiceHealth | null> {
    if (!this.isInitialized) {
      throw new Error('Service Health service not initialized');
    }

    const service = this.services.get(serviceName);
    if (!service) {
      return null;
    }

    return this.checkServiceHealth(serviceName, service);
  }

  /**
   * Check if all critical services are healthy
   */
  async areCriticalServicesHealthy(): Promise<boolean> {
    const health = await this.checkAllServices();
    return health.status === 'healthy';
  }

  /**
   * Get list of all registered services
   */
  getRegisteredServices(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Check if service health service is ready
   */
  isServiceReady(): boolean {
    return this.isInitialized;
  }
}
