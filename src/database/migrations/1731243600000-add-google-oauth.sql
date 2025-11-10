-- Add Google OAuth fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_email VARCHAR(255) NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

