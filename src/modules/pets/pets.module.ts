import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { Pet } from './entities/pet.entity';
import { PetsController } from './pets.controller';
import { PetsSeeder } from './pets.seeder';
import { PetsService } from './pets.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pet, User]), UsersModule],
  controllers: [PetsController],
  providers: [PetsService, PetsSeeder],
  exports: [PetsService, PetsSeeder],
})
export class PetsModule {}
