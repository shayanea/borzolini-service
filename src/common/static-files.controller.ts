import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import { Response } from "express";
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { LocalStorageService } from "./local-storage.service";

@ApiTags("static-files")
@Controller("files")
export class StaticFilesController {
  private readonly logger = new Logger(StaticFilesController.name);

  constructor(private readonly localStorageService: LocalStorageService) {}

  @Get(":category/:subcategory/:filename")
  @ApiOperation({ summary: "Serve static file" })
  @ApiParam({ name: "category", description: "File category" })
  @ApiParam({ name: "subcategory", description: "File subcategory" })
  @ApiParam({ name: "filename", description: "File name" })
  @ApiResponse({ status: 200, description: "File served successfully" })
  @ApiResponse({ status: 404, description: "File not found" })
  async serveFile(
    @Param("category") category: string,
    @Param("subcategory") subcategory: string,
    @Param("filename") filename: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const filePath = `${category}/${subcategory}/${filename}`;
      const fileInfo = await this.localStorageService.getFileInfo(filePath);

      if (!fileInfo) {
        throw new NotFoundException("File not found");
      }

      const fullPath = `./uploads/${filePath}`;

      // Set appropriate headers
      res.setHeader("Content-Type", fileInfo.contentType);
      res.setHeader("Content-Length", fileInfo.size.toString());
      res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour

      // For images, allow embedding
      if (fileInfo.contentType.startsWith("image/")) {
        res.setHeader("X-Content-Type-Options", "nosniff");
      }

      // Serve the file
      res.sendFile(fullPath, { root: process.cwd() });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Failed to serve file: ${errorMessage}`);
      throw new NotFoundException("File not found");
    }
  }

  @Get(":category/:filename")
  @ApiOperation({ summary: "Serve static file (no subcategory)" })
  @ApiParam({ name: "category", description: "File category" })
  @ApiParam({ name: "filename", description: "File name" })
  @ApiResponse({ status: 200, description: "File served successfully" })
  @ApiResponse({ status: 404, description: "File not found" })
  async serveFileNoSubcategory(
    @Param("category") category: string,
    @Param("filename") filename: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const filePath = `${category}/${filename}`;
      const fileInfo = await this.localStorageService.getFileInfo(filePath);

      if (!fileInfo) {
        throw new NotFoundException("File not found");
      }

      const fullPath = `./uploads/${filePath}`;

      // Set appropriate headers
      res.setHeader("Content-Type", fileInfo.contentType);
      res.setHeader("Content-Length", fileInfo.size.toString());
      res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour

      // For images, allow embedding
      if (fileInfo.contentType.startsWith("image/")) {
        res.setHeader("X-Content-Type-Options", "nosniff");
      }

      // Serve the file
      res.sendFile(fullPath, { root: process.cwd() });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Failed to serve file: ${errorMessage}`);
      throw new NotFoundException("File not found");
    }
  }
}
