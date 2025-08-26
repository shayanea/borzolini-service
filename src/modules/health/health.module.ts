import { CommonModule } from "../../common/common.module";
import { HealthController } from "./health.controller";
import { HealthService } from "./health.service";
import { Module } from "@nestjs/common";
import { SupabaseModule } from "../../common/supabase.module";

@Module({
  imports: [CommonModule, SupabaseModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
