import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GoogleAuthDto {
  @ApiProperty({
    description: 'Google ID token from frontend',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjF...',
  })
  @IsString()
  token!: string;
}

