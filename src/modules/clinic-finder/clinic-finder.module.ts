import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { ClinicFinderController } from './clinic-finder.controller';
import { ClinicFinderService } from './clinic-finder.service';

@Module({
  imports: [CommonModule],
  controllers: [ClinicFinderController],
  providers: [ClinicFinderService],
  exports: [ClinicFinderService],
})
export class ClinicFinderModule {}

