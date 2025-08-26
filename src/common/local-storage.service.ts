import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

export interface FileUploadResult {
  url: string;
  path: string;
  size: number;
  contentType: string;
  originalName: string;
  metadata: Record<string, any>;
}

export interface FileMetadata {
  originalName: string;
  contentType: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  category: string;
  tags?: string[];
}

@Injectable()
export class LocalStorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly baseUploadDir: string;
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: string[];

  constructor(private readonly configService: ConfigService) {
    this.baseUploadDir = this.configService.get(
      "LOCAL_STORAGE_PATH",
      "./uploads",
    );
    this.maxFileSize = this.configService.get("MAX_FILE_SIZE", 5 * 1024 * 1024); // 5MB default
    this.allowedMimeTypes = [
      // Images
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      // Documents
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      // Archives
      "application/zip",
      "application/x-rar-compressed",
      "application/x-7z-compressed",
    ];

    // Ensure upload directory exists
    this.ensureUploadDirectory();
  }

  /**
   * Upload file to local storage
   */
  async uploadFile(
    file: Express.Multer.File,
    category: string,
    subcategory?: string,
    metadata?: Record<string, any>,
  ): Promise<FileUploadResult> {
    try {
      // Validate file
      this.validateFile(file);

      // Generate unique filename
      const fileName = this.generateUniqueFileName(file.originalname);

      // Create directory path
      const relativePath = this.buildFilePath(category, fileName, subcategory);
      const fullPath = path.join(this.baseUploadDir, relativePath);

      // Ensure directory exists
      this.ensureDirectoryExists(path.dirname(fullPath));

      // Save file
      await this.saveFile(file.buffer, fullPath);

      // Generate metadata
      const fileMetadata: FileMetadata = {
        originalName: file.originalname,
        contentType: file.mimetype,
        size: file.size,
        uploadedBy: "clinic-api",
        uploadedAt: new Date(),
        category,
        tags: metadata?.tags || [],
      };

      // Save metadata
      await this.saveMetadata(relativePath, fileMetadata);

      // Generate local URL
      const localUrl = this.generateLocalUrl(relativePath);

      this.logger.log(`File uploaded successfully: ${relativePath}`);

      return {
        url: localUrl,
        path: relativePath,
        size: file.size,
        contentType: file.mimetype,
        originalName: file.originalname,
        metadata: {
          ...fileMetadata,
          ...metadata,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`File upload failed: ${errorMessage}`);
      throw new BadRequestException(`File upload failed: ${errorMessage}`);
    }
  }

  /**
   * Delete file from local storage
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.baseUploadDir, filePath);

      if (!fs.existsSync(fullPath)) {
        this.logger.warn(`File not found: ${filePath}`);
        return false;
      }

      // Delete file
      fs.unlinkSync(fullPath);

      // Delete metadata if exists
      const metadataPath = this.getMetadataPath(filePath);
      if (fs.existsSync(metadataPath)) {
        fs.unlinkSync(metadataPath);
      }

      this.logger.log(`File deleted successfully: ${filePath}`);
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`File deletion failed: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(filePath: string): Promise<FileMetadata | null> {
    try {
      const metadataPath = this.getMetadataPath(filePath);

      if (!fs.existsSync(metadataPath)) {
        return null;
      }

      const metadataContent = fs.readFileSync(metadataPath, "utf8");
      return JSON.parse(metadataContent);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Failed to get file metadata: ${errorMessage}`);
      return null;
    }
  }

  /**
   * List files in a directory
   */
  async listFiles(
    category: string,
    subcategory?: string,
  ): Promise<FileUploadResult[]> {
    try {
      const dirPath = path.join(
        this.baseUploadDir,
        category,
        subcategory || "",
      );

      if (!fs.existsSync(dirPath)) {
        return [];
      }

      const files = fs.readdirSync(dirPath);
      const fileResults: FileUploadResult[] = [];

      for (const file of files) {
        if (file.endsWith(".json")) continue; // Skip metadata files

        const filePath = path.join(category, subcategory || "", file);
        const metadata = await this.getFileMetadata(filePath);

        if (metadata) {
          fileResults.push({
            url: this.generateLocalUrl(filePath),
            path: filePath,
            size: metadata.size,
            contentType: metadata.contentType,
            originalName: metadata.originalName,
            metadata,
          });
        }
      }

      return fileResults;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Failed to list files: ${errorMessage}`);
      return [];
    }
  }

  /**
   * Get file info
   */
  async getFileInfo(filePath: string): Promise<FileUploadResult | null> {
    try {
      const fullPath = path.join(this.baseUploadDir, filePath);

      if (!fs.existsSync(fullPath)) {
        return null;
      }

      const stats = fs.statSync(fullPath);
      const metadata = await this.getFileMetadata(filePath);

      if (!metadata) {
        return null;
      }

      return {
        url: this.generateLocalUrl(filePath),
        path: filePath,
        size: stats.size,
        contentType: metadata.contentType,
        originalName: metadata.originalName,
        metadata,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Failed to get file info: ${errorMessage}`);
      return null;
    }
  }

  /**
   * Copy file to new location
   */
  async copyFile(
    sourcePath: string,
    newCategory: string,
    newSubcategory?: string,
  ): Promise<FileUploadResult | null> {
    try {
      const sourceInfo = await this.getFileInfo(sourcePath);
      if (!sourceInfo) {
        throw new Error("Source file not found");
      }

      const newFileName = this.generateUniqueFileName(sourceInfo.originalName);
      const newPath = this.buildFilePath(
        newCategory,
        newFileName,
        newSubcategory,
      );
      const newFullPath = path.join(this.baseUploadDir, newPath);

      // Ensure directory exists
      this.ensureDirectoryExists(path.dirname(newFullPath));

      // Copy file
      const sourceFullPath = path.join(this.baseUploadDir, sourcePath);
      fs.copyFileSync(sourceFullPath, newFullPath);

      // Copy and update metadata
      const newMetadata: FileMetadata = {
        originalName: sourceInfo.metadata.originalName,
        contentType: sourceInfo.metadata.contentType,
        size: sourceInfo.metadata.size,
        uploadedBy: sourceInfo.metadata.uploadedBy,
        uploadedAt: new Date(),
        category: newCategory,
        tags: [...(sourceInfo.metadata.tags || []), "copied"],
      };

      await this.saveMetadata(newPath, newMetadata);

      this.logger.log(`File copied successfully: ${sourcePath} -> ${newPath}`);

      return {
        url: this.generateLocalUrl(newPath),
        path: newPath,
        size: sourceInfo.size,
        contentType: sourceInfo.contentType,
        originalName: sourceInfo.originalName,
        metadata: newMetadata,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`File copy failed: ${errorMessage}`);
      return null;
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    categories: Record<string, { count: number; size: number }>;
  }> {
    try {
      const stats = await this.calculateStorageStats(this.baseUploadDir);
      return stats;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Failed to get storage stats: ${errorMessage}`);
      return { totalFiles: 0, totalSize: 0, categories: {} };
    }
  }

  /**
   * Clean up old files
   */
  async cleanupOldFiles(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      let deletedCount = 0;
      const files = await this.getAllFiles(this.baseUploadDir);

      for (const file of files) {
        const metadata = await this.getFileMetadata(file);
        if (metadata && metadata.uploadedAt < cutoffDate) {
          if (await this.deleteFile(file)) {
            deletedCount++;
          }
        }
      }

      this.logger.log(`Cleanup completed: ${deletedCount} old files deleted`);
      return deletedCount;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Cleanup failed: ${errorMessage}`);
      return 0;
    }
  }

  // ==================== PRIVATE METHODS ====================

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException("No file provided");
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size ${file.size} bytes exceeds maximum allowed size ${this.maxFileSize} bytes`,
      );
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${this.allowedMimeTypes.join(", ")}`,
      );
    }
  }

  private generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString("hex");
    const extension = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, extension);

    return `${timestamp}-${randomString}-${nameWithoutExt}${extension}`;
  }

  private buildFilePath(
    category: string,
    fileName: string,
    subcategory?: string,
  ): string {
    const parts = [category];
    if (subcategory) {
      parts.push(subcategory);
    }
    parts.push(fileName);
    return parts.join(path.sep);
  }

  private ensureUploadDirectory(): void {
    if (!fs.existsSync(this.baseUploadDir)) {
      fs.mkdirSync(this.baseUploadDir, { recursive: true });
      this.logger.log(`Created upload directory: ${this.baseUploadDir}`);
    }
  }

  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  private async saveFile(buffer: Buffer, filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, buffer, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  private async saveMetadata(
    filePath: string,
    metadata: FileMetadata,
  ): Promise<void> {
    const metadataPath = this.getMetadataPath(filePath);
    const metadataDir = path.dirname(metadataPath);

    this.ensureDirectoryExists(metadataDir);

    return new Promise((resolve, reject) => {
      fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  private getMetadataPath(filePath: string): string {
    const dir = path.dirname(filePath);
    const name = path.basename(filePath);
    return path.join(this.baseUploadDir, dir, `${name}.json`);
  }

  private generateLocalUrl(filePath: string): string {
    const baseUrl = this.configService.get(
      "FRONTEND_URL",
      "http://localhost:3000",
    );
    return `${baseUrl}/api/v1/files/${filePath}`;
  }

  private async calculateStorageStats(dirPath: string): Promise<{
    totalFiles: number;
    totalSize: number;
    categories: Record<string, { count: number; size: number }>;
  }> {
    const stats = {
      totalFiles: 0,
      totalSize: 0,
      categories: {} as Record<string, { count: number; size: number }>,
    };

    if (!fs.existsSync(dirPath)) {
      return stats;
    }

    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const itemStat = fs.statSync(itemPath);

      if (itemStat.isDirectory()) {
        const categoryStats = await this.calculateStorageStats(itemPath);
        stats.totalFiles += categoryStats.totalFiles;
        stats.totalSize += categoryStats.totalSize;

        if (categoryStats.totalFiles > 0) {
          stats.categories[item] = {
            count: categoryStats.totalFiles,
            size: categoryStats.totalSize,
          };
        }
      } else if (!item.endsWith(".json")) {
        stats.totalFiles++;
        stats.totalSize += itemStat.size;
      }
    }

    return stats;
  }

  private async getAllFiles(dirPath: string): Promise<string[]> {
    const files: string[] = [];

    if (!fs.existsSync(dirPath)) {
      return files;
    }

    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const itemStat = fs.statSync(itemPath);

      if (itemStat.isDirectory()) {
        const subFiles = await this.getAllFiles(itemPath);
        files.push(...subFiles.map((f) => path.join(item, f)));
      } else if (!item.endsWith(".json")) {
        files.push(item);
      }
    }

    return files;
  }
}
