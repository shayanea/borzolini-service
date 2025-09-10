import { Clinic } from '../clinics/entities/clinic.entity';
import { Module } from '@nestjs/common';
import { SocialMediaController } from './social-media.controller';
import { SocialMediaService } from './social-media.service';
import { SocialMediaSimpleService } from './social-media-simple.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Clinic])],
  controllers: [SocialMediaController],
  providers: [SocialMediaService, SocialMediaSimpleService],
  exports: [SocialMediaService, SocialMediaSimpleService],
})
export class SocialMediaModule {}
