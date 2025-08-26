import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isLocal = configService.get("USE_LOCAL_DB", "true") === "true";

  if (isLocal) {
    // Local PostgreSQL configuration
    return {
      type: "postgres",
      host: configService.get("LOCAL_DB_HOST", "localhost"),
      port: configService.get("LOCAL_DB_PORT", 5432),
      username: configService.get("LOCAL_DB_USERNAME", "postgres"),
      password: configService.get("LOCAL_DB_PASSWORD", "postgres"),
      database: configService.get("LOCAL_DB_NAME", "borzolini_clinic"),
      entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
      synchronize: configService.get("NODE_ENV") === "development", // Enable for local development
      logging: configService.get("NODE_ENV") === "development",
      // Migration settings
      migrations: [`${__dirname}/../database/migrations/*{.ts,.js}`],
      migrationsRun: false,
      migrationsTableName: "migrations",
      // Entity loading optimization
      autoLoadEntities: true,
      // Connection settings
      retryAttempts: 3,
      retryDelay: 1000,
      // Query optimization
      cache: {
        duration: 30000,
      },
    };
  } else {
    // Supabase PostgreSQL configuration
    return {
      type: "postgres",
      url: `postgresql://${configService.get("SUPABASE_DB_USERNAME")}:${configService.get("SUPABASE_DB_PASSWORD")}@${configService.get("SUPABASE_DB_HOST")}:${configService.get("SUPABASE_DB_PORT")}/${configService.get("SUPABASE_DB_NAME")}`,
      entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
      synchronize: false, // Disable synchronize to prevent data loss
      logging: configService.get("NODE_ENV") === "development",
      ssl: {
        rejectUnauthorized: false,
      },
      // Connection management and retry logic
      retryAttempts: 5,
      retryDelay: 3000,
      // Health check and monitoring
      keepConnectionAlive: true,
      // Migration settings
      migrations: [`${__dirname}/../database/migrations/*{.ts,.js}`],
      migrationsRun: false,
      migrationsTableName: "migrations",
      // Entity loading optimization
      autoLoadEntities: true,
      // Query optimization
      cache: {
        duration: 30000,
      },
    };
  }
};
