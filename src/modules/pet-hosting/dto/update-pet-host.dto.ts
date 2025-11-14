import { PartialType } from '@nestjs/swagger';
import { CreatePetHostDto } from './create-pet-host.dto';

export class UpdatePetHostDto extends PartialType(CreatePetHostDto) {}

