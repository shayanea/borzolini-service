import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard - Public')
@Controller('dashboard/public')
export class DashboardPublicController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('health')
  @ApiOperation({
    summary: 'Public dashboard service health check',
    description: 'Public endpoint to check if dashboard service is running (no auth required)',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard service health status',
  })
  async healthCheck() {
    return {
      status: 'ok',
      service: 'dashboard',
      timestamp: new Date().toISOString(),
      message: 'Dashboard service is running',
    };
  }

  @Get('stats/sample')
  @ApiOperation({
    summary: 'Get sample dashboard statistics (public)',
    description: 'Get sample dashboard statistics without authentication for testing purposes',
  })
  @ApiResponse({
    status: 200,
    description: 'Sample dashboard statistics',
  })
  async getSampleStats() {
    try {
      // Get sample data without filters
      const stats = await this.dashboardService.getDashboardStats({});
      return {
        status: 'success',
        data: stats,
        message: 'Sample dashboard statistics retrieved successfully',
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to retrieve dashboard statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
