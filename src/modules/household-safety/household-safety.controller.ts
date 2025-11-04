import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { HouseholdSafetyService } from './household-safety.service';
import { PetSpecies } from '../breeds/entities/breed.entity';

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
}


