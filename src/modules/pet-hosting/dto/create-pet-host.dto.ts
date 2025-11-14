import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsLatitude, IsLongitude, IsNumber, IsOptional, IsString, Max, MaxLength, Min, ValidateNested } from 'class-validator';

export class SizePricingTiersDto {
  @ApiProperty({ example: 1.0 })
  @IsNumber()
  @Min(0)
  small!: number;

  @ApiProperty({ example: 1.2 })
  @IsNumber()
  @Min(0)
  medium!: number;

  @ApiProperty({ example: 1.5 })
  @IsNumber()
  @Min(0)
  large!: number;

  @ApiProperty({ example: 2.0 })
  @IsNumber()
  @Min(0)
  giant!: number;
}

export class DurationDiscountsDto {
  @ApiProperty({ example: 0.1, description: 'Weekly discount (e.g., 0.1 for 10% off)' })
  @IsNumber()
  @Min(0)
  @Max(1)
  weekly!: number;

  @ApiProperty({ example: 0.2, description: 'Monthly discount (e.g., 0.2 for 20% off)' })
  @IsNumber()
  @Min(0)
  @Max(1)
  monthly!: number;
}

export class CreatePetHostDto {
  @ApiPropertyOptional({ description: 'Host bio and description' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @ApiPropertyOptional({ description: 'Years of experience hosting pets', example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  experience_years?: number;

  @ApiPropertyOptional({ description: 'Certifications and qualifications', example: ['CPR Certified', 'Pet First Aid'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @ApiProperty({ description: 'Street address', example: '123 Pet Care Street' })
  @IsString()
  @MaxLength(500)
  address!: string;

  @ApiProperty({ description: 'City', example: 'New York' })
  @IsString()
  @MaxLength(100)
  city!: string;

  @ApiPropertyOptional({ description: 'State or province', example: 'NY' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @ApiPropertyOptional({ description: 'Postal code', example: '10001' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postal_code?: string;

  @ApiPropertyOptional({ description: 'Country', example: 'USA', default: 'USA' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ description: 'Latitude coordinate', example: 40.7128 })
  @IsOptional()
  @Type(() => Number)
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude coordinate', example: -74.0060 })
  @IsOptional()
  @Type(() => Number)
  @IsLongitude()
  longitude?: number;

  @ApiProperty({ description: 'Maximum number of pets that can be hosted', example: 3 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  max_pets!: number;

  @ApiPropertyOptional({ description: 'Preferred pet sizes', example: ['small', 'medium', 'large'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pet_size_preferences?: string[];

  @ApiPropertyOptional({ description: 'Available amenities', example: ['fenced_yard', 'indoor_space', 'outdoor_space'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @ApiPropertyOptional({ description: 'Services offered', example: ['medication_administration', 'grooming', 'training'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  services_offered?: string[];

  @ApiProperty({ description: 'Base daily rate per pet', example: 30.00 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  base_daily_rate!: number;

  @ApiPropertyOptional({ description: 'Size-based pricing tiers' })
  @IsOptional()
  @ValidateNested()
  @Type(() => SizePricingTiersDto)
  size_pricing_tiers?: SizePricingTiersDto;

  @ApiPropertyOptional({ description: 'Duration discounts' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DurationDiscountsDto)
  duration_discounts?: DurationDiscountsDto;
}

