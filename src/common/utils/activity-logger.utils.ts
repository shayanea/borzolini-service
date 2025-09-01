import { Injectable, Optional } from '@nestjs/common';
import { ActivityStatus, ActivityType } from '../../modules/users/entities/user-activity.entity';
import { UsersService } from '../../modules/users/users.service';

/**
 * Interface for activity logging data
 */
export interface ActivityLogData {
  [key: string]: any;
}

/**
 * Interface for activity logging options
 */
export interface ActivityLogOptions {
  userId: string;
  activityType: ActivityType;
  status: ActivityStatus;
  data: ActivityLogData;
  description?: string;
}

/**
 * Utility class for logging user activities
 */
@Injectable()
export class ActivityLoggerUtils {
  constructor(@Optional() private readonly usersService?: UsersService) {}

  /**
   * Logs a clinic-related activity
   * @param clinicId - ID of the clinic
   * @param clinicName - Name of the clinic
   * @param clinicCity - City of the clinic
   * @param activityType - Type of activity
   * @param userId - ID of the user performing the activity
   * @param additionalData - Additional data to log
   */
  async logClinicActivity(clinicId: string, clinicName: string, clinicCity: string, activityType: ActivityType, userId: string, additionalData: ActivityLogData = {}): Promise<void> {
    if (!this.usersService) {
      return; // Skip logging if UsersService is not available
    }

    const logData = {
      clinicId,
      clinicName,
      clinicCity,
      timestamp: new Date(),
      ...additionalData,
    };

    await this.usersService.logUserActivity(userId, activityType, ActivityStatus.SUCCESS, logData);
  }

  /**
   * Logs an appointment-related activity
   * @param appointmentId - ID of the appointment
   * @param appointmentType - Type of appointment
   * @param activityType - Type of activity
   * @param userId - ID of the user performing the activity
   * @param additionalData - Additional data to log
   */
  async logAppointmentActivity(appointmentId: string, appointmentType: string, activityType: ActivityType, userId: string, additionalData: ActivityLogData = {}): Promise<void> {
    if (!this.usersService) {
      return; // Skip logging if UsersService is not available
    }

    const logData = {
      appointmentId,
      appointmentType,
      timestamp: new Date(),
      ...additionalData,
    };

    await this.usersService.logUserActivity(userId, activityType, ActivityStatus.SUCCESS, logData);
  }

  /**
   * Logs a generic activity with custom data
   * @param options - Activity logging options
   */
  async logActivity(options: ActivityLogOptions): Promise<void> {
    if (!this.usersService) {
      return; // Skip logging if UsersService is not available
    }

    const { userId, activityType, status, data, description } = options;

    const logData = {
      ...data,
      timestamp: new Date(),
      ...(description && { description }),
    };

    await this.usersService.logUserActivity(userId, activityType, status, logData);
  }

  /**
   * Logs an error activity
   * @param userId - ID of the user
   * @param activityType - Type of activity that failed
   * @param error - Error that occurred
   * @param additionalData - Additional data to log
   */
  async logErrorActivity(userId: string, activityType: ActivityType, error: Error | string, additionalData: ActivityLogData = {}): Promise<void> {
    if (!this.usersService) {
      return; // Skip logging if UsersService is not available
    }

    const errorMessage = error instanceof Error ? error.message : error;

    const logData = {
      error: errorMessage,
      timestamp: new Date(),
      ...additionalData,
    };

    await this.usersService.logUserActivity(userId, activityType, ActivityStatus.FAILED, logData);
  }
}
