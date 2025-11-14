import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ResourceType } from '../entities/resource.entity';

export class UpdateResourceDto {
  @ApiProperty({ description: 'Type of resource', enum: ResourceType, required: false })
  @IsEnum(ResourceType)
  @IsOptional()
  type?: ResourceType;

  @ApiProperty({ description: 'Title of the resource', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @ApiProperty({ description: 'Description of the resource', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'URL to the resource', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  url?: string;

  @ApiProperty({ description: 'Whether this resource is active', required: false })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiProperty({ description: 'Cover image URL or file path', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  cover?: string;
}

