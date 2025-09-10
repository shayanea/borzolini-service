import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { ReviewType } from '../entities/appointment-review.entity';

export class CreateAppointmentReviewDto {
  @ApiProperty({ description: 'ID of the appointment being reviewed', example: 'uuid' })
  @IsUUID()
  appointment_id!: string;

  @ApiProperty({ description: 'Overall rating (1-5 stars)', example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  overall_rating!: number;

  @ApiProperty({ description: 'Rating for vet expertise (1-5 stars)', example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  vet_expertise_rating!: number;

  @ApiProperty({ description: 'Rating for communication (1-5 stars)', example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  communication_rating!: number;

  @ApiProperty({ description: 'Rating for punctuality (1-5 stars)', example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  punctuality_rating!: number;

  @ApiProperty({ description: 'Rating for home visit experience (1-5 stars)', example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  home_visit_rating!: number;

  @ApiProperty({ description: 'Rating for follow-up care (1-5 stars)', example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  follow_up_rating!: number;

  @ApiProperty({ description: 'Review title', example: 'Excellent home visit for Fariborz', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Detailed review comment', required: false })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ description: 'What went well during the visit', required: false })
  @IsOptional()
  @IsString()
  positive_aspects?: string;

  @ApiProperty({ description: 'Areas for improvement', required: false })
  @IsOptional()
  @IsString()
  improvement_areas?: string;

  @ApiProperty({ description: 'Would recommend to others', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  would_recommend?: boolean;

  @ApiProperty({ description: 'Type of appointment reviewed', enum: ReviewType })
  @IsEnum(ReviewType)
  review_type!: ReviewType;

  @ApiProperty({ description: 'Pet photos from the visit', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pet_photos?: string[];

  @ApiProperty({ description: 'Visit photos (with permission)', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  visit_photos?: string[];

  @ApiProperty({ description: 'Whether the review is anonymous', example: false, required: false })
  @IsOptional()
  @IsBoolean()
  is_anonymous?: boolean;
}
