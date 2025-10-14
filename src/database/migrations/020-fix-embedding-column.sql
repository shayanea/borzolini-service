-- Migration: Fix embedding column to use JSONB instead of vector
-- Description: Replaces vector type with JSONB to avoid pgvector dependency
-- Date: 2025-10-14

-- Drop the vector-based embedding column if it exists
ALTER TABLE ai_health_insights DROP COLUMN IF EXISTS embedding;

-- Add embedding column as JSONB
ALTER TABLE ai_health_insights 
ADD COLUMN embedding JSONB;

-- Create GIN index for better JSON query performance (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_ai_health_insights_embedding_gin 
ON ai_health_insights 
USING gin (embedding);

-- Add comment for documentation
COMMENT ON COLUMN ai_health_insights.embedding IS 'Vector embedding stored as JSONB array (dimension 1536) for semantic similarity';

