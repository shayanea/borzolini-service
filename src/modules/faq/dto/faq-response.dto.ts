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
}
