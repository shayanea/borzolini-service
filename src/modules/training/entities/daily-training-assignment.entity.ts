import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Pet } from '../../pets/entities/pet.entity';
import { User } from '../../users/entities/user.entity';
import { TrainingActivity } from './training-activity.entity';

@Entity('daily_training_assignments')
@Index(['user_id', 'assignment_date'])
@Index(['pet_id', 'assignment_date'], { where: 'pet_id IS NOT NULL' })
@Index(['user_id', 'is_completed', 'assignment_date'])
export class DailyTrainingAssignment {
  @ApiProperty({ description: 'Unique identifier for the assignment' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'User who owns this assignment' })
  @Column({ name: 'user_id', type: 'uuid' })
  user_id!: string;

  @ApiProperty({ description: 'Pet associated with this training (optional)', required: false })
  @Column({ name: 'pet_id', type: 'uuid', nullable: true })
  pet_id?: string | null;

  @ApiProperty({ description: 'Training activity assigned' })
  @Column({ name: 'activity_id', type: 'uuid' })
  activity_id!: string;

  @ApiProperty({ description: 'Date when the training was assigned' })
  @Column({ name: 'assignment_date', type: 'date', default: () => 'CURRENT_DATE' })
  assignment_date!: Date;

  @ApiProperty({ description: 'Whether the training has been completed' })
  @Column({ name: 'is_completed', type: 'boolean', default: false })
  is_completed!: boolean;

  @ApiProperty({ description: 'When the training was completed', required: false })
  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completed_at?: Date | null;

  @ApiProperty({ description: 'User notes about the training', required: false })
  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @ApiProperty({ description: 'User feedback after completing training', required: false })
  @Column({ type: 'text', nullable: true })
  feedback?: string | null;

  @ApiProperty({ description: 'Difficulty progression tracking', required: false })
  @Column({ name: 'difficulty_progression', type: 'jsonb', default: () => "'{}'::jsonb" })
  difficulty_progression?: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at!: Date;

  // Relationships
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Pet, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pet_id' })
  pet?: Pet | null;

  @ManyToOne(() => TrainingActivity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activity_id' })
  activity!: TrainingActivity;
}
