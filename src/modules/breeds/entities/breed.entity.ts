import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Pet } from '../../pets/entities/pet.entity';

export enum PetSpecies {
  DOG = 'dog',
  CAT = 'cat',
  BIRD = 'bird',
  RABBIT = 'rabbit',
  HAMSTER = 'hamster',
  FISH = 'fish',
  REPTILE = 'reptile',
  HORSE = 'horse',
  OTHER = 'other',
}

export enum PetSize {
  TINY = 'tiny',
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  GIANT = 'giant',
}

export enum GroomingNeeds {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
}

export enum ExerciseNeeds {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
}

@Entity('breeds')
export class Breed {
  @ApiProperty({ description: 'Unique identifier for the breed' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'Name of the breed' })
  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @ApiProperty({ description: 'Species of the breed', enum: PetSpecies })
  @Column({ type: 'enum', enum: PetSpecies })
  species!: PetSpecies;

  @ApiProperty({ description: 'Size category of the breed', enum: PetSize, required: false })
  @Column({ type: 'enum', enum: PetSize, nullable: true })
  size_category?: PetSize;

  @ApiProperty({ description: 'Temperament and personality traits', required: false })
  @Column({ type: 'text', nullable: true })
  temperament?: string;

  @ApiProperty({ description: 'Common health risks for this breed', required: false })
  @Column({ type: 'jsonb', default: [] })
  health_risks!: string[];

  @ApiProperty({ description: 'Minimum life expectancy in years', required: false })
  @Column({ type: 'int', nullable: true })
  life_expectancy_min?: number;

  @ApiProperty({ description: 'Maximum life expectancy in years', required: false })
  @Column({ type: 'int', nullable: true })
  life_expectancy_max?: number;

  @ApiProperty({ description: 'Minimum weight in pounds', required: false })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight_min?: number;

  @ApiProperty({ description: 'Maximum weight in pounds', required: false })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight_max?: number;

  @ApiProperty({ description: 'Country of origin', required: false })
  @Column({ type: 'varchar', length: 100, nullable: true })
  origin_country?: string;

  @ApiProperty({ description: 'Description of the breed', required: false })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Grooming needs level', enum: GroomingNeeds, required: false })
  @Column({ type: 'enum', enum: GroomingNeeds, nullable: true })
  grooming_needs?: GroomingNeeds;

  @ApiProperty({ description: 'Exercise needs level', enum: ExerciseNeeds, required: false })
  @Column({ type: 'enum', enum: ExerciseNeeds, nullable: true })
  exercise_needs?: ExerciseNeeds;

  @ApiProperty({ description: 'Whether the breed is active in the system' })
  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @ApiProperty({ description: 'Timestamp when the breed was created' })
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @ApiProperty({ description: 'Timestamp when the breed was last updated' })
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;

  // Relations
  @OneToMany(() => Pet, (pet) => pet.breed)
  pets?: Pet[];
}
