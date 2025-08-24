import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';
import { Pet } from '../../pets/entities/pet.entity';

export enum InsightType {
  RECOMMENDATION = 'recommendation',
  ALERT = 'alert',
  PREDICTION = 'prediction',
  REMINDER = 'reminder',
  EDUCATIONAL = 'educational',
  PREVENTIVE = 'preventive',
}

export enum UrgencyLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum InsightCategory {
  HEALTH = 'health',
  NUTRITION = 'nutrition',
  BEHAVIOR = 'behavior',
  PREVENTIVE_CARE = 'preventive_care',
  EMERGENCY = 'emergency',
  LIFESTYLE = 'lifestyle',
  TRAINING = 'training',
  GROOMING = 'grooming',
}

@Entity('ai_health_insights')
export class AiHealthInsight {
  @ApiProperty({ description: 'Unique identifier for the AI insight' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'ID of the pet this insight is for' })
  @Column({ type: 'uuid' })
  pet_id!: string;

  @ApiProperty({ description: 'Type of insight', enum: InsightType })
  @Column({ type: 'enum', enum: InsightType })
  insight_type!: InsightType;

  @ApiProperty({ description: 'Category of the insight', enum: InsightCategory })
  @Column({ type: 'enum', enum: InsightCategory })
  category!: InsightCategory;

  @ApiProperty({ description: 'Title of the insight' })
  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @ApiProperty({ description: 'Detailed description of the insight' })
  @Column({ type: 'text' })
  description!: string;

  @ApiProperty({ description: 'AI confidence score (0.0 to 1.0)' })
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  confidence_score?: number;

  @ApiProperty({ description: 'Urgency level of the insight', enum: UrgencyLevel })
  @Column({ type: 'enum', enum: UrgencyLevel, default: UrgencyLevel.LOW })
  urgency_level!: UrgencyLevel;

  @ApiProperty({ description: 'Suggested action for the pet owner' })
  @Column({ type: 'varchar', length: 500, nullable: true })
  suggested_action?: string;

  @ApiProperty({ description: 'Additional context or reasoning' })
  @Column({ type: 'text', nullable: true })
  context?: string;

  @ApiProperty({ description: 'Related data that influenced this insight' })
  @Column({ type: 'jsonb', nullable: true })
  supporting_data?: any;

  @ApiProperty({ description: 'Whether the insight has been dismissed by the owner' })
  @Column({ type: 'boolean', default: false })
  dismissed!: boolean;

  @ApiProperty({ description: 'Date when the insight was dismissed' })
  @Column({ type: 'timestamp with time zone', nullable: true })
  dismissed_at?: Date | null;

  @ApiProperty({ description: 'Whether the insight has been acted upon' })
  @Column({ type: 'boolean', default: false })
  acted_upon!: boolean;

  @ApiProperty({ description: 'Date when the insight was acted upon' })
  @Column({ type: 'timestamp with time zone', nullable: true })
  acted_upon_at?: Date | null;

  @ApiProperty({ description: 'Owner feedback on the insight' })
  @Column({ type: 'text', nullable: true })
  owner_feedback?: string;

  @ApiProperty({ description: 'Rating given by the owner (1-5)' })
  @Column({ type: 'int', nullable: true })
  owner_rating?: number;

  @ApiProperty({ description: 'Date when the insight was created' })
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @ApiProperty({ description: 'Date when the insight was last updated' })
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;

  // Relationships
  @ManyToOne(() => Pet, (pet) => pet.ai_insights)
  @JoinColumn({ name: 'pet_id' })
  pet!: Pet;
}
