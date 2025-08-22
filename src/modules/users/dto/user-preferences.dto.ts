import { IsBoolean, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class EmailNotificationSettingsDto {
  @ApiPropertyOptional({ description: 'Appointment notifications via email' })
  @IsOptional()
  @IsBoolean()
  appointments?: boolean;

  @ApiPropertyOptional({ description: 'Reminder notifications via email' })
  @IsOptional()
  @IsBoolean()
  reminders?: boolean;

  @ApiPropertyOptional({ description: 'Health alert notifications via email' })
  @IsOptional()
  @IsBoolean()
  healthAlerts?: boolean;

  @ApiPropertyOptional({ description: 'Marketing notifications via email' })
  @IsOptional()
  @IsBoolean()
  marketing?: boolean;

  @ApiPropertyOptional({ description: 'Newsletter subscriptions via email' })
  @IsOptional()
  @IsBoolean()
  newsletter?: boolean;
}

export class SmsNotificationSettingsDto {
  @ApiPropertyOptional({ description: 'Appointment notifications via SMS' })
  @IsOptional()
  @IsBoolean()
  appointments?: boolean;

  @ApiPropertyOptional({ description: 'Reminder notifications via SMS' })
  @IsOptional()
  @IsBoolean()
  reminders?: boolean;

  @ApiPropertyOptional({ description: 'Health alert notifications via SMS' })
  @IsOptional()
  @IsBoolean()
  healthAlerts?: boolean;
}

export class PushNotificationSettingsDto {
  @ApiPropertyOptional({ description: 'Appointment notifications via push' })
  @IsOptional()
  @IsBoolean()
  appointments?: boolean;

  @ApiPropertyOptional({ description: 'Reminder notifications via push' })
  @IsOptional()
  @IsBoolean()
  reminders?: boolean;

  @ApiPropertyOptional({ description: 'Health alert notifications via push' })
  @IsOptional()
  @IsBoolean()
  healthAlerts?: boolean;
}

export class NotificationSettingsDto {
  @ApiPropertyOptional({ description: 'Email notification settings' })
  @ValidateNested()
  @Type(() => EmailNotificationSettingsDto)
  email?: EmailNotificationSettingsDto;

  @ApiPropertyOptional({ description: 'SMS notification settings' })
  @ValidateNested()
  @Type(() => SmsNotificationSettingsDto)
  sms?: SmsNotificationSettingsDto;

  @ApiPropertyOptional({ description: 'Push notification settings' })
  @ValidateNested()
  @Type(() => PushNotificationSettingsDto)
  push?: PushNotificationSettingsDto;
}

export class PrivacySettingsDto {
  @ApiPropertyOptional({ description: 'Profile visibility level', enum: ['public', 'private', 'friends'] })
  @IsOptional()
  @IsEnum(['public', 'private', 'friends'])
  profileVisibility?: 'public' | 'private' | 'friends';

  @ApiPropertyOptional({ description: 'Show phone number to others' })
  @IsOptional()
  @IsBoolean()
  showPhone?: boolean;

  @ApiPropertyOptional({ description: 'Show address to others' })
  @IsOptional()
  @IsBoolean()
  showAddress?: boolean;

  @ApiPropertyOptional({ description: 'Show email to others' })
  @IsOptional()
  @IsBoolean()
  showEmail?: boolean;

  @ApiPropertyOptional({ description: 'Allow others to contact' })
  @IsOptional()
  @IsBoolean()
  allowContact?: boolean;
}

export class QuietHoursDto {
  @ApiPropertyOptional({ description: 'Enable quiet hours' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Quiet hours start time (HH:mm)' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ description: 'Quiet hours end time (HH:mm)' })
  @IsOptional()
  @IsString()
  endTime?: string;
}

export class CommunicationPreferencesDto {
  @ApiPropertyOptional({ description: 'Preferred language' })
  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @ApiPropertyOptional({ description: 'Preferred contact method', enum: ['email', 'sms', 'phone'] })
  @IsOptional()
  @IsEnum(['email', 'sms', 'phone'])
  preferredContactMethod?: 'email' | 'sms' | 'phone';

  @ApiPropertyOptional({ description: 'User timezone' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ description: 'Quiet hours settings' })
  @ValidateNested()
  @Type(() => QuietHoursDto)
  quietHours?: QuietHoursDto;
}

export class CreateUserPreferencesDto {
  @ApiPropertyOptional({ description: 'Notification settings' })
  @ValidateNested()
  @Type(() => NotificationSettingsDto)
  notificationSettings?: NotificationSettingsDto;

  @ApiPropertyOptional({ description: 'Privacy settings' })
  @ValidateNested()
  @Type(() => PrivacySettingsDto)
  privacySettings?: PrivacySettingsDto;

  @ApiPropertyOptional({ description: 'Communication preferences' })
  @ValidateNested()
  @Type(() => CommunicationPreferencesDto)
  communicationPreferences?: CommunicationPreferencesDto;

  @ApiPropertyOptional({ description: 'UI theme preference', enum: ['light', 'dark', 'auto'] })
  @IsOptional()
  @IsEnum(['light', 'dark', 'auto'])
  theme?: 'light' | 'dark' | 'auto';
}

export class UpdateUserPreferencesDto extends CreateUserPreferencesDto {
  @ApiPropertyOptional({ description: 'Active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
