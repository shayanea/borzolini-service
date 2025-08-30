import { Injectable, Logger } from '@nestjs/common';

import { ElasticsearchIndexService } from './elasticsearch-index.service';
import { ElasticsearchService } from '../elasticsearch.service';

export interface SyncOptions {
  force?: boolean;
  batchSize?: number;
  refresh?: boolean;
}

export interface SyncResult {
  success: boolean;
  totalProcessed: number;
  totalSynced: number;
  errors: string[];
  duration: number;
}

@Injectable()
export class ElasticsearchSyncService {
  private readonly logger = new Logger(ElasticsearchSyncService.name);

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly elasticsearchIndexService: ElasticsearchIndexService
  ) {}

  /**
   * Sync all clinic data to Elasticsearch
   */
  async syncAllClinicData(options: SyncOptions = {}): Promise<SyncResult> {
    if (!this.elasticsearchService.isServiceEnabled()) {
      this.logger.warn('Elasticsearch is disabled, skipping sync');
      return {
        success: false,
        totalProcessed: 0,
        totalSynced: 0,
        errors: ['Elasticsearch is disabled'],
        duration: 0,
      };
    }

    const startTime = Date.now();
    const errors: string[] = [];

    try {
      // Ensure indices exist
      await this.elasticsearchIndexService.createClinicIndices();

      // Sync each data type
      const results = await Promise.allSettled([this.syncPets(options), this.syncAppointments(options), this.syncUsers(options), this.syncClinics(options), this.syncHealthRecords(options)]);

      // Process results
      let totalProcessed = 0;
      let totalSynced = 0;

      results.forEach((result, index) => {
        const dataTypes = ['pets', 'appointments', 'users', 'clinics', 'health-records'];

        if (result.status === 'fulfilled') {
          totalProcessed += result.value.totalProcessed;
          totalSynced += result.value.totalSynced;
          if (result.value.errors.length > 0) {
            errors.push(...result.value.errors.map((err) => `${dataTypes[index]}: ${err}`));
          }
        } else {
          errors.push(`${dataTypes[index]}: ${result.reason}`);
        }
      });

      const duration = Date.now() - startTime;

      this.logger.log(`Sync completed in ${duration}ms. Processed: ${totalProcessed}, Synced: ${totalSynced}, Errors: ${errors.length}`);

      return {
        success: errors.length === 0,
        totalProcessed,
        totalSynced,
        errors,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Failed to sync clinic data', error);

      return {
        success: false,
        totalProcessed: 0,
        totalSynced: 0,
        errors: [(error as any).message],
        duration,
      };
    }
  }

  /**
   * Sync pets data
   */
  async syncPets(_options: SyncOptions = {}): Promise<SyncResult> {
    if (!this.elasticsearchService.isServiceEnabled()) {
      return {
        success: false,
        totalProcessed: 0,
        totalSynced: 0,
        errors: ['Elasticsearch is disabled'],
        duration: 0,
      };
    }

    const startTime = Date.now();
    // const errors: string[] = [];

    try {
      // This would integrate with your actual pets service/repository
      // For now, we'll create a placeholder implementation
      this.logger.log('Pets sync - implementation pending');

      const duration = Date.now() - startTime;

      return {
        success: true,
        totalProcessed: 0,
        totalSynced: 0,
        errors: [],
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Failed to sync pets', error);

      return {
        success: false,
        totalProcessed: 0,
        totalSynced: 0,
        errors: [(error as any).message],
        duration,
      };
    }
  }

  /**
   * Sync appointments data
   */
  async syncAppointments(_options: SyncOptions = {}): Promise<SyncResult> {
    if (!this.elasticsearchService.isServiceEnabled()) {
      return {
        success: false,
        totalProcessed: 0,
        totalSynced: 0,
        errors: ['Elasticsearch is disabled'],
        duration: 0,
      };
    }

    const startTime = Date.now();
    // const errors: string[] = [];

    try {
      // This would integrate with your actual appointments service/repository
      this.logger.log('Appointments sync - implementation pending');

      const duration = Date.now() - startTime;

      return {
        success: true,
        totalProcessed: 0,
        totalSynced: 0,
        errors: [],
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Failed to sync appointments', error);

      return {
        success: false,
        totalProcessed: 0,
        totalSynced: 0,
        errors: [(error as any).message],
        duration,
      };
    }
  }

  /**
   * Sync users data
   */
  async syncUsers(_options: SyncOptions = {}): Promise<SyncResult> {
    if (!this.elasticsearchService.isServiceEnabled()) {
      return {
        success: false,
        totalProcessed: 0,
        totalSynced: 0,
        errors: ['Elasticsearch is disabled'],
        duration: 0,
      };
    }

    const startTime = Date.now();
    // const errors: string[] = [];

    try {
      // This would integrate with your actual users service/repository
      this.logger.log('Users sync - implementation pending');

      const duration = Date.now() - startTime;

      return {
        success: true,
        totalProcessed: 0,
        totalSynced: 0,
        errors: [],
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Failed to sync users', error);

      return {
        success: false,
        totalProcessed: 0,
        totalSynced: 0,
        errors: [(error as any).message],
        duration,
      };
    }
  }

  /**
   * Sync clinics data
   */
  async syncClinics(_options: SyncOptions = {}): Promise<SyncResult> {
    if (!this.elasticsearchService.isServiceEnabled()) {
      return {
        success: false,
        totalProcessed: 0,
        totalSynced: 0,
        errors: ['Elasticsearch is disabled'],
        duration: 0,
      };
    }

    const startTime = Date.now();
    // const errors: string[] = [];

    try {
      // This would integrate with your actual clinics service/repository
      this.logger.log('Clinics sync - implementation pending');

      const duration = Date.now() - startTime;

      return {
        success: true,
        totalProcessed: 0,
        totalSynced: 0,
        errors: [],
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Failed to sync clinics', error);

      return {
        success: false,
        totalProcessed: 0,
        totalSynced: 0,
        errors: [(error as any).message],
        duration,
      };
    }
  }

  /**
   * Sync health records data
   */
  async syncHealthRecords(_options: SyncOptions = {}): Promise<SyncResult> {
    if (!this.elasticsearchService.isServiceEnabled()) {
      return {
        success: false,
        totalProcessed: 0,
        totalSynced: 0,
        errors: ['Elasticsearch is disabled'],
        duration: 0,
      };
    }

    const startTime = Date.now();
    // const errors: string[] = [];

    try {
      // This would integrate with your actual health records service/repository
      this.logger.log('Health records sync - implementation pending');

      const duration = Date.now() - startTime;

      return {
        success: true,
        totalProcessed: 0,
        totalSynced: 0,
        errors: [],
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Failed to sync health records', error);

      return {
        success: false,
        totalProcessed: 0,
        totalSynced: 0,
        errors: [(error as any).message],
        duration,
      };
    }
  }

  /**
   * Sync a single document
   */
  async syncDocument(index: string, document: any, documentId: string, options: SyncOptions = {}): Promise<boolean> {
    if (!this.elasticsearchService.isServiceEnabled()) {
      return false;
    }

    try {
      await this.elasticsearchService.indexDocument({
        index,
        id: documentId,
        document,
        refresh: options.refresh || false,
      });

      this.logger.debug(`Document ${documentId} synced to index ${index}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to sync document ${documentId} to index ${index}`, error);
      return false;
    }
  }

  /**
   * Delete a document from Elasticsearch
   */
  async deleteDocument(index: string, documentId: string, options: SyncOptions = {}): Promise<boolean> {
    if (!this.elasticsearchService.isServiceEnabled()) {
      return false;
    }

    try {
      await this.elasticsearchService.deleteDocument(index, documentId, options.refresh || false);

      this.logger.debug(`Document ${documentId} deleted from index ${index}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete document ${documentId} from index ${index}`, error);
      return false;
    }
  }

  /**
   * Update a document in Elasticsearch
   */
  async updateDocument(index: string, documentId: string, document: any, options: SyncOptions = {}): Promise<boolean> {
    if (!this.elasticsearchService.isServiceEnabled()) {
      return false;
    }

    try {
      await this.elasticsearchService.updateDocument(index, documentId, document, options.refresh || false);

      this.logger.debug(`Document ${documentId} updated in index ${index}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to update document ${documentId} in index ${index}`, error);
      return false;
    }
  }

  /**
   * Bulk sync documents
   */
  async bulkSyncDocuments(index: string, documents: Array<{ id: string; document: any }>, options: SyncOptions = {}): Promise<SyncResult> {
    if (!this.elasticsearchService.isServiceEnabled()) {
      return {
        success: false,
        totalProcessed: 0,
        totalSynced: 0,
        errors: ['Elasticsearch is disabled'],
        duration: 0,
      };
    }

    const startTime = Date.now();
    const errors: string[] = [];
    let totalSynced = 0;

    try {
      const batchSize = options.batchSize || 100;
      const batches = this.chunkArray(documents, batchSize);

      for (const batch of batches) {
        const operations = batch.map(({ id, document }) => ({
          index: { _index: index, _id: id },
          doc: document,
        }));

        try {
          await this.elasticsearchService.bulk(operations);
          totalSynced += batch.length;
        } catch (error) {
          const batchErrors = batch.map(({ id }) => `Failed to sync document ${id}: ${(error as any).message}`);
          errors.push(...batchErrors);
        }
      }

      if (options.refresh) {
        await this.elasticsearchService.refreshIndex(index);
      }

      const duration = Date.now() - startTime;

      this.logger.log(`Bulk sync completed for index ${index}. Synced: ${totalSynced}, Errors: ${errors.length}`);

      return {
        success: errors.length === 0,
        totalProcessed: documents.length,
        totalSynced,
        errors,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`Failed to bulk sync documents for index ${index}`, error);

      return {
        success: false,
        totalProcessed: documents.length,
        totalSynced: 0,
        errors: [(error as any).message],
        duration,
      };
    }
  }

  /**
   * Get sync status for an index
   */
  async getIndexSyncStatus(index: string): Promise<{
    index: string;
    documentCount: number;
    lastSync: Date | null;
    status: 'synced' | 'out_of_sync' | 'unknown';
  }> {
    if (!this.elasticsearchService.isServiceEnabled()) {
      return {
        index,
        documentCount: 0,
        lastSync: null,
        status: 'unknown',
      };
    }

    try {
      // This would require additional methods in the service
      // For now, return basic info
      return {
        index,
        documentCount: 0,
        lastSync: null,
        status: 'unknown',
      };
    } catch (error) {
      this.logger.error(`Failed to get sync status for index ${index}`, error);
      return {
        index,
        documentCount: 0,
        lastSync: null,
        status: 'unknown',
      };
    }
  }

  /**
   * Utility method to chunk array into batches
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
