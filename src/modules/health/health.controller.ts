import { ApiInternalServerErrorResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';

import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Get overall service health status',
    description: 'Retrieves the overall health status of the Borzolini Service API including system metrics and status',
  })
  @ApiResponse({
    status: 200,
    description: 'Service health status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        timestamp: { type: 'string', format: 'date-time' },
        uptime: { type: 'number', description: 'Service uptime in seconds' },
        version: { type: 'string', example: '1.0.0' },
        environment: { type: 'string', example: 'development' },
        services: {
          type: 'object',
          properties: {
            database: { type: 'string', example: 'connected' },
            redis: { type: 'string', example: 'connected' },
            external: { type: 'string', example: 'healthy' },
          },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error occurred while checking health status',
  })
  async getHealth() {
    return this.healthService.checkHealth();
  }

  @Get('database')
  @ApiOperation({
    summary: 'Get database health information',
    description: 'Retrieves detailed database connection status, performance metrics, and health indicators',
  })
  @ApiResponse({
    status: 200,
    description: 'Database health information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'connected' },
        timestamp: { type: 'string', format: 'date-time' },
        connection: {
          type: 'object',
          properties: {
            host: { type: 'string', example: 'localhost' },
            port: { type: 'number', example: 5432 },
            database: { type: 'string', example: 'borzolini_clinic' },
            version: { type: 'string', example: 'PostgreSQL 15.0' },
          },
        },
        performance: {
          type: 'object',
          properties: {
            responseTime: { type: 'number', description: 'Response time in milliseconds' },
            activeConnections: { type: 'number', description: 'Number of active database connections' },
            maxConnections: { type: 'number', description: 'Maximum allowed connections' },
          },
        },
        tables: {
          type: 'object',
          properties: {
            total: { type: 'number', description: 'Total number of tables' },
            size: { type: 'string', description: 'Total database size' },
          },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error or database connection failure',
  })
  async getDatabaseInfo() {
    return this.healthService.getDatabaseInfo();
  }

  @Get('detailed')
  @ApiOperation({
    summary: 'Get detailed health information',
    description: 'Provides an expanded health payload including DB health, connection stats, supabase status, environment, and uptime.',
  })
  @ApiResponse({
    status: 200,
    description: 'Detailed health information retrieved successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Failed to build detailed health info' })
  async getDetailedHealth() {
    return this.healthService.getDetailedHealth();
  }

  @Get('ping')
  @ApiOperation({
    summary: 'Health check ping endpoint',
    description: 'Simple ping endpoint to verify the service is responding. Returns basic service information and current timestamp.',
  })
  @ApiResponse({
    status: 200,
    description: 'Ping successful - service is responding',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'pong' },
        timestamp: { type: 'string', format: 'date-time' },
        service: { type: 'string', example: 'Borzolini Service API' },
        version: { type: 'string', example: '1.0.0' },
        uptime: { type: 'number', description: 'Service uptime in seconds' },
      },
    },
  })
  ping() {
    return {
      message: 'pong',
      timestamp: new Date().toISOString(),
      service: 'Borzolini Service API',
      version: '1.0.0',
      uptime: process.uptime(),
    };
  }
}
