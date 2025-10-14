-- Migration: Add disclaimer column to AI Health Insights
-- Description: Adds medical/legal disclaimer field for AI-generated health insights
-- Date: 2025-10-14

-- Add disclaimer column to ai_health_insights table
ALTER TABLE ai_health_insights 
ADD COLUMN IF NOT EXISTS disclaimer TEXT;

-- Add comment for documentation
COMMENT ON COLUMN ai_health_insights.disclaimer IS 'Medical/legal disclaimer for AI-generated content';

