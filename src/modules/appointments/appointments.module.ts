import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../../common/common.module';
import { ClinicService } from '../clinics/entities/clinic-service.entity';
import { ClinicStaff } from '../clinics/entities/clinic-staff.entity';
import { Clinic } from '../clinics/entities/clinic.entity';
import { Pet } from '../pets/entities/pet.entity';
import { SettingsConfigModule } from '../settings/settings-config.module';
import { User } from '../users/entities/user.entity';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsSeeder } from './appointments.seeder';
import { AppointmentsService } from './appointments.service';
import { Appointment } from './entities/appointment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, User, Pet, Clinic, ClinicStaff, ClinicService]), CommonModule, SettingsConfigModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, AppointmentsSeeder],
  exports: [AppointmentsService, AppointmentsSeeder],
})
export class AppointmentsModule {}
