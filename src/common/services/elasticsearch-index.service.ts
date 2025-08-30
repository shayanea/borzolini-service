import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '../elasticsearch.service';

export interface IndexMapping {
  properties: Record<string, any>;
  dynamic?: boolean | 'strict' | 'runtime';
}

export interface IndexSettings {
  number_of_shards?: number;
  number_of_replicas?: number;
  refresh_interval?: string;
  analysis?: {
    analyzer?: Record<string, any>;
    filter?: Record<string, any>;
    tokenizer?: Record<string, any>;
  };
}

export interface IndexTemplate {
  index_patterns: string[];
  template: {
    settings?: IndexSettings;
    mappings?: IndexMapping;
    aliases?: Record<string, any>;
  };
  priority?: number;
  version?: number;
}

@Injectable()
export class ElasticsearchIndexService {
  private readonly logger = new Logger(ElasticsearchIndexService.name);

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  /**
   * Create clinic-related indices with proper mappings
   */
  async createClinicIndices(): Promise<void> {
    if (!this.elasticsearchService.isServiceEnabled()) {
      this.logger.warn('Elasticsearch is disabled, skipping index creation');
      return;
    }

    try {
      // Create pets index
      await this.createPetsIndex();
      
      // Create appointments index
      await this.createAppointmentsIndex();
      
      // Create users index
      await this.createUsersIndex();
      
      // Create clinics index
      await this.createClinicsIndex();
      
      // Create health records index
      await this.createHealthRecordsIndex();
      
      this.logger.log('All clinic indices created successfully');
    } catch (error) {
      this.logger.error('Failed to create clinic indices', error);
      throw error;
    }
  }

  /**
   * Create pets index with proper mapping
   */
  private async createPetsIndex(): Promise<void> {
    const indexName = 'pets';
    
    if (await this.elasticsearchService.indexExists(indexName)) {
      this.logger.log(`Index ${indexName} already exists`);
      return;
    }

    const mappings: IndexMapping = {
      dynamic: 'strict',
      properties: {
        id: { type: 'keyword' },
        name: { 
          type: 'text',
          analyzer: 'standard',
          fields: {
            keyword: { type: 'keyword' },
            search: { type: 'text', analyzer: 'english' }
          }
        },
        species: { type: 'keyword' },
        breed: { 
          type: 'text',
          analyzer: 'standard',
          fields: {
            keyword: { type: 'keyword' }
          }
        },
        age: { type: 'integer' },
        weight: { type: 'float' },
        ownerId: { type: 'keyword' },
        clinicId: { type: 'keyword' },
        status: { type: 'keyword' },
        tags: { type: 'keyword' },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' },
        description: { 
          type: 'text',
          analyzer: 'english',
          fields: {
            keyword: { type: 'keyword' }
          }
        }
      }
    };

    const settings: IndexSettings = {
      number_of_shards: 1,
      number_of_replicas: 0,
      refresh_interval: '1s',
      analysis: {
        analyzer: {
          english: {
            type: 'standard',
            stopwords: '_english_'
          }
        }
      }
    };

    await this.elasticsearchService.createIndex(indexName, mappings, settings);
  }

  /**
   * Create appointments index with proper mapping
   */
  private async createAppointmentsIndex(): Promise<void> {
    const indexName = 'appointments';
    
    if (await this.elasticsearchService.indexExists(indexName)) {
      this.logger.log(`Index ${indexName} already exists`);
      return;
    }

    const mappings: IndexMapping = {
      dynamic: 'strict',
      properties: {
        id: { type: 'keyword' },
        petId: { type: 'keyword' },
        ownerId: { type: 'keyword' },
        clinicId: { type: 'keyword' },
        veterinarianId: { type: 'keyword' },
        appointmentDate: { type: 'date' },
        startTime: { type: 'date' },
        endTime: { type: 'date' },
        duration: { type: 'integer' },
        type: { type: 'keyword' },
        status: { type: 'keyword' },
        reason: { 
          type: 'text',
          analyzer: 'english',
          fields: {
            keyword: { type: 'keyword' }
          }
        },
        notes: { 
          type: 'text',
          analyzer: 'english'
        },
        priority: { type: 'keyword' },
        tags: { type: 'keyword' },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' }
      }
    };

    const settings: IndexSettings = {
      number_of_shards: 1,
      number_of_replicas: 0,
      refresh_interval: '1s'
    };

    await this.elasticsearchService.createIndex(indexName, mappings, settings);
  }

  /**
   * Create users index with proper mapping
   */
  private async createUsersIndex(): Promise<void> {
    const indexName = 'users';
    
    if (await this.elasticsearchService.indexExists(indexName)) {
      this.logger.log(`Index ${indexName} already exists`);
      return;
    }

    const mappings: IndexMapping = {
      dynamic: 'strict',
      properties: {
        id: { type: 'keyword' },
        email: { type: 'keyword' },
        firstName: { 
          type: 'text',
          analyzer: 'standard',
          fields: {
            keyword: { type: 'keyword' },
            search: { type: 'text', analyzer: 'english' }
          }
        },
        lastName: { 
          type: 'text',
          analyzer: 'standard',
          fields: {
            keyword: { type: 'keyword' },
            search: { type: 'text', analyzer: 'english' }
          }
        },
        fullName: { 
          type: 'text',
          analyzer: 'english',
          fields: {
            keyword: { type: 'keyword' }
          }
        },
        phone: { type: 'keyword' },
        role: { type: 'keyword' },
        clinicId: { type: 'keyword' },
        status: { type: 'keyword' },
        lastLoginAt: { type: 'date' },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' }
      }
    };

    const settings: IndexSettings = {
      number_of_shards: 1,
      number_of_replicas: 0,
      refresh_interval: '1s'
    };

    await this.elasticsearchService.createIndex(indexName, mappings, settings);
  }

  /**
   * Create clinics index with proper mapping
   */
  private async createClinicsIndex(): Promise<void> {
    const indexName = 'clinics';
    
    if (await this.elasticsearchService.indexExists(indexName)) {
      this.logger.log(`Index ${indexName} already exists`);
      return;
    }

    const mappings: IndexMapping = {
      dynamic: 'strict',
      properties: {
        id: { type: 'keyword' },
        name: { 
          type: 'text',
          analyzer: 'standard',
          fields: {
            keyword: { type: 'keyword' },
            search: { type: 'text', analyzer: 'english' }
          }
        },
        description: { 
          type: 'text',
          analyzer: 'english'
        },
        address: {
          properties: {
            street: { type: 'text' },
            city: { type: 'keyword' },
            state: { type: 'keyword' },
            zipCode: { type: 'keyword' },
            country: { type: 'keyword' }
          }
        },
        location: { type: 'geo_point' },
        phone: { type: 'keyword' },
        email: { type: 'keyword' },
        website: { type: 'keyword' },
        services: { type: 'keyword' },
        specialties: { type: 'keyword' },
        rating: { type: 'float' },
        status: { type: 'keyword' },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' }
      }
    };

    const settings: IndexSettings = {
      number_of_shards: 1,
      number_of_replicas: 0,
      refresh_interval: '1s'
    };

    await this.elasticsearchService.createIndex(indexName, mappings, settings);
  }

  /**
   * Create health records index with proper mapping
   */
  private async createHealthRecordsIndex(): Promise<void> {
    const indexName = 'health-records';
    
    if (await this.elasticsearchService.indexExists(indexName)) {
      this.logger.log(`Index ${indexName} already exists`);
      return;
    }

    const mappings: IndexMapping = {
      dynamic: 'strict',
      properties: {
        id: { type: 'keyword' },
        petId: { type: 'keyword' },
        clinicId: { type: 'keyword' },
        veterinarianId: { type: 'keyword' },
        recordType: { type: 'keyword' },
        title: { 
          type: 'text',
          analyzer: 'standard',
          fields: {
            keyword: { type: 'keyword' }
          }
        },
        description: { 
          type: 'text',
          analyzer: 'english'
        },
        symptoms: { 
          type: 'text',
          analyzer: 'english',
          fields: {
            keyword: { type: 'keyword' }
          }
        },
        diagnosis: { 
          type: 'text',
          analyzer: 'english',
          fields: {
            keyword: { type: 'keyword' }
          }
        },
        treatment: { 
          type: 'text',
          analyzer: 'english'
        },
        medications: { type: 'keyword' },
        procedures: { type: 'keyword' },
        vitalSigns: {
          properties: {
            temperature: { type: 'float' },
            heartRate: { type: 'integer' },
            bloodPressure: { type: 'keyword' },
            weight: { type: 'float' }
          }
        },
        attachments: { type: 'keyword' },
        tags: { type: 'keyword' },
        severity: { type: 'keyword' },
        recordDate: { type: 'date' },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' }
      }
    };

    const settings: IndexSettings = {
      number_of_shards: 1,
      number_of_replicas: 0,
      refresh_interval: '1s'
    };

    await this.elasticsearchService.createIndex(indexName, mappings, settings);
  }

  /**
   * Create index template for clinic data
   */
  async createClinicIndexTemplate(): Promise<void> {
    if (!this.elasticsearchService.isServiceEnabled()) {
      this.logger.warn('Elasticsearch is disabled, skipping template creation');
      return;
    }

    try {
      // const template: IndexTemplate = {
      //   index_patterns: ['clinic-*'],
      //   priority: 1,
      //   version: 1,
      //   template: {
      //     settings: {
      //       number_of_shards: 1,
      //       number_of_replicas: 0,
      //       refresh_interval: '1s'
      //   },
      //   mappings: {
      //     dynamic: 'strict',
      //     properties: {
      //       id: { type: 'keyword' },
      //       clinicId: { type: 'keyword' },
      //       createdAt: { type: 'date' },
      //       updatedAt: { type: 'date' }
      //   }
      // }
      // };

      // This would require additional method in the service
      this.logger.log('Index template creation - implementation pending');
      // TODO: Implement template creation
    } catch (error) {
      this.logger.error('Failed to create index template', error);
      throw error;
    }
  }

  /**
   * Delete a specific index
   */
  async deleteIndex(indexName: string): Promise<void> {
    if (!this.elasticsearchService.isServiceEnabled()) {
      this.logger.warn('Elasticsearch is disabled, skipping index deletion');
      return;
    }

    try {
      await this.elasticsearchService.deleteIndex(indexName);
      this.logger.log(`Index ${indexName} deleted successfully`);
    } catch (error) {
      this.logger.error(`Failed to delete index ${indexName}`, error);
      throw error;
    }
  }

  /**
   * Get all clinic indices
   */
  async getClinicIndices(): Promise<string[]> {
    if (!this.elasticsearchService.isServiceEnabled()) {
      return [];
    }

    const indices = ['pets', 'appointments', 'users', 'clinics', 'health-records'];
    const existingIndices: string[] = [];

    for (const index of indices) {
      if (await this.elasticsearchService.indexExists(index)) {
        existingIndices.push(index);
      }
    }

    return existingIndices;
  }

  /**
   * Delete all clinic indices (use with caution)
   */
  async deleteClinicIndices(): Promise<void> {
    if (!this.elasticsearchService.isServiceEnabled()) {
      this.logger.warn('Elasticsearch is disabled, skipping index deletion');
      return;
    }

    try {
      const indices = await this.getClinicIndices();
      
      for (const index of indices) {
        await this.elasticsearchService.deleteIndex(index);
        this.logger.log(`Index ${index} deleted successfully`);
      }
      
      this.logger.log('All clinic indices deleted successfully');
    } catch (error) {
      this.logger.error('Failed to delete clinic indices', error);
      throw error;
    }
  }

  /**
   * Reindex clinic data (useful for schema updates)
   */
  async reindexClinicData(sourceIndex: string, targetIndex: string): Promise<void> {
    if (!this.elasticsearchService.isServiceEnabled()) {
      this.logger.warn('Elasticsearch is disabled, skipping reindexing');
      return;
    }

    try {
      // This would require additional method in the service
      this.logger.log(`Reindexing from ${sourceIndex} to ${targetIndex} - implementation pending`);
    } catch (error) {
      this.logger.error('Failed to reindex clinic data', error);
      throw error;
    }
  }
}
