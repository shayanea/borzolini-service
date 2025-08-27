import { CallHandler, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';

import { Logger } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { catchError } from 'rxjs/operators';
import { RateLimitMonitorService } from '../services/rate-limit-monitor.service';

@Injectable()
export class RateLimitInterceptor {
  private readonly logger = new Logger(RateLimitInterceptor.name);

  constructor(private readonly rateLimitMonitorService: RateLimitMonitorService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof ThrottlerException) {
          const request = context.switchToHttp().getRequest();
          const ip = request.ip;
          const userAgent = request.get('User-Agent');
          const endpoint = request.route?.path || 'unknown';

          // Record violation for monitoring
          this.rateLimitMonitorService.recordViolation({
            ip,
            endpoint,
            userAgent,
            limit: 100, // Default limit
            ttl: 60000, // Default TTL
          });

          this.logger.warn(`Rate limit exceeded for IP: ${ip}, Endpoint: ${endpoint}, User-Agent: ${userAgent}`, 'RateLimitInterceptor');

          // Return a more user-friendly error message
          return throwError(() => new ThrottlerException('Too many requests. Please try again later.'));
        }
        return throwError(() => error);
      })
    );
  }
}
