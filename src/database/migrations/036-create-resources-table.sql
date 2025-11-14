-- Migration: Create Resources Table
-- Description: Creates resources table for educational content (Discord cards, YouTube videos, audiobooks)
-- Date: 2024-01-01

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create resources table
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL CHECK (type IN ('video', 'discord', 'audio')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  url VARCHAR(500) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  cover VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_resources_is_active ON resources(is_active);
CREATE INDEX idx_resources_type_active ON resources(type, is_active);
CREATE INDEX idx_resources_created_at ON resources(created_at);

-- Create composite indexes for common queries
CREATE INDEX idx_resources_active_created ON resources(is_active, created_at DESC);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_resources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_resources_updated_at 
    BEFORE UPDATE ON resources 
    FOR EACH ROW 
    EXECUTE FUNCTION update_resources_updated_at();

