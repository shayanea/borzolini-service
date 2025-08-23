import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Clinic } from './clinic.entity';
import { ClinicService } from './clinic-service.entity';
import { ClinicStaff } from './clinic-staff.entity';

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
}

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  RESCHEDULED = 'rescheduled',
}

@Entity('clinic_appointments')
export class ClinicAppointment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  clinic_id!: string;

  @Column({ type: 'uuid' })
  pet_id!: string;

  @Column({ type: 'uuid' })
  owner_id!: string;

  @Column({ type: 'uuid', nullable: true })
  staff_id!: string;

  @Column({ type: 'uuid', nullable: true })
  service_id!: string;

  @Column({ type: 'enum', enum: AppointmentType })
  appointment_type!: AppointmentType;

  @Column({ type: 'enum', enum: AppointmentStatus, default: AppointmentStatus.PENDING })
  status!: AppointmentStatus;

  @Column({ type: 'timestamp with time zone' })
  scheduled_date!: Date;

  @Column({ type: 'int', default: 30 })
  duration_minutes!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  consultation_link!: string;

  @Column({ type: 'text', nullable: true })
  address!: string;

  @Column({ type: 'boolean', default: false })
  is_telemedicine!: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;

  // Relationships
  @ManyToOne(() => Clinic, (clinic) => clinic.appointments)
  @JoinColumn({ name: 'clinic_id' })
  clinic!: Clinic;

  @ManyToOne(() => ClinicStaff, (staff) => staff.id)
  @JoinColumn({ name: 'staff_id' })
  staff!: ClinicStaff;

  @ManyToOne(() => ClinicService, (service) => service.appointments)
  @JoinColumn({ name: 'service_id' })
  service!: ClinicService;
}
