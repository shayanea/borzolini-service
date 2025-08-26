import { IsNotEmpty, IsString, Length, Matches } from "class-validator";

import { ApiProperty } from "@nestjs/swagger";

export class RequestPhoneVerificationDto {
  @ApiProperty({
    description: "Phone number to send verification OTP to",
    example: "+1234567890",
    pattern: "^\\+[1-9]\\d{1,14}$",
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: "Phone number must be in international format (e.g., +1234567890)",
  })
  phone!: string;
}

export class VerifyPhoneDto {
  @ApiProperty({
    description: "Phone number to verify",
    example: "+1234567890",
    pattern: "^\\+[1-9]\\d{1,14}$",
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: "Phone number must be in international format (e.g., +1234567890)",
  })
  phone!: string;

  @ApiProperty({
    description: "6-digit verification OTP",
    example: "123456",
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: "OTP must be exactly 6 digits" })
  @Matches(/^\d{6}$/, { message: "OTP must contain only digits" })
  otp!: string;
}

export class ResendPhoneVerificationDto {
  @ApiProperty({
    description: "Phone number to resend verification OTP to",
    example: "+1234567890",
    pattern: "^\\+[1-9]\\d{1,14}$",
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: "Phone number must be in international format (e.g., +1234567890)",
  })
  phone!: string;
}

export class PhoneVerificationStatusDto {
  @ApiProperty({
    description: "Phone number checked",
    example: "+1234567890",
  })
  phone!: string;

  @ApiProperty({
    description: "Whether the OTP is still valid",
    example: true,
  })
  isValid!: boolean;

  @ApiProperty({
    description: "When the OTP expires (if valid)",
    example: "2024-01-01T12:00:00.000Z",
    nullable: true,
  })
  expiresAt!: Date | null;
}
