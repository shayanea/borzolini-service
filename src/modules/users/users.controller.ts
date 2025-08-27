import { Body, Controller, Delete, ForbiddenException, Get, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { PhoneVerificationStatusDto, RequestPhoneVerificationDto, ResendPhoneVerificationDto, VerifyPhoneDto } from './dto/phone-verification.dto';
import { UpdateUserPreferencesDto } from './dto/user-preferences.dto';
import { UserRole } from './entities/user.entity';
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
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.STAFF)
  @ApiOperation({ summary: 'Get all users (Staff/Vets/Admins only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (Staff/Vets/Admins can view any user, Patients can only view themselves)' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    // Staff, vets, and admins can view any user
    if ([UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.STAFF].includes(req.user.role as UserRole)) {
      return this.usersService.findOne(id);
    }

    // Patients can only view their own profile
    if (req.user.id !== id) {
      throw new ForbiddenException('You can only view your own profile');
    }

    return this.usersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user (Staff/Vets/Admins can update any user, Patients can only update themselves)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req: AuthenticatedRequest) {
    // Staff, vets, and admins can update any user
    if ([UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.STAFF].includes(req.user.role as UserRole)) {
      return this.usersService.update(id, updateUserDto);
    }

    // Patients can only update their own profile
    if (req.user.id !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }

    return this.usersService.update(id, updateUserDto);
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
  @ApiOperation({ summary: 'Search user by email (Staff/Vets/Admins only)' })
  @ApiQuery({ name: 'email', description: 'Email to search for' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async findByEmail(@Query('email') email: string) {
    return this.usersService.findByEmail(email);
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
    return this.usersService.update(req.user.id, updateUserDto);
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
    type: PhoneVerificationStatusDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async checkPhoneVerificationStatus(@Query('phone') phone: string): Promise<PhoneVerificationStatusDto> {
    const status = await this.usersService.checkPhoneVerificationStatus(phone);
    return {
      phone,
      ...status,
    };
  }
}
