-- Migration: Add image_url to Breeds Table
-- Description: Adds image_url field to store breed image paths
-- Date: 2025-11-19

-- Add image_url column for breed images
ALTER TABLE breeds ADD COLUMN image_url VARCHAR(500);

-- Add comments for documentation
COMMENT ON COLUMN breeds.image_url IS 'URL to an image of the breed';

