import { ConfigModule, ConfigService } from "@nestjs/config";

import { AiHealthModule } from "./modules/ai-health/ai-health.module";
import { AppointmentsModule } from "./modules/appointments/appointments.module";
// Feature modules
import { AuthModule } from "./modules/auth/auth.module";
import { ClinicsModule } from "./modules/clinics/clinics.module";
// Common modules
import { CommonModule } from "./common/common.module";
// Core modules
import { HealthModule } from "./modules/health/health.module";
import { Module } from "@nestjs/common";
import { PetsModule } from "./modules/pets/pets.module";
import { SupabaseModule } from "./common/supabase.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "./modules/users/users.module";
import { getDatabaseConfig } from "./config/database.config";

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),

    // Database - Local PostgreSQL or Supabase (configurable)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),

    // Basic configuration only for now

    // Supabase integration
    SupabaseModule,

    // Health check module
    HealthModule,

    // Feature modules
    AuthModule,
    UsersModule,
    ClinicsModule,
    PetsModule,
    AppointmentsModule,
    AiHealthModule,
    // TelemedicineModule,
    // SocialMediaModule,
    // PaymentsModule,

    // Common utilities
    CommonModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
