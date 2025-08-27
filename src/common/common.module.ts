import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CommonService } from './common.service';
import { RateLimitMonitorController } from './controllers/rate-limit-monitor.controller';
import { DatabaseInitInterceptor } from './database-init.interceptor';
import { DatabaseService } from './database.service';
import { EmailService } from './email.service';
import { FileUploadService } from './file-upload.service';
import { RateLimitInterceptor } from './interceptors/rate-limit.interceptor';
import { LocalStorageModule } from './local-storage.module';
import { LoggerService } from './logger.service';
import { NotificationService } from './notification.service';
import { ServiceHealthService } from './service-health.service';
import { RateLimitMonitorService } from './services/rate-limit-monitor.service';
import { SmsService } from './sms.service';
import { SupabaseModule } from './supabase.module';

@Module({
  imports: [SupabaseModule, LocalStorageModule],
  controllers: [RateLimitMonitorController],
  providers: [
    CommonService,
    DatabaseService,
    EmailService,
    FileUploadService,
    LoggerService,
    NotificationService,
    SmsService,
    ServiceHealthService,
    RateLimitMonitorService,
    {
      provide: APP_INTERCEPTOR,
      useClass: DatabaseInitInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RateLimitInterceptor,
    },
  ],
  exports: [CommonService, DatabaseService, EmailService, FileUploadService, LoggerService, NotificationService, SmsService, ServiceHealthService, RateLimitMonitorService],
})
export class CommonModule {}
