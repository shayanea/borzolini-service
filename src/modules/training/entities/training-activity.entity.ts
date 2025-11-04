import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { TrainingActivitySpecies } from './training-activity-species.entity';

export enum ActivityDifficulty {
  EASY = 'easy',
  MODERATE = 'moderate',
  ADVANCED = 'advanced',
}

@Entity('training_activities')
export class TrainingActivity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty()
  @Column({ type: 'text' })
  title!: string;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  summary?: string | null;

  @ApiProperty()
  @Column({ type: 'text' })
  content_markdown!: string;

  @ApiProperty({ enum: ActivityDifficulty })
  @Column({ type: 'enum', enum: ActivityDifficulty, default: ActivityDifficulty.EASY })
  difficulty!: ActivityDifficulty;

  @ApiProperty({ required: false })
  @Column({ type: 'int', nullable: true })
  avg_duration_minutes?: number | null;

  @ApiProperty({ required: false })
  @Column({ type: 'boolean', nullable: true })
  indoor?: boolean | null;

  @ApiProperty({ type: [String] })
  @Column({ type: 'text', array: true, nullable: true })
  equipment?: string[] | null;

  @ApiProperty({ type: [String] })
  @Column({ type: 'text', array: true, default: '{}' })
  tags!: string[];

  @ApiProperty({ type: [String] })
  @Column({ type: 'text', array: true, default: '{}' })
  risks!: string[];

  @ApiProperty({ type: [String] })
  @Column({ type: 'text', array: true, default: '{}' })
  enrichment!: string[];

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  video_url?: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  source_primary?: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  source_name?: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  license?: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'jsonb', nullable: true })
  terms_snapshot?: Record<string, unknown> | null;

  @ApiProperty()
  @Column({ type: 'bytea', unique: true })
  hash!: Buffer;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  @OneToMany(() => TrainingActivitySpecies, (s) => s.activity)
  by_species?: TrainingActivitySpecies[];
}


