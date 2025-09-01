import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ElasticsearchService } from '../elasticsearch.service';

@ApiTags('Elasticsearch Health')
@Controller('elasticsearch/health')
export class ElasticsearchHealthController {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  @Get()
  @ApiOperation({ summary: 'Get Elasticsearch service health status' })
  @ApiResponse({
    status: 200,
    description: 'Elasticsearch health status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        timestamp: { type: 'string', format: 'date-time' },
        service: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            connected: { type: 'boolean' },
            clusterHealth: { type: 'object' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Elasticsearch service unavailable',
  })
  async getHealth(@Res() res: Response) {
    try {
      const status = await this.elasticsearchService.getServiceStatus();

      if (status.enabled && status.connected) {
        return res.status(HttpStatus.OK).json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          service: status,
        });
      } else if (status.enabled && !status.connected) {
        return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          service: status,
          message: 'Elasticsearch service is enabled but not connected',
        });
      } else {
        return res.status(HttpStatus.OK).json({
          status: 'disabled',
          timestamp: new Date().toISOString(),
          service: status,
          message: 'Elasticsearch service is disabled',
        });
      }
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        message: 'Failed to retrieve Elasticsearch health status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Get('cluster')
  @ApiOperation({ summary: 'Get Elasticsearch cluster health information' })
  @ApiResponse({
    status: 200,
    description: 'Cluster health information retrieved successfully',
  })
  @ApiResponse({
    status: 503,
    description: 'Elasticsearch service unavailable',
  })
  async getClusterHealth(@Res() res: Response) {
    try {
      if (!this.elasticsearchService.isServiceEnabled()) {
        return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
          status: 'disabled',
          message: 'Elasticsearch service is disabled',
        });
      }

      const clusterHealth = await this.elasticsearchService.getClusterHealth();

      return res.status(HttpStatus.OK).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        clusterHealth,
      });
    } catch (error) {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        message: 'Failed to retrieve cluster health information',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Get('indices')
  @ApiOperation({ summary: 'Get Elasticsearch indices information' })
  @ApiResponse({
    status: 200,
    description: 'Indices information retrieved successfully',
  })
  @ApiResponse({
    status: 503,
    description: 'Elasticsearch service unavailable',
  })
  async getIndicesInfo(@Res() res: Response) {
    try {
      if (!this.elasticsearchService.isServiceEnabled()) {
        return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
          status: 'disabled',
          message: 'Elasticsearch service is disabled',
        });
      }

      // This would require additional method in the service
      // For now, return basic info
      return res.status(HttpStatus.OK).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        message: 'Indices information endpoint - implementation pending',
      });
    } catch (error) {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        message: 'Failed to retrieve indices information',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
