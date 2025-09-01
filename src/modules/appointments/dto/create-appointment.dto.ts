import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentPriority, AppointmentStatus, AppointmentType } from '../entities/appointment.entity';
import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

import { Type } from 'class-transformer';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'Type of appointment',
    enum: AppointmentType,
    example: AppointmentType.CONSULTATION,
  })
  @IsEnum(AppointmentType)
  appointment_type!: AppointmentType;

  @ApiPropertyOptional({
    description: 'Current status of the appointment',
    enum: AppointmentStatus,
    example: AppointmentStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional({
    description: 'Priority level of the appointment',
    enum: AppointmentPriority,
    example: AppointmentPriority.NORMAL,
  })
  @IsOptional()
  @IsEnum(AppointmentPriority)
  priority?: AppointmentPriority;

  @ApiProperty({
    description: 'Scheduled date and time for the appointment',
    example: '2024-01-15T10:00:00Z',
  })
  @IsDateString()
  scheduled_date!: string;

  @ApiPropertyOptional({
    description: 'Duration of the appointment in minutes',
    example: 30,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(15)
  duration_minutes?: number;

  @ApiPropertyOptional({
    description: 'Notes and instructions for the appointment',
    example: 'Please bring previous medical records',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Whether this is a telemedicine appointment',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  is_telemedicine?: boolean;

  @ApiPropertyOptional({
    description: 'Whether this is a home visit appointment',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  is_home_visit?: boolean;

  @ApiPropertyOptional({
    description: 'Telemedicine consultation link',
    example: 'https://meet.google.com/abc-defg-hij',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  telemedicine_link?: string;

  @ApiPropertyOptional({ description: 'Reminder settings for the appointment' })
  @IsOptional()
  reminder_settings?: {
    email_reminder?: boolean;
    sms_reminder?: boolean;
    push_reminder?: boolean;
    reminder_hours_before?: number;
  };

  // Foreign Keys
  @ApiProperty({ description: 'ID of the pet', example: 'uuid-string' })
  @IsUUID()
  pet_id!: string;

  @ApiProperty({ description: 'ID of the clinic', example: 'uuid-string' })
  @IsUUID()
  clinic_id!: string;

  @ApiPropertyOptional({
    description: 'ID of the assigned staff member',
    example: 'uuid-string',
  })
  @IsOptional()
  @IsUUID()
  staff_id?: string;

  @ApiPropertyOptional({
    description: 'ID of the clinic service',
    example: 'uuid-string',
  })
  @IsOptional()
  @IsUUID()
  service_id?: string;
}
