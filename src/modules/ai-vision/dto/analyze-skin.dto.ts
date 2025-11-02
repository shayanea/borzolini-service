import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class AnalyzeSkinDto {
  @ApiProperty({
    description: 'Pet species',
    enum: ['cat', 'dog'],
    example: 'cat',
  })
  @IsEnum(['cat', 'dog'])
  species!: 'cat' | 'dog';

  @ApiPropertyOptional({
    description: 'Pet breed',
    example: 'British Shorthair',
  })
  @IsOptional()
  @IsString()
  breed?: string;

  @ApiPropertyOptional({
    description: 'Additional symptoms description',
    example: 'Redness and itching for 2 days',
  })
  @IsOptional()
  @IsString()
  symptoms?: string;

  @ApiPropertyOptional({
    description: 'Pet ID for AI health insights integration',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  petId?: string;

  @ApiPropertyOptional({
    description: 'Include age and weight estimation',
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return false;
  })
  @IsBoolean()
  estimateAgeWeight?: boolean;
}

