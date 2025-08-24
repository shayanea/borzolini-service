import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';
import { Clinic } from '../../clinics/entities/clinic.entity';
import { ClinicService } from '../../clinics/entities/clinic-service.entity';
import { ClinicStaff } from '../../clinics/entities/clinic-staff.entity';
import { Pet } from '../../pets/entities/pet.entity';
import { User } from '../../users/entities/user.entity';

export enum AppointmentType {
  CONSULTATION = 'consultation',
  VACCINATION = 'vaccination',
  SURGERY = 'surgery',
  FOLLOW_UP = 'follow_up',
  EMERGENCY = 'emergency',
  WELLNESS_EXAM = 'wellness_exam',
  DENTAL_CLEANING = 'dental_cleaning',
  LABORATORY_TEST = 'laboratory_test',
  IMAGING = 'imaging',
  THERAPY = 'therapy',
  GROOMING = 'grooming',
  BEHAVIORAL_TRAINING = 'behavioral_training',
  NUTRITION_CONSULTATION = 'nutrition_consultation',
  PHYSICAL_THERAPY = 'physical_therapy',
  SPECIALIST_CONSULTATION = 'specialist_consultation',
}

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  RESCHEDULED = 'rescheduled',
  WAITING = 'waiting',
}

export enum AppointmentPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
  EMERGENCY = 'emergency',
}

@Entity('appointments')
export class Appointment {
  @ApiProperty({ description: 'Unique identifier for the appointment' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'Type of appointment', enum: AppointmentType })
  @Column({ type: 'enum', enum: AppointmentType })
  appointment_type!: AppointmentType;

  @ApiProperty({ description: 'Current status of the appointment', enum: AppointmentStatus })
  @Column({ type: 'enum', enum: AppointmentStatus, default: AppointmentStatus.PENDING })
  status!: AppointmentStatus;

  @ApiProperty({ description: 'Priority level of the appointment', enum: AppointmentPriority })
  @Column({ type: 'enum', enum: AppointmentPriority, default: AppointmentPriority.NORMAL })
  priority!: AppointmentPriority;

  @ApiProperty({ description: 'Scheduled date and time for the appointment' })
  @Column({ type: 'timestamp with time zone' })
  scheduled_date!: Date;

  @ApiProperty({ description: 'Duration of the appointment in minutes', example: 30 })
  @Column({ type: 'int', default: 30 })
  duration_minutes!: number;

  @ApiProperty({ description: 'Actual start time of the appointment' })
  @Column({ type: 'timestamp with time zone', nullable: true })
  actual_start_time?: Date;

  @ApiProperty({ description: 'Actual end time of the appointment' })
  @Column({ type: 'timestamp with time zone', nullable: true })
  actual_end_time?: Date;

  @ApiProperty({ description: 'Notes and instructions for the appointment' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({ description: 'Reason for the appointment' })
  @Column({ type: 'text', nullable: true })
  reason?: string;

  @ApiProperty({ description: 'Symptoms or concerns reported by the owner' })
  @Column({ type: 'text', nullable: true })
  symptoms?: string;

  @ApiProperty({ description: 'Diagnosis made during the appointment' })
  @Column({ type: 'text', nullable: true })
  diagnosis?: string;

  @ApiProperty({ description: 'Treatment plan or recommendations' })
  @Column({ type: 'text', nullable: true })
  treatment_plan?: string;

  @ApiProperty({ description: 'Prescriptions given during the appointment' })
  @Column({ type: 'jsonb', default: [] })
  prescriptions!: string[];

  @ApiProperty({ description: 'Follow-up instructions' })
  @Column({ type: 'text', nullable: true })
  follow_up_instructions?: string;

  @ApiProperty({ description: 'Cost of the appointment' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost?: number;

  @ApiProperty({ description: 'Payment status' })
  @Column({ type: 'varchar', length: 50, default: 'pending' })
  payment_status!: string;

  @ApiProperty({ description: 'Whether this is a telemedicine appointment' })
  @Column({ type: 'boolean', default: false })
  is_telemedicine!: boolean;

  @ApiProperty({ description: 'Telemedicine consultation link' })
  @Column({ type: 'varchar', length: 500, nullable: true })
  telemedicine_link?: string;

  @ApiProperty({ description: 'Address for home visits' })
  @Column({ type: 'text', nullable: true })
  home_visit_address?: string;

  @ApiProperty({ description: 'Whether this is a home visit appointment' })
  @Column({ type: 'boolean', default: false })
  is_home_visit!: boolean;

  @ApiProperty({ description: 'Reminder settings for the appointment' })
  @Column({ type: 'jsonb', default: {} })
  reminder_settings!: {
    email_reminder?: boolean;
    sms_reminder?: boolean;
    push_reminder?: boolean;
    reminder_hours_before?: number;
  };

  @ApiProperty({ description: 'Whether the appointment is active' })
  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @ApiProperty({ description: 'Date when the appointment was created' })
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @ApiProperty({ description: 'Date when the appointment was last updated' })
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;

  // Foreign Keys
  @ApiProperty({ description: 'ID of the pet owner' })
  @Column({ type: 'uuid' })
  owner_id!: string;

  @ApiProperty({ description: 'ID of the pet' })
  @Column({ type: 'uuid' })
  pet_id!: string;

  @ApiProperty({ description: 'ID of the clinic' })
  @Column({ type: 'uuid' })
  clinic_id!: string;

  @ApiProperty({ description: 'ID of the assigned staff member' })
  @Column({ type: 'uuid', nullable: true })
  staff_id?: string;

  @ApiProperty({ description: 'ID of the clinic service' })
  @Column({ type: 'uuid', nullable: true })
  service_id?: string;

  // Relationships
  @ManyToOne(() => User, (user) => user.appointments)
  @JoinColumn({ name: 'owner_id' })
  owner!: User;

  @ManyToOne(() => Pet, (pet) => pet.appointments)
  @JoinColumn({ name: 'pet_id' })
  pet!: Pet;

  @ManyToOne(() => Clinic, (clinic) => clinic.appointments)
  @JoinColumn({ name: 'clinic_id' })
  clinic!: Clinic;

  @ManyToOne(() => ClinicStaff, (staff) => staff.appointments)
  @JoinColumn({ name: 'staff_id' })
  staff?: ClinicStaff;

  @ManyToOne(() => ClinicService, (service) => service.appointments)
  @JoinColumn({ name: 'service_id' })
  service?: ClinicService;

  // Computed properties
  get isOverdue(): boolean {
    if (this.status === AppointmentStatus.COMPLETED || this.status === AppointmentStatus.CANCELLED) {
      return false;
    }
    const now = new Date();
    const scheduledTime = new Date(this.scheduled_date);
    const endTime = new Date(scheduledTime.getTime() + this.duration_minutes * 60000);
    return now > endTime;
  }

  get isUpcoming(): boolean {
    if (this.status === AppointmentStatus.COMPLETED || this.status === AppointmentStatus.CANCELLED) {
      return false;
    }
    const now = new Date();
    const scheduledTime = new Date(this.scheduled_date);
    return now < scheduledTime;
  }

  get isToday(): boolean {
    const today = new Date();
    const scheduledDate = new Date(this.scheduled_date);
    return today.toDateString() === scheduledDate.toDateString();
  }

  get timeUntilAppointment(): number {
    const now = new Date();
    const scheduledTime = new Date(this.scheduled_date);
    return scheduledTime.getTime() - now.getTime();
  }

  get formattedScheduledTime(): string {
    return new Date(this.scheduled_date).toLocaleString();
  }

  get estimatedEndTime(): Date {
    const scheduledTime = new Date(this.scheduled_date);
    return new Date(scheduledTime.getTime() + this.duration_minutes * 60000);
  }
}
