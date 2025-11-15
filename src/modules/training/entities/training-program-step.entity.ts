import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { TrainingProgram } from './training-program.entity';
import { TrainingActivity } from './training-activity.entity';

@Entity('training_program_steps')
export class TrainingProgramStep {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => TrainingProgram, (p) => p.steps, { onDelete: 'CASCADE' })
  program!: TrainingProgram;

  @ManyToOne(() => TrainingActivity, { eager: true, onDelete: 'CASCADE' })
  activity!: TrainingActivity;

  @Column({ type: 'int' })
  step_order!: number;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;
}
