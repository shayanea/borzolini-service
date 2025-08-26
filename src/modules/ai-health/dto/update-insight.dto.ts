import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from "class-validator";

export class UpdateInsightDto {
  @ApiPropertyOptional({
    description: "Whether the insight has been dismissed",
  })
  @IsOptional()
  @IsBoolean()
  dismissed?: boolean;

  @ApiPropertyOptional({
    description: "Whether the insight has been acted upon",
  })
  @IsOptional()
  @IsBoolean()
  acted_upon?: boolean;

  @ApiPropertyOptional({ description: "Owner feedback on the insight" })
  @IsOptional()
  @IsString()
  owner_feedback?: string;

  @ApiPropertyOptional({
    description: "Owner rating of the insight (1-5)",
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  owner_rating?: number;
}
