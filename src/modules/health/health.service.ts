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

  async getDatabaseInfo() {
    try {
      const dbUrl = this.supabaseService.getDatabaseUrl();
      const storageBucket = this.supabaseService.getStorageBucket();
      
      return {
        databaseUrl: dbUrl.replace(/\/\/.*@/, '//***:***@'), // Hide credentials
        storageBucket,
        supabaseUrl: process.env.SUPABASE_URL,
        hasCredentials: !!(process.env.SUPABASE_ANON_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY),
      };
    } catch (error) {
      return {
        error: error.message,
      };
    }
  }
}
