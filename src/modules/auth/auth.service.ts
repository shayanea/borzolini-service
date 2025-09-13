import * as bcrypt from 'bcryptjs';

import { ActivityStatus, ActivityType } from '../users/entities/user-activity.entity';
import { Injectable, Logger, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { Request, Response } from 'express';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private isInitialized = false;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing Auth service...');

    try {
      await this.validateDependencies();
      await this.validateConfiguration();

      this.isInitialized = true;
      this.logger.log('Auth service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Auth service:', error);
      throw error;
    }
  }

  private async validateDependencies(): Promise<void> {
    // Check if required services are ready
    if (!this.usersService) {
      throw new Error('UsersService not available');
    }

    if (!this.jwtService) {
      throw new Error('JwtService not available');
    }

    this.logger.log('Auth service dependencies validated successfully');
  }

  private async validateConfiguration(): Promise<void> {
    const requiredVars = ['JWT_SECRET', 'JWT_EXPIRES_IN', 'JWT_REFRESH_SECRET', 'JWT_REFRESH_EXPIRES_IN'];
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

    // Validate JWT refresh secret
    const jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET')!;
    if (jwtRefreshSecret.length < 32) {
      throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long');
    }

    this.logger.log('Auth service configuration validated successfully');
  }

  async validateUser(email: string, password: string): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Auth service not initialized');
    }

    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return null;
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException(`Account is locked until ${user.lockedUntil.toISOString()}`);
    }

    // Check if user can login
    if (!user.canLogin()) {
      throw new UnauthorizedException('Account is not active or email not verified');
    }

    if (await bcrypt.compare(password, user.passwordHash)) {
      const result = { ...user };
      delete (result as any).passwordHash;
      return result;
    }

    return null;
  }

  async login(loginDto: LoginDto, req?: Request, res?: Response): Promise<any> {
    try {
      const user = await this.validateUser(loginDto.email, loginDto.password);

      if (!user) {
        // Handle failed login attempt
        await this.usersService.handleFailedLogin(loginDto.email);
        throw new UnauthorizedException('Invalid credentials');
      }

      // Handle successful login
      await this.usersService.handleSuccessfulLogin(user.id);

      // Update last login
      await this.usersService.updateLastLogin(user.id);

      const tokens = await this.generateTokens(user);

      // Store refresh token
      await this.usersService.updateRefreshToken(
        user.id,
        tokens.refreshToken,
        new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10 days
      );

      // Set cookies if response object is provided
      if (res) {
        this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          profileCompletionPercentage: user.profileCompletionPercentage,
          accountStatus: user.accountStatus,
        },
        message: 'Login successful',
      };
    } catch (error) {
      // Log failed login attempt
      if (req) {
        const user = await this.usersService.findByEmail(loginDto.email);
        if (user) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          await this.usersService.logUserActivity(user.id, 'login' as ActivityType, 'failed' as ActivityStatus, { reason: errorMessage }, req.ip, req.get('User-Agent'));
        }
      }
      throw error;
    }
  }

  async register(registerDto: RegisterDto, req?: Request, res?: Response): Promise<any> {
    // Create user (this will also send verification email)
    const user = await this.usersService.create(registerDto);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Store refresh token
    await this.usersService.updateRefreshToken(
      user.id,
      tokens.refreshToken,
      new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10 days
    );

    // Set cookies if response object is provided
    if (res) {
      this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    }

    // Log registration activity with request info
    if (req) {
      await this.usersService.logUserActivity(user.id, 'register' as any, 'success' as any, { email: user.email, role: user.role }, req.ip, req.get('User-Agent'));
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        profileCompletionPercentage: user.profileCompletionPercentage,
        accountStatus: user.accountStatus,
      },
      message: 'Registration successful. Please check your email to verify your account.',
    };
  }

  async refreshToken(req: Request, res?: Response): Promise<any> {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token not found');
      }

      const jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
      if (!jwtRefreshSecret) {
        throw new UnauthorizedException('JWT refresh secret not configured');
      }

      const payload = this.jwtService.verify(refreshToken, {
        secret: jwtRefreshSecret,
      });

      const user = await this.usersService.findOne(payload.sub);

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (user.refreshTokenExpiresAt && user.refreshTokenExpiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token expired');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      // Update refresh token
      await this.usersService.updateRefreshToken(
        user.id,
        tokens.refreshToken,
        new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10 days
      );

      // Set new cookies if response object is provided
      if (res) {
        this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
      }

      return {
        message: 'Token refreshed successfully',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, req?: Request, res?: Response): Promise<any> {
    // Log logout activity
    if (req) {
      await this.usersService.handleLogout(userId);
    }

    await this.usersService.clearRefreshToken(userId);

    // Clear cookies if response object is provided
    if (res) {
      this.clearAuthCookies(res);
    }

    return { message: 'Logged out successfully' };
  }

  private async generateTokens(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    const jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const jwtExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '30m';
    const jwtRefreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

    if (!jwtSecret || !jwtRefreshSecret) {
      throw new Error('JWT secrets not configured');
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtSecret,
        expiresIn: jwtExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: jwtRefreshSecret,
        expiresIn: jwtRefreshExpiresIn,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    const domain = this.configService.get<string>('COOKIE_DOMAIN');

    // Access token cookie (short-lived, httpOnly, secure in production)
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      domain: domain || undefined,
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    });

    // Refresh token cookie (longer-lived, httpOnly, secure in production)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      domain: domain || undefined,
      maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
      path: '/',
    });
  }

  private clearAuthCookies(res: Response): void {
    const domain = this.configService.get<string>('COOKIE_DOMAIN');

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: this.configService.get<string>('NODE_ENV') === 'production' ? 'strict' : 'lax',
      domain: domain || undefined,
      path: '/',
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: this.configService.get<string>('NODE_ENV') === 'production' ? 'strict' : 'lax',
      domain: domain || undefined,
      path: '/',
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<any> {
    await this.usersService.changePassword(userId, currentPassword, newPassword);
    return { message: 'Password changed successfully' };
  }

  async forgotPassword(email: string): Promise<any> {
    await this.usersService.forgotPassword(email);
    return {
      message: 'If an account with that email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<any> {
    await this.usersService.resetPassword(token, newPassword);
    return { message: 'Password reset successfully' };
  }

  async verifyEmail(token: string): Promise<any> {
    await this.usersService.verifyEmail(token);
    return { message: 'Email verified successfully' };
  }

  async resendVerificationEmail(email: string): Promise<any> {
    await this.usersService.resendVerificationEmail(email);
    return { message: 'Verification email sent successfully' };
  }

  async requestPhoneVerification(phone: string): Promise<any> {
    await this.usersService.requestPhoneVerification(phone);
    return { message: 'Phone verification code sent successfully' };
  }

  async verifyPhone(phone: string, otp: string): Promise<any> {
    await this.usersService.verifyPhone(phone, otp);
    return { message: 'Phone verified successfully' };
  }

  async getProfile(userId: string): Promise<any> {
    return this.usersService.findOne(userId);
  }
}
