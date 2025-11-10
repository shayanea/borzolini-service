import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ClinicAccessGuard } from './guards/clinic-access.guard';
import { ClinicStaff } from '../clinics/entities/clinic-staff.entity';
import { GoogleAuthService } from './services/google-auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    TypeOrmModule.forFeature([ClinicStaff]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET is not configured');
        }
        return {
          secret,
          signOptions: {
            expiresIn: configService.get<string>('JWT_EXPIRES_IN') ?? '30m',
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy, ClinicAccessGuard, GoogleAuthService],
  exports: [AuthService, JwtStrategy, JwtRefreshStrategy, ClinicAccessGuard, GoogleAuthService],
})
export class AuthModule {}
