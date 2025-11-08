export interface EyeDiseasePrototype {
  name: string;
  category: 'bacterial' | 'ulcer' | 'dry_eye' | 'cataract' | 'conjunctivitis' | 'healthy' | 'other';
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

export const EYE_DISEASE_PROTOTYPES: EyeDiseasePrototype[] = [
  { name: 'Healthy eyes', category: 'healthy', urgency: 'routine', description: 'No visible eye abnormalities', features: createPlaceholderFeatures(1) },
  { name: 'Conjunctivitis', category: 'conjunctivitis', urgency: 'soon', description: 'Redness and discharge due to inflammation', features: createPlaceholderFeatures(2) },
  { name: 'Corneal ulcer', category: 'ulcer', urgency: 'urgent', description: 'Ulceration of corneal surface', features: createPlaceholderFeatures(3) },
  { name: 'Dry eye (KCS)', category: 'dry_eye', urgency: 'soon', description: 'Decreased tear production', features: createPlaceholderFeatures(4) },
  { name: 'Cataract', category: 'cataract', urgency: 'routine', description: 'Lens opacity causing vision impairment', features: createPlaceholderFeatures(5) },
  { name: 'Bacterial infection', category: 'bacterial', urgency: 'soon', description: 'Purulent discharge and swelling', features: createPlaceholderFeatures(6) },
];

export const getEyeDiseasePrototypesForBreed = (breed?: string): EyeDiseasePrototype[] => {
  if (!breed) return EYE_DISEASE_PROTOTYPES;
  const breedLower = breed.toLowerCase();
  return EYE_DISEASE_PROTOTYPES.map((p) => {
    const isHighRisk = p.breedRiskFactors?.some((b) => b.toLowerCase() === breedLower);
    return { ...p, urgency: isHighRisk && p.urgency === 'soon' ? 'urgent' : p.urgency };
  });
};


