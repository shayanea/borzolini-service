import { Controller, Get, HttpCode, HttpStatus, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

import { DashboardService } from './dashboard.service';
import { DashboardFiltersDto, DashboardStatsDto, ClinicDashboardStatsDto } from './dto/dashboard-stats.dto';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get comprehensive dashboard statistics',
    description: 'Retrieve all dashboard statistics with optional filtering and caching for optimal performance',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
    type: DashboardStatsDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiQuery({
    name: 'dateRange',
    required: false,
    type: [String],
    description: 'Date range filter [startDate, endDate] in ISO string format',
    example: '["2024-01-01T00:00:00Z", "2024-01-31T23:59:59Z"]',
  })
  @ApiQuery({
    name: 'clinicId',
    required: false,
    type: String,
    description: 'Filter statistics by specific clinic ID',
    example: 'clinic_123',
  })
  async getDashboardStats(@Query('dateRange') dateRange?: string[], @Query('clinicId') clinicId?: string): Promise<DashboardStatsDto> {
    const filters: DashboardFiltersDto = {};

    if (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
      filters.dateRange = [dateRange[0], dateRange[1]];
    }

    if (clinicId) {
      filters.clinicId = clinicId;
    }

    return this.dashboardService.getDashboardStats(filters);
  }

  @Get('stats/real-time')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get real-time dashboard statistics',
    description: 'Retrieve dashboard statistics bypassing cache for real-time data',
  })
  @ApiResponse({
    status: 200,
    description: 'Real-time dashboard statistics retrieved successfully',
    type: DashboardStatsDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiQuery({
    name: 'dateRange',
    required: false,
    type: [String],
    description: 'Date range filter [startDate, endDate] in ISO string format',
  })
  @ApiQuery({
    name: 'clinicId',
    required: false,
    type: String,
    description: 'Filter statistics by specific clinic ID',
  })
  async getRealTimeStats(@Query('dateRange') dateRange?: string[], @Query('clinicId') clinicId?: string): Promise<DashboardStatsDto> {
    const filters: DashboardFiltersDto = {};

    if (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
      filters.dateRange = [dateRange[0], dateRange[1]];
    }

    if (clinicId) {
      filters.clinicId = clinicId;
    }

    // Force cache invalidation for real-time data
    await this.dashboardService.invalidateStatsCache(filters);

    return this.dashboardService.getDashboardStats(filters);
  }

  @Get('charts')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get dashboard charts data',
    description: 'Retrieve dashboard charts data with optional filtering for analytics and visualizations',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard charts data retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiQuery({
    name: 'dateRange',
    required: false,
    type: [String],
    description: 'Date range filter [startDate, endDate] in ISO string format',
  })
  @ApiQuery({
    name: 'clinicId',
    required: false,
    type: String,
    description: 'Filter charts by specific clinic ID',
  })
  async getDashboardCharts(@Query('dateRange') dateRange?: string[], @Query('clinicId') clinicId?: string): Promise<any> {
    const filters: DashboardFiltersDto = {};

    if (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
      filters.dateRange = [dateRange[0], dateRange[1]];
    }

    if (clinicId) {
      filters.clinicId = clinicId;
    }

    return this.dashboardService.getDashboardCharts(filters);
  }

  @Get('clinic/:clinicId')
  @Roles(UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.STAFF, UserRole.CLINIC_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get clinic-specific dashboard statistics',
    description: 'Retrieve dashboard statistics for a specific clinic (Clinic Admin, Staff, Veterinarian access)',
  })
  @ApiParam({ name: 'clinicId', description: 'Clinic ID' })
  @ApiResponse({
    status: 200,
    description: 'Clinic dashboard statistics retrieved successfully',
    type: ClinicDashboardStatsDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Clinic not found' })
  async getClinicDashboard(@Param('clinicId') clinicId: string): Promise<ClinicDashboardStatsDto> {
    return this.dashboardService.getClinicDashboardStats(clinicId);
  }

  @Get('health')
  @ApiOperation({
    summary: 'Dashboard service health check',
    description: 'Check if dashboard service and its dependencies are healthy',
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
    };
  }
}
