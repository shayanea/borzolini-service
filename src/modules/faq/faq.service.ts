import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { ElasticsearchService } from '../../common/elasticsearch.service';
import { PetSpecies } from '../breeds/entities/breed.entity';
import { FaqResponseDto, FaqsBySpeciesResponseDto, FaqSearchResponseDto, FaqAutocompleteResponseDto } from './dto/faq-response.dto';
import { AnimalFaq, FaqCategory } from './entities/faq.entity';

@Injectable()
export class FaqService {
  private readonly logger = new Logger(FaqService.name);

  constructor(
    @InjectRepository(AnimalFaq)
    private readonly faqRepository: Repository<AnimalFaq>,
    private readonly elasticsearchService: ElasticsearchService
  ) {}

  /**
   * Get all FAQs grouped by species
   */
  async getAllFaqs(): Promise<FaqsBySpeciesResponseDto[]> {
    this.logger.log('Fetching all FAQs grouped by species');

    const faqs = await this.faqRepository.find({
      where: { is_active: true },
      order: { species: 'ASC', order_index: 'ASC', created_at: 'ASC' },
    });

    // Group FAQs by species
    const faqsBySpecies = new Map<PetSpecies, FaqResponseDto[]>();

    faqs.forEach((faq) => {
      if (!faqsBySpecies.has(faq.species)) {
        faqsBySpecies.set(faq.species, []);
      }
      faqsBySpecies.get(faq.species)!.push(this.mapToResponseDto(faq));
    });

    // Convert to response format
    return Array.from(faqsBySpecies.entries()).map(([species, faqs]) => ({
      species,
      faqs,
    }));
  }

  /**
   * Get FAQs for a specific species
   */
  async getFaqsBySpecies(species: PetSpecies): Promise<FaqResponseDto[]> {
    this.logger.log(`Fetching FAQs for species: ${species}`);

    const faqs = await this.faqRepository.find({
      where: {
        species,
        is_active: true,
      },
      order: { order_index: 'ASC', created_at: 'ASC' },
    });

    return faqs.map((faq) => this.mapToResponseDto(faq));
  }

  /**
   * Get FAQs by category for a specific species
   */
  async getFaqsByCategory(species: PetSpecies, category: FaqCategory): Promise<FaqResponseDto[]> {
    this.logger.log(`Fetching FAQs for species: ${species}, category: ${category}`);

    const faqs = await this.faqRepository.find({
      where: {
        species,
        category,
        is_active: true,
      },
      order: { order_index: 'ASC', created_at: 'ASC' },
    });

    return faqs.map((faq) => this.mapToResponseDto(faq));
  }

  /**
   * Search FAQs by question or answer content (Database fallback)
   */
  async searchFaqs(query: string, species?: PetSpecies): Promise<FaqSearchResponseDto> {
    this.logger.log(`Searching FAQs with query: ${query}, species: ${species || 'all'}`);

    // Try Elasticsearch first, fallback to database
    if (this.elasticsearchService.isServiceEnabled()) {
      try {
        return await this.searchFaqsElasticsearch(query, species);
      } catch (error) {
        this.logger.warn('Elasticsearch search failed, falling back to database search', error);
      }
    }

    // Database fallback
    const searchConditions: any = {
      is_active: true,
      $or: [{ question: Like(`%${query}%`) }, { answer: Like(`%${query}%`) }],
    };

    if (species) {
      searchConditions.species = species;
    }

    const faqs = await this.faqRepository.find({
      where: searchConditions,
      order: { species: 'ASC', order_index: 'ASC' },
    });

    return {
      query,
      total: faqs.length,
      results: faqs.map((faq) => this.mapToResponseDto(faq)),
    };
  }

  /**
   * Search FAQs using Elasticsearch for better performance and relevance
   */
  async searchFaqsElasticsearch(query: string, species?: PetSpecies, size: number = 20): Promise<FaqSearchResponseDto> {
    this.logger.log(`Searching FAQs with Elasticsearch: ${query}, species: ${species || 'all'}`);

    const searchQuery = this.buildFaqSearchQuery(query, species, size);

    try {
      const response = await this.elasticsearchService.search(searchQuery);

      const results: FaqResponseDto[] = response.hits.hits.map((hit: any) => {
        const source = hit._source;
        return {
          id: hit._id,
          species: source.species,
          category: source.category,
          question: source.question,
          answer: source.answer,
          order_index: source.order_index,
          created_at: new Date(source.created_at),
          updated_at: new Date(source.updated_at),
        };
      });

      return {
        query,
        total: response.hits.total?.value || 0,
        took: response.took,
        max_score: response.hits.max_score,
        results,
      };
    } catch (error) {
      this.logger.error('Elasticsearch FAQ search failed', error);
      throw error;
    }
  }

  /**
   * Get autocomplete suggestions for FAQ search
   */
  async getAutocompleteSuggestions(query: string, species?: PetSpecies, size: number = 10): Promise<FaqAutocompleteResponseDto> {
    this.logger.log(`Getting autocomplete suggestions for: ${query}, species: ${species || 'all'}`);

    if (!this.elasticsearchService.isServiceEnabled()) {
      // Fallback to basic suggestions from database
      return this.getBasicAutocompleteSuggestions(query, species, size);
    }

    try {
      const searchQuery = this.buildAutocompleteQuery(query, species, size);
      const response = await this.elasticsearchService.search(searchQuery);

      const suggestions: any[] = [];

      // Process completion suggestions
      if (response.suggest?.question_completion?.[0]?.options) {
        suggestions.push(...response.suggest.question_completion[0].options.map((option: any) => ({
          text: option.text,
          score: option._score,
          frequency: option._source?.frequency || 1,
        })));
      }

      // Process phrase suggestions
      if (response.suggest?.question_phrase?.[0]?.options) {
        suggestions.push(...response.suggest.question_phrase[0].options.map((option: any) => ({
          text: option.text,
          score: option._score,
          frequency: option._source?.frequency || 1,
        })));
      }

      // Sort and deduplicate
      const uniqueSuggestions = this.deduplicateSuggestions(suggestions)
        .sort((a, b) => b.score - a.score)
        .slice(0, size);

      return {
        query,
        suggestions: uniqueSuggestions,
        total: uniqueSuggestions.length,
        species,
      };
    } catch (error) {
      this.logger.error('Elasticsearch autocomplete failed, falling back to basic suggestions', error);
      return this.getBasicAutocompleteSuggestions(query, species, size);
    }
  }

  /**
   * Index all FAQs in Elasticsearch
   */
  async indexAllFaqs(): Promise<void> {
    this.logger.log('Starting FAQ indexing in Elasticsearch');

    if (!this.elasticsearchService.isServiceEnabled()) {
      this.logger.warn('Elasticsearch is disabled, skipping FAQ indexing');
      return;
    }

    try {
      // Create FAQ index if it doesn't exist
      await this.createFaqIndex();

      // Get all active FAQs
      const faqs = await this.faqRepository.find({
        where: { is_active: true },
      });

      this.logger.log(`Indexing ${faqs.length} FAQs`);

      // Bulk index FAQs
      const bulkOperations = faqs.flatMap(faq => [
        {
          index: {
            _index: 'faqs',
            _id: faq.id,
          },
        },
        {
          id: faq.id,
          species: faq.species,
          category: faq.category,
          question: faq.question,
          answer: faq.answer,
          order_index: faq.order_index,
          is_active: faq.is_active,
          created_at: faq.created_at.toISOString(),
          updated_at: faq.updated_at.toISOString(),
          // Add searchable content
          searchable_content: `${faq.question} ${faq.answer}`.toLowerCase(),
        },
      ]);

      await this.elasticsearchService.bulk(bulkOperations);

      this.logger.log(`Successfully indexed ${faqs.length} FAQs`);
    } catch (error) {
      this.logger.error('Failed to index FAQs', error);
      throw error;
    }
  }

  /**
   * Index a single FAQ in Elasticsearch
   */
  async indexFaq(faq: AnimalFaq): Promise<void> {
    if (!this.elasticsearchService.isServiceEnabled()) {
      return;
    }

    try {
      await this.elasticsearchService.indexDocument({
        index: 'faqs',
        id: faq.id,
        document: {
          id: faq.id,
          species: faq.species,
          category: faq.category,
          question: faq.question,
          answer: faq.answer,
          order_index: faq.order_index,
          is_active: faq.is_active,
          created_at: faq.created_at.toISOString(),
          updated_at: faq.updated_at.toISOString(),
          searchable_content: `${faq.question} ${faq.answer}`.toLowerCase(),
        },
        refresh: true,
      });
    } catch (error) {
      this.logger.error(`Failed to index FAQ ${faq.id}`, error);
      throw error;
    }
  }

  /**
   * Remove FAQ from Elasticsearch index
   */
  async removeFaqFromIndex(faqId: string): Promise<void> {
    if (!this.elasticsearchService.isServiceEnabled()) {
      return;
    }

    try {
      await this.elasticsearchService.deleteDocument('faqs', faqId, true);
    } catch (error) {
      this.logger.error(`Failed to remove FAQ ${faqId} from index`, error);
      throw error;
    }
  }

  /**
   * Get a specific FAQ by ID
   */
  async getFaqById(id: string): Promise<FaqResponseDto> {
    this.logger.log(`Fetching FAQ with ID: ${id}`);

    const faq = await this.faqRepository.findOne({
      where: { id, is_active: true },
    });

    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }

    return this.mapToResponseDto(faq);
  }

  /**
   * Get FAQ statistics
   */
  async getFaqStats(): Promise<{
    total_faqs: number;
    faqs_by_species: Record<string, number>;
    faqs_by_category: Record<string, number>;
  }> {
    this.logger.log('Fetching FAQ statistics');

    const totalFaqs = await this.faqRepository.count({
      where: { is_active: true },
    });

    // Get counts by species
    const speciesCounts = await this.faqRepository.createQueryBuilder('faq').select('faq.species', 'species').addSelect('COUNT(*)', 'count').where('faq.is_active = :active', { active: true }).groupBy('faq.species').getRawMany();

    const faqsBySpecies = speciesCounts.reduce(
      (acc, item) => {
        acc[item.species] = parseInt(item.count);
        return acc;
      },
      {} as Record<string, number>
    );

    // Get counts by category
    const categoryCounts = await this.faqRepository.createQueryBuilder('faq').select('faq.category', 'category').addSelect('COUNT(*)', 'count').where('faq.is_active = :active', { active: true }).groupBy('faq.category').getRawMany();

    const faqsByCategory = categoryCounts.reduce(
      (acc, item) => {
        acc[item.category] = parseInt(item.count);
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      total_faqs: totalFaqs,
      faqs_by_species: faqsBySpecies,
      faqs_by_category: faqsByCategory,
    };
  }

  /**
   * Build Elasticsearch query for FAQ search
   */
  private buildFaqSearchQuery(query: string, species?: PetSpecies, size: number = 20): any {
    const must: any[] = [
      {
        bool: {
          should: [
            {
              match_phrase_prefix: {
                question: {
                  query,
                  boost: 3.0,
                },
              },
            },
            {
              match_phrase_prefix: {
                answer: {
                  query,
                  boost: 2.0,
                },
              },
            },
            {
              match: {
                searchable_content: {
                  query,
                  boost: 1.0,
                  fuzziness: 'AUTO',
                },
              },
            },
          ],
          minimum_should_match: 1,
        },
      },
      {
        term: {
          is_active: true,
        },
      },
    ];

    if (species) {
      must.push({
        term: {
          species: species,
        },
      });
    }

    return {
      index: 'faqs',
      query: {
        bool: {
          must,
        },
      },
      size,
      sort: [
        { _score: 'desc' },
        { order_index: 'asc' },
        { created_at: 'desc' },
      ],
      highlight: {
        fields: {
          question: {},
          answer: {},
        },
        pre_tags: ['<mark>'],
        post_tags: ['</mark>'],
      },
    };
  }

  /**
   * Build Elasticsearch query for autocomplete suggestions
   */
  private buildAutocompleteQuery(query: string, species?: PetSpecies, size: number = 10): any {
    const suggest: any = {
      question_completion: {
        prefix: query,
        completion: {
          field: 'question_completion',
          size,
          skip_duplicates: true,
        },
      },
      question_phrase: {
        text: query,
        phrase: {
          field: 'question',
          size,
          gram_size: 2,
          direct_generator: [
            {
              field: 'question',
              suggest_mode: 'always',
              min_word_length: 1,
            },
          ],
        },
      },
    };

    const queryFilters: any[] = [
      {
        term: {
          is_active: true,
        },
      },
    ];

    if (species) {
      queryFilters.push({
        term: {
          species: species,
        },
      });
    }

    return {
      index: 'faqs',
      query: {
        bool: {
          filter: queryFilters,
        },
      },
      size: 0, // We only need suggestions, not actual documents
      suggest,
    };
  }

  /**
   * Create FAQ index with proper mappings and settings
   */
  private async createFaqIndex(): Promise<void> {
    const indexName = 'faqs';

    // Check if index already exists
    const indexExists = await this.elasticsearchService.indexExists(indexName);
    if (indexExists) {
      this.logger.log(`FAQ index '${indexName}' already exists`);
      return;
    }

    const indexSettings = {
      number_of_shards: 1,
      number_of_replicas: 0,
      analysis: {
        analyzer: {
          faq_analyzer: {
            type: 'custom',
            tokenizer: 'standard',
            filter: ['lowercase', 'stop', 'porter_stem'],
          },
          autocomplete_analyzer: {
            type: 'custom',
            tokenizer: 'autocomplete_tokenizer',
            filter: ['lowercase'],
          },
        },
        filter: {
          autocomplete_filter: {
            type: 'edge_ngram',
            min_gram: 2,
            max_gram: 20,
          },
        },
        tokenizer: {
          autocomplete_tokenizer: {
            type: 'edge_ngram',
            min_gram: 2,
            max_gram: 20,
            token_chars: ['letter', 'digit'],
          },
        },
      },
    };

    const mappings = {
      properties: {
        id: {
          type: 'keyword',
        },
        species: {
          type: 'keyword',
        },
        category: {
          type: 'keyword',
        },
        question: {
          type: 'text',
          analyzer: 'faq_analyzer',
          fields: {
            keyword: {
              type: 'keyword',
            },
            completion: {
              type: 'completion',
              analyzer: 'autocomplete_analyzer',
            },
          },
        },
        answer: {
          type: 'text',
          analyzer: 'faq_analyzer',
        },
        searchable_content: {
          type: 'text',
          analyzer: 'faq_analyzer',
        },
        order_index: {
          type: 'integer',
        },
        is_active: {
          type: 'boolean',
        },
        created_at: {
          type: 'date',
        },
        updated_at: {
          type: 'date',
        },
      },
    };

    await this.elasticsearchService.createIndex(indexName, mappings, indexSettings);

    this.logger.log(`Created FAQ index '${indexName}'`);
  }

  /**
   * Get basic autocomplete suggestions from database
   */
  private async getBasicAutocompleteSuggestions(query: string, species?: PetSpecies, size: number = 10): Promise<FaqAutocompleteResponseDto> {
    try {
      const searchConditions: any = {
        is_active: true,
        question: Like(`${query}%`),
      };

      if (species) {
        searchConditions.species = species;
      }

      const faqs = await this.faqRepository.find({
        where: searchConditions,
        select: ['question'],
        order: { question: 'ASC' },
        take: size,
      });

      const suggestions = faqs.map((faq, index) => ({
        text: faq.question,
        score: 1.0 - (index * 0.1), // Decreasing score for each suggestion
        frequency: 1,
      }));

      return {
        query,
        suggestions,
        total: suggestions.length,
        species,
      };
    } catch (error) {
      this.logger.error('Basic autocomplete failed', error);
      return {
        query,
        suggestions: [],
        total: 0,
        species,
      };
    }
  }

  /**
   * Deduplicate suggestions and keep highest scores
   */
  private deduplicateSuggestions(suggestions: any[]): any[] {
    const seen = new Map<string, any>();

    for (const suggestion of suggestions) {
      const key = suggestion.text.toLowerCase().trim();
      if (!seen.has(key) || seen.get(key).score < suggestion.score) {
        seen.set(key, suggestion);
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponseDto(faq: AnimalFaq): FaqResponseDto {
    const dto: FaqResponseDto = {
      id: faq.id,
      species: faq.species,
      category: faq.category,
      question: faq.question,
      answer: faq.answer,
      created_at: faq.created_at,
      updated_at: faq.updated_at,
    };

    // Handle optional order_index
    if (faq.order_index !== null && faq.order_index !== undefined) {
      dto.order_index = faq.order_index;
    }

    return dto;
  }
}
