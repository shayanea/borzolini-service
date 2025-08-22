import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { UserActivity } from './user-activity.entity';
import { UserPreferences } from './user-preferences.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'first_name' })
  firstName!: string;

  @Column({ name: 'last_name' })
  lastName!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'veterinarian', 'staff', 'patient'],
    default: 'patient',
  })
  role!: 'admin' | 'veterinarian' | 'staff' | 'patient';

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

  @Column({ name: 'login_attempts', default: 0 })
  loginAttempts!: number;

  @Column({ name: 'locked_until', nullable: true })
  lockedUntil?: Date | null;

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

  @OneToOne(() => UserPreferences, (preferences) => preferences.user, { cascade: true })
  @JoinColumn({ name: 'preferences_id' })
  preferences!: UserPreferences;

  @OneToMany(() => UserActivity, (activity) => activity.user, { cascade: true })
  activities!: UserActivity[];

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
    this.lockedUntil = null;
  }

  isLocked(): boolean {
    return this.lockedUntil ? this.lockedUntil > new Date() : false;
  }

  resetLoginAttempts(): void {
    this.loginAttempts = 0;
    this.lockedUntil = null;
  }
}
