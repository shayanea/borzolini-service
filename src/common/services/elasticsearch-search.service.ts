import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService, SearchQuery } from '../elasticsearch.service';

export interface SearchFilters {
  clinicId?: string;
  userId?: string;
  petId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: string[];
  tags?: string[];
  priority?: string[];
}

export interface SearchOptions {
  size?: number;
  from?: number;
  sort?: Array<{ [key: string]: 'asc' | 'desc' }>;
  highlight?: boolean;
  aggregations?: boolean;
}

export interface SearchResult<T = any> {
  hits: T[];
  total: number;
  aggregations?: any;
  suggestions?: string[];
}

@Injectable()
export class ElasticsearchSearchService {
  private readonly logger = new Logger(ElasticsearchSearchService.name);

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  /**
   * Search pets with filters
   */
  async searchPets(
    query: string,
    filters: SearchFilters = {},
    options: SearchOptions = {}
  ): Promise<SearchResult> {
    if (!this.elasticsearchService.isServiceEnabled()) {
      throw new Error('Elasticsearch is disabled');
    }

    const searchQuery = this.buildPetsSearchQuery(query, filters, options);
    const result = await this.elasticsearchService.search(searchQuery);

    return this.formatSearchResult(result);
  }

  /**
   * Search appointments with filters
   */
  async searchAppointments(
    query: string,
    filters: SearchFilters = {},
    options: SearchOptions = {}
  ): Promise<SearchResult> {
    if (!this.elasticsearchService.isServiceEnabled()) {
      throw new Error('Elasticsearch is disabled');
    }

    const searchQuery = this.buildAppointmentsSearchQuery(query, filters, options);
    const result = await this.elasticsearchService.search(searchQuery);

    return this.formatSearchResult(result);
  }

  /**
   * Search users with filters
   */
  async searchUsers(
    query: string,
    filters: SearchFilters = {},
    options: SearchOptions = {}
  ): Promise<SearchResult> {
    if (!this.elasticsearchService.isServiceEnabled()) {
      throw new Error('Elasticsearch is disabled');
    }

    const searchQuery = this.buildUsersSearchQuery(query, filters, options);
    const result = await this.elasticsearchService.search(searchQuery);

    return this.formatSearchResult(result);
  }

  /**
   * Search clinics with filters
   */
  async searchClinics(
    query: string,
    filters: SearchFilters = {},
    options: SearchOptions = {}
  ): Promise<SearchResult> {
    if (!this.elasticsearchService.isServiceEnabled()) {
      throw new Error('Elasticsearch is disabled');
    }

    const searchQuery = this.buildClinicsSearchQuery(query, filters, options);
    const result = await this.elasticsearchService.search(searchQuery);

    return this.formatSearchResult(result);
  }

  /**
   * Search health records with filters
   */
  async searchHealthRecords(
    query: string,
    filters: SearchFilters = {},
    options: SearchOptions = {}
  ): Promise<SearchResult> {
    if (!this.elasticsearchService.isServiceEnabled()) {
      throw new Error('Elasticsearch is disabled');
    }

    const searchQuery = this.buildHealthRecordsSearchQuery(query, filters, options);
    const result = await this.elasticsearchService.search(searchQuery);

    return this.formatSearchResult(result);
  }

  /**
   * Global search across all indices
   */
  async globalSearch(
    query: string,
    filters: SearchFilters = {},
    options: SearchOptions = {}
  ): Promise<{
    pets: SearchResult;
    appointments: SearchResult;
    users: SearchResult;
    clinics: SearchResult;
    healthRecords: SearchResult;
  }> {
    if (!this.elasticsearchService.isServiceEnabled()) {
      throw new Error('Elasticsearch is disabled');
    }

    const [pets, appointments, users, clinics, healthRecords] = await Promise.all([
      this.searchPets(query, filters, { ...options, size: Math.min(options.size || 10, 5) }),
      this.searchAppointments(query, filters, { ...options, size: Math.min(options.size || 10, 5) }),
      this.searchUsers(query, filters, { ...options, size: Math.min(options.size || 10, 5) }),
      this.searchClinics(query, filters, { ...options, size: Math.min(options.size || 10, 5) }),
      this.searchHealthRecords(query, filters, { ...options, size: Math.min(options.size || 10, 5) }),
    ]);

    return {
      pets,
      appointments,
      users,
      clinics,
      healthRecords,
    };
  }

  /**
   * Build search query for pets
   */
  private buildPetsSearchQuery(
    query: string,
    filters: SearchFilters,
    options: SearchOptions
  ): SearchQuery {
    const must: any[] = [];
    const filter: any[] = [];

    // Text search
    if (query) {
      must.push({
        multi_match: {
          query,
          fields: ['name.search^2', 'breed.search', 'description.search', 'species'],
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      });
    }

    // Filters
    if (filters.clinicId) {
      filter.push({ term: { clinicId: filters.clinicId } });
    }

    if (filters.userId) {
      filter.push({ term: { ownerId: filters.userId } });
    }

    if (filters.status && filters.status.length > 0) {
      filter.push({ terms: { status: filters.status } });
    }

    if (filters.tags && filters.tags.length > 0) {
      filter.push({ terms: { tags: filters.tags } });
    }

    const searchQuery: SearchQuery = {
      index: 'pets',
      query: {
        bool: {
          must,
          filter,
        },
      },
      size: options.size || 10,
      from: options.from || 0,
    };

    // Sorting
    if (options.sort) {
      searchQuery.sort = options.sort;
    } else {
      searchQuery.sort = [{ createdAt: 'desc' }];
    }

    // Highlighting
    if (options.highlight) {
      searchQuery.highlight = {
        fields: {
          name: {},
          breed: {},
          description: {},
        },
        pre_tags: ['<mark>'],
        post_tags: ['</mark>'],
      };
    }

    // Aggregations
    if (options.aggregations) {
      searchQuery.aggs = {
        species: { terms: { field: 'species' } },
        status: { terms: { field: 'status' } },
        tags: { terms: { field: 'tags' } },
        age_ranges: {
          range: {
            field: 'age',
            ranges: [
              { from: 0, to: 1 },
              { from: 1, to: 5 },
              { from: 5, to: 10 },
              { from: 10 },
            ],
          },
        },
      };
    }

    return searchQuery;
  }

  /**
   * Build search query for appointments
   */
  private buildAppointmentsSearchQuery(
    query: string,
    filters: SearchFilters,
    options: SearchOptions
  ): SearchQuery {
    const must: any[] = [];
    const filter: any[] = [];

    // Text search
    if (query) {
      must.push({
        multi_match: {
          query,
          fields: ['reason.search^2', 'notes.search', 'type'],
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      });
    }

    // Filters
    if (filters.clinicId) {
      filter.push({ term: { clinicId: filters.clinicId } });
    }

    if (filters.userId) {
      filter.push({ term: { ownerId: filters.userId } });
    }

    if (filters.petId) {
      filter.push({ term: { petId: filters.petId } });
    }

    if (filters.status && filters.status.length > 0) {
      filter.push({ terms: { status: filters.status } });
    }

    if (filters.priority && filters.priority.length > 0) {
      filter.push({ terms: { priority: filters.priority } });
    }

    if (filters.dateRange) {
      filter.push({
        range: {
          appointmentDate: {
            gte: filters.dateRange.start.toISOString(),
            lte: filters.dateRange.end.toISOString(),
          },
        },
      });
    }

    const searchQuery: SearchQuery = {
      index: 'appointments',
      query: {
        bool: {
          must,
          filter,
        },
      },
      size: options.size || 10,
      from: options.from || 0,
    };

    // Sorting
    if (options.sort) {
      searchQuery.sort = options.sort;
    } else {
      searchQuery.sort = [{ appointmentDate: 'asc' }];
    }

    // Highlighting
    if (options.highlight) {
      searchQuery.highlight = {
        fields: {
          reason: {},
          notes: {},
        },
        pre_tags: ['<mark>'],
        post_tags: ['</mark>'],
      };
    }

    // Aggregations
    if (options.aggregations) {
      searchQuery.aggs = {
        status: { terms: { field: 'status' } },
        type: { terms: { field: 'type' } },
        priority: { terms: { field: 'priority' } },
        date_histogram: {
          date_histogram: {
            field: 'appointmentDate',
            calendar_interval: 'day',
          },
        },
      };
    }

    return searchQuery;
  }

  /**
   * Build search query for users
   */
  private buildUsersSearchQuery(
    query: string,
    filters: SearchFilters,
    options: SearchOptions
  ): SearchQuery {
    const must: any[] = [];
    const filter: any[] = [];

    // Text search
    if (query) {
      must.push({
        multi_match: {
          query,
          fields: ['firstName.search^2', 'lastName.search^2', 'fullName.search', 'email'],
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      });
    }

    // Filters
    if (filters.clinicId) {
      filter.push({ term: { clinicId: filters.clinicId } });
    }

    if (filters.status && filters.status.length > 0) {
      filter.push({ terms: { status: filters.status } });
    }

    const searchQuery: SearchQuery = {
      index: 'users',
      query: {
        bool: {
          must,
          filter,
        },
      },
      size: options.size || 10,
      from: options.from || 0,
    };

    // Sorting
    if (options.sort) {
      searchQuery.sort = options.sort;
    } else {
      searchQuery.sort = [{ createdAt: 'desc' }];
    }

    // Highlighting
    if (options.highlight) {
      searchQuery.highlight = {
        fields: {
          firstName: {},
          lastName: {},
          fullName: {},
        },
        pre_tags: ['<mark>'],
        post_tags: ['</mark>'],
      };
    }

    // Aggregations
    if (options.aggregations) {
      searchQuery.aggs = {
        role: { terms: { field: 'role' } },
        status: { terms: { field: 'status' } },
      };
    }

    return searchQuery;
  }

  /**
   * Build search query for clinics
   */
  private buildClinicsSearchQuery(
    query: string,
    filters: SearchFilters,
    options: SearchOptions
  ): SearchQuery {
    const must: any[] = [];
    const filter: any[] = [];

    // Text search
    if (query) {
      must.push({
        multi_match: {
          query,
          fields: ['name.search^2', 'description.search', 'services', 'specialties'],
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      });
    }

    // Filters
    if (filters.status && filters.status.length > 0) {
      filter.push({ terms: { status: filters.status } });
    }

    if (filters.tags && filters.tags.length > 0) {
      filter.push({ terms: { tags: filters.tags } });
    }

    const searchQuery: SearchQuery = {
      index: 'clinics',
      query: {
        bool: {
          must,
          filter,
        },
      },
      size: options.size || 10,
      from: options.from || 0,
    };

    // Sorting
    if (options.sort) {
      searchQuery.sort = options.sort;
    } else {
      searchQuery.sort = [{ rating: 'desc' }, { name: 'asc' }];
    }

    // Highlighting
    if (options.highlight) {
      searchQuery.highlight = {
        fields: {
          name: {},
          description: {},
        },
        pre_tags: ['<mark>'],
        post_tags: ['</mark>'],
      };
    }

    // Aggregations
    if (options.aggregations) {
      searchQuery.aggs = {
        services: { terms: { field: 'services' } },
        specialties: { terms: { field: 'specialties' } },
        status: { terms: { field: 'status' } },
        rating_ranges: {
          range: {
            field: 'rating',
            ranges: [
              { from: 0, to: 3 },
              { from: 3, to: 4 },
              { from: 4, to: 5 },
            ],
          },
        },
      };
    }

    return searchQuery;
  }

  /**
   * Build search query for health records
   */
  private buildHealthRecordsSearchQuery(
    query: string,
    filters: SearchFilters,
    options: SearchOptions
  ): SearchQuery {
    const must: any[] = [];
    const filter: any[] = [];

    // Text search
    if (query) {
      must.push({
        multi_match: {
          query,
          fields: ['title.search^2', 'description.search', 'symptoms.search', 'diagnosis.search', 'treatment.search'],
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      });
    }

    // Filters
    if (filters.clinicId) {
      filter.push({ term: { clinicId: filters.clinicId } });
    }

    if (filters.petId) {
      filter.push({ term: { petId: filters.petId } });
    }

    if (filters.userId) {
      filter.push({ term: { veterinarianId: filters.userId } });
    }

    if (filters.status && filters.status.length > 0) {
      filter.push({ terms: { status: filters.status } });
    }

    if (filters.tags && filters.tags.length > 0) {
      filter.push({ terms: { tags: filters.tags } });
    }

    if (filters.dateRange) {
      filter.push({
        range: {
          recordDate: {
            gte: filters.dateRange.start.toISOString(),
            lte: filters.dateRange.end.toISOString(),
          },
        },
      });
    }

    const searchQuery: SearchQuery = {
      index: 'health-records',
      query: {
        bool: {
          must,
          filter,
        },
      },
      size: options.size || 10,
      from: options.from || 0,
    };

    // Sorting
    if (options.sort) {
      searchQuery.sort = options.sort;
    } else {
      searchQuery.sort = [{ recordDate: 'desc' }];
    }

    // Highlighting
    if (options.highlight) {
      searchQuery.highlight = {
        fields: {
          title: {},
          description: {},
          symptoms: {},
          diagnosis: {},
          treatment: {},
        },
        pre_tags: ['<mark>'],
        post_tags: ['</mark>'],
      };
    }

    // Aggregations
    if (options.aggregations) {
      searchQuery.aggs = {
        recordType: { terms: { field: 'recordType' } },
        severity: { terms: { field: 'severity' } },
        tags: { terms: { field: 'tags' } },
        date_histogram: {
          date_histogram: {
            field: 'recordDate',
            calendar_interval: 'month',
          },
        },
      };
    }

    return searchQuery;
  }

  /**
   * Format search results
   */
  private formatSearchResult(result: any): SearchResult {
    const hits = result.hits?.hits?.map((hit: any) => ({
      ...hit._source,
      _score: hit._score,
      _id: hit._id,
      highlight: hit.highlight,
    })) || [];

    const total = result.hits?.total?.value || result.hits?.total || 0;

    return {
      hits,
      total,
      aggregations: result.aggregations,
    };
  }

  /**
   * Get search suggestions
   */
  async getSearchSuggestions(query: string, index: string): Promise<string[]> {
    if (!this.elasticsearchService.isServiceEnabled()) {
      return [];
    }

    try {
      const searchQuery: SearchQuery = {
        index,
        query: {
          multi_match: {
            query,
            fields: ['name', 'title', 'firstName', 'lastName'],
            type: 'phrase_prefix',
          },
        },
        size: 5,
      };

      const result = await this.elasticsearchService.search(searchQuery);
      const suggestions = result.hits?.hits?.map((hit: any) => 
        hit._source.name || hit._source.title || hit._source.firstName || hit._source.lastName
      ).filter(Boolean) || [];

      return [...new Set(suggestions as string[])];
    } catch (error) {
      this.logger.error('Failed to get search suggestions', error);
      return [];
    }
  }
}
