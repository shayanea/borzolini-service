import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { PlantToxicityBySpecies } from './plant-toxicity-by-species.entity';

export enum PlantToxicityLevel {
  NON_TOXIC = 'non_toxic',
  MINOR = 'minor',
  MODERATE = 'moderate',
  SEVERE = 'severe',
  FATAL = 'fatal',
}

@Entity('household_plants')
export class Plant {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty()
  @Column({ type: 'text' })
  canonical_name!: string;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  scientific_name?: string | null;

  @ApiProperty({ type: [String] })
  @Column({ type: 'text', array: true, default: '{}' })
  common_aliases!: string[];

  @ApiProperty({ enum: PlantToxicityLevel })
  @Column({ type: 'enum', enum: PlantToxicityLevel })
  toxicity_overall!: PlantToxicityLevel;

  @ApiProperty()
  @Column({ type: 'text' })
  notes_markdown!: string;

  @ApiProperty({ required: false })
  @Column({ type: 'timestamptz', nullable: true })
  last_reviewed_at?: Date | null;

  @Column({ type: 'text', nullable: true, name: 'source_primary' })
  sourcePrimary?: string;

  @Column({ type: 'text', nullable: true, name: 'source_name' })
  sourceName?: string;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  license?: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'jsonb', nullable: true })
  terms_snapshot?: Record<string, unknown> | null;

  @Column({ type: 'bytea', unique: true, nullable: true })
  hash?: Buffer;

  @Column({ type: 'jsonb', nullable: true })
  citations?: string[];

  @Column({ type: 'jsonb', nullable: true, name: 'toxic_compounds' })
  toxicCompounds?: string[];

  @OneToMany(() => PlantToxicityBySpecies, (toxicity) => toxicity.plant)
  toxicity_by_species?: PlantToxicityBySpecies[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}


