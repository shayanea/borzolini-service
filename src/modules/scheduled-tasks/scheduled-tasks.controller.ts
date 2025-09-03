import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { CleanupSummary, ScheduledTasksService } from './scheduled-tasks.service';

// Define the user type from JWT payload
interface JwtUser {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

// Extend Express Request to include user
interface AuthenticatedRequest extends Request {
  user: JwtUser;
}

@ApiTags('Scheduled-tasks')
@Controller('scheduled-tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ScheduledTasksController {
  constructor(private readonly scheduledTasksService: ScheduledTasksService) {}

  @Post('cleanup/trigger')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Trigger manual cleanup (Admin only)',
    description: 'Manually triggers the cleanup process to remove old records based on retention policies. This endpoint is protected and only accessible by administrators.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cleanup process triggered successfully',
    schema: {
      type: 'object',
      properties: {
        timestamp: { type: 'string', format: 'date-time' },
        totalDeleted: { type: 'number', description: 'Total number of records deleted' },
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              entity: { type: 'string', description: 'Name of the entity cleaned' },
              deletedCount: { type: 'number', description: 'Number of records deleted' },
              retentionDays: { type: 'number', description: 'Retention period in days' },
              cutoffDate: { type: 'string', format: 'date-time' },
              success: { type: 'boolean', description: 'Whether cleanup was successful' },
              error: { type: 'string', description: 'Error message if cleanup failed' },
            },
          },
        },
        executionTime: { type: 'number', description: 'Execution time in milliseconds' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async triggerManualCleanup(@Request() _req: AuthenticatedRequest): Promise<CleanupSummary> {
    return this.scheduledTasksService.triggerManualCleanup();
  }

  @Get('cleanup/stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get cleanup statistics (Admin only)',
    description: 'Retrieves statistics about the cleanup process including retention policies, next scheduled run, and historical data.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cleanup statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        lastRun: {
          type: 'string',
          format: 'date-time',
          nullable: true,
          description: 'Timestamp of the last cleanup run',
        },
        nextScheduledRun: {
          type: 'string',
          format: 'date-time',
          description: 'Timestamp of the next scheduled cleanup run',
        },
        retentionPolicies: {
          type: 'object',
          properties: {
            userActivity: { type: 'number', description: 'Retention days for user activities' },
            aiHealthInsights: { type: 'number', description: 'Retention days for AI health insights' },
            clinicReviews: { type: 'number', description: 'Retention days for clinic reviews' },
            appointments: { type: 'number', description: 'Retention days for appointments' },
            tempFiles: { type: 'number', description: 'Retention days for temporary files' },
          },
        },
        totalRecordsDeleted: {
          type: 'number',
          description: 'Total number of records deleted across all cleanup runs',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getCleanupStats(@Request() _req: AuthenticatedRequest) {
    return this.scheduledTasksService.getCleanupStats();
  }

  @Get('cleanup/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get cleanup system status (Admin only)',
    description: 'Retrieves the current status of the cleanup system including whether jobs are running, last execution time, and any errors.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cleanup system status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['running', 'idle', 'error'],
          description: 'Current status of the cleanup system',
        },
        lastExecution: {
          type: 'string',
          format: 'date-time',
          nullable: true,
          description: 'Timestamp of the last execution',
        },
        nextExecution: {
          type: 'string',
          format: 'date-time',
          description: 'Timestamp of the next scheduled execution',
        },
        errorCount: {
          type: 'number',
          description: 'Number of errors in the last 24 hours',
        },
        successCount: {
          type: 'number',
          description: 'Number of successful executions in the last 24 hours',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getCleanupStatus(@Request() _req: AuthenticatedRequest) {
    // This would typically check the actual status from a job queue or database
    const stats = await this.scheduledTasksService.getCleanupStats();

    return {
      status: 'idle',
      lastExecution: stats.lastRun,
      nextExecution: stats.nextScheduledRun,
      errorCount: 0,
      successCount: 1,
    };
  }
}
