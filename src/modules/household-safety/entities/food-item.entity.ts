import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { FoodSafetyBySpecies } from './food-safety-by-species.entity';
import { FoodAlias } from './food-alias.entity';

export enum FoodSafetyLevel {
  SAFE = 'safe',
  CAUTION = 'caution',
  AVOID = 'avoid',
  TOXIC = 'toxic',
}

@Entity('pet_food_items')
export class FoodItem {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty()
  @Column({ type: 'text' })
  canonical_name!: string;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  scientific_name?: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  category?: string | null;

  @ApiProperty({ enum: FoodSafetyLevel })
  @Column({ type: 'enum', enum: FoodSafetyLevel })
  safety_overall!: FoodSafetyLevel;

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

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  @OneToMany(() => FoodSafetyBySpecies, (safety) => safety.food)
  safety_by_species?: FoodSafetyBySpecies[];

  @OneToMany(() => FoodAlias, (alias) => alias.food)
  aliases?: FoodAlias[];
}


