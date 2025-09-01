import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, OnModuleInit, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { UpdateAppointmentSettingsDto, UpdateGeneralSettingsDto, UpdateNotificationSettingsDto, UpdateSecuritySettingsDto } from './dto/update-settings-section.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Settings } from './entities/settings.entity';
import { SettingsConfigService } from './settings-config.service';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(Settings)
    private readonly settingsRepository: Repository<Settings>,
    @Inject(forwardRef(() => SettingsConfigService))
    private readonly settingsConfigService?: SettingsConfigService
  ) {}

  async onModuleInit(): Promise<void> {
    // Ensure default settings exist
    await this.ensureDefaultSettings();
  }

  private async ensureDefaultSettings(): Promise<void> {
    const defaultSettings = await this.settingsRepository.findOne({
      where: { isDefault: true },
    });

    if (!defaultSettings) {
      const newDefaultSettings = this.settingsRepository.create({
        name: 'default',
        description: 'Default system settings',
        isDefault: true,
        isActive: true,
      });
      await this.settingsRepository.save(newDefaultSettings);
    }
  }

  async create(createSettingsDto: CreateSettingsDto, _userId?: string): Promise<Settings> {
    try {
      const settings = this.settingsRepository.create(createSettingsDto);
      return await this.settingsRepository.save(settings);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('Settings with this name already exists');
      }
      throw new BadRequestException('Failed to create settings');
    }
  }

  async findAll(): Promise<Settings[]> {
    return await this.settingsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Settings> {
    const settings = await this.settingsRepository.findOne({
      where: { id },
    });

    if (!settings) {
      throw new NotFoundException(`Settings with ID ${id} not found`);
    }

    return settings;
  }

  async findDefault(): Promise<Settings> {
    const settings = await this.settingsRepository.findOne({
      where: { isDefault: true },
    });

    if (!settings) {
      throw new NotFoundException('Default settings not found');
    }

    return settings;
  }

  async findActive(): Promise<Settings> {
    const settings = await this.settingsRepository.findOne({
      where: { isActive: true },
      order: { updatedAt: 'DESC' },
    });

    if (!settings) {
      // Fallback to default settings
      return await this.findDefault();
    }

    return settings;
  }

  async update(id: string, updateSettingsDto: UpdateSettingsDto, _userId?: string): Promise<Settings> {
    const settings = await this.findOne(id);

    try {
      Object.assign(settings, updateSettingsDto);
      const updatedSettings = await this.settingsRepository.save(settings);

      // Clear cache if settings config service is available
      if (this.settingsConfigService) {
        this.settingsConfigService.clearCache();
      }

      return updatedSettings;
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('Settings with this name already exists');
      }
      throw new BadRequestException('Failed to update settings');
    }
  }

  async updateDefault(updateSettingsDto: UpdateSettingsDto, _userId?: string): Promise<Settings> {
    const defaultSettings = await this.findDefault();
    return await this.update(defaultSettings.id, updateSettingsDto, _userId);
  }

  async updateGeneralSettings(updateDto: UpdateGeneralSettingsDto, _userId?: string): Promise<Settings> {
    const activeSettings = await this.findActive();
    return await this.update(activeSettings.id, updateDto, _userId);
  }

  async updateNotificationSettings(updateDto: UpdateNotificationSettingsDto, _userId?: string): Promise<Settings> {
    const activeSettings = await this.findActive();
    return await this.update(activeSettings.id, updateDto, _userId);
  }

  async updateAppointmentSettings(updateDto: UpdateAppointmentSettingsDto, _userId?: string): Promise<Settings> {
    const activeSettings = await this.findActive();
    return await this.update(activeSettings.id, updateDto, _userId);
  }

  async updateSecuritySettings(updateDto: UpdateSecuritySettingsDto, _userId?: string): Promise<Settings> {
    const activeSettings = await this.findActive();
    return await this.update(activeSettings.id, updateDto, _userId);
  }

  async remove(id: string, _userId?: string): Promise<void> {
    const settings = await this.findOne(id);

    if (settings.isDefault) {
      throw new BadRequestException('Cannot delete default settings');
    }

    await this.settingsRepository.remove(settings);
  }

  async resetToDefaults(_userId?: string): Promise<Settings> {
    const defaultSettings = await this.findDefault();

    // Create a new settings instance with default values
    const resetSettings = this.settingsRepository.create({
      name: `Reset Settings - ${new Date().toISOString()}`,
      description: 'Settings reset to defaults',
      generalSettings: defaultSettings.generalSettings,
      notificationSettings: defaultSettings.notificationSettings,
      appointmentSettings: defaultSettings.appointmentSettings,
      securitySettings: defaultSettings.securitySettings,
      isActive: true,
      isDefault: false,
    });

    return await this.settingsRepository.save(resetSettings);
  }

  async setActive(id: string, _userId?: string): Promise<Settings> {
    const settings = await this.findOne(id);

    // Deactivate all other settings
    await this.settingsRepository.update({ isActive: true }, { isActive: false });

    // Activate the selected settings
    settings.isActive = true;
    const updatedSettings = await this.settingsRepository.save(settings);

    // Clear cache if settings config service is available
    if (this.settingsConfigService) {
      this.settingsConfigService.clearCache();
    }

    return updatedSettings;
  }

  async duplicate(id: string, name: string, _userId?: string): Promise<Settings> {
    const originalSettings = await this.findOne(id);

    const duplicatedSettings = this.settingsRepository.create({
      name,
      description: `Copy of ${originalSettings.name}`,
      generalSettings: originalSettings.generalSettings,
      notificationSettings: originalSettings.notificationSettings,
      appointmentSettings: originalSettings.appointmentSettings,
      securitySettings: originalSettings.securitySettings,
      isActive: false,
      isDefault: false,
    });

    return await this.settingsRepository.save(duplicatedSettings);
  }
}
