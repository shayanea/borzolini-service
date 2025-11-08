import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class AnalyzeEyeDto {
  @ApiProperty({ description: 'Pet species', enum: ['cat', 'dog'], example: 'cat' })
  @IsEnum(['cat', 'dog'])
  species!: 'cat' | 'dog';

  @ApiPropertyOptional({ description: 'Pet breed', example: 'Persian' })
  @IsOptional()
  @IsString()
  breed?: string;

  @ApiPropertyOptional({ description: 'Observed symptoms', example: 'Redness, discharge, squinting' })
  @IsOptional()
  @IsString()
  symptoms?: string;

  @ApiPropertyOptional({ description: 'Pet ID for AI health insights integration' })
  @IsOptional()
  @IsUUID()
  petId?: string;

  @ApiPropertyOptional({ description: 'Include age and weight estimation', default: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return false;
  })
  @IsBoolean()
  estimateAgeWeight?: boolean;
}


