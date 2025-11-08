import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiVisionController } from './ai-vision.controller';
import { ImagePreprocessingService } from './services/image-preprocessing.service';
import { TensorFlowFeatureExtractorService } from './services/tensorflow-feature-extractor.service';
import { SkinDiseaseClassifierService } from './services/skin-disease-classifier.service';
import { AgeWeightEstimatorService } from './services/age-weight-estimator.service';
import { AiHealthModule } from '../ai-health/ai-health.module';
import { EarDiseaseClassifierService } from './services/ear-disease-classifier.service';
import { PawDiseaseClassifierService } from './services/paw-disease-classifier.service';
import { EyeDiseaseClassifierService } from './services/eye-disease-classifier.service';
import { BodyConditionClassifierService } from './services/body-condition-classifier.service';

@Module({
  imports: [ConfigModule, AiHealthModule],
  controllers: [AiVisionController],
  providers: [
    ImagePreprocessingService,
    TensorFlowFeatureExtractorService,
    SkinDiseaseClassifierService,
    EarDiseaseClassifierService,
    PawDiseaseClassifierService,
    EyeDiseaseClassifierService,
    BodyConditionClassifierService,
    AgeWeightEstimatorService,
  ],
  exports: [
    ImagePreprocessingService,
    TensorFlowFeatureExtractorService,
    SkinDiseaseClassifierService,
    EarDiseaseClassifierService,
    PawDiseaseClassifierService,
    EyeDiseaseClassifierService,
    BodyConditionClassifierService,
    AgeWeightEstimatorService,
  ],
})
export class AiVisionModule {}

