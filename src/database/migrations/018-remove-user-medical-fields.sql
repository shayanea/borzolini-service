-- Migration: Remove User Medical Fields
-- Description: Removes medical history, allergies, and medications fields from users table for privacy compliance
-- Date: 2024-12-19
-- Reason: As a veterinary clinic system, collecting pet owners' personal medical information is inappropriate and raises privacy concerns

-- Remove medical-related columns from users table
ALTER TABLE users DROP COLUMN IF EXISTS medical_history;
ALTER TABLE users DROP COLUMN IF EXISTS allergies;
ALTER TABLE users DROP COLUMN IF EXISTS medications;

-- Add comment to track this change
COMMENT ON TABLE users IS 'Removed medical fields (medical_history, allergies, medications) to comply with privacy best practices for veterinary clinic system - 2024-12-19';
