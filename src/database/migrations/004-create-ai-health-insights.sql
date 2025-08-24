-- Migration: Create AI Health Insights Table
-- Description: Creates table for storing AI-generated health insights and recommendations
-- Date: 2024-01-01

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ai_health_insights table
CREATE TABLE ai_health_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL,
  insight_type VARCHAR(50) NOT NULL CHECK (insight_type IN ('recommendation', 'alert', 'prediction', 'reminder', 'educational', 'preventive')),
  category VARCHAR(50) NOT NULL CHECK (category IN ('health', 'nutrition', 'behavior', 'preventive_care', 'emergency', 'lifestyle', 'training', 'grooming')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
  urgency_level VARCHAR(20) NOT NULL DEFAULT 'low' CHECK (urgency_level IN ('low', 'medium', 'high', 'urgent')),
  suggested_action VARCHAR(500),
  context TEXT,
  supporting_data JSONB,
  dismissed BOOLEAN DEFAULT FALSE,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  acted_upon BOOLEAN DEFAULT FALSE,
  acted_upon_at TIMESTAMP WITH TIME ZONE,
  owner_feedback TEXT,
  owner_rating INTEGER CHECK (owner_rating >= 1 AND owner_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_ai_health_insights_pet_id FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_ai_health_insights_pet_id ON ai_health_insights(pet_id);
CREATE INDEX idx_ai_health_insights_type ON ai_health_insights(insight_type);
CREATE INDEX idx_ai_health_insights_category ON ai_health_insights(category);
CREATE INDEX idx_ai_health_insights_urgency ON ai_health_insights(urgency_level);
CREATE INDEX idx_ai_health_insights_dismissed ON ai_health_insights(dismissed);
CREATE INDEX idx_ai_health_insights_created_at ON ai_health_insights(created_at);

-- Create composite indexes for common queries
CREATE INDEX idx_ai_health_insights_pet_urgency ON ai_health_insights(pet_id, urgency_level);
CREATE INDEX idx_ai_health_insights_pet_category ON ai_health_insights(pet_id, category);
CREATE INDEX idx_ai_health_insights_pet_dismissed ON ai_health_insights(pet_id, dismissed);

-- Add comments for documentation
COMMENT ON TABLE ai_health_insights IS 'AI-generated health insights and recommendations for pets';
COMMENT ON COLUMN ai_health_insights.insight_type IS 'Type of insight: recommendation, alert, prediction, reminder, educational, preventive';
COMMENT ON COLUMN ai_health_insights.category IS 'Category of insight: health, nutrition, behavior, preventive_care, emergency, lifestyle, training, grooming';
COMMENT ON COLUMN ai_health_insights.confidence_score IS 'AI confidence in the recommendation (0.0 to 1.0)';
COMMENT ON COLUMN ai_health_insights.urgency_level IS 'Urgency level: low, medium, high, urgent';
COMMENT ON COLUMN ai_health_insights.supporting_data IS 'JSON data that influenced this insight';
COMMENT ON COLUMN ai_health_insights.owner_feedback IS 'Feedback provided by pet owner';
COMMENT ON COLUMN ai_health_insights.owner_rating IS 'Rating given by owner (1-5 stars)';

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_health_insights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ai_health_insights_updated_at
  BEFORE UPDATE ON ai_health_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_health_insights_updated_at();
