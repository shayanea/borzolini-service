import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { UserPreferences } from './entities/user-preferences.entity';
import { UserActivity, ActivityType, ActivityStatus } from './entities/user-activity.entity';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { UpdateUserPreferencesDto } from './dto/user-preferences.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserPreferences)
    private userPreferencesRepository: Repository<UserPreferences>,
    @InjectRepository(UserActivity)
    private userActivityRepository: Repository<UserActivity>,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    const user = this.userRepository.create({
      ...createUserDto,
      passwordHash: hashedPassword,
      role: createUserDto.role || 'patient',
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
        user: savedUser,
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

    const emailVerificationToken = this.jwtService.sign({ type: 'email_verification' }, { secret: jwtSecret, expiresIn: '24h' });

    // Update user with verification token
    await this.userRepository.update(savedUser.id, {
      emailVerificationToken,
      emailVerificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    // Remove password hash from response
    const { passwordHash, ...result } = savedUser;
    return result as User;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt'],
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

    // Remove password hash from response
    const { passwordHash, ...result } = updatedUser;
    return result as User;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async clearRefreshToken(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      refreshToken: null as any,
      refreshTokenExpiresAt: null as any,
    });
  }

  async updateRefreshToken(userId: string, refreshToken: string, expiresAt: Date): Promise<void> {
    await this.userRepository.update(userId, {
      refreshToken,
      refreshTokenExpiresAt: expiresAt,
    });
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

      await this.userRepository.update(user.id, {
        isEmailVerified: true,
        emailVerificationToken: null as any,
        emailVerificationExpiresAt: null as any,
      });
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

  async requestPhoneVerification(_phone: string): Promise<void> {
    // TODO: Implement phone verification when phone field is added to User entity
    throw new BadRequestException('Phone verification not implemented yet');
  }

  async verifyPhone(_phone: string, _otp: string): Promise<void> {
    // TODO: Implement phone verification when phone field is added to User entity
    throw new BadRequestException('Phone verification not implemented yet');
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

      await this.userRepository.update(user.id, {
        passwordHash: hashedPassword,
        passwordResetToken: null as any,
        passwordResetExpiresAt: null as any,
        lockedUntil: null as any,
        loginAttempts: 0,
      });
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
    await this.userRepository.update(userId, {
      loginAttempts: 0,
      lockedUntil: null as any,
      lastLoginAt: new Date(),
    });
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
}
