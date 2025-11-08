import { Injectable, Logger } from '@nestjs/common';

export type SeverityLevel = 'mild' | 'moderate' | 'severe';
export type UrgencyLevel = 'routine' | 'soon' | 'urgent' | 'emergency';

export interface ClassifiedCondition {
  name: string;
  category: string;
  probability: number;
  severity: SeverityLevel;
  urgency: UrgencyLevel;
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
export abstract class BaseBodyPartClassifierService {
  protected readonly logger = new Logger(BaseBodyPartClassifierService.name);

  abstract classify(
    features: { globalFeatures: Float32Array; patchFeatures: Float32Array },
    species: 'cat' | 'dog',
    breed?: string
  ): {
    conditions: ClassifiedCondition[];
    confidence: number;
    detected: boolean;
  };

  analyzeSpatial(
    patchFeatures: Float32Array,
    globalFeatures: Float32Array
  ): SpatialAnalysis {
    const patchDim = globalFeatures.length;
    const gridSize = 16; // 16x16 patches for 224x224 input
    const numPatches = 256;

    const patchActivations: number[] = [];
    for (let i = 0; i < numPatches; i++) {
      const patchStart = i * patchDim;
      const patchEnd = patchStart + patchDim;
      const patch = patchFeatures.slice(patchStart, patchEnd);

      let norm = 0;
      for (let j = 0; j < patch.length; j++) {
        const patchValue = patch[j] ?? 0;
        norm += patchValue * patchValue;
      }
      patchActivations.push(Math.sqrt(norm));
    }

    const topPatches = patchActivations
      .map((activation, index) => ({ activation, index }))
      .sort((a, b) => b.activation - a.activation)
      .slice(0, 5);

    const regions = topPatches.map((patch) => ({
      location: this.patchIndexToLocation(patch.index, gridSize),
      severity: this.normalizeActivation(patch.activation),
    }));

    const visualFeatures = this.extractVisualFeatures(patchActivations);

    return { regions, visualFeatures };
  }

  generateRecommendations(
    conditions: ClassifiedCondition[],
    visualFeatures: SpatialAnalysis['visualFeatures'],
    breed?: string
  ): string[] {
    const recommendations: string[] = [];
    const topCondition = conditions[0];

    if (!topCondition || topCondition.category === 'healthy') {
      recommendations.push('No concerns detected. Continue regular care and monitoring.');
      return recommendations;
    }

    switch (topCondition.category) {
      case 'bacterial':
        recommendations.push('Keep the affected area clean and dry');
        recommendations.push('Prevent your pet from scratching or licking the area');
        recommendations.push('Schedule a veterinary appointment for appropriate treatment');
        break;
      case 'fungal':
        recommendations.push('Disinfect bedding and living areas');
        recommendations.push('Seek veterinary care for antifungal medication');
        break;
      case 'allergic':
        recommendations.push('Review recent diet or environmental changes');
        recommendations.push('Consider hypoallergenic diet or environmental modifications');
        break;
      case 'parasitic':
        recommendations.push('Start flea/tick/parasite prevention immediately');
        recommendations.push('Wash all bedding in hot water');
        recommendations.push('Schedule urgent veterinary visit for treatment');
        break;
      case 'underweight':
        recommendations.push('Increase caloric intake with vet-approved diet');
        recommendations.push('Schedule a veterinary check for underlying causes');
        break;
      case 'obesity':
        recommendations.push('Start a calorie-controlled diet and exercise plan');
        recommendations.push('Schedule a veterinary weight management consultation');
        break;
      default:
        recommendations.push('Monitor the condition and seek veterinary consultation');
    }

    if (breed) {
      const breedLower = breed.toLowerCase();
      if (
        breedLower.includes('british') ||
        breedLower.includes('persian') ||
        breedLower.includes('shorthair')
      ) {
        recommendations.push(
          'Breed note: Monitor closely for breed-associated dermatologic issues'
        );
      }
    }

    if (visualFeatures.inflammation > 0.5) {
      recommendations.push('Apply cool compress to reduce inflammation (consult vet first)');
    }
    if (visualFeatures.hairLoss > 0.6) {
      recommendations.push('Document the pattern with photos for your veterinarian');
    }

    return recommendations;
  }

  needsVeterinaryConsultation(
    conditions: ClassifiedCondition[],
    visualFeatures: SpatialAnalysis['visualFeatures']
  ): boolean {
    const topCondition = conditions[0];
    if (!topCondition) return false;

    if (
      topCondition.probability > 0.7 &&
      (topCondition.urgency === 'urgent' || topCondition.urgency === 'emergency')
    ) {
      return true;
    }

    if (visualFeatures.inflammation > 0.7 || visualFeatures.lesions > 0.8) {
      return true;
    }

    if (conditions.filter((c) => c.probability > 0.4).length >= 2) {
      return true;
    }

    if (topCondition.severity === 'moderate' && topCondition.probability > 0.6) {
      return true;
    }

    return false;
  }

  protected patchIndexToLocation(index: number, gridSize: number): string {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;

    const rowLabel = row < gridSize / 3 ? 'upper' : row < (2 * gridSize) / 3 ? 'middle' : 'lower';
    const colLabel = col < gridSize / 3 ? 'left' : col < (2 * gridSize) / 3 ? 'center' : 'right';

    return `${rowLabel} ${colLabel}`;
  }

  protected normalizeActivation(activation: number): number {
    return Math.min(1, activation / 10);
  }

  protected extractVisualFeatures(activations: number[]): {
    redness: number;
    inflammation: number;
    hairLoss: number;
    lesions: number;
    scaling: number;
  } {
    if (activations.length === 0) {
      return {
        redness: 0,
        inflammation: 0,
        hairLoss: 0,
        lesions: 0,
        scaling: 0,
      };
    }
    const max = Math.max(...activations);
    const mean = activations.reduce((a, b) => a + b, 0) / activations.length;
    const variance =
      activations.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / activations.length;

    return {
      redness: max === 0 ? 0 : Math.min(1, (mean / max) * 0.7),
      inflammation: max === 0 ? 0 : Math.min(1, (mean / max) * 0.8),
      hairLoss: max === 0 ? 0 : Math.min(1, (variance / max) * 0.6),
      lesions: mean === 0 ? 0 : Math.min(1, ((max / mean - 1) * 0.5) || 0),
      scaling: mean === 0 ? 0 : Math.min(1, (variance / mean) * 0.7),
    };
  }

  protected cosineSimilarity(a: Float32Array, b: Float32Array): number {
    if (a.length !== b.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      const aVal = a[i] ?? 0;
      const bVal = b[i] ?? 0;
      dotProduct += aVal * bVal;
      normA += aVal * aVal;
      normB += bVal * bVal;
    }
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (denominator === 0) return 0;
    return dotProduct / denominator;
  }

  protected softmax(values: number[]): number[] {
    const max = Math.max(...values);
    const exps = values.map((v) => Math.exp(v - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map((e) => e / sum);
  }

  protected determineSeverity(probability: number): SeverityLevel {
    if (probability > 0.7) return 'severe';
    if (probability > 0.4) return 'moderate';
    return 'mild';
  }
}


