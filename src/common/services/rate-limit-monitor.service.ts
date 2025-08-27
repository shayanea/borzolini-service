import { Injectable, Logger } from '@nestjs/common';

export interface RateLimitViolation {
  ip: string;
  endpoint: string;
  userAgent: string;
  timestamp: Date;
  limit: number;
  ttl: number;
}

@Injectable()
export class RateLimitMonitorService {
  private readonly logger = new Logger(RateLimitMonitorService.name);
  private violations: RateLimitViolation[] = [];
  private readonly maxViolations = 1000; // Keep last 1000 violations

  recordViolation(violation: Omit<RateLimitViolation, 'timestamp'>): void {
    const fullViolation: RateLimitViolation = {
      ...violation,
      timestamp: new Date(),
    };

    this.violations.push(fullViolation);

    // Keep only the last maxViolations
    if (this.violations.length > this.maxViolations) {
      this.violations = this.violations.slice(-this.maxViolations);
    }

    // Log violation for monitoring
    this.logger.warn(`Rate limit violation recorded: IP ${violation.ip} on ${violation.endpoint}`, 'RateLimitMonitorService');
  }

  getViolations(ip?: string, endpoint?: string): RateLimitViolation[] {
    let filtered = this.violations;

    if (ip) {
      filtered = filtered.filter((v) => v.ip === ip);
    }

    if (endpoint) {
      filtered = filtered.filter((v) => v.endpoint === endpoint);
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getViolationStats(): {
    total: number;
    byIp: Record<string, number>;
    byEndpoint: Record<string, number>;
    recentViolations: RateLimitViolation[];
  } {
    const byIp: Record<string, number> = {};
    const byEndpoint: Record<string, number> = {};
    const recentViolations = this.violations
      .filter((v) => v.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24 hours
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 100);

    this.violations.forEach((violation) => {
      byIp[violation.ip] = (byIp[violation.ip] || 0) + 1;
      byEndpoint[violation.endpoint] = (byEndpoint[violation.endpoint] || 0) + 1;
    });

    return {
      total: this.violations.length,
      byIp,
      byEndpoint,
      recentViolations,
    };
  }

  clearViolations(): void {
    this.violations = [];
    this.logger.log('Rate limit violations cleared', 'RateLimitMonitorService');
  }
}
