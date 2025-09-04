import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { CasePriority, CaseStatus } from '../entities/pet-case.entity';

export class UpdatePetCaseDto {
  @ApiProperty({ description: 'Brief title of the case' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Detailed description of the case' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Current symptoms', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  current_symptoms?: string[];

  @ApiProperty({ description: 'Diagnosis made during the case' })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiProperty({ description: 'Treatment plan' })
  @IsOptional()
  @IsObject()
  treatment_plan?: {
    medications?: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions?: string;
    }>;
    procedures?: string[];
    follow_up_instructions?: string;
    dietary_changes?: string;
    activity_restrictions?: string;
  };

  @ApiProperty({ description: 'Current status of the case', enum: CaseStatus })
  @IsOptional()
  @IsEnum(CaseStatus)
  status?: CaseStatus;

  @ApiProperty({ description: 'Priority level of the case', enum: CasePriority })
  @IsOptional()
  @IsEnum(CasePriority)
  priority?: CasePriority;

  @ApiProperty({ description: 'Notes and observations' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Vital signs and measurements' })
  @IsOptional()
  @IsObject()
  vital_signs?: {
    temperature?: number;
    heart_rate?: number;
    respiratory_rate?: number;
    weight?: number;
    blood_pressure?: { systolic: number; diastolic: number };
    recorded_at?: Date;
  };
}
