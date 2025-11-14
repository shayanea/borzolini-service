import { ApiProperty } from '@nestjs/swagger';
import { PetHost } from '../entities/pet-host.entity';

export class HostResponseDto {
  @ApiProperty({ description: 'Host data' })
  host!: PetHost;

  @ApiProperty({ description: 'Trust score (0-100)' })
  trust_score!: number;

  @ApiProperty({ description: 'Whether host has minimum reviews' })
  has_minimum_reviews!: boolean;

  @ApiProperty({ description: 'Whether host can become super host' })
  can_become_super_host!: boolean;
}

