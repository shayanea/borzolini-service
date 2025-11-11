import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ExerciseNeeds, GroomingNeeds, PetSize, PetSpecies } from '../entities/breed.entity';

export class CreateBreedDto {
  @ApiProperty({ description: 'Name of the breed', example: 'Golden Retriever' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Species of the breed', enum: PetSpecies, example: PetSpecies.DOG })
  @IsEnum(PetSpecies)
  species!: PetSpecies;

  @ApiProperty({ description: 'Size category of the breed', enum: PetSize, required: false, example: PetSize.LARGE })
  @IsOptional()
  @IsEnum(PetSize)
  size_category?: PetSize;

  @ApiProperty({ description: 'Temperament and personality traits', required: false, example: 'Friendly, intelligent, and devoted' })
  @IsOptional()
  @IsString()
  temperament?: string;

  @ApiProperty({ description: 'Common health risks for this breed', required: false, example: ['Hip dysplasia', 'Elbow dysplasia'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  health_risks?: string[];

  @ApiProperty({ description: 'Minimum life expectancy in years', required: false, example: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  life_expectancy_min?: number;

  @ApiProperty({ description: 'Maximum life expectancy in years', required: false, example: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  life_expectancy_max?: number;

  @ApiProperty({ description: 'Minimum weight in pounds', required: false, example: 55 })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(1000)
  weight_min?: number;

  @ApiProperty({ description: 'Maximum weight in pounds', required: false, example: 75 })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(1000)
  weight_max?: number;

  @ApiProperty({ description: 'Country of origin', required: false, example: 'Scotland' })
  @IsOptional()
  @IsString()
  origin_country?: string;

  @ApiProperty({ description: 'Detailed origin history and background of the breed', required: false, example: 'The Golden Retriever was developed in Scotland in the mid-19th century by Lord Tweedmouth...' })
  @IsOptional()
  @IsString()
  origin_history?: string;

  @ApiProperty({ description: 'Description of the breed', required: false, example: 'A medium-large gun dog that was bred to retrieve shot waterfowl' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Educational resources and references about the breed', type: [String], required: false, example: ['https://www.akc.org/dog-breeds/golden-retriever/', 'https://www.ofa.org/breeds/golden-retrievers'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resources?: string[];

  @ApiProperty({ description: 'Grooming needs level', enum: GroomingNeeds, required: false, example: GroomingNeeds.MODERATE })
  @IsOptional()
  @IsEnum(GroomingNeeds)
  grooming_needs?: GroomingNeeds;

  @ApiProperty({ description: 'Exercise needs level', enum: ExerciseNeeds, required: false, example: ExerciseNeeds.HIGH })
  @IsOptional()
  @IsEnum(ExerciseNeeds)
  exercise_needs?: ExerciseNeeds;

  @ApiProperty({ description: 'Whether the breed is active in the system', required: false, example: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
