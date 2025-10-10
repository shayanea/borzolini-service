import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../../common/common.module';
import { AiHealthInsight } from '../ai-health/entities/ai-health-insight.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { PetAccessGuard } from '../auth/guards/pet-access.guard';
import { ClinicPetCase } from '../clinics/entities/pet-case.entity';
import { ClinicStaff } from '../clinics/entities/clinic-staff.entity';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { Pet } from './entities/pet.entity';
import { PetsController } from './pets.controller';
import { PetsSeeder } from './pets.seeder';
import { PetsService } from './pets.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pet, User, AiHealthInsight, ClinicStaff, ClinicPetCase, Appointment]),
    UsersModule,
    CommonModule,
  ],
  controllers: [PetsController],
  providers: [PetsService, PetsSeeder, PetAccessGuard],
  exports: [PetsService, PetsSeeder],
})
export class PetsModule {}
