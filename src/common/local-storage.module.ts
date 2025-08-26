import { ConfigModule } from "@nestjs/config";
import { FileUploadController } from "./file-upload.controller";
import { LocalStorageService } from "./local-storage.service";
import { Module } from "@nestjs/common";
import { StaticFilesController } from "./static-files.controller";

@Module({
  imports: [ConfigModule],
  controllers: [FileUploadController, StaticFilesController],
  providers: [LocalStorageService],
  exports: [LocalStorageService],
})
export class LocalStorageModule {}
