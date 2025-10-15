-- Migration: Add password_updated_at column to users table
-- Description: Adds the missing password_updated_at column that is referenced in the User entity
-- Date: 2024-01-01

-- Add password_updated_at column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_updated_at TIMESTAMP WITH TIME ZONE;

-- Add comment for documentation
COMMENT ON COLUMN users.password_updated_at IS 'Timestamp when user password was last updated';

-- Create index for potential queries on password update tracking
CREATE INDEX IF NOT EXISTS idx_users_password_updated_at ON users(password_updated_at);
