-- Migration: Add Origin History and Resources to Breeds Table
-- Description: Adds origin_history and resources fields to provide educational information about breed origins and references
-- Date: 2025-11-12

-- Add origin_history column for detailed breed origin information
ALTER TABLE breeds ADD COLUMN origin_history TEXT;

-- Add resources column for educational references and sources
ALTER TABLE breeds ADD COLUMN resources JSONB DEFAULT '[]';

-- Add comments for documentation
COMMENT ON COLUMN breeds.origin_history IS 'Detailed origin history and background of the breed for educational purposes';
COMMENT ON COLUMN breeds.resources IS 'Educational resources and references about the breed (URLs, books, organizations)';
