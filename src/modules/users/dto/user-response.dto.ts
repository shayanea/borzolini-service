import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({
    description: 'User data',
    type: User,
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      role: 'patient',
      avatar: 'https://example.com/avatar.jpg',
      dateOfBirth: '1990-01-01',
      address: '123 Main St',
      city: 'New York',
      postalCode: '10001',
      country: 'USA',
      preferredLanguage: 'en',
      timezone: 'America/New_York',
      gender: 'male',
      emergencyContactName: 'Jane Doe',
      emergencyContactPhone: '+1234567891',
      emergencyContactRelationship: 'spouse',
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: false,
      lastLoginAt: '2024-01-15T10:30:00.000Z',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-15T10:30:00.000Z',
    },
  })
  data!: User;

  @ApiProperty({
    description: 'Success message',
    example: 'User retrieved successfully',
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp!: string;
}

export class UsersListResponseDto {
  @ApiProperty({
    description: 'List of users',
    type: [User],
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'patient',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: '456e7890-e89b-12d3-a456-426614174001',
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'veterinarian',
        isActive: true,
        createdAt: '2024-01-02T00:00:00.000Z',
      },
    ],
  })
  data!: User[];

  @ApiProperty({
    description: 'Total number of users',
    example: 150,
  })
  total!: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 15,
  })
  totalPages!: number;

  @ApiProperty({
    description: 'Success message',
    example: 'Users retrieved successfully',
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp!: string;
}

export class EnrichedUserListItemDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  email!: string;
  @ApiProperty({ required: false })
  firstName?: string;
  @ApiProperty({ required: false })
  lastName?: string;
  @ApiProperty()
  role!: string;
  @ApiProperty({ required: false })
  isActive?: boolean;
  @ApiProperty({ required: false })
  isEmailVerified?: boolean;
  @ApiProperty({ required: false })
  isPhoneVerified?: boolean;
  @ApiProperty({ required: false })
  phone?: string;
  @ApiProperty({ required: false })
  address?: string;
  @ApiProperty({ required: false })
  city?: string;
  @ApiProperty({ required: false })
  country?: string;
  @ApiProperty({ required: false, type: Number })
  profileCompletionPercentage?: number;
  @ApiProperty({ required: false })
  lastLoginAt?: string | Date;
  @ApiProperty({ required: false })
  createdAt?: string | Date;
  @ApiProperty({ required: false })
  updatedAt?: string | Date;
  @ApiProperty({ required: false })
  clinic_id?: string;
}

export class EnrichedUsersListResponseDto {
  @ApiProperty({
    type: [EnrichedUserListItemDto],
    example: [
      {
        id: '2c30ed97-8fec-4f6c-a99e-e9e7d8b94817',
        email: 'admin@borzolini.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        phone: '+1-555-0100',
        address: '123 Admin Street',
        city: 'New York',
        country: 'USA',
        profileCompletionPercentage: 100,
        lastLoginAt: '2024-01-15T10:30:00.000Z',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
        clinic_id: 'dc4a1f3d-0e27-498e-824e-3a8c5a45ceaf',
      },
    ],
  })
  data!: EnrichedUserListItemDto[];

  @ApiProperty({ example: 150 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 15 })
  totalPages!: number;

  @ApiProperty({ example: 'Users retrieved successfully' })
  message!: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  timestamp!: string;
}

export class UserProfileCompletionResponseDto {
  @ApiProperty({
    description: 'Profile completion data',
    example: {
      profileCompletionPercentage: 85,
    },
  })
  data!: {
    profileCompletionPercentage: number;
  };

  @ApiProperty({
    description: 'Success message',
    example: 'Profile completion retrieved successfully',
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp!: string;
}

export class UserPreferencesResponseDto {
  @ApiProperty({
    description: 'User preferences data',
    example: {
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
      privacy: {
        profileVisibility: 'public',
        activityVisibility: 'friends',
      },
      language: 'en',
      timezone: 'America/New_York',
    },
  })
  data!: any; // Replace with actual UserPreferences type

  @ApiProperty({
    description: 'Success message',
    example: 'User preferences retrieved successfully',
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp!: string;
}

export class UserActivitiesResponseDto {
  @ApiProperty({
    description: 'User activities data',
    example: [
      {
        id: '789e0123-e89b-12d3-a456-426614174002',
        action: 'login',
        description: 'User logged in successfully',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: '2024-01-15T10:30:00.000Z',
      },
      {
        id: '012e3456-e89b-12d3-a456-426614174003',
        action: 'profile_update',
        description: 'User updated profile information',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: '2024-01-15T09:15:00.000Z',
      },
    ],
  })
  data!: any[]; // Replace with actual UserActivity[] type

  @ApiProperty({
    description: 'Success message',
    example: 'User activities retrieved successfully',
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp!: string;
}

export class UserActivitySummaryResponseDto {
  @ApiProperty({
    description: 'User activity summary data',
    example: {
      totalActivities: 45,
      lastActivity: '2024-01-15T10:30:00.000Z',
      activityTypes: {
        login: 15,
        profile_update: 8,
        appointment_booking: 12,
        message_sent: 10,
      },
    },
  })
  data!: any; // Replace with actual activity summary type

  @ApiProperty({
    description: 'Success message',
    example: 'Activity summary retrieved successfully',
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp!: string;
}

export class PhoneVerificationResponseDto {
  @ApiProperty({
    description: 'Phone verification data',
    example: {
      message: 'OTP sent successfully',
      phone: '+1234567890',
      expiresIn: '5 minutes',
    },
  })
  data!: {
    message: string;
    phone: string;
    expiresIn: string;
  };

  @ApiProperty({
    description: 'Success message',
    example: 'Verification OTP sent successfully',
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp!: string;
}

export class PhoneVerificationStatusResponseDto {
  @ApiProperty({
    description: 'Phone verification status data',
    example: {
      phone: '+1234567890',
      isVerified: true,
      verificationDate: '2024-01-10T15:30:00.000Z',
    },
  })
  data!: {
    phone: string;
    isVerified: boolean;
    verificationDate?: string;
  };

  @ApiProperty({
    description: 'Success message',
    example: 'Phone verification status retrieved successfully',
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp!: string;
}

export class ProfileCompletionRecalculationResponseDto {
  @ApiProperty({
    description: 'Profile completion recalculation data',
    example: {
      profileCompletionPercentage: 90,
      message: 'Profile completion percentage updated based on new information',
    },
  })
  data!: {
    profileCompletionPercentage: number;
    message: string;
  };

  @ApiProperty({
    description: 'Success message',
    example: 'Profile completion recalculated successfully',
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp!: string;
}

export class AllProfileCompletionsRecalculationResponseDto {
  @ApiProperty({
    description: 'All profile completions recalculation data',
    example: {
      updated: 150,
      total: 150,
      message: 'All user profile completion percentages have been recalculated',
    },
  })
  data!: {
    updated: number;
    total: number;
    message: string;
  };

  @ApiProperty({
    description: 'Success message',
    example: 'All profile completions recalculated successfully',
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp!: string;
}

export class AdminDashboardActivityResponseDto {
  @ApiProperty({
    description: 'Admin dashboard activity data',
    example: {
      activities: [
        {
          id: '012e3456-e89b-12d3-a456-426614174003',
          type: 'clinic_created',
          status: 'success',
          description: 'User created a new clinic',
          metadata: { clinicName: 'VetCare Clinic' },
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          createdAt: '2024-01-15T09:15:00.000Z',
          user: {
            id: '012e3456-e89b-12d3-a456-426614174004',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            role: 'veterinarian',
          },
        },
      ],
      totalActivities: 150,
      activityTypes: {
        clinic_created: 25,
        user_register: 45,
        appointment_booking: 80,
      },
      recentActivityCount: 50,
    },
  })
  data!: {
    activities: Array<{
      id: string;
      type: string;
      status: string;
      description: string;
      metadata?: unknown;
      ipAddress: string;
      userAgent: string;
      createdAt: string;
      user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
      };
    }>;
    totalActivities: number;
    activityTypes: Record<string, number>;
    recentActivityCount: number;
  };

  @ApiProperty({
    description: 'Success message',
    example: 'Admin dashboard activities retrieved successfully',
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp!: string;
}
