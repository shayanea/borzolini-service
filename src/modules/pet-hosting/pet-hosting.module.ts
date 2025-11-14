import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../../common/common.module';
import { Pet } from '../pets/entities/pet.entity';
import { User } from '../users/entities/user.entity';
import { PetHostingController } from './pet-hosting.controller';
import { PetHostingService } from './pet-hosting.service';
import { PetHostAvailability } from './entities/pet-host-availability.entity';
import { PetHostPhoto } from './entities/pet-host-photo.entity';
import { PetHostReview } from './entities/pet-host-review.entity';
import { PetHost } from './entities/pet-host.entity';
import { PetHostingBooking } from './entities/pet-hosting-booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PetHost, PetHostingBooking, PetHostAvailability, PetHostReview, PetHostPhoto, User, Pet]), CommonModule],
  controllers: [PetHostingController],
  providers: [PetHostingService],
  exports: [PetHostingService],
})
export class PetHostingModule {}

