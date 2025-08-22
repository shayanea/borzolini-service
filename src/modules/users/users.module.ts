import { ConfigModule, ConfigService } from '@nestjs/config';

import { EmailService } from '../../common/email.service';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserActivity } from './entities/user-activity.entity';
import { UserPreferences } from './entities/user-preferences.entity';
import { UsersController } from './users.controller';
import { UsersSeeder } from './users.seeder';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserPreferences, UserActivity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersSeeder, EmailService],
  exports: [UsersService, UsersSeeder],
})
export class UsersModule {}
