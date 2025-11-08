export interface EarDiseasePrototype {
  name: string;
  category: 'bacterial' | 'fungal' | 'parasitic' | 'hematoma' | 'foreign_object' | 'healthy' | 'other';
  urgency: 'routine' | 'soon' | 'urgent' | 'emergency';
  description: string;
  features: Float32Array;
  breedRiskFactors?: string[];
}

const createPlaceholderFeatures = (_seed: number): Float32Array => {
  const features = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    features[i] = (Math.random() - 0.5) * 0.1;
  }
  return features;
};

export const EAR_DISEASE_PROTOTYPES: EarDiseasePrototype[] = [
  {
    name: 'Healthy ears',
    category: 'healthy',
    urgency: 'routine',
    description: 'No visible abnormalities of the outer ear',
    features: createPlaceholderFeatures(1),
  },
  {
    name: 'Otitis externa (bacterial)',
    category: 'bacterial',
    urgency: 'soon',
    description: 'Bacterial infection of external ear canal',
    features: createPlaceholderFeatures(2),
  },
  {
    name: 'Otitis externa (yeast)',
    category: 'fungal',
    urgency: 'soon',
    description: 'Yeast overgrowth causing inflammation and discharge',
    features: createPlaceholderFeatures(3),
  },
  {
    name: 'Ear mites',
    category: 'parasitic',
    urgency: 'soon',
    description: 'Parasitic infestation causing intense itching',
    features: createPlaceholderFeatures(4),
  },
  {
    name: 'Aural hematoma',
    category: 'hematoma',
    urgency: 'urgent',
    description: 'Blood accumulation in the ear flap due to trauma/shaking',
    features: createPlaceholderFeatures(5),
  },
  {
    name: 'Foreign object',
    category: 'foreign_object',
    urgency: 'urgent',
    description: 'Grass awns or debris in the ear canal',
    features: createPlaceholderFeatures(6),
  },
];

export const getEarDiseasePrototypesForBreed = (breed?: string): EarDiseasePrototype[] => {
  if (!breed) return EAR_DISEASE_PROTOTYPES;
  const breedLower = breed.toLowerCase();
  return EAR_DISEASE_PROTOTYPES.map((p) => {
    const isHighRisk = p.breedRiskFactors?.some((b) => b.toLowerCase() === breedLower);
    return {
      ...p,
      urgency: isHighRisk && p.urgency === 'soon' ? 'urgent' : p.urgency,
    };
  });
};


