import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Clinic } from '../../clinics/entities/clinic.entity';
import { Pet } from '../../pets/entities/pet.entity';
import { User } from '../../users/entities/user.entity';

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged',
}

export enum ReviewType {
  HOME_VISIT = 'home_visit',
  CONSULTATION = 'consultation',
  EMERGENCY = 'emergency',
  FOLLOW_UP = 'follow_up',
}

@Entity('appointment_reviews')
export class AppointmentReview {
  @ApiProperty({ description: 'Unique identifier for the review' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'ID of the appointment being reviewed' })
  @Column({ type: 'uuid' })
  appointment_id!: string;

  @ApiProperty({ description: 'ID of the user who wrote the review' })
  @Column({ type: 'uuid' })
  user_id!: string;

  @ApiProperty({ description: 'ID of the pet involved in the appointment' })
  @Column({ type: 'uuid' })
  pet_id!: string;

  @ApiProperty({ description: 'ID of the clinic being reviewed' })
  @Column({ type: 'uuid' })
  clinic_id!: string;

  @ApiProperty({ description: 'Overall rating (1-5 stars)', example: 5 })
  @Column({ type: 'int', default: 5 })
  overall_rating!: number;

  @ApiProperty({ description: 'Rating for vet expertise (1-5 stars)', example: 5 })
  @Column({ type: 'int', default: 5 })
  vet_expertise_rating!: number;

  @ApiProperty({ description: 'Rating for communication (1-5 stars)', example: 5 })
  @Column({ type: 'int', default: 5 })
  communication_rating!: number;

  @ApiProperty({ description: 'Rating for punctuality (1-5 stars)', example: 5 })
  @Column({ type: 'int', default: 5 })
  punctuality_rating!: number;

  @ApiProperty({ description: 'Rating for home visit experience (1-5 stars)', example: 5 })
  @Column({ type: 'int', default: 5 })
  home_visit_rating!: number;

  @ApiProperty({ description: 'Rating for follow-up care (1-5 stars)', example: 5 })
  @Column({ type: 'int', default: 5 })
  follow_up_rating!: number;

  @ApiProperty({ description: 'Review title', example: 'Excellent home visit for Fariborz' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  title?: string;

  @ApiProperty({ description: 'Detailed review comment' })
  @Column({ type: 'text', nullable: true })
  comment?: string;

  @ApiProperty({ description: 'What went well during the visit' })
  @Column({ type: 'text', nullable: true })
  positive_aspects?: string;

  @ApiProperty({ description: 'Areas for improvement' })
  @Column({ type: 'text', nullable: true })
  improvement_areas?: string;

  @ApiProperty({ description: 'Would recommend to others', default: true })
  @Column({ type: 'boolean', default: true })
  would_recommend!: boolean;

  @ApiProperty({ description: 'Type of appointment reviewed', enum: ReviewType })
  @Column({ type: 'enum', enum: ReviewType })
  review_type!: ReviewType;

  @ApiProperty({ description: 'Status of the review', enum: ReviewStatus })
  @Column({ type: 'enum', enum: ReviewStatus, default: ReviewStatus.PENDING })
  status!: ReviewStatus;

  @ApiProperty({ description: 'Whether the review is verified', default: false })
  @Column({ type: 'boolean', default: false })
  is_verified!: boolean;

  @ApiProperty({ description: 'Number of helpful votes', default: 0 })
  @Column({ type: 'int', default: 0 })
  helpful_count!: number;

  @ApiProperty({ description: 'Whether the review has been reported', default: false })
  @Column({ type: 'boolean', default: false })
  is_reported!: boolean;

  @ApiProperty({ description: 'Reason for reporting (if reported)' })
  @Column({ type: 'varchar', length: 500, nullable: true })
  report_reason?: string;

  @ApiProperty({ description: 'Pet photos from the visit' })
  @Column({ type: 'jsonb', default: [] })
  pet_photos!: string[];

  @ApiProperty({ description: 'Visit photos (with permission)' })
  @Column({ type: 'jsonb', default: [] })
  visit_photos!: string[];

  @ApiProperty({ description: 'Clinic response to the review' })
  @Column({ type: 'text', nullable: true })
  clinic_response?: string;

  @ApiProperty({ description: 'Date of clinic response' })
  @Column({ type: 'timestamp with time zone', nullable: true })
  clinic_response_date?: Date;

  @ApiProperty({ description: 'Whether the review is anonymous', default: false })
  @Column({ type: 'boolean', default: false })
  is_anonymous!: boolean;

  @ApiProperty({ description: 'Date when the review was created' })
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @ApiProperty({ description: 'Date when the review was last updated' })
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;

  // Relationships
  @ManyToOne(() => Appointment, (appointment) => appointment.reviews)
  @JoinColumn({ name: 'appointment_id' })
  appointment!: Appointment;

  @ManyToOne(() => User, (user) => user.appointment_reviews)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Pet, (pet) => pet.appointment_reviews)
  @JoinColumn({ name: 'pet_id' })
  pet!: Pet;

  @ManyToOne(() => Clinic, (clinic) => clinic.appointment_reviews)
  @JoinColumn({ name: 'clinic_id' })
  clinic!: Clinic;

  // Computed properties
  get averageRating(): number {
    const ratings = [this.vet_expertise_rating, this.communication_rating, this.punctuality_rating, this.home_visit_rating, this.follow_up_rating];
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  }

  get isRecent(): boolean {
    const now = new Date();
    const reviewDate = new Date(this.created_at);
    const daysDiff = (now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7; // Recent if within 7 days
  }

  get isHighRating(): boolean {
    return this.overall_rating >= 4;
  }

  get isLowRating(): boolean {
    return this.overall_rating <= 2;
  }
}
