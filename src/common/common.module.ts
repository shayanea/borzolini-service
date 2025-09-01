import { APP_INTERCEPTOR } from '@nestjs/core';
import { ActivityLoggerUtils } from './utils/activity-logger.utils';
import { CommonService } from './common.service';
import { DatabaseInitInterceptor } from './database-init.interceptor';
import { DatabaseService } from './database.service';
import { ElasticsearchHealthController } from './controllers/elasticsearch-health.controller';
import { ElasticsearchIndexService } from './services/elasticsearch-index.service';
import { ElasticsearchManagementController } from './controllers/elasticsearch-management.controller';
import { ElasticsearchModule } from './elasticsearch.module';
import { ElasticsearchSearchController } from './controllers/elasticsearch-search.controller';
import { ElasticsearchSearchService } from './services/elasticsearch-search.service';
import { ElasticsearchSyncService } from './services/elasticsearch-sync.service';
import { EmailService } from './email.service';
import { FileUploadService } from './file-upload.service';
import { LocalStorageModule } from './local-storage.module';
import { LoggerService } from './logger.service';
import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { RateLimitInterceptor } from './interceptors/rate-limit.interceptor';
import { RateLimitMonitorController } from './controllers/rate-limit-monitor.controller';
import { RateLimitMonitorService } from './services/rate-limit-monitor.service';
import { ServiceHealthService } from './service-health.service';
import { SmsService } from './sms.service';
import { SupabaseModule } from './supabase.module';

@Module({
  imports: [SupabaseModule, LocalStorageModule, ElasticsearchModule],
  controllers: [RateLimitMonitorController, ElasticsearchHealthController, ElasticsearchSearchController, ElasticsearchManagementController],
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
