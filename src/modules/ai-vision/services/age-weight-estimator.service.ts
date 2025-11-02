import { Injectable, Logger } from '@nestjs/common';
import * as Jimp from 'jimp';

export interface AgeEstimate {
  estimatedYears: number;
  estimatedMonths: number;
  ageRange: string; // e.g., "1-2 years"
  lifeStage: 'kitten' | 'young' | 'adult' | 'senior';
  confidence: number;
}

export interface WeightEstimate {
  estimatedWeightLbs: number;
  weightRange: string; // e.g., "8-12 lbs"
  bodyConditionScore: 'underweight' | 'ideal' | 'overweight';
  confidence: number;
}

export interface AgeWeightEstimateResult {
  age: AgeEstimate;
  weight: WeightEstimate;
  visualIndicators: {
    bodySize: 'small' | 'medium' | 'large';
    coatCondition: 'healthy' | 'dull' | 'patchy';
    facialFeatures: 'juvenile' | 'mature' | 'senior';
  };
}

@Injectable()
export class AgeWeightEstimatorService {
  private readonly logger = new Logger(AgeWeightEstimatorService.name);

  /**
   * Estimate age and weight from pet image
   * Uses visual features analysis
   */
  async estimateAgeAndWeight(
    imageBuffer: Buffer,
    species: 'cat' | 'dog',
    breed?: string
  ): Promise<AgeWeightEstimateResult> {
    try {
      // Load and analyze image
      const image = await Jimp.read(imageBuffer);
      
      // Resize for analysis
      const analysisSize = 224;
      image.resize(analysisSize, analysisSize);

      // Extract visual features
      const visualFeatures = await this.extractVisualFeatures(image, species);

      // Estimate age based on visual features
      const ageEstimate = this.estimateAge(visualFeatures, species, breed);

      // Estimate weight/body condition
      const weightEstimate = this.estimateWeight(visualFeatures, species, breed);

      return {
        age: ageEstimate,
        weight: weightEstimate,
        visualIndicators: {
          bodySize: visualFeatures.bodySize,
          coatCondition: visualFeatures.coatCondition,
          facialFeatures: visualFeatures.facialMaturity,
        },
      };
    } catch (error) {
      this.logger.error('Age/weight estimation failed:', error);
      
      // Return default estimates
      return {
        age: {
          estimatedYears: 5,
          estimatedMonths: 60,
          ageRange: '3-7 years',
          lifeStage: 'adult',
          confidence: 0.3,
        },
        weight: {
          estimatedWeightLbs: 10,
          weightRange: '8-12 lbs',
          bodyConditionScore: 'ideal',
          confidence: 0.3,
        },
        visualIndicators: {
          bodySize: 'medium',
          coatCondition: 'healthy',
          facialFeatures: 'mature',
        },
      };
    }
  }

  /**
   * Extract visual features from image
   */
  private async extractVisualFeatures(
    image: Jimp,
    _species: 'cat' | 'dog'
  ): Promise<{
    bodyProportions: number; // 0-1, smaller = more compact/juvenile
    coatBrightness: number; // 0-1, higher = shinier/healthier
    coatTexture: number; // 0-1, higher = more uniform
    eyeClarity: number; // 0-1, higher = clearer/younger
    facialRoundness: number; // 0-1, higher = rounder/younger
    bodySize: 'small' | 'medium' | 'large';
    coatCondition: 'healthy' | 'dull' | 'patchy';
    facialMaturity: 'juvenile' | 'mature' | 'senior';
  }> {
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    // Analyze color distribution
    let totalBrightness = 0;
    let totalPixels = 0;
    const colorVariance = new Set<number>();

    image.scan(0, 0, width, height, (_x, _y, idx) => {
      const r = image.bitmap.data[idx];
      const g = image.bitmap.data[idx + 1];
      const b = image.bitmap.data[idx + 2];
      
      // Brightness (luminance)
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
      totalBrightness += brightness;
      
      // Color variation
      const colorKey = Math.floor((r + g + b) / 3 / 10) * 10;
      colorVariance.add(colorKey);
      
      totalPixels++;
    });

    const avgBrightness = totalBrightness / totalPixels;
    const colorVariation = colorVariance.size / 100; // Normalize

    // Body proportion analysis (heuristic based on image composition)
    // Younger animals tend to have larger heads relative to body
    const bodyProportions = Math.min(1, colorVariation * 0.7);

    // Eye clarity (simplified - in production would use eye detection)
    // Younger animals typically have clearer, brighter eyes
    const eyeClarity = Math.min(1, avgBrightness * 1.2);

    // Facial roundness (heuristic)
    // Younger animals have rounder faces
    const facialRoundness = Math.min(1, (1 - bodyProportions) * 1.3);

    // Coat condition assessment
    let coatCondition: 'healthy' | 'dull' | 'patchy';
    if (avgBrightness > 0.6 && colorVariation < 0.3) {
      coatCondition = 'healthy';
    } else if (avgBrightness < 0.4) {
      coatCondition = 'dull';
    } else {
      coatCondition = 'patchy';
    }

    // Body size estimation (relative to image)
    let bodySize: 'small' | 'medium' | 'large';
    const sizeMetric = avgBrightness * colorVariation;
    if (sizeMetric < 0.3) {
      bodySize = 'small';
    } else if (sizeMetric > 0.7) {
      bodySize = 'large';
    } else {
      bodySize = 'medium';
    }

    // Facial maturity
    let facialMaturity: 'juvenile' | 'mature' | 'senior';
    if (facialRoundness > 0.7 && eyeClarity > 0.8) {
      facialMaturity = 'juvenile';
    } else if (eyeClarity < 0.5 || bodyProportions > 0.7) {
      facialMaturity = 'senior';
    } else {
      facialMaturity = 'mature';
    }

    return {
      bodyProportions,
      coatBrightness: avgBrightness,
      coatTexture: 1 - colorVariation,
      eyeClarity,
      facialRoundness,
      bodySize,
      coatCondition,
      facialMaturity,
    };
  }

  /**
   * Estimate age based on visual features
   */
  private estimateAge(
    features: any,
    species: 'cat' | 'dog',
    breed?: string
  ): AgeEstimate {
    // Age estimation factors (species-specific)
    const ageFactors = {
      facialRoundness: 0.3, // Rounder face = younger
      eyeClarity: 0.4, // Clearer eyes = younger
      bodyProportions: 0.2, // Smaller proportions = younger
      coatBrightness: 0.1, // Shiny coat can indicate youth
    };

    // Calculate age score (0-1, where 0 = very young, 1 = very old)
    const ageScore =
      (1 - features.facialRoundness) * ageFactors.facialRoundness +
      (1 - features.eyeClarity) * ageFactors.eyeClarity +
      features.bodyProportions * ageFactors.bodyProportions +
      (1 - features.coatBrightness) * ageFactors.coatBrightness;

    // Convert to years based on species
    let estimatedYears: number;
    let lifeStage: 'kitten' | 'young' | 'adult' | 'senior';

    if (species === 'cat') {
      // Cats: 0-1 year = kitten, 1-3 = young, 3-10 = adult, 10+ = senior
      if (ageScore < 0.2) {
        estimatedYears = 0.5; // 6 months
        lifeStage = 'kitten';
      } else if (ageScore < 0.4) {
        estimatedYears = 1.5; // 18 months
        lifeStage = 'young';
      } else if (ageScore < 0.7) {
        estimatedYears = 5; // Adult
        lifeStage = 'adult';
      } else {
        estimatedYears = 12; // Senior
        lifeStage = 'senior';
      }

      // Breed-specific adjustments
      if (breed?.toLowerCase().includes('british') || 
          breed?.toLowerCase().includes('persian')) {
        // Larger breeds mature later
        if (lifeStage === 'kitten') {
          estimatedYears = 0.75;
        }
      }
    } else {
      // Dogs: 0-1 year = puppy, 1-2 = young, 2-7 = adult, 7+ = senior
      if (ageScore < 0.2) {
        estimatedYears = 0.5;
        lifeStage = 'kitten'; // puppy/kitten stage
      } else if (ageScore < 0.35) {
        estimatedYears = 1.5;
        lifeStage = 'young';
      } else if (ageScore < 0.65) {
        estimatedYears = 4;
        lifeStage = 'adult';
      } else {
        estimatedYears = 9;
        lifeStage = 'senior';
      }
    }

    // Calculate age range (±2 years for confidence)
    const ageRange = this.getAgeRange(estimatedYears);
    const estimatedMonths = Math.round(estimatedYears * 12);

    // Confidence based on feature clarity
    const confidence = Math.min(1, features.eyeClarity * 0.7 + features.coatBrightness * 0.3);

    return {
      estimatedYears: Math.round(estimatedYears * 10) / 10,
      estimatedMonths,
      ageRange,
      lifeStage,
      confidence,
    };
  }

  /**
   * Estimate weight and body condition
   */
  private estimateWeight(
    features: any,
    species: 'cat' | 'dog',
    breed?: string
  ): WeightEstimate {
    // Weight estimation is challenging without reference
    // We estimate based on body size and proportions
    
    let estimatedWeightLbs: number;
    let bodyConditionScore: 'underweight' | 'ideal' | 'overweight';

    if (species === 'cat') {
      // Typical adult cat weights: 8-12 lbs
      // Body size + proportions give weight estimate
      const weightFactor = features.bodySize === 'small' ? 0.7 : 
                          features.bodySize === 'large' ? 1.3 : 1.0;
      
      const baseWeight = 10; // Average adult cat
      estimatedWeightLbs = baseWeight * weightFactor;

      // Adjust for life stage (kittens/puppies are lighter)
      if (features.facialMaturity === 'juvenile') {
        if (species === 'cat') {
          estimatedWeightLbs *= 0.4; // Kittens: ~4 lbs
        } else {
          estimatedWeightLbs *= 0.3; // Puppies: proportionally lighter
        }
      } else if (features.facialMaturity === 'senior') {
        estimatedWeightLbs *= 0.9; // Senior cats may be lighter
      }

      // Breed-specific adjustments
      if (breed?.toLowerCase().includes('maine') || 
          breed?.toLowerCase().includes('norwegian')) {
        estimatedWeightLbs *= 1.5; // Large breeds
      } else if (breed?.toLowerCase().includes('siamese') ||
                 breed?.toLowerCase().includes('oriental')) {
        estimatedWeightLbs *= 0.8; // Smaller breeds
      }

      // Body condition score
      // Higher coat brightness + good proportions = ideal
      const conditionScore = features.coatBrightness * 0.5 + 
                           (1 - Math.abs(features.bodyProportions - 0.5)) * 0.5;

      if (conditionScore < 0.4) {
        bodyConditionScore = 'underweight';
      } else if (conditionScore > 0.7) {
        bodyConditionScore = 'overweight';
      } else {
        bodyConditionScore = 'ideal';
      }

      // Clamp to reasonable range for cats
      estimatedWeightLbs = Math.max(2, Math.min(25, estimatedWeightLbs));
    } else {
      // Dogs: vary significantly by breed
      const baseWeight = breed?.toLowerCase().includes('chihuahua') ? 6 :
                        breed?.toLowerCase().includes('great dane') ? 120 :
                        breed?.toLowerCase().includes('golden') ? 65 :
                        40; // Medium dog average

      const weightFactor = features.bodySize === 'small' ? 0.7 :
                           features.bodySize === 'large' ? 1.3 : 1.0;

      estimatedWeightLbs = baseWeight * weightFactor;

      if (features.facialMaturity === 'juvenile') {
        estimatedWeightLbs *= 0.3; // Puppies
      }

      // Body condition
      const conditionScore = features.coatBrightness * 0.5 + 
                           (1 - Math.abs(features.bodyProportions - 0.5)) * 0.5;

      if (conditionScore < 0.4) {
        bodyConditionScore = 'underweight';
      } else if (conditionScore > 0.7) {
        bodyConditionScore = 'overweight';
      } else {
        bodyConditionScore = 'ideal';
      }

      estimatedWeightLbs = Math.max(3, Math.min(200, estimatedWeightLbs));
    }

    const weightRange = this.getWeightRange(estimatedWeightLbs);
    
    // Confidence is lower for weight (harder to estimate)
    const confidence = Math.min(0.6, features.coatBrightness * 0.4 + 
                                       (1 - features.bodyProportions) * 0.4);

    return {
      estimatedWeightLbs: Math.round(estimatedWeightLbs * 10) / 10,
      weightRange,
      bodyConditionScore,
      confidence,
    };
  }

  /**
   * Get age range string
   */
  private getAgeRange(years: number): string {
    if (years < 1) {
      return `${Math.round(years * 12)}-${Math.round((years + 0.5) * 12)} months`;
    }
    const lower = Math.max(0, Math.floor(years - 1));
    const upper = Math.ceil(years + 1);
    return `${lower}-${upper} years`;
  }

  /**
   * Get weight range string
   */
  private getWeightRange(lbs: number): string {
    const lower = Math.max(1, Math.floor(lbs - 2));
    const upper = Math.ceil(lbs + 2);
    return `${lower}-${upper} lbs`;
  }
}

