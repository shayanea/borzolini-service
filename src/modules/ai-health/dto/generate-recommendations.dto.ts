import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  IsBoolean,
} from "class-validator";
import {
  InsightCategory,
  InsightType,
} from "../entities/ai-health-insight.entity";

export class GenerateRecommendationsDto {
  @ApiProperty({ description: "ID of the pet to generate recommendations for" })
  @IsUUID()
  pet_id!: string;

  @ApiPropertyOptional({
    description: "Specific categories to focus on",
    enum: InsightCategory,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(InsightCategory, { each: true })
  categories?: InsightCategory[];

  @ApiPropertyOptional({
    description: "Types of insights to generate",
    enum: InsightType,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(InsightType, { each: true })
  insight_types?: InsightType[];

  @ApiPropertyOptional({
    description: "Include emergency alerts",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  include_emergency_alerts?: boolean;

  @ApiPropertyOptional({
    description: "Include preventive care recommendations",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  include_preventive_care?: boolean;

  @ApiPropertyOptional({
    description: "Include lifestyle and training tips",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  include_lifestyle_tips?: boolean;

  @ApiPropertyOptional({
    description: "Custom context or specific concerns to address",
  })
  @IsOptional()
  @IsString()
  custom_context?: string;
}
