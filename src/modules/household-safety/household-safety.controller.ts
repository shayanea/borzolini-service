import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiQuery, ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HouseholdSafetyService } from './household-safety.service';
import { PetSpecies } from '../breeds/entities/breed.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { FoodSafetyLevel } from './entities/food-item.entity';
import { PlantToxicityLevel } from './entities/plant.entity';
import { HazardSeverity } from './entities/household-item.entity';

@ApiTags('safety')
@Controller('safety')
export class HouseholdSafetyController {
  constructor(private readonly safetyService: HouseholdSafetyService) {}

  @Get('search')
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'species', required: false, enum: PetSpecies })
  async search(@Query('q') q: string, @Query('species') species?: PetSpecies) {
    return this.safetyService.searchAll(q, species);
  }

  @Get('foods')
  @ApiQuery({ name: 'species', required: false, enum: PetSpecies })
  async foods(@Query('species') species?: PetSpecies) {
    return this.safetyService.listFoods(species);
  }

  @Get('plants')
  @ApiQuery({ name: 'species', required: false, enum: PetSpecies })
  async plants(@Query('species') species?: PetSpecies) {
    return this.safetyService.listPlants(species);
  }

  @Get('items')
  @ApiQuery({ name: 'species', required: false, enum: PetSpecies })
  async items(@Query('species') species?: PetSpecies) {
    return this.safetyService.listItems(species);
  }

  @Get('foods/resolve')
  @ApiQuery({ name: 'alias', required: true })
  async resolveFood(@Query('alias') alias: string) {
    return this.safetyService.resolveFoodAlias(alias);
  }

  // Admin Endpoints

  @Get('admin/foods')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLINIC_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all food items (Admin only)', description: 'Retrieves a paginated list of all food items with optional filtering and sorting. Only accessible by administrators.' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page', example: 50 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term for filtering by name or scientific name' })
  @ApiQuery({ name: 'species', required: false, enum: PetSpecies, description: 'Filter by pet species' })
  @ApiQuery({ name: 'safetyLevel', required: false, enum: FoodSafetyLevel, description: 'Filter by safety level' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Field to sort by', enum: ['created_at', 'updated_at', 'canonical_name', 'safety_overall', 'category'], example: 'created_at' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order', example: 'DESC' })
  @ApiResponse({ status: 200, description: 'Food items retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getAllFoods(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('species') species?: PetSpecies,
    @Query('safetyLevel') safetyLevel?: FoodSafetyLevel,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    const options: {
      page: number;
      limit: number;
      search?: string;
      species?: PetSpecies;
      safetyLevel?: FoodSafetyLevel;
      sortBy: string;
      sortOrder: 'ASC' | 'DESC';
    } = {
      page: page ? parseInt(page.toString(), 10) : 1,
      limit: limit ? Math.min(parseInt(limit.toString(), 10), 100) : 50,
      sortBy: sortBy || 'created_at',
      sortOrder: sortOrder || 'DESC',
    };

    if (search) {
      options.search = search;
    }
    if (species) {
      options.species = species;
    }
    if (safetyLevel) {
      options.safetyLevel = safetyLevel;
    }

    return this.safetyService.findAllFoods(options);
  }

  @Get('admin/plants')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLINIC_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all plants (Admin only)', description: 'Retrieves a paginated list of all plants with optional filtering and sorting. Only accessible by administrators.' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page', example: 50 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term for filtering by name or scientific name' })
  @ApiQuery({ name: 'species', required: false, enum: PetSpecies, description: 'Filter by pet species' })
  @ApiQuery({ name: 'toxicityLevel', required: false, enum: PlantToxicityLevel, description: 'Filter by toxicity level' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Field to sort by', enum: ['created_at', 'updated_at', 'canonical_name', 'toxicity_overall'], example: 'created_at' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order', example: 'DESC' })
  @ApiResponse({ status: 200, description: 'Plants retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getAllPlants(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('species') species?: PetSpecies,
    @Query('toxicityLevel') toxicityLevel?: PlantToxicityLevel,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    const options: {
      page: number;
      limit: number;
      search?: string;
      species?: PetSpecies;
      toxicityLevel?: PlantToxicityLevel;
      sortBy: string;
      sortOrder: 'ASC' | 'DESC';
    } = {
      page: page ? parseInt(page.toString(), 10) : 1,
      limit: limit ? Math.min(parseInt(limit.toString(), 10), 100) : 50,
      sortBy: sortBy || 'created_at',
      sortOrder: sortOrder || 'DESC',
    };

    if (search) {
      options.search = search;
    }
    if (species) {
      options.species = species;
    }
    if (toxicityLevel) {
      options.toxicityLevel = toxicityLevel;
    }

    return this.safetyService.findAllPlants(options);
  }

  @Get('admin/items')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLINIC_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all household items (Admin only)', description: 'Retrieves a paginated list of all household items with optional filtering and sorting. Only accessible by administrators.' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page', example: 50 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term for filtering by name' })
  @ApiQuery({ name: 'species', required: false, enum: PetSpecies, description: 'Filter by pet species' })
  @ApiQuery({ name: 'severity', required: false, enum: HazardSeverity, description: 'Filter by hazard severity' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Field to sort by', enum: ['created_at', 'updated_at', 'canonical_name', 'severity_overall', 'category'], example: 'created_at' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order', example: 'DESC' })
  @ApiResponse({ status: 200, description: 'Household items retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getAllItems(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('species') species?: PetSpecies,
    @Query('severity') severity?: HazardSeverity,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    const options: {
      page: number;
      limit: number;
      search?: string;
      species?: PetSpecies;
      severity?: HazardSeverity;
      sortBy: string;
      sortOrder: 'ASC' | 'DESC';
    } = {
      page: page ? parseInt(page.toString(), 10) : 1,
      limit: limit ? Math.min(parseInt(limit.toString(), 10), 100) : 50,
      sortBy: sortBy || 'created_at',
      sortOrder: sortOrder || 'DESC',
    };

    if (search) {
      options.search = search;
    }
    if (species) {
      options.species = species;
    }
    if (severity) {
      options.severity = severity;
    }

    return this.safetyService.findAllItems(options);
  }
}


