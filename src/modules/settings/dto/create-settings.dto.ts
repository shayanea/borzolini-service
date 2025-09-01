import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNumber, IsObject, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';

import { Type } from 'class-transformer';

export class GeneralSettingsDto {
  @ApiProperty({ description: 'Clinic name', example: 'Borzolini Veterinary Clinic' })
  @IsString()
  clinicName!: string;

  @ApiProperty({ description: 'Currency code', example: 'USD' })
  @IsString()
  currency!: string;

  @ApiProperty({ description: 'Timezone', example: 'America/New_York' })
  @IsString()
  timezone!: string;

  @ApiProperty({ description: 'Business hours', example: '8:00 AM - 6:00 PM' })
  @IsString()
  businessHours!: string;
}

export class NotificationSettingsDto {
  @ApiProperty({ description: 'Enable notifications', example: true })
  @IsBoolean()
  enableNotifications!: boolean;

  @ApiProperty({ description: 'Enable email notifications', example: true })
  @IsBoolean()
  emailNotifications!: boolean;

  @ApiProperty({ description: 'Enable SMS notifications', example: false })
  @IsBoolean()
  smsNotifications!: boolean;

  @ApiProperty({ description: 'Notification email address', example: 'admin@clinic.com' })
  @IsEmail()
  notificationEmail!: string;
}

export class AppointmentSettingsDto {
  @ApiProperty({ description: 'Default appointment duration in minutes', example: 30 })
  @IsNumber()
  @Min(15)
  @Max(480)
  defaultAppointmentDuration!: number;

  @ApiProperty({ description: 'Booking lead time in hours', example: 24 })
  @IsNumber()
  @Min(1)
  @Max(168)
  bookingLeadTime!: number;

  @ApiProperty({ description: 'Cancellation policy in hours', example: 24 })
  @IsNumber()
  @Min(1)
  @Max(168)
  cancellationPolicy!: number;

  @ApiProperty({ description: 'Maximum appointments per day', example: 50 })
  @IsNumber()
  @Min(1)
  @Max(200)
  maxAppointmentsPerDay!: number;
}

export class SecuritySettingsDto {
  @ApiProperty({ description: 'Session timeout in minutes', example: 30 })
  @IsNumber()
  @Min(5)
  @Max(480)
  sessionTimeout!: number;

  @ApiProperty({ description: 'Password expiry in days', example: 90 })
  @IsNumber()
  @Min(30)
  @Max(365)
  passwordExpiry!: number;

  @ApiProperty({ description: 'Enable two-factor authentication', example: false })
  @IsBoolean()
  twoFactorAuthentication!: boolean;
}

export class CreateSettingsDto {
  @ApiPropertyOptional({ description: 'Settings name', example: 'default' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Settings description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'General settings', type: GeneralSettingsDto })
  @IsObject()
  @ValidateNested()
  @Type(() => GeneralSettingsDto)
  generalSettings!: GeneralSettingsDto;

  @ApiProperty({ description: 'Notification settings', type: NotificationSettingsDto })
  @IsObject()
  @ValidateNested()
  @Type(() => NotificationSettingsDto)
  notificationSettings!: NotificationSettingsDto;

  @ApiProperty({ description: 'Appointment settings', type: AppointmentSettingsDto })
  @IsObject()
  @ValidateNested()
  @Type(() => AppointmentSettingsDto)
  appointmentSettings!: AppointmentSettingsDto;

  @ApiProperty({ description: 'Security settings', type: SecuritySettingsDto })
  @IsObject()
  @ValidateNested()
  @Type(() => SecuritySettingsDto)
  securitySettings!: SecuritySettingsDto;

  @ApiPropertyOptional({ description: 'Is active', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Is default settings', example: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
