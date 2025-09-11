import { ApiProperty } from '@nestjs/swagger';
import { PetSpecies } from '../../breeds/entities/breed.entity';
import { FaqCategory } from '../entities/faq.entity';

export class FaqResponseDto {
  @ApiProperty({ description: 'Unique identifier for the FAQ' })
  id!: string;

  @ApiProperty({ description: 'Animal species this FAQ applies to', enum: PetSpecies })
  species!: PetSpecies;

  @ApiProperty({ description: 'Category of the FAQ', enum: FaqCategory })
  category!: FaqCategory;

  @ApiProperty({ description: 'Optional breed this FAQ targets', required: false })
  breed_id?: string;

  @ApiProperty({ description: 'The question being answered' })
  question!: string;

  @ApiProperty({ description: 'The answer to the question' })
  answer!: string;

  @ApiProperty({ description: 'Order index for display purposes', required: false })
  order_index?: number;

  @ApiProperty({ description: 'When this FAQ was created' })
  created_at!: Date;

  @ApiProperty({ description: 'When this FAQ was last updated' })
  updated_at!: Date;
}

export class FaqsBySpeciesResponseDto {
  @ApiProperty({ description: 'Animal species', enum: PetSpecies })
  species!: PetSpecies;

  @ApiProperty({ description: 'List of FAQs for this species', type: [FaqResponseDto] })
  faqs!: FaqResponseDto[];
}

export class FaqSearchResponseDto {
  @ApiProperty({ description: 'Search query used' })
  query!: string;

  @ApiProperty({ description: 'Total number of results found' })
  total!: number;

  @ApiProperty({ description: 'List of matching FAQs', type: [FaqResponseDto] })
  results!: FaqResponseDto[];

  @ApiProperty({ description: 'Search took this many milliseconds', required: false })
  took?: number;

  @ApiProperty({ description: 'Maximum score from search results', required: false })
  max_score?: number;
}

export class FaqAutocompleteSuggestionDto {
  @ApiProperty({ description: 'Suggested text' })
  text!: string;

  @ApiProperty({ description: 'Score of the suggestion' })
  score!: number;

  @ApiProperty({ description: 'Frequency of the suggestion', required: false })
  frequency?: number;
}

export class FaqAutocompleteResponseDto {
  @ApiProperty({ description: 'Original query' })
  query!: string;

  @ApiProperty({ description: 'List of autocomplete suggestions' })
  suggestions!: FaqAutocompleteSuggestionDto[];

  @ApiProperty({ description: 'Total number of suggestions' })
  total!: number;

  @ApiProperty({ description: 'Species filter used', required: false })
  species?: PetSpecies | undefined;
}
