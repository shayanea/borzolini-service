-- Migration: Add Clinic Owner Field
-- Description: Adds owner_id field to clinics table to establish clinic ownership
-- Date: 2024-01-15

-- Add owner_id column to clinics table
ALTER TABLE clinics 
ADD COLUMN owner_id UUID;

-- Add foreign key constraint
ALTER TABLE clinics 
ADD CONSTRAINT fk_clinics_owner_id 
FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_clinics_owner_id ON clinics(owner_id);

-- Add comment for documentation
COMMENT ON COLUMN clinics.owner_id IS 'ID of the clinic owner (user)';
