import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { BreedsService } from './breeds.service';
import { AllBreedsResponseDto, BreedResponseDto } from './dto/breed-response.dto';
import { CreateBreedDto } from './dto/create-breed.dto';
import { UpdateBreedDto } from './dto/update-breed.dto';
import { PetSpecies } from './entities/breed.entity';

@ApiTags('Breeds')
@Controller('breeds')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BreedsController {
  constructor(private readonly breedsService: BreedsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new breed' })
  @ApiResponse({
    status: 201,
    description: 'Breed created successfully',
    type: BreedResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Breed already exists for this species' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(@Body() createBreedDto: CreateBreedDto): Promise<BreedResponseDto> {
    return this.breedsService.create(createBreedDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all breeds without pagination',
    description: 'Returns all active breeds grouped by species. No pagination applied.',
  })
  @ApiResponse({
    status: 200,
    description: 'All breeds retrieved successfully',
    type: AllBreedsResponseDto,
  })
  async findAll(): Promise<AllBreedsResponseDto> {
    return this.breedsService.findAll();
  }

  @Get('species/:species')
  @ApiOperation({
    summary: 'Get all breeds for a specific species',
    description: 'Returns all active breeds for the specified species',
  })
  @ApiParam({
    name: 'species',
    enum: PetSpecies,
    description: 'Pet species to get breeds for',
  })
  @ApiResponse({
    status: 200,
    description: 'Breeds for species retrieved successfully',
    type: [BreedResponseDto],
  })
  @ApiResponse({ status: 400, description: 'Invalid species parameter' })
  async findBySpecies(@Param('species') species: PetSpecies): Promise<BreedResponseDto[]> {
    return this.breedsService.findBySpecies(species);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search breeds by name',
    description: 'Search for breeds by name (case-insensitive partial match)',
  })
  @ApiQuery({
    name: 'q',
    description: 'Search term for breed name',
    example: 'golden',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    type: [BreedResponseDto],
  })
  async searchByName(@Query('q') searchTerm: string): Promise<BreedResponseDto[]> {
    return this.breedsService.searchByName(searchTerm);
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Get breed statistics',
    description: 'Returns statistics about breeds including counts by species and size',
  })
  @ApiResponse({
    status: 200,
    description: 'Breed statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total_breeds: { type: 'number', example: 150 },
        breeds_by_species: {
          type: 'object',
          example: { dog: 50, cat: 40, bird: 30, rabbit: 20, other: 10 },
        },
        breeds_by_size: {
          type: 'object',
          example: { small: 60, medium: 50, large: 30, giant: 10 },
        },
      },
    },
  })
  async getStatistics() {
    return this.breedsService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a breed by ID' })
  @ApiParam({ name: 'id', description: 'Breed ID' })
  @ApiResponse({
    status: 200,
    description: 'Breed retrieved successfully',
    type: BreedResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Breed not found' })
  async findOne(@Param('id') id: string): Promise<BreedResponseDto> {
    return this.breedsService.findOne(id);
  }

  @Get('name/:name/species/:species')
  @ApiOperation({ summary: 'Get a breed by name and species' })
  @ApiParam({ name: 'name', description: 'Breed name' })
  @ApiParam({
    name: 'species',
    enum: PetSpecies,
    description: 'Pet species',
  })
  @ApiResponse({
    status: 200,
    description: 'Breed retrieved successfully',
    type: BreedResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Breed not found' })
  async findByNameAndSpecies(@Param('name') name: string, @Param('species') species: PetSpecies): Promise<BreedResponseDto> {
    return this.breedsService.findByNameAndSpecies(name, species);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a breed' })
  @ApiParam({ name: 'id', description: 'Breed ID' })
  @ApiResponse({
    status: 200,
    description: 'Breed updated successfully',
    type: BreedResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Breed not found' })
  @ApiResponse({ status: 409, description: 'Breed name conflict for this species' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async update(@Param('id') id: string, @Body() updateBreedDto: UpdateBreedDto): Promise<BreedResponseDto> {
    return this.breedsService.update(id, updateBreedDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a breed (soft delete)' })
  @ApiParam({ name: 'id', description: 'Breed ID' })
  @ApiResponse({ status: 204, description: 'Breed deleted successfully' })
  @ApiResponse({ status: 404, description: 'Breed not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.breedsService.remove(id);
  }
}
