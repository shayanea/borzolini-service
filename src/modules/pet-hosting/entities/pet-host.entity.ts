import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { PetHostAvailability } from './pet-host-availability.entity';
import { PetHostPhoto } from './pet-host-photo.entity';
import { PetHostReview } from './pet-host-review.entity';
import { PetHostingBooking } from './pet-hosting-booking.entity';
import { User } from '../../users/entities/user.entity';

export interface SizePricingTiers {
  small: number;
  medium: number;
  large: number;
  giant: number;
}

export interface DurationDiscounts {
  weekly: number; // e.g., 0.1 for 10% off
  monthly: number; // e.g., 0.2 for 20% off
}

@Entity('pet_hosts')
export class PetHost {
  @ApiProperty({ description: 'Unique identifier for the host' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'ID of the user who owns this host profile' })
  @Column({ type: 'uuid' })
  user_id!: string;

  // Host Profile
  @ApiProperty({ description: 'Host bio and description' })
  @Column({ type: 'text', nullable: true })
  bio?: string;

  @ApiProperty({ description: 'Years of experience hosting pets' })
  @Column({ type: 'int', default: 0 })
  experience_years!: number;

  @ApiProperty({ description: 'Certifications and qualifications' })
  @Column({ type: 'jsonb', default: [] })
  certifications!: string[];

  // Location
  @ApiProperty({ description: 'Street address' })
  @Column({ type: 'text' })
  address!: string;

  @ApiProperty({ description: 'City' })
  @Column({ type: 'varchar', length: 100 })
  city!: string;

  @ApiProperty({ description: 'State or province' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  state?: string;

  @ApiProperty({ description: 'Postal code' })
  @Column({ type: 'varchar', length: 20, nullable: true })
  postal_code?: string;

  @ApiProperty({ description: 'Country', default: 'USA' })
  @Column({ type: 'varchar', length: 100, default: 'USA' })
  country!: string;

  @ApiProperty({ description: 'Latitude coordinate' })
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @ApiProperty({ description: 'Longitude coordinate' })
  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number;

  // Capacity
  @ApiProperty({ description: 'Maximum number of pets that can be hosted' })
  @Column({ type: 'int', default: 1 })
  max_pets!: number;

  @ApiProperty({ description: 'Preferred pet sizes (array of PetSize enum values)' })
  @Column({ type: 'jsonb', default: [] })
  pet_size_preferences!: string[];

  // Amenities & Services
  @ApiProperty({ description: 'Available amenities' })
  @Column({ type: 'jsonb', default: [] })
  amenities!: string[];

  @ApiProperty({ description: 'Services offered' })
  @Column({ type: 'jsonb', default: [] })
  services_offered!: string[];

  // Pricing
  @ApiProperty({ description: 'Base daily rate per pet', example: 30.00 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 30.00 })
  base_daily_rate!: number;

  @ApiProperty({ description: 'Size-based pricing multipliers' })
  @Column({
    type: 'jsonb',
    default: { small: 1.0, medium: 1.2, large: 1.5, giant: 2.0 },
  })
  size_pricing_tiers!: SizePricingTiers;

  @ApiProperty({ description: 'Duration discounts (weekly, monthly)' })
  @Column({
    type: 'jsonb',
    default: { weekly: 0.1, monthly: 0.2 },
  })
  duration_discounts!: DurationDiscounts;

  // Trust Metrics
  @ApiProperty({ description: 'Response rate percentage (0-100)' })
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.0 })
  response_rate!: number;

  @ApiProperty({ description: 'Completion rate percentage (0-100)' })
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.0 })
  completion_rate!: number;

  @ApiProperty({ description: 'Average response time in hours' })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  response_time_avg_hours?: number;

  // Status
  @ApiProperty({ description: 'Whether the host is verified' })
  @Column({ type: 'boolean', default: false })
  is_verified!: boolean;

  @ApiProperty({ description: 'Whether the host profile is active' })
  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @ApiProperty({ description: 'Whether the host has super host badge' })
  @Column({ type: 'boolean', default: false })
  is_super_host!: boolean;

  // Ratings
  @ApiProperty({ description: 'Average rating (0-5)' })
  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0.0,
    transformer: {
      to: (value: number) => value,
      from: (value: string | number) => parseFloat(value as string),
    },
  })
  rating!: number;

  @ApiProperty({ description: 'Total number of reviews' })
  @Column({ type: 'int', default: 0 })
  total_reviews!: number;

  @ApiProperty({ description: 'Date when the host profile was created' })
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @ApiProperty({ description: 'Date when the host profile was last updated' })
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.hosted_pets)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToMany(() => PetHostingBooking, (booking) => booking.host)
  bookings!: PetHostingBooking[];

  @OneToMany(() => PetHostAvailability, (availability) => availability.host)
  availability!: PetHostAvailability[];

  @OneToMany(() => PetHostReview, (review) => review.host)
  reviews!: PetHostReview[];

  @OneToMany(() => PetHostPhoto, (photo) => photo.host)
  photos!: PetHostPhoto[];

  // Computed properties
  get trustScore(): number {
    let score = 0;
    if (this.is_verified) score += 20;
    if (this.is_super_host) score += 30;
    score += (this.response_rate / 100) * 20;
    score += (this.completion_rate / 100) * 20;
    score += (this.rating / 5) * 10;
    return Math.min(100, score);
  }

  get hasMinimumReviews(): boolean {
    return this.total_reviews >= 3;
  }

  get canBecomeSuperHost(): boolean {
    return (
      this.response_rate >= 90 &&
      this.rating >= 4.8 &&
      this.total_reviews >= 10 &&
      this.completion_rate >= 95
    );
  }
}

