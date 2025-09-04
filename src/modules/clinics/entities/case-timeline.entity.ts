import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ClinicPetCase } from './pet-case.entity';

export enum TimelineEventType {
  CASE_CREATED = 'case_created',
  SYMPTOMS_UPDATED = 'symptoms_updated',
  VITAL_SIGNS_RECORDED = 'vital_signs_recorded',
  CONSULTATION_SCHEDULED = 'consultation_scheduled',
  CONSULTATION_COMPLETED = 'consultation_completed',
  VISIT_SCHEDULED = 'visit_scheduled',
  VISIT_COMPLETED = 'visit_completed',
  DIAGNOSIS_MADE = 'diagnosis_made',
  TREATMENT_PRESCRIBED = 'treatment_prescribed',
  MEDICATION_ADMINISTERED = 'medication_administered',
  FOLLOW_UP_SCHEDULED = 'follow_up_scheduled',
  AI_INSIGHT_GENERATED = 'ai_insight_generated',
  CASE_ESCALATED = 'case_escalated',
  CASE_RESOLVED = 'case_resolved',
  CASE_CLOSED = 'case_closed',
  NOTE_ADDED = 'note_added',
  FILE_ATTACHED = 'file_attached',
  STATUS_CHANGED = 'status_changed',
  PRIORITY_CHANGED = 'priority_changed',
}

@Entity('clinic_case_timeline')
export class ClinicCaseTimeline {
  @ApiProperty({ description: 'Unique identifier for the timeline event' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'ID of the pet case' })
  @Column({ type: 'uuid' })
  case_id!: string;

  @ApiProperty({ description: 'Type of timeline event', enum: TimelineEventType })
  @Column({ type: 'enum', enum: TimelineEventType })
  event_type!: TimelineEventType;

  @ApiProperty({ description: 'Title of the event' })
  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @ApiProperty({ description: 'Detailed description of the event' })
  @Column({ type: 'text' })
  description!: string;

  @ApiProperty({ description: 'Additional metadata for the event' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @ApiProperty({ description: 'ID of the user who created this event' })
  @Column({ type: 'uuid', nullable: true })
  created_by?: string;

  @ApiProperty({ description: 'Date when the event occurred' })
  @CreateDateColumn({ type: 'timestamp with time zone' })
  occurred_at!: Date;

  // Relationships
  @ManyToOne(() => ClinicPetCase, (petCase) => petCase.timeline)
  @JoinColumn({ name: 'case_id' })
  case!: ClinicPetCase;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator?: User;
}
