-- Migration: Add embeddings to AI health insights (JSONB version)
-- Description: Stores embeddings as JSONB for semantic deduplication (no pgvector required)
-- Date: 2025-10-14
-- Note: This is an alternative to the vector version for environments without pgvector

-- Add embedding column to ai_health_insights table as JSONB
-- Stores embeddings as JSON array for OpenAI text-embedding-3-small or text-embedding-ada-002
ALTER TABLE ai_health_insights 
ADD COLUMN IF NOT EXISTS embedding JSONB;

-- Create GIN index for better JSON query performance
CREATE INDEX IF NOT EXISTS idx_ai_health_insights_embedding_gin 
ON ai_health_insights 
USING gin (embedding);

-- Add comment for documentation
COMMENT ON COLUMN ai_health_insights.embedding IS 'Vector embedding stored as JSONB array (dimension 1536) for semantic similarity';

