import { Appointment } from '../appointments/entities/appointment.entity';
import { AppointmentReview } from './entities/appointment-review.entity';
import { Clinic } from '../clinics/entities/clinic.entity';
import { ClinicReview } from '../clinics/entities/clinic-review.entity';
import { Module } from '@nestjs/common';
import { Pet } from '../pets/entities/pet.entity';
import { ReviewsController } from './reviews.controller';
import { ReviewsSeeder } from './reviews.seeder';
import { ReviewsService } from './reviews.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AppointmentReview, ClinicReview, Appointment, Clinic, User, Pet])],
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewsSeeder],
  exports: [ReviewsService, ReviewsSeeder],
})
export class ReviewsModule {}
