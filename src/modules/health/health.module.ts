import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../common/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
