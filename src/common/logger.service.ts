import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

export interface LogContext {
  service?: string;
  method?: string;
  userId?: string;
  requestId?: string;
  [key: string]: unknown;
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly isProduction = process.env.NODE_ENV === 'production';

  log(message: string, context?: LogContext): void {
    if (this.isProduction) {
      // In production, use structured logging
      console.log(
        JSON.stringify({
          level: 'info',
          timestamp: new Date().toISOString(),
          message,
          ...context,
        })
      );
    } else {
      // In development, use formatted console logs
      const contextStr = context
        ? ` [${Object.entries(context)
            .map(([k, v]) => `${k}:${v}`)
            .join(', ')}]`
        : '';
      console.log(`ℹ️  ${message}${contextStr}`);
    }
  }

  error(message: string, trace?: string, context?: LogContext): void {
    if (this.isProduction) {
      // In production, use structured logging
      console.error(
        JSON.stringify({
          level: 'error',
          timestamp: new Date().toISOString(),
          message,
          trace,
          ...context,
        })
      );
    } else {
      // In development, use formatted console logs
      const contextStr = context
        ? ` [${Object.entries(context)
            .map(([k, v]) => `${k}:${v}`)
            .join(', ')}]`
        : '';
      const traceStr = trace ? `\n${trace}` : '';
      console.error(`❌ ${message}${contextStr}${traceStr}`);
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.isProduction) {
      // In production, use structured logging
      console.warn(
        JSON.stringify({
          level: 'warn',
          timestamp: new Date().toISOString(),
          message,
          ...context,
        })
      );
    } else {
      // In development, use formatted console logs
      const contextStr = context
        ? ` [${Object.entries(context)
            .map(([k, v]) => `${k}:${v}`)
            .join(', ')}]`
        : '';
      console.warn(`⚠️  ${message}${contextStr}`);
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.isProduction && process.env.LOG_LEVEL !== 'debug') {
      return; // Skip debug logs in production unless explicitly enabled
    }

    if (this.isProduction) {
      // In production, use structured logging
      console.log(
        JSON.stringify({
          level: 'debug',
          timestamp: new Date().toISOString(),
          message,
          ...context,
        })
      );
    } else {
      // In development, use formatted console logs
      const contextStr = context
        ? ` [${Object.entries(context)
            .map(([k, v]) => `${k}:${v}`)
            .join(', ')}]`
        : '';
      console.log(`🐛 ${message}${contextStr}`);
    }
  }

  verbose(message: string, context?: LogContext): void {
    if (this.isProduction && process.env.LOG_LEVEL !== 'verbose') {
      return; // Skip verbose logs in production unless explicitly enabled
    }

    if (this.isProduction) {
      // In production, use structured logging
      console.log(
        JSON.stringify({
          level: 'verbose',
          timestamp: new Date().toISOString(),
          message,
          ...context,
        })
      );
    } else {
      // In development, use formatted console logs
      const contextStr = context
        ? ` [${Object.entries(context)
            .map(([k, v]) => `${k}:${v}`)
            .join(', ')}]`
        : '';
      console.log(`🔍 ${message}${contextStr}`);
    }
  }
}
