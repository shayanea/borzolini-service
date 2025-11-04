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

  @OneToMany(() => FoodSafetyBySpecies, (s) => s.food)
  safety_by_species?: FoodSafetyBySpecies[];

  @OneToMany(() => FoodAlias, (a) => a.food)
  aliases?: FoodAlias[];
}


