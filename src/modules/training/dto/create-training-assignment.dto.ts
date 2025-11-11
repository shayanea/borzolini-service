import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsDateString } from 'class-validator';

export class CreateTrainingAssignmentDto {
  @ApiProperty({ description: 'ID of the pet to assign training to (optional - user-level if not provided)' })
  @IsOptional()
  @IsUUID()
  pet_id?: string;

  @ApiProperty({ description: 'ID of the training activity to assign' })
  @IsUUID()
  activity_id!: string;

  @ApiPropertyOptional({ description: 'Specific date for the assignment (defaults to today)' })
  @IsOptional()
  @IsDateString()
  assignment_date?: string;

  @ApiPropertyOptional({ description: 'Additional notes for this assignment' })
  @IsOptional()
  @IsString()
  notes?: string;
}
