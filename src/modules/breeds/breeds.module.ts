import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BreedsController } from './breeds.controller';
import { BreedsSeeder } from './breeds.seeder';
import { BreedsService } from './breeds.service';
import { Breed } from './entities/breed.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Breed])],
  controllers: [BreedsController],
  providers: [BreedsService, BreedsSeeder],
  exports: [BreedsService, BreedsSeeder],
})
export class BreedsModule {}
