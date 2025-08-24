import { AiHealthController } from './ai-health.controller';
import { AiHealthInsight } from './entities/ai-health-insight.entity';
import { AiHealthService } from './ai-health.service';
import { Appointment } from '../appointments/entities/appointment.entity';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { Pet } from '../pets/entities/pet.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AiHealthInsight, Pet, Appointment, User]), ConfigModule],
  controllers: [AiHealthController],
  providers: [AiHealthService],
  exports: [AiHealthService],
})
export class AiHealthModule {}
