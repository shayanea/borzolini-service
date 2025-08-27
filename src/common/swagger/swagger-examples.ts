import { ApiProperty } from '@nestjs/swagger';

/**
 * Comprehensive Swagger Examples for API Documentation
 * This file contains detailed examples that can be used across your API endpoints
 */

// User Examples
export const USER_EXAMPLES = {
  CREATE_USER: {
    summary: 'Create User Example',
    value: {
      email: 'john.doe@example.com',
      password: 'securePassword123',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      role: 'patient',
      address: '123 Main St',
      city: 'New York',
      country: 'USA',
      postalCode: '10001',
      dateOfBirth: '1990-01-01',
      gender: 'male',
      emergencyContactName: 'Jane Doe',
      emergencyContactPhone: '+1234567891',
      emergencyContactRelationship: 'spouse',
      medicalHistory: 'No significant medical history',
      allergies: 'None known',
      medications: 'None'
    }
  },
  USER_RESPONSE: {
    summary: 'User Response Example',
    value: {
      data: {
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
        medicalHistory: 'No significant medical history',
        allergies: 'None known',
        medications: 'None',
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: false,
        lastLoginAt: '2024-01-15T10:30:00.000Z',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z'
      },
      message: 'User retrieved successfully',
      timestamp: '2024-01-15T10:30:00.000Z'
    }
  }
};

// Users List Examples
export const USERS_LIST_EXAMPLES = {
  USERS_LIST_RESPONSE: {
    summary: 'Users List Response Example',
    value: {
      data: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'patient',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z'
        },
        {
          id: '456e7890-e89b-12d3-a456-426614174001',
          email: 'jane.smith@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'veterinarian',
          isActive: true,
          createdAt: '2024-01-02T00:00:00.000Z'
        }
      ],
      total: 150,
      page: 1,
      totalPages: 15,
      message: 'Users retrieved successfully',
      timestamp: '2024-01-15T10:30:00.000Z'
    }
  }
};

// Error Response Examples
export const ERROR_EXAMPLES = {
  VALIDATION_ERROR: {
    summary: 'Validation Error Example',
    value: {
      statusCode: 400,
      message: [
        'email must be an email',
        'password must be longer than or equal to 8 characters',
        'firstName should not be empty'
      ],
      error: 'Bad Request',
      timestamp: '2024-01-15T10:30:00.000Z',
      path: '/api/v1/users'
    }
  },
  NOT_FOUND_ERROR: {
    summary: 'Not Found Error Example',
    value: {
      statusCode: 404,
      message: 'User not found',
      error: 'Not Found',
      timestamp: '2024-01-15T10:30:00.000Z',
      path: '/api/v1/users/999e9999-e99b-99d3-a999-999999999999'
    }
  },
  UNAUTHORIZED_ERROR: {
    summary: 'Unauthorized Error Example',
    value: {
      statusCode: 401,
      message: 'Unauthorized',
      error: 'Unauthorized',
      timestamp: '2024-01-15T10:30:00.000Z',
      path: '/api/v1/users'
    }
  },
  FORBIDDEN_ERROR: {
    summary: 'Forbidden Error Example',
    value: {
      statusCode: 403,
      message: 'Forbidden - Admin access required',
      error: 'Forbidden',
      timestamp: '2024-01-15T10:30:00.000Z',
      path: '/api/v1/users'
    }
  },
  CONFLICT_ERROR: {
    summary: 'Conflict Error Example',
    value: {
      statusCode: 409,
      message: 'User with this email already exists',
      error: 'Conflict',
      timestamp: '2024-01-15T10:30:00.000Z',
      path: '/api/v1/users'
    }
  },
  INTERNAL_SERVER_ERROR: {
    summary: 'Internal Server Error Example',
    value: {
      statusCode: 500,
      message: 'Internal server error',
      error: 'Internal Server Error',
      timestamp: '2024-01-15T10:30:00.000Z',
      path: '/api/v1/users'
    }
  }
};

// Success Response Examples
export const SUCCESS_EXAMPLES = {
  CREATED_RESPONSE: {
    summary: 'Created Response Example',
    value: {
      data: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe'
      },
      message: 'User created successfully',
      timestamp: '2024-01-15T10:30:00.000Z',
      id: '123e4567-e89b-12d3-a456-426614174000',
      createdAt: '2024-01-15T10:30:00.000Z'
    }
  },
  UPDATED_RESPONSE: {
    summary: 'Updated Response Example',
    value: {
      data: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        firstName: 'John',
        lastName: 'Smith'
      },
      message: 'User updated successfully',
      timestamp: '2024-01-15T10:30:00.000Z',
      id: '123e4567-e89b-12d3-a456-426614174000',
      updatedAt: '2024-01-15T10:30:00.000Z',
      affectedRows: 1
    }
  },
  DELETED_RESPONSE: {
    summary: 'Deleted Response Example',
    value: {
      data: {
        id: '123e4567-e89b-12d3-a456-426614174000'
      },
      message: 'User deleted successfully',
      timestamp: '2024-01-15T10:30:00.000Z',
      id: '123e4567-e89b-12d3-a456-426614174000',
      deletedAt: '2024-01-15T10:30:00.000Z',
      affectedRows: 1
    }
  }
};

// Phone Verification Examples
export const PHONE_VERIFICATION_EXAMPLES = {
  REQUEST_VERIFICATION: {
    summary: 'Request Phone Verification Example',
    value: {
      phone: '+1234567890'
    }
  },
  VERIFY_OTP: {
    summary: 'Verify OTP Example',
    value: {
      phone: '+1234567890',
      otp: '123456'
    }
  },
  VERIFICATION_RESPONSE: {
    summary: 'Phone Verification Response Example',
    value: {
      data: {
        message: 'OTP sent successfully',
        phone: '+1234567890',
        expiresIn: '5 minutes'
      },
      message: 'Verification OTP sent successfully',
      timestamp: '2024-01-15T10:30:00.000Z'
    }
  },
  VERIFICATION_STATUS: {
    summary: 'Phone Verification Status Example',
    value: {
      data: {
        phone: '+1234567890',
        isVerified: true,
        verificationDate: '2024-01-10T15:30:00.000Z'
      },
      message: 'Phone verification status retrieved successfully',
      timestamp: '2024-01-15T10:30:00.000Z'
    }
  }
};

// Profile Completion Examples
export const PROFILE_COMPLETION_EXAMPLES = {
  PROFILE_COMPLETION_RESPONSE: {
    summary: 'Profile Completion Response Example',
    value: {
      data: {
        profileCompletionPercentage: 85
      },
      message: 'Profile completion retrieved successfully',
      timestamp: '2024-01-15T10:30:00.000Z'
    }
  },
  PROFILE_COMPLETION_RECALCULATION: {
    summary: 'Profile Completion Recalculation Example',
    value: {
      data: {
        profileCompletionPercentage: 90,
        message: 'Profile completion percentage updated based on new information'
      },
      message: 'Profile completion recalculated successfully',
      timestamp: '2024-01-15T10:30:00.000Z'
    }
  }
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
          storage: 'healthy'
        }
      },
      message: 'Service health check completed',
      timestamp: '2024-01-15T10:30:00.000Z'
    }
  }
};

// Query Parameter Examples
export const QUERY_EXAMPLES = {
  PAGINATION: {
    summary: 'Pagination Query Example',
    value: {
      page: 1,
      limit: 10,
      search: 'john',
      role: 'patient',
      isActive: 'true',
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    }
  },
  FILTERING: {
    summary: 'Filtering Query Example',
    value: {
      search: 'veterinarian',
      role: 'veterinarian',
      isActive: 'true',
      city: 'New York',
      dateFrom: '2024-01-01',
      dateTo: '2024-01-31'
    }
  }
};

// Request Header Examples
export const HEADER_EXAMPLES = {
  AUTHENTICATION: {
    summary: 'Authentication Header Example',
    value: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  },
  CORS: {
    summary: 'CORS Headers Example',
    value: {
      'Origin': 'http://localhost:3000',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type, Authorization'
    }
  }
};
