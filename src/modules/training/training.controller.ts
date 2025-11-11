import { Controller, Get, Post, Patch, Query, Body, Param, UseGuards } from '@nestjs/common';
import { ApiQuery, ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TrainingService } from './training.service';
import { PetSpecies } from '../breeds/entities/breed.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
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


