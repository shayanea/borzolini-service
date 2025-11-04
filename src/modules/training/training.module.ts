import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingService } from './training.service';
import { TrainingController } from './training.controller';
import { TrainingActivity } from './entities/training-activity.entity';
import { TrainingActivitySpecies } from './entities/training-activity-species.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TrainingActivity, TrainingActivitySpecies])],
  controllers: [TrainingController],
  providers: [TrainingService],
  exports: [TrainingService],
})
export class TrainingModule {}


