import { AppointmentSettingsDto, GeneralSettingsDto, NotificationSettingsDto, SecuritySettingsDto } from './create-settings.dto';
import { IsObject, ValidateNested } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateGeneralSettingsDto {
  @ApiProperty({ description: 'General settings', type: GeneralSettingsDto })
  @IsObject()
  @ValidateNested()
  @Type(() => GeneralSettingsDto)
  generalSettings!: GeneralSettingsDto;
}

export class UpdateNotificationSettingsDto {
  @ApiProperty({ description: 'Notification settings', type: NotificationSettingsDto })
  @IsObject()
  @ValidateNested()
  @Type(() => NotificationSettingsDto)
  notificationSettings!: NotificationSettingsDto;
}

export class UpdateAppointmentSettingsDto {
  @ApiProperty({ description: 'Appointment settings', type: AppointmentSettingsDto })
  @IsObject()
  @ValidateNested()
  @Type(() => AppointmentSettingsDto)
  appointmentSettings!: AppointmentSettingsDto;
}

export class UpdateSecuritySettingsDto {
  @ApiProperty({ description: 'Security settings', type: SecuritySettingsDto })
  @IsObject()
  @ValidateNested()
  @Type(() => SecuritySettingsDto)
  securitySettings!: SecuritySettingsDto;
}
