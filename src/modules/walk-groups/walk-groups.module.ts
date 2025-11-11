import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../../common/common.module';
import { Pet } from '../pets/entities/pet.entity';
import { User } from '../users/entities/user.entity';
import { WalkGroup } from './entities/walk-group.entity';
import { WalkGroupParticipant } from './entities/walk-group-participant.entity';
import { WalkGroupsController } from './walk-groups.controller';
import { WalkGroupsService } from './walk-groups.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WalkGroup, WalkGroupParticipant, Pet, User]),
    CommonModule,
  ],
  controllers: [WalkGroupsController],
  providers: [WalkGroupsService],
  exports: [WalkGroupsService],
})
export class WalkGroupsModule {}

