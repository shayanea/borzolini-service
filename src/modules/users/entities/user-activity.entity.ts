import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from './user.entity';

export enum ActivityType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTER = 'register',
  PROFILE_UPDATE = 'profile_update',
  PASSWORD_CHANGE = 'password_change',
  EMAIL_VERIFICATION = 'email_verification',
  PHONE_VERIFICATION = 'phone_verification',
  APPOINTMENT_BOOKING = 'appointment_booking',
  APPOINTMENT_CANCELLATION = 'appointment_cancellation',
  PET_ADDED = 'pet_added',
  PET_UPDATED = 'pet_updated',
  SETTINGS_CHANGED = 'settings_changed',
  PREFERENCES_UPDATED = 'preferences_updated',
  // Clinic Management Activities
  CLINIC_CREATED = 'clinic_created',
  CLINIC_UPDATED = 'clinic_updated',
  CLINIC_DELETED = 'clinic_deleted',
  CLINIC_VERIFIED = 'clinic_verified',
  CLINIC_ACTIVATED = 'clinic_activated',
  CLINIC_DEACTIVATED = 'clinic_deactivated',
  // Staff Management Activities
  STAFF_ADDED = 'staff_added',
  STAFF_UPDATED = 'staff_updated',
  STAFF_REMOVED = 'staff_removed',
  STAFF_ACTIVATED = 'staff_activated',
  STAFF_DEACTIVATED = 'staff_deactivated',
  // Service Management Activities
  SERVICE_ADDED = 'service_added',
  SERVICE_UPDATED = 'service_updated',
  SERVICE_DELETED = 'service_deleted',
  SERVICE_ACTIVATED = 'service_activated',
  SERVICE_DEACTIVATED = 'service_deactivated',
}

export enum ActivityStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending',
}

@Entity('user_activities')
export class UserActivity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'enum', enum: ActivityType })
  type!: ActivityType;

  @Column({ type: 'enum', enum: ActivityStatus })
  status!: ActivityStatus;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress!: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent!: string;

  @Column({ nullable: true })
  location!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // Helper method to get activity summary
  getActivitySummary(): string {
    switch (this.type) {
      case ActivityType.LOGIN:
        return `User logged in from ${this.location || 'unknown location'}`;
      case ActivityType.LOGOUT:
        return 'User logged out';
      case ActivityType.REGISTER:
        return 'User registered new account';
      case ActivityType.PROFILE_UPDATE:
        return 'User updated profile information';
      case ActivityType.PASSWORD_CHANGE:
        return 'User changed password';
      case ActivityType.EMAIL_VERIFICATION:
        return 'User verified email address';
      case ActivityType.PHONE_VERIFICATION:
        return 'User verified phone number';
      case ActivityType.APPOINTMENT_BOOKING:
        return 'User booked an appointment';
      case ActivityType.APPOINTMENT_CANCELLATION:
        return 'User cancelled an appointment';
      case ActivityType.PET_ADDED:
        return 'User added a new pet';
      case ActivityType.PET_UPDATED:
        return 'User updated pet information';
      case ActivityType.SETTINGS_CHANGED:
        return 'User changed account settings';
      case ActivityType.PREFERENCES_UPDATED:
        return 'User updated preferences';
      // Clinic Management Activities
      case ActivityType.CLINIC_CREATED:
        return 'User created a new clinic';
      case ActivityType.CLINIC_UPDATED:
        return 'User updated clinic information';
      case ActivityType.CLINIC_DELETED:
        return 'User deleted a clinic';
      case ActivityType.CLINIC_VERIFIED:
        return 'User verified a clinic';
      case ActivityType.CLINIC_ACTIVATED:
        return 'User activated a clinic';
      case ActivityType.CLINIC_DEACTIVATED:
        return 'User deactivated a clinic';
      // Staff Management Activities
      case ActivityType.STAFF_ADDED:
        return 'User added staff member to clinic';
      case ActivityType.STAFF_UPDATED:
        return 'User updated staff member information';
      case ActivityType.STAFF_REMOVED:
        return 'User removed staff member from clinic';
      case ActivityType.STAFF_ACTIVATED:
        return 'User activated staff member';
      case ActivityType.STAFF_DEACTIVATED:
        return 'User deactivated staff member';
      // Service Management Activities
      case ActivityType.SERVICE_ADDED:
        return 'User added service to clinic';
      case ActivityType.SERVICE_UPDATED:
        return 'User updated clinic service';
      case ActivityType.SERVICE_DELETED:
        return 'User deleted clinic service';
      case ActivityType.SERVICE_ACTIVATED:
        return 'User activated clinic service';
      case ActivityType.SERVICE_DEACTIVATED:
        return 'User deactivated clinic service';
      default:
        return this.description || 'Activity performed';
    }
  }
}
