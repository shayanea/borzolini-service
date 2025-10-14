-- Migration: Remove pgvector dependency and fix embedding column
-- Description: Drops vector extension and converts embedding to JSONB
-- Date: 2025-10-14

-- First, drop any indexes that depend on the vector type
DROP INDEX IF EXISTS idx_ai_health_insights_embedding;

-- Drop the embedding column that uses vector type
ALTER TABLE ai_health_insights DROP COLUMN IF EXISTS embedding CASCADE;

-- Drop the vector extension
DROP EXTENSION IF EXISTS vector CASCADE;

-- Now add the embedding column as JSONB
ALTER TABLE ai_health_insights 
ADD COLUMN embedding JSONB;

-- Create GIN index for better JSON query performance
CREATE INDEX IF NOT EXISTS idx_ai_health_insights_embedding_gin 
ON ai_health_insights 
USING gin (embedding);

-- Add comment for documentation
COMMENT ON COLUMN ai_health_insights.embedding IS 'Vector embedding stored as JSONB array (dimension 1536) for semantic similarity';

