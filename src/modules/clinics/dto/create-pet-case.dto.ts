import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { CasePriority, CaseType } from '../entities/pet-case.entity';

export class CreatePetCaseDto {
  @ApiProperty({ description: 'ID of the pet' })
  @IsUUID()
  pet_id!: string;

  @ApiProperty({ description: 'Type of case', enum: CaseType })
  @IsEnum(CaseType)
  case_type!: CaseType;

  @ApiProperty({ description: 'Brief title of the case' })
  @IsString()
  title!: string;

  @ApiProperty({ description: 'Detailed description of the case' })
  @IsString()
  description!: string;

  @ApiProperty({ description: 'Initial symptoms reported', type: [String] })
  @IsArray()
  @IsString({ each: true })
  initial_symptoms!: string[];

  @ApiProperty({
    description: 'Priority level of the case',
    enum: CasePriority,
    default: CasePriority.NORMAL,
  })
  @IsOptional()
  @IsEnum(CasePriority)
  priority?: CasePriority;

  @ApiProperty({ description: 'ID of the assigned veterinarian' })
  @IsOptional()
  @IsUUID()
  vet_id?: string;
}
