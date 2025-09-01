import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Settings } from './entities/settings.entity';
import { SettingsConfigService } from './settings-config.service';
import { SettingsService } from './settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([Settings])],
  providers: [SettingsService, SettingsConfigService],
  exports: [SettingsConfigService],
})
export class SettingsConfigModule {}
