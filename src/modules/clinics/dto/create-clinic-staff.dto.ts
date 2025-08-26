import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsUrl,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsDateString,
  IsUUID,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { StaffRole } from "../entities/clinic-staff.entity";

export class CreateClinicStaffDto {
  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "ID of the clinic",
  })
  @IsUUID()
  clinic_id!: string;

  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440001",
    description: "ID of the user to add as staff",
  })
  @IsUUID()
  user_id!: string;

  @ApiProperty({
    enum: StaffRole,
    example: StaffRole.DOCTOR,
    description: "Role of the staff member in the clinic",
  })
  @IsEnum(StaffRole)
  role!: StaffRole;

  @ApiPropertyOptional({
    example: "Veterinary Surgery",
    description: "Specialization of the staff member",
  })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiPropertyOptional({
    example: "VET-12345",
    description: "Professional license number",
  })
  @IsOptional()
  @IsString()
  license_number?: string;

  @ApiPropertyOptional({
    example: 5,
    description: "Years of experience",
    minimum: 0,
    maximum: 50,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  experience_years?: number;

  @ApiPropertyOptional({
    example: ["Doctor of Veterinary Medicine", "Surgery Certification"],
    description: "Educational background",
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  education?: string[];

  @ApiPropertyOptional({
    example: ["Board Certified Surgeon", "Emergency Medicine Specialist"],
    description: "Professional certifications",
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @ApiPropertyOptional({
    example:
      "Experienced veterinarian with expertise in surgical procedures and emergency care.",
    description: "Biography of the staff member",
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    example: "https://example.com/profile.jpg",
    description: "URL to profile photo",
  })
  @IsOptional()
  @IsUrl()
  profile_photo_url?: string;

  @ApiPropertyOptional({
    example: true,
    description: "Whether the staff member is active",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({
    example: "2023-01-01",
    description: "Date when the staff member was hired",
  })
  @IsDateString()
  hire_date!: string;
}
