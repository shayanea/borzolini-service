import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { CreateResourceDto } from './dto/create-resource.dto';
import { ResourceResponseDto } from './dto/resource-response.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { ResourceType } from './entities/resource.entity';
import { ResourcesService } from './resources.service';

@ApiTags('Resources')
@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new resource (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Resource successfully created',
    type: ResourceResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async create(@Body() createResourceDto: CreateResourceDto): Promise<ResourceResponseDto> {
    return this.resourcesService.create(createResourceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all resources (public endpoint for users)' })
  @ApiQuery({
    name: 'type',
    enum: ResourceType,
    description: 'Filter by resource type',
    required: false,
  })
  @ApiQuery({
    name: 'isActive',
    type: Boolean,
    description: 'Filter by active status',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved resources',
    type: [ResourceResponseDto],
  })
  async findAll(@Query('type') type?: ResourceType, @Query('isActive') isActive?: string): Promise<ResourceResponseDto[]> {
    const isActiveBool = isActive !== undefined ? isActive === 'true' : undefined;
    return this.resourcesService.findAll(type, isActiveBool);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active resources (public endpoint for users)' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved active resources',
    type: [ResourceResponseDto],
  })
  async findActive(): Promise<ResourceResponseDto[]> {
    return this.resourcesService.findActive();
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get resources by type (public endpoint for users)' })
  @ApiParam({
    name: 'type',
    enum: ResourceType,
    description: 'Resource type to filter by',
  })
  @ApiQuery({
    name: 'activeOnly',
    type: Boolean,
    description: 'Return only active resources',
    required: false,
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved resources by type',
    type: [ResourceResponseDto],
  })
  async findByType(@Param('type') type: ResourceType, @Query('activeOnly') activeOnly: string = 'true'): Promise<ResourceResponseDto[]> {
    return this.resourcesService.findByType(type, activeOnly === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a resource by ID (public endpoint for users)' })
  @ApiParam({
    name: 'id',
    description: 'Resource ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the resource',
    type: ResourceResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Resource not found',
  })
  async findOne(@Param('id') id: string): Promise<ResourceResponseDto> {
    return this.resourcesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a resource (Admin only)' })
  @ApiParam({
    name: 'id',
    description: 'Resource ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Resource successfully updated',
    type: ResourceResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'Resource not found',
  })
  async update(@Param('id') id: string, @Body() updateResourceDto: UpdateResourceDto): Promise<ResourceResponseDto> {
    return this.resourcesService.update(id, updateResourceDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a resource (Admin only)' })
  @ApiParam({
    name: 'id',
    description: 'Resource ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Resource successfully deleted',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'Resource not found',
  })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.resourcesService.remove(id);
    return { message: 'Resource successfully deleted' };
  }
}

