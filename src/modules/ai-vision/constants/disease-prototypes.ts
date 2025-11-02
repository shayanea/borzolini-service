/**
 * Disease prototypes for zero-shot classification
 * These represent typical DINOv2 feature vectors for each condition
 * In production, these would be pre-computed from reference images
 */
export interface DiseasePrototype {
  name: string;
  category: 'bacterial' | 'fungal' | 'allergic' | 'parasitic' | 'healthy' | 'other';
  urgency: 'routine' | 'soon' | 'urgent' | 'emergency';
  description: string;
  features: Float32Array; // 256-dim TensorFlow.js feature vector (placeholder)
  breedRiskFactors?: string[]; // Breeds more prone to this condition
}

/**
 * Placeholder feature vectors - in production, these would be computed
 * from actual reference images using the trained TensorFlow.js model
 */
const createPlaceholderFeatures = (_seed: number): Float32Array => {
  const features = new Float32Array(256); // 256-dim feature vector
  for (let i = 0; i < 256; i++) {
    features[i] = (Math.random() - 0.5) * 0.1; // Small random values for placeholder
  }
  return features;
};

export const DISEASE_PROTOTYPES: DiseasePrototype[] = [
  {
    name: 'Healthy skin',
    category: 'healthy',
    urgency: 'routine',
    description: 'No visible skin abnormalities detected',
    features: createPlaceholderFeatures(1),
  },
  {
    name: 'Bacterial dermatosis',
    category: 'bacterial',
    urgency: 'soon',
    description: 'Bacterial skin infection, often from scratching or trauma',
    features: createPlaceholderFeatures(2),
  },
  {
    name: 'Fungal infection',
    category: 'fungal',
    urgency: 'soon',
    description: 'Fungal skin condition that may require antifungal treatment',
    features: createPlaceholderFeatures(3),
    breedRiskFactors: ['British Shorthair', 'Persian'],
  },
  {
    name: 'Allergic dermatitis',
    category: 'allergic',
    urgency: 'routine',
    description: 'Allergic skin reaction, often from food, fleas, or environmental allergens',
    features: createPlaceholderFeatures(4),
  },
  {
    name: 'Parasitic infestation',
    category: 'parasitic',
    urgency: 'urgent',
    description: 'Skin condition caused by external parasites like mites or fleas',
    features: createPlaceholderFeatures(5),
  },
  {
    name: 'Hot spots',
    category: 'bacterial',
    urgency: 'soon',
    description: 'Acute moist dermatitis, painful inflamed areas that develop rapidly',
    features: createPlaceholderFeatures(6),
  },
  {
    name: 'Ringworm',
    category: 'fungal',
    urgency: 'urgent',
    description: 'Highly contagious fungal infection affecting skin and coat',
    features: createPlaceholderFeatures(7),
    breedRiskFactors: ['British Shorthair', 'Persian'],
  },
  {
    name: 'Flea allergy',
    category: 'allergic',
    urgency: 'soon',
    description: 'Allergic reaction to flea bites causing intense itching',
    features: createPlaceholderFeatures(8),
  },
  {
    name: 'Seborrhea',
    category: 'other',
    urgency: 'routine',
    description: 'Skin disorder causing flaky, itchy, red skin',
    features: createPlaceholderFeatures(9),
  },
  {
    name: 'Mange',
    category: 'parasitic',
    urgency: 'urgent',
    description: 'Skin disease caused by parasitic mites',
    features: createPlaceholderFeatures(10),
  },
];

export const getDiseasePrototypesForBreed = (
  breed?: string
): DiseasePrototype[] => {
  if (!breed) {
    return DISEASE_PROTOTYPES;
  }

  const breedLower = breed.toLowerCase();
  return DISEASE_PROTOTYPES.map(prototype => {
    const isHighRisk = prototype.breedRiskFactors?.some(
      riskBreed => riskBreed.toLowerCase() === breedLower
    );

    return {
      ...prototype,
      // Adjust urgency if breed is at higher risk
      urgency:
        isHighRisk && prototype.urgency === 'soon'
          ? 'urgent'
          : prototype.urgency,
    };
  });
};

