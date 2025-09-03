import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { PetSpecies } from '../breeds/entities/breed.entity';
import { FaqResponseDto, FaqsBySpeciesResponseDto, FaqSearchResponseDto } from './dto/faq-response.dto';
import { AnimalFaq, FaqCategory } from './entities/faq.entity';

@Injectable()
export class FaqService {
  private readonly logger = new Logger(FaqService.name);

  constructor(
    @InjectRepository(AnimalFaq)
    private readonly faqRepository: Repository<AnimalFaq>
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
   * Search FAQs by question or answer content
   */
  async searchFaqs(query: string, species?: PetSpecies): Promise<FaqSearchResponseDto> {
    this.logger.log(`Searching FAQs with query: ${query}, species: ${species || 'all'}`);

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
