import { Appointment } from './entities/appointment.entity';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsSeeder } from './appointments.seeder';
import { AppointmentsService } from './appointments.service';
import { Clinic } from '../clinics/entities/clinic.entity';
import { ClinicService } from '../clinics/entities/clinic-service.entity';
import { ClinicStaff } from '../clinics/entities/clinic-staff.entity';
import { Module } from '@nestjs/common';
import { Pet } from '../pets/entities/pet.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, User, Pet, Clinic, ClinicStaff, ClinicService])],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, AppointmentsSeeder],
  exports: [AppointmentsService, AppointmentsSeeder],
})
export class AppointmentsModule {}
