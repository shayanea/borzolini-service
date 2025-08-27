import { COMMON_DTO_EXAMPLES, USER_DTO_EXAMPLES } from './dto-examples';

/**
 * Comprehensive Swagger Examples for API Documentation
 * This file contains detailed examples that can be used across your API endpoints
 *
 * DTO-specific examples are imported from dto-examples.ts to keep DTOs clean
 */

// User Examples
export const USER_EXAMPLES = {
  CREATE_USER: {
    summary: 'Create User Example',
    value: {
      email: USER_DTO_EXAMPLES.EMAIL,
      password: USER_DTO_EXAMPLES.PASSWORD,
      firstName: USER_DTO_EXAMPLES.FIRST_NAME,
      lastName: USER_DTO_EXAMPLES.LAST_NAME,
      phone: USER_DTO_EXAMPLES.PHONE,
      role: USER_DTO_EXAMPLES.ROLE,
      address: USER_DTO_EXAMPLES.ADDRESS,
      city: USER_DTO_EXAMPLES.CITY,
      country: USER_DTO_EXAMPLES.COUNTRY,
      postalCode: USER_DTO_EXAMPLES.POSTAL_CODE,
      dateOfBirth: USER_DTO_EXAMPLES.DATE_OF_BIRTH,
      gender: USER_DTO_EXAMPLES.GENDER,
      emergencyContactName: USER_DTO_EXAMPLES.EMERGENCY_CONTACT_NAME,
      emergencyContactPhone: USER_DTO_EXAMPLES.EMERGENCY_CONTACT_PHONE,
      emergencyContactRelationship: USER_DTO_EXAMPLES.EMERGENCY_CONTACT_RELATIONSHIP,
      medicalHistory: USER_DTO_EXAMPLES.MEDICAL_HISTORY,
      allergies: USER_DTO_EXAMPLES.ALLERGIES,
      medications: USER_DTO_EXAMPLES.MEDICATIONS,
    },
  },
  USER_RESPONSE: {
    summary: 'User Response Example',
    value: {
      data: {
        id: COMMON_DTO_EXAMPLES.UUID,
        email: USER_DTO_EXAMPLES.EMAIL,
        firstName: USER_DTO_EXAMPLES.FIRST_NAME,
        lastName: USER_DTO_EXAMPLES.LAST_NAME,
        phone: USER_DTO_EXAMPLES.PHONE,
        role: USER_DTO_EXAMPLES.ROLE,
        avatar: 'https://example.com/avatar.jpg',
        dateOfBirth: USER_DTO_EXAMPLES.DATE_OF_BIRTH,
        address: USER_DTO_EXAMPLES.ADDRESS,
        city: USER_DTO_EXAMPLES.CITY,
        postalCode: USER_DTO_EXAMPLES.POSTAL_CODE,
        country: USER_DTO_EXAMPLES.COUNTRY,
        preferredLanguage: 'en',
        timezone: 'America/New_York',
        gender: USER_DTO_EXAMPLES.GENDER,
        emergencyContactName: USER_DTO_EXAMPLES.EMERGENCY_CONTACT_NAME,
        emergencyContactPhone: USER_DTO_EXAMPLES.EMERGENCY_CONTACT_PHONE,
        emergencyContactRelationship: USER_DTO_EXAMPLES.EMERGENCY_CONTACT_RELATIONSHIP,
        medicalHistory: USER_DTO_EXAMPLES.MEDICAL_HISTORY,
        allergies: USER_DTO_EXAMPLES.ALLERGIES,
        medications: USER_DTO_EXAMPLES.MEDICATIONS,
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: false,
        lastLoginAt: COMMON_DTO_EXAMPLES.TIMESTAMP,
        createdAt: COMMON_DTO_EXAMPLES.TIMESTAMP,
        updatedAt: COMMON_DTO_EXAMPLES.TIMESTAMP,
      },
      message: 'User retrieved successfully',
      timestamp: COMMON_DTO_EXAMPLES.TIMESTAMP,
    },
  },
};

// Users List Examples
export const USERS_LIST_EXAMPLES = {
  USERS_LIST_RESPONSE: {
    summary: 'Users List Response Example',
    value: {
      data: [
        {
          id: COMMON_DTO_EXAMPLES.UUID,
          email: USER_DTO_EXAMPLES.EMAIL,
          firstName: USER_DTO_EXAMPLES.FIRST_NAME,
          lastName: USER_DTO_EXAMPLES.LAST_NAME,
          role: USER_DTO_EXAMPLES.ROLE,
          isActive: true,
          createdAt: COMMON_DTO_EXAMPLES.TIMESTAMP,
        },
        {
          id: '456e7890-e89b-12d3-a456-426614174001',
          email: 'jane.smith@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'veterinarian',
          isActive: true,
          createdAt: COMMON_DTO_EXAMPLES.TIMESTAMP,
        },
      ],
      total: 150,
      page: 1,
      totalPages: 15,
      message: 'Users retrieved successfully',
      timestamp: '2024-01-15T10:30:00.000Z',
    },
  },
};

// Error Response Examples
export const ERROR_EXAMPLES = {
  VALIDATION_ERROR: {
    summary: 'Validation Error Example',
    value: {
      statusCode: 400,
      message: ['email must be an email', 'password must be longer than or equal to 8 characters', 'firstName should not be empty'],
      error: 'Bad Request',
      timestamp: COMMON_DTO_EXAMPLES.TIMESTAMP,
      path: '/api/v1/users',
    },
  },
  NOT_FOUND_ERROR: {
    summary: 'Not Found Error Example',
    value: {
      statusCode: 404,
      message: 'User not found',
      error: 'Not Found',
      timestamp: COMMON_DTO_EXAMPLES.TIMESTAMP,
      path: '/api/v1/users/999e9999-e99b-99d3-a999-999999999999',
    },
  },
  UNAUTHORIZED_ERROR: {
    summary: 'Unauthorized Error Example',
    value: {
      statusCode: 401,
      message: 'Unauthorized',
      error: 'Unauthorized',
      timestamp: COMMON_DTO_EXAMPLES.TIMESTAMP,
      path: '/api/v1/users',
    },
  },
  FORBIDDEN_ERROR: {
    summary: 'Forbidden Error Example',
    value: {
      statusCode: 403,
      message: 'Forbidden - Admin access required',
      error: 'Forbidden',
      timestamp: COMMON_DTO_EXAMPLES.TIMESTAMP,
      path: '/api/v1/users',
    },
  },
  CONFLICT_ERROR: {
    summary: 'Conflict Error Example',
    value: {
      statusCode: 409,
      message: 'User with this email already exists',
      error: 'Conflict',
      timestamp: COMMON_DTO_EXAMPLES.TIMESTAMP,
      path: '/api/v1/users',
    },
  },
  INTERNAL_SERVER_ERROR: {
    summary: 'Internal Server Error Example',
    value: {
      statusCode: 500,
      message: 'Internal server error',
      error: 'Internal Server Error',
      timestamp: COMMON_DTO_EXAMPLES.TIMESTAMP,
      path: '/api/v1/users',
    },
  },
};

// Success Response Examples
export const SUCCESS_EXAMPLES = {
  CREATED_RESPONSE: {
    summary: 'Created Response Example',
    value: {
      data: {
        id: COMMON_DTO_EXAMPLES.UUID,
        email: USER_DTO_EXAMPLES.EMAIL,
        firstName: USER_DTO_EXAMPLES.FIRST_NAME,
        lastName: USER_DTO_EXAMPLES.LAST_NAME,
      },
      message: 'User created successfully',
      timestamp: COMMON_DTO_EXAMPLES.TIMESTAMP,
      id: COMMON_DTO_EXAMPLES.UUID,
      createdAt: COMMON_DTO_EXAMPLES.TIMESTAMP,
    },
  },
  UPDATED_RESPONSE: {
    summary: 'Updated Response Example',
    value: {
      data: {
        id: COMMON_DTO_EXAMPLES.UUID,
        firstName: USER_DTO_EXAMPLES.FIRST_NAME,
        lastName: 'Smith',
      },
      message: 'User updated successfully',
      timestamp: COMMON_DTO_EXAMPLES.TIMESTAMP,
      id: COMMON_DTO_EXAMPLES.UUID,
      updatedAt: COMMON_DTO_EXAMPLES.TIMESTAMP,
      affectedRows: 1,
    },
  },
  DELETED_RESPONSE: {
    summary: 'Deleted Response Example',
    value: {
      data: {
        id: COMMON_DTO_EXAMPLES.UUID,
      },
      message: 'User deleted successfully',
      timestamp: COMMON_DTO_EXAMPLES.TIMESTAMP,
      id: COMMON_DTO_EXAMPLES.UUID,
      deletedAt: COMMON_DTO_EXAMPLES.TIMESTAMP,
      affectedRows: 1,
    },
  },
};

// Phone Verification Examples
export const PHONE_VERIFICATION_EXAMPLES = {
  REQUEST_VERIFICATION: {
    summary: 'Request Phone Verification Example',
    value: {
      phone: '+1234567890',
    },
  },
  VERIFY_OTP: {
    summary: 'Verify OTP Example',
    value: {
      phone: '+1234567890',
      otp: '123456',
    },
  },
  VERIFICATION_RESPONSE: {
    summary: 'Phone Verification Response Example',
    value: {
      data: {
        message: 'OTP sent successfully',
        phone: '+1234567890',
        expiresIn: '5 minutes',
      },
      message: 'Verification OTP sent successfully',
      timestamp: COMMON_DTO_EXAMPLES.TIMESTAMP,
    },
  },
  VERIFICATION_STATUS: {
    summary: 'Phone Verification Status Example',
    value: {
      data: {
        phone: USER_DTO_EXAMPLES.PHONE,
        isVerified: true,
        verificationDate: COMMON_DTO_EXAMPLES.TIMESTAMP,
      },
      message: 'Phone verification status retrieved successfully',
      timestamp: COMMON_DTO_EXAMPLES.TIMESTAMP,
    },
  },
};

// Profile Completion Examples
export const PROFILE_COMPLETION_EXAMPLES = {
  PROFILE_COMPLETION_RESPONSE: {
    summary: 'Profile Completion Response Example',
    value: {
      data: {
        profileCompletionPercentage: 85,
      },
      message: 'Profile completion retrieved successfully',
      timestamp: COMMON_DTO_EXAMPLES.TIMESTAMP,
    },
  },
  PROFILE_COMPLETION_RECALCULATION: {
    summary: 'Profile Completion Recalculation Example',
    value: {
      data: {
        profileCompletionPercentage: 90,
        message: 'Profile completion percentage updated based on new information',
      },
      message: 'Profile completion recalculated successfully',
      timestamp: COMMON_DTO_EXAMPLES.TIMESTAMP,
    },
  },
};

// Health Check Examples
export const HEALTH_CHECK_EXAMPLES = {
  HEALTH_CHECK_RESPONSE: {
    summary: 'Health Check Response Example',
    value: {
      data: {
        status: 'healthy',
        uptime: 86400,
        environment: 'development',
        version: '1.0.0',
        database: 'connected',
        services: {
          email: 'healthy',
          sms: 'healthy',
          storage: 'healthy',
        },
      },
      message: 'Service health check completed',
      timestamp: COMMON_DTO_EXAMPLES.TIMESTAMP,
    },
  },
};

// Query Parameter Examples
export const QUERY_EXAMPLES = {
  PAGINATION: {
    summary: 'Pagination Query Example',
    value: {
      page: 1,
      limit: 10,
      search: USER_DTO_EXAMPLES.FIRST_NAME.toLowerCase(),
      role: USER_DTO_EXAMPLES.ROLE,
      isActive: 'true',
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    },
  },
  FILTERING: {
    summary: 'Filtering Query Example',
    value: {
      search: 'veterinarian',
      role: 'veterinarian',
      isActive: 'true',
      city: USER_DTO_EXAMPLES.CITY,
      dateFrom: '2024-01-01',
      dateTo: '2024-01-31',
    },
  },
};

// Request Header Examples
export const HEADER_EXAMPLES = {
  AUTHENTICATION: {
    summary: 'Authentication Header Example',
    value: {
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  },
  CORS: {
    summary: 'CORS Headers Example',
    value: {
      Origin: 'http://localhost:3000',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type, Authorization',
    },
  },
};
