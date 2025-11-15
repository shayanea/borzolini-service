import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ItemHazardBySpecies } from './item-hazard-by-species.entity';

export enum HazardSeverity {
  INFO = 'info',
  CAUTION = 'caution',
  DANGER = 'danger',
  EMERGENCY = 'emergency',
}

@Entity('household_items')
export class HouseholdItem {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty()
  @Column({ type: 'text' })
  canonical_name!: string;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  category?: string | null;

  @ApiProperty({ enum: HazardSeverity })
  @Column({ type: 'enum', enum: HazardSeverity })
  severity_overall!: HazardSeverity;

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

  @Column({ type: 'text', nullable: true, name: 'terms_snapshot' })
  termsSnapshot?: string;

  @Column({ type: 'bytea', unique: true, nullable: true })
  hash?: Buffer;

  @Column({ type: 'jsonb', nullable: true })
  citations?: string[];

  @Column({ type: 'jsonb', nullable: true, name: 'toxic_compounds' })
  toxicCompounds?: string[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  @OneToMany(() => ItemHazardBySpecies, (hazard) => hazard.item)
  hazards_by_species?: ItemHazardBySpecies[];
}


