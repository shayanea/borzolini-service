import { CreateSettingsDto } from './create-settings.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateSettingsDto extends PartialType(CreateSettingsDto) {}
