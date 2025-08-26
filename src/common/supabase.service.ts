import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { SupabaseClient, createClient } from "@supabase/supabase-js";

import { ConfigService } from "@nestjs/config";

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase!: SupabaseClient;
  private supabaseAdmin!: SupabaseClient;
  private readonly logger = new Logger(SupabaseService.name);
  private isInitialized = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.logger.log("Initializing Supabase service...");

    try {
      await this.validateConfiguration();
      await this.initializeClients();
      await this.testConnection();

      this.isInitialized = true;
      this.logger.log("Supabase service initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize Supabase service:", error);
      throw error;
    }
  }

  private async validateConfiguration(): Promise<void> {
    const requiredVars = ["SUPABASE_URL", "SUPABASE_ANON_KEY"];
    const missingVars: string[] = [];

    for (const varName of requiredVars) {
      const value = this.configService.get(varName);
      if (!value) {
        missingVars.push(varName);
      }
    }

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(", ")}`,
      );
    }

    // Validate URL format
    const supabaseUrl = this.configService.get<string>("SUPABASE_URL");
    try {
      new URL(supabaseUrl!);
    } catch (error) {
      throw new Error(`Invalid SUPABASE_URL format: ${supabaseUrl}`);
    }

    this.logger.log("Supabase configuration validated successfully");
  }

  private async initializeClients(): Promise<void> {
    const supabaseUrl = this.configService.get<string>("SUPABASE_URL")!;
    const supabaseAnonKey =
      this.configService.get<string>("SUPABASE_ANON_KEY")!;
    const supabaseServiceRoleKey = this.configService.get<string>(
      "SUPABASE_SERVICE_ROLE_KEY",
    );

    try {
      this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: false,
          detectSessionInUrl: false,
        },
        db: {
          schema: "public",
        },
        global: {
          headers: {
            "x-application-name": "borzolini-clinic-api",
          },
        },
      });

      if (supabaseServiceRoleKey) {
        this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
          },
          db: {
            schema: "public",
          },
        });
        this.logger.log("Supabase admin client initialized");
      } else {
        this.logger.warn(
          "SUPABASE_SERVICE_ROLE_KEY not provided, admin client not available",
        );
      }

      this.logger.log("Supabase clients initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize Supabase clients:", error);
      throw new Error(
        `Failed to create Supabase clients: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  getClient(): SupabaseClient {
    if (!this.isInitialized) {
      throw new Error(
        "Supabase service not initialized. Wait for onModuleInit to complete.",
      );
    }
    return this.supabase;
  }

  getAdminClient(): SupabaseClient {
    if (!this.isInitialized) {
      throw new Error(
        "Supabase service not initialized. Wait for onModuleInit to complete.",
      );
    }

    if (!this.supabaseAdmin) {
      throw new Error(
        "Supabase admin client not configured. Set SUPABASE_SERVICE_ROLE_KEY environment variable.",
      );
    }
    return this.supabaseAdmin;
  }

  async testConnection(): Promise<boolean> {
    if (!this.isInitialized) {
      return false;
    }

    try {
      const { error } = await this.supabase.from("users").select("id").limit(1);

      if (error) {
        // Ignore table not found errors as they indicate connection is working
        if (error.code === "42P01") {
          return true;
        }
        this.logger.error("Supabase connection test failed:", error);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error("Supabase connection test error:", error);
      return false;
    }
  }

  async getTableInfo(tableName: string): Promise<any> {
    if (!this.isInitialized) {
      throw new Error("Supabase service not initialized");
    }

    try {
      const { data, error } = await this.supabase
        .from(tableName)
        .select("*")
        .limit(1);

      if (error) {
        throw error;
      }

      return {
        tableName,
        hasData: data && data.length > 0,
        sampleData: data?.[0] || null,
      };
    } catch (error) {
      this.logger.error(`Error getting table info for ${tableName}:`, error);
      throw error;
    }
  }

  isServiceReady(): boolean {
    return this.isInitialized;
  }

  getServiceStatus(): {
    isInitialized: boolean;
    hasAdminClient: boolean;
    url: string;
  } {
    return {
      isInitialized: this.isInitialized,
      hasAdminClient: !!this.supabaseAdmin,
      url: this.configService.get("SUPABASE_URL") || "not configured",
    };
  }
}
