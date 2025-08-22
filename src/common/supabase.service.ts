import { Injectable, OnModuleInit } from '@nestjs/common';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase: SupabaseClient;
  private supabaseAdmin: SupabaseClient;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    const supabaseServiceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      throw new Error('Missing Supabase configuration. Please check your environment variables.');
    }

    // Create client for regular operations (uses anon key)
    this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
      },
    });

    // Create admin client for service operations (uses service role key)
    this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
      },
    });

    console.log('✅ Supabase client initialized successfully');
  }

  /**
   * Get the regular Supabase client (uses anon key)
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Get the admin Supabase client (uses service role key)
   */
  getAdminClient(): SupabaseClient {
    return this.supabaseAdmin;
  }

  /**
   * Get database connection string for TypeORM
   */
  getDatabaseUrl(): string {
    const host = this.configService.get<string>('SUPABASE_DB_HOST');
    const port = this.configService.get<string>('SUPABASE_DB_PORT') || '5432';
    const username = this.configService.get<string>('SUPABASE_DB_USERNAME') || 'postgres';
    const password = this.configService.get<string>('SUPABASE_DB_PASSWORD');
    const database = this.configService.get<string>('SUPABASE_DB_NAME') || 'postgres';

    return `postgresql://${username}:${password}@${host}:${port}/${database}`;
  }

  /**
   * Get storage bucket name
   */
  getStorageBucket(): string {
    return this.configService.get<string>('SUPABASE_STORAGE_BUCKET') || 'clinic-files';
  }

  /**
   * Get storage URL
   */
  getStorageUrl(): string {
    return this.configService.get<string>('SUPABASE_STORAGE_URL') || '';
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('_dummy_table_for_connection_test')
        .select('*')
        .limit(1);

      // We expect an error for non-existent table, but connection should work
      return !error || error.code !== 'PGRST116';
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  /**
   * Get real-time subscription for a table
   */
  getRealtimeSubscription(table: string, callback: (payload: any) => void) {
    return this.supabase
      .channel(`public:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
      .subscribe();
  }
}
