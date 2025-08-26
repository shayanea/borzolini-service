import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Appointment } from "./entities/appointment.entity";
import { AppointmentsController } from "./appointments.controller";
import { AppointmentsService } from "./appointments.service";
import { User } from "../users/entities/user.entity";
import { Pet } from "../pets/entities/pet.entity";
import { Clinic } from "../clinics/entities/clinic.entity";
import { ClinicStaff } from "../clinics/entities/clinic-staff.entity";
import { ClinicService } from "../clinics/entities/clinic-service.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      User,
      Pet,
      Clinic,
      ClinicStaff,
      ClinicService,
    ]),
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
