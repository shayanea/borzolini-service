import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase.service';

@Injectable()
export class HealthService {
  constructor(private supabaseService: SupabaseService) {}

  async checkHealth() {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        supabase: 'unknown',
        database: 'unknown',
      },
      uptime: process.uptime(),
    };

    try {
      // Test Supabase connection
      const supabaseClient = this.supabaseService.getClient();
      if (supabaseClient) {
        health.services.supabase = 'connected';
      }

      // Test database connection
      const dbConnection = await this.supabaseService.testConnection();
      health.services.database = dbConnection ? 'connected' : 'disconnected';

      if (health.services.database === 'disconnected') {
        health.status = 'degraded';
      }
    } catch (error) {
      health.status = 'error';
      health.services.supabase = 'error';
      health.services.database = 'error';
    }

    return health;
  }

  async checkDatabase(): Promise<any> {
    try {
      const isConnected = await this.supabaseService.testConnection();
      return {
        status: isConnected ? 'up' : 'down',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'down',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async checkStorage(): Promise<any> {
    try {
      // For now, just check if Supabase client is available
      this.supabaseService.getClient();
      return {
        status: 'up',
        timestamp: new Date().toISOString(),
        message: 'Supabase client available',
      };
    } catch (error) {
      return {
        status: 'down',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async getDatabaseInfo() {
    try {
      return {
        supabaseUrl: process.env.SUPABASE_URL,
        hasCredentials: !!(process.env.SUPABASE_ANON_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY),
        message: 'Database info simplified - use checkDatabase() for connection status',
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
