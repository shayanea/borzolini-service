import { Controller, Get, Param, Post, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { PetSpecies } from '../breeds/entities/breed.entity';
import { FaqResponseDto, FaqsBySpeciesResponseDto, FaqSearchResponseDto, FaqAutocompleteResponseDto } from './dto/faq-response.dto';
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

  @Get('autocomplete/suggestions')
  @ApiOperation({ summary: 'Get autocomplete suggestions for FAQ search' })
  @ApiQuery({
    name: 'q',
    description: 'Search query for autocomplete suggestions',
    required: true,
  })
  @ApiQuery({
    name: 'species',
    enum: PetSpecies,
    description: 'Optional species filter',
    required: false,
  })
  @ApiQuery({
    name: 'size',
    description: 'Maximum number of suggestions to return',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved autocomplete suggestions',
    type: FaqAutocompleteResponseDto,
  })
  async getAutocompleteSuggestions(
    @Query('q') query: string,
    @Query('species') species?: PetSpecies,
    @Query('size', ParseIntPipe) size: number = 10
  ): Promise<FaqAutocompleteResponseDto> {
    return this.faqService.getAutocompleteSuggestions(query, species, size);
  }

  @Post('elasticsearch/index-all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Index all FAQs in Elasticsearch (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Successfully indexed all FAQs in Elasticsearch',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async indexAllFaqs(): Promise<{ message: string; indexed_count: number }> {
    await this.faqService.indexAllFaqs();
    const stats = await this.faqService.getFaqStats();
    return {
      message: 'Successfully indexed all FAQs in Elasticsearch',
      indexed_count: stats.total_faqs,
    };
  }

  @Post('elasticsearch/index/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Index a specific FAQ in Elasticsearch (Admin only)' })
  @ApiParam({ name: 'id', description: 'FAQ ID to index' })
  @ApiResponse({
    status: 200,
    description: 'Successfully indexed FAQ in Elasticsearch',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'FAQ not found',
  })
  async indexFaq(@Param('id') id: string): Promise<{ message: string }> {
    const faq = await this.faqService.getFaqById(id);
    await this.faqService.indexFaq(faq as any);
    return {
      message: `Successfully indexed FAQ "${faq.question}" in Elasticsearch`,
    };
  }
}
