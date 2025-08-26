import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ClinicsService } from "./clinics.service";
import { ClinicsController } from "./clinics.controller";
import { ClinicsSeeder } from "./clinics.seeder";
import { UsersModule } from "../users/users.module";
import { Clinic } from "./entities/clinic.entity";
import { ClinicStaff } from "./entities/clinic-staff.entity";
import { ClinicService } from "./entities/clinic-service.entity";
import { ClinicReview } from "./entities/clinic-review.entity";
import { ClinicPhoto } from "./entities/clinic-photo.entity";
import { ClinicOperatingHours } from "./entities/clinic-operating-hours.entity";
import { ClinicAppointment } from "./entities/clinic-appointment.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Clinic,
      ClinicStaff,
      ClinicService,
      ClinicReview,
      ClinicPhoto,
      ClinicOperatingHours,
      ClinicAppointment,
    ]),
    UsersModule,
  ],
  controllers: [ClinicsController],
  providers: [ClinicsService, ClinicsSeeder],
  exports: [ClinicsService, ClinicsSeeder],
})
export class ClinicsModule {}
