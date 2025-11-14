import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class ApproveBookingDto {
  @ApiProperty({ description: 'Whether to approve (true) or reject (false) the booking', example: true })
  @IsBoolean()
  approve!: boolean;

  @ApiPropertyOptional({ description: 'Reason for rejection (required if approve is false)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejection_reason?: string;
}

