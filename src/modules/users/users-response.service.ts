import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersResponseService {
  /**
   * Standardize single user response
   */
  standardizeUserResponse(data: any, message: string = 'User retrieved successfully') {
    return {
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Standardize users list response
   */
  standardizeUsersListResponse(data: any, message: string = 'Users retrieved successfully') {
    return {
      data: data.users,
      total: data.total,
      page: data.page,
      totalPages: data.totalPages,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Standardize profile completion response
   */
  standardizeProfileCompletionResponse(data: any, message: string = 'Profile completion retrieved successfully') {
    return {
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Standardize user preferences response
   */
  standardizeUserPreferencesResponse(data: any, message: string = 'User preferences retrieved successfully') {
    return {
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Standardize user activities response
   */
  standardizeUserActivitiesResponse(data: any, message: string = 'User activities retrieved successfully') {
    return {
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Standardize user activity summary response
   */
  standardizeUserActivitySummaryResponse(data: any, message: string = 'Activity summary retrieved successfully') {
    return {
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Standardize phone verification response
   */
  standardizePhoneVerificationResponse(data: any, message: string = 'Phone verification processed successfully') {
    return {
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Standardize phone verification status response
   */
  standardizePhoneVerificationStatusResponse(data: any, message: string = 'Phone verification status retrieved successfully') {
    return {
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Standardize profile completion recalculation response
   */
  standardizeProfileCompletionRecalculationResponse(data: any, message: string = 'Profile completion recalculated successfully') {
    return {
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Standardize admin dashboard activity response
   */
  standardizeAdminDashboardActivityResponse(data: any, message: string = 'Admin dashboard activities retrieved successfully') {
    return {
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Standardize all profile completions recalculation response
   */
  standardizeAllProfileCompletionsRecalculationResponse(data: any, message: string = 'All profile completions recalculated successfully') {
    return {
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }
}
