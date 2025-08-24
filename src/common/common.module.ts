import { APP_INTERCEPTOR } from '@nestjs/core';
import { CommonService } from './common.service';
import { DatabaseInitInterceptor } from './database-init.interceptor';
import { DatabaseService } from './database.service';
import { EmailService } from './email.service';
import { FileUploadService } from './file-upload.service';
import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ServiceHealthService } from './service-health.service';
import { SmsService } from './sms.service';
import { SupabaseModule } from './supabase.module';
import { LocalStorageModule } from './local-storage.module';

@Module({
  imports: [SupabaseModule, LocalStorageModule],
  providers: [
    CommonService,
    DatabaseService,
    EmailService,
    FileUploadService,
    NotificationService,
    SmsService,
    ServiceHealthService,
    {
      provide: APP_INTERCEPTOR,
      useClass: DatabaseInitInterceptor,
    },
  ],
  exports: [CommonService, DatabaseService, EmailService, FileUploadService, NotificationService, SmsService, ServiceHealthService],
})
export class CommonModule {}
