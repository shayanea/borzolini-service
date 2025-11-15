import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingService } from './training.service';
import { TrainingController } from './training.controller';
import { TrainingActivity } from './entities/training-activity.entity';
import { TrainingActivitySpecies } from './entities/training-activity-species.entity';
import { DailyTrainingAssignment } from './entities/daily-training-assignment.entity';
import { TrainingSeeder } from './training.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([TrainingActivity, TrainingActivitySpecies, DailyTrainingAssignment])],
  controllers: [TrainingController],
  providers: [TrainingService, TrainingSeeder],
  exports: [TrainingService, TrainingSeeder],
})
export class TrainingModule {}


