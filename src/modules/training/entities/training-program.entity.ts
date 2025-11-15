import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { PetSpecies } from '../../breeds/entities/breed.entity';
import { TrainingProgramStep } from './training-program-step.entity';

export enum TrainingProgramDifficulty {
  EASY = 'easy',
  MODERATE = 'moderate',
  ADVANCED = 'advanced',
}

@Entity('training_programs')
export class TrainingProgram {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  summary?: string | null;

  @Column({ type: 'text' })
  description_markdown!: string;

  @Column({ type: 'enum', enum: TrainingProgramDifficulty, default: TrainingProgramDifficulty.EASY })
  difficulty!: TrainingProgramDifficulty;

  @Column({ type: 'text', array: true, default: '{}' })
  tags!: string[];

  @Column({ type: 'enum', enum: PetSpecies, array: true })
  species!: PetSpecies[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  @OneToMany(() => TrainingProgramStep, (s) => s.program, {
    cascade: ['insert', 'update'],
  })
  steps?: TrainingProgramStep[];
}
