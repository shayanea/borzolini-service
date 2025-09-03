import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../modules/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/guards/roles.guard';
import { UserRole } from '../../modules/users/entities/user.entity';
import { RateLimitMonitorService } from '../services/rate-limit-monitor.service';

@ApiTags('Rate-limit-monitor')
@Controller('rate-limit-monitor')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RateLimitMonitorController {
  constructor(private readonly rateLimitMonitorService: RateLimitMonitorService) {}

  @Get('stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get rate limiting violation statistics' })
  @ApiResponse({
    status: 200,
    description: 'Rate limiting statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        byIp: { type: 'object' },
        byEndpoint: { type: 'object' },
        recentViolations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              ip: { type: 'string' },
              endpoint: { type: 'string' },
              userAgent: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
              limit: { type: 'number' },
              ttl: { type: 'number' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  getStats() {
    return this.rateLimitMonitorService.getViolationStats();
  }

  @Get('violations')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get rate limiting violations with optional filtering' })
  @ApiQuery({ name: 'ip', required: false, description: 'Filter by IP address' })
  @ApiQuery({ name: 'endpoint', required: false, description: 'Filter by endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Rate limiting violations retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          ip: { type: 'string' },
          endpoint: { type: 'string' },
          userAgent: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
          limit: { type: 'number' },
          ttl: { type: 'number' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  getViolations(@Query('ip') ip?: string, @Query('endpoint') endpoint?: string) {
    return this.rateLimitMonitorService.getViolations(ip, endpoint);
  }

  @Get('clear')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Clear all rate limiting violation records' })
  @ApiResponse({
    status: 200,
    description: 'Rate limiting violations cleared successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  clearViolations() {
    this.rateLimitMonitorService.clearViolations();
    return {
      message: 'Rate limiting violations cleared successfully',
      timestamp: new Date().toISOString(),
    };
  }
}
