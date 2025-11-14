import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Pet } from '../../pets/entities/pet.entity';
import { User } from '../../users/entities/user.entity';
import { PetHost } from './pet-host.entity';
import { PetHostingBooking } from './pet-hosting-booking.entity';

@Entity('pet_host_reviews')
export class PetHostReview {
  @ApiProperty({ description: 'Unique identifier for the review' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'ID of the host being reviewed' })
  @Column({ type: 'uuid' })
  host_id!: string;

  @ApiProperty({ description: 'ID of the booking this review is for' })
  @Column({ type: 'uuid' })
  booking_id!: string;

  @ApiProperty({ description: 'ID of the user who wrote the review' })
  @Column({ type: 'uuid' })
  user_id!: string;

  @ApiProperty({ description: 'ID of the pet involved' })
  @Column({ type: 'uuid' })
  pet_id!: string;

  // Multi-dimensional Ratings
  @ApiProperty({ description: 'Rating for care quality (1-5)' })
  @Column({ type: 'int' })
  care_quality!: number;

  @ApiProperty({ description: 'Rating for communication (1-5)' })
  @Column({ type: 'int' })
  communication!: number;

  @ApiProperty({ description: 'Rating for cleanliness (1-5)' })
  @Column({ type: 'int' })
  cleanliness!: number;

  @ApiProperty({ description: 'Rating for value (1-5)' })
  @Column({ type: 'int' })
  value!: number;

  @ApiProperty({ description: 'Overall rating (1-5)' })
  @Column({ type: 'int' })
  overall!: number;

  // Review Content
  @ApiProperty({ description: 'Review title' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  title?: string;

  @ApiProperty({ description: 'Review comment' })
  @Column({ type: 'text', nullable: true })
  comment?: string;

  @ApiProperty({ description: 'Review photos (array of URLs)' })
  @Column({ type: 'jsonb', default: [] })
  review_photos!: string[];

  // Host Response
  @ApiProperty({ description: 'Host response to the review' })
  @Column({ type: 'text', nullable: true })
  host_response?: string;

  @ApiProperty({ description: 'Date when host responded' })
  @Column({ type: 'timestamp with time zone', nullable: true })
  host_response_date?: Date;

  // Verification
  @ApiProperty({ description: 'Whether the review is verified (from completed booking)' })
  @Column({ type: 'boolean', default: true })
  is_verified!: boolean;

  @ApiProperty({ description: 'Number of helpful votes' })
  @Column({ type: 'int', default: 0 })
  is_helpful_count!: number;

  @ApiProperty({ description: 'Whether the review has been reported' })
  @Column({ type: 'boolean', default: false })
  is_reported!: boolean;

  @ApiProperty({ description: 'Date when the review was created' })
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @ApiProperty({ description: 'Date when the review was last updated' })
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;

  // Relationships
  @ManyToOne(() => PetHost, (host) => host.reviews)
  @JoinColumn({ name: 'host_id' })
  host!: PetHost;

  @OneToOne(() => PetHostingBooking, (booking) => booking.review)
  @JoinColumn({ name: 'booking_id' })
  booking!: PetHostingBooking;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Pet)
  @JoinColumn({ name: 'pet_id' })
  pet!: Pet;

  // Computed properties
  get averageRating(): number {
    const ratings = [
      this.care_quality,
      this.communication,
      this.cleanliness,
      this.value,
      this.overall,
    ];
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  }

  get hasHostResponse(): boolean {
    return !!this.host_response && !!this.host_response_date;
  }

  get isRecent(): boolean {
    const now = new Date();
    const reviewDate = new Date(this.created_at);
    const daysDiff = (now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 30;
  }
}

