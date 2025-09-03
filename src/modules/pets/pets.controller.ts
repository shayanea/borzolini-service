import { Body, Controller, Delete, ForbiddenException, Get, Param, ParseEnumPipe, ParseIntPipe, ParseUUIDPipe, Patch, Post, Query, Request, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ExportService } from '../common/services/export.service';
import { UserRole } from '../users/entities/user.entity';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { Pet, PetGender, PetSize, PetSpecies } from './entities/pet.entity';
import { PetFilters, PetsService, PetStats } from './pets.service';

@ApiTags('pets')
@Controller('pets')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PetsController {
  constructor(
    private readonly petsService: PetsService,
    private readonly exportService: ExportService
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new pet',
    description: 'Create a new pet for the authenticated user',
  })
  @ApiResponse({
    status: 201,
    description: 'Pet created successfully',
    type: Pet,
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid pet data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async create(@Body() createPetDto: CreatePetDto, @Request() req: any): Promise<Pet> {
    const ownerId = req.user.id;
    return this.petsService.create(createPetDto, ownerId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all pets',
    description: 'Retrieve all pets with optional filtering and pagination',
  })
  @ApiResponse({ status: 200, description: 'Pets retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'species',
    required: false,
    enum: PetSpecies,
    description: 'Filter by pet species',
  })
  @ApiQuery({
    name: 'gender',
    required: false,
    enum: PetGender,
    description: 'Filter by pet gender',
  })
  @ApiQuery({
    name: 'size',
    required: false,
    enum: PetSize,
    description: 'Filter by pet size',
  })
  @ApiQuery({
    name: 'is_spayed_neutered',
    required: false,
    type: Boolean,
    description: 'Filter by spayed/neutered status',
  })
  @ApiQuery({
    name: 'is_vaccinated',
    required: false,
    type: Boolean,
    description: 'Filter by vaccination status',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search in name, breed, or color',
  })
  @ApiQuery({
    name: 'owner_id',
    required: false,
    type: String,
    description: 'Filter by owner ID (admin only)',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Field to sort by (default: created_at)',
    example: 'name',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort order (default: DESC)',
    example: 'DESC',
  })
  async findAll(
    @Request() req: any,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('species') species?: PetSpecies,
    @Query('gender') gender?: PetGender,
    @Query('size') size?: PetSize,
    @Query('is_spayed_neutered') is_spayed_neutered?: boolean,
    @Query('is_vaccinated') is_vaccinated?: boolean,
    @Query('search') search?: string,
    @Query('owner_id') owner_id?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC'
  ) {
    // Only allow admins to filter by owner_id
    if (owner_id && req.user.role !== UserRole.ADMIN) {
      owner_id = req.user.id; // Force to current user's pets
    }

    const filters: PetFilters = {
      species,
      gender,
      size,
      is_spayed_neutered,
      is_vaccinated,
      search,
      // Only filter by owner_id if explicitly provided or if user is not admin
      owner_id: owner_id || (req.user.role !== UserRole.ADMIN ? req.user.id : undefined),
    };

    return this.petsService.findAll(filters, page, limit, sortBy, sortOrder);
  }

  @Get('my-pets')
  @ApiOperation({
    summary: 'Get current user pets',
    description: 'Retrieve all pets owned by the authenticated user',
  })
  @ApiResponse({ status: 200, description: 'User pets retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findMyPets(@Request() req: any): Promise<Pet[]> {
    return this.petsService.findByOwner(req.user.id);
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get pets by user ID',
    description: 'Retrieve all pets owned by a specific user (admin only)',
  })
  @ApiResponse({ status: 200, description: 'User pets retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'userId', description: 'User ID to fetch pets for' })
  @Roles(UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.STAFF)
  async findPetsByUserId(@Param('userId', ParseUUIDPipe) userId: string): Promise<Pet[]> {
    return this.petsService.findByOwner(userId);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get pet statistics',
    description: 'Retrieve comprehensive statistics about all pets',
  })
  @ApiResponse({
    status: 200,
    description: 'Pet statistics retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Roles(UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.STAFF)
  async getPetStats(): Promise<PetStats> {
    return this.petsService.getPetStats();
  }

  @Get('species/:species')
  @ApiOperation({
    summary: 'Get pets by species',
    description: 'Retrieve all pets of a specific species',
  })
  @ApiResponse({
    status: 200,
    description: 'Pets by species retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({
    name: 'species',
    enum: PetSpecies,
    description: 'Pet species to filter by',
  })
  async getPetsBySpecies(@Param('species', new ParseEnumPipe(PetSpecies)) species: PetSpecies): Promise<Pet[]> {
    return this.petsService.getPetsBySpecies(species);
  }

  @Get('needing-vaccination')
  @ApiOperation({
    summary: 'Get pets needing vaccination',
    description: 'Retrieve all pets that need vaccination',
  })
  @ApiResponse({
    status: 200,
    description: 'Pets needing vaccination retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Roles(UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.STAFF)
  async getPetsNeedingVaccination(): Promise<Pet[]> {
    return this.petsService.getPetsNeedingVaccination();
  }

  @Get('needing-spay-neuter')
  @ApiOperation({
    summary: 'Get pets needing spay/neuter',
    description: 'Retrieve all pets that need spay/neuter surgery',
  })
  @ApiResponse({
    status: 200,
    description: 'Pets needing spay/neuter retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Roles(UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.STAFF)
  async getPetsNeedingSpayNeuter(): Promise<Pet[]> {
    return this.petsService.getPetsNeedingSpayNeuter();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get pet by ID',
    description: 'Retrieve a specific pet by its ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Pet retrieved successfully',
    type: Pet,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Pet not found' })
  @ApiParam({ name: 'id', description: 'Pet ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any): Promise<Pet> {
    const pet = await this.petsService.findOne(id);

    // Check if user owns the pet or is admin/staff
    if (pet.owner_id !== req.user.id && ![UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.STAFF].includes(req.user.role)) {
      throw new ForbiddenException('Access denied: You can only access your own pets');
    }

    return pet;
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update pet',
    description: 'Update a specific pet by its ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Pet updated successfully',
    type: Pet,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid update data',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Pet not found' })
  @ApiParam({ name: 'id', description: 'Pet ID' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updatePetDto: UpdatePetDto, @Request() req: any): Promise<Pet> {
    const pet = await this.petsService.findOne(id);

    // Check if user owns the pet or is admin/staff
    if (pet.owner_id !== req.user.id && ![UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.STAFF].includes(req.user.role)) {
      throw new ForbiddenException('Access denied: You can only access your own pets');
    }

    return this.petsService.update(id, updatePetDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete pet',
    description: 'Soft delete a specific pet by its ID',
  })
  @ApiResponse({ status: 200, description: 'Pet deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Pet not found' })
  @ApiParam({ name: 'id', description: 'Pet ID' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: any): Promise<{ message: string }> {
    const pet = await this.petsService.findOne(id);

    // Check if user owns the pet or is admin/staff
    if (pet.owner_id !== req.user.id && ![UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.STAFF].includes(req.user.role)) {
      throw new ForbiddenException('Access denied: You can only access your own pets');
    }

    await this.petsService.remove(id);
    return { message: 'Pet deleted successfully' };
  }

  @Delete(':id/hard')
  @ApiOperation({
    summary: 'Hard delete pet',
    description: 'Permanently delete a specific pet by its ID (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Pet permanently deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin access required',
  })
  @ApiResponse({ status: 404, description: 'Pet not found' })
  @ApiParam({ name: 'id', description: 'Pet ID' })
  @Roles(UserRole.ADMIN)
  async hardRemove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    await this.petsService.hardRemove(id);
    return { message: 'Pet permanently deleted successfully' };
  }

  @Post('validate')
  @ApiOperation({
    summary: 'Validate pet data',
    description: 'Validate pet data without creating the pet',
  })
  @ApiResponse({ status: 200, description: 'Pet data validation completed' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid pet data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async validatePetData(@Body() createPetDto: CreatePetDto): Promise<{ isValid: boolean; errors: string[] }> {
    return this.petsService.validatePetData(createPetDto);
  }

  // Export endpoints
  @Get('export/csv')
  @Roles(UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.STAFF)
  @ApiOperation({
    summary: 'Export pets to CSV',
    description: 'Export all pets to CSV format with optional filtering',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10000)',
  })
  @ApiQuery({
    name: 'species',
    required: false,
    enum: PetSpecies,
    description: 'Filter by pet species',
  })
  @ApiQuery({
    name: 'gender',
    required: false,
    enum: PetGender,
    description: 'Filter by pet gender',
  })
  @ApiQuery({
    name: 'size',
    required: false,
    enum: PetSize,
    description: 'Filter by pet size',
  })
  @ApiQuery({
    name: 'is_spayed_neutered',
    required: false,
    type: Boolean,
    description: 'Filter by spayed/neutered status',
  })
  @ApiQuery({
    name: 'is_vaccinated',
    required: false,
    type: Boolean,
    description: 'Filter by vaccination status',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search in name, breed, or color',
  })
  @ApiQuery({
    name: 'owner_id',
    required: false,
    type: String,
    description: 'Filter by owner ID (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'CSV file generated successfully',
    content: {
      'text/csv': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async exportPetsToCsv(
    @Res() res: Response,
    @Request() req: any,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10000,
    @Query('species') species?: PetSpecies,
    @Query('gender') gender?: PetGender,
    @Query('size') size?: PetSize,
    @Query('is_spayed_neutered') is_spayed_neutered?: boolean,
    @Query('is_vaccinated') is_vaccinated?: boolean,
    @Query('search') search?: string,
    @Query('owner_id') owner_id?: string
  ) {
    // Only allow admins to filter by owner_id
    if (owner_id && req.user.role !== UserRole.ADMIN) {
      owner_id = req.user.id; // Force to current user's pets
    }

    const filters: PetFilters = {
      species,
      gender,
      size,
      is_spayed_neutered,
      is_vaccinated,
      search,
      // Only filter by owner_id if explicitly provided or if user is not admin
      owner_id: owner_id || (req.user.role !== UserRole.ADMIN ? req.user.id : undefined),
    };

    const result = await this.petsService.findAll(filters, page, limit);
    const transformedData = this.exportService.transformPetData(result.pets);

    await this.exportService.exportData(transformedData, 'csv', 'pets', res);
  }

  @Get('export/excel')
  @Roles(UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.STAFF)
  @ApiOperation({
    summary: 'Export pets to Excel',
    description: 'Export all pets to Excel format with optional filtering',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10000)',
  })
  @ApiQuery({
    name: 'species',
    required: false,
    enum: PetSpecies,
    description: 'Filter by pet species',
  })
  @ApiQuery({
    name: 'gender',
    required: false,
    enum: PetGender,
    description: 'Filter by pet gender',
  })
  @ApiQuery({
    name: 'size',
    required: false,
    enum: PetSize,
    description: 'Filter by pet size',
  })
  @ApiQuery({
    name: 'is_spayed_neutered',
    required: false,
    type: Boolean,
    description: 'Filter by spayed/neutered status',
  })
  @ApiQuery({
    name: 'is_vaccinated',
    required: false,
    type: Boolean,
    description: 'Filter by vaccination status',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search in name, breed, or color',
  })
  @ApiQuery({
    name: 'owner_id',
    required: false,
    type: String,
    description: 'Filter by owner ID (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Excel file generated successfully',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async exportPetsToExcel(
    @Res() res: Response,
    @Request() req: any,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10000,
    @Query('species') species?: PetSpecies,
    @Query('gender') gender?: PetGender,
    @Query('size') size?: PetSize,
    @Query('is_spayed_neutered') is_spayed_neutered?: boolean,
    @Query('is_vaccinated') is_vaccinated?: boolean,
    @Query('search') search?: string,
    @Query('owner_id') owner_id?: string
  ) {
    // Only allow admins to filter by owner_id
    if (owner_id && req.user.role !== UserRole.ADMIN) {
      owner_id = req.user.id; // Force to current user's pets
    }

    const filters: PetFilters = {
      species,
      gender,
      size,
      is_spayed_neutered,
      is_vaccinated,
      search,
      // Only filter by owner_id if explicitly provided or if user is not admin
      owner_id: owner_id || (req.user.role !== UserRole.ADMIN ? req.user.id : undefined),
    };

    const result = await this.petsService.findAll(filters, page, limit);
    const transformedData = this.exportService.transformPetData(result.pets);

    await this.exportService.exportData(transformedData, 'excel', 'pets', res);
  }
}
