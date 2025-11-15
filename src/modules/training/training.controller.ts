import { Controller, Get, Post, Patch, Query, Body, Param, UseGuards } from '@nestjs/common';
import { ApiQuery, ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TrainingService } from './training.service';
import { PetSpecies } from '../breeds/entities/breed.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateTrainingAssignmentDto, CompleteTrainingDto, DailyTrainingStatsDto } from './dto/daily-training-assignment.dto';

@ApiTags('training')
@Controller('training')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Get('search')
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'species', required: false, enum: PetSpecies })
  @ApiQuery({ name: 'tags', required: false, type: String, description: 'comma-separated' })
  @ApiQuery({ name: 'difficulty', required: false, enum: ['easy','moderate','advanced'] })
  async search(
    @Query('q') q: string,
    @Query('species') species?: PetSpecies,
    @Query('tags') tagsCsv?: string,
    @Query('difficulty') difficulty?: 'easy' | 'moderate' | 'advanced',
  ) {
    const tags = tagsCsv ? tagsCsv.split(',').map((t) => t.trim()).filter(Boolean) : undefined;
    return this.trainingService.search(q, species, tags, difficulty);
  }

  @Get('by-species')
  @ApiQuery({ name: 'species', required: true, enum: PetSpecies })
  async bySpecies(@Query('species') species: PetSpecies) {
    return this.trainingService.listBySpecies(species);
  }

  // Admin Endpoints

  @Get('admin/activities')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLINIC_ADMIN)
  @ApiOperation({ summary: 'Get all training activities (Admin only)', description: 'Retrieves a paginated list of all training activities with optional filtering and sorting. Only accessible by administrators.' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page', example: 50 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term for filtering by title or summary' })
  @ApiQuery({ name: 'species', required: false, enum: PetSpecies, description: 'Filter by pet species' })
  @ApiQuery({ name: 'difficulty', required: false, enum: ['easy', 'moderate', 'advanced'], description: 'Filter by difficulty level' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Field to sort by', enum: ['created_at', 'updated_at', 'title', 'difficulty', 'avg_duration_minutes'], example: 'created_at' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order', example: 'DESC' })
  @ApiResponse({ status: 200, description: 'Training activities retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getAllActivities(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('species') species?: PetSpecies,
    @Query('difficulty') difficulty?: 'easy' | 'moderate' | 'advanced',
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    const options: {
      page: number;
      limit: number;
      search?: string;
      species?: PetSpecies;
      difficulty?: string;
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
    if (difficulty) {
      options.difficulty = difficulty;
    }

    return this.trainingService.findAllActivities(options);
  }

  // Daily Training Assignment Endpoints

  @Get('daily')
  @ApiOperation({ summary: 'Get today\'s training assignments' })
  @ApiResponse({ status: 200, description: 'Today\'s training assignments retrieved successfully' })
  async getTodayAssignments(@GetUser('id') userId: string) {
    return this.trainingService.getTodayAssignments(userId);
  }

  @Post('daily')
  @ApiOperation({ summary: 'Create a manual training assignment' })
  @ApiResponse({ status: 201, description: 'Training assignment created successfully' })
  async createAssignment(
    @GetUser('id') userId: string,
    @Body() dto: CreateTrainingAssignmentDto,
  ) {
    return this.trainingService.createAssignment(userId, dto);
  }

  @Patch('daily/:id/complete')
  @ApiOperation({ summary: 'Mark a training assignment as completed' })
  @ApiResponse({ status: 200, description: 'Training assignment completed successfully' })
  async completeAssignment(
    @Param('id') assignmentId: string,
    @GetUser('id') userId: string,
    @Body() dto: CompleteTrainingDto,
  ) {
    return this.trainingService.completeAssignment(assignmentId, userId, dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get training history' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Maximum number of records to return' })
  @ApiResponse({ status: 200, description: 'Training history retrieved successfully' })
  async getTrainingHistory(
    @GetUser('id') userId: string,
    @Query('limit') limit?: number,
  ) {
    const limitNum = limit ? parseInt(limit.toString(), 10) : 50;
    return this.trainingService.getTrainingHistory(userId, limitNum);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get training statistics' })
  @ApiResponse({
    status: 200,
    description: 'Training statistics retrieved successfully',
    type: DailyTrainingStatsDto
  })
  async getTrainingStats(@GetUser('id') userId: string): Promise<DailyTrainingStatsDto> {
    return this.trainingService.getTrainingStats(userId);
  }
}


