import { DatabaseService } from "../../common/database.service";
import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../../common/supabase.service";

@Injectable()
export class HealthService {
  constructor(
    private supabaseService: SupabaseService,
    private databaseService: DatabaseService,
  ) {}

  async checkHealth() {
    const health = {
      status: "ok",
      timestamp: new Date().toISOString(),
      services: {
        supabase: "unknown",
        database: "unknown",
        typeorm: "unknown",
      },
      uptime: process.uptime(),
    };

    try {
      // Test Supabase connection
      const supabaseClient = this.supabaseService.getClient();
      if (supabaseClient) {
        health.services.supabase = "connected";
      }

      // Test database connection using enhanced database service
      const dbHealth = await this.databaseService.checkHealth();
      health.services.database =
        dbHealth.status === "healthy" ? "connected" : "disconnected";
      health.services.typeorm =
        dbHealth.status === "healthy" ? "connected" : "disconnected";

      // Update overall status based on service health
      if (
        health.services.database === "disconnected" ||
        health.services.typeorm === "disconnected"
      ) {
        health.status = "degraded";
      }

      if (
        health.services.database === "disconnected" &&
        health.services.typeorm === "disconnected"
      ) {
        health.status = "error";
      }
    } catch (error) {
      health.status = "error";
      health.services.supabase = "error";
      health.services.database = "error";
      health.services.typeorm = "error";
    }

    return health;
  }

  async checkDatabase(): Promise<any> {
    try {
      const health = await this.databaseService.checkHealth();
      return {
        status: health.status === "healthy" ? "up" : "down",
        timestamp: health.timestamp,
        message: health.message,
        connectionCount: health.connectionCount,
        isConnected: health.isConnected,
      };
    } catch (error) {
      return {
        status: "down",
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
        status: "up",
        timestamp: new Date().toISOString(),
        message: "Supabase client available",
      };
    } catch (error) {
      return {
        status: "down",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async getDatabaseInfo() {
    try {
      const connectionStats = await this.databaseService.getConnectionStats();
      const health = await this.databaseService.checkHealth();

      return {
        supabaseUrl: process.env.SUPABASE_URL,
        hasCredentials: !!(
          process.env.SUPABASE_ANON_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY
        ),
        connectionHealth: health,
        connectionStats,
        message: "Database info with enhanced monitoring",
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async getDetailedHealth() {
    try {
      const [dbHealth, connectionStats] = await Promise.all([
        this.databaseService.checkHealth(),
        this.databaseService.getConnectionStats(),
      ]);

      return {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
          health: dbHealth,
          stats: connectionStats,
        },
        supabase: {
          status: "connected", // Basic check
          url: process.env.SUPABASE_URL,
        },
        environment: {
          nodeEnv: process.env.NODE_ENV || "development",
          port: process.env.PORT || 3001,
        },
      };
    } catch (error) {
      return {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
