import * as bcrypt from 'bcryptjs';

import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto/auth.dto';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
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
      const { passwordHash, ...result } = user;
      return result;
    }

    return null;
  }

  async login(loginDto: LoginDto, req?: Request): Promise<any> {
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
        ...tokens,
      };
    } catch (error) {
      // Log failed login attempt
      if (req) {
        const user = await this.usersService.findByEmail(loginDto.email);
        if (user) {
          await this.usersService.logUserActivity(user.id, 'login' as any, 'failed' as any, { reason: error.message }, req.ip, req.get('User-Agent'));
        }
      }
      throw error;
    }
  }

  async register(registerDto: RegisterDto, req?: Request): Promise<any> {
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
      ...tokens,
      message: 'Registration successful. Please check your email to verify your account.',
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<any> {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findOne(payload.sub);

      if (!user || user.refreshToken !== refreshTokenDto.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (user.refreshTokenExpiresAt < new Date()) {
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

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, req?: Request): Promise<any> {
    // Log logout activity
    if (req) {
      await this.usersService.handleLogout(userId);
    }

    await this.usersService.clearRefreshToken(userId);
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<any> {
    await this.usersService.changePassword(userId, currentPassword, newPassword);
    return { message: 'Password changed successfully' };
  }

  async forgotPassword(email: string): Promise<any> {
    await this.usersService.forgotPassword(email);
    return { message: 'If an account with that email exists, a password reset link has been sent.' };
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
