import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { FoodSafetyLevel } from '../entities/food-item.entity';

export class CreateFoodItemDto {
  @ApiProperty({ description: 'Canonical name', example: 'Grapes' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  canonical_name!: string;

  @ApiPropertyOptional({ description: 'Scientific name', example: 'Vitis vinifera' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  scientific_name?: string;

  @ApiPropertyOptional({ description: 'Category', example: 'Fruit' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  category?: string;

  @ApiProperty({ enum: FoodSafetyLevel, description: 'Overall safety level' })
  @IsEnum(FoodSafetyLevel)
  safety_overall!: FoodSafetyLevel;

  @ApiProperty({ description: 'Markdown notes explaining safety' })
  @IsString()
  @IsNotEmpty()
  notes_markdown!: string;

  @ApiPropertyOptional({ type: [String], description: 'Aliases / common names' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  common_aliases?: string[];
}
