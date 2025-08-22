import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Module({
  imports: [ConfigModule],
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}
