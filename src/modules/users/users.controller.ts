import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { CreateUserPreferencesDto, UpdateUserPreferencesDto } from './dto/user-preferences.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({
    summary: 'Create a new user (Admin only)',
    description: 'Administrative endpoint to create new users. Only accessible by admin users. Automatically sends verification email to new user.',
  })
  @ApiBody({
    description: 'User creation data',
    examples: {
      veterinarian: {
        summary: 'Create Veterinarian',
        value: {
          email: 'new.vet@clinic.com',
          password: 'SecurePass123!',
          firstName: 'Dr. Jane',
          lastName: 'Wilson',
          phone: '+1234567890',
          role: 'veterinarian',
          address: '456 Medical Plaza',
          city: 'Healthcare City',
          country: 'USA',
        },
      },
      staff: {
        summary: 'Create Staff Member',
        value: {
          email: 'staff@clinic.com',
          password: 'SecurePass123!',
          firstName: 'Alice',
          lastName: 'Johnson',
          phone: '+1234567891',
          role: 'staff',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      example: {
        id: 'uuid-string',
        email: 'new.vet@clinic.com',
        firstName: 'Dr. Jane',
        lastName: 'Wilson',
        role: 'veterinarian',
        isEmailVerified: false,
        isPhoneVerified: false,
        isActive: true,
        profileCompletionPercentage: 65,
        accountStatus: 'active',
        createdAt: '2024-01-01T12:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
    schema: {
      example: {
        statusCode: 400,
        message: ['email must be a valid email'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Request() req) {
    return this.usersService.findOne(req.user.id);
  }

  @Get('profile/completion')
  @ApiOperation({ summary: 'Get current user profile completion percentage' })
  @ApiResponse({ status: 200, description: 'Profile completion percentage retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfileCompletion(@Request() req) {
    const user = await this.usersService.findOne(req.user.id);
    return {
      completionPercentage: user.profileCompletionPercentage,
      missingFields: this.getMissingFields(user),
      suggestions: this.getProfileSuggestions(user),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'User profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // User Preferences Endpoints
  @Get('profile/preferences')
  @ApiOperation({ summary: 'Get current user preferences' })
  @ApiResponse({ status: 200, description: 'User preferences retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getUserPreferences(@Request() req) {
    return this.usersService.getUserPreferences(req.user.id);
  }

  @Patch('profile/preferences')
  @ApiOperation({ summary: 'Update current user preferences' })
  @ApiResponse({ status: 200, description: 'User preferences updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateUserPreferences(@Request() req, @Body() updatePreferencesDto: UpdateUserPreferencesDto) {
    return this.usersService.updateUserPreferences(req.user.id, updatePreferencesDto);
  }

  // User Activity Endpoints
  @Get('profile/activities')
  @ApiOperation({ summary: 'Get current user activities' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of activities to retrieve (default: 50)' })
  @ApiResponse({ status: 200, description: 'User activities retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getUserActivities(@Request() req, @Query('limit') limit?: number) {
    return this.usersService.getUserActivities(req.user.id, limit);
  }

  @Get('profile/activities/summary')
  @ApiOperation({ summary: 'Get current user activity summary' })
  @ApiResponse({ status: 200, description: 'User activity summary retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getActivitySummary(@Request() req) {
    return this.usersService.getActivitySummary(req.user.id);
  }

  // Admin-only User Management Endpoints
  @Post(':id/activate')
  @Roles('admin')
  @ApiOperation({ summary: 'Activate user account (Admin only)' })
  @ApiResponse({ status: 200, description: 'User activated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  activateUser(@Param('id') id: string) {
    return this.usersService.activate(id);
  }

  @Post(':id/deactivate')
  @Roles('admin')
  @ApiOperation({ summary: 'Deactivate user account (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  deactivateUser(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  @Get(':id/activities')
  @Roles('admin')
  @ApiOperation({ summary: 'Get user activities by ID (Admin only)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of activities to retrieve (default: 50)' })
  @ApiResponse({ status: 200, description: 'User activities retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUserActivitiesById(@Param('id') id: string, @Query('limit') limit?: number) {
    return this.usersService.getUserActivities(id, limit);
  }

  // Helper methods for profile completion
  private getMissingFields(user: any): string[] {
    const missingFields = [];
    if (!user.phone) missingFields.push('phone');
    if (!user.address) missingFields.push('address');
    if (!user.city) missingFields.push('city');
    if (!user.postalCode) missingFields.push('postalCode');
    if (!user.country) missingFields.push('country');
    if (!user.dateOfBirth) missingFields.push('dateOfBirth');
    if (!user.avatar) missingFields.push('avatar');
    if (!user.isEmailVerified) missingFields.push('emailVerification');
    if (!user.isPhoneVerified) missingFields.push('phoneVerification');
    return missingFields;
  }

  private getProfileSuggestions(user: any): string[] {
    const suggestions = [];

    if (!user.isEmailVerified) {
      suggestions.push('Verify your email address to unlock all features');
    }

    if (!user.isPhoneVerified) {
      suggestions.push('Add and verify your phone number for better security');
    }

    if (!user.avatar) {
      suggestions.push('Add a profile picture to personalize your account');
    }

    if (!user.address || !user.city) {
      suggestions.push('Complete your address information for better service');
    }

    if (!user.dateOfBirth) {
      suggestions.push('Add your date of birth for personalized recommendations');
    }

    return suggestions;
  }
}
