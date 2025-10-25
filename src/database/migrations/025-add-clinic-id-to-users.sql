-- Migration: Add clinic_id field to users table for multi-tenancy support
-- Description: Adds clinic_id column to users table to enable clinic-scoped user management
-- Date: 2024

-- Add clinic_id column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS clinic_id UUID;

-- Add foreign key constraint
ALTER TABLE users
ADD CONSTRAINT fk_users_clinic
FOREIGN KEY (clinic_id)
REFERENCES clinics(id)
ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_clinic_id ON users(clinic_id);

-- Update any clinic_admin users to have their clinic_id set
-- This assumes clinic_admin users have a clinic_staff entry
UPDATE users u
SET clinic_id = cs.clinic_id
FROM clinic_staff cs
WHERE u.id = cs.user_id
  AND u.role = 'clinic_admin'
  AND u.clinic_id IS NULL;

-- Comment on the column
COMMENT ON COLUMN users.clinic_id IS 'References the clinic this user is assigned to. NULL for super admin users and patients.';

