import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { AppointmentType } from '../../appointments/entities/appointment.entity';
import { ServiceCategory } from '../../clinics/entities/clinic-service.entity';

export class FindClinicDto {
  @ApiProperty({
    description: 'User latitude coordinate',
    example: 40.7128,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @ApiProperty({
    description: 'User longitude coordinate',
    example: -74.006,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @ApiProperty({
    description: 'Type of service requested (grooming, check, shop, etc.)',
    example: 'grooming',
    enum: [...Object.values(AppointmentType), ...Object.values(ServiceCategory), 'shop', 'retail'],
  })
  @IsString()
  serviceType!: string;

  @ApiPropertyOptional({
    description: 'Search radius in kilometers',
    example: 10,
    default: 10,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  radiusKm?: number;

  @ApiPropertyOptional({
    description: 'Minimum rating filter',
    example: 4.0,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional({
    description: 'Only return verified clinics',
    example: true,
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  verifiedOnly?: boolean;
}

