import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsEnum, IsInt, IsNumber, IsObject, IsOptional, IsString, IsUUID, Max, MaxLength, Min, ValidateNested } from 'class-validator';
import { WalkGroupVisibility } from '../entities/walk-group.entity';

export class CompatibilityRulesDto {
  @ApiProperty({
    description: 'Allowed pet species',
    type: [String],
    example: ['dog'],
  })
  @IsArray()
  @IsString({ each: true })
  allowed_species!: string[];

  @ApiPropertyOptional({
    description: 'Allowed pet sizes',
    type: [String],
    example: ['small', 'medium'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowed_sizes?: string[];

  @ApiPropertyOptional({
    description: 'Restricted temperaments (pets with these in behavioral_notes cannot join)',
    type: [String],
    example: ['aggressive', 'fearful'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  restricted_temperaments?: string[];

  @ApiPropertyOptional({
    description: 'Require pets to be vaccinated',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  require_vaccinated?: boolean;

  @ApiPropertyOptional({
    description: 'Require pets to be spayed/neutered',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  require_spayed_neutered?: boolean;
}

export class CreateWalkGroupDto {
  @ApiProperty({
    description: 'Name of the walk group event',
    example: 'Morning Dog Walk at Central Park',
  })
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({
    description: 'Description of the walk group event',
    example: 'Join us for a fun morning walk with your furry friends!',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Scheduled date and time for the walk group',
    example: '2024-01-15T10:00:00Z',
  })
  @IsDateString()
  scheduled_date!: string;

  @ApiPropertyOptional({
    description: 'Duration of the walk in minutes',
    example: 60,
    default: 60,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(15)
  @Max(480)
  duration_minutes?: number;

  @ApiPropertyOptional({
    description: 'Location name (e.g., park name, trail name)',
    example: 'Central Park',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location_name?: string;

  @ApiProperty({
    description: 'Full address of the walk location',
    example: '123 Park Avenue, New York, NY 10001',
  })
  @IsString()
  address!: string;

  @ApiPropertyOptional({
    description: 'Latitude coordinate for map display',
    example: 40.7829,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude coordinate for map display',
    example: -73.9654,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({
    description: 'City where the walk takes place',
    example: 'New York',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({
    description: 'State/province where the walk takes place',
    example: 'NY',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @ApiPropertyOptional({
    description: 'Postal code where the walk takes place',
    example: '10001',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postal_code?: string;

  @ApiPropertyOptional({
    description: 'Country where the walk takes place',
    example: 'USA',
    default: 'USA',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of participants (pets)',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2)
  @Max(50)
  max_participants?: number;

  @ApiPropertyOptional({
    description: 'Visibility of the walk group',
    enum: WalkGroupVisibility,
    example: WalkGroupVisibility.PUBLIC,
    default: WalkGroupVisibility.PUBLIC,
  })
  @IsOptional()
  @IsEnum(WalkGroupVisibility)
  visibility?: WalkGroupVisibility;

  @ApiProperty({
    description: 'Pet compatibility rules',
    type: CompatibilityRulesDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => CompatibilityRulesDto)
  compatibility_rules!: CompatibilityRulesDto;

  @ApiProperty({
    description: 'ID of the pet that will participate (organizer\'s pet)',
    example: 'uuid-string',
  })
  @IsUUID()
  pet_id!: string;
}

