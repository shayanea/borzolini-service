import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { CreateUserDto, UpdateUserDto } from "./dto/create-user.dto";
import { UpdateUserPreferencesDto } from "./dto/user-preferences.dto";
import {
  RequestPhoneVerificationDto,
  VerifyPhoneDto,
  ResendPhoneVerificationDto,
  PhoneVerificationStatusDto,
} from "./dto/phone-verification.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Request as ExpressRequest } from "express";

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

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new user" })
  @ApiResponse({ status: 201, description: "User created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all users" })
  @ApiResponse({ status: 200, description: "Users retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user by ID" })
  @ApiResponse({ status: 200, description: "User retrieved successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update user" })
  @ApiResponse({ status: 200, description: "User updated successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete user" })
  @ApiResponse({ status: 200, description: "User deleted successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }

  @Get("search/email")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Search user by email" })
  @ApiQuery({ name: "email", description: "Email to search for" })
  @ApiResponse({ status: 200, description: "User found" })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async findByEmail(@Query("email") email: string) {
    return this.usersService.findByEmail(email);
  }

  @Get("profile/me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({ status: 200, description: "Profile retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  getProfile(@Request() req: AuthenticatedRequest) {
    return this.usersService.findOne(req.user.id);
  }

  @Get("profile/completion")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user profile completion percentage" })
  @ApiResponse({
    status: 200,
    description: "Profile completion retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getProfileCompletion(@Request() req: AuthenticatedRequest) {
    const user = await this.usersService.findOne(req.user.id);
    return {
      profileCompletionPercentage: user.profileCompletionPercentage,
    };
  }

  @Put("profile/me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update current user profile" })
  @ApiResponse({ status: 200, description: "Profile updated successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @Get("preferences/me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user preferences" })
  @ApiResponse({
    status: 200,
    description: "Preferences retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  getUserPreferences(@Request() req: AuthenticatedRequest) {
    return this.usersService.getUserPreferences(req.user.id);
  }

  @Put("preferences/me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update current user preferences" })
  @ApiResponse({ status: 200, description: "Preferences updated successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  updateUserPreferences(
    @Request() req: AuthenticatedRequest,
    @Body() updatePreferencesDto: UpdateUserPreferencesDto,
  ) {
    return this.usersService.updateUserPreferences(
      req.user.id,
      updatePreferencesDto,
    );
  }

  @Get("activities/me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user activities" })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of activities to retrieve",
  })
  @ApiResponse({
    status: 200,
    description: "Activities retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  getUserActivities(
    @Request() req: AuthenticatedRequest,
    @Query("limit") limit?: number,
  ) {
    return this.usersService.getUserActivities(req.user.id, limit);
  }

  @Get("activities/summary")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user activity summary" })
  @ApiResponse({
    status: 200,
    description: "Activity summary retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  getActivitySummary(@Request() req: AuthenticatedRequest) {
    return this.usersService.getActivitySummary(req.user.id);
  }

  @Post("profile/completion/recalculate")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Recalculate current user profile completion percentage",
  })
  @ApiResponse({
    status: 200,
    description: "Profile completion recalculated successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async recalculateProfileCompletion(@Request() req: AuthenticatedRequest) {
    const profileCompletionPercentage =
      await this.usersService.recalculateProfileCompletion(req.user.id);
    return {
      profileCompletionPercentage,
      message: "Profile completion percentage recalculated successfully",
    };
  }

  @Post("profile/completion/recalculate/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      "Recalculate profile completion percentage for a specific user (Admin only)",
  })
  @ApiResponse({
    status: 200,
    description: "Profile completion recalculated successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  @ApiResponse({ status: 404, description: "User not found" })
  async recalculateUserProfileCompletion(
    @Param("id") id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    // Check if user is admin
    if (req.user.role !== "admin") {
      throw new Error("Admin access required");
    }

    const profileCompletionPercentage =
      await this.usersService.recalculateProfileCompletion(id);
    return {
      userId: id,
      profileCompletionPercentage,
      message: "Profile completion percentage recalculated successfully",
    };
  }

  @Post("profile/completion/recalculate-all")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Recalculate profile completion for all users (Admin only)",
  })
  @ApiResponse({
    status: 200,
    description: "All profile completions recalculated successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async recalculateAllProfileCompletions(@Request() req: AuthenticatedRequest) {
    // Check if user is admin
    if (req.user.role !== "admin") {
      throw new Error("Admin access required");
    }

    const result = await this.usersService.recalculateAllProfileCompletions();
    return {
      ...result,
      message: `Successfully recalculated profile completion for ${result.updated} users`,
    };
  }

  @Post("phone/verification/request")
  @ApiOperation({ summary: "Request phone verification OTP" })
  @ApiResponse({ status: 200, description: "OTP sent successfully" })
  @ApiResponse({
    status: 400,
    description: "Bad request or phone already verified",
  })
  @ApiResponse({ status: 404, description: "User not found" })
  async requestPhoneVerification(
    @Body() requestPhoneVerificationDto: RequestPhoneVerificationDto,
  ) {
    await this.usersService.requestPhoneVerification(
      requestPhoneVerificationDto.phone,
    );
    return {
      message: "Verification OTP sent successfully",
      phone: requestPhoneVerificationDto.phone,
      expiresIn: "10 minutes",
    };
  }

  @Post("phone/verification/verify")
  @ApiOperation({ summary: "Verify phone with OTP" })
  @ApiResponse({ status: 200, description: "Phone verified successfully" })
  @ApiResponse({ status: 400, description: "Invalid or expired OTP" })
  @ApiResponse({ status: 404, description: "User not found" })
  async verifyPhone(@Body() verifyPhoneDto: VerifyPhoneDto) {
    await this.usersService.verifyPhone(
      verifyPhoneDto.phone,
      verifyPhoneDto.otp,
    );
    return {
      message: "Phone number verified successfully",
      phone: verifyPhoneDto.phone,
    };
  }

  @Post("phone/verification/resend")
  @ApiOperation({ summary: "Resend phone verification OTP" })
  @ApiResponse({ status: 200, description: "OTP resent successfully" })
  @ApiResponse({
    status: 400,
    description: "Bad request or too frequent requests",
  })
  @ApiResponse({ status: 404, description: "User not found" })
  async resendPhoneVerification(
    @Body() resendPhoneVerificationDto: ResendPhoneVerificationDto,
  ) {
    await this.usersService.resendPhoneVerification(
      resendPhoneVerificationDto.phone,
    );
    return {
      message: "Verification OTP resent successfully",
      phone: resendPhoneVerificationDto.phone,
      expiresIn: "10 minutes",
    };
  }

  @Get("phone/verification/status")
  @ApiOperation({ summary: "Check phone verification OTP status" })
  @ApiQuery({ name: "phone", description: "Phone number to check" })
  @ApiResponse({
    status: 200,
    description: "Status retrieved successfully",
    type: PhoneVerificationStatusDto,
  })
  @ApiResponse({ status: 404, description: "User not found" })
  async checkPhoneVerificationStatus(
    @Query("phone") phone: string,
  ): Promise<PhoneVerificationStatusDto> {
    const status = await this.usersService.checkPhoneVerificationStatus(phone);
    return {
      phone,
      ...status,
    };
  }
}
