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

  @ApiProperty()
  @Column({ type: 'text' })
  source_primary!: string;

  @ApiProperty()
  @Column({ type: 'text' })
  source_name!: string;

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

  @OneToMany(() => ItemHazardBySpecies, (h) => h.item)
  hazards_by_species?: ItemHazardBySpecies[];
}


