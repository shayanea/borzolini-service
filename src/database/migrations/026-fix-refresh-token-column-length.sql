-- Migration: Fix token column lengths
-- Description: Increases token column lengths from VARCHAR(255) to TEXT to accommodate JWT tokens
-- Date: 2024

-- Change refresh_token column type to TEXT to accommodate longer JWT tokens
ALTER TABLE users 
ALTER COLUMN refresh_token TYPE TEXT;

-- Change email_verification_token column type to TEXT (JWT tokens can be longer)
ALTER TABLE users 
ALTER COLUMN email_verification_token TYPE TEXT;

-- Change password_reset_token column type to TEXT (JWT tokens can be longer)
ALTER TABLE users 
ALTER COLUMN password_reset_token TYPE TEXT;

-- Add comments for documentation
COMMENT ON COLUMN users.refresh_token IS 'JWT refresh token for user authentication';
COMMENT ON COLUMN users.email_verification_token IS 'JWT token for email verification';
COMMENT ON COLUMN users.password_reset_token IS 'JWT token for password reset';

