import { CommonService } from './common.service';
import { DatabaseService } from './database.service';
import { EmailService } from './email.service';
import { FileUploadService } from './file-upload.service';
import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { SupabaseService } from './supabase.service';

@Module({
  providers: [
    CommonService,
    DatabaseService,
    EmailService,
    FileUploadService,
    NotificationService,
    SupabaseService,
  ],
  exports: [
    CommonService,
    DatabaseService,
    EmailService,
    FileUploadService,
    NotificationService,
    SupabaseService,
  ],
})
export class CommonModule {}
