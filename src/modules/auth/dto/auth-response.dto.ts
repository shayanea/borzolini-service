import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    description: 'Authentication data',
    example: {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      expiresIn: 3600,
      tokenType: 'Bearer'
    }
  })
  data!: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
  };

  @ApiProperty({
    description: 'Success message',
    example: 'Login successful'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}

export class RegisterResponseDto {
  @ApiProperty({
    description: 'Registration data',
    example: {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'patient',
      isEmailVerified: false,
      isPhoneVerified: false,
      profileCompletionPercentage: 25
    }
  })
  data!: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    profileCompletionPercentage: number;
  };

  @ApiProperty({
    description: 'Success message',
    example: 'User registered successfully. Please verify your email.'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}

export class RefreshTokenResponseDto {
  @ApiProperty({
    description: 'Token refresh data',
    example: {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      expiresIn: 3600,
      tokenType: 'Bearer'
    }
  })
  data!: {
    accessToken: string;
    expiresIn: number;
    tokenType: string;
  };

  @ApiProperty({
    description: 'Success message',
    example: 'Token refreshed successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}

export class LogoutResponseDto {
  @ApiProperty({
    description: 'Logout data',
    example: {
      message: 'Successfully logged out',
      logoutTime: '2024-01-15T10:30:00.000Z'
    }
  })
  data!: {
    message: string;
    logoutTime: string;
  };

  @ApiProperty({
    description: 'Success message',
    example: 'Logout successful'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}

export class ForgotPasswordResponseDto {
  @ApiProperty({
    description: 'Password reset data',
    example: {
      message: 'Password reset email sent',
      email: 'john.doe@example.com',
      resetTokenExpiry: '2024-01-15T12:30:00.000Z'
    }
  })
  data!: {
    message: string;
    email: string;
    resetTokenExpiry: string;
  };

  @ApiProperty({
    description: 'Success message',
    example: 'Password reset email sent successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}

export class ResetPasswordResponseDto {
  @ApiProperty({
    description: 'Password reset confirmation data',
    example: {
      message: 'Password reset successful',
      userId: '123e4567-e89b-12d3-a456-426614174000',
      resetTime: '2024-01-15T10:30:00.000Z'
    }
  })
  data!: {
    message: string;
    userId: string;
    resetTime: string;
  };

  @ApiProperty({
    description: 'Success message',
    example: 'Password reset successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}

export class ChangePasswordResponseDto {
  @ApiProperty({
    description: 'Password change confirmation data',
    example: {
      message: 'Password changed successfully',
      userId: '123e4567-e89b-12d3-a456-426614174000',
      changeTime: '2024-01-15T10:30:00.000Z',
      requiresReauth: true
    }
  })
  data!: {
    message: string;
    userId: string;
    changeTime: string;
    requiresReauth: boolean;
  };

  @ApiProperty({
    description: 'Success message',
    example: 'Password changed successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}

export class EmailVerificationResponseDto {
  @ApiProperty({
    description: 'Email verification data',
    example: {
      message: 'Verification email sent',
      email: 'john.doe@example.com',
      verificationTokenExpiry: '2024-01-15T12:30:00.000Z',
      resendCount: 0
    }
  })
  data!: {
    message: string;
    email: string;
    verificationTokenExpiry: string;
    resendCount: number;
  };

  @ApiProperty({
    description: 'Success message',
    example: 'Verification email sent successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}

export class EmailVerificationConfirmResponseDto {
  @ApiProperty({
    description: 'Email verification confirmation data',
    example: {
      message: 'Email verified successfully',
      userId: '123e4567-e89b-12d3-a456-426614174000',
      email: 'john.doe@example.com',
      verificationTime: '2024-01-15T10:30:00.000Z',
      profileCompletionPercentage: 35
    }
  })
  data!: {
    message: string;
    userId: string;
    email: string;
    verificationTime: string;
    profileCompletionPercentage: number;
  };

  @ApiProperty({
    description: 'Success message',
    example: 'Email verified successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}

export class PhoneVerificationResponseDto {
  @ApiProperty({
    description: 'Phone verification data',
    example: {
      message: 'Verification SMS sent',
      phone: '+1234567890',
      verificationCodeExpiry: '2024-01-15T10:35:00.000Z',
      resendCount: 0
    }
  })
  data!: {
    message: string;
    phone: string;
    verificationCodeExpiry: string;
    resendCount: number;
  };

  @ApiProperty({
    description: 'Success message',
    example: 'Verification SMS sent successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}

export class PhoneVerificationConfirmResponseDto {
  @ApiProperty({
    description: 'Phone verification confirmation data',
    example: {
      message: 'Phone verified successfully',
      userId: '123e4567-e89b-12d3-a456-426614174000',
      phone: '+1234567890',
      verificationTime: '2024-01-15T10:30:00.000Z',
      profileCompletionPercentage: 45
    }
  })
  data!: {
    message: string;
    userId: string;
    phone: string;
    verificationTime: string;
    profileCompletionPercentage: number;
  };

  @ApiProperty({
    description: 'Success message',
    example: 'Phone verified successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}

export class TwoFactorAuthSetupResponseDto {
  @ApiProperty({
    description: 'Two-factor authentication setup data',
    example: {
      message: '2FA setup initiated',
      secret: 'JBSWY3DPEHPK3PXP',
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      backupCodes: ['12345678', '87654321', '11223344', '44332211'],
      setupTime: '2024-01-15T10:30:00.000Z'
    }
  })
  data!: {
    message: string;
    secret: string;
    qrCode: string;
    backupCodes: string[];
    setupTime: string;
  };

  @ApiProperty({
    description: 'Success message',
    example: 'Two-factor authentication setup initiated'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}

export class TwoFactorAuthVerifyResponseDto {
  @ApiProperty({
    description: 'Two-factor authentication verification data',
    example: {
      message: '2FA verification successful',
      userId: '123e4567-e89b-12d3-a456-426614174000',
      isEnabled: true,
      verificationTime: '2024-01-15T10:30:00.000Z'
    }
  })
  data!: {
    message: string;
    userId: string;
    isEnabled: boolean;
    verificationTime: string;
  };

  @ApiProperty({
    description: 'Success message',
    example: 'Two-factor authentication verified successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}

export class SessionInfoResponseDto {
  @ApiProperty({
    description: 'Session information data',
    example: {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      email: 'john.doe@example.com',
      role: 'patient',
      isEmailVerified: true,
      isPhoneVerified: true,
      profileCompletionPercentage: 85,
      lastLogin: '2024-01-15T08:00:00.000Z',
      sessionExpiry: '2024-01-15T12:00:00.000Z',
      activeSessions: 1,
      twoFactorEnabled: false
    }
  })
  data!: {
    userId: string;
    email: string;
    role: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    profileCompletionPercentage: number;
    lastLogin: string;
    sessionExpiry: string;
    activeSessions: number;
    twoFactorEnabled: boolean;
  };

  @ApiProperty({
    description: 'Success message',
    example: 'Session information retrieved successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}
