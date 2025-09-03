-- Migration: Create Breeds Table
-- Description: Creates comprehensive breeds table for pet breed management
-- Date: 2024-01-01

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create breeds table
CREATE TABLE breeds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  species VARCHAR(50) NOT NULL CHECK (species IN ('dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'reptile', 'horse', 'other')),
  size_category VARCHAR(20) CHECK (size_category IN ('tiny', 'small', 'medium', 'large', 'giant')),
  temperament TEXT,
  health_risks JSONB DEFAULT '[]',
  life_expectancy_min INTEGER,
  life_expectancy_max INTEGER,
  weight_min DECIMAL(5,2),
  weight_max DECIMAL(5,2),
  origin_country VARCHAR(100),
  description TEXT,
  grooming_needs VARCHAR(50) CHECK (grooming_needs IN ('low', 'moderate', 'high')),
  exercise_needs VARCHAR(50) CHECK (exercise_needs IN ('low', 'moderate', 'high')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique breed names per species
  CONSTRAINT unique_breed_per_species UNIQUE (name, species)
);

-- Create indexes for better performance
CREATE INDEX idx_breeds_species ON breeds(species);
CREATE INDEX idx_breeds_size_category ON breeds(size_category);
CREATE INDEX idx_breeds_is_active ON breeds(is_active);
CREATE INDEX idx_breeds_name ON breeds(name);

-- Create composite indexes for common queries
CREATE INDEX idx_breeds_species_active ON breeds(species, is_active);
CREATE INDEX idx_breeds_species_size ON breeds(species, size_category);

-- Add breed_id column to pets table
ALTER TABLE pets ADD COLUMN breed_id UUID REFERENCES breeds(id) ON DELETE SET NULL;

-- Create index for the new foreign key
CREATE INDEX idx_pets_breed_id ON pets(breed_id);

-- Create composite index for pets with breed
CREATE INDEX idx_pets_species_breed ON pets(species, breed_id);
