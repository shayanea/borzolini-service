import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T = unknown> {
  @ApiProperty({
    description: 'Response data',
    example: 'Response data will be here',
  })
  data!: T;

  @ApiProperty({
    description: 'Success message',
    example: 'Operation completed successfully',
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp in ISO format',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp!: string;

  @ApiProperty({
    description: 'Request ID for tracking',
    example: 'req_123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  requestId?: string;
}

export class PaginatedApiResponseDto<T = unknown> extends ApiResponseDto<T[]> {
  @ApiProperty({
    description: 'Array of items',
    type: 'array',
  })
  data!: T[];

  @ApiProperty({
    description: 'Total number of items',
    example: 150,
  })
  total!: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit!: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 15,
  })
  totalPages!: number;

  @ApiProperty({
    description: 'Whether there are more pages',
    example: true,
  })
  hasNextPage!: boolean;

  @ApiProperty({
    description: 'Whether there are previous pages',
    example: false,
  })
  hasPrevPage!: boolean;
}

export class SuccessResponseDto extends ApiResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success!: boolean;
}

export class CreatedResponseDto extends ApiResponseDto {
  @ApiProperty({
    description: 'Created resource ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt!: string;
}

export class UpdatedResponseDto extends ApiResponseDto {
  @ApiProperty({
    description: 'Updated resource ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt!: string;

  @ApiProperty({
    description: 'Number of affected rows',
    example: 1,
  })
  affectedRows!: number;
}

export class DeletedResponseDto extends ApiResponseDto {
  @ApiProperty({
    description: 'Deleted resource ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Deletion timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  deletedAt!: string;

  @ApiProperty({
    description: 'Number of affected rows',
    example: 1,
  })
  affectedRows!: number;
}

export class HealthCheckResponseDto extends ApiResponseDto {
  @ApiProperty({
    description: 'Service status',
    example: 'healthy',
  })
  status!: string;

  @ApiProperty({
    description: 'Service uptime in seconds',
    example: 86400,
  })
  uptime!: number;

  @ApiProperty({
    description: 'Environment',
    example: 'development',
  })
  environment!: string;

  @ApiProperty({
    description: 'API version',
    example: '1.0.0',
  })
  version!: string;

  @ApiProperty({
    description: 'Database connection status',
    example: 'connected',
  })
  database!: string;

  @ApiProperty({
    description: 'External services status',
    example: {
      email: 'healthy',
      sms: 'healthy',
      storage: 'healthy',
    },
  })
  services!: Record<string, string>;
}
