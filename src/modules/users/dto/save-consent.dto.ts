import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export enum ConsentType {
  MEDICAL_DISCLAIMER = 'medical_disclaimer',
  PRIVACY_POLICY = 'privacy_policy',
  TERMS_OF_SERVICE = 'terms_of_service',
  MARKETING = 'marketing',
  AI_MONITORING = 'ai_monitoring',
  VIDEO_RECORDING = 'video_recording',
}

export class SaveConsentDto {
  @IsEnum(ConsentType)
  type!: ConsentType;

  @IsString()
  version!: string;

  @IsDateString()
  acceptedAt!: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}
