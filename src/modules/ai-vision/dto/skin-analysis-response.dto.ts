import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SkinConditionDto {
  @ApiProperty({ description: 'Name of the condition', example: 'Allergic dermatitis' })
  name!: string;

  @ApiProperty({
    description: 'Category of the condition',
    enum: ['bacterial', 'fungal', 'allergic', 'parasitic', 'healthy', 'other'],
    example: 'allergic',
  })
  category!: string;

  @ApiProperty({
    description: 'Probability score (0-1)',
    example: 0.75,
    minimum: 0,
    maximum: 1,
  })
  probability!: number;

  @ApiProperty({
    description: 'Severity level',
    enum: ['mild', 'moderate', 'severe'],
    example: 'moderate',
  })
  severity!: 'mild' | 'moderate' | 'severe';

  @ApiProperty({
    description: 'Urgency level',
    enum: ['routine', 'soon', 'urgent', 'emergency'],
    example: 'soon',
  })
  urgency!: 'routine' | 'soon' | 'urgent' | 'emergency';
}

export class AffectedAreaDto {
  @ApiProperty({ description: 'Location description', example: 'upper left' })
  location!: string;

  @ApiProperty({
    description: 'Severity score (0-1)',
    example: 0.65,
    minimum: 0,
    maximum: 1,
  })
  severity!: number;
}

export class SkinAnalysisResponseDto {
  @ApiProperty({
    description: 'Whether a skin condition was detected',
    example: true,
  })
  detected!: boolean;

  @ApiProperty({
    description: 'Overall confidence score (0-1)',
    example: 0.82,
    minimum: 0,
    maximum: 1,
  })
  confidence!: number;

  @ApiProperty({
    description: 'Detected conditions',
    type: [SkinConditionDto],
  })
  conditions!: SkinConditionDto[];

  @ApiProperty({
    description: 'Affected areas with severity',
    type: [AffectedAreaDto],
  })
  affectedAreas!: AffectedAreaDto[];

  @ApiProperty({
    description: 'Visual features detected',
    example: {
      redness: 0.7,
      inflammation: 0.65,
      hairLoss: 0.3,
      lesions: 0.5,
      scaling: 0.4,
    },
  })
  visualFeatures!: {
    redness: number;
    inflammation: number;
    hairLoss: number;
    lesions: number;
    scaling: number;
  };

  @ApiProperty({
    description: 'Recommendations for pet owner',
    type: [String],
    example: ['Keep the affected area clean and dry', 'Schedule a veterinary appointment'],
  })
  recommendations!: string[];

  @ApiProperty({
    description: 'Whether veterinary consultation is recommended',
    example: true,
  })
  veterinaryConsultation!: boolean;

  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Processing time in milliseconds',
    example: 2450,
  })
  processingTimeMs?: number;

  @ApiPropertyOptional({
    description: 'Age estimate (if enabled)',
    example: {
      estimatedYears: 3.5,
      estimatedMonths: 42,
      ageRange: '2-4 years',
      lifeStage: 'adult',
      confidence: 0.75,
    },
  })
  ageEstimate?: {
    estimatedYears: number;
    estimatedMonths: number;
    ageRange: string;
    lifeStage: 'kitten' | 'young' | 'adult' | 'senior';
    confidence: number;
  };

  @ApiPropertyOptional({
    description: 'Weight estimate (if enabled)',
    example: {
      estimatedWeightLbs: 10.5,
      weightRange: '8-12 lbs',
      bodyConditionScore: 'ideal',
      confidence: 0.65,
    },
  })
  weightEstimate?: {
    estimatedWeightLbs: number;
    weightRange: string;
    bodyConditionScore: 'underweight' | 'ideal' | 'overweight';
    confidence: number;
  };
}

