// Common modules
import { CommonModule } from './common/common.module';
import { ConfigModule } from '@nestjs/config';
// Core modules
import { HealthModule } from './modules/health/health.module';
import { Module } from '@nestjs/common';
import { SupabaseModule } from './common/supabase.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database - Supabase PostgreSQL (Transaction Pooler - IPv4 compatible)
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: `postgresql://${process.env.SUPABASE_DB_USERNAME}:${process.env.SUPABASE_DB_PASSWORD}@${process.env.SUPABASE_DB_HOST}:${process.env.SUPABASE_DB_PORT}/${process.env.SUPABASE_DB_NAME}`,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
      ssl: {
        rejectUnauthorized: false,
      },
    }),

    // Basic configuration only for now

    // Supabase integration
    SupabaseModule,

    // Health check module
    HealthModule,

    // Feature modules (to be implemented)
    // AuthModule,
    // UsersModule,
    // ClinicsModule,
    // PetsModule,
    // AppointmentsModule,
    // TelemedicineModule,
    // AiHealthModule,
    // SocialMediaModule,
    // PaymentsModule,

    // Common utilities
    CommonModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
