import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Body,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ImagePreprocessingService } from './services/image-preprocessing.service';
import { TensorFlowFeatureExtractorService } from './services/tensorflow-feature-extractor.service';
import { SkinDiseaseClassifierService } from './services/skin-disease-classifier.service';
import { AgeWeightEstimatorService } from './services/age-weight-estimator.service';
import { AnalyzeSkinDto } from './dto/analyze-skin.dto';
import { SkinAnalysisResponseDto } from './dto/skin-analysis-response.dto';

@ApiTags('AI Vision')
@Controller('ai-vision')
@UseGuards(JwtAuthGuard)
export class AiVisionController {
  private readonly logger = new Logger(AiVisionController.name);

  constructor(
    private readonly imagePreprocessing: ImagePreprocessingService,
    private readonly featureExtractor: TensorFlowFeatureExtractorService,
    private readonly classifier: SkinDiseaseClassifierService,
    private readonly ageWeightEstimator: AgeWeightEstimatorService
  ) {}

  @Post('analyze-skin')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpeg|png)$/)) {
          return cb(
            new BadRequestException('Only JPEG and PNG images are allowed'),
            false
          );
        }
        cb(null, true);
      },
    })
  )
  @ApiOperation({
    summary: 'Analyze pet skin condition',
    description:
      'Analyzes uploaded pet skin image for disease detection using TensorFlow.js. Optionally estimates age and weight. Returns detected conditions, affected areas, and recommendations.',
  })
  @ApiResponse({
    status: 200,
    description: 'Analysis completed successfully',
    type: SkinAnalysisResponseDto,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Pet skin image (JPEG or PNG, max 10MB)',
        },
        species: {
          type: 'string',
          enum: ['cat', 'dog'],
          description: 'Pet species',
        },
        breed: {
          type: 'string',
          description: 'Pet breed (optional)',
        },
        symptoms: {
          type: 'string',
          description: 'Additional symptoms description (optional)',
        },
        petId: {
          type: 'string',
          format: 'uuid',
          description: 'Pet ID for AI health insights integration (optional)',
        },
      },
      required: ['image', 'species'],
    },
  })
  async analyzeSkin(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: AnalyzeSkinDto
  ): Promise<SkinAnalysisResponseDto> {
    const startTime = Date.now();

    try {
      // Validate file
      if (!file) {
        throw new BadRequestException('No image file provided');
      }

      if (!dto.species) {
        throw new BadRequestException('Pet species is required');
      }

      this.logger.log(
        `Analyzing skin image for ${dto.species}${dto.breed ? ` (${dto.breed})` : ''}`
      );

      // Preprocess image
      const preprocessedImage =
        await this.imagePreprocessing.preprocessImage(file.buffer);

      // Extract features using TensorFlow.js
      const features = await this.featureExtractor.extractFeatures(
        preprocessedImage
      );

      // Classify skin condition
      const classification = this.classifier.classify(
        features,
        dto.species,
        dto.breed
      );

      // Analyze spatial features
      const spatialAnalysis = this.classifier.analyzeSpatial(
        features.patchFeatures,
        features.globalFeatures
      );

      // Generate recommendations
      const recommendations = this.classifier.generateRecommendations(
        classification.conditions,
        spatialAnalysis.visualFeatures,
        dto.breed
      );

      // Determine if vet consultation is needed
      const needsVet = this.classifier.needsVeterinaryConsultation(
        classification.conditions,
        spatialAnalysis.visualFeatures
      );

      // Optional: Estimate age and weight
      let ageEstimate, weightEstimate;
      if (dto.estimateAgeWeight === true) {
        try {
          // Prefer multi-task model age prediction if available
          if (this.featureExtractor.isMultiTaskAgeModel()) {
            const ageMonths = await this.featureExtractor.predictAgeMonths(preprocessedImage);
            if (typeof ageMonths === 'number' && Number.isFinite(ageMonths)) {
              const calibrated = this.featureExtractor.calibrateAgeMonths(dto.species, ageMonths, dto.breed);
              const months = Math.max(0, Math.round(calibrated));
              const years = Math.round((months / 12) * 10) / 10;
              // Map to lifeStage by species
              let lifeStage: 'kitten' | 'young' | 'adult' | 'senior';
              if (dto.species === 'cat') {
                if (months < 12) lifeStage = 'kitten';
                else if (months < 36) lifeStage = 'young';
                else if (months < 120) lifeStage = 'adult';
                else lifeStage = 'senior';
              } else {
                if (months < 12) lifeStage = 'kitten'; // puppy
                else if (months < 24) lifeStage = 'young';
                else if (months < 84) lifeStage = 'adult';
                else lifeStage = 'senior';
              }
              const range = years < 1
                ? `${Math.max(0, months - 3)}-${months + 3} months`
                : `${Math.max(0, Math.floor(years - 1))}-${Math.ceil(years + 1)} years`;
              ageEstimate = {
                estimatedYears: years,
                estimatedMonths: months,
                ageRange: range,
                lifeStage,
                confidence: 0.7, // heuristic; can be improved with calibration
              };
            }
          }
          // Fallback to heuristic estimator (and for weight)
          if (!ageEstimate || !weightEstimate) {
            const ageWeightResult = await this.ageWeightEstimator.estimateAgeAndWeight(
              file.buffer,
              dto.species,
              dto.breed
            );
            if (!ageEstimate) ageEstimate = ageWeightResult.age;
            if (!weightEstimate) weightEstimate = ageWeightResult.weight;
          }
        } catch (error) {
          this.logger.warn('Age/weight estimation failed:', error);
        }
      }

      // Cleanup
      preprocessedImage.dispose();

      const processingTime = Date.now() - startTime;

      const response: SkinAnalysisResponseDto = {
        detected: classification.detected,
        confidence: classification.confidence,
        conditions: classification.conditions,
        affectedAreas: spatialAnalysis.regions,
        visualFeatures: spatialAnalysis.visualFeatures,
        recommendations,
        veterinaryConsultation: needsVet,
        success: true,
        processingTimeMs: processingTime,
        ...(ageEstimate && { ageEstimate }),
        ...(weightEstimate && { weightEstimate }),
      };

      this.logger.log(
        `Skin analysis completed in ${processingTime}ms. Detected: ${classification.detected}, Confidence: ${(classification.confidence * 100).toFixed(1)}%`
      );

      return response;
    } catch (error) {
      this.logger.error('Skin analysis failed:', error);

      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to analyze skin image. Please try again.'
      );
    }
  }
}

