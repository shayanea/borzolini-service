import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { UpdateAppointmentSettingsDto, UpdateGeneralSettingsDto, UpdateNotificationSettingsDto, UpdateSecuritySettingsDto } from './dto/update-settings-section.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Settings } from './entities/settings.entity';
import { SettingsService } from './settings.service';

@ApiTags('settings')
@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new settings configuration' })
  @ApiResponse({
    status: 201,
    description: 'Settings created successfully',
    type: Settings,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 409, description: 'Conflict - Settings name already exists' })
  async create(@Body() createSettingsDto: CreateSettingsDto, @Request() req: any): Promise<Settings> {
    return await this.settingsService.create(createSettingsDto, req.user?.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all settings configurations' })
  @ApiResponse({
    status: 200,
    description: 'Settings retrieved successfully',
    type: [Settings],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async findAll(): Promise<Settings[]> {
    return await this.settingsService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get currently active settings' })
  @ApiResponse({
    status: 200,
    description: 'Active settings retrieved successfully',
    type: Settings,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'No active settings found' })
  async findActive(): Promise<Settings> {
    return await this.settingsService.findActive();
  }

  @Get('default')
  @ApiOperation({ summary: 'Get default settings' })
  @ApiResponse({
    status: 200,
    description: 'Default settings retrieved successfully',
    type: Settings,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Default settings not found' })
  async findDefault(): Promise<Settings> {
    return await this.settingsService.findDefault();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get settings by ID' })
  @ApiParam({ name: 'id', description: 'Settings ID' })
  @ApiResponse({
    status: 200,
    description: 'Settings retrieved successfully',
    type: Settings,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Settings not found' })
  async findOne(@Param('id') id: string): Promise<Settings> {
    return await this.settingsService.findOne(id);
  }

  @Patch('default')
  @ApiOperation({ summary: 'Update default settings' })
  @ApiResponse({
    status: 200,
    description: 'Default settings updated successfully',
    type: Settings,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Default settings not found' })
  async updateDefault(@Body() updateSettingsDto: UpdateSettingsDto, @Request() req: any): Promise<Settings> {
    return await this.settingsService.updateDefault(updateSettingsDto, req.user?.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update settings by ID' })
  @ApiParam({ name: 'id', description: 'Settings ID' })
  @ApiResponse({
    status: 200,
    description: 'Settings updated successfully',
    type: Settings,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Settings not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Settings name already exists' })
  async update(@Param('id') id: string, @Body() updateSettingsDto: UpdateSettingsDto, @Request() req: any): Promise<Settings> {
    return await this.settingsService.update(id, updateSettingsDto, req.user?.id);
  }

  @Patch('general')
  @ApiOperation({ summary: 'Update general settings' })
  @ApiResponse({
    status: 200,
    description: 'General settings updated successfully',
    type: Settings,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Active settings not found' })
  async updateGeneralSettings(@Body() updateDto: UpdateGeneralSettingsDto, @Request() req: any): Promise<Settings> {
    return await this.settingsService.updateGeneralSettings(updateDto, req.user?.id);
  }

  @Patch('notifications')
  @ApiOperation({ summary: 'Update notification settings' })
  @ApiResponse({
    status: 200,
    description: 'Notification settings updated successfully',
    type: Settings,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Active settings not found' })
  async updateNotificationSettings(@Body() updateDto: UpdateNotificationSettingsDto, @Request() req: any): Promise<Settings> {
    return await this.settingsService.updateNotificationSettings(updateDto, req.user?.id);
  }

  @Patch('appointments')
  @ApiOperation({ summary: 'Update appointment settings' })
  @ApiResponse({
    status: 200,
    description: 'Appointment settings updated successfully',
    type: Settings,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Active settings not found' })
  async updateAppointmentSettings(@Body() updateDto: UpdateAppointmentSettingsDto, @Request() req: any): Promise<Settings> {
    return await this.settingsService.updateAppointmentSettings(updateDto, req.user?.id);
  }

  @Patch('security')
  @ApiOperation({ summary: 'Update security settings' })
  @ApiResponse({
    status: 200,
    description: 'Security settings updated successfully',
    type: Settings,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Active settings not found' })
  async updateSecuritySettings(@Body() updateDto: UpdateSecuritySettingsDto, @Request() req: any): Promise<Settings> {
    return await this.settingsService.updateSecuritySettings(updateDto, req.user?.id);
  }

  @Post('reset')
  @ApiOperation({ summary: 'Reset settings to defaults' })
  @ApiResponse({
    status: 201,
    description: 'Settings reset to defaults successfully',
    type: Settings,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Default settings not found' })
  async resetToDefaults(@Request() req: any): Promise<Settings> {
    return await this.settingsService.resetToDefaults(req.user?.id);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate specific settings configuration' })
  @ApiParam({ name: 'id', description: 'Settings ID' })
  @ApiResponse({
    status: 200,
    description: 'Settings activated successfully',
    type: Settings,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Settings not found' })
  async setActive(@Param('id') id: string, @Request() req: any): Promise<Settings> {
    return await this.settingsService.setActive(id, req.user?.id);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate settings configuration' })
  @ApiParam({ name: 'id', description: 'Settings ID to duplicate' })
  @ApiResponse({
    status: 201,
    description: 'Settings duplicated successfully',
    type: Settings,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Settings not found' })
  async duplicate(@Param('id') id: string, @Body() body: { name: string }, @Request() req: any): Promise<Settings> {
    return await this.settingsService.duplicate(id, body.name, req.user?.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete settings configuration' })
  @ApiParam({ name: 'id', description: 'Settings ID' })
  @ApiResponse({ status: 204, description: 'Settings deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Cannot delete default settings' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Settings not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req: any): Promise<void> {
    await this.settingsService.remove(id, req.user?.id);
  }
}
