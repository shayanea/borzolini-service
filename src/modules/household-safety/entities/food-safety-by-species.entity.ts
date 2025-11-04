import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { FoodItem, FoodSafetyLevel } from './food-item.entity';
import { PetSpecies } from '../../breeds/entities/breed.entity';

export enum Preparation {
  RAW = 'raw',
  COOKED = 'cooked',
  PLAIN = 'plain',
  SEASONED = 'seasoned',
  UNKNOWN = 'unknown',
}

@Entity('pet_food_safety_by_species')
export class FoodSafetyBySpecies {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => FoodItem, (f) => f.safety_by_species, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'food_id' })
  food!: FoodItem;

  @ApiProperty({ enum: PetSpecies })
  @Column({ type: 'enum', enum: PetSpecies })
  species!: PetSpecies;

  @ApiProperty({ enum: FoodSafetyLevel })
  @Column({ type: 'enum', enum: FoodSafetyLevel })
  safety!: FoodSafetyLevel;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  safe_amount?: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  frequency?: string | null;

  @ApiProperty({ enum: Preparation })
  @Column({ type: 'enum', enum: Preparation, default: Preparation.UNKNOWN })
  preparation!: Preparation;

  @ApiProperty({ type: [String] })
  @Column({ type: 'text', array: true, nullable: true })
  risks?: string[] | null;

  @ApiProperty()
  @Column({ type: 'boolean', default: false })
  emergency!: boolean;

  @ApiProperty({ description: 'Array of citations with title/url/org/reviewedAt' })
  @Column({ type: 'jsonb' })
  citations!: Array<{ title: string; url: string; org: string; reviewedAt?: string }>;
}


