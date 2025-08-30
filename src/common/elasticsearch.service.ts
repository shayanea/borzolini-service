import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { Client } from '@elastic/elasticsearch';
import { ConfigService } from '@nestjs/config';
import { ElasticsearchService as NestElasticsearchService } from '@nestjs/elasticsearch';

export interface SearchQuery {
  index: string;
  query: any;
  size?: number;
  from?: number;
  sort?: any[];
  aggs?: any;
  highlight?: any;
  source?: string[] | boolean;
}

export interface IndexDocumentOptions {
  index: string;
  id?: string;
  document: any;
  refresh?: boolean;
}

export interface BulkOperation {
  index?: { _index: string; _id?: string };
  create?: { _index: string; _id?: string };
  update?: { _index: string; _id: string };
  delete?: { _index: string; _id: string };
  doc?: any;
  doc_as_upsert?: boolean;
}

export interface BulkResponse {
  took: number;
  errors: boolean;
  items: Array<{
    index?: { _index: string; _id: string; status: number; error?: any } | undefined;
    create?: { _index: string; _id: string; status: number; error?: any } | undefined;
    update?: { _index: string; _id: string; status: number; error?: any } | undefined;
    delete?: { _index: string; _id: string; status: number; error?: any } | undefined;
  }>;
}

@Injectable()
export class ElasticsearchService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ElasticsearchService.name);
  private readonly isEnabled: boolean;
  private client: Client;

  constructor(
    private readonly elasticsearchService: NestElasticsearchService,
    private readonly configService: ConfigService
  ) {
    this.isEnabled = this.configService.get<boolean>('ELASTICSEARCH_ENABLED', false);
    this.client = this.elasticsearchService;
  }

  async onModuleInit() {
    if (this.isEnabled) {
      try {
        await this.checkConnection();
        this.logger.log('Elasticsearch service initialized successfully');
      } catch (error) {
        this.logger.error('Failed to initialize Elasticsearch service', error);
      }
    } else {
      this.logger.log('Elasticsearch service is disabled');
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      try {
        await this.client.close();
        this.logger.log('Elasticsearch client closed successfully');
      } catch (error) {
        this.logger.error('Error closing Elasticsearch client', error);
      }
    }
  }

  /**
   * Check Elasticsearch connection
   */
  async checkConnection(): Promise<boolean> {
    if (!this.isEnabled) {
      return false;
    }

    try {
      const response = await this.client.ping();
      return response;
    } catch (error) {
      this.logger.error('Elasticsearch connection failed', error);
      throw error;
    }
  }

  /**
   * Get cluster health information
   */
  async getClusterHealth(): Promise<any> {
    if (!this.isEnabled) {
      throw new Error('Elasticsearch is disabled');
    }

    try {
      const response = await this.client.cluster.health();
      return response;
    } catch (error) {
      this.logger.error('Failed to get cluster health', error);
      throw error;
    }
  }

  /**
   * Create an index
   */
  async createIndex(index: string, mappings?: any, settings?: any): Promise<any> {
    if (!this.isEnabled) {
      throw new Error('Elasticsearch is disabled');
    }

    try {
      const body: any = {};
      if (mappings) body.mappings = mappings;
      if (settings) body.settings = settings;

      const response = await this.client.indices.create({
        index,
        body,
      });

      this.logger.log(`Index ${index} created successfully`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to create index ${index}`, error);
      throw error;
    }
  }

  /**
   * Check if index exists
   */
  async indexExists(index: string): Promise<boolean> {
    if (!this.isEnabled) {
      return false;
    }

    try {
      const response = await this.client.indices.exists({ index });
      return response;
    } catch (error) {
      this.logger.error(`Failed to check index existence: ${index}`, error);
      return false;
    }
  }

  /**
   * Delete an index
   */
  async deleteIndex(index: string): Promise<any> {
    if (!this.isEnabled) {
      throw new Error('Elasticsearch is disabled');
    }

    try {
      const response = await this.client.indices.delete({ index });
      this.logger.log(`Index ${index} deleted successfully`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to delete index ${index}`, error);
      throw error;
    }
  }

  /**
   * Index a document
   */
  async indexDocument(options: IndexDocumentOptions): Promise<any> {
    if (!this.isEnabled) {
      throw new Error('Elasticsearch is disabled');
    }

    try {
      const { index, id, document, refresh = false } = options;

      const body: any = {
        index,
        body: document,
        refresh,
      };

      if (id) {
        body.id = id;
      }

      const response = await this.client.index(body);
      this.logger.debug(`Document indexed successfully in ${index}`);
      return response;
    } catch (error) {
      this.logger.error('Failed to index document', error);
      throw error;
    }
  }

  /**
   * Get a document by ID
   */
  async getDocument(index: string, id: string): Promise<any> {
    if (!this.isEnabled) {
      throw new Error('Elasticsearch is disabled');
    }

    try {
      const response = await this.client.get({
        index,
        id,
      });
      return response;
    } catch (error) {
      this.logger.error(`Failed to get document ${id} from ${index}`, error);
      throw error;
    }
  }

  /**
   * Update a document
   */
  async updateDocument(index: string, id: string, document: any, refresh: boolean = false): Promise<any> {
    if (!this.isEnabled) {
      throw new Error('Elasticsearch is disabled');
    }

    try {
      const response = await this.client.update({
        index,
        id,
        body: document,
        refresh,
      });

      this.logger.debug(`Document ${id} updated successfully in ${index}`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to update document ${id} in ${index}`, error);
      throw error;
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(index: string, id: string, refresh: boolean = false): Promise<any> {
    if (!this.isEnabled) {
      throw new Error('Elasticsearch is disabled');
    }

    try {
      const response = await this.client.delete({
        index,
        id,
        refresh,
      });

      this.logger.debug(`Document ${id} deleted successfully from ${index}`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to delete document ${id} from ${index}`, error);
      throw error;
    }
  }

  /**
   * Search documents
   */
  async search(searchQuery: SearchQuery): Promise<any> {
    if (!this.isEnabled) {
      throw new Error('Elasticsearch is disabled');
    }

    try {
      const { index, query, size = 10, from = 0, sort, aggs, highlight, source } = searchQuery;

      const body: any = {
        index,
        body: {
          query,
          size,
          from,
        },
      };

      if (sort) body.body.sort = sort;
      if (aggs) body.body.aggs = aggs;
      if (highlight) body.body.highlight = highlight;
      if (source !== undefined) body.body._source = source;

      const response = await this.client.search(body);
      return response;
    } catch (error) {
      this.logger.error('Search failed', error);
      throw error;
    }
  }

  /**
   * Bulk operations
   */
  async bulk(operations: BulkOperation[]): Promise<BulkResponse> {
    if (!this.isEnabled) {
      throw new Error('Elasticsearch is disabled');
    }

    try {
      const body = operations.flatMap((operation) => {
        const entries = Object.entries(operation);
        const result = [];

        for (const [key, value] of entries) {
          if (key === 'doc' || key === 'doc_as_upsert') {
            result.push({ [key]: value });
          } else {
            result.push({ [key]: value });
          }
        }

        return result;
      });

      const response = await this.client.bulk({ body });
      this.logger.debug(`Bulk operation completed: ${operations.length} operations`);

      // Transform the response to match our interface
      const transformedResponse: BulkResponse = {
        took: response.took,
        errors: response.errors,
        items: response.items.map((item: any) => {
          const operation = item.index || item.create || item.update || item.delete;
          if (operation) {
            return {
              index: { _index: operation._index, _id: operation._id || '', status: operation.status, error: operation.error },
              create: undefined,
              update: undefined,
              delete: undefined,
            };
          }
          return {
            index: undefined,
            create: undefined,
            update: undefined,
            delete: undefined,
          };
        }),
      };

      return transformedResponse;
    } catch (error) {
      this.logger.error('Bulk operation failed', error);
      throw error;
    }
  }

  /**
   * Refresh an index
   */
  async refreshIndex(index: string): Promise<any> {
    if (!this.isEnabled) {
      throw new Error('Elasticsearch is disabled');
    }

    try {
      const response = await this.client.indices.refresh({ index });
      this.logger.debug(`Index ${index} refreshed successfully`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to refresh index ${index}`, error);
      throw error;
    }
  }

  /**
   * Get index mapping
   */
  async getIndexMapping(index: string): Promise<any> {
    if (!this.isEnabled) {
      throw new Error('Elasticsearch is disabled');
    }

    try {
      const response = await this.client.indices.getMapping({ index });
      return response;
    } catch (error) {
      this.logger.error(`Failed to get mapping for index ${index}`, error);
      throw error;
    }
  }

  /**
   * Update index mapping
   */
  async updateIndexMapping(index: string, mappings: any): Promise<any> {
    if (!this.isEnabled) {
      throw new Error('Elasticsearch is disabled');
    }

    try {
      const response = await this.client.indices.putMapping({
        index,
        body: mappings,
      });

      this.logger.log(`Mapping updated successfully for index ${index}`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to update mapping for index ${index}`, error);
      throw error;
    }
  }

  /**
   * Check if Elasticsearch is enabled
   */
  isServiceEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Get service status
   */
  async getServiceStatus(): Promise<{
    enabled: boolean;
    connected: boolean;
    clusterHealth?: any;
  }> {
    const status: {
      enabled: boolean;
      connected: boolean;
      clusterHealth?: any;
    } = {
      enabled: this.isEnabled,
      connected: false,
    };

    if (this.isEnabled) {
      try {
        status.connected = await this.checkConnection();
        if (status.connected) {
          status.clusterHealth = await this.getClusterHealth();
        }
      } catch (error) {
        this.logger.error('Failed to get service status', error);
      }
    }

    return status;
  }
}
