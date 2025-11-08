export interface PawDiseasePrototype {
  name: string;
  category: 'bacterial' | 'fungal' | 'parasitic' | 'injury' | 'cyst' | 'nail_bed' | 'healthy' | 'other';
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

export const PAW_DISEASE_PROTOTYPES: PawDiseasePrototype[] = [
  { name: 'Healthy paws', category: 'healthy', urgency: 'routine', description: 'No visible paw abnormalities', features: createPlaceholderFeatures(1) },
  { name: 'Interdigital cysts', category: 'cyst', urgency: 'soon', description: 'Inflamed cysts between toes', features: createPlaceholderFeatures(2) },
  { name: 'Pad injuries/cracks', category: 'injury', urgency: 'soon', description: 'Cuts, abrasions, or cracking of pads', features: createPlaceholderFeatures(3) },
  { name: 'Nail bed infection', category: 'nail_bed', urgency: 'soon', description: 'Infection around claw base', features: createPlaceholderFeatures(4) },
  { name: 'Pododermatitis', category: 'bacterial', urgency: 'soon', description: 'Inflammation of paws/pads', features: createPlaceholderFeatures(5) },
  { name: 'Foreign object in pad', category: 'injury', urgency: 'urgent', description: 'Debris embedded in pad', features: createPlaceholderFeatures(6) },
];

export const getPawDiseasePrototypesForBreed = (breed?: string): PawDiseasePrototype[] => {
  if (!breed) return PAW_DISEASE_PROTOTYPES;
  const breedLower = breed.toLowerCase();
  return PAW_DISEASE_PROTOTYPES.map((p) => {
    const isHighRisk = p.breedRiskFactors?.some((b) => b.toLowerCase() === breedLower);
    return { ...p, urgency: isHighRisk && p.urgency === 'soon' ? 'urgent' : p.urgency };
  });
};


