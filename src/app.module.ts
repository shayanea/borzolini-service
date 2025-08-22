import { AiHealthModule } from './modules/ai-health/ai-health.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
// Core modules
import { AuthModule } from './modules/auth/auth.module';
import { ClinicsModule } from './modules/clinics/clinics.module';
// Common modules
import { CommonModule } from './common/common.module';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Module } from '@nestjs/common';
import { PaymentsModule } from './modules/payments/payments.module';
import { PetsModule } from './modules/pets/pets.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SocialMediaModule } from './modules/social-media/social-media.module';
import { SupabaseModule } from './common/supabase.module';
import { TelemedicineModule } from './modules/telemedicine/telemedicine.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database - Supabase PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.SUPABASE_DB_HOST,
      port: parseInt(process.env.SUPABASE_DB_PORT) || 5432,
      username: process.env.SUPABASE_DB_USERNAME || 'postgres',
      password: process.env.SUPABASE_DB_PASSWORD,
      database: process.env.SUPABASE_DB_NAME || 'postgres',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
      ssl: {
        rejectUnauthorized: false,
      },
      extra: {
        connectionString: process.env.SUPABASE_DB_HOST,
        ssl: {
          rejectUnauthorized: false,
        },
      },
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Scheduling for AI health monitoring
    ScheduleModule.forRoot(),

    // Event emitter for async operations
    EventEmitterModule.forRoot(),

    // Supabase integration
    SupabaseModule,

    // Feature modules
    AuthModule,
    UsersModule,
    ClinicsModule,
    PetsModule,
    AppointmentsModule,
    TelemedicineModule,
    AiHealthModule,
    SocialMediaModule,
    PaymentsModule,

    // Common utilities
    CommonModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
