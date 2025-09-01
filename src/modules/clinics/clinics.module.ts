import { Clinic } from './entities/clinic.entity';
import { ClinicOperatingHours } from './entities/clinic-operating-hours.entity';
import { ClinicPhoto } from './entities/clinic-photo.entity';
import { ClinicReview } from './entities/clinic-review.entity';
import { ClinicService } from './entities/clinic-service.entity';
import { ClinicStaff } from './entities/clinic-staff.entity';
import { ClinicsController } from './clinics.controller';
import { ClinicsSeeder } from './clinics.seeder';
import { ClinicsService } from './clinics.service';
import { CommonModule } from '../../common/common.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Clinic, ClinicStaff, ClinicService, ClinicReview, ClinicPhoto, ClinicOperatingHours]), UsersModule, CommonModule],
  controllers: [ClinicsController],
  providers: [ClinicsService, ClinicsSeeder],
  exports: [ClinicsService, ClinicsSeeder],
})
export class ClinicsModule {}
