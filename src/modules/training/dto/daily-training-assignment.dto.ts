import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class DailyTrainingAssignmentResponseDto {
  @ApiProperty({ description: 'Unique identifier for the assignment' })
  id!: string;

  @ApiProperty({ description: 'Pet associated with this training (optional)', required: false })
  pet_id?: string | null;

  @ApiProperty({ description: 'Training activity assigned' })
  activity_id!: string;

  @ApiProperty({ description: 'Date when the training was assigned' })
  assignment_date!: Date;

  @ApiProperty({ description: 'Whether the training has been completed' })
  is_completed!: boolean;

  @ApiPropertyOptional({ description: 'When the training was completed' })
  completed_at?: Date | null;

  @ApiPropertyOptional({ description: 'User notes about the training' })
  notes?: string | null;

  @ApiPropertyOptional({ description: 'User feedback after completing training' })
  feedback?: string | null;

  @ApiPropertyOptional({ description: 'Difficulty progression tracking' })
  difficulty_progression?: Record<string, unknown> | null;

  @ApiProperty({ description: 'When the assignment was created' })
  created_at!: Date;

  @ApiProperty({ description: 'When the assignment was last updated' })
  updated_at!: Date;

  // Populated relationships
  @ApiPropertyOptional({ description: 'Pet details if associated' })
  pet?: {
    id: string;
    name: string;
    species: string;
    breed?: string;
  };

  @ApiProperty({ description: 'Training activity details' })
  activity!: {
    id: string;
    title: string;
    summary?: string;
    difficulty: string;
    avg_duration_minutes?: number;
    content_markdown: string;
    tags: string[];
  };
}

export class CompleteTrainingDto {
  @ApiPropertyOptional({ description: 'User notes about the training session' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'User feedback after completing training' })
  @IsOptional()
  @IsString()
  feedback?: string;
}

export class DailyTrainingStatsDto {
  @ApiProperty({ description: 'Total assignments for today' })
  total_today!: number;

  @ApiProperty({ description: 'Completed assignments today' })
  completed_today!: number;

  @ApiProperty({ description: 'Pending assignments today' })
  pending_today!: number;

  @ApiProperty({ description: 'Completion rate for today (percentage)' })
  completion_rate_today!: number;

  @ApiProperty({ description: 'Total assignments this week' })
  total_this_week!: number;

  @ApiProperty({ description: 'Completed assignments this week' })
  completed_this_week!: number;

  @ApiProperty({ description: 'Average completion rate this week' })
  avg_completion_rate_week!: number;
}

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
  @IsString()
  assignment_date?: string;

  @ApiPropertyOptional({ description: 'Additional notes for this assignment' })
  @IsOptional()
  @IsString()
  notes?: string;
}
