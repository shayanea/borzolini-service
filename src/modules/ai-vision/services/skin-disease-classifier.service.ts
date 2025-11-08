import { Injectable } from '@nestjs/common';
import { getDiseasePrototypesForBreed } from '../constants/disease-prototypes';
import { BaseBodyPartClassifierService, ClassifiedCondition, SpatialAnalysis } from './base-body-part-classifier.service';

@Injectable()
export class SkinDiseaseClassifierService extends BaseBodyPartClassifierService {

  /**
   * Classify skin disease using zero-shot classification
   * Compares input features with disease prototypes using cosine similarity
   */
  classify(
    features: { globalFeatures: Float32Array; patchFeatures: Float32Array },
    _petSpecies: 'cat' | 'dog',
    breed?: string
  ): {
    conditions: ClassifiedCondition[];
    confidence: number;
    detected: boolean;
  } {
    // Get disease prototypes (adjusted for breed if provided)
    const prototypes = getDiseasePrototypesForBreed(breed);

    // Calculate cosine similarity with each prototype
    const similarities = prototypes.map((proto) => ({
      prototype: proto,
      similarity: this.cosineSimilarity(features.globalFeatures, proto.features),
    }));

    // Convert similarities to probabilities using softmax
    const similaritiesArray = similarities.map((s) => s.similarity);
    const probabilities = this.softmax(similaritiesArray);

    // Create conditions with probabilities
    const conditions: ClassifiedCondition[] = prototypes.map(
      (proto, index) => {
        const probability = probabilities[index] ?? 0;
        return {
          name: proto.name,
          category: proto.category,
          probability,
          severity: this.determineSeverity(probability),
          urgency: proto.urgency,
        };
      }
    );

    // Sort by probability
    conditions.sort((a, b) => b.probability - a.probability);

    // Filter out very low probability conditions
    const topConditions = conditions.filter((c) => c.probability > 0.1);

    // Overall confidence is the probability of the top condition
    const topCondition = topConditions[0];
    const confidence = topCondition?.probability ?? 0;
    const detected =
      topCondition !== undefined && topCondition.category !== 'healthy' && confidence > 0.4;

    return {
      conditions: topConditions.slice(0, 3), // Top 3 conditions
      confidence,
      detected: detected ?? false,
    };
  }

  /**
   * Analyze spatial features from patch tokens
   * Identifies affected areas in the image
   */
  // analyzeSpatial inherited

  /**
   * Generate recommendations based on detected conditions
   */
  generateRecommendations(
    conditions: ClassifiedCondition[],
    visualFeatures: SpatialAnalysis['visualFeatures'],
    breed?: string
  ): string[] {
    const recommendations: string[] = [];
    const topCondition = conditions[0];

    if (!topCondition || topCondition.category === 'healthy') {
      recommendations.push('No skin concerns detected. Continue regular grooming and monitoring.');
      return recommendations;
    }

    // Category-specific recommendations
    switch (topCondition.category) {
      case 'bacterial':
        recommendations.push('Keep the affected area clean and dry');
        recommendations.push('Prevent your pet from scratching or licking the area');
        recommendations.push('Schedule a veterinary appointment for antibiotic treatment');
        break;

      case 'fungal':
        recommendations.push(
          'Isolate your pet from other animals (ringworm is contagious)'
        );
        recommendations.push('Disinfect bedding and living areas');
        recommendations.push('Seek veterinary care for antifungal medication');
        break;

      case 'allergic':
        recommendations.push('Review recent diet changes or environmental exposures');
        recommendations.push('Consider hypoallergenic diet or environmental modifications');
        recommendations.push('Consult veterinarian about antihistamines or allergy testing');
        break;

      case 'parasitic':
        recommendations.push('Start flea/tick prevention immediately');
        recommendations.push('Wash all bedding in hot water');
        recommendations.push('Schedule urgent veterinary visit for treatment');
        break;

      default:
        recommendations.push('Monitor the condition and seek veterinary consultation');
    }

    // Breed-specific recommendations
    if (breed) {
      const breedLower = breed.toLowerCase();
      if (
        breedLower.includes('british') ||
        breedLower.includes('persian') ||
        breedLower.includes('shorthair')
      ) {
        recommendations.push(
          'British Shorthairs/Persians: Monitor for overgrooming or stress-related skin issues'
        );
      }
    }

    // Visual feature-based recommendations
    if (visualFeatures.inflammation > 0.5) {
      recommendations.push(
        'Apply cool compress to reduce inflammation (consult vet first)'
      );
    }

    if (visualFeatures.hairLoss > 0.6) {
      recommendations.push(
        'Document hair loss pattern with photos for veterinarian'
      );
    }

    // Urgency-based recommendations
    if (topCondition.urgency === 'urgent' || topCondition.urgency === 'emergency') {
      recommendations.push('Seek immediate veterinary attention');
    }

    return recommendations;
  }

  /**
   * Determine if veterinary consultation is needed
   */
  needsVeterinaryConsultation(
    conditions: ClassifiedCondition[],
    visualFeatures: SpatialAnalysis['visualFeatures']
  ): boolean {
    const topCondition = conditions[0];

    if (!topCondition) {
      return false;
    }

    // High probability of serious condition
    if (
      topCondition.probability > 0.7 &&
      (topCondition.urgency === 'urgent' || topCondition.urgency === 'emergency')
    ) {
      return true;
    }

    // Severe visual indicators
    if (
      visualFeatures.inflammation > 0.7 ||
      visualFeatures.lesions > 0.8
    ) {
      return true;
    }

    // Multiple conditions detected
    if (conditions.filter((c) => c.probability > 0.4).length >= 2) {
      return true;
    }

    // Moderate condition with high confidence
    if (
      topCondition.severity === 'moderate' &&
      topCondition.probability > 0.6
    ) {
      return true;
    }

    return false;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  // utility methods inherited from base
}

