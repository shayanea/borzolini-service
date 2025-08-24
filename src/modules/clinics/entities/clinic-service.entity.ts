import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Clinic } from './clinic.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';

export enum ServiceCategory {
  PREVENTIVE = 'preventive',
  DIAGNOSTIC = 'diagnostic',
  SURGICAL = 'surgical',
  EMERGENCY = 'emergency',
  WELLNESS = 'wellness',
  DENTAL = 'dental',
  LABORATORY = 'laboratory',
  IMAGING = 'imaging',
  THERAPY = 'therapy',
}

@Entity('clinic_services')
export class ClinicService {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  clinic_id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'enum', enum: ServiceCategory })
  category!: ServiceCategory;

  @Column({ type: 'int', default: 30 })
  duration_minutes!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @Column({ type: 'boolean', default: true })
  requires_appointment!: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;

  // Relationships
  @ManyToOne(() => Clinic, (clinic) => clinic.services)
  @JoinColumn({ name: 'clinic_id' })
  clinic!: Clinic;

  @OneToMany(() => Appointment, (appointment) => appointment.service)
  appointments!: Appointment[];
}
