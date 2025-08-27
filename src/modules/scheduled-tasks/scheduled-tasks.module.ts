import { AiHealthInsight } from '../ai-health/entities/ai-health-insight.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { ClinicReview } from '../clinics/entities/clinic-review.entity';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { ScheduledTasksController } from './scheduled-tasks.controller';
import { ScheduledTasksService } from './scheduled-tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserActivity } from '../users/entities/user-activity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserActivity, Appointment, ClinicReview, AiHealthInsight]), ConfigModule],
  controllers: [ScheduledTasksController],
  providers: [ScheduledTasksService],
  exports: [ScheduledTasksService],
})
export class ScheduledTasksModule {}
