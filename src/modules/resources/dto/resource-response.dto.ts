import { ApiProperty } from '@nestjs/swagger';
import { ResourceType } from '../entities/resource.entity';

export class ResourceResponseDto {
  @ApiProperty({ description: 'Unique identifier for the resource' })
  id!: string;

  @ApiProperty({ description: 'Type of resource', enum: ResourceType })
  type!: ResourceType;

  @ApiProperty({ description: 'Title of the resource' })
  title!: string;

  @ApiProperty({ description: 'Description of the resource', required: false })
  description?: string;

  @ApiProperty({ description: 'URL to the resource' })
  url!: string;

  @ApiProperty({ description: 'Whether this resource is active' })
  is_active!: boolean;

  @ApiProperty({ description: 'Cover image URL or file path', required: false })
  cover?: string;

  @ApiProperty({ description: 'When this resource was created' })
  created_at!: Date;

  @ApiProperty({ description: 'When this resource was last updated' })
  updated_at!: Date;
}

