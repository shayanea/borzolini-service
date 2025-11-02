import { Injectable, Logger } from '@nestjs/common';
import { getDiseasePrototypesForBreed } from '../constants/disease-prototypes';

export interface ClassifiedCondition {
  name: string;
  category: string;
  probability: number;
  severity: 'mild' | 'moderate' | 'severe';
  urgency: 'routine' | 'soon' | 'urgent' | 'emergency';
}

export interface SpatialAnalysis {
  regions: Array<{ location: string; severity: number }>;
  visualFeatures: {
    redness: number;
    inflammation: number;
    hairLoss: number;
    lesions: number;
    scaling: number;
  };
}

@Injectable()
export class SkinDiseaseClassifierService {
  private readonly _logger = new Logger(SkinDiseaseClassifierService.name);

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
  analyzeSpatial(
    patchFeatures: Float32Array,
    globalFeatures: Float32Array
  ): SpatialAnalysis {
    const patchDim = globalFeatures.length; // Feature dimension
    const gridSize = 16; // 16x16 patches for 224x224 input
    const numPatches = 256;

    // Calculate activation strength for each patch
    const patchActivations: number[] = [];
    for (let i = 0; i < numPatches; i++) {
      const patchStart = i * patchDim;
      const patchEnd = patchStart + patchDim;
      const patch = patchFeatures.slice(patchStart, patchEnd);

      // L2 norm as activation strength
      let norm = 0;
      for (let j = 0; j < patch.length; j++) {
        norm += patch[j] * patch[j];
      }
      patchActivations.push(Math.sqrt(norm));
    }

    // Find top affected patches
    const topPatches = patchActivations
      .map((activation, index) => ({ activation, index }))
      .sort((a, b) => b.activation - a.activation)
      .slice(0, 5);

    const regions = topPatches.map((patch) => ({
      location: this.patchIndexToLocation(patch.index, gridSize),
      severity: this.normalizeActivation(patch.activation),
    }));

    // Extract visual features from activations
    const visualFeatures = this.extractVisualFeatures(patchActivations);

    return { regions, visualFeatures };
  }

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
  private cosineSimilarity(a: Float32Array, b: Float32Array): number {
    if (a.length !== b.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (denominator === 0) {
      return 0;
    }

    return dotProduct / denominator;
  }

  /**
   * Convert similarity scores to probabilities using softmax
   */
  private softmax(values: number[]): number[] {
    const max = Math.max(...values);
    const exps = values.map((v) => Math.exp(v - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map((e) => e / sum);
  }

  /**
   * Determine severity based on probability
   */
  private determineSeverity(
    probability: number
  ): 'mild' | 'moderate' | 'severe' {
    if (probability > 0.7) {
      return 'severe';
    } else if (probability > 0.4) {
      return 'moderate';
    }
    return 'mild';
  }

  /**
   * Convert patch index to location description
   */
  private patchIndexToLocation(
    index: number,
    gridSize: number
  ): string {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;

    const rowLabel =
      row < gridSize / 3
        ? 'upper'
        : row < (2 * gridSize) / 3
          ? 'middle'
          : 'lower';
    const colLabel =
      col < gridSize / 3
        ? 'left'
        : col < (2 * gridSize) / 3
          ? 'center'
          : 'right';

    return `${rowLabel} ${colLabel}`;
  }

  /**
   * Normalize activation value to 0-1 range
   */
  private normalizeActivation(activation: number): number {
    // Heuristic normalization - adjust based on actual activation ranges
    return Math.min(1, activation / 10);
  }

  /**
   * Extract visual features from patch activations
   */
  private extractVisualFeatures(activations: number[]): {
    redness: number;
    inflammation: number;
    hairLoss: number;
    lesions: number;
    scaling: number;
  } {
    const max = Math.max(...activations);
    const mean = activations.reduce((a, b) => a + b, 0) / activations.length;
    const variance =
      activations.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      activations.length;

    return {
      redness: Math.min(1, (mean / max) * 0.7),
      inflammation: Math.min(1, (mean / max) * 0.8),
      hairLoss: Math.min(1, (variance / max) * 0.6),
      lesions: Math.min(1, ((max / mean - 1) * 0.5) || 0),
      scaling: Math.min(1, (variance / mean) * 0.7),
    };
  }
}

