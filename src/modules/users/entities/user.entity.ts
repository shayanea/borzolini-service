import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

// Appointment relationship (forward declaration to avoid circular dependencies)
import { Appointment } from '../../appointments/entities/appointment.entity';
import { ClinicReview } from '../../clinics/entities/clinic-review.entity';
// Clinic relationships (forward declarations to avoid circular dependencies)
import { ClinicStaff } from '../../clinics/entities/clinic-staff.entity';
// Pet relationship (forward declaration to avoid circular dependencies)
import { Pet } from '../../pets/entities/pet.entity';
import { UserActivity } from './user-activity.entity';
import { UserPreferences } from './user-preferences.entity';

export enum UserRole {
  ADMIN = 'admin',
  VETERINARIAN = 'veterinarian',
  STAFF = 'staff',
  PATIENT = 'patient',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ name: 'first_name' })
  firstName!: string;

  @Column({ name: 'last_name' })
  lastName!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PATIENT,
  })
  role!: UserRole;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ name: 'date_of_birth', nullable: true })
  dateOfBirth?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ name: 'postal_code', nullable: true })
  postalCode?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ name: 'preferred_language', default: 'en' })
  preferredLanguage?: string;

  @Column({ default: 'UTC' })
  timezone?: string;

  @Column({ nullable: true })
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';

  @Column({ name: 'emergency_contact_name', nullable: true })
  emergencyContactName?: string;

  @Column({ name: 'emergency_contact_phone', nullable: true })
  emergencyContactPhone?: string;

  @Column({ name: 'emergency_contact_relationship', nullable: true })
  emergencyContactRelationship?: string;

  @Column({ name: 'medical_history', nullable: true })
  medicalHistory?: string;

  @Column({ nullable: true })
  allergies?: string;

  @Column({ nullable: true })
  medications?: string;

  @Column({ name: 'insurance_provider', nullable: true })
  insuranceProvider?: string;

  @Column({ name: 'insurance_policy_number', nullable: true })
  insurancePolicyNumber?: string;

  @Column({ name: 'insurance_group_number', nullable: true })
  insuranceGroupNumber?: string;

  @Column({ name: 'insurance_expiry_date', nullable: true })
  insuranceExpiryDate?: string;

  @Column({ nullable: true })
  notes?: string;

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified!: boolean;

  @Column({ name: 'is_phone_verified', default: false })
  isPhoneVerified!: boolean;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'refresh_token', nullable: true })
  refreshToken?: string;

  @Column({ name: 'refresh_token_expires_at', nullable: true })
  refreshTokenExpiresAt?: Date;

  @Column({ name: 'email_verification_token', nullable: true })
  emailVerificationToken?: string;

  @Column({ name: 'email_verification_expires_at', nullable: true })
  emailVerificationExpiresAt?: Date;

  @Column({ name: 'phone_verification_otp', nullable: true })
  phoneVerificationOTP?: string;

  @Column({ name: 'phone_verification_expires_at', nullable: true })
  phoneVerificationExpiresAt?: Date;

  @Column({ name: 'password_reset_token', nullable: true })
  passwordResetToken?: string;

  @Column({ name: 'password_reset_expires_at', nullable: true })
  passwordResetExpiresAt?: Date;

  @Column({ name: 'password_updated_at', type: 'timestamp', nullable: true })
  passwordUpdatedAt?: Date;

  @Column({ name: 'login_attempts', default: 0 })
  loginAttempts!: number;

  @Column({ name: 'locked_until', type: 'timestamp', nullable: true })
  lockedUntil?: Date;

  @Column({ name: 'last_login_at', nullable: true })
  lastLoginAt?: Date;

  @Column({ name: 'profile_completion_percentage', default: 0 })
  profileCompletionPercentage!: number;

  @Column({ name: 'account_status', default: 'active' })
  accountStatus!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToOne(() => UserPreferences, (preferences) => preferences.user, {
    cascade: true,
  })
  @JoinColumn({ name: 'preferences_id' })
  preferences!: UserPreferences;

  @OneToMany(() => UserActivity, (activity) => activity.user, { cascade: true })
  activities!: UserActivity[];

  // Clinic relationships
  @OneToMany(() => ClinicStaff, (staff) => staff.user)
  clinic_staff!: ClinicStaff[];

  @OneToMany(() => ClinicReview, (review) => review.user)
  clinic_reviews!: ClinicReview[];

  // Pet relationships
  @OneToMany(() => Pet, (pet) => pet.owner)
  pets!: Pet[];

  // Appointment relationships
  @OneToMany(() => Appointment, (appointment) => appointment.owner)
  appointments!: Appointment[];

  canLogin(): boolean {
    return this.isActive && this.isEmailVerified;
  }

  incrementLoginAttempts(): void {
    this.loginAttempts = (this.loginAttempts || 0) + 1;
  }

  lockAccount(): void {
    this.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  }

  unlockAccount(): void {
    // TypeORM will handle this as NULL in the database
    (this as any).lockedUntil = null;
  }

  isLocked(): boolean {
    return this.lockedUntil ? this.lockedUntil > new Date() : false;
  }

  resetLoginAttempts(): void {
    this.loginAttempts = 0;
    // TypeORM will handle this as NULL in the database
    (this as any).lockedUntil = null;
  }
}
