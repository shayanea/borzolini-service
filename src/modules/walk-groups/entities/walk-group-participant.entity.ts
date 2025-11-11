import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Pet } from '../../pets/entities/pet.entity';
import { User } from '../../users/entities/user.entity';
import { WalkGroup } from './walk-group.entity';

export enum ParticipantStatus {
  JOINED = 'joined',
  CANCELLED = 'cancelled',
  ATTENDED = 'attended',
}

@Entity('walk_group_participants')
export class WalkGroupParticipant {
  @ApiProperty({ description: 'Unique identifier for the participant' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'Status of the participation', enum: ParticipantStatus, default: ParticipantStatus.JOINED })
  @Column({ type: 'enum', enum: ParticipantStatus, default: ParticipantStatus.JOINED })
  status!: ParticipantStatus;

  @ApiProperty({ description: 'Optional notes from organizer', required: false })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({ description: 'Date when the participant joined' })
  @CreateDateColumn({ type: 'timestamp with time zone' })
  joined_at!: Date;

  // Foreign Keys
  @ApiProperty({ description: 'ID of the walk group' })
  @Column({ type: 'uuid' })
  walk_group_id!: string;

  @ApiProperty({ description: 'ID of the user (pet owner)' })
  @Column({ type: 'uuid' })
  user_id!: string;

  @ApiProperty({ description: 'ID of the participating pet' })
  @Column({ type: 'uuid' })
  pet_id!: string;

  // Relationships
  @ManyToOne(() => WalkGroup, (walkGroup) => walkGroup.participants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'walk_group_id' })
  walk_group!: WalkGroup;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Pet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pet_id' })
  pet!: Pet;
}

