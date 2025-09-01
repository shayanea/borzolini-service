import { Body, Controller, Get, HttpStatus, Post, Query, Res, ValidationPipe } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ElasticsearchSearchService, SearchFilters, SearchOptions } from '../services/elasticsearch-search.service';

export class SearchRequestDto {
  query?: string;
  filters?: SearchFilters;
  options?: SearchOptions;
}

export class GlobalSearchRequestDto {
  query?: string;
  filters?: SearchFilters;
  options?: SearchOptions;
}

@ApiTags('Elasticsearch Search')
@Controller('elasticsearch/search')
export class ElasticsearchSearchController {
  constructor(private readonly elasticsearchSearchService: ElasticsearchSearchService) {}

  @Get('pets')
  @ApiOperation({ summary: 'Search pets with filters and options' })
  @ApiQuery({ name: 'query', description: 'Search query string', required: true })
  @ApiQuery({ name: 'clinicId', description: 'Filter by clinic ID', required: false })
  @ApiQuery({ name: 'userId', description: 'Filter by owner ID', required: false })
  @ApiQuery({ name: 'status', description: 'Filter by status', required: false, type: [String] })
  @ApiQuery({ name: 'tags', description: 'Filter by tags', required: false, type: [String] })
  @ApiQuery({ name: 'size', description: 'Number of results to return', required: false, type: Number })
  @ApiQuery({ name: 'from', description: 'Starting offset for pagination', required: false, type: Number })
  @ApiQuery({ name: 'highlight', description: 'Enable result highlighting', required: false, type: Boolean })
  @ApiQuery({ name: 'aggregations', description: 'Enable aggregations', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'Pets search results retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid search parameters',
  })
  async searchPets(
    @Res() res: Response,
    @Query('query') query: string,
    @Query('clinicId') clinicId?: string,
    @Query('userId') userId?: string,
    @Query('status') status?: string[],
    @Query('tags') tags?: string[],
    @Query('size') size?: number,
    @Query('from') from?: number,
    @Query('highlight') highlight?: boolean,
    @Query('aggregations') aggregations?: boolean
  ) {
    try {
      if (!query) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'error',
          message: 'Query parameter is required',
        });
      }

      const filters: SearchFilters = {};
      if (clinicId) filters.clinicId = clinicId;
      if (userId) filters.userId = userId;
      if (status) filters.status = status;
      if (tags) filters.tags = tags;

      const options: SearchOptions = {
        size: size ? Number(size) : 10,
        from: from ? Number(from) : 0,
        highlight: highlight === true,
        aggregations: aggregations === true,
      };

      const results = await this.elasticsearchSearchService.searchPets(query, filters, options);

      return res.status(HttpStatus.OK).json({
        status: 'success',
        data: results,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Failed to search pets',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Get('appointments')
  @ApiOperation({ summary: 'Search appointments with filters and options' })
  @ApiQuery({ name: 'query', description: 'Search query string', required: true })
  @ApiQuery({ name: 'clinicId', description: 'Filter by clinic ID', required: false })
  @ApiQuery({ name: 'userId', description: 'Filter by owner ID', required: false })
  @ApiQuery({ name: 'petId', description: 'Filter by pet ID', required: false })
  @ApiQuery({ name: 'status', description: 'Filter by status', required: false, type: [String] })
  @ApiQuery({ name: 'priority', description: 'Filter by priority', required: false, type: [String] })
  @ApiQuery({ name: 'size', description: 'Number of results to return', required: false, type: Number })
  @ApiQuery({ name: 'from', description: 'Starting offset for pagination', required: false, type: Number })
  @ApiQuery({ name: 'highlight', description: 'Enable result highlighting', required: false, type: Boolean })
  @ApiQuery({ name: 'aggregations', description: 'Enable aggregations', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'Appointments search results retrieved successfully',
  })
  async searchAppointments(
    @Res() res: Response,
    @Query('query') query: string,
    @Query('clinicId') clinicId?: string,
    @Query('userId') userId?: string,
    @Query('petId') petId?: string,
    @Query('status') status?: string[],
    @Query('priority') priority?: string[],
    @Query('size') size?: number,
    @Query('from') from?: number,
    @Query('highlight') highlight?: boolean,
    @Query('aggregations') aggregations?: boolean
  ) {
    try {
      if (!query) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'error',
          message: 'Query parameter is required',
        });
      }

      const filters: SearchFilters = {};
      if (clinicId) filters.clinicId = clinicId;
      if (userId) filters.userId = userId;
      if (petId) filters.petId = petId;
      if (status) filters.status = status;
      if (priority) filters.priority = priority;

      const options: SearchOptions = {
        size: size ? Number(size) : 10,
        from: from ? Number(from) : 0,
        highlight: highlight === true,
        aggregations: aggregations === true,
      };

      const results = await this.elasticsearchSearchService.searchAppointments(query, filters, options);

      return res.status(HttpStatus.OK).json({
        status: 'success',
        data: results,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Failed to search appointments',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Get('users')
  @ApiOperation({ summary: 'Search users with filters and options' })
  @ApiQuery({ name: 'query', description: 'Search query string', required: true })
  @ApiQuery({ name: 'clinicId', description: 'Filter by clinic ID', required: false })
  @ApiQuery({ name: 'status', description: 'Filter by status', required: false, type: [String] })
  @ApiQuery({ name: 'size', description: 'Number of results to return', required: false, type: Number })
  @ApiQuery({ name: 'from', description: 'Starting offset for pagination', required: false, type: Number })
  @ApiQuery({ name: 'highlight', description: 'Enable result highlighting', required: false, type: Boolean })
  @ApiQuery({ name: 'aggregations', description: 'Enable aggregations', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'Users search results retrieved successfully',
  })
  async searchUsers(
    @Res() res: Response,
    @Query('query') query: string,
    @Query('clinicId') clinicId?: string,
    @Query('status') status?: string[],
    @Query('size') size?: number,
    @Query('from') from?: number,
    @Query('highlight') highlight?: boolean,
    @Query('aggregations') aggregations?: boolean
  ) {
    try {
      if (!query) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'error',
          message: 'Query parameter is required',
        });
      }

      const filters: SearchFilters = {};
      if (clinicId) filters.clinicId = clinicId;
      if (status) filters.status = status;

      const options: SearchOptions = {
        size: size ? Number(size) : 10,
        from: from ? Number(from) : 0,
        highlight: highlight === true,
        aggregations: aggregations === true,
      };

      const results = await this.elasticsearchSearchService.searchUsers(query, filters, options);

      return res.status(HttpStatus.OK).json({
        status: 'success',
        data: results,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Failed to search users',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Get('clinics')
  @ApiOperation({ summary: 'Search clinics with filters and options' })
  @ApiQuery({ name: 'query', description: 'Search query string', required: true })
  @ApiQuery({ name: 'status', description: 'Filter by status', required: false, type: [String] })
  @ApiQuery({ name: 'tags', description: 'Filter by tags', required: false, type: [String] })
  @ApiQuery({ name: 'size', description: 'Number of results to return', required: false, type: Number })
  @ApiQuery({ name: 'from', description: 'Starting offset for pagination', required: false, type: Number })
  @ApiQuery({ name: 'highlight', description: 'Enable result highlighting', required: false, type: Boolean })
  @ApiQuery({ name: 'aggregations', description: 'Enable aggregations', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'Clinics search results retrieved successfully',
  })
  async searchClinics(
    @Res() res: Response,
    @Query('query') query: string,
    @Query('status') status?: string[],
    @Query('tags') tags?: string[],
    @Query('size') size?: number,
    @Query('from') from?: number,
    @Query('highlight') highlight?: boolean,
    @Query('aggregations') aggregations?: boolean
  ) {
    try {
      if (!query) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'error',
          message: 'Query parameter is required',
        });
      }

      const filters: SearchFilters = {};
      if (status) filters.status = status;
      if (tags) filters.tags = tags;

      const options: SearchOptions = {
        size: size ? Number(size) : 10,
        from: from ? Number(from) : 0,
        highlight: highlight === true,
        aggregations: aggregations === true,
      };

      const results = await this.elasticsearchSearchService.searchClinics(query, filters, options);

      return res.status(HttpStatus.OK).json({
        status: 'success',
        data: results,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Failed to search clinics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Get('health-records')
  @ApiOperation({ summary: 'Search health records with filters and options' })
  @ApiQuery({ name: 'query', description: 'Search query string', required: true })
  @ApiQuery({ name: 'clinicId', description: 'Filter by clinic ID', required: false })
  @ApiQuery({ name: 'petId', description: 'Filter by pet ID', required: false })
  @ApiQuery({ name: 'userId', description: 'Filter by veterinarian ID', required: false })
  @ApiQuery({ name: 'status', description: 'Filter by status', required: false, type: [String] })
  @ApiQuery({ name: 'tags', description: 'Filter by tags', required: false, type: [String] })
  @ApiQuery({ name: 'size', description: 'Number of results to return', required: false, type: Number })
  @ApiQuery({ name: 'from', description: 'Starting offset for pagination', required: false, type: Number })
  @ApiQuery({ name: 'highlight', description: 'Enable result highlighting', required: false, type: Boolean })
  @ApiQuery({ name: 'aggregations', description: 'Enable aggregations', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'Health records search results retrieved successfully',
  })
  async searchHealthRecords(
    @Res() res: Response,
    @Query('query') query: string,
    @Query('clinicId') clinicId?: string,
    @Query('petId') petId?: string,
    @Query('userId') userId?: string,
    @Query('status') status?: string[],
    @Query('tags') tags?: string[],
    @Query('size') size?: number,
    @Query('from') from?: number,
    @Query('highlight') highlight?: boolean,
    @Query('aggregations') aggregations?: boolean
  ) {
    try {
      if (!query) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'error',
          message: 'Query parameter is required',
        });
      }

      const filters: SearchFilters = {};
      if (clinicId) filters.clinicId = clinicId;
      if (petId) filters.petId = petId;
      if (userId) filters.userId = userId;
      if (status) filters.status = status;
      if (tags) filters.tags = tags;

      const options: SearchOptions = {
        size: size ? Number(size) : 10,
        from: from ? Number(from) : 0,
        highlight: highlight === true,
        aggregations: aggregations === true,
      };

      const results = await this.elasticsearchSearchService.searchHealthRecords(query, filters, options);

      return res.status(HttpStatus.OK).json({
        status: 'success',
        data: results,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Failed to search health records',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Post('global')
  @ApiOperation({ summary: 'Global search across all indices' })
  @ApiBody({ type: GlobalSearchRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Global search results retrieved successfully',
  })
  async globalSearch(@Res() res: Response, @Body(new ValidationPipe()) searchRequest: GlobalSearchRequestDto) {
    try {
      if (!searchRequest.query) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'error',
          message: 'Query is required',
        });
      }

      const results = await this.elasticsearchSearchService.globalSearch(searchRequest.query, searchRequest.filters || {}, searchRequest.options || {});

      return res.status(HttpStatus.OK).json({
        status: 'success',
        data: results,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Failed to perform global search',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get search suggestions for a query' })
  @ApiQuery({ name: 'query', description: 'Partial query string', required: true })
  @ApiQuery({ name: 'index', description: 'Index to search in', required: true })
  @ApiResponse({
    status: 200,
    description: 'Search suggestions retrieved successfully',
  })
  async getSearchSuggestions(@Res() res: Response, @Query('query') query: string, @Query('index') index: string) {
    try {
      if (!query || !index) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'error',
          message: 'Query and index parameters are required',
        });
      }

      const suggestions = await this.elasticsearchSearchService.getSearchSuggestions(query, index);

      return res.status(HttpStatus.OK).json({
        status: 'success',
        data: suggestions,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Failed to get search suggestions',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
