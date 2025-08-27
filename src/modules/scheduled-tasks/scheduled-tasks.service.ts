import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiHealthInsight } from '../ai-health/entities/ai-health-insight.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { ClinicReview } from '../clinics/entities/clinic-review.entity';
import { UserActivity } from '../users/entities/user-activity.entity';

export interface CleanupResult {
  entity: string;
  deletedCount: number;
  retentionDays: number;
  cutoffDate: Date;
  success: boolean;
  error?: string;
}

export interface CleanupSummary {
  timestamp: Date;
  totalDeleted: number;
  results: CleanupResult[];
  executionTime: number;
}

@Injectable()
export class ScheduledTasksService {
  private readonly logger = new Logger(ScheduledTasksService.name);

  constructor(
    @InjectRepository(UserActivity)
    private userActivityRepository: Repository<UserActivity>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(ClinicReview)
    private clinicReviewRepository: Repository<ClinicReview>,
    @InjectRepository(AiHealthInsight)
    private aiHealthInsightRepository: Repository<AiHealthInsight>,
    private configService: ConfigService
  ) {}

  /**
   * Daily cleanup job that runs at 2:00 AM
   * Cleans up old records based on configurable retention periods
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async runDailyCleanup(): Promise<void> {
    this.logger.log('🚀 Starting daily cleanup job...');

    try {
      const summary = await this.performCleanup();
      this.logger.log(`✅ Daily cleanup completed successfully in ${summary.executionTime}ms`);
      this.logger.log(`📊 Total records deleted: ${summary.totalDeleted}`);

      summary.results.forEach((result) => {
        if (result.success) {
          this.logger.log(`🗑️  ${result.entity}: Deleted ${result.deletedCount} records older than ${result.retentionDays} days`);
        } else {
          this.logger.error(`❌ ${result.entity}: Cleanup failed - ${result.error}`);
        }
      });
    } catch (error) {
      this.logger.error('❌ Daily cleanup job failed:', error);
    }
  }

  /**
   * Weekly cleanup job that runs every Sunday at 3:00 AM
   * Performs more aggressive cleanup for certain entities
   */
  @Cron(CronExpression.EVERY_WEEK)
  async runWeeklyCleanup(): Promise<void> {
    this.logger.log('🚀 Starting weekly cleanup job...');

    try {
      const summary = await this.performWeeklyCleanup();
      this.logger.log(`✅ Weekly cleanup completed successfully in ${summary.executionTime}ms`);
      this.logger.log(`📊 Total records deleted: ${summary.totalDeleted}`);
    } catch (error) {
      this.logger.error('❌ Weekly cleanup job failed:', error);
    }
  }

  /**
   * Manual cleanup trigger for immediate execution
   */
  async triggerManualCleanup(): Promise<CleanupSummary> {
    this.logger.log('🚀 Manual cleanup triggered...');
    return await this.performCleanup();
  }

  /**
   * Perform the main cleanup operation
   */
  private async performCleanup(): Promise<CleanupSummary> {
    const startTime = Date.now();
    const results: CleanupResult[] = [];

    // Clean up user activities (older than 15 days by default)
    const userActivityResult = await this.cleanupUserActivities();
    results.push(userActivityResult);

    // Clean up old AI health insights (older than 30 days by default)
    const aiHealthResult = await this.cleanupAiHealthInsights();
    results.push(aiHealthResult);

    // Clean up old clinic reviews (older than 90 days by default)
    const clinicReviewResult = await this.cleanupClinicReviews();
    results.push(clinicReviewResult);

    // Clean up old appointments (older than 365 days by default)
    const appointmentResult = await this.cleanupAppointments();
    results.push(appointmentResult);

    const totalDeleted = results.reduce((sum, result) => sum + result.deletedCount, 0);
    const executionTime = Date.now() - startTime;

    return {
      timestamp: new Date(),
      totalDeleted,
      results,
      executionTime,
    };
  }

  /**
   * Perform weekly cleanup with different retention periods
   */
  private async performWeeklyCleanup(): Promise<CleanupSummary> {
    const startTime = Date.now();
    const results: CleanupResult[] = [];

    // Weekly cleanup for temporary files and logs
    const tempFilesResult = await this.cleanupTemporaryFiles();
    results.push(tempFilesResult);

    const totalDeleted = results.reduce((sum, result) => sum + result.deletedCount, 0);
    const executionTime = Date.now() - startTime;

    return {
      timestamp: new Date(),
      totalDeleted,
      results,
      executionTime,
    };
  }

  /**
   * Clean up user activities older than retention period
   */
  private async cleanupUserActivities(): Promise<CleanupResult> {
    const retentionDays = this.configService.get<number>('USER_ACTIVITY_RETENTION_DAYS', 15);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    try {
      const deletedCount = await this.userActivityRepository.createQueryBuilder('activity').delete().where('activity.createdAt < :cutoffDate', { cutoffDate }).execute();

      return {
        entity: 'UserActivity',
        deletedCount: deletedCount.affected || 0,
        retentionDays,
        cutoffDate,
        success: true,
      };
    } catch (error) {
      return {
        entity: 'UserActivity',
        deletedCount: 0,
        retentionDays,
        cutoffDate,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Clean up AI health insights older than retention period
   */
  private async cleanupAiHealthInsights(): Promise<CleanupResult> {
    const retentionDays = this.configService.get<number>('AI_HEALTH_RETENTION_DAYS', 30);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    try {
      const deletedCount = await this.aiHealthInsightRepository.createQueryBuilder('insight').delete().where('insight.createdAt < :cutoffDate', { cutoffDate }).execute();

      return {
        entity: 'AiHealthInsight',
        deletedCount: deletedCount.affected || 0,
        retentionDays,
        cutoffDate,
        success: true,
      };
    } catch (error) {
      return {
        entity: 'AiHealthInsight',
        deletedCount: 0,
        retentionDays,
        cutoffDate,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Clean up clinic reviews older than retention period
   */
  private async cleanupClinicReviews(): Promise<CleanupResult> {
    const retentionDays = this.configService.get<number>('CLINIC_REVIEW_RETENTION_DAYS', 90);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    try {
      const deletedCount = await this.clinicReviewRepository.createQueryBuilder('review').delete().where('review.createdAt < :cutoffDate', { cutoffDate }).execute();

      return {
        entity: 'ClinicReview',
        deletedCount: deletedCount.affected || 0,
        retentionDays,
        cutoffDate,
        success: true,
      };
    } catch (error) {
      return {
        entity: 'ClinicReview',
        deletedCount: 0,
        retentionDays,
        cutoffDate,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Clean up appointments older than retention period
   */
  private async cleanupAppointments(): Promise<CleanupResult> {
    const retentionDays = this.configService.get<number>('APPOINTMENT_RETENTION_DAYS', 365);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    try {
      const deletedCount = await this.appointmentRepository.createQueryBuilder('appointment').delete().where('appointment.createdAt < :cutoffDate', { cutoffDate }).execute();

      return {
        entity: 'Appointment',
        deletedCount: deletedCount.affected || 0,
        retentionDays,
        cutoffDate,
        success: true,
      };
    } catch (error) {
      return {
        entity: 'Appointment',
        deletedCount: 0,
        retentionDays,
        cutoffDate,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Clean up temporary files and logs
   */
  private async cleanupTemporaryFiles(): Promise<CleanupResult> {
    const retentionDays = this.configService.get<number>('TEMP_FILES_RETENTION_DAYS', 7);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    try {
      // This would typically clean up uploaded files, logs, etc.
      // For now, we'll return a placeholder result
      return {
        entity: 'TemporaryFiles',
        deletedCount: 0,
        retentionDays,
        cutoffDate,
        success: true,
      };
    } catch (error) {
      return {
        entity: 'TemporaryFiles',
        deletedCount: 0,
        retentionDays,
        cutoffDate,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get cleanup statistics for monitoring
   */
  async getCleanupStats(): Promise<{
    lastRun: Date | null;
    nextScheduledRun: Date;
    retentionPolicies: Record<string, number>;
    totalRecordsDeleted: number;
  }> {
    const retentionPolicies = {
      userActivity: this.configService.get<number>('USER_ACTIVITY_RETENTION_DAYS', 15),
      aiHealthInsights: this.configService.get<number>('AI_HEALTH_RETENTION_DAYS', 30),
      clinicReviews: this.configService.get<number>('CLINIC_REVIEW_RETENTION_DAYS', 90),
      appointments: this.configService.get<number>('APPOINTMENT_RETENTION_DAYS', 365),
      tempFiles: this.configService.get<number>('TEMP_FILES_RETENTION_DAYS', 7),
    };

    // Calculate next scheduled run (daily at 2 AM)
    const nextRun = new Date();
    nextRun.setHours(2, 0, 0, 0);
    if (nextRun <= new Date()) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    return {
      lastRun: null, // Would be stored in database/cache
      nextScheduledRun: nextRun,
      retentionPolicies,
      totalRecordsDeleted: 0, // Would be tracked over time
    };
  }
}
