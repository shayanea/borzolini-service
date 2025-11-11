import { ApiProperty } from '@nestjs/swagger';
import { WalkGroupStatus, WalkGroupVisibility, CompatibilityRules } from '../entities/walk-group.entity';
import { ParticipantStatus } from '../entities/walk-group-participant.entity';

export class ParticipantResponseDto {
  @ApiProperty({ description: 'Participant ID' })
  id!: string;

  @ApiProperty({ description: 'User ID (pet owner)' })
  user_id!: string;

  @ApiProperty({ description: 'Pet ID' })
  pet_id!: string;

  @ApiProperty({ description: 'Pet name' })
  pet_name!: string;

  @ApiProperty({ description: 'Owner name' })
  owner_name!: string;

  @ApiProperty({ description: 'Status of participation', enum: ParticipantStatus })
  status!: ParticipantStatus;

  @ApiProperty({ description: 'Date when joined' })
  joined_at!: Date;

  @ApiProperty({ description: 'Optional notes', required: false })
  notes?: string;
}

export class WalkGroupResponseDto {
  @ApiProperty({ description: 'Unique identifier for the walk group' })
  id!: string;

  @ApiProperty({ description: 'Name of the walk group event' })
  name!: string;

  @ApiProperty({ description: 'Description of the walk group event', required: false })
  description?: string;

  @ApiProperty({ description: 'Scheduled date and time for the walk group' })
  scheduled_date!: Date;

  @ApiProperty({ description: 'Duration of the walk in minutes' })
  duration_minutes!: number;

  @ApiProperty({ description: 'Location name', required: false })
  location_name?: string;

  @ApiProperty({ description: 'Full address of the walk location' })
  address!: string;

  @ApiProperty({ description: 'Latitude coordinate', required: false })
  latitude?: number;

  @ApiProperty({ description: 'Longitude coordinate', required: false })
  longitude?: number;

  @ApiProperty({ description: 'City', required: false })
  city?: string;

  @ApiProperty({ description: 'State/province', required: false })
  state?: string;

  @ApiProperty({ description: 'Postal code', required: false })
  postal_code?: string;

  @ApiProperty({ description: 'Country' })
  country!: string;

  @ApiProperty({ description: 'Maximum number of participants' })
  max_participants!: number;

  @ApiProperty({ description: 'Current number of participants' })
  current_participants!: number;

  @ApiProperty({ description: 'Visibility of the walk group', enum: WalkGroupVisibility })
  visibility!: WalkGroupVisibility;

  @ApiProperty({ description: 'Unique invite code' })
  invite_code!: string;

  @ApiProperty({ description: 'Shareable invite URL' })
  invite_url!: string;

  @ApiProperty({ description: 'Pet compatibility rules', type: 'object' })
  compatibility_rules!: CompatibilityRules;

  @ApiProperty({ description: 'Status of the walk group', enum: WalkGroupStatus })
  status!: WalkGroupStatus;

  @ApiProperty({ description: 'Whether the walk group is active' })
  is_active!: boolean;

  @ApiProperty({ description: 'ID of the organizer' })
  organizer_id!: string;

  @ApiProperty({ description: 'Organizer name' })
  organizer_name!: string;

  @ApiProperty({ description: 'List of participants', type: [ParticipantResponseDto], required: false })
  participants?: ParticipantResponseDto[];

  @ApiProperty({ description: 'Date when created' })
  created_at!: Date;

  @ApiProperty({ description: 'Date when last updated' })
  updated_at!: Date;

  @ApiProperty({ description: 'Whether the event is upcoming' })
  is_upcoming!: boolean;

  @ApiProperty({ description: 'Whether the event is full' })
  is_full!: boolean;
}

