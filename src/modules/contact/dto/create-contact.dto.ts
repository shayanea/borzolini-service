import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  name!: string;

  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Subject must be at least 3 characters' })
  subject!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Message must be at least 10 characters' })
  message!: string;

  @IsBoolean()
  consent!: boolean;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}
