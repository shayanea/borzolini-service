import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Error message or array of validation errors',
    oneOf: [
      { type: 'string', example: 'Bad Request' },
      {
        type: 'array',
        items: { type: 'string' },
        example: ['email must be an email', 'password must be longer than or equal to 8 characters'],
      },
    ],
  })
  message!: string | string[];

  @ApiProperty({
    description: 'Error type',
    example: 'Bad Request',
  })
  error!: string;

  @ApiProperty({
    description: 'Error timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp?: string;

  @ApiProperty({
    description: 'Request path that caused the error',
    example: '/api/v1/users',
    required: false,
  })
  path?: string;

  @ApiProperty({
    description: 'Additional error details',
    required: false,
    example: {
      field: 'email',
      value: 'invalid-email',
      constraint: 'isEmail',
    },
  })
  details?: Record<string, unknown>;
}

export class ValidationErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Array of validation error messages',
    type: [String],
    example: ['email must be an email', 'password must be longer than or equal to 8 characters', 'firstName should not be empty'],
  })
  message!: string[];

  @ApiProperty({
    description: 'Error type',
    example: 'Bad Request',
  })
  error!: string;
}

export class NotFoundErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 404,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Error message',
    example: 'User not found',
  })
  message!: string;

  @ApiProperty({
    description: 'Error type',
    example: 'Not Found',
  })
  error!: string;
}

export class UnauthorizedErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 401,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Unauthorized',
  })
  message!: string;

  @ApiProperty({
    description: 'Error type',
    example: 'Unauthorized',
  })
  error!: string;
}

export class ForbiddenErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 403,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Forbidden - Admin access required',
  })
  message!: string;

  @ApiProperty({
    description: 'Error type',
    example: 'Forbidden',
  })
  error!: string;
}

export class ConflictErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 409,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Error message',
    example: 'User with this email already exists',
  })
  message!: string;

  @ApiProperty({
    description: 'Error type',
    example: 'Conflict',
  })
  error!: string;
}

export class InternalServerErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 500,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Internal server error',
  })
  message!: string;

  @ApiProperty({
    description: 'Error type',
    example: 'Internal Server Error',
  })
  error!: string;
}
