-- Migration: Add pet_anxiety_mode to appointments
-- Description: Adds a boolean flag to indicate low-stress handling preference
-- Date: 2025-09-11

-- Add column with default false for safety
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS pet_anxiety_mode BOOLEAN NOT NULL DEFAULT FALSE;

-- Optional: backfill existing rows (default covers this)

-- Index if we expect to filter by this flag frequently (optional)
-- CREATE INDEX IF NOT EXISTS idx_appointments_pet_anxiety_mode ON appointments(pet_anxiety_mode);


