import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ description: 'Check-in date', example: '2024-02-01' })
  @IsDateString()
  check_in_date!: string;

  @ApiProperty({ description: 'Check-out date', example: '2024-02-10' })
  @IsDateString()
  check_out_date!: string;

  @ApiProperty({ description: 'ID of the host', example: 'uuid-string' })
  @IsUUID()
  host_id!: string;

  @ApiProperty({ description: 'ID of the pet', example: 'uuid-string' })
  @IsUUID()
  pet_id!: string;

  @ApiPropertyOptional({ description: 'Special instructions for the host' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  special_instructions?: string;

  @ApiPropertyOptional({ description: 'Medication schedule', example: ['Morning: 8am - Heart medication', 'Evening: 8pm - Joint supplement'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medication_schedule?: string[];

  @ApiPropertyOptional({ description: 'Dietary needs and restrictions', example: 'Grain-free diet, no chicken' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  dietary_needs?: string;
}

