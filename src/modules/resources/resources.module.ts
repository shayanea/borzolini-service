import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resource } from './entities/resource.entity';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';
import { ResourcesSeeder } from './resources.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([Resource])],
  controllers: [ResourcesController],
  providers: [ResourcesService, ResourcesSeeder],
  exports: [ResourcesService, ResourcesSeeder],
})
export class ResourcesModule {}

