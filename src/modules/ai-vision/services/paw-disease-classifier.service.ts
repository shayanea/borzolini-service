import { Injectable } from '@nestjs/common';
import { BaseBodyPartClassifierService, ClassifiedCondition } from './base-body-part-classifier.service';
import { getPawDiseasePrototypesForBreed } from '../constants/paw-disease-prototypes';

@Injectable()
export class PawDiseaseClassifierService extends BaseBodyPartClassifierService {

  classify(
    features: { globalFeatures: Float32Array; patchFeatures: Float32Array },
    _species: 'cat' | 'dog',
    breed?: string
  ): { conditions: ClassifiedCondition[]; confidence: number; detected: boolean } {
    const prototypes = getPawDiseasePrototypesForBreed(breed);
    const similarities = prototypes.map((proto) => ({
      prototype: proto,
      similarity: this.cosineSimilarity(features.globalFeatures, proto.features),
    }));
    const probabilities = this.softmax(similarities.map((s) => s.similarity));
    const conditions: ClassifiedCondition[] = prototypes.map((proto, index) => {
      const probability = probabilities[index] ?? 0;
      return {
        name: proto.name,
        category: proto.category,
        probability,
        severity: this.determineSeverity(probability),
        urgency: proto.urgency,
      } as ClassifiedCondition;
    });
    conditions.sort((a, b) => b.probability - a.probability);
    const topConditions = conditions.filter((c) => c.probability > 0.1);
    const topCondition = topConditions[0];
    const confidence = topCondition?.probability ?? 0;
    const detected = topCondition !== undefined && topCondition.category !== 'healthy' && confidence > 0.4;
    return { conditions: topConditions.slice(0, 3), confidence, detected: detected ?? false };
  }
}


