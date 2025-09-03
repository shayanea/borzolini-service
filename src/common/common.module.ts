import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SettingsConfigModule } from '../modules/settings/settings-config.module';
import { CommonService } from './common.service';
import { ElasticsearchHealthController } from './controllers/elasticsearch-health.controller';
import { ElasticsearchManagementController } from './controllers/elasticsearch-management.controller';
import { ElasticsearchSearchController } from './controllers/elasticsearch-search.controller';
import { RateLimitMonitorController } from './controllers/rate-limit-monitor.controller';
import { DatabaseInitInterceptor } from './database-init.interceptor';
import { DatabaseService } from './database.service';
import { ElasticsearchModule } from './elasticsearch.module';
import { EmailService } from './email.service';
import { FileUploadService } from './file-upload.service';
import { RateLimitInterceptor } from './interceptors/rate-limit.interceptor';
import { LocalStorageModule } from './local-storage.module';
import { LoggerService } from './logger.service';
import { NotificationService } from './notification.service';
import { ServiceHealthService } from './service-health.service';
import { ElasticsearchIndexService } from './services/elasticsearch-index.service';
import { ElasticsearchSearchService } from './services/elasticsearch-search.service';
import { ElasticsearchSyncService } from './services/elasticsearch-sync.service';
import { ExportService } from './services/export.service';
import { RateLimitMonitorService } from './services/rate-limit-monitor.service';
import { SmsService } from './sms.service';
import { SupabaseModule } from './supabase.module';
import { ActivityLoggerUtils } from './utils/activity-logger.utils';

@Module({
  imports: [SupabaseModule, LocalStorageModule, ElasticsearchModule, SettingsConfigModule],
  controllers: [RateLimitMonitorController, ElasticsearchHealthController, ElasticsearchSearchController, ElasticsearchManagementController],
  providers: [
    CommonService,
    DatabaseService,
    EmailService,
    ExportService,
    FileUploadService,
    LoggerService,
    NotificationService,
    SmsService,
    ServiceHealthService,
    RateLimitMonitorService,
    ElasticsearchIndexService,
    ElasticsearchSearchService,
    ElasticsearchSyncService,
    ActivityLoggerUtils,
    {
      provide: APP_INTERCEPTOR,
      useClass: DatabaseInitInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RateLimitInterceptor,
    },
  ],
  exports: [
    CommonService,
    DatabaseService,
    EmailService,
    ExportService,
    FileUploadService,
    LoggerService,
    NotificationService,
    SmsService,
    ServiceHealthService,
    RateLimitMonitorService,
    ElasticsearchIndexService,
    ElasticsearchSearchService,
    ElasticsearchSyncService,
    ActivityLoggerUtils,
  ],
})
export class CommonModule {}
