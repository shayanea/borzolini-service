import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Pet } from '../../pets/entities/pet.entity';
import { User } from '../../users/entities/user.entity';
import { PetHost } from './pet-host.entity';
import { PetHostReview } from './pet-host-review.entity';

export enum BookingStatus {
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('pet_hosting_bookings')
export class PetHostingBooking {
  @ApiProperty({ description: 'Unique identifier for the booking' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Dates
  @ApiProperty({ description: 'Check-in date' })
  @Column({ type: 'date' })
  check_in_date!: Date;

  @ApiProperty({ description: 'Check-out date' })
  @Column({ type: 'date' })
  check_out_date!: Date;

  // Pricing
  @ApiProperty({ description: 'Base price before discounts' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  base_price!: number;

  @ApiProperty({ description: 'Size multiplier applied' })
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0 })
  size_multiplier!: number;

  @ApiProperty({ description: 'Duration discount percentage' })
  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0.0 })
  duration_discount!: number;

  @ApiProperty({ description: 'Additional services fee' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  additional_services_fee!: number;

  @ApiProperty({ description: 'Total price after all calculations' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_price!: number;

  // Status
  @ApiProperty({ description: 'Booking status', enum: BookingStatus })
  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING_APPROVAL,
  })
  status!: BookingStatus;

  // Special Requirements
  @ApiProperty({ description: 'Special instructions for the host' })
  @Column({ type: 'text', nullable: true })
  special_instructions?: string;

  @ApiProperty({ description: 'Medication schedule (JSON array)' })
  @Column({ type: 'jsonb', default: [] })
  medication_schedule!: string[];

  @ApiProperty({ description: 'Dietary needs and restrictions' })
  @Column({ type: 'text', nullable: true })
  dietary_needs?: string;

  // Host Approval
  @ApiProperty({ description: 'Date when host approved the booking' })
  @Column({ type: 'timestamp with time zone', nullable: true })
  approved_at?: Date;

  @ApiProperty({ description: 'Date when host rejected the booking' })
  @Column({ type: 'timestamp with time zone', nullable: true })
  rejected_at?: Date;

  @ApiProperty({ description: 'Reason for rejection' })
  @Column({ type: 'text', nullable: true })
  rejection_reason?: string;

  // Payment
  @ApiProperty({ description: 'Payment status' })
  @Column({ type: 'varchar', length: 50, default: 'pending' })
  payment_status!: string;

  // Foreign Keys
  @ApiProperty({ description: 'ID of the host' })
  @Column({ type: 'uuid' })
  host_id!: string;

  @ApiProperty({ description: 'ID of the pet' })
  @Column({ type: 'uuid' })
  pet_id!: string;

  @ApiProperty({ description: 'ID of the pet owner' })
  @Column({ type: 'uuid' })
  owner_id!: string;

  @ApiProperty({ description: 'Date when the booking was created' })
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @ApiProperty({ description: 'Date when the booking was last updated' })
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;

  // Relationships
  @ManyToOne(() => PetHost, (host) => host.bookings)
  @JoinColumn({ name: 'host_id' })
  host!: PetHost;

  @ManyToOne(() => Pet, (pet) => pet.hosting_bookings)
  @JoinColumn({ name: 'pet_id' })
  pet!: Pet;

  @ManyToOne(() => User, (user) => user.hosting_bookings)
  @JoinColumn({ name: 'owner_id' })
  owner!: User;

  @OneToOne(() => PetHostReview, (review) => review.booking)
  review?: PetHostReview;

  // Computed properties
  get durationDays(): number {
    const checkIn = new Date(this.check_in_date);
    const checkOut = new Date(this.check_out_date);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get isPending(): boolean {
    return this.status === BookingStatus.PENDING_APPROVAL;
  }

  get isApproved(): boolean {
    return this.status === BookingStatus.APPROVED;
  }

  get isConfirmed(): boolean {
    return this.status === BookingStatus.CONFIRMED;
  }

  get isInProgress(): boolean {
    return this.status === BookingStatus.IN_PROGRESS;
  }

  get isCompleted(): boolean {
    return this.status === BookingStatus.COMPLETED;
  }

  get isCancelled(): boolean {
    return this.status === BookingStatus.CANCELLED;
  }

  get isRejected(): boolean {
    return this.status === BookingStatus.REJECTED;
  }

  get canBeReviewed(): boolean {
    return this.isCompleted && !this.review;
  }

  get isOverdue(): boolean {
    if (this.isCompleted || this.isCancelled || this.isRejected) {
      return false;
    }
    const now = new Date();
    const checkOut = new Date(this.check_out_date);
    return now > checkOut;
  }

  get isUpcoming(): boolean {
    if (this.isCompleted || this.isCancelled || this.isRejected) {
      return false;
    }
    const now = new Date();
    const checkIn = new Date(this.check_in_date);
    return now < checkIn;
  }

  get isToday(): boolean {
    const today = new Date();
    const checkIn = new Date(this.check_in_date);
    return today.toDateString() === checkIn.toDateString();
  }
}

