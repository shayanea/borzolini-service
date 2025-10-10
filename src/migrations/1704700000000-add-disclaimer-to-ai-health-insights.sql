-- Add disclaimer column to ai_health_insights table
-- This column stores medical/legal disclaimers for AI-generated content

-- Add the disclaimer column
ALTER TABLE ai_health_insights 
ADD COLUMN IF NOT EXISTS disclaimer TEXT;

-- Add a comment to the column for documentation
COMMENT ON COLUMN ai_health_insights.disclaimer IS 'Medical/legal disclaimer for AI-generated content, tailored to urgency and insight type';

-- Create an index for faster queries if needed (optional)
-- CREATE INDEX IF NOT EXISTS idx_ai_health_insights_disclaimer ON ai_health_insights(disclaimer) WHERE disclaimer IS NOT NULL;
