import { IsString, IsOptional, IsBoolean, IsArray, IsUrl, IsEmail, IsPhoneNumber, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OperatingHoursDto {
  @ApiProperty({ example: '09:00' })
  @IsString()
  open!: string;

  @ApiProperty({ example: '17:00' })
  @IsString()
  close!: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  closed!: boolean;
}

export class CreateClinicDto {
  @ApiProperty({ example: 'Borzolini Pet Clinic', description: 'Name of the clinic' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'Leading veterinary clinic providing comprehensive pet care', description: 'Description of the clinic' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '123 Pet Care Avenue', description: 'Address of the clinic' })
  @IsString()
  address!: string;

  @ApiProperty({ example: 'New York', description: 'City where the clinic is located' })
  @IsString()
  city!: string;

  @ApiPropertyOptional({ example: 'NY', description: 'State/province where the clinic is located' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: '10001', description: 'Postal/ZIP code' })
  @IsOptional()
  @IsString()
  postal_code?: string;

  @ApiPropertyOptional({ example: 'USA', description: 'Country where the clinic is located', default: 'USA' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: '+1-555-0123', description: 'Phone number of the clinic' })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiPropertyOptional({ example: 'info@borzolini.com', description: 'Email address of the clinic' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'https://borzolini.com', description: 'Website URL of the clinic' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png', description: 'URL to the clinic logo' })
  @IsOptional()
  @IsUrl()
  logo_url?: string;

  @ApiPropertyOptional({ example: 'https://example.com/banner.png', description: 'URL to the clinic banner' })
  @IsOptional()
  @IsUrl()
  banner_url?: string;

  @ApiPropertyOptional({ example: 'Dr. Smith', description: 'Emergency contact person' })
  @IsOptional()
  @IsString()
  emergency_contact?: string;

  @ApiPropertyOptional({ example: '+1-555-9999', description: 'Emergency phone number' })
  @IsOptional()
  @IsPhoneNumber()
  emergency_phone?: string;

  @ApiPropertyOptional({
    example: ['vaccinations', 'surgery', 'dental_care'],
    description: 'List of services offered by the clinic',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  services?: string[];

  @ApiPropertyOptional({
    example: ['feline_medicine', 'canine_medicine'],
    description: 'List of specializations of the clinic',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specializations?: string[];

  @ApiPropertyOptional({
    example: ['cash', 'credit_card', 'insurance'],
    description: 'Accepted payment methods',
    default: ['cash', 'credit_card', 'insurance'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  payment_methods?: string[];

  @ApiPropertyOptional({
    example: ['PetCare Insurance', 'VetHealth Plus'],
    description: 'Accepted insurance providers',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  insurance_providers?: string[];

  @ApiPropertyOptional({
    example: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '10:00', close: '15:00', closed: false },
      sunday: { open: '00:00', close: '00:00', closed: true },
    },
    description: 'Operating hours for each day of the week',
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => OperatingHoursDto)
  operating_hours?: Record<string, OperatingHoursDto>;
}
