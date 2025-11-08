export interface BodyConditionPrototype {
  name: string;
  category: 'underweight' | 'ideal' | 'overweight' | 'obesity' | 'muscle_wasting' | 'healthy' | 'other';
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

export const BODY_CONDITION_PROTOTYPES: BodyConditionPrototype[] = [
  { name: 'Healthy (ideal)', category: 'ideal', urgency: 'routine', description: 'Ideal body condition', features: createPlaceholderFeatures(1) },
  { name: 'Underweight', category: 'underweight', urgency: 'soon', description: 'Ribs/spine prominent, low muscle mass', features: createPlaceholderFeatures(2) },
  { name: 'Overweight', category: 'overweight', urgency: 'routine', description: 'Excess fat cover, reduced waist definition', features: createPlaceholderFeatures(3) },
  { name: 'Obesity', category: 'obesity', urgency: 'soon', description: 'Marked fat deposits, no waist', features: createPlaceholderFeatures(4) },
  { name: 'Muscle wasting', category: 'muscle_wasting', urgency: 'soon', description: 'Loss of muscle mass', features: createPlaceholderFeatures(5) },
];

export const getBodyConditionPrototypesForBreed = (breed?: string): BodyConditionPrototype[] => {
  if (!breed) return BODY_CONDITION_PROTOTYPES;
  const breedLower = breed.toLowerCase();
  return BODY_CONDITION_PROTOTYPES.map((p) => {
    const isHighRisk = p.breedRiskFactors?.some((b) => b.toLowerCase() === breedLower);
    return { ...p, urgency: isHighRisk && p.urgency === 'routine' ? 'soon' : p.urgency };
  });
};


