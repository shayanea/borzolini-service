import { ValueTransformer } from 'typeorm';

/**
 * Custom column type transformer for pgvector's vector type
 * Converts between TypeScript number[] and PostgreSQL vector
 */
export const VectorTransformer: ValueTransformer = {
  /**
   * Transforms value from database to entity
   * Database returns vector as string like: "[0.1, 0.2, 0.3]"
   */
  from(value: string | null): number[] | null {
    if (!value) return null;

    // Handle different formats the database might return
    if (typeof value === 'string') {
      // Remove brackets and split by comma
      const cleaned = value.replace(/[\[\]]/g, '').trim();
      if (!cleaned) return null;

      return cleaned.split(',').map((num) => parseFloat(num.trim()));
    }

    // If it's already an array, return as is
    if (Array.isArray(value)) {
      return value;
    }

    return null;
  },

  /**
   * Transforms value from entity to database
   * Converts number[] to PostgreSQL vector format: "[0.1, 0.2, 0.3]"
   */
  to(value: number[] | null): string | null {
    if (!value || !Array.isArray(value) || value.length === 0) {
      return null;
    }

    // Format as PostgreSQL vector: [0.1, 0.2, 0.3]
    return `[${value.join(',')}]`;
  },
};
