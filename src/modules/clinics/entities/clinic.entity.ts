import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Appointment } from '../../appointments/entities/appointment.entity';
import { AppointmentReview } from '../../reviews/entities/appointment-review.entity';
import { User } from '../../users/entities/user.entity';
import { ClinicOperatingHours } from './clinic-operating-hours.entity';
import { ClinicPhoto } from './clinic-photo.entity';
import { ClinicReview } from './clinic-review.entity';
import { ClinicService } from './clinic-service.entity';
import { ClinicStaff } from './clinic-staff.entity';
import { ClinicPetCase } from './pet-case.entity';

export interface OperatingHours {
  [key: string]: {
    open: string;
    close: string;
    closed: boolean;
  };
}

export interface ClinicServices {
  [key: string]: boolean;
}

export interface ClinicSpecializations {
  [key: string]: boolean;
}

export interface PaymentMethods {
  [key: string]: boolean;
}

export interface InsuranceProviders {
  [key: string]: boolean;
}

@Entity('clinics')
export class Clinic {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text' })
  address!: string;

  @Column({ type: 'varchar', length: 100 })
  city!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  postal_code?: string;

  @Column({ type: 'varchar', length: 100, default: 'USA' })
  country!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logo_url?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  banner_url?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  instagram_url?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tiktok_url?: string;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string | number) => parseFloat(value as string),
    },
  })
  rating!: number;

  @Column({ type: 'int', default: 0 })
  total_reviews!: number;

  @Column({ type: 'boolean', default: false })
  is_verified!: boolean;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @Column({ type: 'jsonb', default: {} })
  operating_hours!: OperatingHours;

  @Column({ type: 'varchar', length: 255, nullable: true })
  emergency_contact?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  emergency_phone?: string;

  @Column({ type: 'jsonb', default: [] })
  services!: string[];

  @Column({ type: 'jsonb', default: [] })
  specializations!: string[];

  @Column({ type: 'jsonb', default: ['cash', 'credit_card', 'insurance'] })
  payment_methods!: string[];

  @Column({ type: 'jsonb', default: [] })
  insurance_providers!: string[];

  @Column({ type: 'uuid', nullable: true })
  owner_id?: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.owned_clinics, { nullable: true })
  @JoinColumn({ name: 'owner_id' })
  owner?: User;

  @OneToMany(() => ClinicStaff, (staff) => staff.clinic)
  staff!: ClinicStaff[];

  @OneToMany(() => ClinicService, (service) => service.clinic)
  clinic_services!: ClinicService[];

  @OneToMany(() => ClinicReview, (review) => review.clinic)
  reviews!: ClinicReview[];

  @OneToMany(() => ClinicPhoto, (photo) => photo.clinic)
  photos!: ClinicPhoto[];

  @OneToMany(() => ClinicOperatingHours, (hours) => hours.clinic)
  operating_hours_detail!: ClinicOperatingHours[];

  @OneToMany(() => Appointment, (appointment) => appointment.clinic)
  appointments!: Appointment[];

  @OneToMany(() => ClinicPetCase, (petCase) => petCase.clinic)
  pet_cases!: ClinicPetCase[];

  @OneToMany(() => AppointmentReview, (review) => review.clinic)
  appointment_reviews!: AppointmentReview[];
}
