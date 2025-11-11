import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { WalkGroupParticipant } from './walk-group-participant.entity';

export enum WalkGroupVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export enum WalkGroupStatus {
  SCHEDULED = 'scheduled',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export interface CompatibilityRules {
  allowed_species: string[];
  allowed_sizes: string[];
  restricted_temperaments: string[];
  require_vaccinated: boolean;
  require_spayed_neutered: boolean;
}

@Entity('walk_groups')
export class WalkGroup {
  @ApiProperty({ description: 'Unique identifier for the walk group' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'Name of the walk group event' })
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @ApiProperty({ description: 'Description of the walk group event', required: false })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Scheduled date and time for the walk group' })
  @Column({ type: 'timestamp with time zone' })
  scheduled_date!: Date;

  @ApiProperty({ description: 'Duration of the walk in minutes', default: 60 })
  @Column({ type: 'int', default: 60 })
  duration_minutes!: number;

  @ApiProperty({ description: 'Location name (e.g., park name, trail name)', required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  location_name?: string;

  @ApiProperty({ description: 'Full address of the walk location' })
  @Column({ type: 'text' })
  address!: string;

  @ApiProperty({ description: 'Latitude coordinate for map display', required: false })
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @ApiProperty({ description: 'Longitude coordinate for map display', required: false })
  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number;

  @ApiProperty({ description: 'City where the walk takes place', required: false })
  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @ApiProperty({ description: 'State/province where the walk takes place', required: false })
  @Column({ type: 'varchar', length: 100, nullable: true })
  state?: string;

  @ApiProperty({ description: 'Postal code where the walk takes place', required: false })
  @Column({ type: 'varchar', length: 20, nullable: true })
  postal_code?: string;

  @ApiProperty({ description: 'Country where the walk takes place', default: 'USA' })
  @Column({ type: 'varchar', length: 100, default: 'USA' })
  country!: string;

  @ApiProperty({ description: 'Maximum number of participants (pets)', default: 10 })
  @Column({ type: 'int', default: 10 })
  max_participants!: number;

  @ApiProperty({ description: 'Visibility of the walk group', enum: WalkGroupVisibility, default: WalkGroupVisibility.PUBLIC })
  @Column({ type: 'enum', enum: WalkGroupVisibility, default: WalkGroupVisibility.PUBLIC })
  visibility!: WalkGroupVisibility;

  @ApiProperty({ description: 'Unique invite code for joining the walk group' })
  @Column({ type: 'varchar', length: 20, unique: true })
  invite_code!: string;

  @ApiProperty({ description: 'Shareable URL for joining the walk group' })
  @Column({ type: 'varchar', length: 500 })
  invite_url!: string;

  @ApiProperty({ description: 'Pet compatibility rules', type: 'object' })
  @Column({ type: 'jsonb', default: {} })
  compatibility_rules!: CompatibilityRules;

  @ApiProperty({ description: 'Status of the walk group', enum: WalkGroupStatus, default: WalkGroupStatus.SCHEDULED })
  @Column({ type: 'enum', enum: WalkGroupStatus, default: WalkGroupStatus.SCHEDULED })
  status!: WalkGroupStatus;

  @ApiProperty({ description: 'Whether the walk group is active' })
  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @ApiProperty({ description: 'Date when the walk group was created' })
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @ApiProperty({ description: 'Date when the walk group was last updated' })
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;

  // Foreign Keys
  @ApiProperty({ description: 'ID of the organizer (user)' })
  @Column({ type: 'uuid' })
  organizer_id!: string;

  // Relationships
  @ManyToOne(() => User)
  @JoinColumn({ name: 'organizer_id' })
  organizer!: User;

  @OneToMany(() => WalkGroupParticipant, (participant) => participant.walk_group)
  participants!: WalkGroupParticipant[];

  // Computed properties
  get isUpcoming(): boolean {
    if (this.status === WalkGroupStatus.COMPLETED || this.status === WalkGroupStatus.CANCELLED) {
      return false;
    }
    const now = new Date();
    const scheduledTime = new Date(this.scheduled_date);
    return now < scheduledTime;
  }

  get isPast(): boolean {
    const now = new Date();
    const scheduledTime = new Date(this.scheduled_date);
    const endTime = new Date(scheduledTime.getTime() + this.duration_minutes * 60000);
    return now > endTime;
  }

  get estimatedEndTime(): Date {
    const scheduledTime = new Date(this.scheduled_date);
    return new Date(scheduledTime.getTime() + this.duration_minutes * 60000);
  }

  get currentParticipantCount(): number {
    return this.participants?.filter(p => p.status === 'joined').length || 0;
  }

  get isFull(): boolean {
    return this.currentParticipantCount >= this.max_participants;
  }
}

