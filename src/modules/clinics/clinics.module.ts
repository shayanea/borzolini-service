import * as redisStore from 'cache-manager-redis-store';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../../common/common.module';
import { Pet } from '../pets/entities/pet.entity';
import { PetsModule } from '../pets/pets.module';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { ClinicsController } from './clinics.controller';
import { ClinicsSeeder } from './clinics.seeder';
import { ClinicsService } from './clinics.service';
import { ClinicCaseTimeline } from './entities/case-timeline.entity';
import { ClinicOperatingHours } from './entities/clinic-operating-hours.entity';
import { ClinicPhoto } from './entities/clinic-photo.entity';
import { ClinicReview } from './entities/clinic-review.entity';
import { ClinicService } from './entities/clinic-service.entity';
import { ClinicStaff } from './entities/clinic-staff.entity';
import { Clinic } from './entities/clinic.entity';
import { ClinicPetCase } from './entities/pet-case.entity';
import { ClinicPetCaseService } from './services/clinic-pet-case.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Clinic, ClinicStaff, ClinicService, ClinicReview, ClinicPhoto, ClinicOperatingHours, ClinicPetCase, ClinicCaseTimeline, Pet, User]),
    UsersModule,
    PetsModule,
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
  controllers: [ClinicsController],
  providers: [ClinicsService, ClinicsSeeder, ClinicPetCaseService],
  exports: [ClinicsService, ClinicsSeeder, ClinicPetCaseService],
})
export class ClinicsModule {}
