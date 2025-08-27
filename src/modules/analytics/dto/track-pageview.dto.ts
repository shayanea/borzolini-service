import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class TrackPageViewDto {
  @ApiProperty({
    description: 'URL of the page being viewed',
    example: 'https://clinic.com/dashboard',
  })
  @IsString()
  url!: string;

  @ApiPropertyOptional({
    description: 'Referrer URL',
    example: 'https://clinic.com/login',
  })
  @IsOptional()
  @IsString()
  referrer?: string;
}
