import { AiHealthInsight } from '../ai-health/entities/ai-health-insight.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { ClinicPetCase } from '../clinics/entities/pet-case.entity';
import { ClinicStaff } from '../clinics/entities/clinic-staff.entity';
import { CommonModule } from '../../common/common.module';
import { Module } from '@nestjs/common';
import { Pet } from './entities/pet.entity';
import { PetAccessGuard } from '../auth/guards/pet-access.guard';
import { PetsController } from './pets.controller';
import { PetsSeeder } from './pets.seeder';
import { PetsService } from './pets.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Pet, User, AiHealthInsight, ClinicStaff, ClinicPetCase, Appointment]), UsersModule, CommonModule],
  controllers: [PetsController],
  providers: [PetsService, PetsSeeder, PetAccessGuard],
  exports: [PetsService, PetsSeeder],
})
export class PetsModule {}
