import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduledTasksService } from './scheduled-tasks.service';
import { ScheduledTasksController } from './scheduled-tasks.controller';
import { UserActivity } from '../users/entities/user-activity.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { ClinicReview } from '../clinics/entities/clinic-review.entity';
import { AiHealthInsight } from '../ai-health/entities/ai-health-insight.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserActivity,
      Appointment,
      ClinicReview,
      AiHealthInsight,
    ]),
    ConfigModule,
  ],
  controllers: [ScheduledTasksController],
  providers: [ScheduledTasksService],
  exports: [ScheduledTasksService],
})
export class ScheduledTasksModule {}
