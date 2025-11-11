import { PartialType } from '@nestjs/swagger';
import { CreateWalkGroupDto } from './create-walk-group.dto';

export class UpdateWalkGroupDto extends PartialType(CreateWalkGroupDto) {}

