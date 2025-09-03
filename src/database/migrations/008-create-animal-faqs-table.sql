-- Migration: Create Animal FAQs Table
-- Description: Creates comprehensive animal FAQs table for pet care information
-- Date: 2024-01-01

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create animal_faqs table
CREATE TABLE animal_faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  species VARCHAR(50) NOT NULL CHECK (species IN ('dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'reptile', 'horse', 'other')),
  category VARCHAR(100) NOT NULL CHECK (category IN ('health_care', 'feeding_nutrition', 'training_behavior', 'exercise_activity', 'housing_environment', 'general_care')),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  order_index INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique questions per species and category
  CONSTRAINT unique_question_per_species_category UNIQUE (species, category, question)
);

-- Create indexes for better performance
CREATE INDEX idx_animal_faqs_species ON animal_faqs(species);
CREATE INDEX idx_animal_faqs_category ON animal_faqs(category);
CREATE INDEX idx_animal_faqs_is_active ON animal_faqs(is_active);
CREATE INDEX idx_animal_faqs_species_category ON animal_faqs(species, category);

-- Create composite indexes for common queries
CREATE INDEX idx_animal_faqs_species_active ON animal_faqs(species, is_active);
CREATE INDEX idx_animal_faqs_category_active ON animal_faqs(category, is_active);
CREATE INDEX idx_animal_faqs_species_category_active ON animal_faqs(species, category, is_active);

-- Create full-text search index for question and answer content
CREATE INDEX idx_animal_faqs_search ON animal_faqs USING gin(to_tsvector('english', question || ' ' || answer));

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_animal_faqs_updated_at 
    BEFORE UPDATE ON animal_faqs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
