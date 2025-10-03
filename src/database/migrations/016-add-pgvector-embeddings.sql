-- Migration: Add pgvector extension and embeddings to AI health insights
-- Description: Enables semantic deduplication using vector similarity search
-- Date: 2025-10-03

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to ai_health_insights table
-- Using dimension 1536 for OpenAI text-embedding-3-small or text-embedding-ada-002
ALTER TABLE ai_health_insights 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create index for vector similarity search using cosine distance
-- This enables fast nearest-neighbor searches
CREATE INDEX IF NOT EXISTS idx_ai_health_insights_embedding 
ON ai_health_insights 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Add comment for documentation
COMMENT ON COLUMN ai_health_insights.embedding IS 'Vector embedding for semantic similarity search (dimension 1536)';


