import { Column, CreateDateColumn, Entity, Index, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Exclude } from 'class-transformer';
import { UserActivity } from './user-activity.entity';
import { UserPreferences } from './user-preferences.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  phone?: string;

  @Column({ type: 'varchar', length: 50 })
  firstName: string;

  @Column({ type: 'varchar', length: 50 })
  lastName: string;

  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  passwordHash: string;

  @Column({ type: 'varchar', length: 20, default: 'patient' })
  role: 'admin' | 'veterinarian' | 'staff' | 'patient';

  @Column({ type: 'varchar', length: 100, nullable: true })
  avatar?: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ type: 'varchar', length: 200, nullable: true })
  address?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  postalCode?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ type: 'boolean', default: false })
  isPhoneVerified: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  refreshToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  refreshTokenExpiresAt?: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  emailVerificationToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  emailVerificationExpiresAt?: Date;

  @Column({ type: 'varchar', length: 10, nullable: true })
  phoneVerificationOTP?: string;

  @Column({ type: 'timestamp', nullable: true })
  phoneVerificationExpiresAt?: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  passwordResetToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpiresAt?: Date;

  @Column({ type: 'integer', default: 0 })
  loginAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  lockedUntil?: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  preferredLanguage?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  timezone?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToOne(() => UserPreferences, (preferences) => preferences.user, { cascade: true })
  preferences: UserPreferences;

  @OneToMany(() => UserActivity, (activity) => activity.user, { cascade: true })
  activities: UserActivity[];

  // Virtual property for full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Virtual property for display name
  get displayName(): string {
    return this.fullName;
  }

  // Virtual property for profile completion percentage
  get profileCompletionPercentage(): number {
    const fields = [this.firstName, this.lastName, this.phone, this.address, this.city, this.postalCode, this.country, this.dateOfBirth, this.avatar, this.isEmailVerified, this.isPhoneVerified];

    const completedFields = fields.filter((field) => field !== null && field !== undefined && field !== '').length;

    return Math.round((completedFields / fields.length) * 100);
  }

  // Virtual property for account status
  get accountStatus(): 'active' | 'locked' | 'inactive' {
    if (!this.isActive) return 'inactive';
    if (this.lockedUntil && this.lockedUntil > new Date()) return 'locked';
    return 'active';
  }

  // Method to check if user can login
  canLogin(): boolean {
    return this.isActive && this.isEmailVerified && (!this.lockedUntil || this.lockedUntil <= new Date());
  }

  // Method to increment login attempts
  incrementLoginAttempts(): void {
    this.loginAttempts += 1;
    if (this.loginAttempts >= 5) {
      this.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
    }
  }

  // Method to reset login attempts
  resetLoginAttempts(): void {
    this.loginAttempts = 0;
    this.lockedUntil = null;
  }
}
