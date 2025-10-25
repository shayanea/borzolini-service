import * as redisStore from 'cache-manager-redis-store';

import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../../common/common.module';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Clinic } from '../clinics/entities/clinic.entity';
import { ClinicStaff } from '../clinics/entities/clinic-staff.entity';
import { ClinicService } from '../clinics/entities/clinic-service.entity';
import { ClinicReview } from '../clinics/entities/clinic-review.entity';
import { ClinicPetCase } from '../clinics/entities/pet-case.entity';
import { Pet } from '../pets/entities/pet.entity';
import { User } from '../users/entities/user.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Clinic, Appointment, Pet, ClinicStaff, ClinicService, ClinicReview, ClinicPetCase]),
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
