import { ConfigModule, ConfigService } from '@nestjs/config';

import { AiHealthModule } from './modules/ai-health/ai-health.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { BreedsModule } from './modules/breeds/breeds.module';
import { ClinicsModule } from './modules/clinics/clinics.module';
// Common modules
import { CommonModule } from './common/common.module';
import { ContactModule } from './modules/contact/contact.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { FaqModule } from './modules/faq/faq.module';
import { HealthModule } from './modules/health/health.module';
// Core modules
import { Module } from '@nestjs/common';
import { PetsModule } from './modules/pets/pets.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { ScheduleModule } from '@nestjs/schedule';
// import { ScheduledTasksModule } from './modules/scheduled-tasks/scheduled-tasks.module';
import { SettingsModule } from './modules/settings/settings.module';
import { SocialMediaModule } from './modules/social-media/social-media.module';
import { SupabaseModule } from './common/supabase.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { getDatabaseConfig } from './config/database.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database - Local PostgreSQL or Supabase (configurable)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get('RATE_LIMIT_TTL', 60000),
            limit: config.get('RATE_LIMIT_LIMIT', 100),
          },
        ],
      }),
    }),

    // Scheduling for cron jobs and automated tasks
    ScheduleModule.forRoot(),

    // Supabase integration
    SupabaseModule,

    // Health check module
    HealthModule,

    // Analytics module
    AnalyticsModule,

    // Feature modules
    AuthModule,
    UsersModule,
    BreedsModule,
    ClinicsModule,
    ContactModule,
    DashboardModule,
    FaqModule,
    PetsModule,
    AppointmentsModule,
    AiHealthModule,
    ReviewsModule,
    // ScheduledTasksModule,
    SettingsModule,
    SocialMediaModule,
    // TelemedicineModule,
    // PaymentsModule,

    // Common utilities
    CommonModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
