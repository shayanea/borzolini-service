import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';

import { AnalyticsService } from '../analytics.service';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { tap } from 'rxjs/operators';

@Injectable()
export class AnalyticsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AnalyticsInterceptor.name);

  constructor(private readonly analyticsService: AnalyticsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { url } = request;
    const startTime = Date.now();

    // Skip analytics endpoints to avoid infinite loops
    if (url.startsWith('/api/v1/analytics')) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          this.trackApiUsage(request, 'success', startTime, data);
        },
        error: (error) => {
          this.trackApiUsage(request, 'error', startTime, error);
        },
      })
    );
  }

  private async trackApiUsage(request: Request, status: 'success' | 'error', startTime: number, responseData?: Record<string, unknown>): Promise<void> {
    try {
      const duration = Date.now() - startTime;
      const routePath = request.route?.path || 'unknown';
      const userId = (request.user as Record<string, unknown>)?.id as string | undefined;
      const userAgent = request.headers['user-agent'];
      const ip = request.ip || request.connection.remoteAddress;
      const referrer = request.headers.referer;

      const trackOptions: any = {
        eventName: 'api_request',
        eventData: {
          method: request.method,
          route: routePath,
          status,
          duration,
          userId,
          statusCode: (responseData as Record<string, unknown>)?.statusCode || 'unknown',
          userAgent,
          ip,
        },
        url: request.url,
      };

      // Only add optional properties if they have values
      if (referrer) trackOptions.referrer = referrer;
      if (userAgent) trackOptions.userAgent = userAgent;
      if (ip) trackOptions.ip = ip;

      await this.analyticsService.trackEvent(trackOptions);

      this.logger.debug(`API ${request.method} ${routePath} tracked - Status: ${status}, Duration: ${duration}ms`);
    } catch (error) {
      // Don't let analytics errors affect the main request
      this.logger.error('Failed to track API usage', error);
    }
  }
}
