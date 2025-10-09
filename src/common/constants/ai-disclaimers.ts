/**
 * AI Health Disclaimers
 *
 * Critical medical and legal disclaimers for AI-generated health recommendations
 * These disclaimers comply with healthcare regulations and protect users
 *
 * @module ai-disclaimers
 */

/**
 * Standard AI disclaimers for various contexts
 */
export const AI_DISCLAIMERS = {
  /**
   * Primary disclaimer for all AI health advice
   */
  PRIMARY: 'This AI-generated advice is for informational purposes only and does not replace professional veterinary care. Always consult with a licensed veterinarian for medical decisions.',

  /**
   * Short version for API responses
   */
  SHORT: 'AI advice is informational only. Consult a veterinarian for medical decisions.',

  /**
   * Detailed version for comprehensive responses
   */
  DETAILED:
    "These AI-generated recommendations are provided for informational and educational purposes only. They are not a substitute for professional veterinary advice, diagnosis, or treatment. Always seek the advice of your veterinarian or other qualified pet health provider with any questions you may have regarding your pet's medical condition. Never disregard professional veterinary advice or delay in seeking it because of AI-generated recommendations. The AI system is designed to assist, not replace, the relationship between you and your veterinarian.",

  /**
   * Urgent insight specific disclaimer
   */
  URGENT: 'URGENT: This is an AI-detected concern. If your pet shows emergency symptoms (difficulty breathing, severe bleeding, seizures, loss of consciousness), contact an emergency veterinarian immediately.',

  /**
   * Health score disclaimer
   */
  HEALTH_SCORE: 'Health scores are AI-calculated estimates based on available data and do not represent a clinical diagnosis. Consult your veterinarian for accurate health assessments.',

  /**
   * Prediction disclaimer
   */
  PREDICTION: 'AI predictions are probability-based estimates and may not be accurate. They should be used as one of many factors in decision-making, not as definitive medical guidance.',

  /**
   * Emergency alert disclaimer
   */
  EMERGENCY: 'If you believe your pet is experiencing a medical emergency, do not rely on AI recommendations. Contact an emergency veterinarian or animal hospital immediately.',
} as const;

/**
 * Get appropriate disclaimer based on insight urgency and type
 *
 * @param urgencyLevel - The urgency level of the insight
 * @param insightType - The type of insight
 * @returns Appropriate disclaimer text
 */
export function getDisclaimerForInsight(urgencyLevel: string, insightType: string): string {
  // Emergency and urgent cases get special disclaimers
  if (urgencyLevel === 'urgent' || insightType === 'emergency') {
    return AI_DISCLAIMERS.URGENT;
  }

  // Predictions get prediction-specific disclaimer
  if (insightType === 'prediction') {
    return AI_DISCLAIMERS.PREDICTION;
  }

  // All other cases get the primary disclaimer
  return AI_DISCLAIMERS.PRIMARY;
}

/**
 * Get disclaimer for health dashboard
 */
export function getHealthDashboardDisclaimer(): string {
  return AI_DISCLAIMERS.HEALTH_SCORE;
}

/**
 * Get combined disclaimer for multiple insights
 */
export function getCombinedDisclaimer(): string {
  return AI_DISCLAIMERS.DETAILED;
}
