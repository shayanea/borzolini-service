import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Res, ValidationPipe } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ElasticsearchIndexService } from '../services/elasticsearch-index.service';
import { ElasticsearchSyncService } from '../services/elasticsearch-sync.service';

export class CreateIndicesRequestDto {
  force?: boolean;
}

export class SyncDataRequestDto {
  force?: boolean;
  batchSize?: number;
  refresh?: boolean;
}

@ApiTags('Elasticsearch Management')
@Controller('elasticsearch/management')
export class ElasticsearchManagementController {
  constructor(
    private readonly elasticsearchIndexService: ElasticsearchIndexService,
    private readonly elasticsearchSyncService: ElasticsearchSyncService
  ) {}

  @Post('indices/create')
  @ApiOperation({ summary: 'Create all clinic indices with proper mappings' })
  @ApiBody({ type: CreateIndicesRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Indices created successfully',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to create indices',
  })
  async createIndices(@Body(new ValidationPipe()) _request: CreateIndicesRequestDto, @Res() res: Response) {
    try {
      await this.elasticsearchIndexService.createClinicIndices();

      return res.status(HttpStatus.OK).json({
        status: 'success',
        message: 'All clinic indices created successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Failed to create indices',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Get('indices/list')
  @ApiOperation({ summary: 'Get list of all clinic indices' })
  @ApiResponse({
    status: 200,
    description: 'Indices list retrieved successfully',
  })
  async getIndices(@Res() res: Response) {
    try {
      const indices = await this.elasticsearchIndexService.getClinicIndices();

      return res.status(HttpStatus.OK).json({
        status: 'success',
        data: indices,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Failed to get indices list',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Delete('indices/:indexName')
  @ApiOperation({ summary: 'Delete a specific index' })
  @ApiParam({ name: 'indexName', description: 'Name of the index to delete' })
  @ApiResponse({
    status: 200,
    description: 'Index deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Index not found',
  })
  async deleteIndex(@Param('indexName') indexName: string, @Res() res: Response) {
    try {
      await this.elasticsearchIndexService.deleteIndex(indexName);

      return res.status(HttpStatus.OK).json({
        status: 'success',
        message: `Index ${indexName} deleted successfully`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: `Failed to delete index ${indexName}`,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Delete('indices/all')
  @ApiOperation({ summary: 'Delete all clinic indices (use with caution)' })
  @ApiResponse({
    status: 200,
    description: 'All indices deleted successfully',
  })
  async deleteAllIndices(@Res() res: Response) {
    try {
      await this.elasticsearchIndexService.deleteClinicIndices();

      return res.status(HttpStatus.OK).json({
        status: 'success',
        message: 'All clinic indices deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Failed to delete all indices',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Post('sync/all')
  @ApiOperation({ summary: 'Sync all clinic data to Elasticsearch' })
  @ApiBody({ type: SyncDataRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Sync operation completed successfully',
  })
  @ApiResponse({
    status: 500,
    description: 'Sync operation failed',
  })
  async syncAllData(@Body(new ValidationPipe()) request: SyncDataRequestDto, @Res() res: Response) {
    try {
      const result = await this.elasticsearchSyncService.syncAllClinicData({
        force: request.force ?? false,
        batchSize: request.batchSize ?? 100,
        refresh: request.refresh ?? true,
      });

      if (result.success) {
        return res.status(HttpStatus.OK).json({
          status: 'success',
          message: 'All clinic data synced successfully',
          data: result,
          timestamp: new Date().toISOString(),
        });
      } else {
        return res.status(HttpStatus.PARTIAL_CONTENT).json({
          status: 'partial_success',
          message: 'Sync completed with some errors',
          data: result,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Failed to sync clinic data',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Post('sync/:indexName')
  @ApiOperation({ summary: 'Sync data for a specific index' })
  @ApiParam({ name: 'indexName', description: 'Name of the index to sync' })
  @ApiBody({ type: SyncDataRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Index sync completed successfully',
  })
  async syncIndex(@Param('indexName') indexName: string, @Body(new ValidationPipe()) request: SyncDataRequestDto, @Res() res: Response) {
    try {
      let result;

      switch (indexName) {
        case 'pets':
          result = await this.elasticsearchSyncService.syncPets({
            force: request.force ?? false,
            batchSize: request.batchSize ?? 100,
            refresh: request.refresh ?? true,
          });
          break;
        case 'appointments':
          result = await this.elasticsearchSyncService.syncAppointments({
            force: request.force ?? false,
            batchSize: request.batchSize ?? 100,
            refresh: request.refresh ?? true,
          });
          break;
        case 'users':
          result = await this.elasticsearchSyncService.syncUsers({
            force: request.force ?? false,
            batchSize: request.batchSize ?? 100,
            refresh: request.refresh ?? true,
          });
          break;
        case 'clinics':
          result = await this.elasticsearchSyncService.syncClinics({
            force: request.force ?? false,
            batchSize: request.batchSize ?? 100,
            refresh: request.refresh ?? true,
          });
          break;
        case 'health-records':
          result = await this.elasticsearchSyncService.syncHealthRecords({
            force: request.force ?? false,
            batchSize: request.batchSize ?? 100,
            refresh: request.refresh ?? true,
          });
          break;
        default:
          return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'error',
            message: `Invalid index name: ${indexName}`,
          });
      }

      if (result.success) {
        return res.status(HttpStatus.OK).json({
          status: 'success',
          message: `Index ${indexName} synced successfully`,
          data: result,
          timestamp: new Date().toISOString(),
        });
      } else {
        return res.status(HttpStatus.PARTIAL_CONTENT).json({
          status: 'partial_success',
          message: `Index ${indexName} sync completed with some errors`,
          data: result,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: `Failed to sync index ${indexName}`,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Get('sync/status/:indexName')
  @ApiOperation({ summary: 'Get sync status for a specific index' })
  @ApiParam({ name: 'indexName', description: 'Name of the index to check status' })
  @ApiResponse({
    status: 200,
    description: 'Sync status retrieved successfully',
  })
  async getIndexSyncStatus(@Param('indexName') indexName: string, @Res() res: Response) {
    try {
      const status = await this.elasticsearchSyncService.getIndexSyncStatus(indexName);

      return res.status(HttpStatus.OK).json({
        status: 'success',
        data: status,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: `Failed to get sync status for index ${indexName}`,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Post('sync/document/:indexName/:documentId')
  @ApiOperation({ summary: 'Sync a single document to Elasticsearch' })
  @ApiParam({ name: 'indexName', description: 'Name of the index' })
  @ApiParam({ name: 'documentId', description: 'ID of the document to sync' })
  @ApiBody({ description: 'Document data to sync' })
  @ApiResponse({
    status: 200,
    description: 'Document synced successfully',
  })
  async syncDocument(@Param('indexName') indexName: string, @Param('documentId') documentId: string, @Body() document: Record<string, unknown>, @Res() res: Response) {
    try {
      const success = await this.elasticsearchSyncService.syncDocument(indexName, document, documentId, { refresh: true });

      if (success) {
        return res.status(HttpStatus.OK).json({
          status: 'success',
          message: `Document ${documentId} synced successfully to index ${indexName}`,
          timestamp: new Date().toISOString(),
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          status: 'error',
          message: `Failed to sync document ${documentId} to index ${indexName}`,
        });
      }
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: `Failed to sync document ${documentId}`,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Delete('sync/document/:indexName/:documentId')
  @ApiOperation({ summary: 'Delete a document from Elasticsearch' })
  @ApiParam({ name: 'indexName', description: 'Name of the index' })
  @ApiParam({ name: 'documentId', description: 'ID of the document to delete' })
  @ApiResponse({
    status: 200,
    description: 'Document deleted successfully',
  })
  async deleteDocument(@Param('indexName') indexName: string, @Param('documentId') documentId: string, @Res() res: Response) {
    try {
      const success = await this.elasticsearchSyncService.deleteDocument(indexName, documentId, { refresh: true });

      if (success) {
        return res.status(HttpStatus.OK).json({
          status: 'success',
          message: `Document ${documentId} deleted successfully from index ${indexName}`,
          timestamp: new Date().toISOString(),
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          status: 'error',
          message: `Failed to delete document ${documentId} from index ${indexName}`,
        });
      }
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: `Failed to delete document ${documentId}`,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Post('sync/document/:indexName/:documentId/update')
  @ApiOperation({ summary: 'Update a document in Elasticsearch' })
  @ApiParam({ name: 'indexName', description: 'Name of the index' })
  @ApiParam({ name: 'documentId', description: 'ID of the document to update' })
  @ApiBody({ description: 'Updated document data' })
  @ApiResponse({
    status: 200,
    description: 'Document updated successfully',
  })
  async updateDocument(@Param('indexName') indexName: string, @Param('documentId') documentId: string, @Body() document: Record<string, unknown>, @Res() res: Response) {
    try {
      const success = await this.elasticsearchSyncService.updateDocument(indexName, documentId, document, { refresh: true });

      if (success) {
        return res.status(HttpStatus.OK).json({
          status: 'success',
          message: `Document ${documentId} updated successfully in index ${indexName}`,
          timestamp: new Date().toISOString(),
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          status: 'error',
          message: `Failed to update document ${documentId} in index ${indexName}`,
        });
      }
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: `Failed to update document ${documentId}`,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
