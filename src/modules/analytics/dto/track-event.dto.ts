import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class TrackEventDto {
  @ApiProperty({
    description: 'Name of the event to track',
    example: 'user_login',
  })
  @IsString()
  eventName!: string;

  @ApiPropertyOptional({
    description: 'Additional data associated with the event',
    example: { userId: '123', source: 'web' },
  })
  @IsOptional()
  @IsObject()
  eventData?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'URL where the event occurred',
    example: 'https://clinic.com/dashboard',
  })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({
    description: 'Referrer URL',
    example: 'https://clinic.com/login',
  })
  @IsOptional()
  @IsString()
  referrer?: string;
}
