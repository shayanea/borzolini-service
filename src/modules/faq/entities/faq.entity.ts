import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';
import { PetSpecies } from '../../breeds/entities/breed.entity';

export enum FaqCategory {
  HEALTH_CARE = 'health_care',
  FEEDING_NUTRITION = 'feeding_nutrition',
  TRAINING_BEHAVIOR = 'training_behavior',
  EXERCISE_ACTIVITY = 'exercise_activity',
  HOUSING_ENVIRONMENT = 'housing_environment',
  GENERAL_CARE = 'general_care',
}

@Entity('animal_faqs')
export class AnimalFaq {
  @ApiProperty({ description: 'Unique identifier for the FAQ' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'Animal species this FAQ applies to', enum: PetSpecies })
  @Column({ type: 'enum', enum: PetSpecies })
  species!: PetSpecies;

  @ApiProperty({ description: 'Category of the FAQ', enum: FaqCategory })
  @Column({ type: 'enum', enum: FaqCategory })
  category!: FaqCategory;

  @ApiProperty({ description: 'The question being answered' })
  @Column({ type: 'text' })
  question!: string;

  @ApiProperty({ description: 'The answer to the question' })
  @Column({ type: 'text' })
  answer!: string;

  @ApiProperty({ description: 'Order index for display purposes', required: false })
  @Column({ type: 'int', nullable: true })
  order_index?: number;

  @ApiProperty({ description: 'Whether this FAQ is active and should be displayed' })
  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @ApiProperty({ description: 'When this FAQ was created' })
  @CreateDateColumn()
  created_at!: Date;

  @ApiProperty({ description: 'When this FAQ was last updated' })
  @UpdateDateColumn()
  updated_at!: Date;
}
