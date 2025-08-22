import { Injectable, NotFoundException, ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { UserPreferences } from './entities/user-preferences.entity';
import { UserActivity, ActivityType, ActivityStatus } from './entities/user-activity.entity';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { CreateUserPreferencesDto, UpdateUserPreferencesDto } from './dto/user-preferences.dto';
import { EmailService } from '../../common/email.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserPreferences)
    private readonly userPreferencesRepository: Repository<UserPreferences>,
    @InjectRepository(UserActivity)
    private readonly userActivityRepository: Repository<UserActivity>,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const passwordHash = await bcrypt.hash(createUserDto.password, saltRounds);

    // Generate email verification token
    const emailVerificationToken = this.jwtService.sign({ type: 'email_verification' }, { secret: this.configService.get<string>('JWT_SECRET'), expiresIn: '24h' });

    // Create user
    const user = this.userRepository.create({
      ...createUserDto,
      passwordHash,
      role: createUserDto.role || 'patient',
      isEmailVerified: false,
      isPhoneVerified: false,
      isActive: true,
      emailVerificationToken,
      emailVerificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      preferredLanguage: createUserDto.preferredLanguage || 'en',
      timezone: createUserDto.timezone || 'UTC',
    });

    const savedUser = await this.userRepository.save(user);

    // Create default user preferences
    await this.createDefaultUserPreferences(savedUser.id);

    // Send verification email
    await this.emailService.sendVerificationEmail(savedUser.email, savedUser.firstName, emailVerificationToken);

    // Log user registration activity
    await this.logUserActivity(savedUser.id, ActivityType.REGISTER, ActivityStatus.SUCCESS, {
      email: savedUser.email,
      role: savedUser.role,
    });

    // Remove sensitive data from response
    delete savedUser.passwordHash;
    delete savedUser.refreshToken;
    delete savedUser.refreshTokenExpiresAt;
    delete savedUser.emailVerificationToken;
    delete savedUser.emailVerificationExpiresAt;

    return savedUser;
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'avatar', 'isActive', 'createdAt'],
    });
    return users;
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'avatar',
        'dateOfBirth',
        'address',
        'city',
        'postalCode',
        'country',
        'isEmailVerified',
        'isPhoneVerified',
        'isActive',
        'lastLoginAt',
        'createdAt',
        'updatedAt',
        'preferredLanguage',
        'timezone',
      ],
      relations: ['preferences'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check if email is being changed and if it's already taken
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('Email is already taken');
      }
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);

    // Log profile update activity
    await this.logUserActivity(id, ActivityType.PROFILE_UPDATE, ActivityStatus.SUCCESS, {
      updatedFields: Object.keys(updateUserDto),
    });

    // Remove sensitive data from response
    delete updatedUser.passwordHash;
    delete updatedUser.refreshToken;
    delete updatedUser.refreshTokenExpiresAt;
    delete updatedUser.emailVerificationToken;
    delete updatedUser.emailVerificationExpiresAt;

    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, {
      lastLoginAt: new Date(),
    });
  }

  async updateRefreshToken(id: string, refreshToken: string, expiresAt: Date): Promise<void> {
    await this.userRepository.update(id, {
      refreshToken,
      refreshTokenExpiresAt: expiresAt,
    });
  }

  async clearRefreshToken(id: string): Promise<void> {
    await this.userRepository.update(id, {
      refreshToken: null,
      refreshTokenExpiresAt: null,
    });
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      if (payload.type !== 'email_verification') {
        throw new BadRequestException('Invalid token type');
      }

      const user = await this.userRepository.findOne({
        where: {
          emailVerificationToken: token,
          emailVerificationExpiresAt: new Date(payload.exp * 1000),
        },
      });

      if (!user) {
        throw new BadRequestException('Invalid or expired verification token');
      }

      await this.userRepository.update(user.id, {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiresAt: null,
      });

      // Log email verification activity
      await this.logUserActivity(user.id, ActivityType.EMAIL_VERIFICATION, ActivityStatus.SUCCESS);

      // Send welcome email
      await this.emailService.sendWelcomeEmail(user.email, user.firstName);
    } catch (error) {
      throw new BadRequestException('Invalid or expired verification token');
    }
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return;
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate new verification token
    const emailVerificationToken = this.jwtService.sign({ type: 'email_verification' }, { secret: this.configService.get<string>('JWT_SECRET'), expiresIn: '24h' });

    await this.userRepository.update(user.id, {
      emailVerificationToken,
      emailVerificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    // Send new verification email
    await this.emailService.sendVerificationEmail(user.email, user.firstName, emailVerificationToken);
  }

  async requestPhoneVerification(phone: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { phone } });
    if (!user) {
      // Don't reveal if user exists
      return;
    }

    if (user.isPhoneVerified) {
      throw new BadRequestException('Phone is already verified');
    }

    // Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.userRepository.update(user.id, {
      phoneVerificationOTP: otp,
      phoneVerificationExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    // Send SMS with OTP
    await this.emailService.sendPhoneVerificationSMS(phone, otp);
  }

  async verifyPhone(phone: string, otp: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: {
        phone,
        phoneVerificationOTP: otp,
        phoneVerificationExpiresAt: new Date(),
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    await this.userRepository.update(user.id, {
      isPhoneVerified: true,
      phoneVerificationOTP: null,
      phoneVerificationExpiresAt: null,
    });

    // Log phone verification activity
    await this.logUserActivity(user.id, ActivityType.PHONE_VERIFICATION, ActivityStatus.SUCCESS);
  }

  async deactivate(id: string): Promise<void> {
    await this.userRepository.update(id, {
      isActive: false,
    });
  }

  async activate(id: string): Promise<void> {
    await this.userRepository.update(id, {
      isActive: true,
    });
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'passwordHash'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await this.userRepository.update(id, {
      passwordHash: newPasswordHash,
    });

    // Log password change activity
    await this.logUserActivity(id, ActivityType.PASSWORD_CHANGE, ActivityStatus.SUCCESS);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      if (payload.type !== 'password_reset') {
        throw new BadRequestException('Invalid token type');
      }

      const user = await this.userRepository.findOne({
        where: {
          passwordResetToken: token,
          passwordResetExpiresAt: new Date(payload.exp * 1000),
        },
      });

      if (!user) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      await this.userRepository.update(user.id, {
        passwordHash: newPasswordHash,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      });
    } catch (error) {
      throw new BadRequestException('Invalid or expired reset token');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return;
    }

    // Generate reset token
    const resetToken = this.jwtService.sign(
      { sub: user.id, type: 'password_reset' },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '1h',
      }
    );

    await this.userRepository.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    // Send password reset email
    await this.emailService.sendPasswordResetEmail(user.email, user.firstName, resetToken);
  }

  async handleFailedLogin(email: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) {
      return;
    }

    user.incrementLoginAttempts();
    await this.userRepository.save(user);
  }

  async handleSuccessfulLogin(id: string): Promise<void> {
    await this.userRepository.update(id, {
      lastLoginAt: new Date(),
      loginAttempts: 0,
      lockedUntil: null,
    });

    // Log successful login activity
    await this.logUserActivity(id, ActivityType.LOGIN, ActivityStatus.SUCCESS);
  }

  async handleLogout(id: string): Promise<void> {
    // Log logout activity
    await this.logUserActivity(id, ActivityType.LOGOUT, ActivityStatus.SUCCESS);
  }

  // User Preferences Methods
  async createDefaultUserPreferences(userId: string): Promise<UserPreferences> {
    const preferences = this.userPreferencesRepository.create({
      userId,
      isActive: true,
    });

    return this.userPreferencesRepository.save(preferences);
  }

  async getUserPreferences(userId: string): Promise<UserPreferences> {
    const preferences = await this.userPreferencesRepository.findOne({
      where: { userId },
    });

    if (!preferences) {
      // Create default preferences if they don't exist
      return this.createDefaultUserPreferences(userId);
    }

    return preferences;
  }

  async updateUserPreferences(userId: string, updateDto: UpdateUserPreferencesDto): Promise<UserPreferences> {
    let preferences = await this.userPreferencesRepository.findOne({
      where: { userId },
    });

    if (!preferences) {
      preferences = this.userPreferencesRepository.create({
        userId,
        ...updateDto,
        isActive: true,
      });
    } else {
      Object.assign(preferences, updateDto);
    }

    const updatedPreferences = await this.userPreferencesRepository.save(preferences);

    // Log preferences update activity
    await this.logUserActivity(userId, ActivityType.PREFERENCES_UPDATED, ActivityStatus.SUCCESS, {
      updatedFields: Object.keys(updateDto),
    });

    return updatedPreferences;
  }

  // User Activity Methods
  async logUserActivity(userId: string, type: ActivityType, status: ActivityStatus, metadata?: any, ipAddress?: string, userAgent?: string): Promise<UserActivity> {
    const activity = this.userActivityRepository.create({
      userId,
      type,
      status,
      description: type,
      metadata,
      ipAddress,
      userAgent,
      createdAt: new Date(),
    });

    return this.userActivityRepository.save(activity);
  }

  async getUserActivities(userId: string, limit: number = 50): Promise<UserActivity[]> {
    return this.userActivityRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getActivitySummary(userId: string): Promise<{
    totalActivities: number;
    lastActivity: Date | null;
    activityTypes: Record<string, number>;
  }> {
    const activities = await this.userActivityRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const activityTypes = activities.reduce(
      (acc, activity) => {
        acc[activity.type] = (acc[activity.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalActivities: activities.length,
      lastActivity: activities.length > 0 ? activities[0].createdAt : null,
      activityTypes,
    };
  }
}
