import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { EmailService } from '../../common/email.service';
import { SmsService } from '../../common/sms.service';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { UpdateUserPreferencesDto } from './dto/user-preferences.dto';
import { ActivityStatus, ActivityType, UserActivity } from './entities/user-activity.entity';
import { UserPreferences } from './entities/user-preferences.entity';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);
  private isInitialized = false;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserPreferences)
    private userPreferencesRepository: Repository<UserPreferences>,
    @InjectRepository(UserActivity)
    private userActivityRepository: Repository<UserActivity>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private smsService: SmsService,
    private emailService: EmailService
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing Users service...');

    try {
      await this.validateDependencies();
      await this.validateConfiguration();

      this.isInitialized = true;
      this.logger.log('Users service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Users service:', error);
      throw error;
    }
  }

  private async validateDependencies(): Promise<void> {
    // Check if required services are ready
    if (!this.smsService.isServiceReady()) {
      this.logger.warn('SMS service not ready, some functionality may be limited');
    }

    if (!this.emailService.isServiceReady()) {
      this.logger.warn('Email service not ready, some functionality may be limited');
    }

    // Check if repositories are available
    if (!this.userRepository || !this.userPreferencesRepository || !this.userActivityRepository) {
      throw new Error('Required repositories not available');
    }

    this.logger.log('User service dependencies validated successfully');
  }

  private async validateConfiguration(): Promise<void> {
    const requiredVars = ['JWT_SECRET', 'BCRYPT_ROUNDS'];
    const missingVars: string[] = [];

    for (const varName of requiredVars) {
      const value = this.configService.get(varName);
      if (!value) {
        missingVars.push(varName);
      }
    }

    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Validate JWT secret
    const jwtSecret = this.configService.get<string>('JWT_SECRET')!;
    if (jwtSecret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long');
    }

    // Validate bcrypt rounds
    const bcryptRounds = this.configService.get<number>('BCRYPT_ROUNDS', 12);
    if (bcryptRounds < 10 || bcryptRounds > 16) {
      throw new Error('BCRYPT_ROUNDS must be between 10 and 16');
    }

    this.logger.log('User service configuration validated successfully');
  }

  private mapRoleToEnum(role: string): UserRole {
    switch (role) {
      case 'admin':
        return UserRole.ADMIN;
      case 'veterinarian':
        return UserRole.VETERINARIAN;
      case 'staff':
        return UserRole.STAFF;
      case 'patient':
      default:
        return UserRole.PATIENT;
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    if (!this.isInitialized) {
      throw new Error('Users service not initialized');
    }

    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate phone number if provided
    if (createUserDto.phone && !this.smsService.validatePhoneNumber(createUserDto.phone)) {
      throw new BadRequestException('Invalid phone number format');
    }

    const saltRounds = parseInt(this.configService.get('BCRYPT_ROUNDS') || '12');
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    const user = this.userRepository.create({
      ...createUserDto,
      passwordHash: hashedPassword,
      role: createUserDto.role ? this.mapRoleToEnum(createUserDto.role) : UserRole.PATIENT,
      isEmailVerified: false,
      isPhoneVerified: false,
      isActive: true,
      loginAttempts: 0,
      profileCompletionPercentage: 0,
      accountStatus: 'active',
    });

    const savedUser = await this.userRepository.save(user);

    // Create user preferences
    await this.userPreferencesRepository.save(
      this.userPreferencesRepository.create({
        userId: savedUser.id,
        notificationSettings: {
          email: {
            appointments: true,
            reminders: true,
            healthAlerts: true,
            marketing: false,
            newsletter: true,
          },
          sms: {
            appointments: true,
            reminders: true,
            healthAlerts: true,
          },
          push: {
            appointments: true,
            reminders: true,
            healthAlerts: true,
          },
        },
        privacySettings: {
          profileVisibility: 'public',
          showPhone: true,
          showAddress: false,
          showEmail: false,
          allowContact: true,
        },
        communicationPreferences: {
          preferredLanguage: 'en',
          preferredContactMethod: 'email',
          timezone: 'UTC',
          quietHours: {
            enabled: false,
            startTime: '22:00',
            endTime: '08:00',
          },
        },
        theme: 'auto',
        isActive: true,
      })
    );

    // Generate email verification token
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    // Send verification email if email service is ready
    if (this.emailService.isServiceReady()) {
      try {
        const verificationToken = this.jwtService.sign({ email: savedUser.email, type: 'email_verification' }, { secret: jwtSecret, expiresIn: '24h' });

        await this.emailService.sendVerificationEmail(savedUser.email, savedUser.firstName, verificationToken);
        this.logger.log(`Verification email sent to ${savedUser.email}`);
      } catch (error) {
        this.logger.error(`Failed to send verification email to ${savedUser.email}:`, error);
        // Don't fail user creation if email fails
      }
    } else {
      this.logger.warn('Email service not ready, skipping verification email');
    }

    // Send welcome SMS if SMS service is ready and phone is provided
    if (this.smsService.isServiceReady() && savedUser.phone) {
      try {
        const formattedPhone = this.smsService.formatPhoneNumber(savedUser.phone);
        await this.smsService.sendNotification(formattedPhone, `Welcome to Borzolini Clinic, ${savedUser.firstName}! Your account has been created successfully.`);
        this.logger.log(`Welcome SMS sent to ${formattedPhone}`);
      } catch (error) {
        this.logger.error(`Failed to send welcome SMS to ${savedUser.phone}:`, error);
        // Don't fail user creation if SMS fails
      }
    } else if (savedUser.phone) {
      this.logger.warn('SMS service not ready, skipping welcome SMS');
    }

    // Log user creation activity
    await this.logUserActivity(savedUser.id, ActivityType.REGISTER, ActivityStatus.SUCCESS, {
      email: savedUser.email,
      role: savedUser.role,
      method: 'email',
    });

    return savedUser;
  }

  async findAll(userRole?: UserRole): Promise<User[]> {
    // If no role specified, return all users (admin access)
    if (!userRole) {
      return this.userRepository.find({
        select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt'],
      });
    }

    // For veterinarians and staff, only show their own people and patients
    if (userRole === UserRole.VETERINARIAN || userRole === UserRole.STAFF) {
      return this.userRepository.find({
        where: [
          { role: UserRole.PATIENT }, // Can see all patients
          { role: userRole }, // Can see people with same role
        ],
        select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt'],
      });
    }

    // Admin can see all users
    return this.userRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt', 'accountStatus'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['preferences', 'activities'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { phone } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const updatedUser = await this.userRepository.save({
      ...user,
      ...updateUserDto,
    });

    // Calculate and update profile completion percentage
    const profileCompletionPercentage = await this.calculateProfileCompletion(updatedUser);
    await this.userRepository.update(id, { profileCompletionPercentage });

    // Remove password hash from response
    const result = { ...updatedUser };
    delete (result as any).passwordHash;
    return { ...result, profileCompletionPercentage } as User;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async clearRefreshToken(userId: string): Promise<void> {
    const user = await this.findOne(userId);
    (user as any).refreshToken = undefined;
    (user as any).refreshTokenExpiresAt = undefined;
    await this.userRepository.save(user);
  }

  async updateRefreshToken(userId: string, refreshToken: string, expiresAt: Date): Promise<void> {
    const user = await this.findOne(userId);
    user.refreshToken = refreshToken;
    user.refreshTokenExpiresAt = expiresAt;
    await this.userRepository.save(user);
  }

  async verifyEmail(token: string): Promise<void> {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: jwtSecret,
      });

      if (payload.type !== 'email_verification') {
        throw new BadRequestException('Invalid token type');
      }

      const user = await this.findOne(payload.sub);

      if (user.emailVerificationToken !== token) {
        throw new BadRequestException('Invalid verification token');
      }

      if (user.emailVerificationExpiresAt && user.emailVerificationExpiresAt < new Date()) {
        throw new BadRequestException('Verification token expired');
      }

      user.isEmailVerified = true;
      (user as any).emailVerificationToken = undefined;
      (user as any).emailVerificationExpiresAt = undefined;
      await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Invalid or expired verification token');
    }
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const emailVerificationToken = this.jwtService.sign({ type: 'email_verification' }, { secret: jwtSecret, expiresIn: '24h' });

    await this.userRepository.update(user.id, {
      emailVerificationToken,
      emailVerificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  }

  async requestPhoneVerification(phone: string): Promise<void> {
    // Find user by phone number
    const user = await this.findByPhone(phone);
    if (!user) {
      throw new NotFoundException('User with this phone number not found');
    }

    // Check if phone is already verified
    if (user.isPhoneVerified) {
      throw new BadRequestException('Phone number is already verified');
    }

    // Generate 6-digit OTP
    const otp = this.generateOTP();

    // Set OTP expiry to 10 minutes
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Update user with OTP and expiry
    await this.userRepository.update(user.id, {
      phoneVerificationOTP: otp,
      phoneVerificationExpiresAt: otpExpiry,
    });

    // Send OTP via SMS
    const smsResult = await this.smsService.sendVerificationOtp(phone, otp);

    if (!smsResult.success) {
      // If SMS fails, still log the OTP for development/testing
      this.logger.warn(`SMS failed for ${phone}, OTP logged for development: ${otp}`, undefined, {
        service: 'UsersService',
        method: 'sendPhoneVerificationOtp',
        phone,
      });
    }

    // Log the verification request activity
    await this.logUserActivity(user.id, ActivityType.PHONE_VERIFICATION, ActivityStatus.PENDING, { phone, otpExpiry, smsSuccess: smsResult.success }, undefined, undefined);
  }

  async verifyPhone(phone: string, otp: string): Promise<void> {
    // Find user by phone number
    const user = await this.findByPhone(phone);
    if (!user) {
      throw new NotFoundException('User with this phone number not found');
    }

    // Check if OTP exists
    if (!user.phoneVerificationOTP) {
      throw new BadRequestException('No verification OTP found. Please request a new one.');
    }

    // Check if OTP has expired
    if (user.phoneVerificationExpiresAt && user.phoneVerificationExpiresAt < new Date()) {
      // Clear expired OTP
      await this.userRepository.update(user.id, {
        phoneVerificationOTP: null as any,
        phoneVerificationExpiresAt: null as any,
      });
      throw new BadRequestException('Verification OTP has expired. Please request a new one.');
    }

    // Verify OTP
    if (user.phoneVerificationOTP !== otp) {
      // Log failed attempt
      await this.logUserActivity(user.id, ActivityType.PHONE_VERIFICATION, ActivityStatus.FAILED, { phone, reason: 'Invalid OTP' }, undefined, undefined);
      throw new BadRequestException('Invalid verification OTP');
    }

    // Mark phone as verified and clear OTP
    await this.userRepository.update(user.id, {
      isPhoneVerified: true,
      phoneVerificationOTP: null as any,
      phoneVerificationExpiresAt: null as any,
    });

    // Log successful verification
    await this.logUserActivity(user.id, ActivityType.PHONE_VERIFICATION, ActivityStatus.SUCCESS, { phone }, undefined, undefined);

    // Recalculate profile completion since phone verification affects it
    const updatedUser = await this.findOne(user.id);
    const profileCompletionPercentage = await this.calculateProfileCompletion(updatedUser);
    await this.userRepository.update(user.id, { profileCompletionPercentage });
  }

  /**
   * Generate a 6-digit OTP for phone verification
   * @returns string 6-digit OTP
   */
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Resend phone verification OTP
   * @param phone Phone number to resend OTP to
   */
  async resendPhoneVerification(phone: string): Promise<void> {
    // Find user by phone number
    const user = await this.findByPhone(phone);
    if (!user) {
      throw new NotFoundException('User with this phone number not found');
    }

    // Check if phone is already verified
    if (user.isPhoneVerified) {
      throw new BadRequestException('Phone number is already verified');
    }

    // Check if there's a recent OTP request (prevent spam)
    if (user.phoneVerificationExpiresAt && user.phoneVerificationExpiresAt > new Date(Date.now() - 60 * 1000)) {
      throw new BadRequestException('Please wait at least 1 minute before requesting a new OTP');
    }

    // Generate new OTP
    const otp = this.generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Update user with new OTP and expiry
    await this.userRepository.update(user.id, {
      phoneVerificationOTP: otp,
      phoneVerificationExpiresAt: otpExpiry,
    });

    // Send OTP via SMS
    const smsResult = await this.smsService.sendVerificationOtp(phone, otp);

    if (!smsResult.success) {
      // If SMS fails, still log the OTP for development/testing
      this.logger.warn(`SMS failed for ${phone}, OTP resent logged for development: ${otp}`, undefined, {
        service: 'UsersService',
        method: 'resendPhoneVerification',
        phone,
      });
    }

    // Log the resend activity
    await this.logUserActivity(user.id, ActivityType.PHONE_VERIFICATION, ActivityStatus.PENDING, { phone, otpExpiry, action: 'resend', smsSuccess: smsResult.success }, undefined, undefined);
  }

  /**
   * Check if phone verification OTP is still valid
   * @param phone Phone number to check
   * @returns Promise<{ isValid: boolean; expiresAt: Date | null }>
   */
  async checkPhoneVerificationStatus(phone: string): Promise<{ isValid: boolean; expiresAt: Date | null }> {
    const user = await this.findByPhone(phone);
    if (!user) {
      throw new NotFoundException('User with this phone number not found');
    }

    if (!user.phoneVerificationOTP || !user.phoneVerificationExpiresAt) {
      return { isValid: false, expiresAt: null };
    }

    const isValid = user.phoneVerificationExpiresAt > new Date();
    return { isValid, expiresAt: user.phoneVerificationExpiresAt };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) {
      return; // Don't reveal if user exists
    }

    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const resetToken = this.jwtService.sign({ sub: user.id, type: 'password_reset' }, { secret: jwtSecret, expiresIn: '1h' });

    await this.userRepository.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: jwtSecret,
      });

      if (payload.type !== 'password_reset') {
        throw new BadRequestException('Invalid token type');
      }

      const user = await this.findOne(payload.sub);

      if (user.passwordResetToken !== token) {
        throw new BadRequestException('Invalid reset token');
      }

      if (user.passwordResetExpiresAt && user.passwordResetExpiresAt < new Date()) {
        throw new BadRequestException('Reset token expired');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      user.passwordHash = hashedPassword;
      (user as any).passwordResetToken = undefined;
      (user as any).passwordResetExpiresAt = undefined;
      (user as any).lockedUntil = undefined;
      user.loginAttempts = 0;
      await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Invalid or expired reset token');
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.findOne(userId);

    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.userRepository.update(userId, {
      passwordHash: hashedPassword,
    });
  }

  async handleFailedLogin(email: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) {
      return;
    }

    const newLoginAttempts = (user.loginAttempts || 0) + 1;
    const maxAttempts = 5;

    if (newLoginAttempts >= maxAttempts) {
      const lockDuration = 15 * 60 * 1000; // 15 minutes
      const lockedUntil = new Date(Date.now() + lockDuration);

      await this.userRepository.update(user.id, {
        loginAttempts: newLoginAttempts,
        lockedUntil,
      });
    } else {
      await this.userRepository.update(user.id, {
        loginAttempts: newLoginAttempts,
      });
    }
  }

  async handleSuccessfulLogin(userId: string): Promise<void> {
    const user = await this.findOne(userId);
    user.loginAttempts = 0;
    (user as any).lockedUntil = undefined;
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      lastLoginAt: new Date(),
    });
  }

  async handleLogout(userId: string): Promise<void> {
    // Log logout activity
    await this.logUserActivity(userId, ActivityType.LOGOUT, ActivityStatus.SUCCESS, {}, undefined, undefined);
  }

  async getUserPreferences(userId: string): Promise<UserPreferences> {
    const preferences = await this.userPreferencesRepository.findOne({
      where: { userId },
    });

    if (!preferences) {
      throw new NotFoundException('User preferences not found');
    }

    return preferences;
  }

  async updateUserPreferences(userId: string, updatePreferencesDto: UpdateUserPreferencesDto): Promise<UserPreferences> {
    const preferences = await this.getUserPreferences(userId);

    const updatedPreferences = await this.userPreferencesRepository.save({
      ...preferences,
      ...updatePreferencesDto,
    });

    return updatedPreferences;
  }

  async getUserActivities(userId: string, limit: number = 50): Promise<UserActivity[]> {
    return this.userActivityRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getActivitySummary(userId: string): Promise<any> {
    const activities = await this.getUserActivities(userId, 100);

    const activityCounts = activities.reduce(
      (acc, activity) => {
        acc[activity.type] = (acc[activity.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalActivities: activities.length,
      activityCounts,
      lastActivity: activities.length > 0 ? activities[0]?.createdAt : null,
      mostCommonActivity: Object.entries(activityCounts).reduce((a, b) => ((activityCounts[a[0]] || 0) > (activityCounts[b[0]] || 0) ? a : b))?.[0] || null,
    };
  }

  async logUserActivity(userId: string, type: ActivityType, status: ActivityStatus, metadata: any, ipAddress?: string, userAgent?: string): Promise<void> {
    const activity = this.userActivityRepository.create({
      userId,
      type,
      status,
      description: type,
      metadata,
      ipAddress: ipAddress || 'unknown',
      userAgent: userAgent || 'unknown',
      createdAt: new Date(),
    });

    await this.userActivityRepository.save(activity);
  }

  /**
   * Calculate the profile completion percentage for a user
   * @param user The user entity to calculate completion for
   * @returns Promise<number> The completion percentage (0-100)
   */
  private async calculateProfileCompletion(user: User): Promise<number> {
    // Define field weights and categories
    const requiredFields = [
      { field: 'firstName' as keyof User, weight: 10 },
      { field: 'lastName' as keyof User, weight: 10 },
      { field: 'email' as keyof User, weight: 15 },
      { field: 'phone' as keyof User, weight: 10 },
      { field: 'dateOfBirth' as keyof User, weight: 8 },
      { field: 'address' as keyof User, weight: 8 },
      { field: 'city' as keyof User, weight: 5 },
      { field: 'country' as keyof User, weight: 5 },
    ];

    const importantFields = [
      { field: 'gender' as keyof User, weight: 5 },
      { field: 'emergencyContactName' as keyof User, weight: 8 },
      { field: 'emergencyContactPhone' as keyof User, weight: 8 },
      { field: 'emergencyContactRelationship' as keyof User, weight: 3 },
      { field: 'avatar' as keyof User, weight: 3 },
    ];

    const medicalFields = [
      { field: 'medicalHistory' as keyof User, weight: 3 },
      { field: 'allergies' as keyof User, weight: 3 },
      { field: 'medications' as keyof User, weight: 3 },
    ];

    const insuranceFields = [
      { field: 'insuranceProvider' as keyof User, weight: 2 },
      { field: 'insurancePolicyNumber' as keyof User, weight: 2 },
      { field: 'insuranceGroupNumber' as keyof User, weight: 2 },
      { field: 'insuranceExpiryDate' as keyof User, weight: 2 },
    ];

    const allFields = [...requiredFields, ...importantFields, ...medicalFields, ...insuranceFields];
    let totalScore = 0;
    let maxPossibleScore = 0;

    // Calculate scores for each field category
    for (const fieldInfo of allFields) {
      const { field, weight } = fieldInfo;
      maxPossibleScore += weight;

      const value = user[field];
      if (value) {
        // Check if the field has meaningful content
        if (typeof value === 'string' && value.trim().length > 0) {
          totalScore += weight;
        } else if (typeof value === 'object' && value !== null) {
          totalScore += weight;
        } else if (typeof value === 'boolean' || typeof value === 'number') {
          totalScore += weight;
        }
      }
    }

    // Calculate percentage and ensure it's between 0 and 100
    const percentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
    return Math.min(Math.max(percentage, 0), 100);
  }

  /**
   * Manually recalculate and update profile completion percentage for a user
   * @param userId The ID of the user to recalculate completion for
   * @returns Promise<number> The new completion percentage
   */
  async recalculateProfileCompletion(userId: string): Promise<number> {
    const user = await this.findOne(userId);
    const profileCompletionPercentage = await this.calculateProfileCompletion(user);

    await this.userRepository.update(userId, { profileCompletionPercentage });

    return profileCompletionPercentage;
  }

  /**
   * Recalculate profile completion for all users (useful for maintenance)
   * @returns Promise<{ updated: number; errors: string[] }> Summary of the operation
   */
  async recalculateAllProfileCompletions(): Promise<{
    updated: number;
    errors: string[];
  }> {
    const users = await this.userRepository.find();
    let updated = 0;
    const errors: string[] = [];

    for (const user of users) {
      try {
        const profileCompletionPercentage = await this.calculateProfileCompletion(user);
        await this.userRepository.update(user.id, {
          profileCompletionPercentage,
        });
        updated++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(`Failed to update user ${user.id}: ${errorMessage}`);
      }
    }

    return { updated, errors };
  }
}
