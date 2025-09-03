import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnimalFaq } from './entities/faq.entity';
import { FaqController } from './faq.controller';
import { FaqSeeder } from './faq.seeder';
import { FaqService } from './faq.service';

@Module({
  imports: [TypeOrmModule.forFeature([AnimalFaq])],
  controllers: [FaqController],
  providers: [FaqService, FaqSeeder],
  exports: [FaqService, FaqSeeder],
})
export class FaqModule {}
