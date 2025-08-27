import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { AnalyticsService, TrackEventOptions, TrackPageViewOptions } from './analytics.service';

export class TrackEventDto {
  eventName!: string;
  eventData?: Record<string, any>;
  url?: string;
  referrer?: string;
}

export class TrackPageViewDto {
  url!: string;
  referrer?: string;
}

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('track/event')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Track a custom analytics event' })
  @ApiResponse({ status: 200, description: 'Event tracked successfully' })
  @ApiResponse({ status: 400, description: 'Invalid event data' })
  async trackEvent(@Body() trackEventDto: TrackEventDto, @Req() request: Request): Promise<{ success: boolean; message: string }> {
    const trackOptions: TrackEventOptions = {
      ...trackEventDto,
    };

    // Only add optional properties if they have values
    const userAgent = request.headers['user-agent'];
    const ip = request.ip || request.connection.remoteAddress;
    
    if (userAgent) trackOptions.userAgent = userAgent;
    if (ip) trackOptions.ip = ip;

    await this.analyticsService.trackEvent(trackOptions);

    return {
      success: true,
      message: `Event '${trackEventDto.eventName}' tracked successfully`,
    };
  }

  @Post('track/pageview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Track a page view' })
  @ApiResponse({ status: 200, description: 'Page view tracked successfully' })
  @ApiResponse({ status: 400, description: 'Invalid page view data' })
  async trackPageView(@Body() trackPageViewDto: TrackPageViewDto, @Req() request: Request): Promise<{ success: boolean; message: string }> {
    const trackOptions: TrackPageViewOptions = {
      ...trackPageViewDto,
    };

    // Only add optional properties if they have values
    const userAgent = request.headers['user-agent'];
    const ip = request.ip || request.connection.remoteAddress;
    
    if (userAgent) trackOptions.userAgent = userAgent;
    if (ip) trackOptions.ip = ip;

    await this.analyticsService.trackPageView(trackOptions);

    return {
      success: true,
      message: `Page view for '${trackPageViewDto.url}' tracked successfully`,
    };
  }

  @Post('track/auth/:eventType')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Track authentication events' })
  @ApiResponse({ status: 200, description: 'Auth event tracked successfully' })
  @ApiResponse({ status: 400, description: 'Invalid event type' })
  async trackAuthEvent(@Query('eventType') eventType: 'login' | 'logout' | 'register' | 'password_reset', @Query('userId') userId?: string): Promise<{ success: boolean; message: string }> {
    await this.analyticsService.trackAuthEvent(eventType, userId);

    return {
      success: true,
      message: `Auth event '${eventType}' tracked successfully`,
    };
  }

  @Post('track/appointment/:eventType')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Track appointment events' })
  @ApiResponse({ status: 200, description: 'Appointment event tracked successfully' })
  @ApiResponse({ status: 400, description: 'Invalid event type' })
  async trackAppointmentEvent(
    @Query('eventType') eventType: 'created' | 'updated' | 'cancelled' | 'completed',
    @Query('appointmentId') appointmentId: string,
    @Query('clinicId') clinicId?: string
  ): Promise<{ success: boolean; message: string }> {
    await this.analyticsService.trackAppointmentEvent(eventType, appointmentId, clinicId);

    return {
      success: true,
      message: `Appointment event '${eventType}' tracked successfully`,
    };
  }

  @Post('track/health/:eventType')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Track health monitoring events' })
  @ApiResponse({ status: 200, description: 'Health event tracked successfully' })
  @ApiResponse({ status: 400, description: 'Invalid event type' })
  async trackHealthEvent(@Query('eventType') eventType: 'checkup' | 'vaccination' | 'emergency' | 'ai_insight', @Query('petId') petId: string, @Query('clinicId') clinicId?: string): Promise<{ success: boolean; message: string }> {
    await this.analyticsService.trackHealthEvent(eventType, petId, clinicId);

    return {
      success: true,
      message: `Health event '${eventType}' tracked successfully`,
    };
  }

  @Post('track/clinic/:eventType')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Track clinic management events' })
  @ApiResponse({ status: 200, description: 'Clinic event tracked successfully' })
  @ApiResponse({ status: 400, description: 'Invalid event type' })
  async trackClinicEvent(@Query('eventType') eventType: 'created' | 'updated' | 'service_added' | 'staff_added', @Query('clinicId') clinicId: string): Promise<{ success: boolean; message: string }> {
    await this.analyticsService.trackClinicEvent(eventType, clinicId);

    return {
      success: true,
      message: `Clinic event '${eventType}' tracked successfully`,
    };
  }

  @Get('status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get analytics service status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Analytics status retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getAnalyticsStatus(): Promise<{
    enabled: boolean;
    configured: boolean;
    websiteId?: string;
    apiUrl?: string;
  }> {
    return this.analyticsService.getAnalyticsStatus();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for analytics service' })
  @ApiResponse({ status: 200, description: 'Analytics service is healthy' })
  async healthCheck(): Promise<{ status: string; analytics: boolean }> {
    return {
      status: 'ok',
      analytics: this.analyticsService.isAnalyticsEnabled(),
    };
  }
}
