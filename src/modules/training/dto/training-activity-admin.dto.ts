import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, Min } from 'class-validator';
import { ActivityDifficulty, TrainingActivity } from '../entities/training-activity.entity';

export class CreateTrainingActivityDto {
  @ApiProperty({ description: 'Title of the training activity', example: 'Basic leash walking' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({ description: 'Short summary of the activity', example: 'Teach your dog to walk calmly on a leash.' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  summary?: string;

  @ApiProperty({ description: 'Detailed content in Markdown format' })
  @IsString()
  @IsNotEmpty()
  content_markdown!: string;

  @ApiProperty({ enum: ActivityDifficulty, description: 'Difficulty level of the activity', default: ActivityDifficulty.EASY })
  @IsEnum(ActivityDifficulty)
  @IsNotEmpty()
  difficulty!: ActivityDifficulty;

  @ApiPropertyOptional({ description: 'Average duration of the activity in minutes', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  avg_duration_minutes?: number;

  @ApiPropertyOptional({ description: 'Whether the activity can be performed indoors' })
  @IsOptional()
  indoor?: boolean | null;

  @ApiPropertyOptional({ type: [String], description: 'Required equipment list' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipment?: string[] | null;

  @ApiPropertyOptional({ type: [String], description: 'Tags to categorize the activity' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Potential risks associated with the activity' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  risks?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Enrichment aspects covered by the activity' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  enrichment?: string[];

  @ApiPropertyOptional({ description: 'Optional video URL demonstrating the activity' })
  @IsOptional()
  @IsUrl()
  video_url?: string | null;

  @ApiPropertyOptional({ description: 'Primary source URL for the content' })
  @IsOptional()
  @IsUrl()
  source_primary?: string | null;

  @ApiPropertyOptional({ description: 'Human-readable name of the content source' })
  @IsOptional()
  @IsString()
  source_name?: string | null;

  @ApiPropertyOptional({ description: 'Content license (e.g., CC-BY)', example: 'CC-BY-4.0' })
  @IsOptional()
  @IsString()
  license?: string | null;
}

export class UpdateTrainingActivityDto {
  @ApiPropertyOptional({ description: 'Title of the training activity' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ description: 'Short summary of the activity' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  summary?: string;

  @ApiPropertyOptional({ description: 'Detailed content in Markdown format' })
  @IsString()
  @IsOptional()
  content_markdown?: string;

  @ApiPropertyOptional({ enum: ActivityDifficulty, description: 'Difficulty level of the activity' })
  @IsEnum(ActivityDifficulty)
  @IsOptional()
  difficulty?: ActivityDifficulty;

  @ApiPropertyOptional({ description: 'Average duration of the activity in minutes', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  avg_duration_minutes?: number | null;

  @ApiPropertyOptional({ description: 'Whether the activity can be performed indoors' })
  @IsOptional()
  indoor?: boolean | null;

  @ApiPropertyOptional({ type: [String], description: 'Required equipment list' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipment?: string[] | null;

  @ApiPropertyOptional({ type: [String], description: 'Tags to categorize the activity' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Potential risks associated with the activity' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  risks?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Enrichment aspects covered by the activity' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  enrichment?: string[];

  @ApiPropertyOptional({ description: 'Optional video URL demonstrating the activity' })
  @IsOptional()
  @IsUrl()
  video_url?: string | null;

  @ApiPropertyOptional({ description: 'Primary source URL for the content' })
  @IsOptional()
  @IsUrl()
  source_primary?: string | null;

  @ApiPropertyOptional({ description: 'Human-readable name of the content source' })
  @IsOptional()
  @IsString()
  source_name?: string | null;

  @ApiPropertyOptional({ description: 'Content license (e.g., CC-BY)' })
  @IsOptional()
  @IsString()
  license?: string | null;
}

export class TrainingActivityResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiPropertyOptional()
  summary?: string | null;

  @ApiProperty()
  content_markdown!: string;

  @ApiProperty({ enum: ActivityDifficulty })
  difficulty!: ActivityDifficulty;

  @ApiPropertyOptional()
  avg_duration_minutes?: number | null;

  @ApiPropertyOptional()
  indoor?: boolean | null;

  @ApiProperty({ type: [String] })
  equipment?: string[] | null;

  @ApiProperty({ type: [String] })
  tags!: string[];

  @ApiProperty({ type: [String] })
  risks!: string[];

  @ApiProperty({ type: [String] })
  enrichment!: string[];

  @ApiPropertyOptional()
  video_url?: string | null;

  @ApiPropertyOptional()
  source_primary?: string | null;

  @ApiPropertyOptional()
  source_name?: string | null;

  @ApiPropertyOptional()
  license?: string | null;

  @ApiProperty()
  created_at!: Date;

  @ApiProperty()
  updated_at!: Date;

  static fromEntity(entity: TrainingActivity): TrainingActivityResponseDto {
    const dto = new TrainingActivityResponseDto();
    dto.id = entity.id;
    dto.title = entity.title;
    dto.summary = entity.summary ?? null;
    dto.content_markdown = entity.content_markdown;
    dto.difficulty = entity.difficulty;
    dto.avg_duration_minutes = entity.avg_duration_minutes ?? null;
    dto.indoor = entity.indoor ?? null;
    dto.equipment = entity.equipment ?? null;
    dto.tags = entity.tags;
    dto.risks = entity.risks;
    dto.enrichment = entity.enrichment;
    dto.video_url = entity.video_url ?? null;
    dto.source_primary = entity.source_primary ?? null;
    dto.source_name = entity.source_name ?? null;
    dto.license = entity.license ?? null;
    dto.created_at = entity.created_at;
    dto.updated_at = entity.updated_at;
    return dto;
  }
}


