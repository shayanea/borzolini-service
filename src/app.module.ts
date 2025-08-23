import { ConfigModule, ConfigService } from '@nestjs/config';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { ClinicsModule } from './modules/clinics/clinics.module';
// Common modules
import { CommonModule } from './common/common.module';
// Core modules
import { HealthModule } from './modules/health/health.module';
import { Module } from '@nestjs/common';
import { SupabaseModule } from './common/supabase.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database - Supabase PostgreSQL (Transaction Pooler - IPv4 compatible)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: `postgresql://${configService.get('SUPABASE_DB_USERNAME')}:${configService.get('SUPABASE_DB_PASSWORD')}@${configService.get('SUPABASE_DB_HOST')}:${configService.get('SUPABASE_DB_PORT')}/${configService.get('SUPABASE_DB_NAME')}`,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // Disable synchronize to prevent data loss and race conditions
        logging: configService.get('NODE_ENV') === 'development',
        ssl: {
          rejectUnauthorized: false,
        },
        // Connection management and retry logic
        retryAttempts: 5,
        retryDelay: 3000,
        maxRetryAttempts: 5,
        acquireTimeout: 60000,
        timeout: 60000,
        // Connection pool settings
        extra: {
          connectionLimit: 10,
          acquireTimeout: 60000,
          timeout: 60000,
          reconnect: true,
        },
        // Health check and monitoring
        keepConnectionAlive: true,
        // Migration settings
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        migrationsRun: false,
        migrationsTableName: 'migrations',
        // Entity loading optimization
        autoLoadEntities: true,
        // Query optimization
        cache: {
          duration: 30000,
        },
      }),
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
