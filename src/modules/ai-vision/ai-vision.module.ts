import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiVisionController } from './ai-vision.controller';
import { ImagePreprocessingService } from './services/image-preprocessing.service';
import { TensorFlowFeatureExtractorService } from './services/tensorflow-feature-extractor.service';
import { SkinDiseaseClassifierService } from './services/skin-disease-classifier.service';
import { AgeWeightEstimatorService } from './services/age-weight-estimator.service';
import { AiHealthModule } from '../ai-health/ai-health.module';

@Module({
  imports: [ConfigModule, AiHealthModule],
  controllers: [AiVisionController],
  providers: [
    ImagePreprocessingService,
    TensorFlowFeatureExtractorService,
    SkinDiseaseClassifierService,
    AgeWeightEstimatorService,
  ],
  exports: [
    ImagePreprocessingService,
    TensorFlowFeatureExtractorService,
    SkinDiseaseClassifierService,
    AgeWeightEstimatorService,
  ],
})
export class AiVisionModule {}

