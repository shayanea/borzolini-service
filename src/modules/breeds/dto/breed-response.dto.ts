import { ApiProperty } from '@nestjs/swagger';
import { ExerciseNeeds, GroomingNeeds, PetSize, PetSpecies } from '../entities/breed.entity';

export class BreedResponseDto {
  @ApiProperty({ description: 'Unique identifier for the breed' })
  id!: string;

  @ApiProperty({ description: 'Name of the breed' })
  name!: string;

  @ApiProperty({ description: 'Species of the breed', enum: PetSpecies })
  species!: PetSpecies;

  @ApiProperty({ description: 'Size category of the breed', enum: PetSize, required: false })
  size_category?: PetSize;

  @ApiProperty({ description: 'Temperament and personality traits', required: false })
  temperament?: string;

  @ApiProperty({ description: 'Common health risks for this breed', required: false })
  health_risks!: string[];

  @ApiProperty({ description: 'Minimum life expectancy in years', required: false })
  life_expectancy_min?: number;

  @ApiProperty({ description: 'Maximum life expectancy in years', required: false })
  life_expectancy_max?: number;

  @ApiProperty({ description: 'Minimum weight in pounds', required: false })
  weight_min?: number;

  @ApiProperty({ description: 'Maximum weight in pounds', required: false })
  weight_max?: number;

  @ApiProperty({ description: 'Country of origin', required: false })
  origin_country?: string;

  @ApiProperty({ description: 'Detailed origin history and background of the breed', required: false })
  origin_history?: string;

  @ApiProperty({ description: 'Description of the breed', required: false })
  description?: string;

  @ApiProperty({ description: 'Educational resources and references about the breed', type: [String] })
  resources!: string[];

  @ApiProperty({ description: 'Grooming needs level', enum: GroomingNeeds, required: false })
  grooming_needs?: GroomingNeeds;

  @ApiProperty({ description: 'Exercise needs level', enum: ExerciseNeeds, required: false })
  exercise_needs?: ExerciseNeeds;

  @ApiProperty({ description: 'Whether the breed is active in the system' })
  is_active!: boolean;

  @ApiProperty({ description: 'Timestamp when the breed was created' })
  created_at!: Date;

  @ApiProperty({ description: 'Timestamp when the breed was last updated' })
  updated_at!: Date;
}

export class BreedsBySpeciesResponseDto {
  @ApiProperty({ description: 'Species name' })
  species!: string;

  @ApiProperty({ description: 'Array of breeds for this species', type: [BreedResponseDto] })
  breeds!: BreedResponseDto[];
}

export class AllBreedsResponseDto {
  @ApiProperty({ description: 'Array of breeds grouped by species', type: [BreedsBySpeciesResponseDto] })
  breeds_by_species!: BreedsBySpeciesResponseDto[];

  @ApiProperty({ description: 'Total number of breeds' })
  total_breeds!: number;

  @ApiProperty({ description: 'Total number of species' })
  total_species!: number;
}
