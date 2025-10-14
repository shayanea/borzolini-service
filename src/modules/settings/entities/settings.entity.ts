import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export interface GeneralSettings {
  clinicName: string;
  currency: string;
  timezone: string;
  businessHours: string;
}

export interface NotificationSettings {
  enableNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  notificationEmail: string;
}

export interface AppointmentSettings {
  defaultAppointmentDuration: number; // in minutes
  bookingLeadTime: number; // in hours
  cancellationPolicy: number; // in hours
  maxAppointmentsPerDay: number;
}

export interface SecuritySettings {
  sessionTimeout: number; // in minutes
  passwordExpiry: number; // in days
  twoFactorAuthentication: boolean;
}

@Entity('settings')
export class Settings {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, default: 'default' })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'jsonb',
    name: 'general_settings',
    default: {
      clinicName: 'Borzolini Veterinary Clinic',
      currency: 'USD',
      timezone: 'America/New_York',
      businessHours: '8:00 AM - 6:00 PM',
    } as GeneralSettings,
  })
  generalSettings!: GeneralSettings;

  @Column({
    type: 'jsonb',
    name: 'notification_settings',
    default: {
      enableNotifications: true,
      emailNotifications: true,
      smsNotifications: false,
      notificationEmail: 'admin@clinic.com',
    } as NotificationSettings,
  })
  notificationSettings!: NotificationSettings;

  @Column({
    type: 'jsonb',
    name: 'appointment_settings',
    default: {
      defaultAppointmentDuration: 30,
      bookingLeadTime: 24,
      cancellationPolicy: 24,
      maxAppointmentsPerDay: 50,
    } as AppointmentSettings,
  })
  appointmentSettings!: AppointmentSettings;

  @Column({
    type: 'jsonb',
    name: 'security_settings',
    default: {
      sessionTimeout: 30,
      passwordExpiry: 90,
      twoFactorAuthentication: false,
    } as SecuritySettings,
  })
  securitySettings!: SecuritySettings;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ type: 'boolean', name: 'is_default', default: false })
  isDefault!: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt!: Date;
}
