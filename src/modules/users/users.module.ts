import { ConfigModule, ConfigService } from '@nestjs/config';

import { EmailService } from '../../common/email.service';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { SettingsConfigModule } from '../settings/settings-config.module';
import { SmsService } from '../../common/sms.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserActivity } from './entities/user-activity.entity';
import { UserPreferences } from './entities/user-preferences.entity';
import { UsersController } from './users.controller';
import { UsersResponseService } from './users-response.service';
import { UsersSeeder } from './users.seeder';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserPreferences, UserActivity]),
    SettingsConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET is not configured');
        }
        return {
          secret,
          signOptions: { expiresIn: '24h' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersSeeder, EmailService, SmsService, UsersResponseService],
  exports: [UsersService, UsersSeeder],
})
export class UsersModule {}
