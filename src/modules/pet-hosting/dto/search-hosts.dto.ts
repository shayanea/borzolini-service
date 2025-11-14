import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsInt, IsLatitude, IsLongitude, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class SearchHostsDto {
  @ApiPropertyOptional({ description: 'Search query (name, city, amenities)', example: 'dog friendly' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'City to search in', example: 'New York' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'State to search in', example: 'NY' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: 'Latitude for location-based search', example: 40.7128 })
  @IsOptional()
  @Type(() => Number)
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude for location-based search', example: -74.0060 })
  @IsOptional()
  @Type(() => Number)
  @IsLongitude()
  longitude?: number;

  @ApiPropertyOptional({ description: 'Search radius in kilometers', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  radius_km?: number;

  @ApiPropertyOptional({ description: 'Check-in date for availability', example: '2024-02-01' })
  @IsOptional()
  @IsDateString()
  check_in_date?: string;

  @ApiPropertyOptional({ description: 'Check-out date for availability', example: '2024-02-10' })
  @IsOptional()
  @IsDateString()
  check_out_date?: string;

  @ApiPropertyOptional({ description: 'Pet size to filter by', example: 'large' })
  @IsOptional()
  @IsString()
  pet_size?: string;

  @ApiPropertyOptional({ description: 'Minimum rating', example: 4.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  min_rating?: number;

  @ApiPropertyOptional({ description: 'Maximum daily rate', example: 50.00 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  max_price?: number;

  @ApiPropertyOptional({ description: 'Minimum daily rate', example: 20.00 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_price?: number;

  @ApiPropertyOptional({ description: 'Filter by super hosts only', example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  super_host_only?: boolean;

  @ApiPropertyOptional({ description: 'Filter by verified hosts only', example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  verified_only?: boolean;

  @ApiPropertyOptional({ description: 'Minimum response rate', example: 90 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  min_response_rate?: number;

  @ApiPropertyOptional({ description: 'Amenities to filter by', example: ['fenced_yard', 'indoor_space'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @ApiPropertyOptional({ description: 'Page number', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ description: 'Sort field', example: 'rating', enum: ['rating', 'price', 'distance', 'reviews', 'response_rate'] })
  @IsOptional()
  @IsString()
  sort_by?: string;

  @ApiPropertyOptional({ description: 'Sort order', example: 'DESC', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsString()
  sort_order?: 'ASC' | 'DESC';
}

