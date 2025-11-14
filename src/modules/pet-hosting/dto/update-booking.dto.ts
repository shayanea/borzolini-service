import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateBookingDto {
  @ApiPropertyOptional({ description: 'Check-in date', example: '2024-02-01' })
  @IsOptional()
  @IsDateString()
  check_in_date?: string;

  @ApiPropertyOptional({ description: 'Check-out date', example: '2024-02-10' })
  @IsOptional()
  @IsDateString()
  check_out_date?: string;

  @ApiPropertyOptional({ description: 'Special instructions for the host' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  special_instructions?: string;

  @ApiPropertyOptional({ description: 'Medication schedule' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medication_schedule?: string[];

  @ApiPropertyOptional({ description: 'Dietary needs and restrictions' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  dietary_needs?: string;
}

