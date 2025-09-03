import * as redisStore from 'cache-manager-redis-store';

import { Appointment } from '../appointments/entities/appointment.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { Clinic } from '../clinics/entities/clinic.entity';
import { CommonModule } from '../../common/common.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Module } from '@nestjs/common';
import { Pet } from '../pets/entities/pet.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Clinic, Appointment, Pet]),
    CommonModule,
    CacheModule.registerAsync({
      useFactory: () => ({
        store: redisStore,
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        ttl: 300, // 5 minutes default TTL
        max: 1000, // Maximum number of items in cache
      }),
      isGlobal: false, // Module-scoped cache
    }),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
