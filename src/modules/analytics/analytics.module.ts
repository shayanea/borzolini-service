import { APP_INTERCEPTOR } from '@nestjs/core';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsInterceptor } from './interceptors/analytics.interceptor';
import { AnalyticsService } from './analytics.service';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

@Module({
  imports: [ConfigModule],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AnalyticsInterceptor,
    },
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
