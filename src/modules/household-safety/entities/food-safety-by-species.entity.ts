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
  @Column({ 
    type: 'enum', 
    enum: FoodSafetyLevel,
    enumName: 'food_safety_level'  // Explicit enum name for PostgreSQL
  })
  safety?: FoodSafetyLevel | null;

  @Column({ type: 'text', nullable: true })
  preparation?: string;

  @Column({ type: 'text', nullable: true, name: 'safe_amount' })
  safeAmount?: string;

  @Column({ type: 'text', nullable: true })
  frequency?: string;

  @ApiProperty({ type: [String] })
  @Column({ type: 'text', array: true, nullable: true })
  risks?: string[] | null;

  @ApiProperty()
  @Column({ type: 'boolean', default: false })
  emergency!: boolean;

  @Column({ type: 'text', nullable: true, name: 'treatment_info' })
  treatmentInfo?: string;

  @Column({ type: 'jsonb', nullable: true })
  citations?: string[];
}


