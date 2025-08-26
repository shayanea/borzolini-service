import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Param,
  Res,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import {
  LoginDto,
  RegisterDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from "./dto/auth.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { Response, Request as ExpressRequest } from "express";

// Define the user type from JWT payload
interface JwtUser {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

// Extend Express Request to include user
interface AuthenticatedRequest extends ExpressRequest {
  user: JwtUser;
}

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Register a new user account",
    description:
      "Create a new user account with email verification. Supports multiple user roles including patient, veterinarian, staff, and admin.",
  })
  @ApiBody({
    description: "User registration data",
    examples: {
      patient: {
        summary: "Patient Registration",
        description: "Register as a patient",
        value: {
          email: "patient@example.com",
          password: "SecurePass123!",
          firstName: "John",
          lastName: "Doe",
          phone: "+1234567890",
          role: "patient",
        },
      },
      veterinarian: {
        summary: "Veterinarian Registration",
        description: "Register as a veterinarian",
        value: {
          email: "dr.smith@clinic.com",
          password: "VetPass123!",
          firstName: "Dr. Sarah",
          lastName: "Smith",
          phone: "+1234567891",
          role: "veterinarian",
          address: "123 Vet Street",
          city: "Medical City",
          country: "USA",
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description:
      "User registered successfully. Email verification sent. Authentication cookies set.",
    schema: {
      example: {
        user: {
          id: "uuid-string",
          email: "patient@example.com",
          firstName: "John",
          lastName: "Doe",
          role: "patient",
          isEmailVerified: false,
          isPhoneVerified: false,
          profileCompletionPercentage: 45,
          accountStatus: "active",
        },
        message:
          "Registration successful. Please check your email to verify your account.",
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - validation error",
    schema: {
      example: {
        statusCode: 400,
        message: [
          "email must be a valid email",
          "password must be longer than or equal to 8 characters",
        ],
        error: "Bad Request",
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: "Conflict - user already exists",
    schema: {
      example: {
        statusCode: 409,
        message: "User with this email already exists",
        error: "Conflict",
      },
    },
  })
  async register(
    @Body() registerDto: RegisterDto,
    @Request() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.register(registerDto, req, res);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "User login authentication",
    description:
      "Authenticate user with email and password. Sets authentication cookies for accessing protected endpoints. Includes account security features like login attempt tracking and account locking.",
  })
  @ApiBody({
    description: "User login credentials",
    examples: {
      patient: {
        summary: "Patient Login",
        value: {
          email: "john.doe@example.com",
          password: "Password123!",
        },
      },
      veterinarian: {
        summary: "Veterinarian Login",
        value: {
          email: "dr.smith@borzolini.com",
          password: "Password123!",
        },
      },
      admin: {
        summary: "Admin Login",
        value: {
          email: "admin@borzolini.com",
          password: "Password123!",
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      "Login successful - returns user data and sets authentication cookies",
    schema: {
      example: {
        user: {
          id: "uuid-string",
          email: "john.doe@example.com",
          firstName: "John",
          lastName: "Doe",
          role: "patient",
          isEmailVerified: true,
          isPhoneVerified: false,
          profileCompletionPercentage: 75,
          accountStatus: "active",
        },
        message: "Login successful",
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - invalid credentials or unverified account",
    schema: {
      example: {
        statusCode: 401,
        message: "Invalid credentials",
        error: "Unauthorized",
      },
    },
  })
  @ApiResponse({
    status: 423,
    description:
      "Locked - account is temporarily locked due to failed attempts",
    schema: {
      example: {
        statusCode: 423,
        message: "Account is locked until 2024-01-01T12:30:00Z",
        error: "Locked",
      },
    },
  })
  async login(
    @Body() loginDto: LoginDto,
    @Request() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(loginDto, req, res);
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Refresh access token",
    description:
      "Refresh the access token using the refresh token from cookies. Sets new authentication cookies.",
  })
  @ApiResponse({ status: 200, description: "Token refreshed successfully" })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - invalid refresh token",
  })
  async refresh(
    @Request() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refreshToken(req, res);
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "User logout",
    description: "Logout user and clear authentication cookies",
  })
  @ApiResponse({ status: 200, description: "Logout successful" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async logout(
    @Request() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logout(req.user.id, req, res);
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({ status: 200, description: "User profile retrieved" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getProfile(@Request() req: AuthenticatedRequest) {
    return this.authService.getProfile(req.user.id);
  }

  @Post("change-password")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Change user password" })
  @ApiResponse({ status: 200, description: "Password changed successfully" })
  @ApiResponse({
    status: 400,
    description: "Bad request - invalid current password",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async changePassword(
    @Request() req: AuthenticatedRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      req.user.id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }

  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Request password reset" })
  @ApiResponse({ status: 200, description: "Password reset email sent" })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reset password with token" })
  @ApiResponse({ status: 200, description: "Password reset successfully" })
  @ApiResponse({
    status: 400,
    description: "Bad request - invalid or expired token",
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }

  @Post("verify-email/:token")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Verify email address",
    description:
      "Verify user email address using the token sent via email during registration. This activates the user account for login.",
  })
  @ApiParam({
    name: "token",
    description: "Email verification token received via email",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  @ApiResponse({
    status: 200,
    description: "Email verified successfully - account is now active",
    schema: {
      example: {
        message: "Email verified successfully",
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - invalid or expired token",
    schema: {
      example: {
        statusCode: 400,
        message: "Invalid or expired verification token",
        error: "Bad Request",
      },
    },
  })
  async verifyEmail(@Param("token") token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post("resend-verification")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Resend email verification" })
  @ApiResponse({
    status: 200,
    description: "Verification email sent successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - email already verified",
  })
  async resendVerification(@Body() body: { email: string }) {
    return this.authService.resendVerificationEmail(body.email);
  }

  @Post("request-phone-verification")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Request phone verification OTP" })
  @ApiResponse({
    status: 200,
    description: "Phone verification OTP sent successfully",
  })
  async requestPhoneVerification(@Body() body: { phone: string }) {
    return this.authService.requestPhoneVerification(body.phone);
  }

  @Post("verify-phone")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Verify phone number with OTP" })
  @ApiResponse({ status: 200, description: "Phone verified successfully" })
  @ApiResponse({
    status: 400,
    description: "Bad request - invalid or expired OTP",
  })
  async verifyPhone(@Body() body: { phone: string; otp: string }) {
    return this.authService.verifyPhone(body.phone, body.otp);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user information" })
  @ApiResponse({ status: 200, description: "User information retrieved" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getCurrentUser(@Request() req: AuthenticatedRequest) {
    return this.authService.getProfile(req.user.id);
  }

  @Get("status")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user authentication status" })
  @ApiResponse({ status: 200, description: "Authentication status retrieved" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getAuthStatus(@Request() req: AuthenticatedRequest) {
    const user = await this.authService.getProfile(req.user.id);
    return {
      isAuthenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        profileCompletionPercentage: user.profileCompletionPercentage,
        accountStatus: user.accountStatus,
      },
      lastLoginAt: user.lastLoginAt,
    };
  }
}
