import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Injectable()
export class FileUploadService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Upload file to Supabase storage
   */
  async uploadFile(
    bucket: string,
    path: string,
    file: Buffer,
    contentType: string,
  ): Promise<string> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .storage
        .from(bucket)
        .upload(path, file, {
          contentType,
          upsert: true,
        });

      if (error) {
        throw new Error(`File upload failed: ${error.message}`);
      }

      const { data: urlData } = this.supabaseService
        .getClient()
        .storage
        .from(bucket)
        .getPublicUrl(path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  /**
   * Delete file from Supabase storage
   */
  async deleteFile(bucket: string, path: string): Promise<boolean> {
    try {
      const { error } = await this.supabaseService
        .getClient()
        .storage
        .from(bucket)
        .remove([path]);

      if (error) {
        throw new Error(`File deletion failed: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('File deletion error:', error);
      return false;
    }
  }

  /**
   * Get file URL from Supabase storage
   */
  getFileUrl(bucket: string, path: string): string {
    const { data } = this.supabaseService
      .getClient()
      .storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  /**
   * List files in a bucket
   */
  async listFiles(bucket: string, path?: string): Promise<string[]> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .storage
        .from(bucket)
        .list(path || '');

      if (error) {
        throw new Error(`File listing failed: ${error.message}`);
      }

      return data.map(file => file.name);
    } catch (error) {
      console.error('File listing error:', error);
      return [];
    }
  }
}
