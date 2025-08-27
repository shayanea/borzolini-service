import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({ description: 'User data' })
  data!: User;

  @ApiProperty({ description: 'Success message', example: 'User retrieved successfully' })
  message!: string;

  @ApiProperty({ description: 'Response timestamp', example: '2024-01-01T00:00:00.000Z' })
  timestamp!: string;
}

export class UsersListResponseDto {
  @ApiProperty({ description: 'List of users', type: [User] })
  data!: User[];

  @ApiProperty({ description: 'Total number of users' })
  total!: number;

  @ApiProperty({ description: 'Current page number' })
  page!: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages!: number;

  @ApiProperty({ description: 'Success message', example: 'Users retrieved successfully' })
  message!: string;

  @ApiProperty({ description: 'Response timestamp', example: '2024-01-01T00:00:00.000Z' })
  timestamp!: string;
}

export class UserProfileCompletionResponseDto {
  @ApiProperty({ description: 'Profile completion data' })
  data!: {
    profileCompletionPercentage: number;
  };

  @ApiProperty({ description: 'Success message', example: 'Profile completion retrieved successfully' })
  message!: string;

  @ApiProperty({ description: 'Response timestamp', example: '2024-01-01T00:00:00.000Z' })
  timestamp!: string;
}

export class UserPreferencesResponseDto {
  @ApiProperty({ description: 'User preferences data' })
  data!: any; // Replace with actual UserPreferences type

  @ApiProperty({ description: 'Success message', example: 'User preferences retrieved successfully' })
  message!: string;

  @ApiProperty({ description: 'Response timestamp', example: '2024-01-01T00:00:00.000Z' })
  timestamp!: string;
}

export class UserActivitiesResponseDto {
  @ApiProperty({ description: 'User activities data' })
  data!: any[]; // Replace with actual UserActivity[] type

  @ApiProperty({ description: 'Success message', example: 'User activities retrieved successfully' })
  message!: string;

  @ApiProperty({ description: 'Response timestamp', example: '2024-01-01T00:00:00.000Z' })
  timestamp!: string;
}

export class UserActivitySummaryResponseDto {
  @ApiProperty({ description: 'User activity summary data' })
  data!: any; // Replace with actual activity summary type

  @ApiProperty({ description: 'Success message', example: 'Activity summary retrieved successfully' })
  message!: string;

  @ApiProperty({ description: 'Response timestamp', example: '2024-01-01T00:00:00.000Z' })
  timestamp!: string;
}

export class PhoneVerificationResponseDto {
  @ApiProperty({ description: 'Phone verification data' })
  data!: {
    message: string;
    phone: string;
    expiresIn: string;
  };

  @ApiProperty({ description: 'Success message', example: 'Verification OTP sent successfully' })
  message!: string;

  @ApiProperty({ description: 'Response timestamp', example: '2024-01-01T00:00:00.000Z' })
  timestamp!: string;
}

export class PhoneVerificationStatusResponseDto {
  @ApiProperty({ description: 'Phone verification status data' })
  data!: {
    phone: string;
    isVerified: boolean;
    verificationDate?: string;
  };

  @ApiProperty({ description: 'Success message', example: 'Phone verification status retrieved successfully' })
  message!: string;

  @ApiProperty({ description: 'Response timestamp', example: '2024-01-01T00:00:00.000Z' })
  timestamp!: string;
}

export class ProfileCompletionRecalculationResponseDto {
  @ApiProperty({ description: 'Profile completion recalculation data' })
  data!: {
    profileCompletionPercentage: number;
    message: string;
  };

  @ApiProperty({ description: 'Success message', example: 'Profile completion recalculated successfully' })
  message!: string;

  @ApiProperty({ description: 'Response timestamp', example: '2024-01-01T00:00:00.000Z' })
  timestamp!: string;
}

export class AllProfileCompletionsRecalculationResponseDto {
  @ApiProperty({ description: 'All profile completions recalculation data' })
  data!: {
    updated: number;
    total: number;
    message: string;
  };

  @ApiProperty({ description: 'Success message', example: 'All profile completions recalculated successfully' })
  message!: string;

  @ApiProperty({ description: 'Response timestamp', example: '2024-01-01T00:00:00.000Z' })
  timestamp!: string;
}
