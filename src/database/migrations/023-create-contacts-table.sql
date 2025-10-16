-- Migration: Create Contacts Table
-- Description: Creates the contacts table used by the contact module

-- Ensure UUID extension exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create contacts table matching entity column names
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  consent BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  adminNotes TEXT,
  ipAddress VARCHAR(45),
  userAgent VARCHAR(500),
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes to optimize common queries
CREATE INDEX IF NOT EXISTS idx_contacts_createdAt ON contacts(createdAt);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);

-- Trigger to auto-update updatedAt on row updates (function defined in earlier migrations)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_contacts_updated_at'
  ) THEN
    CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;


