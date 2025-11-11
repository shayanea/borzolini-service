import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, Length } from 'class-validator';

export class JoinWalkGroupDto {
  @ApiProperty({
    description: 'ID of the pet to join the walk group',
    example: 'uuid-string',
  })
  @IsUUID()
  pet_id!: string;
}

export class JoinWalkGroupByCodeDto {
  @ApiProperty({
    description: 'Invite code for the walk group',
    example: 'ABC12345',
  })
  @IsString()
  @Length(8, 20)
  invite_code!: string;

  @ApiProperty({
    description: 'ID of the pet to join the walk group',
    example: 'uuid-string',
  })
  @IsUUID()
  pet_id!: string;
}

