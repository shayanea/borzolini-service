import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { TrainingService } from './training.service';
import { PetSpecies } from '../breeds/entities/breed.entity';

@ApiTags('training')
@Controller('training')
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
}


