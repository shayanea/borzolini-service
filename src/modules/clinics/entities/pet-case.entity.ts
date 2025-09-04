import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Pet } from '../../pets/entities/pet.entity';
import { User } from '../../users/entities/user.entity';
import { Clinic } from './clinic.entity';

export enum CaseStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  PENDING_CONSULTATION = 'pending_consultation',
  PENDING_VISIT = 'pending_visit',
  UNDER_OBSERVATION = 'under_observation',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  ESCALATED = 'escalated',
}

export enum CasePriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
  EMERGENCY = 'emergency',
}

export enum CaseType {
  CONSULTATION = 'consultation',
  FOLLOW_UP = 'follow_up',
  EMERGENCY = 'emergency',
  PREVENTIVE = 'preventive',
  CHRONIC_CONDITION = 'chronic_condition',
  POST_SURGERY = 'post_surgery',
  BEHAVIORAL = 'behavioral',
  NUTRITIONAL = 'nutritional',
}

@Entity('clinic_pet_cases')
export class ClinicPetCase {
  @ApiProperty({ description: 'Unique identifier for the pet case' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'Case number for easy reference' })
  @Column({ type: 'varchar', length: 20, unique: true })
  case_number!: string;

  @ApiProperty({ description: 'ID of the clinic' })
  @Column({ type: 'uuid' })
  clinic_id!: string;

  @ApiProperty({ description: 'ID of the pet' })
  @Column({ type: 'uuid' })
  pet_id!: string;

  @ApiProperty({ description: 'ID of the pet owner' })
  @Column({ type: 'uuid' })
  owner_id!: string;

  @ApiProperty({ description: 'ID of the assigned veterinarian' })
  @Column({ type: 'uuid', nullable: true })
  vet_id?: string;

  @ApiProperty({ description: 'Type of case', enum: CaseType })
  @Column({ type: 'enum', enum: CaseType })
  case_type!: CaseType;

  @ApiProperty({ description: 'Current status of the case', enum: CaseStatus })
  @Column({ type: 'enum', enum: CaseStatus, default: CaseStatus.OPEN })
  status!: CaseStatus;

  @ApiProperty({ description: 'Priority level of the case', enum: CasePriority })
  @Column({ type: 'enum', enum: CasePriority, default: CasePriority.NORMAL })
  priority!: CasePriority;

  @ApiProperty({ description: 'Brief title of the case' })
  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @ApiProperty({ description: 'Detailed description of the case' })
  @Column({ type: 'text' })
  description!: string;

  @ApiProperty({ description: 'Initial symptoms reported' })
  @Column({ type: 'jsonb', default: [] })
  initial_symptoms!: string[];

  @ApiProperty({ description: 'Current symptoms' })
  @Column({ type: 'jsonb', default: [] })
  current_symptoms!: string[];

  @ApiProperty({ description: 'Vital signs and measurements' })
  @Column({ type: 'jsonb', nullable: true })
  vital_signs?: {
    temperature?: number;
    heart_rate?: number;
    respiratory_rate?: number;
    weight?: number;
    blood_pressure?: { systolic: number; diastolic: number };
    recorded_at?: Date;
  };

  @ApiProperty({ description: 'Diagnosis made during the case' })
  @Column({ type: 'text', nullable: true })
  diagnosis?: string;

  @ApiProperty({ description: 'Treatment plan' })
  @Column({ type: 'jsonb', nullable: true })
  treatment_plan?: {
    medications?: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions?: string;
    }>;
    procedures?: string[];
    follow_up_instructions?: string;
    dietary_changes?: string;
    activity_restrictions?: string;
  };

  @ApiProperty({ description: 'AI health insights for this case' })
  @Column({ type: 'jsonb', nullable: true })
  ai_insights?: {
    risk_assessment?: number;
    urgency_score?: number;
    suggested_actions?: string[];
    breed_specific_notes?: string;
    pattern_analysis?: any;
  };

  @ApiProperty({ description: 'Case timeline and events' })
  @Column({ type: 'jsonb', default: [] })
  timeline!: Array<{
    timestamp: Date;
    event_type: string;
    description: string;
    user_id?: string;
    user_name?: string;
    metadata?: any;
  }>;

  @ApiProperty({ description: 'Attachments and files' })
  @Column({ type: 'jsonb', default: [] })
  attachments!: Array<{
    id: string;
    filename: string;
    file_type: string;
    file_url: string;
    uploaded_at: Date;
    uploaded_by: string;
  }>;

  @ApiProperty({ description: 'Notes and observations' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({ description: 'Resolution notes' })
  @Column({ type: 'text', nullable: true })
  resolution_notes?: string;

  @ApiProperty({ description: 'Date when case was resolved' })
  @Column({ type: 'timestamp with time zone', nullable: true })
  resolved_at?: Date;

  @ApiProperty({ description: 'Date when case was closed' })
  @Column({ type: 'timestamp with time zone', nullable: true })
  closed_at?: Date;

  @ApiProperty({ description: 'Whether the case is active' })
  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @ApiProperty({ description: 'Date when the case was created' })
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @ApiProperty({ description: 'Date when the case was last updated' })
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;

  // Relationships
  @ManyToOne(() => Clinic, (clinic) => clinic.pet_cases)
  @JoinColumn({ name: 'clinic_id' })
  clinic!: Clinic;

  @ManyToOne(() => Pet, (pet) => pet.clinic_cases)
  @JoinColumn({ name: 'pet_id' })
  pet!: Pet;

  @ManyToOne(() => User, (user) => user.clinic_pet_cases)
  @JoinColumn({ name: 'owner_id' })
  owner!: User;

  @ManyToOne(() => User, (user) => user.vet_cases)
  @JoinColumn({ name: 'vet_id' })
  veterinarian?: User;

  // Appointments relationship - to be added when Appointment entity is updated
  // @OneToMany(() => Appointment, (appointment) => appointment.clinic_pet_case)
  // appointments!: Appointment[];

  // Computed properties
  get isUrgent(): boolean {
    return this.priority === CasePriority.URGENT || this.priority === CasePriority.EMERGENCY;
  }

  get isResolved(): boolean {
    return this.status === CaseStatus.RESOLVED || this.status === CaseStatus.CLOSED;
  }

  get daysOpen(): number {
    const now = new Date();
    const created = new Date(this.created_at);
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  }

  get lastActivity(): Date | null {
    if (this.timeline.length === 0) return null;
    const lastEvent = this.timeline[this.timeline.length - 1];
    return lastEvent ? new Date(lastEvent.timestamp) : null;
  }
}
