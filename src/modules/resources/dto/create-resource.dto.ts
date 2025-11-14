import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ResourceType } from '../entities/resource.entity';

export class CreateResourceDto {
  @ApiProperty({ description: 'Type of resource', enum: ResourceType, example: ResourceType.VIDEO })
  @IsEnum(ResourceType)
  @IsNotEmpty()
  type!: ResourceType;

  @ApiProperty({ description: 'Title of the resource', example: 'Introduction to Pet Care' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiProperty({ description: 'Description of the resource', required: false, example: 'Learn the basics of pet care' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'URL to the resource', example: 'https://www.youtube.com/watch?v=example' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  url!: string;

  @ApiProperty({ description: 'Whether this resource is active', required: false, default: true })
  @IsOptional()
  is_active?: boolean;

  @ApiProperty({ description: 'Cover image URL or file path', required: false, example: 'https://example.com/cover.jpg' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  cover?: string;
}

