-- Migration: Add Missing User Fields
-- Description: Adds missing fields to users table that are referenced in DTOs
-- Date: 2024-01-01

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact_relationship VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS medical_history TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS allergies TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS medications TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS insurance_provider VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS insurance_policy_number VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS insurance_group_number VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS insurance_expiry_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create indexes for new fields that might be frequently queried
CREATE INDEX IF NOT EXISTS idx_users_gender ON users(gender);
CREATE INDEX IF NOT EXISTS idx_users_emergency_contact_phone ON users(emergency_contact_phone);
CREATE INDEX IF NOT EXISTS idx_users_insurance_provider ON users(insurance_provider);

-- Add comments for documentation
COMMENT ON COLUMN users.gender IS 'User gender preference';
COMMENT ON COLUMN users.emergency_contact_name IS 'Name of emergency contact person';
COMMENT ON COLUMN users.emergency_contact_phone IS 'Phone number of emergency contact';
COMMENT ON COLUMN users.emergency_contact_relationship IS 'Relationship to emergency contact';
COMMENT ON COLUMN users.medical_history IS 'User medical history information';
COMMENT ON COLUMN users.allergies IS 'User known allergies';
COMMENT ON COLUMN users.medications IS 'Current medications';
COMMENT ON COLUMN users.insurance_provider IS 'Health insurance provider name';
COMMENT ON COLUMN users.insurance_policy_number IS 'Insurance policy number';
COMMENT ON COLUMN users.insurance_group_number IS 'Insurance group number';
COMMENT ON COLUMN users.insurance_expiry_date IS 'Insurance policy expiry date';
COMMENT ON COLUMN users.notes IS 'Additional user notes';
