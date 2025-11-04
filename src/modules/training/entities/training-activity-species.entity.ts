import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TrainingActivity } from './training-activity.entity';
import { PetSpecies } from '../../breeds/entities/breed.entity';

@Entity('training_activity_species')
export class TrainingActivitySpecies {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => TrainingActivity, (a) => a.by_species, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activity_id' })
  activity!: TrainingActivity;

  @ApiProperty({ enum: PetSpecies })
  @Column({ type: 'enum', enum: PetSpecies })
  species!: PetSpecies;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  suitability?: string | null;

  @ApiProperty({ type: [String] })
  @Column({ type: 'text', array: true, nullable: true })
  prerequisites?: string[] | null;

  @ApiProperty({ type: [String] })
  @Column({ type: 'text', array: true, nullable: true })
  cautions?: string[] | null;

  @ApiProperty({ description: 'Array of citations with title/url/org/reviewedAt' })
  @Column({ type: 'jsonb', default: () => `'[]'::jsonb` })
  citations!: Array<{ title: string; url: string; org: string; reviewedAt?: string }>;
}


