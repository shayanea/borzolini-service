import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PetSpecies } from '../breeds/entities/breed.entity';
import { FaqResponseDto, FaqsBySpeciesResponseDto, FaqSearchResponseDto } from './dto/faq-response.dto';
import { FaqCategory } from './entities/faq.entity';
import { FaqService } from './faq.service';

@ApiTags('FAQ')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Get()
  @ApiOperation({ summary: 'Get all FAQs grouped by species' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all FAQs',
    type: [FaqsBySpeciesResponseDto],
  })
  async getAllFaqs(): Promise<FaqsBySpeciesResponseDto[]> {
    return this.faqService.getAllFaqs();
  }

  @Get('species/:species')
  @ApiOperation({ summary: 'Get FAQs for a specific species' })
  @ApiParam({
    name: 'species',
    enum: PetSpecies,
    description: 'Animal species to get FAQs for',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved FAQs for the species',
    type: [FaqResponseDto],
  })
  async getFaqsBySpecies(@Param('species') species: PetSpecies): Promise<FaqResponseDto[]> {
    return this.faqService.getFaqsBySpecies(species);
  }

  @Get('species/:species/category/:category')
  @ApiOperation({ summary: 'Get FAQs by category for a specific species' })
  @ApiParam({
    name: 'species',
    enum: PetSpecies,
    description: 'Animal species to get FAQs for',
  })
  @ApiParam({
    name: 'category',
    enum: FaqCategory,
    description: 'FAQ category to filter by',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved FAQs for the species and category',
    type: [FaqResponseDto],
  })
  async getFaqsByCategory(@Param('species') species: PetSpecies, @Param('category') category: FaqCategory): Promise<FaqResponseDto[]> {
    return this.faqService.getFaqsByCategory(species, category);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search FAQs by question or answer content' })
  @ApiQuery({
    name: 'q',
    description: 'Search query',
    required: true,
  })
  @ApiQuery({
    name: 'species',
    enum: PetSpecies,
    description: 'Optional species filter',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully searched FAQs',
    type: FaqSearchResponseDto,
  })
  async searchFaqs(@Query('q') query: string, @Query('species') species?: PetSpecies): Promise<FaqSearchResponseDto> {
    return this.faqService.searchFaqs(query, species);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get FAQ statistics' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved FAQ statistics',
    schema: {
      type: 'object',
      properties: {
        total_faqs: { type: 'number' },
        faqs_by_species: { type: 'object' },
        faqs_by_category: { type: 'object' },
      },
    },
  })
  async getFaqStats(): Promise<{
    total_faqs: number;
    faqs_by_species: Record<string, number>;
    faqs_by_category: Record<string, number>;
  }> {
    return this.faqService.getFaqStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific FAQ by ID' })
  @ApiParam({
    name: 'id',
    description: 'FAQ ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the FAQ',
    type: FaqResponseDto,
  })
  async getFaqById(@Param('id') id: string): Promise<FaqResponseDto> {
    return this.faqService.getFaqById(id);
  }
}
