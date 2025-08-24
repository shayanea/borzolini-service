import {
  Controller,
  Post,
  Get,
  Delete,
  UseInterceptors,
  UploadedFile,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
  Logger,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { LocalStorageService, FileUploadResult } from './local-storage.service';

export interface FileUploadDto {
  category: string;
  subcategory?: string;
  tags?: string[];
  description?: string;
}

export interface FileListQuery {
  category?: string;
  subcategory?: string;
  limit?: number;
  offset?: number;
}

@ApiTags('file-upload')
@Controller('file-upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FileUploadController {
  private readonly logger = new Logger(FileUploadController.name);

  constructor(private readonly localStorageService: LocalStorageService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload file to local storage' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            url: { type: 'string' },
            path: { type: 'string' },
            size: { type: 'number' },
            contentType: { type: 'string' },
            originalName: { type: 'string' },
            metadata: { type: 'object' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid file or request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    })
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: FileUploadDto
  ): Promise<{
    success: boolean;
    message: string;
    data: FileUploadResult;
  }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!uploadDto.category) {
      throw new BadRequestException('Category is required');
    }

    try {
      const metadata = {
        tags: uploadDto.tags || [],
        description: uploadDto.description,
      };

      const result = await this.localStorageService.uploadFile(
        file,
        uploadDto.category,
        uploadDto.subcategory,
        metadata
      );

      this.logger.log(`File uploaded successfully: ${result.path}`);

      return {
        success: true,
        message: 'File uploaded successfully',
        data: result,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`File upload failed: ${errorMessage}`);
      throw new BadRequestException(`File upload failed: ${errorMessage}`);
    }
  }

  @Get('files/:category/:subcategory?')
  @ApiOperation({ summary: 'List files in a category' })
  @ApiParam({ name: 'category', description: 'File category' })
  @ApiParam({ name: 'subcategory', description: 'File subcategory', required: false })
  @ApiQuery({ name: 'limit', description: 'Maximum number of files to return', required: false })
  @ApiQuery({ name: 'offset', description: 'Number of files to skip', required: false })
  @ApiResponse({
    status: 200,
    description: 'Files listed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              url: { type: 'string' },
              path: { type: 'string' },
              size: { type: 'number' },
              contentType: { type: 'string' },
              originalName: { type: 'string' },
              metadata: { type: 'object' },
            },
          },
        },
        total: { type: 'number' },
      },
    },
  })
  async listFiles(
    @Param('category') category: string,
    @Param('subcategory') subcategory?: string,
    @Query() query?: FileListQuery
  ): Promise<{
    success: boolean;
    data: FileUploadResult[];
    total: number;
  }> {
    try {
      const files = await this.localStorageService.listFiles(category, subcategory);
      
      // Apply pagination
      const limit = query?.limit ? parseInt(query.limit.toString()) : files.length;
      const offset = query?.offset ? parseInt(query.offset.toString()) : 0;
      const paginatedFiles = files.slice(offset, offset + limit);

      return {
        success: true,
        data: paginatedFiles,
        total: files.length,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to list files: ${errorMessage}`);
      throw new BadRequestException(`Failed to list files: ${errorMessage}`);
    }
  }

  @Get('files/:category/:subcategory/:filename')
  @ApiOperation({ summary: 'Get file information' })
  @ApiParam({ name: 'category', description: 'File category' })
  @ApiParam({ name: 'subcategory', description: 'File subcategory' })
  @ApiParam({ name: 'filename', description: 'File name' })
  @ApiResponse({
    status: 200,
    description: 'File information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            url: { type: 'string' },
            path: { type: 'string' },
            size: { type: 'number' },
            contentType: { type: 'string' },
            originalName: { type: 'string' },
            metadata: { type: 'object' },
          },
        },
      },
    },
  })
  async getFileInfo(
    @Param('category') category: string,
    @Param('subcategory') subcategory: string,
    @Param('filename') filename: string
  ): Promise<{
    success: boolean;
    data: FileUploadResult | null;
  }> {
    try {
      const filePath = `${category}/${subcategory}/${filename}`;
      const fileInfo = await this.localStorageService.getFileInfo(filePath);

      return {
        success: true,
        data: fileInfo,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get file info: ${errorMessage}`);
      throw new BadRequestException(`Failed to get file info: ${errorMessage}`);
    }
  }

  @Delete('files/:category/:subcategory/:filename')
  @ApiOperation({ summary: 'Delete file from local storage' })
  @ApiParam({ name: 'category', description: 'File category' })
  @ApiParam({ name: 'subcategory', description: 'File subcategory' })
  @ApiParam({ name: 'filename', description: 'File name' })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  async deleteFile(
    @Param('category') category: string,
    @Param('subcategory') subcategory: string,
    @Param('filename') filename: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const filePath = `${category}/${subcategory}/${filename}`;
      const deleted = await this.localStorageService.deleteFile(filePath);

      if (deleted) {
        return {
          success: true,
          message: 'File deleted successfully',
        };
      } else {
        throw new BadRequestException('Failed to delete file');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`File deletion failed: ${errorMessage}`);
      throw new BadRequestException(`File deletion failed: ${errorMessage}`);
    }
  }

  @Post('files/:category/:subcategory/:filename/copy')
  @ApiOperation({ summary: 'Copy file to new location' })
  @ApiParam({ name: 'category', description: 'Source file category' })
  @ApiParam({ name: 'subcategory', description: 'Source file subcategory' })
  @ApiParam({ name: 'filename', description: 'Source file name' })
  @ApiResponse({
    status: 200,
    description: 'File copied successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            url: { type: 'string' },
            path: { type: 'string' },
            size: { type: 'number' },
            contentType: { type: 'string' },
            originalName: { type: 'string' },
            metadata: { type: 'object' },
          },
        },
      },
    },
  })
  async copyFile(
    @Param('category') category: string,
    @Param('subcategory') subcategory: string,
    @Param('filename') filename: string,
    @Body() body: { newCategory: string; newSubcategory?: string }
  ): Promise<{
    success: boolean;
    message: string;
    data: FileUploadResult | null;
  }> {
    try {
      if (!body.newCategory) {
        throw new BadRequestException('New category is required');
      }

      const sourcePath = `${category}/${subcategory}/${filename}`;
      const copiedFile = await this.localStorageService.copyFile(
        sourcePath,
        body.newCategory,
        body.newSubcategory
      );

      if (copiedFile) {
        return {
          success: true,
          message: 'File copied successfully',
          data: copiedFile,
        };
      } else {
        throw new BadRequestException('Failed to copy file');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`File copy failed: ${errorMessage}`);
      throw new BadRequestException(`File copy failed: ${errorMessage}`);
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get storage statistics' })
  @ApiResponse({
    status: 200,
    description: 'Storage statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            totalFiles: { type: 'number' },
            totalSize: { type: 'number' },
            categories: { type: 'object' },
          },
        },
      },
    },
  })
  async getStorageStats(): Promise<{
    success: boolean;
    data: {
      totalFiles: number;
      totalSize: number;
      categories: Record<string, { count: number; size: number }>;
    };
  }> {
    try {
      const stats = await this.localStorageService.getStorageStats();

      return {
        success: true,
        data: stats,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get storage stats: ${errorMessage}`);
      throw new BadRequestException(`Failed to get storage stats: ${errorMessage}`);
    }
  }

  @Post('cleanup')
  @ApiOperation({ summary: 'Clean up old files' })
  @ApiResponse({
    status: 200,
    description: 'Cleanup completed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        deletedCount: { type: 'number' },
      },
    },
  })
  async cleanupOldFiles(
    @Body() body: { daysOld?: number }
  ): Promise<{
    success: boolean;
    message: string;
    deletedCount: number;
  }> {
    try {
      const daysOld = body.daysOld || 30;
      const deletedCount = await this.localStorageService.cleanupOldFiles(daysOld);

      return {
        success: true,
        message: `Cleanup completed: ${deletedCount} old files deleted`,
        deletedCount,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Cleanup failed: ${errorMessage}`);
      throw new BadRequestException(`Cleanup failed: ${errorMessage}`);
    }
  }

  @Get('download/:category/:subcategory/:filename')
  @ApiOperation({ summary: 'Download file' })
  @ApiParam({ name: 'category', description: 'File category' })
  @ApiParam({ name: 'subcategory', description: 'File subcategory' })
  @ApiParam({ name: 'filename', description: 'File name' })
  @ApiResponse({ status: 200, description: 'File downloaded successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async downloadFile(
    @Param('category') category: string,
    @Param('subcategory') subcategory: string,
    @Param('filename') filename: string,
    @Res() res: Response
  ): Promise<void> {
    try {
      const filePath = `${category}/${subcategory}/${filename}`;
      const fileInfo = await this.localStorageService.getFileInfo(filePath);

      if (!fileInfo) {
        res.status(404).json({ error: 'File not found' });
        return;
      }

      const fullPath = `./uploads/${filePath}`;
      
      res.setHeader('Content-Type', fileInfo.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.originalName}"`);
      res.sendFile(fullPath, { root: process.cwd() });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`File download failed: ${errorMessage}`);
      res.status(500).json({ error: `File download failed: ${errorMessage}` });
    }
  }
}
