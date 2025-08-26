import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from "class-validator";

import { ServiceCategory } from "../entities/clinic-service.entity";

export class CreateClinicServiceDto {
  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "ID of the clinic",
  })
  @IsUUID()
  clinic_id!: string;

  @ApiProperty({ example: "Wellness Exam", description: "Name of the service" })
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    example:
      "Comprehensive health checkup including physical examination and vaccinations",
    description: "Description of the service",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    enum: ServiceCategory,
    example: ServiceCategory.PREVENTIVE,
    description: "Category of the service",
  })
  @IsEnum(ServiceCategory)
  category!: ServiceCategory;

  @ApiPropertyOptional({
    example: 45,
    description: "Duration of the service in minutes",
    default: 30,
    minimum: 15,
    maximum: 480,
  })
  @IsOptional()
  @IsNumber()
  @Min(15)
  @Max(480)
  duration_minutes?: number;

  @ApiPropertyOptional({
    example: 75.0,
    description: "Price of the service",
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    example: "USD",
    description: "Currency for the price",
    default: "USD",
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    example: true,
    description: "Whether the service is active",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: "Whether the service requires an appointment",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  requires_appointment?: boolean;
}
