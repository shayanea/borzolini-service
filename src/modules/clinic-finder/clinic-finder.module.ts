import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../../common/common.module';
import { Clinic } from '../clinics/entities/clinic.entity';
import { ClinicFinderController } from './clinic-finder.controller';
import { ClinicFinderService } from './clinic-finder.service';

@Module({
  imports: [TypeOrmModule.forFeature([Clinic]), CommonModule],
  controllers: [ClinicFinderController],
  providers: [ClinicFinderService],
  exports: [ClinicFinderService],
})
export class ClinicFinderModule {}

