import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

import { PetSpecies, PetGender, PetSize } from '../entities/pet.entity';

export class CreatePetDto {
  @ApiProperty({ description: 'Name of the pet', example: 'Buddy' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ description: 'Species of the pet', enum: PetSpecies, example: PetSpecies.DOG })
  @IsEnum(PetSpecies)
  species!: PetSpecies;

  @ApiPropertyOptional({ description: 'Breed of the pet', example: 'Golden Retriever' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  breed?: string;

  @ApiPropertyOptional({ description: 'Gender of the pet', enum: PetGender, example: PetGender.MALE })
  @IsOptional()
  @IsEnum(PetGender)
  gender?: PetGender;

  @ApiPropertyOptional({ description: 'Date of birth of the pet', example: '2020-03-15' })
  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @ApiPropertyOptional({ description: 'Weight of the pet in pounds', example: 45.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ description: 'Size category of the pet', enum: PetSize, example: PetSize.MEDIUM })
  @IsOptional()
  @IsEnum(PetSize)
  size?: PetSize;

  @ApiPropertyOptional({ description: 'Color/markings of the pet', example: 'Golden' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  color?: string;

  @ApiPropertyOptional({ description: 'Microchip number if available', example: '123456789012345' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  microchip_number?: string;

  @ApiPropertyOptional({ description: 'Whether the pet is spayed/neutered', example: true })
  @IsOptional()
  @IsBoolean()
  is_spayed_neutered?: boolean;

  @ApiPropertyOptional({ description: 'Whether the pet is vaccinated', example: true })
  @IsOptional()
  @IsBoolean()
  is_vaccinated?: boolean;

  @ApiPropertyOptional({ description: 'Medical history and notes', example: 'No known health issues' })
  @IsOptional()
  @IsString()
  medical_history?: string;

  @ApiPropertyOptional({ description: 'Behavioral notes', example: 'Friendly with other dogs' })
  @IsOptional()
  @IsString()
  behavioral_notes?: string;

  @ApiPropertyOptional({ description: 'Special dietary requirements', example: 'Grain-free diet' })
  @IsOptional()
  @IsString()
  dietary_requirements?: string;

  @ApiPropertyOptional({ description: 'Allergies and sensitivities', example: ['Peanuts', 'Dairy'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @ApiPropertyOptional({ description: 'Current medications', example: ['Heartgard', 'Flea treatment'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medications?: string[];

  @ApiPropertyOptional({ description: 'Emergency contact information', example: 'John Doe' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  emergency_contact?: string;

  @ApiPropertyOptional({ description: 'Emergency phone number', example: '+1234567890' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  emergency_phone?: string;

  @ApiPropertyOptional({ description: 'Profile photo URL', example: 'https://example.com/pet-photo.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  photo_url?: string;
}
