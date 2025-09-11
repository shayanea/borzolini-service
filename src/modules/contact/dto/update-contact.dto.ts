import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateContactDto {
  @IsOptional()
  @IsEnum(['pending', 'in_progress', 'resolved', 'closed'])
  status?: 'pending' | 'in_progress' | 'resolved' | 'closed';

  @IsOptional()
  @IsString()
  adminNotes?: string;
}
