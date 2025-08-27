import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { PetGender, PetSize, PetSpecies } from '../entities/pet.entity';

import { PET_DTO_EXAMPLES } from '../../../common/swagger/dto-examples';
import { Type } from 'class-transformer';

export class CreatePetDto {
  @ApiProperty({ description: 'Name of the pet', example: PET_DTO_EXAMPLES.NAME })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    description: 'Species of the pet',
    enum: PetSpecies,
    example: PET_DTO_EXAMPLES.SPECIES,
  })
  @IsEnum(PetSpecies)
  species!: PetSpecies;

  @ApiPropertyOptional({
    description: 'Breed of the pet',
    example: PET_DTO_EXAMPLES.BREED,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  breed?: string;

  @ApiPropertyOptional({
    description: 'Gender of the pet',
    enum: PetGender,
    example: PET_DTO_EXAMPLES.GENDER,
  })
  @IsOptional()
  @IsEnum(PetGender)
  gender?: PetGender;

  @ApiPropertyOptional({
    description: 'Date of birth of the pet',
    example: PET_DTO_EXAMPLES.DATE_OF_BIRTH,
  })
  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @ApiPropertyOptional({
    description: 'Weight of the pet in pounds',
    example: PET_DTO_EXAMPLES.WEIGHT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({
    description: 'Size category of the pet',
    enum: PetSize,
    example: PET_DTO_EXAMPLES.SIZE,
  })
  @IsOptional()
  @IsEnum(PetSize)
  size?: PetSize;

  @ApiPropertyOptional({
    description: 'Color/markings of the pet',
    example: PET_DTO_EXAMPLES.COLOR,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  color?: string;

  @ApiPropertyOptional({
    description: 'Microchip number if available',
    example: PET_DTO_EXAMPLES.MICROCHIP_NUMBER,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  microchip_number?: string;

  @ApiPropertyOptional({
    description: 'Whether the pet is spayed/neutered',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  is_spayed_neutered?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the pet is vaccinated',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  is_vaccinated?: boolean;

  @ApiPropertyOptional({
    description: 'Medical history and notes',
    example: PET_DTO_EXAMPLES.MEDICAL_HISTORY,
  })
  @IsOptional()
  @IsString()
  medical_history?: string;

  @ApiPropertyOptional({
    description: 'Behavioral notes',
    example: PET_DTO_EXAMPLES.BEHAVIORAL_NOTES,
  })
  @IsOptional()
  @IsString()
  behavioral_notes?: string;

  @ApiPropertyOptional({
    description: 'Special dietary requirements',
    example: PET_DTO_EXAMPLES.DIETARY_REQUIREMENTS,
  })
  @IsOptional()
  @IsString()
  dietary_requirements?: string;

  @ApiPropertyOptional({
    description: 'Allergies and sensitivities',
    example: PET_DTO_EXAMPLES.ALLERGIES,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @ApiPropertyOptional({
    description: 'Current medications',
    example: PET_DTO_EXAMPLES.MEDICATIONS,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medications?: string[];

  @ApiPropertyOptional({
    description: 'Emergency contact information',
    example: PET_DTO_EXAMPLES.EMERGENCY_CONTACT,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  emergency_contact?: string;

  @ApiPropertyOptional({
    description: 'Emergency phone number',
    example: PET_DTO_EXAMPLES.EMERGENCY_PHONE,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  emergency_phone?: string;

  @ApiPropertyOptional({
    description: 'Profile photo URL',
    example: PET_DTO_EXAMPLES.PHOTO_URL,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  photo_url?: string;
}
