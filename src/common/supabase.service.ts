import { SupabaseClient, createClient } from '@supabase/supabase-js';

import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SupabaseService {
  private supabase!: SupabaseClient;
  private supabaseAdmin!: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.initializeClients();
  }

  private initializeClients() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    const supabaseServiceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration is missing');
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);

    if (supabaseServiceRoleKey) {
      this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    }
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  getAdminClient(): SupabaseClient {
    if (!this.supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }
    return this.supabaseAdmin;
  }

  async testConnection(): Promise<boolean> {
    try {
      const { error } = await this.supabase.from('users').select('id').limit(1);

      if (error) {
        console.error('Supabase connection test failed:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Supabase connection test error:', error);
      return false;
    }
  }

  async getTableInfo(tableName: string): Promise<any> {
    try {
      const { data, error } = await this.supabase.from(tableName).select('*').limit(1);

      if (error) {
        throw error;
      }

      return {
        tableName,
        hasData: data && data.length > 0,
        sampleData: data?.[0] || null,
      };
    } catch (error) {
      console.error(`Error getting table info for ${tableName}:`, error);
      throw error;
    }
  }
}
