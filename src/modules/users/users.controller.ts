import { Body, Controller, Delete, ForbiddenException, Get, NotFoundException, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { FindUsersDto } from './dto/find-users.dto';
import { RequestPhoneVerificationDto, ResendPhoneVerificationDto, VerifyPhoneDto } from './dto/phone-verification.dto';
import { UpdateUserPreferencesDto } from './dto/user-preferences.dto';
import { AdminDashboardActivityResponseDto, PhoneVerificationStatusResponseDto, UserResponseDto, UsersListResponseDto } from './dto/user-response.dto';
import { UserRole } from './entities/user.entity';
import { UsersResponseService } from './users-response.service';
import { UsersService } from './users.service';

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

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersResponseService: UsersResponseService
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create a new user (Admin only)',
    description: 'Creates a new user account with the specified role and details. Only administrators can create new users.',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'array',
          items: { type: 'string' },
          example: ['email must be an email', 'password must be longer than or equal to 8 characters'],
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Forbidden - Admin access required' },
        error: { type: 'string', example: 'Forbidden' },
      },
    },
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.STAFF)
  @ApiOperation({
    summary: 'Get users with filtering, pagination, and sorting',
    description: 'Retrieves a paginated list of users with optional filtering and sorting. Admin users can see all users, while Staff and Veterinarians can only see their own people and patients.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term for filtering users by name or email',
    example: 'john',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    description: 'Filter users by role',
    enum: ['admin', 'veterinarian', 'staff', 'patient'],
    example: 'patient',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Filter users by active status',
    enum: ['true', 'false'],
    example: 'true',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: UsersListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Forbidden - Insufficient permissions' },
        error: { type: 'string', example: 'Forbidden' },
      },
    },
  })
  async findAll(@Request() req: AuthenticatedRequest, @Query() query: FindUsersDto) {
    // Pass the current user's role and query parameters to filter results appropriately
    return this.usersService.findAll(req.user.role as UserRole, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieves a specific user by their ID. Role-based access control applies: Admin can view any user, Staff/Vets can only view own people and patients, Patients can only view themselves.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'User not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Forbidden - You can only view your own profile' },
        error: { type: 'string', example: 'Forbidden' },
      },
    },
  })
  async findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const currentUserRole = req.user.role as UserRole;

    // Admin can view any user
    if (currentUserRole === UserRole.ADMIN) {
      return this.usersService.findOne(id);
    }

    // Patients can only view their own profile
    if (currentUserRole === UserRole.PATIENT) {
      if (req.user.id !== id) {
        throw new ForbiddenException('You can only view your own profile');
      }
      return this.usersService.findOne(id);
    }

    // Staff and veterinarians can only view their own people and patients
    if (currentUserRole === UserRole.VETERINARIAN || currentUserRole === UserRole.STAFF) {
      const targetUser = await this.usersService.findOne(id);

      // Can view patients (any patient)
      if (targetUser.role === UserRole.PATIENT) {
        return targetUser;
      }

      // Can view own people (staff/vets from same clinic)
      // This would need to be implemented based on clinic relationships
      throw new ForbiddenException('You can only view patients and your own clinic staff');
    }

    return this.usersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user (Role-based access: Admin can update any user, Staff/Vets can only update own people and patients, Patients can only update themselves)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req: AuthenticatedRequest) {
    const currentUserRole = req.user.role as UserRole;

    // Admin can update any user
    if (currentUserRole === UserRole.ADMIN) {
      return this.usersService.update(id, updateUserDto, currentUserRole);
    }

    // Patients can only update their own profile
    if (currentUserRole === UserRole.PATIENT) {
      if (req.user.id !== id) {
        throw new ForbiddenException('You can only update your own profile');
      }
      return this.usersService.update(id, updateUserDto, currentUserRole);
    }

    // Staff and veterinarians can only update their own people and patients
    if (currentUserRole === UserRole.VETERINARIAN || currentUserRole === UserRole.STAFF) {
      const targetUser = await this.usersService.findOne(id);

      // Can update patients (any patient)
      if (targetUser.role === UserRole.PATIENT) {
        return this.usersService.update(id, updateUserDto, currentUserRole);
      }

      // Can update people with same role (other staff/vets)
      if (targetUser.role === currentUserRole) {
        return this.usersService.update(id, updateUserDto, currentUserRole);
      }

      // Cannot update admins or other role types
      throw new ForbiddenException('You can only update patients and users with the same role as you');
    }

    return this.usersService.update(id, updateUserDto, currentUserRole);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    // Prevent admin from deleting themselves
    if (req.user.id === id) {
      throw new ForbiddenException('You cannot delete your own account');
    }

    return this.usersService.remove(id);
  }

  @Get('search/email')
  @Roles(UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.STAFF)
  @ApiOperation({ summary: 'Search user by email (Role-based access: Admin can search any user, Staff/Vets can only search own people and patients)' })
  @ApiQuery({ name: 'email', description: 'Email to search for' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async findByEmail(@Query('email') email: string, @Request() req: AuthenticatedRequest) {
    const currentUserRole = req.user.role as UserRole;
    const targetUser = await this.usersService.findByEmail(email);

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Admin can search any user
    if (currentUserRole === UserRole.ADMIN) {
      return targetUser;
    }

    // Staff and veterinarians can only search for their own people and patients
    if (currentUserRole === UserRole.VETERINARIAN || currentUserRole === UserRole.STAFF) {
      // Can search patients (any patient)
      if (targetUser.role === UserRole.PATIENT) {
        return targetUser;
      }

      // Can search people with same role (other staff/vets)
      if (targetUser.role === currentUserRole) {
        return targetUser;
      }

      // Cannot search admins or other role types
      throw new ForbiddenException('You can only search for patients and users with the same role as you');
    }

    return targetUser;
  }

  @Get('profile/me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Request() req: AuthenticatedRequest) {
    return this.usersService.findOne(req.user.id);
  }

  @Get('profile/completion')
  @ApiOperation({ summary: 'Get current user profile completion percentage' })
  @ApiResponse({
    status: 200,
    description: 'Profile completion retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfileCompletion(@Request() req: AuthenticatedRequest) {
    const user = await this.usersService.findOne(req.user.id);
    return {
      profileCompletionPercentage: user.profileCompletionPercentage,
    };
  }

  @Put('profile/me')
  @ApiOperation({ summary: 'Update current user profile (own data only)' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateOwnProfile(@Request() req: AuthenticatedRequest, @Body() updateUserDto: UpdateUserDto) {
    // Users can only update their own profile
    return this.usersService.update(req.user.id, updateUserDto, req.user.role as UserRole);
  }

  @Get('preferences/me')
  @ApiOperation({ summary: 'Get current user preferences' })
  @ApiResponse({
    status: 200,
    description: 'Preferences retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getUserPreferences(@Request() req: AuthenticatedRequest) {
    return this.usersService.getUserPreferences(req.user.id);
  }

  @Put('preferences/me')
  @ApiOperation({ summary: 'Update current user preferences' })
  @ApiResponse({ status: 200, description: 'Preferences updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateUserPreferences(@Request() req: AuthenticatedRequest, @Body() updatePreferencesDto: UpdateUserPreferencesDto) {
    return this.usersService.updateUserPreferences(req.user.id, updatePreferencesDto);
  }

  @Get('activities/me')
  @ApiOperation({ summary: 'Get current user activities' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of activities to retrieve',
  })
  @ApiResponse({
    status: 200,
    description: 'Activities retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getUserActivities(@Request() req: AuthenticatedRequest, @Query('limit') limit?: number) {
    return this.usersService.getUserActivities(req.user.id, limit);
  }

  @Get('activities/summary')
  @ApiOperation({ summary: 'Get current user activity summary' })
  @ApiResponse({
    status: 200,
    description: 'Activity summary retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getActivitySummary(@Request() req: AuthenticatedRequest) {
    return this.usersService.getActivitySummary(req.user.id);
  }

  @Post('profile/completion/recalculate')
  @ApiOperation({
    summary: 'Recalculate current user profile completion percentage',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile completion recalculated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async recalculateProfileCompletion(@Request() req: AuthenticatedRequest) {
    const profileCompletionPercentage = await this.usersService.recalculateProfileCompletion(req.user.id);
    return {
      profileCompletionPercentage,
      message: 'Profile completion percentage recalculated successfully',
    };
  }

  @Post('profile/completion/recalculate/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Recalculate profile completion percentage for a specific user (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile completion recalculated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async recalculateUserProfileCompletion(@Param('id') id: string) {
    const profileCompletionPercentage = await this.usersService.recalculateProfileCompletion(id);
    return {
      userId: id,
      profileCompletionPercentage,
      message: 'Profile completion percentage recalculated successfully',
    };
  }

  @Post('profile/completion/recalculate-all')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Recalculate profile completion for all users (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'All profile completions recalculated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async recalculateAllProfileCompletions() {
    const result = await this.usersService.recalculateAllProfileCompletions();
    return {
      ...result,
      message: `Successfully recalculated profile completion for ${result.updated} users`,
    };
  }

  @Post('phone/verification/request')
  @ApiOperation({ summary: 'Request phone verification OTP' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request or phone already verified',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async requestPhoneVerification(@Body() requestPhoneVerificationDto: RequestPhoneVerificationDto) {
    await this.usersService.requestPhoneVerification(requestPhoneVerificationDto.phone);
    return {
      message: 'Verification OTP sent successfully',
      phone: requestPhoneVerificationDto.phone,
      expiresIn: '10 minutes',
    };
  }

  @Post('phone/verification/verify')
  @ApiOperation({ summary: 'Verify phone with OTP' })
  @ApiResponse({ status: 200, description: 'Phone verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async verifyPhone(@Body() verifyPhoneDto: VerifyPhoneDto) {
    await this.usersService.verifyPhone(verifyPhoneDto.phone, verifyPhoneDto.otp);
    return {
      message: 'Phone number verified successfully',
      phone: verifyPhoneDto.phone,
    };
  }

  @Post('phone/verification/resend')
  @ApiOperation({ summary: 'Resend phone verification OTP' })
  @ApiResponse({ status: 200, description: 'OTP resent successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request or too frequent requests',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async resendPhoneVerification(@Body() resendPhoneVerificationDto: ResendPhoneVerificationDto) {
    await this.usersService.resendPhoneVerification(resendPhoneVerificationDto.phone);
    return {
      message: 'Verification OTP resent successfully',
      phone: resendPhoneVerificationDto.phone,
      expiresIn: '10 minutes',
    };
  }

  @Get('phone/verification/status')
  @ApiOperation({ summary: 'Check phone verification OTP status' })
  @ApiQuery({ name: 'phone', description: 'Phone number to check' })
  @ApiResponse({
    status: 200,
    description: 'Status retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async checkPhoneVerificationStatus(@Query('phone') phone: string) {
    const status = await this.usersService.checkPhoneVerificationStatus(phone);
    const data = {
      phone,
      ...status,
    };
    return this.usersResponseService.standardizePhoneVerificationStatusResponse(data, 'Phone verification status retrieved successfully');
  }

  @Get('phone-verification/status')
  @ApiOperation({
    summary: 'Get phone verification status',
    description: 'Retrieves the current phone verification status for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Phone verification status retrieved successfully',
    type: PhoneVerificationStatusResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getPhoneVerificationStatus(@Request() req: AuthenticatedRequest) {
    const user = await this.usersService.findOne(req.user.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.usersResponseService.standardizePhoneVerificationStatusResponse(
      {
        phone: user.phone,
        isVerified: user.isPhoneVerified,
        verificationDate: user.phoneVerificationExpiresAt,
      },
      'Phone verification status retrieved successfully'
    );
  }

  @Get('admin/dashboard/activities')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get admin dashboard activities (Admin only)',
    description: 'Retrieves the latest system activities for admin dashboard. Includes user activities, activity counts, and summary statistics.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of activities to retrieve (default: 50, max: 100)',
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'Admin dashboard activities retrieved successfully',
    type: AdminDashboardActivityResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Forbidden - Admin access required' },
        error: { type: 'string', example: 'Forbidden' },
      },
    },
  })
  async getAdminDashboardActivities(@Query('limit') limit: number = 50) {
    // Validate limit parameter
    const validatedLimit = Math.min(Math.max(limit || 50, 1), 100);

    const activities = await this.usersService.getAdminDashboardActivities(validatedLimit);

    return this.usersResponseService.standardizeAdminDashboardActivityResponse(activities, 'Admin dashboard activities retrieved successfully');
  }
}
